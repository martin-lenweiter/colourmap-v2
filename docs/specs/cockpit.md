# Cockpit

> A radar/wheel chart showing life balance across 4 categories plus current emotional state — the payoff screen that makes check-ins and scans feel worth doing.

## Context

Check-ins and life scans produce data but have no visual payoff. Without the cockpit, there's no reason to keep doing them. The cockpit closes the loop: see yourself clearly in one glance, then move.

## Behavior

- Radar/wheel chart displaying the 4 life scan categories (Body, Mind, Relationships, Purpose).
- Current emotional state from the latest check-in displayed prominently alongside the radar.
- Updates live as new check-in or life scan data comes in.
- Read-only. No input on this screen — it's a display.
- Design philosophy: cockpit, not coach. Shows your state, doesn't tell you what to do. Feeling of peace and calm.

## Focus Background Field

The Focus surface can evolve toward a full-bleed illustrated background behind the main Emotions,
Missions, and Progress areas. The reference direction is a mountain / landscape image with enough
atmosphere to create depth, but enough quiet space for the cockpit UI to remain readable.

Hard layout rules:

- The image begins immediately below the Focus / AI / Notes / Education / Art header.
- It touches the left, right, and bottom edges of the viewport. It must not sit inside a card,
  framed panel, rounded container, or padded island.
- Emotions, Missions, and Progress float over the same continuous image field so the cockpit reads
  as one world, not three unrelated picture cards.
- The image can be dimmed, blurred lightly, or overlaid with theme-aware ink/cream gradients, but
  the artwork should still be visible as the shared background.
- Text and controls remain the priority. Every foreground cell must keep sufficient contrast in low
  light and on weak mobile screens.
- The background asset should be compressed WebP or AVIF, with responsive sizes and lazy variants
  where possible. Do not ship a large decorative image that blocks the daily check-in.
- Generated artwork must reach the image edges. No baked-in borders, white frames, fake paper mats,
  or gutters.

Good image direction:

- wide mountain, road, valley, field, night-sky, or symbolic landscape
- clear depth from foreground to horizon
- quiet zones where UI can sit
- restrained color, not a one-note beige or purple-blue wash
- emotionally spacious rather than depressive

## Progress Success Dashboard Direction

Progress should make improvement visible and felt, but it must stay sober, spacious, and relaxing
to watch. The goal is not gamification noise. The goal is a calm success dashboard that quietly
shows: "things are moving, I can see what is improving, and my effort is becoming context."

Core feeling:

- evidence-based confidence, not hype
- upward movement without pressure
- visual success without confetti, flashing badges, or aggressive productivity language
- a stable screen the user can leave open without fatigue
- encouragement that comes from real patterns, not empty motivation

Visual language:

- slow rising graph paths, light trails, observatory lines, terraces, roads, or milestones
- one dominant calm image field, with enough empty space for the UI to breathe
- one or two slow ambient motions at most: breathing glow, soft light shift, or slow graph shimmer
- power quotes can appear, but they should be short, quiet, and visually secondary to the user's data
- 3D, when used here, should appear as one calm progress presence or avatar, not a cluster of widgets

Avoid:

- dense metric walls
- many simultaneous animations
- celebratory overload
- fake achievement language detached from the user's actual data
- dark, heavy, or defeated imagery
- layouts that make Progress feel like a trading dashboard or a game menu

AI-generated Progress observations must be grounded in recorded behavior: missions completed,
categories revisited, check-ins made, patterns noticed, streaks recovered, or emotional range
becoming clearer. The subconscious message should be success through witnessed effort, not success
through forced positivity.

## States & Edge Cases

- No check-in data yet: show the cockpit structure with empty/placeholder emotional state. Don't hide the screen.
- No life scan data yet: show the radar chart with empty/default values for all 4 categories. Indicate that a scan is needed.
- Partial life scan: render completed categories, show remaining as empty/default.
- Stale data (e.g. life scan is 2 weeks old): display as-is in V1. No staleness indicators.
- Multiple check-ins same day: cockpit shows the most recent one.

## Done When

- Cockpit visually reflects the latest check-in and life scan data.
- Radar chart updates as new data comes in without page refresh.
- The screen is scannable in under 5 seconds — the user's current state is immediately obvious.
- Works with zero data, partial data, and full data without breaking.

## Dependencies

- Check-in data (emotional state).
- Life scan data (4 category ratings).
- Both features must persist data to Supabase for the cockpit to read.
