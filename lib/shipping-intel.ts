export type Updatedness = 'EDITORIAL' | 'LIVE' | 'STALE';

export type ChokepointStatus = 'OPEN' | 'OPEN-THROTTLED' | 'DEGRADED' | 'CLOSED';

export type Chokepoint = {
  name: string;
  status: ChokepointStatus;
  note: string;
};

export type ChokepointTile = {
  updatedness: Updatedness;
  updatedAt: string;
  chokepoints: Chokepoint[];
  pageSlug: string;
};

export type WarRiskTile = {
  updatedness: Updatedness;
  updatedAt: string;
  vlccPremiumPercent: number;
  delta7dBps: number;
  delta30dBps: number;
  baselinePremiumPercent: number;
  source: string;
  pageSlug: string;
};

export type FreightRatesTile = {
  updatedness: Updatedness;
  updatedAt: string;
  rates: {
    lane: string;
    usd: number;
    deltaPercent: number;
  }[];
  pageSlug: string;
};

export type IncidentsTile = {
  updatedness: Updatedness;
  updatedAt: string;
  last48h: number;
  recent: { when: string; where: string; what: string }[];
  pageSlug: string;
};

export type CmaCgmWatchTile = {
  updatedness: Updatedness;
  updatedAt: string;
  metrics: { label: string; value: string; note?: string }[];
  pageSlug: string;
};

export type WhatChangedTile = {
  updatedness: Updatedness;
  updatedAt: string;
  bullets: string[];
  pageSlug: string;
};

export type ShippingIntel = {
  asOf: string;
  chokepoints: ChokepointTile;
  warRisk: WarRiskTile;
  freightRates: FreightRatesTile;
  incidents: IncidentsTile;
  cmaCgmWatch: CmaCgmWatchTile;
  whatChanged: WhatChangedTile;
};

export const SHIPPING_INTEL_V1: ShippingIntel = {
  asOf: '2026-06-09',
  chokepoints: {
    updatedness: 'EDITORIAL',
    updatedAt: '2026-06-09',
    pageSlug: 'hormuz-geography',
    chokepoints: [
      {
        name: 'Hormuz',
        status: 'OPEN-THROTTLED',
        note: 'Tankers transiting under elevated war-risk; throughput ~75% of baseline.',
      },
      {
        name: 'Bab el-Mandeb',
        status: 'DEGRADED',
        note: 'Container reroutings via Cape of Good Hope continue.',
      },
      {
        name: 'Suez Canal',
        status: 'DEGRADED',
        note: 'Recovery contingent on Red Sea normalisation.',
      },
      { name: 'Panama Canal', status: 'OPEN', note: 'Drought watch, transits normal.' },
      { name: 'US East Coast', status: 'OPEN', note: 'Post-ILA, no labour stoppage in window.' },
    ],
  },
  warRisk: {
    updatedness: 'EDITORIAL',
    updatedAt: '2026-06-09',
    pageSlug: 'war-risk-repricing',
    vlccPremiumPercent: 1.1,
    delta7dBps: -28,
    delta30dBps: 64,
    baselinePremiumPercent: 0.18,
    source: 'Howden Re / JLT weekly composite',
  },
  freightRates: {
    updatedness: 'EDITORIAL',
    updatedAt: '2026-06-09',
    pageSlug: 'orderbook',
    rates: [
      { lane: 'Shanghai → Rotterdam', usd: 1820, deltaPercent: -6.1 },
      { lane: 'Shanghai → US West Coast', usd: 2140, deltaPercent: 2.0 },
      { lane: 'Shanghai → US East Coast', usd: 3160, deltaPercent: -1.4 },
    ],
  },
  incidents: {
    updatedness: 'EDITORIAL',
    updatedAt: '2026-06-09',
    pageSlug: 'epic-fury',
    last48h: 4,
    recent: [
      {
        when: '2026-06-09',
        where: 'Red Sea',
        what: 'Drone-launched attack on UAE-flagged bulker; cargo-fire reported.',
      },
      {
        when: '2026-06-08',
        where: 'Hormuz',
        what: 'IRGC fast-boat approach on Marshall Islands-flagged tanker; warning shots fired.',
      },
      {
        when: '2026-06-08',
        where: 'Bab el-Mandeb',
        what: 'Anti-ship missile splashed ~2nm from a Liberian tanker.',
      },
      {
        when: '2026-06-07',
        where: 'Hormuz',
        what: 'Tanker boarding attempted near Larak Island; vessel re-routed.',
      },
    ],
  },
  cmaCgmWatch: {
    updatedness: 'EDITORIAL',
    updatedAt: '2026-06-09',
    pageSlug: 'cma-cgm-strategy',
    metrics: [
      {
        label: 'Group fleet capacity',
        value: '4.140 M TEU',
        note: '#3 globally · Alphaliner Jan 2026',
      },
      { label: 'Orderbook / fleet', value: '45.5%', note: 'highest in top 10' },
      { label: '2025 revenue', value: '$54.4 bn', note: '-2% YoY' },
      { label: '2025 EBITDA margin', value: '19.4%', note: 'from 24.2% in 2024' },
      { label: 'CEVA Logistics revenue', value: '$18.3 bn', note: '#4 logistics globally' },
      {
        label: 'MAIA rollout',
        value: '1 June 2026',
        note: '~80,000 employees · Powered by Mistral',
      },
    ],
  },
  whatChanged: {
    updatedness: 'EDITORIAL',
    updatedAt: '2026-06-09',
    pageSlug: 'cma-cgm-exposure',
    bullets: [
      'War-risk premium for Hormuz VLCC transit eased to ~1.1% — well above the pre-war 0.18% baseline.',
      'Red Sea container reroutings continue; Shanghai→Rotterdam softening on capacity returning to the Cape route.',
      'CMA CGM Group launched MAIA agentic AI platform to ~80,000 employees, powered by Mistral.',
    ],
  },
};
