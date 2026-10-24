# PhishGuard hackathon build plan

Prepared 23 October 2026, South Africa time. User planning window: Saturday 24 October through Sunday 25 October. Confirm official event name, schedule, judging criteria and prebuilt-code eligibility; the supplied canvas instead names HackSecure on 27-28 October. Those document details have not been treated as instructions to register, submit or contact anyone.

## Build order and current status

| Order | What we need | Status | Acceptance check |
|---|---|---|---|
| 1 | Desktop repository and development setup | Built | Desktop/PhishGuard, branch CodeforPhishGuard; local app starts |
| 2 | Mobile-friendly landing page and input | Built | Paste message/link, use example, submit and navigate by keyboard |
| 3 | Phishing rule engine | Built, initial rules | Fictional phishing cases produce expected warning findings |
| 4 | Results and safety guidance | Built | Low/Medium/High, reasons, domains, practical actions and limits |
| 5 | Privacy and defensive handling | Built, cloud review pending | No visits to submitted links, no HTML rendering, no saved messages |
| 6 | Protected AI explanation | Supabase endpoint deployed; Gemini key/model pending; live fallback verified | Consent, server secret, structured output, failure fallback |
| 7 | Backend abuse controls | Migration applied; live consent, CORS and client 429 checks pass | Persistent per-client/global limits, invalid input rejection, deny client DB access |
| 8 | Frontend hosting | Production build passes; choose a separate static host and deploy | Public HTTPS URL works on phone and desktop |
| 9 | Testing and demo quality | 27 automated tests pass; browser path checked | Synthetic cases plus mobile, network failure and deployed endpoint tests |
| 10 | Demo and pitch package | Demo script drafted | Two-minute demo, fallback screenshots, short pitch |
| 11 | Optional awareness quiz and feedback | Backlog | Add only after core hosted demo is reliable |
| 12 | Optional sign-in and private scan history | Future work | Requires clear consent, retention and per-user access rules |

## Saturday: finish one dependable demo

1. Confirm event rules and requirements before using the prepared code in competition.
2. Run the local checker and review visual design/content with Edwin.
3. Review the 12 fictional cases, add new missed scam styles, and record false positives/negatives.
4. Select/connect the Supabase project; choose a static frontend host and deploy the rule-only checker first.
5. If desired, configure the optional Gemini endpoint and Postgres rate counters, then test the complete path.
6. Verify phone layout, long input, keyboard navigation, empty input and disabled AI behaviour.

## Sunday: validate, rehearse and submit

1. Verify secrets, Supabase RLS policies, rate limiting, network failure, provider outage and browser security headers in the deployed environment.
2. Review any AI explanation against its fixed rule verdict; do not claim the model verifies links.
3. Capture phone/desktop and high/medium/low result screenshots for fallback.
4. Rehearse the demo and pitch. Keep local rule-only mode ready for connectivity or quota failures.
5. Push reviewed work to GitHub, collect the final hosted URL and prepare the event's required submission assets.
6. Submit only through the confirmed official channel and within the verified deadline.

## Required from Edwin for cloud completion

- Supabase project `mopoehdxwyzwxxbpmqeg` is linked and its backend deployed.
- Choose a separate static frontend host and whether to enable the optional Supabase AI backend.
- A Gemini API key entered into Supabase Edge Function secrets locally, plus an available model ID, if enabling AI.
- Official event brief/judging criteria and confirmation about pre-event preparation.

## Deferred deliberately

Live WhatsApp integration, automatic link visits, threat takedowns, voice/deepfake detection, payments, institution dashboards and measured accuracy claims. None is required for the initial student screening flow.
