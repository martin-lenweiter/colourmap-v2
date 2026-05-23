let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (ctx) return ctx;
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return null;
    ctx = new Ctx();
    return ctx;
  } catch {
    return null;
  }
}

function softChime(freq: number, durationS: number, volume = 0.08, delayS = 0) {
  const c = getCtx();
  if (!c) return;
  try {
    const start = c.currentTime + delayS;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(volume, start + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + durationS);
    osc.connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + durationS + 0.04);
  } catch {}
}

function balloonDeflate() {
  const c = getCtx();
  if (!c) return;
  try {
    const start = c.currentTime;
    const duration = 0.42;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, start);
    osc.frequency.exponentialRampToValueAtTime(110, start + duration);

    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, start);
    filter.frequency.exponentialRampToValueAtTime(300, start + duration);
    filter.Q.value = 1.2;

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.08, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    osc.connect(filter).connect(gain).connect(c.destination);
    osc.start(start);
    osc.stop(start + duration + 0.05);
  } catch {}
}

export function playCorrect() {
  // soft major-third chime: C5 then E5, both gentle and fading
  softChime(523.25, 0.6, 0.07, 0);
  softChime(659.25, 0.7, 0.06, 0.06);
}

export function playWrong() {
  balloonDeflate();
}

export function playSessionComplete() {
  // ascending triad — C5, E5, G5 — gentle resolution
  softChime(523.25, 0.5, 0.07, 0);
  softChime(659.25, 0.55, 0.07, 0.12);
  softChime(783.99, 0.9, 0.08, 0.24);
}
