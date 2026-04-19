import { boolean, date, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export type CheckInFacingEntry = {
  label: string;
  answers: string[];
};

export type CheckInFacing = Record<string, CheckInFacingEntry>;

export type CheckInPulses = Partial<Record<'body' | 'attitude' | 'structure', number>>;

export type CheckInFeelingCompass = Partial<
  Record<'attitude' | 'emotions' | 'presence' | 'body', number>
>;

export const checkIns = pgTable('check_ins', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  sliderValue: integer('slider_value').notNull(),
  note: text('note'),
  tags: text('tags').array(),
  missionId: uuid('mission_id'),
  emotionName: text('emotion_name'),
  emotionColor: text('emotion_color'),
  facing: jsonb('facing').$type<CheckInFacing | null>(),
  pulses: jsonb('pulses').$type<CheckInPulses | null>(),
  challenge: text('challenge'),
  flow: text('flow'),
  feelingCompass: jsonb('feeling_compass').$type<CheckInFeelingCompass | null>(),
  feelingStage: integer('feeling_stage'),
  feelingSupport: jsonb('feeling_support').$type<string[] | null>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const missions = pgTable('missions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  blocking: text('blocking'),
  nextStep: text('next_step'),
  completed: boolean('completed').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const backlog = pgTable('backlog', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  title: text('title').notNull(),
  notes: text('notes'),
  done: boolean('done').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lifeScans = pgTable('life_scans', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  door: text('door').notNull(),
  sliders: jsonb('sliders').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const scanReflections = pgTable('scan_reflections', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  scanGroup: uuid('scan_group').notNull(),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const cockpitSections = pgTable('cockpit_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sectionTrackers = pgTable('section_trackers', {
  id: uuid('id').defaultRandom().primaryKey(),
  sectionId: uuid('section_id').notNull(),
  label: text('label').notNull(),
  type: text('type').notNull(),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const lifeScanAnswers = pgTable('life_scan_answers', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  key: text('key').notNull(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const notebookEntries = pgTable('notebook_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  category: text('category').notNull(),
  title: text('title').notNull(),
  content: text('content'),
  tags: text('tags').array(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Daily objectives (today + push for tomorrow) ───
export const dailyObjectives = pgTable('daily_objectives', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  text: text('text').notNull(),
  done: boolean('done').notNull().default(false),
  list: text('list').notNull().default('today'), // 'today' | 'tomorrow'
  notes: text('notes'),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Agenda blocks ───
export const agendaBlocks = pgTable('agenda_blocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  text: text('text').notNull(),
  date: date('date').notNull(),
  startHour: integer('start_hour').notNull(),
  duration: integer('duration_minutes').notNull().default(60), // in minutes
  color: text('color').notNull().default('#C4A060'),
  kind: text('kind').notNull().default('mission'), // 'mission' | 'emotion'
  tagName: text('tag_name'),
  tagColor: text('tag_color'),
  tagCategoryId: text('tag_category_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Life categories ───
export const lifeCategories = pgTable('life_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#C4A060'),
  compass: text('compass'), // 'caring' | 'doing' | 'sharing' | null
  state: text('state'), // 'flowing' | 'stuck' | null
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Outings / social life ───
export const outings = pgTable('outings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  text: text('text').notNull(),
  date: date('date').notNull(),
  color: text('color').notNull().default('#6B7F4E'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const dailyTrackerEntries = pgTable('daily_tracker_entries', {
  id: uuid('id').defaultRandom().primaryKey(),
  trackerId: uuid('tracker_id').notNull(),
  userId: uuid('user_id').notNull(),
  date: date('date').notNull(),
  value: integer('value').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
