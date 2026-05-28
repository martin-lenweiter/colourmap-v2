'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { buildBillyGeometry } from '@/lib/billy-geometry';

const SERIF = 'var(--font-serif)';

type StarPattern =
  | 'still'
  | 'current'
  | 'spiral'
  | 'wave'
  | 'storm'
  | 'shimmer'
  | 'vortex'
  | 'scales'
  | 'nebula';

const STAR_PATTERNS: { key: StarPattern; label: string }[] = [
  { key: 'still', label: 'Still' },
  { key: 'current', label: 'Currents' },
  { key: 'spiral', label: 'Spiral' },
  { key: 'wave', label: 'Wave' },
  { key: 'storm', label: 'Storm' },
  { key: 'shimmer', label: 'Shimmer' },
  { key: 'vortex', label: 'Vortex' },
  { key: 'scales', label: 'Scales' },
  { key: 'nebula', label: 'Nebula' },
];

const STAR_COLORS = [
  { label: 'Gold', color: '#FFE2A0' },
  { label: 'Cyan', color: '#8AE6FF' },
  { label: 'Violet', color: '#C8A8FF' },
  { label: 'Rose', color: '#FF9AB8' },
  { label: 'Mint', color: '#9AE8C0' },
  { label: 'Fire', color: '#FFAA60' },
  { label: 'Pure', color: '#F5F0E0' },
];

const TRIO = [
  { key: 'golden-god', label: 'Golden God', url: '/models/golden-god.obj', x: -1.25 },
  { key: 'kid-lotus', label: 'Kid Lotus', url: '/models/kid-lotus.obj', x: 0 },
  { key: 'billy', label: 'Billy', url: '', x: 1.25, procedural: true },
];

