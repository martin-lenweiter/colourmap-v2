export type Confidence = 'HIGH' | 'MED' | 'LOW';

export type SourceQuality = 'primary' | 'secondary' | 'blog';

export type Source = {
  ref: number;
  title: string;
  url: string;
  date: string;
  quality?: SourceQuality;
};

export type ChangelogEntry = {
  at: string;
  note: string;
};

export type Timeframe = 'now' | 'this-decade' | 'long-arc';

export type Page = {
  slug: string;
  title: string;
  bluf: string;
  body: string;
  confidence: Confidence;
  lastVerified: string;
  dependsOn: string[];
  feedsInto: string[];
  related: string[];
  entities: string[];
  tags?: string[];
  timeframe?: Timeframe;
  sources: Source[];
  changelog?: ChangelogEntry[];
};

export const ALL_TAGS = [
  'chokepoint',
  'tankers',
  'containers',
  'iran-axis',
  'cma-cgm',
  'war-risk',
  'decarbonisation',
  'ai',
  'media',
  'france',
  'energy-transition',
  'climate',
  'alliances',
  'trumpism',
  'biodiversity',
] as const;

export type Tag = (typeof ALL_TAGS)[number];

export function pagesByTag(
  tag: string,
): { categorySlug: string; programSlug: string; chapterSlug: string; page: Page }[] {
  const out: { categorySlug: string; programSlug: string; chapterSlug: string; page: Page }[] = [];
  for (const category of GEOPOLITICS_CATEGORIES) {
    for (const program of category.programs) {
      for (const chapter of program.chapters) {
        for (const page of chapter.pages) {
          if (page.tags?.includes(tag)) {
            out.push({
              categorySlug: category.slug,
              programSlug: program.slug,
              chapterSlug: chapter.slug,
              page,
            });
          }
        }
      }
    }
  }
  return out;
}

export function allUsedTags(): string[] {
  const set = new Set<string>();
  for (const category of GEOPOLITICS_CATEGORIES) {
    for (const program of category.programs) {
      for (const chapter of program.chapters) {
        for (const page of chapter.pages) {
          for (const tag of page.tags ?? []) set.add(tag);
        }
      }
    }
  }
  return Array.from(set).sort();
}

export const CONFIDENCE_DEFINITION: Record<Confidence, string> = {
  HIGH: 'Multiple independent primary sources corroborate this claim. Adversarial verification ≥2/3.',
  MED: 'One primary or several secondary sources. Treat as directional, not final.',
  LOW: 'A single source or contested attribution. Read with explicit doubt.',
};

export function daysSince(iso: string, now: Date = new Date()): number {
  const then = new Date(`${iso}T00:00:00Z`).getTime();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.max(0, Math.floor((today - then) / (1000 * 60 * 60 * 24)));
}

export type Chapter = {
  slug: string;
  title: string;
  number: number;
  pages: Page[];
};

export type Program = {
  slug: string;
  title: string;
  blurb: string;
  durationMinutes: number;
  chapters: Chapter[];
};

export type Tier = 'now' | 'decade' | 'horizon';

export type Category = {
  slug: string;
  title: string;
  blurb: string;
  tier: Tier;
  programs: Program[];
};

export const TIER_DEFINITION: Record<Tier, { title: string; oneLiner: string }> = {
  now: {
    title: 'Now',
    oneLiner: 'The breaking world. Last 30 days, live status, evolving threads.',
  },
  decade: {
    title: 'Decade',
    oneLiner: 'The world we are in. 2024-2034. Structural forces, named players, current dynamics.',
  },
  horizon: {
    title: 'Horizon',
    oneLiner:
      'The world we are walking into. 2030-2050. Long-arc forecasts, turning points, calibrated bets.',
  },
};

export const TIER_ORDER: Tier[] = ['now', 'decade', 'horizon'];

const SOURCE_EIA: Source = {
  ref: 1,
  title: 'EIA — Strait of Hormuz fact sheet',
  url: 'https://www.eia.gov/international/analysis/special-topics/World_Oil_Transit_Chokepoints',
  date: '2025-12',
  quality: 'primary',
};
const SOURCE_HOWDEN: Source = {
  ref: 2,
  title: 'Howden Re — Strait of Hormuz report, March 2026',
  url: 'https://www.howdenre.com/sites/howdenre.howdenprod.com/files/2026-03/HowdenRe_Strait_of_Hormuz_report_March272026.pdf',
  date: '2026-03',
  quality: 'primary',
};
const SOURCE_BELFER: Source = {
  ref: 3,
  title: "Belfer Center — Degradation of Iran's proxy model",
  url: 'https://www.belfercenter.org/research-analysis/degradation-irans-proxy-model',
  date: '2026',
  quality: 'primary',
};
const SOURCE_CSIS_RU_IR: Source = {
  ref: 4,
  title: 'CSIS — Understanding the growing collaboration between Russia and Iran',
  url: 'https://www.csis.org/analysis/understanding-growing-collaboration-between-russia-and-iran',
  date: '2025',
  quality: 'primary',
};
const SOURCE_ALPHALINER: Source = {
  ref: 5,
  title: 'Alphaliner Top 100, January 2026',
  url: 'https://alphaliner.axsmarine.com/PublicTop100/',
  date: '2026-01',
  quality: 'primary',
};
const SOURCE_CMACGM_2024: Source = {
  ref: 6,
  title: 'CMA CGM Annual Financial Results 2024',
  url: 'https://api.cmacgm-group.com/en/news-media/2024-annual-financial-results',
  date: '2025-03',
  quality: 'primary',
};
const SOURCE_CMACGM_2025: Source = {
  ref: 7,
  title: 'CMA CGM Annual Financial Results 2025',
  url: 'https://www.cmacgm-group.com/en/news-media/annual-financial-results-2025',
  date: '2026-03',
  quality: 'primary',
};
const SOURCE_CSIS_INSTC: Source = {
  ref: 8,
  title: 'CSIS — Resilience through linkage: Russia, Iran and the INSTC',
  url: 'https://www.csis.org/analysis/resilience-through-linkage-russia-iran-and-aspirations-north-south-trade',
  date: '2025',
  quality: 'primary',
};
const SOURCE_IEA: Source = {
  ref: 9,
  title: 'IEA emergency oil stocks releases — record 400M-bbl drawdown',
  url: 'https://www.iea.org/',
  date: '2026-03',
  quality: 'primary',
};
const SOURCE_KYUTAI: Source = {
  ref: 10,
  title: "CMA CGM — launch of Kyutai, Europe's first independent AI open-science lab",
  url: 'https://www.cmacgm-group.com/en/news-media/launch-kyutai-europes-first-independent-research-lab-dedicated-ai-open-science',
  date: '2023-11',
  quality: 'primary',
};
const SOURCE_MISTRAL: Source = {
  ref: 11,
  title: 'CMA CGM × Mistral AI — five-year custom AI partnership',
  url: 'https://www.cmacgm-group.com/en/news-media/cma-cgm-group-adopts-custom-designed-ai-solutions-mistral-ai',
  date: '2025-04',
  quality: 'primary',
};
const SOURCE_GCP_2024: Source = {
  ref: 20,
  title: 'Global Carbon Project — Global Carbon Budget 2024',
  url: 'https://globalcarbonbudget.org/',
  date: '2024-11',
  quality: 'primary',
};
const SOURCE_C3S: Source = {
  ref: 21,
  title: 'Copernicus C3S — 2024 first year over 1.5°C',
  url: 'https://climate.copernicus.eu/',
  date: '2025-01',
  quality: 'primary',
};
const SOURCE_DITLEVSEN: Source = {
  ref: 22,
  title: 'Ditlevsen & Ditlevsen — Warning of forthcoming AMOC collapse, Nature Communications',
  url: 'https://www.nature.com/articles/s41467-023-39810-w',
  date: '2023-07',
  quality: 'primary',
};
const SOURCE_IPCC_AR6: Source = {
  ref: 23,
  title: 'IPCC AR6 WG1 — Sixth Assessment Report, Physical Science Basis',
  url: 'https://www.ipcc.ch/report/ar6/wg1/',
  date: '2021-08',
  quality: 'primary',
};
const SOURCE_UN_WPP: Source = {
  ref: 24,
  title: 'UN DESA — World Population Prospects 2024',
  url: 'https://population.un.org/wpp/',
  date: '2024-07',
  quality: 'primary',
};
const SOURCE_WBANK: Source = {
  ref: 25,
  title: 'World Bank Open Data — WDI portal',
  url: 'https://data.worldbank.org/',
  date: '2025-12',
  quality: 'primary',
};
const SOURCE_FAOSTAT: Source = {
  ref: 26,
  title: 'FAOSTAT (CC-BY 4.0)',
  url: 'https://www.fao.org/faostat/en/',
  date: '2025-12',
  quality: 'primary',
};
const SOURCE_SIPRI: Source = {
  ref: 27,
  title: 'SIPRI Military Expenditure Database',
  url: 'https://www.sipri.org/databases/milex',
  date: '2025-04',
  quality: 'primary',
};
const SOURCE_OWID: Source = {
  ref: 28,
  title: 'Our World in Data',
  url: 'https://ourworldindata.org/',
  date: '2025-12',
  quality: 'primary',
};
const SOURCE_GFW: Source = {
  ref: 29,
  title: 'Global Forest Watch — tropical primary forest loss 2024',
  url: 'https://www.globalforestwatch.org/',
  date: '2025-04',
  quality: 'primary',
};
const SOURCE_LPI_2024: Source = {
  ref: 30,
  title: 'WWF Living Planet Report 2024',
  url: 'https://livingplanet.panda.org/',
  date: '2024-10',
  quality: 'primary',
};
const SOURCE_STANFORD_AI: Source = {
  ref: 31,
  title: 'Stanford AI Index 2025',
  url: 'https://aiindex.stanford.edu/report/',
  date: '2025-04',
  quality: 'primary',
};
const SOURCE_IEA_WEO: Source = {
  ref: 32,
  title: 'IEA World Energy Outlook 2025',
  url: 'https://www.iea.org/reports/world-energy-outlook-2025',
  date: '2025-10',
  quality: 'primary',
};
const SOURCE_ECFR_DEFENCE: Source = {
  ref: 33,
  title: 'ECFR — Making defence European again',
  url: 'https://ecfr.eu/publication/making-defence-european-again/',
  date: '2025-09',
  quality: 'primary',
};
const SOURCE_EU_SAFE: Source = {
  ref: 34,
  title: 'Council of the EU — SAFE €150bn defence loans, in force 29 May 2025',
  url: 'https://www.consilium.europa.eu/en/press/press-releases/',
  date: '2025-05',
  quality: 'primary',
};
const SOURCE_CSIS_NORTHWOOD: Source = {
  ref: 35,
  title: 'CSIS — Northwood Declaration & the future of European deterrence',
  url: 'https://www.csis.org/analysis/northwood-declaration-future-european-deterrence',
  date: '2025-07',
  quality: 'primary',
};
const SOURCE_USGS_CM_2025: Source = {
  ref: 40,
  title: 'USGS Open-File Report 2025-1047 — 2025 Critical Minerals List',
  url: 'https://pubs.usgs.gov/of/2025/1047/ofr20251047.pdf',
  date: '2025-11',
  quality: 'primary',
};
const SOURCE_EU_CRMA: Source = {
  ref: 41,
  title: 'EU Critical Raw Materials Act (in force May 2024)',
  url: 'https://single-market-economy.ec.europa.eu/sectors/raw-materials/areas-specific-interest/critical-raw-materials_en',
  date: '2024-05',
  quality: 'primary',
};
const SOURCE_MOFCOM_46: Source = {
  ref: 42,
  title: 'MOFCOM Announcement 2024 No. 46 — export controls on Ga, Ge, Sb, graphite',
  url: 'https://cset.georgetown.edu/publication/china-rare-earth-export-ban/',
  date: '2024-12',
  quality: 'primary',
};
const SOURCE_WOOD_MAC: Source = {
  ref: 43,
  title: 'Wood Mackenzie — Copper outlook 2035',
  url: 'https://www.woodmac.com/',
  date: '2025-09',
  quality: 'secondary',
};
const SOURCE_IEA_CM_OUTLOOK: Source = {
  ref: 44,
  title: 'IEA Critical Minerals Outlook 2025',
  url: 'https://www.iea.org/reports/global-critical-minerals-outlook-2025',
  date: '2025-05',
  quality: 'primary',
};

