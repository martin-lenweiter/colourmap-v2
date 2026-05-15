'use client';

import {
  AlertTriangle,
  Archive,
  Bot,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  Clock3,
  FolderOpen,
  GitBranch,
  Mic,
  MicOff,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  SquareTerminal,
  Wand2,
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

type MissionStage = 'draft' | 'project' | 'checkpoint' | 'agent' | 'diff' | 'complete' | 'failed';

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
  worldFocus: string;
  agentId: string;
  projectPath: string;
  status: 'complete' | 'failed' | 'draft';
  prompt: string;
  currentTension: string;
  constraints: string;
  successCriteria: string;
  changedFiles: string[];
  createdAt: string;
};

type PromptTemplate = {
  id: string;
  label: string;
  mode: AgentMode;
  title: string;
  tension: string;
  constraints: string;
  success: string;
  prompt: string;
};

const modes: { id: AgentMode; label: string }[] = [
  { id: 'plan', label: 'Plan' },
  { id: 'build', label: 'Build' },
  { id: 'fix', label: 'Fix' },
  { id: 'review', label: 'Review' },
];

const worlds = [
  {
    id: 'Survival',
    label: 'Survival',
    desc: 'stability, paperwork, risk, money, basic order',
  },
  {
    id: 'Expansion',
    label: 'Expansion',
    desc: 'creative future, product, art, code, momentum',
  },
  {
    id: 'Regeneration',
    label: 'Regeneration',
    desc: 'body, breath, sleep, pacing, nervous system',
  },
];

const stageLabels: Record<MissionStage, string> = {
  draft: 'Draft',
  project: 'Project',
  checkpoint: 'Checkpoint',
  agent: 'Agent',
  diff: 'Diff',
  complete: 'Complete',
  failed: 'Failed',
};

const stageOrder: MissionStage[] = ['draft', 'project', 'checkpoint', 'agent', 'diff', 'complete'];
const HISTORY_LS = 'colourmap:build-lab-history';
const RECENT_PROJECTS_LS = 'colourmap:build-lab-recent-projects';

const templates: PromptTemplate[] = [
  {
    id: 'stabilise',
    label: 'Stabilise',
    mode: 'fix',
    title: 'Stabilise the current branch',
    tension: 'The idea is moving fast, but the branch needs to become safe to review.',
    constraints:
      'Keep the change tight. Do not rewrite unrelated modules. Preserve user work. Run the relevant checks and browser verification for UI changes.',
    success:
      'The branch is easy to review, the main checks pass, and remaining risks are clearly named.',
    prompt:
      'Inspect the current branch, fix the smallest blocking issues, and prepare it for PR review.',
  },
  {
    id: 'feature',
    label: 'Build feature',
    mode: 'build',
    title: 'Build one focused product improvement',
    tension: 'Expansion needs one shippable cut instead of a huge vision dump.',
    constraints:
      'Follow existing product specs and patterns. Keep scope inside the named feature. Add tests where behavior changes.',
    success:
      'The feature works in the UI, has a clear spec trail, and can be explained in one paragraph.',
    prompt:
      'Build the next useful slice of this feature. Read the relevant specs first, implement, verify, and summarize the diff.',
  },
  {
    id: 'review',
    label: 'Review PR',
    mode: 'review',
    title: 'Review the branch for merge risk',
    tension: 'The work exists, but it needs a calm second pass before merge.',
    constraints:
      'Prioritize bugs, regressions, missing tests, protected-path risks, and unclear product behavior.',
    success: 'The review names concrete file/line risks, required fixes, and what can safely wait.',
    prompt:
      'Review this branch like a senior engineer. Findings first, then tests and residual risk.',
  },
];

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

