'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/* ─── Web Audio tick synthesis ───────────────────────────── */

type SoundId = 0 | 1 | 2 | 3 | 4;

const SOUND_LABELS = ['Wood', 'Sine', 'Bell', 'Brush', 'Cowbell'];

function playTick(ctx: AudioContext, accent: boolean, soundId: SoundId) {
  const t = ctx.currentTime;
  const vol = accent ? 1.0 : 0.55;

  if (soundId === 0) {
    // Wood block — short filtered noise burst
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.15));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = accent ? 900 : 700;
    filter.Q.value = 4;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(t);
  } else if (soundId === 1) {
    // Soft sine click
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(accent ? 880 : 660, t);
    osc.frequency.exponentialRampToValueAtTime(accent ? 440 : 330, t + 0.04);
    gain.gain.setValueAtTime(vol * 0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.1);
  } else if (soundId === 2) {
    // Bell — pure sine with slow decay
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = accent ? 1047 : 784;
    gain.gain.setValueAtTime(vol * 0.55, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (accent ? 0.35 : 0.18));
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + 0.4);
  } else if (soundId === 3) {
    // Brush — very soft white noise
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++)
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.3));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highshelf';
    filter.frequency.value = 4000;
    filter.gain.value = 6;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    src.start(t);
  } else {
    // Cowbell — two slightly detuned sines
    const freqs = [accent ? 562 : 490, accent ? 845 : 740];
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(vol * 0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + (accent ? 0.22 : 0.12));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    });
  }
}

/* ─── Visual designs ─────────────────────────────────────── */

type DesignId = 0 | 1 | 2 | 3 | 4;
const DESIGN_LABELS = ['Pulse', 'Pendulum', 'Ring', 'Bars', 'Dot'];

function VisualPulse({ beat, accent, color }: { beat: boolean; accent: boolean; color: string }) {
  return (
    <div
      style={{
        position: 'relative',
        width: 180,
        height: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Ripple rings */}
      {beat && (
        <>
          <div
            style={{
              position: 'absolute',
              width: 180,
              height: 180,
              borderRadius: '50%',
              border: `2px solid ${color}`,
              opacity: 0,
              animation: 'metronome-ripple 0.5s ease-out forwards',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 130,
              height: 130,
              borderRadius: '50%',
              border: `1.5px solid ${color}`,
              opacity: 0,
              animation: 'metronome-ripple 0.5s 0.05s ease-out forwards',
            }}
          />
        </>
      )}
      <div
        style={{
          width: accent ? 90 : 70,
          height: accent ? 90 : 70,
          borderRadius: '50%',
          background: beat ? color : `${color}30`,
          border: `2px solid ${color}`,
          transition: beat ? 'none' : 'all 0.15s ease',
          boxShadow: beat ? `0 0 ${accent ? 30 : 18}px ${color}60` : 'none',
        }}
      />
    </div>
  );
}

function VisualPendulum({
  beat: _beat,
  phase,
  accent,
  color,
}: {
  beat: boolean;
  phase: number;
  accent: boolean;
  color: string;
}) {
  const angle = Math.sin(phase * Math.PI * 2) * 38;
  return (
    <div
      style={{
        position: 'relative',
        width: 160,
        height: 180,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ position: 'relative', width: 160, height: 150, overflow: 'visible' }}>
        {/* Rod */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: 2,
            height: 120,
            background: `${color}40`,
            transformOrigin: 'top center',
            transform: `translateX(-50%) rotate(${angle}deg)`,
            transition: 'transform 0.05s linear',
          }}
        >
          {/* Bob */}
          <div
            style={{
              position: 'absolute',
              bottom: -12,
              left: -10,
              width: accent ? 22 : 18,
              height: accent ? 22 : 18,
              borderRadius: '50%',
              background: color,
              border: `2px solid ${color}`,
              boxShadow: `0 0 10px ${color}60`,
              transform: 'translateX(-50%) translateX(1px)',
            }}
          />
        </div>
        {/* Pivot */}
        <div
          style={{
            position: 'absolute',
            top: -4,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: `${color}60`,
          }}
        />
      </div>
      {/* Base */}
      <div style={{ width: 80, height: 2, background: `${color}25`, borderRadius: 2 }} />
    </div>
  );
}

