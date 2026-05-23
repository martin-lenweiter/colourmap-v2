/* v8 ignore file -- deterministic asset generator verified by generated WebP outputs. */
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

type ProgramKey = 'economic-systems' | 'planetary-ecology' | 'future-transitions';

type Palette = {
  paper: string;
  ink: string;
  wash: string;
  accent: string;
  accent2: string;
  light: string;
  shadow: string;
};

const ROOT = process.cwd();
const WIDTH = 900;
const HEIGHT = 1350;

const programs: Record<ProgramKey, Palette> = {
  'economic-systems': {
    paper: '#e8d7b4',
    ink: '#31271e',
    wash: '#b99055',
    accent: '#7b4f34',
    accent2: '#3e6680',
    light: '#f2d993',
    shadow: '#59402b',
  },
  'planetary-ecology': {
    paper: '#e5daba',
    ink: '#243023',
    wash: '#819964',
    accent: '#3f765d',
    accent2: '#7a9fb1',
    light: '#f0d58c',
    shadow: '#3d5238',
  },
  'future-transitions': {
    paper: '#e7d8b9',
    ink: '#24303a',
    wash: '#6d95a8',
    accent: '#d5a85d',
    accent2: '#6e8f74',
    light: '#f1da93',
    shadow: '#385164',
  },
};

function noise(seed: number) {
  return `
    <filter id="paperNoise">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="3" seed="${seed}" />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.18" />
      </feComponentTransfer>
    </filter>
  `;
}

function background(p: Palette, index: number) {
  return `
    <rect width="${WIDTH}" height="${HEIGHT}" fill="${p.paper}" />
    <rect width="${WIDTH}" height="${HEIGHT}" filter="url(#paperNoise)" opacity="0.42" />
    <radialGradient id="glow" cx="${index % 2 ? '68%' : '38%'}" cy="${index % 3 ? '34%' : '58%'}" r="66%">
      <stop offset="0%" stop-color="${p.light}" stop-opacity="0.34"/>
      <stop offset="55%" stop-color="${p.paper}" stop-opacity="0"/>
    </radialGradient>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)" />
  `;
}

function figure(x: number, y: number, scale: number, p: Palette, pose = 0) {
  const arm =
    pose % 2
      ? `M${x - 24 * scale} ${y + 88 * scale} Q${x - 76 * scale} ${y + 128 * scale} ${x - 108 * scale} ${y + 184 * scale}`
      : `M${x + 24 * scale} ${y + 88 * scale} Q${x + 82 * scale} ${y + 116 * scale} ${x + 120 * scale} ${y + 168 * scale}`;
  return `
    <g fill="none" stroke="${p.ink}" stroke-width="${5 * scale}" stroke-linecap="round" stroke-linejoin="round" opacity="0.9">
      <circle cx="${x}" cy="${y}" r="${30 * scale}" fill="${p.paper}" />
      <path d="M${x} ${y + 34 * scale} C${x - 18 * scale} ${y + 110 * scale} ${x - 14 * scale} ${y + 185 * scale} ${x - 6 * scale} ${y + 270 * scale}" />
      <path d="${arm}" />
      <path d="M${x - 4 * scale} ${y + 270 * scale} Q${x - 50 * scale} ${y + 370 * scale} ${x - 74 * scale} ${y + 465 * scale}" />
      <path d="M${x - 4 * scale} ${y + 270 * scale} Q${x + 42 * scale} ${y + 368 * scale} ${x + 64 * scale} ${y + 462 * scale}" />
    </g>
  `;
}

function grid(p: Palette, index: number) {
  const lines = Array.from({ length: 9 }, (_, i) => {
    const x = 100 + i * 88;
    const y = 172 + i * 86;
    return `
      <path d="M${x} 210 L${x + (index % 3) * 20} 1170" stroke="${p.ink}" stroke-opacity="0.12" stroke-width="2"/>
      <path d="M96 ${y} L805 ${y + (index % 4) * 12}" stroke="${p.ink}" stroke-opacity="0.1" stroke-width="2"/>
    `;
  }).join('');
  return `<g>${lines}</g>`;
}

