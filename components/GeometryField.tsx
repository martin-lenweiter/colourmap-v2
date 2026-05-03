'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/* ── Types ─────────────────────────────────────────────────── */

type Mode = 'sacred' | 'burst' | 'lissajous' | 'golden' | 'kaleidoscope' | 'torus';

interface Pal {
  bg0: string;
  bg1: string;
  line: string;
  fill: string;
  glow: string;
  dots: string;
  rgb: [number, number, number];
}

interface Cfg {
  preset: string;
  symmetry: number;
  complexity: number;
  glow: number;
  breathSpeed: number;
  intensity: number;
  particles: number;
  luminous: number;
  mode: Mode;
}

interface Dot {
  a: number;
  r: number;
  s: number;
  sz: number;
  op: number;
  jt: number;
}

interface Ripple {
  x: number;
  y: number;
  born: number;
}

/* ── Palettes ───────────────────────────────────────────────── */

const PAL: Record<string, Pal> = {
  'Calm Field': {
    bg0: '#120a04',
    bg1: '#080401',
    line: 'rgba(196,160,96,0.55)',
    fill: 'rgba(196,160,96,0.06)',
    glow: 'rgba(196,155,80,0.38)',
    dots: 'rgba(225,200,155,0.65)',
    rgb: [196, 160, 96],
  },
  'Golden Source': {
    bg0: '#130900',
    bg1: '#070300',
    line: 'rgba(255,195,35,0.65)',
    fill: 'rgba(255,180,20,0.07)',
    glow: 'rgba(240,165,15,0.45)',
    dots: 'rgba(255,215,85,0.7)',
    rgb: [255, 195, 35],
  },
  'Blue Astral': {
    bg0: '#030a14',
    bg1: '#010407',
    line: 'rgba(105,170,255,0.6)',
    fill: 'rgba(80,140,235,0.06)',
    glow: 'rgba(65,135,255,0.36)',
    dots: 'rgba(150,200,255,0.7)',
    rgb: [105, 170, 255],
  },
  'Violet Portal': {
    bg0: '#0a0412',
    bg1: '#050208',
    line: 'rgba(175,90,255,0.65)',
    fill: 'rgba(165,75,255,0.07)',
    glow: 'rgba(150,60,255,0.42)',
    dots: 'rgba(200,140,255,0.7)',
    rgb: [175, 90, 255],
  },
  'Forest Ceremony': {
    bg0: '#021008',
    bg1: '#010703',
    line: 'rgba(65,195,140,0.6)',
    fill: 'rgba(50,175,120,0.06)',
    glow: 'rgba(40,170,115,0.35)',
    dots: 'rgba(110,215,160,0.7)',
    rgb: [65, 195, 140],
  },
  'Minimal Light': {
    bg0: '#0e0c0a',
    bg1: '#070604',
    line: 'rgba(238,230,215,0.5)',
    fill: 'rgba(230,220,200,0.04)',
    glow: 'rgba(215,205,188,0.24)',
    dots: 'rgba(245,238,225,0.6)',
    rgb: [238, 230, 215],
  },
  'DMT Vision': {
    bg0: '#0e0614',
    bg1: '#060208',
    line: 'rgba(255,190,60,0.72)',
    fill: 'rgba(255,190,60,0.08)',
    glow: 'rgba(255,160,30,0.52)',
    dots: 'rgba(255,215,100,0.75)',
    rgb: [255, 190, 60],
  },
  'Cosmic Indigo': {
    bg0: '#080316',
    bg1: '#030109',
    line: 'rgba(140,100,255,0.65)',
    fill: 'rgba(140,100,255,0.07)',
    glow: 'rgba(120,80,255,0.42)',
    dots: 'rgba(180,150,255,0.72)',
    rgb: [140, 100, 255],
  },
};

/* ── Preset configs ─────────────────────────────────────────── */

const PRESETS: Record<string, Cfg> = {
  'Calm Field': {
    preset: 'Calm Field',
    symmetry: 8,
    complexity: 4,
    glow: 5,
    breathSpeed: 0.8,
    intensity: 6.5,
    particles: 4,
    luminous: 3,
    mode: 'sacred',
  },
  'Golden Source': {
    preset: 'Golden Source',
    symmetry: 12,
    complexity: 6,
    glow: 8,
    breathSpeed: 1.2,
    intensity: 9,
    particles: 5,
    luminous: 4,
    mode: 'sacred',
  },
  'Blue Astral': {
    preset: 'Blue Astral',
    symmetry: 10,
    complexity: 7,
    glow: 7,
    breathSpeed: 1.0,
    intensity: 7,
    particles: 6,
    luminous: 4,
    mode: 'sacred',
  },
  'Violet Portal': {
    preset: 'Violet Portal',
    symmetry: 16,
    complexity: 8,
    glow: 9,
    breathSpeed: 1.4,
    intensity: 8,
    particles: 7,
    luminous: 5,
    mode: 'sacred',
  },
  'Forest Ceremony': {
    preset: 'Forest Ceremony',
    symmetry: 6,
    complexity: 5,
    glow: 6,
    breathSpeed: 0.9,
    intensity: 7,
    particles: 5,
    luminous: 3,
    mode: 'sacred',
  },
  'Minimal Light': {
    preset: 'Minimal Light',
    symmetry: 4,
    complexity: 3,
    glow: 3,
    breathSpeed: 0.6,
    intensity: 4,
    particles: 2,
    luminous: 3,
    mode: 'sacred',
  },
  'DMT Vision': {
    preset: 'DMT Vision',
    symmetry: 16,
    complexity: 8,
    glow: 9,
    breathSpeed: 1.0,
    intensity: 9,
    particles: 6,
    luminous: 8,
    mode: 'burst',
  },
  'Cosmic Indigo': {
    preset: 'Cosmic Indigo',
    symmetry: 12,
    complexity: 7,
    glow: 8,
    breathSpeed: 0.9,
    intensity: 8,
    particles: 5,
    luminous: 7,
    mode: 'kaleidoscope',
  },
};

/* ── Intention resolver ─────────────────────────────────────── */

function resolveIntention(w: string): string {
  const t = w.toLowerCase();
  if (/clear|focus|vision|clarif/.test(t)) return 'Blue Astral';
  if (/release|let.?go|flow|open|surrender/.test(t)) return 'Calm Field';
  if (/energy|power|fire|strong|courage|bold|activ/.test(t)) return 'Golden Source';
  if (/peace|calm|still|quiet|rest|breath|soft/.test(t)) return 'Minimal Light';
  if (/spirit|portal|cosmos|divine|mystic|dream/.test(t)) return 'Violet Portal';
  if (/nature|earth|ground|grow|forest|root|green/.test(t)) return 'Forest Ceremony';
  if (/dmt|psychedel|vision|burst|ray|expand/.test(t)) return 'DMT Vision';
  if (/indigo|cosmic|infinite|deep|void/.test(t)) return 'Cosmic Indigo';
  const keys = Object.keys(PRESETS);
  return keys[Math.floor(Math.random() * keys.length)];
}

