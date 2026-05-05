'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

/* ── Types ─────────────────────────────────────────────────── */

type Mode =
  | 'sacred'
  | 'burst'
  | 'lissajous'
  | 'golden'
  | 'kaleidoscope'
  | 'torus'
  | 'tunnel'
  | 'vitral'
  | 'fibonacci'
  | 'clifford'
  | 'hypercube'
  | 'warp'
  | 'lorenz'
  | 'knot'
  | 'orbital'
  | 'geodesic'
  | 'rainbow'
  | 'cathedral'
  | 'islamic'
  | 'yantra'
  | 'celtic'
  | 'bloom'
  | 'lava'
  | 'spire'
  | 'lissajous3d'
  | 'tknot3d'
  | 'lorenz3d'
  | 'rose3d'
  | 'helix3d';

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
  stars: number;
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
  'Warp Tunnel': {
    bg0: '#010510',
    bg1: '#010209',
    line: 'rgba(80,240,255,0.65)',
    fill: 'rgba(60,220,255,0.08)',
    glow: 'rgba(50,210,255,0.42)',
    dots: 'rgba(140,255,255,0.7)',
    rgb: [80, 240, 255],
  },
  'Sacred Vitral': {
    bg0: '#050204',
    bg1: '#020102',
    line: 'rgba(220,180,80,0.6)',
    fill: 'rgba(220,180,80,0.05)',
    glow: 'rgba(200,160,60,0.35)',
    dots: 'rgba(240,210,120,0.65)',
    rgb: [220, 180, 80],
  },
  'Fibonacci Bloom': {
    bg0: '#090600',
    bg1: '#040200',
    line: 'rgba(255,200,40,0.65)',
    fill: 'rgba(255,185,20,0.07)',
    glow: 'rgba(240,170,10,0.45)',
    dots: 'rgba(255,220,90,0.72)',
    rgb: [255, 200, 40],
  },
  'Clifford Dream': {
    bg0: '#030010',
    bg1: '#010008',
    line: 'rgba(120,80,255,0.65)',
    fill: 'rgba(110,70,255,0.07)',
    glow: 'rgba(100,60,255,0.42)',
    dots: 'rgba(170,130,255,0.72)',
    rgb: [120, 80, 255],
  },
  '4D Crystal': {
    bg0: '#020308',
    bg1: '#010205',
    line: 'rgba(160,220,255,0.65)',
    fill: 'rgba(140,200,255,0.07)',
    glow: 'rgba(120,190,255,0.42)',
    dots: 'rgba(200,235,255,0.72)',
    rgb: [160, 220, 255],
  },
  'Warp Drive': {
    bg0: '#000508',
    bg1: '#000204',
    line: 'rgba(80,255,200,0.65)',
    fill: 'rgba(60,240,180,0.07)',
    glow: 'rgba(50,230,170,0.42)',
    dots: 'rgba(140,255,220,0.72)',
    rgb: [80, 255, 200],
  },
  'Lorenz Storm': {
    bg0: '#030612',
    bg1: '#010308',
    line: 'rgba(80,180,255,0.65)',
    fill: 'rgba(60,160,255,0.07)',
    glow: 'rgba(50,150,255,0.40)',
    dots: 'rgba(140,210,255,0.72)',
    rgb: [80, 180, 255],
  },
  'Knot Garden': {
    bg0: '#080010',
    bg1: '#040008',
    line: 'rgba(200,100,255,0.65)',
    fill: 'rgba(180,80,255,0.07)',
    glow: 'rgba(160,60,255,0.40)',
    dots: 'rgba(220,150,255,0.72)',
    rgb: [200, 100, 255],
  },
  'Orbital Shell': {
    bg0: '#001408',
    bg1: '#000a04',
    line: 'rgba(80,255,160,0.65)',
    fill: 'rgba(60,240,140,0.07)',
    glow: 'rgba(50,220,130,0.40)',
    dots: 'rgba(140,255,200,0.72)',
    rgb: [80, 255, 160],
  },
  'Crystal Lattice': {
    bg0: '#060610',
    bg1: '#030308',
    line: 'rgba(200,220,255,0.65)',
    fill: 'rgba(180,200,255,0.07)',
    glow: 'rgba(160,190,255,0.40)',
    dots: 'rgba(220,235,255,0.72)',
    rgb: [200, 220, 255],
  },
  Matrix: {
    bg0: '#000800',
    bg1: '#000400',
    line: 'rgba(0,255,65,0.65)',
    fill: 'rgba(0,255,65,0.06)',
    glow: 'rgba(0,200,50,0.38)',
    dots: 'rgba(100,255,130,0.70)',
    rgb: [0, 255, 65],
  },
  'Islamic Garden': {
    bg0: '#020810',
    bg1: '#010408',
    line: 'rgba(100,210,200,0.65)',
    fill: 'rgba(80,190,180,0.06)',
    glow: 'rgba(60,180,170,0.38)',
    dots: 'rgba(160,240,230,0.72)',
    rgb: [100, 210, 200],
  },
  'Yantra Fire': {
    bg0: '#100200',
    bg1: '#060100',
    line: 'rgba(255,120,30,0.68)',
    fill: 'rgba(255,100,20,0.06)',
    glow: 'rgba(220,80,10,0.42)',
    dots: 'rgba(255,180,80,0.72)',
    rgb: [255, 120, 30],
  },
  'Celtic Forest': {
    bg0: '#010a03',
    bg1: '#010502',
    line: 'rgba(60,210,100,0.65)',
    fill: 'rgba(50,190,80,0.06)',
    glow: 'rgba(40,170,70,0.38)',
    dots: 'rgba(120,240,150,0.72)',
    rgb: [60, 210, 100],
  },
  'Laser Dome': {
    bg0: '#060008',
    bg1: '#030005',
    line: 'rgba(255,60,200,0.65)',
    fill: 'rgba(255,60,200,0.06)',
    glow: 'rgba(200,30,255,0.40)',
    dots: 'rgba(255,140,255,0.72)',
    rgb: [255, 60, 200],
  },
  'Sacred Architecture': {
    bg0: '#080500',
    bg1: '#040200',
    line: 'rgba(220,175,70,0.65)',
    fill: 'rgba(200,155,50,0.06)',
    glow: 'rgba(180,130,40,0.38)',
    dots: 'rgba(240,210,110,0.72)',
    rgb: [220, 175, 70],
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
    stars: 2,
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
    stars: 1,
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
    stars: 4,
    mode: 'sacred',
  },
  'Lissajous 3D': {
    preset: 'Blue Astral',
    symmetry: 3,
    complexity: 2,
    glow: 5,
    breathSpeed: 0.4,
    intensity: 8,
    particles: 4,
    luminous: 3,
    stars: 2,
    mode: 'lissajous3d',
  },
  'Torus Knot': {
    preset: 'Violet Portal',
    symmetry: 2,
    complexity: 3,
    glow: 5,
    breathSpeed: 0.3,
    intensity: 8,
    particles: 3,
    luminous: 4,
    stars: 3,
    mode: 'tknot3d',
  },
  'Lorenz 3D': {
    preset: 'Lorenz Storm',
    symmetry: 10,
    complexity: 14,
    glow: 5,
    breathSpeed: 0.5,
    intensity: 8,
    particles: 3,
    luminous: 4,
    stars: 2,
    mode: 'lorenz3d',
  },
  'Rose 3D': {
    preset: 'Yantra Fire',
    symmetry: 3,
    complexity: 5,
    glow: 2,
    breathSpeed: 0.35,
    intensity: 8,
    particles: 5,
    luminous: 3,
    stars: 2,
    mode: 'rose3d',
  },
  'Helix 3D': {
    preset: 'Celtic Forest',
    symmetry: 3,
    complexity: 4,
    glow: 6,
    breathSpeed: 0.4,
    intensity: 8,
    particles: 4,
    luminous: 3,
    stars: 2,
    mode: 'helix3d',
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
    stars: 3,
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
    stars: 1,
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
    stars: 5,
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
    luminous: 5,
    stars: 2,
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
    luminous: 5,
    stars: 6,
    mode: 'kaleidoscope',
  },
  'Warp Tunnel': {
    preset: 'Warp Tunnel',
    symmetry: 8,
    complexity: 6,
    glow: 7,
    breathSpeed: 1.4,
    intensity: 9,
    particles: 2,
    luminous: 5,
    stars: 8,
    mode: 'tunnel',
  },
  'Sacred Vitral': {
    preset: 'Sacred Vitral',
    symmetry: 12,
    complexity: 6,
    glow: 5,
    breathSpeed: 0.6,
    intensity: 7,
    particles: 0,
    luminous: 4,
    stars: 0,
    mode: 'vitral',
  },
  'Fibonacci Bloom': {
    preset: 'Fibonacci Bloom',
    symmetry: 5,
    complexity: 6,
    glow: 7,
    breathSpeed: 0.8,
    intensity: 8,
    particles: 2,
    luminous: 5,
    stars: 3,
    mode: 'fibonacci',
  },
  'Clifford Dream': {
    preset: 'Clifford Dream',
    symmetry: 8,
    complexity: 6,
    glow: 6,
    breathSpeed: 0.4,
    intensity: 9,
    particles: 0,
    luminous: 5,
    stars: 4,
    mode: 'clifford',
  },
  '4D Crystal': {
    preset: '4D Crystal',
    symmetry: 8,
    complexity: 5,
    glow: 8,
    breathSpeed: 0.7,
    intensity: 8,
    particles: 0,
    luminous: 5,
    stars: 5,
    mode: 'hypercube',
  },
  'Warp Drive': {
    preset: 'Warp Drive',
    symmetry: 12,
    complexity: 6,
    glow: 7,
    breathSpeed: 1.4,
    intensity: 9,
    particles: 0,
    luminous: 5,
    stars: 9,
    mode: 'warp',
  },
  'Lorenz Storm': {
    preset: 'Lorenz Storm',
    symmetry: 8,
    complexity: 4,
    glow: 7,
    breathSpeed: 0.6,
    intensity: 8,
    particles: 0,
    luminous: 5,
    stars: 5,
    mode: 'lorenz',
  },
  'Knot Garden': {
    preset: 'Knot Garden',
    symmetry: 3,
    complexity: 3,
    glow: 7,
    breathSpeed: 0.5,
    intensity: 8,
    particles: 0,
    luminous: 5,
    stars: 4,
    mode: 'knot',
  },
  'Orbital Shell': {
    preset: 'Orbital Shell',
    symmetry: 6,
    complexity: 2,
    glow: 6,
    breathSpeed: 0.7,
    intensity: 8,
    particles: 0,
    luminous: 5,
    stars: 3,
    mode: 'orbital',
  },
  'Crystal Lattice': {
    preset: 'Crystal Lattice',
    symmetry: 3,
    complexity: 5,
    glow: 8,
    breathSpeed: 0.5,
    intensity: 8,
    particles: 0,
    luminous: 4,
    stars: 6,
    mode: 'geodesic',
  },
  Matrix: {
    preset: 'Matrix',
    symmetry: 8,
    complexity: 4,
    glow: 5,
    breathSpeed: 0.2,
    intensity: 7,
    particles: 2,
    luminous: 2,
    stars: 0,
    mode: 'sacred',
  },
  'Islamic Garden': {
    preset: 'Islamic Garden',
    symmetry: 12,
    complexity: 5,
    glow: 5,
    breathSpeed: 0.18,
    intensity: 8,
    particles: 0,
    luminous: 2,
    stars: 1,
    mode: 'islamic',
  },
  'Yantra Fire': {
    preset: 'Yantra Fire',
    symmetry: 9,
    complexity: 5,
    glow: 5,
    breathSpeed: 0.15,
    intensity: 8,
    particles: 0,
    luminous: 2,
    stars: 0,
    mode: 'yantra',
  },
  'Celtic Forest': {
    preset: 'Celtic Forest',
    symmetry: 6,
    complexity: 3,
    glow: 4,
    breathSpeed: 0.2,
    intensity: 8,
    particles: 0,
    luminous: 2,
    stars: 1,
    mode: 'celtic',
  },
  'Laser Dome': {
    preset: 'Laser Dome',
    symmetry: 12,
    complexity: 6,
    glow: 8,
    breathSpeed: 0.5,
    intensity: 9,
    particles: 0,
    luminous: 3,
    stars: 2,
    mode: 'rainbow',
  },
  'Sacred Architecture': {
    preset: 'Sacred Architecture',
    symmetry: 8,
    complexity: 5,
    glow: 6,
    breathSpeed: 0.2,
    intensity: 8,
    particles: 0,
    luminous: 3,
    stars: 1,
    mode: 'cathedral',
  },
  'Infinite Bloom': {
    preset: 'Infinite Bloom',
    symmetry: 8,
    complexity: 7,
    glow: 6,
    breathSpeed: 0.25,
    intensity: 8,
    particles: 0,
    luminous: 3,
    stars: 2,
    mode: 'bloom',
  },
  'Lava Dream': {
    preset: 'Lava Dream',
    symmetry: 6,
    complexity: 6,
    glow: 7,
    breathSpeed: 0.18,
    intensity: 9,
    particles: 0,
    luminous: 4,
    stars: 0,
    mode: 'lava',
  },
  'Gothic Spire': {
    preset: 'Gothic Spire',
    symmetry: 12,
    complexity: 7,
    glow: 6,
    breathSpeed: 0.15,
    intensity: 8,
    particles: 0,
    luminous: 3,
    stars: 1,
    mode: 'spire',
  },
};

/* ── Journey system ─────────────────────────────────────────── */

interface JourneyStage {
  name: string;
  preset: string;
  mode: Mode;
  duration: number;
  symmetry?: number;
  complexity?: number;
  glow?: number;
  breathSpeed?: number;
  intensity?: number;
  particles?: number;
  luminous?: number;
  stars?: number;
}

