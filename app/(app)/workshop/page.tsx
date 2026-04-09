'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   WORKSHOP — Visual tools + Reflections + Design Variations
   Three sections: Reflection, Visual Tools, Design Lab
   ═══════════════════════════════════════════════════════════ */

/* ─── SVG Helpers ─── */
function arcPath(cx: number, cy: number, iR: number, oR: number, sa: number, ea: number) {
  const g = 0.06;
  const s = sa + g;
  const e = ea - g;
  return `M ${cx + oR * Math.cos(s)} ${cy + oR * Math.sin(s)} A ${oR} ${oR} 0 0 1 ${cx + oR * Math.cos(e)} ${cy + oR * Math.sin(e)} L ${cx + iR * Math.cos(e)} ${cy + iR * Math.sin(e)} A ${iR} ${iR} 0 0 0 ${cx + iR * Math.cos(s)} ${cy + iR * Math.sin(s)} Z`;
}

/* ═══ SECTION 1: REFLECTIONS ═══ */
const REFLECTIONS = [
  {
    id: 'architecture',
    title: 'App Architecture',
    color: '#C4A060',
    content: `The app has four layers, each with a clear purpose:

**Day** — The daily ritual. Three tabs (Caring, Doing, Sharing), each with three boxes. Box 1 is input (what's happening). Box 2 is measurement (rate your dimensions). Box 3 is pattern recognition (see your shape). This is where 90% of daily interaction happens. It should take under 3 minutes.

**Journey** — The deep dives. Mandala Council, Echo Layers, Losange — tools you use weekly or when something feels off. Not daily. This is where you go when the compass shows a problem and you want to understand why.

**Notebook** — The private journal. Notes, music, rhymes. Creative overflow. No structure, no tracking. Just a page and a pen.

**Workshop** — The reflection space. Where you learn the tools, see alternatives, and think about your process. Meta-awareness. You're here now.

The key insight: most wellness apps try to put everything on one screen. We separate rhythm (Day) from depth (Journey) from expression (Notebook) from understanding (Workshop). Each has its own pace.`,
  },
  {
    id: 'user-journey',
    title: 'The User Journey',
    color: '#D4805A',
    content: `A new user should be able to check in within 30 seconds of opening the app. No tutorial. No setup wizard. Just: slide the emotion bar, see the compass, done.

**Day 1**: Slide the Hawkins bar. Maybe tap one FACING blob. Close the app.
**Week 1**: Start rating compass dimensions. Write in Challenge/Flow. Add a tracker or two.
**Month 1**: The depth boxes start showing patterns. You notice that Body is always low on Mondays. You see that "avoidance" appears in Challenge every week.
**Month 3**: You open the Mandala Council for the first time. You discover which archetypes keep showing up. You start the shadow-strength work.

The app reveals itself gradually. Nothing is hidden, but nothing demands attention. You discover depth by needing it, not by being told to use it.

**What makes users stay**: seeing their own patterns reflected back. Not advice. Not gamification. Just a mirror that gets clearer over time.

**What makes users leave**: too many features on day one. Guilt from missed days. Feeling like the app is judging them. We avoid all three.`,
  },
  {
    id: 'missions-doing',
    title: 'Missions & Doing — How to Develop',
    color: '#7A9A7A',
    content: `The Doing tab currently has: to-do pills, missions, trackers, STAR compass, Blocked/Moving, and the Life Wheel.

**What works**: the tracker day-dots are simple and satisfying. The pill format for to-do is clean. The compass gives a high-level pulse.

**What's missing**:
- **Mission depth**: a mission like "Launch the project" should break down into sub-steps. Tap a mission pill → see its children. Each child is a smaller pill. Progress = children completed / total.
- **Daily intention**: one sentence at the top of the Doing tab — "Today I focus on ___." This anchors the day. It's not a to-do. It's a compass heading.
- **Weekly review**: every Sunday, the Life Wheel shows two overlapping shapes (this week vs last week). One question: "What will you do differently?"
- **Done archive**: completed to-dos and missions shouldn't disappear. They should move to a gentle "done" section (collapsed by default) so you can see how much you've accomplished.

**Design direction**: the Doing tab should feel like a captain's desk — precise, organised, warm wood tones. The to-do pills are like stamps in a logbook. Missions are like routes on a map. Trackers are like the ship's instruments.`,
  },
  {
    id: 'typography',
    title: 'Typography & Coherence',
    color: '#6B4830',
    content: `Five fonts are loaded. Each has a role:

**Playfair Display** (--font-serif): Titles, section headers, tab labels. Elegant, grounding. This is the voice of the app. It says: "This is considered. This is intentional."

**Caveat** (--font-handwritten): Compass labels, blob letters, journal entries, input placeholders. Warm, personal. This is the user's voice. It says: "This is yours. This is intimate."

**Courier Prime** (--font-cowboy): Alternative style. Typewriter feel. For users who want structure and precision. It says: "This is a logbook. Every entry counts."

**Righteous** (--font-groovy): Alternative style. Bold, expressive. For users who want energy and colour. It says: "This is alive. This celebrates you."

**Kalam** (--font-sketch): Alternative style. Hand-drawn. For users who want rawness and authenticity. It says: "This is a sketchbook. Nothing is polished."

**The coherence rule**: within one screen, use maximum 2 fonts. Serif for structure (titles, labels), handwritten for soul (inputs, entries, prompts). The design toggle switches the *pair*, not individual elements.

**What needs fixing**: some labels still use system fonts. All interactive text should use one of the five loaded fonts. No Tailwind defaults leaking through.`,
  },
  {
    id: 'aesthetics',
    title: 'Aesthetics & Visual Language',
    color: '#9B6BA0',
    content: `The visual identity rests on three materials:

**Paper**: every card is parchment. Warm gradients from cream to tan. The deeper you go (Box 1 → 2 → 3), the deeper the paper tone. Like layers of a journal — the first page is bright, the last is aged.

**Ink**: text is brown, not black. Dark brown (#5C3018) for titles. Warm brown (#8A6A4A) for body text. Muted brown (#C4A060) for accents. Black is too harsh. Grey is too cold. Brown is earth.

**Geometry**: circles for compasses, organic shapes for FACING blobs, petals for mandalas, stars for constellations. No sharp rectangles. No grid layouts. Everything should feel like it grew, not like it was manufactured.

**The warmth principle**: when in doubt, make it warmer. A colder colour should always be balanced by a warmer neighbour. The app should feel like holding a warm cup — not like staring at a screen.

**What's not working yet**: some borders are too faint (invisible in light mode). The Hawkins slider blocks could be warmer — they feel like a clinical scale, not an emotional instrument. The writing column inputs are too thin — they should feel like ruled notebook lines, not form fields.`,
  },
  {
    id: 'what-users-need',
    title: 'What Users Actually Need',
    color: '#C87050',
    content: `From research on wellness app usage:

**Why users leave**: 1) Too much to set up. 2) Guilt from missed days. 3) Generic advice that doesn't feel personal. 4) No visible progress. 5) The app feels like homework.

**Why users stay**: 1) It shows them something true about themselves. 2) It takes under 2 minutes. 3) It doesn't punish absence. 4) It gets more useful over time. 5) It feels warm, not clinical.

**What Colourmap does differently**:
- No setup required. First check-in is one slider.
- No streaks. No red warnings for missed days.
- The compass shows YOUR shape, not a comparison to others.
- Depth reveals itself gradually (Box 1 → 2 → 3 → Journey → Workshop).
- The aesthetic says "journal" not "dashboard."

**What V2 has that CPC doesn't**:
- Real authentication (Supabase)
- Backend persistence (data survives cache clears)
- AI coaching and reflection (Claude integration)
- Martin's guardrails (safe, tested, production-ready)
- Professional font system (7 loaded fonts with CSS vars)
- Proper routing and navigation

**What CPC has that V2 needs**:
- 8 compass design shapes (ring, pizza, rose, split, parchment, losange, triangle, classic)
- Mandala Council with 102 archetypes
- Echo Workshop with 5 depth variants
- Compass Workshop (Hybrid Rose, Mandala, Wheel, Losange)
- Flower Workshop (sacred geometry 3-8 petals)
- FACING + PEACE + STAR tracker systems
- Challenge/Flow + Blocked/Moving + Distant/Connected writing columns
- Cat that responds to emotion colour

These are being ported via the feature branches.`,
  },
  {
    id: 'cpc-visual-tools',
    title: 'CPC Visual Tools — What We Built & What Carries Over',
    color: '#D06080',
    content: `The CPC prototype is a treasure chest of visual ideas. Some are essential. Some are experiments. Here's what matters:

**The Compass Family** — 8 compass forms were built: ring, pizza, rose, split, parchment, losange, triangle, classic. The ring won. It's the clearest on mobile. Pizza is second — it feels more playful. The losange and triangle are experimental and beautiful but harder to read on small screens. Rose is the most elegant but demands space.

**Echo Workshop** — 5 concentric-ring depth readers. The Emotional Core (pain → behaviour → social face), Decision Depth (fear → desire → values → logic → intuition), Relationship Echo (need → wound → pattern → truth → love), Energy Scan (vital → emotional → mental → social → creative → spiritual), Growth Rings (childhood → adolescence → adult → now → becoming). These are the deepest tools in the app. They deserve a permanent home on the Journey page.

**Flower Workshop** — Sacred geometry from 3 to 8 petals. Trinity (mind/body/spirit), Compass Rose (cardinal), Star Flower (golden ratio), Hex Bloom (FACING framework), Chakra Lotus (7 chakras), Full Mandala (8 petals). The 6-petal variant maps perfectly to FACING. The 4-petal maps to CARE/STAR/SHARE.

**Mandala Council** — 102 archetypes across 8 families: Warriors, Nurturers, Children, Creators, Thinkers, Lovers, Wanderers, Shadows. Each family has its own colour. This is the most ambitious CPC tool and the one users are most curious about. It needs its own dedicated page.

**SoulTerrain** — A 2D canvas where you place emotional dots on a positive/negative × external/internal grid. 6 categories, organic cell shapes, drag-and-drop. This is the most experimental tool. It works beautifully on desktop but struggles on mobile.

**MissionMap** — Visual mission positioning on a canvas with draggable dots and sub-mission nesting. A spatial alternative to the pill-based mission list. Beautiful concept, but the pill format in V2 is more practical for daily use.

**What carries over to V2**: Ring compass (done), Echo layers (Journey page), Mandala (Journey page), Flower (Workshop visual), 4-petal sacred geometry for depth boxes. What stays CPC-only for now: SoulTerrain (desktop), MissionMap (too experimental), classic nautical compasses (aesthetic exercise).`,
  },
  {
    id: 'mandala-design',
    title: 'Mandala Variations — Sacred Geometry as Interface',
    color: '#9B6BA0',
    content: `The mandala isn't decoration — it's a user interface pattern. Each petal is a dimension. The center is you. The geometry enforces balance.

**3-Petal Trinity** — Mind, Body, Spirit. The simplest form. Use it when three things need equal attention. The shape says: "These are not separate. They overlap." In the app, this maps to: Caring / Doing / Sharing. Three tabs. Three doors. One mandala.

**4-Petal Cross** — CARE (Care, Attitude, Rest, Emotions) or STAR (Structure, Target, Action, Resources). The compass form. North-South-East-West creates orientation. Every compass in the app uses this geometry. The ring compass is a flattened 4-petal mandala.

**6-Petal Hex** — FACING (Fear, Avoidance, Confusion, Intention, Needs, Gratitude) or PEACE (Pause, Express, Accept, Calm, Emerge). Six blobs in a hexagonal pattern. This is why the FACING blobs work — hexagonal tiling is the most efficient space-filling geometry. It feels complete without feeling crowded.

**8-Petal Full** — The Mandala Council's 8 archetype families. Warrior, Nurturer, Child, Creator, Thinker, Lover, Wanderer, Shadow. This is the mandala at its richest. Each petal can hold an entire program. 8 × 3 = 24 sub-programs. A year's worth of self-work in one flower.

**Design variations to explore**:
- **Layered petals**: Each petal has 3 layers (surface, middle, core) like the Echo rings. Tap to peel.
- **Bloom animation**: Petals grow from bud to full flower as you complete programs.
- **Seasonal colours**: Spring (greens/yellows), Summer (warm oranges), Autumn (browns/reds), Winter (cool blues). The mandala changes with the season.
- **Glass morphism mandala**: Frosted glass petals over a warm gradient background. Modern, warm, distinct.
- **Ink mandala**: Black line art on parchment. The most journal-like variant. Fill petals with colour as you engage.

The mandala is the meta-tool. It contains all the compasses, all the frameworks, all the depth. If the app had only one visual element, it should be this.`,
  },
  {
    id: 'app-usefulness',
    title: 'Is the App Useful? — Honest Assessment',
    color: '#C87050',
    content: `Let's be honest about what works and what doesn't. A beautiful app that nobody uses is a failure. A useful app that looks ugly won't be opened twice.

**What's genuinely useful right now**:
- The Hawkins slider gives a fast emotional snapshot. Under 3 seconds. That alone justifies opening the app.
- The compass dimensions (CARE/STAR/SHARE) create a vocabulary for self-reflection. Users start thinking in terms of "my Rest is low" or "my Authenticity needs work."
- The tracker day-dots show weekly patterns at a glance. Simple, satisfying, proven.
- The to-do pills work. They're not revolutionary, but they're warm and they persist.
- The three-tab structure (Caring/Doing/Sharing) is intuitive. It covers the whole person.

**What's not useful yet**:
- The depth boxes (Box 3) are interesting but don't connect to action. Seeing a shape is nice. But "your Life Wheel is lopsided" needs to lead to "here's what you could try."
- The writing columns (Challenge/Flow, Blocked/Moving) are open-ended. Some users need prompts. "What challenged you?" is too vague. Try: "Name one thing you avoided today and why."
- The Workshop reflections are for developers, not users. A real user won't read "App Architecture." They need "How to get the most from this app in 5 minutes."
- FACING and PEACE are powerful frameworks but they're not explained anywhere in the app. A new user sees 6 blobs and doesn't know what they mean.

**What could make this 10x more useful**:
- **Nudges, not notifications**: "You haven't checked your Rest in 3 days. Tap to rate it." Not a push notification. A gentle note when you open the app.
- **Weekly summary**: Every Sunday, one screen: your average Hawkins score, your compass shape, your tracker completion, your top emotion. "This week you were mostly Calm, your Body was low, you completed 4/7 days of reading."
- **Pattern recognition**: After 2 weeks, the app notices: "You tend to feel lower on Mondays" or "Your creativity score rises after exercise days." This is the killer feature.
- **Guided first week**: Not a tutorial. Seven daily prompts that introduce one feature each. Day 1: slide the bar. Day 2: rate one compass dimension. Day 3: add a tracker. Day 4: name a challenge. Day 5: add a person to your constellation. Day 6: try the depth box. Day 7: read your week.

**The core question**: Does this app help someone understand themselves better? Right now: maybe, if they explore deeply enough. The goal: definitely, from the first check-in.`,
  },
  {
    id: 'segment-questions',
    title: 'Deep Questions — One Per Segment',
    color: '#6890B0',
    content: `Every segment of the app should answer a core question. If it can't answer clearly, it's either missing something or shouldn't exist.

**CARING — "How am I feeling, and what does that feeling need?"**
- Does the Hawkins slider capture enough nuance? (Yes for speed, no for depth — that's why FACING exists.)
- Should the cat react to more than just colour? What if it showed fatigue, tension, calm? (Possible but risky — anthropomorphising emotions can feel patronising.)
- Is the Mirror (Inner Weather) the right Box 3 tool? Does tracking emotional weather help more than tracking shadow/strength patterns? (Weather is more intuitive. Shadows are deeper. Both have value.)
- Can the CARE compass dimensions be rated without feeling like a survey? (The ring makes it feel like tuning an instrument, not filling a form.)
- What happens to FACING data over time? Can we show "you've had more Gratitude this month than last"?

**DOING — "What am I actually doing with my time and energy?"**
- Is the to-do pill format better than a traditional checklist? (For mobile: yes. For power users: maybe not.)
- Should missions have deadlines? (Probably not — deadlines create anxiety, which is the opposite of what this app offers.)
- The Life Wheel is good at showing imbalance. But does it help fix it? (Not yet. It needs to suggest: "Sport is at 2/8. Could you walk for 10 minutes today?")
- Are trackers engaging enough? Day-dots are simple but they don't explain why a day was missed.
- Should the Doing tab show time-of-day context? Morning vs evening check-ins might want different prompts.

**SHARING — "Who matters to me, and am I showing up for them?"**
- Is closeness rating (1-5) enough? What about quality of connection? (Closeness is simple. Adding "when did you last talk?" and "how did it go?" would add depth.)
- The Constellation is beautiful but passive. What if it suggested: "You haven't rated Jo in 2 weeks. Reach out?"
- Should the SHARE compass (Share/Authentic/Roots/Express) connect to specific people? "I'm authentic with Alex but not with Sam."
- Is gratitude only a Caring thing? Gratitude for people is deeply Sharing.
- What about groups, not just individuals? Family, team, friends as clusters, not just individual stars.

**WORKSHOP — "Do I understand my own tools?"**
- Are the reflections too developer-focused? (Yes. They need a user-facing version.)
- Should the Workshop show the user's own data as examples? "Here's YOUR compass shape" instead of demo data.
- Is the Design Lab useful for non-designers? (Questionable. But it shows that the app is crafted, not generic.)
- Could the Workshop have "lessons"? Short guided exercises using each tool.

**JOURNEY — "Where have I been and where am I going?"**
- When does a user need Journey vs Day? (Day is daily ritual. Journey is for when you feel stuck, curious, or want to go deeper.)
- Should the Mandala Council be intimidating? 102 archetypes is a lot. Maybe start with 8 families and reveal individuals gradually.
- The Echo layers are powerful but complex. Users need an onboarding. "Start with the Emotional Core. Tap each ring from outside in."
- How does Journey data connect to Day data? If you discover a "Warrior" archetype in the Mandala, does that show up in your daily compass somehow?`,
  },
  {
    id: 'whats-next',
    title: "What's Next — Development Roadmap",
    color: '#7A9A7A',
    content: `Five phases. Each one makes the app more useful. None should be skipped.

**Phase 1 — Polish What Exists** (Now)
- Ensure every text element uses an explicit font from the 5 loaded fonts
- Make all interactive elements respond with colour and animation
- Fix the depth boxes: Inner Weather needs testing, Life Wheel needs action suggestions, Constellation needs reach-out prompts
- Typography pass: title hierarchy, weight consistency, size scale
- Every pill should expand and collapse smoothly
- The cat should feel alive but not distracting

**Phase 2 — Connect the Dots** (Next Week)
- Weekly summary screen: one view that combines all three tabs' data
- Pattern recognition: track trends over 7 days and surface insights
- Cross-tab connections: if Rest is low (Caring) and Sport is low (Doing) and you haven't reached out to anyone (Sharing), the app should notice
- Link FACING/PEACE progress to the CARE compass scores
- Mission sub-steps: tap a mission → see and check off children

**Phase 3 — Journey Page** (Week After)
- Port Mandala Council from CPC (8 families, simplified archetype selection)
- Port Echo Workshop (5 depth variants with guided onboarding)
- Add Flower/Petal meditation exercise (tap petals in sequence, breathe)
- Compass comparison: overlay this week's shape on last week's
- Losange emotion loop reader for deeper self-enquiry

**Phase 4 — Intelligence** (Month 2)
- AI coaching integration: after a check-in, offer a one-paragraph reflection
- "The coach notices" — gentle pattern insights based on 2+ weeks of data
- Guided first-week experience (7 daily micro-tutorials)
- Nudge system: context-aware prompts when you open the app
- Export: weekly PDF summary with your compass shapes and key metrics

**Phase 5 — Community & Sharing** (Month 3)
- Anonymous aggregate: "60% of users also feel lower on Mondays"
- Shared constellations: two users can see each other in their star maps
- Template sharing: export your mandala layout, compass design, or tracker set
- Facilitator mode: therapists/coaches can see anonymised patterns from their clients
- Public workshop contributions: community-written reflections and guided exercises

**The north star**: an app that knows you better than you know yourself — not because it's intrusive, but because it's patient, warm, and always watching for patterns you can't see alone.`,
  },
  {
    id: 'emotional-design',
    title: 'Emotional Design — Why Warmth Matters',
    color: '#D4805A',
    content: `Most wellness apps fail because they feel clinical. They use blue and white. They count things. They show graphs. They feel like a doctor's office, not a journal.

**Colourmap's emotional signature**:
- **Paper, not screens**: Every surface is parchment. Cream to tan gradients. The deeper you go, the more aged the paper feels. This communicates depth without saying it.
- **Ink, not pixels**: Brown text instead of black. Gold accents instead of blue. The colour palette comes from natural materials — leather, sand, honey, earth, olive, terracotta.
- **Handwriting, not type**: Caveat for personal entries. It looks like your own notes. Combined with Playfair for structure, it creates the feeling of a beautifully bound journal with your messy thoughts inside.
- **Circles, not rectangles**: The compass, the mandala, the constellation, the echo rings, the life wheel — everything is circular. Circles feel organic. Rectangles feel manufactured. Rounded corners on cards bridge the gap.
- **Glow, not shadow**: Active elements glow softly from behind, like warm light through paper. Drop shadows are used sparingly and softly. The effect is "lit from within" not "floating above."

**What this means practically**:
- Never use pure white (#fff) as a background. Always warm it.
- Never use pure black (#000) for text. Always brown or charcoal.
- Animation should be slow and smooth (300-700ms). Nothing should snap or bounce.
- Sound, if ever added, should be organic: soft chimes, not digital bleeps.
- Empty states should feel welcoming, not empty. "Tap a weather to name what you're feeling" is better than "No entries yet."

**The competition's mistake**: Headspace is too cute. Calm is too passive. Daylio is too clinical. Reflectly is too AI-forward. Finch is too gamified. Colourmap occupies a unique space: **adult, warm, beautiful, and deeply personal**. It's a tool for people who think, not people who want to be told what to think.

**The danger**: being so beautiful that it's intimidating. The warmth must invite, not impress. A first-time user should feel "I can write here" not "this is too nice for my messy thoughts." The handwriting font is the antidote — it says "imperfection is welcome."`,
  },
  {
    id: 'data-stories',
    title: 'Data Stories — What Your Numbers Mean',
    color: '#8A6A4A',
    content: `Raw numbers are noise. Patterns are signal. Stories are meaning. The app should move users from numbers → patterns → stories.

**Example data story — Caring**:
Your Hawkins average this week was 310 (Willingness). That's up from 280 (Courage) last week. You checked in 5 out of 7 days. Your dominant inner weather was "breeze" (Calm, Hope). Your CARE compass shows Rest at 3/8 — the lowest dimension for the third week in a row.

*The story*: "You're feeling more willing and open this week. That's real progress. But your Rest keeps scoring low. Your body is carrying what your mind has resolved. What would rest look like today — not tomorrow, today?"

**Example data story — Doing**:
Your Life Wheel shows Work at 7/8 and Creative at 2/8. Your trackers show 7/7 for "Morning routine" but 1/7 for "Draw." You completed 3 missions, added 4 new ones, and archived 2 to-dos.

*The story*: "You're productive but lopsided. Work dominates. Creativity is starving. You added more missions than you finished — ambition is high, but is it sustainable? Your morning routine is flawless — can you attach 10 minutes of drawing to it?"

**Example data story — Sharing**:
Your Constellation has 6 stars. Average closeness is 3.2 (friend level). Two stars haven't been rated in 2 weeks (Alex, Jo). Your SHARE compass shows Authenticity at 6/8 and Roots at 2/8.

*The story*: "You're authentic with people, but your roots feel thin. Two people are drifting from your constellation — not because they don't matter, but because life gets busy. A single message could pull them back. Your Roots score says: you might be giving more than receiving. Who fills YOUR cup?"

**How to build this**:
1. Collect 7 days of data minimum before generating stories
2. Compare this week to last week for trend direction
3. Find the lowest and highest dimension across all three tabs
4. Cross-reference: does a low Caring dimension correlate with a low Doing tracker?
5. Write the story in second person, present tense, with one specific suggestion
6. Never be judgmental. Always be curious. End with a question, not an instruction.`,
  },
  {
    id: 'design-evolution',
    title: 'Design Evolution — Where Each Tool Came From',
    color: '#6B4830',
    content: `Every visual tool in Colourmap has an origin story. Understanding where they came from helps decide where they should go.

**The Compass** — Born from the Wheel of Life coaching tool (1960s, Paul J. Meyer). Adapted into a 4-quadrant ring for mobile. The ring form came from trying pizza slices and finding them too playful for daily use. The ring says "instrument" — the pizza says "game." We chose instrument.

**The Mandala** — Carl Jung used mandala drawing as a therapeutic tool. Our 8-family archetype system borrows from Jungian archetypes, IFS (Internal Family Systems), and voice dialogue therapy. The visual form — petals from a center — is pure sacred geometry. It's the oldest shape humans have used for self-reflection.

**The Echo Rings** — Inspired by tree rings (dendrochronology). Each ring is a layer of the self: the outermost is how you present, the innermost is your core truth. Tapping a ring "peels" it, like the Johari Window exercise but visual and personal. The 5 variants came from asking: "What else has layers?" — emotions, decisions, relationships, energy, life phases.

**The Constellation** — Bert Hellinger's Family Constellations therapy, simplified. Instead of role-playing with other people, you place them as stars and rate your connection. Closeness determines orbit distance. Brightness shows engagement. It's a relational map — not a social graph.

**The Life Wheel** — A radar/spider chart from data visualisation, given warmth. In corporate tools, this chart shows KPIs. Here, it shows life balance. The spokes are chosen by the user — not prescribed. That's the key difference. You define what matters.

**The Inner Weather** — Newest tool. Metaphorical approach to mood tracking. Instead of "rate your anxiety 1-10," you ask "is it a storm or a breeze?" Weather is universal, non-judgmental, and inherently temporary. A storm passes. That's the therapeutic insight built into the metaphor.

**The Hawkins Slider** — David R. Hawkins' Map of Consciousness (from "Power vs. Force"). A controversial but useful spectrum from Shame (20) to Enlightenment (700+). We simplified it to 10 levels with clear emotional labels. The slider makes it embodied: you feel where you are by where your thumb lands.

**What connects them all**: Every tool is a mirror, not an advisor. It shows you YOUR shape, YOUR weather, YOUR constellation. The app never says "you should feel differently." It says "here's what you feel — and here's how it connects to yesterday."`,
  },
];

