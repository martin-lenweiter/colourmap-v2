'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
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
const PRESET_KEY = 'colourmap:figure-star-presets';

type StarPreset = {
  label: string;
  figureKey: string;
  paletteKey: string;
  density: number;
  size: number;
  cameraDistance: number;
  glow: number;
  pulseStrength: number;
  pulseSpeed: number;
  hue: number;
  saturation: number;
  lightness: number;
  agitation: number;
  flowScale: number;
  pattern: StarPattern;
  lowPower: boolean;
};

const DEFAULT_STAR_PRESETS: StarPreset[] = [
  {
    label: 'Calm Lotus',
    figureKey: 'kid-lotus',
    paletteKey: 'pure',
    density: 16000,
    size: 0.006,
    cameraDistance: 4.4,
    glow: 0.9,
    pulseStrength: 0.7,
    pulseSpeed: 0.6,
    hue: 45,
    saturation: 48,
    lightness: 88,
    agitation: 0.25,
    flowScale: 0.7,
    pattern: 'current',
    lowPower: true,
  },
  {
    label: 'Billy Spiral',
    figureKey: 'billy',
    paletteKey: 'gold',
    density: 32000,
    size: 0.009,
    cameraDistance: 4.8,
    glow: 1.35,
    pulseStrength: 1.2,
    pulseSpeed: 1,
    hue: 42,
    saturation: 100,
    lightness: 82,
    agitation: 0.75,
    flowScale: 1.2,
    pattern: 'spiral',
    lowPower: false,
  },
  {
    label: 'Low Wifi',
    figureKey: 'golden-god',
    paletteKey: 'gold',
    density: 8000,
    size: 0.006,
    cameraDistance: 4.9,
    glow: 0.8,
    pulseStrength: 0.4,
    pulseSpeed: 0.5,
    hue: 42,
    saturation: 88,
    lightness: 82,
    agitation: 0.1,
    flowScale: 0.5,
    pattern: 'still',
    lowPower: true,
  },
];

