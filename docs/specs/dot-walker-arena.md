# Dot Walker Arena

**Status:** MVP
**Date:** 2026-05-15

Dot Walker Arena is the first game-like surface built from the Geometry Field character language.
It is currently kept as an experiment route rather than a primary navigation item: golden dot
walkers can dance to a beat or face each other in a simple phone-friendly arena.

## Product Aim

The long-term aim is not to clone a console fighting game. The aim is to turn Colourmap's living visual characters into interactive presences:

- playful phone games for agitation, night, and focus
- beat-reactive dance companions
- concert visuals where dot characters move with music
- future AI presences that gesture, talk, teach, and respond emotionally

The first version should feel like a beautiful toy and prototype, not a full fighting engine.

## Game Direction

The arena can grow through four layers:

**Layer 1: Duel**

- one player walker
- one enemy walker
- simple attacks, block, pulse, health, and distance

**Layer 2: Waves**

- enemies enter in small waves
- each cleared wave increases tempo, enemy count, or enemy aggression
- the player gets short recovery pulses between waves

**Layer 3: Enemy Families**

- **Rushers**: small fast dot walkers that close distance quickly
- **Guardians**: slower shield-like enemies that block often
- **Lancers**: stick/spear enemies with longer range
- **Blade Dancers**: sword enemies that move diagonally and strike in arcs
- **Echoes**: ghost/tornado-tail enemies that swirl and phase around the player

**Layer 4: Bosses**

- a larger golden/dark dot walker with a named phase pattern
- boss fights use readable rhythm: warning glow, dash, sweep, recovery
- boss can summon small echoes or create stage ripples

The point is not gore or violence. The fight should feel symbolic and choreographic: pressure, rhythm, movement, response.

## V1 Scope

V1 is a single route: `/dot-walker-arena`.

Done when:

- The route remains available at `/dot-walker-arena` for experiments without occupying primary
  navigation.
- The page renders two golden dot walkers on a dark warm stage.
- The user can switch between **Fight** and **Dance**.
- Fight mode has phone-friendly buttons: Step, Strike, Block, Pulse.
- Fight mode includes a first wave loop with enemy categories and a boss preview.
- Dance mode makes the walkers move with a beat-like rhythm.
- The page shows simple health/energy/status so the user understands what is happening.
- The arena works without audio permissions, backend data, or external assets.

## Controls

Phone-first controls:

- **Step**: move the player walker and dodge slightly.
- **Strike**: short-range attack that reduces opponent health when close.
- **Block**: temporary defensive stance.
- **Pulse**: visual burst and energy action.

Desktop can use the same buttons for now. Keyboard/gamepad can come later.

## Combat Language

Weapons are abstract golden lines:

- sticks/spears for long reach
- swords for arc attacks
- shields for blocking posture
- pulses for non-contact visual energy

The player should read danger from shape and timing:

- enemy glow before attack
- weapon line extending
- stage ripple on impact
- health/energy changes

## Special Attacks

Special attacks should make the game beautiful rather than cluttered. The rule:

```text
anticipation -> golden geometry -> impact -> silence
```

Possible specials:

- **Sun Pulse**: a circular golden shockwave that pushes enemies back.
- **Comet Step**: a fast dash leaving a dotted trail.
- **Lotus Guard**: a temporary petal shield around the walker.
- **Star Rain**: small golden dots fall diagonally and interrupt rushers.
- **Sword Halo**: a clean rotating arc around the body.
- **Tornado Legs**: ghost walker swirls through the stage, hard to hit but low health.
- **Beat Bloom**: in Dance mode, a perfect-timed tap expands both walkers into synchronized glow.

Beauty principles:

- no constant explosions
- every attack has a silhouette
- dots gather into a meaningful shape before impact
- motion follows rhythm, not random noise
- the stage breathes between actions
- phone controls stay simple, even if the visual result is rich

## Text Bursts And Quotes

The game can use small comic text bursts for impact:

- "Pow"
- "Bam"
- "Take this"
- "Pop"
- "Pulse"

These should appear briefly near the hit, then fade. They should feel playful and graphical, not like a notification.

Later, the arena can grow a philosophical quote system:

- quotes appear between waves, after defeat, or after a boss phase
- quotes connect to pressure, courage, rhythm, patience, attention, and self-mastery
- the quote system should not interrupt action
- quotes can eventually be chosen by the AI based on the player's pattern: rushing, blocking, overusing specials, recovering, or dancing well

## Visual Direction

- Warm dark stage, golden dots, calm paper UI around it.
- Walkers are made of dots, not realistic bodies.
- The game should not invent a separate character language. It should use the Dot Walker family as the source, but it should not alter the successful Geometry Field walker designs unless that shared renderer is extracted deliberately.
- Actions read visually through body pose, dot glow, stage ripples, and motion trails.
- Text should be minimal: the user should understand by seeing the stage first.

## Later

- Extract the Geometry Field Dot Walker renderer into a shared component so Geometry Field and Arena use the exact same implementation rather than parallel dot math.
- Music-reactive dance with BPM from Groove Machine / Music Art.
- Multiple walker designs from Geometry Field.
- Local two-player mode.
- Simple AI sparring partner.
- Story mode where dot walkers represent inner modes.
- AI conversation mode where the walker speaks and text writes underneath it.
