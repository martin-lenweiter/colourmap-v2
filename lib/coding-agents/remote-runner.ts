import type { AgentAttachment, AgentMode } from './types';

export const BUILD_LAB_ATTACHMENT_BUCKET = 'build-lab-attachments';
export const BUILD_LAB_RUNNER_STALE_MS = 45_000;

export type RemoteRunnerStatus = 'offline' | 'online' | 'busy' | 'error';
export type RemoteMissionStatus =
  | 'draft'
  | 'queued'
  | 'running'
  | 'complete'
  | 'failed'
  | 'cancelled';

export type BuildLabRemoteRunner = {
  id: string;
  userId: string;
  name: string;
  machine?: string | null;
  platform?: string | null;
  workingDirectory?: string | null;
  approvedProjectRoots: string[];
  status: RemoteRunnerStatus;
  lastSeenAt?: string | null;
  currentMissionId?: string | null;
};

export type BuildLabRemoteMission = {
  id: string;
  userId: string;
  channelId: string;
  agentId: string;
  projectPath: string;
  title: string;
  prompt: string;
  mode: AgentMode;
  status: RemoteMissionStatus;
  requestedFrom: 'phone' | 'desktop' | 'web';
  claimedBy?: string | null;
  claimedAt?: string | null;
  completedAt?: string | null;
  error?: string | null;
  attachments: AgentAttachment[];
  createdAt: string;
  updatedAt: string;
};

export function isRunnerOnline(lastSeenAt: string | null | undefined, now = Date.now()) {
  if (!lastSeenAt) return false;
  const seenAt = new Date(lastSeenAt).getTime();
  return Number.isFinite(seenAt) && now - seenAt <= BUILD_LAB_RUNNER_STALE_MS;
}

function safeStorageName(value: string) {
  return value
    .replace(/[<>:"/\\|?*]/g, '-')
    .split('')
    .filter((char) => char.charCodeAt(0) >= 32)
    .join('')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 80)
    .toLowerCase();
}

function extensionForMime(mimeType: string | undefined) {
  if (mimeType === 'image/jpeg') return 'jpg';
  if (mimeType === 'image/webp') return 'webp';
  if (mimeType === 'image/gif') return 'gif';
  return 'png';
}

export function buildLabAttachmentStoragePath(input: {
  userId: string;
  missionId: string;
  attachmentId: string;
  name: string;
  mimeType?: string;
}) {
  const rawName = safeStorageName(input.name) || 'attachment';
  const hasExtension = /\.[a-z0-9]{2,5}$/i.test(rawName);
  const fileName = hasExtension ? rawName : `${rawName}.${extensionForMime(input.mimeType)}`;
  return `${input.userId}/${input.missionId}/${input.attachmentId}-${fileName}`;
}
