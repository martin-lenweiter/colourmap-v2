import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

import { runArchitecturePolicyCheck } from '@/scripts/check-architecture-policy';
import { runTestPairPolicyCheck } from '@/scripts/check-test-pairs';
import {
  collectRepoFiles,
  collectSourceFiles,
  extractImportSpecifiers,
  findArchitectureViolations,
  findMissingTestPairs,
  loadFileContents,
  type RepoPolicyConfig,
  resolveImportPath,
} from '@/scripts/repo-policy';

const basePolicy: RepoPolicyConfig = {
  routeServiceOwnership: {
    'app/api/check-ins/route.ts': 'lib/services/check-ins.ts',
  },
  testPairExceptions: {
    routes: [],
    services: [],
  },
};

describe('extractImportSpecifiers', () => {
  it('finds aliased, relative, export-from, and dynamic imports', () => {
    const source = `
      import { x } from '@/lib/services/check-ins';
      export { y } from '../lib/db/client';
      const mod = import('./local');
    `;

    expect(extractImportSpecifiers(source)).toEqual([
      '@/lib/services/check-ins',
      '../lib/db/client',
      './local',
    ]);
  });
});

describe('filesystem helpers', () => {
  it('collects source files and ignores tests', () => {
    const rootDir = mkdtempSync(path.join(os.tmpdir(), 'repo-policy-'));
    mkdirSync(path.join(rootDir, 'app', 'api', 'foo'), { recursive: true });
    writeFileSync(path.join(rootDir, 'app', 'api', 'foo', 'route.ts'), 'export {}');
    writeFileSync(path.join(rootDir, 'app', 'api', 'foo', 'route.test.ts'), 'export {}');
    writeFileSync(path.join(rootDir, 'app', 'api', 'foo', 'notes.md'), '# no');

    expect(collectSourceFiles(rootDir, 'app')).toEqual(['app/api/foo/route.ts']);
    expect(collectSourceFiles(rootDir, 'missing')).toEqual([]);
  });

  it('collects repo files and loads file contents', () => {
    const rootDir = mkdtempSync(path.join(os.tmpdir(), 'repo-policy-'));
    mkdirSync(path.join(rootDir, 'lib', 'services'), { recursive: true });
    writeFileSync(path.join(rootDir, 'lib', 'services', 'foo.ts'), 'export const foo = 1;');

    expect(collectRepoFiles(rootDir, ['lib'])).toEqual(['lib/services/foo.ts']);
    expect(loadFileContents(rootDir, ['lib/services/foo.ts'])).toEqual({
      'lib/services/foo.ts': readFileSync(path.join(rootDir, 'lib', 'services', 'foo.ts'), 'utf8'),
    });
  });
});

describe('resolveImportPath', () => {
  it('resolves aliased and relative imports and ignores package imports', () => {
    expect(resolveImportPath('app/api/foo/route.ts', '@/lib/services/foo')).toBe(
      'lib/services/foo',
    );
    expect(resolveImportPath('app/api/foo/route.ts', '../bar')).toBe('app/api/bar');
    expect(resolveImportPath('app/api/foo/route.ts', 'next/server')).toBeNull();
  });
});

