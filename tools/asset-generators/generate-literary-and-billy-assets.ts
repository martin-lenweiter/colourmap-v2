/* v8 ignore file -- deterministic comic asset generator verified through emitted WebP files. */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

type Palette = {
  paper: string;
  ink: string;
  wash: string;
  accent: string;
  accent2: string;
  light: string;
  shadow: string;
};

type Scene = {
  key: string;
  dir: string;
  indices: number[];
  palette: Palette;
  kind: 'literary' | 'future' | 'desert';
};

const ROOT = process.cwd();
const WIDTH = 900;
const HEIGHT = 1350;

const warmInk: Palette = {
  paper: '#e9d8b9',
  ink: '#2f2821',
  wash: '#a77c48',
  accent: '#b58243',
  accent2: '#537485',
  light: '#f2d78c',
  shadow: '#564232',
};

const jungle: Palette = {
  paper: '#e5d6b9',
  ink: '#263127',
  wash: '#7f9b70',
  accent: '#46795f',
  accent2: '#b48b4e',
  light: '#efd88e',
  shadow: '#43513a',
};

const ocean: Palette = {
  paper: '#e6d7b8',
  ink: '#24303a',
  wash: '#6f93a0',
  accent: '#365d70',
  accent2: '#b58954',
  light: '#edd589',
  shadow: '#314653',
};

const desert: Palette = {
  paper: '#dfc89b',
  ink: '#302419',
  wash: '#bd8545',
  accent: '#d5a24d',
  accent2: '#55798a',
  light: '#f1d376',
  shadow: '#704522',
};

const programs: Scene[] = [
  {
    key: 'paulo-freire',
    dir: 'public/comics/paulo-freire/generated',
    indices: range(3, 10),
    palette: jungle,
    kind: 'literary',
  },
  {
    key: 'thich-nhat-hanh',
    dir: 'public/comics/thich-nhat-hanh/generated',
    indices: range(4, 19),
    palette: jungle,
    kind: 'literary',
  },
  {
    key: 'viktor-frankl',
    dir: 'public/comics/viktor-frankl/variants/positive-overlay',
    indices: range(3, 11),
    palette: warmInk,
    kind: 'future',
  },
  {
    key: 'money-anxiety',
    dir: 'public/comics/money-anxiety/variants/positive-overlay',
    indices: range(0, 6),
    palette: warmInk,
    kind: 'future',
  },
  {
    key: 'conflict-repair',
    dir: 'public/comics/conflict-repair/variants/positive-overlay',
    indices: range(0, 6),
    palette: warmInk,
    kind: 'future',
  },
  {
    key: 'identity-becoming',
    dir: 'public/comics/identity-becoming/variants/positive-overlay',
    indices: range(0, 6),
    palette: warmInk,
    kind: 'future',
  },
  {
    key: 'parenting-patterns',
    dir: 'public/comics/parenting-patterns/variants/positive-overlay',
    indices: range(0, 6),
    palette: warmInk,
    kind: 'future',
  },
  {
    key: 'jack-london',
    dir: 'public/comics/jack-london/variants/positive-overlay',
    indices: range(0, 11),
    palette: ocean,
    kind: 'literary',
  },
  {
    key: 'jules-verne',
    dir: 'public/comics/jules-verne/variants/positive-overlay',
    indices: range(0, 11),
    palette: ocean,
    kind: 'future',
  },
  {
    key: 'billy',
    dir: 'public/entertainment/billy/quest-for-juice',
    indices: range(130, 145),
    palette: desert,
    kind: 'desert',
  },
];

function range(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, i) => from + i);
}

function noise(seed: number) {
  return `
    <filter id="paperNoise">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="${seed}" />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.15" />
      </feComponentTransfer>
    </filter>
  `;
}

function background(p: Palette, seed: number) {
  return `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${p.paper}" />
    <rect width="${WIDTH}" height="${HEIGHT}" filter="url(#paperNoise)" opacity="0.42" />
    <radialGradient id="sun" cx="${seed % 2 ? '68%' : '34%'}" cy="${seed % 3 ? '28%' : '54%'}" r="70%">
      <stop offset="0%" stop-color="${p.light}" stop-opacity="0.42"/>
      <stop offset="58%" stop-color="${p.paper}" stop-opacity="0"/>
    </radialGradient>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#sun)" />
  `;
}

