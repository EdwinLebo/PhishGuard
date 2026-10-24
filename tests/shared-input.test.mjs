import test from 'node:test';
import assert from 'node:assert/strict';
import { readSharedInput } from '../src/shared-input.mjs';
test('shared input preserves URL punctuation and unicode without executing content', () => {
  const text = 'FNB: verify https://fnb.co.za@evil.example/?a=1&b=2 — <script>alert(1)</script>';
  assert.equal(readSharedInput('#shared=' + encodeURIComponent(text)), text);
});
test('shared input rejects oversized, malformed, empty and unrelated fragments', () => {
  for (const value of ['#checker', '#shared=%XX', '#shared=%20', '#shared=' + 'a'.repeat(5001)]) assert.equal(readSharedInput(value), null);
});