function VisualRing({
  beat,
  accent,
  bpm,
  color,
}: {
  beat: boolean;
  accent: boolean;
  bpm: number;
  color: string;
}) {
  const circumference = 2 * Math.PI * 70;
  return (
    <div
      style={{
        position: 'relative',
        width: 180,
        height: 180,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg width={180} height={180} viewBox="0 0 180 180">
        <circle cx={90} cy={90} r={70} fill="none" stroke={`${color}15`} strokeWidth={6} />
        <circle
          cx={90}
          cy={90}
          r={70}
          fill="none"
          stroke={color}
          strokeWidth={accent ? 7 : 5}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={beat ? 0 : circumference}
          style={{
            transform: 'rotate(-90deg)',
            transformOrigin: '90px 90px',
            transition: beat ? 'none' : `stroke-dashoffset ${60 / bpm}s linear`,
          }}
          opacity={beat ? 1 : 0.3}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{bpm}</div>
        <div style={{ fontSize: 10, color: `${color}80`, letterSpacing: '0.12em' }}>BPM</div>
      </div>
    </div>
  );
}

function VisualBars({
  beat,
  beatIndex,
  beatsPerBar,
  color,
}: {
  beat: boolean;
  beatIndex: number;
  beatsPerBar: number;
  color: string;
}) {
  return (
    <div
      style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 120, padding: '0 12px' }}
    >
      {Array.from({ length: beatsPerBar }, (_, i) => {
        const isActive = i === beatIndex && beat;
        const isAccent = i === 0;
        const h = isActive ? (isAccent ? 90 : 65) : isAccent ? 28 : 20;
        return (
          <div
            key={i}
            style={{
              flex: 1,
              height: h,
              borderRadius: 4,
              background: isActive ? color : `${color}22`,
              border: `1.5px solid ${isActive ? color : `${color}30`}`,
              boxShadow: isActive ? `0 0 12px ${color}50` : 'none',
              transition: 'height 0.06s ease, background 0.06s ease',
            }}
          />
        );
      })}
    </div>
  );
}

function VisualDot({
  beat,
  accent,
  color,
  phase,
}: {
  beat: boolean;
  accent: boolean;
  color: string;
  phase: number;
}) {
  const y = Math.sin(phase * Math.PI * 2) * 40;
  return (
    <div
      style={{
        width: 160,
        height: 140,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Floor */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: 20,
          right: 20,
          height: 1,
          background: `${color}20`,
        }}
      />
      {/* Shadow */}
      <div
        style={{
          position: 'absolute',
          bottom: 10,
          left: '50%',
          width: beat ? (accent ? 36 : 28) : 16,
          height: 4,
          borderRadius: '50%',
          background: `${color}30`,
          transform: 'translateX(-50%)',
          transition: 'width 0.06s ease',
        }}
      />
      {/* Ball */}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          width: accent ? 34 : 26,
          height: accent ? 34 : 26,
          borderRadius: '50%',
          background: beat ? color : `${color}35`,
          border: `2px solid ${color}`,
          transform: `translateX(-50%) translateY(${-Math.abs(y)}px)`,
          boxShadow: beat ? `0 0 14px ${color}60` : 'none',
          transition: 'transform 0.04s linear',
        }}
      />
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────── */

const SUBDIVISION_OPTIONS: { label: string; value: number }[] = [
  { label: '1/4', value: 1 },
  { label: '1/8', value: 2 },
  { label: '1/16', value: 4 },
  { label: '3/4', value: 1 },
  { label: '6/8', value: 3 },
];

const TIME_SIGS: { label: string; beats: number }[] = [
  { label: '2/4', beats: 2 },
  { label: '3/4', beats: 3 },
  { label: '4/4', beats: 4 },
  { label: '5/4', beats: 5 },
  { label: '6/8', beats: 6 },
  { label: '7/8', beats: 7 },
];

const ACCENT_COLOR = '#C4A060';

