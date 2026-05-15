import { spawn } from 'node:child_process';

import type { AgentEvent, CodingAgentAdapter, RunMissionInput } from './types';

function commandExists(command: string) {
  return new Promise<boolean>((resolve) => {
    const child = spawn(command, ['--version'], { shell: false });
    child.on('error', () => resolve(false));
    child.on('close', (code) => resolve(code === 0));
  });
}

function modeInstruction(mode: RunMissionInput['mode']) {
  if (mode === 'plan') return 'Work in planning mode. Inspect first and propose a concise plan.';
  if (mode === 'fix') return 'Fix the described issue with the smallest safe code change.';
  if (mode === 'review')
    return 'Review the code and prioritize bugs, regressions, and missing tests.';
  return 'Implement the mission with focused, production-quality changes.';
}

async function* runCliMission(
  command: string,
  args: string[],
  input: RunMissionInput,
): AsyncGenerator<AgentEvent> {
  yield { type: 'command_started', command, args };

  const child = spawn(command, args, {
    cwd: input.projectPath,
    shell: false,
    env: process.env,
  });

  let spawnError: Error | null = null;

  const queue: AgentEvent[] = [];
  let notify: (() => void) | null = null;
  let closed = false;

  function push(event: AgentEvent) {
    queue.push(event);
    notify?.();
    notify = null;
  }

  child.stdout?.on('data', (chunk) => {
    push({ type: 'output', stream: 'stdout', text: chunk.toString() });
  });
  child.stderr?.on('data', (chunk) => {
    push({ type: 'output', stream: 'stderr', text: chunk.toString() });
  });
  child.on('error', (error) => {
    spawnError = error;
    push({ type: 'error', message: error.message });
  });
  child.on('close', (code) => {
    push({ type: 'command_finished', exitCode: code });
    push({ type: 'mission_complete', success: code === 0 && !spawnError });
    closed = true;
  });

  while (!closed || queue.length > 0) {
    if (queue.length > 0) {
      yield queue.shift() as AgentEvent;
    } else {
      await new Promise<void>((resolve) => {
        notify = resolve;
      });
    }
  }
}

class CodexAdapter implements CodingAgentAdapter {
  id = 'codex';
  name = 'Codex';

  isAvailable() {
    return commandExists('codex');
  }

  runMission(input: RunMissionInput) {
    const prompt = `${modeInstruction(input.mode)}\n\nProject root: ${input.projectPath}\n\n${input.prompt}`;
    return runCliMission('codex', ['exec', prompt], input);
  }
}

class ClaudeCodeAdapter implements CodingAgentAdapter {
  id = 'claude';
  name = 'Claude Code';

  isAvailable() {
    return commandExists('claude');
  }

  runMission(input: RunMissionInput) {
    const prompt = `${modeInstruction(input.mode)}\n\nProject root: ${input.projectPath}\n\n${input.prompt}`;
    return runCliMission('claude', ['-p', prompt], input);
  }
}

export const codingAgentAdapters: CodingAgentAdapter[] = [
  new CodexAdapter(),
  new ClaudeCodeAdapter(),
];

export function getCodingAgentAdapter(id: string) {
  return codingAgentAdapters.find((adapter) => adapter.id === id) ?? null;
}
