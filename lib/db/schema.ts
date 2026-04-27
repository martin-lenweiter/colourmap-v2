import {
  boolean,
  date,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

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

// ─── Circles — shared spaces ───
export const circles = pgTable('circles', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  color: text('color').notNull().default('#D4805A'),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const circleMembers = pgTable('circle_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  circleId: uuid('circle_id').notNull(),
  userId: uuid('user_id').notNull(),
  name: text('name').notNull(),
  color: text('color').notNull().default('#D4805A'),
  pulse: text('pulse'),
  pulseColor: text('pulse_color'),
  sharePulse: boolean('share_pulse').default(false).notNull(),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
});

export const circleMissions = pgTable('circle_missions', {
  id: uuid('id').defaultRandom().primaryKey(),
  circleId: uuid('circle_id').notNull(),
  text: text('text').notNull(),
  claimedBy: uuid('claimed_by'),
  done: boolean('done').default(false).notNull(),
  dueDate: date('due_date'),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const circleNotes = pgTable('circle_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  circleId: uuid('circle_id').notNull(),
  authorId: uuid('author_id').notNull(),
  authorName: text('author_name').notNull(),
  text: text('text').notNull(),
  sessionId: uuid('session_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const circleSessions = pgTable('circle_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  circleId: uuid('circle_id').notNull(),
  startedBy: uuid('started_by').notNull(),
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow().notNull(),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  summary: text('summary'),
});

export const circleDecisions = pgTable('circle_decisions', {
  id: uuid('id').defaultRandom().primaryKey(),
  circleId: uuid('circle_id').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').notNull().default('proposed'),
  decision: text('decision'),
  decidedAt: timestamp('decided_at', { withTimezone: true }),
  createdBy: uuid('created_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const circleDecisionVotes = pgTable('circle_decision_votes', {
  id: uuid('id').defaultRandom().primaryKey(),
  decisionId: uuid('decision_id').notNull(),
  memberId: uuid('member_id').notNull(),
  memberName: text('member_name').notNull(),
  value: text('value').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Designer observations — feedback log captured via the
// triple-tap dev overlay. Each entry is one block of feedback
// + the part of the app it's about (Day, Music, Circles, etc.).
export const designerObservations = pgTable('designer_observations', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  area: text('area'),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ─── Sparks ───────────────────────────────────────────────────────────────────

export type SparkCategory = 'fun' | 'creative' | 'professional' | 'growth';
export type SparkTimeWindow = 'this_week' | 'this_month' | 'no_rush';
export type SparkStatus = 'active' | 'fulfilled' | 'expired';
export type ResonanceType = 'resonate' | 'join_request';
export type ResonanceStatus = 'pending' | 'accepted' | 'ignored';

export const sparks = pgTable('sparks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull(),
  circleId: uuid('circle_id'),
  text: varchar('text', { length: 200 }).notNull(),
  category: text('category').notNull().default('fun'),
  timeWindow: text('time_window').notNull().default('this_week'),
  isOpen: boolean('is_open').notNull().default(false),
  lat: doublePrecision('lat'),
  lng: doublePrecision('lng'),
  zoneLabel: text('zone_label'),
  status: text('status').notNull().default('active'),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const sparkResonances = pgTable('spark_resonances', {
  id: uuid('id').defaultRandom().primaryKey(),
  sparkId: uuid('spark_id').notNull(),
  userId: uuid('user_id').notNull(),
  type: text('type').notNull().default('resonate'),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
