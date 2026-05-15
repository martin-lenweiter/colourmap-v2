import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

function runGit(projectPath: string, args: string[]) {
  return new Promise<{ code: number | null; stdout: string; stderr: string }>((resolve) => {
    const child = spawn('git', args, { cwd: projectPath, shell: false });
    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr?.on('data', (chunk) => {
      stderr += chunk.toString();
    });
    child.on('error', (error) => {
      resolve({ code: 1, stdout, stderr: error.message });
    });
    child.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });
  });
}

export async function isGitRepo(projectPath: string) {
  const result = await runGit(projectPath, ['rev-parse', '--is-inside-work-tree']);
  return result.code === 0 && result.stdout.trim() === 'true';
}

export async function getGitBranch(projectPath: string) {
  if (!(await isGitRepo(projectPath))) return null;
  const result = await runGit(projectPath, ['branch', '--show-current']);
  return result.code === 0 ? result.stdout.trim() || 'detached' : null;
}

export async function listChangedFiles(projectPath: string) {
  if (!(await isGitRepo(projectPath))) return [];
  const result = await runGit(projectPath, ['status', '--porcelain=v1']);
  if (result.code !== 0) return [];

  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
}

export async function getGitDiff(projectPath: string) {
  if (!(await isGitRepo(projectPath))) return '';
  const result = await runGit(projectPath, ['diff', '--no-ext-diff']);
  return result.code === 0 ? result.stdout : result.stderr;
}

export async function createCheckpoint(projectPath: string) {
  if (!(await isGitRepo(projectPath))) {
    return { created: false, reason: 'Not a Git repository.' };
  }

  const diff = await getGitDiff(projectPath);
  const changedFiles = await listChangedFiles(projectPath);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const checkpointDir = path.join(projectPath, '.git', 'colourmap-build-lab');
  await fs.mkdir(checkpointDir, { recursive: true });
  const filePath = path.join(checkpointDir, `${stamp}.patch`);
  const body = [
    `# Colourmap Build Lab checkpoint`,
    `# Created: ${new Date().toISOString()}`,
    `# Changed files: ${changedFiles.length}`,
    '',
    diff || '# No unstaged diff at checkpoint time.',
    '',
  ].join('\n');
  await fs.writeFile(filePath, body, 'utf8');

  return { created: true, path: filePath, changedFiles };
}