function person(x: number, y: number, s: number, p: Palette, pose = 0) {
  const arm =
    pose % 2 === 0
      ? `M${x + 12 * s} ${y + 72 * s} Q${x + 74 * s} ${y + 112 * s} ${x + 118 * s} ${y + 156 * s}`
      : `M${x - 14 * s} ${y + 74 * s} Q${x - 76 * s} ${y + 118 * s} ${x - 120 * s} ${y + 168 * s}`;
  return `
    <g fill="none" stroke="${p.ink}" stroke-width="${5 * s}" stroke-linecap="round" stroke-linejoin="round" opacity="0.9">
      <circle cx="${x}" cy="${y}" r="${28 * s}" fill="${p.paper}" />
      <path d="M${x} ${y + 32 * s} C${x - 18 * s} ${y + 115 * s} ${x - 8 * s} ${y + 205 * s} ${x - 4 * s} ${y + 285 * s}" />
      <path d="${arm}" />
      <path d="M${x - 4 * s} ${y + 282 * s} Q${x - 52 * s} ${y + 382 * s} ${x - 78 * s} ${y + 474 * s}" />
      <path d="M${x - 4 * s} ${y + 282 * s} Q${x + 42 * s} ${y + 380 * s} ${x + 70 * s} ${y + 474 * s}" />
    </g>
  `;
}

function horizon(p: Palette, y = 790) {
  return `
    <path d="M0 ${y} C150 ${y - 78} 244 ${y - 36} 375 ${y - 104} C520 ${y - 178} 628 ${y - 72} 900 ${y - 146} L900 1350 L0 1350 Z" fill="${p.wash}" opacity="0.2" />
    <path d="M0 ${y + 58} C178 ${y - 10} 326 ${y + 96} 490 ${y + 18} C640 ${y - 48} 746 ${y + 28} 900 ${y - 28}" fill="none" stroke="${p.ink}" stroke-opacity="0.22" stroke-width="5" />
  `;
}

function geometry(p: Palette, cx = 450, cy = 625, r = 240) {
  const nodes = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI * 2 * i) / 10 - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${16 + (i % 3) * 4}" fill="${i % 2 ? p.accent2 : p.light}" opacity="0.72" stroke="${p.ink}" stroke-opacity="0.24" stroke-width="3"/>`;
  }).join('');
  return `
    <g fill="none" stroke="${p.accent2}" stroke-opacity="0.28" stroke-width="3">
      <circle cx="${cx}" cy="${cy}" r="${r}" />
      <circle cx="${cx}" cy="${cy}" r="${r * 0.62}" />
      <circle cx="${cx}" cy="${cy}" r="${r * 0.32}" />
      <path d="M${cx - r} ${cy} H${cx + r}" />
      <path d="M${cx} ${cy - r} V${cy + r}" />
      <path d="M${cx - r * 0.72} ${cy - r * 0.72} L${cx + r * 0.72} ${cy + r * 0.72}" />
      <path d="M${cx + r * 0.72} ${cy - r * 0.72} L${cx - r * 0.72} ${cy + r * 0.72}" />
    </g>
    <g>${nodes}</g>
  `;
}

function bookOrMap(x: number, y: number, p: Palette, wide = false) {
  const w = wide ? 390 : 250;
  const h = wide ? 190 : 300;
  return `
    <g transform="translate(${x} ${y}) rotate(-5)" fill="none" stroke="${p.ink}" stroke-width="5" stroke-linejoin="round" opacity="0.82">
      <path d="M0 0 Q${w / 2} -28 ${w} 0 L${w} ${h} Q${w / 2} ${h - 28} 0 ${h} Z" fill="${p.paper}" opacity="0.86" />
      <path d="M${w / 2} 8 V${h - 18}" stroke-opacity="0.42" />
      <path d="M42 72 C96 34 136 118 184 74 C232 36 270 102 326 56" stroke="${p.accent2}" stroke-opacity="0.55" />
      <path d="M48 ${h - 78} C120 ${h - 130} 160 ${h - 22} 232 ${h - 86} C280 ${h - 128} 318 ${h - 92} ${w - 36} ${h - 144}" stroke="${p.accent}" stroke-opacity="0.55" />
    </g>
  `;
}