function nodes(p: Palette, index: number, count = 12) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (Math.PI * 2 * i) / count + index * 0.17;
    const radius = 160 + ((i + index) % 4) * 46;
    const x = 450 + Math.cos(angle) * radius;
    const y = 650 + Math.sin(angle) * radius;
    const fill = i % 3 === 0 ? p.accent : i % 3 === 1 ? p.accent2 : p.light;
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${18 + (i % 3) * 6}" fill="${fill}" opacity="0.74" stroke="${p.ink}" stroke-opacity="0.34" stroke-width="3"/>`;
  }).join('');
}

function economicScene(index: number, p: Palette) {
  const era = Math.floor(index / 8);
  if (era === 4) {
    const local = index - 32;
    if (local === 0) {
      return `
        ${grid(p, index)}
        <g fill="none" stroke="${p.ink}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.78">
          <path d="M232 706 C310 590 404 578 450 454 C504 590 592 600 670 706 C566 745 338 745 232 706 Z" fill="${p.paper}" opacity="0.34"/>
          <path d="M450 454 L450 812"/>
          <path d="M450 812 L308 1052 M450 812 L592 1052"/>
          <path d="M308 1052 C402 1002 498 1002 592 1052"/>
          <path d="M296 654 C188 584 154 498 118 408"/>
          <path d="M604 654 C714 584 744 498 788 408"/>
        </g>
        <g fill="${p.light}" opacity="0.68">
          <circle cx="116" cy="408" r="28"/>
          <circle cx="788" cy="408" r="28"/>
          <circle cx="308" cy="1052" r="22"/>
          <circle cx="592" cy="1052" r="22"/>
        </g>
      `;
    }
    if (local === 1) {
      return `
        <path d="M130 1010 C250 840 350 890 448 700 C562 480 680 470 794 330" fill="none" stroke="${p.accent2}" stroke-width="18" opacity="0.46"/>
        <path d="M140 1030 C250 960 360 1040 450 952 C564 840 660 910 792 800" fill="none" stroke="${p.accent}" stroke-width="20" opacity="0.32"/>
        ${nodes(p, index, 18)}
        ${figure(450, 780, 0.72, p, index)}
      `;
    }
    if (local === 2) {
      return `
        <rect x="155" y="340" width="590" height="690" rx="38" fill="${p.shadow}" opacity="0.13"/>
        <path d="M230 904 C338 800 368 650 450 548 C536 658 570 802 680 904" fill="none" stroke="${p.ink}" stroke-width="8" stroke-opacity="0.48"/>
        <path d="M222 938 H690" stroke="${p.ink}" stroke-width="8" stroke-opacity="0.4"/>
        <g fill="${p.accent}" opacity="0.44">
          <circle cx="290" cy="480" r="56"/>
          <circle cx="610" cy="480" r="56"/>
          <circle cx="450" cy="840" r="68"/>
        </g>
        <path d="M290 480 C360 590 534 592 610 480" fill="none" stroke="${p.accent2}" stroke-width="11" opacity="0.52"/>
      `;
    }
    if (local === 3) {
      return `
        <g fill="none" stroke="${p.ink}" stroke-linecap="round" opacity="0.74">
          <circle cx="450" cy="610" r="220" stroke-width="7"/>
          <path d="M450 390 V830 M230 610 H670" stroke-width="6" stroke-opacity="0.44"/>
          <path d="M270 950 C356 870 538 870 628 950" stroke-width="9"/>
          <path d="M312 960 L252 1088 M588 960 L648 1088" stroke-width="7"/>
        </g>
        <g fill="${p.light}" opacity="0.72">
          <circle cx="450" cy="610" r="52"/>
          <circle cx="270" cy="950" r="30"/>
          <circle cx="628" cy="950" r="30"/>
        </g>
        ${nodes(p, index, 12)}
      `;
    }
    if (local === 4) {
      return `
        <path d="M110 870 C250 760 330 802 450 680 C582 548 660 610 800 486" fill="none" stroke="${p.accent2}" stroke-width="16" opacity="0.48"/>
        <g fill="${p.shadow}" opacity="0.26">
          <rect x="120" y="700" width="90" height="210" rx="14"/>
          <rect x="290" y="610" width="110" height="300" rx="16"/>
          <rect x="510" y="560" width="100" height="350" rx="16"/>
          <rect x="690" y="650" width="80" height="260" rx="14"/>
        </g>
        <g fill="none" stroke="${p.ink}" stroke-width="4" opacity="0.5">
          ${Array.from({ length: 8 }, (_, i) => `<path d="M${120 + i * 86} 1000 C${150 + i * 70} 900 ${210 + i * 58} 870 ${260 + i * 54} 780"/>`).join('')}
        </g>
        ${figure(450, 850, 0.6, p, index)}
      `;
    }
    if (local === 5) {
      return `
        <g fill="none" stroke="${p.ink}" stroke-width="5" opacity="0.58">
          <circle cx="450" cy="650" r="310"/>
          <circle cx="450" cy="650" r="210"/>
          <circle cx="450" cy="650" r="110"/>
        </g>
        <path d="M190 840 C290 700 350 730 450 612 C560 490 620 540 720 400" fill="none" stroke="${p.accent}" stroke-width="15" opacity="0.5"/>
        ${nodes(p, index, 22)}
        <circle cx="450" cy="650" r="62" fill="${p.light}" opacity="0.78"/>
      `;
    }
    if (local === 6) {
      return `
        <g fill="none" stroke="${p.ink}" stroke-width="5" opacity="0.52">
          <rect x="168" y="348" width="220" height="180" rx="24"/>
          <rect x="512" y="348" width="220" height="180" rx="24"/>
          <rect x="168" y="742" width="220" height="180" rx="24"/>
          <rect x="512" y="742" width="220" height="180" rx="24"/>
          <path d="M388 438 H512 M278 528 V742 M622 528 V742 M388 832 H512"/>
        </g>
        <g fill="${p.accent2}" opacity="0.38">
          <circle cx="278" cy="438" r="54"/>
          <circle cx="622" cy="438" r="54"/>
          <circle cx="278" cy="832" r="54"/>
          <circle cx="622" cy="832" r="54"/>
        </g>
      `;
    }
    return `
      <path d="M450 1095 C380 925 390 740 450 520 C510 740 520 925 450 1095" fill="${p.accent}" opacity="0.24" stroke="${p.ink}" stroke-opacity="0.28" stroke-width="7"/>
      <path d="M450 760 C320 700 230 650 120 530 M450 720 C575 660 690 590 800 430 M450 900 C318 960 240 1040 150 1160 M450 900 C588 960 680 1040 760 1160" fill="none" stroke="${p.ink}" stroke-width="8" stroke-opacity="0.42"/>
      ${nodes(p, index, 18)}
      ${figure(450, 760, 0.62, p, index)}
    `;
  }
  if (era === 0) {
    return `
      ${grid(p, index)}
      <path d="M110 890 C230 760 340 780 450 650 C555 525 682 536 790 420" fill="none" stroke="${p.accent2}" stroke-width="10" opacity="0.48"/>
      <g fill="${p.wash}" opacity="0.46">
        <rect x="110" y="755" width="145" height="112" rx="18"/>
        <rect x="340" y="600" width="150" height="118" rx="16"/>
        <rect x="596" y="430" width="156" height="122" rx="18"/>
      </g>
      <g stroke="${p.ink}" stroke-width="5" fill="none" opacity="0.85">
        <path d="M150 752 V620 M150 620 L225 752 M160 690 H210"/>
        <path d="M382 590 C402 520 468 520 488 590"/>
        <path d="M632 424 L672 350 L714 424"/>
      </g>
      ${figure(450, 825, 0.75, p, index)}
    `;
  }
  if (era === 1) {
    return `
      <path d="M70 940 C240 840 390 960 560 820 C680 720 770 780 850 690 L850 1350 L70 1350 Z" fill="${p.wash}" opacity="0.33"/>
      <g fill="none" stroke="${p.ink}" stroke-linecap="round" stroke-linejoin="round">
        <path d="M130 785 C260 710 356 730 438 792 C530 866 654 840 748 778" stroke-width="7" opacity="0.74"/>
        <path d="M256 710 L256 506 L385 654 L256 654" stroke-width="5"/>
        <path d="M515 820 L515 574 L680 740 L515 740" stroke-width="5"/>
      </g>
      <circle cx="685" cy="330" r="92" fill="${p.light}" opacity="0.58"/>
      <path d="M190 1030 C312 935 552 937 704 1042" stroke="${p.accent}" stroke-width="18" stroke-opacity="0.38" fill="none"/>
      ${nodes(p, index, 10)}
    `;
  }
  if (era === 2) {
    return `
      <rect x="110" y="468" width="680" height="420" rx="44" fill="${p.shadow}" opacity="0.15"/>
      <g fill="${p.shadow}" opacity="0.35">
        <rect x="152" y="650" width="100" height="238"/>
        <rect x="316" y="570" width="120" height="318"/>
        <rect x="506" y="610" width="104" height="278"/>
        <rect x="666" y="540" width="76" height="348"/>
      </g>
      <g fill="none" stroke="${p.ink}" stroke-width="5" opacity="0.68">
        <path d="M130 922 H790"/>
        <path d="M190 650 C182 548 196 470 172 390"/>
        <path d="M560 610 C540 482 590 430 548 316"/>
        <path d="M180 390 C252 358 318 400 380 360"/>
        <path d="M548 316 C642 292 706 338 780 300"/>
      </g>
      <path d="M145 1080 C280 990 410 1080 520 1000 C618 930 704 978 790 902" fill="none" stroke="${p.accent2}" stroke-width="12" opacity="0.55"/>
      ${figure(300, 870, 0.6, p, index)}
      ${figure(600, 855, 0.62, p, index + 1)}
    `;
  }
  return `
    <path d="M106 1002 C222 770 350 706 445 626 C564 524 660 404 780 214" fill="none" stroke="${p.accent2}" stroke-width="16" opacity="0.44"/>
    <path d="M112 1010 C310 990 530 900 782 1028" fill="none" stroke="${p.accent}" stroke-width="18" opacity="0.35"/>
    <g fill="none" stroke="${p.ink}" stroke-width="4" opacity="0.54">
      <circle cx="450" cy="640" r="280"/>
      <circle cx="450" cy="640" r="190"/>
      <path d="M170 640 H730 M450 360 V920 M256 446 L644 834 M644 446 L256 834"/>
    </g>
    ${nodes(p, index, 15)}
    <circle cx="450" cy="640" r="54" fill="${p.light}" opacity="0.8"/>
    ${figure(448, 832, 0.72, p, index)}
  `;
}

