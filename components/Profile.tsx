'use client';

import { useEffect, useState } from 'react';

/*
 * Profile — anti-LinkedIn personal page. Compass colour + 3 short
 * lines (what I'm building / listening to / today's tone) + 4
 * links. Status updates daily; static identity is light.
 *
 * Spec: docs/pdfs/colourmap-vision-2026-04.pdf (Social story →
 * Profile structure).
 *
 * V1: lives in localStorage so the user can shape their own
 * profile without an API. Future: per-Circle visibility +
 * sharing.
 */

const LS_PROFILE = 'colourmap:profile';
const LS_CHECKINS = 'colourmap:check-ins';
const LS_OBJECTIVE = 'colourmap:current-objective';
const LS_TUNER_MIXES = 'colourmap:tuner-mixes';

interface ProfileData {
  name: string;
  roles: string; // "musician · designer · Paris"
  building: string; // what I'm building
  listening: string; // what I'm listening to (auto-fills from last mix)
  links: { label: string; url: string }[];
}

const DEFAULT_LINKS = [
  { label: 'soundcloud', url: '' },
  { label: 'instagram', url: '' },
  { label: 'website', url: '' },
  { label: 'email', url: '' },
];

const DEFAULT_PROFILE: ProfileData = {
  name: '',
  roles: '',
  building: '',
  listening: '',
  links: DEFAULT_LINKS,
};

interface CheckIn {
  date: string;
  mind?: string;
  mindColor?: string;
  mode?: string;
  modeColor?: string;
}