function literaryScene(program: string, index: number, p: Palette) {
  if (program === 'jack-london') return jackLondon(index, p);
  if (program === 'paulo-freire') return freire(index, p);
  if (program === 'thich-nhat-hanh') return thich(index, p);
  return `${horizon(p)}${person(450, 430, 1.08, p, index)}${geometry(p, 450, 720, 205)}`;
}

function freire(index: number, p: Palette) {
  const spiral = `
    <path d="M452 660 C330 620 324 500 420 454 C548 394 682 528 606 686 C526 856 252 820 214 598 C172 350 496 238 706 430 C842 555 800 790 616 914 C402 1058 148 886 132 650" fill="none" stroke="${p.accent2}" stroke-width="9" stroke-opacity="0.46"/>
  `;
  const classroom = `
    <path d="M110 410 H790 V815 H110 Z" fill="${p.paper}" opacity="0.24" stroke="${p.ink}" stroke-opacity="0.22" stroke-width="5"/>
    <path d="M180 760 C310 690 342 694 450 760 C562 690 622 696 734 760" fill="none" stroke="${p.accent}" stroke-width="7" stroke-opacity="0.5"/>
  `;
  return `${horizon(p, 820)}${classroom}${spiral}${person(310, 600, 0.62, p, index)}${person(580, 596, 0.62, p, index + 1)}${bookOrMap(250, 940, p, true)}`;
}

function thich(index: number, p: Palette) {
  const river = `<path d="M-30 870 C130 785 254 928 416 828 C590 720 708 840 940 730 L940 1350 L-30 1350 Z" fill="${p.accent2}" opacity="0.22"/>`;
  const tree = `<g stroke="${p.ink}" stroke-width="6" stroke-linecap="round" opacity="0.72"><path d="M452 328 C430 490 448 632 432 808"/><path d="M450 430 C348 346 300 274 242 178"/><path d="M454 438 C566 330 630 270 714 190"/><path d="M438 552 C332 532 242 492 142 430"/><path d="M456 566 C604 548 702 512 818 440"/></g>`;
  const breath = Array.from(
    { length: 6 },
    (_, i) =>
      `<circle cx="${450}" cy="${570}" r="${80 + i * 46}" fill="none" stroke="${i % 2 ? p.accent2 : p.light}" stroke-width="4" stroke-opacity="${0.2 - i * 0.018}"/>`,
  ).join('');
  return `${river}${tree}${breath}${person(450, 650, 0.74, p, index)}${index % 3 === 0 ? geometry(p, 450, 615, 185) : ''}`;
}

function jackLondon(index: number, p: Palette) {
  const era = index % 12;
  if (era === 0)
    return `${horizon(p, 740)}${city(100, 400, p)}${person(340, 580, 0.78, p, 1)}${bookOrMap(430, 855, p, true)}`;
  if (era === 1) return `${sea(p)}${ship(250, 590, p)}${person(610, 560, 0.62, p, 0)}`;
  if (era === 2) return `${snow(p)}${dogTeam(p)}${person(340, 620, 0.7, p, 1)}`;
  if (era === 3) return `${snow(p)}${wolf(470, 620, 1.25, p)}${geometry(p, 455, 690, 190)}`;
  if (era === 4) return `${cabin(p)}${wolf(620, 720, 0.9, p)}${person(300, 610, 0.66, p, 0)}`;
  if (era === 5) return `${sea(p)}${ship(120, 650, p)}${person(610, 690, 0.78, p, 1)}`;
  if (era === 6)
    return `${horizon(p, 800)}${city(75, 420, p)}${person(450, 620, 0.82, p, 0)}${pathLine(p)}`;
  if (era === 7)
    return `${horizon(p, 830)}${bookOrMap(235, 370, p, true)}${person(445, 720, 0.78, p, 1)}${geometry(p, 450, 720, 210)}`;
  if (era === 8)
    return `${snow(p)}${fire(450, 820, p)}${person(380, 570, 0.72, p, 1)}${wolf(670, 710, 0.62, p)}`;
  if (era === 9)
    return `${horizon(p, 790)}${city(80, 420, p)}${ship(490, 720, p)}${person(430, 610, 0.68, p, 0)}`;
  if (era === 10)
    return `${snow(p)}${wolf(390, 620, 1.05, p)}${wolf(540, 660, 0.78, p)}${geometry(p, 455, 610, 170)}`;
  return `${horizon(p, 750)}${person(450, 500, 0.85, p, 1)}${bookOrMap(235, 835, p, true)}${pathLine(p)}`;
}

