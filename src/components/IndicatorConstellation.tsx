import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import {
  Language,
  MarketSymbol,
  NavTabId,
  formatNumber,
} from '../theme/tokens';
import { Badge } from './Badge';
import {
  SpotlightCard,
  SPRING_SNAPPY,
  staggerCardGridVariants,
  staggerCardVariants,
} from './MotionPrimitives';

export interface IndicatorConstellationProps {
  lang: Language;
  market: MarketSymbol;
  timestamp: string;
  onNavigate: (tab: NavTabId) => void;
}

type CategoryFilter = 'all' | 'pre' | 'in' | 'post' | 'infra';

interface IndicatorDef {
  id: string;
  category: Exclude<CategoryFilter, 'all'>;
  targetTab: NavTabId;
  provenance: 'LIVE' | 'MODEL' | 'SIM';
  accent: 'cyan' | 'indigo' | 'amber';
  name: { pl: string; en: string };
  metricLabel: { pl: string; en: string };
  description: { pl: string; en: string };
  renderMiniChart: (reduced: boolean) => React.ReactNode;
}

export const IndicatorConstellation: React.FC<IndicatorConstellationProps> = ({
  lang,
  market,
  timestamp,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<CategoryFilter>('all');
  const prefersReduced = useReducedMotion() ?? false;

  const indicators: IndicatorDef[] = [
    {
      id: 'four-numbers',
      category: 'pre',
      targetTab: 'pre-session',
      provenance: 'MODEL',
      accent: 'cyan',
      name: {
        pl: 'Cztery Liczby (Pre-Session)',
        en: 'The Four Numbers (Pre-Session)',
      },
      metricLabel: {
        pl: `Klarowność ${formatNumber(0.74, lang, { decimals: 2 })} · 1h ±${formatNumber(0.62, lang, { decimals: 2 })}%`,
        en: `Clarity ${formatNumber(0.74, lang, { decimals: 2 })} · 1h ±${formatNumber(0.62, lang, { decimals: 2 })}%`,
      },
      description: {
        pl: 'Klarowność wczorajszej sesji, typowy zasięg kolejnej godziny oraz dystans ceny od dziennego VWAP przed otwarciem.',
        en: 'Yesterday’s auction clarity, median next-hour range width, and pre-open distance from daily VWAP.',
      },
      renderMiniChart: (reduced) => (
        <svg viewBox="0 0 180 48" className="w-full h-12 overflow-visible" aria-hidden="true">
          {[14, 24, 34].map((y) => (
            <line key={y} x1="6" y1={y} x2="174" y2={y} stroke="#334155" strokeOpacity="0.35" strokeDasharray="2 3" />
          ))}
          {[
            { x: 18, y: 12, h: 24, active: false },
            { x: 46, y: 8, h: 32, active: false },
            { x: 74, y: 16, h: 18, active: true },
            { x: 102, y: 10, h: 28, active: false },
            { x: 130, y: 14, h: 20, active: false },
            { x: 158, y: 11, h: 26, active: true },
          ].map((b, idx) => (
            <motion.rect
              key={idx}
              x={b.x}
              y={b.y}
              width="12"
              height={b.h}
              rx="2"
              fill={b.active ? '#22D3EE' : '#818CF8'}
              fillOpacity={b.active ? 0.85 : 0.35}
              animate={reduced ? undefined : { scaleY: [0.88, 1.06, 0.88] }}
              transition={{ duration: 2.8 + idx * 0.3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: `${b.x + 6}px 24px` }}
            />
          ))}
        </svg>
      ),
    },
    {
      id: 'liq-fuel',
      category: 'pre',
      targetTab: 'pre-session',
      provenance: 'MODEL',
      accent: 'indigo',
      name: {
        pl: 'Paliwo Likwidacyjne ±1%',
        en: 'Liquidation Fuel Within ±1%',
      },
      metricLabel: {
        pl: `−1%: ${formatNumber(22_600_000, lang, { compact: true, prefix: '$' })} · +1%: ${formatNumber(19_400_000, lang, { compact: true, prefix: '$' })}`,
        en: `−1%: ${formatNumber(22_600_000, lang, { compact: true, prefix: '$' })} · +1%: ${formatNumber(19_400_000, lang, { compact: true, prefix: '$' })}`,
      },
      description: {
        pl: 'Symetryczna mapa pozycji zagrożonych likwidacją w pasmie ±1% powyżej i poniżej aktualnej ceny Mid.',
        en: 'Symmetric concentration of leveraged positions within ±1% above and below current Mid price.',
      },
      renderMiniChart: (reduced) => (
        <svg viewBox="0 0 180 48" className="w-full h-12 overflow-visible" aria-hidden="true">
          <line x1="90" y1="4" x2="90" y2="44" stroke="#FBBF24" strokeDasharray="2 2" strokeWidth="1" />
          {[0, 1, 2, 3].map((row) => {
            const y = 7 + row * 10;
            const leftW = [58, 44, 68, 34][row];
            const rightW = [42, 62, 48, 54][row];
            return (
              <g key={row}>
                <motion.rect
                  x={88 - leftW}
                  y={y}
                  width={leftW}
                  height="6.5"
                  rx="1.5"
                  fill="#22D3EE"
                  fillOpacity="0.78"
                  animate={reduced ? undefined : { scaleX: [0.85, 1, 0.85] }}
                  transition={{ duration: 2.4 + row * 0.35, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ transformOrigin: '88px' }}
                />
                <motion.rect
                  x="92"
                  y={y}
                  width={rightW}
                  height="6.5"
                  rx="1.5"
                  fill="#818CF8"
                  fillOpacity="0.78"
                  animate={reduced ? undefined : { scaleX: [0.9, 1.05, 0.9] }}
                  transition={{ duration: 2.6 + row * 0.3, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ transformOrigin: '92px' }}
                />
              </g>
            );
          })}
        </svg>
      ),
    },
    {
      id: 'vwap-bands',
      category: 'in',
      targetTab: 'in-session',
      provenance: 'MODEL',
      accent: 'cyan',
      name: {
        pl: 'VWAP i Pasma Odchyleń (±1σ / ±2σ)',
        en: 'Session VWAP & ±1σ / ±2σ Deviation Bands',
      },
      metricLabel: {
        pl: `Dystans ${formatNumber(0.78, lang, { decimals: 2, sign: true })}σ (${formatNumber(0.34, lang, { decimals: 2, sign: true, suffix: '%' })})`,
        en: `Offset ${formatNumber(0.78, lang, { decimals: 2, sign: true })}σ (${formatNumber(0.34, lang, { decimals: 2, sign: true, suffix: '%' })})`,
      },
      description: {
        pl: 'Średnia ważona wolumenem wraz z odchyleniami standardowymi do oceny rozciągnięcia lub równowagi ceny.',
        en: 'Volume-weighted average price with ±1σ/2σ envelopes quantifying balance versus intraday extension.',
      },
      renderMiniChart: (reduced) => (
        <svg viewBox="0 0 180 48" className="w-full h-12 overflow-visible" aria-hidden="true">
          <path d="M 8 36 Q 86 24, 172 14" fill="none" stroke="#818CF8" strokeOpacity="0.45" strokeDasharray="3 3" strokeWidth="1" />
          <path d="M 8 44 Q 86 34, 172 26" fill="none" stroke="#818CF8" strokeOpacity="0.45" strokeDasharray="3 3" strokeWidth="1" />
          <path d="M 8 40 Q 86 29, 172 20" fill="none" stroke="#22D3EE" strokeWidth="1.6" />
          <motion.path
            d="M 8 38 L 36 33 L 64 36 L 92 24 L 122 28 L 148 16 L 172 12"
            fill="none"
            stroke="#FBBF24"
            strokeWidth="1.6"
            strokeLinecap="round"
            initial={reduced ? false : { pathLength: 0.3 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />
        </svg>
      ),
    },
    {
      id: 'ib-budget',
      category: 'in',
      targetTab: 'in-session',
      provenance: 'MODEL',
      accent: 'amber',
      name: {
        pl: 'Initial Balance (IBH/IBL) i Budżet Zasięgu',
        en: 'Initial Balance (IBH/IBL) & Daily Range Budget',
      },
      metricLabel: {
        pl: `IB ${formatNumber(0.86, lang, { decimals: 2, suffix: '%' })} · ATR ${formatNumber(64, lang, { suffix: '%' })}`,
        en: `IB ${formatNumber(0.86, lang, { decimals: 2, suffix: '%' })} · ATR ${formatNumber(64, lang, { suffix: '%' })}`,
      },
      description: {
        pl: 'Zakres pierwszej godziny sesji oraz procentowe zużycie typowego dziennego ATR dla oceny potencjału ekspansji.',
        en: 'First-hour opening range paired with realized percentage of 20-day daily ATR.',
      },
      renderMiniChart: (reduced) => (
        <svg viewBox="0 0 180 48" className="w-full h-12 overflow-visible" aria-hidden="true">
          <rect x="8" y="13" width="114" height="22" rx="3" fill="#818CF8" fillOpacity="0.14" stroke="#818CF8" strokeOpacity="0.45" strokeDasharray="3 2" />
          <circle cx="152" cy="24" r="16" fill="none" stroke="#334155" strokeOpacity="0.35" strokeWidth="4" />
          <motion.circle
            cx="152"
            cy="24"
            r="16"
            fill="none"
            stroke="#FBBF24"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray="100.5"
            initial={reduced ? { strokeDashoffset: 36 } : { strokeDashoffset: 80 }}
            animate={{ strokeDashoffset: 36 }}
            transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            transform="rotate(-90 152 24)"
          />
          <text x="152" y="27" textAnchor="middle" className="fill-slate-700 dark:fill-slate-200 font-mono text-[8.5px] font-semibold">
            64%
          </text>
        </svg>
      ),
    },
    {
      id: 'rvol-cvd',
      category: 'in',
      targetTab: 'in-session',
      provenance: 'MODEL',
      accent: 'cyan',
      name: {
        pl: 'RVOL i Footprint (Bid × Ask + CVD)',
        en: 'Relative Volume (RVOL) & Bid × Ask Footprint',
      },
      metricLabel: {
        pl: `RVOL ${formatNumber(1.28, lang, { decimals: 2 })}× · CVD +${formatNumber(14_200_000, lang, { compact: true, prefix: '$' })}`,
        en: `RVOL ${formatNumber(1.28, lang, { decimals: 2 })}× · CVD +${formatNumber(14_200_000, lang, { compact: true, prefix: '$' })}`,
      },
      description: {
        pl: 'Relatywny wolumen względem mediany pory dnia oraz klastry nierównowagi wolumenowej (próg 300%).',
        en: 'Time-of-day relative volume paired with Bid × Ask cluster cells and 300% diagonal imbalances.',
      },
      renderMiniChart: (reduced) => (
        <svg viewBox="0 0 180 48" className="w-full h-12 overflow-visible" aria-hidden="true">
          <line x1="6" y1="22" x2="174" y2="22" stroke="#94A3B8" strokeOpacity="0.4" strokeDasharray="2 3" />
          {[14, 22, 18, 30, 38, 28, 34, 42, 26, 32, 36].map((h, i) => (
            <motion.rect
              key={i}
              x={10 + i * 15}
              y={44 - h}
              width="9"
              height={h}
              rx="1.5"
              fill={h >= 30 ? '#22D3EE' : '#818CF8'}
              fillOpacity={h >= 30 ? 0.85 : 0.45}
              animate={reduced ? undefined : { scaleY: [0.85, 1.05, 0.85] }}
              transition={{ duration: 2.2 + (i % 4) * 0.3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: `${14.5 + i * 15}px 44px` }}
            />
          ))}
        </svg>
      ),
    },
    {
      id: 'day-map-va',
      category: 'pre',
      targetTab: 'pre-session',
      provenance: 'SIM',
      accent: 'amber',
      name: {
        pl: 'Mapa Dnia AMT (VAH / POC / VAL)',
        en: 'AMT Day Map (VAH / POC / VAL)',
      },
      metricLabel: {
        pl: 'Struktura akceptacji i węzły HVN/LVN',
        en: 'Value acceptance & HVN / LVN nodes',
      },
      description: {
        pl: 'Interaktywne poziomy akceptacji z poprzedniej sesji zsynchronizowane z profilem wolumenu oraz komentarzem redakcyjnym.',
        en: 'Interactive previous-session Value Area thresholds synchronized with the volume distribution curve.',
      },
      renderMiniChart: (reduced) => (
        <svg viewBox="0 0 180 48" className="w-full h-12 overflow-visible" aria-hidden="true">
          {[32, 54, 96, 148, 120, 68, 36].map((w, idx) => (
            <motion.rect
              key={idx}
              x="12"
              y={5 + idx * 5.8}
              width={w}
              height="4"
              rx="1"
              fill={idx === 3 ? '#FBBF24' : idx >= 2 && idx <= 4 ? '#22D3EE' : '#818CF8'}
              fillOpacity={idx === 3 ? 0.95 : 0.5}
              animate={reduced ? undefined : { scaleX: [0.92, 1, 0.92] }}
              transition={{ duration: 2.6 + idx * 0.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '12px' }}
            />
          ))}
        </svg>
      ),
    },
    {
      id: 'brier-ledger',
      category: 'post',
      targetTab: 'post-session',
      provenance: 'MODEL',
      accent: 'cyan',
      name: {
        pl: 'Rejestr Prognoz i Krzywa Kalibracji',
        en: 'Forecast Ledger & Calibration Curve',
      },
      metricLabel: {
        pl: `Brier ${formatNumber(0.142, lang, { decimals: 3 })} · n = 184`,
        en: `Brier ${formatNumber(0.142, lang, { decimals: 3 })} · n = 184`,
      },
      description: {
        pl: 'Po sesji weryfikujesz trafność probabilistyczną opublikowanych hipotez w porównaniu z realizacją rynkową.',
        en: 'Post-session audit comparing published probabilistic range estimates against realized auction outcomes.',
      },
      renderMiniChart: (reduced) => (
        <svg viewBox="0 0 180 48" className="w-full h-12 overflow-visible" aria-hidden="true">
          <line x1="16" y1="42" x2="164" y2="8" stroke="#64748B" strokeOpacity="0.45" strokeDasharray="3 3" />
          <motion.path
            d="M 16 41 L 46 35 L 78 27 L 108 21 L 136 14 L 164 9"
            fill="none"
            stroke="#22D3EE"
            strokeWidth="2"
            initial={reduced ? false : { pathLength: 0.2 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />
          {[
            [46, 35],
            [78, 27],
            [108, 21],
            [136, 14],
          ].map(([cx, cy], idx) => (
            <circle key={idx} cx={cx} cy={cy} r="2.8" fill="#FBBF24" />
          ))}
        </svg>
      ),
    },
    {
      id: 'markets-mcp',
      category: 'infra',
      targetTab: 'mcp',
      provenance: 'LIVE',
      accent: 'indigo',
      name: {
        pl: `Rynki L1 / HIP-3 i Agenci AI (${market})`,
        en: `L1 / HIP-3 Markets Registry & MCP (${market})`,
      },
      metricLabel: {
        pl: 'API Hyperliquid (10s) · Serwer MCP',
        en: 'Hyperliquid API (10s) · MCP Server',
      },
      description: {
        pl: 'Na żywo BTC/ETH/SOL/HYPE, kontrakty HIP-3 z godzinami sesji US oraz serwer MCP dla Claude i ChatGPT.',
        en: 'Live BTC/ETH/SOL/HYPE telemetry, HIP-3 equities/commodities registry, and read-only MCP tools.',
      },
      renderMiniChart: (reduced) => (
        <svg viewBox="0 0 180 48" className="w-full h-12 overflow-visible" aria-hidden="true">
          {[
            { cx: 28, cy: 24, color: '#22D3EE' },
            { cx: 90, cy: 14, color: '#818CF8' },
            { cx: 90, cy: 36, color: '#FBBF24' },
            { cx: 152, cy: 24, color: '#22D3EE' },
          ].map((node, i) => (
            <circle key={i} cx={node.cx} cy={node.cy} r="4" fill={node.color} />
          ))}
          <motion.path
            d="M 32 23 L 86 15 M 32 25 L 86 35 M 94 15 L 148 23 M 94 35 L 148 25"
            stroke="#22D3EE"
            strokeOpacity="0.6"
            strokeWidth="1.4"
            strokeDasharray="4 3"
            animate={reduced ? undefined : { strokeDashoffset: [0, -14] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          />
        </svg>
      ),
    },
  ];

  const categories: { id: CategoryFilter; label: { pl: string; en: string } }[] = [
    { id: 'all', label: { pl: 'Wszystkie (8)', en: 'All (8)' } },
    { id: 'pre', label: { pl: 'Przed sesją', en: 'Pre-session' } },
    { id: 'in', label: { pl: 'W sesji', en: 'In-session' } },
    { id: 'post', label: { pl: 'Po sesji', en: 'Post-session' } },
    { id: 'infra', label: { pl: 'Rynki & MCP', en: 'Markets & MCP' } },
  ];

  const visibleItems =
    filter === 'all'
      ? indicators
      : indicators.filter((item) => item.category === filter);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="font-mono text-xs font-semibold text-cyan-700 dark:text-cyan-400">
            {lang === 'pl'
              ? 'PEŁNY PRZEGLĄD NARZĘDZI HYPERQUANT'
              : 'COMPLETE HYPERQUANT CAPABILITY ATLAS'}
          </p>
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {lang === 'pl'
              ? 'Każdy wskaźnik, model i warstwa danych w jednym systemie'
              : 'Every indicator, model, and data layer in one unified desk'}
          </h2>
        </div>

        {/* Category Filter Tabs */}
        <div
          role="group"
          aria-label={lang === 'pl' ? 'Filtruj wskaźniki HyperQuant' : 'Filter HyperQuant indicators'}
          className="inline-flex flex-wrap items-center gap-1 p-1 rounded-lg bg-slate-100/90 dark:bg-[#0D1322] border border-slate-200/80 dark:border-slate-800"
        >
          {categories.map((cat) => {
            const isActive = filter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilter(cat.id)}
                aria-pressed={isActive}
                className={`relative px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-slate-900 dark:text-cyan-300 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="indicator-atlas-filter-pill"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 rounded-md bg-white dark:bg-cyan-500/15 border border-slate-200 dark:border-cyan-500/40 shadow-2xs"
                  />
                )}
                <span className="relative z-10">{cat.label[lang]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Responsive Animated Micro-Chart Bento Grid (Staggered Orchestration) */}
      <motion.div
        key={filter}
        variants={prefersReduced ? undefined : staggerCardGridVariants}
        initial={prefersReduced ? false : 'hidden'}
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {visibleItems.map((ind) => {
            const spotlight =
              ind.accent === 'amber'
                ? 'rgba(251, 191, 36, 0.14)'
                : ind.accent === 'indigo'
                ? 'rgba(129, 140, 248, 0.15)'
                : 'rgba(34, 211, 238, 0.15)';

            return (
              <motion.div
                key={ind.id}
                layout
                variants={prefersReduced ? undefined : staggerCardVariants}
                exit={{ opacity: 0, scale: 0.96 }}
              >
                <SpotlightCard
                  inheritStagger
                  tilt3d
                  onClick={() => onNavigate(ind.targetTab)}
                  spotlightColor={spotlight}
                  className="p-4 h-full flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        type={ind.provenance}
                        timestamp={timestamp}
                        lang={lang}
                      />
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-500 group-hover:translate-x-0.5 transition-all" />
                    </div>

                    {/* Live Animated Miniature SVG Chart */}
                    <div className="p-2.5 rounded-lg bg-slate-50/90 dark:bg-[#070B14] border border-slate-200/70 dark:border-slate-800/80">
                      {ind.renderMiniChart(prefersReduced)}
                    </div>

                    <div className="space-y-1">
                      <h3 className="font-display text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {ind.name[lang]}
                      </h3>
                      <p className="font-mono text-[11px] font-medium text-cyan-700 dark:text-cyan-400 tabular-nums">
                        {ind.metricLabel[lang]}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {ind.description[lang]}
                      </p>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};