function ecologyScene(index: number, p: Palette) {
  const era = Math.floor(index / 8);
  if (era === 4) {
    const local = index - 32;
    if (local === 0) {
      return `
        <path d="M450 980 C382 830 392 700 450 560 C508 700 518 830 450 980" fill="${p.accent2}" opacity="0.28" stroke="${p.ink}" stroke-opacity="0.28" stroke-width="7"/>
        <path d="M450 560 C650 480 746 360 810 220" fill="none" stroke="${p.accent}" stroke-width="18" opacity="0.4"/>
        <path d="M450 980 C390 1090 300 1160 210 1220 M450 980 C540 1090 630 1160 720 1220" fill="none" stroke="${p.ink}" stroke-width="8" stroke-opacity="0.4"/>
        ${nodes(p, index, 14)}
      `;
    }
    if (local === 1) {
      return `
        <path d="M70 900 C250 760 355 860 450 720 C560 560 690 640 835 480 L835 1350 L70 1350 Z" fill="${p.accent2}" opacity="0.22"/>
        <g fill="none" stroke="${p.ink}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" opacity="0.62">
          <path d="M168 760 C306 810 400 790 512 706 C612 632 708 630 792 668"/>
          <path d="M205 742 L236 850 M330 774 L360 890 M488 720 L524 842 M650 658 L688 784"/>
        </g>
        <g fill="${p.accent}" opacity="0.36">
          <ellipse cx="350" cy="850" rx="190" ry="70"/>
          <ellipse cx="610" cy="770" rx="170" ry="58"/>
        </g>
      `;
    }
    if (local === 2) {
      return `
        <path d="M0 840 C160 760 260 860 420 780 C600 690 710 790 900 700 L900 1350 L0 1350 Z" fill="${p.accent2}" opacity="0.24"/>
        <g fill="none" stroke="${p.ink}" stroke-width="8" stroke-linecap="round" opacity="0.58">
          ${Array.from({ length: 9 }, (_, i) => {
            const x = 150 + i * 76;
            return `<path d="M${x} 990 C${x - 38} 820 ${x + 30} 690 ${x - 10} 540"/><path d="M${x} 840 C${x - 56} 800 ${x - 90} 742 ${x - 120} 672"/><path d="M${x} 860 C${x + 52} 812 ${x + 88} 752 ${x + 130} 680"/>`;
          }).join('')}
        </g>
        ${nodes(p, index, 10)}
      `;
    }
    if (local === 3) {
      return `
        <path d="M450 1010 C418 830 420 630 450 360" stroke="${p.shadow}" stroke-width="24" stroke-linecap="round" fill="none" opacity="0.5"/>
        <g fill="none" stroke="${p.accent}" stroke-width="6" stroke-linecap="round" opacity="0.52">
          ${Array.from({ length: 16 }, (_, i) => {
            const y = 520 + i * 34;
            const amp = 120 + (i % 4) * 38;
            return `<path d="M450 ${y} C${450 - amp} ${y - 60} ${450 - amp} ${y + 60} ${450} ${y + 4} C${450 + amp} ${y - 60} ${450 + amp} ${y + 60} ${450} ${y + 8}"/>`;
          }).join('')}
        </g>
        ${nodes(p, index, 18)}
      `;
    }
    if (local === 4) {
      return `
        <circle cx="450" cy="620" r="305" fill="${p.accent2}" opacity="0.22"/>
        <g fill="none" stroke="${p.ink}" stroke-width="6" opacity="0.52">
          ${Array.from({ length: 13 }, (_, i) => `<path d="M${160 + (i % 5) * 135} ${500 + Math.floor(i / 5) * 125} q52 -70 104 0 q-52 76 -104 0"/>`).join('')}
        </g>
        <g fill="${p.light}" opacity="0.62">
          <circle cx="450" cy="620" r="58"/>
          <circle cx="338" cy="520" r="28"/>
          <circle cx="565" cy="720" r="24"/>
        </g>
        ${figure(450, 900, 0.54, p, index)}
      `;
    }
    if (local === 5) {
      return `
        <path d="M450 1040 C360 800 390 560 450 310 C510 560 540 800 450 1040" fill="${p.light}" opacity="0.34" stroke="${p.ink}" stroke-opacity="0.26" stroke-width="7"/>
        <path d="M450 310 C346 480 344 620 450 780 C556 620 554 480 450 310" fill="none" stroke="${p.accent2}" stroke-width="11" opacity="0.42"/>
        <g fill="${p.accent}" opacity="0.38">
          <circle cx="320" cy="800" r="50"/>
          <circle cx="580" cy="800" r="50"/>
          <circle cx="450" cy="1010" r="42"/>
        </g>
      `;
    }
    if (local === 6) {
      return `
        <g fill="none" stroke="${p.ink}" stroke-width="5" opacity="0.52">
          <circle cx="450" cy="650" r="315"/>
          <path d="M135 650 H765 M450 335 V965"/>
          <path d="M230 890 C330 760 390 800 450 650 C520 480 606 520 720 386" stroke="${p.accent}" stroke-width="15" stroke-opacity="0.5"/>
        </g>
        <g fill="${p.accent2}" opacity="0.38">
          <circle cx="260" cy="790" r="62"/>
          <circle cx="450" cy="650" r="70"/>
          <circle cx="640" cy="510" r="62"/>
        </g>
        ${nodes(p, index, 16)}
      `;
    }
    return `
      <path d="M120 960 C260 805 352 850 450 675 C552 500 642 550 780 365" fill="none" stroke="${p.light}" stroke-width="26" opacity="0.6"/>
      <path d="M160 1050 C280 960 390 1030 520 930 C640 840 720 890 820 800" fill="none" stroke="${p.accent}" stroke-width="20" opacity="0.36"/>
      <g fill="${p.accent2}" opacity="0.32">
        <circle cx="220" cy="850" r="64"/>
        <circle cx="372" cy="742" r="48"/>
        <circle cx="570" cy="574" r="56"/>
        <circle cx="720" cy="415" r="64"/>
      </g>
      ${figure(450, 820, 0.64, p, index)}
    `;
  }
  if (era === 0) {
    return `
      <path d="M450 1030 C420 850 420 650 450 410" stroke="${p.shadow}" stroke-width="28" stroke-linecap="round" fill="none" opacity="0.58"/>
      <path d="M450 700 C320 620 220 540 130 400 M450 650 C590 560 710 500 806 360 M450 840 C310 860 210 930 108 1060 M450 870 C586 846 700 930 812 1060" stroke="${p.shadow}" stroke-width="14" stroke-linecap="round" fill="none" opacity="0.5"/>
      <g fill="${p.accent}" opacity="0.38">
        <ellipse cx="260" cy="390" rx="118" ry="52" transform="rotate(-25 260 390)"/>
        <ellipse cx="640" cy="350" rx="132" ry="54" transform="rotate(-18 640 350)"/>
        <ellipse cx="260" cy="990" rx="130" ry="58" transform="rotate(-12 260 990)"/>
        <ellipse cx="662" cy="982" rx="128" ry="55" transform="rotate(16 662 982)"/>
      </g>
      ${nodes(p, index, 14)}
    `;
  }
  if (era === 1) {
    return `
      <circle cx="450" cy="548" r="278" fill="${p.accent2}" opacity="0.24"/>
      <path d="M140 940 C288 820 346 960 458 820 C594 650 680 810 790 640" stroke="${p.accent2}" stroke-width="18" fill="none" opacity="0.62"/>
      <path d="M120 1040 C250 960 390 1035 530 950 C640 880 720 906 818 850" stroke="${p.accent}" stroke-width="20" fill="none" opacity="0.42"/>
      <g fill="${p.shadow}" opacity="0.28">
        <path d="M170 430 Q240 286 312 430 Q240 374 170 430"/>
        <path d="M600 450 Q690 288 765 450 Q680 392 600 450"/>
        <path d="M390 320 Q462 178 528 320 Q460 268 390 320"/>
      </g>
      ${figure(450, 780, 0.67, p, index)}
    `;
  }
  if (era === 2) {
    return `
      <g fill="none" stroke="${p.ink}" opacity="0.45">
        <circle cx="450" cy="640" r="330" stroke-width="5"/>
        <circle cx="450" cy="640" r="238" stroke-width="4"/>
        <circle cx="450" cy="640" r="136" stroke-width="4"/>
      </g>
      <path d="M150 930 C276 770 384 800 450 638 C516 480 646 450 770 330" stroke="${p.accent}" stroke-width="18" fill="none" opacity="0.5"/>
      <path d="M160 360 C250 500 334 506 450 638 C574 778 662 842 790 1010" stroke="${p.accent2}" stroke-width="14" fill="none" opacity="0.46"/>
      ${nodes(p, index, 20)}
      <circle cx="450" cy="640" r="70" fill="${p.light}" opacity="0.74"/>
    `;
  }
  return `
    <path d="M94 1060 C232 860 360 850 450 684 C548 504 664 460 806 280" stroke="${p.light}" stroke-width="26" fill="none" opacity="0.62"/>
    <path d="M92 1098 C250 1004 382 1054 520 950 C652 852 736 900 820 790" stroke="${p.accent}" stroke-width="22" fill="none" opacity="0.36"/>
    <g fill="${p.accent2}" opacity="0.34">
      <circle cx="190" cy="930" r="70"/>
      <circle cx="320" cy="830" r="55"/>
      <circle cx="580" cy="610" r="62"/>
      <circle cx="718" cy="444" r="72"/>
    </g>
    <g stroke="${p.ink}" stroke-width="5" fill="none" opacity="0.62">
      <path d="M230 990 C260 890 310 850 382 806"/>
      <path d="M640 720 C610 624 632 540 712 460"/>
      <path d="M450 1110 C470 1000 510 910 610 842"/>
    </g>
    ${figure(454, 790, 0.68, p, index)}
  `;
}

