'use client';

import { useEffect, useState } from 'react';
import { DOING_CATEGORIES, type DoingCategory } from '@/components/DoingCategoryRail';

const INBOX_KEY = 'colourmap:doing-inbox';
const DATE_KEY = 'colourmap:inbox-date';

interface QuickTask {
  id: string;
  text: string;
  done: boolean;
  category: DoingCategory;
  when: 'today' | 'tomorrow';
  createdAt: string;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function load(): QuickTask[] {
  try {
    return JSON.parse(localStorage.getItem(INBOX_KEY) || '[]');
  } catch {
    return [];
  }
}

function save(tasks: QuickTask[]) {
  localStorage.setItem(INBOX_KEY, JSON.stringify(tasks));
}

function promoteIfNewDay(tasks: QuickTask[]): QuickTask[] {
  const today = todayStr();
  const stored = localStorage.getItem(DATE_KEY);
  if (stored === today) return tasks;
  localStorage.setItem(DATE_KEY, today);
  return tasks.map((t) => (t.when === 'tomorrow' ? { ...t, when: 'today' as const } : t));
}

function CategoryDot({
  category,
  onChange,
}: {
  category: DoingCategory;
  onChange: (c: DoingCategory) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = DOING_CATEGORIES.find((c) => c.id === category)!;

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="h-3 w-3 rounded-full transition-all hover:scale-125"
        style={{ background: current.color }}
        title={current.label}
      />
      {open && (
        <div className="absolute top-5 left-0 z-50 flex gap-1.5 p-2 rounded-lg border border-border bg-card shadow-lg animate-in fade-in duration-100">
          {DOING_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onChange(c.id);
                setOpen(false);
              }}
              className="h-3.5 w-3.5 rounded-full transition-all hover:scale-125"
              style={{ background: c.color, opacity: c.id === category ? 1 : 0.4 }}
              title={c.label}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DoingInboxProps {
  categoryFilter: DoingCategory[];
}

export default function DoingInbox({ categoryFilter }: DoingInboxProps) {
  const [tasks, setTasks] = useState<QuickTask[]>([]);
  const [input, setInput] = useState('');
  const [newCategory, setNewCategory] = useState<DoingCategory>('org');
  const [showTomorrow, setShowTomorrow] = useState(false);
  const [newCatOpen, setNewCatOpen] = useState(false);

  useEffect(() => {
    const promoted = promoteIfNewDay(load());
    setTasks(promoted);
    save(promoted);
  }, []);

  function update(next: QuickTask[]) {
    setTasks(next);
    save(next);
  }

  function add() {
    if (!input.trim()) return;
    const task: QuickTask = {
      id: crypto.randomUUID(),
      text: input.trim(),
      done: false,
      category: newCategory,
      when: 'today',
      createdAt: new Date().toISOString(),
    };
    update([task, ...tasks]);
    setInput('');
  }

  function toggle(id: string) {
    update(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  function defer(id: string) {
    update(tasks.map((t) => (t.id === id ? { ...t, when: 'tomorrow' as const } : t)));
  }

  function undefer(id: string) {
    update(tasks.map((t) => (t.id === id ? { ...t, when: 'today' as const } : t)));
  }

  function remove(id: string) {
    update(tasks.filter((t) => t.id !== id));
  }

  function setCategory(id: string, cat: DoingCategory) {
    update(tasks.map((t) => (t.id === id ? { ...t, category: cat } : t)));
  }

  const filterActive = categoryFilter.length > 0 && categoryFilter.length < DOING_CATEGORIES.length;

  const todayTasks = tasks.filter(
    (t) => t.when === 'today' && (!filterActive || categoryFilter.includes(t.category)),
  );
  const tomorrowTasks = tasks.filter(
    (t) => t.when === 'tomorrow' && (!filterActive || categoryFilter.includes(t.category)),
  );
  const doneTasks = todayTasks.filter((t) => t.done);
  const activeTasks = todayTasks.filter((t) => !t.done);

  const currentCatConfig = DOING_CATEGORIES.find((c) => c.id === newCategory)!;

  return (
    <div className="space-y-3">
      {/* Section label */}
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: '#C4A06060', fontFamily: 'var(--font-serif)' }}
      >
        Quick Tasks
      </p>

      {/* Add task row */}
      <div className="flex items-center gap-2">
        {/* Category picker for new task */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setNewCatOpen((s) => !s)}
            className="h-3 w-3 rounded-full transition-all hover:scale-125"
            style={{ background: currentCatConfig.color }}
            title={currentCatConfig.label}
          />
          {newCatOpen && (
            <div className="absolute top-5 left-0 z-50 flex gap-1.5 p-2 rounded-lg border border-border bg-card shadow-lg animate-in fade-in duration-100">
              {DOING_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setNewCategory(c.id);
                    setNewCatOpen(false);
                  }}
                  className="h-3.5 w-3.5 rounded-full transition-all hover:scale-125"
                  style={{ background: c.color, opacity: c.id === newCategory ? 1 : 0.4 }}
                  title={c.label}
                />
              ))}
            </div>
          )}
        </div>

        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') add();
          }}
          placeholder="Add task..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/30"
          style={{ color: '#7a5438', fontFamily: 'var(--font-handwritten)' }}
        />
        {input.trim() && (
          <button
            type="button"
            onClick={add}
            className="text-xs shrink-0"
            style={{ color: '#C4A060' }}
          >
            +
          </button>
        )}
      </div>

      {/* Active today tasks */}
      {activeTasks.length > 0 && (
        <div className="space-y-1">
          {activeTasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggle={() => toggle(t.id)}
              onDefer={() => defer(t.id)}
              onRemove={() => remove(t.id)}
              onCategoryChange={(c) => setCategory(t.id, c)}
            />
          ))}
        </div>
      )}

      {/* Done today — collapsed */}
      {doneTasks.length > 0 && (
        <p className="text-xs text-muted-foreground/30 pl-5">{doneTasks.length} done</p>
      )}

      {/* Tomorrow shelf */}
      <button
        type="button"
        onClick={() => setShowTomorrow((s) => !s)}
        className="flex items-center gap-1.5 text-xs transition-colors"
        style={{ color: '#C4A06050' }}
      >
        <span>Tomorrow</span>
        {tomorrowTasks.length > 0 && (
          <span
            className="rounded-full px-1.5 py-0.5 text-[10px]"
            style={{ background: '#C4A06015', color: '#C4A060' }}
          >
            {tomorrowTasks.length}
          </span>
        )}
        <span>{showTomorrow ? '−' : '+'}</span>
      </button>

      {showTomorrow && (
        <div className="space-y-1 pl-1 animate-in fade-in duration-150">
          {tomorrowTasks.length === 0 && (
            <p className="text-xs text-muted-foreground/30">Nothing parked for tomorrow.</p>
          )}
          {tomorrowTasks.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              tomorrow
              onToggle={() => toggle(t.id)}
              onDefer={() => undefer(t.id)}
              onRemove={() => remove(t.id)}
              onCategoryChange={(c) => setCategory(t.id, c)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TaskRow({
  task,
  tomorrow = false,
  onToggle,
  onDefer,
  onRemove,
  onCategoryChange,
}: {
  task: QuickTask;
  tomorrow?: boolean;
  onToggle: () => void;
  onDefer: () => void;
  onRemove: () => void;
  onCategoryChange: (c: DoingCategory) => void;
}) {
  const catConfig = DOING_CATEGORIES.find((c) => c.id === task.category)!;

  return (
    <div className="group flex items-center gap-2 py-0.5">
      {/* Done toggle */}
      <button
        type="button"
        onClick={onToggle}
        className="h-3.5 w-3.5 shrink-0 rounded-full border transition-all"
        style={{
          borderColor: task.done ? catConfig.color : `${catConfig.color}40`,
          background: task.done ? catConfig.color : 'transparent',
        }}
      />

      {/* Category dot */}
      <CategoryDot category={task.category} onChange={onCategoryChange} />

      {/* Text */}
      <span
        className="flex-1 text-sm leading-relaxed"
        style={{
          color: task.done ? '#7a543860' : '#7a5438',
          textDecoration: task.done ? 'line-through' : 'none',
          fontFamily: 'var(--font-handwritten)',
        }}
      >
        {task.text}
      </span>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Defer / undefer */}
        <button
          type="button"
          onClick={onDefer}
          className="text-[10px] px-1.5 py-0.5 rounded transition-colors"
          style={{ color: '#C4A06060' }}
          title={tomorrow ? 'Move to today' : 'Park for tomorrow'}
        >
          {tomorrow ? '← today' : '→ tmrw'}
        </button>
        {/* Remove */}
        <button
          type="button"
          onClick={onRemove}
          className="text-[10px] transition-colors hover:text-destructive"
          style={{ color: '#C4A06040' }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
