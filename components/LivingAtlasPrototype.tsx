'use client';

import { useState } from 'react';
import { type AtlasNode, HUMAN_PROGRESS_ATLAS } from '@/lib/atlas';

const SERIF = 'var(--font-serif)';

function rgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function PaperMap({
  activeNode,
  revealedIds,
  onSelect,
}: {
  activeNode: AtlasNode;
  revealedIds: Set<string>;
  onSelect: (node: AtlasNode) => void;
}) {
  const nodes = HUMAN_PROGRESS_ATLAS.nodes;
  const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));

  return (
    <div
      style={{
        position: 'relative',
        minHeight: 430,
        margin: '0 14px',
        overflow: 'hidden',
        border: '1px solid rgba(92,48,24,0.18)',
        background:
          'radial-gradient(circle at 22% 20%, rgba(240,216,152,0.38), transparent 28%), linear-gradient(135deg, #ead8ae 0%, #d7bf8d 100%)',
        boxShadow: 'inset 0 0 42px rgba(92,48,24,0.16)',
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      >
        <defs>
          <pattern id="atlasGrid" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="rgba(38,93,96,0.16)" strokeWidth="0.25" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#atlasGrid)" />
        {nodes.flatMap((node) =>
          node.links.map((link) => {
            const target = byId[link];
            if (!target) return null;
            return (
              <path
                key={`${node.id}-${link}`}
                d={`M ${node.x} ${node.y} C ${(node.x + target.x) / 2} ${node.y - 12}, ${(node.x + target.x) / 2} ${target.y + 12}, ${target.x} ${target.y}`}
                fill="none"
                stroke="rgba(38,93,96,0.34)"
                strokeWidth="0.55"
                strokeDasharray="2 1.5"
              />
            );
          }),
        )}
      </svg>

      {nodes.map((node) => {
        const active = node.id === activeNode.id;
        const revealed = revealedIds.has(node.id);
        return (
          <button
            key={node.id}
            type="button"
            onClick={() => onSelect(node)}
            style={{
              position: 'absolute',
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              width: active ? 86 : 58,
              minHeight: active ? 86 : 58,
              borderRadius: '50%',
              border: `1.5px solid ${rgba(node.color, active ? 0.95 : 0.52)}`,
              background: active ? rgba(node.color, 0.24) : 'rgba(246,230,188,0.78)',
              boxShadow: active ? `0 0 28px ${rgba(node.color, 0.32)}` : 'none',
              color: '#2f2418',
              cursor: 'pointer',
              padding: 8,
              fontFamily: SERIF,
              fontSize: active ? 10.5 : 0,
              lineHeight: 1.15,
              opacity: revealed || active ? 1 : 0.42,
              transition: 'all 0.2s ease',
            }}
          >
            {active ? node.title : ''}
          </button>
        );
      })}
    </div>
  );
}

function NodeCard({ node, stepIndex }: { node: AtlasNode; stepIndex: number }) {
  const visibleSteps = node.steps.slice(0, stepIndex + 1);

  return (
    <div
      style={{
        margin: '14px',
        padding: 16,
        background: 'rgba(252,242,206,0.88)',
        border: `1px solid ${rgba(node.color, 0.32)}`,
        color: '#332516',
      }}
    >
      <div
        style={{
          fontFamily: SERIF,
          fontSize: 11,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: rgba(node.color, 0.92),
          marginBottom: 6,
        }}
      >
        {node.kind}
      </div>
      <h2 style={{ fontFamily: SERIF, fontSize: 25, lineHeight: 1.05, margin: '0 0 10px' }}>
        {node.title}
      </h2>
      <p style={{ fontSize: 14, lineHeight: 1.55, margin: '0 0 14px', color: '#5f462f' }}>
        {node.short}
      </p>

      <div style={{ display: 'grid', gap: 10 }}>
        {visibleSteps.map((step, index) => {
          if (step.type === 'stat') {
            return (
              <div
                key={index}
                style={{
                  borderLeft: `3px solid ${rgba(node.color, 0.82)}`,
                  paddingLeft: 12,
                  background: 'rgba(255,255,255,0.26)',
                }}
              >
                <div style={{ fontFamily: SERIF, fontSize: 31, lineHeight: 1, color: '#2d2418' }}>
                  {step.value}
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: '#5b4530' }}>{step.label}</div>
                <div style={{ fontSize: 10, marginTop: 4, color: '#8a6a4a' }}>{step.source}</div>
              </div>
            );
          }
          return (
            <p
              key={index}
              style={{
                margin: 0,
                fontSize: 14.5,
                lineHeight: 1.65,
                color: step.type === 'action' ? '#4a331e' : '#3c2d1d',
                fontWeight: step.type === 'action' ? 650 : 400,
              }}
            >
              {step.text}
            </p>
          );
        })}
      </div>
    </div>
  );
}

