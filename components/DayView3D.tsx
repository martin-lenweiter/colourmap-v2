'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import { getTodayEntries, type TimelineEntry } from '@/lib/day-timeline';
import InfographicsView from './InfographicsView';

/* ── Types ──────────────────────────────────────────────────────── */
type NodeKind = 'emotion' | 'mind' | 'body' | 'focus' | 'mission' | 'hub';

const AXIS_LEVELS = [
  ['Shame', 'Apathy', 'Grief', 'Fear', 'Anger', 'Courage', 'Acceptance', 'Reason', 'Love', 'Peace'],
  ['Absent', 'Scattered', 'Confused', 'Drifting', 'Present', 'Flowing'],
  ['Depleted', 'Drained', 'Heavy', 'Tense', 'Warming', 'Good', 'Active', 'Energized'],
  ['Scattered', 'Distracted', 'Restless', 'Warming', 'Present', 'Locked', 'Flowing', 'Zone'],
];

const NODE_RGB: Record<NodeKind, [number, number, number]> = {
  hub: [196, 160, 96],
  emotion: [196, 160, 96],
  mind: [160, 152, 192],
  body: [196, 168, 120],
  focus: [136, 208, 152],
  mission: [120, 192, 168],
};

interface SceneNode {
  id: string;
  kind: NodeKind;
  label: string;
  sublabel: string;
  axisIdx?: number;
  mesh: THREE.Mesh;
  pos: THREE.Vector3;
}

