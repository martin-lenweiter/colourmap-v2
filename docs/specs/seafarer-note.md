# SeafarerNote — onboard crew wellbeing module

**Status:** V0 spec.
**Lives in:** Sibling product to the Geopolitics Platform. Both are built by the same studio and pitched together to CMA CGM in [`cma-cgm-product.md`](./cma-cgm-product.md).
**Audience:** Merchant marine crews (~22 per vessel on average), masters and chief officers, ship-owner HR teams, company doctors. Procurement-side: shipping-line HR and crew-welfare leads.

## Why this exists

Merchant marine crews work 3-, 6-, and 9-month contracts. Internet on most ships is bad to terrible. Suicide rates are higher than land averages. Retention is expensive. The category of wellbeing tools that actually fit life at sea is small, and most "AI for shipping" pitches do not address it. SeafarerNote is the part of colourmap-v2 that, lightly forked, fits a ship.

CMA CGM's December 2024 launch of the **"She Sails"** crew program (under Christine Cabau Woehrel with public support from Rodolphe Saadé) is the visible procurement signal that crew/people-side topics get executive sponsorship.

## Purpose

Give a seafarer a tiny, daily, voice-able wellbeing practice that survives bad internet and a moving deck. Surface anonymised aggregate sentiment to the captain and HR layer so company actions are informed without surveilling the individual.

## Hard constraints

These are not later-V2 niceties. They define V1:

1. **Offline-first.** All daily prompts must work with zero connectivity. Content syncs at port (Wi-Fi available) and at any opportunistic onboard satellite window.
2. **Low storage per crew.** A device may be a personal phone of variable spec or a shared crew-mess tablet. Assume Android 9 / iOS 15 floor.
3. **No identity-tying to crew.** A crewmember must be able to write honestly without HR seeing their name on it. Aggregate sentiment only flows up; individual entries never do.
4. **Languages on day one.** English, Tagalog, Hindi, Mandarin, French, Russian, Spanish. (~80% of merchant marine crew language coverage.)
5. **Stable when interrupted.** Watchstanding interruptions are constant. State must survive app kill, phone shutdown, watch handover.
6. **No notifications that wake the crew.** A sleeping crewmember on a different watch must not be pinged.

## V1 module set

Reuses colourmap-v2's existing CoachNote engine, journal system, and reframe cycle, packaged for offline use.

| Module | What it is | Cadence |
|---|---|---|
| **Daily prompt** | One comic-style card per day. Reframing question, a small ritual, a journal cue. | Daily, on user's local clock |
| **Quick log** | 10-second mood + energy + sleep slider. Voice-first if hands are wet. | Daily |
| **Reframe cycle** | The colourmap reframe sequence — short, hand-drawn, branching | Weekly, optional |
| **6-week onboarding program** | Comic-style program tuned to first weeks aboard (handover ritual, "the first call home is the hardest" prompt, etc.) | First 6 weeks of contract |
| **End-of-contract program** | Mirror of the above, last 6 weeks of contract — preparing to come home, anticipating the disconnection | Last 6 weeks of contract |
| **Captain dashboard** | Aggregate, anonymised, k-anonymity-gated (n≥5) crew sentiment. Trend lines, not individual entries. | Continuous, viewable any time |

## What is *not* in V1

- Real-time crew chat.
- Tele-counselling. (V2.)
- Integration with vessel HR systems. (V2.)
- Wearable hardware. (Never.)

## The aesthetic

The visual language is consistent with the existing colourmap-v2 *Self mode* — warm parchment, hand-drawn comic illustrations. The voice is non-corporate. The captain dashboard switches to the *World mode* intel-cold aesthetic (monospace badges, BLUF-first) so the seafarer-facing surface and the HR-facing surface are visually distinct *and the seafarer can tell at a glance which one they're looking at*.

This contrast is a deliberate trust signal: "what I write is on the warm side; what's reported up is on the cold side."

## Data model (rough)

Reuses the existing colourmap-v2 types where possible.

```ts
type SeafarerEntry = {
  id: string                  // local-only UUID
  crew_id: string             // a salted hash; never reversible to a human name
  vessel_id: string
  voyage_id: string
  written_at: string          // local ISO
  synced_at?: string          // null until port-sync
  mood: number                // 0..10
  energy: number              // 0..10
  sleep_hours: number
  text?: string               // optional free-text, ≤ 280 chars
  language: 'en' | 'tl' | 'hi' | 'zh' | 'fr' | 'ru' | 'es'
}

type CaptainAggregate = {
  vessel_id: string
  voyage_id: string
  bucket: string              // ISO week
  n: number                   // must be ≥ 5 to render
  mood_p50: number
  mood_p10: number
  mood_p90: number
  energy_p50: number
  sleep_p50: number
  trend: 'rising' | 'flat' | 'falling'
}
```

`crew_id` is a salted hash so even a database breach does not link entries to a name. Captain dashboards never receive `SeafarerEntry` rows — only `CaptainAggregate`.

## V1 build phases

| Phase | What ships | Why |
|---|---|---|
| P0 · seafarer single-device prototype | Daily prompt + quick log + reframe, fully offline on phone. One language (English). | Prove the daily loop survives a real watchstander. |
| P1 · 6-week onboarding program | Authored comic content for first weeks aboard. Plus end-of-contract mirror. | The retention thesis — does this measurably improve self-reported settle-in? |
| P2 · multilingual + tablet | Languages 2-7; runs cleanly on a shared mess tablet with multi-user switching. | Real crews. |
| P3 · captain dashboard | Aggregate-only HR surface. k-anonymity gating. | Procurement-readable. |
| P4 · CMA CGM pilot | One vessel, ~22 crew, 4-week deployment. Pre/post baseline. | The Artifact 2 demo for [`cma-cgm-product.md`](./cma-cgm-product.md). |

## Sales model

White-labelled under the company's name (e.g. "CMA CGM Crew Practice"). Charged per-vessel, per-month. Indicative: **€200/vessel/month** for the seafarer-facing module + the captain dashboard, with the multilingual content as standard.

For a 600-vessel carrier like CMA CGM that comes to ~€1.4M ARR — small but real, and pairs well with the Intel module's larger seat pricing. Together they are the studio's two-product B2B thesis.

## Done When

- A real watchstander on a real vessel can use the daily prompt for two weeks without the app failing.
- The captain dashboard never renders an aggregate for n<5, even in test.
- No notification ever wakes a crewmember off-watch.
- All 7 language packs ship as static content, not server-fetched.
- The 6-week onboarding program reads as warm, not corporate, even in language 4 (Mandarin).

## Later

- Tele-counselling escalation (V2). Must respect the same k-anonymity gating until a crewmember explicitly opts to identify themselves to a counsellor.
- Integration with vessel HR systems (V2).
- Cross-vessel benchmarks for HR ("our fleet's mood vs the industry average") — V3, only after privacy review.
