# Ochre Pill

A centred, transparent pill button used as a collapsible section header.

## Visual
```
background: #C4A06015
border: 1px solid #C4A06040
border-radius: rounded-full
padding: px-5 py-1.5
gap: 8px between label and chevron
```

## Label
```
font: var(--font-serif) or system serif
size: text-sm
weight: font-semibold
transform: uppercase
tracking: tracking-[0.22em]
color: #C4A060
```

## Chevron
```
color: #C4A06080
font-size: text-sm
animation: rotate(180deg) when open, rotate(0deg) when closed
transition: transition-transform duration-200
```

## Layout
```jsx
<div className="flex items-center justify-between">
  <span className="w-12" />   {/* spacer for optical centering */}
  <button
    type="button"
    onClick={toggle}
    className="flex cursor-pointer items-center gap-2 rounded-full px-5 py-1.5 transition-all"
    style={{ background: '#C4A06015', border: '1px solid #C4A06040' }}
  >
    <span className="text-center text-sm font-semibold uppercase tracking-[0.22em]" style={{ color: '#C4A060' }}>
      Label
    </span>
    <span className="text-sm transition-transform duration-200" style={{ color: '#C4A06080', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
      ▾
    </span>
  </button>
  <span className="w-12" />   {/* spacer */}
</div>
```

## Usage
Originally used as the "Emotions" logbook toggle in FeelingCheckInCard.
Reusable for any collapsible ochre-themed section.