interface Journey {
  id: number;
  name: string;
  icon: string;
  desc: string;
  stages: JourneyStage[];
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function journeyLerpCfg(a: JourneyStage, b: JourneyStage, t: number, tint?: string): Cfg {
  const pa = PRESETS[a.preset] ?? PRESETS['Calm Field'];
  const pb = PRESETS[b.preset] ?? PRESETS['Calm Field'];
  const st = smoothstep(Math.max(0, Math.min(1, t)));
  const preset = tint ?? (t < 0.5 ? a.preset : b.preset);
  return {
    preset,
    mode: t < 0.5 ? a.mode : b.mode,
    symmetry: Math.round(lerp(a.symmetry ?? pa.symmetry, b.symmetry ?? pb.symmetry, st)),
    complexity: lerp(a.complexity ?? pa.complexity, b.complexity ?? pb.complexity, st),
    glow: lerp(a.glow ?? pa.glow, b.glow ?? pb.glow, st),
    breathSpeed: lerp(a.breathSpeed ?? pa.breathSpeed, b.breathSpeed ?? pb.breathSpeed, st),
    intensity: lerp(a.intensity ?? pa.intensity, b.intensity ?? pb.intensity, st),
    particles: lerp(a.particles ?? pa.particles, b.particles ?? pb.particles, st),
    luminous: lerp(a.luminous ?? pa.luminous, b.luminous ?? pb.luminous, st),
    stars: lerp(a.stars ?? pa.stars, b.stars ?? pb.stars, st),
  };
}

const JOURNEYS: Journey[] = [
  {
    id: 1,
    name: 'Bloom',
    icon: '✿',
    desc: 'Flowers, Fibonacci spirals, infinite petals — slow golden growth',
    stages: [
      {
        name: 'Fibonacci Seed',
        preset: 'Fibonacci Bloom',
        mode: 'fibonacci',
        duration: 45,
        breathSpeed: 0.18,
        luminous: 2,
        stars: 1,
        complexity: 6,
      },
      {
        name: 'Petals Unfurl',
        preset: 'Calm Field',
        mode: 'sacred',
        duration: 45,
        symmetry: 12,
        breathSpeed: 0.15,
        luminous: 2,
        particles: 4,
        glow: 5,
      },
      {
        name: 'Kaleidoscope Bloom',
        preset: 'Golden Source',
        mode: 'kaleidoscope',
        duration: 40,
        symmetry: 16,
        breathSpeed: 0.22,
        luminous: 2,
        glow: 6,
      },
      {
        name: 'Burst of Life',
        preset: 'Fibonacci Bloom',
        mode: 'burst',
        duration: 35,
        breathSpeed: 0.3,
        luminous: 3,
        particles: 6,
        glow: 7,
      },
      {
        name: 'Orbital Garden',
        preset: 'Calm Field',
        mode: 'orbital',
        duration: 40,
        breathSpeed: 0.12,
        luminous: 2,
        stars: 2,
        symmetry: 8,
      },
    ],
  },
  {
    id: 2,
    name: 'Space Tunnel',
    icon: '⊙',
    desc: 'Stars, vortex tunnels, DMT depth — travelling through space',
    stages: [
      {
        name: 'Hyperspace Jump',
        preset: 'Warp Drive',
        mode: 'warp',
        duration: 40,
        breathSpeed: 0.6,
        luminous: 3,
        stars: 9,
        glow: 6,
      },
      {
        name: 'Vortex Descent',
        preset: 'Warp Tunnel',
        mode: 'tunnel',
        duration: 45,
        breathSpeed: 0.7,
        luminous: 3,
        stars: 7,
        glow: 5,
      },
      {
        name: 'Lorenz Attractor',
        preset: 'Cosmic Indigo',
        mode: 'lorenz',
        duration: 40,
        breathSpeed: 0.3,
        luminous: 3,
        stars: 5,
      },
      {
        name: 'Wave Interference',
        preset: 'Blue Astral',
        mode: 'lissajous',
        duration: 35,
        breathSpeed: 0.45,
        luminous: 3,
        stars: 7,
      },
      {
        name: 'Deep Tunnel',
        preset: 'Warp Tunnel',
        mode: 'tunnel',
        duration: 40,
        breathSpeed: 0.8,
        luminous: 4,
        stars: 9,
        glow: 7,
      },
    ],
  },
  {
    id: 3,
    name: 'Sacred Geometry',
    icon: '⬡',
    desc: '4D crystal forms, torus knots, platonic solids transforming',
    stages: [
      {
        name: 'Crystal Lattice',
        preset: 'Crystal Lattice',
        mode: 'geodesic',
        duration: 45,
        complexity: 5,
        breathSpeed: 0.18,
        luminous: 2,
        glow: 6,
      },
      {
        name: 'Hypercube Fold',
        preset: '4D Crystal',
        mode: 'hypercube',
        duration: 45,
        breathSpeed: 0.25,
        luminous: 3,
        glow: 7,
        complexity: 8,
      },
      {
        name: 'Torus Braid',
        preset: 'Knot Garden',
        mode: 'knot',
        duration: 40,
        breathSpeed: 0.22,
        luminous: 2,
        complexity: 5,
        symmetry: 3,
      },
      {
        name: 'Vitral Window',
        preset: 'Sacred Vitral',
        mode: 'vitral',
        duration: 40,
        breathSpeed: 0.15,
        luminous: 2,
        symmetry: 12,
      },
      {
        name: 'Orbital Shell',
        preset: 'Orbital Shell',
        mode: 'orbital',
        duration: 40,
        breathSpeed: 0.18,
        luminous: 2,
        symmetry: 6,
      },
    ],
  },
  {
    id: 4,
    name: 'Big Bang',
    icon: '✦',
    desc: 'Atoms to galaxies — the full spectrum of cosmic creation in colour',
    stages: [
      {
        name: 'Singularity',
        preset: 'Violet Portal',
        mode: 'burst',
        duration: 35,
        breathSpeed: 0.5,
        luminous: 4,
        particles: 8,
        glow: 8,
        stars: 2,
      },
      {
        name: 'Chaos Expansion',
        preset: 'Clifford Dream',
        mode: 'clifford',
        duration: 40,
        breathSpeed: 0.3,
        luminous: 3,
        complexity: 8,
        glow: 6,
      },
      {
        name: 'Stellar Birth',
        preset: 'Forest Ceremony',
        mode: 'golden',
        duration: 40,
        breathSpeed: 0.22,
        luminous: 2,
        stars: 5,
        symmetry: 10,
      },
      {
        name: 'Galaxy Formation',
        preset: 'Cosmic Indigo',
        mode: 'kaleidoscope',
        duration: 40,
        symmetry: 14,
        breathSpeed: 0.4,
        luminous: 3,
        stars: 6,
        glow: 7,
      },
      {
        name: 'Cosmic Drift',
        preset: 'Warp Drive',
        mode: 'warp',
        duration: 35,
        breathSpeed: 0.55,
        luminous: 4,
        stars: 9,
        glow: 7,
      },
    ],
  },
  {
    id: 5,
    name: 'Matrix',
    icon: '⌗',
    desc: 'Code rain morphing into blooming mandalas — data becomes nature',
    stages: [
      {
        name: 'Code Rain',
        preset: 'Matrix',
        mode: 'sacred',
        duration: 40,
        symmetry: 6,
        breathSpeed: 0.12,
        luminous: 2,
        stars: 0,
        particles: 1,
      },
      {
        name: 'Data Fibonacci',
        preset: 'Matrix',
        mode: 'fibonacci',
        duration: 40,
        breathSpeed: 0.15,
        luminous: 2,
        stars: 0,
        complexity: 7,
      },
      {
        name: 'System Kaleidoscope',
        preset: 'Matrix',
        mode: 'kaleidoscope',
        duration: 35,
        symmetry: 12,
        breathSpeed: 0.18,
        luminous: 2,
        glow: 5,
      },
      {
        name: 'Buffer Overflow',
        preset: 'Matrix',
        mode: 'burst',
        duration: 30,
        breathSpeed: 0.22,
        luminous: 3,
        particles: 5,
        glow: 6,
      },
      {
        name: 'Deep Mandala',
        preset: 'Matrix',
        mode: 'sacred',
        duration: 35,
        symmetry: 16,
        breathSpeed: 0.1,
        luminous: 2,
        particles: 2,
      },
    ],
  },
  {
    id: 6,
    name: 'Sacred Architecture',
    icon: '⛪',
    desc: 'Islamic arches, Gothic rose windows, yantra — sacred geometry across all human cultures',
    stages: [
      {
        name: 'Islamic Courtyard',
        preset: 'Islamic Garden',
        mode: 'islamic',
        duration: 50,
        symmetry: 12,
        complexity: 5,
        breathSpeed: 0.12,
        luminous: 2,
        glow: 4,
        stars: 1,
      },
      {
        name: 'Vitral Windows',
        preset: 'Sacred Vitral',
        mode: 'vitral',
        duration: 45,
        symmetry: 12,
        breathSpeed: 0.1,
        luminous: 2,
        glow: 3,
      },
      {
        name: 'Gothic Cathedral',
        preset: 'Sacred Architecture',
        mode: 'cathedral',
        duration: 50,
        symmetry: 10,
        complexity: 6,
        breathSpeed: 0.14,
        luminous: 3,
        glow: 7,
      },
      {
        name: 'Hindu Yantra',
        preset: 'Yantra Fire',
        mode: 'yantra',
        duration: 45,
        symmetry: 9,
        complexity: 5,
        breathSpeed: 0.12,
        luminous: 2,
        glow: 5,
      },
      {
        name: 'Celtic Weave',
        preset: 'Celtic Forest',
        mode: 'celtic',
        duration: 40,
        symmetry: 6,
        complexity: 3,
        breathSpeed: 0.15,
        luminous: 2,
        glow: 4,
      },
      {
        name: 'Rainbow Convergence',
        preset: 'Sacred Architecture',
        mode: 'rainbow',
        duration: 50,
        symmetry: 16,
        complexity: 8,
        breathSpeed: 0.18,
        luminous: 3,
        glow: 9,
      },
    ],
  },
  {
    id: 7,
    name: 'Fibonacci Mandala',
    icon: 'φ',
    desc: 'Infinite bloom — slow, meditative, eternal mathematical growth. ~10 min ambient loop.',
    stages: [
      {
        name: 'Primordial Seed',
        preset: 'Fibonacci Bloom',
        mode: 'fibonacci',
        duration: 90,
        breathSpeed: 0.08,
        luminous: 1,
        stars: 1,
        complexity: 4,
        glow: 4,
      },
      {
        name: 'First Petals',
        preset: 'Calm Field',
        mode: 'sacred',
        duration: 120,
        symmetry: 8,
        breathSpeed: 0.07,
        luminous: 1,
        particles: 3,
        glow: 5,
      },
      {
        name: 'Golden Proportion',
        preset: 'Golden Source',
        mode: 'golden',
        duration: 120,
        symmetry: 12,
        breathSpeed: 0.09,
        luminous: 2,
        glow: 5,
        stars: 2,
      },
      {
        name: 'Infinite Garden',
        preset: 'Fibonacci Bloom',
        mode: 'kaleidoscope',
        duration: 120,
        symmetry: 16,
        breathSpeed: 0.1,
        luminous: 2,
        glow: 6,
      },
      {
        name: 'Orbital Meditation',
        preset: 'Calm Field',
        mode: 'orbital',
        duration: 120,
        breathSpeed: 0.06,
        luminous: 1,
        stars: 3,
        symmetry: 8,
      },
      {
        name: 'Return to Source',
        preset: 'Fibonacci Bloom',
        mode: 'fibonacci',
        duration: 60,
        breathSpeed: 0.07,
        luminous: 1,
        stars: 1,
        complexity: 6,
      },
    ],
  },
  {
    id: 8,
    name: 'Fire & Earth',
    icon: '🔥',
    desc: 'Tectonic forces, lava flows, plasma storms — primal earth energy',
    stages: [
      {
        name: 'Tectonic Awakening',
        preset: 'Golden Source',
        mode: 'burst',
        duration: 35,
        breathSpeed: 0.45,
        luminous: 4,
        particles: 7,
        glow: 8,
        stars: 1,
      },
      {
        name: 'Lava Flow',
        preset: 'DMT Vision',
        mode: 'clifford',
        duration: 40,
        breathSpeed: 0.28,
        luminous: 3,
        complexity: 7,
        glow: 6,
      },
      {
        name: 'Storm Attractor',
        preset: 'Lorenz Storm',
        mode: 'lorenz',
        duration: 40,
        breathSpeed: 0.35,
        luminous: 3,
        stars: 3,
        complexity: 5,
      },
      {
        name: 'Core Plasma',
        preset: 'Golden Source',
        mode: 'warp',
        duration: 35,
        breathSpeed: 0.5,
        luminous: 4,
        stars: 5,
        glow: 7,
      },
      {
        name: 'Phoenix Flame',
        preset: 'DMT Vision',
        mode: 'burst',
        duration: 30,
        breathSpeed: 0.55,
        luminous: 4,
        particles: 8,
        glow: 9,
      },
    ],
  },
  {
    id: 9,
    name: 'Ocean Depths',
    icon: '🌊',
    desc: 'Bioluminescence, thermoclines, abyssal vortices — deep blue meditation',
    stages: [
      {
        name: 'Surface Ripples',
        preset: 'Blue Astral',
        mode: 'warp',
        duration: 40,
        breathSpeed: 0.25,
        luminous: 2,
        stars: 6,
        glow: 4,
      },
      {
        name: 'Bioluminescence',
        preset: 'Forest Ceremony',
        mode: 'orbital',
        duration: 45,
        breathSpeed: 0.15,
        luminous: 2,
        stars: 4,
        symmetry: 10,
      },
      {
        name: 'Thermocline',
        preset: 'Cosmic Indigo',
        mode: 'lorenz',
        duration: 45,
        breathSpeed: 0.2,
        luminous: 2,
        stars: 3,
        complexity: 4,
      },
      {
        name: 'Abyss Vortex',
        preset: 'Blue Astral',
        mode: 'tunnel',
        duration: 40,
        breathSpeed: 0.4,
        luminous: 3,
        stars: 7,
        glow: 5,
      },
      {
        name: 'Deep Current',
        preset: 'Warp Tunnel',
        mode: 'lissajous',
        duration: 40,
        breathSpeed: 0.18,
        luminous: 2,
        stars: 5,
        glow: 4,
      },
    ],
  },
];

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

function buildCenter(rgb: [number, number, number], iF: number, _scale: number): THREE.Group {
  const g = new THREE.Group();
  // Concentric rings bloom into a soft glowing disc — no square artifact
  const radii = [2, 5, 9, 15];
  for (let i = 0; i < radii.length; i++) {
    const brightness = iF * 7 * (1 - i * 0.2);
    const ring = new THREE.Line(circleGeo(32), lineMat(hdrColor(rgb, brightness, 2.2), 1.0));
    ring.scale.setScalar(radii[i]);
    ring.userData.baseR = radii[i];
    g.add(ring);
  }
  return g;
}

function updateCenter(
  g: THREE.Group,
  breath: number,
  rgb: [number, number, number],
  iF: number,
  _scale: number,
): void {
  g.children.forEach((ring, i) => {
    const baseR = ring.userData.baseR as number;
    ring.scale.setScalar(baseR * (0.82 + breath * 0.18));
    updateMat(ring as THREE.Object3D, rgb, iF * 7 * (1 - i * 0.2) * (0.65 + breath * 0.35), 2.2);
  });
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
    case 'lissajous3d':
      return buildLissajous3D(cfg, R);
    case 'tknot3d':
      return buildTknot3D(cfg, R);
    case 'lorenz3d':
      return buildLorenz3D(cfg, R);
    case 'rose3d':
      return buildRose3D(cfg, R);
    case 'helix3d':
      return buildHelix3D(cfg, R);
    case 'golden':
      return buildGolden(cfg, R);
    case 'kaleidoscope':
      return buildKaleidoscope(cfg, R);
    case 'torus':
      return buildTorus(cfg, R);
    case 'tunnel':
      return buildTunnel(cfg, R);
    case 'vitral':
      return buildVitral(cfg, R);
    case 'fibonacci':
      return buildFibonacci(cfg, R);
    case 'clifford':
      return buildClifford(cfg, R);
    case 'hypercube':
      return buildHypercube(cfg, R);
    case 'warp':
      return buildWarp(cfg, R);
    case 'lorenz':
      return buildLorenz(cfg, R);
    case 'knot':
      return buildKnot(cfg, R);
    case 'orbital':
      return buildOrbital(cfg, R);
    case 'geodesic':
      return buildGeodesic(cfg, R);
    case 'rainbow':
      return buildRainbow(cfg, R);
    case 'cathedral':
      return buildCathedral(cfg, R);
    case 'islamic':
      return buildIslamic(cfg, R);
    case 'yantra':
      return buildYantra(cfg, R);
    case 'celtic':
      return buildCeltic(cfg, R);
    case 'bloom':
      return buildBloom(cfg, R);
    case 'lava':
      return buildLava(cfg, R);
    case 'spire':
      return buildSpire(cfg, R);
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
    case 'lissajous3d':
      updateLissajous3D(group, cfg, t, R);
      break;
    case 'tknot3d':
      updateTknot3D(group, cfg, t, R);
      break;
    case 'lorenz3d':
      updateLorenz3D(group, cfg, t, R);
      break;
    case 'rose3d':
      updateRose3D(group, cfg, t, R);
      break;
    case 'helix3d':
      updateHelix3D(group, cfg, t, R);
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
    case 'tunnel':
      updateTunnel(group, cfg, t, R);
      break;
    case 'vitral':
      updateVitral(group, cfg, t, R);
      break;
    case 'fibonacci':
      updateFibonacci(group, cfg, t, R);
      break;
    case 'clifford':
      updateClifford(group, cfg, t, R);
      break;
    case 'hypercube':
      updateHypercube(group, cfg, t, R);
      break;
    case 'warp':
      updateWarp(group, cfg, t, R);
      break;
    case 'lorenz':
      updateLorenz(group, cfg, t, R);
      break;
    case 'knot':
      updateKnot(group, cfg, t, R);
      break;
    case 'orbital':
      updateOrbital(group, cfg, t, R);
      break;
    case 'geodesic':
      updateGeodesic(group, cfg, t, R);
      break;
    case 'rainbow':
      updateRainbow(group, cfg, t, R);
      break;
    case 'cathedral':
      updateCathedral(group, cfg, t, R);
      break;
    case 'islamic':
      updateIslamic(group, cfg, t, R);
      break;
    case 'yantra':
      updateYantra(group, cfg, t, R);
      break;
    case 'celtic':
      updateCeltic(group, cfg, t, R);
      break;
    case 'bloom':
      updateBloom(group, cfg, t, R);
      break;
    case 'lava':
      updateLava(group, cfg, t, R);
      break;
    case 'spire':
      updateSpire(group, cfg, t, R);
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
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF, scale);
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
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF, scale);
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
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF, scale);
    }
  }
}

/* ── LISSAJOUS 3D mode ──────────────────────────────────────── */

function buildLissajous3D(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Blue Astral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = Math.max(0.1, cfg.intensity / 10);
  const layers = Math.max(1, Math.round(cfg.particles));
  const STEPS = 800;
  const group = new THREE.Group();

  for (let li = 0; li < layers; li++) {
    const pts = new Float32Array((STEPS + 1) * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const opacity = (0.7 - li * 0.08) * iF;
    const line = new THREE.Line(
      geo,
      lineMat(hdrColor([rr, gg, bb], Math.max(0.05, opacity), 2.5), 1.0),
    );
    line.userData.tag = 'trace3d';
    line.userData.li = li;
    group.add(line);
  }
  return group;
}

function updateLissajous3D(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Blue Astral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = Math.max(0.1, cfg.intensity / 10);
  const layers = Math.max(1, Math.round(cfg.particles));
  const STEPS = 800;
  const TAU = Math.PI * 2;
  const fx = Math.max(1, Math.round(cfg.symmetry));
  const fy = Math.max(1, Math.round(cfg.complexity));
  const fz = Math.max(1, Math.round(cfg.glow));
  const speed = cfg.breathSpeed * 0.00018;
  const breath = (Math.sin(t * 0.0008 * cfg.breathSpeed) + 1) * 0.5;
  const bs = 0.82 + breath * 0.18;

  for (const child of group.children) {
    if (child.userData.tag !== 'trace3d') continue;
    const li = child.userData.li as number;
    const phaseShift = (li / Math.max(1, layers - 1)) * Math.PI * 0.6;
    const line = child as THREE.Line;
    const pos = line.geometry.attributes.position.array as Float32Array;
    const phase = t * speed + phaseShift;

    for (let step = 0; step <= STEPS; step++) {
      const tp = (step / STEPS) * TAU;
      pos[step * 3] = R * bs * Math.sin(fx * tp + phase);
      pos[step * 3 + 1] = R * bs * Math.sin(fy * tp);
      pos[step * 3 + 2] = R * bs * Math.sin(fz * tp + phase * 0.71);
    }
    line.geometry.attributes.position.needsUpdate = true;
    updateMat(child as THREE.Object3D, [rr, gg, bb], (0.7 - li * 0.08) * iF, 2.5);
  }
}

/* ── TORUS KNOT 3D ──────────────────────────────────────────── */

function buildTknot3D(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Blue Astral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = Math.max(0.1, cfg.intensity / 10);
  const traces = Math.max(1, Math.round(cfg.particles));
  const STEPS = 1800;
  const group = new THREE.Group();
  for (let ti = 0; ti < traces; ti++) {
    const pts = new Float32Array((STEPS + 1) * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const opacity = (0.75 - ti * 0.1) * iF;
    const line = new THREE.Line(
      geo,
      lineMat(hdrColor([rr, gg, bb], Math.max(0.04, opacity), 2.5), 1.0),
    );
    line.userData.tag = 'tknot';
    line.userData.ti = ti;
    group.add(line);
  }
  return group;
}

function updateTknot3D(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Blue Astral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = Math.max(0.1, cfg.intensity / 10);
  const p = Math.max(2, Math.round(cfg.symmetry));
  const q = Math.max(2, Math.round(cfg.complexity));
  const traces = Math.max(1, Math.round(cfg.particles));
  const tubeRatio = 0.22 + (cfg.glow / 10) * 0.42;
  const STEPS = 1800;
  const TAU = Math.PI * 2;
  const speed = cfg.breathSpeed * 0.00005;
  const breath = (Math.sin(t * 0.0007 * cfg.breathSpeed) + 1) * 0.5;
  const bs = 0.78 + breath * 0.22;
  const Rmaj = R * bs * 0.68;
  const Rmin = Rmaj * tubeRatio;

  for (const child of group.children) {
    if (child.userData.tag !== 'tknot') continue;
    const ti = child.userData.ti as number;
    const phaseShift = (ti / Math.max(1, traces)) * 0.18;
    const line = child as THREE.Line;
    const pos = line.geometry.attributes.position.array as Float32Array;
    const phase = t * speed + phaseShift;

    for (let step = 0; step <= STEPS; step++) {
      const ang = (step / STEPS) * TAU + phase;
      pos[step * 3] = (Rmaj + Rmin * Math.cos(q * ang)) * Math.cos(p * ang);
      pos[step * 3 + 1] = (Rmaj + Rmin * Math.cos(q * ang)) * Math.sin(p * ang);
      pos[step * 3 + 2] = Rmin * Math.sin(q * ang);
    }
    line.geometry.attributes.position.needsUpdate = true;
    updateMat(child as THREE.Object3D, [rr, gg, bb], (0.75 - ti * 0.1) * iF, 2.5);
  }
}

/* ── LORENZ ATTRACTOR 3D ────────────────────────────────────── */

function buildLorenz3D(cfg: Cfg, R: number): THREE.Group {
  const sigma = 5 + cfg.symmetry * 1.0;
  const rho = 15 + cfg.complexity * 2.0;
  const beta = 0.5 + (cfg.glow / 10) * 2.5;
  const nPts = 7000;
  const dt = 0.007;
  let lx = 0.1,
    ly = 0,
    lz = 20;
  // burn transient
  for (let i = 0; i < 800; i++) {
    const dx = sigma * (ly - lx);
    const dy = lx * (rho - lz) - ly;
    const dz = lx * ly - beta * lz;
    lx += dx * dt;
    ly += dy * dt;
    lz += dz * dt;
  }
  const raw = new Float32Array(nPts * 3);
  for (let i = 0; i < nPts; i++) {
    raw[i * 3] = lx;
    raw[i * 3 + 1] = ly;
    raw[i * 3 + 2] = lz;
    const dx = sigma * (ly - lx);
    const dy = lx * (rho - lz) - ly;
    const dz = lx * ly - beta * lz;
    lx += dx * dt;
    ly += dy * dt;
    lz += dz * dt;
  }
  // center + normalize
  let mx = 0,
    my = 0,
    mz = 0;
  for (let i = 0; i < nPts; i++) {
    mx += raw[i * 3];
    my += raw[i * 3 + 1];
    mz += raw[i * 3 + 2];
  }
  mx /= nPts;
  my /= nPts;
  mz /= nPts;
  let maxR = 0;
  for (let i = 0; i < nPts; i++) {
    const dx = raw[i * 3] - mx,
      dy = raw[i * 3 + 1] - my,
      dz = raw[i * 3 + 2] - mz;
    maxR = Math.max(maxR, Math.sqrt(dx * dx + dy * dy + dz * dz));
  }
  const sc = (R * 0.88) / Math.max(maxR, 1);
  for (let i = 0; i < nPts; i++) {
    raw[i * 3] = (raw[i * 3] - mx) * sc;
    raw[i * 3 + 1] = (raw[i * 3 + 1] - my) * sc;
    raw[i * 3 + 2] = (raw[i * 3 + 2] - mz) * sc;
  }

  const pal = PAL[cfg.preset] ?? PAL['Blue Astral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = Math.max(0.1, cfg.intensity / 10);
  const trails = Math.max(1, Math.round(cfg.particles));
  const trailLen = Math.floor(nPts / trails);
  const group = new THREE.Group();
  group.userData.raw = raw;
  group.userData.nPts = nPts;
  group.userData.trailLen = trailLen;

  for (let ti = 0; ti < trails; ti++) {
    const pts = new Float32Array((trailLen + 1) * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const opacity = (0.7 - ti * 0.1) * iF;
    const line = new THREE.Line(
      geo,
      lineMat(hdrColor([rr, gg, bb], Math.max(0.04, opacity), 2.5), 1.0),
    );
    line.userData.tag = 'lorenz3d';
    line.userData.ti = ti;
    group.add(line);
  }
  return group;
}

function updateLorenz3D(group: THREE.Group, cfg: Cfg, t: number, _R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Blue Astral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = Math.max(0.1, cfg.intensity / 10);
  const raw = group.userData.raw as Float32Array | undefined;
  const nPts = group.userData.nPts as number | undefined;
  const trailLen = group.userData.trailLen as number | undefined;
  if (!raw || !nPts || !trailLen) return;

  const speed = cfg.breathSpeed * 0.08;
  const offset = Math.floor(t * speed) % nPts;

  for (const child of group.children) {
    if (child.userData.tag !== 'lorenz3d') continue;
    const ti = child.userData.ti as number;
    const line = child as THREE.Line;
    const pos = line.geometry.attributes.position.array as Float32Array;
    const start = (offset + ti * trailLen) % nPts;

    for (let i = 0; i <= trailLen; i++) {
      const idx = (start + i) % nPts;
      pos[i * 3] = raw[idx * 3];
      pos[i * 3 + 1] = raw[idx * 3 + 1];
      pos[i * 3 + 2] = raw[idx * 3 + 2];
    }
    line.geometry.attributes.position.needsUpdate = true;
    updateMat(child as THREE.Object3D, [rr, gg, bb], (0.7 - ti * 0.1) * iF, 2.5);
  }
}

/* ── ROSE 3D ────────────────────────────────────────────────── */

function buildRose3D(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Blue Astral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = Math.max(0.1, cfg.intensity / 10);
  const traces = Math.max(1, Math.round(cfg.particles));
  const STEPS = 1200;
  const group = new THREE.Group();
  for (let ti = 0; ti < traces; ti++) {
    const pts = new Float32Array((STEPS + 1) * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const opacity = (0.7 - ti * 0.09) * iF;
    const line = new THREE.Line(
      geo,
      lineMat(hdrColor([rr, gg, bb], Math.max(0.04, opacity), 2.5), 1.0),
    );
    line.userData.tag = 'rose3d';
    line.userData.ti = ti;
    group.add(line);
  }
  return group;
}

function updateRose3D(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Blue Astral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = Math.max(0.1, cfg.intensity / 10);
  const a = Math.max(1, Math.round(cfg.symmetry));
  const b = Math.max(1, Math.round(cfg.complexity));
  const c = Math.max(1, Math.round(cfg.glow));
  const traces = Math.max(1, Math.round(cfg.particles));
  const STEPS = 1200;
  const TAU = Math.PI * 2;
  const speed = cfg.breathSpeed * 0.00014;
  const breath = (Math.sin(t * 0.0009 * cfg.breathSpeed) + 1) * 0.5;
  const bs = 0.76 + breath * 0.24;

  for (const child of group.children) {
    if (child.userData.tag !== 'rose3d') continue;
    const ti = child.userData.ti as number;
    const phaseShift = (ti / Math.max(1, traces)) * Math.PI * 0.7;
    const line = child as THREE.Line;
    const pos = line.geometry.attributes.position.array as Float32Array;
    const phase = t * speed + phaseShift;

    for (let step = 0; step <= STEPS; step++) {
      const tp = (step / STEPS) * TAU * Math.max(a, b, c);
      const r = R * bs * Math.abs(Math.cos(a * tp + phase * 0.3));
      pos[step * 3] = r * Math.cos(b * tp + phase);
      pos[step * 3 + 1] = r * Math.sin(b * tp);
      pos[step * 3 + 2] = R * bs * 0.6 * Math.sin(c * tp + phase * 0.5);
    }
    line.geometry.attributes.position.needsUpdate = true;
    updateMat(child as THREE.Object3D, [rr, gg, bb], (0.7 - ti * 0.09) * iF, 2.5);
  }
}

/* ── HELIX 3D ───────────────────────────────────────────────── */

function buildHelix3D(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Blue Astral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = Math.max(0.1, cfg.intensity / 10);
  const strands = Math.max(1, Math.round(cfg.particles));
  const STEPS = 1000;
  const group = new THREE.Group();
  for (let si = 0; si < strands; si++) {
    const pts = new Float32Array((STEPS + 1) * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const opacity = (0.72 - si * 0.08) * iF;
    const line = new THREE.Line(
      geo,
      lineMat(hdrColor([rr, gg, bb], Math.max(0.04, opacity), 2.5), 1.0),
    );
    line.userData.tag = 'helix3d';
    line.userData.si = si;
    group.add(line);
  }
  return group;
}

function updateHelix3D(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Blue Astral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = Math.max(0.1, cfg.intensity / 10);
  const strands = Math.max(1, Math.round(cfg.particles));
  const turns = Math.max(1, Math.round(cfg.symmetry));
  const bulges = Math.max(1, Math.round(cfg.complexity));
  const twist = cfg.glow / 10;
  const STEPS = 1000;
  const TAU = Math.PI * 2;
  const speed = cfg.breathSpeed * 0.00016;
  const breath = (Math.sin(t * 0.0008 * cfg.breathSpeed) + 1) * 0.5;
  const bs = 0.8 + breath * 0.2;

  for (const child of group.children) {
    if (child.userData.tag !== 'helix3d') continue;
    const si = child.userData.si as number;
    const strandPhase = (si / strands) * TAU;
    const line = child as THREE.Line;
    const pos = line.geometry.attributes.position.array as Float32Array;
    const phase = t * speed;

    for (let step = 0; step <= STEPS; step++) {
      const u = (step / STEPS) * TAU * turns;
      const bulge = 1 + 0.35 * Math.cos(bulges * u + phase * 3);
      const rr2 = R * bs * 0.62 * bulge;
      const taper = Math.sin((step / STEPS) * Math.PI); // fade ends
      pos[step * 3] = rr2 * taper * Math.cos(u + strandPhase + phase);
      pos[step * 3 + 1] = rr2 * taper * Math.sin(u + strandPhase + phase);
      pos[step * 3 + 2] =
        R * bs * (step / STEPS - 0.5) * 1.6 + R * 0.22 * Math.sin(twist * TAU * u + phase * 2);
    }
    line.geometry.attributes.position.needsUpdate = true;
    updateMat(child as THREE.Object3D, [rr, gg, bb], (0.72 - si * 0.08) * iF, 2.5);
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
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF, scale);
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
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF, scale);
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
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF, scale);
    }
  }
}

/* ── TUNNEL mode ────────────────────────────────────────────── */

function buildTunnel(cfg: Cfg, _R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Warp Tunnel'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const sym = Math.round(cfg.symmetry);
  const layers = Math.max(1, Math.round(cfg.complexity));
  const ringCount = 6 + layers * 3;
  const CIRC = 48;
  const vertsPerRing = CIRC * 2 + sym * 2;
  const group = new THREE.Group();

  for (let i = 0; i < ringCount; i++) {
    const t0 = i / ringCount;
    const pos = new Float32Array(vertsPerRing * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const ring = new THREE.LineSegments(
      geo,
      lineMat(hdrColor([rr, gg, bb], iF * (0.2 + t0 * 0.8), 2.5), 1.0),
    );
    ring.userData.tag = 'tunnelRing';
    ring.userData.t = t0;
    ring.userData.rollOff = (i % 2 === 0 ? 1 : -1) * (i * 0.04);
    group.add(ring);
  }

  const center = buildCenter([rr, gg, bb], iF * 1.5, _R / 210);
  center.userData.tag = 'center';
  group.add(center);
  return group;
}

function updateTunnel(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Warp Tunnel'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const scale = R / 210;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;
  const sym = Math.round(cfg.symmetry);
  const CIRC = 48;
  const TAU = Math.PI * 2;
  const speed = cfg.breathSpeed * 0.00055;

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'tunnelRing') {
      const ring = child as THREE.LineSegments;
      ring.userData.t = ((ring.userData.t as number) + speed) % 1;
      const tVal = ring.userData.t as number;
      const rollOff = ring.userData.rollOff as number;

      // Perspective projection: tiny at vanishing point, large as it flies past viewer
      const screenR = R * 1.85 * tVal ** 1.5;
      const brightness = tVal ** 0.55 * iF * 2.4;
      const opacity = Math.min(1, tVal * 4) * 0.9;

      const pos = ring.geometry.attributes.position.array as Float32Array;

      // Circle: pairs (p_i → p_{i+1})
      for (let seg = 0; seg < CIRC; seg++) {
        const a0 = (seg / CIRC) * TAU + rollOff;
        const a1 = ((seg + 1) / CIRC) * TAU + rollOff;
        const base = seg * 6;
        pos[base] = Math.cos(a0) * screenR;
        pos[base + 1] = Math.sin(a0) * screenR;
        pos[base + 2] = 0;
        pos[base + 3] = Math.cos(a1) * screenR;
        pos[base + 4] = Math.sin(a1) * screenR;
        pos[base + 5] = 0;
      }

      // Spokes: centre → rim
      const spokeBase = CIRC * 6;
      for (let s = 0; s < sym; s++) {
        const a = (s / sym) * TAU + rollOff;
        const si = spokeBase + s * 6;
        pos[si] = 0;
        pos[si + 1] = 0;
        pos[si + 2] = 0;
        pos[si + 3] = Math.cos(a) * screenR;
        pos[si + 4] = Math.sin(a) * screenR;
        pos[si + 5] = 0;
      }

      ring.geometry.attributes.position.needsUpdate = true;
      const mat = ring.material as THREE.LineBasicMaterial;
      mat.opacity = opacity;
      mat.color.setRGB((rr / 255) * brightness, (gg / 255) * brightness, (bb / 255) * brightness);
    } else if (tag === 'center') {
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF * 1.5, scale);
    }
  }
}