/* ── Particle helpers ───────────────────────────────────────── */

function makeDots(n: number): Dot[] {
  return Array.from({ length: n }, () => ({
    a: Math.random() * Math.PI * 2,
    r: Math.random() * 0.65,
    s: 0.0007 + Math.random() * 0.0013,
    sz: 0.7 + Math.random() * 1.5,
    op: 0.3 + Math.random() * 0.55,
    jt: (Math.random() - 0.5) * 0.0008,
  }));
}

/* ── Three.js helpers ────────────────────────────────────────── */

function hdrColor(rgb: [number, number, number], iF: number, mult = 1.8): THREE.Color {
  return new THREE.Color(
    (rgb[0] / 255) * iF * mult,
    (rgb[1] / 255) * iF * mult,
    (rgb[2] / 255) * iF * mult,
  );
}

function lineMat(color: THREE.Color, opacity = 0.7): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

function ptsMat(color: THREE.Color, size: number, opacity = 0.8): THREE.PointsMaterial {
  return new THREE.PointsMaterial({
    color,
    size,
    sizeAttenuation: false,
    transparent: true,
    opacity,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
}

function circleGeo(segments = 96): THREE.BufferGeometry {
  const pts = new Float32Array((segments + 1) * 3);
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    pts[i * 3] = Math.cos(a);
    pts[i * 3 + 1] = Math.sin(a);
    pts[i * 3 + 2] = 0;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
  return geo;
}

function disposeGroup(g: THREE.Group): void {
  g.traverse((obj) => {
    if (
      obj instanceof THREE.Mesh ||
      obj instanceof THREE.Line ||
      obj instanceof THREE.Points ||
      obj instanceof THREE.LineSegments
    ) {
      obj.geometry.dispose();
      const m = obj.material as THREE.Material | THREE.Material[];
      Array.isArray(m) ? m.forEach((x) => x.dispose()) : m.dispose();
    }
  });
}

function updateMat(
  obj: THREE.Object3D,
  rgb: [number, number, number],
  iF: number,
  mult = 1.8,
): void {
  const mat = (obj as THREE.Line | THREE.Points).material as
    | THREE.LineBasicMaterial
    | THREE.PointsMaterial;
  if (mat?.color)
    mat.color.setRGB(
      (rgb[0] / 255) * iF * mult,
      (rgb[1] / 255) * iF * mult,
      (rgb[2] / 255) * iF * mult,
    );
}

function buildRings(
  count: number,
  R: number,
  rgb: [number, number, number],
  iF: number,
): THREE.Group {
  const g = new THREE.Group();
  for (let i = 1; i <= count; i++) {
    const brightness = (0.2 + (i / count) * 0.8) * iF;
    const ring = new THREE.Line(circleGeo(96), lineMat(hdrColor(rgb, brightness, 2), 1.0));
    ring.scale.setScalar(R * (i / count));
    ring.userData.baseScale = R * (i / count);
    ring.userData.ri = i / count;
    g.add(ring);
  }
  return g;
}

function updateRings(
  ringsGroup: THREE.Group,
  bs: number,
  rgb: [number, number, number],
  iF: number,
): void {
  ringsGroup.children.forEach((c) => {
    c.scale.setScalar((c as THREE.Line).userData.baseScale * bs);
    updateMat(c as THREE.Object3D, rgb, (c as THREE.Line).userData.ri * iF * 0.8, 2);
  });
}

function buildParticles(
  dots: Dot[],
  R: number,
  rgb: [number, number, number],
  iF: number,
  scale: number,
): THREE.Points {
  const N = dots.length;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3] = Math.cos(dots[i].a) * dots[i].r * R;
    pos[i * 3 + 1] = Math.sin(dots[i].a) * dots[i].r * R;
    pos[i * 3 + 2] = 0;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  return new THREE.Points(geo, ptsMat(hdrColor(rgb, iF, 1.5), 1.5 * scale, 0.7));
}

function updateParticles(
  particles: THREE.Points,
  dots: Dot[],
  breathSpeed: number,
  R: number,
  rgb: [number, number, number],
  iF: number,
): void {
  const TAU = Math.PI * 2;
  const pos = particles.geometry.attributes.position.array as Float32Array;
  for (let i = 0; i < dots.length; i++) {
    const d = dots[i];
    d.r += d.s * (0.25 + breathSpeed * 0.15);
    d.a += d.jt;
    if (d.r > 1.08) {
      d.r = Math.random() * 0.18;
      d.a = Math.random() * TAU;
    }
    const fade = Math.max(0, 1 - d.r * 0.85);
    pos[i * 3] = Math.cos(d.a) * d.r * R;
    pos[i * 3 + 1] = Math.sin(d.a) * d.r * R;
    (particles.material as THREE.PointsMaterial).opacity = fade * iF * 0.7;
  }
  particles.geometry.attributes.position.needsUpdate = true;
  updateMat(particles, rgb, iF, 1.5);
}

function buildCenter(rgb: [number, number, number], iF: number, scale: number): THREE.Points {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
  return new THREE.Points(geo, ptsMat(hdrColor(rgb, iF, 6), 10 * scale, 1.0));
}

function updateCenter(
  center: THREE.Points,
  breath: number,
  rgb: [number, number, number],
  iF: number,
  scale: number,
): void {
  const mat = center.material as THREE.PointsMaterial;
  mat.size = (8 + breath * 4) * scale;
  updateMat(center, rgb, iF, 6);
}

/* ── Ripple ring system ─────────────────────────────────────── */

function updateRippleRings(
  scene: THREE.Scene,
  rings: THREE.Line[],
  ripples: Ripple[],
  t: number,
  cfg: Cfg,
  R: number,
): void {
  const pal = PAL[cfg.preset] ?? PAL['Calm Field'];
  const [rr, gg, bb] = pal.rgb;

  // Expire old ripple rings
  for (let i = rings.length - 1; i >= 0; i--) {
    const age = (t - rings[i].userData.born) / 1800;
    if (age > 1) {
      scene.remove(rings[i]);
      rings[i].geometry.dispose();
      (rings[i].material as THREE.Material).dispose();
      rings.splice(i, 1);
    }
  }

  // Spawn rings for new ripples (those not yet represented)
  for (const rp of ripples) {
    if (rings.find((r) => r.userData.rippleId === rp.born)) continue;
    const geo = circleGeo(64);
    const mat = lineMat(hdrColor([rr, gg, bb], 0.8, 1.5), 0.6);
    const ring = new THREE.Line(geo, mat);
    ring.position.set(rp.x - (scene.userData.W ?? 0) / 2, -(rp.y - (scene.userData.H ?? 0) / 2), 0);
    ring.scale.setScalar(1);
    ring.userData.born = rp.born;
    ring.userData.rippleId = rp.born;
    scene.add(ring);
    rings.push(ring);
  }

  // Animate rings
  for (const ring of rings) {
    const age = (t - ring.userData.born) / 1800;
    ring.scale.setScalar(age * R * 1.8);
    const mat = ring.material as THREE.LineBasicMaterial;
    mat.opacity = (1 - age) * 0.55;
    updateMat(ring, [rr, gg, bb], 0.8, 1.5);
  }
}

/* ── Build + update dispatch ────────────────────────────────── */

function buildModeGroup(cfg: Cfg, R: number): THREE.Group {
  switch (cfg.mode) {
    case 'burst':
      return buildBurst(cfg, R);
    case 'lissajous':
      return buildLissajous(cfg, R);
    case 'golden':
      return buildGolden(cfg, R);
    case 'kaleidoscope':
      return buildKaleidoscope(cfg, R);
    case 'torus':
      return buildTorus(cfg, R);
    default:
      return buildSacred(cfg, R);
  }
}

function updateModeGroup(group: THREE.Group, cfg: Cfg, dots: Dot[], t: number, R: number): void {
  switch (cfg.mode) {
    case 'burst':
      updateBurst(group, cfg, t, R);
      break;
    case 'lissajous':
      updateLissajous(group, cfg, t, R);
      break;
    case 'golden':
      updateGolden(group, cfg, t, R);
      break;
    case 'kaleidoscope':
      updateKaleidoscope(group, cfg, t, R);
      break;
    case 'torus':
      updateTorus(group, cfg, t, R);
      break;
    default:
      updateSacred(group, cfg, dots, t, R);
      break;
  }
}

/* ── SACRED mode ────────────────────────────────────────────── */

function buildSacred(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Calm Field'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const sym = Math.round(cfg.symmetry);
  const layers = Math.max(1, Math.round(cfg.complexity));
  const TAU = Math.PI * 2;
  const scale = R / 210;

  const group = new THREE.Group();

  // Rings
  const rings = buildRings(layers + 3, R, [rr, gg, bb], iF);
  rings.userData.tag = 'rings';
  group.add(rings);

  // Radial guide lines
  const guidePos = new Float32Array(sym * 2 * 3);
  for (let s = 0; s < sym; s++) {
    const a = (s / sym) * TAU;
    const base = s * 6;
    guidePos[base] = Math.cos(a) * R * 0.08;
    guidePos[base + 1] = Math.sin(a) * R * 0.08;
    guidePos[base + 2] = 0;
    guidePos[base + 3] = Math.cos(a) * R;
    guidePos[base + 4] = Math.sin(a) * R;
    guidePos[base + 5] = 0;
  }
  const guideGeo = new THREE.BufferGeometry();
  guideGeo.setAttribute('position', new THREE.BufferAttribute(guidePos, 3));
  const guideLines = new THREE.LineSegments(
    guideGeo,
    lineMat(hdrColor([rr, gg, bb], iF * 0.2, 1.5), 1.0),
  );
  guideLines.userData.tag = 'guides';
  group.add(guideLines);

  // Petal layers
  const petalLayers = Math.max(1, Math.round(layers * 0.7));
  for (let layer = 1; layer <= petalLayers; layer++) {
    const outerR = R * (layer / (petalLayers + 1));
    const innerR = outerR * 0.3;
    const pw = (TAU / sym) * 0.35;
    const spw = Math.sin(pw);
    const petalGroup = new THREE.Group();
    petalGroup.userData.tag = 'petals';
    petalGroup.userData.layer = layer;
    petalGroup.userData.baseOuterR = outerR;
    petalGroup.userData.dir = layer % 2 === 0 ? 1 : -1;

    for (let s = 0; s < sym; s++) {
      const ang = (s / sym) * TAU;
      // Sample bezier petal (two cubic bezier curves)
      const pts: number[] = [];
      const N = 20;
      // Curve 1: from (0, innerR) to (0, outerR)
      for (let k = 0; k <= N; k++) {
        const ti = k / N;
        const mt = 1 - ti;
        const x =
          mt ** 3 * 0 +
          3 * mt ** 2 * ti * (outerR * spw) +
          3 * mt * ti ** 2 * (outerR * spw) +
          ti ** 3 * 0;
        const y =
          mt ** 3 * innerR +
          3 * mt ** 2 * ti * (outerR * 0.55) +
          3 * mt * ti ** 2 * (outerR * 0.88) +
          ti ** 3 * outerR;
        pts.push(x, y, 0);
      }
      // Curve 2: from (0, outerR) back to (0, innerR)
      for (let k = 0; k <= N; k++) {
        const ti = k / N;
        const mt = 1 - ti;
        const x =
          mt ** 3 * 0 +
          3 * mt ** 2 * ti * (-outerR * spw) +
          3 * mt * ti ** 2 * (-outerR * spw) +
          ti ** 3 * 0;
        const y =
          mt ** 3 * outerR +
          3 * mt ** 2 * ti * (outerR * 0.88) +
          3 * mt * ti ** 2 * (outerR * 0.55) +
          ti ** 3 * innerR;
        pts.push(x, y, 0);
      }
      const pGeo = new THREE.BufferGeometry();
      pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
      const petal = new THREE.Line(
        pGeo,
        lineMat(hdrColor([rr, gg, bb], iF * (0.5 + layer * 0.1), 1.8), 1.0),
      );
      petal.rotation.z = ang;
      petalGroup.add(petal);
    }
    group.add(petalGroup);
  }

  // Orbital dot layers
  const orbLayers = Math.min(layers, 7);
  for (let layer = 1; layer <= orbLayers; layer++) {
    const orbitR = R * (layer / (orbLayers + 1));
    const orbitPos = new Float32Array(sym * 3);
    for (let d = 0; d < sym; d++) {
      const a = (d / sym) * TAU;
      orbitPos[d * 3] = Math.cos(a) * orbitR;
      orbitPos[d * 3 + 1] = Math.sin(a) * orbitR;
      orbitPos[d * 3 + 2] = 0;
    }
    const oGeo = new THREE.BufferGeometry();
    oGeo.setAttribute('position', new THREE.BufferAttribute(orbitPos, 3));
    const orbit = new THREE.Points(oGeo, ptsMat(hdrColor([rr, gg, bb], iF, 2), 2.5 * scale, 0.85));
    orbit.userData.tag = 'orbital';
    orbit.userData.orbitR = orbitR;
    orbit.userData.dir = layer % 2 === 0 ? 1 : -1;
    group.add(orbit);
  }

  // Floating particles
  const particles = buildParticles(
    makeDots(Math.round(cfg.particles * 40 + 20)),
    R,
    [rr, gg, bb],
    iF,
    scale,
  );
  particles.userData.tag = 'particles';
  group.add(particles);

  // Central dot
  const center = buildCenter([rr, gg, bb], iF, scale);
  center.userData.tag = 'center';
  group.add(center);

  return group;
}

function updateSacred(group: THREE.Group, cfg: Cfg, dots: Dot[], t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Calm Field'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const scale = R / 210;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;
  const bs = 0.9 + breath * 0.1;

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'rings') {
      updateRings(child as THREE.Group, bs, [rr, gg, bb], iF);
    } else if (tag === 'guides') {
      child.rotation.z = t * 0.00004;
      updateMat(child as THREE.Object3D, [rr, gg, bb], iF * 0.2, 1.5);
    } else if (tag === 'petals') {
      const pg = child as THREE.Group;
      const dir = pg.userData.dir as number;
      pg.rotation.z = t * 0.00018 * dir;
      pg.scale.setScalar(bs);
      pg.children.forEach((p) => updateMat(p as THREE.Object3D, [rr, gg, bb], iF * 0.8, 1.8));
    } else if (tag === 'orbital') {
      const orbit = child as THREE.Points;
      const dir = orbit.userData.dir as number;
      orbit.rotation.z = t * 0.00025 * cfg.breathSpeed * dir;
      const mat = orbit.material as THREE.PointsMaterial;
      mat.opacity = (0.45 + breath * 0.35) * iF;
      mat.size = (1.5 + breath * 1.5) * scale;
      updateMat(orbit, [rr, gg, bb], iF, 2);
    } else if (tag === 'particles') {
      updateParticles(child as THREE.Points, dots, cfg.breathSpeed, R, [rr, gg, bb], iF);
    } else if (tag === 'center') {
      updateCenter(child as THREE.Points, breath, [rr, gg, bb], iF, scale);
    }
  }
}