function futureScene(program: string, index: number, p: Palette) {
  if (program === 'jules-verne') return verne(index, p);
  const i = index % 7;
  if (i === 0)
    return `${horizon(p, 790)}${geometry(p, 450, 600, 245)}${person(450, 560, 0.72, p, index)}`;
  if (i === 1)
    return `${room(p)}${bookOrMap(230, 750, p, true)}${person(610, 520, 0.68, p, index)}`;
  if (i === 2)
    return `${horizon(p, 850)}${pathLine(p)}${person(450, 560, 0.76, p, index)}${fire(626, 850, p)}`;
  if (i === 3)
    return `${room(p)}${geometry(p, 450, 610, 260)}${person(250, 690, 0.56, p, index)}${person(650, 690, 0.56, p, index + 1)}`;
  if (i === 4)
    return `${horizon(p, 780)}${city(80, 430, p)}${geometry(p, 620, 520, 155)}${person(340, 620, 0.74, p, index)}`;
  if (i === 5)
    return `${room(p)}${plant(620, 840, p)}${person(390, 620, 0.74, p, index)}${pathLine(p)}`;
  return `${horizon(p, 820)}${bookOrMap(260, 420, p, true)}${geometry(p, 450, 770, 190)}`;
}

function verne(index: number, p: Palette) {
  const i = index % 12;
  if (i === 0)
    return `${sea(p)}${city(90, 400, p)}${person(470, 610, 0.74, p, 1)}${ship(590, 730, p)}`;
  if (i === 1) return `${room(p)}${geometry(p, 470, 600, 255)}${bookOrMap(160, 850, p, true)}`;
  if (i === 2) return `${horizon(p, 820)}${cavern(p)}${person(460, 640, 0.7, p, 0)}`;
  if (i === 3) return `${sea(p)}${submarine(p)}${person(460, 620, 0.58, p, 1)}`;
  if (i === 4)
    return `${horizon(p, 820)}${pathLine(p)}${ship(260, 720, p)}${person(620, 600, 0.62, p, 0)}`;
  if (i === 5) return `${sky(p)}${moonMachine(p)}${person(300, 670, 0.62, p, 1)}`;
  if (i === 6) return `${room(p)}${submarine(p)}${geometry(p, 455, 675, 180)}`;
  if (i === 7) return `${horizon(p, 780)}${bookOrMap(250, 420, p, true)}${pathLine(p)}`;
  if (i === 8) return `${room(p)}${sky(p)}${geometry(p, 455, 610, 255)}`;
  if (i === 9)
    return `${horizon(p, 800)}${person(455, 570, 0.78, p, 0)}${ship(170, 790, p)}${moonMachine(p, 580, 650, 0.58)}`;
  if (i === 10) return `${room(p)}${bookOrMap(235, 410, p, true)}${submarine(p, 430, 820, 0.52)}`;
  return `${sky(p)}${horizon(p, 870)}${person(450, 585, 0.78, p, 1)}${geometry(p, 450, 650, 235)}`;
}

