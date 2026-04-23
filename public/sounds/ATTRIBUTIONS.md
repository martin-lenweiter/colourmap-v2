# Audio Sample Attributions

All sample files shipped in `public/sounds/` must be commercially redistributable (since the app serves them to end users' browsers). This file is the license record. When adding new audio, append an entry here in the same change.

---

## Instruments

### Piano — `public/sounds/piano/` (85 files, ~16 MB)

- **Instrument source:** [Versilian Studios Community Orchestra 2 (VSCO 2)](https://vis.versilstudios.com/vsco-community.html)
- **Intermediate distribution:** [tonejs-instruments](https://github.com/nbrosowsky/tonejs-instruments) by Nicolas Brosowsky — collates and edits VSCO 2 samples for `Tone.Sampler` use (trimmed silence, normalized, pitch-corrected)
- **License:** CC0 (VSCO 2 Community Edition)
- **Retrieval date:** 2026-04-23
- **Retrieval method:** `curl` against `raw.githubusercontent.com` — per-note `.mp3` files
- **Files:** A0–C8 chromatic (A, A#/As, B, C, C#/Cs, D, D#/Ds, E, F, F#/Fs, G, G#/Gs)
- **Commercial use:** ✅ allowed
- **Redistribution:** ✅ allowed
- **Attribution required:** optional (CC0) — we credit anyway as good practice

### Violin — `public/sounds/violin/` (15 files, ~4.7 MB)

- **Instrument source:** VSCO 2 Community
- **Intermediate distribution:** tonejs-instruments
- **License:** CC0
- **Retrieval date:** 2026-04-23
- **Notes:** Sparser than piano — mostly root + 5th every octave. `Tone.Sampler` interpolates missing notes.

### Flute — `public/sounds/flute/` (10 files, ~1.8 MB)

- **Instrument source:** VSCO 2 Community
- **Intermediate distribution:** tonejs-instruments
- **License:** CC0
- **Retrieval date:** 2026-04-23

### Harp — `public/sounds/harp/` (23 files, ~4.7 MB)

- **Instrument source:** VSCO 2 Community
- **Intermediate distribution:** tonejs-instruments
- **License:** CC0
- **Retrieval date:** 2026-04-23

---

## Drums / Percussion — `public/sounds/drums/`

### `Djembe.ogg` (165 KB)

- **Source:** [Wikimedia Commons — File:Djembe.ogg](https://commons.wikimedia.org/wiki/File:Djembe.ogg)
- **Author:** Freddythehat (English Wikipedia)
- **License:** Public Domain
- **Retrieval date:** 2026-04-23

### `SingingBowl1.ogg` (108 KB)

- **Source:** [Wikimedia Commons — File:SingingBowl1.ogg](https://commons.wikimedia.org/wiki/File:SingingBowl1.ogg)
- **Author:** BambooBeast
- **License:** Public Domain
- **Retrieval date:** 2026-04-23

### `Tambourine.ogg` (712 KB)

- **Source:** [Wikimedia Commons — File:Tambourine.ogg](https://commons.wikimedia.org/wiki/File:Tambourine.ogg)
- **Author:** Freddythehat (English Wikipedia)
- **License:** Public Domain
- **Retrieval date:** 2026-04-23

### `Schamanische_Reise.ogg` (20 MB — long ambient shamanic journey, ~60 min)

- **Source:** [Wikimedia Commons — File:Schamanische Reise.ogg](https://commons.wikimedia.org/wiki/File:Schamanische_Reise.ogg)
- **Author:** Schamanenstube.com
- **License:** Public Domain
- **Retrieval date:** 2026-04-23
- **Note:** Large file. If mobile bundle size becomes a concern, consider moving to Supabase Storage and lazy-loading this layer.

---

## Licensing policy for new additions

When adding new sample files to this repo, **only** the following licenses are acceptable:

- **Public Domain** (preferred — no obligations)
- **CC0** (same as Public Domain for our purposes)
- **CC-BY** or **CC-BY 3.0 / 4.0** (attribution required — add to this file)

**Do NOT add:**

- **CC BY-SA** — share-alike licenses can force derivative works (user-created mixes) to be licensed the same way. This conflicts with a commercial SaaS where users own their output.
- **CC BY-NC** or any non-commercial clause — app is commercial.
- **GPL-licensed audio** — can extend to derivative works; legal gray area for commercial web app.
- **Proprietary EULAs that forbid redistribution** — e.g. Spitfire LABS. Fine for local DAW use, not for a web app that streams samples to browsers.
- **"Free for personal/educational use only"** — e.g. BBC Sound Effects, some academic sample libraries.

### Source-verification checklist before committing new audio

1. Open the source page, copy the exact license text.
2. Confirm the license is in the allowed list above.
3. Note the author / uploader name if CC-BY.
4. Add an entry to this file with: filename, URL, author, license, retrieval date.
5. If the file is > 5 MB, consider whether it belongs in the repo or in Supabase Storage / a CDN.

---

## Historical note

Pre-2026-04-23 "real-*.ogg" files in `public/sounds/` are the earlier batch from Wikimedia Commons. Those entries pre-date this attribution file and should be added retroactively in a follow-up audit PR (tracked as a TODO in `docs/specs/next-steps.md` under Phase 1 housekeeping).