interface Mix {
  name: string;
  base?: number;
}

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function loadStr(key: string): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return '··';
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [todayCheckin, setTodayCheckin] = useState<CheckIn | null>(null);
  const [todayObjective, setTodayObjective] = useState<string>('');
  const [lastMix, setLastMix] = useState<Mix | null>(null);

  useEffect(() => {
    const restored = loadJSON<ProfileData>(LS_PROFILE, DEFAULT_PROFILE);
    setProfile(restored);
    if (!restored.name) setEditing(true);

    const checkins = loadJSON<CheckIn[]>(LS_CHECKINS, []);
    const today = new Date().toISOString().slice(0, 10);
    const latestToday = checkins.find(
      (c) => c.date && new Date(c.date).toISOString().slice(0, 10) === today,
    );
    setTodayCheckin(latestToday ?? null);

    setTodayObjective(loadStr(LS_OBJECTIVE).trim());

    const mixes = loadJSON<Mix[]>(LS_TUNER_MIXES, []);
    setLastMix(mixes[0] ?? null);
  }, []);

  function persist(next: ProfileData) {
    setProfile(next);
    try {
      localStorage.setItem(LS_PROFILE, JSON.stringify(next));
    } catch {
      /* silent */
    }
  }

  // Compass colour — pulled from today's latest check-in's mood or
  // mode tone; falls back to a soft ochre.
  const compassColour = todayCheckin?.mindColor || todayCheckin?.modeColor || '#C4A060';
  const compassLabel = todayCheckin?.mind
    ? todayCheckin.mind.toLowerCase()
    : todayCheckin?.mode
      ? todayCheckin.mode.toLowerCase()
      : 'no check-in yet';

  const initials = deriveInitials(profile.name || 'You');
  const buildingLine = profile.building || todayObjective;
  const listeningLine = profile.listening || (lastMix ? lastMix.name : '');

  return (
    <main className="mx-auto max-w-md space-y-8">
      {/* Header — initials in a coloured square + name + roles */}
      <div className="flex items-start gap-4">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
          style={{
            background: `${compassColour}25`,
            border: `1.5px solid ${compassColour}55`,
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 22,
              fontWeight: 700,
              color: compassColour,
              letterSpacing: '0.06em',
            }}
          >
            {initials}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              type="text"
              value={profile.name}
              onChange={(e) => persist({ ...profile, name: e.target.value })}
              placeholder="your name"
              className="w-full bg-transparent pb-1 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 22,
                fontWeight: 700,
                color: '#5C3018',
                borderBottom: '1px solid #C4A06030',
              }}
            />
          ) : (
            <p
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 22,
                fontWeight: 700,
                color: '#5C3018',
                lineHeight: 1.2,
              }}
            >
              {profile.name || 'name yourself'}
            </p>
          )}
          {editing ? (
            <input
              type="text"
              value={profile.roles}
              onChange={(e) => persist({ ...profile, roles: e.target.value })}
              placeholder="musician · designer · Paris"
              className="mt-1 w-full bg-transparent pb-1 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 13,
                color: '#7A5438',
                borderBottom: '1px solid #C4A06022',
              }}
            />
          ) : (
            <p
              className="mt-1"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 13,
                color: '#7A5438',
                opacity: 0.8,
              }}
            >
              {profile.roles || 'a few words about you'}
            </p>
          )}
        </div>
      </div>

      {/* Three-line in-time identity */}
      <div className="space-y-3">
        <ProfileLine
          icon="✦"
          label="today's compass"
          value={compassLabel}
          colour={compassColour}
          editing={false}
        />
        <ProfileLine
          icon="✦"
          label="what I'm building"
          value={buildingLine}
          colour="#7A5438"
          editing={editing}
          onChange={(v) => persist({ ...profile, building: v })}
          placeholder="the thing I'm focused on"
        />
        <ProfileLine
          icon="✦"
          label="what I'm listening to"
          value={listeningLine}
          colour="#7A5438"
          editing={editing}
          onChange={(v) => persist({ ...profile, listening: v })}
          placeholder="a song, a mix, a feeling"
        />
      </div>

      {/* Links */}
      <div
        className="rounded-2xl"
        style={{
          background: '#C4A06010',
          border: '1px solid #C4A06022',
          padding: '16px 18px',
        }}
      >
        <p
          className="mb-3 uppercase"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: '#8A6A4A',
            opacity: 0.7,
          }}
        >
          links
        </p>
        <div className="space-y-2">
          {profile.links.map((link, i) => (
            <div key={`${link.label}-${i}`} className="flex items-center gap-3">
              <span
                className="shrink-0"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#7A5438',
                  width: 90,
                  letterSpacing: '0.04em',
                }}
              >
                {link.label}
              </span>
              {editing ? (
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => {
                    const next = [...profile.links];
                    next[i] = { ...next[i], url: e.target.value };
                    persist({ ...profile, links: next });
                  }}
                  placeholder="paste URL or handle"
                  className="flex-1 bg-transparent pb-0.5 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-40"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 13,
                    color: '#5C3018',
                    borderBottom: '1px solid #C4A06022',
                  }}
                />
              ) : link.url ? (
                <a
                  href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 truncate"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 13,
                    color: '#5C3018',
                    textDecoration: 'none',
                  }}
                >
                  {link.url}
                </a>
              ) : (
                <span
                  className="flex-1 italic"
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 12,
                    color: '#8A6A4A',
                    opacity: 0.4,
                  }}
                >
                  —
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit toggle */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setEditing((s) => !s)}
          className="cursor-pointer rounded-full px-4 py-1.5 transition-all"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#7A5438',
            background: 'transparent',
            border: '1px solid #C4A06040',
          }}
        >
          {editing ? 'done' : 'edit'}
        </button>
      </div>

      {/* Closing line */}
      <p
        className="text-center italic"
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          color: '#8A6A4A',
          opacity: 0.45,
          letterSpacing: '0.06em',
        }}
      >
        meet me in time, not in identity.
      </p>
    </main>
  );
}

function ProfileLine({
  icon,
  label,
  value,
  colour,
  editing,
  onChange,
  placeholder,
}: {
  icon: string;
  label: string;
  value: string;
  colour: string;
  editing: boolean;
  onChange?: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="shrink-0" style={{ color: colour, fontSize: 13, opacity: 0.85 }}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <span
          className="uppercase"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: '0.16em',
            color: '#8A6A4A',
            opacity: 0.7,
            marginRight: 8,
          }}
        >
          {label}
        </span>
        {editing && onChange ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="bg-transparent pb-0.5 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-40"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              color: '#5C3018',
              borderBottom: `1px solid ${colour}30`,
              width: '60%',
            }}
          />
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 14,
              color: value ? '#5C3018' : '#8A6A4A',
              opacity: value ? 1 : 0.5,
              fontStyle: value ? 'normal' : 'italic',
            }}
          >
            {value || placeholder || '—'}
          </span>
        )}
      </div>
    </div>
  );
}