/* ── VITRAL (stained glass) mode ────────────────────────────── */

function buildVitral(cfg: Cfg, _R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Sacred Vitral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const sym = Math.round(cfg.symmetry);
  const layers = Math.min(Math.max(1, Math.round(cfg.complexity)), 8);
  const TAU = Math.PI * 2;
  const ARC = 10;
  const group = new THREE.Group();

  // Normalised ring radii (group scaled to R each frame in update)
  const ringRadii: number[] = [];
  for (let i = 0; i <= layers; i++) ringRadii.push(0.04 + (i / layers) * 0.93);

  // Coloured cell meshes
  for (let sector = 0; sector < sym; sector++) {
    const a1 = (sector / sym) * TAU;
    const a2 = ((sector + 1) / sym) * TAU;
    for (let layer = 0; layer < ringRadii.length - 1; layer++) {
      const innerR = ringRadii[layer];
      const outerR = ringRadii[layer + 1];
      const shape = new THREE.Shape();
      shape.moveTo(Math.cos(a1) * innerR, Math.sin(a1) * innerR);
      shape.lineTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR);
      for (let k = 1; k <= ARC; k++) {
        const a = a1 + (k / ARC) * (a2 - a1);
        shape.lineTo(Math.cos(a) * outerR, Math.sin(a) * outerR);
      }
      shape.lineTo(Math.cos(a2) * innerR, Math.sin(a2) * innerR);
      for (let k = ARC - 1; k >= 0; k--) {
        const a = a1 + (k / ARC) * (a2 - a1);
        shape.lineTo(Math.cos(a) * innerR, Math.sin(a) * innerR);
      }
      shape.closePath();
      const geo = new THREE.ShapeGeometry(shape);
      const hue = (sector / sym + (layer / layers) * 0.12) % 1.0;
      const mat = new THREE.MeshBasicMaterial({
        color: new THREE.Color().setHSL(hue, 0.9, 0.5),
        transparent: true,
        opacity: 0.15,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.userData.tag = 'cell';
      mesh.userData.sector = sector;
      mesh.userData.layer = layer;
      group.add(mesh);
    }
  }

  // Lead lines — rings
  for (const normR of ringRadii) {
    const ring = new THREE.Line(circleGeo(96), lineMat(hdrColor([rr, gg, bb], iF * 0.35, 2), 1.0));
    ring.scale.setScalar(normR);
    ring.userData.tag = 'vitralRing';
    group.add(ring);
  }

  // Lead lines — radials
  const radPos = new Float32Array(sym * 6);
  for (let s = 0; s < sym; s++) {
    const a = (s / sym) * TAU;
    radPos[s * 6] = Math.cos(a) * ringRadii[0];
    radPos[s * 6 + 1] = Math.sin(a) * ringRadii[0];
    radPos[s * 6 + 3] = Math.cos(a) * ringRadii[ringRadii.length - 1];
    radPos[s * 6 + 4] = Math.sin(a) * ringRadii[ringRadii.length - 1];
  }
  const radGeo = new THREE.BufferGeometry();
  radGeo.setAttribute('position', new THREE.BufferAttribute(radPos, 3));
  group.add(
    Object.assign(
      new THREE.LineSegments(radGeo, lineMat(hdrColor([rr, gg, bb], iF * 0.4, 2), 1.0)),
      {
        userData: { tag: 'vitralRad' },
      },
    ),
  );

  void _R;
  return group;
}

function updateVitral(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Sacred Vitral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const sym = Math.round(cfg.symmetry);
  const layers = Math.min(Math.max(1, Math.round(cfg.complexity)), 8);
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;
  const tDrift = t * 0.000032;

  group.scale.setScalar(R);
  group.rotation.z = t * 0.000028;

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'cell') {
      const mesh = child as THREE.Mesh;
      const sector = mesh.userData.sector as number;
      const layer = mesh.userData.layer as number;
      const hue = (sector / sym + (layer / layers) * 0.14 + tDrift) % 1.0;
      const wave = Math.sin(t * 0.001 * cfg.breathSpeed + sector * 0.62 + layer * 1.05) * 0.5 + 0.5;
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.color.setHSL(hue, 0.92, 0.52);
      mat.opacity = (0.06 + wave * 0.2) * iF;
    } else if (tag === 'vitralRing' || tag === 'vitralRad') {
      updateMat(child as THREE.Object3D, [rr, gg, bb], iF * (0.3 + breath * 0.25), 2);
    }
  }
}

/* ── FIBONACCI mode ─────────────────────────────────────────── */

function buildFibonacci(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Fibonacci Bloom'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const sym = Math.round(cfg.symmetry);
  const layers = Math.max(1, Math.round(cfg.complexity));
  const PHI = 1.6180339887;
  const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
  const STEPS = 420;
  const scale = R / 210;
  const group = new THREE.Group();

  // One logarithmic spiral arm per symmetry copy (positions updated each frame)
  for (let s = 0; s < sym; s++) {
    const pts = new Float32Array((STEPS + 1) * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const sp = new THREE.Line(geo, lineMat(hdrColor([rr, gg, bb], iF * 0.7, 2.2), 1.0));
    sp.userData.tag = 'fibSpiral';
    sp.userData.armIdx = s;
    group.add(sp);
  }

  // Fibonacci rings at normalised radii — static scale, updated each frame
  const fibSeq: number[] = [1, 1];
  while (fibSeq[fibSeq.length - 1] < 300) {
    const n = fibSeq.length;
    fibSeq.push(fibSeq[n - 1] + fibSeq[n - 2]);
  }
  const ringCount = Math.min(4 + layers * 2, fibSeq.length - 1);
  const maxFib = fibSeq[ringCount];

  for (let i = 2; i <= ringCount; i++) {
    const normR = (fibSeq[i] / maxFib) * R;
    const ring = new THREE.Line(
      circleGeo(80),
      lineMat(hdrColor([rr, gg, bb], iF * (0.08 + (i / ringCount) * 0.22), 1.8), 1.0),
    );
    ring.scale.setScalar(normR);
    ring.userData.tag = 'fibRing';
    ring.userData.normR = normR;
    ring.userData.ringIdx = i;
    group.add(ring);

    // Golden-angle dots on this ring (count = the Fibonacci number itself, capped)
    const dotCount = Math.min(fibSeq[i], 55);
    const dotPos = new Float32Array(dotCount * 3);
    for (let d = 0; d < dotCount; d++) {
      const a = d * GOLDEN_ANGLE;
      dotPos[d * 3] = Math.cos(a) * normR;
      dotPos[d * 3 + 1] = Math.sin(a) * normR;
    }
    const dGeo = new THREE.BufferGeometry();
    dGeo.setAttribute('position', new THREE.BufferAttribute(dotPos, 3));
    const dots = new THREE.Points(
      dGeo,
      ptsMat(hdrColor([rr, gg, bb], iF * 1.3, 2.2), 2.2 * scale, 0.7),
    );
    dots.userData.tag = 'fibDots';
    dots.userData.normR = normR;
    group.add(dots);
  }

  // Extra: connecting radials along golden angle — shows the hidden spiral arms
  const armCount = Math.min(Math.round(layers * 1.5 + 3), 13);
  const armPos = new Float32Array(armCount * 6);
  for (let i = 0; i < armCount; i++) {
    const a = i * GOLDEN_ANGLE * PHI;
    armPos[i * 6] = 0;
    armPos[i * 6 + 1] = 0;
    armPos[i * 6 + 3] = Math.cos(a) * R;
    armPos[i * 6 + 4] = Math.sin(a) * R;
  }
  const armGeo = new THREE.BufferGeometry();
  armGeo.setAttribute('position', new THREE.BufferAttribute(armPos, 3));
  const armLines = new THREE.LineSegments(
    armGeo,
    lineMat(hdrColor([rr, gg, bb], iF * 0.12, 1.8), 1.0),
  );
  armLines.userData.tag = 'fibArms';
  group.add(armLines);

  const center = buildCenter([rr, gg, bb], iF, scale);
  center.userData.tag = 'center';
  group.add(center);
  return group;
}

function updateFibonacci(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Fibonacci Bloom'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const scale = R / 210;
  const PHI = 1.6180339887;
  const b = (2 / Math.PI) * Math.log(PHI); // logarithmic growth rate
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;
  const bs = 0.9 + breath * 0.1;
  const sym = Math.round(cfg.symmetry);
  const layers = Math.max(1, Math.round(cfg.complexity));
  const turns = 2.5 + layers * 0.4;
  const STEPS = 420;
  const TAU = Math.PI * 2;
  const maxTheta = turns * TAU;
  const tOff = t * 0.00008;

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'fibSpiral') {
      const sp = child as THREE.Line;
      const armIdx = sp.userData.armIdx as number;
      const pos = sp.geometry.attributes.position.array as Float32Array;
      const rotOff = (armIdx / sym) * TAU + tOff;
      for (let i = 0; i <= STEPS; i++) {
        const theta = (i / STEPS) * maxTheta;
        // r(θ) = R at θ=maxTheta, tiny at θ=0 — pure logarithmic spiral
        const r = R * bs * Math.exp(b * (theta - maxTheta));
        pos[i * 3] = Math.cos(theta + rotOff) * r;
        pos[i * 3 + 1] = Math.sin(theta + rotOff) * r;
        pos[i * 3 + 2] = 0;
      }
      sp.geometry.attributes.position.needsUpdate = true;
      updateMat(sp, [rr, gg, bb], iF * 0.7, 2.2);
    } else if (tag === 'fibRing') {
      const ring = child as THREE.Line;
      ring.scale.setScalar((ring.userData.normR as number) * bs);
      const ri = ring.userData.ringIdx as number;
      updateMat(ring, [rr, gg, bb], iF * (0.08 + (ri / 10) * 0.22), 1.8);
    } else if (tag === 'fibDots') {
      const dots = child as THREE.Points;
      dots.scale.setScalar(bs);
      dots.rotation.z = tOff * 0.4;
      const mat = dots.material as THREE.PointsMaterial;
      mat.opacity = (0.4 + breath * 0.4) * iF;
      mat.size = (1.6 + breath * 1.4) * scale;
      updateMat(dots, [rr, gg, bb], iF * 1.3, 2.2);
    } else if (tag === 'fibArms') {
      child.rotation.z = tOff * 0.6;
      updateMat(child as THREE.Object3D, [rr, gg, bb], iF * 0.12, 1.8);
    } else if (tag === 'center') {
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF, scale);
    }
  }
}

/* ── CLIFFORD ATTRACTOR mode ────────────────────────────────── */

// Known beautiful (a, b, c, d) parameter sets
const CLIFFORD_SETS: [number, number, number, number][] = [
  [-1.4, 1.6, 1.0, 0.7],
  [-1.7, 1.3, -0.1, -1.21],
  [-2.0, 1.0, -0.1, -1.0],
  [-1.7, 1.8, -1.9, -0.4],
  [-1.5, -1.8, 1.6, 0.9],
  [-1.9, -1.3, -1.8, -1.4],
  [1.7, 1.7, 0.6, 1.2],
];

function buildClifford(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Clifford Dream'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const scale = R / 210;
  const N = 18000;
  const group = new THREE.Group();

  const pos = new Float32Array(N * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, ptsMat(hdrColor([rr, gg, bb], iF, 1.6), 1.1 * scale, 0.6));
  pts.userData.tag = 'attractor';
  pts.userData.N = N;
  pts.userData.x = 0.1;
  pts.userData.y = 0.1;
  pts.userData.writeIdx = 0;
  group.add(pts);

  const center = buildCenter([rr, gg, bb], iF * 1.2, scale);
  center.userData.tag = 'center';
  group.add(center);
  return group;
}

function updateClifford(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Clifford Dream'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const scale = R / 210;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;
  const layers = Math.max(1, Math.round(cfg.complexity));

  // Drift slowly between parameter sets
  const drift = t * 0.000018 * cfg.breathSpeed;
  const setIdx = Math.floor(drift) % CLIFFORD_SETS.length;
  const frac = drift - Math.floor(drift);
  const [a1, b1, c1, d1] = CLIFFORD_SETS[setIdx];
  const [a2, b2, c2, d2] = CLIFFORD_SETS[(setIdx + 1) % CLIFFORD_SETS.length];
  const lp = (x: number, y: number, f: number) => x + (y - x) * f;
  const a = lp(a1, a2, frac);
  const b = lp(b1, b2, frac);
  const c = lp(c1, c2, frac);
  const d = lp(d1, d2, frac);

  // Scale: Clifford outputs roughly in [-2.5, 2.5]
  const sc = R * 0.38 * (0.92 + breath * 0.08);

  const ptsPerFrame = 80 + layers * 60;

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'attractor') {
      const pts = child as THREE.Points;
      const N = pts.userData.N as number;
      const pos = pts.geometry.attributes.position.array as Float32Array;
      let x = pts.userData.x as number;
      let y = pts.userData.y as number;
      let wi = pts.userData.writeIdx as number;

      for (let i = 0; i < ptsPerFrame; i++) {
        const nx = Math.sin(a * y) + c * Math.cos(a * x);
        const ny = Math.sin(b * x) + d * Math.cos(b * y);
        x = nx;
        y = ny;
        pos[wi * 3] = x * sc;
        pos[wi * 3 + 1] = y * sc;
        pos[wi * 3 + 2] = 0;
        wi = (wi + 1) % N;
      }

      pts.userData.x = x;
      pts.userData.y = y;
      pts.userData.writeIdx = wi;
      pts.geometry.attributes.position.needsUpdate = true;

      const mat = pts.material as THREE.PointsMaterial;
      mat.size = (0.9 + breath * 0.4) * scale;
      updateMat(pts, [rr, gg, bb], iF, 1.6);
    } else if (tag === 'center') {
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF * 1.2, scale);
    }
  }
}

/* ── 4D HYPERCUBE + HOPF FIBRATION mode ─────────────────────── */

// 16 vertices of tesseract: all (±1,±1,±1,±1) bit-pattern combinations
const T4_VERTS: [number, number, number, number][] = Array.from({ length: 16 }, (_, i) => [
  i & 1 ? 1 : -1,
  i & 2 ? 1 : -1,
  i & 4 ? 1 : -1,
  i & 8 ? 1 : -1,
]);

// 32 edges: every pair of vertices differing in exactly one coordinate
const T4_EDGES: [number, number][] = (() => {
  const out: [number, number][] = [];
  for (let i = 0; i < 16; i++) {
    for (let bit = 0; bit < 4; bit++) {
      const j = i ^ (1 << bit);
      if (j > i) out.push([i, j]);
    }
  }
  return out;
})();