/* ── BURST mode ─────────────────────────────────────────────── */

function buildBurst(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['DMT Vision'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const sym = Math.round(cfg.symmetry);
  const layers = Math.max(1, Math.round(cfg.complexity));
  const TAU = Math.PI * 2;
  const scale = R / 210;
  const lineCount = sym * (8 + layers * 4);

  const group = new THREE.Group();

  // Burst lines (many thin lines from center to edge)
  const burstPos = new Float32Array(lineCount * 2 * 3);
  const angles = new Float32Array(lineCount);
  for (let i = 0; i < lineCount; i++) {
    angles[i] = (i / lineCount) * TAU;
    burstPos[i * 6 + 3] = Math.cos(angles[i]) * R;
    burstPos[i * 6 + 4] = Math.sin(angles[i]) * R;
  }
  const burstGeo = new THREE.BufferGeometry();
  burstGeo.setAttribute('position', new THREE.BufferAttribute(burstPos, 3));
  const burstLines = new THREE.LineSegments(
    burstGeo,
    lineMat(hdrColor([rr, gg, bb], iF * 0.5, 1.5), 1.0),
  );
  burstLines.userData.angles = angles;
  burstLines.userData.lineCount = lineCount;
  burstLines.userData.tag = 'burstLines';
  group.add(burstLines);

  // Main symmetry lines (brighter)
  const mainPos = new Float32Array(sym * 2 * 3);
  for (let s = 0; s < sym; s++) {
    const a = (s / sym) * TAU;
    mainPos[s * 6 + 3] = Math.cos(a) * R;
    mainPos[s * 6 + 4] = Math.sin(a) * R;
  }
  const mainGeo = new THREE.BufferGeometry();
  mainGeo.setAttribute('position', new THREE.BufferAttribute(mainPos, 3));
  const mainLines = new THREE.LineSegments(mainGeo, lineMat(hdrColor([rr, gg, bb], iF, 2.5), 1.0));
  mainLines.userData.tag = 'mainLines';
  group.add(mainLines);

  // Rings
  const rings = buildRings(Math.round(6 + layers * 2), R, [rr, gg, bb], iF);
  rings.userData.tag = 'rings';
  group.add(rings);

  // Central dot
  const center = buildCenter([rr, gg, bb], iF, scale);
  center.userData.tag = 'center';
  group.add(center);

  return group;
}

function updateBurst(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['DMT Vision'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const scale = R / 210;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;
  const bs = 0.92 + breath * 0.08;
  const rotOffset = t * 0.00006;

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'burstLines') {
      const bl = child as THREE.LineSegments;
      const positions = bl.geometry.attributes.position.array as Float32Array;
      const blAngles = bl.userData.angles as Float32Array;
      const lineCount = bl.userData.lineCount as number;
      for (let i = 0; i < lineCount; i++) {
        const ang = blAngles[i] + rotOffset;
        const phase = Math.sin(i * 0.3917 + t * 0.0003);
        const len = R * bs * (0.75 + phase * 0.25);
        positions[i * 6 + 3] = Math.cos(ang) * len;
        positions[i * 6 + 4] = Math.sin(ang) * len;
      }
      bl.geometry.attributes.position.needsUpdate = true;
      updateMat(bl, [rr, gg, bb], iF * 0.5, 1.5);
    } else if (tag === 'mainLines') {
      child.rotation.z = t * 0.00004;
      updateMat(child as THREE.Object3D, [rr, gg, bb], iF, 2.5);
    } else if (tag === 'rings') {
      updateRings(child as THREE.Group, bs, [rr, gg, bb], iF);
      (child as THREE.Group).rotation.z = t * 0.000012;
    } else if (tag === 'center') {
      updateCenter(child as THREE.Points, breath, [rr, gg, bb], iF, scale);
    }
  }
}

