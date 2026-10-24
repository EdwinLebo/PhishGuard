# Secure Software Development Lifecycle (SSDL)

## Scope and assets
React/Vite frontend on GitHub Pages; Supabase Edge Function and Postgres quota counters; optional Gemini provider. Assets: submitted message during processing, cloud credentials, request-limit state and integrity of the advisory result. The app does not request identities, passwords, PINs or OTPs and does not save submitted messages or quiz answers.

## Requirements and threat model
| Threat | Implemented control | Residual limitation |
|---|---|---|
| Malicious link / SSRF | Inspect URL strings only; no fetching user links or redirect resolution | Cannot establish destination content or sender identity |
| Script injection | React escapes message, domain and AI text; no HTML rendering | Browser/third-party dependency risks remain |
| Secret leakage | Supabase server secrets; ignored local environment; public repo contains only public endpoint configuration | Rotate any credential previously shared in chat; never put secrets in VITE variables |
| Unauthorised database access | RLS enabled, direct table access revoked, quota RPC limited to service_role | A compromised server credential is powerful and must be rotated |
| API/cost abuse | 5/client/minute, 30/global/minute, 300/global/hour; atomic SQL increments; input bounds; fail closed on quota failure | Anonymous endpoint; forwarding identity is best effort; quotas are not a spending cap |
| Prompt injection | Original input never sent to model; derived findings are untrusted; fixed rule verdict; structured provider response | AI text can still be incorrect; AI not enabled in current demo |
| False reassurance | Advisory language, explicit Low-risk caveat, no probability/accuracy claims | Novel scams and legitimate third-party links can be misclassified |
| Private data exposure | Local mode by default; explicit consent for cloud; no message/history storage or application body logging | Cloud/provider metadata policies apply; users must redact input |

## Design and implementation
Separate browser and server trust boundaries. Validate 5,000 characters and at most 25 KB of request bytes; accept JSON POST with explicit consent. Allow exact browser origins; CORS is not authentication. The public endpoint deliberately does not require a user account. Supabase's service key stays in the Edge runtime. Parameterised RPC calls avoid SQL concatenation; the security-definer function fixes its search path and revokes public execution.

## Testing
27 offline automated checks cover labelled synthetic cases, URL deception, oversized/malformed input, consent, CORS, provider failure and fallback. Deno type checking and frontend build pass. SQL migration tested with embedded Postgres and then applied remotely. Live backend tests verified high/low results, consent rejection, unapproved-origin rejection and HTTP 429. Browser review checks the deployed demo and awareness quiz. Synthetic cases do not establish real-world accuracy.

## Deployment and release
GitHub Actions builds the web app and publishes its output. Supabase is deployed separately. Public config is limited to project/function URLs. Verify the live URL, relative asset paths and Pages origin in the Supabase allowlist. Inspect dependencies and repository changes before pushing. GitHub Pages does not expose a configurable server-header layer, so deployment must not claim full custom security-header coverage.

## Operations and incident response
If abuse or incorrect behaviour occurs: disable/restrict the Edge endpoint, rotate affected credentials, inspect metadata without collecting raw messages, fix and test rules, redeploy, and state any service limitation. Local checks remain available if cloud or AI fails. Quota counters use daily HMAC identities; expiry cleanup is opportunistic after one day, not a guaranteed deletion schedule. No model is allowed to take autonomous actions.

## Before submission
Confirm no secrets in GitHub; verify judges' access without login; check cloud/rate-limit fallback; keep Gemini labelled inactive until tested; disclose pre-event preparation and the feature completed during the hackathon. Team lead remains responsible for final claims and submission.
