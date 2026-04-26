# Circles — A General-Purpose Small-Group Layer

> Martin (2026-04-26): "circles will be for everyone. music band just
> one of many users." The band is the **first real-world test** (see
> `circles-music-band-first-test.md`), not the canonical user.

Circles is a low-frequency awareness layer for any small group of
people you trust. The band is one shape; here are the others.

## Archetype users

| Archetype          | What "missions" mean                                | What they want from sync sessions     | What "money" tracks               | What they record (audio)          |
|--------------------|-----------------------------------------------------|----------------------------------------|------------------------------------|------------------------------------|
| **Couple**         | shared todos · errands · trip planning              | dinners · trips · big talks            | rent · groceries · trips           | voice memos · "what touched me"   |
| **Family**         | chores · school stuff · eldercare                    | birthdays · holidays · visits          | shared bills · gifts               | voicemails · grandparent stories  |
| **Roommates**      | who's cooking · who's cleaning · repairs             | house dinners · move-outs              | rent · utilities · groceries       | building noise complaints (lol)   |
| **Co-founders**    | features to ship · contracts · investor outreach    | weekly sync · investor pitches         | shared receipts · cap-table notes  | calls with users · pitch rehearsals |
| **Study group**    | reading assignments · drafts · revisions             | study sessions · exam prep             | textbooks · shared subscriptions   | lecture excerpts · reading notes  |
| **Sports team**    | training · gear · away-game logistics                | practices · matches · tournaments       | gear pool · travel costs           | coach feedback · highlight clips  |
| **Friendship circle** | who's organizing the trip · birthday plan        | trips · birthdays · weekly hangs       | shared trips · group gifts         | inside jokes · voice messages     |
| **Dharma / meditation circle** | who's leading next session · readings   | sits · retreats · talks                | retreat fees · teacher dana        | dharma talks · guided meditations |
| **Music band** *(first test)* | songs to finish · gigs to book           | rehearsals · mix nights · photoshoots  | gear · gigs · merch                | jam takes · mix references        |

## Why each existing tool generalizes

- **Missions** — "who owes what by when" is universal; it's a todo
  list that knows who's accountable.
- **Agenda** (14-day strip) — a plan-glance, calendar-light. Works
  identically for trips, deadlines, exams, gigs.
- **Sync sessions** (RSVP) — a private, friction-light way to say
  "we're meeting, are you in?" without a chat channel. Works for
  any small-group meeting.
- **Decisions** (proposed → decided → archived) — every group
  re-litigates the same questions until they write them down. The
  archive is the load-bearing piece, not the voting widget.
- **Money** — split-among-all is the default for couples,
  roommates, friend trips, dharma circles. Per-mission splits can
  come in v2 for bands and teams that need them.
- **Audio** — the *most* easily mis-framed as band-only. Voice
  memos for couples, grandparent stories for families, lecture
  clips for study groups, dharma talks for sangha — all live here.
- **Rainbow** — universal. Every group has emotional weather; the
  Hawkins band lets the circle see how each of us relates to fear,
  grief, courage, love over time.

## Copy rules going forward

When writing placeholders, helper text, empty states, marketing copy:

1. **Don't anchor on bands as the canonical example.** If a single
   example is needed, rotate: trip / project / band / family.
2. **Avoid music-domain verbs as default action labels.** "rehearsal"
   is fine inside a band's circle but not as the placeholder text
   that everyone sees on first paint.
3. **Write for the smallest group, not the loudest one.** Couples
   and pairs are the most frequent shape; design copy for two before
   you design it for six.
4. **Audio reflections beat "jam recordings."** The latter is
   musician-only. The former is universal.

## What this means for the existing spec

`circles-music-band-first-test.md` stays as-is — it's explicitly
the *test*. This doc is the parallel general-purpose framing,
referenced from `circle-evolution-tools.md`.

Future feature work on Circles should ask **"does this break for
a couple? for a roommate group? for a sangha?"** before shipping.
If the answer is yes, generalize first.
