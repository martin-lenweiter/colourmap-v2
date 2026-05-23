'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { buildBillyGeometry } from '@/lib/billy-geometry';

const SERIF = 'var(--font-serif)';

export type Figure = {
  key: string;
  label: string;
  url: string;
  procedural?: 'billy';
};

const FIGURES: Figure[] = [
  { key: 'golden-god', label: 'Golden God', url: '/models/golden-god.obj' },
  { key: 'kid-lotus', label: 'Kid Lotus', url: '/models/kid-lotus.obj' },
  { key: 'billy', label: 'Billy', url: '', procedural: 'billy' },
  { key: 'spirit', label: 'Spirit', url: '/models/spirit.obj' },
  { key: 'butterfly-priest', label: 'Butterfly Priest', url: '/models/butterfly-priest.obj' },
  { key: 'butterfly-man', label: 'Butterfly Man', url: '/models/butterfly-man.obj' },
];

const PALETTES: { key: string; label: string; color: string; bg: string }[] = [
  { key: 'gold', label: 'Gold', color: '#FFE2A0', bg: '#0A0604' },
  { key: 'cyan', label: 'Cyan', color: '#8AE6FF', bg: '#040A12' },
  { key: 'violet', label: 'Violet', color: '#C8A8FF', bg: '#0A0612' },
  { key: 'rose', label: 'Rose', color: '#FF9AB8', bg: '#0E0608' },
  { key: 'mint', label: 'Mint', color: '#9AE8C0', bg: '#040C08' },
  { key: 'fire', label: 'Fire', color: '#FFAA60', bg: '#0E0604' },
  { key: 'pure', label: 'Pure', color: '#F5F0E0', bg: '#080808' },
];

const DENSITY_PRESETS = [8000, 16000, 32000, 64000, 96000];
const SIZE_PRESETS = [0.004, 0.006, 0.009, 0.014];