/* ═══ SECTION 2: VISUAL TOOLS ═══ */
function CompassDemo() {
  const [active, setActive] = useState<number | null>(null);
  const slices = [
    { label: 'Care', color: '#D4805A', value: 0.7 },
    { label: 'Attitude', color: '#C4A070', value: 0.5 },
    { label: 'Rest', color: '#6890B0', value: 0.6 },
    { label: 'Emotions', color: '#88A858', value: 0.4 },
  ];
  const angles = [Math.PI, -Math.PI / 2, 0, Math.PI / 2];
  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      <circle cx={cx} cy={cy} r={78} fill="none" stroke="#ddb97f" strokeWidth="0.6" opacity={0.2} />
      <circle
        cx={cx}
        cy={cy}
        r={34}
        fill="none"
        stroke="#ddb97f"
        strokeWidth="0.4"
        opacity={0.12}
      />
      {slices.map((s, i) => (
        <path
          key={s.label}
          d={arcPath(cx, cy, 34, 78, angles[i] - Math.PI / 4, angles[i] + Math.PI / 4)}
          fill={s.color}
          opacity={active === i ? 0.8 : 0.15 + s.value * 0.4}
          className="cursor-pointer transition-all duration-300"
          style={{ filter: active === i ? `drop-shadow(0 0 6px ${s.color}60)` : undefined }}
          onClick={() => setActive(active === i ? null : i)}
        />
      ))}
      {slices.map((s, i) => (
        <text
          key={`l-${s.label}`}
          x={cx + 56 * Math.cos(angles[i])}
          y={cy + 56 * Math.sin(angles[i])}
          textAnchor="middle"
          dominantBaseline="middle"
          className="cursor-pointer select-none"
          style={{
            fontSize: '12px',
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fill: active === i ? s.color : '#8f6a47',
          }}
          onClick={() => setActive(active === i ? null : i)}
        >
          {s.label}
        </text>
      ))}
      <circle cx={cx} cy={cy} r={16} fill="#C4A060" opacity={0.08} />
    </svg>
  );
}

