import test from 'node:test';
import assert from 'node:assert/strict';
import { analyze, extractUrls } from '../supabase/functions/_shared/analyze.mjs';
import { fixtures } from './fixtures.mjs';
for (const [name, text, risk] of fixtures) test(`synthetic case: ${name}`, () => assert.equal(analyze(text).risk, risk));
test('rejects missing, non-string and oversized input', () => {
  for (const input of ['', '  ', null, {}, ['x'], 'a'.repeat(5001)]) assert.throws(() => analyze(input));
});
test('canonical host, rather than displayed brand, drives URL warning', () => {
  assert.deepEqual(analyze('https://fnb.co.za@attacker.example/').domains, ['attacker.example']);
  assert.ok(analyze('https://fnb.co.za@attacker.example/').findings.some(f => f.id === 'userinfo'));
  assert.ok(analyze('https://tut.ac.za.attacker.example').findings.some(f => f.id === 'brand-tut'));
});
test('does not execute markup or fetch submitted destinations', () => {
  const original = globalThis.fetch;
  globalThis.fetch = () => { throw new Error('Should never fetch'); };
  try { const result = analyze('<script>alert(1)</script> https://example.com'); assert.deepEqual(result.domains, ['example.com']); assert.equal(result.source, 'rules'); }
  finally { globalThis.fetch = original; }
});
test('lookalike and short-link findings repeat only once', () => {
  const result = analyze('https://bit.ly/a https://bit.ly/b https://xn--tst-qla.example');
  assert.equal(result.findings.filter(f => f.id === 'shortener').length, 1);
  assert.ok(result.findings.some(f => f.id === 'punycode'));
});
test('recognises bare domains and removes surrounding punctuation', () => {
  assert.equal(extractUrls('Visit (www.example.com).')[0].hostname, 'www.example.com');
});
test('zero findings never becomes a guarantee of safety', () => assert.match(analyze('See you tomorrow.').summary, /does not establish.*safe/i));