/* ── LISSAJOUS mode ─────────────────────────────────────────── */

const LISSAJOUS_RATIOS: [number, number, number][] = [
  [1, 2, 0],
  [2, 3, Math.PI / 4],
  [3, 4, Math.PI / 6],
  [1, 3, Math.PI / 3],
  [2, 5, Math.PI / 2],
];

function buildLissajous(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Blue Astral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const sym = Math.round(cfg.symmetry);
  const layers = Math.max(1, Math.round(cfg.complexity));
  const TAU = Math.PI * 2;
  const scale = R / 210;

  const group = new THREE.Group();
  const usedRatios = LISSAJOUS_RATIOS.slice(0, Math.min(layers + 1, LISSAJOUS_RATIOS.length));
  const STEPS = 360;

  for (let li = 0; li < usedRatios.length; li++) {
    const [a, b, delta0] = usedRatios[li];
    const curveGroup = new THREE.Group();
    curveGroup.userData.tag = 'curve';
    curveGroup.userData.a = a;
    curveGroup.userData.b = b;
    curveGroup.userData.delta0 = delta0;
    curveGroup.userData.li = li;

    for (let s = 0; s < sym; s++) {
      const pts = new Float32Array((STEPS + 1) * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
      const opacity = (0.35 - li * 0.04) * iF;
      const curve = new THREE.Line(
        geo,
        lineMat(hdrColor([rr, gg, bb], Math.max(0.1, opacity), 2), 1.0),
      );
      curve.rotation.z = (s / sym) * TAU;
      curveGroup.add(curve);
    }
    group.add(curveGroup);
  }

  // Suppress unused var warning — scale is used in buildCenter call below
  void scale;

  const center = buildCenter([rr, gg, bb], iF, R / 210);
  center.userData.tag = 'center';
  group.add(center);
  return group;
}

function updateLissajous(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Blue Astral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const scale = R / 210;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;
  const bs = 0.88 + breath * 0.12;
  const STEPS = 360;
  const TAU = Math.PI * 2;

  for (const child of group.children) {
    if (child.userData.tag === 'curve') {
      const cg = child as THREE.Group;
      const a = cg.userData.a as number;
      const b = cg.userData.b as number;
      const delta0 = cg.userData.delta0 as number;
      const li = cg.userData.li as number;
      const delta = delta0 + t * 0.00025 * (li % 2 === 0 ? 1 : -0.7);

      cg.children.forEach((curve) => {
        const pos = (curve as THREE.Line).geometry.attributes.position.array as Float32Array;
        for (let step = 0; step <= STEPS; step++) {
          const tp = (step / STEPS) * TAU;
          pos[step * 3] = R * bs * Math.sin(a * tp + delta);
          pos[step * 3 + 1] = R * bs * Math.sin(b * tp);
          pos[step * 3 + 2] = 0;
        }
        (curve as THREE.Line).geometry.attributes.position.needsUpdate = true;
        updateMat(curve as THREE.Object3D, [rr, gg, bb], (0.35 - li * 0.04) * iF, 2);
      });
    } else if (child.userData.tag === 'center') {
      updateCenter(child as THREE.Points, breath, [rr, gg, bb], iF, scale);
    }
  }
}

/* ── GOLDEN mode ────────────────────────────────────────────── */

function buildGolden(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Golden Source'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const layers = Math.max(1, Math.round(cfg.complexity));
  const PHI = 1.6180339887;
  const scale = R / 210;

  const group = new THREE.Group();
  const pointCount = Math.round(100 + layers * 80);

  // Phyllotaxis dots (positions updated each frame)
  const dotPos = new Float32Array(pointCount * 3);
  const dotGeo = new THREE.BufferGeometry();
  dotGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
  const dots = new THREE.Points(dotGeo, ptsMat(hdrColor([rr, gg, bb], iF, 1.5), 2 * scale, 0.8));
  dots.userData.tag = 'phyllo';
  dots.userData.pointCount = pointCount;
  group.add(dots);

  // Spiral arms (positions updated each frame)
  const armCount = Math.min(Math.round(layers / 2) + 2, 8);
  const STEPS = 200;
  for (let arm = 0; arm < armCount; arm++) {
    const armPos = new Float32Array((STEPS + 1) * 3);
    const armGeo = new THREE.BufferGeometry();
    armGeo.setAttribute('position', new THREE.BufferAttribute(armPos, 3));
    const spiral = new THREE.Line(armGeo, lineMat(hdrColor([rr, gg, bb], iF * 0.5, 1.8), 1.0));
    spiral.userData.tag = 'spiral';
    spiral.userData.arm = arm;
    spiral.userData.armCount = armCount;
    group.add(spiral);
  }

  // Golden-ratio concentric rings (static positions, scale changes with breath)
  const ringGroup = new THREE.Group();
  ringGroup.userData.tag = 'goldenRings';
  let ringR = 0.1;
  while (ringR < 1.05) {
    const ring = new THREE.Line(circleGeo(80), lineMat(hdrColor([rr, gg, bb], iF * 0.15, 2), 1.0));
    ring.scale.setScalar(R * ringR);
    ring.userData.baseScale = R * ringR;
    ringGroup.add(ring);
    ringR *= PHI;
  }
  group.add(ringGroup);

  const center = buildCenter([rr, gg, bb], iF, scale);
  center.userData.tag = 'center';
  group.add(center);
  return group;
}

function updateGolden(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Golden Source'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const scale = R / 210;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;
  const bs = 0.9 + breath * 0.1;
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
  const PHI = 1.6180339887;
  const TAU = Math.PI * 2;
  const STEPS = 200;
  const tOff = t * 0.00015;

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'phyllo') {
      const pts = child as THREE.Points;
      const pos = pts.geometry.attributes.position.array as Float32Array;
      const N = pts.userData.pointCount as number;
      for (let i = 0; i < N; i++) {
        const r = Math.sqrt(i / N) * R * bs;
        const a = i * GOLDEN_ANGLE + tOff;
        pos[i * 3] = Math.cos(a) * r;
        pos[i * 3 + 1] = Math.sin(a) * r;
      }
      pts.geometry.attributes.position.needsUpdate = true;
      updateMat(pts, [rr, gg, bb], iF, 1.5);
    } else if (tag === 'spiral') {
      const sp = child as THREE.Line;
      const arm = sp.userData.arm as number;
      const armCount = sp.userData.armCount as number;
      const pos = sp.geometry.attributes.position.array as Float32Array;
      const armOff = (arm / armCount) * TAU + tOff * 0.5;
      for (let step = 0; step <= STEPS; step++) {
        const f = step / STEPS;
        const theta = f * TAU * Math.log(PHI) * 8 + armOff;
        const r = f * R * bs;
        pos[step * 3] = Math.cos(theta) * r;
        pos[step * 3 + 1] = Math.sin(theta) * r;
      }
      sp.geometry.attributes.position.needsUpdate = true;
      updateMat(sp, [rr, gg, bb], iF * 0.5, 1.8);
    } else if (tag === 'goldenRings') {
      (child as THREE.Group).children.forEach((ring) => {
        ring.scale.setScalar((ring.userData.baseScale as number) * bs);
        updateMat(ring as THREE.Object3D, [rr, gg, bb], iF * 0.15, 2);
      });
    } else if (tag === 'center') {
      updateCenter(child as THREE.Points, breath, [rr, gg, bb], iF, scale);
    }
  }
}

