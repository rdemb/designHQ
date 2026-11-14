import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Language,
  MarketSymbol,
  formatNumber,
} from '../theme/tokens';
import { HyperliquidState } from '../theme/hyperliquid';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Stat } from '../components/Stat';
import {
  MotionStaggerContainer,
  MotionStaggerItem,
  MotionStaggerGrid,
  staggerTableBodyVariants,
  staggerTableRowVariants,
  EASE_OUT_EXPO,
  SPRING_SNAPPY,
} from '../components/MotionPrimitives';

export interface PostSessionViewProps {
  lang: Language;
  selectedMarket: MarketSymbol;
  hlState: HyperliquidState;
}

interface ForecastLedgerEntry {
  id: string;
  date: string;
  session: string;
  structuralHypothesis: { pl: string; en: string };
  assignedProbPct: number;
  realizedOutcome: boolean;
  brierContribution: number;
}

const LEDGER_ENTRIES: ForecastLedgerEntry[] = [
  {
    id: 'HQ-2026-1112-NY',
    date: '2026-11-12 15:15 CET',
    session: 'New York',
    structuralHypothesis: {
      pl: 'Zasięg sesji NY przekroczy 1,25× szerokości Initial Balance przy RVOL > 1,15',
      en: 'NY session range exceeds 1.25× Initial Balance width given RVOL > 1.15',
    },
    assignedProbPct: 70,
    realizedOutcome: true,
    brierContribution: 0.09,
  },
  {
    id: 'HQ-2026-1112-LDN',
    date: '2026-11-12 08:45 CET',
    session: 'London',
    structuralHypothesis: {
      pl: 'Powrót ceny do dPOC w ciągu pierwszych 120 minut sesji londyńskiej',
      en: 'Price revisits dPOC within the first 120 minutes of London open',
    },
    assignedProbPct: 65,
    realizedOutcome: true,
    brierContribution: 0.123,
  },
  {
    id: 'HQ-2026-1111-NY',
    date: '2026-11-11 15:15 CET',
    session: 'New York',
    structuralHypothesis: {
      pl: 'Utrzymanie handlu wewnątrz pasma VWAP ±1,5 σ do zamknięcia o 22:00 CET',
      en: 'Price remains contained within VWAP ±1.5 σ band until 22:00 CET close',
    },
    assignedProbPct: 80,
    realizedOutcome: true,
    brierContribution: 0.04,
  },
  {
    id: 'HQ-2026-1111-LDN',
    date: '2026-11-11 08:45 CET',
    session: 'London',
    structuralHypothesis: {
      pl: 'Test zewnętrznego progu płynności PDH lub PDL przed otwarciem USA',
      en: 'Test of external liquidity boundary (PDH or PDL) prior to US open',
    },
    assignedProbPct: 40,
    realizedOutcome: false,
    brierContribution: 0.16,
  },
  {
    id: 'HQ-2026-1110-NY',
    date: '2026-11-10 15:15 CET',
    session: 'New York',
    structuralHypothesis: {
      pl: 'Absorpcja w strefie dVAL–dVAH (dzień rotacyjny D-shape)',
      en: 'Rotational containment inside dVAL–dVAH (balanced D-shape profile)',
    },
    assignedProbPct: 60,
    realizedOutcome: true,
    brierContribution: 0.16,
  },
];

const CALIBRATION_BUCKETS = [
  { bin: '20%', predicted: 20, observed: 22, count: 24 },
  { bin: '40%', predicted: 40, observed: 38, count: 36 },
  { bin: '60%', predicted: 60, observed: 63, count: 52 },
  { bin: '70%', predicted: 70, observed: 69, count: 44 },
  { bin: '80%', predicted: 80, observed: 82, count: 28 },
];

