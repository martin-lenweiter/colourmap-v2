'use client';

import { Bot, GitBranch, Mic, MicOff, Play, RefreshCw, SquareTerminal } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { useSpeechToText } from '@/lib/hooks/use-speech-to-text';

type Agent = {
  id: string;
  name: string;
  available: boolean;
};

type AgentMode = 'plan' | 'build' | 'fix' | 'review';

type ConsoleEvent = {
  id: number;
  type: string;
  text: string;
  tone?: 'normal' | 'error' | 'success' | 'meta';
};

type ProjectInfo = {
  projectPath: string;
  git: boolean;
  branch: string | null;
  changedFiles: string[];
};

const modes: { id: AgentMode; label: string }[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'build', label: 'Build' },
  { id: 'fix', label: 'Fix' },
  { id: 'review', label: 'Review' },
];

function nextId() {
  return Date.now() + Math.random();
}

export default function BuildLab() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentId, setAgentId] = useState('codex');
  const [mode, setMode] = useState<AgentMode>('build');
  const [projectPath, setProjectPath] = useState('');
  const [missionTitle, setMissionTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [events, setEvents] = useState<ConsoleEvent[]>([]);
  const [changedFiles, setChangedFiles] = useState<string[]>([]);
  const [diff, setDiff] = useState('');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const speech = useSpeechToText({ lang: 'en-US' });

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === agentId) ?? agents[0],
    [agents, agentId],
  );

  useEffect(() => {
    async function loadAgents() {
      const response = await fetch('/api/build-lab/availability');
      if (!response.ok) {
        setError(await response.text());
        return;
      }
      const data = (await response.json()) as { agents: Agent[] };
      setAgents(data.agents);
      setAgentId(data.agents.find((agent) => agent.available)?.id ?? data.agents[0]?.id ?? 'codex');
    }

    loadAgents();
  }, []);

  function addEvent(type: string, text: string, tone: ConsoleEvent['tone'] = 'normal') {
    setEvents((prev) => [...prev, { id: nextId(), type, text, tone }]);
  }

  async function inspectProject() {
    setError('');
    const response = await fetch('/api/build-lab/project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath }),
    });
    if (!response.ok) {
      setError((await response.json().catch(() => null))?.error ?? 'Could not inspect project.');
      return;
    }
    const data = (await response.json()) as ProjectInfo;
    setProjectInfo(data);
    setProjectPath(data.projectPath);
    setChangedFiles(data.changedFiles);
    addEvent('project', `Loaded ${data.projectPath}`, 'meta');
  }

  async function refreshDiff() {
    if (!projectPath.trim()) return;
    const response = await fetch('/api/build-lab/diff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath }),
    });
    if (!response.ok) return;
    const data = (await response.json()) as { diff: string; changedFiles: string[] };
    setDiff(data.diff);
    setChangedFiles(data.changedFiles);
  }

  async function runMission() {
    if (!prompt.trim()) {
      setError('Write or dictate a mission prompt first.');
      return;
    }
    setError('');
    setRunning(true);
    setEvents([]);
    setDiff('');
    addEvent('mission', missionTitle || 'Untitled coding mission', 'meta');

    try {
      const response = await fetch('/api/build-lab/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, projectPath, prompt, mode }),
      });

      if (!response.ok || !response.body) {
        throw new Error(await response.text());
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split('\n\n');
        buffer = chunks.pop() ?? '';
        for (const chunk of chunks) {
          const line = chunk
            .split('\n')
            .find((item) => item.startsWith('data: '))
            ?.slice(6);
          if (!line) continue;
          const event = JSON.parse(line) as {
            type: string;
            text?: string;
            stream?: string;
            message?: string;
            command?: string;
            args?: string[];
            path?: string;
            success?: boolean;
          };
          if (event.type === 'output') addEvent(event.stream ?? 'output', event.text ?? '');
          else if (event.type === 'error') addEvent('error', event.message ?? 'Error', 'error');
          else if (event.type === 'command_started')
            addEvent('command', `$ ${event.command} ${(event.args ?? []).join(' ')}`, 'meta');
          else if (event.type === 'command_finished')
            addEvent('command', 'Command finished', 'meta');
          else if (event.type === 'file_changed' && event.path)
            setChangedFiles((prev) => Array.from(new Set([...prev, event.path as string])));
          else if (event.type === 'mission_complete')
            addEvent(
              'complete',
              event.success ? 'Mission complete' : 'Mission failed',
              event.success ? 'success' : 'error',
            );
          else if (event.type === 'checkpoint')
            addEvent('checkpoint', 'Git checkpoint saved', 'meta');
        }
      }
      await refreshDiff();
    } catch (missionError) {
      setError(missionError instanceof Error ? missionError.message : 'Mission failed.');
    } finally {
      setRunning(false);
    }
  }

  function toggleSpeech() {
    if (speech.listening) {
      speech.stop();
    } else {
      speech.start(prompt, setPrompt);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-5">
      <section
        className="overflow-hidden rounded-[22px] border"
        style={{
          background: 'linear-gradient(135deg, rgba(255,248,224,0.96), rgba(225,197,143,0.9))',
          borderColor: 'rgba(112,73,38,0.18)',
          boxShadow: '0 18px 55px rgba(62,38,17,0.14)',
        }}
      >
        <div className="grid gap-0 lg:grid-cols-[0.95fr_1.3fr]">
          <div className="border-b border-[rgba(112,73,38,0.16)] p-5 lg:border-r lg:border-b-0">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-[#8d653d]">
                  Creator Space
                </p>
                <h1 className="mt-1 font-serif text-3xl text-[#442510]">Build Lab</h1>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#775638]">
                  A quiet mission desk for sending focused work to coding agents while Colourmap
                  keeps the map, logs, checkpoints, and diff.
                </p>
              </div>
              <div className="rounded-full border border-[#b98d52]/30 bg-[#fff7df]/70 p-3 text-[#704923]">
                <SquareTerminal size={22} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-[#704923]">
                  Project folder
                </span>
                <div className="mt-2 flex gap-2">
                  <input
                    value={projectPath}
                    onChange={(event) => setProjectPath(event.target.value)}
                    placeholder="C:/Users/victor/colourmap-v2"
                    className="min-w-0 flex-1 rounded-xl border border-[#b98d52]/30 bg-[#fff8e8] px-3 py-2 text-sm text-[#3f2817] outline-none focus:border-[#8f6232]"
                  />
                  <button
                    type="button"
                    onClick={inspectProject}
                    className="rounded-xl border border-[#8f6232]/30 bg-[#704923] px-3 text-sm text-[#fff8e8]"
                  >
                    Load
                  </button>
                </div>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/70 p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#8d653d]">
                    <GitBranch size={14} />
                    Branch
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#3f2817]">
                    {projectInfo?.branch ?? 'not loaded'}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/70 p-3">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#8d653d]">
                    <Bot size={14} />
                    Agents
                  </div>
                  <p className="mt-2 text-sm font-medium text-[#3f2817]">
                    {agents.filter((agent) => agent.available).length}/{agents.length || 2} ready
                  </p>
                </div>
              </div>

              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-[#704923]">
                  Mission title
                </span>
                <input
                  value={missionTitle}
                  onChange={(event) => setMissionTitle(event.target.value)}
                  placeholder="Stabilise geometry music mode"
                  className="mt-2 w-full rounded-xl border border-[#b98d52]/30 bg-[#fff8e8] px-3 py-2 text-sm text-[#3f2817] outline-none focus:border-[#8f6232]"
                />
              </label>

              <div>
                <span className="text-xs uppercase tracking-[0.16em] text-[#704923]">Mode</span>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {modes.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMode(item.id)}
                      className="rounded-full border px-3 py-2 text-xs"
                      style={{
                        borderColor: mode === item.id ? '#704923' : 'rgba(112,73,38,0.18)',
                        background: mode === item.id ? '#704923' : 'rgba(255,248,232,0.7)',
                        color: mode === item.id ? '#fff8e8' : '#704923',
                      }}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs uppercase tracking-[0.16em] text-[#704923]">Agent</span>
                <div className="mt-2 grid gap-2">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => setAgentId(agent.id)}
                      className="flex items-center justify-between rounded-2xl border px-3 py-3 text-left text-sm"
                      style={{
                        borderColor: agentId === agent.id ? '#704923' : 'rgba(112,73,38,0.16)',
                        background: agentId === agent.id ? 'rgba(112,73,35,0.1)' : '#fff8e8',
                        color: '#3f2817',
                      }}
                    >
                      <span>{agent.name}</span>
                      <span className={agent.available ? 'text-[#32724d]' : 'text-[#a35b38]'}>
                        {agent.available ? 'ready' : 'not found'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/78 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">
                    Mission prompt
                  </p>
                  <p className="mt-1 text-xs text-[#8d653d]">
                    Speak or write the mission. The agent runs in the selected folder.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleSpeech}
                  disabled={!speech.supported}
                  className="inline-flex items-center gap-2 rounded-full border border-[#8f6232]/25 px-3 py-2 text-xs text-[#704923] disabled:opacity-40"
                >
                  {speech.listening ? <MicOff size={14} /> : <Mic size={14} />}
                  {speech.listening ? 'Stop voice' : 'Voice'}
                </button>
              </div>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Tell the agent what to build, fix, review, or plan..."
                className="min-h-44 w-full resize-y rounded-2xl border border-[#b98d52]/25 bg-[#fffdf2] p-3 text-sm leading-6 text-[#3f2817] outline-none focus:border-[#8f6232]"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-[#8d653d]">
                  Selected: {selectedAgent?.name ?? 'No agent'} / {mode}
                </p>
                <button
                  type="button"
                  onClick={runMission}
                  disabled={running || !selectedAgent?.available}
                  className="inline-flex items-center gap-2 rounded-full bg-[#704923] px-4 py-2 text-sm text-[#fff8e8] disabled:opacity-45"
                >
                  <Play size={15} />
                  {running ? 'Running' : 'Run mission'}
                </button>
              </div>
              {error && <p className="mt-3 text-sm text-[#9b3b24]">{error}</p>}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-2xl border border-[#2b2118]/15 bg-[#24180f] p-4 text-[#f8e8bd]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#d7b978]">
                    Agent console
                  </p>
                  <span className="text-xs text-[#a98b5c]">{running ? 'streaming' : 'idle'}</span>
                </div>
                <div className="max-h-[360px] overflow-auto rounded-xl bg-[#150f0a] p-3 font-mono text-xs leading-5">
                  {events.length === 0 ? (
                    <p className="text-[#8e7658]">No mission output yet.</p>
                  ) : (
                    events.map((event) => (
                      <div
                        key={event.id}
                        className={
                          event.tone === 'error'
                            ? 'text-[#ff9b7d]'
                            : event.tone === 'success'
                              ? 'text-[#aee0a8]'
                              : event.tone === 'meta'
                                ? 'text-[#d7b978]'
                                : 'text-[#f8e8bd]'
                        }
                      >
                        <span className="opacity-50">[{event.type}] </span>
                        <span>{event.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/78 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">Diff desk</p>
                  <button
                    type="button"
                    onClick={refreshDiff}
                    className="inline-flex items-center gap-1 rounded-full border border-[#8f6232]/25 px-2 py-1 text-xs text-[#704923]"
                  >
                    <RefreshCw size={12} />
                    Refresh
                  </button>
                </div>
                <div className="mb-3 rounded-xl border border-[#b98d52]/18 bg-[#fffdf2] p-3">
                  <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[#8d653d]">
                    Changed files
                  </p>
                  {changedFiles.length === 0 ? (
                    <p className="text-sm text-[#8d653d]">No changes detected.</p>
                  ) : (
                    <ul className="space-y-1 text-sm text-[#3f2817]">
                      {changedFiles.map((file) => (
                        <li key={file}>{file}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <pre className="max-h-[250px] overflow-auto rounded-xl bg-[#24180f] p-3 text-xs leading-5 text-[#f8e8bd]">
                  {diff || 'No diff loaded.'}
                </pre>
              </section>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
