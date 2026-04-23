# Voice and TTS Strategy — From Robotic to Human

A reflection written 2026-04-23 in response to Martin's question:
> "give me deep analysis on how to use voices in the app that sound human and good current ones too robot like yet"

Martin's earlier note (committed 2026-04-05 in `next-steps.md`):
> "Voice/poetry system uses browser speech which sounds robotic — AI TTS would be better"

## 1. Where the voice actually shows up in Colourmap

Before picking a tool, name the jobs. Right now voice appears in:

- **The voice/poetry layer** — speech-synthesized lines blended into Calming Sounds
- **Potentially: guided sound journeys** (mentioned as a future feature in next-steps.md — 15-min narrative experiences)
- **Potentially: check-in prompts read aloud** (not currently, but an obvious extension — "how are you arriving today?")
- **Potentially: Post-check-in reflection readback** (AI-generated reflection spoken to the user)
- **Potentially: incoming letters/poems in the Phase 3 sharing features** (user-written content read aloud to recipient)

Each job has different needs. A layered poetic line tolerates lower quality because it's background. A 15-minute guided journey needs voices the user can tolerate for 15 minutes — which is a much higher bar. An incoming letter read in a friend's voice is a completely different technology (voice cloning with consent).

## 2. Why the current setup is robotic

The app uses `SpeechSynthesisUtterance` (the Web Speech API).

What's good about it:
- Free. Zero cost per minute.
- Runs fully offline after initial install.
- Instant — no network latency.
- Every browser has it.
- No API key management, no billing.

What's bad:
- Voice quality is tied to the operating system's installed voices. Windows has decent Microsoft voices, macOS has decent Apple voices, but both sound "speech-synthesized" — mechanical cadence, robotic prosody, no emotional inflection.
- No control over prosody. You can request a pitch and rate, but the engine decides where to pause, how to emphasize, whether to sound warm or cold.
- Voices differ drastically by platform. A reading that sounds OK on macOS sounds terrible on Chromebook.
- Mobile browsers (iOS Safari especially) have limited voice sets and often refuse to speak without a direct user gesture each time.
- It's not what users expect in 2026. They've heard ChatGPT's voice mode; they've heard ElevenLabs; they know what good synthetic voice sounds like now.

This is not a parameter you can tune your way out of. It's a platform ceiling.

## 3. The menu of alternatives

Five real options, each with different trade-offs:

### Option A — Cloud AI TTS (ElevenLabs, OpenAI Voice, Azure Neural TTS, Google WaveNet)

**ElevenLabs** (the current quality leader)
- Quality: indistinguishable from human for most listeners
- Cost: ~$0.18–$0.30 per minute of audio at standard tier; cheaper at scale
- Latency: streaming available, first-chunk ~400ms
- Voices: large preset library + custom voice cloning
- Risk: price scales per-use; a popular app with lots of voice minutes gets expensive fast

**OpenAI Voice (TTS API)**
- Quality: very good, not quite ElevenLabs level
- Cost: ~$0.015 per 1000 characters (approximately $0.10 per minute)
- Latency: streaming available
- Voices: 6 fixed voices (alloy, echo, fable, onyx, nova, shimmer) — no cloning
- Risk: limited voice choice; bound to OpenAI terms

**Azure Neural TTS**
- Quality: excellent, less famous than ElevenLabs but comparable
- Cost: ~$16 per million characters (approximately $0.07 per minute)
- Latency: streaming available
- Voices: 400+ across 140 languages, good emotional styles (cheerful, sad, calm)
- Risk: requires Azure account + billing; more setup

**Google Cloud TTS (WaveNet)**
- Quality: very good, slightly behind ElevenLabs
- Cost: ~$16 per million characters for WaveNet tier
- Latency: streaming available
- Voices: large library, fewer emotional styles than Azure
- Risk: requires GCP account + billing

### Option B — Open-source self-hosted TTS (Piper, Coqui XTTS, Tortoise, Mimic 3)

**Piper** (lightweight, fast, decent)
- Quality: better than SpeechSynthesis, not as good as ElevenLabs
- Cost: free (compute only)
- Latency: very fast, can run on a small Vercel-side Node function or edge function
- Voices: small library, dozens of languages
- Risk: maintenance burden; would need to host inference somewhere

**Coqui XTTS v2**
- Quality: excellent, near-ElevenLabs for English
- Cost: free, but inference needs a GPU ($0.50–$2 per compute hour)
- Latency: 1-3 seconds for short text
- Voices: voice cloning from 6 seconds of sample
- Risk: requires GPU infrastructure; Coqui the company shut down but the model is still usable

### Option C — Pre-recorded voice library

Hire a voice artist (or several) to record a curated library of:
- Opening breath/arrival lines ("welcome back", "take a breath")
- Sound-journey narratives (pre-written 15-minute scripts)
- Check-in prompts
- Transitions and pauses

- Quality: the best possible (real human, recorded in studio)
- Cost: one-time recording fee ($500–$5000 depending on artist and duration), zero per-use cost
- Latency: instant (pre-loaded assets)
- Voices: fixed — only what's recorded
- Risk: can't handle dynamic content (AI-generated reflections, user messages)

### Option D — User-uploaded voice (for sharing features)

In the Phase 3 letters/poems sharing feature, the user could *record their own voice* for the recipient.