function desertScene(index: number, p: Palette) {
  const i = index - 130;
  const dunes = `${horizon(p, 760)}${Array.from({ length: 5 }, (_, n) => `<path d="M-20 ${925 + n * 62} C160 ${835 + n * 40} 325 ${980 + n * 30} 520 ${870 + n * 34} C670 ${790 + n * 40} 780 ${905 + n * 35} 930 ${830 + n * 50}" fill="none" stroke="${n % 2 ? p.accent : p.shadow}" stroke-opacity="${0.14 + n * 0.025}" stroke-width="${8 - n}"/>`).join('')}`;
  if (i === 0)
    return `${dunes}${spring(p)}${person(420, 585, 0.67, p, 0)}${potato(570, 760, 0.9, p)}${lizard(240, 860, 0.8, p)}`;
  if (i === 1)
    return `${dunes}${bookOrMap(250, 420, p, true)}${train(130, 860, p)}${lizard(640, 780, 0.75, p)}`;
  if (i === 2)
    return `${dunes}${train(110, 780, p)}${person(415, 575, 0.66, p, 1)}${potato(555, 730, 0.86, p)}`;
  if (i === 3) return `${dunes}${market(p)}${lizard(300, 720, 0.9, p)}${lizard(620, 690, 0.72, p)}`;
  if (i === 4)
    return `${dunes}${spring(p, 450, 690, 1.25)}${geometry(p, 450, 650, 190)}${person(310, 640, 0.6, p, 1)}`;
  if (i === 5) return `${dunes}${potato(450, 680, 1.05, p)}${city(85, 470, p)}${pathLine(p)}`;
  if (i === 6)
    return `${dunes}${crossroads(p)}${person(315, 610, 0.68, p, 1)}${potato(610, 705, 0.92, p)}`;
  if (i === 7)
    return `${dunes}${person(450, 560, 0.78, p, 0)}${lizard(620, 900, 0.5, p)}${pathLine(p)}`;
  if (i === 8) return `${dunes}${hangar(p)}${plane(p)}${person(420, 640, 0.62, p, 1)}`;
  if (i === 9)
    return `${dunes}${plane(p, 235, 520, 0.78)}${bookOrMap(260, 815, p, true)}${geometry(p, 450, 760, 150)}`;
  if (i === 10) return `${dunes}${sandRacers(p)}${person(450, 610, 0.58, p, 0)}`;
  if (i === 11) return `${dunes}${market(p)}${person(455, 560, 0.58, p, 1)}${fire(640, 900, p)}`;
  if (i === 12) return `${dunes}${idol(p)}${person(450, 620, 0.64, p, 0)}`;
  if (i === 13)
    return `${dunes}${person(450, 590, 0.72, p, 1)}${letter(p, 520, 760)}${lizard(280, 840, 0.55, p)}`;
  if (i === 14)
    return `${dunes}${observatory(p)}${geometry(p, 450, 600, 230)}${person(450, 700, 0.54, p, 0)}`;
  return `${dunes}${person(450, 560, 0.78, p, 1)}${pathLine(p)}${sky(p)}`;
}

function room(p: Palette) {
  return `<path d="M90 310 H810 V960 H90 Z" fill="${p.paper}" opacity="0.28" stroke="${p.ink}" stroke-opacity="0.2" stroke-width="6"/><path d="M158 875 H746" stroke="${p.ink}" stroke-opacity="0.22" stroke-width="6"/><path d="M165 330 V870 M735 330 V870" stroke="${p.ink}" stroke-opacity="0.12" stroke-width="4"/>`;
}

function city(x: number, y: number, p: Palette) {
  return `<g fill="${p.shadow}" opacity="0.3" stroke="${p.ink}" stroke-opacity="0.2">${Array.from({ length: 9 }, (_, i) => `<rect x="${x + i * 72}" y="${y + 180 - ((i * 53) % 150)}" width="${46 + (i % 3) * 18}" height="${230 + ((i * 41) % 180)}" rx="5"/>`).join('')}</g>`;
}

function sea(p: Palette) {
  return `<path d="M0 770 C160 720 290 830 440 780 C590 730 710 815 900 760 L900 1350 L0 1350 Z" fill="${p.accent2}" opacity="0.26"/><path d="M70 850 C210 810 340 902 500 842 C652 790 720 880 860 840" fill="none" stroke="${p.ink}" stroke-opacity="0.18" stroke-width="7"/>`;
}

