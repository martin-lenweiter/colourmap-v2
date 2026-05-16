export type BuildLabQueuedMissionStatus = 'draft' | 'queued' | 'running' | 'complete' | 'failed';

export type BuildLabRunnerEvent = {
  id: number;
  type: string;
  text: string;
  createdAt: string;
};

export type BuildLabQueuedMission = {
  id: string;
  userId: string;
  title: string;
  channelId: string;
  agentId: string;
  projectPath: string;
  prompt: string;
  status: BuildLabQueuedMissionStatus;
  createdAt: string;
  updatedAt: string;
  events: BuildLabRunnerEvent[];
};

type QueueStore = {
  missions: BuildLabQueuedMission[];
};

const queueSymbol = Symbol.for('colourmap.buildLabQueue');

function store(): QueueStore {
  const globalWithQueue = globalThis as typeof globalThis & { [queueSymbol]?: QueueStore };
  globalWithQueue[queueSymbol] ??= { missions: [] };
  return globalWithQueue[queueSymbol];
}

export function listQueuedMissions(userId: string) {
  return store()
    .missions.filter((mission) => mission.userId === userId)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function createQueuedMission(
  userId: string,
  input: {
    title: string;
    channelId: string;
    agentId: string;
    projectPath: string;
    prompt: string;
  },
) {
  const now = new Date().toISOString();
  const mission: BuildLabQueuedMission = {
    id: crypto.randomUUID(),
    userId,
    title: input.title,
    channelId: input.channelId,
    agentId: input.agentId,
    projectPath: input.projectPath,
    prompt: input.prompt,
    status: 'queued',
    createdAt: now,
    updatedAt: now,
    events: [
      { id: Date.now(), type: 'queued', text: 'Queued for desktop runner.', createdAt: now },
    ],
  };
  store().missions = [mission, ...store().missions].slice(0, 100);
  return mission;
}

export function updateQueuedMission(
  userId: string,
  missionId: string,
  patch: Partial<Pick<BuildLabQueuedMission, 'status' | 'events' | 'title' | 'prompt'>>,
) {
  let updated: BuildLabQueuedMission | null = null;
  store().missions = store().missions.map((mission) => {
    if (mission.id !== missionId || mission.userId !== userId) return mission;
    updated = { ...mission, ...patch, updatedAt: new Date().toISOString() };
    return updated;
  });
  return updated;
}