/* ── KALEIDOSCOPE mode ──────────────────────────────────────── */

function buildKaleidoscope(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Violet Portal'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const sym = Math.round(cfg.symmetry);
  const layers = Math.max(1, Math.round(cfg.complexity));
  const TAU = Math.PI * 2;
  const scale = R / 210;
  const wedge = TAU / sym;
  const blobCount = 2 + layers;

  const group = new THREE.Group();

  // One Points object per wedge sector
  for (let s = 0; s < sym; s++) {
    const blobPos = new Float32Array(blobCount * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(blobPos, 3));
    const blobs = new THREE.Points(geo, ptsMat(hdrColor([rr, gg, bb], iF, 2.5), 12 * scale, 0.7));
    blobs.userData.tag = 'wedgeBlobs';
    blobs.userData.sector = s;
    blobs.userData.wedge = wedge;
    blobs.userData.blobCount = blobCount;
    group.add(blobs);
  }

  // Rings on top
  const rings = buildRings(5 + layers, R, [rr, gg, bb], iF);
  rings.userData.tag = 'rings';
  group.add(rings);

  const center = buildCenter([rr, gg, bb], iF, scale);
  center.userData.tag = 'center';
  group.add(center);
  return group;
}

function updateKaleidoscope(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Violet Portal'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const scale = R / 210;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;
  const bs = 0.9 + breath * 0.1;
  const sym = Math.round(cfg.symmetry);
  const TAU = Math.PI * 2;
  const wedge = TAU / sym;

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'wedgeBlobs') {
      const sector = child.userData.sector as number;
      const blobCount = child.userData.blobCount as number;
      const blobs = child as THREE.Points;
      const pos = blobs.geometry.attributes.position.array as Float32Array;
      const baseAng = sector * wedge + t * 0.00012;

      for (let b = 0; b < blobCount; b++) {
        const phase = b / blobCount;
        const r = R * (0.15 + phase * 0.7) * bs;
        const a = baseAng + phase * wedge * 0.8 + wedge * 0.1;
        const pulse = 0.8 + breath * 0.4;
        pos[b * 3] = Math.cos(a) * r * pulse;
        pos[b * 3 + 1] = Math.sin(a) * r * pulse;
        pos[b * 3 + 2] = 0;
      }
      blobs.geometry.attributes.position.needsUpdate = true;
      const mat = blobs.material as THREE.PointsMaterial;
      mat.size = (8 + breath * 6) * scale;
      updateMat(blobs, [rr, gg, bb], iF, 2.5);
    } else if (tag === 'rings') {
      updateRings(child as THREE.Group, bs, [rr, gg, bb], iF);
    } else if (tag === 'center') {
      updateCenter(child as THREE.Points, breath, [rr, gg, bb], iF, scale);
    }
  }
}

