import { mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { AgentAttachment } from './types';

type IncomingAttachment = Partial<AgentAttachment>;

const MAX_ATTACHMENTS = 6;
const MAX_DATA_URL_LENGTH = 10_000_000;
const IMAGE_DATA_URL_PATTERN = /^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=]+)$/i;

function safeName(value: string, fallback: string) {
  const cleaned = value
    .replace(/[<>:"/\\|?*]/g, '-')
    .split('')
    .filter((char) => char.charCodeAt(0) >= 32)
    .join('')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return cleaned || fallback;
}

function extensionForMime(mimeType: string) {
  if (mimeType === 'image/jpeg') return '.jpg';
  if (mimeType === 'image/webp') return '.webp';
  if (mimeType === 'image/gif') return '.gif';
  return '.png';
}

export function normalizeAgentAttachments(input: unknown): AgentAttachment[] {
  if (!Array.isArray(input)) return [];
  return input
    .slice(0, MAX_ATTACHMENTS)
    .map((item, index): AgentAttachment => {
      const attachment = item as IncomingAttachment;
      return {
        id: String(attachment.id || `attachment-${index + 1}`),
        kind: attachment.kind === 'image' ? 'image' : 'screenshot',
        name: safeName(
          String(attachment.name || `attachment-${index + 1}`),
          `attachment-${index + 1}`,
        ),
        note: typeof attachment.note === 'string' ? attachment.note.slice(0, 1200) : '',
        mimeType: typeof attachment.mimeType === 'string' ? attachment.mimeType : '',
        dataUrl: typeof attachment.dataUrl === 'string' ? attachment.dataUrl : '',
        filePath: typeof attachment.filePath === 'string' ? attachment.filePath : '',
      };
    })
    .filter((item) => item.dataUrl || item.filePath || item.note);
}

export async function persistAgentAttachments(
  userId: string,
  attachments: AgentAttachment[],
): Promise<AgentAttachment[]> {
  if (attachments.length === 0) return [];
  const missionDir = path.join(
    tmpdir(),
    'colourmap-build-lab-attachments',
    safeName(userId, 'user'),
    String(Date.now()),
  );
  await mkdir(missionDir, { recursive: true });

  const saved: AgentAttachment[] = [];
  for (const [index, attachment] of attachments.entries()) {
    if (!attachment.dataUrl) {
      saved.push(attachment);
      continue;
    }
    if (attachment.dataUrl.length > MAX_DATA_URL_LENGTH) {
      throw new Error(`Attachment ${attachment.name} is too large.`);
    }
    const match = attachment.dataUrl.match(IMAGE_DATA_URL_PATTERN);
    if (!match) {
      throw new Error(`Attachment ${attachment.name} must be an image data URL.`);
    }
    const mimeType = match[1];
    const base64 = match[2];
    const filename = `${String(index + 1).padStart(2, '0')}-${safeName(
      attachment.name,
      `attachment-${index + 1}`,
    )}${path.extname(attachment.name) ? '' : extensionForMime(mimeType)}`;
    const filePath = path.join(missionDir, filename);
    await writeFile(filePath, Buffer.from(base64, 'base64'));
    saved.push({ ...attachment, mimeType, dataUrl: undefined, filePath });
  }
  return saved;
}

export function appendAttachmentContext(prompt: string, attachments: AgentAttachment[]) {
  if (attachments.length === 0) return prompt;
  const lines = attachments.map((attachment, index) => {
    const parts = [
      `${index + 1}. ${attachment.kind}: ${attachment.name}`,
      attachment.filePath ? `   File: ${attachment.filePath}` : '',
      attachment.note ? `   User note: ${attachment.note}` : '',
    ].filter(Boolean);
    return parts.join('\n');
  });
  return `${prompt.trim()}\n\nVisual context attached by the user:\n${lines.join('\n')}\n\nUse these image files as evidence when judging layout, design, bugs, or requested visual changes.`;
}
