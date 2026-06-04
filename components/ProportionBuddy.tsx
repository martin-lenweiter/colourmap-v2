'use client';

import { useEffect, useMemo, useState } from 'react';

type OverlayMode = 'lines' | 'x' | 'triangle';

type CustomLandmark = {
  id: string;
  label: string;
  cm: number;
  color: string;
  visible: boolean;
};

type ReferenceImage = {
  id: string;
  name: string;
  image: string | null;
  topCrop: number;
  bottomCrop: number;
  baseOffset: number;
};

type BuddyState = {
  image: string | null;
  activeReferenceId: string;
  suggestionMode: boolean;
  showGrid: boolean;
  showProportions: boolean;
  showLabels: boolean;
  references: ReferenceImage[];
  totalHeight: number;
  topSkull: number;
  browRidge: number;
  eyes: number;
  noseBase: number;
  mouth: number;
  chin: number;
  baseNeck: number;
  highestShoulder: number;
  shoulderJoint: number;
  shirtOpen: number;
  visibleArmpits: number;
  armsCrossTop: number;
  armsCrossBottom: number;
  armsBottom: number;
  elbowCenter: number;
  headBase: number;
  headLow: number;
  headHigh: number;
  topCrop: number;
  bottomCrop: number;
  gridStep: number;
  overlayMode: OverlayMode;
  customLandmarks: CustomLandmark[];
  visible: Record<string, boolean>;
};

const STORAGE_KEY = 'colourmap:proportion-buddy';
const CUSTOM_COLORS = ['#ffd166', '#7bdff2', '#f7aef8', '#b8f2e6', '#f08080', '#c4f07a'];
const DEFAULT_REFERENCES: ReferenceImage[] = [
  {
    id: 'image-1',
    name: 'Image 1',
    image: '/proportion-buddy/proportions-board.png',
    topCrop: 0,
    bottomCrop: 100,
    baseOffset: 0,
  },
  {
    id: 'image-2',
    name: 'Image 2',
    image: '/proportion-buddy/prop-2.png',
    topCrop: 0,
    bottomCrop: 100,
    baseOffset: 3,
  },
  {
    id: 'image-3',
    name: 'Image 3',
    image: '/proportion-buddy/prop-3.png',
    topCrop: 0,
    bottomCrop: 100,
    baseOffset: 2,
  },
];

const DEFAULT_STATE: BuddyState = {
  image: null,
  activeReferenceId: 'image-2',
  suggestionMode: false,
  showGrid: false,
  showProportions: false,
  showLabels: false,
  references: DEFAULT_REFERENCES,
  totalHeight: 84,
  topSkull: 84,
  browRidge: 72,
  eyes: 70,
  noseBase: 66,
  mouth: 63,
  chin: 60,
  baseNeck: 52,
  highestShoulder: 51,
  shoulderJoint: 44.5,
  shirtOpen: 48,
  visibleArmpits: 41,
  armsCrossTop: 34,
  armsCrossBottom: 24,
  armsBottom: 17,
  elbowCenter: 27,
  headBase: 62,
  headLow: 82,
  headHigh: 84,
  topCrop: 0,
  bottomCrop: 100,
  gridStep: 2,
  overlayMode: 'lines',
  customLandmarks: [],
  visible: {
    topSkull: true,
    browRidge: false,
    eyes: false,
    noseBase: false,
    mouth: false,
    chin: true,
    baseNeck: true,
    highestShoulder: false,
    shoulderJoint: true,
    shirtOpen: true,
    visibleArmpits: true,
    armsCrossTop: true,
    armsCrossBottom: true,
    armsBottom: true,
    elbowCenter: true,
    headBase: true,
  },
};

const LANDMARKS = [
  { key: 'topSkull', label: 'top skull', color: '#c7a8ff' },
  { key: 'browRidge', label: 'brow ridge', color: '#f3a6ca' },
  { key: 'eyes', label: 'eyes', color: '#f28a4b' },
  { key: 'noseBase', label: 'nose base', color: '#f4d35e' },
  { key: 'mouth', label: 'mouth', color: '#91d17f' },
  { key: 'chin', label: 'bottom chin', color: '#75c6ed' },
  { key: 'baseNeck', label: 'base neck', color: '#f4e96b' },
  { key: 'highestShoulder', label: 'highest shoulder', color: '#ff8b58' },
  { key: 'shirtOpen', label: 'shirt opening V', color: '#e7a0bd' },
  { key: 'shoulderJoint', label: 'shoulder joint', color: '#b99cff' },
  { key: 'visibleArmpits', label: 'visible armpits', color: '#c2db8a' },
  { key: 'armsCrossTop', label: 'arms crossing top', color: '#f3be73' },
  { key: 'elbowCenter', label: 'elbow center', color: '#8bd17f' },
  { key: 'armsCrossBottom', label: 'arms crossing bottom', color: '#d69a6d' },
  { key: 'armsBottom', label: 'bottom arms', color: '#57b8eb' },
  { key: 'headBase', label: 'head base', color: '#d6c0ff' },
] as const;

