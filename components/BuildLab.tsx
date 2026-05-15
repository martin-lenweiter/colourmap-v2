'use client';

import {
  Archive,
  Bot,
  FolderOpen,
  GitBranch,
  Mic,
  MicOff,
  Play,
  RefreshCw,
  ShieldCheck,
  SquareTerminal,
} from 'lucide-react';
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

type CheckpointInfo = {
  created: boolean;
  path?: string;
  reason?: string;
  changedFiles?: string[];
};

type ProjectInfo = {
  projectPath: string;
  git: boolean;
  branch: string | null;
  changedFiles: string[];
};

type MissionMemory = {
  id: string;
  title: string;
  mode: AgentMode;
  agentId: string;
  projectPath: string;
  status: 'complete' | 'failed' | 'draft';
  prompt: string;
  changedFiles: string[];
  createdAt: string;
  reflection?: string;
};

const HISTORY_LS = 'colourmap:build-lab-history';
const RECENT_PROJECTS_LS = 'colourmap:build-lab-recent-projects';

function nextId() {
  return Date.now() + Math.random();
}

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function shortPath(path: string) {
  const normalized = path.replace(/\\/g, '/');
  const parts = normalized.split('/').filter(Boolean);
  if (parts.length <= 2) return normalized;
  return `${parts.at(-2)}/${parts.at(-1)}`;
}

function missionTitleFromPrompt(prompt: string) {
  const firstLine = prompt
    .trim()
    .split(/\r?\n/)
    .find((line) => line.trim());
  if (!firstLine) return 'Untitled coding mission';
  return firstLine.length > 82 ? `${firstLine.slice(0, 79)}...` : firstLine;
}

function missionReflection(status: MissionMemory['status'], files: string[]) {
  if (status === 'complete') {
    return files.length
      ? `The agent finished and left ${files.length} changed file${files.length === 1 ? '' : 's'} to review.`
      : 'The agent finished without leaving changed files in the current diff.';
  }
  return files.length
    ? `The run did not fully complete, but it touched ${files.length} file${files.length === 1 ? '' : 's'} that may need review.`
    : 'The run did not complete and no changed files were detected.';
}

