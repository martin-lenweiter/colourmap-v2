# A Social Media That Doesn't Cost Us Money

> Asked by Martin (2026-04-25): "do a pdf about how u imagine a
> social media that doesnt cost us money to make. and we start with
> small events and circles and grow bigger over time. experiments
> expos unique events. how to make it light and easy."

A practical model for building Colourmap's social layer **without
ad spend, without influencers, without hiring a marketing team**.
Start with rooms of 8 people; grow to nights of 100; eventually to
weekends of 500. Each step funds the next.

## The thesis in one paragraph

The cheapest customer acquisition is **people who already love
each other in the same room**. If 8 friends spend an evening
together with the app open, and the app made the evening better,
they each tell two more people. That's the entire growth engine
for the first 18 months. **Events** are the thing those 8 friends
gather around; **Circles** are the in-app residue that keeps the
group alive between events. Everything else (paid acquisition,
SEO, content marketing) we don't do.

## Stage 1 — The Salon (months 0–3, group size: 6–12)

The first version of "social Colourmap" is a single small event
in a single living room. **Not a feature, an event.**

### What it is

You and a friend invite 6–10 people to a 2-hour evening. Each
guest brings their phone. The app guides the evening:

- A 5-minute opening check-in (everyone in the room does the
  Feeling/Doing flow, all on their phones, results aggregated to
  one big screen showing the room's emotional state)
- 90 minutes of music — Chill Machine + Groove Machine — with
  the **collective vote** mode active (everyone has a "more
  fire / more calm" slider on their phone, the room's average
  drives the music; see `chill-groove-blend-and-collective-
  control.md`)
- A 15-minute closing reflection in the Notebook

### Cost

- The host's living room
- Snacks + drinks (host pays)
- A speaker (host has one)
- The app (free)

**Marginal cost per attendee = 0.** No ads, no venue rental, no
software fee, no staff.

### Growth

- Each attendee is a *witness* — they know it works because they
  felt it work in the room.
- 70% rule of thumb: 70% of guests will tell at least 2 friends
  about it within a week. From one salon, ~14 new "warm leads."
- 30% will offer to host the next one. **The salon
  self-replicates.**

### What we ship to enable this

- Circle creation flow (already exists in /circles)
- Collective vote sliders in Groove Machine (spec'd, not built)
- A simple "Salon mode" preset — opens the right surfaces in the
  right order, doesn't surprise the host mid-flow
- Optional: a one-page printed PDF for hosts ("how to run a
  Colourmap salon"), shareable as link

That's it. **Two weeks of focused work** to enable the first 100
salons.

## Stage 2 — The Underground Night (months 3–9, group size: 30–80)

Once the salon model is *known to work*, scale it once. Not 100x,
just 5–10x.

### What it is

A monthly "Colourmap Night" in a friendly venue: yoga studio,
small art gallery, cooperative café after closing, a friend's
dance studio. Some venues will host for free in exchange for a
share of door donations.

- Same arc as the salon, scaled up
- Bigger speakers, projector for the visualizer
- One "host" leads the evening — usually a friend who's run 3+
  salons
- Suggested donation at the door (€5–15) — **covers venue
  costs**, nothing more

### Cost

- Venue: usually free (favours, exchange, friends)
- Sound system: borrowed or rented for €50–100, covered by door
- App: still free
- Total out-of-pocket from us: **€0**

### Growth

- Each night brings ~50 new people into the app
- ~10 of them go on to host their own salons
- Local press notices something is happening — *unpaid* coverage
  in city blogs, alternative weeklies, art newsletters
- Word of mouth: "have you been to one of those Colourmap
  nights?"

### What we ship to enable this

- A "Night mode" preset — bigger projector visuals, larger
  collective vote UI optimized for "everyone in the room can see
  and tap" (see `parties-social-art-connector.md`)
- A door tally: hosts can mark how many people came, what city,
  what venue — feeds an internal map (private, just for us, to
  see where things are taking root)
- A reusable "host kit" — printed PDF, social media images,
  sample invite texts, music presets

## Stage 3 — Experiments + Expos (months 6–18)

In parallel with the regular nights, do things that are *strange*
enough that people *want to write about them*. Strangeness is
free.

### Examples

- **The 24-hour Salon.** Friday night to Saturday night, in a
  countryside house. Music modulated by the room's collective
  fatigue — the app reads the room's check-ins and drifts the
  soundscape from energetic at midnight to gentle at 5 AM.
- **The Silent Salon.** No human speech for 90 minutes — only
  music + check-ins on phones. People discover that the room
  feels closer when nobody talks.
- **The Cooking Salon.** Group cooks together; the app's music
  adapts to the chopping/stirring/eating phases.
- **The Gallery Night.** Pair Colourmap with a local artist's
  opening — visitors check in, the visualizer reflects the
  *room's* mood across the artist's work.
- **Co-living week.** Take over a small AirBnB-style place for
  3–7 days with 8 people. Live with the app on the whole time.
  Document what happens. Each person leaves with a "shape" of
  the week (Overview snapshot, see `overview-vision-progression-
  patterns-beauty.md`).

### Cost

Each is small (€0–500 out-of-pocket) and self-funded by attendee
contributions. None require staff or paid promotion.

### Why this works for growth

- These are **stories**. Stories travel. A normal-app launch
  doesn't get press; a "24-hour silent salon" might.
- Each is a *content piece* — pictures, audio recordings, a
  written essay — that lives on a blog or zine and pulls in
  search/serendipity traffic forever.
- They attract a different audience: artists, somatic
  practitioners, journalists, festival programmers. These people
  become amplifiers.

## Stage 4 — Festivals + Expos (months 12–24)

Once you have ~50 monthly nights happening across cities, the
app is **legible** to bigger institutions.

### What it is

- A 1-room installation at a small art festival or design week
  (Salone Milano, Vienna's MAK, Berlin's DesignMai, the smaller
  art biennales)
- Curators love things that "involve the visitor" — Colourmap
  literally is that
- The festival usually pays for the booth/space
- We bring 4–6 friends to staff it

### Cost

- Travel for 2–4 of us (~€500–€1500)
- Print materials (~€100)
- The festival pays the rest

### Growth

- Press coverage in design + art outlets — the kind that
  *doesn't* cost money but lasts
- Gets the app in front of people with influence (curators,
  festival directors, journalists)
- Each festival is also a "salon at scale" — 200+ visitors over
  a weekend, each one a potential salon host

## What we *never* do

These are the temptations that burn money for unclear returns:

- ❌ **Paid ads** (Google, Meta, TikTok) — too expensive per
  install for a deeply intentional product.
- ❌ **Influencer partnerships** — almost always inauthentic;
  audience installs and bounces.
- ❌ **Hiring a marketer** — until ~100k MAU, the founders are
  the marketers.
- ❌ **PR firms** — they're priced for SaaS launches; our story
  is shaped at salons, not press releases.
- ❌ **Conferences as attendees** — only as exhibitors with a
  free booth.

## How to make it light and easy

The biggest risk is that "running events" becomes *work* and
hosts burn out.

### Five rules to keep it light

1. **The app does the heavy lifting.** Pre-built salon flow that
   a host can run with no preparation. They press one button, the
   app guides 90 minutes.
2. **Hosts get a tool, not a job.** They're not "ambassadors"
   doing free labour for us — they're using the app to make their
   own evening better.
3. **Donations not tickets.** Tickets create pressure to perform
   (refunds, marketing, attendance); donations stay friendly.
4. **No KPIs from us to hosts.** We don't ask them to bring 30
   people next time. We ask them how it went.
5. **Make sharing automatic.** After a salon, the app generates
   a simple beautiful image of the room's collective shape that
   every attendee can save + post if they want. Free, organic,
   distributed marketing — but only if the moment was good
   enough to share.

## Concrete next 90 days

- **Week 1–2**: Salon mode in the app (host-flow with the right
  surfaces sequenced). Run our first salon ourselves with 8
  friends.
- **Week 3–4**: Iterate based on what failed. Run salon #2.
- **Week 5–6**: Build the host kit (PDF guide, invite templates,
  presets). Recruit 5 friends in 5 cities to run salons #3–7.
- **Week 7–10**: Underground night infrastructure — venue
  scout flow, door-donation guidance, projector mode. Run
  Night #1 in our city.
- **Week 11–12**: Document what we've learned. Pick the first
  Experiment to run in month 4.

Total spend in 90 days: **under €500** (snacks, host kit
printing, one venue rental).

Total reach: **plausibly 200–400 people in the app** by day 90,
all of whom touched it through someone they trusted.

## How this connects

- `parties-social-art-connector.md` — earlier spec on parties as
  the wedge; this doc nests inside that
- `social-media-future-and-circles.md` — Circles are the
  in-app residue of these events
- `chill-groove-blend-and-collective-control.md` — the
  collective music control is the *thing* that makes the room
  electric
- `overview-vision-progression-patterns-beauty.md` — the Overview
  is what the user sees after the salon, where they remember
  *that was a good night*

## Closing

The core bet: **rooms of people who love each other already are
the cheapest, most loyal, most beautiful distribution channel.**
Build for that. Resist every temptation to scale it any way that
removes the room.
