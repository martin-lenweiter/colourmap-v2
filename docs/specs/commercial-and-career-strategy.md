# Commercial + career strategy — 2026-04-24

User brief, paraphrased: "Tell me how you would prepare and direct
this app for commercial uses. To bring a stable solid product, gain
credibility, build posts on LinkedIn, and build my career from artist
to professional and AI creator specialist."

This spec covers four threads:
1. The product stability + credibility path
2. The commercial model
3. The LinkedIn / content path
4. The career positioning (artist → AI creator specialist)

---

## 1. Product stability + credibility

Before commercial works, the product has to feel *trustworthy* to a
stranger. The bar isn't "impressive" — it's "this person's serious."

### What credibility looks like for a tool like Colourmap

- **Doesn't lose your data.** Supabase wired end-to-end, not
  localStorage-only. A lost check-in stream is a trust-killer.
- **Auth that works.** Google + email. Password reset. Clean logout.
  Right now DEV_BYPASS_AUTH is guarded (good) but the production auth
  UX should be stress-tested: signup in under 30 seconds on a phone.
- **Privacy language.** A short, human privacy page explaining what's
  stored, what isn't, and why. People installing a check-in app want
  to know their emotions aren't training someone's model.
- **Accessibility floor.** Tab navigation works, focus rings visible,
  text at ≥ 14px default, color contrast AA. Demonstrable with a
  Lighthouse score.
- **Mobile reliability.** Already partway there (keyboard-aware hooks,
  svh viewport). Needs: no dropped audio on background, smooth
  transitions under low battery, graceful offline.
- **Visible progress.** A public changelog (even just a single markdown
  page at `/changelog` listing dates + what landed) signals "this is
  worked on."

### 30-60-90 day path to commercial-ready

**Days 0-30 — close the loops:**
- Supabase migration: all state (check-ins, missions, songs, habits,
  circles) synced server-side. localStorage becomes a cache, not the
  source of truth.
- Landing page for unauth users at `/` — who Colourmap is for, what
  it does, how it's different from Calm/Headspace (it's not meditation —
  it's self-reflection + sound studio + life-map).
- Legal bar: privacy page, terms, cookie disclosure.
- Fix all jargon / accessibility items from the UX audit.

**Days 31-60 — polish + proof:**
- Pleasant redesign phases 2-5 shipped (full-bleed cards, drawers,
  motion, scroll-snap).
- First-run onboarding overlay.
- A public changelog page.
- Record a 60-second phone-screen demo video. Good for LinkedIn + the
  landing page above the fold.
- Beta invite list (a simple form — collect 50-100 emails).

**Days 61-90 — commercial rails:**
- Pricing. Free tier + Pro tier. Pro unlocks: cloud sync across
  devices, AI reflection summaries, unlimited projects, extra
  soundscapes. Free keeps core check-in + limited sounds.
- Stripe integration.
- Capacitor wrap for App Store + Play Store submission (target: week 10).
- Public launch.

---

## 2. Commercial model

### Three revenue paths, ranked by fit

**(a) Freemium subscription — your primary bet.**
- Free: check-in stream, 3 soundscapes, 1 project, localStorage sync.
- Pro ($7-9/mo or $60/yr): cloud sync, unlimited projects, AI
  reflections, extra soundscape packs, early features.
- This is what Calm, Headspace, Oak, Reflectly all do. Bar is
  execution, not model.

**(b) One-time lifetime license ($79-149).**
- Appeals to the segment that hates subscriptions.
- Works especially well for a tool that feels *personal* — people
  pay once for a thing they'll own.
- Can coexist with subscription.

**(c) B2B / teams / therapists.**
- Slower sales cycle, bigger contracts. $10-15/user/mo.
- Schools, therapy practices, coaching businesses, wellness centers.
- Don't chase this until consumer base is 1000+ users. It's a
  distraction early.

### What NOT to do

- **Don't sell the data.** Even anonymized. Kills trust forever if
  discovered.
- **Don't ads.** Ads in a self-reflection app are user-hostile.
- **Don't paywall the check-in.** The core habit must be free or the
  product fails to form the loop that makes everything else valuable.

---

## 3. LinkedIn / content

### Positioning

You're not "an artist" posting about art. You're a **builder** who
ships. LinkedIn people reward two things: **expertise made legible**
and **consistency**. Both are earned, not claimed.

### The content loop (4 posts/week, ~5-10 min each)

- **Mon — "build log."** One screenshot + one paragraph of what
  landed this week. "Shipped soft-beat bed in Calming Sounds today.
  Here's why the shaman drum sample wasn't actually a drum..." This
  post is the easiest to write because the work already happened.

