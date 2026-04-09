'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════════
   WORKSHOP — Visual tools exploration
   Explains each graphical concept, where it fits, and how to use it.
   Collapsible pillbox sections.
   ═══════════════════════════════════════════════════════════ */

interface WorkshopSection {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  what: string;
  where: string;
  how: string;
  visual: string;
}

const WORKSHOPS: WorkshopSection[] = [
  {
    id: 'compass',
    title: 'The Compass',
    subtitle: 'Ring compass with 4 dimensions',
    color: '#C4A060',
    what: 'A circular ring divided into 4 arcs. Each arc represents one dimension of your life. The arc opacity reflects your current rating — brighter means stronger. Click an arc to rate it, and sub-cells appear for deeper exploration.',
    where:
      'Box 2 in every Day tab. Caring uses CARE (Care, Attitude, Rest, Emotions). Doing uses STAR (Structure, Target, Action, Resources). Sharing uses SHARE (Share, Authentic, Roots, Express).',
    how: 'Tap a slice → rate 1-8 with the rhyming scale → tap a sub-cell (e.g., "Health" under Care) → 3-step program: Reflect, Rate, Commit. The compass shape shows your balance at a glance. Switch colour themes with the design button.',
    visual:
      'SVG ring arcs with radial gradients, warm brown guide circles, labels positioned at the midpoint of each arc. Center glow reflects overall state.',
  },
  {
    id: 'mandala',
    title: 'The Mandala',
    subtitle: 'Sacred geometry with flexible petals',
    color: '#C86AD0',
    what: 'An 8-petal flower where each petal represents an inner voice or archetype. Petals elongate outward, glow when active. The mandala can have 3-8 petals depending on the context, following sacred geometry ratios.',
    where:
      'Future: Journey page. The Mandala Council lets you seat 1-8 archetypes at a table and dialogue with them. Could also become a weekly intention-setter or a cyclical life-rhythm tool (seed → bloom → harvest → rest).',
    how: 'Pick archetype families → choose voices → seat them at the mandala → tap a petal to hear its voice speak → write back → honour one voice to lead the day. The mandala shape becomes your unique inner portrait.',
    visual:
      "SVG petals as elongated ellipses radiating from center. Each petal uses the archetype's colour. Organic border-radius. Center glow. Rainbow progression from warm (root) to cool (crown) across petals.",
  },
  {
    id: 'echo',
    title: 'The Echo Layers',
    subtitle: 'Radial depth reader — peel the onion',
    color: '#D44040',
    what: 'Concentric rings like tree rings. Each ring is a layer of depth — from the surface (what others see) to the core (the feeling underneath everything). Click from outside in to peel back each layer.',
    where:
      'Future: Journey page, as a deep-dive tool. Could also appear when a compass dimension is rated very low — a "go deeper" option that opens the echo layers for that specific dimension.',
    how: 'Navigate between 5 variants (Emotional Core, Decision Depth, Relationship Echo, Energy Scan, Growth Rings) using arrows. Click any ring to reveal its label and description. Each variant maps to a different kind of depth.',
    visual:
      'SVG concentric circles, rings painted from outside-in. Outer rings are lighter/cooler. Inner rings are darker/warmer. Active ring highlights with glow. Center dot pulses. Tree-ring aesthetic — organic, not clinical.',
  },
  {
    id: 'wheel',
    title: 'The Life Wheel',
    subtitle: 'Radar chart for tracking habits over time',
    color: '#7A9A7A',
    what: 'A spider/radar chart where each spoke represents a life aspect you choose to track (sleep, exercise, reading, partner...). The filled polygon shows your current "life shape." Overlay last week\'s shape to see change.',
    where:
      'Box 3 in the Doing tab. The spokes come directly from the trackers you set up in Box 1. No duplicate setup — the data flows automatically. Also useful as a standalone weekly review tool.',
    how: 'Choose 3-8 aspects to track → rate daily (or use tracker day-dots from Box 1) → the wheel shape updates live → compare this week vs last week → the "rhythm score" in the center shows overall consistency.',
    visual:
      "SVG polygon with smooth fill. This week: translucent coloured fill. Last week: faint outline. Grid rings at 25/50/75/100%. Spoke labels at tips. Minimal, precise, captain's-instrument feel.",
  },
  {
    id: 'mirror',
    title: 'The Mirror',
    subtitle: 'Challenge and Flow patterns made visible',
    color: '#C4A070',
    what: "Two overlapping organic circles — one for challenges, one for flow. As you write in the Challenge/Flow columns, the circles grow and shift. Where they overlap: that's where you're integrating shadow and strength.",
    where:
      'Box 3 in the Caring tab. Reads from Challenge/Flow text entries written in Box 2. Shows patterns over time without any extra input from the user.',
    how: 'Just write in Challenge and Flow. The mirror updates automatically. Over time, recurring words appear in the circles. The balance ratio in the center shows your overall tendency (more challenge vs more flow).',
    visual:
      'Two SVG circles with radial gradients, slightly overlapping like a Venn diagram but organic — watercolour stain aesthetic. Left: muted warm red. Right: muted gold. Overlap: bronze glow. No hard edges.',
  },
  {
    id: 'constellation',
    title: 'The Constellation',
    subtitle: 'Your people as stars in the sky',
    color: '#6B7F4E',
    what: 'People you care about become stars arranged in a circle. Star brightness reflects how recently you connected. Stars drift outward when distant, pull inward when connected. A living map of your relational world.',
    where:
      'Box 3 in the Sharing tab. People come from Box 1 (SharingCheckInCard). Distant/Connected entries from Box 2 affect star positions. Gratitude entries that mention a name make that star glow.',
    how: 'Name people in Box 1. Write in Distant/Connected columns in Box 2. The constellation updates automatically. Stars you haven\'t reached out to in 3+ days start to dim. The "warmth" number in the center shows your connection health.',
    visual:
      'SVG circles as stars with glow filters. Warm parchment background (twilight feel, not dark). Thin dotted lines between grouped stars. Subtle pulse on neglected connections. Handwritten names next to each star.',
  },
  {
    id: 'losange',
    title: 'The Losange',
    subtitle: 'Emotion loop reader — how feelings distort doing',
    color: '#9B6BA0',
    what: 'A diamond shape with 4 Doing dimensions at cardinal points and an emotion at the center. Pick an emotion (Fear, Hope, Gratitude, Doubt, Anger, Peace) and see how it distorts each dimension of your doing.',
    where:
      'Future: Journey page. A diagnostic tool for when you feel stuck. "I feel stuck but I don\'t know why" → pick the emotion → read how it\'s affecting your Structure, Target, Action, Resources.',
    how: 'Select an emotion from 6 pills → the diamond highlights → tap any dimension → read the "loop reading" that describes how that emotion is affecting that area. Example: "Fear makes resources look scarce. You hoard instead of invest."',
    visual:
      'SVG diamond (rotated square) with 4 labelled points. Center glows with emotion colour. Gem-like aesthetic — the emotion is a jewel that refracts through the 4 dimensions. Rich, saturated, more opaque than the compass.',
  },
  {
    id: 'facing-peace',
    title: 'FACING / PEACE',
    subtitle: 'Two modes of inner tracking',
    color: '#C85050',
    what: "FACING (Fear, Avoidance, Confusion, Intention, Need, Gratitude) names what's hard. PEACE (Pause, Express, Accept, Calm, Emerge) walks you through releasing it. Swipe between them with an arrow.",
    where:
      'Box 1 in the Caring tab. FACING is the default. Arrow on the right slides to PEACE. Each letter opens a progressive 3-question programme.',
    how: 'Tap a letter blob → the tracker name and first question appear → answer → losange button reveals the next question → 3 questions total. The answers get saved with your check-in. FACING for naming. PEACE for processing.',
    visual:
      'Organic cell-shaped blobs in a row. Each has a single bold letter. FACING uses matte warm colours. PEACE uses calming muted tones. Arrow (‹ ›) on the side to switch. Questions appear below as handwritten-style inputs with losange navigation.',
  },
];