export default function FigureStarsTrio() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [pattern, setPattern] = useState<StarPattern>('current');
  const [cameraDistance, setCameraDistance] = useState(4.8);
  const [glow, setGlow] = useState(1.2);
  const [starHue, setStarHue] = useState(42);
  const [starSaturation, setStarSaturation] = useState(100);
  const [starLightness, setStarLightness] = useState(82);
  const [agitation, setAgitation] = useState(0.6);
  const [speed, setSpeed] = useState(1);
  const [autoRotate, setAutoRotate] = useState(true);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const patternRef = useRef<StarPattern>('current');
  const cameraDistanceRef = useRef(4.8);
  const glowRef = useRef(1.2);
  const starHueRef = useRef(42);
  const starSaturationRef = useRef(100);
  const starLightnessRef = useRef(82);
  const agitationRef = useRef(0.6);
  const speedRef = useRef(1);
  const autoRotateRef = useRef(true);
  patternRef.current = pattern;
  cameraDistanceRef.current = cameraDistance;
  glowRef.current = glow;
  starHueRef.current = starHue;
  starSaturationRef.current = starSaturation;
  starLightnessRef.current = starLightness;
  agitationRef.current = agitation;
  speedRef.current = speed;
  autoRotateRef.current = autoRotate;

  const loadObjGeometry = useCallback(async (url: string) => {
    const loader = new OBJLoader();
    const group = await loader.loadAsync(url);
    group.updateMatrixWorld(true);
    const geometries: THREE.BufferGeometry[] = [];
    group.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const geom = mesh.geometry.clone();
        geom.applyMatrix4(mesh.matrixWorld);
        geometries.push(geom);
      }
    });
    const merged = geometries.length === 1 ? geometries[0] : mergeGeometries(geometries, false);
    for (const geom of geometries) {
      if (geom !== merged) geom.dispose();
    }
    if (!merged) throw new Error('No geometry found');
    return merged;
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let frameId = 0;
    let disposed = false;

    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#050302');
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.01, 100);
    camera.position.set(0, 0, cameraDistanceRef.current);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    mount.appendChild(renderer.domElement);

    const group = new THREE.Group();
    scene.add(group);
    const pointsList: THREE.Points[] = [];

    async function install() {
      try {
        for (const figure of TRIO) {
          const geom = figure.procedural ? buildBillyGeometry() : await loadObjGeometry(figure.url);
          if (disposed) return;
          geom.computeVertexNormals();
          geom.center();
          geom.computeBoundingSphere();
          const radius = geom.boundingSphere?.radius ?? 1;
          geom.scale(1 / radius, 1 / radius, 1 / radius);
          const mesh = new THREE.Mesh(geom);
          const sampler = new MeshSurfaceSampler(mesh).build();
          const count = figure.procedural ? 20000 : 18000;
          const positions = new Float32Array(count * 3);
          const tmp = new THREE.Vector3();
          for (let i = 0; i < count; i += 1) {
            sampler.sample(tmp);
            positions[i * 3] = tmp.x;
            positions[i * 3 + 1] = tmp.y;
            positions[i * 3 + 2] = tmp.z;
          }
          const starGeom = new THREE.BufferGeometry();
          starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
          const mat = new THREE.PointsMaterial({
            color: figure.procedural
              ? '#FFD060'
              : figure.key === 'kid-lotus'
                ? '#F4E8D0'
                : '#FFE2A0',
            size: 0.007,
            sizeAttenuation: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          const pts = new THREE.Points(starGeom, mat);
          pts.position.x = figure.x;
          pts.userData.basePositions = Float32Array.from(positions);
          pts.userData.phase = pointsList.length * 1.4;
          group.add(pts);
          pointsList.push(pts);
        }
        if (!disposed) setStatus('ready');
      } catch {
        if (!disposed) setStatus('error');
      }
    }

    void install();

    let targetRot = 0;
    let currentRot = 0;
    let dragging = false;
    let lastX = 0;
    const onPointerDown = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      mount.setPointerCapture(event.pointerId);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!dragging) return;
      targetRot += (event.clientX - lastX) * 0.008;
      lastX = event.clientX;
    };
    const onPointerUp = (event: PointerEvent) => {
      dragging = false;
      mount.releasePointerCapture(event.pointerId);
    };
    mount.addEventListener('pointerdown', onPointerDown);
    mount.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('pointerup', onPointerUp);
    mount.addEventListener('pointercancel', onPointerUp);

    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      camera.position.z += (cameraDistanceRef.current - camera.position.z) * 0.08;
      currentRot += (targetRot - currentRot) * 0.12;
      group.rotation.y =
        currentRot + (dragging || !autoRotateRef.current ? 0 : Math.sin(t * 0.16) * 0.08);
      for (const points of pointsList) {
        const phase = (points.userData.phase as number) ?? 0;
        points.rotation.y = autoRotateRef.current ? Math.sin(t * 0.35 + phase) * 0.22 : 0;
        points.rotation.z = autoRotateRef.current ? Math.sin(t * 0.22 + phase) * 0.035 : 0;
        const mat = points.material as THREE.PointsMaterial;
        mat.color = starGlowColor(
          starHueRef.current,
          starSaturationRef.current,
          starLightnessRef.current,
          glowRef.current,
        );
        mat.size = 0.006 + glowRef.current * 0.0042;
        mat.opacity = Math.min(0.98, 0.52 + glowRef.current * 0.14);
        animateStarPattern(
          points,
          t * speedRef.current + phase,
          patternRef.current,
          agitationRef.current,
        );
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
      for (const points of pointsList) {
        points.geometry.dispose();
        (points.material as THREE.PointsMaterial).dispose();
      }
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, [loadObjGeometry]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#050302',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          padding: '14px 22px 12px',
          borderBottom: '1px solid rgba(240,216,152,0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 10,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'rgba(240,216,152,0.58)',
          }}
        >
          Figure Stars · trio
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {STAR_PATTERNS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setPattern(item.key)}
              style={pillStyle(pattern === item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>

      <div style={{ flex: 1, position: 'relative' }}>
        <div ref={mountRef} style={{ position: 'absolute', inset: 0, cursor: 'grab' }} />
        {status === 'loading' && <Overlay text="assembling trio..." />}
        {status === 'error' && <Overlay text="failed to load trio" color="#E78878" />}
      </div>

      <footer
        style={{
          padding: '12px 18px 16px',
          borderTop: '1px solid rgba(240,216,152,0.12)',
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          justifyContent: 'center',
          fontFamily: SERIF,
          color: 'rgba(240,216,152,0.78)',
          fontSize: 11,
        }}
      >
        <Slider
          label="zoom"
          value={cameraDistance}
          min={3.2}
          max={7.2}
          step={0.1}
          onChange={setCameraDistance}
        />
        <Slider label="glow" value={glow} min={0.2} max={4.2} step={0.1} onChange={setGlow} />
        {STAR_COLORS.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              const hsl = hexToHsl(item.color);
              setStarHue(hsl.h);
              setStarSaturation(hsl.s);
              setStarLightness(hsl.l);
            }}
            aria-label={`Star colour ${item.label}`}
            title={item.label}
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              cursor: 'pointer',
              background: item.color,
              border: '1px solid rgba(255,255,255,0.65)',
              boxShadow: `0 0 ${8 + glow * 5}px ${item.color}`,
              padding: 0,
            }}
          />
        ))}
        <Slider label="hue" value={starHue} min={0} max={360} step={1} onChange={setStarHue} />
        <Slider
          label="sat"
          value={starSaturation}
          min={0}
          max={100}
          step={1}
          onChange={setStarSaturation}
        />
        <Slider
          label="light"
          value={starLightness}
          min={25}
          max={95}
          step={1}
          onChange={setStarLightness}
        />
        <Slider
          label="agitate"
          value={agitation}
          min={0}
          max={2.5}
          step={0.1}
          onChange={setAgitation}
        />
        <Slider label="speed" value={speed} min={0.2} max={2.6} step={0.1} onChange={setSpeed} />
        <button
          type="button"
          onClick={() => setAutoRotate((current) => !current)}
          aria-pressed={!autoRotate}
          style={pillStyle(!autoRotate)}
        >
          Static
        </button>
      </footer>
    </div>
  );
}

