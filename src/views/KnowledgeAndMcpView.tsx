import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Copy, Check, Terminal, Database, BookOpen, FlaskConical } from 'lucide-react';
import {
  Language,
  NavTabId,
  formatNumber,
} from '../theme/tokens';
import { HyperliquidState } from '../theme/hyperliquid';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import {
  MotionStaggerContainer,
  MotionStaggerItem,
  MotionStaggerGrid,
  staggerTableBodyVariants,
  staggerTableRowVariants,
  EASE_OUT_EXPO,
} from '../components/MotionPrimitives';

export interface KnowledgeAndMcpViewProps {
  activeSection: Extract<NavTabId, 'lessons' | 'research' | 'sources' | 'mcp'>;
  lang: Language;
  hlState: HyperliquidState;
  onNavigate: (tab: NavTabId) => void;
}

export const KnowledgeAndMcpView: React.FC<KnowledgeAndMcpViewProps> = ({
  activeSection,
  lang,
  hlState,
}) => {
  const [copiedMcp, setCopiedMcp] = useState(false);
  const [expandedLesson, setExpandedLesson] = useState<string | null>('01.');
  const [expandedPaper, setExpandedPaper] = useState<string | null>(null);
  const [selectedMcpTool, setSelectedMcpTool] = useState<'get_session_briefing' | 'get_liquidity_fuel' | 'get_forecast_ledger'>('get_session_briefing');
  const prefersReduced = useReducedMotion();

  const mcpConfigJson = `{
  "mcpServers": {
    "hyperquant-desk": {
      "command": "npx",
      "args": ["-y", "@hyperquant/mcp-server", "--endpoint", "https://api.hyperliquid.xyz/info"]
    }
  }
}`;

  const handleCopy = () => {
    navigator.clipboard?.writeText(mcpConfigJson);
    setCopiedMcp(true);
    setTimeout(() => setCopiedMcp(false), 1800);
  };

  if (activeSection === 'lessons') {
    const lessons = [
      {
        num: '01.',
        title: {
          pl: 'Teoria Aukcji Rynkowej (AMT) na kontraktach wieczystych L1',
          en: 'Auction Market Theory (AMT) on L1 Perpetual Contracts',
        },
        duration: '12 min',
        summary: {
          pl: 'Jak wyznaczać obszar wartości (VAH, POC, VAL) na rynku działającym 24/7 i dlaczego otwarcia Londynu (09:00 CET) oraz Nowego Jorku (15:30 CET) definiują Initial Balance.',
          en: 'How to anchor Value Area (VAH, POC, VAL) on a 24/7 perpetual venue and why London (09:00 CET) and New York (15:30 CET) equity opens define Initial Balance.',
        },
      },
      {
        num: '02.',
        title: {
          pl: 'Czytanie paliwa likwidacyjnego i absorpcji w arkuszu L2',
          en: 'Reading Liquidation Fuel & Passive Absorption in the L2 Book',
        },
        duration: '15 min',
        summary: {
          pl: 'Rozróżnianie pasywnej płynności limit (spoofing vs realny popyt/podaż) od wymuszonych likwidacji depozytów w korytarzu ±1% od ceny mid.',
          en: 'Distinguishing resting limit liquidity from forced margin liquidations within the ±1% corridor around mid price.',
        },
      },
      {
        num: '03.',
        title: {
          pl: 'Rygor probabilistyczny: Wynik Briera zamiast „sygnałów”',
          en: 'Probabilistic Rigor: Brier Score Calibration Instead of "Signals"',
        },
        duration: '10 min',
        summary: {
          pl: 'Dlaczego przewidywanie kierunku ceny prowadzi do przeceniania pewności i jak formułować mierzalne hipotezy strukturalne (zasięg, RVOL, rotacja).',
          en: 'Why directional price predictions fail empirical audit and how to formulate verifiable structural hypotheses (range expansion, RVOL, rotation).',
        },
      },
    ];

    return (
      <MotionStaggerContainer className="space-y-6 max-w-7xl mx-auto">
        <MotionStaggerItem className="pb-4 border-b border-slate-200 dark:border-slate-800 flex items-end justify-between">
          <div>
            <p className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
              MODUŁ EDUKACYJNY / CURRICULUM
            </p>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {lang === 'pl'
                ? 'Lekcje — Mikrostruktura rynku i teoria aukcji'
                : 'Lessons — Market Microstructure & Auction Theory'}
            </h1>
          </div>
          <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
        </MotionStaggerItem>

        <MotionStaggerGrid className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {lessons.map((l) => {
            const isOpen = expandedLesson === l.num;
            return (
              <Card
                key={l.num}
                inheritStagger
                kicker={`${l.num} · ${l.duration}`}
                title={l.title[lang]}
                provenance={{ type: 'MODEL', timestamp: hlState.lastUpdated }}
                lang={lang}
                tilt3d
                onClick={() => setExpandedLesson(isOpen ? null : l.num)}
                className="h-full"
              >
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {l.summary[lang]}
                  </p>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 pt-3 border-t border-dashed border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          {lang === 'pl'
                            ? 'Moduł zawiera interaktywne przykłady L2 i skrypty weryfikacyjne w Python/TypeScript.'
                            : 'Includes interactive L2 replay notebooks and verifiable Python/TypeScript scripts.'}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-400">
                    <span className="inline-flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'pl' ? 'Dostępne w repozytorium MIT' : 'MIT open-source repo'}
                      </span>
                    </span>
                    <span className="font-mono text-[10px]">
                      {isOpen
                        ? lang === 'pl'
                          ? 'Zwiń'
                          : 'Collapse'
                        : lang === 'pl'
                        ? 'Konspekt'
                        : 'Syllabus'}
                    </span>
                  </div>
                </Card>
            );
          })}
        </MotionStaggerGrid>
      </MotionStaggerContainer>
    );
  }

  if (activeSection === 'research') {
    return (
      <MotionStaggerContainer className="space-y-6 max-w-7xl mx-auto">
        <MotionStaggerItem className="pb-4 border-b border-slate-200 dark:border-slate-800 flex items-end justify-between">
          <div>
            <p className="text-xs font-mono text-violet-700 dark:text-violet-400">
              BADANIA ILOŚCIOWE / QUANTITATIVE RESEARCH
            </p>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {lang === 'pl'
                ? 'Badania — Empiryczne studia nad mikrostrukturą Hyperliquid'
                : 'Research — Empirical Studies on Hyperliquid Microstructure'}
            </h1>
          </div>
          <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
        </MotionStaggerItem>

        <MotionStaggerGrid className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            inheritStagger
            kicker="Paper HQ-R01 · N = 365 sesji"
            title={
              lang === 'pl'
                ? 'Rozkład szerokości Initial Balance na BTC-PERP podczas otwarcia Londynu (09:00 CET) i Nowego Jorku (15:30 CET)'
                : 'Initial Balance Width Distribution on BTC-PERP Across London (09:00 CET) & New York (15:30 CET) Opens'
            }
            provenance={{ type: 'MODEL', timestamp: hlState.lastUpdated }}
            lang={lang}
            tilt3d
            onClick={() => setExpandedPaper(expandedPaper === 'R01' ? null : 'R01')}
            className="h-full"
          >
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {lang === 'pl'
                ? 'Analiza 365 kolejnych sesji wykazuje, że pierwsza godzina po otwarciu rynku kasowego w USA (15:30–16:30 CET) odpowiada za średnio 41,8% dziennego rozstępu High–Low na BTC-PERP.'
                : 'Analysis across 365 consecutive sessions demonstrates that the first 60 minutes following the US cash equity open (15:30–16:30 CET) establishes 41.8% of the daily High–Low range on BTC-PERP.'}
            </p>
            <div className="grid grid-cols-3 gap-3 p-3 rounded bg-slate-50 dark:bg-[#141B29] font-mono text-xs tabular-nums">
              <div>
                <span className="block text-[10px] font-sans text-slate-400">
                  Mediana IB (NY)
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatNumber(0.86, lang, { decimals: 2, suffix: '%' })}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-sans text-slate-400">
                  P(Powrót do dPOC)
                </span>
                <span className="font-semibold text-cyan-700 dark:text-cyan-400">
                  {formatNumber(64.2, lang, { decimals: 1, suffix: '%' })}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-sans text-slate-400">
                  Próba badawcza
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  365 dni
                </span>
              </div>
            </div>
            <AnimatePresence initial={false}>
              {expandedPaper === 'R01' && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                  className="overflow-hidden mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400"
                >
                  Dataset: hyperquant_btc_ib_2025_2026.parquet · 1m OHLCV + L2 snapshots
                </motion.p>
              )}
            </AnimatePresence>
          </Card>

          <Card
            inheritStagger
            kicker="Paper HQ-R02 · HIP-3 Cross-Margin"
            title={
              lang === 'pl'
                ? 'Wpływ odchylenia funding rate na asymetrię pasywnej płynności L2'
                : 'Impact of Funding Rate Skew on Passive L2 Orderbook Asymmetry'
            }
            provenance={{ type: 'MODEL', timestamp: hlState.lastUpdated }}
            lang={lang}
            tilt3d
            onClick={() => setExpandedPaper(expandedPaper === 'R02' ? null : 'R02')}
            className="h-full"
          >
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
              {lang === 'pl'
                ? 'Przy zannualizowanym fundingu powyżej +25% gęstość spoczywających zleceń BID w korytarzu −0,5% spada średnio o 18%, zwiększając podatność na szybkie czyszczenie płynności.'
                : 'When annualized funding exceeds +25%, resting BID liquidity density within the −0.5% corridor contracts by an average of 18%, increasing thin-book sweep velocity.'}
            </p>
            <div className="flex items-center gap-2 text-xs text-violet-700 dark:text-violet-400 font-medium">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Jupyter Notebooks + Parquet Datasets (CC-BY-4.0)</span>
            </div>
            <AnimatePresence initial={false}>
              {expandedPaper === 'R02' && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                  className="overflow-hidden mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-500 dark:text-slate-400"
                >
                  Dataset: hyperquant_l2_funding_skew.parquet · Spearman ρ = −0.41
                </motion.p>
              )}
            </AnimatePresence>
          </Card>
        </MotionStaggerGrid>
      </MotionStaggerContainer>
    );
  }

  if (activeSection === 'sources') {
    return (
      <MotionStaggerContainer className="space-y-6 max-w-7xl mx-auto">
        <MotionStaggerItem className="pb-4 border-b border-slate-200 dark:border-slate-800 flex items-end justify-between">
          <div>
            <p className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
              DATA LINEAGE &amp; PROVENANCE
            </p>
            <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {lang === 'pl'
                ? 'Źródła — Pochodzenie danych i rygor znaczników LIVE / MODEL / SIM'
                : 'Sources — Data Lineage & LIVE / MODEL / SIM Provenance Specification'}
            </h1>
          </div>
          <Badge
            type={hlState.isLiveConnected ? 'LIVE' : 'SIM'}
            timestamp={hlState.lastUpdated}
            lang={lang}
          />
        </MotionStaggerItem>

        <MotionStaggerItem>
        <Card
          title={
            lang === 'pl'
              ? 'Macierz pochodzenia strumieni danych'
              : 'Telemetry Provenance & Lineage Matrix'
          }
          provenance={{
            type: hlState.isLiveConnected ? 'LIVE' : 'SIM',
            timestamp: hlState.lastUpdated,
          }}
          lang={lang}
        >
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-md">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500">
                  <th className="py-2.5 px-4 font-medium">Metryka / Strumień</th>
                  <th className="py-2.5 px-4 font-medium">Endpoint / Algorytm</th>
                  <th className="py-2.5 px-4 font-medium">Częstotliwość</th>
                  <th className="py-2.5 px-4 font-medium text-right">Znacznik</th>
                </tr>
              </thead>
              <motion.tbody
                variants={prefersReduced ? undefined : staggerTableBodyVariants}
                initial={prefersReduced ? false : 'hidden'}
                animate="visible"
                className="divide-y divide-slate-100 dark:divide-slate-800/70 font-mono"
              >
                <motion.tr
                  variants={prefersReduced ? undefined : staggerTableRowVariants}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-4 font-sans font-medium">
                    Cena Mid (BTC, ETH, SOL, HYPE)
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                    POST https://api.hyperliquid.xyz/info {`{"type":"allMids"}`}
                  </td>
                  <td className="py-2.5 px-4">Co 10 s (limit)</td>
                  <td className="py-2.5 px-4 text-right">
                    <Badge type="LIVE" timestamp={hlState.lastUpdated} lang={lang} />
                  </td>
                </motion.tr>
                <motion.tr
                  variants={prefersReduced ? undefined : staggerTableRowVariants}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-4 font-sans font-medium">
                    Open Interest, Wolumen 24h, Funding, Oracle Basis
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                    POST https://api.hyperliquid.xyz/info {`{"type":"metaAndAssetCtxs"}`}
                  </td>
                  <td className="py-2.5 px-4">Co 10 s (limit)</td>
                  <td className="py-2.5 px-4 text-right">
                    <Badge type="LIVE" timestamp={hlState.lastUpdated} lang={lang} />
                  </td>
                </motion.tr>
                <motion.tr
                  variants={prefersReduced ? undefined : staggerTableRowVariants}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-4 font-sans font-medium">
                    dVAH / dPOC / dVAL, Initial Balance, RVOL, Paliwo ±1%
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                    Silnik mikrostruktury HyperQuant (agregacja L2 i ticków)
                  </td>
                  <td className="py-2.5 px-4">Co blok / 1 min</td>
                  <td className="py-2.5 px-4 text-right">
                    <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
                  </td>
                </motion.tr>
                <motion.tr
                  variants={prefersReduced ? undefined : staggerTableRowVariants}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-2.5 px-4 font-sans font-medium">
                    Rynki w fazie pre-launch HIP-3 (NVDA, SPX, XAU, WTI)
                  </td>
                  <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                    Rejestr referencyjny HIP-3 / symulacja lub „—” dla brakujących wyroczni
                  </td>
                  <td className="py-2.5 px-4">Statyczny rejestr</td>
                  <td className="py-2.5 px-4 text-right">
                    <Badge type="SIM" timestamp={hlState.lastUpdated} lang={lang} />
                  </td>
                </motion.tr>
              </motion.tbody>
            </table>
          </div>
        </Card>
        </MotionStaggerItem>
      </MotionStaggerContainer>
    );
  }

  // Default: MCP Server for Claude & ChatGPT ('mcp')
  return (
    <MotionStaggerContainer className="space-y-6 max-w-7xl mx-auto">
      <MotionStaggerItem className="pb-4 border-b border-slate-200 dark:border-slate-800 flex items-end justify-between">
        <div>
          <p className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
            MODEL CONTEXT PROTOCOL (MCP) SERVER
          </p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            {lang === 'pl'
              ? 'Agenci AI — Serwer MCP dla Claude Desktop i ChatGPT'
              : 'AI Agents — HyperQuant MCP Server for Claude & ChatGPT'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'pl'
              ? 'Udostępnij swojemu agentowi AI deterministyczny kontekst sesji, poziomy VAH/POC/VAL i dane z Hyperliquid bez halucynacji.'
              : 'Provide your AI assistant with deterministic Hyperliquid session telemetry, VAH/POC/VAL nodes, and calibration data.'}
          </p>
        </div>
        <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
      </MotionStaggerItem>

      <MotionStaggerGrid className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card
          inheritStagger
          className="lg:col-span-6 h-full"
          kicker="Konfiguracja JSON"
          title={
            lang === 'pl'
              ? '1. Dodaj serwer HyperQuant MCP do Claude / Cursor / ChatGPT'
              : '1. Add HyperQuant MCP Server to Claude / Cursor / ChatGPT'
          }
          headerRight={
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono bg-slate-100 dark:bg-[#141B29] border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              {copiedMcp ? (
                <>
                  <Check className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{lang === 'pl' ? 'Skopiowano' : 'Copied'}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{lang === 'pl' ? 'Kopiuj JSON' : 'Copy JSON'}</span>
                </>
              )}
            </button>
          }
        >
          <pre className="p-4 rounded-md bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800">
            <code>{mcpConfigJson}</code>
          </pre>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
            {lang === 'pl'
              ? 'Wszystkie odpowiedzi serwera MCP zawierają pole provenance (LIVE / MODEL / SIM) oraz wymuszają politykę braku rekomendacji inwestycyjnych.'
              : 'Every MCP tool payload includes explicit provenance (LIVE / MODEL / SIM) and enforces the non-predictive market description policy.'}
          </p>
        </Card>

        <Card
          inheritStagger
          className="lg:col-span-6 h-full"
          kicker="Inspektor narzędzi MCP"
          title={
            lang === 'pl'
              ? '2. Przetestuj odpowiedź narzędzia MCP na żywo'
              : '2. Inspect Live MCP Tool Payload'
          }
          provenance={{ type: 'LIVE', timestamp: hlState.lastUpdated }}
          lang={lang}
        >
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(
                [
                  'get_session_briefing',
                  'get_liquidity_fuel',
                  'get_forecast_ledger',
                ] as const
              ).map((toolName) => (
                <button
                  key={toolName}
                  type="button"
                  onClick={() => setSelectedMcpTool(toolName)}
                  className={`px-2.5 py-1 rounded font-mono text-xs cursor-pointer border ${
                    selectedMcpTool === toolName
                      ? 'bg-cyan-500/15 border-cyan-500/50 text-cyan-800 dark:text-cyan-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  {toolName}()
                </button>
              ))}
            </div>

            <pre className="p-4 rounded-md bg-slate-950 text-cyan-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
              <code>
                {selectedMcpTool === 'get_session_briefing'
                  ? JSON.stringify(
                      {
                        tool: 'get_session_briefing',
                        market: 'BTC-PERP',
                        midPrice: hlState.assets['BTC']?.midPrice ?? 75791,
                        provenance: hlState.assets['BTC']?.provenance.type ?? 'SIM',
                        timestampCet: hlState.lastUpdated,
                        fourNumbers: {
                          yesterdayClarityScore: 78,
                          liqFuelMinus1PctUsd: 22600000,
                          liqFuelPlus1PctUsd: 19400000,
                          typicalNextHourWidthPct: 0.68,
                          vwapDistancePct: 0.34,
                        },
                        policy: 'Market description, not investment advice.',
                      },
                      null,
                      2
                    )
                  : selectedMcpTool === 'get_liquidity_fuel'
                  ? JSON.stringify(
                      {
                        tool: 'get_liquidity_fuel',
                        market: 'BTC-PERP',
                        corridorPct: 1.0,
                        bidRestingAndLiqUsd: 22600000,
                        askRestingAndLiqUsd: 19400000,
                        provenance: 'MODEL',
                        timestampCet: hlState.lastUpdated,
                      },
                      null,
                      2
                    )
                  : JSON.stringify(
                      {
                        tool: 'get_forecast_ledger',
                        windowDays: 90,
                        sampleSize: 184,
                        brierScore: 0.142,
                        expectedCalibrationErrorPct: 1.8,
                        provenance: 'MODEL',
                        timestampCet: hlState.lastUpdated,
                      },
                      null,
                      2
                    )}
              </code>
            </pre>
          </div>
        </Card>
      </MotionStaggerGrid>
    </MotionStaggerContainer>
  );
};