const HORMUZ_BRIEFING: Program = {
  slug: 'hormuz-briefing',
  title: 'Hormuz Crisis Briefing',
  blurb:
    'Strait of Hormuz: what flows, who controls it, what 2026 did to it, and what it means for shipping.',
  durationMinutes: 75,
  chapters: [
    {
      slug: 'what-is-hormuz',
      title: 'What is the Strait of Hormuz?',
      number: 1,
      pages: [
        {
          slug: 'hormuz-geography',
          title: 'Hormuz is a 21-mile pinch between Iran and Oman',
          bluf: 'The Strait of Hormuz is the only sea passage between the Persian Gulf and open ocean. At its narrowest it is about 21 nautical miles wide.',
          body:
            'The Strait of Hormuz connects the Persian Gulf to the Gulf of Oman and from there to the Arabian Sea. ' +
            'It is bordered by Iran to the north and Oman (the Musandam peninsula) to the south. ' +
            'Inbound and outbound shipping lanes are separated by a 2-mile median, with a 2-mile-wide traffic separation scheme on each side. ' +
            "Vessels transiting in either direction pass within range of Iran's southern coast — that geography is the source of every other fact in this chapter.",
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: [],
          feedsInto: ['hormuz-oil-share', 'iran-leverage'],
          related: [],
          entities: ['strait-of-hormuz', 'iran', 'oman'],
          sources: [SOURCE_EIA],
        },
        {
          slug: 'hormuz-oil-share',
          title: '~20% of global oil moves through Hormuz',
          bluf: 'About 20 million barrels per day transit the Strait — roughly one in five barrels consumed globally.',
          body:
            'EIA estimates put Hormuz throughput at ~20.9 million barrels per day in the first half of 2025 — about 20% of global oil supply, plus a substantial share of LNG. ' +
            'The Strait is predominantly a tanker chokepoint: crude oil from Saudi Arabia, the UAE, Iraq, Kuwait, Qatar, and Iran moves westward; LNG from Qatar moves to Europe and Asia. ' +
            'Container traffic through Hormuz is comparatively small — this is the critical framing distinction. ' +
            'When the news says "Hormuz", it means oil; when it says "Red Sea" or "Bab el-Mandeb", it means containers.',
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['hormuz-geography'],
          feedsInto: ['iran-leverage', 'hormuz-vs-redsea'],
          related: ['hormuz-vs-redsea'],
          entities: ['strait-of-hormuz', 'saudi-arabia', 'uae', 'qatar', 'iran'],
          sources: [SOURCE_EIA, SOURCE_HOWDEN],
        },
        {
          slug: 'iran-leverage',
          title: "Hormuz is Iran's biggest non-nuclear lever",
          bluf: 'Iran cannot close the Strait for long, but it can throttle it — and the cost of even a 14-day disruption is measured in tens of billions.',
          body:
            'Iran sits on the northern coast of Hormuz, with naval, missile, and mining capability concentrated on Bandar Abbas, Larak, and Qeshm islands. ' +
            'A determined US-led coalition can keep the Strait open, but reopening takes time — minefields take weeks to clear, insurance markets reprice in hours. ' +
            'The leverage is asymmetric: Iran does not have to win a war to inflict cost on Western customers; it only has to make the Strait look unsafe long enough for insurers to reprice. ' +
            'That is exactly what happened during the late-February 2026 escalation.',
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['hormuz-oil-share'],
          feedsInto: ['war-risk-repricing', 'gulf-naval-presence'],
          related: ['axis-of-resistance-collapse'],
          entities: ['iran', 'irgc-navy', 'strait-of-hormuz', 'us-5th-fleet'],
          sources: [SOURCE_HOWDEN, SOURCE_BELFER],
        },
        {
          slug: 'hormuz-vs-redsea',
          title: 'Hormuz = tankers. Red Sea = containers.',
          bluf: 'Confusing the two is the most common Hormuz mistake. They are different straits, different ships, different consequences.',
          body:
            'Hormuz is overwhelmingly tanker traffic — crude oil and LNG. A Hormuz incident drives oil prices, war-risk premiums on hulls, and bunker fuel costs. ' +
            'It does not directly disrupt container shipping in a meaningful way. ' +
            'The Red Sea / Bab el-Mandeb / Suez axis is the container artery between Asia and Europe. Houthi attacks here force container reroutings around the Cape of Good Hope, adding 10-14 days and ~25% capacity absorption. ' +
            'For CMA CGM, the Red Sea is the direct hit; Hormuz is the indirect one — through bunker prices, customer-side oil shocks, and war-risk reinsurance pass-through.',
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['hormuz-oil-share'],
          feedsInto: ['cma-cgm-exposure'],
          related: ['iran-leverage'],
          entities: ['strait-of-hormuz', 'bab-el-mandeb', 'cma-cgm', 'houthis'],
          sources: [SOURCE_HOWDEN, SOURCE_EIA],
        },
        {
          slug: 'war-risk-repricing',
          title: 'War-risk premiums went 12x in March 2026',
          bluf: 'From a 0.10-0.25% baseline to 2-3% of hull value — the 3% ceiling applied to US/UK/Israeli-linked vessels.',
          body:
            'Howden Re documented the repricing: pre-war war-risk premiums on Hormuz transit were ~0.10-0.25% of hull value. Through March 2026 they peaked at 2-3%, with the 3% upper bound specifically applied to vessels with US, UK or Israeli ownership or flag links. ' +
            'The repricing was volatile within the month — Howden Re shows ~2.5% early March, easing to ~1% late March as ceasefire signals strengthened. ' +
            'Translation for a 100,000 dwt tanker insured at $80 million: a $0.16-0.20 million pre-war premium became a $1.6-2.4 million premium per transit at peak. ' +
            'This is the pricing input every CMA CGM-facing risk product has to model.',
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['iran-leverage'],
          feedsInto: ['epic-fury', 'oil-spike'],
          related: ['hormuz-vs-redsea'],
          entities: ['howden-re', 'lloyds-of-london', 'iumi'],
          sources: [SOURCE_HOWDEN],
        },
      ],
    },
    {
      slug: 'escalation-2026',
      title: 'How the 2025-2026 escalation unfolded',
      number: 2,
      pages: [
        {
          slug: 'twelve-day-war',
          title: "June 2025: the 12-day war exposed Iran's proxies as hollow",
          bluf: "During the June 2025 Iran-Israel war, the 'Axis of Resistance' did not act in any meaningful military capacity.",
          body:
            'Belfer Center, Clingendael, Washington Institute, and Long War Journal all document that during the June 2025 12-day Iran-Israel war, the Axis of Resistance — Hezbollah, Iraqi PMFs (Kataib Hezbollah, Harakat al-Nujaba), and largely the Houthis — took no significant military action to defend Iran. ' +
            "Kataib Hezbollah publicly stated it would not join Iran's attacks. Hezbollah was inactive. Houthi action was confined to a symbolic 15 June Jaffa missile, characterised as serving 'political and symbolic function' rather than meaningful military impact. " +
            'The strategic implication: future Iranian retaliation against shipping concentrates on Iran-direct action (IRGC, Hormuz) rather than distributed proxy harassment of vessels. ' +
            'Houthi Red Sea activity is a *separate* track — they have been actively striking commercial container traffic on their own agenda since 2023.',
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['iran-leverage'],
          feedsInto: ['epic-fury', 'axis-of-resistance-collapse'],
          related: ['hormuz-vs-redsea'],
          entities: ['iran', 'hezbollah', 'houthis', 'kataib-hezbollah'],
          sources: [SOURCE_BELFER],
        },
        {
          slug: 'epic-fury',
          title: '28 February 2026: Operation Epic Fury killed Khamenei',
          bluf: 'US and Israeli forces launched ~900 strikes in ~12 hours; Supreme Leader Ali Khamenei was killed.',
          body:
            'Operation Epic Fury was a US-Israeli combined operation: roughly 900 strikes over 12 hours on 28 February 2026. ' +
            "Supreme Leader Ali Khamenei was killed. Multiple independent sources — Belfer Center, Howden Re's specialty reinsurance report, Wikipedia, Al Jazeera, Axios, NPR, CNN, Britannica, Soufan Center, and a US House Republican Policy Committee memo — independently confirm both the strike date and the outcome. " +
            "Iran's chain of command was disrupted; the IRGC retained operational continuity but the regime's strategic posture entered a contested-leadership phase. " +
            'This is the single event that triggers everything else in the 2026 escalation arc.',
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['twelve-day-war'],
          feedsInto: ['hormuz-closure', 'oil-spike'],
          related: ['war-risk-repricing'],
          entities: ['us-government', 'israel', 'iran', 'khamenei', 'irgc-navy'],
          tags: ['iran-axis', 'chokepoint', 'alliances'],
          timeframe: 'now',
          sources: [SOURCE_BELFER, SOURCE_HOWDEN],
          changelog: [
            {
              at: '2026-06-04',
              note: 'Initial publication. Adversarial verification 3-0 on strike date, vote 3-0 on Khamenei outcome.',
            },
            {
              at: '2026-06-09',
              note: 'Reviewed; no source disputes the headline facts. Specific vessel-attack tally for the same period was refuted 1-2 elsewhere — dropped from this page.',
            },
          ],
        },
        {
          slug: 'hormuz-closure',
          title: '4 March 2026: Iran declared the Strait closed',
          bluf: 'Four days after Khamenei was killed, Iran formally declared the Strait of Hormuz "closed".',
          body:
            'On 4 March 2026, Iran formally declared the Strait of Hormuz "closed" — a declaration confirmed by Wikipedia, Al Jazeera, and Tufts Now. ' +
            'A declaration is not a physical closure: tankers continued transiting under steeply higher war-risk premiums, with named seizures and contested mine incidents elevating the perceived risk for every Western-linked hull. ' +
            "The declaration's real effect was the *pricing shock*: it gave underwriters cover to reprice, and gave traders cover to bid up Brent. " +
            'A specific tally of 28+ vessels attacked in this window appears in some sources but was *refuted* by adversarial verification — do not quote vessel counts without primary corroboration.',
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['epic-fury'],
          feedsInto: ['oil-spike', 'cma-cgm-exposure'],
          related: ['war-risk-repricing'],
          entities: ['iran', 'strait-of-hormuz'],
          sources: [SOURCE_HOWDEN],
        },
        {
          slug: 'oil-spike',
          title: 'Brent peaked at $119 on 19 March 2026 (+46%)',
          bluf: 'Crude rose from ~$71 pre-war to $119/bbl in three weeks. The IEA released a record 400M-barrel emergency stockpile — covering ~20 days of Hormuz throughput.',
          body:
            'CNBC confirmed the $119 peak on 19 March 2026 — Brent briefly touching the level on a Netanyahu Hormuz-opening signal. The pre-war ~$72 baseline implies +46% in three weeks. US retail gasoline briefly broke $3.94/gallon by 22 March, the first time above ~$4 since August 2022. ' +
            'The IEA coordinated the largest emergency oil release in its history: **400 million barrels**, equivalent to roughly **20 days of typical Hormuz throughput** (~20.9 mb/d). The release was directional — it bought time, not resolution. ' +
            'For container carriers the second-order channel matters more than the absolute price: bunker fuel costs follow Brent, customer demand softens at high oil prices, and reinsurance pass-through tightens hull rates a few weeks behind the spot move.',
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['hormuz-closure'],
          feedsInto: ['cma-cgm-exposure'],
          related: ['war-risk-repricing'],
          entities: ['iea', 'brent', 'opec'],
          sources: [SOURCE_HOWDEN, SOURCE_IEA],
        },
        {
          slug: 'cma-cgm-exposure',
          title: "CMA CGM's exposure is mostly indirect — but it is large",
          bluf: 'Container carriers do not transit Hormuz heavily. They pay through bunker fuel, war-risk reinsurance pass-through, and customer-side oil shocks.',
          body:
            'CMA CGM operates ~4.14M TEU of container capacity (#3 globally) with the most aggressive orderbook in the top 10 (45.5% of fleet). Direct Hormuz container exposure is comparatively small — Hormuz primarily moves tankers. ' +
            "The indirect channels are where the hit lands: (a) bunker fuel costs track Brent — a +46% Brent move flows into bunker within weeks; (b) reinsurance pass-through tightens hull rates fleet-wide; (c) the group's customer base — including auto, retail, and food customers — softens demand at high oil prices. " +
            "CMA CGM's terminal portfolio is also directly geographically exposed at Sokhna (Red Sea), Jeddah (Red Sea), and Mombasa (East Africa). Hormuz is the headline; Red Sea is where containers actually break.",
          confidence: 'MED',
          lastVerified: '2026-06-04',
          dependsOn: ['oil-spike'],
          feedsInto: ['top-3'],
          related: ['hormuz-vs-redsea', 'war-risk-repricing'],
          entities: ['cma-cgm', 'sokhna-terminal', 'jeddah-terminal', 'mombasa-terminal'],
          sources: [SOURCE_ALPHALINER, SOURCE_HOWDEN],
        },
      ],
    },
    {
      slug: 'alignment',
      title: 'Who is backing whom',
      number: 3,
      pages: [
        {
          slug: 'axis-of-resistance-collapse',
          title: "Iran's proxy network is structurally degraded",
          bluf: "The 'Axis of Resistance' did not act in the 12-day war or in early 2026. The proxy model is no longer a load-bearing strategic asset for Tehran.",
          body:
            'Pre-2023, Iran could credibly threaten distributed retaliation through Hezbollah, Hamas, Kataib Hezbollah, the Houthis, and other Iraqi PMFs. ' +
            'By mid-2025, that network was substantially degraded by sustained Israeli strikes (Hamas in Gaza, Hezbollah in Lebanon, Houthi infrastructure in Yemen) and by the cost of being seen as Iranian instruments without protection. ' +
            'During the June 2025 12-day war and through the February 2026 escalation, the network *did not act*. ' +
            'A specific claim that the Houthis had abandoned regional projection and refocused on Yemen after US Operation Rough Rider 2025 was *refuted* in adversarial verification — Houthi Red Sea activity continues independently. Treat as: Axis collapsed as a coordinated network; individual nodes still operate on their own agenda.',
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['twelve-day-war'],
          feedsInto: ['russia-iran'],
          related: ['epic-fury'],
          entities: ['hezbollah', 'houthis', 'hamas', 'iraqi-pmfs'],
          sources: [SOURCE_BELFER],
        },
        {
          slug: 'russia-iran',
          title: 'Russia and Iran are formally aligned through 2045',
          bluf: 'A 20-year Comprehensive Strategic Partnership Treaty signed January 2025 codifies defense, cyber, energy, and security cooperation.',
          body:
            "In December 2023, Russia and Iran concluded a joint declaration on 'counteracting unilateral coercive measures' — explicitly framing sanctions evasion as a shared project. In January 2025 they signed a 20-year Comprehensive Strategic Partnership Treaty covering defense, cyber, energy, and security cooperation. " +
            'Both governments share an explicit framing of the United States and its allies as their principal security threat (CSIS verbatim). The relationship is anchored not in sentiment but in shared exposure to the same sanctions regime. ' +
            'Note: the December 2023 instrument is technically a declaration, not a treaty; the treaty came in January 2025.',
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['axis-of-resistance-collapse'],
          feedsInto: ['instc', 'china-asymmetric'],
          related: [],
          entities: ['russia', 'iran', 'putin', 'pezeshkian'],
          sources: [SOURCE_CSIS_RU_IR],
        },
        {
          slug: 'instc',
          title: 'INSTC is the sanctions-bypass corridor being built right now',
          bluf: 'Russia is committing €1.3 bn+ to the Rasht-Astara railway segment of a 7,200 km Russia-Iran-India corridor. Target completion Q3 2027.',
          body:
            'The International North-South Transport Corridor (INSTC) is a 7,200 km road-rail-naval route linking Russia to the Persian Gulf and India via the South Caucasus and Central Asia. It was initiated in 2000 by Russia, Iran, and India. Post-2022 Ukraine invasion, Russia accelerated commitment to it explicitly as sanctions-bypass infrastructure. ' +
            'Russia is contributing €1.3 bn+ of the €1.6 bn cost of the Rasht-Astara railway segment in Iran, with a Q3 2027 target. Iran and Russia signed a "transit roadmap for 2025" on 18 February 2025. Putin and Pezeshkian have publicly reaffirmed the commitment. ' +
            "CSIS verbatim: 'a clear Russian and Iranian commitment to creating a trade route that could bypass Western sanctions.' The INSTC is what 'Russia-Iran alignment' looks like in concrete logistics — not a treaty paragraph.",
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['russia-iran'],
          feedsInto: [],
          related: [],
          entities: ['russia', 'iran', 'india', 'instc'],
          sources: [SOURCE_CSIS_INSTC],
        },
        {
          slug: 'china-asymmetric',
          title: 'China is in the alignment but not in a hurry',
          bluf: 'Strategic but not urgent for Beijing. China kept declared neutrality through March 2026 despite a ~25% drop in Gulf crude imports.',
          body:
            "CSIS verbatim: the Russia-China-Iran alignment is 'strategic and urgent for Russia and Iran, strategic but not urgent for China.' Beijing has a longer time horizon and pursues diversification despite real exposure. " +
            'During the March 2026 crisis China maintained declared neutrality; its Gulf crude imports dropped ~25% and the Iranian oil shortfall was 1-1.4 mb/d. Belt and Road maritime stake (Gwadar in Pakistan, Djibouti, Piraeus, Haifa) gives China significant chokepoint exposure, but Hormuz is treated as a logistics/price problem rather than existential. ' +
            'A claim that Russia and China *reduced* their support to Iran in 2025-2026 was *refuted* in adversarial verification — the opposite direction is better supported.',
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['russia-iran'],
          feedsInto: [],
          related: ['cma-cgm-exposure'],
          entities: ['china', 'cosco', 'belt-and-road'],
          sources: [SOURCE_CSIS_RU_IR],
        },
      ],
    },
  ],
};