function futureScene(index: number, p: Palette) {
  const era = Math.floor(index / 8);
  if (era === 0) {
    return `
      <g fill="${p.shadow}" opacity="0.18">
        <rect x="128" y="546" width="78" height="430" rx="16"/>
        <rect x="238" y="458" width="116" height="518" rx="18"/>
        <rect x="392" y="378" width="132" height="598" rx="20"/>
        <rect x="562" y="492" width="96" height="484" rx="18"/>
        <rect x="694" y="422" width="86" height="554" rx="18"/>
      </g>
      <path d="M110 1012 C282 854 372 886 456 716 C548 528 656 518 806 366" stroke="${p.light}" stroke-width="20" fill="none" opacity="0.62"/>
      ${nodes(p, index, 16)}
      ${figure(450, 830, 0.65, p, index)}
    `;
  }
  if (era === 1) {
    return `
      <path d="M450 260 C274 360 196 520 210 704 C228 934 390 1028 450 1120 C506 1028 676 932 692 704 C708 520 626 360 450 260 Z" fill="${p.accent2}" opacity="0.23"/>
      <g stroke="${p.ink}" stroke-width="4" fill="none" opacity="0.54">
        <path d="M450 326 V1038"/>
        <path d="M236 620 C340 570 560 570 666 620"/>
        <path d="M252 804 C350 858 552 858 650 804"/>
      </g>
      ${nodes(p, index, 18)}
      <circle cx="450" cy="690" r="60" fill="${p.light}" opacity="0.84"/>
    `;
  }
  if (era === 2) {
    return `
      <path d="M110 1000 C226 870 330 905 450 740 C572 568 672 550 806 390" stroke="${p.accent}" stroke-width="22" fill="none" opacity="0.42"/>
      <path d="M112 406 C250 520 330 486 450 640 C578 800 692 774 806 920" stroke="${p.accent2}" stroke-width="18" fill="none" opacity="0.4"/>
      <g fill="none" stroke="${p.ink}" stroke-width="4" opacity="0.42">
        <rect x="160" y="370" width="190" height="145" rx="30"/>
        <rect x="552" y="792" width="190" height="145" rx="30"/>
        <circle cx="450" cy="640" r="144"/>
      </g>
      ${figure(450, 820, 0.65, p, index)}
      ${nodes(p, index, 12)}
    `;
  }
  return `
    <circle cx="450" cy="542" r="300" fill="${p.light}" opacity="0.34"/>
    <path d="M125 1052 C286 860 350 910 448 718 C550 518 662 500 798 260" stroke="${p.light}" stroke-width="28" fill="none" opacity="0.7"/>
    <g fill="${p.accent2}" opacity="0.28">
      <path d="M140 1040 L230 920 L340 1032 L430 890 L548 1030 L640 902 L782 1045 Z"/>
      <ellipse cx="450" cy="1010" rx="320" ry="90"/>
    </g>
    <g stroke="${p.ink}" stroke-width="5" fill="none" opacity="0.6">
      <path d="M210 984 V760 M210 760 C260 720 306 720 350 760"/>
      <path d="M656 940 V706 M656 706 C700 664 754 670 790 718"/>
    </g>
    ${figure(450, 806, 0.66, p, index)}
  `;
}

