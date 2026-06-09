# CMA CGM Product — B2B Pitch & Pilot

**Status:** V0 skeleton — pending the Geneva-and-people deep-research workflow (running). Final version due after that workflow lands and after a sourcing pass on CMA CGM's 2025-2026 strategic moves.
**Lives in:** `docs/specs/`, paired with [`geopolitics-platform.md`](./geopolitics-platform.md). Public-facing landing page route: `/proposal/cma-cgm`.
**Audience:** Rodolphe Saadé's digital/innovation team and Tanya Saadé Zeenny's diversification office at CMA CGM Group, Marseille.

## Purpose

This document describes **the artifact a young French Albert School master's student ships to CMA CGM** to start a conversation. Not a generic product. A specific, beautifully-designed *proposal*: here is what your geopolitics-intel brief could look like, here is what your seafarers' wellbeing module could look like, here is what a 6-week pilot looks like and what it would cost.

The product downstream of the proposal is what gets built if CMA CGM bites. The proposal itself is the V0 deliverable.

## The two verbatim Saadé quotes that anchor the pitch

From the Kyutai launch primary press release, used verbatim in any cold email:

> *"I would like the younger generation to benefit from all the opportunities that this technology has to offer."*

> *"place France and the rest of Europe at the forefront of artificial intelligence research."*

These two sentences map exactly to an Albert School master's student building a French-stack product. They are the single highest-signal positioning material in the research package.

## MAIA is the docking surface

CMA CGM launched **MAIA (Powered by Mistral)** — its agentic AI platform — on **1 June 2026** to ~80,000 employees across CMA CGM, CEVA Logistics, and CMA Media. The group reports **55+ AI projects and 200+ use cases** as of late May 2026.

**This is the docking surface for the Intel module.** The right framing is not "we built a separate product"; it is *"a domain-specific MAIA agent for daily geopolitical intelligence — using your existing Mistral substrate, embedded in the existing MAIA UX."*

This is the single most contemporary technical hook in the proposal. Use it.

## What CMA CGM cares about (research-backed)

- **Decision speed on geopolitics-driven risk.** Every Hormuz seizure, Houthi strike, EU-ETS tweak, or alliance reshuffle changes how **4.140 M TEU** and a **45.5% orderbook** are deployed [verified, Alphaliner Jan 2026].
- **A French-controlled AI stack.** The **€100 M / $110 M five-year Mistral AI partnership announced April 2025** (Mistral teams embedded at Marseille HQ) is the strongest single signal of this. A French builder pitching a French-stack product is structurally aligned. [Mistral CMA CGM customer page, CMA CGM press release.]
- **A diversification narrative.** CEVA Logistics (Mathieu Friedberg CEO), CMA CGM Air Cargo, media holdings, terminal investments (Sokhna 1.7 M TEU, Jeddah $450 M JV with RSGT, **Mombasa $820 M** under France-Kenya cooperation). They buy stories about adjacency, not narrowly maritime tools.
- **Seafarer wellbeing — likely under-served.** The "She Sails" program launched December 2024 (Christine Cabau Woehrel, with public support of Rodolphe Saadé) is the visible signal that crew/people-side topics get executive sponsorship at CMA CGM. SeafarerNote walks into this opening.
- **Talent.** The verified channels: ZEBOX, CMA CGM Startup Awards, Tangram research chairs, HEC × CMA CGM AI Challenge. The realistic 22-25 entry is *not* generic internships (refuted) — it is a working product through these channels. Targeted Albert School / École 42 / Polytechnique relationships will be high-leverage if Albert School can sponsor an institutional channel comparable to HEC's.

## The proposal — three artifacts

### Artifact 1 · Geopolitics Intel Brief for CMA CGM

A white-labelled instance of the Geopolitics Platform (see [`geopolitics-platform.md`](./geopolitics-platform.md)), pre-loaded with CMA CGM's specific entity watchlist:

- The 22 chokepoints CMA CGM container vessels actually transit.
- CMA CGM's top 50 customer counterparties (by volume) with country-risk overlays.
- The Hormuz / Red Sea / Panama war-risk feed scored against CMA CGM's exposure, not the industry average.
- The CMA CGM-relevant cut of the daily and weekly briefs.

This is a CMA CGM-skinned version of the live Shipping Intel mode + an entity-filtered daily/weekly brief.

### Artifact 2 · SeafarerNote — onboard wellbeing module

A bundled subset of the colourmap-v2 wellbeing engine, sold as a separate licensable module. Detail in companion spec `seafarer-note.md` (to be created). Key shape:

- Offline-capable: ship's internet is bad. Content syncs at port.
- Comic-style daily prompts in the user's existing CoachNote system.
- 6-week onboarding programs tuned to long-contract life (3-month, 6-month, 9-month rotations).
- Captain dashboard surfaces aggregate, anonymised crew sentiment for HR / company doctor.
- Multi-language from day one (English, Tagalog, Hindi, Mandarin, French, Russian, Spanish — the languages of merchant marine crews).

### Artifact 3 · Pilot proposal (6 weeks)

A one-page commercial proposal — what gets built in 6 weeks, what gets measured, what the renewal looks like.

