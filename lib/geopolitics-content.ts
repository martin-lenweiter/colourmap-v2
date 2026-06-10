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
    programs: [
      {
        slug: 'alliances-reshuffle-program',
        title: 'How the alliance map is changing',
        blurb: 'Cited research landing — placeholder while the workflow runs.',
        durationMinutes: 30,
        chapters: [],
      },
    ],
  },
  {
    slug: 'critical-materials',
    title: 'Critical Materials Atlas',
    tier: 'decade',
    blurb:
      'Copper, lithium, cobalt, coltan, rare earths, gallium, uranium. Who mines, who refines, who can shut the tap.',
    programs: [
      {
        slug: 'critical-materials-atlas',
        title: 'Critical materials, per-material',
        blurb: 'Cited research landing — placeholder while the workflow runs.',
        durationMinutes: 45,
        chapters: [],
      },
    ],
  },
  {
    slug: 'world-2050',
    title: 'The World in 2050',
    tier: 'horizon',
    blurb:
      'End of petroleum, AI, carbon turning points, demographics, the long arc. Calibrated bets and the data behind them.',
    programs: [
      {
        slug: 'world-2050-program',
        title: 'The World in 2050',
        blurb: 'Cited research landing — placeholder while the workflow runs.',
        durationMinutes: 60,
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
