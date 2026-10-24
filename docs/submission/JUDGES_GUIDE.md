# Judges' guide

App: https://edwinlebo.github.io/PhishGuard/

Repository branch: https://github.com/EdwinLebo/PhishGuard/tree/CodeforPhishGuard

Login: **No account or password required.** The app intentionally supports anonymous screening. Demo account details in the slides therefore read "Not required - open access". Do not use a database password as a demo login.

## Test the working app
1. Open the app link. Click **Try an example**, then **Check for warning signs**. The fictional bursary message should show High risk with identifiable warning signs.
2. Load the ordinary study-group example; submit. It should show Low risk with an explicit warning that this is not proof of safety.
3. Tick **Check with Supabase**, then submit a fictional example. The result identifies the Supabase cloud check. Gemini is not configured; a clear notice explains that rules were used. No need to enter personal data.
4. Open **Awareness quiz**. Answer all three questions, read the feedback, view your score and restart. Results are kept only in browser memory.
5. To check a URL-deception example, paste `https://fnb.co.za@verify.example`. The destination is `verify.example`; no link is opened.

If the cloud minute limit is reached, wait a minute or untick cloud checking to continue locally. The rate limits protect the demo but do not guarantee no platform costs.

## What counts as the app build
This is an interactive web app that processes user text at the time of use; optional cloud checks invoke Supabase, and the quiz processes answers and scores in real time. No APK is required for this web build. If Sonke requires a build attachment, use the supplied web-build ZIP plus the live URL; do not upload source code where the event says not to. Submit the repository link in its designated field.

## Current limits
No sender verification, threat-feed lookup, automatic URL visit, saved scan history or WhatsApp integration. The current demo is rule-based; optional AI implementation is not an active capability until secrets/model are configured and verified.