function scene(key: ProgramKey, index: number, p: Palette) {
  if (key === 'economic-systems') return economicScene(index, p);
  if (key === 'planetary-ecology') return ecologyScene(index, p);
  return futureScene(index, p);
}

function svg(key: ProgramKey, index: number) {
  const p = programs[key];
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <defs>${noise(index + key.length)}</defs>
    ${background(p, index)}
    ${scene(key, index, p)}
    <g opacity="0.16" stroke="${p.ink}" stroke-width="2" fill="none">
      <path d="M72 ${250 + (index % 5) * 38} C210 ${190 + (index % 7) * 30} 330 ${350 + (index % 3) * 46} 482 ${282 + (index % 4) * 50}" />
      <path d="M420 ${1120 - (index % 5) * 34} C560 ${1020 - (index % 6) * 24} 660 ${1180 - (index % 3) * 42} 824 ${1060 - (index % 4) * 30}" />
    </g>
  </svg>`;
}

async function generate() {
  for (const key of Object.keys(programs) as ProgramKey[]) {
    const dir = path.join(ROOT, 'public', 'comics', key, 'variants', 'positive-overlay');
    await mkdir(dir, { recursive: true });
    const count = key === 'future-transitions' ? 32 : 40;
    for (let i = 0; i < count; i += 1) {
      const out = path.join(dir, `panel-${i}.webp`);
      await sharp(Buffer.from(svg(key, i)))
        .webp({ quality: 78, effort: 5 })
        .toFile(out);
    }
  }
}

generate().catch((error) => {
  console.error(error);
  process.exit(1);
});