export default function BuildLab() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentId, setAgentId] = useState('codex');
  const mode: AgentMode = 'build';
  const [projectPath, setProjectPath] = useState('');
  const [prompt, setPrompt] = useState('');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [events, setEvents] = useState<ConsoleEvent[]>([]);
  const [changedFiles, setChangedFiles] = useState<string[]>([]);
  const [diff, setDiff] = useState('');
  const [checkpoints, setCheckpoints] = useState<CheckpointInfo[]>([]);
  const [history, setHistory] = useState<MissionMemory[]>([]);
  const [recentProjects, setRecentProjects] = useState<string[]>([]);
  const [showRawConsole, setShowRawConsole] = useState(false);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState('');
  const speech = useSpeechToText({ lang: 'en-US' });

  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === agentId) ?? agents[0],
    [agents, agentId],
  );

  useEffect(() => {
    setHistory(loadJson<MissionMemory[]>(HISTORY_LS, []));
    setRecentProjects(loadJson<string[]>(RECENT_PROJECTS_LS, []));

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

  function composedPrompt() {
    return prompt.trim();
  }

  function rememberProject(nextPath: string) {
    const next = [nextPath, ...recentProjects.filter((path) => path !== nextPath)].slice(0, 5);
    setRecentProjects(next);
    saveJson(RECENT_PROJECTS_LS, next);
  }

  function rememberMission(status: MissionMemory['status'], files: string[]) {
    const mission: MissionMemory = {
      id: crypto.randomUUID(),
      title: missionTitleFromPrompt(prompt),
      mode,
      agentId,
      projectPath,
      status,
      prompt,
      changedFiles: files,
      createdAt: new Date().toISOString(),
      reflection: missionReflection(status, files),
    };
    const next = [mission, ...history].slice(0, 8);
    setHistory(next);
    saveJson(HISTORY_LS, next);
  }

  function loadMission(mission: MissionMemory) {
    setAgentId(mission.agentId);
    setProjectPath(mission.projectPath);
    setPrompt(mission.prompt);
    addEvent('memory', `Loaded mission memory: ${mission.title}`, 'meta');
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
    rememberProject(data.projectPath);
    addEvent('project', `Loaded ${data.projectPath}`, 'meta');
  }

  async function refreshDiff() {
    if (!projectPath.trim()) return null;
    const response = await fetch('/api/build-lab/diff', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectPath }),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { diff: string; changedFiles: string[] };
    setDiff(data.diff);
    setChangedFiles(data.changedFiles);
    return data;
  }

  async function runMission() {
    const missionPrompt = composedPrompt();
    if (!missionPrompt.trim()) {
      setError('Write or dictate a mission prompt first.');
      return;
    }
    setError('');
    setRunning(true);
    setEvents([]);
    setDiff('');
    setCheckpoints([]);
    addEvent('mission', missionTitleFromPrompt(prompt), 'meta');
    let missionSucceeded = false;

    try {
      const response = await fetch('/api/build-lab/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId, projectPath, prompt: missionPrompt, mode }),
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
            checkpoint?: CheckpointInfo;
          };
          if (event.type === 'output') addEvent(event.stream ?? 'output', event.text ?? '');
          else if (event.type === 'error') addEvent('error', event.message ?? 'Error', 'error');
          else if (event.type === 'command_started') {
            addEvent('command', `$ ${event.command} ${(event.args ?? []).join(' ')}`, 'meta');
          } else if (event.type === 'command_finished')
            addEvent('command', 'Command finished', 'meta');
          else if (event.type === 'file_changed' && event.path)
            setChangedFiles((prev) => Array.from(new Set([...prev, event.path as string])));
          else if (event.type === 'mission_complete') {
            missionSucceeded = Boolean(event.success);
            addEvent(
              'complete',
              event.success ? 'Mission complete' : 'Mission failed',
              event.success ? 'success' : 'error',
            );
          } else if (event.type === 'checkpoint') {
            if (event.checkpoint)
              setCheckpoints((prev) => [...prev, event.checkpoint as CheckpointInfo]);
            addEvent('checkpoint', 'Git checkpoint saved', 'meta');
          }
        }
      }
      const refreshed = await refreshDiff();
      rememberMission(missionSucceeded ? 'complete' : 'failed', refreshed?.changedFiles ?? []);
    } catch (missionError) {
      setError(missionError instanceof Error ? missionError.message : 'Mission failed.');
      rememberMission('failed', changedFiles);
    } finally {
      setRunning(false);
    }
  }

  function toggleSpeech() {
    speech.resetError();
    if (speech.listening) {
      speech.stop();
    } else {
      speech.start(prompt, setPrompt);
    }
  }

  const missionReady =
    prompt.trim().length > 0 && Boolean(selectedAgent?.available) && Boolean(projectPath);

  return (
    <main className="mx-auto w-full max-w-6xl px-3 py-5 sm:px-5">
      <style>{`
        @keyframes build-lab-voice-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.72; }
        }
      `}</style>
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
                <h1 className="mt-1 font-serif text-3xl text-[#442510]">Creator Space</h1>
                <p className="mt-2 max-w-md text-sm leading-6 text-[#775638]">
                  Build Lab is the coding-agent room inside Colourmap's creator space: a quiet
                  mission desk for prompts, logs, checkpoints, and diffs.
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

              {recentProjects.length > 0 && (
                <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/62 p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#8d653d]">
                    <FolderOpen size={14} />
                    Recent projects
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentProjects.map((path) => (
                      <button
                        key={path}
                        type="button"
                        onClick={() => setProjectPath(path)}
                        className="rounded-full border border-[#8f6232]/20 px-3 py-1 text-xs text-[#704923]"
                        title={path}
                      >
                        {shortPath(path)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                    Write or speak the order you want to give the coding agent.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleSpeech}
                  disabled={!speech.supported}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs disabled:opacity-40"
                  style={{
                    borderColor: speech.listening
                      ? 'rgba(245,132,38,0.75)'
                      : 'rgba(143,98,50,0.25)',
                    background: speech.listening
                      ? 'radial-gradient(circle at 30% 30%, rgba(255,178,76,0.48), rgba(255,126,35,0.2))'
                      : 'transparent',
                    boxShadow: speech.listening
                      ? '0 0 0 5px rgba(255,145,49,0.14), 0 0 28px rgba(255,126,35,0.42)'
                      : 'none',
                    color: speech.listening ? '#7a310c' : '#704923',
                  }}
                >
                  {speech.listening ? <MicOff size={14} /> : <Mic size={14} />}
                  {speech.listening ? 'Stop voice' : 'Voice'}
                </button>
              </div>
              <div className="mb-3 rounded-2xl border border-[#b98d52]/18 bg-[#fffdf2]/72 p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="block h-3 w-3 rounded-full"
                      style={{
                        background: speech.listening ? '#ff8a22' : '#c9a76e',
                        boxShadow: speech.listening
                          ? '0 0 0 6px rgba(255,138,34,0.13), 0 0 22px rgba(255,138,34,0.6)'
                          : 'none',
                        animation: speech.listening
                          ? 'build-lab-voice-pulse 1s ease-in-out infinite'
                          : 'none',
                      }}
                    />
                    <span className="text-xs uppercase tracking-[0.14em] text-[#704923]">
                      {speech.listening
                        ? 'Listening'
                        : speech.supported
                          ? 'Voice ready'
                          : 'Voice unavailable'}
                    </span>
                  </div>
                  {speech.transcript && (
                    <span className="text-[11px] text-[#8d653d]">transcript captured</span>
                  )}
                </div>
                <p className="mt-2 text-xs leading-5 text-[#8d653d]">
                  {speech.error ||
                    (speech.listening
                      ? 'Speak now. Your words should appear in the mission prompt below.'
                      : speech.transcript
                        ? `Last heard: ${speech.transcript}`
                        : 'Tap Voice and allow microphone access in the browser.')}
                </p>
              </div>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Tell the agent what to build, fix, review, or plan..."
                className="min-h-44 w-full resize-y rounded-2xl border border-[#b98d52]/25 bg-[#fffdf2] p-3 text-sm leading-6 text-[#3f2817] outline-none focus:border-[#8f6232]"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs text-[#8d653d]">
                  <span>Selected: {selectedAgent?.name ?? 'No agent'}</span>
                  <span>/ {projectPath ? shortPath(projectPath) : 'choose project'}</span>
                </div>
                <button
                  type="button"
                  onClick={runMission}
                  disabled={running || !missionReady}
                  className="inline-flex items-center gap-2 rounded-full bg-[#704923] px-4 py-2 text-sm text-[#fff8e8] disabled:opacity-45"
                >
                  <Play size={15} />
                  {running ? 'Running' : 'Run mission'}
                </button>
              </div>
              {error && <p className="mt-3 text-sm text-[#9b3b24]">{error}</p>}
            </div>

            <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#704923]">
                  <Archive size={14} />
                  Mission memory
                </p>
                <span className="text-xs text-[#8d653d]">{history.length} saved</span>
              </div>
              {history.length === 0 ? (
                <p className="text-sm text-[#8d653d]">
                  Clear work blocks will appear here: what you asked, what happened, and what to
                  check next.
                </p>
              ) : (
                <div className="grid gap-3">
                  {history.slice(0, 4).map((mission) => (
                    <button
                      key={mission.id}
                      type="button"
                      onClick={() => loadMission(mission)}
                      className="rounded-2xl border border-[#b98d52]/22 bg-[#fffdf2]/75 p-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium leading-5 text-[#3f2817]">
                          {mission.title}
                        </span>
                        <span
                          className={
                            mission.status === 'complete'
                              ? 'text-xs text-[#32724d]'
                              : 'text-xs text-[#a35b38]'
                          }
                        >
                          {mission.status}
                        </span>
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[#8d653d]">
                        Last order
                      </p>
                      <p className="mt-1 line-clamp-3 text-sm leading-6 text-[#5f4229]">
                        {mission.prompt || 'No prompt saved.'}
                      </p>
                      <p className="mt-3 text-xs uppercase tracking-[0.14em] text-[#8d653d]">
                        Reflection
                      </p>
                      <p className="mt-1 text-sm leading-6 text-[#5f4229]">
                        {mission.reflection ??
                          missionReflection(mission.status, mission.changedFiles)}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-[#8d653d]">
                        <span>{shortPath(mission.projectPath)}</span>
                        <span>{mission.changedFiles.length} files</span>
                        <span>{new Date(mission.createdAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <section className="rounded-2xl border border-[#2b2118]/15 bg-[#24180f] p-4 text-[#f8e8bd]">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#d7b978]">
                    Agent console
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRawConsole((value) => !value)}
                      className="rounded-full border border-[#d7b978]/20 px-2 py-1 text-xs text-[#d7b978]"
                    >
                      {showRawConsole ? 'Readable' : 'Raw'}
                    </button>
                    <span className="text-xs text-[#a98b5c]">{running ? 'streaming' : 'idle'}</span>
                  </div>
                </div>
                <div className="max-h-[360px] overflow-auto rounded-xl bg-[#150f0a] p-3 font-mono text-xs leading-5">
                  {events.length === 0 ? (
                    <p className="text-[#8e7658]">No mission output yet.</p>
                  ) : (
                    (showRawConsole ? events : events.filter((event) => event.text.trim())).map(
                      (event) => (
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
                      ),
                    )
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
                  <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#8d653d]">
                    <ShieldCheck size={13} />
                    Checkpoints
                  </div>
                  {checkpoints.length === 0 ? (
                    <p className="text-sm text-[#8d653d]">No checkpoint yet.</p>
                  ) : (
                    <ul className="space-y-2 text-sm text-[#3f2817]">
                      {checkpoints.map((checkpoint, index) => (
                        <li
                          key={`${checkpoint.path ?? checkpoint.reason ?? 'checkpoint'}-${index}`}
                        >
                          {checkpoint.created
                            ? (checkpoint.path ?? 'Checkpoint saved')
                            : (checkpoint.reason ?? 'Checkpoint skipped')}
                        </li>
                      ))}
                    </ul>
                  )}
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