function ship(x: number, y: number, p: Palette) {
  return `<g transform="translate(${x} ${y})" fill="none" stroke="${p.ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.78"><path d="M0 155 H280 L230 210 H42 Z" fill="${p.shadow}" opacity="0.28"/><path d="M126 150 V0"/><path d="M134 18 L246 136 H134 Z" fill="${p.light}" opacity="0.42"/><path d="M118 28 L26 142 H118 Z" fill="${p.paper}" opacity="0.58"/></g>`;
}

function snow(p: Palette) {
  return `<rect width="${WIDTH}" height="${HEIGHT}" fill="#e8dfc9" opacity="0.42"/><path d="M0 810 C160 670 260 780 390 650 C540 505 720 660 900 540 L900 1350 L0 1350 Z" fill="${p.accent2}" opacity="0.16"/><path d="M0 970 C210 890 332 980 520 900 C690 830 760 910 900 870" fill="none" stroke="${p.ink}" stroke-opacity="0.16" stroke-width="7"/>`;
}

function dogTeam(p: Palette) {
  return `<g stroke="${p.ink}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.75">${[0, 1, 2].map((n) => `<path d="M${420 + n * 92} 820 q32 -64 78 0 q-26 34 -78 0 M${434 + n * 92} 820 l-24 45 M${484 + n * 92} 820 l22 45"/>`).join('')}<path d="M210 890 H420 M210 890 l-65 40"/></g>`;
}

function wolf(x: number, y: number, s: number, p: Palette) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${p.ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.86"><path d="M-150 80 C-72 -42 66 -52 144 72 C72 118 -68 126 -150 80 Z" fill="${p.paper}" opacity="0.44"/><path d="M54 -12 L132 -90 L110 18"/><path d="M-70 8 L-138 -78 L-112 34"/><circle cx="42" cy="34" r="8" fill="${p.ink}"/><path d="M-20 66 C10 88 42 88 78 64"/></g>`;
}

function cabin(p: Palette) {
  return `<path d="M160 650 L450 430 L742 650 V930 H160 Z" fill="${p.shadow}" opacity="0.18" stroke="${p.ink}" stroke-opacity="0.35" stroke-width="7"/><path d="M210 690 H700 M210 750 H700 M210 810 H700" stroke="${p.ink}" stroke-opacity="0.22" stroke-width="5"/>`;
}

function fire(x: number, y: number, p: Palette) {
  return `<g transform="translate(${x} ${y})" opacity="0.86"><path d="M0 -118 C74 -58 52 28 0 70 C-62 20 -56 -52 0 -118 Z" fill="${p.light}" opacity="0.72"/><path d="M-42 -34 C2 -78 48 -34 38 38 C0 70 -42 36 -42 -34 Z" fill="${p.accent}" opacity="0.58"/></g>`;
}

function pathLine(p: Palette) {
  return `<path d="M450 1320 C420 1080 510 980 438 822 C370 674 430 560 560 420" fill="none" stroke="${p.accent}" stroke-width="11" stroke-opacity="0.42" stroke-linecap="round" stroke-dasharray="34 28"/>`;
}

function sky(p: Palette) {
  return `<circle cx="690" cy="260" r="95" fill="${p.light}" opacity="0.72"/><path d="M130 330 C290 260 392 370 552 302 C662 255 746 315 834 276" fill="none" stroke="${p.accent2}" stroke-opacity="0.24" stroke-width="5"/>`;
}

