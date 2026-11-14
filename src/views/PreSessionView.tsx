import React, { useMemo, useState } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ArrowRight, Layers, BookOpen } from 'lucide-react';
import {
  Language,
  MarketSymbol,
  NavTabId,
  formatNumber,
  getAmsterdamSessionStatus,
  formatCountdown,
} from '../theme/tokens';
import { HyperliquidState } from '../theme/hyperliquid';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { SessionClock } from '../components/SessionClock';
import {
  MotionStaggerContainer,
  MotionStaggerItem,
  MotionStaggerGrid,
  AnimatedTicker,
  SpotlightCard,
  MagneticWrapper,
  staggerCardGridVariants,
  staggerCardVariants,
  staggerTableBodyVariants,
  staggerTableRowVariants,
  EASE_OUT_EXPO,
  SPRING_TACTILE,
  SPRING_PRESS,
  SPRING_SMOOTH,
} from '../components/MotionPrimitives';

export interface PreSessionViewProps {
  lang: Language;
  selectedMarket: MarketSymbol;
  hlState: HyperliquidState;
  onNavigate: (tab: NavTabId) => void;
}

interface DayMapLevel {
  id: string;
  code: string;
  label: { pl: string; en: string };
  price: number;
  role: { pl: string; en: string };
  provenance: 'LIVE' | 'MODEL' | 'SIM';
  accentColor: string;
}

