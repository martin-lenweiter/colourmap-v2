'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js';

type Material = 'gold' | 'hologram' | 'stars';

export type FigureAsset = {
  key: string;
  label: string;
  url: string;
  goldColor?: string;
  hologramColor?: string;
  starColor?: string;
};

const SERIF = 'var(--font-serif)';
const MATERIALS: { key: Material; label: string }[] = [
  { key: 'gold', label: 'Metallic Gold' },
  { key: 'hologram', label: 'Hologram' },
  { key: 'stars', label: 'Stars' },
];

const STAR_COUNT = 32000;

export default function GoldenGod({
  assetUrl = '/models/golden-god.obj',
  goldColor = '#E0A040',
  hologramColor = '#FFD080',
  starColor = '#FFE2A0',
}: {
  assetUrl?: string;
  goldColor?: string;
  hologramColor?: string;
  starColor?: string;
}) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [material, setMaterial] = useState<Material>('gold');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Refs the animation loop reads. Material changes only swap which mesh is visible —
  // they don't tear the scene down.
  const meshRef = useRef<THREE.Mesh | null>(null);
  const hologramRef = useRef<THREE.Mesh | null>(null);
  const starsRef = useRef<THREE.Points | null>(null);
  const materialRef = useRef<Material>('gold');

  const setActiveMaterial = useCallback((m: Material) => {
    setMaterial(m);
    materialRef.current = m;
    if (meshRef.current) meshRef.current.visible = m === 'gold';
    if (hologramRef.current) hologramRef.current.visible = m === 'hologram';
    if (starsRef.current) starsRef.current.visible = m === 'stars';
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

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 100);
    camera.position.set(0, 0, 2.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    mount.appendChild(renderer.domElement);

    // Warm key + rim lighting for the metallic look
    const key = new THREE.DirectionalLight('#FFE2A8', 2.6);
    key.position.set(2, 2, 3);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#B07020', 1.4);
    rim.position.set(-3, 1, -2);
    scene.add(rim);
    const ambient = new THREE.AmbientLight('#3A2614', 0.5);
    scene.add(ambient);

    const root = new THREE.Group();
    scene.add(root);

    const goldMat = new THREE.MeshStandardMaterial({
      color: goldColor,
      metalness: 1.0,
      roughness: 0.18,
      envMapIntensity: 1.2,
    });
    const hologramMat = new THREE.MeshPhysicalMaterial({
      color: hologramColor,
      metalness: 0.4,
      roughness: 0.05,
      transmission: 0.95,
      thickness: 0.4,
      ior: 1.42,
      transparent: true,
      opacity: 0.85,
      emissive: '#A06014',
      emissiveIntensity: 0.45,
    });

    let mesh: THREE.Mesh | null = null;
    let hologramMesh: THREE.Mesh | null = null;
    let starPoints: THREE.Points | null = null;

    const loader = new OBJLoader();
    loader.load(
      assetUrl,
      (group) => {
        if (disposed) return;

        // Take the first mesh inside the loaded group and center it.
        let firstGeom: THREE.BufferGeometry | null = null;
        group.traverse((child) => {
          if (firstGeom) return;
          if ((child as THREE.Mesh).isMesh) {
            firstGeom = (child as THREE.Mesh).geometry.clone();
          }
        });
        if (!firstGeom) {
          setStatus('error');
          setErrorMsg('No mesh found inside the OBJ.');
          return;
        }

        const geom = firstGeom as THREE.BufferGeometry;
        geom.computeVertexNormals();
        geom.center();

        // Normalise scale so the figure fits the viewport regardless of source units.
        geom.computeBoundingSphere();
        const radius = geom.boundingSphere?.radius ?? 1;
        const scale = 1 / radius;
        geom.scale(scale, scale, scale);

        mesh = new THREE.Mesh(geom, goldMat);
        mesh.visible = materialRef.current === 'gold';
        meshRef.current = mesh;
        root.add(mesh);

        hologramMesh = new THREE.Mesh(geom, hologramMat);
        hologramMesh.visible = materialRef.current === 'hologram';
        hologramRef.current = hologramMesh;
        root.add(hologramMesh);

        // Build the star-particle sampling of the same surface.
        const sampler = new MeshSurfaceSampler(mesh).build();
        const positions = new Float32Array(STAR_COUNT * 3);
        const tmp = new THREE.Vector3();
        for (let i = 0; i < STAR_COUNT; i += 1) {
          sampler.sample(tmp);
          positions[i * 3] = tmp.x;
          positions[i * 3 + 1] = tmp.y;
          positions[i * 3 + 2] = tmp.z;
        }
        const starGeom = new THREE.BufferGeometry();
        starGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const starMat = new THREE.PointsMaterial({
          color: starColor,
          size: 0.006,
          sizeAttenuation: true,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        starPoints = new THREE.Points(starGeom, starMat);
        starPoints.visible = materialRef.current === 'stars';
        starsRef.current = starPoints;
        root.add(starPoints);

        setStatus('ready');
      },
      undefined,
      (err) => {
        if (disposed) return;
        setStatus('error');
        setErrorMsg(err instanceof Error ? err.message : 'Failed to load model.');
      },
    );

    const clock = new THREE.Clock();
    const animate = () => {
      const t = clock.getElapsedTime();
      root.rotation.y = t * 0.18;
      // Subtle breathing
      const breath = 1 + Math.sin(t * 0.8) * 0.012;
      root.scale.setScalar(breath);
      // Stars drift slightly outward and back
      if (starPoints) {
        starPoints.rotation.y = t * 0.05;
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
      renderer.dispose();
      goldMat.dispose();
      hologramMat.dispose();
      if (mesh) mesh.geometry.dispose();
      if (starPoints) {
        starPoints.geometry.dispose();
        (starPoints.material as THREE.PointsMaterial).dispose();
      }
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [assetUrl, goldColor, hologramColor, starColor]);

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
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />
      {status === 'loading' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(240,216,152,0.6)',
            fontFamily: SERIF,
            fontSize: 13,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
          }}
        >
          loading golden god…
        </div>
      )}
      {status === 'error' && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#E78878',
            fontFamily: SERIF,
            fontSize: 13,
            padding: 20,
            textAlign: 'center',
          }}
        >
          {errorMsg ?? 'Failed to load.'}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {MATERIALS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setActiveMaterial(m.key)}
            aria-pressed={material === m.key}
            style={{
              background: material === m.key ? 'rgba(255,200,100,0.18)' : 'rgba(0,0,0,0.4)',
              border: `1px solid ${material === m.key ? 'rgba(255,200,100,0.55)' : 'rgba(240,216,152,0.25)'}`,
              borderRadius: 999,
              color: material === m.key ? '#FFD080' : 'rgba(240,216,152,0.7)',
              fontFamily: SERIF,
              fontSize: 12,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              padding: '6px 14px',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  );
}