function moonMachine(p: Palette, x = 430, y = 580, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${p.ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"><circle cx="0" cy="0" r="116" fill="${p.paper}" opacity="0.34"/><path d="M-80 88 L0 -132 L80 88 Z" fill="${p.light}" opacity="0.42"/><path d="M-110 126 H110"/></g>`;
}

function submarine(p: Palette, x = 260, y = 680, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${p.ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.82"><path d="M0 110 C100 8 330 4 470 116 C332 210 98 208 0 110 Z" fill="${p.accent2}" opacity="0.3"/><circle cx="172" cy="112" r="34" fill="${p.light}" opacity="0.56"/><circle cx="278" cy="112" r="34" fill="${p.light}" opacity="0.46"/><path d="M245 40 V-58 H320 V46"/></g>`;
}

function cavern(p: Palette) {
  return `<path d="M80 310 C210 170 348 245 450 120 C570 260 720 180 830 350 L780 1020 H120 Z" fill="${p.shadow}" opacity="0.18"/><path d="M214 900 C310 700 380 620 450 430 C510 640 650 720 720 900" fill="none" stroke="${p.accent}" stroke-opacity="0.46" stroke-width="9"/>`;
}

function plant(x: number, y: number, p: Palette) {
  return `<g transform="translate(${x} ${y})" stroke="${p.ink}" stroke-width="5" fill="none" stroke-linecap="round" opacity="0.7"><path d="M0 120 C-8 50 8 -15 0 -90"/><path d="M0 20 C-85 -50 -128 -10 -98 42 C-44 58 -18 42 0 20"/><path d="M0 -28 C85 -96 128 -52 98 -2 C44 16 18 -2 0 -28"/></g>`;
}

function spring(p: Palette, x = 450, y = 805, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" opacity="0.88"><ellipse cx="0" cy="0" rx="175" ry="70" fill="${p.accent2}" opacity="0.24" stroke="${p.ink}" stroke-opacity="0.22" stroke-width="5"/><circle cx="0" cy="-8" r="28" fill="${p.light}" opacity="0.84"/><path d="M-115 18 C-40 -30 42 -30 118 18" fill="none" stroke="${p.light}" stroke-width="8" stroke-opacity="0.5"/></g>`;
}

function potato(x: number, y: number, s: number, p: Palette) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${p.ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" opacity="0.86"><path d="M-70 -90 C52 -150 118 -34 82 92 C50 190 -94 180 -122 62 C-146 -34 -116 -68 -70 -90 Z" fill="${p.light}" opacity="0.42"/><circle cx="-34" cy="-8" r="8" fill="${p.ink}"/><circle cx="42" cy="-12" r="8" fill="${p.ink}"/><path d="M-28 58 C10 84 42 72 62 48"/></g>`;
}

function lizard(x: number, y: number, s: number, p: Palette) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${p.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.78"><path d="M-90 35 C-10 -50 90 -40 128 38 C54 82 -26 88 -90 35 Z" fill="${p.accent2}" opacity="0.25"/><path d="M-90 35 C-160 20 -190 -16 -220 -48"/><circle cx="58" cy="8" r="7" fill="${p.ink}"/><path d="M-18 70 l-32 42 M34 72 l34 42"/></g>`;
}

function train(x: number, y: number, p: Palette) {
  return `<g transform="translate(${x} ${y})" fill="none" stroke="${p.ink}" stroke-width="7" stroke-linejoin="round" opacity="0.78"><path d="M0 60 H580 V180 H0 Z" fill="${p.shadow}" opacity="0.22"/><path d="M90 20 H240 V60 H90 Z"/><circle cx="110" cy="190" r="28"/><circle cx="250" cy="190" r="28"/><circle cx="420" cy="190" r="28"/><path d="M-40 220 H650"/></g>`;
}

function market(p: Palette) {
  return `<g stroke="${p.ink}" stroke-width="6" fill="none" stroke-linejoin="round" opacity="0.74">${[0, 1, 2].map((i) => `<path d="M${120 + i * 230} 570 L${210 + i * 230} 435 L${300 + i * 230} 570 V900 H${120 + i * 230} Z" fill="${i % 2 ? p.accent2 : p.accent}" opacity="0.18"/>`).join('')}</g>`;
}

function crossroads(p: Palette) {
  return `<path d="M450 1320 C438 1080 410 920 340 760 C270 600 210 520 120 430" fill="none" stroke="${p.accent}" stroke-width="10" stroke-opacity="0.46"/><path d="M450 1320 C462 1080 510 900 590 735 C680 550 760 480 830 400" fill="none" stroke="${p.accent2}" stroke-width="10" stroke-opacity="0.46"/>`;
}

function hangar(p: Palette) {
  return `<path d="M110 590 C235 390 650 390 790 590 V920 H110 Z" fill="${p.shadow}" opacity="0.18" stroke="${p.ink}" stroke-opacity="0.3" stroke-width="7"/><path d="M175 918 C300 790 610 790 735 918" fill="none" stroke="${p.ink}" stroke-opacity="0.16" stroke-width="6"/>`;
}

function plane(p: Palette, x = 180, y = 690, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${p.ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.78"><path d="M0 90 H420 L500 130 L420 170 H0 Q-44 130 0 90 Z" fill="${p.paper}" opacity="0.42"/><path d="M176 90 L270 -20 H350 L300 90"/><path d="M176 170 L270 280 H350 L300 170"/><circle cx="60" cy="130" r="38"/></g>`;
}

function sandRacers(p: Palette) {
  return `<g fill="none" stroke="${p.ink}" stroke-width="6" stroke-linecap="round" opacity="0.78">${[0, 1, 2].map((i) => `<path d="M${110 + i * 210} ${880 - i * 70} C${210 + i * 190} ${785 - i * 45} ${270 + i * 150} ${845 - i * 45} ${360 + i * 160} ${755 - i * 60}" stroke="${i % 2 ? p.accent2 : p.accent}" stroke-opacity="0.46"/><circle cx="${220 + i * 190}" cy="${890 - i * 70}" r="28"/><circle cx="${300 + i * 190}" cy="${880 - i * 70}" r="28"/>`).join('')}</g>`;
}

function idol(p: Palette) {
  return `<g transform="translate(450 645)" fill="none" stroke="${p.ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.82"><path d="M0 -210 C110 -110 122 40 0 180 C-122 40 -110 -110 0 -210 Z" fill="${p.light}" opacity="0.32"/><path d="M-84 -20 C-24 -78 24 -78 84 -20"/><circle cx="-36" cy="-20" r="10" fill="${p.ink}"/><circle cx="36" cy="-20" r="10" fill="${p.ink}"/><path d="M-44 70 C0 100 44 70 62 40"/></g>`;
}

function letter(p: Palette, x: number, y: number) {
  return `<g transform="translate(${x} ${y}) rotate(-11)" fill="${p.paper}" stroke="${p.ink}" stroke-width="5" stroke-linejoin="round" opacity="0.86"><path d="M0 0 H190 V122 H0 Z"/><path d="M0 0 L95 70 L190 0"/><path d="M0 122 L74 58 M190 122 L116 58"/></g>`;
}

function observatory(p: Palette) {
  return `<g fill="none" stroke="${p.ink}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity="0.78"><path d="M220 940 C290 760 610 760 680 940 Z" fill="${p.shadow}" opacity="0.18"/><circle cx="450" cy="650" r="120" fill="${p.paper}" opacity="0.22"/><path d="M450 650 L710 430"/><path d="M405 760 L330 970 M495 760 L570 970"/></g>`;
}

async function render(scene: Scene, index: number) {
  const p = scene.palette;
  const seed = Math.abs(
    [...scene.key].reduce((sum, char) => sum + char.charCodeAt(0), 0) + index * 17,
  );
  const body =
    scene.kind === 'desert'
      ? desertScene(index, p)
      : scene.kind === 'literary'
        ? literaryScene(scene.key, index, p)
        : futureScene(scene.key, index, p);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <defs>${noise(seed)}</defs>
      ${background(p, seed)}
      ${body}
      <rect width="${WIDTH}" height="${HEIGHT}" fill="none" />
    </svg>
  `;
  const outDir = path.join(ROOT, scene.dir);
  await mkdir(outDir, { recursive: true });
  await sharp(Buffer.from(svg))
    .webp({ quality: scene.kind === 'desert' ? 76 : 72, effort: 6 })
    .toFile(path.join(outDir, `panel-${index}.webp`));
}

async function main() {
  for (const scene of programs) {
    for (const index of scene.indices) {
      await render(scene, index);
    }
  }
}

await main();