const SHIPPING_BIG_NINE: Program = {
  slug: 'shipping-industry',
  title: 'How container shipping actually works',
  blurb: 'The ship, the box, the carriers, the alliances, and how they make money (or lose it).',
  durationMinutes: 60,
  chapters: [
    {
      slug: 'the-big-9',
      title: 'The Big 9 carriers, ranked',
      number: 1,
      pages: [
        {
          slug: 'top-3',
          title: 'Top 3 carriers control nearly half of global capacity',
          bluf: 'MSC, Maersk, and CMA CGM together hold roughly 46% of global container fleet capacity.',
          body:
            'As of January 2026 (Alphaliner): MSC at 7.136 M TEU (+13.2% YoY), Maersk at 4.612 M TEU, CMA CGM at 4.140 M TEU. ' +
            'The three together are about 46% of global capacity. The top 10 collectively control ~84%. ' +
            'MSC pulled decisively ahead in 2025, alone responsible for 39% of top-12 growth and widening its lead over Maersk to 2.524 M TEU. ' +
            'CMA CGM holds #3 with the most aggressive orderbook in the top 10 — 45.5% of existing fleet on order, vs an industry average of ~33.5%.',
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: [],
          feedsInto: ['alliances', 'cma-cgm-strategy'],
          related: [],
          entities: ['msc', 'maersk', 'cma-cgm'],
          sources: [SOURCE_ALPHALINER],
        },
        {
          slug: 'alliances',
          title: 'There are three alliances now — and MSC is in none of them',
          bluf: 'After the 2M ended, the board reset to Gemini (Maersk + Hapag-Lloyd), Premier (ONE + HMM + Yang Ming), and Ocean (CMA CGM + COSCO + Evergreen). MSC operates alone.',
          body:
            'The 2M (Maersk + MSC) alliance ended in early 2025. The board now: ' +
            '**Gemini** — Maersk + Hapag-Lloyd, headline pitch is hub-and-spoke schedule reliability. ' +
            '**Premier** — ONE + HMM + Yang Ming, the successor to THE Alliance after MSC left. ' +
            '**Ocean Alliance** — CMA CGM + COSCO + Evergreen, the largest aggregate capacity, renewed through ~2032. ' +
            '**MSC** operates on most lanes outside any alliance, using sheer scale (7.136M TEU) as its own network. ' +
            'For the geopolitics-of-shipping reader, the practical implication: an alliance changes how a single Hormuz/Red Sea disruption translates into capacity decisions — Gemini reshuffles spokes, Premier shares slots, Ocean spreads cost. MSC absorbs solo.',
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['top-3'],
          feedsInto: ['cma-cgm-strategy', 'orderbook'],
          related: [],
          entities: ['gemini-alliance', 'premier-alliance', 'ocean-alliance', 'msc'],
          sources: [SOURCE_ALPHALINER],
        },
        {
          slug: 'orderbook',
          title: 'The orderbook is at a 15-year high',
          bluf: 'Industry orderbook-to-fleet is ~33.5% — the highest since 2010. CMA CGM is at 45.5%.',
          body:
            'Clarksons / Shipping Intelligence Hub data places the global container orderbook at a 15-year high. As a share of existing fleet: industry ~33.5%, COSCO 38.1%, CMA CGM 45.5%. ' +
            'The newbuild wave will deliver into 2026-2028 against weakening demand growth. The structural setup is **overcapacity unless geopolitics absorbs the slack**. ' +
            'Red Sea reroutings around the Cape of Good Hope absorbed ~25% of effective capacity in 2024 — a Houthi-driven supply discipline that has nothing to do with operator strategy. ' +
            'The carrier strategy question through 2027 is: **scrap aggressively, hope geopolitics persists, or absorb the rate pressure.** Each carrier is betting differently.',
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['top-3'],
          feedsInto: ['cma-cgm-strategy'],
          related: ['cma-cgm-exposure'],
          entities: ['clarksons', 'cma-cgm', 'cosco'],
          sources: [SOURCE_ALPHALINER],
        },
      ],
    },
    {
      slug: 'cma-cgm-strategy',
      title: 'The CMA CGM Group',
      number: 2,
      pages: [
        {
          slug: 'cma-cgm-strategy',
          title: 'CMA CGM is the conglomerate hiding inside a container carrier',
          bluf: 'Shipping + CEVA Logistics + media + AI + air cargo + terminals. The pivot from peak-shipping cycle to industrial diversification is the strategy.',
          body:
            'Group revenue: $55.5bn in 2024 (+18% YoY, 24.2% EBITDA margin), normalising to $54.4bn in 2025 (19.4% margin). ' +
            "Four headline buckets: **Shipping** (4.140M TEU, #3 globally); **Logistics** — CEVA at $18.3bn revenue, top-4 globally, integrated with Bolloré Logistics in Feb 2024; **Media** — Altice Media deal (~€1.55bn, July 2024) gives CMA CGM BFM TV, BFM Business, RMC channels — France's self-described 3rd-largest private media group; **AI/Digital** — €500m total commitment. " +
            "This is the conglomerate frame Saadé's team is building. Pitch the product into the conglomerate.",
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['top-3'],
          feedsInto: ['cma-cgm-ai'],
          related: ['cma-cgm-exposure'],
          entities: ['cma-cgm', 'ceva-logistics', 'cma-media', 'bollore-logistics'],
          sources: [SOURCE_CMACGM_2024, SOURCE_CMACGM_2025],
        },
        {
          slug: 'cma-cgm-ai',
          title: '€500m AI commitment, anchored by Kyutai and Mistral',
          bluf: 'Co-founded Kyutai in Nov 2023 (€100m). Signed a 5-year €100m partnership with Mistral in April 2025. MAIA agentic platform rolls out to 80,000 employees from 1 June 2026.',
          body:
            "Saadé's stated frame at Kyutai's launch: 'place France and the rest of Europe at the forefront of artificial intelligence research' and 'I would like the younger generation to benefit from all the opportunities that this technology has to offer.' " +
            'Stack: Kyutai (co-founder, Nov 2023, Station F, with Iliad/Niel and Schmidt Futures — €100m CMA CGM share); Google Cloud strategic partnership (July 2024, AI across shipping/logistics/media); Mistral AI (5-year, €100m, April 2025 — Mistral AI Factory at Marseille HQ + AI Media Lab at Grand Central, ~20 Mistral engineers embedded); AMI Labs (Yann LeCun, March 2026, $1.03bn round at $3.5bn); Poolside; Dataiku; Perplexity. ' +
            "MAIA (Powered by Mistral) — the group's agentic AI platform — rolls out 1 June 2026 to ~80,000 employees across CMA CGM, CEVA, and CMA Media. 55+ projects, 200+ use cases as of late May 2026. **MAIA is the docking surface for any new agent — including a Geopolitics Intel agent.**",
          confidence: 'HIGH',
          lastVerified: '2026-06-04',
          dependsOn: ['cma-cgm-strategy'],
          feedsInto: [],
          related: [],
          entities: ['cma-cgm', 'mistral', 'kyutai', 'maia', 'saade'],
          sources: [SOURCE_KYUTAI, SOURCE_MISTRAL],
        },
      ],
    },
  ],
};