function MandalaDemo() {
  const [active, setActive] = useState<number | null>(null);
  const petals = [
    '#D44040',
    '#E8A030',
    '#70C040',
    '#3A8AC4',
    '#9B6BA0',
    '#C4A070',
    '#6B8F4E',
    '#D06080',
  ];
  const names = ['Warrior', 'Child', 'Healer', 'Thinker', 'Shadow', 'Anchor', 'Seeker', 'Lover'];
  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      <circle cx={cx} cy={cy} r={90} fill="none" stroke="#C4B890" strokeWidth="0.3" opacity={0.1} />
      {petals.map((c, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const tipR = active === i ? 82 : 72;
        const pa = a + Math.PI / 2;
        const sp = active === i ? 18 : 14;
        const c1x = cx + 20 * Math.cos(a) + sp * Math.cos(pa);
        const c1y = cy + 20 * Math.sin(a) + sp * Math.sin(pa);
        const c2x = cx + 20 * Math.cos(a) - sp * Math.cos(pa);
        const c2y = cy + 20 * Math.sin(a) - sp * Math.sin(pa);
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} Q ${c1x} ${c1y} ${cx + tipR * Math.cos(a)} ${cy + tipR * Math.sin(a)} Q ${c2x} ${c2y} ${cx} ${cy} Z`}
            fill={c}
            opacity={active === i ? 0.7 : 0.3}
            className="cursor-pointer transition-all duration-500"
            style={{ filter: active === i ? `drop-shadow(0 0 8px ${c}50)` : undefined }}
            onClick={() => setActive(active === i ? null : i)}
          />
        );
      })}
      {names.map((n, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const r = 52;
        return (
          <text
            key={n}
            x={cx + r * Math.cos(a)}
            y={cy + r * Math.sin(a)}
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${(a * 180) / Math.PI + 90}, ${cx + r * Math.cos(a)}, ${cy + r * Math.sin(a)})`}
            style={{
              fontSize: '7px',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 600,
              fill: active === i ? '#fff' : petals[i],
            }}
            className="cursor-pointer select-none"
            onClick={() => setActive(active === i ? null : i)}
          >
            {n}
          </text>
        );
      })}
      <circle cx={cx} cy={cy} r={12} fill="#C4B890" opacity={0.08} />
    </svg>
  );
}

