'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Channel {
  id: string;
  name: string;
  position: number;
}

interface Message {
  id: string;
  channelId: string;
  userId: string;
  text: string;
  createdAt: string;
}

interface ChatPanelProps {
  conversationId: string;
  currentUserId: string;
  initialChannels?: Channel[];
  entityLabel?: string; // e.g. "Band · The Midnight Orbit"
}

const font = 'var(--font-serif)';

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDay(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'today';
  if (d.toDateString() === yesterday.toDateString()) return 'yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function groupByDay(msgs: Message[]) {
  const groups: { day: string; messages: Message[] }[] = [];
  for (const msg of msgs) {
    const day = formatDay(msg.createdAt);
    if (!groups.length || groups[groups.length - 1].day !== day) {
      groups.push({ day, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }
  return groups;
}

export default function ChatPanel({
  conversationId,
  currentUserId,
  initialChannels = [],
  entityLabel,
}: ChatPanelProps) {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [activeChannelId, setActiveChannelId] = useState<string>(initialChannels[0]?.id ?? '');
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [addingChannel, setAddingChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastMsgIdRef = useRef<string | null>(null);

  const messagesUrl = useCallback(
    (cid: string) => `/api/chat/${conversationId}/channels/${cid}/messages`,
    [conversationId],
  );

  const loadMessages = useCallback(
    async (channelId: string) => {
      const res = await fetch(messagesUrl(channelId));
      if (!res.ok) return;
      const data: Message[] = await res.json();
      setMessages(data);
      if (data.length) lastMsgIdRef.current = data[data.length - 1].id;
    },
    [messagesUrl],
  );

  // Load channels if not pre-supplied
  useEffect(() => {
    if (initialChannels.length === 0) {
      fetch(`/api/chat/${conversationId}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.channels?.length) {
            setChannels(data.channels);
            setActiveChannelId(data.channels[0].id);
          }
        })
        .catch(() => null);
    }
  }, [conversationId, initialChannels.length]);

  // Load + poll messages when channel changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: loadMessages is stable
  useEffect(() => {
    if (!activeChannelId) return;
    void loadMessages(activeChannelId);

    pollRef.current = setInterval(async () => {
      const res = await fetch(messagesUrl(activeChannelId));
      if (!res.ok) return;
      const data: Message[] = await res.json();
      const lastId = data.length ? data[data.length - 1].id : null;
      if (lastId && lastId !== lastMsgIdRef.current) {
        setMessages(data);
        lastMsgIdRef.current = lastId;
      }
    }, 1500);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeChannelId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message list change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function send() {
    if (!text.trim() || !activeChannelId || sending) return;
    setSending(true);
    const optimistic: Message = {
      id: `opt-${Date.now()}`,
      channelId: activeChannelId,
      userId: currentUserId,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setText('');
    try {
      await fetch(messagesUrl(activeChannelId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: optimistic.text }),
      });
      await loadMessages(activeChannelId);
    } finally {
      setSending(false);
    }
  }

  async function createChannel() {
    if (!newChannelName.trim()) return;
    const res = await fetch(`/api/chat/${conversationId}/channels`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newChannelName.trim() }),
    });
    if (res.ok) {
      const ch: Channel = await res.json();
      setChannels((prev) => [...prev, ch]);
      setActiveChannelId(ch.id);
      setNewChannelName('');
      setAddingChannel(false);
    }
  }

  const groups = groupByDay(messages);

  return (
    <div
      className="flex rounded-2xl overflow-hidden"
      style={{
        height: 520,
        background: 'var(--card)',
        border: '1px solid var(--border)',
        fontFamily: font,
      }}
    >
      {/* Channel sidebar */}
      <div
        className="flex flex-col shrink-0"
        style={{
          width: 140,
          borderRight: '1px solid var(--border)',
          background: '#F5E8C80A',
        }}
      >
        {entityLabel && (
          <div
            className="px-3 py-3"
            style={{
              borderBottom: '1px solid var(--border)',
              fontSize: 10,
              fontWeight: 700,
              color: '#8A6A4A',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              opacity: 0.7,
            }}
          >
            {entityLabel}
          </div>
        )}

        <div className="flex-1 overflow-y-auto py-2">
          {channels.map((ch) => {
            const active = ch.id === activeChannelId;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => setActiveChannelId(ch.id)}
                className="w-full text-left px-3 py-1.5 transition-colors"
                style={{
                  background: active ? '#C4A06015' : 'transparent',
                  border: 'none',
                  fontSize: 13,
                  fontFamily: font,
                  fontWeight: active ? 700 : 500,
                  color: active ? '#5C3018' : '#8A6A4A',
                  cursor: 'pointer',
                  borderLeft: active ? '2px solid #C4A060' : '2px solid transparent',
                }}
              >
                # {ch.name}
              </button>
            );
          })}
        </div>

        {/* Add channel */}
        <div className="p-2" style={{ borderTop: '1px solid var(--border)' }}>
          {addingChannel ? (
            <input
              autoFocus
              value={newChannelName}
              onChange={(e) => setNewChannelName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void createChannel();
                if (e.key === 'Escape') setAddingChannel(false);
              }}
              placeholder="channel name"
              style={{
                fontFamily: font,
                fontSize: 12,
                color: '#5C3018',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid #C4A06040',
                outline: 'none',
                width: '100%',
                paddingBottom: 2,
              }}
            />
          ) : (
            <button
              type="button"
              onClick={() => setAddingChannel(true)}
              style={{
                fontFamily: font,
                fontSize: 11,
                color: '#8A6A4A',
                opacity: 0.5,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              + channel
            </button>
          )}
        </div>
      </div>

      {/* Message area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Channel header */}
        <div className="px-4 py-2.5 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#5C3018' }}>
            #{channels.find((c) => c.id === activeChannelId)?.name ?? '…'}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-0.5">
          {groups.length === 0 && (
            <p
              className="text-center italic py-8"
              style={{ fontSize: 13, color: '#8A6A4A', opacity: 0.45 }}
            >
              nothing yet — say something
            </p>
          )}
          {groups.map((group) => (
            <div key={group.day}>
              <div className="flex items-center gap-2 my-3">
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span
                  style={{
                    fontSize: 10,
                    color: '#8A6A4A',
                    opacity: 0.45,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontFamily: font,
                  }}
                >
                  {group.day}
                </span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
              {group.messages.map((msg) => {
                const isOwn = msg.userId === currentUserId;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 py-0.5 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className="shrink-0 rounded-full flex items-center justify-center"
                      style={{
                        width: 28,
                        height: 28,
                        background: isOwn ? '#C4A06025' : '#7AAA5825',
                        marginTop: 2,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: isOwn ? '#C4A060' : '#7AAA58',
                          fontFamily: font,
                        }}
                      >
                        {isOwn ? 'me' : '?'}
                      </span>
                    </div>
                    <div
                      className={`max-w-[75%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}
                    >
                      <div
                        className="rounded-2xl px-3 py-2"
                        style={{
                          background: isOwn ? '#C4A06018' : '#F5E8C820',
                          border: `1px solid ${isOwn ? '#C4A06030' : '#C4A06018'}`,
                        }}
                      >
                        <p style={{ fontSize: 13.5, color: '#3C2010', lineHeight: 1.45 }}>
                          {msg.text}
                        </p>
                      </div>
                      <span style={{ fontSize: 10, color: '#8A6A4A', opacity: 0.4, marginTop: 2 }}>
                        {formatTime(msg.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-3 pb-3 pt-2 shrink-0" style={{ borderTop: '1px solid var(--border)' }}>
          <div
            className="flex items-end gap-2 rounded-xl px-3 py-2"
            style={{ background: '#F5E8C815', border: '1px solid var(--border)' }}
          >
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${e.target.scrollHeight}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              placeholder="write something…"
              rows={1}
              style={{
                fontFamily: font,
                fontSize: 14,
                color: '#3C2010',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                overflow: 'hidden',
                flex: 1,
                lineHeight: 1.4,
                maxHeight: 120,
              }}
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={!text.trim() || sending}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: text.trim() ? '#C4A060' : '#C4A06030',
                border: 'none',
                cursor: text.trim() ? 'pointer' : 'default',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.15s',
              }}
            >
              <svg width={14} height={14} viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M1 13L13 7 1 1v5l8.5 1L1 8v5z" fill={text.trim() ? '#fff' : '#C4A060'} />
              </svg>
            </button>
          </div>
          <p style={{ fontSize: 10, color: '#8A6A4A', opacity: 0.3, marginTop: 4, paddingLeft: 2 }}>
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