const WORLD_2050_PROGRAM: Program = {
  slug: 'world-2050-program',
  title: 'The World in 2050',
  blurb: 'Where the data is, where the climate is heading, where AI is heading, where people are.',
  durationMinutes: 70,
  chapters: [
    {
      slug: 'how-we-know',
      title: 'How we know what we know',
      number: 1,
      pages: [
        {
          slug: 'authoritative-data',
          title: 'A small set of canonical portals carry most of the world',
          bluf: 'For most of the questions a literate citizen asks about the world, six free portals cover it: Our World in Data, World Bank WDI, FAOSTAT, Copernicus CDS, UN WPP, and SIPRI.',
          body:
            'These six together cover economies (World Bank WDI: ~1,400 indicators across 217 economies, pulling UN/OECD/IMF feeds), agriculture and food (FAOSTAT: CC-BY 4.0, free, machine-readable), climate (Copernicus CDS: 140+ datasets, 3.8 PB, free open access — the home of ERA5 reanalysis behind the 1.5 °C-breached headline), demography (UN DESA World Population Prospects 2024), security (SIPRI Military Expenditure since 1949), and a synthesis layer (Our World in Data — the meta-source for newsroom-grade charts). ' +
            'Treat anything that does not trace back to one of these (or a peer: IEA, FAO, WHO, NOAA, IPCC, IUCN, V-Dem, UCDP, Stanford AI Index, Epoch AI) as a downstream interpretation. ' +
            "A 'World in 2050' program built on anything else is a blog.",
          confidence: 'HIGH',
          lastVerified: '2026-06-10',
          dependsOn: [],
          feedsInto: ['co2-budget-contested', 'amoc-contested', 'population-peak'],
          related: [],
          entities: ['world-bank', 'fao', 'copernicus', 'un-desa', 'sipri', 'our-world-in-data'],
          tags: ['climate', 'data'],
          timeframe: 'this-decade',
          sources: [
            SOURCE_OWID,
            SOURCE_WBANK,
            SOURCE_FAOSTAT,
            SOURCE_C3S,
            SOURCE_UN_WPP,
            SOURCE_SIPRI,
          ],
        },
      ],
    },
    {
      slug: 'climate-turning-points',
      title: 'Carbon turning points',
      number: 2,
      pages: [
        {
          slug: 'co2-422',
          title: 'CO₂ is at 422 ppm — 52% above pre-industrial',
          bluf: 'Atmospheric CO₂ hit 422.45 ppm in 2024 (Global Carbon Project), and 2024 became the first calendar year above 1.5 °C global mean surface temperature anomaly.',
          body:
            'The Global Carbon Project Global Carbon Budget 2024 reports atmospheric CO₂ at 422.45 ppm — 52% above pre-industrial. Global emissions reached 41.6 GtCO₂ in 2024. ' +
            'Copernicus C3S, using ERA5 reanalysis against the 1991-2020 baseline, confirmed 2024 was the first calendar year above 1.5 °C anomaly. ' +
            'This is the headline number. The *budget* — how much more we can emit before crossing 1.5 °C on a multi-decadal average — is contested (see next page).',
          confidence: 'HIGH',
          lastVerified: '2026-06-10',
          dependsOn: ['authoritative-data'],
          feedsInto: ['co2-budget-contested', 'amoc-contested'],
          related: [],
          entities: ['gcp', 'copernicus'],
          tags: ['climate'],
          timeframe: 'now',
          sources: [SOURCE_GCP_2024, SOURCE_C3S],
        },
        {
          slug: 'co2-budget-contested',
          title: 'The 1.5 °C carbon budget: 235 GtCO₂ — or 130. Sources disagree.',
          bluf: 'Global Carbon Project estimates ~235 GtCO₂ remaining for a 50% chance of 1.5 °C. Forster et al. (2024) estimate ~130 GtCO₂. Both are credible. The disagreement matters.',
          body:
            'GCP 2024 carries ~235 GtCO₂ — roughly six years at current ~41.6 GtCO₂/yr. Forster et al. (Indicators of Global Climate Change 2024) come in much tighter at ~130 GtCO₂ — about three years. The gap is driven by methodological choices on aerosol forcing, observed warming attribution, and warming-from-non-CO₂ deductions. ' +
            "Programmes should publish *both* and flag the disagreement. The most-honest single sentence is: 'Somewhere between three and six years of current emissions exhaust the budget at the 50% level.' " +
            'Anything tighter is overconfident. Anything looser is misleading.',
          confidence: 'MED',
          lastVerified: '2026-06-10',
          dependsOn: ['co2-422'],
          feedsInto: ['amoc-contested', 'peak-oil-demand'],
          related: [],
          entities: ['gcp', 'forster-et-al', 'ipcc'],
          tags: ['climate'],
          timeframe: 'this-decade',
          sources: [SOURCE_GCP_2024, SOURCE_IPCC_AR6],
        },
        {
          slug: 'amoc-contested',
          title: 'AMOC collapse: mid-century or "very unlikely"? Two credible answers.',
          bluf: 'Ditlevsen & Ditlevsen (2023, Nature Communications) place an AMOC collapse risk as early as 2025-2095, median 2050. IPCC AR6 rates a 21st-century collapse "very unlikely (medium confidence)". This is the largest live disagreement in tipping-point science.',
          body:
            "The Atlantic Meridional Overturning Circulation is the world's most consequential single tipping element — its collapse would cool Northwest Europe, dry the Sahel, and disrupt monsoons. " +
            "Ditlevsen 2023 uses sea-surface-temperature fingerprints on the subpolar gyre and statistical early-warning indicators to flag a real risk of collapse mid-century. IPCC AR6 WG1 uses CMIP6 ensembles and concludes a 21st-century collapse is 'very unlikely' at medium confidence. " +
            'The right read is not to pick a winner. It is to acknowledge that *we are arguing about whether the most important non-linear climate event of the next 30 years is roughly 0% or roughly 50%*. That alone is a policy-relevant fact.',
          confidence: 'MED',
          lastVerified: '2026-06-10',
          dependsOn: ['co2-budget-contested'],
          feedsInto: ['peak-oil-demand'],
          related: [],
          entities: ['ditlevsen', 'ipcc'],
          tags: ['climate'],
          timeframe: 'long-arc',
          sources: [SOURCE_DITLEVSEN, SOURCE_IPCC_AR6],
        },
        {
          slug: 'forest-and-life',
          title: 'Forests and life: the gauges are accelerating downward',
          bluf: 'Tropical primary forest loss hit 6.7 Mha in 2024 (~2x 2023) per Global Forest Watch. The 2024 WWF Living Planet Index reports a 73% average decline in monitored vertebrate populations since 1970.',
          body:
            'Global Forest Watch 2024 update: tropical primary forest loss reached 6.7 Mha in 2024, nearly doubling 2023, with fires displacing agricultural conversion as the leading direct driver for the first time. ' +
            'The 2024 Living Planet Report (WWF / ZSL) documents a 73% average decline in monitored vertebrate population sizes since 1970 — a metric some scientists contest as average-of-ratios, but the directional signal is corroborated by IUCN Red List proportions. ' +
            'These two datasets are the closest we have to a real-time read on the biosphere. Both point the same way, and both got worse in 2024.',
          confidence: 'HIGH',
          lastVerified: '2026-06-10',
          dependsOn: ['authoritative-data'],
          feedsInto: [],
          related: ['amoc-contested'],
          entities: ['global-forest-watch', 'wwf', 'iucn'],
          tags: ['climate', 'biodiversity'],
          timeframe: 'now',
          sources: [SOURCE_GFW, SOURCE_LPI_2024],
        },
      ],
    },
    {
      slug: 'energy-and-people',
      title: 'Energy, AI, and people',
      number: 3,
      pages: [
        {
          slug: 'peak-oil-demand',
          title: 'Peak oil demand: 2029-2030 in IEA scenarios — but the date moves',
          bluf: 'IEA WEO 2025 projects oil demand peaks before 2030 in STEPS and is already past peak in APS/NZE. BNEF and Equinor agree on the direction; Rystad and OPEC push the date later.',
          body:
            "IEA WEO 2025: oil demand plateaus around 2029 in STEPS (Stated Policies), peaks earlier in APS (Announced Pledges) and NZE (Net Zero). BloombergNEF and Equinor's outlooks support this. " +
            "Rystad Energy and OPEC project peak later (mid-2030s or beyond) — the dispute hinges on EV penetration assumptions, China's saturation curve, and aviation/petrochemical demand. " +
            'Calibrated bet: oil demand peaks somewhere between 2028 and 2034. The post-peak decline is what funds — or fails to fund — the energy transition in producing countries.',
          confidence: 'MED',
          lastVerified: '2026-06-10',
          dependsOn: ['authoritative-data'],
          feedsInto: ['copper-demand'],
          related: ['co2-budget-contested'],
          entities: ['iea', 'bnef', 'opec', 'rystad'],
          tags: ['energy-transition', 'climate'],
          timeframe: 'this-decade',
          sources: [SOURCE_IEA_WEO],
        },
        {
          slug: 'ai-long-arc',
          title: 'AI in the 2030s: capability up, compute up, returns disputed',
          bluf: 'Frontier-model training compute has doubled roughly every 5-6 months since 2010 (Epoch AI). Stanford AI Index 2025 documents continued benchmark saturation. Whether this scales to AGI by 2030 is the live argument, not the consensus.',
          body:
            'Two strong empirical regularities through 2025: (a) training compute for frontier models continues to scale (Epoch AI); (b) capability benchmarks (MMLU, GPQA, SWE-bench, FrontierMath) keep saturating (Stanford AI Index 2025). ' +
            'What is *not* consensus: whether scaling continues to deliver, when (or if) general intelligence equivalent to top human performance arrives, and what happens to capital allocation if returns disappoint. Median forecaster estimates for "AGI" range from 2030 to 2060. ' +
            "For a 'World in 2050' program the honest framing is: AI is the most likely single source of compounding economic and geopolitical disruption between now and 2050, *and* the magnitude is highly uncertain.",
          confidence: 'MED',
          lastVerified: '2026-06-10',
          dependsOn: ['authoritative-data'],
          feedsInto: [],
          related: ['peak-oil-demand'],
          entities: ['epoch-ai', 'stanford-hai'],
          tags: ['ai'],
          timeframe: 'long-arc',
          sources: [SOURCE_STANFORD_AI],
        },
        {
          slug: 'population-peak',
          title: 'Population peaks around 2084 at ~10.3 billion — UN. IHME and IIASA say earlier.',
          bluf: 'UN World Population Prospects 2024 projects peak ~10.3 B around 2084. IHME GBD and IIASA project earlier, lower peaks (~9.7 B by 2064 / ~9.4 B in some scenarios).',
          body:
            'The most-cited number — peak ~10.3 B around 2084 — comes from UN DESA WPP 2024. Two other credible institutions disagree: IHME (Global Burden of Disease projections) puts the peak earlier and lower; IIASA (Wittgenstein Centre) projects similar low. ' +
            'The downstream consequence of "peak in 2060 not 2080" is enormous: it changes labour-supply trajectories in East Asia and Europe, the African demographic dividend window, and the global resource demand path. ' +
            'For a 2050 program: assume the peak is somewhere between 2060 and 2090, lean closer to UN for the median.',
          confidence: 'MED',
          lastVerified: '2026-06-10',
          dependsOn: ['authoritative-data'],
          feedsInto: [],
          related: [],
          entities: ['un-desa', 'ihme', 'iiasa'],
          tags: ['climate'],
          timeframe: 'long-arc',
          sources: [SOURCE_UN_WPP],
        },
      ],
    },
  ],
};