export const PreSessionView: React.FC<PreSessionViewProps> = ({
  lang,
  selectedMarket,
  hlState,
  onNavigate,
}) => {
  const prefersReduced = useReducedMotion();
  const asset = hlState.assets[selectedMarket] || hlState.marketList[0];
  const midPrice = asset?.midPrice ?? 75791;
  const decimals = selectedMarket === 'BTC' ? 0 : selectedMarket === 'HYPE' ? 2 : 1;
  const sessionStatus = getAmsterdamSessionStatus();

  const [selectedNoteIdx, setSelectedNoteIdx] = useState<number>(1);

  const vwapPrice = Number((midPrice * 0.9966).toFixed(decimals));
  const vwapDistPct = Number((((midPrice - vwapPrice) / vwapPrice) * 100).toFixed(2));
  const typicalHourWidthPct =
    selectedMarket === 'BTC' ? 0.68 : selectedMarket === 'ETH' ? 0.82 : 1.35;
  const typicalHourWidthUsd = Number(
    ((midPrice * typicalHourWidthPct) / 100).toFixed(decimals)
  );

  const liqBelowUsd =
    selectedMarket === 'BTC'
      ? 22_600_000
      : selectedMarket === 'ETH'
      ? 11_400_000
      : selectedMarket === 'SOL'
      ? 6_800_000
      : 3_200_000;
  const liqAboveUsd =
    selectedMarket === 'BTC'
      ? 19_400_000
      : selectedMarket === 'ETH'
      ? 13_100_000
      : selectedMarket === 'SOL'
      ? 7_500_000
      : 2_900_000;

  const prevVah = Number((midPrice * 1.0085).toFixed(decimals));
  const prevPoc = Number((midPrice * 0.9975).toFixed(decimals));
  const prevVal = Number((midPrice * 0.9865).toFixed(decimals));
  const pdh = asset?.pdh ?? Number((midPrice * 1.013).toFixed(decimals));
  const pdl = asset?.pdl ?? Number((midPrice * 0.981).toFixed(decimals));

  const dayMapLevels: DayMapLevel[] = useMemo(
    () => [
      {
        id: 'pdh',
        code: 'PDH',
        label: { pl: 'Szczyt poprzedniego dnia (PDH)', en: 'Previous Day High (PDH)' },
        price: pdh,
        role: {
          pl: 'Zewnętrzna granica płynności z sesji wczorajszej; strefa testu akceptacji poza zakresem równowagi.',
          en: 'External liquidity boundary from yesterday’s session; acceptance test zone outside balance range.',
        },
        provenance: 'SIM',
        accentColor: 'text-amber-600 dark:text-amber-400',
      },
      {
        id: 'vah',
        code: 'dVAH',
        label: {
          pl: 'Górna granica wartości (dVAH)',
          en: 'Previous Session Value Area High (dVAH)',
        },
        price: prevVah,
        role: {
          pl: 'Górny brzeg 70% wolumenu z wczoraj. Rozgranicza dwustronną równowagę od ekspansji zakresu.',
          en: 'Upper boundary of yesterday’s 70% volume bell curve. Separates two-sided balance from range expansion.',
        },
        provenance: 'MODEL',
        accentColor: 'text-indigo-600 dark:text-indigo-400',
      },
      {
        id: 'mid',
        code: 'MID',
        label: {
          pl: 'Aktualna cena Mid (Hyperliquid L1)',
          en: 'Current L1 Mid Price (Hyperliquid)',
        },
        price: midPrice,
        role: {
          pl: 'Bieżący punkt równowagi arkusza L1 odpytywany co 10 s z publicznego endpointu allMids.',
          en: 'Live L1 orderbook midpoint polled every 10s from the public allMids endpoint.',
        },
        provenance: asset?.provenance.type || 'SIM',
        accentColor: 'text-cyan-600 dark:text-cyan-400',
      },
      {
        id: 'poc',
        code: 'dPOC',
        label: {
          pl: 'Punkt kontroli wolumenu (dPOC)',
          en: 'Previous Session Point of Control (dPOC)',
        },
        price: prevPoc,
        role: {
          pl: 'Cena o największym przehandlowanym wolumenie w poprzedniej sesji — główny magnes rotacyjny.',
          en: 'Highest traded volume node of the previous session — primary rotational equilibrium magnet.',
        },
        provenance: 'MODEL',
        accentColor: 'text-amber-600 dark:text-amber-400',
      },
      {
        id: 'vwap',
        code: 'VWAP',
        label: { pl: 'Dzienny VWAP sesji bieżącej', en: 'Current Day Session VWAP' },
        price: vwapPrice,
        role: {
          pl: 'Średnia ważona wolumenem od 00:00 UTC; punkt odniesienia dla kosztu egzekucji.',
          en: 'Volume-weighted average price since 00:00 UTC; institutional execution benchmark.',
        },
        provenance: 'MODEL',
        accentColor: 'text-cyan-600 dark:text-cyan-400',
      },
      {
        id: 'val',
        code: 'dVAL',
        label: {
          pl: 'Dolna granica wartości (dVAL)',
          en: 'Previous Session Value Area Low (dVAL)',
        },
        price: prevVal,
        role: {
          pl: 'Dolny brzeg 70% wolumenu. Poniżej tej strefy rynek przechodzi w obszar niskiej płynności.',
          en: 'Lower boundary of 70% volume distribution. Below lies low-volume price discovery.',
        },
        provenance: 'MODEL',
        accentColor: 'text-indigo-600 dark:text-indigo-400',
      },
      {
        id: 'pdl',
        code: 'PDL',
        label: { pl: 'Dołek poprzedniego dnia (PDL)', en: 'Previous Day Low (PDL)' },
        price: pdl,
        role: {
          pl: 'Dolna granica zakresu z wczoraj; skupisko pasywnych zleceń zabezpieczających.',
          en: 'Lower extreme of yesterday’s range; resting stop and passive liquidity pool.',
        },
        provenance: 'SIM',
        accentColor: 'text-amber-600 dark:text-amber-400',
      },
    ],
    [pdh, prevVah, midPrice, prevPoc, vwapPrice, prevVal, pdl, asset]
  );

  const selectedLevel = dayMapLevels[selectedNoteIdx] || dayMapLevels[1];

  const profileBuckets = useMemo(() => {
    const rows = 16;
    const minP = pdl;
    const maxP = pdh;
    const step = (maxP - minP) / (rows - 1 || 1);
    return Array.from({ length: rows }, (_, i) => {
      const p = Number((maxP - i * step).toFixed(decimals));
      const distFromPoc = Math.abs(p - prevPoc) / Math.max(1, maxP - minP);
      const volPct = Math.round(Math.exp(-Math.pow(distFromPoc / 0.3, 2)) * 92 + 8);
      const inValueArea = p <= prevVah && p >= prevVal;
      const isPoc = Math.abs(p - prevPoc) <= step * 0.55;
      const isHighlightedByLadder =
        Math.abs(p - selectedLevel.price) <= step * 0.65;
      return { price: p, volPct, inValueArea, isPoc, isHighlightedByLadder };
    });
  }, [pdh, pdl, prevPoc, prevVah, prevVal, decimals, selectedLevel]);

  const liqScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, Math.max(liqBelowUsd, liqAboveUsd) * 1.15])
        .range([0, 100]),
    [liqBelowUsd, liqAboveUsd]
  );

  return (
    <MotionStaggerContainer className="space-y-6 max-w-7xl mx-auto">
      {/* Phase 01 Header Banner */}
      <MotionStaggerItem>
        <SpotlightCard
          borderBeam
          className="p-5 flex flex-wrap items-center justify-between gap-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 w-full">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span className="text-cyan-700 dark:text-cyan-400 font-semibold">
                  FAZA 01 · PRZED SESJĄ
                </span>
                <span aria-hidden="true">·</span>
                <span>{selectedMarket}-PERP</span>
                <span aria-hidden="true">·</span>
                <span>
                  {lang === 'pl' ? 'Otwarcie kolejnej sesji za:' : 'Next session open in:'}{' '}
                  <strong className="text-amber-600 dark:text-amber-400">
                    {formatCountdown(sessionStatus.countdownSeconds)}
                  </strong>{' '}
                  ({sessionStatus.nextSessionLabel[lang]})
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {lang === 'pl'
                  ? `Odprawa przedsesyjna ${selectedMarket} — Cztery liczby i drabinka poziomów`
                  : `${selectedMarket} Pre-Session Briefing — Four Numbers & Structural Ladder`}
              </h1>
            </div>

            <MagneticWrapper strength={0.15}>
              <motion.button
                type="button"
                whileHover={{ y: -1.5 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onNavigate('in-session')}
                className="relative overflow-hidden hq-sheen-btn inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-gradient-to-r dark:from-cyan-400 dark:to-sky-400 dark:text-slate-950 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>
                  {lang === 'pl'
                    ? 'Otwórz terminal W sesji (02)'
                    : 'Launch In-Session Terminal (02)'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>
            </MagneticWrapper>
          </div>
        </SpotlightCard>
      </MotionStaggerItem>

      {/* "Four Numbers / Cztery liczby" 4-Quadrant Instrument Matrix */}
      <MotionStaggerItem>
        <SpotlightCard className="overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-slate-50/70 dark:bg-[#0D1322]">
            <div>
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                {lang === 'pl'
                  ? 'Cztery liczby (Four Numbers) — matryca orientacji przed otwarciem'
                  : 'Four Numbers — Pre-Open Structural Orientation Matrix'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'pl'
                  ? 'Każdy kwadrant łączy wartość liczbową, znacznik pochodzenia i animowaną mikro-wizualizację rozkładu.'
                  : 'Each quadrant pairs a tabular metric, provenance stamp, and animated distribution micro-visual.'}
              </p>
            </div>
            <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
          </div>

          <motion.div
            variants={prefersReduced ? undefined : staggerCardGridVariants}
            initial={prefersReduced ? false : 'hidden'}
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800"
          >
            {/* Quadrant 1 */}
            <motion.button
              type="button"
              variants={prefersReduced ? undefined : staggerCardVariants}
              onClick={() => setSelectedNoteIdx(3)}
              whileHover={{ y: -2, transition: SPRING_TACTILE }}
              whileTap={{ scale: 0.985, y: 0, transition: SPRING_PRESS }}
              className="p-5 flex flex-col justify-between gap-4 text-left cursor-pointer hover:bg-slate-50/70 dark:hover:bg-[#0D1322]/80 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-500"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {lang === 'pl'
                    ? '01 · Klarowność wczoraj'
                    : '01 · Yesterday’s Clarity'}
                </span>
                <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
              </div>

              <div>
                <div className="font-mono text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
                  78<span className="text-base font-normal text-slate-400">/100</span>
                </div>
                <p className="text-xs font-medium text-cyan-700 dark:text-cyan-400 mt-1">
                  {lang === 'pl'
                    ? 'Zbalansowany profil D-shape (74% w VA)'
                    : 'Balanced D-shape profile (74% inside VA)'}
                </p>
              </div>

              <div className="flex items-end gap-1 h-8 pt-1" aria-hidden="true">
                {[18, 32, 54, 78, 96, 88, 64, 40, 22].map((h, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{
                      duration: 0.35,
                      delay: idx * 0.03,
                      ease: EASE_OUT_EXPO,
                    }}
                    style={{ height: `${h}%`, transformOrigin: 'bottom' }}
                    className={`flex-1 rounded-t-xs ${
                      idx >= 2 && idx <= 6
                        ? 'bg-cyan-500/85'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {lang === 'pl'
                  ? 'Wysoka symetria rozkładu wokół wczorajszego dPOC bez luk płynności.'
                  : 'High rotational symmetry around yesterday’s dPOC without single-print gaps.'}
              </p>
            </motion.button>

            {/* Quadrant 2 */}
            <motion.button
              type="button"
              variants={prefersReduced ? undefined : staggerCardVariants}
              onClick={() => setSelectedNoteIdx(6)}
              whileHover={{ y: -2, transition: SPRING_TACTILE }}
              whileTap={{ scale: 0.985, y: 0, transition: SPRING_PRESS }}
              className="p-5 flex flex-col justify-between gap-4 text-left cursor-pointer hover:bg-slate-50/70 dark:hover:bg-[#0D1322]/80 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-500"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {lang === 'pl'
                    ? '02 · Paliwo ±1%'
                    : '02 · Liquidation Fuel ±1%'}
                </span>
                <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
              </div>

              <div className="space-y-2.5 font-mono text-xs tabular-nums">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500 dark:text-slate-400">
                      {lang === 'pl' ? 'Poniżej −1,0%:' : 'Below −1.0%:'}
                    </span>
                    <AnimatedTicker
                      value={formatNumber(liqBelowUsd, lang, { compact: true, prefix: '$' })}
                      className="font-semibold text-cyan-700 dark:text-cyan-300"
                    />
                  </div>
                  <div className="h-2 rounded-xs bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${liqScale(liqBelowUsd)}%` }}
                      transition={SPRING_SMOOTH}
                      className="h-full bg-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500 dark:text-slate-400">
                      {lang === 'pl' ? 'Powyżej +1,0%:' : 'Above +1.0%:'}
                    </span>
                    <AnimatedTicker
                      value={formatNumber(liqAboveUsd, lang, { compact: true, prefix: '$' })}
                      className="font-semibold text-indigo-700 dark:text-indigo-300"
                    />
                  </div>
                  <div className="h-2 rounded-xs bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${liqScale(liqAboveUsd)}%` }}
                      transition={SPRING_SMOOTH}
                      className="h-full bg-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {lang === 'pl'
                  ? 'Zagregowane depozyty lewarowane w korytarzu ±1% od ceny mid.'
                  : 'Aggregated leveraged margin clustered within ±1% of current mid.'}
              </p>
            </motion.button>

            {/* Quadrant 3 */}
            <motion.button
              type="button"
              variants={prefersReduced ? undefined : staggerCardVariants}
              onClick={() => setSelectedNoteIdx(1)}
              whileHover={{ y: -2, transition: SPRING_TACTILE }}
              whileTap={{ scale: 0.985, y: 0, transition: SPRING_PRESS }}
              className="p-5 flex flex-col justify-between gap-4 text-left cursor-pointer hover:bg-slate-50/70 dark:hover:bg-[#0D1322]/80 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-500"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {lang === 'pl'
                    ? '03 · Szerokość kolejnej 1h'
                    : '03 · Next Hour Width'}
                </span>
                <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
              </div>

              <div>
                <AnimatedTicker
                  value={formatNumber(typicalHourWidthPct, lang, {
                    decimals: 2,
                    suffix: '%',
                  })}
                  className="font-mono text-3xl font-bold tabular-nums text-slate-900 dark:text-white"
                />
                <p className="text-xs font-mono text-amber-600 dark:text-amber-400 mt-1">
                  ±${formatNumber(typicalHourWidthUsd, lang, { decimals })} (p50 30d)
                </p>
              </div>

              <div className="flex items-end gap-0.5 h-8 pt-1" aria-hidden="true">
                {[25, 22, 30, 68, 62, 48, 42, 85, 95, 76, 52, 34].map((v, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{
                      duration: 0.35,
                      delay: idx * 0.025,
                      ease: EASE_OUT_EXPO,
                    }}
                    style={{ height: `${v}%`, transformOrigin: 'bottom' }}
                    className={`flex-1 rounded-t-xs ${
                      idx === 7
                        ? 'bg-amber-400'
                        : 'bg-slate-200 dark:bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {lang === 'pl'
                  ? '30-dniowa mediana rozstępu High–Low dla bieżącej godziny CET.'
                  : '30-day median High–Low excursion for the upcoming CET session hour.'}
              </p>
            </motion.button>

            {/* Quadrant 4 */}
            <motion.button
              type="button"
              variants={prefersReduced ? undefined : staggerCardVariants}
              onClick={() => setSelectedNoteIdx(4)}
              whileHover={{ y: -2, transition: SPRING_TACTILE }}
              whileTap={{ scale: 0.985, y: 0, transition: SPRING_PRESS }}
              className="p-5 flex flex-col justify-between gap-4 text-left cursor-pointer hover:bg-slate-50/70 dark:hover:bg-[#0D1322]/80 transition-colors focus-visible:outline-2 focus-visible:outline-cyan-500"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {lang === 'pl'
                    ? '04 · Dystans od VWAP'
                    : '04 · Day VWAP Distance'}
                </span>
                <Badge
                  type={asset?.provenance.type || 'SIM'}
                  timestamp={asset?.provenance.timestamp || hlState.lastUpdated}
                  lang={lang}
                />
              </div>

              <div>
                <AnimatedTicker
                  value={formatNumber(vwapDistPct, lang, {
                    decimals: 2,
                    sign: true,
                    suffix: '%',
                  })}
                  className="font-mono text-3xl font-bold tabular-nums text-slate-900 dark:text-white"
                />
                <p className="text-xs font-mono text-cyan-700 dark:text-cyan-400 mt-1">
                  VWAP ${formatNumber(vwapPrice, lang, { decimals })} (+0,78 σ)
                </p>
              </div>

              <div className="space-y-1">
                <div className="relative h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-400" />
                  <motion.div
                    initial={{ left: '50%' }}
                    animate={{ left: '68%' }}
                    transition={SPRING_SMOOTH}
                    className="absolute -top-1 w-2.5 h-4 rounded-xs bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                  />
                </div>
                <div className="flex justify-between font-mono text-[9px] text-slate-400">
                  <span>-2σ</span>
                  <span>-1σ</span>
                  <span>VWAP</span>
                  <span>+1σ</span>
                  <span>+2σ</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {lang === 'pl'
                  ? 'Pozycja ceny mid względem pasm odchylenia standardowego VWAP.'
                  : 'Position of live mid price relative to session VWAP standard deviation bands.'}
              </p>
            </motion.button>
          </motion.div>
        </SpotlightCard>
      </MotionStaggerItem>

      {/* Section 2: Interactive Cross-Linked Price Ladder + Volume Profile */}
      <MotionStaggerGrid className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card
          inheritStagger
          className="lg:col-span-7"
          kicker={
            lang === 'pl'
              ? 'Kliknij poziom, aby podświetlić jego strefę na profilu wolumenu →'
              : 'Click any level to highlight its matching zone on the Volume Profile →'
          }
          title={
            lang === 'pl'
              ? `Mapa dnia (${selectedMarket}-PERP) — Drabinka cenowa i rola aukcyjna`
              : `Day Map (${selectedMarket}-PERP) — Price Ladder & Auction Context`
          }
          provenance={{ type: 'MODEL', timestamp: hlState.lastUpdated }}
          lang={lang}
        >
          <div className="space-y-4">
            <motion.div
              variants={prefersReduced ? undefined : staggerTableBodyVariants}
              initial={prefersReduced ? false : 'hidden'}
              animate="visible"
              className="divide-y divide-slate-100 dark:divide-slate-800/80 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden"
            >
              {dayMapLevels.map((lvl, idx) => {
                const distPct = ((lvl.price - midPrice) / midPrice) * 100;
                const isSelected = selectedNoteIdx === idx;
                const isMid = lvl.id === 'mid';
                return (
                  <motion.div
                    key={lvl.id}
                    variants={prefersReduced ? undefined : staggerTableRowVariants}
                    whileHover={{ x: 4, transition: SPRING_TACTILE }}
                    whileTap={{ scale: 0.99, transition: SPRING_PRESS }}
                    onClick={() => setSelectedNoteIdx(idx)}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedNoteIdx(idx);
                      }
                    }}
                    className={`px-4 py-3 flex items-center justify-between gap-3 cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-cyan-500/12 dark:bg-cyan-500/15'
                        : isMid
                        ? 'bg-slate-50 dark:bg-[#0D1322]'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`font-mono text-xs font-bold w-12 shrink-0 ${lvl.accentColor}`}
                      >
                        {lvl.code}
                      </span>
                      <span className="text-xs font-medium text-slate-900 dark:text-slate-100 truncate">
                        {lvl.label[lang]}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 font-mono text-xs tabular-nums shrink-0">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        ${formatNumber(lvl.price, lang, { decimals })}
                      </span>
                      <span className="w-16 text-right text-slate-500 dark:text-slate-400">
                        {isMid
                          ? '0,00%'
                          : formatNumber(distPct, lang, {
                              decimals: 2,
                              sign: true,
                              suffix: '%',
                            })}
                      </span>
                      <Badge
                        type={lvl.provenance}
                        timestamp={hlState.lastUpdated}
                        lang={lang}
                        className="hidden sm:inline-flex"
                      />
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.div
                key={selectedNoteIdx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                className="p-4 rounded-lg bg-slate-50 dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    {selectedLevel.code} — {selectedLevel.label[lang]} ($
                    {formatNumber(selectedLevel.price, lang, { decimals })})
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {lang === 'pl' ? 'Komentarz strukturalny' : 'Desk structural note'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {selectedLevel.role[lang]}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </Card>

        {/* Cross-Linked Volume Profile Histogram */}
        <Card
          inheritStagger
          className="lg:col-span-5"
          spotlightColor="rgba(129, 140, 248, 0.15)"
          kicker={
            lang === 'pl'
              ? `Aktywne wskazanie na profilu: ${selectedLevel.code}`
              : `Active profile highlight: ${selectedLevel.code}`
          }
          title={
            lang === 'pl'
              ? 'Profil poprzedniej sesji: dVAH / dPOC / dVAL'
              : 'Previous Session Profile: dVAH / dPOC / dVAL'
          }
          provenance={{ type: 'MODEL', timestamp: hlState.lastUpdated }}
          lang={lang}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-50 dark:bg-[#0D1322] border border-slate-200 dark:border-slate-800 font-mono text-xs tabular-nums">
              <div>
                <span className="block text-[10px] font-sans text-slate-400">
                  dVAH (70% górne)
                </span>
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                  ${formatNumber(prevVah, lang, { decimals })}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-sans text-slate-400">
                  dPOC (Kontrola)
                </span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">
                  ${formatNumber(prevPoc, lang, { decimals })}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-sans text-slate-400">
                  dVAL (70% dolne)
                </span>
                <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                  ${formatNumber(prevVal, lang, { decimals })}
                </span>
              </div>
            </div>

            <div
              className="space-y-1.5 py-1"
              role="img"
              aria-label="Previous session volume profile histogram showing VAH, POC, and VAL"
            >
              {profileBuckets.map((b, i) => {
                const handleFocusNearestLevel = () => {
                  let bestIdx = 0;
                  let bestDist = Infinity;
                  dayMapLevels.forEach((lvl, lvlIdx) => {
                    const d = Math.abs(lvl.price - b.price);
                    if (d < bestDist) {
                      bestDist = d;
                      bestIdx = lvlIdx;
                    }
                  });
                  setSelectedNoteIdx(bestIdx);
                };

                return (
                  <button
                    key={i}
                    type="button"
                    onClick={handleFocusNearestLevel}
                    onMouseEnter={handleFocusNearestLevel}
                    className={`w-full flex items-center gap-3 font-mono text-[11px] tabular-nums px-1.5 py-0.5 rounded transition-colors cursor-pointer text-left ${
                      b.isHighlightedByLadder
                        ? 'bg-cyan-500/12 ring-1 ring-cyan-400/55'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <span
                      className={`w-20 text-right ${
                        b.isHighlightedByLadder
                          ? 'text-cyan-600 dark:text-cyan-400 font-semibold'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      ${formatNumber(b.price, lang, { decimals })}
                    </span>
                    <div className="flex-1 h-3 rounded-xs bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${b.volPct}%` }}
                        transition={{
                          duration: 0.35,
                          delay: i * 0.02,
                          ease: EASE_OUT_EXPO,
                        }}
                        className={`h-full rounded-xs ${
                          b.isHighlightedByLadder
                            ? 'bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.65)]'
                            : b.isPoc
                            ? 'bg-amber-500'
                            : b.inValueArea
                            ? 'bg-cyan-500/70 dark:bg-cyan-500/60'
                            : 'bg-slate-300 dark:bg-slate-800'
                        }`}
                      />
                    </div>
                    <span className="w-10 text-right text-[10px] font-semibold text-slate-400">
                      {b.isHighlightedByLadder
                        ? selectedLevel.code
                        : b.isPoc
                        ? 'dPOC'
                        : b.inValueArea
                        ? 'VA'
                        : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                {lang === 'pl'
                  ? 'Szerokość strefy wartości (VA): 2,20%'
                  : 'Value Area (VA) width: 2.20%'}
              </span>
              <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
            </div>
          </div>
        </Card>
      </MotionStaggerGrid>

      <MotionStaggerItem>
        <SessionClock lang={lang} />
      </MotionStaggerItem>
    </MotionStaggerContainer>
  );
};