- Quality: as good as the user's phone mic
- Cost: free
- Latency: depends on upload
- Voices: the sender's actual voice — irreplaceable intimacy
- Risk: none — this is content the user chose to create

### Option E — Hybrid strategy (strongly recommended)

Use different tools for different jobs:

| Job | Best tool | Why |
|---|---|---|
| Voice/poetry layer (background, short) | Azure Neural TTS, streaming | Cheap, quick, good emotional control |
| Guided sound journeys (15 min, curated) | Pre-recorded voice artist | The best quality for the highest-stakes content |
| Check-in prompts (short, dynamic if needed) | Azure Neural TTS, cached | Can pre-generate common prompts, fall back to live gen for rare ones |
| AI-generated reflections (post-checkin) | OpenAI Voice or ElevenLabs | The reflection is already generated by AI; unified stack |
| User-written letters/poems to friends | User uploads their own recording OR ElevenLabs clone of themselves (with consent) | Intimacy beats quality |
| Browser fallback when network fails | SpeechSynthesis | Graceful degradation |

## 4. The real recommendation

Go with **hybrid** — but stage it carefully:

**Phase 1 (ship first):**
- Keep SpeechSynthesis for the voice/poetry layer. Mark it clearly in UI as "browser voice (free)" so users know. Add a banner: "premium voices coming soon."
- Pre-record 3-5 opening "arrival" lines with a voice artist. Small investment, high impact. Users hear these first; if they sound amazing, the app feels premium immediately.

**Phase 2 (first paid tier):**
- Add Azure Neural TTS for the voice/poetry layer. Users get warmer voices. This probably unlocks with a subscription.
- Pre-generate and cache the top 50 most-used lines. Only rare/dynamic content hits the live API.
- Build a cost model: expected minutes per user per month × cost per minute vs subscription price. Rough math suggests $5–10/month subscription supports unlimited voice usage at Azure rates.

**Phase 3 (guided journeys):**
- Pre-record 5-10 full journeys with one or two voice artists. These become signature content. "Guided by [name]" has marketing value.
- Optional: let users pick voice artist (like audiobook narrators).

**Phase 4 (sharing / multiplayer):**
- Letters are spoken in the sender's own voice, either recorded or (with explicit consent and additional tier) cloned via ElevenLabs voice cloning.

## 5. Engineering plan for the first integration

When we actually wire Azure (or equivalent) into the voice/poetry layer:

1. **Route all TTS calls through a server-side API route** (`app/api/voice/speak/route.ts`). Never expose the API key to the browser. The route:
   - Accepts `{ text, voice, style }`
   - Calls the TTS provider
   - Streams the audio response back
   - Logs minutes used per user for billing/quota tracking
2. **Cache aggressively.** Stable content (check-in prompts, preset descriptions) should be cached to Supabase Storage once. Pay once, reuse forever.
3. **Respect a per-user monthly quota** (even on a paid tier — cap the abuser). 500 min/month covers typical use; rare power users can upgrade.
4. **Progressive enhancement.** If the API is down or slow, fall through to SpeechSynthesis. Users get *something* — never silence.
5. **Volume normalization.** Real voice and synthesized voice have different perceived loudness. Normalize to -16 LUFS before delivering; blend smoothly into the rest of the mix.
6. **Expose voice selection.** Let users pick from 3-5 voices per tier. Preference persists.

## 6. Safety and legal — the voice-cloning minefield

If we ever allow voice cloning (user records their own or asks for someone's voice):

- **Consent is mandatory and verifiable.** The person whose voice is being cloned must explicitly authorize, in writing, inside the app. Not a checkbox; a flow with a confirmation step and a stored audit trail.
- **Deepfake guardrails.** Cloned voices can only say things the owner authored. No arbitrary text → my friend's voice. That's a harassment vector.
- **Clear disclosure.** Anything spoken in a cloned voice must be labeled as such in the recipient's UI. "Message from Martin, read in Martin's voice."
- **Revocation.** User can revoke their cloned voice at any time. Existing clones are invalidated server-side within 24h.

Voice cloning is not a V1 feature. Launch without it. Add later with all the above in place.

## 7. Cost envelope for the first paid tier

Rough model, to pressure-test viability:

- Assume 1000 paying users at $8/month = $8000/month revenue
- Average voice usage: 30 minutes/user/month = 30,000 minutes
- At Azure rates (~$0.07/min): $2,100/month voice cost
- Leaves ~$5,900/month for infrastructure, Supabase, Vercel, development
- Margin: ~74%

That's a viable unit economics picture. Compare to ElevenLabs at $0.20/min: voice cost alone becomes $6,000/month of a $8,000 revenue — margin collapses. **Azure is the right call for primary TTS.**

## 8. What NOT to do

- Don't try to train your own TTS model. It's a research project with a one-year timeline.
- Don't use ElevenLabs as the primary provider. Too expensive at scale.
- Don't pay voice artists to record everything. Use pre-recording only for signature journeys.
- Don't silently use SpeechSynthesis forever. Users notice, and it signals "cheap app."
- Don't let users share AI-generated voice content without clear labeling. Deepfake risk even in benign contexts.

## 9. The one-line test

If a user hears the app's voice for the first time, they should think:

> **"Someone thoughtful made this."**

Not "robot." Not "ChatGPT." A particular, warm, human presence — whether real or very convincingly synthesized.

Every voice decision should be tested against that line.

---

*Reviewed and owned by: Martin*  
*Living document — updated as TTS quality moves.*