/* ── Evolution sparkline (SVG) ──────────────────────────────────── */
function EvolutionChart({ axisIdx, entries }: { axisIdx: number; entries: TimelineEntry[] }) {
  const levels = AXIS_LEVELS[axisIdx];
  const max = levels.length - 1;
  const points = entries.map((e) => e.i[axisIdx] ?? 0);
  if (points.length < 2) {
    return (
      <p
        style={{
          textAlign: 'center',
          fontSize: 11,
          color: 'rgba(196,160,96,0.35)',
          margin: '8px 0',
        }}
      >
        No data yet today
      </p>
    );
  }
  const W = 280;
  const H = 56;
  const pad = 8;
  const xs = points.map((_, i) => pad + (i / (points.length - 1)) * (W - pad * 2));
  const ys = points.map((v) => H - pad - (v / max) * (H - pad * 2));
  const d = xs.map((x, i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${ys[i].toFixed(1)}`).join(' ');
  const current = points[points.length - 1];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={W} height={H} style={{ overflow: 'visible' }}>
        <path
          d={d}
          fill="none"
          stroke="rgba(196,160,96,0.55)"
          strokeWidth={1.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {xs.map((x, i) => (
          <circle
            key={i}
            cx={x}
            cy={ys[i]}
            r={i === points.length - 1 ? 4 : 2}
            fill={i === points.length - 1 ? '#C4A060' : 'rgba(196,160,96,0.4)'}
          />
        ))}
      </svg>
      <div
        style={{
          textAlign: 'center',
          width: W,
          fontSize: 9,
          color: '#C4A060',
          fontWeight: 700,
          letterSpacing: '0.1em',
        }}
      >
        {levels[current]}
      </div>
    </div>
  );
}

/* ── Main component ─────────────────────────────────────────────── */
export default function DayView3D({
  onClose,
  embedded,
}: {
  onClose?: () => void;
  embedded?: boolean;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<SceneNode | null>(null);
  const [entries, setEntries] = useState<TimelineEntry[]>([]);

  useEffect(() => {
    setEntries(getTodayEntries());
  }, []);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const W = mount.clientWidth || 400;
    const H = mount.clientHeight || 400;

    /* ── Scene ── */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 1000);
    camera.position.z = 6.5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.touchAction = 'none';
    mount.appendChild(renderer.domElement);

    /* ── Read data ── */
    function getIdx(key: string, max: number, def: number) {
      try {
        const v = localStorage.getItem(key);
        return v !== null ? Math.min(max, Math.max(0, Number(v))) : def;
      } catch {
        return def;
      }
    }
    const vals = [
      getIdx('colourmap:process-idx', 9, 4),
      getIdx('colourmap:presence-idx', 5, 3),
      getIdx('colourmap:body-idx', 7, 3),
      getIdx('colourmap:focus-idx', 7, 3),
    ];

    type NodeDef = {
      id: string;
      kind: NodeKind;
      label: string;
      sublabel: string;
      axisIdx?: number;
      pos: THREE.Vector3;
      geo: THREE.BufferGeometry;
      r: number;
    };

    const defs: NodeDef[] = [
      {
        id: 'hub',
        kind: 'hub',
        label: 'Now',
        sublabel: '',
        pos: new THREE.Vector3(0, 0, 0),
        geo: new THREE.IcosahedronGeometry(0.3, 2),
        r: 0.3,
      },
      {
        id: 'emotion',
        kind: 'emotion',
        label: AXIS_LEVELS[0][vals[0]],
        sublabel: 'Emotion',
        axisIdx: 0,
        pos: new THREE.Vector3(0, 0, 0),
        geo: new THREE.IcosahedronGeometry(0.22, 1),
        r: 0.22,
      },
      {
        id: 'mind',
        kind: 'mind',
        label: AXIS_LEVELS[1][vals[1]],
        sublabel: 'Mind',
        axisIdx: 1,
        pos: new THREE.Vector3(0, 0, 0),
        geo: new THREE.OctahedronGeometry(0.22),
        r: 0.22,
      },
      {
        id: 'body',
        kind: 'body',
        label: AXIS_LEVELS[2][vals[2]],
        sublabel: 'Body',
        axisIdx: 2,
        pos: new THREE.Vector3(0, 0, 0),
        geo: new THREE.BoxGeometry(0.32, 0.32, 0.32),
        r: 0.22,
      },
      {
        id: 'focus',
        kind: 'focus',
        label: AXIS_LEVELS[3][vals[3]],
        sublabel: 'Focus',
        axisIdx: 3,
        pos: new THREE.Vector3(0, 0, 0),
        geo: new THREE.TetrahedronGeometry(0.27),
        r: 0.22,
      },
    ];

    try {
      const missions = JSON.parse(localStorage.getItem('colourmap:doing-cards') ?? '[]') as {
        title?: string;
      }[];
      missions.slice(0, 3).forEach((m, i) => {
        if (!m.title) return;
        defs.push({
          id: `mission-${i}`,
          kind: 'mission',
          label: m.title.slice(0, 13),
          sublabel: 'mission',
          pos: new THREE.Vector3(0, 0, 0),
          geo: new THREE.SphereGeometry(0.13, 7, 7),
          r: 0.13,
        });
      });
    } catch {}

    /* ── Fibonacci sphere positions ── */
    const nonHub = defs.filter((n) => n.id !== 'hub');
    const PHI = (1 + Math.sqrt(5)) / 2;
    const ORBIT_R = 2.5;
    nonHub.forEach((n, i) => {
      const theta = (2 * Math.PI * i) / PHI;
      const phi = Math.acos(1 - (2 * (i + 0.5)) / nonHub.length);
      n.pos.set(
        Math.sin(phi) * Math.cos(theta) * ORBIT_R,
        Math.sin(phi) * Math.sin(theta) * ORBIT_R,
        Math.cos(phi) * ORBIT_R,
      );
    });

    /* ── Build scene objects ── */
    const group = new THREE.Group();
    scene.add(group);

    const edgeMat = new THREE.LineBasicMaterial({
      color: 0x3a2814,
      transparent: true,
      opacity: 0.35,
    });
    const hub = defs[0];

    function makeLabelSprite(
      text: string,
      sub: string,
      rgb: [number, number, number],
    ): THREE.Sprite {
      const cv = document.createElement('canvas');
      cv.width = 256;
      cv.height = 80;
      const ctx = cv.getContext('2d')!;
      const [r, g, b2] = rgb;
      ctx.clearRect(0, 0, 256, 80);
      ctx.font = 'bold 26px serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = `rgba(${r},${g},${b2},0.95)`;
      ctx.fillText(text, 128, 36);
      if (sub) {
        ctx.font = '14px serif';
        ctx.fillStyle = `rgba(${r},${g},${b2},0.48)`;
        ctx.letterSpacing = '2px';
        ctx.fillText(sub.toUpperCase(), 128, 58);
      }
      const tex = new THREE.CanvasTexture(cv);
      const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false });
      const sp = new THREE.Sprite(mat);
      sp.scale.set(1.5, 0.47, 1);
      return sp;
    }

    const sceneNodes: SceneNode[] = [];
    const meshToNode = new Map<THREE.Mesh, SceneNode>();

    for (const n of defs) {
      const rgb = NODE_RGB[n.kind];
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(rgb[0] / 255, rgb[1] / 255, rgb[2] / 255),
        wireframe: true,
        transparent: true,
        opacity: n.id === 'hub' ? 0.65 : 0.42,
      });
      const mesh = new THREE.Mesh(n.geo, mat);
      mesh.position.copy(n.pos);
      group.add(mesh);

      if (n.id !== 'hub') {
        group.add(
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([hub.pos.clone(), n.pos.clone()]),
            edgeMat,
          ),
        );
      }

      const sprite = makeLabelSprite(n.label, n.id === 'hub' ? '' : n.sublabel, rgb);
      sprite.position.set(n.pos.x, n.pos.y + n.r + 0.42, n.pos.z);
      group.add(sprite);

      const sNode: SceneNode = {
        id: n.id,
        kind: n.kind,
        label: n.label,
        sublabel: n.sublabel,
        axisIdx: n.axisIdx,
        mesh,
        pos: n.pos.clone(),
      };
      sceneNodes.push(sNode);
      meshToNode.set(mesh, sNode);
    }

    /* ── Interaction — arcball ── */
    const quaternion = new THREE.Quaternion();
    let dragging = false;
    let downX = 0;
    let downY = 0;
    let lastX = 0;
    let lastY = 0;
    const vel = { x: 0, y: 0 };
    let camZ = 6.5;
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points = { threshold: 0.1 };
    const meshes = sceneNodes.map((n) => n.mesh);

    function onDown(e: PointerEvent) {
      dragging = true;
      downX = e.clientX;
      downY = e.clientY;
      lastX = e.clientX;
      lastY = e.clientY;
      vel.x = 0;
      vel.y = 0;
      renderer.domElement.setPointerCapture(e.pointerId);
    }
    function onMove(e: PointerEvent) {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      vel.x = dx;
      vel.y = dy;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 0.5) return;
      const axis = new THREE.Vector3(-dy / len, dx / len, 0);
      quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, len * 0.007));
    }
    function onUp(e: PointerEvent) {
      dragging = false;
      const dist = Math.hypot(e.clientX - downX, e.clientY - downY);
      if (dist < 8) {
        const rect = renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(meshes);
        if (hits.length > 0) {
          const node = meshToNode.get(hits[0].object as THREE.Mesh);
          if (node) setSelected((prev) => (prev?.id === node.id ? null : node));
        } else {
          setSelected(null);
        }
      }
    }

    let pinchDist = 0;
    const touches = new Map<number, { x: number; y: number }>();
    function onTS(e: TouchEvent) {
      for (const t of e.changedTouches) touches.set(t.identifier, { x: t.clientX, y: t.clientY });
      if (touches.size === 2) {
        const p = [...touches.values()];
        pinchDist = Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y);
      }
    }
    function onTM(e: TouchEvent) {
      e.preventDefault();
      for (const t of e.changedTouches) touches.set(t.identifier, { x: t.clientX, y: t.clientY });
      if (touches.size === 2) {
        const p = [...touches.values()];
        const d = Math.hypot(p[1].x - p[0].x, p[1].y - p[0].y);
        camZ = Math.max(3, Math.min(12, camZ - (d - pinchDist) * 0.015));
        pinchDist = d;
      }
    }
    function onTE(e: TouchEvent) {
      for (const t of e.changedTouches) touches.delete(t.identifier);
    }

    renderer.domElement.addEventListener('pointerdown', onDown);
    renderer.domElement.addEventListener('pointermove', onMove);
    renderer.domElement.addEventListener('pointerup', onUp);
    renderer.domElement.addEventListener('touchstart', onTS, { passive: false });
    renderer.domElement.addEventListener('touchmove', onTM, { passive: false });
    renderer.domElement.addEventListener('touchend', onTE);

    let rafId = 0;
    function animate() {
      rafId = requestAnimationFrame(animate);
      if (!dragging && (Math.abs(vel.x) > 0.05 || Math.abs(vel.y) > 0.05)) {
        vel.x *= 0.88;
        vel.y *= 0.88;
        const speed = Math.sqrt(vel.x ** 2 + vel.y ** 2);
        if (speed > 0.05) {
          const axis = new THREE.Vector3(-vel.y / speed, vel.x / speed, 0);
          quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(axis, speed * 0.002));
        }
      }
      group.setRotationFromQuaternion(quaternion);
      camera.position.z = camZ;
      renderer.render(scene, camera);
    }
    animate();

    const ro = new ResizeObserver(() => {
      const nW = mount.clientWidth;
      const nH = mount.clientHeight;
      renderer.setSize(nW, nH);
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
    });
    ro.observe(mount);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      renderer.domElement.removeEventListener('pointerdown', onDown);
      renderer.domElement.removeEventListener('pointermove', onMove);
      renderer.domElement.removeEventListener('pointerup', onUp);
      renderer.domElement.removeEventListener('touchstart', onTS);
      renderer.domElement.removeEventListener('touchmove', onTM);
      renderer.domElement.removeEventListener('touchend', onTE);
      renderer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  const inner = (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: embedded ? undefined : 480,
        maxHeight: embedded ? undefined : '92svh',
        background: '#060402',
        borderTop: '1px solid rgba(196,160,96,0.2)',
        borderRadius: embedded ? 14 : '20px 20px 0 0',
        overflowY: 'auto',
        overflowX: 'visible',
        fontFamily: 'var(--font-serif)',
        paddingBottom: embedded ? 0 : 'env(safe-area-inset-bottom)',
      }}
    >
      {!embedded && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div
            style={{ width: 36, height: 3, borderRadius: 2, background: 'rgba(196,160,96,0.25)' }}
          />
        </div>
      )}

      {/* Header */}
      <div style={{ padding: '2px 16px 6px', display: 'flex', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 800,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(196,160,96,0.45)',
            flex: 1,
          }}
        >
          {selected ? selected.label : 'View'}
        </span>
        {selected && (
          <button
            type="button"
            onClick={() => setSelected(null)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(196,160,96,0.4)',
              fontSize: 11,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              marginRight: 12,
            }}
          >
            Back
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'rgba(196,160,96,0.4)',
            fontSize: 16,
            lineHeight: 1,
            padding: '0 2px',
          }}
        >
          ×
        </button>
      </div>

      {/* 3D canvas */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: selected ? 160 : 220,
          position: 'relative',
          overflow: 'hidden',
          cursor: 'grab',
        }}
      />

      {/* Evolution panel — slides in when node tapped */}
      {selected && (
        <div style={{ padding: '8px 20px 10px' }}>
          <div style={{ marginBottom: 6, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span
              style={{ fontSize: 13, fontWeight: 700, color: '#C4A060', letterSpacing: '0.04em' }}
            >
              {selected.label}
            </span>
            <span
              style={{
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(196,160,96,0.4)',
              }}
            >
              {selected.sublabel}
            </span>
          </div>

          {selected.axisIdx !== undefined ? (
            <EvolutionChart axisIdx={selected.axisIdx} entries={entries} />
          ) : (
            <p style={{ fontSize: 11, color: 'rgba(196,160,96,0.4)', margin: 0 }}>
              Tap an Emotion, Mind, Body or Focus node to see your day's evolution.
            </p>
          )}
        </div>
      )}

      {!selected && (
        <p
          style={{
            textAlign: 'center',
            fontSize: 8,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'rgba(196,160,96,0.2)',
            padding: '2px 0 4px',
            margin: 0,
          }}
        >
          drag to rotate · tap to explore
        </p>
      )}

      {/* Colour bubble map — same elements as InfographicsView */}
      <div style={{ borderTop: '1px solid rgba(196,160,96,0.1)' }}>
        <InfographicsView embedded onClose={onClose} />
      </div>
    </div>
  );

  if (embedded) return inner;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 300,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.65)',
          backdropFilter: 'blur(4px)',
        }}
      />
      {inner}
    </div>
  );
}
