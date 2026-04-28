# Chat — Universal Messaging Layer

> "You have contacts and you can chat. One conversation, multiple channels.
> Works standalone, inside a Circle, or attached to a Spark."
> — Martin, 2026-04-28

## What it is

A lightweight, multi-channel messaging primitive. A **conversation** is a
shared space between N people. Inside it, **channels** are named threads
(e.g. "general", "weekend", "ideas"). **Messages** live inside channels.

The core is universal — the same `<ChatPanel conversationId="…" />` component
works whether it's embedded in a Circle, opened from a Spark, or accessed
as a standalone /chat page.

## Data model

```
conversations
  id, name (nullable for 1:1), entity_type (circle|spark|null),
  entity_id (nullable), created_by, created_at

conversation_members
  conversation_id, user_id, joined_at
  PK: (conversation_id, user_id)

channels
  id, conversation_id, name, position, created_at

messages
  id, channel_id, user_id, text, created_at
```

`entity_type` + `entity_id` = polymorphic attachment. A Circle can own a
conversation (entity_type='circle'). A Spark can own one too. Standalone
DMs/groups have both null.

## API surface

| Method | Route | Purpose |
|--------|-------|---------|
| GET | /api/chat | List my conversations |
| POST | /api/chat | Create conversation + first channel |
| GET | /api/chat/[id] | Conversation + members + channels |
| POST | /api/chat/[id]/channels | Add a channel |
| GET | /api/chat/[id]/channels/[cid]/messages | Paginated messages |
| POST | /api/chat/[id]/channels/[cid]/messages | Send a message |

## Component API

```tsx
// Fully self-contained — drop anywhere
<ChatPanel conversationId="uuid" />

// Attach to an entity
<ChatPanel conversationId="uuid" entityType="circle" entityLabel="Band" />
```

## Phase 1 scope (this build)

- DB schema + migration
- Full API layer (conversations, channels, messages)
- `<ChatPanel>` component: channel sidebar + message list + input
- `/chat` standalone page with conversation list + panel
- Polling-based refresh (500ms) — Supabase realtime in Phase 2
- Tests for service layer

## Out of scope for now

- Read receipts / unread counts
- File / image attachments
- Reactions / threads
- Push notifications
- Supabase realtime subscriptions (Phase 2)
- Contact directory UI (use existing user search / circle members)