type LandmarkKey = (typeof LANDMARKS)[number]['key'];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function loadState(): BuddyState {
  if (typeof window === 'undefined') return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<BuddyState> & { showGuides?: boolean };
    const references =
      parsed.references && parsed.references.length > 0
        ? parsed.references
        : DEFAULT_REFERENCES.map((reference) =>
            reference.id === 'image-1' && parsed.image
              ? { ...reference, image: parsed.image }
              : reference,
          );
    return {
      ...DEFAULT_STATE,
      ...parsed,
      activeReferenceId:
        parsed.activeReferenceId ?? references[0]?.id ?? DEFAULT_STATE.activeReferenceId,
      suggestionMode: parsed.suggestionMode ?? DEFAULT_STATE.suggestionMode,
      showGrid: parsed.showGrid ?? DEFAULT_STATE.showGrid,
      showProportions:
        parsed.showProportions ??
        (parsed.showGuides === undefined ? DEFAULT_STATE.showProportions : parsed.showGuides),
      showLabels: parsed.showLabels ?? DEFAULT_STATE.showLabels,
      references,
      overlayMode: parsed.overlayMode ?? DEFAULT_STATE.overlayMode,
      customLandmarks: parsed.customLandmarks ?? DEFAULT_STATE.customLandmarks,
      visible: { ...DEFAULT_STATE.visible, ...(parsed.visible ?? {}) },
    };
  } catch {
    return DEFAULT_STATE;
  }
}

function guideTopWithBase(cm: number, totalHeight: number, baseOffset: number) {
  const range = 100 + clamp(baseOffset, 0, 14);
  return `${100 + clamp(baseOffset, 0, 14) - (clamp(cm, 0, totalHeight) / totalHeight) * range}%`;
}