function EchoDemo() {
  const [active, setActive] = useState<number | null>(null);
  const rings = [
    { label: 'Social Face', color: '#70C040' },
    { label: 'Behaviour', color: '#C4A070' },
    { label: 'Story', color: '#E8A030' },
    { label: 'Defence', color: '#E87040' },
    { label: 'Core', color: '#D44040' },
  ];
  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;
  const maxR = 90;
  const rw = maxR / 5.5;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      {[...rings].reverse().map((ring, ri) => {
        const i = rings.length - 1 - ri;
        const oR = maxR - ri * rw;
        const iR = Math.max(0, oR - rw + 2);
        const isAct = active === i;
        const dist = active !== null ? Math.abs(active - i) : 99;
        return (
          <g key={i} className="cursor-pointer" onClick={() => setActive(active === i ? null : i)}>
            <circle
              cx={cx}
              cy={cy}
              r={oR}
              fill={ring.color}
              opacity={isAct ? 0.6 : dist === 1 ? 0.25 : 0.12}
              className="transition-all duration-500"
              style={{ filter: isAct ? `drop-shadow(0 0 10px ${ring.color}50)` : undefined }}
            />
            {iR > 4 && (
              <circle cx={cx} cy={cy} r={iR} fill="hsl(var(--background))" opacity={0.85} />
            )}
            <text
              x={cx}
              y={cy - oR + rw * 0.55}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: isAct ? '10px' : '8px',
                fontFamily: 'var(--font-handwritten)',
                fontWeight: isAct ? 700 : 500,
                fill: isAct ? '#fff' : ring.color,
              }}
            >
              {ring.label}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={5} fill="#D44040" opacity={0.3} />
    </svg>
  );
}

function WheelDemo() {
  const aspects = [
    { name: 'Sleep', value: 6 },
    { name: 'Sport', value: 4 },
    { name: 'Reading', value: 2 },
    { name: 'Work', value: 7 },
    { name: 'Partner', value: 5 },
    { name: 'Music', value: 3 },
  ];
  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;
  const maxR = 80;
  const pts = aspects.map((a, i) => {
    const angle = (i / aspects.length) * Math.PI * 2 - Math.PI / 2;
    const r = maxR * (a.value / 8);
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
      lx: cx + (maxR + 14) * Math.cos(angle),
      ly: cy + (maxR + 14) * Math.sin(angle),
      name: a.name,
      angle,
    };
  });
  const dataPath = `${pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} Z`;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      {[0.25, 0.5, 0.75, 1].map((r) => (
        <circle
          key={r}
          cx={cx}
          cy={cy}
          r={maxR * r}
          fill="none"
          stroke="#C4B890"
          strokeWidth="0.4"
          opacity={0.1}
        />
      ))}
      {pts.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={cx + maxR * Math.cos(p.angle)}
          y2={cy + maxR * Math.sin(p.angle)}
          stroke="#C4B890"
          strokeWidth="0.3"
          opacity={0.15}
        />
      ))}
      <path
        d={dataPath}
        fill="#7A9A7A"
        opacity={0.15}
        stroke="#7A9A7A"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {pts.map((p) => (
        <g key={p.name}>
          <circle cx={p.x} cy={p.y} r={3} fill="#7A9A7A" opacity={0.7} />
          <text
            x={p.lx}
            y={p.ly}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{
              fontSize: '8px',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 600,
              fill: '#7A9A7A',
            }}
          >
            {p.name}
          </text>
        </g>
      ))}
    </svg>
  );
}

