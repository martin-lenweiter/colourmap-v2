'use client';

import { useEffect, useState } from 'react';

import ChatPanel from '@/components/Chat/ChatPanel';

interface Channel {
  id: string;
  name: string;
  position: number;
}

interface Conversation {
  id: string;
  name: string | null;
  entityType: string | null;
  channels: Channel[];
  memberCount: number;
}

const font = 'var(--font-serif)';

interface ChatPageClientProps {
  currentUserId: string;
}

export default function ChatPageClient({ currentUserId }: ChatPageClientProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [howOpen, setHowOpen] = useState(false);

  async function load() {
    const res = await fetch('/api/chat');
    if (res.ok) {
      const data: Conversation[] = await res.json();
      setConversations(data);
      if (data.length && !activeId) setActiveId(data[0].id);
    }
    setLoading(false);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: load on mount only
  useEffect(() => {
    void load();
  }, []);

  async function createConversation() {
    if (!newName.trim()) return;
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim(), memberIds: [] }),
    });
    if (res.ok) {
      const conv = await res.json();
      setConversations((prev) => [conv, ...prev]);
      setActiveId(conv.id);
      setNewName('');
      setCreating(false);
    }
  }

  const active = conversations.find((c) => c.id === activeId);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <p style={{ fontFamily: font, fontSize: 14, color: '#8A6A4A', opacity: 0.5 }}>loading…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2
          style={{
            fontFamily: font,
            fontSize: 22,
            fontWeight: 700,
            color: '#5C3018',
            letterSpacing: '0.04em',
          }}
        >
          Chat
        </h2>
        <button
          type="button"
          onClick={() => setCreating((s) => !s)}
          style={{
            fontFamily: font,
            fontSize: 13,
            fontWeight: 700,
            color: creating ? '#8A6A4A' : '#fff',
            background: creating ? 'transparent' : '#C4A060',
            border: creating ? '1px solid #C4A06030' : 'none',
            borderRadius: 20,
            padding: '5px 16px',
            cursor: 'pointer',
          }}
        >
          {creating ? 'cancel' : '+ new'}
        </button>
      </div>

      {/* How Chat works */}
      <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3 mb-4">
        <button
          type="button"
          onClick={() => setHowOpen((o) => !o)}
          className="flex w-full cursor-pointer items-center justify-between"
          style={{ background: 'none', border: 'none', padding: 0 }}
          aria-expanded={howOpen}
        >
          <span
            className="uppercase"
            style={{
              fontFamily: font,
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#5C3018',
            }}
          >
            How Chat works
          </span>
          <span
            style={{
              transform: howOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
              color: '#8A6A4A',
            }}
          >
            ▾
          </span>
        </button>
        {howOpen && (
          <div
            className="mt-4 space-y-3 animate-in fade-in duration-150"
            style={{ fontFamily: font, fontSize: 16, lineHeight: 1.55, color: '#5C3018' }}
          >
            <p>
              <strong>Chat</strong> is for real conversations with people in your Circles.
            </p>
            <p>
              Create a conversation, invite members, and talk directly — no feeds, no threads. Just
              people talking.
            </p>
          </div>
        )}
      </div>

      {creating && (
        <div className="mb-6 flex gap-3 items-center">
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void createConversation();
            }}
            placeholder="conversation name…"
            style={{
              fontFamily: font,
              fontSize: 15,
              color: '#5C3018',
              background: 'transparent',
              border: 'none',
              borderBottom: '2px solid #C4A06040',
              outline: 'none',
              flex: 1,
              paddingBottom: 4,
            }}
          />
          <button
            type="button"
            onClick={() => void createConversation()}
            style={{
              fontFamily: font,
              fontSize: 13,
              fontWeight: 700,
              color: '#fff',
              background: '#C4A060',
              border: 'none',
              borderRadius: 20,
              padding: '5px 16px',
              cursor: 'pointer',
            }}
          >
            create
          </button>
        </div>
      )}

      {conversations.length === 0 && !creating ? (
        <div className="py-12 text-center space-y-3">
          <p
            style={{
              fontFamily: font,
              fontSize: 18,
              fontWeight: 600,
              color: '#5C3018',
              lineHeight: 1.4,
            }}
          >
            no conversations yet
          </p>
          <p style={{ fontFamily: font, fontSize: 14, color: '#8A6A4A', opacity: 0.6 }}>
            create one to start chatting
          </p>
          <button
            type="button"
            onClick={() => setCreating(true)}
            style={{
              marginTop: 8,
              fontFamily: font,
              fontSize: 14,
              fontWeight: 700,
              color: '#C4A060',
              background: 'none',
              border: '1px solid #C4A06040',
              borderRadius: 20,
              padding: '6px 20px',
              cursor: 'pointer',
            }}
          >
            start a conversation
          </button>
        </div>
      ) : (
        <div className="flex gap-4">
          {/* Conversation list */}
          {conversations.length > 1 && (
            <div className="shrink-0 space-y-1" style={{ width: 180 }}>
              {conversations.map((c) => {
                const isActive = c.id === activeId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className="w-full text-left rounded-xl px-3 py-2 transition-colors"
                    style={{
                      background: isActive ? '#C4A06015' : 'transparent',
                      border: isActive ? '1px solid #C4A06030' : '1px solid transparent',
                      fontFamily: font,
                      cursor: 'pointer',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 14,
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? '#5C3018' : '#8A6A4A',
                      }}
                    >
                      {c.name ?? 'DM'}
                    </p>
                    <p style={{ fontSize: 11, color: '#8A6A4A', opacity: 0.5 }}>
                      {c.channels.length} channel{c.channels.length !== 1 ? 's' : ''} ·{' '}
                      {c.memberCount} member{c.memberCount !== 1 ? 's' : ''}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Chat panel */}
          {active && (
            <div className="flex-1 min-w-0">
              <ChatPanel
                conversationId={active.id}
                currentUserId={currentUserId}
                initialChannels={active.channels}
                entityLabel={active.name ?? undefined}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