- **Wed — "insight from the build."** A deeper think piece pulling a
  craft lesson out of the week. "The React duplicate-key warning I
  tracked down taught me this about CC0 asset pipelines..." or "Three
  things I learned building a check-in app that therapists would
  trust." Saves as a long-term asset.

- **Fri — "show, don't tell."** A 30-second phone screen recording
  of one feature, captioned with what problem it solves. Native video
  gets 5-8× the reach of a link.

- **Sun — "ask a question."** A single thoughtful question to your
  network. "What's the one self-reflection practice that actually
  stuck for you?" Low-lift, high-engagement, relationship-building.

Ritualize it so you don't have to think. Batch on Saturday, schedule
the week ahead.

### Themes to own

- **"I'm building a thing I'd use every day."** Not a startup pitch.
  A personal tool made public. People pattern-match this to indie
  legitimacy.
- **Creativity + mental health + AI** — the intersection where your
  artist background and your technical skill compose a unique voice.
- **The craft of shipping slowly + carefully** — unfashionable in the
  AI hype cycle. That's your edge.

### What to avoid

- **"Hot takes on AI."** Crowded, low signal.
- **"The future of work" posts.** Empty.
- **Re-posting other people's charts.** Dilutes your voice.

---

## 4. Career positioning — artist → AI creator specialist

The title "AI creator specialist" doesn't yet mean a single thing. You
can define what it means by what you ship.

### The case you want your LinkedIn to make

"**I'm an artist who ships AI-native tools.** My work is where human
reflection, sound, and code intersect. I've shipped (list). I think
carefully about (2-3 deep topics you own). I consult on (1 niche
offering)."

That last line is the unlock — pick **one** consulting offering that's
so specific it can't be handed off to someone else:

Options:
- "Helping wellness apps think through the ethics of emotional data."
- "Sound design for AI products — teaching LLMs to feel less sterile."
- "Building reflective tools with creative musicians."
- "Designing multi-modal interfaces for self-knowledge work."

Pick one. The others are essays, not offerings.

### The three-asset portfolio

Every potential client or employer will ask: what have you made? The
answer lives in three places:

1. **Colourmap itself** — your living proof of craft. `colourmap.app`
   or similar. The About page credits you and explains the project.
2. **One written long-form piece** — an essay on the intersection you
   own. ~2000 words. Hosted on colourmap.app/writing or Substack.
   Evidence of depth.
3. **One short video** — 2-3 minute screen recording walking through
   a feature and the thinking behind it. Evidence of clarity.

Don't chase 10 of each. One great artifact in each category > ten
mediocre ones.

### The audio / music angle

Because of your artist background, there's a specific shape of
consulting that's yours alone: **sound + interface + reflection**.
You understand why a shaman drum loop doesn't sound like a drum
when stretched. Product designers do not. This is a real edge.
Lean into it:
- Frame Calming Sounds as "the state I wanted to ship for myself."
- Offer short audits of other apps' sound design.
- Eventually: "Sound-first mental health tools" becomes a category
  you're known for.

### Practical next 30 days (career track)

1. LinkedIn headline: "Building Colourmap — a reflective tool for
   the AI era. Artist + builder."
2. Featured section on LinkedIn: pin the colourmap.app link + the
   first long-form piece once it's written.
3. Start the 4-post cadence immediately. Don't wait for polish.
4. Send a DM to 5 people/week in the intersecting spaces (wellness
   tech, indie hackers, sound design, music therapy). Not asking for
   anything — just sharing your build log and asking what they're
   making.
5. Apply for 2-3 niche communities: Indie Hackers, Mental Health
   Tech collective, Reforge if budget allows.

---

## 5. Sequencing — the single-question test

When you're unsure what to work on, ask: **"does this make the next
LinkedIn post easier to write?"** If yes, it's probably worth doing.
If no, it's probably research disguised as work.

The app, the content, and the career are one system. Ship something
every week that gives you content. Write something every week that
pulls people toward the app. The loop compounds.

---

## 6. What I can help with (this AI, this session)

- Keep shipping features in PRs with clear commit messages you can
  literally paste into a Mon build-log post.
- Write draft LinkedIn copy from recent commits on demand.
- Help write the long-form piece (the 2000-word essay) on a topic you
  pick.
- Help land the Supabase migration + Stripe + Capacitor when we get
  there.
- Maintain docs/specs/ as the living brain of the product so you can
  recruit or collaborate later without re-explaining everything.

Say which threads you want to pick up next.
