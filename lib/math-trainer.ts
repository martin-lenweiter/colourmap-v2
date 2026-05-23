export type Operation = 'add' | 'sub' | 'mul' | 'div' | 'alg' | 'frac';

export type WorkedExample = {
  problem: string;
  answer: string;
  trick: string;
};

export type GeneratedProblem = {
  problem: string;
  answer: number;
  operands: number[];
  operation: Operation;
};

export type Level = {
  number: number;
  title: string;
  summary: string;
  tips: string[];
  examples: WorkedExample[];
  generate: (rng: () => number) => GeneratedProblem;
};

export type OperationConfig = {
  key: Operation;
  symbol: string;
  label: string;
  color: string;
  levels: Level[];
};

function ri(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function pick<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

const ADDITION_LEVELS: Level[] = [
  {
    number: 1,
    title: 'Single digits',
    summary: 'Two single-digit numbers. The foundation everything else stands on.',
    tips: [
      'Memorise doubles first: 2+2, 3+3, 4+4 ... 9+9. They unlock half the table.',
      'Near doubles use a double plus or minus one: 7+8 is just 7+7 + 1 = 15.',
      'Make a 10 when one number is 8 or 9. 8+5 = 8+2+3 = 10+3 = 13.',
      'Order does not matter. Always start from the larger number — saves seconds, especially with a timer.',
    ],
    examples: [
      { problem: '7 + 8', answer: '15', trick: 'Near double: 7+7 = 14, then +1 = 15.' },
      { problem: '9 + 6', answer: '15', trick: 'Make 10: 9+1 = 10, then +5 = 15.' },
      { problem: '4 + 3', answer: '7', trick: 'Count on from the bigger: 4 ... 5, 6, 7.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 2, 9);
      const b = ri(rng, 2, 9);
      return { problem: `${a} + ${b}`, answer: a + b, operands: [a, b], operation: 'add' };
    },
  },
  {
    number: 2,
    title: '2-digit + 1-digit',
    summary: 'Adding a single digit to a 2-digit number. Mostly about crossing the next ten.',
    tips: [
      'Split the small number to land on a round ten. 27 + 8 = 27 + 3 + 5 = 30 + 5 = 35.',
      'If the ones-place sum is under 10, you do not cross — just add. 23 + 4 = 27.',
      'Hold the tens steady in your head while the ones change. The tens only move when you cross a ten.',
      'Practise bridging: 38+5, 47+6, 59+3 — these are the patterns that show up everywhere later.',
    ],
    examples: [
      { problem: '38 + 7', answer: '45', trick: 'Bridge: 38+2 = 40, then +5 = 45.' },
      { problem: '54 + 3', answer: '57', trick: 'No bridge needed: 4+3 = 7, tens stay at 50.' },
      { problem: '69 + 5', answer: '74', trick: 'Bridge: 69+1 = 70, then +4 = 74.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 10, 99);
      const b = ri(rng, 2, 9);
      return { problem: `${a} + ${b}`, answer: a + b, operands: [a, b], operation: 'add' };
    },
  },
  {
    number: 3,
    title: '2-digit + 2-digit',
    summary: 'Two 2-digit numbers. Split into tens and ones — this is the move you reuse forever.',
    tips: [
      'Add the tens first, then the ones, then combine. 34 + 28 = (30+20) + (4+8) = 50 + 12 = 62.',
      'If the ones cross 10, you carry one ten into the tens column.',
      'Round-and-adjust is fastest when one number is near a round ten. 47+39 = 47+40-1 = 86.',
      'Estimate first. If you expect roughly 60 and get 162, you typed a digit wrong.',
    ],
    examples: [
      { problem: '34 + 28', answer: '62', trick: 'Tens 50, ones 12, combine = 62.' },
      { problem: '47 + 39', answer: '86', trick: 'Round: 47+40 = 87, then −1 = 86.' },
      { problem: '52 + 33', answer: '85', trick: 'No carry: 80 + 5 = 85.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 11, 89);
      const b = ri(rng, 11, 89);
      return { problem: `${a} + ${b}`, answer: a + b, operands: [a, b], operation: 'add' };
    },
  },
  {
    number: 4,
    title: '3-digit + 3-digit',
    summary:
      'Three digits each. Same split-by-place logic, scaled up. Estimation matters more here.',
    tips: [
      'Always estimate first by rounding to the nearest hundred. 287 + 416 is roughly 300+400 = 700.',
      'Add hundreds, then tens, then ones, in that order. Each column can carry one into the next.',
      'If the numbers are close to round hundreds, use round-and-adjust. 298 + 405 = 300+405−2 = 703.',
      'Write the carry mentally as a finger or a thought, not a number you forget mid-calculation.',
    ],
    examples: [
      {
        problem: '287 + 416',
        answer: '703',
        trick: 'Hundreds 600, tens 90, ones 13 → 690+13 = 703.',
      },
      { problem: '298 + 405', answer: '703', trick: 'Round: 300 + 405 = 705, then −2 = 703.' },
      { problem: '142 + 356', answer: '498', trick: 'No carry: 400 + 90 + 8 = 498.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 110, 899);
      const b = ri(rng, 110, 899);
      return { problem: `${a} + ${b}`, answer: a + b, operands: [a, b], operation: 'add' };
    },
  },
  {
    number: 5,
    title: 'Three numbers',
    summary: 'Adding three numbers in a row. The skill here is choosing the order.',
    tips: [
      'Scan for pairs that make 10 first. 7 + 4 + 3 — spot 7+3 = 10, then +4 = 14.',
      'Order is free. Rearrange to make life easy: smallest first or pair-to-tens first.',
      'Keep a running total, do not try to hold all three numbers separately.',
      'For larger numbers, add the two easiest first, then the third.',
    ],
    examples: [
      { problem: '7 + 4 + 3', answer: '14', trick: 'Pair 7+3 = 10, then +4 = 14.' },
      { problem: '15 + 22 + 8', answer: '45', trick: 'Pair 22+8 = 30, then +15 = 45.' },
      {
        problem: '6 + 9 + 5',
        answer: '20',
        trick: '6+9 = 15, then +5 = 20. Or spot 6+9+5 = (5+5)+(6+4)+... too clever; just add.',
      },
    ],
    generate: (rng) => {
      const a = ri(rng, 3, 30);
      const b = ri(rng, 3, 30);
      const c = ri(rng, 3, 30);
      return {
        problem: `${a} + ${b} + ${c}`,
        answer: a + b + c,
        operands: [a, b, c],
        operation: 'add',
      };
    },
  },
  {
    number: 6,
    title: 'Four numbers',
    summary: 'Four numbers in a chain. Chunking and grouping become essential.',
    tips: [
      'Group into two pairs first. 8 + 5 + 12 + 7 → (8+12) + (5+7) = 20 + 12 = 32.',
      'Look for pairs summing to 10, 20, 50, or 100 — these are mental anchors.',
      'If no nice pairs, add left to right with a running total. Do not lose track of where you are.',
      'Estimate first. Four 2-digit numbers should give roughly 4× the average.',
    ],
    examples: [
      { problem: '8 + 5 + 12 + 7', answer: '32', trick: 'Pair (8+12) + (5+7) = 20 + 12 = 32.' },
      {
        problem: '25 + 14 + 30 + 11',
        answer: '80',
        trick:
          'Pair (25+30) + (14+11)? No: (25+11) + (14+30) = 36 + 44 = 80. Or running: 25→39→69→80.',
      },
      { problem: '9 + 18 + 7 + 16', answer: '50', trick: 'Pair (9+16) + (18+7) = 25 + 25 = 50.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 3, 25);
      const b = ri(rng, 3, 25);
      const c = ri(rng, 3, 25);
      const d = ri(rng, 3, 25);
      return {
        problem: `${a} + ${b} + ${c} + ${d}`,
        answer: a + b + c + d,
        operands: [a, b, c, d],
        operation: 'add',
      };
    },
  },
  {
    number: 7,
    title: 'Mixed challenge',
    summary: 'Mixed sizes and counts under time pressure. Pull from everything you learned.',
    tips: [
      'Speed comes from pattern recognition, not from going faster. Identify the pattern first.',
      'When stuck, decompose: split one number into the part that completes a round ten or hundred plus the rest.',
      'Estimate, then compute. If your computed answer is far from your estimate, recheck.',
      'Trust your method. Switching mid-problem is where most errors happen.',
    ],
    examples: [
      { problem: '46 + 78 + 12', answer: '136', trick: 'Pair 78+12 = 90, then 46+90 = 136.' },
      { problem: '127 + 86', answer: '213', trick: 'Round: 127+86 = 127+100−14 = 213.' },
      { problem: '9 + 17 + 23 + 31', answer: '80', trick: 'Pair (9+31) + (17+23) = 40 + 40 = 80.' },
    ],
    generate: (rng) => {
      const mode = ri(rng, 0, 2);
      if (mode === 0) {
        const a = ri(rng, 50, 300);
        const b = ri(rng, 50, 300);
        return { problem: `${a} + ${b}`, answer: a + b, operands: [a, b], operation: 'add' };
      }
      if (mode === 1) {
        const a = ri(rng, 10, 80);
        const b = ri(rng, 10, 80);
        const c = ri(rng, 10, 80);
        return {
          problem: `${a} + ${b} + ${c}`,
          answer: a + b + c,
          operands: [a, b, c],
          operation: 'add',
        };
      }
      const a = ri(rng, 5, 40);
      const b = ri(rng, 5, 40);
      const c = ri(rng, 5, 40);
      const d = ri(rng, 5, 40);
      return {
        problem: `${a} + ${b} + ${c} + ${d}`,
        answer: a + b + c + d,
        operands: [a, b, c, d],
        operation: 'add',
      };
    },
  },
];

const SUBTRACTION_LEVELS: Level[] = [
  {
    number: 1,
    title: 'Single digits',
    summary: 'Take a small number away from a larger one. Stays positive.',
    tips: [
      'Count back for small differences: 8−3 → 8, 7, 6, 5.',
      'Count up for larger differences: 9−4 → "from 4, how many to 9?" → 5.',
      'Every subtraction has a matching addition. 8−3 = 5 because 5+3 = 8. Use the easier direction.',
      'Memorise the family: if you know 3+5 = 8, you also know 8−5 and 8−3.',
    ],
    examples: [
      { problem: '8 − 3', answer: '5', trick: 'Count up: 3 to 8 is 5 steps.' },
      { problem: '9 − 4', answer: '5', trick: 'Fact family: 5+4 = 9.' },
      { problem: '7 − 2', answer: '5', trick: 'Count back: 7, 6, 5.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 4, 9);
      const b = ri(rng, 1, a);
      return { problem: `${a} − ${b}`, answer: a - b, operands: [a, b], operation: 'sub' };
    },
  },
  {
    number: 2,
    title: '2-digit − 1-digit, no borrow',
    summary: 'The ones place is enough to cover the small number. No borrowing yet.',
    tips: [
      'When the ones digit of the top number is bigger than the bottom, just subtract the ones. 38 − 5 = 33.',
      'Tens stay completely still. Only the ones digit moves.',
      'If you can do single-digit subtraction, you can do this — just hold the tens steady.',
      'Speed-check by adding back: 33 + 5 = 38. Confirms the answer.',
    ],
    examples: [
      { problem: '38 − 5', answer: '33', trick: 'Ones only: 8−5 = 3, tens stay 30.' },
      { problem: '47 − 2', answer: '45', trick: '7−2 = 5, tens stay 40.' },
      { problem: '69 − 4', answer: '65', trick: '9−4 = 5, tens stay 60.' },
    ],
    generate: (rng) => {
      const tens = ri(rng, 1, 9) * 10;
      const ones = ri(rng, 4, 9);
      const a = tens + ones;
      const b = ri(rng, 1, ones);
      return { problem: `${a} − ${b}`, answer: a - b, operands: [a, b], operation: 'sub' };
    },
  },
  {
    number: 3,
    title: '2-digit − 1-digit, with borrow',
    summary: 'Now the ones digit of the top number is too small. You have to borrow from the tens.',
    tips: [
      'Borrow one ten and add it to the ones. 32 − 7 → think of 32 as 20+12, then 12−7 = 5 → 25.',
      'Or count up: from 7 to 32 → 7→10 (3 steps), 10→32 (22 steps), total 25.',
      'Or round-and-adjust: 32 − 7 = 32 − 10 + 3 = 25.',
      'Pick the method that feels fastest for the specific numbers. Different problems suit different tricks.',
    ],
    examples: [
      { problem: '32 − 7', answer: '25', trick: 'Borrow: 12−7 = 5, tens become 20 → 25.' },
      { problem: '51 − 8', answer: '43', trick: 'Round: 51−10+2 = 43.' },
      { problem: '74 − 9', answer: '65', trick: 'Round: 74−10+1 = 65.' },
    ],
    generate: (rng) => {
      const tens = ri(rng, 2, 9) * 10;
      const ones = ri(rng, 0, 5);
      const a = tens + ones;
      const b = ri(rng, ones + 1, 9);
      return { problem: `${a} − ${b}`, answer: a - b, operands: [a, b], operation: 'sub' };
    },
  },
  {
    number: 4,
    title: '2-digit − 2-digit',
    summary: 'Both numbers are 2 digits. Best done by counting up or equal-addition.',
    tips: [
      'Counting up from the small number is usually fastest. 73 − 48: from 48 to 50 is 2, 50 to 73 is 23, total 25.',
      'Equal addition trick: add the same to both to make the small one easier. 73−48 = (73+2)−(48+2) = 75−50 = 25.',
      'Column subtraction works but is slow mentally. Use it for written work; use counting up for speed.',
      'Estimate first to round hundreds: 73 − 48 is roughly 70 − 50 = 20, so the real answer is near 20.',
    ],
    examples: [
      { problem: '73 − 48', answer: '25', trick: 'Count up: 48 → 50 (2) → 73 (23). Total 25.' },
      {
        problem: '82 − 37',
        answer: '45',
        trick: 'Equal addition: 82+3 = 85, 37+3 = 40, 85−40 = 45.',
      },
      { problem: '94 − 26', answer: '68', trick: 'Round: 94 − 30 = 64, then +4 = 68.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 30, 99);
      const b = ri(rng, 11, a - 5);
      return { problem: `${a} − ${b}`, answer: a - b, operands: [a, b], operation: 'sub' };
    },
  },
  {
    number: 5,
    title: 'Going below zero',
    summary:
      'When the small number is on top, the answer becomes negative. The key is to track the sign.',
    tips: [
      'Swap and negate. 8 − 15 = −(15 − 8) = −7. Always reduce to a positive subtraction first, then attach the minus sign.',
      'Picture a number line. From 8, step 15 left: you land at −7.',
      'Owe versus have: 8 − 15 is like having 8 and owing 15 — you end up owing 7.',
      'The most common error is forgetting the sign. Write the minus sign first if it helps.',
    ],
    examples: [
      { problem: '8 − 15', answer: '-7', trick: 'Swap: −(15−8) = −7.' },
      { problem: '5 − 12', answer: '-7', trick: 'Number line: from 5, step 12 left → −7.' },
      { problem: '14 − 22', answer: '-8', trick: 'Swap: −(22−14) = −8.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 2, 19);
      const b = ri(rng, a + 3, a + 18);
      return { problem: `${a} − ${b}`, answer: a - b, operands: [a, b], operation: 'sub' };
    },
  },
  {
    number: 6,
    title: 'Three numbers, mixed +/−',
    summary: 'Strings like 12 + 7 − 9 or 15 − 8 + 3. Order matters — go left to right.',
    tips: [
      'Always evaluate left to right. The signs belong to the number that follows them.',
      'Keep a running total: 12 + 7 − 9 → 12 → 19 → 10.',
      'If you hit a negative midway, keep going — the next step might bring you back positive.',
      'Practice mental restart: if you lose track, identify the running total at the last clear step and continue.',
    ],
    examples: [
      { problem: '12 + 7 − 9', answer: '10', trick: 'Running: 12 → 19 → 10.' },
      { problem: '15 − 8 + 3', answer: '10', trick: 'Running: 15 → 7 → 10.' },
      { problem: '6 − 14 + 5', answer: '-3', trick: 'Running: 6 → −8 → −3.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 5, 30);
      const b = ri(rng, 5, 30);
      const c = ri(rng, 5, 30);
      const signs = pick(rng, ['+-', '-+', '--'] as const);
      const result = a + (signs[0] === '+' ? b : -b) + (signs[1] === '+' ? c : -c);
      return {
        problem: `${a} ${signs[0] === '+' ? '+' : '−'} ${b} ${signs[1] === '+' ? '+' : '−'} ${c}`,
        answer: result,
        operands: [a, b, c],
        operation: 'sub',
      };
    },
  },
  {
    number: 7,
    title: 'Four numbers, mixed challenge',
    summary: 'Four numbers, mixed signs, possibly negative results. The full subtraction picture.',
    tips: [
      'Group the positives and negatives separately. 8 − 5 + 12 − 7 = (8+12) − (5+7) = 20 − 12 = 8.',
      'Sum all positives, sum all negatives, then subtract. Cleaner than left-to-right when there are four terms.',
      'Estimate the sign of the answer first: if the negatives are bigger overall, expect a negative.',
      'If a timer is on, do not rush past the estimation step. Two seconds of estimation prevents twenty seconds of recovery.',
    ],
    examples: [
      { problem: '8 − 5 + 12 − 7', answer: '8', trick: 'Group: (8+12) − (5+7) = 20 − 12 = 8.' },
      {
        problem: '20 + 15 − 30 − 8',
        answer: '-3',
        trick: 'Group: (20+15) − (30+8) = 35 − 38 = −3.',
      },
      { problem: '14 − 9 − 12 + 5', answer: '-2', trick: 'Group: (14+5) − (9+12) = 19 − 21 = −2.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 5, 30);
      const b = ri(rng, 5, 30);
      const c = ri(rng, 5, 30);
      const d = ri(rng, 5, 30);
      const signs = pick(rng, ['+-+-', '-+-+', '+--+', '-+-+', '--++', '++--'] as const);
      const vals = [a, b, c, d];
      let result = 0;
      const parts: string[] = [];
      for (let i = 0; i < 4; i += 1) {
        const s = signs[i];
        if (i === 0) {
          result = s === '+' ? vals[i] : -vals[i];
          parts.push(`${s === '+' ? '' : '−'}${vals[i]}`);
        } else {
          result += s === '+' ? vals[i] : -vals[i];
          parts.push(`${s === '+' ? '+' : '−'} ${vals[i]}`);
        }
      }
      return {
        problem: parts.join(' '),
        answer: result,
        operands: vals,
        operation: 'sub',
      };
    },
  },
];

const MULTIPLICATION_LEVELS: Level[] = [
  {
    number: 1,
    title: '×2, ×5, ×10',
    summary: 'The easiest tables. Master these and you have a foothold for everything.',
    tips: [
      '×2 means double. 2 × 7 = 7 doubled = 14.',
      '×10 means append a zero. 10 × 8 = 80.',
      '×5 means half of ×10, or ×10 then halve. 5 × 8 = (10×8)/2 = 40.',
      'Even × 5 always ends in 0. Odd × 5 always ends in 5. Quick sanity check.',
    ],
    examples: [
      { problem: '2 × 7', answer: '14', trick: 'Double 7 = 14.' },
      { problem: '5 × 8', answer: '40', trick: '10 × 8 = 80, halve to 40.' },
      { problem: '10 × 9', answer: '90', trick: 'Append zero to 9.' },
    ],
    generate: (rng) => {
      const a = pick(rng, [2, 5, 10] as const);
      const b = ri(rng, 2, 12);
      return { problem: `${a} × ${b}`, answer: a * b, operands: [a, b], operation: 'mul' };
    },
  },
  {
    number: 2,
    title: '×3, ×4',
    summary: 'Build on ×2: ×4 is just double-double, ×3 is double-plus-one.',
    tips: [
      '×4 = double, then double again. 4 × 7 = (7×2)×2 = 14×2 = 28.',
      '×3 = double, then add one more. 3 × 7 = 14 + 7 = 21.',
      'These tricks remove the need to memorise — you derive each fact from doubling, which is fastest.',
      'Once stable, you should answer ×3 and ×4 in under two seconds.',
    ],
    examples: [
      { problem: '3 × 7', answer: '21', trick: 'Double 7 = 14, plus 7 = 21.' },
      { problem: '4 × 8', answer: '32', trick: 'Double-double: 8 → 16 → 32.' },
      { problem: '3 × 9', answer: '27', trick: 'Double 9 = 18, plus 9 = 27.' },
    ],
    generate: (rng) => {
      const a = pick(rng, [3, 4] as const);
      const b = ri(rng, 3, 12);
      return { problem: `${a} × ${b}`, answer: a * b, operands: [a, b], operation: 'mul' };
    },
  },
  {
    number: 3,
    title: '×6, ×7, ×8, ×9',
    summary: 'The hardest tables. Each has a trick that makes them easier than rote memorisation.',
    tips: [
      '×9 trick: multiply by 10 and subtract the number. 9 × 7 = 70 − 7 = 63.',
      '×9 finger trick: hold 10 fingers up, fold down the n-th finger. Fingers left of the fold are tens, right are ones.',
      '×8 = ×10 minus ×2. 8 × 7 = 70 − 14 = 56.',
      '×6 = ×5 plus ×1. 6 × 8 = (5×8) + 8 = 40 + 8 = 48.',
      '×7 is the toughest — memorise 7×7 = 49, 7×8 = 56, 7×9 = 63. They appear endlessly.',
    ],
    examples: [
      { problem: '9 × 7', answer: '63', trick: '10×7 = 70, minus 7 = 63.' },
      { problem: '8 × 7', answer: '56', trick: '10×7 = 70, minus 14 (= 2×7) = 56.' },
      { problem: '6 × 9', answer: '54', trick: '5×9 = 45, plus 9 = 54.' },
    ],
    generate: (rng) => {
      const a = pick(rng, [6, 7, 8, 9] as const);
      const b = ri(rng, 3, 12);
      return { problem: `${a} × ${b}`, answer: a * b, operands: [a, b], operation: 'mul' };
    },
  },
  {
    number: 4,
    title: '2-digit × 1-digit',
    summary: 'Split the 2-digit number into tens and ones, then add.',
    tips: [
      'Split into tens and ones. 24 × 3 = (20×3) + (4×3) = 60 + 12 = 72.',
      'Tens × small number is the easy half. Ones × small number gives the part you add on.',
      'Round and adjust when one number is near a round ten. 29 × 4 = 30×4 − 4 = 116.',
      'Estimate first: 24 × 3 is roughly 25 × 3 = 75. Real answer should be close.',
    ],
    examples: [
      { problem: '24 × 3', answer: '72', trick: '60 + 12 = 72.' },
      { problem: '37 × 5', answer: '185', trick: '150 + 35 = 185. Or 37 × 10 / 2 = 185.' },
      { problem: '29 × 4', answer: '116', trick: '30×4 − 4 = 120 − 4 = 116.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 11, 49);
      const b = ri(rng, 3, 9);
      return { problem: `${a} × ${b}`, answer: a * b, operands: [a, b], operation: 'mul' };
    },
  },
  {
    number: 5,
    title: 'Squares & near-squares',
    summary: 'n × n problems and "close to a square" problems. A specialty worth its own level.',
    tips: [
      'Memorise squares 11² to 20². They appear constantly in mental math.',
      'For numbers ending in 5: ab5² = (ab × (ab+1)) followed by 25. So 25² = (2×3)25 = 625. 35² = (3×4)25 = 1225.',
      'Difference of squares for near-squares: 19 × 21 = 20² − 1² = 400 − 1 = 399.',
      'Going one off a square: 14 × 14 = 196, so 14 × 15 = 196 + 14 = 210.',
    ],
    examples: [
      { problem: '15 × 15', answer: '225', trick: 'Ending-in-5 trick: (1×2)25 = 225.' },
      { problem: '19 × 21', answer: '399', trick: 'Difference of squares: 20² − 1 = 399.' },
      { problem: '14 × 14', answer: '196', trick: 'Memorise. Or 14² = 196.' },
    ],
    generate: (rng) => {
      const mode = ri(rng, 0, 1);
      if (mode === 0) {
        const a = ri(rng, 11, 20);
        return { problem: `${a} × ${a}`, answer: a * a, operands: [a, a], operation: 'mul' };
      }
      const n = ri(rng, 12, 19);
      return {
        problem: `${n - 1} × ${n + 1}`,
        answer: (n - 1) * (n + 1),
        operands: [n - 1, n + 1],
        operation: 'mul',
      };
    },
  },
  {
    number: 6,
    title: '2-digit × 2-digit',
    summary: 'The full mental cross-multiplication. Hard but achievable with the right method.',
    tips: [
      'Box method: split each number into tens and ones, multiply all four cross-pairs, add. 23 × 17 = (20+3)(10+7) = 200 + 140 + 30 + 21 = 391.',
      'For numbers near a round ten: round-and-adjust. 29 × 41 = 30×41 − 41 = 1230 − 41 = 1189.',
      'When both end in 5: the ending-in-5 trick generalises. 35 × 45 = (3×5 + half-of-sum-of-tens-pair)? Use box.',
      'Memorise 12, 13, 14, 15 times the small tables — they are everyday building blocks.',
    ],
    examples: [
      { problem: '23 × 17', answer: '391', trick: 'Box: 200 + 140 + 30 + 21 = 391.' },
      { problem: '29 × 41', answer: '1189', trick: 'Round: 30×41 − 41 = 1230 − 41 = 1189.' },
      {
        problem: '18 × 12',
        answer: '216',
        trick: 'Box: 100 + 80 + 20 + 16 = 216. Or 18 × 12 = 18 × 10 + 18 × 2.',
      },
    ],
    generate: (rng) => {
      const a = ri(rng, 12, 39);
      const b = ri(rng, 12, 29);
      return { problem: `${a} × ${b}`, answer: a * b, operands: [a, b], operation: 'mul' };
    },
  },
  {
    number: 7,
    title: 'Three numbers',
    summary: 'Three numbers multiplied. The skill is choosing the order to keep numbers small.',
    tips: [
      'Multiplication is associative: order does not change the result. Pair the easiest two first.',
      'If you can make a 10 or 100, do it. 4 × 5 × 7 → pair 4×5 = 20, then 20×7 = 140.',
      'For three medium numbers, pair the closest to round first. 12 × 5 × 8 → 12 × 40 = 480.',
      'Estimate range: three numbers around 10 each gives roughly 1000. If you get 100, recheck.',
    ],
    examples: [
      { problem: '4 × 5 × 7', answer: '140', trick: 'Pair: 4×5 = 20, then ×7 = 140.' },
      { problem: '12 × 5 × 8', answer: '480', trick: 'Pair: 5×8 = 40, then ×12 = 480.' },
      { problem: '3 × 6 × 9', answer: '162', trick: 'Pair: 6×9 = 54, then ×3 = 162.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 2, 9);
      const b = ri(rng, 2, 9);
      const c = ri(rng, 2, 9);
      return {
        problem: `${a} × ${b} × ${c}`,
        answer: a * b * c,
        operands: [a, b, c],
        operation: 'mul',
      };
    },
  },
];

const DIVISION_LEVELS: Level[] = [
  {
    number: 1,
    title: '÷2, ÷5, ÷10',
    summary: 'The easiest divisions. Master these as the inverse of ×2, ×5, ×10.',
    tips: [
      '÷2 means halve. 18 ÷ 2 = 9. Practise halving everything you see.',
      '÷10 means remove a zero. 80 ÷ 10 = 8.',
      '÷5 is fastest as ×2 then ÷10. 35 ÷ 5 = 70 ÷ 10 = 7.',
      'Every division is a question: "what times the divisor gives the dividend?"',
    ],
    examples: [
      { problem: '18 ÷ 2', answer: '9', trick: 'Half of 18 = 9.' },
      { problem: '80 ÷ 10', answer: '8', trick: 'Drop the zero.' },
      { problem: '35 ÷ 5', answer: '7', trick: 'Doublethen÷10: 70 ÷ 10 = 7.' },
    ],
    generate: (rng) => {
      const b = pick(rng, [2, 5, 10] as const);
      const q = ri(rng, 2, 12);
      const a = b * q;
      return { problem: `${a} ÷ ${b}`, answer: q, operands: [a, b], operation: 'div' };
    },
  },
  {
    number: 2,
    title: 'Times-table reversal',
    summary: 'If you know the multiplication table, division by 3-9 is just the reverse question.',
    tips: [
      'Ask the multiplication question. 24 ÷ 6 = ? becomes "6 × what = 24?" → 4.',
      'If 6 × 7 = 42 is locked in memory, so is 42 ÷ 6 = 7 and 42 ÷ 7 = 6. Triplets.',
      'For ÷9 specifically: digits of the dividend sum to a multiple of 9. 63 → 6+3 = 9 → divisible.',
      'For ÷3: digits sum to a multiple of 3. 51 → 5+1 = 6 → divisible.',
    ],
    examples: [
      { problem: '24 ÷ 6', answer: '4', trick: '6 × 4 = 24, so the answer is 4.' },
      { problem: '63 ÷ 9', answer: '7', trick: '9 × 7 = 63.' },
      { problem: '48 ÷ 8', answer: '6', trick: '8 × 6 = 48.' },
    ],
    generate: (rng) => {
      const b = ri(rng, 3, 9);
      const q = ri(rng, 3, 12);
      return { problem: `${b * q} ÷ ${b}`, answer: q, operands: [b * q, b], operation: 'div' };
    },
  },
  {
    number: 3,
    title: 'With remainders',
    summary: 'When the division does not come out clean. Answer is "quotient r remainder".',
    tips: [
      'Find the largest multiple of the divisor that fits under the dividend. 29 ÷ 4: largest is 28 = 4×7, remainder 1.',
      'Write your answer as Q r R. 29 ÷ 4 = 7 r 1.',
      'Check: quotient × divisor + remainder should equal dividend. 7 × 4 + 1 = 29. ✓',
      'The remainder is always smaller than the divisor. If it is bigger or equal, you can divide once more.',
    ],
    examples: [
      { problem: '29 ÷ 4', answer: '7 r 1', trick: '4 × 7 = 28, remainder 29 − 28 = 1.' },
      { problem: '47 ÷ 6', answer: '7 r 5', trick: '6 × 7 = 42, remainder 5.' },
      { problem: '38 ÷ 5', answer: '7 r 3', trick: '5 × 7 = 35, remainder 3.' },
    ],
    generate: (rng) => {
      const b = ri(rng, 3, 9);
      const q = ri(rng, 3, 11);
      const r = ri(rng, 1, b - 1);
      const a = b * q + r;
      return { problem: `${a} ÷ ${b}`, answer: q + r / 1000, operands: [a, b], operation: 'div' };
    },
  },
  {
    number: 4,
    title: '2-digit ÷ 1-digit',
    summary: 'Standard long division, mental. Break the dividend into chunks.',
    tips: [
      'Chunk by tens. 72 ÷ 3: how many 3s in 70? About 23, but be exact — 3×20 = 60, 12 left, 12÷3 = 4. Answer: 24.',
      'Or: find the closest multiple of the divisor under the dividend, divide what fits, handle the rest.',
      'Estimate first by rounding. 87 ÷ 3 is roughly 90 ÷ 3 = 30, so expect around 29.',
      'These problems are where division mental math becomes tested. Slow is fine; accuracy first.',
    ],
    examples: [
      { problem: '72 ÷ 3', answer: '24', trick: '3 × 20 = 60, 12 left, 12 ÷ 3 = 4. Total 24.' },
      { problem: '84 ÷ 4', answer: '21', trick: '4 × 20 = 80, 4 left, 4 ÷ 4 = 1. Total 21.' },
      { problem: '96 ÷ 6', answer: '16', trick: '6 × 10 = 60, 36 left, 36 ÷ 6 = 6. Total 16.' },
    ],
    generate: (rng) => {
      const b = ri(rng, 3, 9);
      const q = ri(rng, 11, 19);
      return { problem: `${b * q} ÷ ${b}`, answer: q, operands: [b * q, b], operation: 'div' };
    },
  },
  {
    number: 5,
    title: '3-digit ÷ 1-digit',
    summary: 'Bigger dividends. The same chunking method scales up.',
    tips: [
      'Chunk by hundreds first, then tens, then ones. 245 ÷ 5: 5×40 = 200, 45 left, 45÷5 = 9. Total 49.',
      'Watch for clean divisions: if the dividend ends in 0 and the divisor is 5 or 10, that is a hint.',
      'Estimate to the nearest hundred. 245 ÷ 5 is roughly 250 ÷ 5 = 50, so expect near 49.',
      'When stuck, try doubling. 245 ÷ 5 = 490 ÷ 10 = 49.',
    ],
    examples: [
      { problem: '245 ÷ 5', answer: '49', trick: '×2 trick: 490 ÷ 10 = 49.' },
      { problem: '372 ÷ 4', answer: '93', trick: '4 × 90 = 360, 12 left, 12 ÷ 4 = 3. Total 93.' },
      { problem: '168 ÷ 6', answer: '28', trick: '6 × 20 = 120, 48 left, 48 ÷ 6 = 8. Total 28.' },
    ],
    generate: (rng) => {
      const b = ri(rng, 3, 9);
      const q = ri(rng, 20, 99);
      return { problem: `${b * q} ÷ ${b}`, answer: q, operands: [b * q, b], operation: 'div' };
    },
  },
  {
    number: 6,
    title: '2-digit ÷ 2-digit',
    summary: 'Both divisor and dividend are 2-digit. Estimation is everything.',
    tips: [
      'Round the divisor first. 84 ÷ 12 → divisor is close to 10, so the answer is roughly 84 / 10 = 8.',
      'Once you have an estimate, multiply to check. 12 × 7 = 84. ✓ The answer is 7.',
      'If the estimate is too high, drop one. If too low, raise one. You will usually need only one adjustment.',
      'For divisors ending in 5, double both numbers — turns ÷15 into ÷30, often easier.',
    ],
    examples: [
      { problem: '84 ÷ 12', answer: '7', trick: 'Estimate 8, check 12×7 = 84.' },
      { problem: '78 ÷ 13', answer: '6', trick: '13 × 6 = 78.' },
      { problem: '96 ÷ 16', answer: '6', trick: 'Halve both: 48 ÷ 8 = 6.' },
    ],
    generate: (rng) => {
      const b = ri(rng, 11, 19);
      const q = ri(rng, 3, 9);
      return { problem: `${b * q} ÷ ${b}`, answer: q, operands: [b * q, b], operation: 'div' };
    },
  },
  {
    number: 7,
    title: 'Clean decimal results',
    summary: 'Divisions that come out to a known decimal: halves, quarters, fifths, eighths.',
    tips: [
      'Memorise the common decimal equivalents: 1/2 = 0.5, 1/4 = 0.25, 3/4 = 0.75, 1/5 = 0.2, 1/8 = 0.125.',
      '35 ÷ 4 = 8 with remainder 3, and 3/4 = 0.75, so 35 ÷ 4 = 8.75.',
      'Quarters appear constantly in money and time. Practise them until they are reflex.',
      'For ÷8 specifically: divide by 2 three times. 56 ÷ 8 = 28 ÷ 4 = 14 ÷ 2 = 7.',
    ],
    examples: [
      { problem: '35 ÷ 4', answer: '8.75', trick: '8 whole, remainder 3, and 3/4 = 0.75.' },
      { problem: '17 ÷ 2', answer: '8.5', trick: 'Half of 17 = 8.5.' },
      { problem: '21 ÷ 4', answer: '5.25', trick: '5 whole, remainder 1, and 1/4 = 0.25.' },
    ],
    generate: (rng) => {
      const b = pick(rng, [2, 4, 5, 8] as const);
      const wholeQ = ri(rng, 3, 12);
      const r = ri(rng, 1, b - 1);
      const a = b * wholeQ + r;
      return { problem: `${a} ÷ ${b}`, answer: a / b, operands: [a, b], operation: 'div' };
    },
  },
];

const ALGEBRA_LEVELS: Level[] = [
  {
    number: 1,
    title: 'Find x: x + n = result',
    summary: 'A missing number on one side. Subtract to isolate.',
    tips: [
      'To get x alone, undo the operation. x + 7 = 12 means x = 12 − 7.',
      'Whatever you do to one side, do to the other. Adding 5 left and right keeps the equation balanced.',
      'Check by substituting back. If x + 7 = 12 and you got x = 5, verify: 5 + 7 = 12. ✓',
      'These are addition facts in disguise. Strong addition makes algebra fast.',
    ],
    examples: [
      { problem: 'x + 7 = 12', answer: '5', trick: 'x = 12 − 7 = 5.' },
      { problem: 'x + 4 = 11', answer: '7', trick: 'x = 11 − 4 = 7.' },
      { problem: 'x + 9 = 15', answer: '6', trick: 'x = 15 − 9 = 6.' },
    ],
    generate: (rng) => {
      const x = ri(rng, 2, 12);
      const b = ri(rng, 1, 9);
      const r = x + b;
      return { problem: `x + ${b} = ${r}`, answer: x, operands: [b, r], operation: 'alg' };
    },
  },
  {
    number: 2,
    title: 'Find x: x − n = result',
    summary: 'Subtraction equations. Add to isolate.',
    tips: [
      'The inverse of subtraction is addition. x − 3 = 8 means x = 8 + 3.',
      'Picture a balance scale. Adding the subtracted amount to both sides restores x alone.',
      'Always check by plugging your answer back in.',
      'If the result is small or negative, the answer might still be positive — read carefully.',
    ],
    examples: [
      { problem: 'x − 3 = 8', answer: '11', trick: 'x = 8 + 3 = 11.' },
      { problem: 'x − 9 = 4', answer: '13', trick: 'x = 4 + 9 = 13.' },
      { problem: 'x − 6 = 0', answer: '6', trick: 'x = 0 + 6 = 6.' },
    ],
    generate: (rng) => {
      const x = ri(rng, 5, 20);
      const b = ri(rng, 1, x - 1);
      return { problem: `x − ${b} = ${x - b}`, answer: x, operands: [b, x - b], operation: 'alg' };
    },
  },
  {
    number: 3,
    title: 'Find x: n − x = result',
    summary: 'x is the thing being subtracted. Rearrange or think backwards.',
    tips: [
      'If 12 − x = 8, then x is the difference: x = 12 − 8 = 4.',
      'Mental check: what number must be removed from n to leave the result? That number is x.',
      'Same balance rule: add x to both sides to get n = result + x, then subtract result.',
      'These problems are common in word problems: "I had 12 apples, now I have 8. How many did I lose?"',
    ],
    examples: [
      { problem: '12 − x = 8', answer: '4', trick: 'x = 12 − 8 = 4.' },
      { problem: '20 − x = 15', answer: '5', trick: 'x = 20 − 15 = 5.' },
      { problem: '9 − x = 2', answer: '7', trick: 'x = 9 − 2 = 7.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 8, 25);
      const x = ri(rng, 1, a - 1);
      return { problem: `${a} − x = ${a - x}`, answer: x, operands: [a, a - x], operation: 'alg' };
    },
  },
  {
    number: 4,
    title: 'Find x: ax = result',
    summary: 'Multiplication equations. Divide to isolate.',
    tips: [
      'To undo multiplication, divide. 3x = 24 means x = 24 ÷ 3 = 8.',
      'These are division problems disguised as algebra. Recognising the inverse is the whole move.',
      'Stick to whole-number problems first. Mixed fractions come later.',
      'Check by multiplying: 3 × 8 = 24. ✓',
    ],
    examples: [
      { problem: '3x = 24', answer: '8', trick: 'x = 24 ÷ 3 = 8.' },
      { problem: '7x = 35', answer: '5', trick: 'x = 35 ÷ 7 = 5.' },
      { problem: '4x = 36', answer: '9', trick: 'x = 36 ÷ 4 = 9.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 2, 9);
      const x = ri(rng, 2, 12);
      return { problem: `${a}x = ${a * x}`, answer: x, operands: [a, a * x], operation: 'alg' };
    },
  },
  {
    number: 5,
    title: 'Find x: ax + b = result',
    summary: 'Two operations. Undo them in reverse order.',
    tips: [
      'Undo addition first, then multiplication. 2x + 5 = 13 → 2x = 8 → x = 4.',
      'Reverse the order of operations: PEMDAS goes forward, undo goes backward.',
      'Always isolate the term with x before dividing.',
      'Check by plugging in: 2(4) + 5 = 13. ✓',
    ],
    examples: [
      { problem: '2x + 5 = 13', answer: '4', trick: 'Subtract 5: 2x = 8. Divide by 2: x = 4.' },
      { problem: '3x + 7 = 22', answer: '5', trick: 'Subtract 7: 3x = 15. Divide by 3: x = 5.' },
      { problem: '5x + 4 = 24', answer: '4', trick: 'Subtract 4: 5x = 20. Divide by 5: x = 4.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 2, 9);
      const x = ri(rng, 2, 12);
      const b = ri(rng, 1, 15);
      return {
        problem: `${a}x + ${b} = ${a * x + b}`,
        answer: x,
        operands: [a, b, a * x + b],
        operation: 'alg',
      };
    },
  },
  {
    number: 6,
    title: 'Find x with negatives',
    summary: 'Equations where x can be negative.',
    tips: [
      'Negative numbers obey the same balance rules. x + 8 = 3 still gives x = 3 − 8 = −5.',
      'If you see −x, flip the sign at the end. −x = 7 means x = −7.',
      'Sign tracking is the most common source of error. Write the sign first, then the digit.',
      'Always check by substituting back. Negative solutions catch errors easily.',
    ],
    examples: [
      { problem: 'x + 8 = 3', answer: '-5', trick: 'x = 3 − 8 = −5.' },
      { problem: '2x + 10 = 4', answer: '-3', trick: '2x = −6, so x = −3.' },
      { problem: 'x − 4 = −9', answer: '-5', trick: 'x = −9 + 4 = −5.' },
    ],
    generate: (rng) => {
      const mode = ri(rng, 0, 1);
      if (mode === 0) {
        const x = -ri(rng, 1, 9);
        const b = ri(rng, 1, 12);
        return {
          problem: `x + ${b} = ${x + b}`,
          answer: x,
          operands: [b, x + b],
          operation: 'alg',
        };
      }
      const a = ri(rng, 2, 5);
      const x = -ri(rng, 1, 6);
      const b = ri(rng, 1, 10);
      return {
        problem: `${a}x + ${b} = ${a * x + b}`,
        answer: x,
        operands: [a, b, a * x + b],
        operation: 'alg',
      };
    },
  },
  {
    number: 7,
    title: 'Two-step mixed challenge',
    summary: 'Anything from the previous six. Confidence under variety.',
    tips: [
      'Read the equation once before doing anything. Identify the structure first.',
      'Always: undo addition/subtraction first, then multiplication/division.',
      'Substitute your answer back into the original equation. Always. This single habit prevents most errors.',
      'When stuck, write each step on a new line. Showing the work is faster than redoing it.',
    ],
    examples: [
      { problem: '4x − 3 = 17', answer: '5', trick: '4x = 20, x = 5.' },
      { problem: '6x + 12 = 0', answer: '-2', trick: '6x = −12, x = −2.' },
      { problem: '3x = 21', answer: '7', trick: 'x = 7.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 2, 8);
      const x = ri(rng, -6, 10) || 1;
      const b = ri(rng, -8, 12);
      return {
        problem: `${a}x ${b >= 0 ? '+' : '−'} ${Math.abs(b)} = ${a * x + b}`,
        answer: x,
        operands: [a, b, a * x + b],
        operation: 'alg',
      };
    },
  },
];

function gcd(a: number, b: number): number {
  let x = Math.abs(a);
  let y = Math.abs(b);
  while (y) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}

function simplifyFraction(n: number, d: number): [number, number] {
  const g = gcd(n, d);
  return [n / g, d / g];
}

const FRACTION_LEVELS: Level[] = [
  {
    number: 1,
    title: 'Simplify fractions',
    summary: 'Reduce a fraction to its simplest form. Find the common factor.',
    tips: [
      'Divide top and bottom by their greatest common factor. 6/9 → divide both by 3 → 2/3.',
      'A fraction is fully simplified when top and bottom share no factor other than 1.',
      'If both are even, halve them first. Then keep halving.',
      'Check by multiplying back: 2/3 × 3/3 = 6/9. ✓',
    ],
    examples: [
      { problem: '6/9', answer: '2/3', trick: 'Divide both by 3.' },
      { problem: '8/12', answer: '2/3', trick: 'Divide both by 4.' },
      { problem: '15/25', answer: '3/5', trick: 'Divide both by 5.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 1, 9);
      const b = ri(rng, a + 1, 12);
      const m = ri(rng, 2, 5);
      const [sn, sd] = simplifyFraction(a, b);
      return {
        problem: `${a * m}/${b * m}`,
        answer: sn / sd,
        operands: [a * m, b * m, sn, sd],
        operation: 'frac',
      };
    },
  },
  {
    number: 2,
    title: 'Same denominator: add',
    summary: 'When denominators match, just add the numerators.',
    tips: [
      'Same bottom number? Add the tops. 2/7 + 3/7 = 5/7.',
      'Never add the bottoms — they stay the same.',
      'After adding, simplify if possible.',
      'Picture the same-size pie with slices: 2 slices + 3 slices = 5 slices.',
    ],
    examples: [
      { problem: '2/7 + 3/7', answer: '5/7', trick: 'Tops: 2+3 = 5. Bottom stays 7.' },
      { problem: '1/4 + 1/4', answer: '1/2', trick: '2/4 simplifies to 1/2.' },
      { problem: '3/8 + 1/8', answer: '1/2', trick: '4/8 simplifies to 1/2.' },
    ],
    generate: (rng) => {
      const d = ri(rng, 3, 10);
      const a = ri(rng, 1, d - 1);
      const b = ri(rng, 1, d - 1);
      const [sn, sd] = simplifyFraction(a + b, d);
      return {
        problem: `${a}/${d} + ${b}/${d}`,
        answer: sn / sd,
        operands: [a, b, d, sn, sd],
        operation: 'frac',
      };
    },
  },
  {
    number: 3,
    title: 'Same denominator: subtract',
    summary: 'Match denominators, subtract numerators.',
    tips: [
      'Same bottom? Subtract the tops. 5/8 − 2/8 = 3/8.',
      'Order matters in subtraction. 5/8 − 2/8 is not 2/8 − 5/8.',
      'Result can be 0/d = 0.',
      'Always simplify the result.',
    ],
    examples: [
      { problem: '5/8 − 2/8', answer: '3/8', trick: '5−2 = 3. Bottom stays 8.' },
      { problem: '4/9 − 1/9', answer: '1/3', trick: '3/9 simplifies to 1/3.' },
      { problem: '7/10 − 3/10', answer: '2/5', trick: '4/10 simplifies to 2/5.' },
    ],
    generate: (rng) => {
      const d = ri(rng, 4, 12);
      const a = ri(rng, 2, d - 1);
      const b = ri(rng, 1, a - 1);
      const [sn, sd] = simplifyFraction(a - b, d);
      return {
        problem: `${a}/${d} − ${b}/${d}`,
        answer: sn / sd,
        operands: [a, b, d, sn, sd],
        operation: 'frac',
      };
    },
  },
  {
    number: 4,
    title: 'Different denominators: add',
    summary: 'Find a common denominator first, then add.',
    tips: [
      'Find a common denominator — usually the product, but use LCM when convenient.',
      'Convert each fraction: multiply top and bottom by the missing factor.',
      '1/2 + 1/3: common denom 6 → 3/6 + 2/6 = 5/6.',
      'Always simplify. Always.',
    ],
    examples: [
      { problem: '1/2 + 1/3', answer: '5/6', trick: '3/6 + 2/6 = 5/6.' },
      { problem: '1/4 + 1/6', answer: '5/12', trick: '3/12 + 2/12 = 5/12.' },
      { problem: '2/3 + 1/4', answer: '11/12', trick: '8/12 + 3/12 = 11/12.' },
    ],
    generate: (rng) => {
      const d1 = ri(rng, 2, 6);
      let d2 = ri(rng, 2, 6);
      while (d2 === d1) d2 = ri(rng, 2, 6);
      const a = ri(rng, 1, d1 - 1);
      const b = ri(rng, 1, d2 - 1);
      const commonD = d1 * d2;
      const sumN = a * d2 + b * d1;
      const [sn, sd] = simplifyFraction(sumN, commonD);
      return {
        problem: `${a}/${d1} + ${b}/${d2}`,
        answer: sn / sd,
        operands: [a, d1, b, d2, sn, sd],
        operation: 'frac',
      };
    },
  },
  {
    number: 5,
    title: 'Different denominators: subtract',
    summary: 'Same approach as addition. Common denominator, then subtract.',
    tips: [
      'Find a common denominator first. The product of the two always works.',
      'Convert both fractions, then subtract numerators.',
      '3/4 − 1/6: common denom 12 → 9/12 − 2/12 = 7/12.',
      'Estimate first: 3/4 is about 0.75, 1/6 is about 0.17, so the answer should be near 0.58.',
    ],
    examples: [
      { problem: '3/4 − 1/6', answer: '7/12', trick: '9/12 − 2/12 = 7/12.' },
      { problem: '2/3 − 1/4', answer: '5/12', trick: '8/12 − 3/12 = 5/12.' },
      { problem: '5/6 − 1/2', answer: '1/3', trick: '5/6 − 3/6 = 2/6 = 1/3.' },
    ],
    generate: (rng) => {
      const d1 = ri(rng, 2, 6);
      let d2 = ri(rng, 2, 6);
      while (d2 === d1) d2 = ri(rng, 2, 6);
      let a = ri(rng, 1, d1 - 1);
      let b = ri(rng, 1, d2 - 1);
      // ensure a/d1 > b/d2 so result is positive
      if (a * d2 <= b * d1) {
        [a, b] = [(b * d1) / d2 + 1, a];
        a = Math.min(d1 - 1, Math.max(1, Math.round(a)));
        b = Math.min(d2 - 1, Math.max(1, Math.round(b)));
      }
      const commonD = d1 * d2;
      const diffN = a * d2 - b * d1;
      if (diffN <= 0) {
        // fallback to simple
        return {
          problem: `1/2 − 1/3`,
          answer: 1 / 6,
          operands: [1, 2, 1, 3, 1, 6],
          operation: 'frac',
        };
      }
      const [sn, sd] = simplifyFraction(diffN, commonD);
      return {
        problem: `${a}/${d1} − ${b}/${d2}`,
        answer: sn / sd,
        operands: [a, d1, b, d2, sn, sd],
        operation: 'frac',
      };
    },
  },
  {
    number: 6,
    title: 'Multiply fractions',
    summary: 'Top times top, bottom times bottom. Simplest of all fraction operations.',
    tips: [
      'Multiply tops together, multiply bottoms together. 2/3 × 4/5 = 8/15.',
      'No common denominator needed — multiplication is straightforward.',
      'Simplify before multiplying when possible: cross-cancel.',
      'Multiplying makes most fractions smaller (when both are less than 1).',
    ],
    examples: [
      { problem: '2/3 × 4/5', answer: '8/15', trick: 'Tops: 2×4 = 8. Bottoms: 3×5 = 15.' },
      {
        problem: '3/4 × 2/9',
        answer: '1/6',
        trick: 'Cross-cancel 2/4 and 3/9, get 1/2 × 1/3 = 1/6.',
      },
      { problem: '1/2 × 1/2', answer: '1/4', trick: 'Half of a half is a quarter.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 1, 8);
      const b = ri(rng, a + 1, 10);
      const c = ri(rng, 1, 8);
      const d = ri(rng, c + 1, 10);
      const [sn, sd] = simplifyFraction(a * c, b * d);
      return {
        problem: `${a}/${b} × ${c}/${d}`,
        answer: sn / sd,
        operands: [a, b, c, d, sn, sd],
        operation: 'frac',
      };
    },
  },
  {
    number: 7,
    title: 'Divide fractions',
    summary: 'Flip the second fraction and multiply. "Keep, change, flip."',
    tips: [
      'To divide, multiply by the reciprocal. 2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = 5/6.',
      '"Keep, change, flip": keep the first, change ÷ to ×, flip the second.',
      'Dividing by a fraction less than 1 makes the result bigger.',
      'Always simplify at the end.',
    ],
    examples: [
      { problem: '2/3 ÷ 4/5', answer: '5/6', trick: '2/3 × 5/4 = 10/12 = 5/6.' },
      { problem: '1/2 ÷ 1/4', answer: '2', trick: '1/2 × 4/1 = 4/2 = 2.' },
      { problem: '3/4 ÷ 1/2', answer: '3/2', trick: '3/4 × 2/1 = 6/4 = 3/2.' },
    ],
    generate: (rng) => {
      const a = ri(rng, 1, 6);
      const b = ri(rng, a + 1, 9);
      const c = ri(rng, 1, 6);
      const d = ri(rng, c + 1, 9);
      const [sn, sd] = simplifyFraction(a * d, b * c);
      return {
        problem: `${a}/${b} ÷ ${c}/${d}`,
        answer: sn / sd,
        operands: [a, b, c, d, sn, sd],
        operation: 'frac',
      };
    },
  },
];

export const MATH_OPERATIONS: OperationConfig[] = [
  { key: 'add', symbol: '+', label: 'Addition', color: '#6B9B4E', levels: ADDITION_LEVELS },
  { key: 'sub', symbol: '−', label: 'Subtraction', color: '#C57A4E', levels: SUBTRACTION_LEVELS },
  {
    key: 'mul',
    symbol: '×',
    label: 'Multiplication',
    color: '#6E8FB8',
    levels: MULTIPLICATION_LEVELS,
  },
  { key: 'div', symbol: '÷', label: 'Division', color: '#9A6CA8', levels: DIVISION_LEVELS },
  { key: 'alg', symbol: 'x', label: 'Algebra', color: '#B89A4E', levels: ALGEBRA_LEVELS },
  { key: 'frac', symbol: '½', label: 'Fractions', color: '#8A8AB8', levels: FRACTION_LEVELS },
];

export function getOperation(key: Operation): OperationConfig {
  const found = MATH_OPERATIONS.find((op) => op.key === key);
  if (!found) throw new Error(`Unknown operation: ${key}`);
  return found;
}

export type Difficulty = 'easier' | 'normal' | 'harder';

function problemComplexity(p: GeneratedProblem): number {
  // a rough complexity score: sum of operand magnitudes
  return p.operands.reduce((sum, n) => sum + Math.abs(n), 0);
}

export function generateAdaptive(
  level: Level,
  rng: () => number,
  difficulty: Difficulty,
): GeneratedProblem {
  if (difficulty === 'normal') return level.generate(rng);
  const candidates: GeneratedProblem[] = [level.generate(rng), level.generate(rng)];
  if (difficulty === 'easier') {
    candidates.sort((a, b) => problemComplexity(a) - problemComplexity(b));
  } else {
    candidates.sort((a, b) => problemComplexity(b) - problemComplexity(a));
  }
  return candidates[0];
}

export function checkAnswer(problem: GeneratedProblem, input: string): boolean {
  const trimmed = input.trim();
  if (problem.operation === 'div') {
    const remainderMatch = trimmed.match(/^(-?\d+)\s*r\s*(\d+)$/i);
    if (remainderMatch) {
      const q = Number(remainderMatch[1]);
      const r = Number(remainderMatch[2]);
      const expected = problem.answer;
      const expectedQ = Math.floor(expected);
      const expectedR = Math.round((expected - expectedQ) * 1000);
      return q === expectedQ && r === expectedR;
    }
  }
  const n = parseFractionInput(trimmed);
  if (n === null) return false;
  return Math.abs(n - problem.answer) < 1e-6;
}

function parseFractionInput(input: string): number | null {
  const trimmed = input.trim().replace(/\s+/g, '');
  const fracMatch = trimmed.match(/^(-?\d+)\/(-?\d+)$/);
  if (fracMatch) {
    const num = Number(fracMatch[1]);
    const den = Number(fracMatch[2]);
    if (den === 0) return null;
    return num / den;
  }
  const n = Number(trimmed);
  if (Number.isNaN(n)) return null;
  return n;
}

export function formatAnswer(problem: GeneratedProblem): string {
  if (problem.operation === 'div') {
    const wholeQ = Math.floor(problem.answer);
    const remPart = (problem.answer - wholeQ) * 1000;
    if (
      Math.abs(remPart - Math.round(remPart)) < 1e-6 &&
      remPart >= 1 &&
      remPart < problem.operands[1]
    ) {
      return `${wholeQ} r ${Math.round(remPart)}`;
    }
  }
  if (problem.operation === 'frac') {
    const ops = problem.operands;
    if (ops.length >= 2) {
      const sd = ops[ops.length - 1];
      const sn = ops[ops.length - 2];
      if (Number.isInteger(sn) && Number.isInteger(sd) && sd > 0) {
        if (sd === 1) return String(sn);
        return `${sn}/${sd}`;
      }
    }
  }
  return String(problem.answer);
}