function WorkshopPill({
  section,
  isOpen,
  onToggle,
}: {
  section: WorkshopSection;
  isOpen: boolean;
  onToggle: () => void;
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
            style={{ color: section.color, fontFamily: 'var(--font-serif)' }}
          >
            {section.title}
          </span>
          <span
            className="block text-xs text-muted-foreground/60"
            style={{ fontFamily: 'var(--font-handwritten)' }}
          >
            {section.subtitle}
          </span>
        </div>
        <span className="text-sm text-muted-foreground/30">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div
          className="animate-in fade-in duration-200 space-y-4 rounded-b-2xl border border-t-0 px-5 py-5"
          style={{
            borderColor: '#8A6A4A30',
            background: 'linear-gradient(180deg, rgba(248,238,220,0.97), rgba(242,230,210,0.95))',
          }}
        >
          <div>
            <p
              className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: section.color }}
            >
              What it is
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: '#5C3018', fontFamily: 'var(--font-serif)' }}
            >
              {section.what}
            </p>
          </div>

          <div>
            <p
              className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: section.color }}
            >
              Where it lives
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: '#5C3018', fontFamily: 'var(--font-serif)' }}
            >
              {section.where}
            </p>
          </div>

          <div>
            <p
              className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: section.color }}
            >
              How to use it
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: '#5C3018', fontFamily: 'var(--font-serif)' }}
            >
              {section.how}
            </p>
          </div>

          <div>
            <p
              className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em]"
              style={{ color: section.color }}
            >
              Visual language
            </p>
            <p
              className="text-sm leading-relaxed"
              style={{ color: '#5C3018', fontFamily: 'var(--font-handwritten)' }}
            >
              {section.visual}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkshopPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-2xl space-y-3 px-4 py-6">
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
          Visual tools — what they are, where they live, how to use them.
        </p>
      </div>

      {WORKSHOPS.map((section) => (
        <WorkshopPill
          key={section.id}
          section={section}
          isOpen={openId === section.id}
          onToggle={() => setOpenId(openId === section.id ? null : section.id)}
        />
      ))}
    </div>
  );
}