export default function FigureStarsBuilder() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [figure, setFigure] = useState<Figure>(FIGURES[0]);
  const [palette, setPalette] = useState(PALETTES[0]);
  const [density, setDensity] = useState(32000);
  const [size, setSize] = useState(0.006);
  const [pulseStrength, setPulseStrength] = useState(1);
  const [pulseSpeed, setPulseSpeed] = useState(1);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const pulseStrengthRef = useRef(1);
  const pulseSpeedRef = useRef(1);
  pulseStrengthRef.current = pulseStrength;
  pulseSpeedRef.current = pulseSpeed;

  const [samplerVersion, setSamplerVersion] = useState(0);

  // We keep a long-lived sampler so swapping density / palette is cheap and
  // doesn't refetch the OBJ.
  const samplerRef = useRef<MeshSurfaceSampler | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const figureUrlRef = useRef<string>(figure.url);

  const rebuildPoints = useCallback(
    (sampler: MeshSurfaceSampler, n: number, color: string, particleSize: number) => {
      const scene = sceneRef.current;
      if (!scene) return;
      // Remove previous
      if (pointsRef.current) {
        scene.remove(pointsRef.current);
        pointsRef.current.geometry.dispose();
        (pointsRef.current.material as THREE.PointsMaterial).dispose();
        pointsRef.current = null;
      }
      const positions = new Float32Array(n * 3);
      const tmp = new THREE.Vector3();
      for (let i = 0; i < n; i += 1) {
        sampler.sample(tmp);
        positions[i * 3] = tmp.x;
        positions[i * 3 + 1] = tmp.y;
        positions[i * 3 + 2] = tmp.z;
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.PointsMaterial({
        color,
        size: particleSize,
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.92,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const points = new THREE.Points(geom, mat);
      scene.add(points);
      pointsRef.current = points;
    },
    [],
  );

  // Initialize scene + load mesh once per figure
  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let frameId = 0;
    let disposed = false;
    figureUrlRef.current = figure.url;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 100);
    camera.position.set(0, 0, 2.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    mount.appendChild(renderer.domElement);

    setStatus('loading');

    const installGeom = (geom: THREE.BufferGeometry) => {
      geom.computeVertexNormals();
      geom.center();
      geom.computeBoundingSphere();
      const radius = geom.boundingSphere?.radius ?? 1;
      geom.scale(1 / radius, 1 / radius, 1 / radius);
      const tempMesh = new THREE.Mesh(geom);
      samplerRef.current = new MeshSurfaceSampler(tempMesh).build();
      setSamplerVersion((v) => v + 1);
      setStatus('ready');
    };

    if (figure.procedural === 'billy') {
      const geom = buildBillyGeometry();
      if (!disposed) installGeom(geom);
    } else {
      const loader = new OBJLoader();
      loader.load(
        figure.url,
        (group) => {
          if (disposed) return;
          let firstGeom: THREE.BufferGeometry | null = null;
          group.traverse((child) => {
            if (firstGeom) return;
            if ((child as THREE.Mesh).isMesh) {
              firstGeom = (child as THREE.Mesh).geometry.clone();
            }
          });
          if (!firstGeom) {
            setStatus('error');
            return;
          }
          installGeom(firstGeom);
        },
        undefined,
        () => {
          if (!disposed) setStatus('error');
        },
      );
    }

    let isDragging = false;
    let lastX = 0;
    let targetRot = 0;
    let currentRot = 0;
    const onPointerDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
      mount.setPointerCapture(e.pointerId);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return;
      targetRot += (e.clientX - lastX) * 0.01;
      lastX = e.clientX;
    };
    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      mount.releasePointerCapture(e.pointerId);
    };
    mount.addEventListener('pointerdown', onPointerDown);
    mount.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('pointerup', onPointerUp);
    mount.addEventListener('pointercancel', onPointerUp);

    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      currentRot += (targetRot - currentRot) * 0.15;
      const points = pointsRef.current;
      if (points) {
        points.rotation.y = currentRot + (isDragging ? 0 : t * 0.12);
        const breath =
          1 + Math.sin(t * 0.9 * pulseSpeedRef.current) * 0.04 * pulseStrengthRef.current;
        points.scale.setScalar(breath);
        const mat = points.material as THREE.PointsMaterial;
        mat.opacity = 0.7 + 0.22 * (0.5 + 0.5 * Math.sin(t * 1.3 * pulseSpeedRef.current));
      }
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      mount.removeEventListener('pointerdown', onPointerDown);
      mount.removeEventListener('pointermove', onPointerMove);
      mount.removeEventListener('pointerup', onPointerUp);
      mount.removeEventListener('pointercancel', onPointerUp);
      renderer.dispose();
      if (pointsRef.current) {
        pointsRef.current.geometry.dispose();
        (pointsRef.current.material as THREE.PointsMaterial).dispose();
        pointsRef.current = null;
      }
      samplerRef.current = null;
      sceneRef.current = null;
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
    // Re-init only when the figure URL changes. Palette and density are
    // applied without re-loading.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [figure.url, figure.procedural]);

  // Apply density / size / palette changes without re-loading the OBJ.
  // The samplerVersion dep ensures this also fires the very first time the
  // sampler becomes available.
  useEffect(() => {
    void samplerVersion;
    if (!samplerRef.current || !sceneRef.current) return;
    sceneRef.current.background = new THREE.Color(palette.bg);
    rebuildPoints(samplerRef.current, density, palette.color, size);
  }, [density, palette.bg, palette.color, size, rebuildPoints, samplerVersion]);

  const figureMemo = useMemo(() => figure, [figure]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: palette.bg,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          padding: '14px 22px 12px',
          borderBottom: '1px solid rgba(240,216,152,0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(240,216,152,0.55)',
          }}
        >
          Figure Stars · builder
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FIGURES.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFigure(f)}
              aria-pressed={figureMemo.key === f.key}
              style={pillStyle(figureMemo.key === f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mountRef} style={{ position: 'absolute', inset: 0, cursor: 'grab' }} />
        {status === 'loading' && <Overlay text="building stars…" />}
        {status === 'error' && <Overlay text="failed to load figure" color="#E78878" />}
      </div>

      <footer
        style={{
          padding: '12px 18px 16px',
          borderTop: '1px solid rgba(240,216,152,0.12)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          fontFamily: SERIF,
          color: 'rgba(240,216,152,0.78)',
          fontSize: 11,
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ letterSpacing: '0.16em', textTransform: 'uppercase' }}>palette</span>
          {PALETTES.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPalette(p)}
              aria-pressed={palette.key === p.key}
              aria-label={`Palette ${p.label}`}
              title={p.label}
              style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                cursor: 'pointer',
                background: p.color,
                border: `2px solid ${palette.key === p.key ? '#FFF' : 'rgba(0,0,0,0.6)'}`,
                boxShadow:
                  palette.key === p.key
                    ? `0 0 0 2px rgba(255,255,255,0.55), 0 0 10px ${p.color}`
                    : '0 0 0 1px rgba(0,0,0,0.4)',
                padding: 0,
              }}
            />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ letterSpacing: '0.16em', textTransform: 'uppercase' }}>density</span>
          {DENSITY_PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setDensity(n)}
              aria-pressed={density === n}
              style={pillStyle(density === n, 'tiny')}
            >
              {n / 1000}k
            </button>
          ))}
          <span style={{ marginLeft: 14, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            size
          </span>
          {SIZE_PRESETS.map((s, i) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              aria-pressed={size === s}
              style={pillStyle(size === s, 'tiny')}
            >
              {['xs', 's', 'm', 'l'][i]}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <Slider
            label="pulse"
            value={pulseStrength}
            min={0}
            max={3}
            step={0.1}
            onChange={setPulseStrength}
          />
          <Slider
            label="speed"
            value={pulseSpeed}
            min={0.1}
            max={3}
            step={0.1}
            onChange={setPulseSpeed}
          />
        </div>
      </footer>
    </div>
  );
}

function pillStyle(active: boolean, scale: 'normal' | 'tiny' = 'normal'): React.CSSProperties {
  return {
    background: active ? 'rgba(255,200,100,0.18)' : 'transparent',
    border: `1px solid ${active ? 'rgba(255,200,100,0.55)' : 'rgba(240,216,152,0.25)'}`,
    borderRadius: 999,
    color: active ? '#FFD080' : 'rgba(240,216,152,0.7)',
    fontFamily: SERIF,
    fontSize: scale === 'tiny' ? 11 : 12,
    letterSpacing: '0.08em',
    cursor: 'pointer',
    padding: scale === 'tiny' ? '4px 10px' : '6px 14px',
  };
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ letterSpacing: '0.16em', textTransform: 'uppercase' }}>{label}</span>
      <input
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ accentColor: '#FFD080', width: 140 }}
      />
      <span style={{ minWidth: 32 }}>{value.toFixed(1)}</span>
    </label>
  );
}

function Overlay({ text, color = 'rgba(240,216,152,0.6)' }: { text: string; color?: string }) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        fontFamily: SERIF,
        fontSize: 13,
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
      }}
    >
      {text}
    </div>
  );
}
