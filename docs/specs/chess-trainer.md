# Chess Trainer

**Status:** Spec, not implemented
**Date:** 2026-05-23
**Lives in:** Education

Chess Trainer is an Education program that teaches chess through openings, move-naming, and a personal memory of how the user has been playing. The aim is not "play chess online" — it is "learn chess the right way and watch your own pattern build."

## Why this belongs in Education

The Education layer ([[project_education_layer]]) treats every domain — emotional intelligence, agency, organisational intelligence — as something the user can train through guided practice. Chess fits the same shape: a craft with named patterns, a clear progression, and a long arc of skill. The trainer should feel like CoachNote with a board.

## Core Loop

1. User picks an **opening track** to study (Italian, Sicilian Najdorf, Caro-Kann, French, Ruy Lopez, etc.).
2. App walks them through the canonical line move by move, **naming every move** ("3.Bc4 — the bishop comes out to attack f7. This is the Giuoco Piano.").
3. At each step the app shows:
   - the **name of the move just played**
   - **two or three reasonable continuations** with their names
   - **what to watch for** (typical tactical motifs, common traps, what a strong opponent will threaten)
4. User plays a move (theory move or their own choice).
5. Each move is **saved into the user's track history** so progression is per-track, not per-session.
6. After enough moves, the app starts asking the user to recall — "what's the standard reply to 4...Nf6 in the Italian?" — using spaced repetition over their own track history.

## Robot Opponent — how easy is it really?

**Easy.** Stockfish compiles to WebAssembly (`stockfish.wasm`, ~700 KB, MIT licensed). Drop the worker into `public/`, talk to it via the standard UCI protocol over `postMessage`, and you have a tunable engine running in the user's browser with no server. It is genuinely a half-day of work to get "robot plays back at chosen Elo" working end to end.

What is **not** easy is making the robot *educational*. A raw Stockfish at 1200 Elo still plays moves a beginner can't explain. The valuable wrapper is:

- **clamp moves to the current opening track** until the user is out of book — so the robot is a study partner, not an opponent;
- **bias the robot toward the most-played reply** found in opening databases, not the strongest move, so the user sees real-world positions;
- after the book ends, **let Stockfish play freely but at user-chosen strength** (300–2500 Elo via skill-level parameter and search-depth limits);
- on every robot move, **show the move name and one-line motive** ("Nb5 — pressures c7 and threatens fork on d6"), generated either from a tactics tagger or from a Claude API call against the FEN.

So: robot itself = easy. Educational robot = the real work.

## Three Build Tiers

The full system is large. Build in tiers so each ships value.

### Tier 1 — Static Opening Tour (1–2 days)

- React board UI, click-to-move (no validation engine).
- Five seed openings hardcoded as JSON move trees: Italian, Sicilian Najdorf, Caro-Kann, French Defense, Ruy Lopez.
- Each node has: move (SAN), name, one-line teaching note, two or three candidate next moves.
- "What to watch for" tips per branch, written by hand.
- No move legality checks. No opponent. The user clicks through the canonical line as if reading an illustrated chapter.
- Local state only — which opening, which node, no persistence.

This tier teaches the **vocabulary** of openings: what the moves are called, what they aim at, which lines have names.

### Tier 2 — Real Trainer With Memory (~1 week)

- Add **chess.js** for legal move validation, check/checkmate, FEN/PGN, and SAN parsing.
- Add **react-chessboard** for the board UI with drag/drop.
- Persistent **track history per user**: every time you reach a given position in a given opening track, the visit is logged. The hub shows "Italian: 14 plays, you usually deviate at move 6."
- **Opening book lookup**: when the user reaches a known position, surface the top 2–3 master continuations with frequency ("64% play 4.O-O").
- **Threat overlay**: highlight pieces currently attacked and undefended, basic fork/pin geometry flagged.
- **Track progression** mirrors the rest of Education — Phase 1 (recognise the line), Phase 2 (recall it without prompts), Phase 3 (play it under a timer).
- Still **no engine playing back** — the app supplies the opponent moves from the opening tree or asks the user to play both sides.

This tier teaches **recall** and **pattern recognition**, which is the real value of opening study.

### Tier 3 — Personal Coach With Engine (multi-week)

- **Stockfish.wasm** integrated as a Web Worker. Engine plays the opponent side, clamped to the opening book until the line ends, then free play at user-chosen Elo.
- **Personal move history** feeds into a Claude API call after each game: "you got into a Greek Gift setup three games ago — same motif appeared on move 14 today." Comments are personal, not generic.
- **Tactical puzzle generation** from positions the user lost in their own games. The app remembers your blunders and surfaces them later as puzzles.
- **Spaced repetition** over the lines you keep getting wrong (Anki-style scheduling).
- **Style detection**: after enough games, the AI suggests a repertoire matching your demonstrated style — "you favour closed positions, try the French or the King's Indian."
- **Endgame trainer** as a sibling module (rook endings, king-and-pawn, basic mates).

This tier is the **personal coach**. It is what justifies the whole feature long-term.

## Data Model Sketch

```
ChessTrack {
  key: 'italian' | 'sicilian-najdorf' | 'caro-kann' | ...
  rootFen: string
  tree: ChessNode  // recursive: { move, san, name, note, watchFor, children: ChessNode[] }
}

UserChessHistory {
  trackKey: string
  visits: Array<{
    timestamp: number
    fenReached: string
    movesPlayed: string[]  // SAN
    deviatedAt: number | null  // index in canonical line where user went off-book
  }>
  weakSpots: Array<{ fen: string, lastFailedAt: number, attempts: number }>  // tier 3
}
```

`UserChessHistory` belongs in the same notebook-backed storage used by [[project_journal_system]] so it inherits sync/export for free.

## UI Surfaces

- **Education hub tile**: "Chess Trainer" next to Math, philosophy programs, etc.
- **Track picker**: grid of openings, each card shows last-visited date and your progress through that line.
- **Reader screen**: board on top, move-name and teaching note in the middle, candidate-next-move buttons at the bottom. Mirrors the comic-program reader rhythm so the visual language stays coherent ([[feedback_visual_coherence]]).
- **Free-play screen** (Tier 3 only): board with engine playing back, eval bar optional, post-game review.

## Where the Robot Difficulty Setting Lives

Stockfish exposes `setoption name Skill Level value 0..20`. Combined with `go depth 1..20` and a time budget, the realistic Elo range available is roughly 300 to 3000. For Education the useful range is **800 to 1800** — below 800 the engine plays nonsense moves that teach nothing, above 1800 the user gets crushed too fast to learn. Default tier-3 setting: **Skill Level 5, depth 8**, ≈1200 Elo.

## Non-Goals

- Not building a multiplayer chess server.
- Not building a chess rating / matchmaking system.
- Not competing with Lichess or Chess.com. The point is **personal teaching**, not infrastructure.

## Open Questions

- Should opening tracks be authored by hand (curated, ~50 lines each) or pulled from a public PGN database (broader, less opinionated)? Likely hybrid: curate the entry lines, pull the long tail.
- Where does the Claude API call live for personalized commentary — server route or client-side with user key? Probably server, mirroring [[project_full_spec]] approach.
- Does the trainer integrate with [[project_avatar_vision]] (chess rating shown on the Progress avatar)? Future question.

## Build Order Recommendation

Ship Tier 1 first as a standalone PR — even just the static tour is useful and validates the visual pattern. Tier 2 is the big-value middle PR. Tier 3 is research-mode and probably wants its own design pass before code.