export default function FigureStarsBuilder() {
  const searchParams = useSearchParams();
  const requestedFigure = searchParams.get('figure');
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [figure, setFigure] = useState<Figure>(
    FIGURES.find((entry) => entry.key === requestedFigure) ?? FIGURES[0],
  );
  const [palette, setPalette] = useState(PALETTES[0]);
  const [density, setDensity] = useState(32000);
  const [size, setSize] = useState(0.006);
  const [pulseStrength, setPulseStrength] = useState(1);
  const [pulseSpeed, setPulseSpeed] = useState(1);
  const [cameraDistance, setCameraDistance] = useState(3.1);
  const [glow, setGlow] = useState(1);
  const [starHue, setStarHue] = useState(42);
  const [starSaturation, setStarSaturation] = useState(100);
  const [starLightness, setStarLightness] = useState(82);
  const [agitation, setAgitation] = useState(0.5);
  const [flowScale, setFlowScale] = useState(1);
  const [pattern, setPattern] = useState<StarPattern>('current');
  const [lowPower, setLowPower] = useState(false);
  const [savedPresets, setSavedPresets] = useState<StarPreset[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');

  const pulseStrengthRef = useRef(1);
  const pulseSpeedRef = useRef(1);
  const cameraDistanceRef = useRef(3.1);
  const glowRef = useRef(1);
  const starHueRef = useRef(42);
  const starSaturationRef = useRef(100);
  const starLightnessRef = useRef(82);
  const agitationRef = useRef(0.5);
  const flowScaleRef = useRef(1);
  const patternRef = useRef<StarPattern>('current');
  const lowPowerRef = useRef(false);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  pulseStrengthRef.current = pulseStrength;
  pulseSpeedRef.current = pulseSpeed;
  cameraDistanceRef.current = cameraDistance;
  glowRef.current = glow;
  starHueRef.current = starHue;
  starSaturationRef.current = starSaturation;
  starLightnessRef.current = starLightness;
  agitationRef.current = agitation;
  flowScaleRef.current = flowScale;
  patternRef.current = pattern;
  lowPowerRef.current = lowPower;

  const [samplerVersion, setSamplerVersion] = useState(0);

  // We keep a long-lived sampler so swapping density / palette is cheap and
  // doesn't refetch the OBJ.
  const samplerRef = useRef<MeshSurfaceSampler | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const figureUrlRef = useRef<string>(figure.url);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PRESET_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StarPreset[];
      if (Array.isArray(parsed)) setSavedPresets(parsed.slice(0, 6));
    } catch {}
  }, []);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer) return;
    renderer.setPixelRatio(lowPower ? 1 : Math.min(window.devicePixelRatio, 2));
  }, [lowPower]);

  const applyPreset = useCallback((preset: StarPreset) => {
    const nextFigure = FIGURES.find((entry) => entry.key === preset.figureKey);
    const nextPalette = PALETTES.find((entry) => entry.key === preset.paletteKey);
    if (nextFigure) setFigure(nextFigure);
    if (nextPalette) setPalette(nextPalette);
    setDensity(preset.density);
    setSize(preset.size);
    setCameraDistance(preset.cameraDistance);
    setGlow(preset.glow);
    setPulseStrength(preset.pulseStrength);
    setPulseSpeed(preset.pulseSpeed);
    setStarHue(preset.hue);
    setStarSaturation(preset.saturation);
    setStarLightness(preset.lightness);
    setAgitation(preset.agitation);
    setFlowScale(preset.flowScale);
    setPattern(preset.pattern);
    setLowPower(preset.lowPower);
  }, []);

  const saveCurrentPreset = useCallback(() => {
    const nextPreset: StarPreset = {
      label: `${figure.label} ${pattern}`,
      figureKey: figure.key,
      paletteKey: palette.key,
      density,
      size,
      cameraDistance,
      glow,
      pulseStrength,
      pulseSpeed,
      hue: starHue,
      saturation: starSaturation,
      lightness: starLightness,
      agitation,
      flowScale,
      pattern,
      lowPower,
    };
    setSavedPresets((current) => {
      const next = [nextPreset, ...current].slice(0, 6);
      try {
        localStorage.setItem(PRESET_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, [
    agitation,
    cameraDistance,
    density,
    figure.key,
    figure.label,
    flowScale,
    glow,
    lowPower,
    palette.key,
    pattern,
    pulseSpeed,
    pulseStrength,
    starHue,
    starLightness,
    starSaturation,
    size,
  ]);

  useEffect(() => {
    const next = FIGURES.find((entry) => entry.key === requestedFigure);
    if (next) setFigure(next);
  }, [requestedFigure]);

  const rebuildPoints = useCallback(
    (
      sampler: MeshSurfaceSampler,
      n: number,
      color: THREE.ColorRepresentation,
      particleSize: number,
    ) => {
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
      points.userData.basePositions = Float32Array.from(positions);
      points.userData.baseSize = particleSize;
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
    camera.position.set(0, 0, cameraDistanceRef.current);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(lowPowerRef.current ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    rendererRef.current = renderer;
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
          const mergedGeom =
            geometries.length === 1 ? geometries[0] : mergeGeometries(geometries, false);
          for (const geom of geometries) {
            if (geom !== mergedGeom) geom.dispose();
          }
          if (!mergedGeom) {
            setStatus('error');
            return;
          }
          installGeom(mergedGeom);
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
        camera.position.z += (cameraDistanceRef.current - camera.position.z) * 0.08;
        points.rotation.y = currentRot + (isDragging ? 0 : t * 0.12);
        const breath =
          1 + Math.sin(t * 0.9 * pulseSpeedRef.current) * 0.04 * pulseStrengthRef.current;
        points.scale.setScalar(breath);
        const mat = points.material as THREE.PointsMaterial;
        const baseSize = (points.userData.baseSize as number | undefined) ?? 0.006;
        mat.size = baseSize * (0.72 + glowRef.current * 0.24);
        mat.opacity = Math.min(
          0.98,
          0.42 +
            glowRef.current * 0.18 +
            0.22 * (0.5 + 0.5 * Math.sin(t * 1.3 * pulseSpeedRef.current)),
        );
        animateStarPattern(
          points,
          t,
          patternRef.current,
          agitationRef.current,
          flowScaleRef.current,
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
      renderer.dispose();
      rendererRef.current = null;
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
    rebuildPoints(
      samplerRef.current,
      density,
      starHsl(starHue, starSaturation, starLightness),
      size,
    );
  }, [
    density,
    palette.bg,
    size,
    rebuildPoints,
    samplerVersion,
    starHue,
    starLightness,
    starSaturation,
  ]);

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
              onClick={() => {
                setPalette(p);
                const hsl = hexToHsl(p.color);
                setStarHue(hsl.h);
                setStarSaturation(hsl.s);
                setStarLightness(hsl.l);
              }}
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
            label="zoom"
            value={cameraDistance}
            min={1.8}
            max={5.2}
            step={0.1}
            onChange={setCameraDistance}
          />
          <Slider label="glow" value={glow} min={0.2} max={2.4} step={0.1} onChange={setGlow} />
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

        <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ letterSpacing: '0.16em', textTransform: 'uppercase' }}>star colour</span>
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
        </div>

        <section
          aria-label="Star movement menu"
          style={{
            display: 'grid',
            gap: 8,
            borderTop: '1px solid rgba(240,216,152,0.1)',
            paddingTop: 10,
          }}
        >
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ letterSpacing: '0.16em', textTransform: 'uppercase' }}>
              star movement
            </span>
            {STAR_PATTERNS.map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPattern(p.key)}
                aria-pressed={pattern === p.key}
                style={pillStyle(pattern === p.key, 'tiny')}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setLowPower((current) => !current)}
              aria-pressed={lowPower}
              style={pillStyle(lowPower, 'tiny')}
            >
              Low power
            </button>
          </div>
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
            <Slider
              label="agitate"
              value={agitation}
              min={0}
              max={2.5}
              step={0.1}
              onChange={setAgitation}
            />
            <Slider
              label="scale"
              value={flowScale}
              min={0.4}
              max={3}
              step={0.1}
              onChange={setFlowScale}
            />
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ letterSpacing: '0.16em', textTransform: 'uppercase' }}>presets</span>
            {[...DEFAULT_STAR_PRESETS, ...savedPresets].map((preset, index) => (
              <button
                key={`${preset.label}-${index}`}
                type="button"
                onClick={() => applyPreset(preset)}
                style={pillStyle(false, 'tiny')}
              >
                {preset.label}
              </button>
            ))}
            <button type="button" onClick={saveCurrentPreset} style={pillStyle(false, 'tiny')}>
              Save current
            </button>
          </div>
        </section>
      </footer>
    </div>
  );
}

function animateStarPattern(
  points: THREE.Points,
  t: number,
  pattern: StarPattern,
  agitation: number,
  flowScale: number,
) {
  const base = points.userData.basePositions as Float32Array | undefined;
  if (!base) return;
  const attr = points.geometry.getAttribute('position') as THREE.BufferAttribute;
  const arr = attr.array as Float32Array;
  const amp = agitation * 0.035 * flowScale;

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
      const tangentX = -z / radius;
      const tangentZ = x / radius;
      const drift = Math.sin(t * 1.1 + y * 7.0 + radius * 5.0) * amp * 0.55;
      nx += tangentX * drift;
      nz += tangentZ * drift;
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

function starHsl(hue: number, saturation: number, lightness: number) {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
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
        aria-label={`${label} slider`}
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
