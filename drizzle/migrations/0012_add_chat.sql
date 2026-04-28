-- Chat layer — universal multi-channel messaging primitive.
--
-- A conversation is a shared space between N people.
-- Channels are named threads inside a conversation.
-- Messages live inside channels.
--
-- entity_type + entity_id allow polymorphic attachment:
--   entity_type = 'circle'  → owned by a circle
--   entity_type = 'spark'   → attached to a spark
--   both null               → standalone DM / group chat

CREATE TABLE IF NOT EXISTS conversations (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT,                          -- null for 1:1 DMs
  entity_type  TEXT,                          -- 'circle' | 'spark' | null
  entity_id    UUID,                          -- FK value when entity_type is set
  created_by   UUID        NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_members (
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL,
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

CREATE TABLE IF NOT EXISTS channels (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID        NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  position        INTEGER     NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id  UUID        NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id     UUID        NOT NULL,
  text        TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookups
CREATE INDEX IF NOT EXISTS conversations_created_by_idx   ON conversations (created_by);
CREATE INDEX IF NOT EXISTS conversation_members_user_idx  ON conversation_members (user_id);
CREATE INDEX IF NOT EXISTS channels_conversation_idx      ON channels (conversation_id, position);
CREATE INDEX IF NOT EXISTS messages_channel_idx           ON messages (channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS conversations_entity_idx
  ON conversations (entity_type, entity_id)
  WHERE entity_type IS NOT NULL;