describe('findArchitectureViolations', () => {
  it('fails service-owned routes that bypass the DB layer directly', () => {
    const files = [
      'app/api/check-ins/route.ts',
      'components/Widget.tsx',
      'lib/services/check-ins.ts',
      'lib/db/client.ts',
    ];
    const fileContents = {
      'app/api/check-ins/route.ts': `
        import { listRecentCheckIns } from '@/lib/services/check-ins';
        import { getDb } from '@/lib/db/client';
      `,
      'components/Widget.tsx': `export function Widget() { return null; }`,
      'lib/services/check-ins.ts': `export async function listRecentCheckIns() { return []; }`,
      'lib/db/client.ts': `export function getDb() { return null; }`,
    };

    expect(findArchitectureViolations(files, fileContents, basePolicy)).toContainEqual({
      file: 'app/api/check-ins/route.ts',
      message: 'service-owned route must not import DB modules directly (lib/db/client)',
    });
  });

  it('accepts service ownership imports without a file extension', () => {
    const files = ['app/api/check-ins/route.ts', 'lib/services/check-ins.ts'];
    const fileContents = {
      'app/api/check-ins/route.ts': `import { listRecentCheckIns } from '@/lib/services/check-ins';`,
      'lib/services/check-ins.ts': `export async function listRecentCheckIns() { return []; }`,
    };

    expect(findArchitectureViolations(files, fileContents, basePolicy)).toEqual([]);
  });

  it('fails components that import DB modules', () => {
    const files = ['components/Widget.tsx', 'lib/db/client.ts'];
    const fileContents = {
      'components/Widget.tsx': `import { getDb } from '@/lib/db/client';`,
      'lib/db/client.ts': `export function getDb() { return null; }`,
    };

    expect(
      findArchitectureViolations(files, fileContents, {
        routeServiceOwnership: {},
        testPairExceptions: { routes: [], services: [] },
      }),
    ).toContainEqual({
      file: 'components/Widget.tsx',
      message: 'components must not import DB modules directly (lib/db/client)',
    });
  });

  it('reports missing ownership targets and cross-layer violations', () => {
    const files = ['lib/db/client.ts', 'lib/services/foo.ts', 'app/api/foo/route.ts'];
    const fileContents = {
      'lib/db/client.ts': `
        import Widget from '@/components/Widget';
        import { foo } from '@/lib/services/foo';
      `,
      'lib/services/foo.ts': `import Page from '@/app/page';`,
      'app/api/foo/route.ts': `import Widget from '@/components/Widget';`,
    };

    expect(
      findArchitectureViolations(files, fileContents, {
        routeServiceOwnership: {
          'app/api/missing/route.ts': 'lib/services/missing.ts',
          'app/api/foo/route.ts': 'lib/services/foo.ts',
        },
        testPairExceptions: { routes: [], services: [] },
      }),
    ).toEqual(
      expect.arrayContaining([
        {
          file: 'app/api/missing/route.ts',
          message: 'configured route-service ownership references a missing route file',
        },
        {
          file: 'app/api/missing/route.ts',
          message: 'configured service owner lib/services/missing.ts does not exist',
        },
        {
          file: 'lib/db/client.ts',
          message: 'DB modules must not import components (components/Widget)',
        },
        {
          file: 'lib/db/client.ts',
          message: 'DB modules must not import services (lib/services/foo)',
        },
        {
          file: 'lib/services/foo.ts',
          message: 'service modules must not import app layer files (app/page)',
        },
        {
          file: 'app/api/foo/route.ts',
          message: 'route handlers must not import components (components/Widget)',
        },
        {
          file: 'app/api/foo/route.ts',
          message: 'route is service-owned by lib/services/foo.ts but does not import that service',
        },
      ]),
    );
  });
});

describe('findMissingTestPairs', () => {
  it('reports missing route and service tests', () => {
    expect(
      findMissingTestPairs(['app/api/foo/route.ts', 'lib/services/foo.ts'], {
        routeServiceOwnership: {},
        testPairExceptions: { routes: [], services: [] },
      }),
    ).toEqual([
      {
        file: 'app/api/foo/route.ts',
        message: 'route.ts is missing a sibling route.test.ts or route.test.tsx',
      },
      {
        file: 'lib/services/foo.ts',
        message: 'service file is missing a sibling .test.ts or .test.tsx file',
      },
    ]);
  });

  it('respects explicit exceptions', () => {
    expect(
      findMissingTestPairs(['app/api/foo/route.ts', 'lib/services/foo.ts'], {
        routeServiceOwnership: {},
        testPairExceptions: {
          routes: ['app/api/foo/route.ts'],
          services: ['lib/services/foo.ts'],
        },
      }),
    ).toEqual([]);
  });

  it('reports stale exception entries', () => {
    expect(
      findMissingTestPairs([], {
        routeServiceOwnership: {},
        testPairExceptions: {
          routes: ['app/api/foo/route.ts'],
          services: ['lib/services/foo.ts'],
        },
      }),
    ).toEqual([
      {
        file: 'app/api/foo/route.ts',
        message: 'route test exception references a missing route file',
      },
      {
        file: 'lib/services/foo.ts',
        message: 'service test exception references a missing service file',
      },
    ]);
  });
});

describe('policy cli wrappers', () => {
  it('runs the architecture policy against the current repo', () => {
    expect(runArchitecturePolicyCheck(process.cwd())).toEqual([]);
  });

  it('runs the test-pair policy against the current repo', () => {
    expect(runTestPairPolicyCheck(process.cwd())).toEqual([]);
  });
});
