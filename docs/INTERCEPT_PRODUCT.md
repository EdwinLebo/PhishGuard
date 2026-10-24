# PhishGuard Intercept — product direction

24 October 2026. This product brief replaces the generic message-checker positioning. Existing checker, Supabase backend and quiz remain available.

## Key selling point
“A pause between a convincing message and an expensive mistake.”

An on-device assessment at the point someone shares a message for help, combining understandable link anatomy, South African impersonation examples and a concrete independent verification step. A copy-and-paste website alone is easy to replace. Distribution inside everyday workflows and trusted local partnerships are the proposed advantage, not a claim of exclusive technology.

## Built now
- Interactive phone demonstration: editable input, four scenarios, real local detection, High/Medium/Low advisory, actual hostname reveal, verification route.
- Installable web-app manifest, 192px/512px icons, service worker and POST share target for supported Android Chrome installations.
- Shared input automatically receives a local assessment without cloud consent. Service worker converts POST to a fragment, then the app removes the fragment from browser history. No message cache or analytics added. Browser/OS internals may retain transient data; no absolute privacy guarantee.
- Recovery checklist, existing explicit-consent Supabase checking and awareness quiz.

## Not built or claimed
The web app has no background SMS/WhatsApp access. A separate opt-in Android Watch demo now implements notification-preview checks; see android-watch/README.md for coverage, installation and pending phone acceptance tests. No system-wide link interception, verified threat feed, link crawling, bank payment blocking or guaranteed fraud prevention. The phone frame is a demonstration, not proof that another app was intercepted. No offline shell cache: opening the app still needs connectivity. AI is not configured. Android share-menu installation needs a real-device acceptance test; desktop testing cannot certify it.

## Buyer and pilot hypothesis
Start with one university's student-support team or bursary administrator sponsoring access for students. Later explore bank financial-wellness or fraud-education teams. Students get a free private checker; institutions could pay a fixed pilot fee followed by an annual sponsorship/support licence. Prices, procurement, partner interest and willingness to pay are unvalidated. Do not present them as revenue or commitments.

Interview five student-support/fraud teams and ten students before pricing. Run a small opt-in pilot with synthetic scam tasks; measure time to assessment, successful sharing, comprehension of the real hostname, appropriate independent-verification decisions and false alerts on legitimate messages. No conversion figures or money-saved claims yet. Collect research consent separately; no telemetry is currently implemented.

## Next defensible work
1. Verify Android install/share on physical devices and test accessibility with students.
2. Evaluate a diverse, independently labelled local dataset; publish false-positive and miss rates before making accuracy claims.
3. Add native Android user-approved integration only after permission/store-policy review; investigate iOS share extension separately.
4. Explore a bank/university SDK and maintained organisation-domain directory with partner verification. No partner integration exists today.

## 20-second pitch draft
“A scam only needs one rushed tap. PhishGuard Intercept lets you share a suspicious message, reveals where its link really leads, and explains what to verify before you pay or share an OTP. We’re starting with South African students, with universities as potential sponsors. Pause before the next tap.”

## Judge walkthrough
Open https://edwinlebo.github.io/PhishGuard/#intercept. Choose Bank impersonation, then Share to PhishGuard. Point out account-check.example after the trusted-looking name and @. Change to Ordinary message and repeat: Low does not mean safe. Edit your own synthetic example. Open the full assessment or recovery guidance. Explain phone sharing requires installation on a supported browser; the demo does not read inboxes.

## Technical source
Chrome Web Share Target: https://developer.chrome.com/docs/capabilities/web-apis/web-share-target
Manifest share_target: https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest/Reference/share_target
