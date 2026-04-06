import process from 'node:process';

import {
  collectRepoFiles,
  findMissingTestPairs,
  loadRepoPolicyConfig,
} from '@/scripts/repo-policy';

export function runTestPairPolicyCheck(rootDir = process.cwd()) {
  const config = loadRepoPolicyConfig();
  const repoFiles = collectRepoFiles(rootDir, ['app', 'lib']);
  const violations = findMissingTestPairs(repoFiles, config);

  if (violations.length > 0) {
    console.error('Violation: repo-reality test pairing policy failed.');
    for (const violation of violations) {
      console.error(` - ${violation.file}: ${violation.message}`);
    }
    return violations;
  }

  console.log('OK: repo-reality test pairing policy passed.');
  return violations;
}

if (process.argv[1]?.endsWith('check-test-pairs.ts')) {
  if (runTestPairPolicyCheck().length > 0) {
    process.exit(1);
  }
}
