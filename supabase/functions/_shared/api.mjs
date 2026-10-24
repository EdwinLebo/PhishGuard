import { analyze } from './analyze.mjs';

// Kept independent of its hosting platform so validation, consent and failure handling can be tested offline.
export function createAnalysisHandler({ limit, explain }) {
  return async (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.set('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'POST') return res.status(405).set('Allow', 'POST').json({ error: 'Use POST.' });
    if (!req.is('application/json')) return res.status(415).json({ error: 'Use application/json.' });
    if (Number(req.headers['content-length'] || 0) > 25000 || (req.rawBody && req.rawBody.length > 25000)) return res.status(413).json({ error: 'Request too large.' });
    let assessment;
    try { assessment = analyze(req.body?.text); } catch (e) { return res.status(400).json({ error: e.message }); }
    if (req.body?.consent !== true) return res.status(400).json({ error: 'Explicit consent is required for server analysis.' });
    try {
      if (!await limit(req.ip || 'unknown')) return res.status(429).set('Retry-After', '60').json({ error: 'Too many requests. Try again in a minute, or use local checks.' });
    } catch { return res.status(503).json({ error: 'Service temporarily unavailable. Use local checks.' }); }
    try {
      const explanation = await explain(assessment);
      if (typeof explanation === 'string' && explanation.trim() && explanation.length <= 1400) return res.json({ ...assessment, source: 'rules+ai', aiExplanation: explanation });
    } catch { /* Do not log raw input, provider output or provider error bodies. */ }
    return res.json({ ...assessment, source: 'rules', aiUnavailable: true });
  };
}
