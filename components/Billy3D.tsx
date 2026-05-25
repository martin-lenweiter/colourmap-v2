'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

const SERIF = 'var(--font-serif)';

function makePineappleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  const W = 512;
  const H = 768;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  // base pineapple gold
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#E8A938');
  grad.addColorStop(0.5, '#D89A28');
  grad.addColorStop(1, '#B57E1F');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // diamond crosshatch pattern in darker amber
  const cellW = 56;
  const cellH = 48;
  const rows = Math.ceil(H / cellH) + 2;
  const cols = Math.ceil(W / cellW) + 2;

  ctx.strokeStyle = 'rgba(70,40,10,0.55)';
  ctx.lineWidth = 2.5;

  for (let r = -1; r < rows; r += 1) {
    for (let c = -1; c < cols; c += 1) {
      const offsetX = (r % 2) * (cellW / 2);
      const x = c * cellW + offsetX;
      const y = r * cellH;
      ctx.beginPath();
      ctx.moveTo(x, y + cellH / 2);
      ctx.lineTo(x + cellW / 2, y);
      ctx.lineTo(x + cellW, y + cellH / 2);
      ctx.lineTo(x + cellW / 2, y + cellH);
      ctx.closePath();
      ctx.stroke();

      // little brown highlight dot in each cell centre
      ctx.fillStyle = 'rgba(60,32,8,0.45)';
      ctx.beginPath();
      ctx.arc(x + cellW / 2, y + cellH / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // soft warm gold highlight just below the brown dot
      ctx.fillStyle = 'rgba(255,220,140,0.4)';
      ctx.beginPath();
      ctx.arc(x + cellW / 2, y + cellH / 2 + 5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function makeLeaf(color: string): THREE.Mesh {
  // a tall narrow pyramid that bends slightly
  const geom = new THREE.ConeGeometry(0.14, 0.7, 6, 4, true);
  // squash it a bit on Z so it's a flat leaf, not a round cone
  geom.scale(1, 1, 0.45);
  // curl by displacing vertices
  const pos = geom.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i += 1) {
    const y = pos.getY(i);
    const t = (y + 0.35) / 0.7;
    pos.setX(i, pos.getX(i) + Math.sin(t * 1.4) * 0.05);
  }
  pos.needsUpdate = true;
  geom.computeVertexNormals();

  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.62,
    metalness: 0.05,
  });
  return new THREE.Mesh(geom, mat);
}

export default function Billy3D() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [cameraDistance, setCameraDistance] = useState(4.8);
  const cameraDistanceRef = useRef(4.8);
  cameraDistanceRef.current = cameraDistance;

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    let frameId = 0;

    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a0f06');

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.01, 100);
    camera.position.set(0, 1.4, cameraDistanceRef.current);
    camera.lookAt(0, 1, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    mount.appendChild(renderer.domElement);

    // lighting — warm sun + cooler rim
    const sun = new THREE.DirectionalLight('#FFE8B0', 2.8);
    sun.position.set(3, 5, 4);
    scene.add(sun);
    const rim = new THREE.DirectionalLight('#7AAA60', 1.2);
    rim.position.set(-3, 2, -2);
    scene.add(rim);
    scene.add(new THREE.AmbientLight('#5A3A1A', 0.5));

    // ground disc, warm sand
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(2.4, 64),
      new THREE.MeshStandardMaterial({ color: '#3a2412', metalness: 0.1, roughness: 0.85 }),
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const billy = new THREE.Group();
    scene.add(billy);

    // BODY — tall ellipsoid with pineapple texture
    const bodyGeom = new THREE.SphereGeometry(0.55, 48, 36);
    bodyGeom.scale(1, 1.5, 1);
    const pineappleTex = makePineappleTexture();
    const bodyMat = new THREE.MeshStandardMaterial({
      map: pineappleTex,
      roughness: 0.5,
      metalness: 0.05,
    });
    const body = new THREE.Mesh(bodyGeom, bodyMat);
    body.position.y = 0.95;
    billy.add(body);

    // CROWN of leaves on top
    const crown = new THREE.Group();
    crown.position.y = 1.78;
    billy.add(crown);
    const leafColors = ['#4D8A3A', '#5BA245', '#3F7A2E', '#6CB055'];
    const leafCount = 7;
    for (let i = 0; i < leafCount; i += 1) {
      const leaf = makeLeaf(leafColors[i % leafColors.length]);
      const angle = (i / leafCount) * Math.PI * 2;
      leaf.position.set(Math.cos(angle) * 0.08, 0.25, Math.sin(angle) * 0.08);
      leaf.rotation.z = Math.sin(angle) * 0.4;
      leaf.rotation.x = -Math.cos(angle) * 0.4;
      leaf.rotation.y = angle;
      crown.add(leaf);
    }
    // center taller leaf
    const centerLeaf = makeLeaf('#5BA245');
    centerLeaf.scale.setScalar(1.2);
    centerLeaf.position.y = 0.32;
    crown.add(centerLeaf);

    // EYES — two white spheres + dark pupils
    const eyeWhiteMat = new THREE.MeshStandardMaterial({
      color: '#FBFAF1',
      roughness: 0.3,
    });
    const pupilMat = new THREE.MeshStandardMaterial({ color: '#1a0e05', roughness: 0.4 });

    const makeEye = (x: number) => {
      const eye = new THREE.Group();
      const white = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 18), eyeWhiteMat);
      eye.add(white);
      const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.05, 18, 14), pupilMat);
      pupil.position.set(0, -0.01, 0.1);
      eye.add(pupil);
      eye.position.set(x, 1.18, 0.46);
      // slight outward rotation
      eye.rotation.y = x > 0 ? -0.18 : 0.18;
      return eye;
    };
    const leftEye = makeEye(-0.17);
    const rightEye = makeEye(0.17);
    billy.add(leftEye);
    billy.add(rightEye);

    // EYEBROWS — slim arched cylinders, slightly worried tilt
    const browMat = new THREE.MeshStandardMaterial({ color: '#3a2410', roughness: 0.7 });
    const makeBrow = (x: number, tilt: number) => {
      const geom = new THREE.CapsuleGeometry(0.018, 0.13, 4, 8);
      const brow = new THREE.Mesh(geom, browMat);
      brow.position.set(x, 1.34, 0.5);
      brow.rotation.z = tilt;
      return brow;
    };
    billy.add(makeBrow(-0.17, 0.32));
    billy.add(makeBrow(0.17, -0.32));

    // MOUTH — big smile (an arc of a torus)
    const mouthGeom = new THREE.TorusGeometry(0.16, 0.022, 12, 28, Math.PI);
    const mouthMat = new THREE.MeshStandardMaterial({ color: '#1a0e05', roughness: 0.5 });
    const mouth = new THREE.Mesh(mouthGeom, mouthMat);
    mouth.rotation.x = Math.PI;
    mouth.rotation.z = Math.PI;
    mouth.position.set(0, 0.96, 0.52);
    billy.add(mouth);
    // teeth — a small white rounded strip inside the mouth
    const teeth = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.04, 0.04),
      new THREE.MeshStandardMaterial({ color: '#FBFAF1', roughness: 0.5 }),
    );
    teeth.position.set(0, 0.97, 0.55);
    billy.add(teeth);

    // ARMS — thin capsules
    const limbMat = new THREE.MeshStandardMaterial({ color: '#C58A20', roughness: 0.55 });
    const handMat = new THREE.MeshStandardMaterial({ color: '#F8E8B5', roughness: 0.45 });

    const makeArm = (side: number) => {
      const arm = new THREE.Group();
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.4, 4, 10), limbMat);
      upper.position.y = -0.2;
      arm.add(upper);
      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.085, 18, 14), handMat);
      hand.position.y = -0.42;
      arm.add(hand);
      arm.position.set(side * 0.6, 1.1, 0);
      arm.rotation.z = side * 0.6;
      return arm;
    };
    const leftArm = makeArm(-1);
    const rightArm = makeArm(1);
    billy.add(leftArm);
    billy.add(rightArm);

    // LEGS — capsules ending in shoes
    const shoeMat = new THREE.MeshStandardMaterial({ color: '#F2EBD8', roughness: 0.55 });
    const shoeSoleMat = new THREE.MeshStandardMaterial({ color: '#2a1a0a', roughness: 0.6 });

    const makeLeg = (side: number) => {
      const leg = new THREE.Group();
      const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.3, 4, 10), limbMat);
      upper.position.y = -0.15;
      leg.add(upper);
      const shoe = new THREE.Group();
      shoe.position.y = -0.32;
      const top = new THREE.Mesh(new THREE.SphereGeometry(0.1, 18, 14), shoeMat);
      top.scale.set(1, 0.7, 1.4);
      shoe.add(top);
      const sole = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.28), shoeSoleMat);
      sole.position.y = -0.05;
      shoe.add(sole);
      leg.add(shoe);
      leg.position.set(side * 0.18, 0.32, 0);
      return leg;
    };
    const leftLeg = makeLeg(-1);
    const rightLeg = makeLeg(1);
    billy.add(leftLeg);
    billy.add(rightLeg);

    // drag-to-rotate
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
      camera.position.z += (cameraDistanceRef.current - camera.position.z) * 0.08;
      currentRot += (targetRot - currentRot) * 0.15;
      billy.rotation.y = currentRot + (isDragging ? 0 : Math.sin(t * 0.25) * 0.25);

      // gentle bob
      billy.position.y = Math.sin(t * 1.4) * 0.03;

      // arms idle wave
      rightArm.rotation.z = 0.6 + Math.sin(t * 1.8) * 0.18;
      leftArm.rotation.z = -0.6 - Math.sin(t * 1.8 + 0.5) * 0.12;

      // tiny crown sway
      crown.rotation.z = Math.sin(t * 1.2) * 0.04;

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
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      mount.removeEventListener('pointerdown', onPointerDown);
      mount.removeEventListener('pointermove', onPointerMove);
      mount.removeEventListener('pointerup', onPointerUp);
      mount.removeEventListener('pointercancel', onPointerUp);
      renderer.dispose();
      pineappleTex.dispose();
      // Dispose mesh geometries / materials owned by Billy
      billy.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry?.dispose();
          const m = mesh.material;
          if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
          else m?.dispose();
        }
      });
      floor.geometry.dispose();
      (floor.material as THREE.Material).dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 400,
        background: '#1a0f06',
      }}
    >
      <div ref={mountRef} style={{ position: 'absolute', inset: 0, cursor: 'grab' }} />
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 0,
          right: 0,
          textAlign: 'center',
          fontFamily: SERIF,
          fontSize: 11,
          color: 'rgba(240,216,152,0.5)',
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          pointerEvents: 'none',
        }}
      >
        Billy · procedural v1
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 18,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          fontFamily: SERIF,
          fontSize: 11,
          color: 'rgba(240,216,152,0.74)',
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ letterSpacing: '0.16em', textTransform: 'uppercase' }}>zoom</span>
          <input
            type="range"
            min={3.2}
            max={7}
            step={0.1}
            value={cameraDistance}
            onChange={(event) => setCameraDistance(Number(event.target.value))}
            aria-label="Billy camera zoom"
            style={{ accentColor: '#FFD080', width: 150 }}
          />
          <span style={{ minWidth: 32 }}>{cameraDistance.toFixed(1)}</span>
        </label>
      </div>
    </div>
  );
}
