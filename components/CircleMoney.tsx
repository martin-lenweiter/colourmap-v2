'use client';

import { useEffect, useState } from 'react';

/*
 * CircleMoney — shared budget tracker. Each entry: amount,
 * description, paid-by, optional split. Net balance per member
 * shown below.
 *
 * Per Martin (2026-04-26): item 8 from Circles evolution list.
 * V1 storage: localStorage keyed by circle id.
 */

const LS = 'colourmap:circle-money';

interface Expense {
  id: string;
  amount: number;
  currency: string;
  description: string;
  paidById: string;
  paidByName: string;
  /** Member ids the expense is split among (defaults to all members). */
  splitAmong: string[];
  createdAt: string;
}

type Store = Record<string, Expense[]>;

function load(): Store {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LS);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}

function persist(s: Store) {
  try {
    localStorage.setItem(LS, JSON.stringify(s));
  } catch {
    /* silent */
  }
}

export default function CircleMoney({
  circleId,
  meId,
  meName,
  members,
}: {
  circleId: string;
  meId: string;
  meName: string;
  members: { id: string; name: string; color: string }[];
}) {
  const [store, setStore] = useState<Store>({});
  const [open, setOpen] = useState(false);
  const [amountInput, setAmountInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [currencyInput, setCurrencyInput] = useState('€');

  useEffect(() => {
    setStore(load());
  }, []);

  const expenses = (store[circleId] ?? [])
    .slice()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  function add() {
    const amount = Number.parseFloat(amountInput);
    const desc = descInput.trim();
    if (!Number.isFinite(amount) || amount <= 0 || !desc) return;
    const expense: Expense = {
      id: crypto.randomUUID(),
      amount,
      currency: currencyInput,
      description: desc,
      paidById: meId,
      paidByName: meName,
      splitAmong: members.map((m) => m.id),
      createdAt: new Date().toISOString(),
    };
    const next = { ...store, [circleId]: [expense, ...expenses] };
    setStore(next);
    persist(next);
    setAmountInput('');
    setDescInput('');
  }

  function remove(id: string) {
    const next = { ...store, [circleId]: expenses.filter((e) => e.id !== id) };
    setStore(next);
    persist(next);
  }

  // Compute net balance per member: positive = owed money, negative = owes.
  const balances = new Map<string, number>();
  for (const m of members) balances.set(m.id, 0);
  for (const e of expenses) {
    const share = e.amount / Math.max(1, e.splitAmong.length);
    balances.set(e.paidById, (balances.get(e.paidById) ?? 0) + e.amount);
    for (const id of e.splitAmong) {
      balances.set(id, (balances.get(id) ?? 0) - share);
    }
  }

  const total = expenses.reduce((acc, e) => acc + e.amount, 0);
  const currency = expenses[0]?.currency ?? currencyInput;

  return (
    <div
      className="rounded-2xl border"
      style={{ borderColor: '#7AAA5830', background: '#7AAA5808' }}
    >
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3"
        style={{ background: 'none', border: 'none' }}
      >
        <span
          className="uppercase"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: '#5F7447',
          }}
        >
          money · {currency}
          {total.toFixed(2)} total
        </span>
        <span style={{ fontSize: 11, color: '#5F744780' }}>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className="space-y-3 px-4 pb-4 animate-in fade-in duration-150">
          {/* Add new */}
          <div className="space-y-2 rounded-lg border border-[#7AAA5825] bg-white/30 p-3">
            <div className="flex gap-2">
              <select
                value={currencyInput}
                onChange={(e) => setCurrencyInput(e.target.value)}
                className="rounded-full bg-transparent px-2 py-0.5 outline-none"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                  color: '#5F7447',
                  border: '1px solid #7AAA5840',
                }}
              >
                <option value="€">€</option>
                <option value="$">$</option>
                <option value="£">£</option>
              </select>
              <input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="0"
                className="w-20 rounded-full bg-transparent px-2 py-0.5 outline-none"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 13,
                  color: '#5C3018',
                  border: '1px solid #7AAA5840',
                }}
                inputMode="decimal"
                step="0.01"
              />
              <input
                type="text"
                value={descInput}
                onChange={(e) => setDescInput(e.target.value)}
                placeholder="what for?"
                className="flex-1 border-b bg-transparent pb-0.5 outline-none placeholder:italic placeholder:text-[#8A6A4A] placeholder:opacity-50"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 13,
                  color: '#5C3018',
                  borderColor: '#7AAA5825',
                }}
              />
            </div>
            {amountInput && descInput.trim() && (
              <button
                type="button"
                onClick={add}
                className="cursor-pointer rounded-full px-3 py-1"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: '#5F7447',
                  background: '#7AAA5818',
                  border: '1px solid #7AAA5850',
                }}
              >
                add expense
              </button>
            )}
          </div>

          {/* Balances */}
          {expenses.length > 0 && (
            <div className="space-y-1">
              <p
                className="uppercase"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  color: '#7A5438',
                  opacity: 0.6,
                }}
              >
                balance
              </p>
              {members.map((m) => {
                const bal = balances.get(m.id) ?? 0;
                const owed = bal > 0;
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between"
                    style={{
                      fontFamily: 'var(--font-serif)',
                      fontSize: 12,
                    }}
                  >
                    <span style={{ fontWeight: 600, color: m.color }}>{m.name}</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: owed ? '#5F7447' : bal < -0.01 ? '#B33A2B' : '#8A6A4A',
                      }}
                    >
                      {owed ? '+' : ''}
                      {currency}
                      {bal.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Expense list */}
          {expenses.map((e) => (
            <div
              key={e.id}
              className="flex items-start justify-between gap-2 rounded-lg"
              style={{
                background: '#7AAA5808',
                border: '1px solid #7AAA5820',
                padding: '8px 10px',
              }}
            >
              <div className="flex-1">
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 13,
                    color: '#5C3018',
                    lineHeight: 1.3,
                  }}
                >
                  <strong style={{ color: '#5F7447' }}>
                    {e.currency}
                    {e.amount.toFixed(2)}
                  </strong>{' '}
                  {e.description}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 11.5,
                    color: '#8A6A4A',
                    opacity: 0.75,
                  }}
                >
                  paid by {e.paidByName} ·{' '}
                  {new Date(e.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </p>
              </div>
              {e.paidById === meId && (
                <button
                  type="button"
                  onClick={() => remove(e.id)}
                  className="cursor-pointer text-[10px]"
                  style={{ color: '#8A6A4A', opacity: 0.3, background: 'none', border: 'none' }}
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {expenses.length === 0 && (
            <p
              className="text-center italic"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 11,
                color: '#8A6A4A',
                opacity: 0.5,
              }}
            >
              no expenses yet
            </p>
          )}
        </div>
      )}
    </div>
  );
}
