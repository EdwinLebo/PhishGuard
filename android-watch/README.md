# PhishGuard Watch — Android demo

Native Java Android app. Android 8.0/API 26 or later. Uses opt-in notification access to analyse new, available previews from WhatsApp/WhatsApp Business and/or the current default SMS app. No READ_SMS, contacts, accessibility, overlay or INTERNET permissions. The app never follows submitted links.

## Install and enable
The Pages build publishes `https://edwinlebo.github.io/PhishGuard/downloads/PhishGuard-Watch-demo.apk` after all build checks pass. This is a debug-key-signed hackathon demo, not a Play Store release. Signing keys on fresh CI runners can differ: later builds may require uninstall/reinstall and setting up consent again. Production needs a stable private release-signing key.

1. Download the demo to your own Android test phone. Android may restrict installation or notification access for sideloaded apps; respect its protections rather than bypassing a block. Use an approved development/test distribution when required.
2. Open PhishGuard Watch. Read the notification-access disclosure and select the sources you want checked.
3. Enable PhishGuard in Android notification-access settings, then allow its warning notifications.
4. Turn on monitoring inside the app. Status must say listening. Android retains control of service delivery; granted access alone is not proof it connected.
5. Use **Run labelled test alert** to verify the warning channel. This is a synthetic test, not evidence an external message was captured.
6. Have a consenting tester send a fictional SMS/WhatsApp message containing `FNB FINAL WARNING: enter your OTP at https://fnb.co.za@account-check.example`. Do not open that address. With a new, visible notification, expect an advisory and the actual hostname in PhishGuard.

## Privacy and behaviour
Monitoring is off initially. Consent, selected sources and on/off settings are the only preferences saved. Notification access is broad at OS level; the code filters packages before reading message text. No analytics, server calls, database or raw-message history. Derived reasons/hostnames stay in process memory until cleared/process termination; notification text does not expose the original message or hostname. A short-lived SHA-256 fingerprint map suppresses duplicate updates for two minutes (100 entries max). Only the newest MessagingStyle entry is assessed; old notification history is not scanned. Oversized content is skipped rather than silently truncated. There is no polling or active-notification scan at startup.

Medium/High local heuristic results trigger an advisory. Low does not prove safety. Alerts are not a malware verdict, identity verification, URL reputation service or guaranteed blocking. The latest advisory replaces the previous notification to avoid notification floods. The native rules are a separate Java implementation: tests check the existing 12 synthetic web fixtures; that is not real-world accuracy validation.

## Acceptance tests requiring a real device
- Fresh installation: no monitoring before consent, access, warning permission and start switch.
- Genuine incoming SMS and WhatsApp notifications: capture High, Medium and ordinary-message cases.
- Open chat / muted chat / hidden content / sensitive-content redaction: document misses; do not claim full coverage.
- Disable a source or pause Watch: no new warning from it. Revoke notification access; status must report missing access.
- Deny notification permission / disable warning channel / Do Not Disturb: verify no false promise of visible or audible alerts.
- Group summaries, duplicate updates, long messages, reboot, process death, work profile and battery management: verify per device.
- Share plain text to Watch and use paste fallback; submitted text is cleared after checking.

Desktop/CI checks do not substitute for these phone tests. No connected phone or emulator has been verified yet.

## Build
Install JDK 17, Gradle 8.11.1 and Android SDK 35 using official tooling. Set ANDROID_HOME or a local.properties sdk.dir (ignored by Git). From this directory:

```
gradle --no-daemon :app:testDebugUnitTest :app:lintDebug :app:assembleDebug
```

The GitHub Pages workflow performs the same checks and publishes the signed demo APK and SHA-256 file. Native source is under app/src/main/java/za/co/phishguard/watch. No signing passwords or keys are committed.

## References
- https://developer.android.com/reference/android/service/notification/NotificationListenerService
- https://developer.android.com/reference/android/app/Notification
- https://developer.android.com/develop/ui/views/notifications/notification-permission
- https://support.google.com/googleplay/android-developer/answer/10208820