function numberInput(
  label: string,
  value: number,
  onChange: (next: number) => void,
  options: { min?: number; max?: number; step?: number } = {},
) {
  return (
    <label style={{ display: 'grid', gap: 5 }}>
      <span
        style={{
          color: 'rgba(82,58,38,0.72)',
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <input
        type="number"
        min={options.min ?? 0}
        max={options.max}
        step={options.step ?? 1}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        style={{
          width: '100%',
          border: '1px solid rgba(116,83,49,0.22)',
          borderRadius: 6,
          background: 'rgba(255,248,231,0.74)',
          color: '#2f2419',
          fontFamily: 'var(--font-serif)',
          fontSize: 15,
          padding: '8px 9px',
        }}
      />
    </label>
  );
}

export default function ProportionBuddy() {
  const [state, setState] = useState<BuddyState>(DEFAULT_STATE);
  const [hydrated, setHydrated] = useState(false);
  const [draftLabel, setDraftLabel] = useState('');
  const [draftCm, setDraftCm] = useState(42);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [hydrated, state]);

  const activeReference =
    state.references.find((reference) => reference.id === state.activeReferenceId) ??
    state.references[0] ??
    DEFAULT_REFERENCES[0];
  const cropTop = clamp(activeReference.topCrop, 0, 96);
  const cropBottom = clamp(activeReference.bottomCrop, cropTop + 4, 100);
  const cropRange = cropBottom - cropTop;
  const baseOffset = clamp(activeReference.baseOffset, 0, 14);
  const gridLines = useMemo(() => {
    const lines: number[] = [];
    const step = Math.max(1, state.gridStep);
    for (let cm = 0; cm <= state.totalHeight; cm += step) lines.push(cm);
    if (!lines.includes(state.totalHeight)) lines.push(state.totalHeight);
    return lines;
  }, [state.gridStep, state.totalHeight]);
  const landmarks = useMemo(
    () =>
      LANDMARKS.map((mark) => ({
        ...mark,
        cm: clamp(Number(state[mark.key]), 0, state.totalHeight),
        visible: state.visible[mark.key] ?? true,
      })),
    [state],
  );
  const customLandmarks = useMemo(
    () =>
      state.customLandmarks.map((mark) => ({
        ...mark,
        cm: clamp(mark.cm, 0, state.totalHeight),
      })),
    [state.customLandmarks, state.totalHeight],
  );
  const proportionCards = useMemo(() => {
    const total = Math.max(1, state.totalHeight);
    const headSize = Math.max(0, state.headHigh - state.headBase);
    const fixedCards = [
      { label: 'head size', value: headSize, basis: total },
      { label: 'chin from base', value: state.chin, basis: total },
      { label: 'shirt opening', value: state.shirtOpen, basis: total },
      { label: 'arm crossing top', value: state.armsCrossTop, basis: total },
      { label: 'arm crossing bottom', value: state.armsCrossBottom, basis: total },
      { label: 'elbow center', value: state.elbowCenter, basis: total },
      { label: 'arms from base', value: state.armsBottom, basis: total },
      {
        label: 'arms to shirt',
        value: Math.max(0, state.shirtOpen - state.armsBottom),
        basis: total,
      },
      {
        label: 'head to shirt',
        value: Math.max(0, state.headBase - state.shirtOpen),
        basis: total,
      },
    ];
    return [
      ...fixedCards,
      ...customLandmarks.map((mark) => ({
        label: mark.label,
        value: mark.cm,
        basis: total,
      })),
    ];
  }, [
    state.armsCrossBottom,
    state.armsCrossTop,
    state.armsBottom,
    state.chin,
    state.elbowCenter,
    state.headBase,
    state.headHigh,
    state.shirtOpen,
    state.totalHeight,
    customLandmarks,
  ]);

  function update(patch: Partial<BuddyState>) {
    setState((current) => ({ ...current, ...patch }));
  }

  function updateActiveReference(patch: Partial<ReferenceImage>) {
    update({
      references: state.references.map((reference) =>
        reference.id === activeReference.id ? { ...reference, ...patch } : reference,
      ),
    });
  }

  function updateLandmark(key: LandmarkKey, value: number) {
    update({ [key]: clamp(value, 0, state.totalHeight) } as Partial<BuddyState>);
  }

  function updateCustomLandmark(id: string, patch: Partial<CustomLandmark>) {
    update({
      customLandmarks: state.customLandmarks.map((mark) =>
        mark.id === id
          ? {
              ...mark,
              ...patch,
              cm: patch.cm === undefined ? mark.cm : clamp(patch.cm, 0, state.totalHeight),
            }
          : mark,
      ),
    });
  }

  function addCustomLandmark() {
    const label = draftLabel.trim();
    if (!label) return;
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `landmark-${Date.now()}`;
    update({
      customLandmarks: [
        ...state.customLandmarks,
        {
          id,
          label,
          cm: clamp(draftCm, 0, state.totalHeight),
          color: CUSTOM_COLORS[state.customLandmarks.length % CUSTOM_COLORS.length],
          visible: true,
        },
      ],
    });
    setDraftLabel('');
  }

  function removeCustomLandmark(id: string) {
    update({ customLandmarks: state.customLandmarks.filter((mark) => mark.id !== id) });
  }

  function loadImage(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') updateActiveReference({ image: reader.result });
    };
    reader.readAsDataURL(file);
  }

  return (
    <main
      style={{
        minHeight: 'calc(100svh - 120px)',
        background:
          'linear-gradient(180deg, rgba(236,220,188,0.72), rgba(206,184,145,0.34)), radial-gradient(circle at 20% 12%, rgba(122,84,56,0.10), transparent 34%)',
        border: '1px solid rgba(116,83,49,0.14)',
        padding: 'clamp(12px, 3vw, 26px)',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 980px)',
          gap: 18,
          alignItems: 'start',
          justifyContent: 'center',
        }}
        className="proportion-buddy-shell"
      >
        <section style={{ minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-start',
              gap: 12,
              alignItems: 'end',
              marginBottom: 12,
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  color: 'rgba(82,58,38,0.58)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                }}
              >
                sculpture reference
              </p>
              <h1
                style={{
                  margin: '2px 0 0',
                  color: '#332416',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 'clamp(28px, 5vw, 48px)',
                  letterSpacing: '0.02em',
                }}
              >
                Proportion Buddy
              </h1>
            </div>
          </div>

          <div
            data-testid="proportion-stage"
            style={{
              position: 'relative',
              overflow: 'hidden',
              minHeight: 520,
              background:
                'linear-gradient(180deg, rgba(47,36,25,0.96), rgba(26,20,15,0.96)), repeating-linear-gradient(0deg, transparent 0 18px, rgba(255,255,255,0.03) 18px 19px)',
              border: '1px solid rgba(68,47,30,0.32)',
              boxShadow: '0 18px 60px rgba(48,31,16,0.24)',
            }}
          >
            {activeReference.image ? (
              <img
                src={activeReference.image}
                alt={`${activeReference.name} sculpture reference`}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: `${-(cropTop / cropRange) * 100}%`,
                  width: '100%',
                  height: `${(100 / cropRange) * 100}%`,
                  objectFit: 'contain',
                  objectPosition: 'center top',
                  transform: 'translateX(-50%)',
                  filter: 'contrast(1.02) saturate(0.82)',
                }}
              />
            ) : (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'grid',
                  placeItems: 'center',
                  padding: 24,
                  textAlign: 'center',
                  color: 'rgba(245,226,190,0.72)',
                  fontFamily: 'var(--font-serif)',
                }}
              >
                <div>
                  <div style={{ fontSize: 42, marginBottom: 8 }}>+</div>
                  <div style={{ fontSize: 18 }}>Upload {activeReference.name}</div>
                  <div style={{ fontSize: 12, marginTop: 7, opacity: 0.72 }}>
                    The 17cm arms line and 80-84cm head zone are ready.
                  </div>
                </div>
              </div>
            )}

            {state.showGrid && (
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'linear-gradient(90deg, transparent 33.25%, rgba(244,216,160,0.16) 33.3%, transparent 33.45%, transparent 49.85%, rgba(255,248,231,0.22) 50%, transparent 50.15%, transparent 66.55%, rgba(244,216,160,0.16) 66.7%, transparent 66.85%)',
                  pointerEvents: 'none',
                }}
              />
            )}
            {state.showGrid &&
              gridLines.map((cm) => {
                const major = cm % 10 === 0 || cm === state.totalHeight;
                return (
                  <div
                    key={cm}
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: guideTopWithBase(cm, state.totalHeight, baseOffset),
                      borderTop: `1px solid rgba(255,238,198,${major ? 0.28 : 0.1})`,
                      pointerEvents: 'none',
                    }}
                  >
                    {major && state.showLabels && (
                      <span
                        style={{
                          position: 'absolute',
                          left: 8,
                          top: -10,
                          color: 'rgba(255,238,198,0.76)',
                          fontFamily: 'var(--font-serif)',
                          fontSize: 11,
                          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
                        }}
                      >
                        {cm}cm
                      </span>
                    )}
                  </div>
                );
              })}

            {state.showProportions &&
              landmarks
                .filter((mark) => mark.visible)
                .map((mark) => (
                  <GuideLine
                    key={mark.key}
                    cm={mark.cm}
                    total={state.totalHeight}
                    baseOffset={baseOffset}
                    showLabel={state.showLabels}
                    label={`${mark.label} ${mark.cm % 1 ? mark.cm.toFixed(1) : Math.round(mark.cm)}cm`}
                    color={mark.color}
                  />
                ))}
            {state.showProportions &&
              customLandmarks
                .filter((mark) => mark.visible)
                .map((mark) => (
                  <GuideLine
                    key={mark.id}
                    cm={mark.cm}
                    total={state.totalHeight}
                    baseOffset={baseOffset}
                    showLabel={state.showLabels}
                    label={`${mark.label} ${mark.cm % 1 ? mark.cm.toFixed(1) : Math.round(mark.cm)}cm`}
                    color={mark.color}
                  />
                ))}
            {state.showProportions && <ShapeGuides mode={state.overlayMode} />}
            {state.showProportions && (
              <div
                role="img"
                aria-label="Head guide band"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: guideTopWithBase(state.headHigh, state.totalHeight, baseOffset),
                  height: `calc(${guideTopWithBase(
                    state.headLow,
                    state.totalHeight,
                    baseOffset,
                  )} - ${guideTopWithBase(state.headHigh, state.totalHeight, baseOffset)})`,
                  background: 'rgba(244,199,104,0.1)',
                  borderTop: '1px solid rgba(244,199,104,0.72)',
                  borderBottom: '1px solid rgba(244,199,104,0.62)',
                  pointerEvents: 'none',
                }}
              >
                {state.showLabels && (
                  <span
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 4,
                      color: '#ffe6aa',
                      fontFamily: 'var(--font-serif)',
                      fontSize: 12,
                      fontWeight: 800,
                      textShadow: '0 1px 2px rgba(0,0,0,0.75)',
                    }}
                  >
                    head {state.headLow}-{state.headHigh}cm
                  </span>
                )}
              </div>
            )}
          </div>
          <section
            aria-label="Image controls"
            style={{
              border: '1px solid rgba(116,83,49,0.16)',
              background: 'rgba(255,248,231,0.62)',
              marginTop: 10,
              padding: 10,
              display: 'grid',
              gap: 10,
            }}
          >
            <fieldset
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 8,
                border: 0,
                padding: 0,
              }}
            >
              <legend className="sr-only">Reference images</legend>
              {state.references.map((reference) => (
                <button
                  key={reference.id}
                  type="button"
                  onClick={() => update({ activeReferenceId: reference.id })}
                  style={{
                    ...flatButtonStyle,
                    background:
                      reference.id === activeReference.id
                        ? 'rgba(92,48,24,0.15)'
                        : 'rgba(255,248,231,0.58)',
                  }}
                >
                  {reference.name}
                </button>
              ))}
            </fieldset>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
                gap: 8,
              }}
              className="proportion-buddy-action-row"
            >
              <button
                type="button"
                aria-pressed={state.showGrid}
                onClick={() => update({ showGrid: !state.showGrid })}
                style={{
                  ...flatButtonStyle,
                  background: state.showGrid ? 'rgba(92,48,24,0.15)' : 'rgba(255,248,231,0.58)',
                }}
              >
                Grid
              </button>
              <button
                type="button"
                aria-pressed={state.showProportions}
                onClick={() => update({ showProportions: !state.showProportions })}
                style={{
                  ...flatButtonStyle,
                  background: state.showProportions
                    ? 'rgba(92,48,24,0.15)'
                    : 'rgba(255,248,231,0.58)',
                }}
              >
                Proportions
              </button>
              <button
                type="button"
                aria-pressed={state.showLabels}
                onClick={() => update({ showLabels: !state.showLabels })}
                style={{
                  ...flatButtonStyle,
                  background: state.showLabels ? 'rgba(92,48,24,0.15)' : 'rgba(255,248,231,0.58)',
                }}
              >
                Labels
              </button>
              <button
                type="button"
                aria-pressed={state.suggestionMode}
                onClick={() => update({ suggestionMode: !state.suggestionMode })}
                style={{
                  ...flatButtonStyle,
                  background: state.suggestionMode
                    ? 'rgba(92,48,24,0.15)'
                    : 'rgba(255,248,231,0.58)',
                }}
              >
                AI
              </button>
              <label style={flatButtonStyle}>
                Upload
                <input
                  aria-label={`Upload reference image for ${activeReference.name}`}
                  type="file"
                  accept="image/*"
                  onChange={(event) => loadImage(event.currentTarget.files?.[0])}
                  style={{ display: 'none' }}
                />
              </label>
              <button
                type="button"
                onClick={() => updateActiveReference({ image: null })}
                style={flatButtonStyle}
              >
                Clear
              </button>
            </div>
          </section>
          {state.suggestionMode && (
            <AiSuggestions
              activeId={activeReference.id}
              activeName={activeReference.name}
              totalHeight={state.totalHeight}
              armsBottom={state.armsBottom}
              headLow={state.headLow}
              headHigh={state.headHigh}
              baseOffset={baseOffset}
            />
          )}
        </section>

        <aside
          style={{
            border: '1px solid rgba(116,83,49,0.18)',
            background: 'rgba(248,238,215,0.74)',
            padding: 14,
            display: 'grid',
            gap: 14,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: '#332416',
                fontFamily: 'var(--font-serif)',
                fontSize: 18,
              }}
            >
              Measurements
            </h2>
            <p
              style={{
                margin: '4px 0 0',
                color: 'rgba(82,58,38,0.68)',
                fontFamily: 'var(--font-serif)',
                fontSize: 13,
                lineHeight: 1.45,
              }}
            >
              Set the sculpture height and landmarks. Lines are measured upward from the base.
            </p>
          </div>

          <section
            aria-label="Guide shape mode"
            style={{
              border: '1px solid rgba(116,83,49,0.16)',
              background: 'rgba(255,248,231,0.42)',
              padding: 10,
              display: 'grid',
              gap: 8,
            }}
          >
            <div
              style={{
                color: '#332416',
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              Visual guide
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[
                { mode: 'lines' as const, label: 'Lines' },
                { mode: 'x' as const, label: 'X' },
                { mode: 'triangle' as const, label: 'Triangle' },
              ].map((option) => (
                <button
                  key={option.mode}
                  type="button"
                  aria-label={`${option.label} guides`}
                  onClick={() => update({ overlayMode: option.mode })}
                  style={{
                    ...buttonStyle,
                    borderRadius: 6,
                    background:
                      state.overlayMode === option.mode
                        ? 'rgba(92,48,24,0.14)'
                        : 'rgba(255,248,231,0.58)',
                    padding: '7px 8px',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </section>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {numberInput('total cm', state.totalHeight, (totalHeight) =>
              update({ totalHeight: clamp(totalHeight, 20, 300) }),
            )}
            {numberInput('grid cm', state.gridStep, (gridStep) =>
              update({ gridStep: clamp(gridStep, 1, 20) }),
            )}
            {numberInput('head low', state.headLow, (headLow) =>
              update({ headLow: clamp(headLow, 0, state.totalHeight) }),
            )}
            {numberInput('head high', state.headHigh, (headHigh) =>
              update({ headHigh: clamp(headHigh, 0, state.totalHeight) }),
            )}
          </div>

          <ControlSlider
            label="base lower"
            value={activeReference.baseOffset}
            min={0}
            max={14}
            suffix="%"
            onChange={(baseOffset) =>
              updateActiveReference({ baseOffset: clamp(baseOffset, 0, 14) })
            }
          />

          <section
            aria-label="Reference point switches"
            style={{
              border: '1px solid rgba(116,83,49,0.16)',
              background: 'rgba(255,248,231,0.42)',
              padding: 10,
              display: 'grid',
              gap: 7,
            }}
          >
            <div
              style={{
                color: '#332416',
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              Reference points
            </div>
            {landmarks.map((mark) => (
              <label
                key={mark.key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '18px 10px minmax(0, 1fr) 66px',
                  gap: 7,
                  alignItems: 'center',
                  borderTop: '1px solid rgba(116,83,49,0.10)',
                  paddingTop: 6,
                  color: 'rgba(82,58,38,0.78)',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 12,
                }}
              >
                <input
                  type="checkbox"
                  aria-label={`Show ${mark.label}`}
                  checked={mark.visible}
                  onChange={(event) =>
                    update({
                      visible: { ...state.visible, [mark.key]: event.currentTarget.checked },
                    })
                  }
                />
                <span
                  aria-hidden="true"
                  style={{ width: 9, height: 9, borderRadius: 99, background: mark.color }}
                />
                <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {mark.label}
                </span>
                <input
                  type="number"
                  aria-label={`${mark.label} centimeters`}
                  step={0.5}
                  min={0}
                  max={state.totalHeight}
                  value={mark.cm}
                  onChange={(event) => updateLandmark(mark.key, Number(event.currentTarget.value))}
                  style={{
                    width: '100%',
                    border: '1px solid rgba(116,83,49,0.18)',
                    borderRadius: 5,
                    background: 'rgba(255,248,231,0.7)',
                    color: '#2f2419',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 12,
                    padding: '5px 6px',
                  }}
                />
              </label>
            ))}
          </section>

          <section
            aria-label="Custom landmarks"
            style={{
              border: '1px solid rgba(116,83,49,0.16)',
              background: 'rgba(255,248,231,0.42)',
              padding: 10,
              display: 'grid',
              gap: 8,
            }}
          >
            <div
              style={{
                color: '#332416',
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              Your landmarks
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 74px', gap: 7 }}>
              <label style={{ display: 'grid', gap: 4 }}>
                <span className="sr-only">New landmark name</span>
                <input
                  aria-label="New landmark name"
                  value={draftLabel}
                  onChange={(event) => setDraftLabel(event.currentTarget.value)}
                  placeholder="shirt split, left elbow..."
                  style={smallInputStyle}
                />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span className="sr-only">New landmark centimeters</span>
                <input
                  aria-label="New landmark centimeters"
                  type="number"
                  step={0.5}
                  min={0}
                  max={state.totalHeight}
                  value={draftCm}
                  onChange={(event) =>
                    setDraftCm(clamp(Number(event.currentTarget.value), 0, state.totalHeight))
                  }
                  style={smallInputStyle}
                />
              </label>
            </div>
            <button
              type="button"
              onClick={addCustomLandmark}
              disabled={!draftLabel.trim()}
              style={{
                ...buttonStyle,
                borderRadius: 6,
                opacity: draftLabel.trim() ? 1 : 0.46,
              }}
            >
              Add landmark
            </button>
            {customLandmarks.map((mark) => (
              <div
                key={mark.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '18px 10px minmax(0, 1fr) 66px 28px',
                  gap: 7,
                  alignItems: 'center',
                  borderTop: '1px solid rgba(116,83,49,0.10)',
                  paddingTop: 6,
                }}
              >
                <input
                  type="checkbox"
                  aria-label={`Show ${mark.label}`}
                  checked={mark.visible}
                  onChange={(event) =>
                    updateCustomLandmark(mark.id, { visible: event.currentTarget.checked })
                  }
                />
                <span
                  aria-hidden="true"
                  style={{ width: 9, height: 9, borderRadius: 99, background: mark.color }}
                />
                <input
                  aria-label={`${mark.label} name`}
                  value={mark.label}
                  onChange={(event) =>
                    updateCustomLandmark(mark.id, { label: event.currentTarget.value })
                  }
                  style={smallInputStyle}
                />
                <input
                  type="number"
                  aria-label={`${mark.label} centimeters`}
                  step={0.5}
                  min={0}
                  max={state.totalHeight}
                  value={mark.cm}
                  onChange={(event) =>
                    updateCustomLandmark(mark.id, { cm: Number(event.currentTarget.value) })
                  }
                  style={smallInputStyle}
                />
                <button
                  type="button"
                  aria-label={`Remove ${mark.label}`}
                  onClick={() => removeCustomLandmark(mark.id)}
                  style={{
                    border: '1px solid rgba(116,83,49,0.18)',
                    borderRadius: 5,
                    background: 'rgba(255,248,231,0.58)',
                    color: '#5C3018',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 15,
                    lineHeight: 1,
                    padding: '5px 0',
                  }}
                >
                  x
                </button>
              </div>
            ))}
          </section>

          <ControlSlider
            label="top crop"
            value={activeReference.topCrop}
            min={0}
            max={95}
            onChange={(topCrop) =>
              updateActiveReference({
                topCrop: clamp(topCrop, 0, activeReference.bottomCrop - 4),
              })
            }
          />

          <section
            aria-label="Reusable proportion ratios"
            style={{
              border: '1px solid rgba(116,83,49,0.16)',
              background: 'rgba(255,248,231,0.48)',
              padding: 10,
              display: 'grid',
              gap: 8,
            }}
          >
            <div
              style={{
                color: '#332416',
                fontFamily: 'var(--font-serif)',
                fontSize: 14,
                fontWeight: 800,
              }}
            >
              Reusable proportions
            </div>
            {proportionCards.map((card) => {
              const percent = (card.value / card.basis) * 100;
              const ratio = card.value > 0 ? card.basis / card.value : 0;
              return (
                <div
                  key={card.label}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 8,
                    alignItems: 'baseline',
                    borderTop: '1px solid rgba(116,83,49,0.12)',
                    paddingTop: 7,
                  }}
                >
                  <span
                    style={{
                      color: 'rgba(82,58,38,0.76)',
                      fontFamily: 'var(--font-serif)',
                      fontSize: 12,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {card.label}
                  </span>
                  <span
                    style={{
                      color: '#332416',
                      fontFamily: 'var(--font-serif)',
                      fontSize: 13,
                      fontWeight: 800,
                    }}
                  >
                    {card.value.toFixed(1)}cm - {percent.toFixed(1)}% - 1:{ratio.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </section>
          <ControlSlider
            label="bottom crop"
            value={activeReference.bottomCrop}
            min={5}
            max={100}
            onChange={(bottomCrop) =>
              updateActiveReference({
                bottomCrop: clamp(bottomCrop, activeReference.topCrop + 4, 100),
              })
            }
          />

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="button" onClick={() => setState(DEFAULT_STATE)} style={buttonStyle}>
              Reset
            </button>
            <button
              type="button"
              onClick={() => updateActiveReference({ image: null })}
              style={buttonStyle}
            >
              Clear image
            </button>
          </div>
        </aside>
      </div>

      <style jsx>{`
        @media (max-width: 820px) {
          .proportion-buddy-shell {
            grid-template-columns: 1fr !important;
          }
          .proportion-buddy-action-row {
            grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          }
        }
      `}</style>
    </main>
  );
}

function GuideLine({
  cm,
  total,
  baseOffset,
  showLabel,
  label,
  color,
}: {
  cm: number;
  total: number;
  baseOffset: number;
  showLabel: boolean;
  label: string;
  color: string;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: guideTopWithBase(cm, total, baseOffset),
        borderTop: `2px solid ${color}`,
        boxShadow: `0 0 18px ${color}55`,
        pointerEvents: 'none',
      }}
    >
      {showLabel && (
        <span
          style={{
            position: 'absolute',
            right: 10,
            top: -22,
            background: 'rgba(23,17,12,0.82)',
            border: `1px solid ${color}99`,
            borderRadius: 999,
            color,
            fontFamily: 'var(--font-serif)',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.05em',
            padding: '3px 8px',
            textTransform: 'uppercase',
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}

function AiSuggestions({
  activeId,
  activeName,
  totalHeight,
  armsBottom,
  headLow,
  headHigh,
  baseOffset,
}: {
  activeId: string;
  activeName: string;
  totalHeight: number;
  armsBottom: number;
  headLow: number;
  headHigh: number;
  baseOffset: number;
}) {
  const armsPercent = (armsBottom / totalHeight) * 100;
  const headZone = `${headLow}-${headHigh}cm`;
  const imageSuggestions =
    activeId === 'image-1'
      ? [
          'Use this as the adjustable working reference. Once you upload or crop it, compare it against Image 2/3 instead of treating it as isolated truth.',
          'If Image 1 is cropped tighter, do not force the visible base to be the real base. Lower the imagined base until the arms and head zone feel consistent.',
        ]
      : [
          'This photo family is good for the overall bust envelope: shoulder mass, crossed-arm block, shirt opening, and skull height.',
          'Image 2 and Image 3 are close enough to reuse the same proportion intelligence. Use them to confirm whether a landmark is stable or just photo perspective.',
        ];
  return (
    <section
      aria-label="AI proportion suggestions"
      style={{
        border: '1px solid rgba(116,83,49,0.2)',
        background: 'rgba(255,248,231,0.72)',
        marginTop: 10,
        padding: 12,
        display: 'grid',
        gap: 8,
      }}
    >
      <div
        style={{
          color: '#332416',
          fontFamily: 'var(--font-serif)',
          fontSize: 15,
          fontWeight: 900,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
        }}
      >
        AI suggestions - {activeName}
      </div>
      {[
        ...imageSuggestions,
        `Keep bottom of arms locked near ${armsBottom}cm (${armsPercent.toFixed(
          1,
        )}% of total height). Across the three photos this is the strongest stabilising anchor.`,
        `Treat the head as a flexible top zone, not one line: ${headZone}. The skull can read taller depending on crop and hair texture.`,
        `Use chin, shirt opening V, visible armpits, arm-crossing top, and arm-crossing bottom as the main sequence. These are easier to sculpt against than facial details too early.`,
        baseOffset > 0
          ? `This image has the base imagined ${baseOffset}% lower, so the grid is allowed to start slightly below the visible plinth.`
          : 'If the plinth/photo crop feels too high, raise the base-lower control a little so the 17cm and head lines stay believable.',
      ].map((suggestion) => (
        <p
          key={suggestion}
          style={{
            margin: 0,
            color: 'rgba(54,38,25,0.82)',
            fontFamily: 'var(--font-serif)',
            fontSize: 13,
            lineHeight: 1.45,
          }}
        >
          {suggestion}
        </p>
      ))}
    </section>
  );
}

function ShapeGuides({ mode }: { mode: OverlayMode }) {
  if (mode === 'lines') return null;

  return (
    <svg
      aria-label={mode === 'x' ? 'X proportion guides' : 'Triangle proportion guides'}
      role="img"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {mode === 'x' ? (
        <>
          <line
            x1="8"
            y1="8"
            x2="92"
            y2="92"
            stroke="rgba(255,240,204,0.72)"
            strokeDasharray="1.8 1.6"
            strokeWidth="0.45"
          />
          <line
            x1="92"
            y1="8"
            x2="8"
            y2="92"
            stroke="rgba(255,240,204,0.72)"
            strokeDasharray="1.8 1.6"
            strokeWidth="0.45"
          />
        </>
      ) : (
        <>
          <path
            d="M50 7 L10 94 L90 94 Z"
            fill="rgba(244,216,160,0.05)"
            stroke="rgba(255,240,204,0.78)"
            strokeDasharray="1.8 1.6"
            strokeWidth="0.45"
          />
          <line
            x1="50"
            y1="7"
            x2="50"
            y2="94"
            stroke="rgba(255,240,204,0.62)"
            strokeDasharray="1.2 1.4"
            strokeWidth="0.35"
          />
          <line
            x1="10"
            y1="94"
            x2="90"
            y2="94"
            stroke="rgba(244,199,104,0.76)"
            strokeWidth="0.55"
          />
        </>
      )}
    </svg>
  );
}

function ControlSlider({
  label,
  value,
  min,
  max,
  suffix = '%',
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  onChange: (next: number) => void;
}) {
  return (
    <label style={{ display: 'grid', gap: 5 }}>
      <span
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          color: 'rgba(82,58,38,0.72)',
          fontFamily: 'var(--font-serif)',
          fontSize: 11,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}
      >
        <span>{label}</span>
        <span>
          {Math.round(value)}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.currentTarget.value))}
        style={{ width: '100%', accentColor: '#8b5e2f' }}
      />
    </label>
  );
}

const buttonStyle = {
  border: '1px solid rgba(116,83,49,0.28)',
  borderRadius: 999,
  background: 'rgba(255,248,231,0.72)',
  color: '#4f321d',
  cursor: 'pointer',
  fontFamily: 'var(--font-serif)',
  fontSize: 12,
  fontWeight: 800,
  letterSpacing: '0.08em',
  padding: '8px 12px',
  textTransform: 'uppercase' as const,
};

const flatButtonStyle = {
  border: '1px solid rgba(92,48,24,0.15)',
  borderRadius: 8,
  background: 'rgba(255,248,231,0.58)',
  color: '#4f321d',
  cursor: 'pointer',
  fontFamily: 'var(--font-serif)',
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: '0.08em',
  padding: '8px 6px',
  textAlign: 'center' as const,
  textTransform: 'uppercase' as const,
};

const smallInputStyle = {
  width: '100%',
  border: '1px solid rgba(116,83,49,0.18)',
  borderRadius: 5,
  background: 'rgba(255,248,231,0.7)',
  color: '#2f2419',
  fontFamily: 'var(--font-serif)',
  fontSize: 12,
  padding: '5px 6px',
};