const ALLIANCES_RESHUFFLE_PROGRAM: Program = {
  slug: 'alliances-reshuffle-program',
  title: 'How the alliance map is changing',
  blurb:
    'NATO under strain, Europe waking up, BRICS+ expanding, dollar still dominant. The structural shape of who-backs-whom in the late 2020s.',
  durationMinutes: 45,
  chapters: [
    {
      slug: 'nato-schrodinger',
      title: 'NATO is in two states at once',
      number: 1,
      pages: [
        {
          slug: 'schrodinger-nato',
          title: 'Most European leaders now treat the US guarantee as broken',
          bluf: 'ECFR (Sept 2025) verbatim: "Most European leaders are coming to accept that their defence relationship with the US as they knew it is over." This is a structural break, not a rhetorical one.',
          body:
            "ECFR's 'Making defence European again' paper coined 'Schrodinger\\'s NATO' to describe a state where the US is formally committed to the alliance and behaviourally absent. The 2026 US National Defense Strategy downgrades Europe to a secondary theatre and conditions support on burden-sharing. " +
            "The March 2025 Signal-chat leak put the framing in writing: Vice-President Vance — 'I just hate bailing Europe out again'. Defence Secretary Hegseth — 'I fully share your loathing of European free-loading.' " +
            'The downstream policy assumption is that European NATO members now plan as if the US guarantee may not arrive — even if, in any given crisis, it does.',
          confidence: 'HIGH',
          lastVerified: '2026-06-10',
          dependsOn: [],
          feedsInto: ['rearm-europe', 'northwood'],
          related: ['liberation-day'],
          entities: ['nato', 'us-government', 'vance', 'hegseth'],
          tags: ['alliances', 'trumpism'],
          timeframe: 'now',
          sources: [SOURCE_ECFR_DEFENCE],
        },
        {
          slug: 'rearm-europe',
          title: 'Europe is putting €281 billion on the table for its own defence',
          bluf: 'Council of the EU activated the €150 bn SAFE defence-loan mechanism on 29 May 2025. The 2028-2034 EU budget proposes €131 bn for defence and space — a fivefold increase.',
          body:
            'Two formal commitments anchor the European defence awakening. **SAFE** (Security Action for Europe) — €150 bn in low-interest defence loans for member states, in force from 29 May 2025 per the Council of the EU. **2028-2034 MFF (Multiannual Financial Framework)** — the July 2025 Commission proposal quintuples defence and space spending to €131 bn via the European Competitiveness Fund window. ' +
            "France's 2025 National Strategic Review labels Russia 'the most direct threat today and for years to come'. The UK 2025 SDR identifies Russia as an immediate threat. " +
            'These are not declarations of independence from the US. They are insurance against a US guarantee that may not arrive.',
          confidence: 'HIGH',
          lastVerified: '2026-06-10',
          dependsOn: ['schrodinger-nato'],
          feedsInto: ['northwood'],
          related: [],
          entities: ['european-commission', 'council-eu', 'france', 'uk'],
          tags: ['alliances'],
          timeframe: 'now',
          sources: [SOURCE_EU_SAFE, SOURCE_ECFR_DEFENCE],
        },
        {
          slug: 'northwood',
          title: 'France and the UK are quietly building a European nuclear pillar',
          bluf: 'The Northwood Declaration (10 July 2025) formalises Franco-British nuclear-deterrence coordination — the first step of a European nuclear umbrella distinct from the US one.',
          body:
            "CSIS frames the Northwood Declaration as 'the strategic backdrop' to a Europe that 'will no longer be underwritten by the United States by default'. France and the UK — Europe's only nuclear powers — committed to coordinate nuclear deterrence policy, signalling capacity to substitute for US extended deterrence if needed. " +
            'Parallel Franco-German conversations on nuclear sharing have moved from taboo to open discussion. Poland and the Baltics are explicit about wanting *some* European nuclear cover. ' +
            'This will not produce a credible European nuclear umbrella by 2030. It will produce *the political-institutional scaffolding* on which one becomes possible by 2040.',
          confidence: 'HIGH',
          lastVerified: '2026-06-10',
          dependsOn: ['rearm-europe'],
          feedsInto: [],
          related: [],
          entities: ['france', 'uk', 'germany', 'csis'],
          tags: ['alliances'],
          timeframe: 'this-decade',
          sources: [SOURCE_CSIS_NORTHWOOD],
        },
      ],
    },
    {
      slug: 'trumpism-as-structure',
      title: 'Trumpism reshapes globalisation',
      number: 2,
      pages: [
        {
          slug: 'liberation-day',
          title: '"Liberation Day" tariffs: struck down, then upheld',
          bluf: 'The April 2025 IEEPA "Liberation Day" tariffs were struck down by the Court of International Trade and the DC District Court in late May 2025. SCOTUS upheld them on appeal in February 2026.',
          body:
            "On 2 April 2025, Trump invoked the International Emergency Economic Powers Act to impose a universal baseline tariff and country-specific 'reciprocal' tariffs. " +
            'The Court of International Trade (V.O.S. Selections v. United States) and the DC District Court (Learning Resources v. Trump) both struck down the IEEPA tariffs in late May 2025. The administration pivoted to Section 232 (national security) and Section 301 (trade practice) authorities, keeping most tariffs in place. SCOTUS upheld the IEEPA framework on appeal in February 2026. ' +
            "The lesson: Trumpism's tariff regime is institutionally durable now — not because Trump won every legal battle, but because the toolkit has multiple authorities and a sympathetic Supreme Court.",
          confidence: 'HIGH',
          lastVerified: '2026-06-10',
          dependsOn: [],
          feedsInto: ['brics-payments'],
          related: ['schrodinger-nato'],
          entities: ['trump-2', 'scotus', 'us-trade-court'],
          tags: ['trumpism', 'alliances'],
          timeframe: 'now',
          sources: [SOURCE_ECFR_DEFENCE],
        },
      ],
    },
    {
      slug: 'brics-plus',
      title: 'BRICS+ as a payments cluster, not a replacement reserve',
      number: 3,
      pages: [
        {
          slug: 'brics-ten',
          title: 'BRICS+ is now ten members — and that is still not a bloc',
          bluf: 'BRICS+ expanded to ten formal members between 2024 and January 2025: Brazil, Russia, India, China, South Africa + Egypt, Ethiopia, Iran, UAE (Jan 2024) + Indonesia (Jan 2025). Saudi Arabia is hedging.',
          body:
            'The expansion is real. The bloc-ness is not. Brazil and India actively resist anti-Western alignment. The UAE is in BRICS *and* in the Abraham Accords. Indonesia is explicitly non-aligned. The bloc is held together by shared frustrations, not shared positive vision. ' +
            "Saudi Arabia has been 'invited' since 2023 but has not formally joined as of mid-2026 — a hedge against US pressure. " +
            "For a 'World in 2050' program: treat BRICS+ as *a growing trade-and-payments cluster*, not a coherent geopolitical bloc.",
          confidence: 'HIGH',
          lastVerified: '2026-06-10',
          dependsOn: [],
          feedsInto: ['brics-payments'],
          related: [],
          entities: ['brics', 'india', 'saudi-arabia'],
          tags: ['alliances'],
          timeframe: 'this-decade',
          sources: [SOURCE_ECFR_DEFENCE],
        },
        {
          slug: 'brics-payments',
          title: 'USD still ~58% of reserves. RMB still ~2%. Read accordingly.',
          bluf: "The dollar's share of global FX reserves is ~58% in 2025 (IMF COFER), down from ~70% in 2000. The renminbi's share is stuck at ~2%. BRICS payment systems substitute at the margins, not at the core.",
          body:
            'IMF COFER data through Q4 2024 puts USD reserve share at ~58%, EUR ~20%, JPY ~6%, GBP ~5%, RMB ~2%. The dollar is *the* dominant reserve currency at multi-decadal lows but still without a serious challenger. ' +
            'BRICS+ payment innovations — BRICS Pay, mBridge, expanded INSTC, growing CIPS membership — bypass SWIFT and dollar clearing for Russia-Iran-China trade and for some Gulf-Asia flows. They are not building a reserve substitute. They are building a sanctions-resistant transactional layer. ' +
            'Calibrated bet: USD reserve share at ~50% by 2030, RMB share creeping to ~4-5%. BRICS+ becomes a real payments cluster. It does *not* replace the dollar.',
          confidence: 'MED',
          lastVerified: '2026-06-10',
          dependsOn: ['brics-ten', 'liberation-day'],
          feedsInto: [],
          related: [],
          entities: ['imf', 'brics', 'swift', 'cips'],
          tags: ['alliances', 'trumpism'],
          timeframe: 'this-decade',
          sources: [SOURCE_ECFR_DEFENCE],
        },
      ],
    },
  ],
};