function buildHypercube(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['4D Crystal'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const scale = R / 210;
  const group = new THREE.Group();

  // Tesseract edge segments — positions written every frame
  const edgePos = new Float32Array(T4_EDGES.length * 2 * 3);
  const edgeGeo = new THREE.BufferGeometry();
  edgeGeo.setAttribute('position', new THREE.BufferAttribute(edgePos, 3));
  const edges = new THREE.LineSegments(
    edgeGeo,
    lineMat(hdrColor([rr, gg, bb], iF * 0.9, 2.2), 1.0),
  );
  edges.userData.tag = 'hyperEdges';
  group.add(edges);

  // Hopf fibration circles — one circle per base point sampled on S²
  const N_FIBERS = 10;
  const FIBER_STEPS = 72;
  for (let fi = 0; fi < N_FIBERS; fi++) {
    const pos = new Float32Array((FIBER_STEPS + 1) * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const fiber = new THREE.Line(geo, lineMat(hdrColor([rr, gg, bb], iF * 0.55, 2.0), 0.85));
    fiber.userData.tag = 'hopfFiber';
    fiber.userData.fi = fi;
    fiber.userData.nf = N_FIBERS;
    fiber.userData.steps = FIBER_STEPS;
    group.add(fiber);
  }

  const center = buildCenter([rr, gg, bb], iF * 1.2, scale);
  center.userData.tag = 'center';
  group.add(center);
  return group;
}

function updateHypercube(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['4D Crystal'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const scale = R / 210;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;

  // Pre-compute sin/cos for all 6 planes of 4D rotation
  const sp = cfg.breathSpeed * 0.00028;
  const c0 = Math.cos(t * sp * 0.7),
    s0 = Math.sin(t * sp * 0.7); // XY
  const c1 = Math.cos(t * sp * 0.5),
    s1 = Math.sin(t * sp * 0.5); // XZ
  const c2 = Math.cos(t * sp * 1.1),
    s2 = Math.sin(t * sp * 1.1); // XW
  const c3 = Math.cos(t * sp * 0.9),
    s3 = Math.sin(t * sp * 0.9); // YZ
  const c4 = Math.cos(t * sp * 0.6),
    s4 = Math.sin(t * sp * 0.6); // YW
  const c5 = Math.cos(t * sp * 0.4),
    s5 = Math.sin(t * sp * 0.4); // ZW

  const rot4 = (
    vx: number,
    vy: number,
    vz: number,
    vw: number,
  ): [number, number, number, number] => {
    let x = vx,
      y = vy,
      z = vz,
      w = vw,
      tmp: number;
    tmp = x * c0 - y * s0;
    y = x * s0 + y * c0;
    x = tmp;
    tmp = x * c1 - z * s1;
    z = x * s1 + z * c1;
    x = tmp;
    tmp = x * c2 - w * s2;
    w = x * s2 + w * c2;
    x = tmp;
    tmp = y * c3 - z * s3;
    z = y * s3 + z * c3;
    y = tmp;
    tmp = y * c4 - w * s4;
    w = y * s4 + w * c4;
    y = tmp;
    tmp = z * c5 - w * s5;
    w = z * s5 + w * c5;
    z = tmp;
    return [x, y, z, w];
  };

  const proj4 = (x: number, y: number, _z: number, w: number): [number, number] => {
    const wf = 1.0 / (2.0 - w * 0.45);
    return [x * wf * R * 0.5, y * wf * R * 0.5];
  };

  // Pre-project all 16 tesseract vertices
  const vProj: [number, number][] = T4_VERTS.map(([vx, vy, vz, vw]) => {
    const [rx, ry, rz, rw] = rot4(vx, vy, vz, vw);
    return proj4(rx, ry, rz, rw);
  });

  const tmpCol = new THREE.Color();

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'hyperEdges') {
      const edges = child as THREE.LineSegments;
      const pos = edges.geometry.attributes.position.array as Float32Array;
      for (let ei = 0; ei < T4_EDGES.length; ei++) {
        const [ai, bi] = T4_EDGES[ei];
        pos[ei * 6] = vProj[ai][0];
        pos[ei * 6 + 1] = vProj[ai][1];
        pos[ei * 6 + 2] = 0;
        pos[ei * 6 + 3] = vProj[bi][0];
        pos[ei * 6 + 4] = vProj[bi][1];
        pos[ei * 6 + 5] = 0;
      }
      edges.geometry.attributes.position.needsUpdate = true;
      const br = iF * (0.7 + breath * 0.3) * 2.2;
      (edges.material as THREE.LineBasicMaterial).color.setRGB(
        (rr / 255) * br,
        (gg / 255) * br,
        (bb / 255) * br,
      );
    } else if (tag === 'hopfFiber') {
      const fiber = child as THREE.Line;
      const fi = fiber.userData.fi as number;
      const nf = fiber.userData.nf as number;
      const STEPS = fiber.userData.steps as number;

      // Golden-angle sampling of S² for base point of each fiber
      const theta = Math.acos(1 - 2 * ((fi + 0.5) / nf));
      const phi = fi * 2.399963 + t * 0.00012; // slow azimuthal drift
      const st = Math.sin(theta / 2),
        ct = Math.cos(theta / 2);

      const pos = fiber.geometry.attributes.position.array as Float32Array;
      for (let k = 0; k <= STEPS; k++) {
        const psi = (k / STEPS) * Math.PI * 2;
        // S³ point on this Hopf fiber
        const [rx, ry, rz, rw] = rot4(
          st * Math.cos(phi + psi),
          st * Math.sin(phi + psi),
          ct * Math.cos(psi),
          ct * Math.sin(psi),
        );
        const [px, py] = proj4(rx, ry, rz, rw);
        pos[k * 3] = px;
        pos[k * 3 + 1] = py;
        pos[k * 3 + 2] = 0;
      }
      fiber.geometry.attributes.position.needsUpdate = true;

      const br = iF * (0.4 + breath * 0.35) * 2.0;
      tmpCol.setHSL(fi / nf, 0.85, 0.55);
      (fiber.material as THREE.LineBasicMaterial).color.setRGB(
        tmpCol.r * br,
        tmpCol.g * br,
        tmpCol.b * br,
      );
      (fiber.material as THREE.LineBasicMaterial).opacity = 0.5 + breath * 0.35;
    } else if (tag === 'center') {
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF * 1.2, scale);
    }
  }
}

/* ── WARP DRIVE mode ────────────────────────────────────────── */

const WARP_COUNT = 140;

function buildWarp(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Warp Drive'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const group = new THREE.Group();
  const sym = Math.round(cfg.symmetry);
  const TAU = Math.PI * 2;

  for (let i = 0; i < WARP_COUNT; i++) {
    const pos = new Float32Array(2 * 3);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const streak = new THREE.Line(geo, lineMat(hdrColor([rr, gg, bb], iF * 0.8, 2.2), 0.9));
    // Align streaks to symmetry axes with a little jitter
    const sectorAngle =
      sym > 1 ? Math.round((i / WARP_COUNT) * sym) * (TAU / sym) : (i / WARP_COUNT) * TAU;
    streak.userData.tag = 'warpStreak';
    streak.userData.angle =
      sectorAngle + (Math.random() - 0.5) * (sym > 1 ? (TAU / sym) * 0.6 : 0.22);
    streak.userData.r = Math.random() * R * 0.3;
    streak.userData.spd = 1.2 + Math.random() * 2.8;
    streak.userData.len = (0.06 + Math.random() * 0.14) * R;
    group.add(streak);
  }
  return group;
}

function updateWarp(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Warp Drive'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const speed = cfg.breathSpeed;

  for (const child of group.children) {
    if (child.userData.tag !== 'warpStreak') continue;
    const streak = child as THREE.Line;

    streak.userData.r = (streak.userData.r as number) + (streak.userData.spd as number) * speed;
    const r = streak.userData.r as number;

    if (r > R * 1.5) {
      // Respawn from near-centre with a fresh angle
      streak.userData.r = Math.random() * 0.04 * R;
      streak.userData.angle = (t * 0.00001 + Math.random()) * Math.PI * 2;
      streak.userData.spd = 1.2 + Math.random() * 2.8;
      streak.userData.len = (0.06 + Math.random() * 0.14) * R;
    }

    const angle = streak.userData.angle as number;
    const len = streak.userData.len as number;
    const r0 = Math.max(0, r - len);
    const progress = Math.min(1, r / (R * 0.85));

    const pos = streak.geometry.attributes.position.array as Float32Array;
    pos[0] = Math.cos(angle) * r0;
    pos[1] = Math.sin(angle) * r0;
    pos[2] = 0;
    pos[3] = Math.cos(angle) * r;
    pos[4] = Math.sin(angle) * r;
    pos[5] = 0;
    streak.geometry.attributes.position.needsUpdate = true;

    const twinkle = 0.8 + 0.2 * Math.sin(t * 0.002 + angle * 7.3);
    const br = progress * iF * 2.4;
    (streak.material as THREE.LineBasicMaterial).color.setRGB(
      (rr / 255) * br,
      (gg / 255) * br,
      (bb / 255) * br,
    );
    (streak.material as THREE.LineBasicMaterial).opacity = progress * 0.88 * twinkle;
  }
}

/* ── LORENZ ATTRACTOR (3D) mode ─────────────────────────────── */

function buildLorenz(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Lorenz Storm'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const scale = R / 210;
  const N = 22000;
  const group = new THREE.Group();

  const pos = new Float32Array(N * 3);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

  // Pre-warm — run ~500 steps to land on the attractor
  let lx = 0.1,
    ly = 0,
    lz = 10;
  const σ = 10,
    ρ = 28,
    β = 8 / 3,
    dt = 0.005;
  for (let i = 0; i < 500; i++) {
    const dx = σ * (ly - lx),
      dy = lx * (ρ - lz) - ly,
      dz = lx * ly - β * lz;
    lx += dx * dt;
    ly += dy * dt;
    lz += dz * dt;
  }

  const sc = R * 0.026; // Lorenz ~[-20,20]; sc*20 ≈ 0.52R
  for (let i = 0; i < N; i++) {
    const dx = σ * (ly - lx),
      dy = lx * (ρ - lz) - ly,
      dz = lx * ly - β * lz;
    lx += dx * dt;
    ly += dy * dt;
    lz += dz * dt;
    pos[i * 3] = lx * sc;
    pos[i * 3 + 1] = ly * sc;
    pos[i * 3 + 2] = (lz - 25) * sc;
  }

  const pts = new THREE.Points(geo, ptsMat(hdrColor([rr, gg, bb], iF, 1.6), 2.5 * scale, 0.65));
  pts.userData.tag = 'lorenzPts';
  pts.userData.N = N;
  pts.userData.lx = lx;
  pts.userData.ly = ly;
  pts.userData.lz = lz;
  pts.userData.wi = 0;
  group.add(pts);

  const center = buildCenter([rr, gg, bb], iF * 0.8, scale);
  center.userData.tag = 'center';
  group.add(center);
  return group;
}

function updateLorenz(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Lorenz Storm'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const scale = R / 210;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;
  const layers = Math.max(1, Math.round(cfg.complexity));
  const σ = 10,
    ρ = 28,
    β = 8 / 3,
    dt = 0.005;
  const sc = R * 0.026;

  group.rotation.x = t * 0.00018 * cfg.breathSpeed;
  group.rotation.y = t * 0.00011 * cfg.breathSpeed;

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'lorenzPts') {
      const pts = child as THREE.Points;
      const N = pts.userData.N as number;
      const pos = pts.geometry.attributes.position.array as Float32Array;
      let lx = pts.userData.lx as number;
      let ly = pts.userData.ly as number;
      let lz = pts.userData.lz as number;
      let wi = pts.userData.wi as number;

      const ptsPerFrame = 50 + layers * 40;
      for (let i = 0; i < ptsPerFrame; i++) {
        const dx = σ * (ly - lx),
          dy = lx * (ρ - lz) - ly,
          dz = lx * ly - β * lz;
        lx += dx * dt;
        ly += dy * dt;
        lz += dz * dt;
        pos[wi * 3] = lx * sc;
        pos[wi * 3 + 1] = ly * sc;
        pos[wi * 3 + 2] = (lz - 25) * sc;
        wi = (wi + 1) % N;
      }

      pts.userData.lx = lx;
      pts.userData.ly = ly;
      pts.userData.lz = lz;
      pts.userData.wi = wi;
      pts.geometry.attributes.position.needsUpdate = true;
      const mat = pts.material as THREE.PointsMaterial;
      mat.size = (2.1 + breath * 0.8) * scale;
      updateMat(pts, [rr, gg, bb], iF, 1.6);
    } else if (tag === 'center') {
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF * 0.8, scale);
    }
  }
}

/* ── TORUS KNOT (3D) mode ───────────────────────────────────── */

// (p, q) pairs — each coprime pair gives a distinct knot topology
const KNOT_PQ: [number, number][] = [
  [2, 3],
  [3, 2],
  [3, 4],
  [4, 3],
  [5, 2],
  [5, 3],
  [7, 3],
  [7, 4],
  [5, 7],
];

function buildKnot(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Knot Garden'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const group = new THREE.Group();
  const [p, q] = KNOT_PQ[Math.min(Math.max(0, Math.round(cfg.complexity) - 1), KNOT_PQ.length - 1)];
  const strands = Math.max(1, Math.min(6, Math.round(cfg.symmetry)));
  const STEPS = 600;
  const TAU = Math.PI * 2;
  const bigR = R * 0.36,
    smallR = R * 0.12;

  for (let si = 0; si < strands; si++) {
    const phaseOff = (si / strands) * TAU;
    const pts = new Float32Array((STEPS + 1) * 3);
    for (let i = 0; i <= STEPS; i++) {
      const t2 = (i / STEPS) * TAU;
      const phi = p * t2 + phaseOff * 0.3;
      const theta = q * t2;
      const rT = bigR + smallR * Math.cos(theta);
      pts[i * 3] = rT * Math.cos(phi);
      pts[i * 3 + 1] = rT * Math.sin(phi);
      pts[i * 3 + 2] = smallR * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const brightness = si === 0 ? iF * 1.1 : iF * 0.55;
    const hue = si / strands;
    const col = new THREE.Color().setHSL(hue, 0.8, 0.55);
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(
        col.r * brightness * 2.2,
        col.g * brightness * 2.2,
        col.b * brightness * 2.2,
      ),
      transparent: true,
      opacity: si === 0 ? 0.95 : 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const strand = new THREE.Line(geo, mat);
    strand.userData.tag = 'knotStrand';
    strand.userData.hue0 = hue;
    group.add(strand);
  }

  void rr;
  void gg;
  void bb;
  return group;
}

function updateKnot(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const iF = cfg.intensity / 10;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;

  group.rotation.x = t * 0.00022 * cfg.breathSpeed;
  group.rotation.y = t * 0.00015 * cfg.breathSpeed;
  group.rotation.z = t * 0.00008 * cfg.breathSpeed;

  const tmpCol = new THREE.Color();
  let strandIdx = 0;
  for (const child of group.children) {
    if (child.userData.tag !== 'knotStrand') continue;
    const hue = ((child.userData.hue0 as number) + t * 0.000055) % 1.0;
    const br = iF * (strandIdx === 0 ? 0.9 + breath * 0.2 : 0.4 + breath * 0.25) * 2.2;
    tmpCol.setHSL(hue, 0.82, 0.55);
    const mat = (child as THREE.Line).material as THREE.LineBasicMaterial;
    mat.color.setRGB(tmpCol.r * br, tmpCol.g * br, tmpCol.b * br);
    mat.opacity = strandIdx === 0 ? 0.9 : 0.5 + breath * 0.25;
    strandIdx++;
  }
  void R;
}

/* ── ATOMIC ORBITAL (3D) mode ───────────────────────────────── */

// (l, m) quantum number pairs — each gives a distinct orbital shape
const ORBITAL_LM: [number, number][] = [
  [1, 0], // p_z: two lobes
  [2, 0], // d_z²: figure-8 + ring
  [2, 2], // d_x²-y²: 4 petals
  [3, 0], // f_z³: 8 lobes
  [3, 2], // f complex
  [3, 3], // f 6-petal
  [4, 0], // g_0 complex
  [4, 4], // g 8-petal
];

function realSH(l: number, m: number, theta: number, phi: number): number {
  const c = Math.cos(theta),
    s = Math.sin(theta);
  const c2 = c * c,
    s2 = s * s;
  if (l === 1) {
    if (m === 0) return c;
    if (m === 1) return s * Math.cos(phi);
    if (m === -1) return s * Math.sin(phi);
  }
  if (l === 2) {
    if (m === 0) return (3 * c2 - 1) * 0.5;
    if (m === 1) return s * c * Math.cos(phi);
    if (m === -1) return s * c * Math.sin(phi);
    if (m === 2) return s2 * Math.cos(2 * phi);
    if (m === -2) return s2 * Math.sin(2 * phi);
  }
  if (l === 3) {
    if (m === 0) return c * (5 * c2 - 3) * 0.5;
    if (m === 1) return s * (5 * c2 - 1) * Math.cos(phi) * 0.5;
    if (m === -1) return s * (5 * c2 - 1) * Math.sin(phi) * 0.5;
    if (m === 2) return s2 * c * Math.cos(2 * phi);
    if (m === -2) return s2 * c * Math.sin(2 * phi);
    if (m === 3) return s2 * s * Math.cos(3 * phi);
    if (m === -3) return s2 * s * Math.sin(3 * phi);
  }
  if (l === 4) {
    if (m === 0) return (35 * c2 * c2 - 30 * c2 + 3) * 0.125;
    if (m === 2) return s2 * (7 * c2 - 1) * Math.cos(2 * phi) * 0.5;
    if (m === -2) return s2 * (7 * c2 - 1) * Math.sin(2 * phi) * 0.5;
    if (m === 4) return s2 * s2 * Math.cos(4 * phi);
    if (m === -4) return s2 * s2 * Math.sin(4 * phi);
  }
  return 0;
}

function buildOrbital(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Orbital Shell'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const group = new THREE.Group();

  const idx = Math.min(Math.max(0, Math.round(cfg.complexity) - 1), ORBITAL_LM.length - 1);
  const [l, m] = ORBITAL_LM[idx];

  const NΘ = 64,
    NΦ = 128;

  // Meridional lines (constant φ, vary θ)
  for (let pi = 0; pi < NΦ; pi += 4) {
    const phi = (pi / NΦ) * Math.PI * 2;
    const pts = new Float32Array((NΘ + 1) * 3);
    for (let ti = 0; ti <= NΘ; ti++) {
      const theta = (ti / NΘ) * Math.PI;
      const sh = realSH(l, m, theta, phi);
      const r = R * 0.52 * sh * sh;
      pts[ti * 3] = r * Math.sin(theta) * Math.cos(phi);
      pts[ti * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      pts[ti * 3 + 2] = r * Math.cos(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const line = new THREE.Line(geo, lineMat(hdrColor([rr, gg, bb], iF * 0.65, 2.0), 0.85));
    line.userData.tag = 'orbMerid';
    group.add(line);
  }

  // Latitudinal lines (constant θ, vary φ)
  for (let ti = 1; ti < NΘ; ti += 3) {
    const theta = (ti / NΘ) * Math.PI;
    const pts = new Float32Array((NΦ + 1) * 3);
    for (let pi = 0; pi <= NΦ; pi++) {
      const phi = (pi / NΦ) * Math.PI * 2;
      const sh = realSH(l, m, theta, phi);
      const r = R * 0.52 * sh * sh;
      pts[pi * 3] = r * Math.sin(theta) * Math.cos(phi);
      pts[pi * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
      pts[pi * 3 + 2] = r * Math.cos(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const line = new THREE.Line(geo, lineMat(hdrColor([rr, gg, bb], iF * 0.45, 1.8), 0.7));
    line.userData.tag = 'orbLat';
    group.add(line);
  }

  return group;
}

function updateOrbital(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Orbital Shell'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;

  group.rotation.x = t * 0.00019 * cfg.breathSpeed;
  group.rotation.y = t * 0.00013 * cfg.breathSpeed;
  group.rotation.z = t * 0.00007 * cfg.breathSpeed;

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    const baseBr = tag === 'orbMerid' ? 0.6 + breath * 0.25 : 0.4 + breath * 0.2;
    const mult = tag === 'orbMerid' ? 2.0 : 1.8;
    updateMat(child as THREE.Object3D, [rr, gg, bb], iF * baseBr, mult);
  }
  void R;
}

/* ── GEODESIC CRYSTAL (3D) mode ─────────────────────────────── */

function makeEdgeLines(
  geo: THREE.BufferGeometry,
  rgb: [number, number, number],
  iF: number,
  mult: number,
  opacity: number,
): THREE.LineSegments {
  const edges = new THREE.EdgesGeometry(geo);
  geo.dispose();
  return new THREE.LineSegments(edges, lineMat(hdrColor(rgb, iF, mult), opacity));
}

// Form index → builder function returning geometry (scale=1, caller sets scale)
const GEO_FORMS: ((s: number) => THREE.BufferGeometry)[] = [
  (s) => new THREE.TetrahedronGeometry(s),
  (s) => new THREE.OctahedronGeometry(s),
  (s) => new THREE.BoxGeometry(s, s, s),
  (s) => new THREE.DodecahedronGeometry(s),
  (s) => new THREE.IcosahedronGeometry(s),
  (s) => new THREE.IcosahedronGeometry(s, 2), // geodesic sphere
  (s) => new THREE.IcosahedronGeometry(s, 3), // finer geodesic
];

function buildGeodesic(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Crystal Lattice'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const group = new THREE.Group();

  const formIdx = Math.min(Math.max(0, Math.round(cfg.complexity) - 1), GEO_FORMS.length - 1);
  const shells = Math.max(1, Math.min(5, Math.round(cfg.symmetry)));
  const tmpCol = new THREE.Color();

  for (let sh = 1; sh <= shells; sh++) {
    const frac = sh / shells;
    const s = R * 0.78 * frac;
    const hue = frac * 0.72;
    const br = (0.25 + frac * 0.75) * iF;
    tmpCol.setHSL(hue, 0.75, 0.55);
    const col: [number, number, number] = [tmpCol.r * 255, tmpCol.g * 255, tmpCol.b * 255];
    const lines = makeEdgeLines(GEO_FORMS[formIdx](s), col, br, 2.4, 0.9 - sh * 0.08);
    lines.userData.tag = 'geoPoly';
    lines.userData.rotDir = sh % 2 === 0 ? 1 : -1;
    lines.userData.hue0 = hue;
    group.add(lines);

    // Dual or companion form for the outermost shell
    if (sh === shells && formIdx <= 1) {
      const dualIdx = formIdx === 0 ? 1 : 0;
      const dualLines = makeEdgeLines(
        GEO_FORMS[dualIdx](s * 0.9),
        [rr, gg, bb],
        br * 0.45,
        2.0,
        0.55,
      );
      dualLines.userData.tag = 'geoPoly';
      dualLines.userData.rotDir = -1;
      dualLines.userData.hue0 = (hue + 0.5) % 1.0;
      group.add(dualLines);
    }
  }

  const center = buildCenter([rr, gg, bb], iF * 1.2, R / 210);
  center.userData.tag = 'center';
  group.add(center);
  return group;
}

function updateGeodesic(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Crystal Lattice'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const scale = R / 210;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;

  group.rotation.x = t * 0.00016 * cfg.breathSpeed;
  group.rotation.y = t * 0.00022 * cfg.breathSpeed;

  const tmpCol = new THREE.Color();
  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'geoPoly') {
      const hue = ((child.userData.hue0 as number) + t * 0.000035) % 1.0;
      const br = iF * (0.45 + breath * 0.45) * 2.4;
      tmpCol.setHSL(hue, 0.75, 0.55);
      const mat = (child as THREE.LineSegments).material as THREE.LineBasicMaterial;
      mat.color.setRGB(tmpCol.r * br, tmpCol.g * br, tmpCol.b * br);
      mat.opacity = 0.55 + breath * 0.35;
    } else if (tag === 'center') {
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF * 1.2, scale);
    }
  }
}

/* ── ISLAMIC mode — girih star polygon geometry ─────────────── */

function starPolygonPts(n: number, r1: number, r2: number): Float32Array {
  const pts = new Float32Array((n * 2 + 1) * 3);
  for (let i = 0; i <= n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? r1 : r2;
    pts[i * 3] = Math.cos(a) * r;
    pts[i * 3 + 1] = Math.sin(a) * r;
    pts[i * 3 + 2] = 0;
  }
  return pts;
}

function buildIslamic(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Islamic Garden'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const n = Math.max(6, Math.round(cfg.symmetry));
  const layers = Math.max(1, Math.round(cfg.complexity));
  const group = new THREE.Group();
  const tmpCol = new THREE.Color();

  for (let l = 1; l <= layers; l++) {
    const r1 = R * (l / layers);
    const r2 = r1 * 0.42;
    const hue = ((l / layers) * 0.6) % 1.0;
    tmpCol.setHSL(hue, 0.85, 0.55);
    const col: [number, number, number] = [
      lerp(rr, tmpCol.r * 255, cfg.glow / 10),
      lerp(gg, tmpCol.g * 255, cfg.glow / 10),
      lerp(bb, tmpCol.b * 255, cfg.glow / 10),
    ];
    const pts = starPolygonPts(n, r1, r2);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const star = new THREE.Line(
      geo,
      lineMat(hdrColor(col, iF * (0.5 + (l / layers) * 0.5), 2.0), 0.9),
    );
    star.userData.tag = 'islamicStar';
    star.userData.hue = hue;
    star.userData.layer = l;
    star.userData.baseR = r1;
    star.userData.dir = l % 2 === 0 ? 1 : -1;
    group.add(star);
  }

  // Inner ring of smaller stars arranged in a circle
  const ringN = n;
  const ringR = R * 0.48;
  const smallR = R * 0.18;
  for (let i = 0; i < ringN; i++) {
    const ang = (i / ringN) * Math.PI * 2;
    const hue = ((i / ringN) * 0.4 + 0.5) % 1.0;
    tmpCol.setHSL(hue, 0.9, 0.55);
    const col: [number, number, number] = [
      lerp(rr, tmpCol.r * 255, (cfg.glow / 10) * 0.8),
      lerp(gg, tmpCol.g * 255, (cfg.glow / 10) * 0.8),
      lerp(bb, tmpCol.b * 255, (cfg.glow / 10) * 0.8),
    ];
    const pts = starPolygonPts(6, smallR, smallR * 0.4);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const sub = new THREE.Line(geo, lineMat(hdrColor(col, iF * 0.6, 1.8), 0.75));
    sub.position.set(Math.cos(ang) * ringR, Math.sin(ang) * ringR, 0);
    sub.userData.tag = 'islamicRingStar';
    sub.userData.hue = hue;
    sub.userData.angle = ang;
    group.add(sub);
  }

  // Connecting geometry — lines from outer star tips to neighbours
  const TAU = Math.PI * 2;
  const outerR = R;
  const connPts: number[] = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * TAU - Math.PI / 2;
    const a1 = ((i + 1) / n) * TAU - Math.PI / 2;
    connPts.push(
      Math.cos(a0) * outerR,
      Math.sin(a0) * outerR,
      0,
      Math.cos(a1) * outerR * 0.65,
      Math.sin(a1) * outerR * 0.65,
      0,
    );
  }
  const connGeo = new THREE.BufferGeometry();
  connGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(connPts), 3));
  const conn = new THREE.LineSegments(connGeo, lineMat(hdrColor([rr, gg, bb], iF * 0.3, 1.5), 0.6));
  conn.userData.tag = 'islamicConn';
  group.add(conn);

  const center = buildCenter([rr, gg, bb], iF * 0.9, R / 210);
  center.userData.tag = 'center';
  group.add(center);

  return group;
}

