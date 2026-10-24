import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { readSharedInput } from '../src/shared-input.mjs';
const handlers = {};
vm.runInNewContext(readFileSync(new URL('../public/sw.js', import.meta.url), 'utf8'), {
  self: { registration: {scope:'https://example.test/PhishGuard/'}, addEventListener: (name, handler) => handlers[name] = handler }, URL, Response,
});
async function share(text) {
  let response;
  handlers.fetch({ request: new Request('https://example.test/PhishGuard/share', {method:'POST', body:new URLSearchParams({text})}), respondWith: p => response=p });
  return await response;
}
test('POST share becomes local fragment redirect without message in query or path', async () => {
  const text='Verify https://fnb.co.za@evil.example/?a=1&b=2';
  const response=await share(text); const url=new URL(response.headers.get('location'));
  assert.equal(response.status,303); assert.equal(url.pathname,'/PhishGuard/'); assert.equal(url.search,''); assert.equal(readSharedInput(url.hash),text);
});
test('oversized share fails without retaining message',async () => {
  const response=await share('a'.repeat(5001)); assert.equal(new URL(response.headers.get('location')).hash,'#share-error');
});
test('worker leaves normal navigation and external requests alone', () => {
  for (const [method,url] of [['GET','https://example.test/PhishGuard/share'], ['POST','https://other.test/PhishGuard/share']]) {
    handlers.fetch({request:new Request(url,{method}),respondWith:()=>assert.fail('must not intercept')});
  }
});