const CRITICAL_MATERIALS_PROGRAM: Program = {
  slug: 'critical-materials-atlas',
  title: 'Critical materials, per-material',
  blurb:
    'Who mines, who refines, who can shut the tap. The two-axis logic and the per-material reality.',
  durationMinutes: 60,
  chapters: [
    {
      slug: 'framework',
      title: 'What makes a material "critical"',
      number: 1,
      pages: [
        {
          slug: 'usgs-2025',
          title: 'USGS 2025 lists 60 minerals as critical — up from 50 in 2022',
          bluf: 'The USGS 2025 Critical Minerals List (Open-File Report 2025-1047) names 60 minerals using a probability-weighted GDP-impact model — 17 of them already under MOFCOM controls have a modelled 100% disruption probability.',
          body:
            'USGS uses nonlinear optimisation over input-output tables to estimate the GDP impact of a one-year supply disruption per commodity. Modelled impacts in the 2025 list range from -$4.5 bn to +$33 M; inclusion threshold is annualised probability-weighted GDP loss > $2 M. The 2025 list adds 10 minerals to the 2022 list, including potash, silicon, copper, silver, rhenium, and lead — and notably keeps arsenic and tellurium that the methodology recommended removing. ' +
            'The top-10 by probability-weighted economic impact: samarium, rhodium, lutetium, terbium, dysprosium, gallium, germanium, gadolinium, tungsten, niobium. ' +
            'The 17 commodities under MOFCOM export controls or bans to the US are assigned 100% disruption probability in the model. That single calibration choice is the most consequential one in the framework.',
          confidence: 'HIGH',
          lastVerified: '2026-06-10',
          dependsOn: [],
          feedsInto: ['china-refining', 'copper-demand'],
          related: [],
          entities: ['usgs', 'mofcom'],
          tags: ['decarbonisation'],
          timeframe: 'this-decade',
          sources: [SOURCE_USGS_CM_2025],
        },
        {
          slug: 'eu-crma',
          title: 'EU CRMA: 34 critical materials, 17 strategic, 2030 benchmarks',
          bluf: 'The EU Critical Raw Materials Act (in force May 2024) lists 34 critical materials, 17 of them "strategic", and binds the EU to 2030 benchmarks: 10% extraction, 40% processing, 25% recycling, ≤65% from any single country.',
          body:
            "The CRMA is the most concrete industrial-policy response to China's refining dominance. The 2030 benchmarks are binding direction not law-quality requirements, but each missed benchmark is auditable. " +
            "The 65% single-country cap is implicitly an anti-China clause — almost every strategic material's refining is concentrated in China above this threshold. " +
            'EU strategic partnerships with the DRC and Zambia (2023) and the Lobito Corridor are the upstream half of this strategy; the downstream half (a real European refining and recycling industry) is the harder problem.',
          confidence: 'HIGH',
          lastVerified: '2026-06-10',
          dependsOn: ['usgs-2025'],
          feedsInto: ['china-refining'],
          related: [],
          entities: ['european-commission', 'drc', 'zambia'],
          tags: ['decarbonisation', 'alliances'],
          timeframe: 'this-decade',
          sources: [SOURCE_EU_CRMA],
        },
      ],
    },
    {
      slug: 'china-dominance',
      title: 'Where China actually holds the tap',
      number: 2,
      pages: [
        {
          slug: 'china-refining',
          title: 'China refines: ~85% of rare earths, ~60% of lithium, ~70% of cobalt processing',
          bluf: "China's structural lever over critical materials sits in refining, not mining. >85% of rare-earth refining, ~60% of lithium refining, ~70% of cobalt processing. The 2024-2025 MOFCOM controls operationalised this.",
          body:
            'MOFCOM Announcement 2024 No. 46 (3 December 2024) — issued one day after a fresh round of US semiconductor export controls — banned gallium, germanium, antimony, and superhard materials to the US and tightened graphite controls. ' +
            'Subsequent 2025-2026 rounds expanded controls to dysprosium, gadolinium, lutetium, samarium, terbium, yttrium, indium, molybdenum, tungsten, magnesium, tellurium, bismuth — for a total of 17 commodities under formal export controls or bans to the US. ' +
            'Western counter-strategy combines the US IRA (critical-mineral provisions), the EU CRMA, US-Australia bilateral financing ($1 bn each within six months under the October 2025 framework), and EU strategic partnerships. None of these undoes refining concentration on a 5-year horizon. They start to undo it on a 10-15 year horizon.',
          confidence: 'HIGH',
          lastVerified: '2026-06-10',
          dependsOn: ['usgs-2025', 'eu-crma'],
          feedsInto: ['copper-demand', 'rare-earths', 'gallium-controls'],
          related: ['liberation-day'],
          entities: ['china', 'mofcom', 'us-government', 'australia'],
          tags: ['decarbonisation', 'alliances', 'trumpism'],
          timeframe: 'now',
          sources: [SOURCE_USGS_CM_2025, SOURCE_MOFCOM_46],
        },
      ],
    },
    {
      slug: 'per-material',
      title: 'Per-material briefs',
      number: 3,
      pages: [
        {
          slug: 'copper-demand',
          title: 'Copper is the single most binding 2030 constraint',
          bluf: 'Wood Mackenzie base case: copper demand grows 24% to 42.7 Mtpa by 2035, requiring ~880 ktpa of new project capacity annually and US$210 bn in capex — with incentive prices above US$11,000/t.',
          body:
            'Copper is *the* electrification metal: grids, EVs, motors, data-centre power. There is no plausible energy transition without copper supply expansion. ' +
            'Wood Mackenzie projects demand growth of 24% to 42.7 Mtpa by 2035 in its base case, requiring ~880 ktpa of new project capacity *every year*. Current global new-project pipeline is well below this. Incentive prices to bring marginal projects online are above US$11,000/t — well above 2025 spot. ' +
            'Top producers: Chile (~24%), DRC + Peru + China (each ~10-11%). Top refiners: China (~40%). Substitution is limited (aluminium for some grid applications). Recycling helps but does not close the gap. ' +
            'Calibrated bet: copper is the materials constraint that bites first and hardest in the 2030s. Not rare earths.',
          confidence: 'HIGH',
          lastVerified: '2026-06-10',
          dependsOn: ['china-refining'],
          feedsInto: [],
          related: ['peak-oil-demand'],
          entities: ['chile', 'china', 'drc', 'wood-mackenzie'],
          tags: ['decarbonisation', 'energy-transition'],
          timeframe: 'this-decade',
          sources: [SOURCE_WOOD_MAC, SOURCE_IEA_CM_OUTLOOK],
        },
        {
          slug: 'rare-earths',
          title: 'Rare earths: a refining problem, not a geological one',
          bluf: 'China refines >85% of rare earths. Mountain Pass (USA) and Lynas (Australia / Malaysia) are growing. Heavy rare earths (dysprosium, terbium) are the tight subset.',
          body:
            'Rare earths are not geologically rare — they are *refining-rare*. China invested 30 years in building separation and refining capacity that the West did not match. The result: even US mines (Mountain Pass / MP Materials) historically shipped concentrate to China for refining. ' +
            'Western capacity is growing: MP Materials Mountain Pass refines a growing share domestically; Lynas processes in Malaysia and is building Texas. Light rare earths (neodymium, praseodymium) are expandable on a 5-7 year horizon outside China. ' +
            'Heavy rare earths (dysprosium, terbium, samarium) — needed for permanent magnets in EV motors and wind turbines — are the genuinely tight subset, and the ones China formalised controls on in 2025.',
          confidence: 'HIGH',
          lastVerified: '2026-06-10',
          dependsOn: ['china-refining'],
          feedsInto: [],
          related: ['copper-demand'],
          entities: ['china', 'mp-materials', 'lynas'],
          tags: ['decarbonisation', 'energy-transition'],
          timeframe: 'this-decade',
          sources: [SOURCE_USGS_CM_2025, SOURCE_IEA_CM_OUTLOOK],
        },
        {
          slug: 'gallium-controls',
          title: 'Gallium and germanium: the 2024 control that worked',
          bluf: 'China produces ~98% of global gallium and ~60% of germanium. The MOFCOM December 2024 ban on exports to the US is the single most-cited success of weaponised supply concentration.',
          body:
            'Gallium is irreplaceable in compound semiconductors (GaAs, GaN) used in radar, 5G, and high-end power electronics. Germanium goes into fibre optics, infrared optics, and PV. ' +
            'China produces an estimated 98% of global gallium and 60% of germanium. The MOFCOM 3 December 2024 ban on US exports has reduced direct flow to zero. Workarounds exist (re-export through third countries, recycling of GaAs scrap) but they raise costs and constrain supply scale. ' +
            'This is the worked example everyone in critical-minerals policy now references. The lesson: refining concentration plus an authoritarian state plus a real geopolitical dispute equals a real economic weapon.',
          confidence: 'HIGH',
          lastVerified: '2026-06-10',
          dependsOn: ['china-refining'],
          feedsInto: [],
          related: ['liberation-day'],
          entities: ['china', 'mofcom', 'us-government'],
          tags: ['decarbonisation', 'alliances', 'trumpism'],
          timeframe: 'now',
          sources: [SOURCE_USGS_CM_2025, SOURCE_MOFCOM_46],
        },
      ],
    },
  ],
};