function WeatherDemo() {
  const weathers = [
    { emoji: '⛈', color: '#8B5E3C', label: 'storm', x: 40, y: 55, r: 24 },
    { emoji: '🌧', color: '#6890B0', label: 'rain', x: 80, y: 75, r: 18 },
    { emoji: '🌫', color: '#9A8A70', label: 'fog', x: 100, y: 50, r: 20 },
    { emoji: '🍃', color: '#7A9A7A', label: 'breeze', x: 130, y: 70, r: 22 },
    { emoji: '☀', color: '#C4A060', label: 'sun', x: 160, y: 45, r: 28 },
  ];
  const sz = 200;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      <defs>
        <linearGradient id="w-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6890B0" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#C4A060" stopOpacity="0.05" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={sz} height={sz} rx="20" fill="url(#w-sky)" />
      <line x1="20" y1="130" x2="180" y2="130" stroke="#C4B890" strokeWidth="0.5" opacity="0.15" />
      {weathers.map((w) => (
        <g key={w.label}>
          <circle cx={w.x} cy={w.y} r={w.r + 6} fill={w.color} opacity="0.06" />
          <circle cx={w.x} cy={w.y} r={w.r} fill={w.color} opacity="0.12" />
          <text
            x={w.x}
            y={w.y + 2}
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: `${w.r * 0.7}px` }}
          >
            {w.emoji}
          </text>
          <text
            x={w.x}
            y={w.y + w.r + 12}
            textAnchor="middle"
            style={{
              fontSize: '8px',
              fontFamily: 'var(--font-handwritten)',
              fontWeight: 600,
              fill: w.color,
              opacity: 0.6,
            }}
          >
            {w.label}
          </text>
        </g>
      ))}
      <text
        x={100}
        y={165}
        textAnchor="middle"
        style={{
          fontSize: '14px',
          fontFamily: 'var(--font-handwritten)',
          fontWeight: 700,
          fill: '#B8905A',
          opacity: 0.35,
        }}
      >
        62
      </text>
      <text
        x={100}
        y={178}
        textAnchor="middle"
        style={{
          fontSize: '7px',
          fontFamily: 'var(--font-handwritten)',
          fill: '#B8905A',
          opacity: 0.2,
        }}
      >
        warmth
      </text>
    </svg>
  );
}

