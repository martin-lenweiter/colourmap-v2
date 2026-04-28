import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 13px; line-height: 1.7; color: #1a1209;
    padding: 52px 60px; max-width: 800px; margin: 0 auto;
    background: #FDFAF5;
  }
  .cover {
    padding: 48px 0 56px;
    border-bottom: 2px solid #C4A060;
    margin-bottom: 52px;
  }
  .cover-title {
    font-size: 28px; font-weight: 800; color: #5C3018;
    letter-spacing: -0.02em; margin-bottom: 8px;
  }
  .cover-sub {
    font-size: 14px; color: #8A6A4A; margin-bottom: 4px;
  }
  .cover-date {
    font-size: 12px; color: #A0907A; font-style: italic;
  }
  .chapter {
    margin-bottom: 56px;
    page-break-inside: avoid;
  }
  .chapter-num {
    font-size: 10px; font-weight: 700; letter-spacing: 0.22em;
    text-transform: uppercase; color: #C4A060; margin-bottom: 6px;
  }
  h1 {
    font-size: 20px; font-weight: 800; color: #5C3018;
    margin-bottom: 4px; letter-spacing: -0.01em;
  }
  .chapter-intro {
    font-size: 13.5px; color: #6A5040; font-style: italic;
    margin-bottom: 24px; padding-bottom: 16px;
    border-bottom: 1px solid #E8DFD0;
  }
  h2 {
    font-size: 14px; font-weight: 700; color: #5C3018;
    margin: 28px 0 8px; letter-spacing: 0.01em;
    text-transform: uppercase; letter-spacing: 0.1em;
  }
  h3 {
    font-size: 13px; font-weight: 700; color: #7A5438;
    margin: 16px 0 6px;
  }
  p { margin: 8px 0; }
  ul { margin: 8px 0 8px 20px; }
  ol { margin: 8px 0 8px 20px; }
  li { margin: 4px 0; }
  strong { font-weight: 700; color: #3A1808; }
  .tag {
    display: inline-block; font-size: 10px; font-weight: 700;
    letter-spacing: 0.12em; text-transform: uppercase;
    padding: 2px 8px; border-radius: 999px;
    background: #C4A06018; color: #7A5438; border: 1px solid #C4A06040;
    margin-right: 4px;
  }
  .tag.red { background: #E8504018; color: #8A2010; border-color: #E8504040; }
  .tag.green { background: #7AAA5818; color: #3A6020; border-color: #7AAA5840; }
  .tag.blue { background: #6890B018; color: #2A4870; border-color: #6890B040; }
  table {
    border-collapse: collapse; width: 100%; margin: 14px 0;
    font-size: 12px;
  }
  th {
    background: #F0EAE0; font-weight: 700; color: #5C3018;
    padding: 7px 12px; text-align: left; border: 1px solid #DDD8CE;
  }
  td {
    padding: 6px 12px; border: 1px solid #DDD8CE; vertical-align: top;
  }
  tr:nth-child(even) td { background: #FDFAF5; }
  .callout {
    background: #C4A06010; border-left: 3px solid #C4A060;
    padding: 10px 14px; margin: 14px 0; border-radius: 0 6px 6px 0;
    font-size: 12.5px; color: #5C3018;
  }
  .callout strong { color: #5C3018; }
  .divider {
    border: none; border-top: 1px solid #E8DFD0;
    margin: 32px 0;
  }
  .shape-demo {
    display: flex; gap: 16px; align-items: center;
    margin: 14px 0; flex-wrap: wrap;
  }
  .shape-item {
    display: flex; flex-direction: column; align-items: center; gap: 6px;
    font-size: 10px; color: #8A6A4A; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.1em;
  }
  .shape-circle {
    width: 44px; height: 44px; border-radius: 50%;
    background: #6890B020; border: 2px solid #6890B060;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: #6890B0;
  }
  .shape-square {
    width: 44px; height: 44px; border-radius: 6px;
    background: #9B6BA020; border: 2px solid #9B6BA060;
    display: flex; align-items: center; justify-content: center;
    font-size: 10px; color: #9B6BA0;
  }
  .shape-triangle-wrap {
    width: 44px; height: 44px;
    display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .shape-tri {
    width: 0; height: 0;
    border-left: 18px solid transparent;
    border-right: 18px solid transparent;
    border-bottom: 32px solid #B33A2B40;
    position: relative;
  }
  .shape-hex {
    width: 44px; height: 44px; background: #7AAA5820;
    border: 2px solid #7AAA5860;
    clip-path: polygon(50% 0%, 93% 25%, 93% 75%, 50% 100%, 7% 75%, 7% 25%);
    display: flex; align-items: center; justify-content: center;
  }
  .shape-diamond {
    width: 32px; height: 32px; background: #C4A06020;
    border: 2px solid #C4A06060;
    transform: rotate(45deg);
    display: flex; align-items: center; justify-content: center;
  }
  .rainbow-bar {
    height: 8px; width: 100%;
    background: linear-gradient(90deg,
      #6890B0, #88C0B0, #7AAA58, #C4A060, #D4805A, #B33A2B);
    border-radius: 4px; margin: 6px 0;
  }
  .priority-high { color: #8A2010; font-weight: 700; }
  .priority-med { color: #7A5438; font-weight: 700; }
  .priority-low { color: #8A8A7A; }
  code {
    font-family: 'Menlo', 'Consolas', monospace;
    font-size: 11px; background: #F0EAE0;
    padding: 1px 4px; border-radius: 3px; color: #5C3018;
  }
  @media print {
    body { padding: 36px 44px; }
    .chapter { page-break-inside: avoid; }
    .cover { page-break-after: always; }
  }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-title">Colourmap Design Reflections</div>
  <div class="cover-sub">Three deep dives: system coherence · simple playbox · layer clarity</div>
  <div class="cover-date">April 2026 · Feature branch: music-deep-work</div>
</div>


<!-- ══════════════════════════════════════════════════ -->
<!-- CHAPTER 1 -->
<!-- ══════════════════════════════════════════════════ -->

<div class="chapter">
  <div class="chapter-num">Chapter 1</div>
  <h1>Design System Audit — Coherence & Adaptive Design</h1>
  <p class="chapter-intro">A technical audit of colour, typography, responsive patterns, and
  component architecture. What's working, what's fragmented, and a clear path to coherence
  across all phone formats.</p>

  <h2>What Exists Today</h2>

  <h3>Strong foundations</h3>
  <p>The codebase has a real design foundation — it's just not being used consistently enough.</p>
  <ul>
    <li><strong>Design tokens</strong> (<code>lib/design-tokens.ts</code>) — spacing scale (4px → 48px),
    type scale (11px → 34px), a 25+ colour palette (ochre, terracotta, sage), touch-target minimum (44px),
    radii, and even slider-progression arrays (20 steps each for volume, reverb, etc.).</li>
    <li><strong>CSS variable themes</strong> (<code>globals.css</code>) — five complete themes
    (paper, golden, dark, night-brown, night-blue, night-purple) with semantic names like
    <code>--background</code>, <code>--foreground</code>, <code>--card</code>.</li>
    <li><strong>StyleContext</strong> — five typography presets (handwritten, cowboy, groovy…)
    switchable globally, persisted in localStorage.</li>
    <li><strong>Mobile CSS baseline</strong> — font bumps (10–11px → 14px on mobile), safe-area
    insets for notched phones, keyboard-height injection, tap-target expansion utility.</li>
    <li><strong>Minimal UI kit</strong> (<code>components/ui/</code>) — CVA-based Button with 6
    variants, Label, Slider, Textarea.</li>
  </ul>

  <h2>The Three Critical Problems</h2>

  <h3>1. Three colour systems that don't talk to each other</h3>
  <p>This is the biggest coherence problem. When you change a brand colour, you'd need to
  update three separate places that don't know about each other:</p>
  <table>
    <tr><th>System</th><th>Where</th><th>Problem</th></tr>
    <tr>
      <td><strong>CSS variables</strong></td>
      <td>globals.css, 5 themes</td>
      <td>Only used by Tailwind semantic classes. Major audio components ignore it.</td>
    </tr>
    <tr>
      <td><strong>Hardcoded hex strings</strong></td>
      <td>BinauralTuner (227 hex values), GrooveMachine (66), FeelingCheckInCard (296)</td>
      <td>Zero reusability. A brand update requires hunting 589+ individual strings.</td>
    </tr>
    <tr>
      <td><strong>StyleContext presets</strong></td>
      <td>5 hardcoded accent colours per preset</td>
      <td>Independent of the CSS theme system — switching themes doesn't change these.</td>
    </tr>
  </table>

  <div class="callout">
    <strong>Practical example:</strong> The brand terracotta is <code>#D4805A</code> in
    BinauralTuner's "Creativity" preset, <code>#D4805A</code> in GrooveMachine's Drums group,
    and <code>terracotta</code> in design-tokens.ts. They're the same value, but they're
    disconnected — a hue shift in one doesn't propagate.
  </div>

  <h3>2. Binary responsive design — phone or desktop, nothing in between</h3>
  <p>The entire responsive strategy uses one breakpoint: <strong>768px (Tailwind's <code>md:</code>)</strong>.
  That's it. No tablet handling, no large-phone (430px+) adjustment, no wide-desktop polish.</p>
  <ul>
    <li>FeelingCheckInCard: a 300px-wide hardcoded container — breaks on any phone smaller than ~375px.</li>
    <li>BinauralTuner: dozens of inline pixel dimensions (width: 120, height: 14) with no scaling.</li>
    <li>GrooveMachine: the MPC pad grid uses <code>flex-1</code> which helps, but the track label
    column is a fixed 40px — truncates on small phones.</li>
  </ul>

  <h3>3. No shared layout primitives</h3>
  <p>38 components in <code>/components</code> each handle their own padding, border, shadow,
  and background from scratch. <code>FeelingCheckInCard</code> manually applies
  <code>md:rounded-3xl md:border md:px-5 md:py-6</code>; <code>CheckInForm</code> does the
  same but differently. <code>DailyAgenda</code> does it a third way.</p>

  <h2>The Path to Coherence</h2>

  <h3>Step 1 — One colour truth (1–2 weeks)</h3>
  <p>Extract the brand palette into CSS variables and make components read from them:</p>
  <ul>
    <li>Add <code>--color-terracotta</code>, <code>--color-gold</code>, <code>--color-sage</code>,
    <code>--color-plum</code>, <code>--color-ocean</code> to each theme in globals.css.</li>
    <li>Replace the 10 most-used hardcoded hex values in BinauralTuner and GrooveMachine
    with <code>var(--color-*)</code> references.</li>
    <li>Connect StyleContext so its accent colour reads from <code>--color-gold</code> instead of
    hardcoding <code>#C4A060</code>.</li>
    <li>Result: switching from Paper → Night theme also shifts the Groove Machine accent.</li>
  </ul>

  <h3>Step 2 — Three breakpoints, not one (3–5 days)</h3>
  <p>Add two new Tailwind breakpoints to <code>tailwind.config.ts</code>:</p>
  <ul>
    <li><code>xs: 390px</code> — iPhone SE / small Android. Tight layout, reduced padding.</li>
    <li><code>md: 768px</code> — existing tablet/desktop threshold (keep).</li>
    <li><code>lg: 1024px</code> — wide desktop. Two-column layouts, expanded sidebars.</li>
  </ul>
  <p>Add a <code>useViewport()</code> hook that returns <code>'phone' | 'tablet' | 'desktop'</code>
  so components can make layout decisions in JS when CSS alone isn't enough.</p>

  <h3>Step 3 — Two shared primitives (1 week)</h3>
  <p>Create two components that everything else extends:</p>
  <ul>
    <li><strong>SectionCard</strong> — a card with the standard warm border, rounded corners,
    and responsive padding. Replaces the 15+ places that manually write
    <code>rounded-2xl border px-4 py-4</code>.</li>
    <li><strong>PillHeader</strong> — the closable section title pattern (used in BinauralTuner
    for Controls / Harmonics / Layers). Already repeated 6 times — extract it.</li>
  </ul>

  <h3>Step 4 — Container queries for audio components (future)</h3>
  <p>The Groove Machine and BinauralTuner are the two components most starved of space on small
  phones. Container queries (CSS <code>@container</code>) let them adapt to their actual
  available width, not the viewport width — so they work correctly whether they're in a tab,
  a modal, or a full-screen view.</p>

  <div class="callout">
    <strong>Priority order:</strong>
    <span class="tag red">High</span> Colour CSS variables
    <span class="tag">Medium</span> Three breakpoints + useViewport
    <span class="tag green">Later</span> Shared primitives
    <span class="tag blue">Future</span> Container queries
  </div>

  <h2>Adaptive Design for Different Phone Formats</h2>

  <table>
    <tr>
      <th>Phone Format</th>
      <th>Screen</th>
      <th>Current behaviour</th>
      <th>Target behaviour</th>
    </tr>
    <tr>
      <td>iPhone SE / small Android</td>
      <td>375×667</td>
      <td>Some fixed-width containers overflow</td>
      <td><code>xs:</code> breakpoint tightens padding, smaller type, 2-col grids → 1-col</td>
    </tr>
    <tr>
      <td>Standard iPhone (14/15)</td>
      <td>390×844</td>
      <td>Works well — this is the design target</td>
      <td>Maintain as primary reference</td>
    </tr>
    <tr>
      <td>Large iPhone Pro Max</td>
      <td>430×932</td>
      <td>Mostly fine, some content looks sparse</td>
      <td>Slightly wider content columns, larger tap targets</td>
    </tr>
    <tr>
      <td>Tablet / iPad</td>
      <td>768–1024</td>
      <td>No handling — looks like a stretched phone</td>
      <td><code>md:</code> triggers 2-col layouts, Day page side-by-side</td>
    </tr>
    <tr>
      <td>Desktop</td>
      <td>1280+</td>
      <td>Centred column, DayRail visible</td>
      <td><code>lg:</code> widens outer max-w, shows more sidebar content</td>
    </tr>
  </table>
</div>


<!-- ══════════════════════════════════════════════════ -->
<!-- CHAPTER 2 -->
<!-- ══════════════════════════════════════════════════ -->

<div class="chapter">
  <div class="chapter-num">Chapter 2</div>
  <h1>Simple Mode Playbox — Shapes, Colour, and Tactile Delight</h1>
  <p class="chapter-intro">The simple view of the Binaural Tuner is currently a list of
  preset buttons. This reflection imagines it as a visual playbox — shapes as language,
  colour as category, touch as invitation.</p>

  <h2>The Core Idea</h2>
  <p>Each sound category gets its own <strong>shape vocabulary</strong>. When you open the
  simple mode, you see a field of geometric objects — not a list, not a grid of identical
  buttons. The shape tells you what kind of sound it is before you read the label.</p>
  <p>This transforms the interface from a menu into a <em>playground</em>. You tap shapes.
  Sounds emerge. The visual and auditory experience reinforce each other.</p>

  <h2>Shape → Category Mapping</h2>

  <div class="shape-demo">
    <div class="shape-item">
      <div class="shape-circle">~</div>
      Waters
    </div>
    <div class="shape-item">
      <div class="shape-square">▪</div>
      Drones
    </div>
    <div class="shape-item">
      <div class="shape-triangle-wrap">
        <div class="shape-tri"></div>
      </div>
      Wild
    </div>
    <div class="shape-item">
      <div class="shape-hex"></div>
      Birds &amp; Forest
    </div>
    <div class="shape-item">
      <div class="shape-diamond"></div>
      Textures
    </div>
  </div>

  <table>
    <tr>
      <th>Shape</th>
      <th>Category</th>
      <th>Why</th>
    </tr>
    <tr>
      <td><strong>Circle</strong></td>
      <td>Waters (rain, ocean, waves)</td>
      <td>Fluid, no edges, continuous — water moves in circles</td>
    </tr>
    <tr>
      <td><strong>Square / Rounded rect</strong></td>
      <td>Drones &amp; Tones (drone, bowl, harmonic)</td>
      <td>Grounded, held, stable — a sustained tone is a solid thing</td>
    </tr>
    <tr>
      <td><strong>Triangle</strong></td>
      <td>Wild &amp; Ceremony (shaman drum, fire, wolf)</td>
      <td>Pointed, primal, directional — energy and ritual</td>
    </tr>
    <tr>
      <td><strong>Hexagon</strong></td>
      <td>Birds &amp; Forest (birds, cicada, forest)</td>
      <td>Natural geometry — honeycombs, leaves, biological patterns</td>
    </tr>
    <tr>
      <td><strong>Diamond / Rhombus</strong></td>
      <td>Textures (vinyl, brown noise, breath)</td>
      <td>Faceted, lo-fi warmth — the imperfect beauty of texture</td>
    </tr>
    <tr>
      <td><strong>Pill / Capsule</strong></td>
      <td>Digital (spaceship, cyber drone)</td>
      <td>Synthetic, sleek, future-facing</td>
    </tr>
  </table>

  <h2>Visual Behaviour</h2>

  <h3>Inactive state</h3>
  <p>Shapes sit at low opacity (~30%), lightly outlined. The field breathes — subtle idle
  animation, each shape gently pulsing at different rates (like organisms resting). The
  colour is the category colour, muted.</p>

  <h3>Active state</h3>
  <p>When tapped: the shape fills with colour and scales up slightly (1.08×). An active
  sound triggers a ripple or glow that matches the wave character of that sound — circular
  ripple for waters, steady pulse for drones, sharp radiate for wild.</p>

  <h3>Volume</h3>
  <p>A <strong>rainbow vertical slider</strong> sits on the right edge of the playbox — a single
  elegant touch target that controls the master mix. Bottom = silent, top = full. The fill
  climbs the rainbow: blue at the base (calm, cool) → teal → green → gold → orange → red
  at the top (full, warm, alive).</p>

  <div class="rainbow-bar"></div>
  <p style="font-size:11px;color:#8A6A4A;margin-top:4px;">Rainbow volume progression —
  blue (0%) → teal → green → gold → orange → red (100%)</p>

  <h3>Preset shortcuts</h3>
  <p>Above the playbox, 4–5 preset dots sit in a row — each dot is the colour of the
  preset's emotional tone. Tap a dot and the shapes light up in the preset's default
  configuration. This is the "I just want to relax" entry point — one tap from silence
  to soundscape.</p>

  <h2>Layout</h2>
  <p>The playbox uses a loose, organic placement — not a rigid grid. Shapes are grouped
  loosely by category but with natural spacing variation. Circles cluster together.
  Squares sit more evenly spaced. The layout feels discovered, not designed.</p>

  <div class="callout">
    <strong>Sober minimal version:</strong> For users who find the shape playbox too visual,
    a "minimal" toggle collapses it back to a clean list — labelled pills in the category
    colour, same functionality, no decoration. The playbox is an enhancement, not a
    requirement.
  </div>

  <h2>Harmonics in Simple Mode</h2>
  <p>Thirds, fifths, and octaves are the musical heart. In the playbox, harmonics appear
  as a single horizontal row of small dots — each dot the harmonic's colour. Tapping a dot
  adds the interval to the current sound. When multiple harmonics are active, the dots glow
  in sequence with the binaural beat — a visual representation of the frequency relationships
  in motion.</p>
</div>


<!-- ══════════════════════════════════════════════════ -->
<!-- CHAPTER 3 -->
<!-- ══════════════════════════════════════════════════ -->

<div class="chapter">
  <div class="chapter-num">Chapter 3</div>
  <h1>Relax Sounds — Clarity Over Abundance</h1>
  <p class="chapter-intro">The Binaural Tuner has 50+ layers, 8 harmonics, 10 sacred
  frequencies, 8 presets, 4 genres, and 5 controls. That is not a soundscape — it is an
  inventory. This reflection is about designing clarity without losing depth.</p>

  <h2>The Problem</h2>
  <p>The current layer section, even with the new category system, presents every possible
  sound at once. A user who opens "Layers" sees Waters (7 sounds) + Birds &amp; Forest (6) +
  Drones &amp; Tones (9) + Textures (9) + Wild &amp; Ceremony (12) + Digital (7) = <strong>50
  rectangle cards</strong>.</p>
  <p>This is not calm. This is a hardware store.</p>
  <p>The person who wants to relax needs to feel: <em>I have arrived somewhere.</em> Not:
  <em>I need to choose from 50 options before I can rest.</em></p>

  <h2>The Core Design Principle</h2>
  <div class="callout">
    <strong>Progressive intimacy.</strong> Start with almost nothing. Let the user discover
    more as they want more. Never front-load the full depth.
  </div>

  <h2>The Three-Layer Clarity System</h2>

  <h3>Layer 0: Preset arrival</h3>
  <p>When a preset is selected (Deep Sleep, Meditation, Creativity…) the app arrives
  in a state. Not a menu — a place. 2–3 layers are already active. The sound starts.
  You don't need to do anything.</p>
  <p>The visual: just the active layers, slightly glowing. Everything else is hidden.
  The screen feels like a room you just entered.</p>

  <h3>Layer 1: Nudge (+/−)</h3>
  <p>Below the active layers, a single line: <em>"+ more sounds"</em>. Tapping it
  reveals only the <strong>preset-contextual layers</strong> — the 4–6 sounds that
  make musical sense alongside what's already playing. For Deep Sleep: ocean, thunder,
  brown noise. For Creativity: wind chimes, birds, cicada. Not all 50.</p>
  <p>This curation lives in the preset definition — each preset carries a
  <code>suggestedLayers[]</code> list alongside its active defaults.</p>

  <h3>Layer 2: Full palette</h3>
  <p>A secondary link — <em>"open full library"</em> — reveals the complete category
  grid for power users who want to build their own mix. This is the current design,
  but accessed through intentional navigation, not as the default view.</p>

  <h2>Visual Design for the Relax Surface</h2>

  <h3>What to keep</h3>
  <ul>
    <li><strong>Rectangle pad cards</strong> — the right direction. Tactile, clear, each
    sound has its own physical presence.</li>
    <li><strong>Category section titles</strong> — real nature names (Waters, Wild &amp;
    Ceremony) create a sense of a world to explore rather than a settings menu.</li>
    <li><strong>Closable pillboxes</strong> — sections that collapse. The default state
    should be almost everything collapsed.</li>
    <li><strong>Rainbow volume</strong> — immediately communicates energy level visually.</li>
  </ul>

  <h3>What to change</h3>
  <ul>
    <li><strong>Default state too open.</strong> Currently Layers starts expanded with
    all categories visible. Default should be: 0–1 categories shown, rest collapsed.
    Expand on intent.</li>
    <li><strong>Volume bar under every active card.</strong> Good for editing, but when
    just listening, it adds visual noise. Consider: volume bar only appears when you long-press
    a card (or after a 1s hover). Idle state = just the glowing card, no bar.</li>
    <li><strong>Softness (reverb) control.</strong> Move it out of the Layers section header
    and into Controls — it's a global mix parameter, not a layer parameter. Layers section
    becomes purely about what sounds are on/off.</li>
    <li><strong>Harmonics and Sacred default closed.</strong> Already done. These are
    depth features — let the user discover them, don't front-load them.</li>
  </ul>

  <h3>The sonic palette of calm</h3>
  <p>Not a design note — a musical one. The most effective calm soundscapes have three things:</p>
  <ol>
    <li><strong>A bed</strong> — continuous, low-frequency, no rhythm. Ocean, brown noise,
    drone. This is the foundation. It should always be the first sound.</li>
    <li><strong>A texture</strong> — something that moves slowly but isn't rhythmic. Rain,
    wind, breath. It fills the space without drawing attention.</li>
    <li><strong>An occasional accent</strong> — something that appears and disappears.
    Wind chimes, a singing bowl, birds in the distance. This is what prevents the brain
    from habituating to the sound and tuning it out.</li>
  </ol>
  <p>The preset system should hardcode these three roles: every preset names its bed,
  texture, and accent. The suggested layers surface alternatives in each role.</p>

  <h2>What Sober Design Looks Like Here</h2>
  <p>Sober ≠ minimal. It means every element earns its place.</p>

  <table>
    <tr>
      <th>Element</th>
      <th>Sober version</th>
      <th>Current</th>
    </tr>
    <tr>
      <td>Layer cards</td>
      <td>Show only active + preset-contextual. 3–6 visible max.</td>
      <td>All 50 visible when Layers is open</td>
    </tr>
    <tr>
      <td>Volume bar</td>
      <td>Appears on interaction, not by default</td>
      <td>Always shown under active cards</td>
    </tr>
    <tr>
      <td>Section titles</td>
      <td>One open by default, rest collapsed</td>
      <td>Multiple sections open simultaneously</td>
    </tr>
    <tr>
      <td>Controls section</td>
      <td>Closed by default — you don't need it to relax</td>
      <td>Open by default (controlsOpen = true)</td>
    </tr>
    <tr>
      <td>Preset selection</td>
      <td>Top-level, always visible, tap to arrive</td>
      <td>Accessible but not the primary surface</td>
    </tr>
  </table>

  <h2>The Experience Arc</h2>
  <p>Open the app → tap Deep Sleep → sound starts → screen shows only the 2 active layers,
  softly glowing → silence, rest, done.</p>
  <p>If you want more: tap the "+" → 4 contextual layers appear → add one → layer glows to life.</p>
  <p>If you want to build a mix: tap "open library" → the full palette appears → you compose.</p>
  <p>Three depths. One entry point. No overwhelm.</p>
</div>

</body>
</html>`;

const htmlPath = 'C:\\Users\\victor\\AppData\\Local\\Temp\\colourmap-design-reflections.html';
const pdfPath = 'C:\\Users\\victor\\Downloads\\colourmap-design-reflections.pdf';

writeFileSync(htmlPath, html);
console.log('HTML written to', htmlPath);

const chrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
execSync(
  `"${chrome}" --headless=new --disable-gpu --no-sandbox --print-to-pdf="${pdfPath}" --no-margins "file:///${htmlPath.replace(/\\/g, '/')}"`,
  { stdio: 'inherit', timeout: 30000 },
);

console.log(`Saved → ${pdfPath}`);
