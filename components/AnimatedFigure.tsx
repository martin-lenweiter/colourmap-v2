'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export type AnimatedAsset = {
  key: string;
  label: string;
  url: string;
  scale?: number;
  color?: string;
};

const SERIF = 'var(--font-serif)';

type Status = 'loading' | 'ready' | 'error';

export default function AnimatedFigure({
  assetUrl,
  color = '#E0A040',
}: {
  assetUrl: string;
  color?: string;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [animations, setAnimations] = useState<string[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [speed, setSpeed] = useState(1);
  const [cameraDistance, setCameraDistance] = useState(3.8);

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const actionsRef = useRef<Record<string, THREE.AnimationAction>>({});
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const speedRef = useRef(1);
  const cameraDistanceRef = useRef(3.8);
  cameraDistanceRef.current = cameraDistance;

  const playAnimation = useCallback((name: string) => {
    const next = actionsRef.current[name];
    if (!next) return;
    const prev = currentActionRef.current;
    next.reset();
    next.setEffectiveTimeScale(speedRef.current);
    next.fadeIn(0.4);
    next.play();
    if (prev && prev !== next) {
      prev.fadeOut(0.4);
    }
    currentActionRef.current = next;
    setActive(name);
  }, []);

  const changeSpeed = useCallback((s: number) => {
    speedRef.current = s;
    setSpeed(s);
    const current = currentActionRef.current;
    if (current) current.setEffectiveTimeScale(s);
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let frameId = 0;
    let disposed = false;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A0604');

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 100);
    camera.position.set(0, 1.4, cameraDistanceRef.current);
    camera.lookAt(0, 0.8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    const key = new THREE.DirectionalLight('#FFE2A8', 2.4);
    key.position.set(2, 4, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#B07020', 1.0);
    rim.position.set(-3, 2, -2);
    scene.add(rim);
    scene.add(new THREE.AmbientLight('#3A2614', 0.4));

    // Floor disc — just enough to ground the figure
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.2, 64),
      new THREE.MeshStandardMaterial({
        color: '#1A1208',
        metalness: 0.3,
        roughness: 0.7,
      }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    const root = new THREE.Group();
    scene.add(root);

    // Touch + drag rotation
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
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      targetRot += dx * 0.01;
    };
    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      mount.releasePointerCapture(e.pointerId);
    };
    mount.addEventListener('pointerdown', onPointerDown);
    mount.addEventListener('pointermove', onPointerMove);
    mount.addEventListener('pointerup', onPointerUp);
    mount.addEventListener('pointercancel', onPointerUp);

    const loader = new GLTFLoader();
    loader.load(
      assetUrl,
      (gltf) => {
        if (disposed) return;

        const figure = gltf.scene;
        // Normalise scale so any character fits the floor disc
        const box = new THREE.Box3().setFromObject(figure);
        const size = box.getSize(new THREE.Vector3());
        const height = size.y || 1;
        const targetHeight = 1.8;
        const scale = targetHeight / height;
        figure.scale.setScalar(scale);
        // Re-bound after scaling, drop the figure onto the floor
        figure.updateMatrixWorld(true);
        const newBox = new THREE.Box3().setFromObject(figure);
        figure.position.y -= newBox.min.y;
        figure.position.x -= (newBox.min.x + newBox.max.x) / 2;
        figure.position.z -= (newBox.min.z + newBox.max.z) / 2;

        // Repaint materials with our gold palette so it matches the rest of the app
        figure.traverse((child) => {
          const mesh = child as THREE.Mesh;
          if (mesh.isMesh && mesh.material) {
            const arr = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            for (const m of arr) {
              const std = m as THREE.MeshStandardMaterial;
              if (std.color) {
                std.color = new THREE.Color(color);
                std.metalness = 0.85;
                std.roughness = 0.22;
                std.needsUpdate = true;
              }
            }
          }
        });

        root.add(figure);

        if (gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(figure);
          mixerRef.current = mixer;
          const names: string[] = [];
          for (const clip of gltf.animations) {
            const action = mixer.clipAction(clip);
            actionsRef.current[clip.name] = action;
            names.push(clip.name);
          }
          setAnimations(names);
          if (names[0]) playAnimation(names[0]);
        }

        setStatus('ready');
      },
      undefined,
      (err) => {
        if (disposed) return;
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to load model.');
      },
    );

    const clock = new THREE.Clock();
    const animate = () => {
      const delta = clock.getDelta();
      const t = clock.elapsedTime;
      camera.position.z += (cameraDistanceRef.current - camera.position.z) * 0.08;

      // Smoothly approach drag-driven rotation
      currentRot += (targetRot - currentRot) * 0.15;
      root.rotation.y = currentRot + (isDragging ? 0 : Math.sin(t * 0.12) * 0.04);

      // Procedural breathing on the root scale (Level A)
      const breath = 1 + Math.sin(t * 0.9) * 0.008;
      root.scale.setScalar(breath);

      // Drive Mixamo / glTF skeletal animation (Level B)
      mixerRef.current?.update(delta);

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
      mixerRef.current?.stopAllAction();
      mixerRef.current = null;
      actionsRef.current = {};
      currentActionRef.current = null;
      renderer.dispose();
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [assetUrl, color, playAnimation]);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 400,
        background: '#0A0604',
      }}
    >
      <div ref={mountRef} style={{ position: 'absolute', inset: 0, cursor: 'grab' }} />
      {status === 'loading' && <Overlay text="loading figure…" color="rgba(240,216,152,0.6)" />}
      {status === 'error' && <Overlay text={error ?? 'failed to load'} color="#E78878" />}
      {animations.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: 18,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            padding: '0 16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              justifyContent: 'center',
              maxWidth: 560,
            }}
          >
            {animations.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => playAnimation(name)}
                aria-pressed={active === name}
                style={{
                  background: active === name ? 'rgba(255,200,100,0.18)' : 'rgba(0,0,0,0.45)',
                  border: `1px solid ${
                    active === name ? 'rgba(255,200,100,0.55)' : 'rgba(240,216,152,0.25)'
                  }`,
                  borderRadius: 999,
                  color: active === name ? '#FFD080' : 'rgba(240,216,152,0.78)',
                  fontFamily: SERIF,
                  fontSize: 12,
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  padding: '6px 12px',
                }}
              >
                {name}
              </button>
            ))}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: SERIF,
              fontSize: 11,
              color: 'rgba(240,216,152,0.7)',
            }}
          >
            <span>speed</span>
            <input
              type="range"
              min={0.1}
              max={2}
              step={0.1}
              value={speed}
              onChange={(e) => changeSpeed(Number(e.target.value))}
              aria-label="Animation speed"
              style={{ accentColor: '#FFD080', width: 160 }}
            />
            <span style={{ minWidth: 28 }}>{speed.toFixed(1)}×</span>
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontFamily: SERIF,
              fontSize: 11,
              color: 'rgba(240,216,152,0.7)',
            }}
          >
            <span>zoom</span>
            <input
              type="range"
              min={2.4}
              max={6}
              step={0.1}
              value={cameraDistance}
              onChange={(event) => setCameraDistance(Number(event.target.value))}
              aria-label="Animated figure camera zoom"
              style={{ accentColor: '#FFD080', width: 160 }}
            />
            <span style={{ minWidth: 28 }}>{cameraDistance.toFixed(1)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function Overlay({ text, color }: { text: string; color: string }) {
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