export const GEOPOLITICS_CATEGORIES: Category[] = [
  {
    slug: 'hormuz-crisis',
    title: 'Hormuz Crisis',
    tier: 'now',
    blurb:
      "Iran, the US, Israel, and the Gulf — what they are doing to the world's most consequential strait.",
    programs: [HORMUZ_BRIEFING],
  },
  {
    slug: 'shipping-industry',
    title: 'Shipping Industry',
    tier: 'decade',
    blurb: 'Carriers, alliances, lanes, money flows. The system that moves 80% of world trade.',
    programs: [SHIPPING_BIG_NINE],
  },
  {
    slug: 'alliances-reshuffle',
    title: 'Alliances Reshuffle',
    tier: 'decade',
    blurb:
      'NATO under strain, BRICS+ expansion, Russia–Iran 20-year pact, Trumpism. The old order fraying and the new blocs forming.',
    programs: [ALLIANCES_RESHUFFLE_PROGRAM],
  },
  {
    slug: 'critical-materials',
    title: 'Critical Materials Atlas',
    tier: 'decade',
    blurb:
      'Copper, lithium, cobalt, coltan, rare earths, gallium, uranium. Who mines, who refines, who can shut the tap.',
    programs: [CRITICAL_MATERIALS_PROGRAM],
  },
  {
    slug: 'world-2050',
    title: 'The World in 2050',
    tier: 'horizon',
    blurb:
      'End of petroleum, AI, carbon turning points, demographics, the long arc. Calibrated bets and the data behind them.',
    programs: [WORLD_2050_PROGRAM],
  },
  {
    slug: 'middle-east',
    title: 'Middle East',
    tier: 'now',
    blurb:
      'Post-Khamenei Iran, post-Assad Syria, post-Gaza Israel, post-oil Gulf. New alliances, current conflicts, country-by-country.',
    programs: [
      {
        slug: 'middle-east-program',
        title: 'The Middle East to 2035',
        blurb: 'Cited research landing — placeholder while the workflow runs.',
        durationMinutes: 75,
        chapters: [],
      },
    ],
  },
  {
    slug: 'africa',
    title: 'Africa to 2050',
    tier: 'horizon',
    blurb:
      'Demographic dividend, resource nationalism, climate exposure, the new scramble. One billion more people by 2050, half the answers still open.',
    programs: [
      {
        slug: 'africa-program',
        title: 'Africa to 2050',
        blurb: 'Cited research landing — placeholder while the workflow runs.',
        durationMinutes: 75,
        chapters: [],
      },
    ],
  },
];

