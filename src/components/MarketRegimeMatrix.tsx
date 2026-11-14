import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Language,
  MarketSymbol,
  formatNumber,
  getAmsterdamSessionStatus,
} from '../theme/tokens';
import { HyperliquidState, SELECTED_MARKET_LIST } from '../theme/hyperliquid';
import { Badge } from './Badge';
import {
  SpotlightCard,
  MotionStaggerGrid,
  AnimatedTicker,
  staggerTableBodyVariants,
  staggerTableRowVariants,
  EASE_OUT_EXPO,
  SPRING_TACTILE,
  SPRING_PRESS,
  SPRING_SMOOTH,
} from './MotionPrimitives';

export interface MarketRegimeMatrixProps {
  lang: Language;
  selectedMarket: MarketSymbol;
  onSelectMarket: (sym: MarketSymbol) => void;
  hlState: HyperliquidState;
}

interface HourlyRegimeBucket {
  hour: number;
  label: string;
  session: 'asia' | 'london' | 'overlap' | 'ny';
  excursionPct: number;
  rvol: number;
  liqUsdM: number;
}

const HOURLY_PROFILE: HourlyRegimeBucket[] = [
  { hour: 0, label: '00:00', session: 'asia', excursionPct: 0.28, rvol: 0.62, liqUsdM: 14.2 },
  { hour: 1, label: '01:00', session: 'asia', excursionPct: 0.34, rvol: 0.74, liqUsdM: 15.8 },
  { hour: 2, label: '02:00', session: 'asia', excursionPct: 0.41, rvol: 0.85, liqUsdM: 17.1 },
  { hour: 3, label: '03:00', session: 'asia', excursionPct: 0.36, rvol: 0.79, liqUsdM: 16.5 },
  { hour: 4, label: '04:00', session: 'asia', excursionPct: 0.29, rvol: 0.66, liqUsdM: 15.0 },
  { hour: 5, label: '05:00', session: 'asia', excursionPct: 0.26, rvol: 0.58, liqUsdM: 14.6 },
  { hour: 6, label: '06:00', session: 'asia', excursionPct: 0.31, rvol: 0.69, liqUsdM: 15.4 },
  { hour: 7, label: '07:00', session: 'asia', excursionPct: 0.38, rvol: 0.82, liqUsdM: 16.9 },
  { hour: 8, label: '08:00', session: 'asia', excursionPct: 0.49, rvol: 0.98, liqUsdM: 18.7 },
  { hour: 9, label: '09:00', session: 'london', excursionPct: 0.72, rvol: 1.38, liqUsdM: 22.8 },
  { hour: 10, label: '10:00', session: 'london', excursionPct: 0.64, rvol: 1.24, liqUsdM: 21.4 },
  { hour: 11, label: '11:00', session: 'london', excursionPct: 0.51, rvol: 1.05, liqUsdM: 19.6 },
  { hour: 12, label: '12:00', session: 'london', excursionPct: 0.44, rvol: 0.91, liqUsdM: 18.9 },
  { hour: 13, label: '13:00', session: 'london', excursionPct: 0.48, rvol: 0.97, liqUsdM: 19.5 },
  { hour: 14, label: '14:00', session: 'london', excursionPct: 0.61, rvol: 1.22, liqUsdM: 21.8 },
  { hour: 15, label: '15:00', session: 'overlap', excursionPct: 0.88, rvol: 1.74, liqUsdM: 25.4 },
  { hour: 16, label: '16:00', session: 'overlap', excursionPct: 0.94, rvol: 1.86, liqUsdM: 26.2 },
  { hour: 17, label: '17:00', session: 'overlap', excursionPct: 0.76, rvol: 1.49, liqUsdM: 23.7 },
  { hour: 18, label: '18:00', session: 'ny', excursionPct: 0.58, rvol: 1.18, liqUsdM: 20.9 },
  { hour: 19, label: '19:00', session: 'ny', excursionPct: 0.53, rvol: 1.09, liqUsdM: 19.8 },
  { hour: 20, label: '20:00', session: 'ny', excursionPct: 0.62, rvol: 1.26, liqUsdM: 21.1 },
  { hour: 21, label: '21:00', session: 'ny', excursionPct: 0.69, rvol: 1.34, liqUsdM: 22.0 },
  { hour: 22, label: '22:00', session: 'asia', excursionPct: 0.42, rvol: 0.88, liqUsdM: 17.5 },
  { hour: 23, label: '23:00', session: 'asia', excursionPct: 0.33, rvol: 0.71, liqUsdM: 15.2 },
];

