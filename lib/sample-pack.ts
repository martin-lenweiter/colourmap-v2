'use client';

/*
 * Sample-pack loader — lazy-loads one of the CC0 instrument packs in
 * public/sounds/{piano,violin,flute,harp}/ and plays a pitch-shifted
 * nearest-neighbor sample for a requested frequency.
 *
 * Packs come from tonejs-instruments (VSCO 2 Community, CC0). Each
 * pack has an index.json with a samplerMap mapping note names ('A4',
 * 'Cs3', ...) to mp3 filenames. We load the index once, then lazily
 * fetch and decode each mp3 on first use, and keep decoded buffers
 * in a module-level cache so multiple callers share buffers.
 *
 * A note name like 'Cs3' in the tonejs convention means C#3. We
 * normalize to a standard name → midi number before picking the
 * nearest sample.
 *
 * playSampledNote() creates a one-shot BufferSource, applies
 * playbackRate pitch-shift for the midi delta, and connects to the
 * provided output node.
 */

export type SamplePackId =
  | 'piano'
  | 'violin'
  | 'flute'
  | 'harp'
  | 'cello'
  | 'guitar-nylon'
  | 'contrabass'
  | 'french-horn'
  | 'organ'
  | 'saxophone'
  | 'bassoon'
  | 'clarinet'
  | 'xylophone';

interface SamplerMap {
  [noteName: string]: string;
}

interface PackNote {
  midi: number;
  url: string;
  buffer?: AudioBuffer;
}

interface LoadedPack {
  notes: PackNote[];
}

const packCache = new Map<SamplePackId, LoadedPack>();
const packLoading = new Map<SamplePackId, Promise<LoadedPack>>();

export function noteNameToMidi(name: string): number {
  const sanitized = name.replace(/^([A-G])s(\d+)$/, '$1#$2');
  const m = sanitized.match(/^([A-G])(#|b)?(-?\d+)$/);
  if (!m) return 60;
  const pitchClass = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }[
    m[1] as 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B'
  ];
  const accidental = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0;
  const octave = Number.parseInt(m[3], 10);
  return (octave + 1) * 12 + pitchClass + accidental;
}

export function freqToMidi(freq: number): number {
  return 12 * Math.log2(freq / 440) + 69;
}

export async function loadPack(packId: SamplePackId): Promise<LoadedPack> {
  const cached = packCache.get(packId);
  if (cached) return cached;
  const inflight = packLoading.get(packId);
  if (inflight) return inflight;
  const promise = (async () => {
    const res = await fetch(`/sounds/${packId}/index.json`);
    const json = (await res.json()) as { samplerMap: SamplerMap };
    const notes = Object.entries(json.samplerMap).map(([noteName, file]) => ({
      midi: noteNameToMidi(noteName),
      url: `/sounds/${packId}/${file}`,
    }));
    notes.sort((a, b) => a.midi - b.midi);
    const loaded: LoadedPack = { notes };
    packCache.set(packId, loaded);
    return loaded;
  })();
  packLoading.set(packId, promise);
  return promise;
}

export async function playSampledNote(
  ctx: AudioContext,
  packId: SamplePackId,
  freq: number,
  velocity: number,
  output: AudioNode,
): Promise<AudioBufferSourceNode | null> {
  const pack = await loadPack(packId);
  if (pack.notes.length === 0) return null;
  const midi = freqToMidi(freq);
  let nearest = pack.notes[0];
  let nearestDist = Math.abs(midi - nearest.midi);
  for (let i = 1; i < pack.notes.length; i++) {
    const d = Math.abs(midi - pack.notes[i].midi);
    if (d < nearestDist) {
      nearest = pack.notes[i];
      nearestDist = d;
    }
  }
  if (!nearest.buffer) {
    try {
      const res = await fetch(nearest.url);
      const buf = await res.arrayBuffer();
      nearest.buffer = await ctx.decodeAudioData(buf);
    } catch {
      return null;
    }
  }
  const src = ctx.createBufferSource();
  src.buffer = nearest.buffer;
  src.playbackRate.value = 2 ** ((midi - nearest.midi) / 12);
  const gain = ctx.createGain();
  gain.gain.value = velocity;
  src.connect(gain);
  gain.connect(output);
  src.start();
  return src;
}
