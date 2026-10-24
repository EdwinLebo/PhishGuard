# PhishGuard AI

A student-focused phishing checker by CyberSentinels. Paste a message or link, inspect an advisory risk rating, understand warning signs and verify independently.

Judge demo: https://edwinlebo.github.io/PhishGuard/ - no account or password required.

Working source branch: https://github.com/EdwinLebo/PhishGuard/tree/CodeforPhishGuard

## Start locally

```powershell
cd C:\Users\Edwin\Desktop\PhishGuard
npm.cmd install
npm.cmd run dev
```

Use Node.js 22.12+ or the installed Node 24. No cloud account, API key or sign-in is required for browser-local checks. You can also use `Start PhishGuard.cmd`.

```powershell
npm.cmd test
npm.cmd run build
```

## Stack and completed work

- React + Vite + TypeScript responsive frontend with local phishing rules and fictional examples.
- Explainable Low / Medium / High risk findings, safe actions, domain strings and a copyable assessment that excludes the submitted message.
- Supabase Edge Function for opt-in server-side Gemini explanations, with bounded input, CORS allowlist, protected secrets and rule-based fallback.
- Supabase Postgres migration for private transaction-based request counters. RLS enabled; no stored messages or scan history.
- Shared rules, provider adapter and browser-request handler covered by 27 automated tests.
- GitHub Actions frontend build and test workflow.
- Interactive three-question awareness quiz with feedback, scoring and restart, added during the hackathon on 24 October 2026.

## Supabase backend

Follow `docs/SUPABASE_SETUP.md`. Project `mopoehdxwyzwxxbpmqeg` is linked, the quota migration is applied and the `analyze-message` Edge Function is deployed. Live checks passed for risk results, CORS, consent and request limits. Gemini secrets/model are still pending, so the deployed endpoint currently returns rule-based fallback results. Put private keys in Edge Function secrets, never in frontend environment variables or chat.

The local frontend variable is `VITE_ANALYSIS_API=https://mopoehdxwyzwxxbpmqeg.supabase.co/functions/v1/analyze-message`, stored in the ignored `.env.local`. Checks stay local until the explicit AI opt-in checkbox is selected. Without Gemini configuration, that optional path displays an unavailable notice and retains the rule-based result.

The Edge Function is an anonymous demo endpoint with server-side SQL quotas. CORS limits browser origins; it is not authentication. The model receives rule findings and cannot change the rule-based risk rating.

## Frontend hosting

The frontend uses GitHub Pages and Supabase supplies the live backend. Build command: `npm run build`. Published directory: `dist`. The Pages workflow publishes the `CodeforPhishGuard` branch and uses `/PhishGuard/` as its base path. Its public Supabase endpoint is a build variable, not a secret. The Supabase browser allowlist includes `https://edwinlebo.github.io`.

## Limits and delivery plan

Risk weights are heuristic, not probabilities or measured accuracy. Thresholds: Medium >=15, High >=50. Low never means verified safe. The small known-domain list is not an authoritative registry. The app does not inspect attachments, follow redirects, query live threat feeds or verify sender identity.

Read `docs/submission/` for the Sonke submission checklist, 20-second pitch script, Lean Canvas, SSDL security document and judges' guide. The supplied Sonke guidance sets final submission at 26 October 23:59 and the Hustle Pitch at Saturday noon; confirm the platform timezone. The team lead must complete team registration, record/upload the video and submit the prepared materials on Sonke.
