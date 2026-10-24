import { createAnalysisHandler } from './api.mjs';

export function createWebHandler({ limit, explain, allowedOrigins }) {
  const handler = createAnalysisHandler({ limit, explain });
  return async request => {
    const origin = request.headers.get('origin');
    const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Origin' };
    if (origin && !allowedOrigins.includes(origin)) return Response.json({ error: 'Origin not allowed.' }, { status: 403, headers });
    if (origin) headers['Access-Control-Allow-Origin'] = origin;
    headers['Access-Control-Allow-Headers'] = 'content-type, apikey, authorization, x-client-info';
    headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
    const json = (data, status) => Response.json(data, { status, headers });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405);
    const type = (request.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (type !== 'application/json') return json({ error: 'Use application/json.' }, 415);
    if (Number(request.headers.get('content-length') || 0) > 25000) return json({ error: 'Request too large.' }, 413);
    let body;
    try {
      const reader = request.body?.getReader();
      const chunks = []; let size = 0;
      if (reader) {
        while (true) {
          const { value, done } = await reader.read(); if (done) break;
          size += value.byteLength;
          if (size > 25000) { await reader.cancel(); return json({ error: 'Request too large.' }, 413); }
          chunks.push(value);
        }
      }
      const bytes = new Uint8Array(size); let offset = 0;
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
      body = JSON.parse(new TextDecoder().decode(bytes));
    } catch { return json({ error: 'Invalid JSON.' }, 400); }
    const req = {
      method: request.method, headers: {}, is: expected => type === expected, body,
      // Best-effort client identity; global quotas do not depend on forwarded headers.
      ip: (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim().slice(0, 128),
    };
    let status = 200;
    const res = {
      set(key, value) { headers[key] = value; return res; },
      status(code) { status = code; return res; },
      json(data) { return json(data, status); },
    };
    return handler(req, res);
  };
}