function updateIslamic(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Islamic Garden'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;
  const timeHue = (t * 0.00006) % 1.0;
  const tmpCol = new THREE.Color();

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'islamicStar') {
      const hue = ((child.userData.hue as number) + timeHue) % 1.0;
      tmpCol.setHSL(hue, 0.85, 0.55);
      const col: [number, number, number] = [
        lerp(rr, tmpCol.r * 255, cfg.glow / 10),
        lerp(gg, tmpCol.g * 255, cfg.glow / 10),
        lerp(bb, tmpCol.b * 255, cfg.glow / 10),
      ];
      const dir = child.userData.dir as number;
      child.rotation.z = t * 0.00008 * cfg.breathSpeed * dir;
      child.scale.setScalar(0.94 + breath * 0.06);
      updateMat(
        child as THREE.Object3D,
        col,
        iF * (0.5 + ((child.userData.layer as number) / 5) * 0.5),
        2.0,
      );
    } else if (tag === 'islamicRingStar') {
      const hue = ((child.userData.hue as number) + timeHue * 1.5) % 1.0;
      tmpCol.setHSL(hue, 0.9, 0.55);
      const col: [number, number, number] = [
        lerp(rr, tmpCol.r * 255, (cfg.glow / 10) * 0.8),
        lerp(gg, tmpCol.g * 255, (cfg.glow / 10) * 0.8),
        lerp(bb, tmpCol.b * 255, (cfg.glow / 10) * 0.8),
      ];
      child.rotation.z = t * 0.00022 * cfg.breathSpeed;
      updateMat(child as THREE.Object3D, col, iF * 0.6, 1.8);
    } else if (tag === 'islamicConn') {
      child.rotation.z = t * 0.00005 * cfg.breathSpeed;
      updateMat(child as THREE.Object3D, [rr, gg, bb], iF * 0.3, 1.5);
    } else if (tag === 'center') {
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF * 0.9, R / 210);
    }
  }
}

/* ── YANTRA mode — sacred Hindu triangle geometry ───────────── */

function buildYantra(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Yantra Fire'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const nPairs = Math.max(2, Math.round(cfg.complexity));
  const group = new THREE.Group();
  const tmpCol = new THREE.Color();
  const TAU = Math.PI * 2;

  // Nested interlocking up/down triangles
  for (let i = 1; i <= nPairs; i++) {
    const r = R * (i / nPairs) * 0.88;
    const brightness = iF * (0.4 + (i / nPairs) * 0.6);
    const hue = ((i / nPairs) * 0.45) % 1.0;
    tmpCol.setHSL(hue, 0.9, 0.55);
    const col: [number, number, number] = [
      lerp(rr, tmpCol.r * 255, cfg.glow / 10),
      lerp(gg, tmpCol.g * 255, cfg.glow / 10),
      lerp(bb, tmpCol.b * 255, cfg.glow / 10),
    ];

    // Upward triangle (Shiva)
    const upPts = new Float32Array(4 * 3);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU - Math.PI / 2;
      upPts[k * 3] = Math.cos(a) * r;
      upPts[k * 3 + 1] = Math.sin(a) * r;
    }
    upPts[9] = upPts[0];
    upPts[10] = upPts[1];
    upPts[11] = 0;
    const upGeo = new THREE.BufferGeometry();
    upGeo.setAttribute('position', new THREE.BufferAttribute(upPts, 3));
    const up = new THREE.Line(upGeo, lineMat(hdrColor(col, brightness, 2.0), 0.9));
    up.userData.tag = 'yantraUp';
    up.userData.hue = hue;
    up.userData.layer = i;
    up.userData.baseR = r;
    group.add(up);

    // Downward triangle (Shakti) — slightly smaller, inverted
    const downR = r * 0.88;
    const downPts = new Float32Array(4 * 3);
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * TAU + Math.PI / 2;
      downPts[k * 3] = Math.cos(a) * downR;
      downPts[k * 3 + 1] = Math.sin(a) * downR;
    }
    downPts[9] = downPts[0];
    downPts[10] = downPts[1];
    downPts[11] = 0;
    const downGeo = new THREE.BufferGeometry();
    downGeo.setAttribute('position', new THREE.BufferAttribute(downPts, 3));
    const hue2 = (hue + 0.18) % 1.0;
    tmpCol.setHSL(hue2, 0.85, 0.55);
    const col2: [number, number, number] = [
      lerp(rr, tmpCol.r * 255, cfg.glow / 10),
      lerp(gg, tmpCol.g * 255, cfg.glow / 10),
      lerp(bb, tmpCol.b * 255, cfg.glow / 10),
    ];
    const down = new THREE.Line(downGeo, lineMat(hdrColor(col2, brightness * 0.85, 1.8), 0.85));
    down.userData.tag = 'yantraDown';
    down.userData.hue = hue2;
    down.userData.layer = i;
    group.add(down);
  }

  // Lotus petal ring — 8 petals
  const petalSym = Math.max(4, Math.round(cfg.symmetry));
  const petalR = R * 0.32;
  for (let s = 0; s < petalSym; s++) {
    const ang = (s / petalSym) * TAU;
    const px = Math.cos(ang) * petalR;
    const py = Math.sin(ang) * petalR;
    const pw = petalR * 0.35;
    const ph = petalR * 0.55;
    const pts: number[] = [];
    const N = 16;
    for (let k = 0; k <= N; k++) {
      const ti = k / N;
      const a = ti * Math.PI * 2;
      pts.push(px + Math.cos(a) * pw * Math.sin(ti * Math.PI), py + Math.sin(a) * ph * 0.5, 0);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const hue3 = ((s / petalSym) * 0.3 + 0.55) % 1.0;
    tmpCol.setHSL(hue3, 0.8, 0.55);
    const col3: [number, number, number] = [
      lerp(rr, tmpCol.r * 255, (cfg.glow / 10) * 0.7),
      lerp(gg, tmpCol.g * 255, (cfg.glow / 10) * 0.7),
      lerp(bb, tmpCol.b * 255, (cfg.glow / 10) * 0.7),
    ];
    const petal = new THREE.Line(pGeo, lineMat(hdrColor(col3, iF * 0.5, 1.6), 0.7));
    petal.userData.tag = 'yantraPetal';
    petal.userData.hue = hue3;
    group.add(petal);
  }

  // Bindu (central point) + circles
  for (let ci = 1; ci <= 3; ci++) {
    const cr = R * 0.12 * ci;
    const ring = new THREE.Line(circleGeo(48), lineMat(hdrColor([rr, gg, bb], iF * 0.6, 1.8), 0.7));
    ring.scale.setScalar(cr);
    ring.userData.tag = 'yantraCircle';
    ring.userData.baseR = cr;
    group.add(ring);
  }

  const center = buildCenter([rr, gg, bb], iF, R / 210);
  center.userData.tag = 'center';
  group.add(center);

  return group;
}

function updateYantra(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Yantra Fire'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;
  const timeHue = (t * 0.00005) % 1.0;
  const tmpCol = new THREE.Color();

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'yantraUp' || tag === 'yantraDown') {
      const hue = ((child.userData.hue as number) + timeHue) % 1.0;
      tmpCol.setHSL(hue, 0.9, 0.55);
      const col: [number, number, number] = [
        lerp(rr, tmpCol.r * 255, cfg.glow / 10),
        lerp(gg, tmpCol.g * 255, cfg.glow / 10),
        lerp(bb, tmpCol.b * 255, cfg.glow / 10),
      ];
      const l = child.userData.layer as number;
      const bs = 0.94 + breath * 0.06;
      child.scale.setScalar(bs);
      child.rotation.z = t * 0.000035 * cfg.breathSpeed * (tag === 'yantraUp' ? 1 : -1);
      updateMat(child as THREE.Object3D, col, iF * (0.4 + (l / 5) * 0.6), 2.0);
    } else if (tag === 'yantraPetal') {
      const hue = ((child.userData.hue as number) + timeHue * 1.5) % 1.0;
      tmpCol.setHSL(hue, 0.8, 0.55);
      const col: [number, number, number] = [
        lerp(rr, tmpCol.r * 255, (cfg.glow / 10) * 0.7),
        lerp(gg, tmpCol.g * 255, (cfg.glow / 10) * 0.7),
        lerp(bb, tmpCol.b * 255, (cfg.glow / 10) * 0.7),
      ];
      child.rotation.z = t * 0.00012 * cfg.breathSpeed;
      updateMat(child as THREE.Object3D, col, iF * 0.5, 1.6);
    } else if (tag === 'yantraCircle') {
      const bs = 0.95 + breath * 0.05;
      child.scale.setScalar((child.userData.baseR as number) * bs);
      updateMat(child as THREE.Object3D, [rr, gg, bb], iF * 0.6, 1.8);
    } else if (tag === 'center') {
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF, R / 210);
    }
  }
}

/* ── CELTIC mode — interlocking torus knot bands ────────────── */

function buildCeltic(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Celtic Forest'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const nKnots = Math.max(1, Math.min(4, Math.round(cfg.complexity)));
  const group = new THREE.Group();
  const tmpCol = new THREE.Color();
  const N = 800;

  const knotDefs: [number, number][] = [
    [2, 3],
    [3, 5],
    [2, 5],
    [3, 7],
  ];

  for (let ki = 0; ki < nKnots; ki++) {
    const [p, q] = knotDefs[ki];
    const pts = new Float32Array((N + 1) * 3);
    for (let i = 0; i <= N; i++) {
      const t = (i / N) * Math.PI * 2;
      const r = Math.cos(q * t) + 2.4;
      pts[i * 3] = r * Math.cos(p * t) * R * 0.36;
      pts[i * 3 + 1] = r * Math.sin(p * t) * R * 0.36;
      pts[i * 3 + 2] = -Math.sin(q * t) * R * 0.18;
    }
    const hue = ((ki / nKnots) * 0.45 + 0.2) % 1.0;
    tmpCol.setHSL(hue, 0.9, 0.55);
    const col: [number, number, number] = [
      lerp(rr, tmpCol.r * 255, cfg.glow / 10),
      lerp(gg, tmpCol.g * 255, cfg.glow / 10),
      lerp(bb, tmpCol.b * 255, cfg.glow / 10),
    ];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const knot = new THREE.Line(geo, lineMat(hdrColor(col, iF * (0.5 + ki * 0.1), 2.0), 0.85));
    knot.userData.tag = 'celticKnot';
    knot.userData.hue = hue;
    knot.userData.ki = ki;
    group.add(knot);
  }

  // Interlocking rings border
  const sym = Math.max(4, Math.round(cfg.symmetry));
  const ringR = R * 0.9;
  for (let s = 0; s < sym; s++) {
    const ang = (s / sym) * Math.PI * 2;
    const ring = new THREE.Line(circleGeo(32), lineMat(hdrColor([rr, gg, bb], iF * 0.3, 1.5), 0.5));
    const subR = ((ringR * Math.PI) / sym) * 0.55;
    ring.scale.setScalar(subR);
    ring.position.set(Math.cos(ang) * ringR, Math.sin(ang) * ringR, 0);
    ring.userData.tag = 'celticRing';
    ring.userData.ang = ang;
    ring.userData.baseR = subR;
    group.add(ring);
  }

  const center = buildCenter([rr, gg, bb], iF * 0.8, R / 210);
  center.userData.tag = 'center';
  group.add(center);

  return group;
}

function updateCeltic(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Celtic Forest'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const breath = (Math.sin(t * 0.001 * cfg.breathSpeed) + 1) * 0.5;
  const timeHue = (t * 0.00006) % 1.0;
  const tmpCol = new THREE.Color();

  group.rotation.x = t * 0.00012 * cfg.breathSpeed;
  group.rotation.y = t * 0.00018 * cfg.breathSpeed;

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'celticKnot') {
      const ki = child.userData.ki as number;
      const hue = ((child.userData.hue as number) + timeHue) % 1.0;
      tmpCol.setHSL(hue, 0.9, 0.55);
      const col: [number, number, number] = [
        lerp(rr, tmpCol.r * 255, cfg.glow / 10),
        lerp(gg, tmpCol.g * 255, cfg.glow / 10),
        lerp(bb, tmpCol.b * 255, cfg.glow / 10),
      ];
      child.rotation.z = t * 0.00014 * cfg.breathSpeed * (ki % 2 === 0 ? 1 : -1);
      updateMat(child as THREE.Object3D, col, iF * (0.5 + ki * 0.1), 2.0);
    } else if (tag === 'celticRing') {
      child.scale.setScalar((child.userData.baseR as number) * (0.9 + breath * 0.1));
      child.rotation.z = t * 0.00025 * cfg.breathSpeed;
      updateMat(child as THREE.Object3D, [rr, gg, bb], iF * 0.3, 1.5);
    } else if (tag === 'center') {
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF * 0.8, R / 210);
    }
  }
}

/* ── RAINBOW mode — multi-colour laser dome ─────────────────── */

function buildRainbow(cfg: Cfg, R: number): THREE.Group {
  const TAU = Math.PI * 2;
  const sym = Math.max(3, Math.round(cfg.symmetry));
  const layers = Math.max(2, Math.round(cfg.complexity));
  const group = new THREE.Group();
  const tmpCol = new THREE.Color();

  // Concentric coloured rings — each ring a different hue
  for (let i = 1; i <= layers; i++) {
    const hue = (i / layers) % 1.0;
    const r = R * (i / layers);
    tmpCol.setHSL(hue, 1.0, 0.55);
    const col: [number, number, number] = [tmpCol.r * 255, tmpCol.g * 255, tmpCol.b * 255];
    const ring = new THREE.Line(
      circleGeo(96),
      lineMat(hdrColor(col, cfg.intensity / 10, 2.2), 1.0),
    );
    ring.scale.setScalar(r);
    ring.userData.tag = 'rainbowRing';
    ring.userData.hue = hue;
    ring.userData.baseR = r;
    ring.userData.layer = i;
    group.add(ring);
  }

  // Radial spoke lines — each spoke in a different hue
  for (let s = 0; s < sym; s++) {
    const hue = (s / sym + 0.1) % 1.0;
    tmpCol.setHSL(hue, 1.0, 0.6);
    const col: [number, number, number] = [tmpCol.r * 255, tmpCol.g * 255, tmpCol.b * 255];
    const a = (s / sym) * TAU;
    const pts = new Float32Array([0, 0, 0, Math.cos(a) * R, Math.sin(a) * R, 0]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const spoke = new THREE.Line(geo, lineMat(hdrColor(col, (cfg.intensity / 10) * 0.6, 1.8), 1.0));
    spoke.userData.tag = 'rainbowSpoke';
    spoke.userData.hue = hue;
    spoke.userData.angle = s / sym;
    group.add(spoke);
  }

  // Dome polygon outline — icosahedron projected 2D
  const icoGeo = new THREE.IcosahedronGeometry(R * 0.92, 1);
  const edges = new THREE.EdgesGeometry(icoGeo);
  icoGeo.dispose();
  const domeColor = new THREE.Color();
  domeColor.setHSL(0.0, 1.0, 0.55);
  const dome = new THREE.LineSegments(
    edges,
    lineMat(hdrColor([255, 255, 255], (cfg.intensity / 10) * 0.25, 1.5), 0.8),
  );
  dome.userData.tag = 'rainbowDome';
  group.add(dome);

  return group;
}

function updateRainbow(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const iF = cfg.intensity / 10;
  const breathSpeed = cfg.breathSpeed;
  const breath = (Math.sin(t * 0.001 * breathSpeed) + 1) * 0.5;
  const timeHue = (t * 0.00008) % 1.0;
  // glow 0..10 controls colour saturation: 0 = monochrome (use palette), 10 = full rainbow
  const rainbow = cfg.glow / 10;
  const tmpCol = new THREE.Color();
  const pal = PAL[cfg.preset] ?? PAL['Calm Field'];

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'rainbowRing') {
      const hue = ((child.userData.hue as number) + timeHue) % 1.0;
      // Blend between palette colour and full rainbow
      const rainbowRgb: [number, number, number] = [0, 0, 0];
      tmpCol.setHSL(hue, 1.0, 0.55);
      rainbowRgb[0] = lerp(pal.rgb[0], tmpCol.r * 255, rainbow);
      rainbowRgb[1] = lerp(pal.rgb[1], tmpCol.g * 255, rainbow);
      rainbowRgb[2] = lerp(pal.rgb[2], tmpCol.b * 255, rainbow);
      const bs = 0.88 + breath * 0.12;
      child.scale.setScalar((child.userData.baseR as number) * bs);
      child.rotation.z = t * 0.00012 * breathSpeed * (child.userData.layer % 2 === 0 ? 1 : -1);
      updateMat(child as THREE.Object3D, rainbowRgb, iF, 2.2);
    } else if (tag === 'rainbowSpoke') {
      const hue = ((child.userData.hue as number) + timeHue * 0.5) % 1.0;
      const rainbowRgb: [number, number, number] = [0, 0, 0];
      tmpCol.setHSL(hue, 1.0, 0.6);
      rainbowRgb[0] = lerp(pal.rgb[0], tmpCol.r * 255, rainbow);
      rainbowRgb[1] = lerp(pal.rgb[1], tmpCol.g * 255, rainbow);
      rainbowRgb[2] = lerp(pal.rgb[2], tmpCol.b * 255, rainbow);
      child.rotation.z = t * 0.00006 * breathSpeed;
      updateMat(child as THREE.Object3D, rainbowRgb, iF * 0.6, 1.8);
    } else if (tag === 'rainbowDome') {
      child.rotation.x = t * 0.00018 * breathSpeed;
      child.rotation.y = t * 0.00022 * breathSpeed;
      const wRgb: [number, number, number] = [
        lerp(pal.rgb[0], 255, rainbow * 0.4),
        lerp(pal.rgb[1], 255, rainbow * 0.4),
        lerp(pal.rgb[2], 255, rainbow * 0.4),
      ];
      updateMat(child as THREE.Object3D, wRgb, iF * 0.25, 1.5);
    }
  }
}

