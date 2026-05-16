# Personality Type Program

> A playful, scientifically grounded Colourmap program for understanding personality as a living pattern, not a fixed box.

## Research Summary

The safest foundation for a free/commercial Colourmap personality program is the **International Personality Item Pool (IPIP)**. The official IPIP site says its items and scales are public domain and can be copied, edited, translated, or used for any purpose without permission or fee. The NIH also lists IPIP-NEO as an instrument with no copyright flag.

The best first model is **Big Five / OCEAN**:

- Openness: imagination, curiosity, aesthetic sensitivity, openness to ideas
- Conscientiousness: order, discipline, follow-through, reliability
- Extraversion: social energy, assertiveness, positive activation
- Agreeableness: trust, compassion, cooperation, conflict style
- Neuroticism / Emotional Reactivity: stress sensitivity, worry, volatility, emotional load

Useful free or usable sources:

- **IPIP**: core assessment foundation; public domain; suitable for Colourmap adaptation with attribution.
- **TIPI**: 10-item Big Five quick check by Gosling et al.; the author says anyone can use it for any purpose. Use only as a low-resolution glimpse.
- **O*NET Interest Profiler / RIASEC**: useful for a later career/interests layer; free through O*NET Career Exploration Tools licensing. If modified or extended, use the Developer License path and proper attribution.

Sources to avoid as primary implementation:

- **Official MBTI**: trademarked/restricted. Do not copy items, names, or imply the app administers MBTI. We can build our own reflective archetype language, but not clone the official instrument.
- **HEXACO-PI-R**: downloadable free only for non-profit academic research; public apps and non-academic use require permission.
- **BFI-2**: permission is described for personal and research use; avoid using it commercially without legal review.
- **16Personalities-style typing**: attractive and fun, but it collapses continuous traits into type boxes. Colourmap should avoid pretending a four-letter label is the person.

References:

- IPIP official permission language: https://www.ipip.ori.org/
- NIH IPIP-NEO listing: https://www.nih.gov/node/21486
- TIPI official page: https://gosling.psy.utexas.edu/scales-weve-developed/ten-item-personality-measure-tipi/
- O*NET tool license: https://www.onetcenter.org/license_tools.html
- O*NET Interest Profiler manual: https://www.onetcenter.org/reports/IP_Manual.html
- MBTI trademark / restriction context: https://www.themyersbriggs.com/en-US/Support/Trademarks and https://www.myersbriggs.org/using-type-as-a-professional/become-mbti-certified/home.htm
- HEXACO use restriction: https://hexaco.org/hexaco-inventory

## Product Position

This is not a diagnostic tool and not a hiring tool. It is a **self-understanding program**.

Colourmap should make personality feel like:

- a landscape you can explore
- a set of energies that move through your life
- a pattern that changes with context, pressure, sleep, work, relationships, and stress
- a bridge into missions, archetypes, business strategy, and emotional clarity

The promise is:

> Understand your operating system, then learn how to move through life with less friction.

The deeper promise is:

> Understand the story you are telling yourself, then learn how to move through it.

Personality is not only traits. It is traits plus pressure plus the story lens the nervous system uses to explain what happened. A sadness can become "I am failing." A rejection can become "I am not wanted." An unfinished admin task can become "I cannot handle life." The program should help the user see that translation while staying gentle and positive.

## Core Design Principle

Most personality tests fail because they say:

> You are this type.

Colourmap should say:

> These are your current tendencies. Here is how they help you. Here is where they create friction. Here is how to move between modes.

The result should never trap the user in identity. It should create useful self-recognition.

## Program Structure

The program is block by block, with a visual glimpse first and detail only when the user asks.

### Free Test Layers

Colourmap should separate established free instruments from original Colourmap interpretation.

First implementable layers:

- **TIPI Big Five Glimpse**: 10 questions, very fast, useful for a first signal. It should clearly say it is low-resolution.
- **IPIP Big Five Standard**: 50 public-domain items as the serious V1 personality engine. This should become the main research-backed assessment.
- **IPIP Big Five Deep**: 120 public-domain items later, with facets and better confidence.
- **O*NET / RIASEC Interests**: later career and work-style layer, useful for business mode, career direction, and life-design questions.
- **Colourmap Story Lens**: original layer about the story the user is telling themselves, how it protects them, where it limits them, and how to move through it.

The app should not merge these into one confusing score. Instead:

- TIPI answers "what is the quick Big Five signal?"
- IPIP answers "what is the more reliable trait pattern?"
- RIASEC answers "what worlds of work/creation pull me?"
- Colourmap Story Lens answers "what story am I living through, and what next reaction gives power back?"

### Block 1: The Quick Glimpse

Purpose: get the user into the experience fast.