/* ── TORUS mode ─────────────────────────────────────────────── */

function buildTorus(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Cosmic Indigo'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const sym = Math.round(cfg.symmetry);
  const layers = Math.max(1, Math.round(cfg.complexity));
  const TAU = Math.PI * 2;
  const scale = R / 210;
  const p = 2;
  const q = Math.round(3 + layers * 0.4);
  const KSTEPS = 600;
  const LSTEPS = 300;

  const group = new THREE.Group();

  // Main torus knot
  const knotPos = new Float32Array((KSTEPS + 1) * 3);
  const knotGeo = new THREE.BufferGeometry();
  knotGeo.setAttribute('position', new THREE.BufferAttribute(knotPos, 3));
  const knot = new THREE.Line(knotGeo, lineMat(hdrColor([rr, gg, bb], iF, 2.2), 1.0));
  knot.userData.tag = 'knot';
  knot.userData.p = p;
  knot.userData.q = q;
  knot.userData.steps = KSTEPS;
  knot.userData.r1 = R * 0.5;
  knot.userData.r2 = R * 0.25;
  group.add(knot);

  // Multi-phase torus layers
  for (let layer = 1; layer <= layers + 1; layer++) {
    const lPos = new Float32Array((LSTEPS + 1) * 3);
    const lGeo = new THREE.BufferGeometry();
    lGeo.setAttribute('position', new THREE.BufferAttribute(lPos, 3));
    const lLine = new THREE.Line(
      lGeo,
      lineMat(hdrColor([rr, gg, bb], iF * (0.15 + layer * 0.05), 2), 1.0),
    );
    lLine.userData.tag = 'torusLayer';
    lLine.userData.layer = layer;
    lLine.userData.layers = layers;
    lLine.userData.p = p;
    lLine.userData.q = q;
    lLine.userData.steps = LSTEPS;
    group.add(lLine);
  }

  // Orbital rings with dots
  for (let i = 1; i <= Math.round(4 + layers); i++) {
    const orbitR = R * (i / (4 + layers));
    const ring = new THREE.Line(circleGeo(80), lineMat(hdrColor([rr, gg, bb], iF * 0.2, 1.5), 1.0));
    ring.scale.setScalar(orbitR);
    ring.userData.tag = 'orbitRing';
    ring.userData.orbitR = orbitR;
    ring.userData.dir = i % 2 === 0 ? 1 : -1;
    group.add(ring);

    const dotPos = new Float32Array(sym * 3);
    for (let d = 0; d < sym; d++) {
      const a = (d / sym) * TAU;
      dotPos[d * 3] = Math.cos(a) * orbitR;
      dotPos[d * 3 + 1] = Math.sin(a) * orbitR;
    }
    const dGeo = new THREE.BufferGeometry();
    dGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
    const orbitDots = new THREE.Points(dGeo, ptsMat(hdrColor([rr, gg, bb], iF, 2), 2 * scale, 0.7));
    orbitDots.userData.tag = 'orbitDots';
    orbitDots.userData.orbitR = orbitR;
    orbitDots.userData.dir = i % 2 === 0 ? 1 : -1;
    group.add(orbitDots);
  }

  const center = buildCenter([rr, gg, bb], iF, scale);
  center.userData.tag = 'center';
  group.add(center);
  return group;
}

function updateTorus(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Cosmic Indigo'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const scale = R / 210;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;
  const bs = 0.9 + breath * 0.1;
  const TAU = Math.PI * 2;

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'knot') {
      const k = child as THREE.Line;
      const pos = k.geometry.attributes.position.array as Float32Array;
      const p2 = k.userData.p as number;
      const q2 = k.userData.q as number;
      const steps = k.userData.steps as number;
      const r1 = (k.userData.r1 as number) * bs;
      const r2 = (k.userData.r2 as number) * bs;
      for (let i = 0; i <= steps; i++) {
        const tp = (i / steps) * TAU + t * 0.0001;
        const r = r2 * Math.cos(q2 * tp) + r1;
        pos[i * 3] = r * Math.cos(p2 * tp);
        pos[i * 3 + 1] = r * Math.sin(p2 * tp);
      }
      k.geometry.attributes.position.needsUpdate = true;
      updateMat(k, [rr, gg, bb], iF, 2.2);
    } else if (tag === 'torusLayer') {
      const l = child as THREE.Line;
      const pos = l.geometry.attributes.position.array as Float32Array;
      const p2 = l.userData.p as number;
      const q2 = l.userData.q as number;
      const steps = l.userData.steps as number;
      const layer = l.userData.layer as number;
      const layers = l.userData.layers as number;
      const r1 = R * bs * (layer / (layers + 2)) * 0.9;
      const r2 = r1 * 0.35;
      const tOff = t * 0.0001 * (layer % 2 === 0 ? 1 : -0.8) + (layer / layers) * Math.PI;
      for (let i = 0; i <= steps; i++) {
        const tp = (i / steps) * TAU + tOff;
        const r = r2 * Math.cos(q2 * tp) + r1;
        pos[i * 3] = r * Math.cos(p2 * tp);
        pos[i * 3 + 1] = r * Math.sin(p2 * tp);
      }
      l.geometry.attributes.position.needsUpdate = true;
      updateMat(l, [rr, gg, bb], (0.15 + layer * 0.05) * iF, 2);
    } else if (tag === 'orbitRing') {
      child.rotation.z = t * 0.00018 * (child.userData.dir as number);
      updateMat(child as THREE.Object3D, [rr, gg, bb], iF * 0.2, 1.5);
    } else if (tag === 'orbitDots') {
      child.rotation.z = t * 0.00025 * (child.userData.dir as number);
      const mat = (child as THREE.Points).material as THREE.PointsMaterial;
      mat.opacity = (0.3 + breath * 0.3) * iF;
      updateMat(child as THREE.Object3D, [rr, gg, bb], iF, 2);
    } else if (tag === 'center') {
      updateCenter(child as THREE.Points, breath, [rr, gg, bb], iF, scale);
    }
  }
}

