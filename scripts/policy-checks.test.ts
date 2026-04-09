import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

const tempDirs: string[] = [];
const repoRoot = process.cwd();

function execGit(cwd: string, args: string[], env?: NodeJS.ProcessEnv) {
  return execFileSync('git', ['-c', 'core.hooksPath=/dev/null', ...args], {
    cwd,
    env: { ...process.env, LEFTHOOK: '0', HUSKY: '0', ...env },
    stdio: 'pipe',
    encoding: 'utf8',
  }).trim();
}

function writeFile(cwd: string, relativePath: string, contents: string) {
  const absolutePath = path.join(cwd, relativePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, contents);
}

function createPolicyRepo() {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'policy-checks-'));
  tempDirs.push(cwd);

  execGit(cwd, ['init', '-b', 'main']);
  execGit(cwd, ['config', 'user.name', 'Codex']);
  execGit(cwd, ['config', 'user.email', 'codex@example.com']);

  writeFile(cwd, 'README.md', '# fixture\n');
  execGit(cwd, ['add', 'README.md']);
  execGit(cwd, ['commit', '-m', 'base']);

  const baseSha = execGit(cwd, ['rev-parse', 'HEAD']);
  execGit(cwd, ['update-ref', 'refs/remotes/origin/main', baseSha]);

  return cwd;
}

function commitAll(cwd: string, message: string) {
  execGit(cwd, ['add', '.']);
  execGit(cwd, ['commit', '-m', message]);
}

function runPolicyScript(
  cwd: string,
  scriptName: 'check-pr-scope.sh' | 'check-spec-drift.sh' | 'check-test-drift.sh',
  env: Record<string, string>,
) {
  return spawnSync('bash', [path.join(repoRoot, 'scripts', scriptName)], {
    cwd,
    env: { ...process.env, ...env },
    encoding: 'utf8',
  });
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { force: true, recursive: true });
  }
});

describe('policy shell scripts', () => {
  it('does not treat an unchecked LARGE_PR_APPROVED checklist item as approval', () => {
    const cwd = createPolicyRepo();

    for (let index = 1; index <= 26; index += 1) {
      writeFile(cwd, `docs/file-${index}.md`, `file ${index}\n`);
    }
    commitAll(cwd, 'create oversized diff');

    const result = runPolicyScript(cwd, 'check-pr-scope.sh', {
      PR_BODY: '- [ ] LARGE_PR_APPROVED',
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain('Violation: PR scope exceeds policy thresholds:');
  });

  it('accepts an active LARGE_PR_APPROVED declaration in the PR body', () => {
    const cwd = createPolicyRepo();

    for (let index = 1; index <= 26; index += 1) {
      writeFile(cwd, `docs/file-${index}.md`, `file ${index}\n`);
    }
    commitAll(cwd, 'create oversized diff');

    const result = runPolicyScript(cwd, 'check-pr-scope.sh', {
      PR_BODY: '- [x] LARGE_PR_APPROVED: required for policy fixture',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain(
      'WARNING: PR scope exceeds fail thresholds, but LARGE_PR_APPROVED bypass is present:',
    );
  });

  it('does not treat an unchecked no-spec-impact checklist item as a spec-drift bypass', () => {
    const cwd = createPolicyRepo();

    writeFile(cwd, 'app/example/page.tsx', 'export default function Page() { return null; }\n');
    commitAll(cwd, 'change behavior without spec');

    const result = runPolicyScript(cwd, 'check-spec-drift.sh', {
      SPEC_PR_BODY: '- [ ] no-spec-impact',
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain(
      'Violation: behavior-changing files were modified without a docs/specs update or no-spec-impact declaration:',
    );
  });

  it('accepts an active no-spec-impact declaration for spec drift', () => {
    const cwd = createPolicyRepo();

    writeFile(cwd, 'app/example/page.tsx', 'export default function Page() { return null; }\n');
    commitAll(cwd, 'internal change');

    const result = runPolicyScript(cwd, 'check-spec-drift.sh', {
      SPEC_PR_BODY: '- [x] no-spec-impact',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('OK: no-spec-impact declaration detected.');
  });

  it('does not treat an unchecked no-spec-impact checklist item as a test-drift bypass', () => {
    const cwd = createPolicyRepo();

    writeFile(cwd, 'lib/example.test.ts', 'import { expect, test } from "vitest";\n');
    commitAll(cwd, 'change tests without spec');

    const result = runPolicyScript(cwd, 'check-test-drift.sh', {
      TEST_DRIFT_PR_BODY: '- [ ] no-spec-impact',
    });

    expect(result.status).toBe(1);
    expect(result.stdout).toContain(
      'Violation: test files changed without a docs/specs update or no-spec-impact declaration:',
    );
  });

  it('accepts an active no-spec-impact declaration for test drift', () => {
    const cwd = createPolicyRepo();

    writeFile(cwd, 'lib/example.test.ts', 'import { expect, test } from "vitest";\n');
    commitAll(cwd, 'internal test maintenance');

    const result = runPolicyScript(cwd, 'check-test-drift.sh', {
      TEST_DRIFT_PR_BODY: 'no-spec-impact',
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('OK: no-spec-impact declaration detected.');
  });
});
