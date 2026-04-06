import { and, desc, eq } from 'drizzle-orm';

import { getDb } from '@/lib/db/client';
import { notebookEntries } from '@/lib/db/schema';

export class NotebookValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotebookValidationError';
  }
}

export type CreateNotebookEntryInput = {
  category: string;
  title: string;
  content: string | null;
  tags: string[] | null;
};

export type UpdateNotebookEntryInput = Partial<CreateNotebookEntryInput>;

export function normalizeCreateNotebookEntryInput(input: unknown): CreateNotebookEntryInput {
  if (typeof input !== 'object' || input === null) {
    throw new NotebookValidationError('category and title required');
  }

  const { category, title, content, tags } = input as {
    category?: unknown;
    title?: unknown;
    content?: unknown;
    tags?: unknown;
  };

  if (
    typeof category !== 'string' ||
    category.trim().length === 0 ||
    typeof title !== 'string' ||
    title.trim().length === 0
  ) {
    throw new NotebookValidationError('category and title required');
  }

  return {
    category: category.trim(),
    title: title.trim(),
    content: typeof content === 'string' ? content.trim() || null : null,
    tags: Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === 'string') : null,
  };
}

export function normalizeUpdateNotebookEntryInput(input: unknown): UpdateNotebookEntryInput {
  if (typeof input !== 'object' || input === null) {
    throw new NotebookValidationError('Invalid body');
  }

  const { category, title, content, tags } = input as {
    category?: unknown;
    title?: unknown;
    content?: unknown;
    tags?: unknown;
  };

  const update: UpdateNotebookEntryInput = {};

  if (typeof category === 'string' && category.trim()) {
    update.category = category.trim();
  }

  if (typeof title === 'string' && title.trim()) {
    update.title = title.trim();
  }

  if (typeof content === 'string' || content === null) {
    update.content = typeof content === 'string' ? content.trim() || null : null;
  }

  if (Array.isArray(tags) || tags === null) {
    update.tags = Array.isArray(tags)
      ? tags.filter((tag): tag is string => typeof tag === 'string')
      : null;
  }

  if (Object.keys(update).length === 0) {
    throw new NotebookValidationError('No valid fields');
  }

  return update;
}

export async function listNotebookEntries(userId: string) {
  const db = getDb();
  return db
    .select()
    .from(notebookEntries)
    .where(eq(notebookEntries.userId, userId))
    .orderBy(desc(notebookEntries.updatedAt));
}

export async function createNotebookEntry(userId: string, input: CreateNotebookEntryInput) {
  const db = getDb();
  const [entry] = await db
    .insert(notebookEntries)
    .values({
      userId,
      category: input.category,
      title: input.title,
      content: input.content,
      tags: input.tags,
    })
    .returning();

  return entry;
}

export async function updateNotebookEntry(
  userId: string,
  entryId: string,
  input: UpdateNotebookEntryInput,
) {
  const db = getDb();
  const [updated] = await db
    .update(notebookEntries)
    .set({ ...input, updatedAt: new Date() })
    .where(and(eq(notebookEntries.id, entryId), eq(notebookEntries.userId, userId)))
    .returning();

  return updated ?? null;
}

export async function deleteNotebookEntry(userId: string, entryId: string) {
  const db = getDb();
  await db
    .delete(notebookEntries)
    .where(and(eq(notebookEntries.id, entryId), eq(notebookEntries.userId, userId)));
}
