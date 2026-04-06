import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  createProtectedBaseline,
  evaluateProtectedRegression,
  evaluateThresholds,
} from './coverage-gate.mjs';

const config = {
  thresholds: [
    {
      name: 'services',
      description: 'service threshold',
      include: [{ prefix: 'lib/services/', extensions: ['.ts'] }],
      excludeSuffixes: ['.test.ts'],
      metrics: {
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 80,
      },
    },
    {
      name: 'ui',
      description: 'ui threshold',
      include: [{ prefix: 'components/', extensions: ['.tsx'] }],
      excludeSuffixes: ['.test.tsx'],
      metrics: {
        lines: 20,
        statements: 20,
        functions: 20,
        branches: 20,
      },
    },
  ],
  protectedPaths: {
    include: [
      { prefix: 'app/api/', extensions: ['.ts'] },
      { prefix: 'lib/services/', extensions: ['.ts'] },
    ],
    excludeSuffixes: ['.test.ts'],
  },
};

function coverageEntry(pct: number) {
  return {
    branches: { total: 10, covered: Math.round((pct / 100) * 10), pct },
    functions: { total: 10, covered: Math.round((pct / 100) * 10), pct },
    lines: { total: 10, covered: Math.round((pct / 100) * 10), pct },
    statements: { total: 10, covered: Math.round((pct / 100) * 10), pct },
  };
}

const tempDirs: string[] = [];

function createFixtureCwd() {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'coverage-gate-'));
  tempDirs.push(cwd);

  for (const relativePath of [
    'lib/services/example.ts',
    'lib/services/example.test.ts',
    'components/card.tsx',
    'components/card.test.tsx',
    'app/api/example/route.ts',
  ]) {
    const absolutePath = path.join(cwd, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, '// fixture\n');
  }

  return cwd;
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

describe('coverage gate', () => {
  it('fails threshold groups that drop below weighted targets', () => {
    const cwd = createFixtureCwd();
    const summary = {
      [path.join(cwd, 'lib/services/example.ts')]: coverageEntry(92),
      [path.join(cwd, 'components/card.tsx')]: coverageEntry(10),
    };

    const result = evaluateThresholds(summary, config, cwd);

    expect(result.failures).toContain('Coverage group "ui" failed lines: 10.00% < 20.00%');
    expect(result.failures).not.toContain(
      'Coverage group "services" failed lines: 92.00% < 90.00%',
    );
  });

  it('captures protected-path baselines and reports regressions', () => {
    const cwd = createFixtureCwd();
    const baselineSummary = {
      [path.join(cwd, 'app/api/example/route.ts')]: coverageEntry(40),
      [path.join(cwd, 'lib/services/example.ts')]: coverageEntry(100),
    };

    const protectedPaths = createProtectedBaseline(baselineSummary, config, cwd);

    const currentSummary = {
      [path.join(cwd, 'app/api/example/route.ts')]: coverageEntry(35),
      [path.join(cwd, 'lib/services/example.ts')]: coverageEntry(100),
    };

    const failures = evaluateProtectedRegression(currentSummary, config, { protectedPaths }, cwd);

    expect(failures).toContain(
      'Protected path regression for app/api/example/route.ts lines: 35.00% < baseline 40.00%',
    );
  });
});