export default function LivingAtlasPrototype() {
  const nodes = HUMAN_PROGRESS_ATLAS.nodes;
  const [mode, setMode] = useState<'guided' | 'map'>('guided');
  const [nodeIndex, setNodeIndex] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [revealed, setRevealed] = useState(() => new Set([nodes[0].id]));
  const activeNode = nodes[nodeIndex];
  const isFinished = nodeIndex === nodes.length - 1 && stepIndex === activeNode.steps.length - 1;
  const progress = `${nodeIndex + 1} / ${nodes.length}`;

  function selectNode(node: AtlasNode) {
    const nextIndex = nodes.findIndex((candidate) => candidate.id === node.id);
    if (nextIndex < 0) return;
    setNodeIndex(nextIndex);
    setStepIndex(0);
    setRevealed((current) => new Set([...current, node.id]));
  }

  function next() {
    if (isFinished) {
      backToEducation();
      return;
    }
    if (stepIndex < activeNode.steps.length - 1) {
      setStepIndex(stepIndex + 1);
      return;
    }
    const nextIndex = Math.min(nodeIndex + 1, nodes.length - 1);
    setNodeIndex(nextIndex);
    setStepIndex(0);
    setRevealed((current) => new Set([...current, nodes[nextIndex].id]));
  }

  function backToEducation() {
    try {
      sessionStorage.setItem('colourmap:open-education', '1');
    } catch {}
    window.location.assign('/day');
  }

  return (
    <main
      style={{
        minHeight: '100svh',
        background: 'linear-gradient(180deg, #f0dfb6 0%, #d4b786 100%)',
        color: '#2f2418',
        padding: '14px 0 32px',
      }}
    >
      <section style={{ padding: '0 16px 14px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <div
            style={{ fontFamily: SERIF, fontSize: 12, letterSpacing: '0.18em', color: '#7b5b36' }}
          >
            Living Atlas
          </div>
          <button
            type="button"
            onClick={backToEducation}
            style={{
              border: '1px solid rgba(92,48,24,0.22)',
              background: 'rgba(255,255,255,0.18)',
              color: '#6b4b2e',
              borderRadius: 999,
              padding: '5px 12px',
              fontFamily: SERIF,
              fontSize: 11,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Education
          </button>
        </div>
        <h1 style={{ fontFamily: SERIF, fontSize: 36, lineHeight: 0.95, margin: '6px 0 10px' }}>
          {HUMAN_PROGRESS_ATLAS.title}
        </h1>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.55, color: '#5b432b' }}>
          {HUMAN_PROGRESS_ATLAS.opening}
        </p>
      </section>

      <div style={{ display: 'flex', gap: 8, padding: '0 14px 12px' }}>
        {(['guided', 'map'] as const).map((choice) => (
          <button
            key={choice}
            type="button"
            onClick={() => setMode(choice)}
            style={{
              flex: 1,
              border: '1px solid rgba(92,48,24,0.22)',
              background: mode === choice ? 'rgba(92,48,24,0.12)' : 'rgba(255,255,255,0.18)',
              color: '#49331f',
              padding: '9px 10px',
              fontFamily: SERIF,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            {choice === 'guided' ? 'Program' : 'Free map'}
          </button>
        ))}
      </div>

      <PaperMap activeNode={activeNode} revealedIds={revealed} onSelect={selectNode} />
      <NodeCard
        node={activeNode}
        stepIndex={mode === 'map' ? activeNode.steps.length - 1 : stepIndex}
      />

      {mode === 'guided' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 14px' }}>
          <div style={{ fontFamily: SERIF, color: '#77583a', fontSize: 12 }}>{progress}</div>
          <button
            type="button"
            onClick={next}
            style={{
              flex: 1,
              border: '1px solid rgba(92,48,24,0.26)',
              background: 'rgba(92,48,24,0.14)',
              color: '#322317',
              padding: 14,
              fontFamily: SERIF,
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            {isFinished ? 'Back to Education menu' : 'Tap to reveal next layer'}
          </button>
        </div>
      )}
    </main>
  );
}