```
Week 1-2 · Geopolitics Intel set-up
  · Entity watchlist scoped with CMA CGM strategy team.
  · Brief format approved by Saadé's chief of staff.
  · Daily brief drafting loop running with an editor on the CMA CGM side.

Week 3-4 · SeafarerNote pilot
  · 1 vessel, ~22 crew, 4-week deployment.
  · Pre/post wellbeing baseline.
  · Captain dashboard handed to the master.

Week 5-6 · Pitch back
  · Two reports: intel-brief readership analytics, SeafarerNote pre/post deltas.
  · Cost projection for fleet-wide deployment.
  · Decision: renew, expand, or part as friends.

Cost (indicative): €60k all-in (build + hosting + analyst time). Renewal optional, modular.
```

## What the proposal *is not*

- Not a CV or portfolio piece. Tonal mistake.
- Not a slide deck. Slides are not memorable; a small, beautifully-designed web artifact is.
- Not a vague "AI for shipping" pitch. CMA CGM gets twenty of those per week.
- Not a white paper. White papers don't ship.

## The landing page — `/proposal/cma-cgm`

A long-scroll, designed page on the builder's own domain. Six sections, ~3-minute read:

1. **The premise** — what the world looks like for a Marseille HQ in 2026 (one paragraph, grounded in the verified Hormuz/Russia/China snapshot).
2. **The intel brief** — interactive mock-up of the CMA CGM-skinned daily brief, clickable cards.
3. **SeafarerNote** — short embedded demo of the comic-style daily prompt.
4. **Why this matters** — three numbers (one per artifact) showing the operational delta.
5. **The 6-week pilot** — the cost/scope block above.
6. **About me** — short. Albert School master's student building two products. Links, no CV.

The page itself follows the platform's intel-cold aesthetic so the visitor experiences the product before reading about it.

## Who to send it to

The Geneva/people deep-research has landed. The list collapses to three concrete approach mechanisms — in increasing institutional weight:

1. **Cold direct to the two named judges who engage with student-stage builders.**
   - **Jean Fauquembergue** — Head of AI, CMA CGM (ex-BNP Paribas / Société Générale, ENSAE Paris). Publicly identifiable. Judged the HEC × CMA CGM AI Challenge personally on 23 Sept 2025.
   - **Agnès Mossina** — Head of Marketing & Studies. Same jury.
   - Send the proposal page (`/proposal/cma-cgm`) with a 3-paragraph email. Lead with the verified-fact framing (orderbook ratio, war-risk repricing, Mistral partnership). Don't lead with CV.

2. **ZEBOX Ignite application.**
   - URL: [ze-box.io/startup-programs](https://www.ze-box.io/startup-programs).
   - The verbatim positioning: *"gateway to collaboration with the CMA CGM Group."* Initiated by Rodolphe Saadé personally.
   - The Ignite track explicitly accepts MVP / prototype stage. Apply with the running prototypes (Intel V1 + SeafarerNote V1) and the 6-week pilot scope below.
   - Cycle cadence: roughly annual cohorts; Fall 2025 cohort was open at the time of research. Check current open call.

3. **CMA CGM Startup Awards (next edition).**
   - Tied to the AIM Marseille forum, typically held in November.
   - Up to **€150 k pilot funding**, one year customised ZEBOX support, CMA Media coverage, and *"privileged access to CMA CGM's decision-makers through dedicated meetings"* (verbatim).
   - Four challenge categories typically map to: disruption forecast / hazmat transport / warehouse robotics / media monetisation. The Geopolitics Intel module maps cleanly to "Disruption Forecast & Transport Tracking."
   - 2024 winners — tonal study (decarb / ops AI / cybersec / media): Aerleum, Elonroad, GBMS, **ZERO44** (closest cousin), Okular Logistics, Optioryx, Argil.

### Send mechanics

- **One** introduction email per recipient. Three paragraphs, single link to `/proposal/cma-cgm`.
- **No follow-up before a week.** Saadé's team operates on French executive cadence, not US-startup-hustle cadence.
- **No mass mailing.** ZEBOX is the bulk channel; cold mail is reserved for ~3 carefully chosen humans.
- **Drop the CV framing.** The Geneva research's strongest signal — confirmed via a refuted claim — is that CMA CGM does **not** use generic-CV channels for digital/AI/product talent. Pitch the product. Lead with the artifact.

## Done When

- Landing page is live at `/proposal/cma-cgm` and loads in <2s on a Marseille office connection.
- Geopolitics Intel mock-up plays through end-to-end without falling back to lorem-ipsum.
- SeafarerNote demo is real (one comic-style prompt running on phone and laptop).
- 6-week pilot scope is costed against an actual build schedule, not hand-waved.
- At least one initial outreach email is drafted, reviewed for tone, and held in `outbox.md` ready to send.

## Later

- A second, slimmer proposal for **MSC (Geneva)** — same architecture, different anchor.
- A third, even slimmer proposal for **Trafigura's freight desk** — only the intel module, no SeafarerNote.
- A `studio.md` — the two-product studio thesis (intel + wellbeing) that this proposal implicitly pitches.