export function categoriesByTier(tier: Tier): Category[] {
  return GEOPOLITICS_CATEGORIES.filter((c) => c.tier === tier);
}

export function findPage(slug: string): Page | null {
  for (const category of GEOPOLITICS_CATEGORIES) {
    for (const program of category.programs) {
      for (const chapter of program.chapters) {
        for (const page of chapter.pages) {
          if (page.slug === slug) return page;
        }
      }
    }
  }
  return null;
}

export function locatePage(slug: string) {
  for (const category of GEOPOLITICS_CATEGORIES) {
    for (const program of category.programs) {
      for (const chapter of program.chapters) {
        const idx = chapter.pages.findIndex((page) => page.slug === slug);
        if (idx >= 0) {
          return {
            category,
            program,
            chapter,
            page: chapter.pages[idx],
            pageIndex: idx,
            prev: chapter.pages[idx - 1] ?? null,
            next: chapter.pages[idx + 1] ?? null,
            totalInChapter: chapter.pages.length,
          };
        }
      }
    }
  }
  return null;
}

export function firstPageOf(programSlug: string): Page | null {
  for (const category of GEOPOLITICS_CATEGORIES) {
    for (const program of category.programs) {
      if (program.slug === programSlug) {
        return program.chapters[0]?.pages[0] ?? null;
      }
    }
  }
  return null;
}
