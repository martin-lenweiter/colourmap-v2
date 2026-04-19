-- Daily objectives (today + push for tomorrow)
CREATE TABLE IF NOT EXISTS daily_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT false,
  list TEXT NOT NULL DEFAULT 'today',
  notes TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Agenda blocks
CREATE TABLE IF NOT EXISTS agenda_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  date DATE NOT NULL,
  start_hour INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  color TEXT NOT NULL DEFAULT '#C4A060',
  kind TEXT NOT NULL DEFAULT 'mission',
  tag_name TEXT,
  tag_color TEXT,
  tag_category_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Life categories
CREATE TABLE IF NOT EXISTS life_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#C4A060',
  compass TEXT,
  state TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Outings / social life
CREATE TABLE IF NOT EXISTS outings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  text TEXT NOT NULL,
  date DATE NOT NULL,
  color TEXT NOT NULL DEFAULT '#6B7F4E',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