/* ── CATHEDRAL mode — sacred architecture builder ───────────── */

function buildCathedral(cfg: Cfg, R: number): THREE.Group {
  const TAU = Math.PI * 2;
  const pal = PAL[cfg.preset] ?? PAL['Sacred Vitral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const sym = Math.max(4, Math.round(cfg.symmetry));
  const layers = Math.max(1, Math.round(cfg.complexity));
  const group = new THREE.Group();
  const tmpCol = new THREE.Color();

  // Gothic arches — pairs of mirrored bezier curves radiating outward
  for (let s = 0; s < sym; s++) {
    const ang = (s / sym) * TAU;
    const archGroup = new THREE.Group();
    archGroup.rotation.z = ang;
    archGroup.userData.tag = 'arch';
    archGroup.userData.sectorIdx = s;

    for (let l = 1; l <= layers; l++) {
      const archH = R * (l / layers) * 0.95;
      const archW = archH * 0.28;
      const pts: number[] = [];
      const N = 24;

      // Left pillar + gothic arch: vertical + pointed curve
      for (let k = 0; k <= N; k++) {
        const ti = k / N;
        // Bezier: base at (±archW, 0) to apex at (0, archH) with gothic point
        const x = (1 - ti) * (1 - ti) * archW + 2 * ti * (1 - ti) * (archW * 0.15) + ti * ti * 0;
        const y = (1 - ti) * (1 - ti) * 0 + 2 * ti * (1 - ti) * archH * 0.7 + ti * ti * archH;
        pts.push(x, y, 0);
      }
      for (let k = N; k >= 0; k--) {
        const ti = k / N;
        const x = -(1 - ti) * (1 - ti) * archW - 2 * ti * (1 - ti) * (archW * 0.15) - ti * ti * 0;
        const y = (1 - ti) * (1 - ti) * 0 + 2 * ti * (1 - ti) * archH * 0.7 + ti * ti * archH;
        pts.push(x, y, 0);
      }

      const hue = ((l / layers) * 0.35 + (s / sym) * 0.1) % 1.0;
      tmpCol.setHSL(hue, 0.7, 0.55);
      const archCol: [number, number, number] = [
        lerp(rr, tmpCol.r * 255, cfg.glow / 10),
        lerp(gg, tmpCol.g * 255, cfg.glow / 10),
        lerp(bb, tmpCol.b * 255, cfg.glow / 10),
      ];
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
      const arch = new THREE.Line(
        geo,
        lineMat(hdrColor(archCol, iF * (0.4 + (l / layers) * 0.6), 1.8), 0.85),
      );
      arch.userData.archLayer = l;
      archGroup.add(arch);
    }
    group.add(archGroup);
  }

  // Rose window — concentric rings + radial tracery (Islamic geometric pattern)
  const roseSym = sym * 2;
  for (let i = 1; i <= Math.min(layers + 2, 6); i++) {
    const r = R * 0.25 * (i / 6);
    const hue = (i * 0.14 + 0.55) % 1.0;
    tmpCol.setHSL(hue, 0.85, 0.55);
    const roseCol: [number, number, number] = [
      lerp(rr, tmpCol.r * 255, cfg.glow / 10),
      lerp(gg, tmpCol.g * 255, cfg.glow / 10),
      lerp(bb, tmpCol.b * 255, cfg.glow / 10),
    ];
    const ring = new THREE.Line(circleGeo(64), lineMat(hdrColor(roseCol, iF * 0.9, 2.0), 0.9));
    ring.scale.setScalar(r);
    ring.userData.tag = 'roseRing';
    ring.userData.baseR = r;
    ring.userData.hue = hue;
    group.add(ring);
  }
  // Tracery spokes
  for (let s = 0; s < roseSym; s++) {
    const a = (s / roseSym) * TAU;
    const maxR = R * 0.25;
    const pts = new Float32Array([0, 0, 0, Math.cos(a) * maxR, Math.sin(a) * maxR, 0]);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pts, 3));
    const hue = ((s / roseSym) * 0.4 + 0.6) % 1.0;
    tmpCol.setHSL(hue, 0.8, 0.55);
    const spokeCol: [number, number, number] = [
      lerp(rr, tmpCol.r * 255, (cfg.glow / 10) * 0.7),
      lerp(gg, tmpCol.g * 255, (cfg.glow / 10) * 0.7),
      lerp(bb, tmpCol.b * 255, (cfg.glow / 10) * 0.7),
    ];
    const spoke = new THREE.Line(geo, lineMat(hdrColor(spokeCol, iF * 0.5, 1.5), 0.7));
    spoke.userData.tag = 'roseSpoke';
    spoke.userData.hue = hue;
    group.add(spoke);
  }

  // Central spire — tall pointed obelisk lines
  const spireH = R * 0.55;
  const spireW = R * 0.06;
  const spirePts = new Float32Array([
    -spireW,
    0,
    0,
    0,
    spireH,
    0,
    0,
    spireH,
    0,
    spireW,
    0,
    0,
    -spireW,
    spireH * 0.3,
    0,
    spireW,
    spireH * 0.3,
    0,
    -spireW * 0.6,
    spireH * 0.6,
    0,
    spireW * 0.6,
    spireH * 0.6,
    0,
  ]);
  const spireGeo = new THREE.BufferGeometry();
  spireGeo.setAttribute('position', new THREE.BufferAttribute(spirePts, 3));
  const spire = new THREE.LineSegments(
    spireGeo,
    lineMat(hdrColor([rr, gg, bb], iF * 0.7, 2.0), 0.9),
  );
  spire.userData.tag = 'spire';
  group.add(spire);

  const center = buildCenter([rr, gg, bb], iF * 0.8, R / 210);
  center.userData.tag = 'center';
  group.add(center);

  return group;
}

function updateCathedral(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Sacred Vitral'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const breathSpeed = cfg.breathSpeed;
  const breath = (Math.sin(t * 0.001 * breathSpeed) + 1) * 0.5;
  const bs = 0.94 + breath * 0.06;
  const timeHue = (t * 0.000045) % 1.0;
  const tmpCol = new THREE.Color();

  for (const child of group.children) {
    const tag = child.userData.tag as string;
    if (tag === 'arch') {
      const sectorIdx = child.userData.sectorIdx as number;
      // Arches breathe outward and rotate very slowly
      const sector = child as THREE.Group;
      sector.scale.setScalar(bs);
      sector.rotation.z =
        (sectorIdx / Math.max(1, cfg.symmetry)) * Math.PI * 2 + t * 0.00004 * breathSpeed;
      sector.children.forEach((arch, li) => {
        const hue = ((li / sector.children.length) * 0.35 + timeHue) % 1.0;
        tmpCol.setHSL(hue, 0.7, 0.55);
        const col: [number, number, number] = [
          lerp(rr, tmpCol.r * 255, cfg.glow / 10),
          lerp(gg, tmpCol.g * 255, cfg.glow / 10),
          lerp(bb, tmpCol.b * 255, cfg.glow / 10),
        ];
        updateMat(
          arch as THREE.Object3D,
          col,
          iF * (0.4 + ((li + 1) / sector.children.length) * 0.6),
          1.8,
        );
      });
    } else if (tag === 'roseRing') {
      const hue = ((child.userData.hue as number) + timeHue * 1.5) % 1.0;
      tmpCol.setHSL(hue, 0.85, 0.55);
      const col: [number, number, number] = [
        lerp(rr, tmpCol.r * 255, cfg.glow / 10),
        lerp(gg, tmpCol.g * 255, cfg.glow / 10),
        lerp(bb, tmpCol.b * 255, cfg.glow / 10),
      ];
      child.rotation.z = t * 0.00025 * breathSpeed;
      child.scale.setScalar((child.userData.baseR as number) * (0.96 + breath * 0.04));
      updateMat(child as THREE.Object3D, col, iF * 0.9, 2.0);
    } else if (tag === 'roseSpoke') {
      const hue = ((child.userData.hue as number) + timeHue * 0.8) % 1.0;
      tmpCol.setHSL(hue, 0.8, 0.55);
      const col: [number, number, number] = [
        lerp(rr, tmpCol.r * 255, (cfg.glow / 10) * 0.7),
        lerp(gg, tmpCol.g * 255, (cfg.glow / 10) * 0.7),
        lerp(bb, tmpCol.b * 255, (cfg.glow / 10) * 0.7),
      ];
      child.rotation.z = t * 0.00015 * breathSpeed;
      updateMat(child as THREE.Object3D, col, iF * 0.5, 1.5);
    } else if (tag === 'spire') {
      child.scale.setScalar(bs);
      updateMat(child as THREE.Object3D, [rr, gg, bb], iF * 0.7, 2.0);
    } else if (tag === 'center') {
      updateCenter(child as THREE.Group, breath, [rr, gg, bb], iF * 0.8, R / 210);
    }
  }
}

/* ── BLOOM mode — infinite mandala expansion illusion ───────── */

function buildBloom(cfg: Cfg, R: number): THREE.Group {
  const TAU = Math.PI * 2;
  const pal = PAL[cfg.preset] ?? PAL['Calm Field'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const sym = Math.max(4, Math.round(cfg.symmetry));
  const N_LAYERS = Math.max(6, Math.round(cfg.complexity * 1.6));
  const group = new THREE.Group();
  const tmpCol = new THREE.Color();

  for (let li = 0; li < N_LAYERS; li++) {
    const phase = li / N_LAYERS;
    const layerGroup = new THREE.Group();
    layerGroup.userData.tag = 'bloomLayer';
    layerGroup.userData.phase = phase;
    layerGroup.userData.li = li;

    // Sym teardrop petals at unit radius (scale applied at runtime)
    for (let s = 0; s < sym; s++) {
      const ang = (s / sym) * TAU;
      const hue = ((s / sym) * 0.45 + (li / N_LAYERS) * 0.3) % 1.0;
      tmpCol.setHSL(hue, 0.82, 0.55);
      const col: [number, number, number] = [
        lerp(rr, tmpCol.r * 255, cfg.glow / 10),
        lerp(gg, tmpCol.g * 255, cfg.glow / 10),
        lerp(bb, tmpCol.b * 255, cfg.glow / 10),
      ];
      const pts: number[] = [];
      const N = 28;
      const orbit = 0.52;
      const petalA = 0.2;
      const petalB = 0.1; // ellipse half-axes for petal shape
      for (let k = 0; k <= N; k++) {
        const a = (k / N) * TAU;
        // Ellipse rotated to point outward from center
        const px =
          Math.cos(ang) * orbit +
          Math.cos(ang) * petalA * Math.cos(a) -
          Math.sin(ang) * petalB * Math.sin(a);
        const py =
          Math.sin(ang) * orbit +
          Math.sin(ang) * petalA * Math.cos(a) +
          Math.cos(ang) * petalB * Math.sin(a);
        pts.push(px, py, 0);
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
      const petal = new THREE.Line(geo, lineMat(hdrColor(col, iF, 1.9), 0.85));
      petal.userData.hue = hue;
      layerGroup.add(petal);
    }

    // Inner circle at unit scale
    const ring = new THREE.Line(
      circleGeo(48),
      lineMat(hdrColor([rr, gg, bb], iF * 0.55, 1.4), 0.5),
    );
    ring.scale.setScalar(0.24);
    ring.userData.tag = 'bloomCenter';
    layerGroup.add(ring);

    // Outer ring
    const outerRing = new THREE.Line(
      circleGeo(64),
      lineMat(hdrColor([rr, gg, bb], iF * 0.28, 1.0), 0.35),
    );
    outerRing.scale.setScalar(0.88);
    outerRing.userData.tag = 'bloomOuter';
    layerGroup.add(outerRing);

    group.add(layerGroup);
  }

  return group;
}

function updateBloom(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Calm Field'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const breathSpeed = cfg.breathSpeed;
  const sym = Math.max(4, Math.round(cfg.symmetry));
  const N_LAYERS = group.children.filter((c) => c.userData.tag === 'bloomLayer').length;
  const timeHue = (t * 0.000028) % 1.0;
  const tmpCol = new THREE.Color();

  for (const child of group.children) {
    if (child.userData.tag !== 'bloomLayer') continue;
    const layer = child as THREE.Group;

    // Advance phase: full cycle ~10s at speed=1
    let phase = (layer.userData.phase as number) + breathSpeed * 0.00007;
    if (phase >= 1.0) phase -= 1.0;
    layer.userData.phase = phase;

    // Scale from near-zero to R
    const sc = Math.max(0.0008, phase) * R;
    layer.scale.setScalar(sc);

    // Opacity: smooth fade in then out using a bell curve
    const op = phase < 0.18 ? phase / 0.18 : phase > 0.72 ? (1 - phase) / 0.28 : 1.0;

    // Slow rotation — inner layers rotate slightly faster
    const li = layer.userData.li as number;
    const rotDir = li % 2 === 0 ? 1 : -1;
    layer.rotation.z = t * 0.000055 * breathSpeed * rotDir * (1 + (N_LAYERS - li) * 0.04);

    // Update petal colors
    let petalIdx = 0;
    for (const c of layer.children) {
      if (c.userData.tag === 'bloomCenter' || c.userData.tag === 'bloomOuter') {
        if ((c as THREE.Line).material instanceof THREE.LineBasicMaterial) {
          ((c as THREE.Line).material as THREE.LineBasicMaterial).opacity =
            op * (c.userData.tag === 'bloomOuter' ? 0.35 : 0.5);
        }
      } else {
        const hue = ((petalIdx / sym) * 0.45 + timeHue + (li / N_LAYERS) * 0.25) % 1.0;
        tmpCol.setHSL(hue, 0.82, 0.55);
        const col: [number, number, number] = [
          lerp(rr, tmpCol.r * 255, cfg.glow / 10),
          lerp(gg, tmpCol.g * 255, cfg.glow / 10),
          lerp(bb, tmpCol.b * 255, cfg.glow / 10),
        ];
        if ((c as THREE.Line).material instanceof THREE.LineBasicMaterial) {
          const mat = (c as THREE.Line).material as THREE.LineBasicMaterial;
          mat.color.copy(hdrColor(col, iF, 1.9));
          mat.opacity = op * 0.88;
        }
        petalIdx++;
      }
    }
  }
}

/* ── LAVA mode — organic morphing blob lava lamp ────────────── */

const LAVA_BLOBS = [
  { freqX: 0.31, freqY: 0.23, phX: 0.0, phY: 1.2, size: 0.33, hueSeed: 0.04 },
  { freqX: 0.17, freqY: 0.29, phX: 2.1, phY: 0.5, size: 0.27, hueSeed: 0.08 },
  { freqX: 0.41, freqY: 0.11, phX: 4.3, phY: 2.8, size: 0.21, hueSeed: 0.01 },
  { freqX: 0.23, freqY: 0.37, phX: 1.5, phY: 4.1, size: 0.31, hueSeed: 0.12 },
  { freqX: 0.13, freqY: 0.44, phX: 3.7, phY: 0.9, size: 0.2, hueSeed: 0.06 },
  { freqX: 0.38, freqY: 0.16, phX: 0.8, phY: 3.3, size: 0.24, hueSeed: 0.09 },
  { freqX: 0.28, freqY: 0.33, phX: 5.1, phY: 1.7, size: 0.18, hueSeed: 0.15 },
  { freqX: 0.19, freqY: 0.27, phX: 2.9, phY: 5.4, size: 0.22, hueSeed: 0.03 },
];

function buildLava(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Calm Field'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const nBlobs = Math.max(3, Math.min(8, Math.round(cfg.complexity * 0.85 + 2)));
  const group = new THREE.Group();
  const tmpCol = new THREE.Color();

  for (let i = 0; i < nBlobs; i++) {
    const bd = LAVA_BLOBS[i % LAVA_BLOBS.length];
    const radius = R * bd.size * (0.85 + Math.random() * 0.3);
    const geo = new THREE.SphereGeometry(radius, 28, 20);
    const hue = (bd.hueSeed + cfg.glow * 0.025) % 1.0;
    tmpCol.setHSL(hue, 0.9, 0.52);
    const mat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(
        lerp(rr / 255, tmpCol.r, iF * 0.75),
        lerp(gg / 255, tmpCol.g, iF * 0.75),
        lerp(bb / 255, tmpCol.b, iF * 0.75),
      ),
      transparent: true,
      opacity: 0.42,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const blob = new THREE.Mesh(geo, mat);
    blob.userData.tag = 'lavaBlob';
    blob.userData.freqX = bd.freqX;
    blob.userData.freqY = bd.freqY;
    blob.userData.phX = bd.phX;
    blob.userData.phY = bd.phY;
    blob.userData.baseRadius = radius;
    blob.userData.hueSeed = bd.hueSeed;
    blob.userData.phasePulse = Math.random() * Math.PI * 2;
    group.add(blob);
  }

  return group;
}

function updateLava(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Calm Field'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const breathSpeed = cfg.breathSpeed;
  const ts = t * 0.001 * breathSpeed * 0.28; // very slow time
  const breath = (Math.sin(t * 0.001 * breathSpeed) + 1) * 0.5;
  const timeHue = (t * 0.000032) % 1.0;
  const tmpCol = new THREE.Color();

  for (const child of group.children) {
    if (child.userData.tag !== 'lavaBlob') continue;
    const blob = child as THREE.Mesh;
    const freqX = blob.userData.freqX as number;
    const freqY = blob.userData.freqY as number;
    const phX = blob.userData.phX as number;
    const phY = blob.userData.phY as number;
    const phasePulse = blob.userData.phasePulse as number;

    // Lissajous-like gentle drift, biased upward/downward for lamp feel
    blob.position.x = Math.sin(ts * freqX + phX) * R * 0.52;
    const rawY = Math.sin(ts * freqY + phY);
    // Soft bounce off top and bottom
    blob.position.y = Math.tanh(rawY * 1.4) * R * 0.62;

    // Organic size pulse — each blob breathes independently
    const sizePulse = 0.88 + 0.14 * Math.sin(ts * 1.1 + phasePulse);
    blob.scale.setScalar(sizePulse + breath * 0.06);

    // Slow color morph
    const hue = ((blob.userData.hueSeed as number) + timeHue + cfg.glow * 0.018) % 1.0;
    tmpCol.setHSL(hue, 0.9, 0.52);
    if (blob.material instanceof THREE.MeshBasicMaterial) {
      blob.material.color.setRGB(
        lerp(rr / 255, tmpCol.r, iF * 0.75),
        lerp(gg / 255, tmpCol.g, iF * 0.75),
        lerp(bb / 255, tmpCol.b, iF * 0.75),
      );
      blob.material.opacity = 0.36 + breath * 0.1 + sizePulse * 0.04;
    }
  }
}

/* ── SPIRE mode — gothic cathedral facade from ground up ─────── */

function buildSpire(cfg: Cfg, R: number): THREE.Group {
  const pal = PAL[cfg.preset] ?? PAL['Calm Field'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const complexity = Math.max(1, Math.round(cfg.complexity));
  const group = new THREE.Group();
  const tmpCol = new THREE.Color();

  // Helpers
  const px = (x: number) => x * R;
  const py = (y: number) => y * R;
  const glowFrac = cfg.glow / 10;

  function glassCol(): [number, number, number] {
    const hue = (glowFrac * 0.35 + 0.55) % 1.0;
    tmpCol.setHSL(hue, 0.88, 0.55);
    return [
      lerp(rr, tmpCol.r * 255, glowFrac),
      lerp(gg, tmpCol.g * 255, glowFrac),
      lerp(bb, tmpCol.b * 255, glowFrac),
    ];
  }

  function addLine(pts: number[], col: [number, number, number], bright = 1.0, op = 1.0, tag = '') {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const obj = new THREE.Line(geo, lineMat(hdrColor(col, iF * bright, 1.9), op));
    if (tag) obj.userData.tag = tag;
    group.add(obj);
  }

  function addSegs(pts: number[], col: [number, number, number], bright = 1.0, op = 1.0, tag = '') {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pts), 3));
    const obj = new THREE.LineSegments(geo, lineMat(hdrColor(col, iF * bright, 1.9), op));
    if (tag) obj.userData.tag = tag;
    group.add(obj);
  }

  function gothicArch(
    x0: number,
    y0: number,
    x1: number,
    y1: number,
    peakX: number,
    peakY: number,
    col: [number, number, number],
    bright: number,
    op: number,
    tag: string,
  ) {
    const N = 24;
    const pts: number[] = [];
    // Left half bezier: (x0,y0) -> ctrl -> (peakX,peakY)
    const lc1x = x0 + (peakX - x0) * 0.1;
    const lc1y = y0 + (peakY - y0) * 0.72;
    for (let k = 0; k <= N; k++) {
      const ti = k / N;
      const u = 1 - ti;
      pts.push(
        u * u * x0 + 2 * u * ti * lc1x + ti * ti * peakX,
        u * u * y0 + 2 * u * ti * lc1y + ti * ti * peakY,
        0,
      );
    }
    // Right half bezier: (peakX,peakY) -> ctrl -> (x1,y1)
    const rc1x = peakX + (x1 - peakX) * 0.9;
    const rc1y = peakY + (y1 - peakY) * 0.28;
    for (let k = 0; k <= N; k++) {
      const ti = k / N;
      const u = 1 - ti;
      pts.push(
        u * u * peakX + 2 * u * ti * rc1x + ti * ti * x1,
        u * u * peakY + 2 * u * ti * rc1y + ti * ti * y1,
        0,
      );
    }
    addLine(pts, col, bright, op, tag);
  }

  // ── Proportions (all in R units)
  const bY = -0.9; // base Y
  const tW = 0.14; // tower half-width
  const lTC = -0.54; // left tower center X
  const rTC = 0.54; // right tower center X
  const nHW = 0.36; // nave half-width
  const tH = 0.6; // tower top (before pediment)
  const nH = 0.18; // nave top
  const aH = -0.15; // aisle top
  const spH = 0.95; // spire tip

  const stone: [number, number, number] = [rr, gg, bb];
  const glass = glassCol();

  // ── 1. Foundation
  addSegs([px(-0.9), py(bY), 0, px(0.9), py(bY), 0], stone, 0.65, 0.9, 'stone');

  // ── 2. Towers (always visible)
  if (complexity >= 1) {
    for (const [tc] of [
      [lTC, -1],
      [rTC, 1],
    ] as [number, number][]) {
      addLine(
        [
          px(tc - tW),
          py(bY),
          0,
          px(tc - tW),
          py(tH),
          0,
          px(tc + tW),
          py(tH),
          0,
          px(tc + tW),
          py(bY),
          0,
        ],
        stone,
        0.92,
        1.0,
        'stone',
      );
      // Tower vertical center line
      addLine([px(tc), py(bY), 0, px(tc), py(tH), 0], stone, 0.4, 0.35, 'stone');
    }
  }

  // ── 3. Nave walls
  if (complexity >= 1) {
    addLine([px(-nHW), py(bY), 0, px(-nHW), py(nH), 0], stone, 0.88, 0.95, 'stone');
    addLine([px(nHW), py(bY), 0, px(nHW), py(nH), 0], stone, 0.88, 0.95, 'stone');
  }

  // ── 4. Aisle roofs + floors
  if (complexity >= 2) {
    addLine([px(lTC + tW), py(aH), 0, px(-nHW), py(aH), 0], stone, 0.72, 0.85, 'stone');
    addLine([px(rTC - tW), py(aH), 0, px(nHW), py(aH), 0], stone, 0.72, 0.85, 'stone');
  }

  // ── 5. Main portal: large pointed arch at base center
  if (complexity >= 2) {
    const apW = nHW * 0.58;
    const apH = nH - bY;
    gothicArch(
      px(-apW),
      py(bY),
      px(apW),
      py(bY),
      px(0),
      py(bY + apH * 0.8),
      glass,
      1.15,
      1.0,
      'glass',
    );
  }

  // ── 6. Nave clerestory arch
  if (complexity >= 3) {
    const navePts: number[] = [];
    const N = 28;
    for (let k = 0; k <= N; k++) {
      const ti = k / N;
      const x = lerp(px(-nHW), px(0), ti);
      const y =
        py(aH) + (py(nH) - py(aH)) * (Math.sin(ti * Math.PI) * (1 + Math.cos(ti * Math.PI) * 0.12));
      navePts.push(x, y, 0);
    }
    for (let k = N; k >= 0; k--) {
      const ti = k / N;
      const x = lerp(px(0), px(nHW), 1 - ti);
      const y =
        py(aH) + (py(nH) - py(aH)) * (Math.sin(ti * Math.PI) * (1 + Math.cos(ti * Math.PI) * 0.12));
      navePts.push(x, y, 0);
    }
    addLine(navePts, stone, 0.82, 0.88, 'stone');
  }

  // ── 7. Rose window
  if (complexity >= 3) {
    const rR = py(0.16);
    const rCY = py(-0.02);
    const ring1 = new THREE.Line(circleGeo(64), lineMat(hdrColor(glass, iF * 1.15, 2.3), 1.0));
    ring1.scale.setScalar(rR);
    ring1.position.y = rCY;
    ring1.userData.tag = 'roseOuter';
    group.add(ring1);

    const ring2 = new THREE.Line(circleGeo(48), lineMat(hdrColor(glass, iF * 0.85, 2.0), 0.8));
    ring2.scale.setScalar(rR * 0.58);
    ring2.position.y = rCY;
    ring2.userData.tag = 'roseInner';
    group.add(ring2);

    const spokeSym = Math.max(8, Math.round(cfg.symmetry));
    const spokePts: number[] = [];
    for (let s = 0; s < spokeSym; s++) {
      const a = (s / spokeSym) * Math.PI * 2;
      spokePts.push(0, rCY, 0, Math.cos(a) * rR, rCY + Math.sin(a) * rR, 0);
    }
    const spokeGeo = new THREE.BufferGeometry();
    spokeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(spokePts), 3));
    const spokes = new THREE.LineSegments(spokeGeo, lineMat(hdrColor(glass, iF * 0.75, 1.8), 0.65));
    spokes.userData.tag = 'roseSpokes';
    group.add(spokes);
  }

  // ── 8. Flying buttresses
  if (complexity >= 4) {
    const nFb = Math.min(3, Math.floor((complexity - 2) * 0.8));
    for (let i = 0; i < nFb; i++) {
      const frac = (i + 1) / (nFb + 1);
      const sY = py(bY + (nH - bY) * frac);
      for (const [naveX, pierX] of [
        [px(-nHW), px(lTC + tW + 0.04)],
        [px(nHW), px(rTC - tW - 0.04)],
      ] as [number, number][]) {
        const endY = sY - R * 0.14;
        const pts: number[] = [];
        const N = 20;
        for (let k = 0; k <= N; k++) {
          const ti = k / N;
          pts.push(
            lerp(naveX, pierX, ti),
            lerp(sY, endY, ti) + Math.sin(ti * Math.PI) * R * 0.07,
            0,
          );
        }
        addLine(pts, stone, 0.55, 0.6, 'stone');
      }
    }
  }

  // ── 9. Tower lancet windows
  if (complexity >= 4) {
    const nWin = Math.min(3, complexity - 2);
    for (let i = 0; i < nWin; i++) {
      const frac = (i + 1) / (nWin + 1);
      const wY = py(bY + (tH - bY) * frac);
      const wH = R * 0.13;
      const wHW = R * 0.055;
      for (const tc of [lTC, rTC]) {
        gothicArch(px(tc) - wHW, wY, px(tc) + wHW, wY, px(tc), wY + wH, glass, 0.9, 0.85, 'glass');
      }
    }
  }

  // ── 10. Tower pinnacles / crenellations
  if (complexity >= 5) {
    const nCrens = 4;
    const cPts: number[] = [];
    for (const [tl, tr] of [
      [lTC - tW, lTC + tW],
      [rTC - tW, rTC + tW],
    ] as [number, number][]) {
      for (let k = 0; k < nCrens; k++) {
        const x1 = lerp(px(tl), px(tr), k / nCrens);
        const x2 = lerp(px(tl), px(tr), (k + 0.42) / nCrens);
        const x3 = lerp(px(tl), px(tr), (k + 0.58) / nCrens);
        const x4 = lerp(px(tl), px(tr), (k + 1) / nCrens);
        const yB = py(tH);
        const yT = py(tH + 0.045);
        cPts.push(x1, yB, 0, x1, yT, 0, x1, yT, 0, x2, yT, 0, x2, yT, 0, x2, yB, 0);
        cPts.push(x3, yB, 0, x3, yT, 0, x3, yT, 0, x4, yT, 0, x4, yT, 0, x4, yB, 0);
      }
    }
    addSegs(cPts, stone, 0.75, 0.8, 'stone');
  }

  // ── 11. Central spire
  if (complexity >= 6) {
    const sBW = R * 0.085;
    const sBY = py(nH + 0.08);
    const sTY = py(spH);
    const spPts = new Float32Array([
      -sBW,
      sBY,
      0,
      0,
      sTY,
      0,
      0,
      sTY,
      0,
      sBW,
      sBY,
      0,
      -sBW * 0.72,
      sBY + (sTY - sBY) * 0.28,
      0,
      sBW * 0.72,
      sBY + (sTY - sBY) * 0.28,
      0,
      -sBW * 0.44,
      sBY + (sTY - sBY) * 0.56,
      0,
      sBW * 0.44,
      sBY + (sTY - sBY) * 0.56,
      0,
    ]);
    const spGeo = new THREE.BufferGeometry();
    spGeo.setAttribute('position', new THREE.BufferAttribute(spPts, 3));
    const spire = new THREE.LineSegments(spGeo, lineMat(hdrColor(stone, iF * 1.2, 2.3), 1.0));
    spire.userData.tag = 'centralSpire';
    group.add(spire);
  }

  // ── 12. Side aisle pointed arches (decorative)
  if (complexity >= 7) {
    const nArches = 3;
    for (let side = -1; side <= 1; side += 2) {
      const x0 = side < 0 ? lTC + tW : nHW;
      const x1 = side < 0 ? -nHW : rTC - tW;
      for (let i = 0; i < nArches; i++) {
        const frac = i / nArches;
        const ax0 = lerp(px(x0), px(x1), frac);
        const ax1 = lerp(px(x0), px(x1), frac + 1 / nArches);
        const axMid = (ax0 + ax1) * 0.5;
        gothicArch(ax0, py(bY), ax1, py(bY), axMid, py(aH - 0.05), glass, 0.78, 0.72, 'glass');
      }
    }
  }

  return group;
}

