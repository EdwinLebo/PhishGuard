import test from 'node:test';
import assert from 'node:assert/strict';
import { createWebHandler } from '../supabase/functions/_shared/web-handler.mjs';
const origin = 'https://phishguard.example';
const handler = createWebHandler({ allowedOrigins:[origin], limit:async()=>true, explain:async()=>{throw Error('AI unavailable');} });
const request = (body, headers={}) => new Request('https://project.supabase.co/functions/v1/analyze-message', {method:'POST',headers:{'Content-Type':'application/json',Origin:origin,...headers},body});
test('Supabase adapter handles allowed preflight and blocks unexpected browser origins', async()=>{
  const preflight=await handler(new Request('https://project.example',{method:'OPTIONS',headers:{Origin:origin}}));
  assert.equal(preflight.status,204);assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),origin);
  assert.equal((await handler(request('{}',{Origin:'https://unexpected.example'}))).status,403);
});
test('Supabase adapter rejects malformed JSON and bounds bodies without content-length', async()=>{
  assert.equal((await handler(request('{'))).status,400);
  assert.equal((await handler(request('x'.repeat(25001)))).status,413);
});
test('Supabase adapter returns the fixed rules fallback with browser CORS headers', async()=>{
  const response=await handler(request(JSON.stringify({text:'Urgent: enter your OTP immediately',consent:true})));
  assert.equal(response.status,200);assert.equal(response.headers.get('Cache-Control'),'no-store');
  assert.equal(response.headers.get('Access-Control-Allow-Origin'),origin);
  const data=await response.json();assert.equal(data.risk,'High');assert.equal(data.source,'rules');assert.equal(data.aiUnavailable,true);
});