Options:

- 10-item TIPI-inspired quick scan
- or a Colourmap-created 15-question mode pulse using Big Five-adjacent language

Output:

- five glowing trait channels
- one-line summary: "Your current profile looks like creative intensity with practical friction."
- confidence warning: "Quick glimpse only. Deeper map needs the full program."

### Block 2: The Deep Map

Use IPIP Big Five items as the foundation.

Recommended MVP:

- 50 items: substantial but not exhausting.
- 5-point response scale:
  - Very unlike me
  - Somewhat unlike me
  - Neutral / depends
  - Somewhat like me
  - Very like me

Future:

- IPIP-NEO 120-item version for 30 facets.
- Adaptive version that asks fewer questions once confidence is high.

### Block 3: Facets as Living Rooms

Instead of only showing five bars, show each trait as a territory with smaller rooms.

Example:

- Openness: imagination, aesthetic sensitivity, intellectual curiosity, novelty seeking
- Conscientiousness: order, discipline, dependability, completion energy
- Extraversion: social energy, assertiveness, playfulness, stimulation need
- Agreeableness: compassion, trust, conflict softness, cooperation
- Emotional Reactivity: worry, sensitivity, recovery speed, pressure response

These facet names can be Colourmap-native while scores come from public-domain items.

### Block 4: The Type as a Story, Not a Box

Colourmap can create its own personality style names from trait combinations.

Examples:

- The Vision Builder: high Openness + high Conscientiousness
- The Wild Artist: high Openness + lower Conscientiousness
- The Quiet Strategist: lower Extraversion + high Conscientiousness
- The Warm Connector: high Agreeableness + high Extraversion
- The Sensitive Creator: high Openness + high Emotional Reactivity
- The Grounded Operator: lower Openness + high Conscientiousness

Rules:

- No hard types.
- No "you are only this."
- Always show the underlying trait pattern.
- Always allow multiple active styles.

### Block 5: Pressure Map

This is where Colourmap becomes different from generic tests.

The app asks:

- What happens when you are rested?
- What happens when you are under financial pressure?
- What happens when you are in love, social energy, or conflict?
- What happens when you are building a big dream?
- What happens when admin appears?

Output:

- calm self
- pressure self
- creative self
- survival self
- relational self

This connects directly to Colourmap's mode/archetype platform.

### Block 6: Friction and Gifts

For each trait and style:

- Gift: where this helps
- Friction: where this creates cost
- Avoidance pattern: what the user tends to dodge
- Bridge move: one tiny transition into another mode

Example:

High Openness + low Conscientiousness:

- Gift: visionary, associative, original
- Friction: too many possible futures, weak closure
- Avoidance: escapes structure by generating new ideas
- Bridge: one 15-minute practical container before the next idea sprint

### Block 7: Mode Translation

Personality becomes practical by translating it into mode movement.

Example:

- Creation Mode is strong.
- Admin Mode is avoided.
- Body Mode is underfed.
- Organisation Mode is needed as a bridge, not a prison.

This ties personality to the existing Colourmap philosophy:

> The problem is not that you are one personality. The art is moving between modes.

### Block 8: Story Lens

The app asks what story the user tends to build around pain, delay, conflict, grief, or failure.

Example story lenses:

- "I am behind."
- "I am too much."
- "I always lose what matters."
- "If I slow down, everything collapses."
- "I need to build the future because today feels unsafe."

The output should not shame the story. It should say:

> This story was probably trying to protect you. Now we can ask if it is still the best guide.

For every story lens, the result should include:

- the protective purpose
- the cost
- the recontextualization
- the next reaction that gives power back

### Block 9: Life Comic Mode

Future mode: the app turns a difficult life fragment into a small comic book.

Format:

1. What happened
2. What story appeared
3. What the body felt
4. What the old reaction would do
5. What a wiser reaction could do
6. What lesson can be carried forward

This should connect to the Education program: the user can learn from people who went through challenge, grief, rejection, discipline, or failure and see what mindset helped them keep moving. The goal is not heroic mythology. The goal is recontextualization: "this pain can become material, wisdom, tenderness, and power."

The comic mode should stay positive but honest. No forced optimism. Grief is allowed to be grief before it becomes meaning.

## Visual Interface

### Glimpse View

The first view must be instantly readable:

- five pastel trait suns or petals
- one dominant pattern line
- one tension line
- one small next move

This is for low attention spans. The user should understand the result before reading.

### Learning Integration

The personality program belongs inside Education as an interactive learning test. It should feel related to the Education reader and the Build Lab Mission Sun:

- warm dark/brown frame
- landscape images above each block
- simple one-question-at-a-time interaction
- result map with trait channels
- story lens box that asks one useful reframe question
- links from results into relevant education programs

