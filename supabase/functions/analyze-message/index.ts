import { createClient } from 'npm:@supabase/supabase-js@2.118.0';
import { analyze } from '../_shared/analyze.mjs';
import { createWebHandler } from '../_shared/web-handler.mjs';
import { explainWithGemini } from '../_shared/gemini.mjs';

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const allowedOrigins = (Deno.env.get('ALLOWED_ORIGINS') || '').split(',').map(s => s.trim()).filter(Boolean);

async function limit(ip: string) {
  const salt = Deno.env.get('RATE_LIMIT_SALT');
  if (!salt) throw new Error('Rate limiter not configured.');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(salt), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${Math.floor(Date.now() / 86400000)}:${ip}`));
  const hash = Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
  const { data, error } = await db.rpc('consume_analysis_quota', { p_client_hash: hash });
  if (error) throw new Error('Rate limiter unavailable.');
  return data === true;
}

Deno.serve(createWebHandler({
  allowedOrigins, limit,
  explain: (assessment: ReturnType<typeof analyze>) => explainWithGemini(assessment, {
    apiKey: Deno.env.get('GEMINI_API_KEY'), model: Deno.env.get('GEMINI_MODEL') || '',
  }),
}));