export const PostSessionView: React.FC<PostSessionViewProps> = ({
  lang,
  selectedMarket,
  hlState,
}) => {
  const prefersReduced = useReducedMotion();
  const [selectedSessionFilter, setSelectedSessionFilter] = useState<'all' | 'London' | 'New York'>('all');
  const [activeBinIdx, setActiveBinIdx] = useState<number>(2);

  const filteredEntries = LEDGER_ENTRIES.filter((e) =>
    selectedSessionFilter === 'all' ? true : e.session === selectedSessionFilter
  );

  // D3 SVG Reliability Curve coordinates
  const calibrationPath = useMemo(() => {
    const xScale = d3.scaleLinear().domain([0, 100]).range([24, 296]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([136, 16]);
    const lineGen = d3
      .line<(typeof CALIBRATION_BUCKETS)[number]>()
      .x((d) => xScale(d.predicted))
      .y((d) => yScale(d.observed))
      .curve(d3.curveMonotoneX);
    return {
      path: lineGen(CALIBRATION_BUCKETS) || '',
      points: CALIBRATION_BUCKETS.map((b) => ({
        ...b,
        cx: xScale(b.predicted),
        cy: yScale(b.observed),
      })),
    };
  }, []);

  return (
    <MotionStaggerContainer className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <MotionStaggerItem className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs font-mono text-amber-600 dark:text-amber-400">
            FAZA 03 / PHASE 03 · {selectedMarket}-PERP
          </p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            {lang === 'pl'
              ? 'Po sesji — Przegląd sesji i weryfikowalny rejestr prognoz'
              : 'Post-session — Session Review & Verifiable Forecast Ledger'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'pl'
              ? 'Publiczna kalibracja hipotez strukturalnych (Brier Score) oraz rozliczenie migracji obszaru wartości po zamknięciu sesji.'
              : 'Public calibration of structural market hypotheses (Brier Score) and Value Area migration audit after session close.'}
          </p>
        </div>

        <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
      </MotionStaggerItem>

      {/* Top Interactive Summary Metrics (Staggered Orchestration) */}
      <MotionStaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          inheritStagger
          className="p-4"
          onClick={() => setActiveBinIdx(2)}
          ariaLabel={lang === 'pl' ? 'Wyróżnij koszyk 60% na krzywej kalibracji' : 'Focus 60% bin on calibration curve'}
        >
          <Stat
            label={lang === 'pl' ? 'Wynik Briera (90 dni, n=184)' : 'Brier Score (90d, n=184)'}
            value={formatNumber(0.142, lang, { decimals: 3 })}
            unit={lang === 'pl' ? '(im niżej, tym lepiej)' : '(lower is better)'}
            context={
              lang === 'pl'
                ? 'Odniesienie losowe (50/50): 0,250 · Przewaga kalibracji: +43%'
                : 'Uninformed baseline: 0.250 · Calibration skill: +43%'
            }
            provenanceType="MODEL"
            timestamp={hlState.lastUpdated}
            lang={lang}
          />
        </Card>

        <Card
          inheritStagger
          className="p-4"
          onClick={() => setSelectedSessionFilter('New York')}
          ariaLabel={lang === 'pl' ? 'Filtruj rejestr dla sesji New York' : 'Filter ledger by New York session'}
        >
          <Stat
            label={lang === 'pl' ? 'Zrealizowany zasięg vs IB' : 'Realized Range vs IB'}
            value={formatNumber(1.62, lang, { decimals: 2, suffix: '×' })}
            context={
              lang === 'pl'
                ? 'Ostatnia sesja NY rozszerzyła Initial Balance o +62% (norma: 1,45×)'
                : 'Last NY session extended Initial Balance by +62% (median: 1.45×)'
            }
            provenanceType="MODEL"
            timestamp={hlState.lastUpdated}
            lang={lang}
          />
        </Card>

        <Card
          inheritStagger
          className="p-4"
          onClick={() => setSelectedSessionFilter('London')}
          ariaLabel={lang === 'pl' ? 'Filtruj rejestr dla sesji London' : 'Filter ledger by London session'}
        >
          <Stat
            label={lang === 'pl' ? 'Migracja strefy wartości (VA)' : 'Value Area Migration'}
            value={lang === 'pl' ? 'Nakładająca się (+0,4%)' : 'Overlapping (+0.4%)'}
            context={
              lang === 'pl'
                ? '68% pokrycia z dVAH–dVAL dnia poprzedniego · Profil D-shape'
                : '68% overlap with prior day dVAH–dVAL · Balanced D-shape profile'
            }
            provenanceType="MODEL"
            timestamp={hlState.lastUpdated}
            lang={lang}
          />
        </Card>

        <Card
          inheritStagger
          className="p-4"
          onClick={() => {
            setSelectedSessionFilter('all');
            setActiveBinIdx(4);
          }}
          ariaLabel={lang === 'pl' ? 'Pokaż wszystkie sesje i koszyk 80%' : 'Show all sessions and 80% bin'}
        >
          <Stat
            label={lang === 'pl' ? 'Błąd kalibracji (ECE)' : 'Expected Calibration Error'}
            value={formatNumber(1.8, lang, { decimals: 1, suffix: '%' })}
            context={
              lang === 'pl'
                ? 'Średnie odchylenie między przypisanym prawdopodobieństwem a częstością'
                : 'Mean absolute deviation between forecast probability and empirical frequency'
            }
            provenanceType="MODEL"
            timestamp={hlState.lastUpdated}
            lang={lang}
          />
        </Card>
      </MotionStaggerGrid>

      {/* Calibration Curve & Forecast Ledger Table */}
      <MotionStaggerGrid className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card
          inheritStagger
          className="lg:col-span-5"
          kicker={lang === 'pl' ? 'Diagram rzetelności (Reliability Diagram)' : 'Reliability Diagram'}
          title={
            lang === 'pl'
              ? 'Krzywa kalibracji hipotez strukturalnych'
              : 'Forecast Calibration Curve (Predicted vs Observed)'
          }
          provenance={{ type: 'MODEL', timestamp: hlState.lastUpdated }}
          lang={lang}
        >
          <div className="space-y-4">
            {/* Interactive Animated D3 Reliability Plot */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-[#060910] border border-slate-200 dark:border-slate-800 space-y-2">
              <svg viewBox="0 0 320 152" className="w-full h-36 overflow-visible">
                {/* Ideal Calibration Diagonal */}
                <line
                  x1="24"
                  y1="136"
                  x2="296"
                  y2="16"
                  stroke="currentColor"
                  className="text-slate-300 dark:text-slate-700"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />

                {/* Active Point Crosshairs */}
                {calibrationPath.points[activeBinIdx] && (
                  <g className="pointer-events-none">
                    <motion.line
                      initial={false}
                      animate={{
                        x1: calibrationPath.points[activeBinIdx].cx,
                        x2: calibrationPath.points[activeBinIdx].cx,
                      }}
                      transition={SPRING_SNAPPY}
                      y1="14"
                      y2="136"
                      stroke="#22D3EE"
                      strokeOpacity="0.35"
                      strokeDasharray="2 3"
                      strokeWidth="1"
                    />
                    <motion.line
                      initial={false}
                      animate={{
                        y1: calibrationPath.points[activeBinIdx].cy,
                        y2: calibrationPath.points[activeBinIdx].cy,
                      }}
                      transition={SPRING_SNAPPY}
                      x1="24"
                      x2="296"
                      stroke="#22D3EE"
                      strokeOpacity="0.35"
                      strokeDasharray="2 3"
                      strokeWidth="1"
                    />
                  </g>
                )}

                <motion.path
                  d={calibrationPath.path}
                  fill="none"
                  stroke="#22D3EE"
                  strokeWidth="2.2"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.75, ease: EASE_OUT_EXPO }}
                />
                {calibrationPath.points.map((pt, i) => {
                  const isActive = activeBinIdx === i;
                  return (
                    <g
                      key={pt.bin}
                      onMouseEnter={() => setActiveBinIdx(i)}
                      onClick={() => setActiveBinIdx(i)}
                      className="cursor-pointer"
                    >
                      <circle cx={pt.cx} cy={pt.cy} r="14" fill="transparent" />
                      {isActive && (
                        <motion.circle
                          cx={pt.cx}
                          cy={pt.cy}
                          r="8"
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 0.3 }}
                          transition={SPRING_SNAPPY}
                          className="fill-cyan-400"
                        />
                      )}
                      <motion.circle
                        cx={pt.cx}
                        cy={pt.cy}
                        r={isActive ? 5.2 : 3.8}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.12 + i * 0.06 }}
                        className={
                          isActive
                            ? 'fill-cyan-300 stroke-slate-950 stroke-1'
                            : 'fill-cyan-400 stroke-slate-950 stroke-1'
                        }
                      />
                      <text
                        x={pt.cx}
                        y="149"
                        textAnchor="middle"
                        className={`font-mono text-[9px] ${
                          isActive
                            ? 'fill-cyan-500 font-semibold'
                            : 'fill-slate-400'
                        }`}
                      >
                        {pt.bin}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {calibrationPath.points[activeBinIdx] && (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeBinIdx}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -3 }}
                    transition={{ duration: 0.14 }}
                    className="flex items-center justify-between text-[11px] font-mono tabular-nums pt-2 border-t border-slate-200/70 dark:border-slate-800/80 text-slate-600 dark:text-slate-300"
                  >
                    <span>
                      {lang === 'pl' ? 'Koszyk' : 'Bin'}:{' '}
                      <strong className="text-slate-900 dark:text-white">
                        {calibrationPath.points[activeBinIdx].bin}
                      </strong>{' '}
                      (n={calibrationPath.points[activeBinIdx].count})
                    </span>
                    <span className="text-cyan-700 dark:text-cyan-400 font-semibold">
                      {lang === 'pl' ? 'Zrealizowano:' : 'Observed:'}{' '}
                      {calibrationPath.points[activeBinIdx].observed}%
                    </span>
                    <span className="text-amber-600 dark:text-amber-400">
                      Δ{' '}
                      {formatNumber(
                        calibrationPath.points[activeBinIdx].observed -
                          calibrationPath.points[activeBinIdx].predicted,
                        lang,
                        { sign: true, suffix: ' pp' }
                      )}
                    </span>
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            <div className="space-y-2.5 pt-1">
              {CALIBRATION_BUCKETS.map((b, idx) => (
                <button
                  key={b.bin}
                  type="button"
                  onMouseEnter={() => setActiveBinIdx(idx)}
                  onClick={() => setActiveBinIdx(idx)}
                  className={`w-full text-left space-y-1 font-mono text-xs tabular-nums p-1.5 rounded transition-colors cursor-pointer ${
                    activeBinIdx === idx
                      ? 'bg-cyan-500/8 dark:bg-cyan-500/12'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="text-slate-600 dark:text-slate-300">
                      {lang === 'pl' ? 'Koszyk prognozy' : 'Forecast bin'} {b.bin} (n={b.count})
                    </span>
                    <span className="font-semibold text-cyan-700 dark:text-cyan-400">
                      {lang === 'pl' ? 'Zrealizowano:' : 'Observed:'} {b.observed}%
                    </span>
                  </div>
                  <div className="relative h-2 rounded-xs bg-slate-100 dark:bg-slate-900 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${b.observed}%` }}
                      transition={{ duration: 0.45, delay: idx * 0.05, ease: EASE_OUT_EXPO }}
                      className="h-full bg-cyan-500/80"
                    />
                    <div
                      style={{ left: `${b.predicted}%` }}
                      className="absolute top-0 bottom-0 w-0.5 bg-amber-400"
                      title={`Ideal calibration: ${b.predicted}%`}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card
          inheritStagger
          className="lg:col-span-7"
          kicker={lang === 'pl' ? 'Audytowalny rejestr (niemodyfikowalny)' : 'Immutable forecast audit log'}
          title={
            lang === 'pl'
              ? 'Rejestr opublikowanych hipotez strukturalnych'
              : 'Published Structural Hypotheses Ledger'
          }
          headerRight={
            <div className="inline-flex rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0E1422] p-0.5 text-[11px] font-mono">
              {(['all', 'London', 'New York'] as const).map((s) => {
                const isSelected = selectedSessionFilter === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedSessionFilter(s)}
                    className={`relative px-2.5 py-0.5 rounded-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'text-white dark:text-cyan-300 font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="ledger-filter-pill"
                        transition={SPRING_SNAPPY}
                        className="absolute inset-0 rounded-xs bg-slate-900 dark:bg-slate-800"
                      />
                    )}
                    <span className="relative z-10">
                      {s === 'all' ? (lang === 'pl' ? 'Wszystkie' : 'All') : s}
                    </span>
                  </button>
                );
              })}
            </div>
          }
        >
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-md">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400">
                  <th className="py-2.5 px-3 font-medium">ID / Czas</th>
                  <th className="py-2.5 px-3 font-medium">
                    {lang === 'pl'
                      ? 'Hipoteza strukturalna (bez kierunku ceny)'
                      : 'Structural Hypothesis (non-directional)'}
                  </th>
                  <th className="py-2.5 px-3 font-medium text-right">Prob.</th>
                  <th className="py-2.5 px-3 font-medium text-right">
                    {lang === 'pl' ? 'Wynik / Brier' : 'Outcome / Brier'}
                  </th>
                </tr>
              </thead>
              <motion.tbody
                key={selectedSessionFilter}
                variants={prefersReduced ? undefined : staggerTableBodyVariants}
                initial={prefersReduced ? false : 'hidden'}
                animate="visible"
                className="divide-y divide-slate-100 dark:divide-slate-800/70 font-mono tabular-nums"
              >
                {filteredEntries.map((item) => (
                  <motion.tr
                    key={item.id}
                    variants={prefersReduced ? undefined : staggerTableRowVariants}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="block font-semibold text-slate-800 dark:text-slate-200">
                        {item.id}
                      </span>
                      <span className="text-[10px] text-slate-400">{item.date}</span>
                    </td>
                    <td className="py-2.5 px-3 font-sans text-slate-700 dark:text-slate-300 max-w-xs">
                      {item.structuralHypothesis[lang]}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-cyan-700 dark:text-cyan-400">
                      {item.assignedProbPct}%
                    </td>
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <span className="text-slate-900 dark:text-white font-semibold">
                        {item.realizedOutcome
                          ? lang === 'pl'
                            ? 'TAK'
                            : 'YES'
                          : lang === 'pl'
                          ? 'NIE'
                          : 'NO'}
                      </span>{' '}
                      <span className="text-slate-400">
                        ({formatNumber(item.brierContribution, lang, { decimals: 3 })})
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          </div>
        </Card>
      </MotionStaggerGrid>
    </MotionStaggerContainer>
  );
};