export const MarketRegimeMatrix: React.FC<MarketRegimeMatrixProps> = ({
  lang,
  selectedMarket,
  onSelectMarket,
  hlState,
}) => {
  const prefersReduced = useReducedMotion();
  const sessionStatus = getAmsterdamSessionStatus();
  const currentHour = Math.floor(sessionStatus.amsterdamMinutes / 60) % 24;
  const [inspectedHour, setInspectedHour] = useState<number>(currentHour);

  const activeBucket = HOURLY_PROFILE[inspectedHour] || HOURLY_PROFILE[15];
  const maxExcursion = 1.0;

  const marketRows = useMemo(() => {
    const list = SELECTED_MARKET_LIST.map((sym) => hlState.assets[sym]).filter(Boolean);
    const totalOi = list.reduce((sum, item) => sum + (item.openInterestUsd ?? 0), 0) || 1;
    return list.map((item) => ({
      ...item,
      oiSharePct: ((item.openInterestUsd ?? 0) / totalOi) * 100,
    }));
  }, [hlState.assets]);

  const sessionTitle = (s: HourlyRegimeBucket['session']) => {
    if (s === 'overlap') return lang === 'pl' ? 'Nakładka LDN + NY' : 'LDN / NY Overlap';
    if (s === 'london') return lang === 'pl' ? 'Sesja Londyn' : 'London Session';
    if (s === 'ny') return lang === 'pl' ? 'Sesja Nowy Jork' : 'New York Session';
    return lang === 'pl' ? 'Okno Azja / Noc' : 'Asia / Overnight';
  };

  return (
    <MotionStaggerGrid triggerOnView className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
      {/* Left 7 cols: 24h Intraday Volatility & Liquidity Anatomy */}
      <SpotlightCard
        inheritStagger
        className="lg:col-span-7 p-5 flex flex-col justify-between"
        spotlightColor="rgba(34, 211, 238, 0.14)"
      >
        <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-cyan-700 dark:text-cyan-400">
                {lang === 'pl' ? 'ANATOMIA ZMIENNOŚCI 24H (CET)' : '24H VOLATILITY ANATOMY (CET)'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{selectedMarket}-PERP (30d p50)</span>
            </div>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white mt-0.5">
              {lang === 'pl'
                ? 'Rozkład rozstępu godzinowego i płynności w cyklu dobowym'
                : 'Hourly Range Excursion & Resting Liquidity Cycle'}
            </h2>
          </div>

          <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
        </div>

        {/* Interactive 24-Hour Bar Scrubber */}
        <div className="py-5">
          <div
            className="grid grid-cols-[repeat(24,minmax(0,1fr))] gap-1 sm:gap-1.5 items-end h-36 px-1"
            role="listbox"
            aria-label={
              lang === 'pl'
                ? 'Godzinowy profil zmienności CET'
                : 'Hourly CET volatility profile'
            }
          >
            {HOURLY_PROFILE.map((b, idx) => {
              const heightPct = Math.max(18, Math.round((b.excursionPct / maxExcursion) * 100));
              const isSelected = inspectedHour === b.hour;
              const isNow = currentHour === b.hour;
              const barColor =
                b.session === 'overlap'
                  ? 'bg-gradient-to-t from-cyan-500 to-indigo-400'
                  : b.session === 'london'
                  ? 'bg-cyan-500/85'
                  : b.session === 'ny'
                  ? 'bg-indigo-500/80'
                  : 'bg-slate-300 dark:bg-slate-700/80';

              return (
                <button
                  key={b.hour}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setInspectedHour(b.hour)}
                  onFocus={() => setInspectedHour(b.hour)}
                  onClick={() => setInspectedHour(b.hour)}
                  className="group relative h-full flex flex-col justify-end items-center cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-500 rounded-xs"
                  title={`${b.label} CET · ${formatNumber(b.excursionPct, lang, {
                    decimals: 2,
                    suffix: '%',
                  })}`}
                >
                  {isNow && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-amber-400 mb-1 shadow-[0_0_6px_rgba(251,191,36,0.9)]"
                      title={lang === 'pl' ? 'Bieżąca godzina CET' : 'Current CET hour'}
                    />
                  )}
                  <motion.div
                    initial={prefersReduced ? false : { scaleY: 0 }}
                    animate={{
                      scaleY: 1,
                      opacity: isSelected ? 1 : 0.72,
                    }}
                    whileHover={prefersReduced ? undefined : { scaleY: 1.06 }}
                    transition={{
                      duration: 0.32,
                      delay: idx * 0.012,
                      ease: EASE_OUT_EXPO,
                    }}
                    style={{ height: `${heightPct}%`, transformOrigin: 'bottom' }}
                    className={`w-full rounded-t-xs transition-shadow ${barColor} ${
                      isSelected
                        ? 'ring-2 ring-cyan-400/90 shadow-[0_0_14px_rgba(34,211,238,0.45)]'
                        : 'group-hover:opacity-100'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <div className="flex justify-between font-mono text-[10px] tabular-nums text-slate-400 dark:text-slate-500 mt-2 px-1">
            <span>00:00</span>
            <span>06:00</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">09:00 LDN</span>
            <span>12:00</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">15:30 NY</span>
            <span>18:00</span>
            <span>23:00</span>
          </div>
        </div>

        {/* Live Inspected Hour Readout Strip */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBucket.hour}
            initial={prefersReduced ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.16, ease: EASE_OUT_EXPO }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 font-mono text-xs tabular-nums"
          >
            <div>
              <span className="block font-sans text-[10px] text-slate-500 dark:text-slate-400">
                {lang === 'pl' ? 'Wybrane okno CET' : 'Selected CET Hour'}
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {activeBucket.label} · {sessionTitle(activeBucket.session)}
              </span>
            </div>
            <div>
              <span className="block font-sans text-[10px] text-slate-500 dark:text-slate-400">
                {lang === 'pl' ? 'Mediana rozstępu (1h)' : 'Median 1h Excursion'}
              </span>
              <span className="font-semibold text-cyan-700 dark:text-cyan-300">
                {formatNumber(activeBucket.excursionPct, lang, { decimals: 2, suffix: '%' })}
              </span>
            </div>
            <div>
              <span className="block font-sans text-[10px] text-slate-500 dark:text-slate-400">
                {lang === 'pl' ? 'Względny wolumen (RVOL)' : 'Relative Volume'}
              </span>
              <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                {formatNumber(activeBucket.rvol, lang, { decimals: 2, suffix: '×' })}
              </span>
            </div>
            <div className="sm:text-right">
              <span className="block font-sans text-[10px] text-slate-500 dark:text-slate-400">
                {lang === 'pl' ? 'Płynność ±1% (avg)' : 'Depth ±1% (avg)'}
              </span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                ${formatNumber(activeBucket.liqUsdM, lang, { decimals: 1 })}M
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </SpotlightCard>

      {/* Right 5 cols: Hyperliquid L1 Open Interest & Funding Comparator */}
      <SpotlightCard
        inheritStagger
        className="lg:col-span-5 p-5 flex flex-col justify-between"
        spotlightColor="rgba(129, 140, 248, 0.14)"
      >
        <div className="flex flex-wrap items-start justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <p className="font-mono text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
              {lang === 'pl' ? 'KONCENTRACJA OPEN INTEREST (L1)' : 'L1 OPEN INTEREST CONCENTRATION'}
            </p>
            <h2 className="font-display text-base font-semibold text-slate-900 dark:text-white mt-0.5">
              {lang === 'pl'
                ? 'Udział kapitału i koszt finansowania'
                : 'Active Capital Share & Funding Skew'}
            </h2>
          </div>
          <Badge
            type={hlState.isLiveConnected ? 'LIVE' : 'SIM'}
            timestamp={hlState.lastUpdated}
            lang={lang}
          />
        </div>

        <motion.div
          variants={prefersReduced ? undefined : staggerTableBodyVariants}
          initial={prefersReduced ? false : 'hidden'}
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="space-y-3 py-4"
        >
          {marketRows.map((m) => {
            const sym = m.symbol as MarketSymbol;
            const isSelected = sym === selectedMarket;
            return (
              <motion.button
                key={m.symbol}
                variants={prefersReduced ? undefined : staggerTableRowVariants}
                type="button"
                onClick={() => onSelectMarket(sym)}
                aria-pressed={isSelected}
                whileHover={
                  prefersReduced
                    ? undefined
                    : { y: -2, scale: 1.015, transition: SPRING_TACTILE }
                }
                whileTap={
                  prefersReduced
                    ? undefined
                    : { scale: 0.982, y: 0, transition: SPRING_PRESS }
                }
                className={`relative w-full text-left p-2.5 rounded-lg border transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-500 ${
                  isSelected
                    ? 'border-cyan-500/50 bg-cyan-500/8 dark:bg-cyan-500/12'
                    : 'border-slate-200/70 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono tabular-nums mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {m.symbol}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                      {m.midPrice !== null
                        ? `$${formatNumber(m.midPrice, lang, {
                            decimals: m.symbol === 'BTC' ? 0 : 2,
                          })}`
                        : '—'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {m.fundingAnnualizedPct !== null
                        ? formatNumber(m.fundingAnnualizedPct, lang, {
                            decimals: 1,
                            sign: true,
                            suffix: '%/r',
                          })
                        : '—'}
                    </span>
                    <AnimatedTicker
                      value={
                        m.openInterestUsd !== null
                          ? formatNumber(m.openInterestUsd, lang, {
                              compact: true,
                              prefix: '$',
                            })
                          : '—'
                      }
                      className="font-semibold text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800/90 overflow-hidden">
                  <motion.div
                    initial={false}
                    animate={{ width: `${Math.max(4, Math.min(100, m.oiSharePct))}%` }}
                    transition={prefersReduced ? { duration: 0 } : SPRING_SMOOTH}
                    className={`h-full rounded-full ${
                      isSelected
                        ? 'bg-gradient-to-r from-cyan-400 to-sky-300 shadow-[0_0_8px_rgba(34,211,238,0.7)]'
                        : 'bg-indigo-500/70 dark:bg-indigo-400/70'
                    }`}
                  />
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {lang === 'pl'
            ? 'Kliknij dowolny kontrakt, aby zsynchronizować cały desk i krajobraz 3D.'
            : 'Select any perpetual contract to synchronize the desk and 3D depth field.'}
        </p>
      </SpotlightCard>
    </MotionStaggerGrid>
  );
};