export default function Metronome() {
  const [bpm, setBpm] = useState(90);
  const [playing, setPlaying] = useState(false);
  const [beatIndex, setBeatIndex] = useState(0);
  const [timeSig, setTimeSig] = useState(4);
  const [subdivision, setSubdivision] = useState(1);
  const [soundId, setSoundId] = useState<SoundId>(0);
  const [designId, setDesignId] = useState<DesignId>(0);
  const [bigMode, setBigMode] = useState(false);
  const [tick, setTick] = useState(false);
  const [phase, setPhase] = useState(0);

  const ctxRef = useRef<AudioContext | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const beatIdxRef = useRef(0);
  const subIdxRef = useRef(0);
  const phaseRef = useRef(0);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      void ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const scheduleNext = useCallback(() => {
    const interval = (60 / (bpm * subdivision)) * 1000;
    const isAccent = subIdxRef.current === 0;
    const isMainBeat = subIdxRef.current % subdivision === 0;

    if (isAccent) {
      const accent = beatIdxRef.current === 0;
      playTick(getCtx(), accent, soundId);
    } else {
      playTick(getCtx(), false, soundId);
    }

    const beat = beatIdxRef.current;
    const sub = subIdxRef.current;
    setTick(true);
    setTimeout(() => setTick(false), 80);
    if (isMainBeat) {
      setBeatIndex(beat);
    }

    phaseRef.current = (phaseRef.current + 1 / (timeSig * subdivision)) % 1;
    setPhase(phaseRef.current);

    subIdxRef.current = (sub + 1) % subdivision;
    if (subIdxRef.current === 0) {
      beatIdxRef.current = (beat + 1) % timeSig;
    }

    intervalRef.current = setTimeout(scheduleNext, interval);
  }, [bpm, subdivision, soundId, timeSig, getCtx]);

  useEffect(() => {
    if (playing) {
      beatIdxRef.current = 0;
      subIdxRef.current = 0;
      phaseRef.current = 0;
      scheduleNext();
    } else {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      setBeatIndex(0);
      setTick(false);
      setPhase(0);
    }
    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [playing, scheduleNext]);

  // Restart when settings change mid-play
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional restart on bpm/subdivision/timeSig change
  useEffect(() => {
    if (playing) {
      if (intervalRef.current) clearTimeout(intervalRef.current);
      beatIdxRef.current = 0;
      subIdxRef.current = 0;
      phaseRef.current = 0;
      scheduleNext();
    }
  }, [bpm, subdivision, timeSig]);

  const font = 'var(--font-serif)';
  const accent = beatIndex === 0 && tick;
  const visualBeat = tick;

  const visual = (() => {
    switch (designId) {
      case 0:
        return <VisualPulse beat={visualBeat} accent={accent} color={ACCENT_COLOR} />;
      case 1:
        return (
          <VisualPendulum beat={visualBeat} phase={phase} accent={accent} color={ACCENT_COLOR} />
        );
      case 2:
        return <VisualRing beat={visualBeat} accent={accent} bpm={bpm} color={ACCENT_COLOR} />;
      case 3:
        return (
          <VisualBars
            beat={visualBeat}
            beatIndex={beatIndex}
            beatsPerBar={timeSig}
            color={ACCENT_COLOR}
          />
        );
      case 4:
        return <VisualDot beat={visualBeat} accent={accent} color={ACCENT_COLOR} phase={phase} />;
    }
  })();

  return (
    <>
      <style>{`
        @keyframes metronome-ripple {
          0% { transform: scale(0.6); opacity: 0.7; }
          100% { transform: scale(1.1); opacity: 0; }
        }
      `}</style>
      <div
        style={{
          borderRadius: 16,
          border: '1px solid #C4A06020',
          background: '#C4A06006',
          padding: bigMode ? '20px 16px' : '14px 16px',
          fontFamily: font,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <span
            style={{
              flex: 1,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#C4A060',
              opacity: 0.7,
            }}
          >
            Metronome
          </span>
          <button
            type="button"
            onClick={() => setBigMode((v) => !v)}
            style={{
              fontSize: 9,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: '#C4A060',
              opacity: 0.45,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {bigMode ? 'compact' : 'big'}
          </button>
        </div>

        {/* Visual */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: bigMode ? 24 : 16,
            minHeight: bigMode ? 220 : 160,
          }}
        >
          <div
            style={{
              transform: bigMode ? 'scale(1.3)' : 'scale(1)',
              transformOrigin: 'center top',
            }}
          >
            {visual}
          </div>
        </div>

        {/* Design picker */}
        <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 14 }}>
          {DESIGN_LABELS.map((label, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setDesignId(i as DesignId)}
              style={{
                fontSize: 9,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                padding: '3px 8px',
                borderRadius: 99,
                cursor: 'pointer',
                background: designId === i ? '#C4A06015' : 'transparent',
                border: `1px solid ${designId === i ? '#C4A06040' : '#C4A06018'}`,
                color: designId === i ? '#C4A060' : '#8A6A4A',
                opacity: designId === i ? 1 : 0.55,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* BPM slider */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#8A6A4A', opacity: 0.5, minWidth: 28 }}>40</span>
            <input
              type="range"
              min={40}
              max={240}
              value={bpm}
              onChange={(e) => setBpm(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#C4A060' }}
            />
            <span
              style={{
                fontSize: 11,
                color: '#8A6A4A',
                opacity: 0.5,
                minWidth: 28,
                textAlign: 'right',
              }}
            >
              240
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => setBpm((v) => Math.max(40, v - 1))}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1px solid #C4A06030',
                background: '#C4A06008',
                color: '#C4A060',
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              −
            </button>
            <input
              type="number"
              value={bpm}
              min={40}
              max={240}
              onChange={(e) => {
                const v = Number(e.target.value);
                if (v >= 40 && v <= 240) setBpm(v);
              }}
              style={{
                width: 56,
                textAlign: 'center',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #C4A06030',
                outline: 'none',
                fontSize: 28,
                fontWeight: 700,
                color: '#C4A060',
                fontFamily: font,
              }}
            />
            <button
              type="button"
              onClick={() => setBpm((v) => Math.min(240, v + 1))}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1px solid #C4A06030',
                background: '#C4A06008',
                color: '#C4A060',
                fontSize: 16,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              +
            </button>
          </div>
        </div>

        {/* Time signature + subdivision */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <p
              style={{
                fontSize: 9,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#8A6A4A',
                opacity: 0.5,
                marginBottom: 5,
              }}
            >
              Time sig
            </p>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {TIME_SIGS.map((ts) => (
                <button
                  key={ts.label}
                  type="button"
                  onClick={() => setTimeSig(ts.beats)}
                  style={{
                    fontSize: 10,
                    padding: '3px 8px',
                    borderRadius: 99,
                    cursor: 'pointer',
                    background: timeSig === ts.beats ? '#C4A06018' : 'transparent',
                    border: `1px solid ${timeSig === ts.beats ? '#C4A06040' : '#C4A06018'}`,
                    color: timeSig === ts.beats ? '#C4A060' : '#8A6A4A',
                  }}
                >
                  {ts.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p
              style={{
                fontSize: 9,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#8A6A4A',
                opacity: 0.5,
                marginBottom: 5,
              }}
            >
              Accent
            </p>
            <div style={{ display: 'flex', gap: 3 }}>
              {SUBDIVISION_OPTIONS.filter((_, i) => i < 3).map((opt) => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => setSubdivision(opt.value)}
                  style={{
                    fontSize: 10,
                    padding: '3px 8px',
                    borderRadius: 99,
                    cursor: 'pointer',
                    background: subdivision === opt.value ? '#C4A06018' : 'transparent',
                    border: `1px solid ${subdivision === opt.value ? '#C4A06040' : '#C4A06018'}`,
                    color: subdivision === opt.value ? '#C4A060' : '#8A6A4A',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sound picker */}
        <div style={{ marginBottom: 16 }}>
          <p
            style={{
              fontSize: 9,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#8A6A4A',
              opacity: 0.5,
              marginBottom: 5,
            }}
          >
            Sound
          </p>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {SOUND_LABELS.map((label, i) => (
              <button
                key={label}
                type="button"
                onClick={() => setSoundId(i as SoundId)}
                style={{
                  fontSize: 10,
                  padding: '3px 10px',
                  borderRadius: 99,
                  cursor: 'pointer',
                  background: soundId === i ? '#C4A06018' : 'transparent',
                  border: `1px solid ${soundId === i ? '#C4A06040' : '#C4A06018'}`,
                  color: soundId === i ? '#C4A060' : '#8A6A4A',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Play / Stop */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              cursor: 'pointer',
              background: playing ? '#C4A06020' : '#C4A060',
              border: `2px solid ${playing ? '#C4A06060' : '#C4A060'}`,
              color: playing ? '#C4A060' : '#fff',
              fontSize: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: playing ? 'none' : '0 4px 16px #C4A06040',
              transition: 'all 0.15s ease',
            }}
          >
            {playing ? '■' : '▶'}
          </button>
        </div>

        {/* Beat indicator dots */}
        {playing && (
          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14 }}>
            {Array.from({ length: timeSig }, (_, i) => (
              <div
                key={i}
                style={{
                  width: i === 0 ? 10 : 7,
                  height: i === 0 ? 10 : 7,
                  borderRadius: '50%',
                  background:
                    i === beatIndex && tick ? '#C4A060' : i === 0 ? '#C4A06040' : '#C4A06022',
                  border: `1px solid ${i === 0 ? '#C4A06060' : '#C4A06030'}`,
                  transition: 'background 0.05s ease',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