/* ── Slider definitions ─────────────────────────────────────── */

const SLIDERS = [
  { key: 'symmetry', label: 'Symmetry', min: 4, max: 24, step: 1 },
  { key: 'complexity', label: 'Complexity', min: 1, max: 10, step: 0.5 },
  { key: 'glow', label: 'Glow', min: 0, max: 10, step: 0.5 },
  { key: 'breathSpeed', label: 'Breath', min: 0.2, max: 3, step: 0.1 },
  { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
  { key: 'particles', label: 'Particles', min: 0, max: 10, step: 1 },
  { key: 'luminous', label: 'Luminous', min: 0, max: 10, step: 0.5 },
] as const;

/* ── Mode pill definitions ──────────────────────────────────── */

const MODES: { mode: Mode; label: string }[] = [
  { mode: 'sacred', label: '✦ Sacred' },
  { mode: 'burst', label: '✤ Burst' },
  { mode: 'lissajous', label: '∿ Lissajous' },
  { mode: 'golden', label: 'φ Golden' },
  { mode: 'kaleidoscope', label: '⬡ Kaleidoscope' },
  { mode: 'torus', label: '◎ Torus' },
];

/* ── Component ──────────────────────────────────────────────── */

export default function GeometryField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const dprRef = useRef<number>(1);
  const cfgRef = useRef<Cfg>(PRESETS['Calm Field']);
  const dotsRef = useRef<Dot[]>(makeDots(160));
  const ripplesRef = useRef<Ripple[]>([]);

  // Three.js refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const modeGroupRef = useRef<THREE.Group | null>(null);
  const builtKeyRef = useRef('');
  const sizeRef = useRef({ W: 0, H: 0 });
  const clearColorRef = useRef(new THREE.Color());
  const rippleRingsRef = useRef<THREE.Line[]>([]);

  const [cfg, setCfg] = useState<Cfg>(PRESETS['Calm Field']);
  const [open, setOpen] = useState(true);
  const [intention, setIntention] = useState('');
  const [tuned, setTuned] = useState(false);

  useEffect(() => {
    cfgRef.current = cfg;
  }, [cfg]);

  useEffect(() => {
    dotsRef.current = makeDots(Math.round(cfg.particles * 40 + 20));
  }, [cfg.particles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    rendererRef.current = renderer;

    // Scene + Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -10, 10);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Post-processing
    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);
    const bloomPass = new UnrealBloomPass(new THREE.Vector2(100, 100), 1.5, 0.5, 0.05);
    composer.addPass(bloomPass);
    composer.addPass(new OutputPass());
    composerRef.current = composer;
    bloomPassRef.current = bloomPass;

    function resize() {
      const W = wrapper!.offsetWidth;
      const H = wrapper!.offsetHeight;
      sizeRef.current = { W, H };
      const dpr = Math.min(window.devicePixelRatio, 2);
      dprRef.current = dpr;
      renderer.setSize(W, H, false);
      camera.left = -W / 2;
      camera.right = W / 2;
      camera.top = H / 2;
      camera.bottom = -H / 2;
      camera.updateProjectionMatrix();
      composer.setSize(W, H);
      bloomPass.resolution.set(W, H);
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrapper);

    function tick(t: number) {
      const currentCfg = cfgRef.current;
      const { W, H } = sizeRef.current;
      const R = Math.min(W, H) * 0.42;

      // Update clear color from palette
      const pal = PAL[currentCfg.preset] ?? PAL['Calm Field'];
      clearColorRef.current.set(pal.bg1);
      renderer.setClearColor(clearColorRef.current, 1);

      // Bloom from luminous slider
      bloomPass.strength = currentCfg.luminous * 0.28;
      bloomPass.threshold = 0.05;
      bloomPass.radius = 0.4 + currentCfg.luminous * 0.04;

      // Rebuild mode group when topology changes
      const key = `${currentCfg.mode}-${currentCfg.symmetry}-${Math.round(currentCfg.complexity)}`;
      if (key !== builtKeyRef.current || modeGroupRef.current === null) {
        if (modeGroupRef.current) {
          scene.remove(modeGroupRef.current);
          disposeGroup(modeGroupRef.current);
        }
        modeGroupRef.current = buildModeGroup(currentCfg, R);
        scene.add(modeGroupRef.current);
        builtKeyRef.current = key;
      }

      // Update mode each frame
      updateModeGroup(modeGroupRef.current!, currentCfg, dotsRef.current, t, R);

      // Store W/H for ripple positioning
      scene.userData.W = W;
      scene.userData.H = H;

      // Handle ripple rings
      updateRippleRings(scene, rippleRingsRef.current, ripplesRef.current, t, currentCfg, R);

      // Expire old ripples
      for (let i = ripplesRef.current.length - 1; i >= 0; i--) {
        if (t - ripplesRef.current[i].born > 1800) ripplesRef.current.splice(i, 1);
      }

      composer.render();
      animRef.current = requestAnimationFrame(tick);
    }
    animRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animRef.current);
      ro.disconnect();
      // Clean up ripple rings
      for (const r of rippleRingsRef.current) {
        scene.remove(r);
        r.geometry.dispose();
        (r.material as THREE.Material).dispose();
      }
      rippleRingsRef.current = [];
      // Dispose scene
      if (modeGroupRef.current) disposeGroup(modeGroupRef.current);
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  function handleCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    ripplesRef.current.push({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      born: performance.now(),
    });
    if (ripplesRef.current.length > 10) ripplesRef.current.shift();
  }

  function applyPreset(name: string) {
    setCfg(PRESETS[name] ?? PRESETS['Calm Field']);
  }

  function handleIntention(e: React.FormEvent) {
    e.preventDefault();
    if (!intention.trim()) return;
    applyPreset(resolveIntention(intention));
    setTuned(true);
    setTimeout(() => setTuned(false), 1800);
  }

  function handleRandomize() {
    const keys = Object.keys(PRESETS);
    const base = PRESETS[keys[Math.floor(Math.random() * keys.length)]];
    const modeKeys: Mode[] = ['sacred', 'burst', 'lissajous', 'golden', 'kaleidoscope', 'torus'];
    setCfg({
      ...base,
      symmetry: 4 + Math.floor(Math.random() * 20),
      complexity: 2 + Math.random() * 8,
      glow: 1 + Math.random() * 9,
      breathSpeed: 0.3 + Math.random() * 2.5,
      intensity: 4 + Math.random() * 6,
      particles: Math.floor(Math.random() * 10),
      luminous: Math.random() * 10,
      mode: modeKeys[Math.floor(Math.random() * modeKeys.length)],
    });
  }

  function handleSave() {
    const c = canvasRef.current;
    if (!c) return;
    const a = document.createElement('a');
    a.download = `geometry-field-${Date.now()}.png`;
    a.href = c.toDataURL('image/png');
    a.click();
  }

  function handleFullscreen() {
    const el = wrapperRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  function update(key: keyof Cfg, val: number | string) {
    setCfg((prev) => ({ ...prev, [key]: val }));
  }

  const pal = PAL[cfg.preset] ?? PAL['Calm Field'];
  const [pr, pg, pb] = pal.rgb;
  const accent = `rgb(${pr},${pg},${pb})`;
  const accentFaint = `rgba(${pr},${pg},${pb},0.12)`;
  const accentMid = `rgba(${pr},${pg},${pb},0.35)`;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100svh - 110px)',
        minHeight: 420,
        borderRadius: 14,
        overflow: 'hidden',
        background: '#080604',
      }}
    >
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          display: 'block',
          cursor: 'crosshair',
        }}
      />

      {/* Page title — floats above canvas */}
      <div
        style={{
          position: 'absolute',
          top: 14,
          left: 0,
          right: 0,
          textAlign: 'center',
          pointerEvents: 'none',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            letterSpacing: '0.24em',
            color: `rgba(${pr},${pg},${pb},0.45)`,
            textTransform: 'uppercase',
          }}
        >
          Geometry Field
        </p>
      </div>

      {/* Show-controls button when panel closed */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(8,6,4,0.72)',
            border: `1px solid ${accentMid}`,
            borderRadius: 99,
            padding: '6px 22px',
            color: accent,
            fontFamily: 'var(--font-serif)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            zIndex: 20,
          }}
        >
          ▲ Controls
        </button>
      )}

      {/* Control panel */}
      {open && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(8,5,3,0.86)',
            backdropFilter: 'blur(18px)',
            borderTop: `1px solid ${accentMid}`,
            padding: '10px 16px 20px',
            zIndex: 10,
            maxHeight: '60%',
            overflowY: 'auto',
          }}
        >
          {/* Collapse handle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: accentFaint,
                border: `1px solid ${accentMid}`,
                borderRadius: 99,
                padding: '3px 22px',
                color: accent,
                fontFamily: 'var(--font-serif)',
                fontSize: 10,
                letterSpacing: '0.1em',
                cursor: 'pointer',
              }}
            >
              ▼
            </button>
          </div>

          {/* Mode pills */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingBottom: 10,
              scrollbarWidth: 'none',
            }}
          >
            {MODES.map(({ mode, label }) => {
              const active = cfg.mode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => update('mode', mode)}
                  style={{
                    flexShrink: 0,
                    background: active ? accent : accentFaint,
                    border: `1px solid ${active ? accent : accentMid}`,
                    borderRadius: 99,
                    padding: '5px 13px',
                    color: active ? '#fff' : accent,
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11,
                    fontWeight: active ? 700 : 400,
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Preset pills */}
          <div
            style={{
              display: 'flex',
              gap: 6,
              overflowX: 'auto',
              paddingBottom: 10,
              scrollbarWidth: 'none',
            }}
          >
            {Object.keys(PRESETS).map((name) => {
              const active = cfg.preset === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => applyPreset(name)}
                  style={{
                    flexShrink: 0,
                    background: active ? accent : accentFaint,
                    border: `1px solid ${active ? accent : accentMid}`,
                    borderRadius: 99,
                    padding: '5px 13px',
                    color: active ? '#fff' : accent,
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11,
                    fontWeight: active ? 700 : 400,
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {name}
                </button>
              );
            })}
          </div>

          {/* Intention input */}
          <form
            onSubmit={handleIntention}
            style={{ display: 'flex', gap: 8, marginTop: 2, marginBottom: 12 }}
          >
            <input
              type="text"
              placeholder="Type an intention — clarity, release, courage…"
              value={intention}
              onChange={(e) => setIntention(e.target.value)}
              style={{
                flex: 1,
                background: accentFaint,
                border: `1px solid ${accentMid}`,
                borderRadius: 99,
                padding: '7px 14px',
                color: 'rgba(255,255,255,0.82)',
                fontFamily: 'var(--font-serif)',
                fontSize: 12,
                outline: 'none',
              }}
            />
            <button
              type="submit"
              style={{
                background: tuned ? accent : accentFaint,
                border: `1px solid ${accent}`,
                borderRadius: 99,
                padding: '7px 16px',
                color: tuned ? '#fff' : accent,
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {tuned ? '✦ Tuned' : 'Tune'}
            </button>
          </form>

          {/* Sliders */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 20px' }}>
            {SLIDERS.map(({ key, label, min, max, step }) => {
              const val = cfg[key as keyof Cfg] as number;
              return (
                <div key={key}>
                  <div
                    style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}
                  >
                    <span
                      style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: 10,
                        color: `rgba(${pr},${pg},${pb},0.6)`,
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {label}
                    </span>
                    <span style={{ fontFamily: 'var(--font-serif)', fontSize: 10, color: accent }}>
                      {step < 1 ? val.toFixed(1) : Math.round(val)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={val}
                    onChange={(e) => update(key as keyof Cfg, parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: accent, cursor: 'pointer' }}
                  />
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginTop: 14,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {(
              [
                ['Randomize', handleRandomize],
                ['Save Image', handleSave],
                ['Reset', () => applyPreset('Calm Field')],
                ['Fullscreen', handleFullscreen],
              ] as [string, () => void][]
            ).map(([label, fn]) => (
              <button
                key={label}
                type="button"
                onClick={fn}
                style={{
                  background: accentFaint,
                  border: `1px solid ${accentMid}`,
                  borderRadius: 99,
                  padding: '6px 16px',
                  color: accent,
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  letterSpacing: '0.07em',
                  cursor: 'pointer',
                  transition: 'opacity 0.15s',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
