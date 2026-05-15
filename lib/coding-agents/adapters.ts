import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';

import type { AgentEvent, CodingAgentAdapter, RunMissionInput } from './types';

type CliCommand = {
  command: string;
  baseArgs: string[];
  displayCommand: string;
};

const plainCommand = (command: string): CliCommand => ({
  command,
  baseArgs: [],
  displayCommand: command,
});

export function getCodexCliCommand(
  env: Partial<NodeJS.ProcessEnv> = process.env,
  platform = process.platform,
  fileExists: (filePath: string) => boolean = existsSync,
): CliCommand {
  if (platform === 'win32' && env.APPDATA) {
    const scriptPath = path.win32.join(
      env.APPDATA,
      'npm',
      'node_modules',
      '@openai',
      'codex',
      'bin',
      'codex.js',
    );
    if (fileExists(scriptPath)) {
      return {
        command: 'node.exe',
        baseArgs: [scriptPath],
        displayCommand: 'codex',
      };
    }
  }

  return plainCommand('codex');
}

function commandExists(cli: CliCommand) {
  return new Promise<boolean>((resolve) => {
    const child = spawn(cli.command, [...cli.baseArgs, '--version'], { shell: false });
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
  cli: CliCommand,
  args: string[],
  input: RunMissionInput,
): AsyncGenerator<AgentEvent> {
  yield { type: 'command_started', command: cli.displayCommand, args };

  const child = spawn(cli.command, [...cli.baseArgs, ...args], {
    cwd: input.projectPath,
    shell: false,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
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
    return commandExists(getCodexCliCommand());
  }

  runMission(input: RunMissionInput) {
    const prompt = `${modeInstruction(input.mode)}\n\nProject root: ${input.projectPath}\n\n${input.prompt}`;
    return runCliMission(
      getCodexCliCommand(),
      ['exec', '--json', '--cd', input.projectPath, prompt],
      input,
    );
  }
}

class ClaudeCodeAdapter implements CodingAgentAdapter {
  id = 'claude';
  name = 'Claude Code';

  isAvailable() {
    return commandExists(plainCommand('claude'));
  }

  runMission(input: RunMissionInput) {
    const prompt = `${modeInstruction(input.mode)}\n\nProject root: ${input.projectPath}\n\n${input.prompt}`;
    return runCliMission(plainCommand('claude'), ['-p', prompt], input);
  }
}

export const codingAgentAdapters: CodingAgentAdapter[] = [
  new CodexAdapter(),
  new ClaudeCodeAdapter(),
];

export function getCodingAgentAdapter(id: string) {
  return codingAgentAdapters.find((adapter) => adapter.id === id) ?? null;
}