function animateStarPattern(
  points: THREE.Points,
  t: number,
  pattern: StarPattern,
  agitation: number,
) {
  const base = points.userData.basePositions as Float32Array | undefined;
  if (!base) return;
  const attr = points.geometry.getAttribute('position') as THREE.BufferAttribute;
  const arr = attr.array as Float32Array;
  const amp = agitation * 0.035;

  for (let i = 0; i < base.length; i += 3) {
    const x = base[i];
    const y = base[i + 1];
    const z = base[i + 2];
    let nx = x;
    let ny = y;
    let nz = z;

    if (pattern === 'current') {
      nx += Math.sin(t * 0.8 + y * 4.5 + z * 2.2) * amp * 0.5;
      ny += Math.sin(t * 1.2 + x * 5.2) * amp;
      nz += Math.cos(t * 0.9 + y * 3.4) * amp * 0.45;
    } else if (pattern === 'spiral') {
      const angle = Math.atan2(z, x);
      const radius = Math.sqrt(x * x + z * z);
      const swirl = angle + Math.sin(t * 0.55 + y * 4.2) * amp * 2.6;
      nx = Math.cos(swirl) * radius;
      nz = Math.sin(swirl) * radius;
      ny += Math.sin(t * 0.7 + radius * 6) * amp * 0.5;
    } else if (pattern === 'wave') {
      ny += Math.sin(t * 1.6 + x * 7.5) * amp * 1.35;
      nz += Math.cos(t * 1.1 + y * 5.5) * amp * 0.6;
    } else if (pattern === 'storm') {
      nx += Math.sin(t * 2.1 + y * 9.1 + z * 3.7) * amp * 1.35;
      ny += Math.cos(t * 1.8 + x * 8.4) * amp * 1.1;
      nz += Math.sin(t * 2.4 + x * 3.1 + y * 6.6) * amp * 1.35;
    } else if (pattern === 'shimmer') {
      const local = Math.sin(t * 2.4 + x * 18.0 + y * 9.0 + z * 13.0) * amp * 0.22;
      nx += x * local;
      ny += y * local;
      nz += z * local;
    } else if (pattern === 'vortex') {
      const radius = Math.max(0.001, Math.sqrt(x * x + z * z));
      const drift = Math.sin(t * 1.1 + y * 7.0 + radius * 5.0) * amp * 0.55;
      nx += (-z / radius) * drift;
      nz += (x / radius) * drift;
      ny += Math.cos(t * 0.9 + radius * 10.0) * amp * 0.12;
    } else if (pattern === 'scales') {
      const bands = Math.sin((y + 1.0) * 18.0 + t * 1.5);
      const ribs = Math.cos(Math.atan2(z, x) * 10.0 + t * 0.8);
      const shell = Math.max(0, bands * ribs) * amp * 0.28;
      nx += x * shell;
      ny += Math.sin(t * 1.4 + x * 12.0) * amp * 0.08;
      nz += z * shell;
    } else if (pattern === 'nebula') {
      nx += Math.sin(t * 0.9 + x * 11.0 + y * 3.0) * amp * 0.32;
      ny += Math.cos(t * 1.0 + y * 12.0 + z * 2.0) * amp * 0.32;
      nz += Math.sin(t * 0.8 + z * 11.0 + x * 3.0) * amp * 0.32;
    }

    arr[i] = nx;
    arr[i + 1] = ny;
    arr[i + 2] = nz;
  }
  attr.needsUpdate = true;
}

function pillStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? 'rgba(255,200,100,0.18)' : 'transparent',
    border: `1px solid ${active ? 'rgba(255,200,100,0.55)' : 'rgba(240,216,152,0.25)'}`,
    borderRadius: 999,
    color: active ? '#FFD080' : 'rgba(240,216,152,0.7)',
    fontFamily: SERIF,
    fontSize: 11,
    letterSpacing: '0.08em',
    cursor: 'pointer',
    padding: '5px 11px',
  };
}

function starHsl(hue: number, saturation: number, lightness: number) {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function starGlowColor(hue: number, saturation: number, lightness: number, glow: number) {
  return new THREE.Color(
    starHsl(hue, saturation, Math.min(98, lightness + glow * 3)),
  ).multiplyScalar(1.1 + glow * 0.42);
}

function hexToHsl(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) };
  }
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return { h: Math.round(h * 60), s: Math.round(s * 100), l: Math.round(l * 100) };
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
        aria-label={`${label} slider`}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event) => onChange(Number(event.target.value))}
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