function FlowerDemo() {
  const [activePetal, setActivePetal] = useState<number | null>(null);
  const petalColors = ['#D4805A', '#C4A060', '#7A9A7A', '#6890B0', '#9B6BA0', '#C87050'];
  const labels = ['Care', 'Attitude', 'Rest', 'Emotions', 'Growth', 'Balance'];
  const sz = 220;
  const cx = sz / 2;
  const cy = sz / 2;
  const n = 6;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      {petalColors.map((c, i) => {
        const a = (i / n) * Math.PI * 2 - Math.PI / 2;
        const tipR = activePetal === i ? 72 : 60;
        const pa = a + Math.PI / 2;
        const sp = activePetal === i ? 18 : 14;
        const c1x = cx + 20 * Math.cos(a) + sp * Math.cos(pa);
        const c1y = cy + 20 * Math.sin(a) + sp * Math.sin(pa);
        const c2x = cx + 20 * Math.cos(a) - sp * Math.cos(pa);
        const c2y = cy + 20 * Math.sin(a) - sp * Math.sin(pa);
        const isActive = activePetal === i;
        const labelR = tipR + 16;
        return (
          <g key={i}>
            <path
              d={`M ${cx} ${cy} Q ${c1x} ${c1y} ${cx + tipR * Math.cos(a)} ${cy + tipR * Math.sin(a)} Q ${c2x} ${c2y} ${cx} ${cy} Z`}
              fill={c}
              opacity={isActive ? 0.6 : 0.25}
              className="cursor-pointer transition-all duration-500"
              style={{ filter: isActive ? `drop-shadow(0 0 8px ${c}40)` : undefined }}
              onClick={() => setActivePetal(isActive ? null : i)}
            />
            {/* Label OUTSIDE the petal tip */}
            <text
              x={cx + labelR * Math.cos(a)}
              y={cy + labelR * Math.sin(a)}
              textAnchor="middle"
              dominantBaseline="middle"
              style={{
                fontSize: isActive ? '11px' : '9px',
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fill: c,
                opacity: isActive ? 1 : 0.6,
              }}
              className="cursor-pointer select-none"
              onClick={() => setActivePetal(isActive ? null : i)}
            >
              {labels[i]}
            </text>
            {/* Small dot at petal tip connecting label to petal */}
            <circle
              cx={cx + (tipR + 2) * Math.cos(a)}
              cy={cy + (tipR + 2) * Math.sin(a)}
              r={isActive ? 3 : 2}
              fill={c}
              opacity={isActive ? 0.7 : 0.3}
            />
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={10} fill="#C4A060" opacity="0.1" />
    </svg>
  );
}

function LosangeDemo() {
  const [activeQ, setActiveQ] = useState<number | null>(null);
  const quads = [
    { label: 'Feel', color: '#D4805A', angle: -Math.PI / 2 },
    { label: 'Think', color: '#6890B0', angle: 0 },
    { label: 'Act', color: '#7A9A7A', angle: Math.PI / 2 },
    { label: 'Rest', color: '#9B6BA0', angle: Math.PI },
  ];
  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;
  const r = 70;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      {quads.map((q, i) => {
        const next = quads[(i + 1) % 4];
        const x1 = cx + r * Math.cos(q.angle);
        const y1 = cy + r * Math.sin(q.angle);
        const x2 = cx + r * Math.cos(next.angle);
        const y2 = cy + r * Math.sin(next.angle);
        const isAct = activeQ === i;
        return (
          <g key={q.label} className="cursor-pointer" onClick={() => setActiveQ(isAct ? null : i)}>
            <path
              d={`M ${cx} ${cy} L ${x1} ${y1} L ${x2} ${y2} Z`}
              fill={q.color}
              opacity={isAct ? 0.5 : 0.15}
              className="transition-all duration-300"
              style={{ filter: isAct ? `drop-shadow(0 0 6px ${q.color}40)` : undefined }}
            />
          </g>
        );
      })}
      {quads.map((q) => (
        <text
          key={`l-${q.label}`}
          x={cx + r * 0.5 * Math.cos(q.angle)}
          y={cy + r * 0.5 * Math.sin(q.angle)}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{
            fontSize: '10px',
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fill: q.color,
          }}
        >
          {q.label}
        </text>
      ))}
      <circle cx={cx} cy={cy} r={8} fill="#C4A060" opacity="0.08" />
    </svg>
  );
}

function ConstellationDemo() {
  const people = [
    { name: 'Mom', a: 0, b: 0.9, d: 0.5 },
    { name: 'Alex', a: 1.2, b: 0.6, d: 0.7 },
    { name: 'Sam', a: 2.4, b: 0.3, d: 0.9 },
    { name: 'Jo', a: 3.6, b: 0.8, d: 0.4 },
    { name: 'Maya', a: 5.0, b: 0.5, d: 0.6 },
  ];
  const sz = 200;
  const cx = sz / 2;
  const cy = sz / 2;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      {people.map((p) => {
        const r = 30 + p.d * 50;
        const x = cx + r * Math.cos(p.a);
        const y = cy + r * Math.sin(p.a);
        return (
          <g key={p.name}>
            <circle
              cx={x}
              cy={y}
              r={p.b * 5 + 2}
              fill="#C4A060"
              opacity={p.b * 0.7 + 0.1}
              style={{ filter: p.b > 0.6 ? 'drop-shadow(0 0 4px #C4A06060)' : undefined }}
            />
            <text
              x={x}
              y={y + 12}
              textAnchor="middle"
              style={{
                fontSize: '7px',
                fontFamily: 'var(--font-handwritten)',
                fill: '#C4A060',
                opacity: p.b * 0.5 + 0.3,
              }}
            >
              {p.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const VISUAL_TOOLS = [
  {
    id: 'compass',
    title: 'The Compass',
    subtitle: 'Rate your 4 dimensions',
    color: '#C4A060',
    desc: 'Ring compass with clickable arcs. Tap to rate 1-8. Lives in Box 2 of every Day tab.',
    Visual: CompassDemo,
  },
  {
    id: 'mandala',
    title: 'The Mandala',
    subtitle: 'Sacred geometry with inner voices',
    color: '#C86AD0',
    desc: 'Eight petals, each an archetype. Future: Journey page.',
    Visual: MandalaDemo,
  },
  {
    id: 'echo',
    title: 'The Echo Layers',
    subtitle: 'Peel the onion',
    color: '#D44040',
    desc: 'Concentric rings from surface to core. Five variants. Future: Journey page.',
    Visual: EchoDemo,
  },
  {
    id: 'wheel',
    title: 'The Life Wheel',
    subtitle: 'Track habits as a radar shape',
    color: '#7A9A7A',
    desc: 'Spider chart where trackers become spokes. Lives in Box 3 of Doing tab.',
    Visual: WheelDemo,
  },
  {
    id: 'weather',
    title: 'Inner Weather',
    subtitle: 'Emotions as climate patterns',
    color: '#C4A060',
    desc: 'Storm, rain, fog, breeze, sun — your emotional patterns as weather. Each kind has its own colour. Lives in Box 3 of Caring tab.',
    Visual: WeatherDemo,
  },
  {
    id: 'constellation',
    title: 'The Constellation',
    subtitle: 'Your people as stars',
    color: '#6B7F4E',
    desc: 'Colour-coded by closeness. Inner circle glows warm, distant stars fade cool. Lives in Box 3 of Sharing tab.',
    Visual: ConstellationDemo,
  },
  {
    id: 'flower',
    title: 'The Flower',
    subtitle: 'Sacred geometry petals',
    color: '#9B6BA0',
    desc: '3 to 8 petals. Each petal is a dimension. The 6-petal maps to FACING, the 4-petal to CARE/STAR/SHARE. Future: Journey page meditation tool.',
    Visual: FlowerDemo,
  },
  {
    id: 'losange',
    title: 'The Losange',
    subtitle: 'Diamond emotion loop',
    color: '#6890B0',
    desc: 'Feel → Think → Act → Rest. A diamond that cycles through the emotional processing loop. Future: Journey page deep enquiry tool.',
    Visual: LosangeDemo,
  },
];

/* ═══ SHARED PILL COMPONENT ═══ */
function Pill({
  title,
  subtitle,
  color,
  isOpen,
  onToggle,
  children,
}: {
  title: string;
  subtitle: string;
  color: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between rounded-2xl px-5 py-4 transition-all duration-200"
        style={{
          background: isOpen
            ? 'linear-gradient(180deg, rgba(248,238,220,0.97), rgba(242,230,210,0.95))'
            : 'transparent',
          border: `1.5px solid ${isOpen ? '#8A6A4A50' : '#8A6A4A20'}`,
        }}
      >
        <div className="text-left">
          <span
            className="block text-base font-bold"
            style={{ color, fontFamily: 'var(--font-serif)' }}
          >
            {title}
          </span>
          <span
            className="block text-xs text-muted-foreground/60"
            style={{ fontFamily: 'var(--font-handwritten)' }}
          >
            {subtitle}
          </span>
        </div>
        <span className="text-sm text-muted-foreground/30">{isOpen ? '▲' : '▼'}</span>
      </button>
      {isOpen && (
        <div
          className="animate-in fade-in duration-200 rounded-b-2xl border border-t-0 px-5 py-5"
          style={{
            borderColor: '#8A6A4A30',
            background: 'linear-gradient(180deg, rgba(248,238,220,0.97), rgba(242,230,210,0.95))',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/* ═══ MAIN ═══ */
export default function WorkshopPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const [section, setSection] = useState<'reflection' | 'tools' | 'lab'>('reflection');

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-4 py-6">
      <div className="mb-6 text-center">
        <h1
          className="text-xl font-semibold uppercase tracking-[0.15em]"
          style={{ fontFamily: 'var(--font-serif)', color: '#5C3018' }}
        >
          Workshop
        </h1>
        <p
          className="mt-1 text-sm text-muted-foreground"
          style={{ fontFamily: 'var(--font-handwritten)' }}
        >
          Think. See. Refine.
        </p>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1.5">
        {[
          { id: 'reflection' as const, label: 'Reflection' },
          { id: 'tools' as const, label: 'Visual Tools' },
          { id: 'lab' as const, label: 'Design Lab' },
        ].map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setSection(s.id);
              setOpenId(null);
            }}
            className="flex-1 cursor-pointer rounded-xl py-2.5 uppercase tracking-[0.18em] transition-all duration-200"
            style={{
              background: section === s.id ? '#C4A06015' : 'transparent',
              border: `1.5px solid ${section === s.id ? '#8A6A4A' : '#8A6A4A25'}`,
              color: '#6B4830',
              fontFamily: 'var(--font-serif)',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* REFLECTION SECTION */}
      {section === 'reflection' && (
        <div className="space-y-3">
          {REFLECTIONS.map((r) => (
            <Pill
              key={r.id}
              title={r.title}
              subtitle=""
              color={r.color}
              isOpen={openId === r.id}
              onToggle={() => setOpenId(openId === r.id ? null : r.id)}
            >
              <div className="prose-sm max-w-none">
                {r.content.split('\n\n').map((para, i) => {
                  if (para.startsWith('**') && para.includes('**:')) {
                    const [bold, rest] = para.split('**:', 2);
                    return (
                      <p
                        key={i}
                        className="text-sm leading-relaxed mb-2"
                        style={{ color: '#5C3018', fontFamily: 'var(--font-serif)' }}
                      >
                        <strong style={{ color: r.color }}>{bold.replace(/\*\*/g, '')}</strong>:
                        {rest}
                      </p>
                    );
                  }
                  return (
                    <p
                      key={i}
                      className="text-sm leading-relaxed mb-2"
                      style={{ color: '#5C3018', fontFamily: 'var(--font-serif)' }}
                    >
                      {para.split('**').map((chunk, j) =>
                        j % 2 === 1 ? (
                          <strong key={j} style={{ color: r.color }}>
                            {chunk}
                          </strong>
                        ) : (
                          chunk
                        ),
                      )}
                    </p>
                  );
                })}
              </div>
            </Pill>
          ))}
        </div>
      )}

      {/* VISUAL TOOLS SECTION */}
      {section === 'tools' && (
        <div className="space-y-3">
          {VISUAL_TOOLS.map((w) => (
            <Pill
              key={w.id}
              title={w.title}
              subtitle={w.subtitle}
              color={w.color}
              isOpen={openId === w.id}
              onToggle={() => setOpenId(openId === w.id ? null : w.id)}
            >
              <div className="space-y-4">
                <div className="flex justify-center py-2">
                  <w.Visual />
                </div>
                <p
                  className="text-center text-sm leading-relaxed"
                  style={{ color: '#5C3018', fontFamily: 'var(--font-serif)' }}
                >
                  {w.desc}
                </p>
              </div>
            </Pill>
          ))}
        </div>
      )}

      {/* DESIGN LAB SECTION */}
      {section === 'lab' && (
        <div className="space-y-3">
          <Pill
            title="Typography Pairs"
            subtitle="How the 5 fonts work together"
            color="#6B4830"
            isOpen={openId === 'typo'}
            onToggle={() => setOpenId(openId === 'typo' ? null : 'typo')}
          >
            <div className="space-y-4">
              {[
                {
                  name: 'Elegant',
                  title: 'var(--font-serif)',
                  body: 'var(--font-handwritten)',
                  sample: 'Caring · Doing · Sharing',
                },
                {
                  name: 'Cowboy',
                  title: 'var(--font-cowboy)',
                  body: 'var(--font-cowboy)',
                  sample: 'CARING · DOING · SHARING',
                },
                {
                  name: 'Groovy',
                  title: 'var(--font-groovy)',
                  body: 'var(--font-handwritten)',
                  sample: 'Caring · Doing · Sharing',
                },
                {
                  name: 'Sketch',
                  title: 'var(--font-sketch)',
                  body: 'var(--font-sketch)',
                  sample: 'Caring · Doing · Sharing',
                },
              ].map((pair) => (
                <div
                  key={pair.name}
                  className="rounded-xl px-4 py-3"
                  style={{ background: '#C4A06008', border: '1px solid #C4A06015' }}
                >
                  <p className="text-xs uppercase tracking-wider text-muted-foreground/40 mb-1">
                    {pair.name}
                  </p>
                  <p
                    style={{
                      fontFamily: pair.title,
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#5C3018',
                    }}
                  >
                    {pair.sample}
                  </p>
                  <p style={{ fontFamily: pair.body, fontSize: '14px', color: '#8A6A4A' }}>
                    How does your inner world feel right now?
                  </p>
                </div>
              ))}
            </div>
          </Pill>

          <Pill
            title="Colour Palettes"
            subtitle="Warm, Vivid, Earth variations"
            color="#C4A060"
            isOpen={openId === 'colours'}
            onToggle={() => setOpenId(openId === 'colours' ? null : 'colours')}
          >
            <div className="space-y-3">
              {[
                { name: 'Warm', colors: ['#D4805A', '#C4A070', '#C4906A', '#B07A5A'] },
                { name: 'Vivid', colors: ['#D45050', '#C8A040', '#6890B0', '#88A858'] },
                { name: 'Earth', colors: ['#B89868', '#C4A070', '#A89060', '#988050'] },
                { name: 'Golden', colors: ['#C4A070', '#C4A070', '#C4A070', '#C4A070'] },
              ].map((p) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span
                    className="text-xs w-12"
                    style={{ fontFamily: 'var(--font-handwritten)', color: '#8A6A4A' }}
                  >
                    {p.name}
                  </span>
                  <div className="flex gap-1.5">
                    {p.colors.map((c, i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full"
                        style={{ background: c, opacity: 0.7 }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Pill>

          <Pill
            title="Paper Depths"
            subtitle="Three levels of warmth"
            color="#8A6A4A"
            isOpen={openId === 'paper'}
            onToggle={() => setOpenId(openId === 'paper' ? null : 'paper')}
          >
            <div className="space-y-2">
              {[
                {
                  name: 'Box 1 — Check-in',
                  bg: 'rgba(248,238,220,0.97)',
                  desc: 'Lightest. Where you arrive.',
                },
                {
                  name: 'Box 2 — Compass',
                  bg: 'rgba(245,235,215,0.97)',
                  desc: 'Medium. Where you measure.',
                },
                {
                  name: 'Box 3 — Depth',
                  bg: 'rgba(242,232,210,0.97)',
                  desc: 'Deepest. Where you see patterns.',
                },
              ].map((level) => (
                <div
                  key={level.name}
                  className="rounded-xl px-4 py-3"
                  style={{ background: level.bg, border: '1px solid #8A6A4A30' }}
                >
                  <p
                    className="text-sm font-semibold"
                    style={{ fontFamily: 'var(--font-serif)', color: '#5C3018' }}
                  >
                    {level.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ fontFamily: 'var(--font-handwritten)', color: '#8A6A4A' }}
                  >
                    {level.desc}
                  </p>
                </div>
              ))}
            </div>
          </Pill>

          <Pill
            title="Border & Shadow"
            subtitle="Card edge treatments"
            color="#8A6A4A"
            isOpen={openId === 'borders'}
            onToggle={() => setOpenId(openId === 'borders' ? null : 'borders')}
          >
            <div className="space-y-3">
              {[
                {
                  name: 'Current',
                  border: '1.5px solid #8A6A4A50',
                  shadow: '0 28px 55px -36px rgba(92,48,24,0.3)',
                },
                {
                  name: 'Stronger',
                  border: '2px solid #8A6A4A70',
                  shadow: '0 20px 40px -28px rgba(92,48,24,0.4)',
                },
                {
                  name: 'Subtle',
                  border: '1px solid #8A6A4A30',
                  shadow: '0 32px 60px -40px rgba(92,48,24,0.2)',
                },
                {
                  name: 'None',
                  border: '1px solid transparent',
                  shadow: '0 24px 50px -34px rgba(92,48,24,0.35)',
                },
              ].map((style) => (
                <div
                  key={style.name}
                  className="rounded-2xl px-4 py-3"
                  style={{
                    background: 'rgba(248,238,220,0.97)',
                    border: style.border,
                    boxShadow: style.shadow,
                  }}
                >
                  <p
                    className="text-sm"
                    style={{ fontFamily: 'var(--font-serif)', color: '#5C3018' }}
                  >
                    {style.name}
                  </p>
                </div>
              ))}
            </div>
          </Pill>
        </div>
      )}
    </div>
  );
}
