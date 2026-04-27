'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';

import { colours, fontSize, radii, space } from '@/lib/design-tokens';

// Fix Leaflet's default icon path issue with bundlers.
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type SparkCategory = 'fun' | 'creative' | 'professional' | 'growth';

interface NearbySparkProps {
  id: string;
  text: string;
  category: SparkCategory;
  timeWindow: string;
  zoneLabel: string | null;
  lat: number;
  lng: number;
  resonanceCount: number;
  distanceKm: number;
}

const CATEGORY_COLORS: Record<SparkCategory, string> = {
  fun: '#7AAA58',
  creative: '#C4A060',
  professional: '#6890B0',
  growth: '#9B6BA0',
};

const CATEGORY_LABELS: Record<SparkCategory, string> = {
  fun: 'fun',
  creative: 'creative',
  professional: 'work',
  growth: 'growth',
};

function makeSparkDot(color: string, count: number): L.DivIcon {
  const size = Math.min(10 + count * 2, 22);
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width:${size}px;height:${size}px;
        background:${color};
        border-radius:50%;
        border:2px solid white;
        box-shadow:0 1px 4px rgba(0,0,0,0.25);
        opacity:0.9;
      "></div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface SparkMapProps {
  onClose?: () => void;
}

export default function SparkMap({ onClose }: SparkMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  const [sparks, setSparks] = useState<NearbySparkProps[]>([]);
  const [selected, setSelected] = useState<NearbySparkProps | null>(null);
  const [loading, setLoading] = useState(true);
  const [locError, setLocError] = useState('');
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  // Init map once on mount.
  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    const map = L.map(mapRef.current, {
      center: [48.8566, 2.3522], // Paris default — overwritten once geolocation resolves
      zoom: 13,
      zoomControl: false,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    leafletMap.current = map;
    return () => {
      map.remove();
      leafletMap.current = null;
    };
  }, []);

  // Geolocate user then fetch sparks.
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocError('Geolocation not available on this device.');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserPos({ lat, lng });

        if (leafletMap.current) {
          leafletMap.current.setView([lat, lng], 13);
          L.circleMarker([lat, lng], {
            radius: 7,
            color: '#C4A060',
            fillColor: '#C4A060',
            fillOpacity: 0.9,
            weight: 2,
          })
            .bindTooltip('You', { permanent: false })
            .addTo(leafletMap.current);
        }

        fetch(`/api/sparks?lat=${lat}&lng=${lng}&radius=10`)
          .then((r) => (r.ok ? r.json() : []))
          .then((data: NearbySparkProps[]) => {
            setSparks(data);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      },
      () => {
        setLocError('Could not get your location. Please allow location access.');
        setLoading(false);
      },
      { timeout: 10_000, maximumAge: 60_000 },
    );
  }, []);

  // Render markers whenever sparks change.
  useEffect(() => {
    const map = leafletMap.current;
    if (!map) return;

    // Clear old markers.
    for (const m of markersRef.current) m.remove();
    markersRef.current = [];

    for (const d of sparks) {
      const color = CATEGORY_COLORS[d.category] ?? '#C4A060';
      const icon = makeSparkDot(color, d.resonanceCount);
      const marker = L.marker([d.lat, d.lng], { icon })
        .addTo(map)
        .on('click', () => setSelected(d));
      markersRef.current.push(marker);
    }
  }, [sparks]);

  const font = 'var(--font-handwritten)';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        borderRadius: radii.xl,
        overflow: 'hidden',
        background: '#F5EFE6',
      }}
    >
      {/* Map container */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Header overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          padding: `${space.md}px ${space.lg}px`,
          background: 'linear-gradient(to bottom, rgba(245,239,230,0.95) 60%, transparent)',
          display: 'flex',
          alignItems: 'center',
          gap: space.md,
        }}
      >
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: font,
              fontSize: '13px',
              color: '#8A6A4A',
              opacity: 0.6,
              cursor: 'pointer',
            }}
          >
            ‹ back
          </button>
        )}
        <p
          style={{
            fontFamily: font,
            fontSize: '14px',
            fontWeight: 700,
            fontStyle: 'italic',
            color: '#5C3018',
            flex: 1,
            textAlign: 'center',
          }}
        >
          what people want to do nearby
        </p>
      </div>

      {/* Loading state */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 900,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(245,239,230,0.8)',
          }}
        >
          <p
            className="italic"
            style={{ fontFamily: font, fontSize: fontSize.base, color: '#8A6A4A' }}
          >
            finding sparks near you…
          </p>
        </div>
      )}

      {/* Location error */}
      {locError && !loading && (
        <div
          style={{
            position: 'absolute',
            bottom: space.xl,
            left: space.lg,
            right: space.lg,
            zIndex: 1000,
            background: 'rgba(245,239,230,0.97)',
            border: '1px solid #C4A06030',
            borderRadius: radii.lg,
            padding: `${space.md}px ${space.lg}px`,
          }}
        >
          <p
            className="text-center italic"
            style={{ fontFamily: font, fontSize: '13px', color: '#8A6A4A' }}
          >
            {locError}
          </p>
        </div>
      )}

      {/* Category legend */}
      {!loading && userPos && (
        <div
          style={{
            position: 'absolute',
            top: 52,
            right: space.md,
            zIndex: 1000,
            background: 'rgba(245,239,230,0.93)',
            border: '1px solid #C4A06020',
            borderRadius: radii.md,
            padding: `${space.sm}px ${space.md}px`,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}
        >
          {(Object.entries(CATEGORY_COLORS) as [SparkCategory, string][]).map(([cat, color]) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: color,
                  flexShrink: 0,
                }}
              />
              <span style={{ fontFamily: font, fontSize: '10px', color: '#7A5438', opacity: 0.8 }}>
                {CATEGORY_LABELS[cat]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && userPos && sparks.length === 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: space.xl,
            left: space.lg,
            right: space.lg,
            zIndex: 1000,
            background: 'rgba(245,239,230,0.97)',
            border: '1px solid #C4A06030',
            borderRadius: radii.lg,
            padding: `${space.lg}px`,
            textAlign: 'center',
          }}
        >
          <p
            className="italic"
            style={{ fontFamily: font, fontSize: '14px', color: '#8A6A4A', lineHeight: 1.5 }}
          >
            no open sparks near you yet.
            <br />
            post one and put it on the map.
          </p>
        </div>
      )}

      {/* Selected spark card */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            bottom: space.xl,
            left: space.lg,
            right: space.lg,
            zIndex: 1000,
            background: 'rgba(245,239,230,0.98)',
            border: `1px solid ${CATEGORY_COLORS[selected.category]}30`,
            borderRadius: radii.xl,
            padding: `${space.lg}px`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: space.sm }}>
            <span
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: CATEGORY_COLORS[selected.category],
                flexShrink: 0,
                marginTop: 4,
              }}
            />
            <div style={{ flex: 1 }}>
              <p
                style={{
                  fontFamily: font,
                  fontSize: '18px',
                  fontWeight: 700,
                  color: '#5C3018',
                  lineHeight: 1.3,
                }}
              >
                {selected.text}
              </p>
              <p
                style={{
                  fontFamily: font,
                  fontSize: '11px',
                  color: '#8A6A4A',
                  opacity: 0.7,
                  marginTop: 3,
                }}
              >
                {selected.zoneLabel ?? `${selected.distanceKm} km away`}
                {' · '}
                {selected.timeWindow.replace('_', ' ')}
                {selected.resonanceCount > 0 && ` · ${selected.resonanceCount} interested`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                color: '#8A6A4A',
                opacity: 0.4,
                cursor: 'pointer',
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>

          <div style={{ display: 'flex', gap: space.sm, marginTop: space.md }}>
            <button
              type="button"
              onClick={async () => {
                await fetch(`/api/sparks/${selected.id}/resonate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: 'resonate' }),
                });
                setSelected(null);
              }}
              style={{
                flex: 1,
                fontFamily: font,
                fontSize: '13px',
                fontWeight: 600,
                color: CATEGORY_COLORS[selected.category],
                background: `${CATEGORY_COLORS[selected.category]}12`,
                border: `1px solid ${CATEGORY_COLORS[selected.category]}40`,
                borderRadius: radii.pill,
                padding: `${space.sm}px`,
                cursor: 'pointer',
              }}
            >
              I'm interested
            </button>
            <button
              type="button"
              onClick={async () => {
                await fetch(`/api/sparks/${selected.id}/resonate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ type: 'join_request' }),
                });
                setSelected(null);
              }}
              style={{
                flex: 1,
                fontFamily: font,
                fontSize: '13px',
                fontWeight: 600,
                color: '#fff',
                background: CATEGORY_COLORS[selected.category],
                border: 'none',
                borderRadius: radii.pill,
                padding: `${space.sm}px`,
                cursor: 'pointer',
              }}
            >
              I want to join
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
