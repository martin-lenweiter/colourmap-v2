import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import repoPolicy from '@/config/repo-policy.json';

export type RepoPolicyConfig = {
  routeServiceOwnership: Record<string, string>;
  testPairExceptions: {
    routes: string[];
    services: string[];
  };
};

export type PolicyViolation = {
  file: string;
  message: string;
};

const IMPORT_PATTERNS = [
  /(?:import|export)\s+(?:type\s+)?(?:[\s\w{},*]+\s+from\s+)?['"]([^'"]+)['"]/g,
  /import\(\s*['"]([^'"]+)['"]\s*\)/g,
];

const SOURCE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.mts']);

export function loadRepoPolicyConfig(): RepoPolicyConfig {
  return repoPolicy as RepoPolicyConfig;
}

export function collectSourceFiles(rootDir: string, startDir: string): string[] {
  const absoluteStartDir = path.join(rootDir, startDir);
  if (!existsSync(absoluteStartDir)) {
    return [];
  }

  const files: string[] = [];

  function visit(currentDir: string) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const absoluteEntryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        visit(absoluteEntryPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const extension = path.extname(entry.name);
      if (!SOURCE_EXTENSIONS.has(extension)) {
        continue;
      }

      const relativePath = toRepoPath(rootDir, absoluteEntryPath);
      if (
        relativePath.includes('/__snapshots__/') ||
        relativePath.endsWith('.d.ts') ||
        relativePath.endsWith('.test.ts') ||
        relativePath.endsWith('.test.tsx')
      ) {
        continue;
      }

      files.push(relativePath);
    }
  }

  visit(absoluteStartDir);
  return files.sort();
}

export function collectRepoFiles(rootDir: string, startDirs: string[]): string[] {
  const repoFiles = new Set<string>();

  function visit(currentDir: string) {
    for (const entry of readdirSync(currentDir, { withFileTypes: true })) {
      const absoluteEntryPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        visit(absoluteEntryPath);
        continue;
      }

      if (entry.isFile()) {
        repoFiles.add(toRepoPath(rootDir, absoluteEntryPath));
      }
    }
  }

  for (const startDir of startDirs) {
    const absoluteStartDir = path.join(rootDir, startDir);
    if (existsSync(absoluteStartDir)) {
      visit(absoluteStartDir);
    }
  }

  return [...repoFiles].sort();
}

export function loadFileContents(rootDir: string, files: string[]): Record<string, string> {
  return Object.fromEntries(
    files.map((file) => [file, readFileSync(path.join(rootDir, file), 'utf8')]),
  );
}

export function extractImportSpecifiers(sourceText: string): string[] {
  const specifiers = new Set<string>();

  for (const pattern of IMPORT_PATTERNS) {
    pattern.lastIndex = 0;

    for (const match of sourceText.matchAll(pattern)) {
      if (match[1]) {
        specifiers.add(match[1]);
      }
    }
  }

  return [...specifiers];
}

export function resolveImportPath(fromFile: string, specifier: string): string | null {
  if (specifier.startsWith('@/')) {
    return normalizePath(specifier.slice(2));
  }

  if (specifier.startsWith('./') || specifier.startsWith('../')) {
    return normalizePath(path.posix.join(path.posix.dirname(fromFile), specifier));
  }

  return null;
}