function updateSpire(group: THREE.Group, cfg: Cfg, t: number, R: number): void {
  const pal = PAL[cfg.preset] ?? PAL['Calm Field'];
  const [rr, gg, bb] = pal.rgb;
  const iF = cfg.intensity / 10;
  const breathSpeed = cfg.breathSpeed;
  const breath = (Math.sin(t * 0.001 * breathSpeed) + 1) * 0.5;
  const timeHue = (t * 0.000028) % 1.0;
  const glowFrac = cfg.glow / 10;
  const tmpCol = new THREE.Color();

  // Recompute glass color for update
  const glassH = (glowFrac * 0.35 + timeHue * 0.5 + 0.52) % 1.0;
  tmpCol.setHSL(glassH, 0.88, 0.55);
  const glass: [number, number, number] = [
    lerp(rr, tmpCol.r * 255, glowFrac),
    lerp(gg, tmpCol.g * 255, glowFrac),
    lerp(bb, tmpCol.b * 255, glowFrac),
  ];
  const stone: [number, number, number] = [rr, gg, bb];

  for (const child of group.children) {
    const tag = child.userData.tag as string;

    if (tag === 'roseOuter' || tag === 'roseInner' || tag === 'roseSpokes' || tag === 'glass') {
      // Stained glass: glow pulses and hue shifts
      const glowPulse = 1.0 + breath * 0.35;
      updateMat(child as THREE.Object3D, glass, iF * glowPulse, 2.3);
      if (tag === 'roseOuter') child.rotation.z = t * 0.0001 * breathSpeed;
      if (tag === 'roseInner') child.rotation.z = -t * 0.00015 * breathSpeed;
    } else if (tag === 'centralSpire') {
      const spPulse = 0.9 + breath * 0.2;
      updateMat(child as THREE.Object3D, stone, iF * 1.2 * spPulse, 2.3);
    } else if (tag === 'stone') {
      updateMat(child as THREE.Object3D, stone, iF * (0.68 + breath * 0.16), 1.7);
    }
  }
}

/* ── Background stars ───────────────────────────────────────── */

function buildStars(count: number, W: number, H: number): THREE.Group {
  const g = new THREE.Group();
  if (count <= 0) return g;
  const totalN = Math.round(count * 55 + 25);
  const half = Math.max(W, H) * 0.62;
  const layers = [
    { frac: 0.65, size: 0.8, phase: 0 },
    { frac: 0.28, size: 1.4, phase: 2.1 },
    { frac: 0.07, size: 2.4, phase: 4.3 },
  ];
  for (const layer of layers) {
    const N = Math.round(totalN * layer.frac);
    const pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 2 * half;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 2 * half;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: new THREE.Color(1.6, 1.6, 2.0),
      size: layer.size,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pts = new THREE.Points(geo, mat);
    pts.userData.tag = 'starLayer';
    pts.userData.phase = layer.phase;
    g.add(pts);
  }
  return g;
}

function updateStars(group: THREE.Group, t: number): void {
  for (const child of group.children) {
    if (child.userData.tag === 'starLayer') {
      const phase = child.userData.phase as number;
      if ((child as THREE.Points).material instanceof THREE.PointsMaterial) {
        ((child as THREE.Points).material as THREE.PointsMaterial).opacity =
          0.2 + 0.18 * Math.sin(t * 0.00075 + phase);
      }
    }
  }
}

/* ── Slider definitions ─────────────────────────────────────── */

type SliderDef = { key: keyof Cfg; label: string; min: number; max: number; step: number };

