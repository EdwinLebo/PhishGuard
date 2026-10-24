import test from 'node:test';
import assert from 'node:assert/strict';
import { createAnalysisHandler } from '../supabase/functions/_shared/api.mjs';
import { explainWithGemini } from '../supabase/functions/_shared/gemini.mjs';
import { analyze } from '../supabase/functions/_shared/analyze.mjs';
const request = overrides => ({ method:'POST', is: t => t === 'application/json', headers:{}, ip:'192.0.2.5', body:{text:'Urgent: enter your OTP at https://fnb-verify.example',consent:true}, ...overrides });
function response() { return { code:200, headers:{}, data:null, set(k,v){this.headers[k]=v;return this;}, status(s){this.code=s;return this;}, json(d){this.data=d;return this;} }; }
test('rejects unsupported methods, content types, input and absent consent before AI', async () => {
  const handler=createAnalysisHandler({limit:async()=>{throw new Error('Must not reach limiter');},explain:async()=>{throw new Error('Must not reach AI');}});
  for (const [req,code] of [[request({method:'GET'}),405],[request({is:()=>false}),415],[request({body:{text:'',consent:true}}),400],[request({body:{text:'hello'}}),400],[request({headers:{'content-length':'30000'}}),413],[request({body:{text:'a'.repeat(5001),consent:true}}),400]]) { const res=response();await handler(req,res);assert.equal(res.code,code); }
});
test('enforces rate limits and fails closed on counter outages', async () => {
  for(const [limit, code] of [[async()=>false,429],[async()=>{throw Error('db unavailable');},503]]) {const res=response();await createAnalysisHandler({limit,explain:async()=>{throw Error('Must not reach AI');}})(request(),res);assert.equal(res.code,code);}
});
test('provider failure returns usable rule-based assessment without raw message', async () => {
  const res=response();await createAnalysisHandler({limit:async()=>true,explain:async()=>{throw Error('timeout');}})(request(),res);
  assert.equal(res.code,200);assert.equal(res.data.aiUnavailable,true);assert.equal(res.data.source,'rules');assert.equal(res.headers['Cache-Control'],'no-store');assert.ok(!('text' in res.data));
});
test('AI explanation supplements fixed rules; does not change verdict', async () => {
  const res=response();await createAnalysisHandler({limit:async()=>true,explain:async()=> 'Pause and verify independently.'})(request(),res);assert.equal(res.data.risk,analyze(request().body.text).risk);assert.equal(res.data.source,'rules+ai');
});
test('AI adapter sends findings only and validates structured response', async () => {
  const assessment=analyze('Urgent! Send your OTP SECRET-MESSAGE-123');
  const fetcher=async(url,options)=>{ assert.match(url,/generativelanguage.googleapis.com/); assert.ok(!options.body.includes('SECRET-MESSAGE-123'));return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({explanation:'Verify through your official bank app.'})}]}}]})}; };
  assert.equal(await explainWithGemini(assessment,{apiKey:'fictional',model:'test-model',fetcher}),'Verify through your official bank app.');
});
test('AI adapter rejects invalid output and provider errors', async () => {
  for (const response of [{ok:false},{ok:true,json:async()=>({candidates:[{content:{parts:[{text:'not JSON'}]}}]})},{ok:true,json:async()=>({candidates:[{content:{parts:[{text:'{"explanation":"Visit https://bad.example"}'}]}}]})}]) {
    await assert.rejects(()=>explainWithGemini(analyze('Hello'),{apiKey:'fictional',model:'test',fetcher:async()=>response}));
  }
});
