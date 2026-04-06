import process from 'node:process';

import {
  collectSourceFiles,
  findArchitectureViolations,
  loadFileContents,
  loadRepoPolicyConfig,
} from '@/scripts/repo-policy';

export function runArchitecturePolicyCheck(rootDir = process.cwd()) {
  const config = loadRepoPolicyConfig();
  const files = [
    ...collectSourceFiles(rootDir, 'app'),
    ...collectSourceFiles(rootDir, 'components'),
    ...collectSourceFiles(rootDir, 'lib'),
  ];
  const uniqueFiles = [...new Set(files)].sort();
  const fileContents = loadFileContents(rootDir, uniqueFiles);
  const violations = findArchitectureViolations(uniqueFiles, fileContents, config);

  if (violations.length > 0) {
    console.error('Violation: architecture boundary policy failed.');
    for (const violation of violations) {
      console.error(` - ${violation.file}: ${violation.message}`);
    }
    return violations;
  }

  console.log('OK: architecture boundary policy passed.');
  return violations;
}

if (process.argv[1]?.endsWith('check-architecture-policy.ts')) {
  if (runArchitecturePolicyCheck().length > 0) {
    process.exit(1);
  }
}