export default function BuildLab() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [agentId, setAgentId] = useState('codex');
  const [mode, setMode] = useState<AgentMode>('build');
  const [projectPath, setProjectPath] = useState('');
  const [missionTitle, setMissionTitle] = useState('');
  const [currentTension, setCurrentTension] = useState('');
  const [worldFocus, setWorldFocus] = useState('Expansion');
  const [constraints, setConstraints] = useState('');
  const [successCriteria, setSuccessCriteria] = useState('');
  const [prompt, setPrompt] = useState('');
  const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
  const [events, setEvents] = useState<ConsoleEvent[]>([]);
  const [changedFiles, setChangedFiles] = useState<string[]>([]);
  const [diff, setDiff] = useState('');
  const [stage, setStage] = useState<MissionStage>('draft');
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
    return [
      missionTitle ? `Mission title: ${missionTitle}` : '',
      currentTension ? `Current tension: ${currentTension}` : '',
      `World focus: ${worldFocus}`,
      constraints ? `Constraints:\n${constraints}` : '',
      successCriteria ? `Success criteria:\n${successCriteria}` : '',
      prompt ? `Raw spoken/written brief:\n${prompt}` : '',
    ]
      .filter(Boolean)
      .join('\n\n');
  }

  function rememberProject(nextPath: string) {
    const next = [nextPath, ...recentProjects.filter((path) => path !== nextPath)].slice(0, 5);
    setRecentProjects(next);
    saveJson(RECENT_PROJECTS_LS, next);
  }

  function rememberMission(status: MissionMemory['status'], files: string[]) {
    const mission: MissionMemory = {
      id: crypto.randomUUID(),
      title: missionTitle.trim() || 'Untitled coding mission',
      mode,
      worldFocus,
      agentId,
      projectPath,
      status,
      prompt,
      currentTension,
      constraints,
      successCriteria,
      changedFiles: files,
      createdAt: new Date().toISOString(),
    };
    const next = [mission, ...history].slice(0, 8);
    setHistory(next);
    saveJson(HISTORY_LS, next);
  }

  function loadMission(mission: MissionMemory) {
    setMissionTitle(mission.title);
    setMode(mission.mode);
    setWorldFocus(mission.worldFocus);
    setAgentId(mission.agentId);
    setProjectPath(mission.projectPath);
    setPrompt(mission.prompt);
    setCurrentTension(mission.currentTension);
    setConstraints(mission.constraints);
    setSuccessCriteria(mission.successCriteria);
    setStage('draft');
    addEvent('memory', `Loaded mission memory: ${mission.title}`, 'meta');
  }

  function applyTemplate(template: PromptTemplate) {
    setMissionTitle(template.title);
    setCurrentTension(template.tension);
    setConstraints(template.constraints);
    setSuccessCriteria(template.success);
    setPrompt(template.prompt);
    setMode(template.mode);
    setStage('draft');
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
    setStage('project');
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
    setStage(data.changedFiles.length > 0 ? 'diff' : stage);
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
    setStage('checkpoint');
    addEvent('mission', missionTitle || 'Untitled coding mission', 'meta');
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
            setStage('agent');
            addEvent('command', `$ ${event.command} ${(event.args ?? []).join(' ')}`, 'meta');
          } else if (event.type === 'command_finished')
            addEvent('command', 'Command finished', 'meta');
          else if (event.type === 'file_changed' && event.path)
            setChangedFiles((prev) => Array.from(new Set([...prev, event.path as string])));
          else if (event.type === 'mission_complete') {
            missionSucceeded = Boolean(event.success);
            setStage(event.success ? 'complete' : 'failed');
            addEvent(
              'complete',
              event.success ? 'Mission complete' : 'Mission failed',
              event.success ? 'success' : 'error',
            );
          } else if (event.type === 'checkpoint') {
            setStage('checkpoint');
            if (event.checkpoint)
              setCheckpoints((prev) => [...prev, event.checkpoint as CheckpointInfo]);
            addEvent('checkpoint', 'Git checkpoint saved', 'meta');
          }
        }
      }
      const refreshed = await refreshDiff();
      rememberMission(missionSucceeded ? 'complete' : 'failed', refreshed?.changedFiles ?? []);
    } catch (missionError) {
      setStage('failed');
      setError(missionError instanceof Error ? missionError.message : 'Mission failed.');
      rememberMission('failed', changedFiles);
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

  const workerBrief = composedPrompt();
  const scopeLens = useMemo(() => {
    const brief = [
      missionTitle,
      currentTension,
      worldFocus,
      constraints,
      successCriteria,
      prompt,
    ].join('\n');
    const warnings: string[] = [];
    const strengths: string[] = [];
    if (projectInfo) strengths.push('project loaded');
    else warnings.push('load the project before running');
    if (missionTitle.trim()) strengths.push('named mission');
    else warnings.push('add a short mission title');
    if (successCriteria.trim()) strengths.push('success criteria');
    else warnings.push('define what done means');
    if (constraints.trim()) strengths.push('constraints');
    else warnings.push('add guardrails for the worker');
    if (prompt.trim().length > 40) strengths.push('usable brief');
    else warnings.push('write or dictate a fuller brief');
    if (/(everything|whole app|all the app|mega|do all this|fix all)/i.test(brief)) {
      warnings.push('scope may be too broad');
    }
    if (projectInfo?.branch === 'main') warnings.push('current branch is main');

    const score = Math.max(12, Math.min(100, strengths.length * 18 + (warnings.length ? 8 : 20)));
    const label = score >= 76 ? 'Ready' : score >= 48 ? 'Shape it' : 'Too loose';
    return { score, label, warnings, strengths };
  }, [constraints, currentTension, missionTitle, projectInfo, prompt, successCriteria, worldFocus]);

  const missionReady =
    workerBrief.trim().length > 0 && Boolean(selectedAgent?.available) && Boolean(projectPath);

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

              <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/70 p-3">
                <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#8d653d]">
                  <Clock3 size={14} />
                  Mission timeline
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(stageLabels) as MissionStage[]).map((item) => {
                    const active = item === stage;
                    const complete =
                      stage !== 'failed' &&
                      stageOrder.indexOf(stage) >= 0 &&
                      stageOrder.indexOf(item) >= 0 &&
                      stageOrder.indexOf(stage) >= stageOrder.indexOf(item);
                    const Icon = active || complete ? CheckCircle2 : Circle;
                    return (
                      <div
                        key={item}
                        className="flex items-center gap-1.5 rounded-full border px-2 py-1 text-[10px]"
                        style={{
                          borderColor: active ? '#704923' : 'rgba(112,73,38,0.14)',
                          background: active ? 'rgba(112,73,35,0.1)' : 'rgba(255,253,242,0.58)',
                          color: active ? '#3f2817' : '#8d653d',
                        }}
                      >
                        <Icon size={11} />
                        {stageLabels[item]}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/70 p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#8d653d]">
                    <ClipboardCheck size={14} />
                    Scope lens
                  </div>
                  <span className="rounded-full border border-[#8f6232]/20 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[#704923]">
                    {scopeLens.label}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e7cf9e]">
                  <div
                    className="h-full rounded-full bg-[#704923]"
                    style={{ width: `${scopeLens.score}%` }}
                  />
                </div>
                <div className="mt-3 grid gap-2">
                  {scopeLens.warnings.slice(0, 4).map((warning) => (
                    <div key={warning} className="flex items-start gap-2 text-xs text-[#8d653d]">
                      <AlertTriangle size={13} className="mt-0.5 shrink-0 text-[#a35b38]" />
                      <span>{warning}</span>
                    </div>
                  ))}
                  {scopeLens.warnings.length === 0 && (
                    <div className="flex items-start gap-2 text-xs text-[#3f6b45]">
                      <CheckCircle2 size={13} className="mt-0.5 shrink-0" />
                      <span>Mission looks tight enough to send.</span>
                    </div>
                  )}
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

              <label className="block">
                <span className="text-xs uppercase tracking-[0.16em] text-[#704923]">
                  Current tension
                </span>
                <input
                  value={currentTension}
                  onChange={(event) => setCurrentTension(event.target.value)}
                  placeholder="Building the future while surviving today"
                  className="mt-2 w-full rounded-xl border border-[#b98d52]/30 bg-[#fff8e8] px-3 py-2 text-sm text-[#3f2817] outline-none focus:border-[#8f6232]"
                />
              </label>

              <div>
                <span className="text-xs uppercase tracking-[0.16em] text-[#704923]">
                  World focus
                </span>
                <div className="mt-2 grid gap-2">
                  {worlds.map((world) => (
                    <button
                      key={world.id}
                      type="button"
                      onClick={() => setWorldFocus(world.id)}
                      className="rounded-2xl border px-3 py-2 text-left"
                      style={{
                        borderColor: worldFocus === world.id ? '#704923' : 'rgba(112,73,38,0.16)',
                        background: worldFocus === world.id ? 'rgba(112,73,35,0.1)' : '#fff8e8',
                      }}
                    >
                      <span className="block text-sm font-medium text-[#3f2817]">
                        {world.label}
                      </span>
                      <span className="block text-xs leading-5 text-[#8d653d]">{world.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

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
            <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/70 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#704923]">
                    <Wand2 size={14} />
                    Mission cards
                  </p>
                  <p className="mt-1 text-xs text-[#8d653d]">
                    Start from a reusable shape, then speak the specific brief.
                  </p>
                </div>
                <Sparkles size={18} className="text-[#8d653d]" />
              </div>
              <div className="grid gap-2 md:grid-cols-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="rounded-2xl border p-3 text-left"
                    style={{
                      borderColor: mode === template.mode ? 'rgba(112,73,38,0.34)' : '#b98d5230',
                      background: 'rgba(255,253,242,0.72)',
                    }}
                  >
                    <span className="block text-sm font-medium text-[#3f2817]">
                      {template.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-[#8d653d]">
                      {template.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-[#b98d52]/20 bg-[#fff8e8]/78 p-4">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-[#704923]">
                    Mission prompt
                  </p>
                  <p className="mt-1 text-xs text-[#8d653d]">
                    Speak naturally. Colourmap turns it into a cleaner worker brief.
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
              <div className="mb-3 grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#8d653d]">
                    Constraints
                  </span>
                  <textarea
                    value={constraints}
                    onChange={(event) => setConstraints(event.target.value)}
                    placeholder="Keep scope tight. Do not touch unrelated files. Verify in browser."
                    className="mt-1 min-h-24 w-full resize-y rounded-xl border border-[#b98d52]/25 bg-[#fffdf2] p-2 text-xs leading-5 text-[#3f2817] outline-none focus:border-[#8f6232]"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-[#8d653d]">
                    Success criteria
                  </span>
                  <textarea
                    value={successCriteria}
                    onChange={(event) => setSuccessCriteria(event.target.value)}
                    placeholder="The page loads, checks pass, and the changed files are easy to review."
                    className="mt-1 min-h-24 w-full resize-y rounded-xl border border-[#b98d52]/25 bg-[#fffdf2] p-2 text-xs leading-5 text-[#3f2817] outline-none focus:border-[#8f6232]"
                  />
                </label>
              </div>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Tell the agent what to build, fix, review, or plan..."
                className="min-h-44 w-full resize-y rounded-2xl border border-[#b98d52]/25 bg-[#fffdf2] p-3 text-sm leading-6 text-[#3f2817] outline-none focus:border-[#8f6232]"
              />
              <details className="mt-3 rounded-xl border border-[#b98d52]/18 bg-[#fffdf2]/80 p-3">
                <summary className="cursor-pointer text-xs uppercase tracking-[0.14em] text-[#704923]">
                  Worker brief preview
                </summary>
                <pre className="mt-3 max-h-56 overflow-auto whitespace-pre-wrap text-xs leading-5 text-[#5f4229]">
                  {workerBrief || 'The structured brief will appear here.'}
                </pre>
              </details>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-xs text-[#8d653d]">
                  <span>Selected: {selectedAgent?.name ?? 'No agent'}</span>
                  <span>/ {mode}</span>
                  <span>/ {worldFocus}</span>
                  <span>/ scope {scopeLens.score}%</span>
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
                  Completed and failed runs will appear here so you can reuse real missions.
                </p>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {history.slice(0, 4).map((mission) => (
                    <button
                      key={mission.id}
                      type="button"
                      onClick={() => loadMission(mission)}
                      className="rounded-2xl border border-[#b98d52]/22 bg-[#fffdf2]/75 p-3 text-left"
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
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#8d653d]">
                        <span>{mission.mode}</span>
                        <span>{mission.worldFocus}</span>
                        <span>{mission.changedFiles.length} files</span>
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
