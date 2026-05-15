import { describe, expect, it } from 'vitest';

import { getCodexCliCommand } from './adapters';

describe('coding agent adapters', () => {
  it('uses the npm Codex JS entrypoint on Windows when the shim exists', () => {
    const cli = getCodexCliCommand(
      { APPDATA: 'C:\\Users\\victor\\AppData\\Roaming' },
      'win32',
      (filePath) => filePath.endsWith('npm\\node_modules\\@openai\\codex\\bin\\codex.js'),
    );

    expect(cli).toEqual({
      command: 'node.exe',
      baseArgs: [
        'C:\\Users\\victor\\AppData\\Roaming\\npm\\node_modules\\@openai\\codex\\bin\\codex.js',
      ],
      displayCommand: 'codex',
    });
  });

  it('falls back to the plain codex command outside the Windows npm install path', () => {
    expect(getCodexCliCommand({}, 'linux', () => false)).toEqual({
      command: 'codex',
      baseArgs: [],
      displayCommand: 'codex',
    });
  });
});
