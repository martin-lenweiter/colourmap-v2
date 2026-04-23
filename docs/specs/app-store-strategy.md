# Apple App Store Strategy — From Web App to iOS

A strategy document written 2026-04-23 in response to Martin's question:
> "how u will proceed next with supabase to cerate an app on apple store in long term"

The app is currently a Next.js web app. This doc covers how to get Colourmap onto the Apple App Store without abandoning the web codebase, and how Supabase fits into that journey.

## 1. The core question — three paths

There are essentially three paths from "web app" to "iOS app on the App Store":

### Path A — Wrap the web app (Capacitor)
Keep the Next.js codebase. Use [Capacitor](https://capacitorjs.com/) to wrap it in a native iOS shell. The web app runs in a WKWebView, which supports the Web Audio API (critical for the sound engine). Native features (notifications, in-app purchase, audio background mode) are accessible via Capacitor plugins.

- **Pros:** one codebase, ~80% code reuse, fast to ship
- **Cons:** some Web Audio quirks on iOS WebView, slower than pure native, "feels web-y" if done carelessly
- **Dev effort:** 2-3 weeks to first App Store submission
- **Cost:** $99/year Apple Developer Program + dev time

### Path B — Rebuild in React Native (Expo)
Rewrite the UI layer in React Native + Expo. Business logic (services, API clients) ports over mostly unchanged. Audio engine needs rewrite using `expo-av` or a custom native audio module.

- **Pros:** real native performance, cleaner mobile UX, easier access to native APIs
- **Cons:** major rewrite, especially the sound engine (most of the app)
- **Dev effort:** 3-6 months
- **Cost:** same Apple fee + significant dev time

### Path C — Progressive Web App (PWA) only
Users add to home screen from Safari. iOS supports PWA basics but has real limitations (no push, limited audio background mode, no App Store presence).

- **Pros:** zero extra dev work
- **Cons:** not on the App Store, no app icon discovery, iOS users won't find you
- **Dev effort:** days
- **Cost:** zero

### Recommendation: **Path A (Capacitor)** for v1

Ships fastest. The sound engine — which is the heart of the app — works in WKWebView. We keep one codebase. If native performance becomes a bottleneck later, we can selectively rewrite hot paths in Path B or ship a native audio module without rewriting everything.

## 2. The realistic timeline from today

Assuming Martin is the primary builder with AI assistance, and **PR #26 has merged + Supabase is live** (the pre-requisites):

| Week | Work | Output |
|---|---|---|
| 1 | Apple Developer Program enrollment ($99), fetch certificates, set up Xcode | Dev account live, Mac environment ready |
| 2 | Install Capacitor into the Next.js repo, configure iOS target, first local build running on Simulator | App opens on iPhone simulator |
| 3 | Fix iOS-specific WebAudio issues, ensure `AudioContext` starts on user gesture, audio works in background | Sound plays on device |
| 4 | Implement Sign in with Apple (required for App Store apps with third-party auth), wire to Supabase | Users can sign up via Apple ID |
| 5 | In-App Purchase setup for subscription tier (if monetizing) via RevenueCat | Subscription plumbing ready |
| 6 | App Store Connect: app listing, screenshots, privacy disclosures, TestFlight beta | Beta users installing |
| 7 | TestFlight feedback round, crash fixes, polish | Stable beta |
| 8 | App Store review submission | Submitted |
| 8-10 | Review process (usually 1-3 days initial, 24h for updates) | Live on App Store |

**~2-3 months from starting to first App Store listing.** Aggressive but realistic if focused.

## 3. Supabase on iOS — what changes and what doesn't

Good news: Supabase works the same on iOS as on the web because it's all HTTPS. The JS SDK runs unchanged in the WebView. Auth tokens persist via the WebView's cookies + localStorage (same as web).

What DOES change:

### 3a. Sign in with Apple is required
Apple's App Store Review Guideline 4.8 requires apps with third-party sign-in (Google, Facebook, etc.) to *also* offer "Sign in with Apple" as an equivalent option. Colourmap already has Google sign-in planned — we must add Sign in with Apple to be App Store compliant.

Supabase supports Sign in with Apple natively:
- Configure in Supabase Dashboard → Authentication → Providers → Apple
- Requires creating a Services ID in Apple Developer Portal
- Requires a private key (`.p8`) generated in Apple Developer Portal
- Reasonable ~30 min one-time setup once you have the Developer account

### 3b. Deep links and redirect URIs
OAuth callbacks need to work with Capacitor's `capacitor://` or `colourmap://` scheme instead of only `https://colourmap.app`. Supabase redirect URI must include:
- `https://colourmap.app/auth/callback` (web)
- `com.colourmap.app://auth/callback` (iOS)

### 3c. Row-Level Security is the same
RLS policies defined in Supabase apply equally to iOS requests. No change needed on the server side. This is why we flagged RLS audit as a pre-launch must-do in the next-steps roadmap.

### 3d. Offline is a real concern on mobile
Mobile users expect apps to open and do something even without signal. Supabase calls fail without a network. We need:
- Cache the last check-in payload locally
- Queue outgoing writes (new check-ins) when offline, sync when signal returns
- Show a clear "offline" indicator rather than a silent failure

Supabase has `persistSession: true` for auth (already default), but data-sync offline behavior is custom work.

## 4. What iOS specifically demands of Colourmap

Apple's review team is strict. Known rejection reasons we should pre-empt:

### 4a. "No substantive content" rejection
Rejection risk if the app only plays audio and does nothing else. Colourmap is more than that — check-in, missions, notebook, Circles — but the audio-studio is the signature. Position the listing around the **full self-reflection + sound** story, not "sounds app".

### 4b. Privacy nutrition labels
Must declare what data we collect and how it's used in App Store Connect. For Colourmap:
- **Health & Fitness:** check-in emotional data (self-declared)
- **User Content:** notebook entries, custom mission descriptions
- **Identifiers:** Supabase user ID (required for auth)
- **Contact Info:** email (for auth)

Be truthful and precise. Apple will reject vague privacy labels.

### 4c. Account deletion
Required since 2022. The app must provide an in-UI path to permanently delete the account and all associated data. Supabase has delete cascade on user deletion — we need to hook it up. One-button "delete my account" with confirmation.

### 4d. Audio background mode entitlement
If we want sounds to keep playing when the user locks the phone (they'll want this — it's a meditation app), we need to:
- Add `UIBackgroundModes: audio` to `Info.plist`
- Handle audio interruption (incoming calls, other apps) gracefully
- Use AudioSession category `playback` or `ambient` appropriately

Capacitor can do this via the [Capacitor NativeAudio](https://github.com/capacitor-community/native-audio) plugin or by configuring `Info.plist` directly in the Xcode project it generates.

### 4e. In-app purchases for digital content
If Colourmap offers a subscription tier, it MUST go through Apple's IAP system on iOS (30% cut, or 15% after year 1 / for small businesses). Cannot use Stripe on iOS.

The canonical stack for cross-platform subscriptions:
- **RevenueCat** — abstracts iOS IAP, Android Billing, and Stripe behind one API
- Supabase stores the subscription state (tier, expiry) synced from RevenueCat
- iOS users pay via IAP, Android via Play Billing, web via Stripe — all roll up to the same Supabase record

## 5. Architecture of the combined system

```
                    ┌──────────────────────────────┐
                    │  User on iPhone              │
                    │  (installed Colourmap.app)   │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │  Capacitor shell             │
                    │  + iOS native bridge         │
                    │  (audio background, IAP,     │
                    │   push, deep links)          │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │  WKWebView running           │
                    │  the Next.js app             │
                    │  (same codebase as web)      │
                    └──┬────────────┬──────────────┘
                       │            │
            ┌──────────▼──┐    ┌────▼────────────┐
            │  Supabase    │    │  RevenueCat     │
            │  - Auth      │    │  - Subscription │
            │  - Postgres  │    │    state        │
            │  - Storage   │    │  - Apple IAP    │
            │  (RLS on)    │    │  - Google Billing│
            └──────────────┘    │  - Stripe       │
                                └─────────────────┘
```

Same backend (Supabase) serves web and iOS. RevenueCat handles the payment cross-platform complexity.

## 6. Key decisions that unblock iOS work

Before starting Capacitor integration, these decisions need to be made:

### 6a. Bundle ID and team
- Pick the reverse-domain bundle ID: `com.colourmap.app` is the likely choice
- Decide: individual Apple account ($99/yr, shows your name on the listing) or organization account ($99/yr, shows a company name, needs a D-U-N-S number — takes weeks to verify)

### 6b. Subscription vs free vs tiered
- Subscription: simpler economics, predictable revenue
- Free with premium tier: broader adoption, harder to monetize
- One-time purchase: unusual for this category; creates disincentive for updates

Recommendation for Colourmap: **free entry tier + subscription for premium voices/samples/features**. The hybrid approach lets new users experience the core value (check-in + some sounds) before deciding to pay.

### 6c. Sample library delivery
- Ship all ~50MB of audio samples in the app bundle (bigger initial download but offline-ready)
- Lazy-load from Supabase Storage or a CDN when user activates a layer (smaller initial download but requires network)

Recommendation: ship common layers in the bundle (~15MB), lazy-load exotic layers from Supabase Storage.

## 7. The App Store review pitch

When submitting the app to Apple, the review team needs to understand what Colourmap is in ~30 seconds. The pitch (for internal review notes):

> **Colourmap is a daily self-reflection app built around emotional check-ins, mission tracking, personal notebook entries, and a meditative sound studio. Users check in with how they're feeling, track patterns over time, and use layered ambient soundscapes (real nature recordings, binaural tones, gentle instruments) to regulate their state. All data is private to the user. Optional groups ("Circles") let trusted friends share emotional awareness without exposing details.**

This positions the app clearly, highlights the unique combination that Apple likes, and signals it's not a generic "mood tracker" or "rain sounds" app.

## 8. Risks and mitigations

| Risk | Mitigation |
|---|---|
| iOS Safari audio quirks break the sound engine | Test Capacitor build on real device early (week 2). Isolate Web Audio issues before they pile up. |
| Apple rejects the listing for vague privacy labels | Be exhaustively honest. Every data point declared. Consult the privacy nutrition label guide. |
| Users don't find the app on the store | Invest in screenshots (each showing one capability) and a 30-sec preview video. Metadata optimization. |
| Subscription churn is high | Free tier must be good enough to keep non-payers engaged. Premium must be clearly differentiated. |
| Review process takes longer than expected | Build a TestFlight beta early so real users test while Apple is reviewing. Use beta feedback to polish during the wait. |
| Supabase costs spiral as user base grows | Track DB size and egress. Migrate heavy-read tables to edge cache. RLS-safe caching strategy. |

## 9. Minimum viable App Store launch checklist

When we're ready to submit, this is what must exist:

- [ ] Apple Developer Program active ($99 paid)
- [ ] Bundle ID registered
- [ ] Certificates and provisioning profiles set up
- [ ] Capacitor iOS project builds and runs on simulator and device
- [ ] Sign in with Apple wired up via Supabase
- [ ] Account deletion flow implemented
- [ ] Audio background mode configured
- [ ] IAP subscription set up via RevenueCat (if monetized at launch)
- [ ] Privacy nutrition labels drafted
- [ ] App icon at all required sizes (1024x1024 marketing, 60-120px device)
- [ ] Screenshots (6.5" and 6.7" iPhone, minimum 2 per device class)
- [ ] App preview video (optional but highly recommended)
- [ ] App Store listing: description, keywords, subtitle, promotional text
- [ ] Privacy policy URL (public, linked from listing)
- [ ] Support URL (public, linked from listing)
- [ ] TestFlight beta run — at least 20 testers, ~1 week, crash-free
- [ ] App Store review notes explaining the app in one paragraph
- [ ] Demo account credentials for Apple reviewer (if app requires login)

## 10. What NOT to do on the App Store path

- Don't ship to the App Store without Sign in with Apple. Auto-rejection.
- Don't use Stripe for in-app subscriptions on iOS. Auto-rejection.
- Don't claim medical/therapy benefits ("cures anxiety", "clinical depression relief"). Auto-rejection plus potential FDA issues.
- Don't skip the privacy nutrition labels. Auto-rejection.
- Don't hardcode production API keys in the app bundle. Security audit will catch it.
- Don't rush TestFlight. One week minimum with real users before submission.
- Don't over-promise in screenshots. Apple rejects misleading marketing.
- Don't use placeholder content in the reviewer demo. They will see it.

## 11. The Android question

Once the iOS path is live, Android follows naturally:
- Same Capacitor codebase → add Android target (`npx cap add android`)
- Google Play Store review is faster and less strict
- RevenueCat handles Google Billing
- ~1-2 weeks additional work if iOS is solid

Launching iOS first is the right call because:
- iOS users pay more
- Apple's constraints force a higher-quality bar
- Same work applies to both platforms once Capacitor is integrated

## 12. The one-line North Star for this work

If a user in a coffee shop opens the App Store, searches, taps install, and opens Colourmap for the first time, within 30 seconds they should think:

> **"This is a real app, not a web page in disguise."**

Every iOS decision should be tested against that line.

---

*Owned by: Martin*  
*Updated: 2026-04-23 (initial)*  
*Next update: after Capacitor integration spike*