const DEFAULT_SLIDERS: SliderDef[] = [
  { key: 'symmetry', label: 'Symmetry', min: 4, max: 24, step: 1 },
  { key: 'complexity', label: 'Complexity', min: 1, max: 10, step: 0.5 },
  { key: 'glow', label: 'Glow', min: 0, max: 10, step: 0.5 },
  { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.5, step: 0.05 },
  { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
  { key: 'particles', label: 'Particles', min: 0, max: 10, step: 1 },
  { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
  { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
];

const MODE_SLIDERS: Partial<Record<Mode, SliderDef[]>> = {
  tunnel: [
    { key: 'symmetry', label: 'Spokes', min: 4, max: 24, step: 1 },
    { key: 'glow', label: 'Glow', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.5, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
  ],
  vitral: [
    { key: 'symmetry', label: 'Cells', min: 4, max: 24, step: 1 },
    { key: 'complexity', label: 'Layers', min: 1, max: 8, step: 1 },
    { key: 'glow', label: 'Glow', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.5, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
  ],
  fibonacci: [
    { key: 'complexity', label: 'Arms', min: 1, max: 10, step: 1 },
    { key: 'symmetry', label: 'Rings', min: 2, max: 16, step: 1 },
    { key: 'glow', label: 'Glow', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.5, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
  ],
  clifford: [
    { key: 'complexity', label: 'Density', min: 1, max: 10, step: 1 },
    { key: 'glow', label: 'Glow', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.5, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
  ],
  hypercube: [
    { key: 'complexity', label: 'Fibers', min: 2, max: 20, step: 2 },
    { key: 'glow', label: 'Glow', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.5, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
  ],
  warp: [
    { key: 'symmetry', label: 'Sectors', min: 1, max: 12, step: 1 },
    { key: 'glow', label: 'Glow', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.5, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
  ],
  lorenz: [
    { key: 'complexity', label: 'Density', min: 1, max: 8, step: 1 },
    { key: 'glow', label: 'Glow', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.5, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
  ],
  knot: [
    { key: 'complexity', label: 'Knot', min: 1, max: 9, step: 1 },
    { key: 'symmetry', label: 'Strands', min: 1, max: 6, step: 1 },
    { key: 'glow', label: 'Glow', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.5, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
  ],
  orbital: [
    { key: 'complexity', label: 'Orbital', min: 1, max: 8, step: 1 },
    { key: 'glow', label: 'Glow', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.5, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
  ],
  geodesic: [
    { key: 'complexity', label: 'Form', min: 1, max: 7, step: 1 },
    { key: 'symmetry', label: 'Shells', min: 1, max: 5, step: 1 },
    { key: 'glow', label: 'Glow', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.5, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
  ],
  rainbow: [
    { key: 'symmetry', label: 'Spokes', min: 3, max: 24, step: 1 },
    { key: 'complexity', label: 'Rings', min: 2, max: 12, step: 1 },
    { key: 'glow', label: 'Rainbow', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.5, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
  ],
  cathedral: [
    { key: 'symmetry', label: 'Arches', min: 4, max: 16, step: 1 },
    { key: 'complexity', label: 'Height', min: 1, max: 8, step: 1 },
    { key: 'glow', label: 'Colour Mix', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.0, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 5, step: 1 },
  ],
  islamic: [
    { key: 'symmetry', label: 'Star Points', min: 6, max: 16, step: 1 },
    { key: 'complexity', label: 'Layers', min: 1, max: 8, step: 1 },
    { key: 'glow', label: 'Colour Mix', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.0, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 5, step: 1 },
  ],
  yantra: [
    { key: 'complexity', label: 'Triangle Pairs', min: 2, max: 9, step: 1 },
    { key: 'symmetry', label: 'Lotus Petals', min: 4, max: 16, step: 1 },
    { key: 'glow', label: 'Colour Mix', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 0.8, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
  ],
  celtic: [
    { key: 'complexity', label: 'Knot Count', min: 1, max: 4, step: 1 },
    { key: 'symmetry', label: 'Ring Circle', min: 4, max: 12, step: 1 },
    { key: 'glow', label: 'Colour Mix', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.0, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 5, step: 1 },
  ],
  bloom: [
    { key: 'symmetry', label: 'Petals', min: 4, max: 16, step: 1 },
    { key: 'complexity', label: 'Layers', min: 4, max: 12, step: 1 },
    { key: 'glow', label: 'Colour Shift', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Bloom Speed', min: 0.05, max: 1.2, step: 0.05 },
    { key: 'intensity', label: 'Brightness', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
  ],
  lava: [
    { key: 'complexity', label: 'Blobs', min: 3, max: 8, step: 1 },
    { key: 'glow', label: 'Colour Shift', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Flow Speed', min: 0.05, max: 1.0, step: 0.05 },
    { key: 'intensity', label: 'Brightness', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
  ],
  spire: [
    { key: 'complexity', label: 'Detail Level', min: 1, max: 8, step: 1 },
    { key: 'symmetry', label: 'Rose Spokes', min: 8, max: 24, step: 2 },
    { key: 'glow', label: 'Glass Colour', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 0.8, step: 0.05 },
    { key: 'intensity', label: 'Brightness', min: 0, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Luminous', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 5, step: 1 },
  ],
  lissajous3d: [
    { key: 'symmetry', label: 'Freq X', min: 1, max: 9, step: 1 },
    { key: 'complexity', label: 'Freq Y', min: 1, max: 9, step: 1 },
    { key: 'glow', label: 'Freq Z', min: 1, max: 9, step: 1 },
    { key: 'particles', label: 'Traces', min: 1, max: 8, step: 1 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 2.0, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 1, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Bloom', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
  ],
  tknot3d: [
    { key: 'symmetry', label: 'Winds P', min: 2, max: 7, step: 1 },
    { key: 'complexity', label: 'Winds Q', min: 2, max: 9, step: 1 },
    { key: 'glow', label: 'Tube', min: 1, max: 10, step: 0.5 },
    { key: 'particles', label: 'Traces', min: 1, max: 6, step: 1 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 1.5, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 1, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Bloom', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
  ],
  lorenz3d: [
    { key: 'symmetry', label: 'Sigma', min: 1, max: 20, step: 1 },
    { key: 'complexity', label: 'Rho', min: 1, max: 20, step: 1 },
    { key: 'glow', label: 'Beta', min: 0, max: 10, step: 0.5 },
    { key: 'particles', label: 'Trails', min: 1, max: 6, step: 1 },
    { key: 'breathSpeed', label: 'Flow', min: 0.05, max: 2.0, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 1, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Bloom', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
  ],
  rose3d: [
    { key: 'symmetry', label: 'Freq A', min: 1, max: 9, step: 1 },
    { key: 'complexity', label: 'Freq B', min: 1, max: 9, step: 1 },
    { key: 'glow', label: 'Freq C', min: 1, max: 9, step: 1 },
    { key: 'particles', label: 'Petals', min: 1, max: 8, step: 1 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 2.0, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 1, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Bloom', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
  ],
  helix3d: [
    { key: 'particles', label: 'Strands', min: 1, max: 8, step: 1 },
    { key: 'symmetry', label: 'Turns', min: 1, max: 12, step: 1 },
    { key: 'complexity', label: 'Bulges', min: 1, max: 10, step: 1 },
    { key: 'glow', label: 'Twist', min: 0, max: 10, step: 0.5 },
    { key: 'breathSpeed', label: 'Speed', min: 0.05, max: 2.0, step: 0.05 },
    { key: 'intensity', label: 'Colour', min: 1, max: 10, step: 0.5 },
    { key: 'luminous', label: 'Bloom', min: 0, max: 5, step: 0.5 },
    { key: 'stars', label: 'Stars', min: 0, max: 10, step: 1 },
  ],
};

function slidersFor(mode: Mode): SliderDef[] {
  return MODE_SLIDERS[mode] ?? DEFAULT_SLIDERS;
}

/* ── Mode pill definitions ──────────────────────────────────── */

const MODE_TO_PRESET: Partial<Record<Mode, string>> = {
  burst: 'DMT Vision',
  kaleidoscope: 'Cosmic Indigo',
  tunnel: 'Warp Tunnel',
  vitral: 'Sacred Vitral',
  fibonacci: 'Fibonacci Bloom',
  clifford: 'Clifford Dream',
  hypercube: '4D Crystal',
  warp: 'Warp Drive',
  lorenz: 'Lorenz Storm',
  knot: 'Knot Garden',
  orbital: 'Orbital Shell',
  geodesic: 'Crystal Lattice',
  rainbow: 'Laser Dome',
  cathedral: 'Sacred Architecture',
  islamic: 'Islamic Garden',
  yantra: 'Yantra Fire',
  celtic: 'Celtic Forest',
  bloom: 'Infinite Bloom',
  lava: 'Lava Dream',
  spire: 'Gothic Spire',
  lissajous3d: 'Lissajous 3D',
  tknot3d: 'Torus Knot',
  lorenz3d: 'Lorenz 3D',
  rose3d: 'Rose 3D',
  helix3d: 'Helix 3D',
};

const MODES: { mode: Mode; label: string }[] = [
  { mode: 'sacred', label: '✦ Sacred' },
  { mode: 'burst', label: '✤ Burst' },
  { mode: 'lissajous', label: '∿ Lissajous' },
  { mode: 'golden', label: 'φ Golden' },
  { mode: 'kaleidoscope', label: '⬡ Kaleidoscope' },
  { mode: 'torus', label: '◎ Torus' },
  { mode: 'tunnel', label: '⊙ Tunnel' },
  { mode: 'vitral', label: '✧ Vitral' },
  { mode: 'fibonacci', label: 'φ² Fibonacci' },
  { mode: 'clifford', label: '∞ Clifford' },
  { mode: 'hypercube', label: '◈ Hypercube' },
  { mode: 'warp', label: '⋙ Warp' },
  { mode: 'lorenz', label: '𝛔 Lorenz' },
  { mode: 'knot', label: '∮ Knot' },
  { mode: 'orbital', label: '⊛ Orbital' },
  { mode: 'geodesic', label: '⬡ Geodesic' },
  { mode: 'rainbow', label: '◉ Rainbow' },
  { mode: 'cathedral', label: '⛪ Cathedral' },
  { mode: 'islamic', label: '☪ Islamic' },
  { mode: 'yantra', label: '△ Yantra' },
  { mode: 'celtic', label: '☘ Celtic' },
  { mode: 'bloom', label: '🌸 Bloom' },
  { mode: 'lava', label: '🌋 Lava' },
  { mode: 'spire', label: '⛪ Spire' },
  { mode: 'lissajous3d', label: '∿³ Lissajous 3D' },
  { mode: 'tknot3d', label: '⌀ Torus Knot' },
  { mode: 'lorenz3d', label: '𝛔 Lorenz 3D' },
  { mode: 'rose3d', label: '✾ Rose 3D' },
  { mode: 'helix3d', label: '⟳ Helix 3D' },
];

/* ── Component ──────────────────────────────────────────────── */

export default function GeometryField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const matrixCanvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const matrixAnimRef = useRef<number>(0);
  const dprRef = useRef<number>(1);
  const cfgRef = useRef<Cfg>(PRESETS['Calm Field']);
  const journeyCfgRef = useRef<Cfg | null>(null);
  const dotsRef = useRef<Dot[]>(makeDots(160));
  const ripplesRef = useRef<Ripple[]>([]);

  // Journey refs (read by tick without re-render)
  const journeyRunningRef = useRef(false);
  const journeyIdRef = useRef(1);
  const journeyStartRef = useRef(0);
  const matrixActiveRef = useRef(false);
  const matrixDropsRef = useRef<number[]>([]);
  const phaseInfoRef = useRef({ phaseIdx: 0, phaseProgress: 0 });

  // Three.js refs
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const bloomPassRef = useRef<UnrealBloomPass | null>(null);
  const modeGroupRef = useRef<THREE.Group | null>(null);
  const builtKeyRef = useRef('');
  const starsGroupRef = useRef<THREE.Group | null>(null);
  const builtStarsKeyRef = useRef('');
  const sizeRef = useRef({ W: 0, H: 0 });
  const clearColorRef = useRef(new THREE.Color());
  const rippleRingsRef = useRef<THREE.Line[]>([]);
  const l3dRotRef = useRef({ x: 0.4, y: 0.0 });
  const l3dDragRef = useRef<{ lastX: number; lastY: number } | null>(null);

  const [cfg, setCfg] = useState<Cfg>(PRESETS['Calm Field']);
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState<'builder' | 'journey'>('builder');
  const [builderView, setBuilderView] = useState<'programs' | 'sliders'>('sliders');
  const [journeyId, setJourneyId] = useState(1);
  const [journeyRunning, setJourneyRunning] = useState(false);
  const [journeyPhaseInfo, setJourneyPhaseInfo] = useState({ phaseIdx: 0, phaseProgress: 0 });

  useEffect(() => {
    cfgRef.current = cfg;
  }, [cfg]);

  useEffect(() => {
    dotsRef.current = makeDots(Math.round(cfg.particles * 40 + 20));
  }, [cfg.particles]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = canvasContainerRef.current;
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

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -2000, 2000);
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

    let phaseUpdateTimer = 0;

    function tick(t: number) {
      // Journey auto-pilot
      if (journeyRunningRef.current) {
        const jData = JOURNEYS[journeyIdRef.current - 1];
        if (jData) {
          const elapsed = (t - journeyStartRef.current) / 1000;
          const totalDur = jData.stages.reduce((s, st) => s + st.duration, 0);
          const loopTime = elapsed % totalDur;
          let acc = 0;
          for (let i = 0; i < jData.stages.length; i++) {
            const stage = jData.stages[i];
            if (loopTime < acc + stage.duration || i === jData.stages.length - 1) {
              const stageP = Math.min(1, (loopTime - acc) / stage.duration);
              const nextStage = jData.stages[(i + 1) % jData.stages.length];
              journeyCfgRef.current = journeyLerpCfg(stage, nextStage, stageP);
              // Update phase info every ~500ms to avoid excessive re-renders
              if (t - phaseUpdateTimer > 500) {
                phaseUpdateTimer = t;
                phaseInfoRef.current = { phaseIdx: i, phaseProgress: stageP };
              }
              break;
            }
            acc += stage.duration;
          }
        }
      } else {
        journeyCfgRef.current = null;
      }

      const currentCfg = journeyCfgRef.current ?? cfgRef.current;
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

      // Rebuild stars when count or viewport changes
      const starsKey = `${Math.round(currentCfg.stars)}-${Math.round(W)}-${Math.round(H)}`;
      if (starsKey !== builtStarsKeyRef.current) {
        if (starsGroupRef.current) {
          scene.remove(starsGroupRef.current);
          disposeGroup(starsGroupRef.current);
        }
        starsGroupRef.current = buildStars(currentCfg.stars, W, H);
        scene.add(starsGroupRef.current);
        builtStarsKeyRef.current = starsKey;
      }
      if (starsGroupRef.current) updateStars(starsGroupRef.current, t);

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

      // Apply 3D rotation for spinnable modes
      const is3D =
        currentCfg.mode === 'lissajous3d' ||
        currentCfg.mode === 'tknot3d' ||
        currentCfg.mode === 'lorenz3d' ||
        currentCfg.mode === 'rose3d' ||
        currentCfg.mode === 'helix3d';
      if (is3D && modeGroupRef.current) {
        if (!l3dDragRef.current) {
          // Slow auto-spin when not dragging
          l3dRotRef.current.y += 0.003;
        }
        modeGroupRef.current.rotation.x = l3dRotRef.current.x;
        modeGroupRef.current.rotation.y = l3dRotRef.current.y;
      }

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
      for (const r of rippleRingsRef.current) {
        scene.remove(r);
        r.geometry.dispose();
        (r.material as THREE.Material).dispose();
      }
      rippleRingsRef.current = [];
      if (modeGroupRef.current) disposeGroup(modeGroupRef.current);
      if (starsGroupRef.current) disposeGroup(starsGroupRef.current);
      composer.dispose();
      renderer.dispose();
    };
  }, []);

  // Sync phase info to state for UI (throttled via interval)
  useEffect(() => {
    if (!journeyRunning) return;
    const id = setInterval(() => {
      setJourneyPhaseInfo({ ...phaseInfoRef.current });
    }, 800);
    return () => clearInterval(id);
  }, [journeyRunning]);

  // Matrix canvas code rain
  useEffect(() => {
    if (!journeyRunning || journeyId !== 5) {
      matrixActiveRef.current = false;
      cancelAnimationFrame(matrixAnimRef.current);
      const mc = matrixCanvasRef.current;
      if (mc) {
        const ctx = mc.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, mc.width, mc.height);
      }
      return;
    }
    const mc = matrixCanvasRef.current;
    if (!mc) return;
    const ctx = mc.getContext('2d');
    if (!ctx) return;
    mc.width = mc.offsetWidth || mc.clientWidth || 400;
    mc.height = mc.offsetHeight || mc.clientHeight || 600;
    const fontSize = 13;
    const cols = Math.floor(mc.width / fontSize);
    matrixDropsRef.current = Array(cols).fill(1);
    matrixActiveRef.current = true;
    const chars = '01アイウエオカキ∞∮∑∇◈⬡✦{}[]<>!@#$%'.split('');
    const mctx = ctx;
    const mmc = mc;
    function drawMatrix() {
      if (!matrixActiveRef.current) return;
      mctx.fillStyle = 'rgba(0,4,0,0.07)';
      mctx.fillRect(0, 0, mmc.width, mmc.height);
      mctx.font = `${fontSize}px monospace`;
      const drops = matrixDropsRef.current;
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        const bright = Math.random() > 0.94 ? 220 : 65 + Math.floor(Math.random() * 60);
        mctx.fillStyle = `rgba(0,${bright},30,0.9)`;
        mctx.fillText(ch, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > mmc.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
      matrixAnimRef.current = requestAnimationFrame(drawMatrix);
    }
    matrixAnimRef.current = requestAnimationFrame(drawMatrix);
    return () => {
      matrixActiveRef.current = false;
      cancelAnimationFrame(matrixAnimRef.current);
    };
  }, [journeyRunning, journeyId]);

  function startJourney(id: number) {
    setJourneyId(id);
    journeyIdRef.current = id;
    journeyStartRef.current = performance.now();
    journeyRunningRef.current = true;
    setJourneyRunning(true);
    phaseInfoRef.current = { phaseIdx: 0, phaseProgress: 0 };
    setJourneyPhaseInfo({ phaseIdx: 0, phaseProgress: 0 });
  }

  function skipToPhase(phaseIdx: number) {
    if (!journeyRunning) return;
    const jData = JOURNEYS[journeyIdRef.current - 1];
    if (!jData) return;
    const totalDur = jData.stages.reduce(
      (s: number, st: { duration: number }) => s + st.duration,
      0,
    );
    let acc = 0;
    for (let i = 0; i < phaseIdx; i++) acc += jData.stages[i].duration;
    journeyStartRef.current = performance.now() - (acc % totalDur) * 1000;
    phaseInfoRef.current = { phaseIdx, phaseProgress: 0 };
    setJourneyPhaseInfo({ phaseIdx, phaseProgress: 0 });
  }

  function stopJourney() {
    journeyRunningRef.current = false;
    setJourneyRunning(false);
    if (journeyCfgRef.current) {
      setCfg(journeyCfgRef.current);
      journeyCfgRef.current = null;
    }
  }

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

  function handleRandomize() {
    const keys = Object.keys(PRESETS);
    const base = PRESETS[keys[Math.floor(Math.random() * keys.length)]];
    const modeKeys: Mode[] = [
      'sacred',
      'burst',
      'lissajous',
      'golden',
      'kaleidoscope',
      'torus',
      'tunnel',
      'vitral',
      'fibonacci',
      'clifford',
      'hypercube',
      'warp',
      'lorenz',
      'knot',
      'orbital',
      'geodesic',
    ];
    setCfg({
      ...base,
      symmetry: 4 + Math.floor(Math.random() * 20),
      complexity: 2 + Math.random() * 8,
      glow: 1 + Math.random() * 9,
      breathSpeed: 0.1 + Math.random() * 1.0,
      intensity: 4 + Math.random() * 6,
      particles: Math.floor(Math.random() * 10),
      luminous: Math.random() * 5,
      stars: Math.floor(Math.random() * 8),
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

  const displayCfg = journeyCfgRef.current ?? cfg;
  const pal = PAL[displayCfg.preset] ?? PAL['Calm Field'];
  const [pr, pg, pb] = pal.rgb;
  const accent = `rgb(${pr},${pg},${pb})`;
  const accentFaint = `rgba(${pr},${pg},${pb},0.12)`;
  const accentMid = `rgba(${pr},${pg},${pb},0.35)`;

  const activeJourney = JOURNEYS[journeyId - 1];
  const currentStage = activeJourney?.stages[journeyPhaseInfo.phaseIdx];
  const totalJourneyDur = activeJourney?.stages.reduce((s, st) => s + st.duration, 0) ?? 0;
  const elapsed = journeyRunning
    ? activeJourney?.stages
        .slice(0, journeyPhaseInfo.phaseIdx)
        .reduce((s, st) => s + st.duration, 0) +
      journeyPhaseInfo.phaseProgress * (currentStage?.duration ?? 0)
    : 0;

  const pill = (txt: string, active: boolean, onClick: () => void, small = false) => (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        background: active ? accent : accentFaint,
        border: `1px solid ${active ? accent : accentMid}`,
        borderRadius: 99,
        padding: small ? '4px 10px' : '5px 13px',
        color: active ? '#fff' : accent,
        fontFamily: 'var(--font-serif)',
        fontSize: small ? 10 : 11,
        fontWeight: active ? 700 : 400,
        letterSpacing: '0.05em',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {txt}
    </button>
  );

  return (
    <div
      ref={wrapperRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: 'calc(100svh - 110px)',
        minHeight: 420,
        borderRadius: 14,
        overflow: 'hidden',
        background: '#080604',
      }}
    >
      {/* Canvas area — fills remaining space */}
      <div ref={canvasContainerRef} style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onPointerDown={(e) => {
            const is3d =
              cfg.mode === 'lissajous3d' ||
              cfg.mode === 'tknot3d' ||
              cfg.mode === 'lorenz3d' ||
              cfg.mode === 'rose3d' ||
              cfg.mode === 'helix3d';
            if (!is3d) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            l3dDragRef.current = { lastX: e.clientX, lastY: e.clientY };
          }}
          onPointerMove={(e) => {
            const is3d =
              cfg.mode === 'lissajous3d' ||
              cfg.mode === 'tknot3d' ||
              cfg.mode === 'lorenz3d' ||
              cfg.mode === 'rose3d' ||
              cfg.mode === 'helix3d';
            if (!is3d || !l3dDragRef.current) return;
            const dx = e.clientX - l3dDragRef.current.lastX;
            const dy = e.clientY - l3dDragRef.current.lastY;
            l3dRotRef.current.y += dx * 0.008;
            l3dRotRef.current.x += dy * 0.008;
            l3dDragRef.current = { lastX: e.clientX, lastY: e.clientY };
          }}
          onPointerUp={() => {
            l3dDragRef.current = null;
          }}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            display: 'block',
            cursor:
              cfg.mode === 'lissajous3d' ||
              cfg.mode === 'tknot3d' ||
              cfg.mode === 'lorenz3d' ||
              cfg.mode === 'rose3d' ||
              cfg.mode === 'helix3d'
                ? 'grab'
                : 'crosshair',
          }}
        />

        {/* Matrix code-rain overlay */}
        {journeyRunning && journeyId === 5 && (
          <canvas
            ref={matrixCanvasRef}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              mixBlendMode: 'screen',
              opacity: 0.5,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Page title */}
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

        {/* Journey live phase badge */}
        {journeyRunning && open && (
          <div
            style={{
              position: 'absolute',
              top: 14,
              right: 14,
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${accentMid}`,
              borderRadius: 8,
              padding: '5px 10px',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 9,
                color: accent,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                opacity: 0.7,
              }}
            >
              {activeJourney?.name} — Phase {journeyPhaseInfo.phaseIdx + 1}/
              {activeJourney?.stages.length}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 9,
                color: `rgba(${pr},${pg},${pb},0.5)`,
                marginTop: 2,
              }}
            >
              {currentStage?.mode} · {Math.floor(elapsed ?? 0)}s / {Math.floor(totalJourneyDur)}s
            </div>
          </div>
        )}

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
      </div>

      {/* Control panel — fixed 50% height when open */}
      {open && (
        <div
          style={{
            flexShrink: 0,
            height: '50%',
            background: 'rgba(8,5,3,0.94)',
            backdropFilter: 'blur(18px)',
            borderTop: `1px solid ${accentMid}`,
            padding: '8px 16px 16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {/* Collapse handle + tab switcher */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {pill('Builder', tab === 'builder', () => setTab('builder'), true)}
              {pill('Journey', tab === 'journey', () => setTab('journey'), true)}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: accentFaint,
                border: `1px solid ${accentMid}`,
                borderRadius: 99,
                padding: '3px 18px',
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

          {/* ── BUILDER TAB ── */}
          {tab === 'builder' && (
            <>
              {/* View toggle header */}
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11,
                    fontWeight: 700,
                    color: accent,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    opacity: 0.9,
                  }}
                >
                  {MODES.find((m) => m.mode === cfg.mode)?.label ?? cfg.mode}
                </span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {(['programs', 'sliders'] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setBuilderView(v)}
                      style={{
                        background: builderView === v ? accentFaint : 'transparent',
                        border: `1px solid ${builderView === v ? accentMid : `rgba(${pr},${pg},${pb},0.15)`}`,
                        borderRadius: 99,
                        padding: '3px 10px',
                        color: builderView === v ? accent : `rgba(${pr},${pg},${pb},0.45)`,
                        fontFamily: 'var(--font-serif)',
                        fontSize: 9,
                        cursor: 'pointer',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Programs grid */}
              {builderView === 'programs' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                  {MODES.map(({ mode, label }) => {
                    const isActive = cfg.mode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => {
                          const p = MODE_TO_PRESET[mode];
                          if (p) applyPreset(p);
                          else update('mode', mode);
                          setBuilderView('sliders');
                        }}
                        style={{
                          background: isActive ? accentFaint : 'transparent',
                          border: `1px solid ${isActive ? accentMid : `rgba(${pr},${pg},${pb},0.15)`}`,
                          borderRadius: 8,
                          padding: '7px 6px',
                          color: isActive ? accent : `rgba(${pr},${pg},${pb},0.6)`,
                          fontFamily: 'var(--font-serif)',
                          fontSize: 10,
                          fontWeight: isActive ? 700 : 400,
                          cursor: 'pointer',
                          letterSpacing: '0.06em',
                          textAlign: 'center',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Sliders + actions */}
              {builderView === 'sliders' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 20px' }}>
                    {slidersFor(cfg.mode).map(({ key, label, min, max, step }) => {
                      const val = cfg[key] as number;
                      return (
                        <div key={key}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              marginBottom: 2,
                            }}
                          >
                            <span
                              style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: 9,
                                color: `rgba(${pr},${pg},${pb},0.6)`,
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                              }}
                            >
                              {label}
                            </span>
                            <span
                              style={{
                                fontFamily: 'var(--font-serif)',
                                fontSize: 9,
                                color: accent,
                              }}
                            >
                              {step < 1 ? val.toFixed(2) : Math.round(val)}
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

                  <div
                    style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}
                  >
                    {(
                      [
                        ['Randomize', handleRandomize],
                        ['Save', handleSave],
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
                          padding: '5px 14px',
                          color: accent,
                          fontFamily: 'var(--font-serif)',
                          fontSize: 10,
                          cursor: 'pointer',
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          {/* ── JOURNEY TAB ── */}
          {tab === 'journey' && (
            <>
              {/* Journey selection */}
              <div style={{ display: 'flex', gap: 6, overflowX: 'auto', scrollbarWidth: 'none' }}>
                {JOURNEYS.map((j) =>
                  pill(`${j.icon} ${j.name}`, journeyId === j.id, () => {
                    setJourneyId(j.id);
                    journeyIdRef.current = j.id;
                    if (journeyRunning) {
                      journeyStartRef.current = performance.now();
                      phaseInfoRef.current = { phaseIdx: 0, phaseProgress: 0 };
                    }
                  }),
                )}
              </div>

              {/* Journey description */}
              <p
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  color: `rgba(${pr},${pg},${pb},0.55)`,
                  fontStyle: 'italic',
                  lineHeight: 1.5,
                }}
              >
                {activeJourney?.desc}
              </p>

              {/* Phase list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 9,
                    color: `rgba(${pr},${pg},${pb},0.4)`,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    marginBottom: 2,
                  }}
                >
                  Phases — {Math.floor(totalJourneyDur / 60)}m{Math.round(totalJourneyDur % 60)}s
                  total
                </div>
                {activeJourney?.stages.map((stage, i) => {
                  const isActive = journeyRunning && journeyPhaseInfo.phaseIdx === i;
                  const prog = isActive ? journeyPhaseInfo.phaseProgress : 0;
                  return (
                    <div
                      key={i}
                      onClick={() => journeyRunning && skipToPhase(i)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '5px 8px',
                        borderRadius: 6,
                        background: isActive ? accentFaint : 'transparent',
                        border: `1px solid ${isActive ? accentMid : 'rgba(255,255,255,0.05)'}`,
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: journeyRunning ? 'pointer' : 'default',
                      }}
                    >
                      {isActive && (
                        <div
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: `${prog * 100}%`,
                            background: `rgba(${pr},${pg},${pb},0.08)`,
                            transition: 'width 0.5s linear',
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 9,
                          color: accent,
                          opacity: 0.5,
                          flexShrink: 0,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 10,
                          color: isActive
                            ? `rgb(${pr},${pg},${pb})`
                            : `rgba(${pr},${pg},${pb},0.5)`,
                          flex: 1,
                          textTransform: 'capitalize',
                        }}
                      >
                        {stage.mode} · {stage.preset}
                      </span>
                      <span
                        style={{
                          fontFamily: 'var(--font-serif)',
                          fontSize: 9,
                          color: `rgba(${pr},${pg},${pb},0.35)`,
                          flexShrink: 0,
                        }}
                      >
                        {stage.duration}s
                      </span>
                      {isActive && <span style={{ fontSize: 8, color: accent }}>▶</span>}
                    </div>
                  );
                })}
              </div>

              {/* Play / Stop */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 4 }}>
                {!journeyRunning ? (
                  <button
                    type="button"
                    onClick={() => startJourney(journeyId)}
                    style={{
                      background: accent,
                      border: 'none',
                      borderRadius: 99,
                      padding: '8px 32px',
                      color: '#000',
                      fontFamily: 'var(--font-serif)',
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '0.1em',
                      cursor: 'pointer',
                    }}
                  >
                    ▶ Start Journey
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={stopJourney}
                      style={{
                        background: accentFaint,
                        border: `1px solid ${accentMid}`,
                        borderRadius: 99,
                        padding: '8px 20px',
                        color: accent,
                        fontFamily: 'var(--font-serif)',
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                      }}
                    >
                      ◼ Stop
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const jData = JOURNEYS[journeyIdRef.current - 1];
                        if (!jData) return;
                        const next = (journeyPhaseInfo.phaseIdx + 1) % jData.stages.length;
                        skipToPhase(next);
                      }}
                      style={{
                        background: accent,
                        border: 'none',
                        borderRadius: 99,
                        padding: '8px 20px',
                        color: '#000',
                        fontFamily: 'var(--font-serif)',
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.1em',
                        cursor: 'pointer',
                      }}
                    >
                      ▶▶ Next
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={handleFullscreen}
                  style={{
                    background: accentFaint,
                    border: `1px solid ${accentMid}`,
                    borderRadius: 99,
                    padding: '8px 16px',
                    color: accent,
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  Fullscreen
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