Examples:

- High emotional weather -> Nervous System, Room to Breathe, Struggle & Letting Go
- High imagination + low structure -> Creativity, Organisational Intelligence
- High care + conflict sensitivity -> Belonging, Conflict Repair, Relational Intelligence
- Strong protective story -> Identity Becoming, Self-Talk, Hope Energy

This is how personality and education mix: the test identifies the active pattern; education gives the user a learning path to understand and move through that pattern.

### Deep Dive View

Clicking a trait opens:

- the score
- the confidence
- three key facets
- how it helps
- where it traps
- how to balance it

### Relationship Map

Show trait combinations as lines:

- Openness -> Conscientiousness = dream to structure channel
- Extraversion -> Agreeableness = social warmth channel
- Emotional Reactivity -> Conscientiousness = pressure/order channel

This can reuse Garden of Ideas constellation logic: bubbles, lines, evidence notes, and visual zoom.

### Personality Landscape

Long term:

- 3D terrain where valleys are default patterns
- rivers are recurring loops
- bridges are learned transitions
- the AI can say: "You are in the Creator-to-Survivor tension again."

## AI Layer

AI should not score the questionnaire by intuition. Scores come from structured answers.

AI can help with:

- translating results into plain language
- identifying repeated patterns from notes/check-ins
- comparing self-report personality with lived behaviour
- asking clarifying questions
- creating bridge missions
- reflecting the user's self-story and the lens through which they tell it
- dividing the story into chapters the user can revisit and rewrite
- showing how personality appears inside the story world: roles, defenses, gifts, avoided rooms, and possible next reactions

Example AI output:

> Your profile suggests that ideas are a relief system for you. That is a gift, but under pressure it can pull energy away from admin. The small question is not "how do I become organized?" It is "what structure lets creation stay alive without leaving Survival unattended?"

### AI Story Companion

The AI-assisted personality layer should feel like a playful story workshop.

Input:

- a spoken or written life fragment
- optional selected mood
- optional selected chapter title
- optional personality result from the structured test

Output:

- **Chapter title**: the current scene in the user's story
- **Story lens**: the interpretation the user is applying
- **Protective role**: which part of the personality is trying to help
- **Cost**: how that lens may reduce power or narrow possibility
- **Alternate lens**: a kinder, stronger recontextualization
- **Next scene**: one possible reaction that gives agency back

The AI should never say "this is your story" as a final truth. It should say "one way to read the story is..." and invite the user to rename, reject, or rewrite it.

Long term, this becomes a **comic book of your life**:

- Chapter cards
- visual panels
- old reaction / new reaction
- grief and failure recontextualized
- education links to people, artists, thinkers, or historical figures who moved through challenge with discipline, tenderness, or courage

This is how personality becomes dynamic: not "I am this type," but "in this chapter, through this lens, this part of me takes over; here is how I can move through it."

## Data Model Draft

```ts
interface PersonalitySession {
  id: string;
  userId: string;
  version: string;
  source: 'tipi' | 'ipip50' | 'ipip120' | 'colourmap-mode-pulse';
  status: 'draft' | 'complete';
  createdAt: string;
  completedAt: string | null;
}

interface PersonalityAnswer {
  id: string;
  sessionId: string;
  itemId: string;
  value: 1 | 2 | 3 | 4 | 5;
}

interface PersonalityTraitScore {
  sessionId: string;
  trait: 'openness' | 'conscientiousness' | 'extraversion' | 'agreeableness' | 'emotionalReactivity';
  rawScore: number;
  normalizedScore: number;
  confidence: 'glimpse' | 'standard' | 'deep';
}
```

## MVP Acceptance Criteria

- User can start a Personality Program from Education or Progress.
- User can complete a short quick glimpse.
- User can complete or resume a deeper Big Five assessment.
- Results show five trait channels, not a single fixed label.
- The app creates 1-3 Colourmap-native personality styles from the trait pattern.
- Each result includes gift, friction, and bridge move.
- The app includes a clear disclaimer: not clinical, not employment selection, for self-reflection only.
- IPIP source attribution is visible in an "About this assessment" collapsible section.
- Story Lens is included as a Colourmap-native axis in the first version.
- Results include a recontextualization question, not only trait scores.
- Results recommend education paths that match the user's pattern.

## Later Milestones

1. Full IPIP-NEO 120 with 30 facets.
2. RIASEC interests module using O*NET licensing and attribution.
3. AI comparison between personality results and lived Colourmap data.
4. Relationship mode: compare two users only with both users' consent.
5. Business mode: founder profile, work rhythm, leadership tension map.
6. Visual personality atlas: terrain, constellation, river, and mode bridge views.
