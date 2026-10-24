# Supabase setup

Supabase project `mopoehdxwyzwxxbpmqeg` is now authenticated and linked to this checkout. The quota migration is applied, `RATE_LIMIT_SALT` and local `ALLOWED_ORIGINS` are configured, and `analyze-message` is deployed. Live tests verified High/Low risk results, consent validation, CORS, no-store responses and the per-client 429 limit. The shared database password was not used, saved in source or needed for this connection.

The local frontend endpoint is configured in ignored `.env.local`. Local rules remain the default. `GEMINI_API_KEY` and `GEMINI_MODEL` are not configured, so the optional AI path currently returns an explicit rule-only fallback. No frontend host is deployed yet.

## Connect your project

Use the existing Supabase project if you have one. Its project URL/reference is safe to share; do not send database passwords, service-role keys, access tokens or AI keys in chat.

From the project folder:

```powershell
npx supabase login
npx supabase link --project-ref mopoehdxwyzwxxbpmqeg
```

The Supabase CLI can run via npx; Docker is needed for the complete local Supabase stack. Confirm you are linking the intended project before database changes.

## Backend setup

1. The migration `supabase/migrations/20261023000100_analysis_quotas.sql` is already applied. Future migrations can be reviewed with `npx supabase db push --linked --dry-run`, then applied with `npx supabase db push --linked`. The current migration creates only private quota counters and a restricted server RPC; no message storage or scan history.
2. In the Supabase Dashboard, open Edge Functions > Secrets and add:
   - `GEMINI_API_KEY`: your Gemini API key.
   - `GEMINI_MODEL`: a currently available generateContent model ID in your account.
   - `RATE_LIMIT_SALT`: already generated and configured. Preserve the existing secret.
   - `ALLOWED_ORIGINS`: currently `http://127.0.0.1:5173,http://localhost:5173`. Add the final frontend origin when hosting is selected. Use exact origins without paths or trailing slashes.
3. The Edge runtime provides `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Never put the service-role key in the frontend or a `VITE_` variable. It is used only inside the Edge Function to call the restricted RPC.
4. The function is already deployed. For subsequent source changes use `npx supabase functions deploy analyze-message --use-api`. Supabase reads secret changes without redeploying.
5. After deployment, create root `.env.local` containing `VITE_ANALYSIS_API=https://mopoehdxwyzwxxbpmqeg.supabase.co/functions/v1/analyze-message`.
6. Restart Vite for local testing, or run `npm.cmd run build` for deployment. The opt-in AI checkbox appears when the endpoint is configured.
7. Test allowed-origin preflight, opt-in explanations, opt-out local checks, quota rejection and AI failure fallback against the deployed function before demonstrating live AI.

The anonymous demo endpoint uses `verify_jwt = false` in `supabase/config.toml`. No frontend key or sign-in is required for this version. This is intentional: the SQL quotas, not CORS or a public API key, limit paid AI calls. If you later add accounts, enable authentication and validate user JWTs before storing any private user data.

## Frontend hosting

Supabase is the backend here. Publish the Vite `dist` folder using a static host of your choice. Typical build settings are `npm run build` and output directory `dist`. Add the final HTTPS origin to `ALLOWED_ORIGINS`, configure the public endpoint environment variable in the host's build settings, then rebuild.

No frontend host has been selected or deployed. The earlier Firebase deployment files have been retired. Add and verify CSP/security headers and SPA routing for the selected host; the backend URL must be allowed by that host's `connect-src` policy.

## Privacy and limits

- Local checks stay in browser memory. Opting into AI sends the redacted message to the Edge Function; only derived rule findings and the fixed risk label are sent to Gemini. Findings may include domain names.
- The app never visits submitted links or renders messages/model output as HTML. No scan history, message database or application message logging is implemented. Provider/infrastructure metadata policies still apply.
- A transaction with a global advisory lock enforces five calls per client/minute, 30 globally/minute and 300 globally/hour across Edge instances. Fixed-window boundaries can allow bursts.
- The client identity uses a daily salted HMAC of forwarded address information. This is a best-effort per-client control because forwarding headers depend on gateway behaviour. Global quotas remain independent of that identity.
- Quota counters expire after one day and are cleaned opportunistically on a subsequent request. This is not a guaranteed timed deletion job.
- RLS is enabled and direct table access is revoked. Only `service_role` can execute the quota RPC. Database failures stop AI calls; provider failures return the rule result.
- The limits are not a hard spending cap: Edge invocations, database activity and platform costs can still accrue. Review project quotas before broader public use.

## Local testing

Copy `supabase/functions/.env.example` to the ignored `supabase/functions/.env.local` and fill values locally. Never commit that file.

```powershell
npx supabase start
npx supabase db reset
npx supabase functions serve analyze-message --env-file supabase/functions/.env.local
```

`db reset` is for the disposable local development database only. Set the frontend endpoint to the local function URL printed by the CLI. The SQL migration was exercised in embedded Postgres (PGlite), checking quota rejection and role restrictions. Live tests now also pass for the deployed gateway/CORS path, consent, fixed rule results, the server quota RPC and HTTP 429 enforcement. The browser integration displays the expected fallback while Gemini is unconfigured. Live Gemini output remains untested.

## Official references

- Edge deployment: https://supabase.com/docs/guides/functions/deploy
- Server secrets: https://supabase.com/docs/guides/functions/secrets
- Function configuration: https://supabase.com/docs/guides/functions/function-configuration
- Browser CORS: https://supabase.com/docs/guides/functions/cors
- Frontend hosting boundary: https://supabase.com/docs/guides/platform/custom-domains