export function findArchitectureViolations(
  files: string[],
  fileContents: Record<string, string>,
  config: RepoPolicyConfig,
): PolicyViolation[] {
  const violations: PolicyViolation[] = [];

  for (const [routePath, servicePath] of Object.entries(config.routeServiceOwnership)) {
    if (!(routePath in fileContents)) {
      violations.push({
        file: routePath,
        message: 'configured route-service ownership references a missing route file',
      });
    }

    if (!(servicePath in fileContents) && !existsSync(servicePath)) {
      violations.push({
        file: routePath,
        message: `configured service owner ${servicePath} does not exist`,
      });
    }
  }

  for (const file of files) {
    const resolvedImports = extractImportSpecifiers(fileContents[file] ?? '')
      .map((specifier) => resolveImportPath(file, specifier))
      .filter((value): value is string => value !== null);

    if (file.startsWith('components/')) {
      for (const importedPath of resolvedImports) {
        if (importedPath.startsWith('lib/db/')) {
          violations.push({
            file,
            message: `components must not import DB modules directly (${importedPath})`,
          });
        }
        if (importedPath.startsWith('lib/services/')) {
          violations.push({
            file,
            message: `components must not import service modules directly (${importedPath})`,
          });
        }
      }
    }

    if (file.startsWith('lib/db/')) {
      for (const importedPath of resolvedImports) {
        if (importedPath.startsWith('app/')) {
          violations.push({
            file,
            message: `DB modules must not import app layer files (${importedPath})`,
          });
        }
        if (importedPath.startsWith('components/')) {
          violations.push({
            file,
            message: `DB modules must not import components (${importedPath})`,
          });
        }
        if (importedPath.startsWith('lib/services/')) {
          violations.push({
            file,
            message: `DB modules must not import services (${importedPath})`,
          });
        }
      }
    }

    if (file.startsWith('lib/services/')) {
      for (const importedPath of resolvedImports) {
        if (importedPath.startsWith('app/')) {
          violations.push({
            file,
            message: `service modules must not import app layer files (${importedPath})`,
          });
        }
        if (importedPath.startsWith('components/')) {
          violations.push({
            file,
            message: `service modules must not import components (${importedPath})`,
          });
        }
      }
    }

    if (!isApiRoute(file)) {
      continue;
    }

    for (const importedPath of resolvedImports) {
      if (importedPath.startsWith('components/')) {
        violations.push({
          file,
          message: `route handlers must not import components (${importedPath})`,
        });
      }
    }

    const ownerPath = config.routeServiceOwnership[file];
    if (!ownerPath) {
      continue;
    }

    if (!resolvedImports.some((importedPath) => sameModulePath(importedPath, ownerPath))) {
      violations.push({
        file,
        message: `route is service-owned by ${ownerPath} but does not import that service`,
      });
    }

    for (const importedPath of resolvedImports) {
      if (importedPath.startsWith('lib/db/')) {
        violations.push({
          file,
          message: `service-owned route must not import DB modules directly (${importedPath})`,
        });
      }
    }
  }

  return dedupeViolations(violations);
}

export function findMissingTestPairs(
  repoFiles: string[],
  config: RepoPolicyConfig,
): PolicyViolation[] {
  const repoFileSet = new Set(repoFiles);
  const violations: PolicyViolation[] = [];
  const routeExceptions = new Set(config.testPairExceptions.routes);
  const serviceExceptions = new Set(config.testPairExceptions.services);

  for (const exceptionPath of routeExceptions) {
    if (!repoFileSet.has(exceptionPath)) {
      violations.push({
        file: exceptionPath,
        message: 'route test exception references a missing route file',
      });
    }
  }

  for (const exceptionPath of serviceExceptions) {
    if (!repoFileSet.has(exceptionPath)) {
      violations.push({
        file: exceptionPath,
        message: 'service test exception references a missing service file',
      });
    }
  }

  for (const file of repoFiles) {
    if (isApiRoute(file) && !routeExceptions.has(file)) {
      const routeDir = path.posix.dirname(file);
      const hasSiblingTest =
        repoFileSet.has(path.posix.join(routeDir, 'route.test.ts')) ||
        repoFileSet.has(path.posix.join(routeDir, 'route.test.tsx'));

      if (!hasSiblingTest) {
        violations.push({
          file,
          message: 'route.ts is missing a sibling route.test.ts or route.test.tsx',
        });
      }
    }

    if (
      file.startsWith('lib/services/') &&
      file.endsWith('.ts') &&
      !file.endsWith('.test.ts') &&
      !serviceExceptions.has(file)
    ) {
      const basePath = file.slice(0, -3);
      const hasSiblingTest =
        repoFileSet.has(`${basePath}.test.ts`) || repoFileSet.has(`${basePath}.test.tsx`);

      if (!hasSiblingTest) {
        violations.push({
          file,
          message: 'service file is missing a sibling .test.ts or .test.tsx file',
        });
      }
    }
  }

  return dedupeViolations(violations);
}

function dedupeViolations(violations: PolicyViolation[]): PolicyViolation[] {
  const seen = new Set<string>();

  return violations.filter((violation) => {
    const key = `${violation.file}::${violation.message}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function normalizePath(value: string): string {
  return path.posix.normalize(value.replace(/\\/g, '/')).replace(/^(\.\/)+/, '');
}

function sameModulePath(left: string, right: string): boolean {
  return stripSourceExtension(left) === stripSourceExtension(right);
}

function stripSourceExtension(value: string): string {
  return value.replace(/\.(?:[cm]?ts|[jt]sx?)$/, '');
}

function toRepoPath(rootDir: string, absolutePath: string): string {
  return normalizePath(path.relative(rootDir, absolutePath));
}

function isApiRoute(file: string): boolean {
  return file.startsWith('app/api/') && file.endsWith('/route.ts');
}
