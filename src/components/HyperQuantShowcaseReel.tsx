import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Play,
  Pause,
  RotateCcw,
  ArrowUpRight,
  CandlestickChart,
  Layers,
  Grid2X2,
  Compass,
  Bot,
} from 'lucide-react';
import {
  Language,
  MarketSymbol,
  NavTabId,
  formatNumber,
} from '../theme/tokens';
import { Badge } from './Badge';
import {
  SpotlightCard,
  AnimatedTicker,
  EASE_OUT_EXPO,
  SPRING_SNAPPY,
  SPRING_TACTILE,
  SPRING_PRESS,
} from './MotionPrimitives';

export interface HyperQuantShowcaseReelProps {
  lang: Language;
  market: MarketSymbol;
  midPrice: number;
  timestamp: string;
  onNavigate: (tab: NavTabId) => void;
}

interface ReelSceneMeta {
  id: 'candles' | 'heatmap' | 'footprint' | 'auction' | 'mcp';
  index: string;
  targetTab: NavTabId;
  provenance: 'LIVE' | 'MODEL' | 'SIM';
  icon: React.FC<{ className?: string }>;
  title: { pl: string; en: string };
  tabLabel: { pl: string; en: string };
  subtitle: { pl: string; en: string };
  telemetry: {
    label: { pl: string; en: string };
    value: { pl: string; en: string };
  }[];
}

const SCENE_DURATION_MS = 6000;

const SCENES: ReelSceneMeta[] = [
  {
    id: 'candles',
    index: '01',
    targetTab: 'in-session',
    provenance: 'MODEL',
    icon: CandlestickChart,
    title: {
      pl: 'Wykres świecowy, pasma VWAP ±1σ/2σ i Initial Balance',
      en: 'Candlestick Engine, VWAP ±1σ/2σ Bands & Initial Balance',
    },
    tabLabel: { pl: 'Świece + VWAP', en: 'Candles + VWAP' },
    subtitle: {
      pl: 'Kontekst pierwszej godziny sesji (IBH/IBL), dystans od dziennego VWAP oraz odniesienie do PDH/PDL bez jakichkolwiek strzałek kierunkowych.',
      en: 'First-hour session corridor (IBH/IBL), deviation bands from daily VWAP, and PDH/PDL structural anchors without directional arrows.',
    },
    telemetry: [
      { label: { pl: 'Dystans VWAP', en: 'VWAP Dist' }, value: { pl: '+0,78σ', en: '+0.78σ' } },
      { label: { pl: 'Szerokość IB', en: 'IB Width' }, value: { pl: '0,86%', en: '0.86%' } },
      { label: { pl: 'Budżet ATR', en: 'ATR Budget' }, value: { pl: '64%', en: '64%' } },
    ],
  },
  {
    id: 'heatmap',
    index: '02',
    targetTab: 'in-session',
    provenance: 'SIM',
    icon: Layers,
    title: {
      pl: 'Heatmapa głębi arkusza L2 DOM i strefy absorpcji',
      en: 'L2 DOM Order-Flow Heatmap & Resting Liquidity Absorption',
    },
    tabLabel: { pl: 'Heatmapa L2', en: 'L2 Heatmap' },
    subtitle: {
      pl: 'Wizualizacja spoczywających zleceń limit (skala 0–25 mln USD) oraz miejsc, w których agresywny wolumen spotyka pasywną ścianę płynności.',
      en: 'Continuous visualization of resting limit liquidity ($0–$25M scale) and absorption bursts where market flow meets passive walls.',
    },
    telemetry: [
      { label: { pl: 'Ściana Ask', en: 'Ask Wall' }, value: { pl: '18,4 mln$', en: '$18.4M' } },
      { label: { pl: 'Ściana Bid', en: 'Bid Wall' }, value: { pl: '22,6 mln$', en: '$22.6M' } },
      { label: { pl: 'Agregacja', en: 'Tick Step' }, value: { pl: '10 ticków', en: '10 ticks' } },
    ],
  },
  {
    id: 'footprint',
    index: '03',
    targetTab: 'in-session',
    provenance: 'MODEL',
    icon: Grid2X2,
    title: {
      pl: 'Footprint Bid × Ask, węzły POC i skumulowana delta (CVD)',
      en: 'Bid × Ask Cluster Footprint, Bar POC & Cumulative Delta (CVD)',
    },
    tabLabel: { pl: 'Footprint + CVD', en: 'Footprint + CVD' },
    subtitle: {
      pl: 'Rozbicie każdej świecy na wolumen po stronie Bid i Ask na poszczególnych poziomach cenowych wraz z progiem nierównowagi 300% i krzywą CVD.',
      en: 'Tick-by-tick Bid × Ask volume inside each candle, bar POC highlights, 300% diagonal imbalance detection, and synchronized CVD trace.',
    },
    telemetry: [
      { label: { pl: 'CVD Sesji', en: 'Session CVD' }, value: { pl: '+14,2 mln$', en: '+$14.2M' } },
      { label: { pl: 'Próg Imbal.', en: 'Imbalance' }, value: { pl: '300%', en: '300%' } },
      { label: { pl: 'RVOL', en: 'Session RVOL' }, value: { pl: '1,28×', en: '1.28×' } },
    ],
  },
  {
    id: 'auction',
    index: '04',
    targetTab: 'pre-session',
    provenance: 'MODEL',
    icon: Compass,
    title: {
      pl: 'Mapa Dnia AMT (VAH / POC / VAL) i Paliwo Likwidacyjne ±1%',
      en: 'AMT Day Map (VAH / POC / VAL) & Liquidation Fuel Within ±1%',
    },
    tabLabel: { pl: 'Mapa + Paliwo', en: 'Map + Fuel' },
    subtitle: {
      pl: 'Poranny zestaw „Czterech liczb”: klarowność wczorajszej aukcji, skupiska likwidacji ±1% wokół ceny oraz typowy zasięg kolejnej godziny.',
      en: 'Morning "Four Numbers" framework: yesterday’s auction clarity, ±1% liquidation fuel clusters, and typical next-hour median width.',
    },
    telemetry: [
      { label: { pl: 'Klarowność', en: 'Clarity' }, value: { pl: '0,74', en: '0.74' } },
      { label: { pl: 'Paliwo −1%', en: 'Fuel −1%' }, value: { pl: '22,6 mln$', en: '$22.6M' } },
      { label: { pl: 'Mediana 1h', en: '1h Width' }, value: { pl: '0,62%', en: '0.62%' } },
    ],
  },
  {
    id: 'mcp',
    index: '05',
    targetTab: 'mcp',
    provenance: 'MODEL',
    icon: Bot,
    title: {
      pl: 'Rejestr kalibracji prognoz (Brier) i serwer MCP dla agentów AI',
      en: 'Forecast Calibration Ledger (Brier) & Read-Only MCP Server',
    },
    tabLabel: { pl: 'Kalibracja + MCP', en: 'Ledger + MCP' },
    subtitle: {
      pl: 'Audytowalna krzywa niezawodności po sesji (Brier Score 0,142) oraz otwarty serwer MCP dostarczający kontekst sesyjny bezpośrednio do Claude i ChatGPT.',
      en: 'Auditable post-session reliability curve (0.142 Brier Score) and open-source MCP server streaming deterministic context into Claude & ChatGPT.',
    },
    telemetry: [
      { label: { pl: 'Brier Score', en: 'Brier Score' }, value: { pl: '0,142', en: '0.142' } },
      { label: { pl: 'Próba (90d)', en: 'Sample (90d)' }, value: { pl: 'n = 184', en: 'n = 184' } },
      { label: { pl: 'Tryb MCP', en: 'MCP Mode' }, value: { pl: 'Tylko odczyt', en: 'Read-Only' } },
    ],
  },
];

// Deterministic visual data per scene
const REEL_CANDLES = [
  { x: 46, o: 162, c: 146, h: 138, l: 170, bull: true },
  { x: 74, o: 146, c: 154, h: 140, l: 162, bull: false },
  { x: 102, o: 154, c: 134, h: 128, l: 160, bull: true },
  { x: 130, o: 134, c: 122, h: 114, l: 140, bull: true },
  { x: 158, o: 122, c: 131, h: 118, l: 142, bull: false },
  { x: 186, o: 131, c: 115, h: 106, l: 138, bull: true },
  { x: 214, o: 115, c: 102, h: 95, l: 124, bull: true },
  { x: 242, o: 102, c: 118, h: 98, l: 126, bull: false },
  { x: 270, o: 118, c: 108, h: 100, l: 125, bull: true },
  { x: 298, o: 108, c: 92, h: 84, l: 114, bull: true },
  { x: 326, o: 92, c: 99, h: 86, l: 108, bull: false },
  { x: 354, o: 99, c: 82, h: 74, l: 104, bull: true },
  { x: 382, o: 82, c: 76, h: 66, l: 92, bull: true },
  { x: 410, o: 76, c: 88, h: 72, l: 96, bull: false },
  { x: 438, o: 88, c: 72, h: 62, l: 92, bull: true },
  { x: 466, o: 72, c: 64, h: 55, l: 80, bull: true },
];

const HEATMAP_ROWS = [
  { y: 38, level: '+1,2%', depths: [0.22, 0.28, 0.35, 0.55, 0.72, 0.88, 0.82, 0.6], hot: true },
  { y: 58, level: '+0,9%', depths: [0.18, 0.32, 0.44, 0.4, 0.36, 0.48, 0.52, 0.45], hot: false },
  { y: 78, level: '+0,6%', depths: [0.64, 0.76, 0.85, 0.62, 0.3, 0.24, 0.18, 0.22], hot: true },
  { y: 98, level: '+0,3%', depths: [0.2, 0.25, 0.3, 0.38, 0.42, 0.34, 0.28, 0.31], hot: false },
  { y: 118, level: 'MID', depths: [0.15, 0.18, 0.2, 0.25, 0.22, 0.3, 0.35, 0.4], hot: false },
  { y: 138, level: '−0,3%', depths: [0.28, 0.32, 0.4, 0.48, 0.54, 0.6, 0.5, 0.42], hot: false },
  { y: 158, level: '−0,6%', depths: [0.7, 0.82, 0.92, 0.78, 0.68, 0.55, 0.48, 0.4], hot: true },
  { y: 178, level: '−0,9%', depths: [0.35, 0.42, 0.5, 0.64, 0.74, 0.8, 0.86, 0.92], hot: true },
];

const FOOTPRINT_BARS = [
  {
    x: 54,
    cells: [
      { y: 112, bid: 48, ask: 162, poc: false, imb: true },
      { y: 128, bid: 120, ask: 280, poc: true, imb: false },
      { y: 144, bid: 95, ask: 64, poc: false, imb: false },
      { y: 160, bid: 140, ask: 38, poc: false, imb: true },
    ],
  },
  {
    x: 136,
    cells: [
      { y: 96, bid: 64, ask: 215, poc: false, imb: true },
      { y: 112, bid: 185, ask: 342, poc: true, imb: false },
      { y: 128, bid: 112, ask: 98, poc: false, imb: false },
      { y: 144, bid: 54, ask: 41, poc: false, imb: false },
    ],
  },
  {
    x: 218,
    cells: [
      { y: 80, bid: 78, ask: 294, poc: true, imb: true },
      { y: 96, bid: 130, ask: 188, poc: false, imb: false },
      { y: 112, bid: 210, ask: 62, poc: false, imb: true },
      { y: 128, bid: 68, ask: 55, poc: false, imb: false },
    ],
  },
  {
    x: 300,
    cells: [
      { y: 64, bid: 92, ask: 318, poc: true, imb: true },
      { y: 80, bid: 144, ask: 224, poc: false, imb: false },
      { y: 96, bid: 165, ask: 96, poc: false, imb: false },
      { y: 112, bid: 88, ask: 31, poc: false, imb: false },
    ],
  },
  {
    x: 382,
    cells: [
      { y: 48, bid: 108, ask: 396, poc: true, imb: true },
      { y: 64, bid: 152, ask: 240, poc: false, imb: false },
      { y: 80, bid: 190, ask: 62, poc: false, imb: true },
      { y: 96, bid: 64, ask: 48, poc: false, imb: false },
    ],
  },
];

export const HyperQuantShowcaseReel: React.FC<HyperQuantShowcaseReelProps> = ({
  lang,
  market,
  midPrice,
  timestamp,
  onNavigate,
}) => {
  const prefersReduced = useReducedMotion();
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(() => !prefersReduced);
  const [isHoverPaused, setIsHoverPaused] = useState<boolean>(false);
  const [cycleSeed, setCycleSeed] = useState<number>(0);

  const activeScene = SCENES[activeIdx];
  const shouldAdvance = isPlaying && !isHoverPaused && !prefersReduced;

  useEffect(() => {
    if (!shouldAdvance) return;
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % SCENES.length);
    }, SCENE_DURATION_MS);
    return () => clearInterval(timer);
  }, [shouldAdvance, cycleSeed]);

  const handleSelectScene = (idx: number) => {
    setActiveIdx(idx);
    setCycleSeed((s) => s + 1);
  };

  const handleReplay = () => {
    setCycleSeed((s) => s + 1);
    setIsPlaying(true);
  };

  const decimals = market === 'BTC' ? 0 : market === 'HYPE' ? 2 : 1;

  return (
    <SpotlightCard
      borderBeam
      spotlightColor="rgba(34, 211, 238, 0.14)"
      className="p-5 sm:p-6 overflow-hidden"
    >
      {/* Top Reel Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-cyan-700 dark:text-cyan-400 font-semibold">
              {lang === 'pl'
                ? 'SYMULACJA WIZUALNA SILNIKA HYPERQUANT'
                : 'HYPERQUANT ENGINE VISUAL REEL'}
            </span>
            <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
              ·
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              {activeScene.index} / 0{SCENES.length}
            </span>
            <Badge
              type={activeScene.provenance}
              timestamp={timestamp}
              lang={lang}
            />
          </div>
          <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {lang === 'pl'
              ? 'Zobacz wszystkie wykresy i wskaźniki w ruchu'
              : 'Every HyperQuant Chart & Indicator in Motion'}
          </h2>
        </div>

        {/* Interactive Player Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            type="button"
            whileHover={prefersReduced ? undefined : { scale: 1.03 }}
            whileTap={prefersReduced ? undefined : { scale: 0.96 }}
            onClick={() => setIsPlaying((p) => !p)}
            aria-label={
              isPlaying
                ? lang === 'pl'
                  ? 'Wstrzymaj animację'
                  : 'Pause reel'
                : lang === 'pl'
                ? 'Odtwórz animację'
                : 'Play reel'
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-[#101726] dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 cursor-pointer transition-colors whitespace-nowrap"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>{lang === 'pl' ? 'Pauza' : 'Pause'}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>{lang === 'pl' ? 'Odtwórz' : 'Play'}</span>
              </>
            )}
          </motion.button>

          <motion.button
            type="button"
            whileHover={prefersReduced ? undefined : { scale: 1.03 }}
            whileTap={prefersReduced ? undefined : { scale: 0.96 }}
            onClick={handleReplay}
            aria-label={lang === 'pl' ? 'Powtórz scenę' : 'Replay scene'}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-[#101726] dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 cursor-pointer transition-colors"
            title={lang === 'pl' ? 'Odtwórz ponownie bieżącą scenę' : 'Replay current scene'}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </motion.button>

          <motion.button
            type="button"
            whileHover={prefersReduced ? undefined : { y: -1, transition: SPRING_TACTILE }}
            whileTap={prefersReduced ? undefined : { scale: 0.97, transition: SPRING_PRESS }}
            onClick={() => onNavigate(activeScene.targetTab)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white dark:bg-cyan-400 dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-cyan-300 cursor-pointer transition-colors whitespace-nowrap"
          >
            <span>{lang === 'pl' ? 'Otwórz moduł' : 'Open module'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      {/* Main Cinema Stage + Synchronized Narrative Panel */}
      <div
        onMouseEnter={() => setIsHoverPaused(true)}
        onMouseLeave={() => setIsHoverPaused(false)}
        className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch"
      >
        {/* Left 8 Cols: High-Precision Animated Vector Chart Stage */}
        <div className="lg:col-span-8 relative rounded-xl bg-[#050811] border border-slate-800/90 overflow-hidden min-h-[280px] sm:min-h-[330px] flex flex-col justify-between group">
          {/* OpenBot HUD Corner Reticles */}
          <span aria-hidden="true" className="pointer-events-none absolute top-2 left-2 z-20 w-3 h-3 border-t-2 border-l-2 border-cyan-400/65" />
          <span aria-hidden="true" className="pointer-events-none absolute top-2 right-2 z-20 w-3 h-3 border-t-2 border-r-2 border-cyan-400/65" />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-2 left-2 z-20 w-3 h-3 border-b-2 border-l-2 border-cyan-400/65" />
          <span aria-hidden="true" className="pointer-events-none absolute bottom-2 right-2 z-20 w-3 h-3 border-b-2 border-r-2 border-cyan-400/65" />

          {/* Top Stage Overlay Readout */}
          <div className="relative z-10 px-4 pt-3.5 flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-400">
            <span className="text-cyan-300 font-semibold">
              {market}-PERP · SCENE {activeScene.index}
            </span>
            <span>
              MID ${formatNumber(midPrice, lang, { decimals })} ·{' '}
              {isHoverPaused
                ? lang === 'pl'
                  ? 'PAUZA (NAJAZD)'
                  : 'PAUSED (HOVER)'
                : isPlaying
                ? lang === 'pl'
                  ? 'ODTWARZANIE 60 FPS'
                  : 'PLAYING 60 FPS'
                : lang === 'pl'
                ? 'WSTRZYMANO'
                : 'PAUSED'}
            </span>
          </div>

          {/* Animated SVG Chart Scene Switcher */}
          <div className="relative flex-1 flex items-center justify-center px-2 py-1">
            <AnimatePresence mode="wait">
              {activeScene.id === 'candles' && (
                <motion.svg
                  key={`scene-candles-${cycleSeed}`}
                  viewBox="0 0 560 220"
                  className="w-full h-56 sm:h-64 overflow-visible"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                >
                  {/* Blueprint Grid */}
                  {[44, 88, 132, 176].map((y) => (
                    <line
                      key={y}
                      x1="28"
                      y1={y}
                      x2="512"
                      y2={y}
                      stroke="#1E293B"
                      strokeWidth="0.75"
                      strokeDasharray="3 4"
                    />
                  ))}

                  {/* Initial Balance Shaded Corridor (IBH - IBL) */}
                  <motion.rect
                    x="36"
                    y="104"
                    width="468"
                    height="56"
                    fill="#818CF8"
                    fillOpacity="0.07"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                  <line x1="36" y1="104" x2="504" y2="104" stroke="#818CF8" strokeDasharray="4 4" strokeOpacity="0.65" strokeWidth="1" />
                  <line x1="36" y1="160" x2="504" y2="160" stroke="#818CF8" strokeDasharray="4 4" strokeOpacity="0.65" strokeWidth="1" />
                  <text x="510" y="107" className="fill-indigo-300 font-mono text-[9px]">IBH</text>
                  <text x="510" y="163" className="fill-indigo-300 font-mono text-[9px]">IBL</text>

                  {/* PDH Anchor */}
                  <line x1="36" y1="54" x2="504" y2="54" stroke="#FBBF24" strokeDasharray="2 3" strokeOpacity="0.5" strokeWidth="1" />
                  <text x="510" y="57" className="fill-amber-300 font-mono text-[9px]">PDH</text>

                  {/* VWAP ±1σ Envelope Ribbon */}
                  <motion.path
                    d="M 42 152 Q 180 128, 300 100 T 488 68"
                    fill="none"
                    stroke="#22D3EE"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={prefersReduced ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.3, ease: EASE_OUT_EXPO }}
                  />
                  <motion.path
                    d="M 42 132 Q 180 108, 300 80 T 488 48"
                    fill="none"
                    stroke="#22D3EE"
                    strokeWidth="1"
                    strokeOpacity="0.45"
                    strokeDasharray="3 3"
                    initial={prefersReduced ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.4, delay: 0.1, ease: EASE_OUT_EXPO }}
                  />
                  <motion.path
                    d="M 42 172 Q 180 148, 300 120 T 488 88"
                    fill="none"
                    stroke="#22D3EE"
                    strokeWidth="1"
                    strokeOpacity="0.45"
                    strokeDasharray="3 3"
                    initial={prefersReduced ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.4, delay: 0.1, ease: EASE_OUT_EXPO }}
                  />
                  <text x="510" y="72" className="fill-cyan-300 font-mono text-[9px] font-semibold">VWAP</text>

                  {/* Sequential Candlestick Draw */}
                  {REEL_CANDLES.map((c, idx) => {
                    const top = Math.min(c.o, c.c);
                    const h = Math.max(5, Math.abs(c.c - c.o));
                    return (
                      <motion.g
                        key={idx}
                        initial={prefersReduced ? false : { opacity: 0, scaleY: 0 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{
                          duration: 0.25,
                          delay: prefersReduced ? 0 : idx * 0.065,
                          ease: EASE_OUT_EXPO,
                        }}
                        style={{ transformOrigin: `${c.x + 6}px ${top + h / 2}px` }}
                      >
                        <line
                          x1={c.x + 6}
                          y1={c.h}
                          x2={c.x + 6}
                          y2={c.l}
                          stroke={c.bull ? '#22D3EE' : '#FBBF24'}
                          strokeWidth="1.4"
                          strokeOpacity="0.78"
                        />
                        <rect
                          x={c.x}
                          y={top}
                          width="12"
                          height={h}
                          rx="1.5"
                          fill={c.bull ? '#22D3EE' : '#FBBF24'}
                          fillOpacity={c.bull ? 0.92 : 0.85}
                        />
                      </motion.g>
                    );
                  })}

                  {/* Sweeping Inspection Playhead */}
                  {!prefersReduced && (
                    <motion.line
                      x1="46"
                      y1="26"
                      x2="46"
                      y2="196"
                      stroke="#22D3EE"
                      strokeOpacity="0.45"
                      strokeWidth="1"
                      strokeDasharray="2 3"
                      animate={{ x1: [46, 480], x2: [46, 480] }}
                      transition={{ duration: 5.2, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </motion.svg>
              )}

              {activeScene.id === 'heatmap' && (
                <motion.svg
                  key={`scene-heatmap-${cycleSeed}`}
                  viewBox="0 0 560 220"
                  className="w-full h-56 sm:h-64 overflow-visible"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                >
                  {/* Resting Depth Matrix Cells ($0 -> $25M) */}
                  {HEATMAP_ROWS.map((row, rIdx) => (
                    <g key={row.level}>
                      <text
                        x="42"
                        y={row.y + 11}
                        textAnchor="end"
                        className="fill-slate-400 font-mono text-[9.5px]"
                      >
                        {row.level}
                      </text>
                      {row.depths.map((d, cIdx) => {
                        const x = 52 + cIdx * 57;
                        const fill =
                          d > 0.78
                            ? '#FBBF24'
                            : d > 0.5
                            ? '#22D3EE'
                            : '#38BDF8';
                        return (
                          <motion.rect
                            key={`${rIdx}-${cIdx}`}
                            x={x}
                            y={row.y}
                            width="54"
                            height="16"
                            rx="2"
                            fill={fill}
                            initial={prefersReduced ? false : { opacity: 0.1 }}
                            animate={
                              prefersReduced
                                ? { opacity: Math.max(0.14, d * 0.75) }
                                : {
                                    opacity: [
                                      Math.max(0.12, d * 0.65),
                                      Math.min(0.95, d * 0.92),
                                      Math.max(0.12, d * 0.65),
                                    ],
                                  }
                            }
                            transition={{
                              duration: 2.6 + (cIdx % 3) * 0.6,
                              delay: rIdx * 0.04,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }}
                          />
                        );
                      })}
                    </g>
                  ))}

                  {/* Price Path Navigating Liquidity Shelves */}
                  <motion.path
                    d="M 52 126 L 114 118 L 170 86 L 228 112 L 286 154 L 344 134 L 402 92 L 460 54 L 504 60"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={prefersReduced ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.6, ease: EASE_OUT_EXPO }}
                  />

                  {/* Absorption Ripple Bursts at Key Liquidity Collisions */}
                  {[
                    { cx: 170, cy: 86, delay: 0.4 },
                    { cx: 286, cy: 154, delay: 1.0 },
                    { cx: 460, cy: 54, delay: 1.6 },
                  ].map((node, i) => (
                    <g key={i}>
                      <circle cx={node.cx} cy={node.cy} r="4.5" fill="#FBBF24" stroke="#050811" strokeWidth="1.5" />
                      {!prefersReduced && (
                        <motion.circle
                          cx={node.cx}
                          cy={node.cy}
                          r="6"
                          fill="none"
                          stroke="#FBBF24"
                          strokeWidth="1.5"
                          initial={{ r: 5, opacity: 0.9 }}
                          animate={{ r: 22, opacity: 0 }}
                          transition={{
                            duration: 2,
                            delay: node.delay,
                            repeat: Infinity,
                            ease: 'easeOut',
                          }}
                        />
                      )}
                    </g>
                  ))}
                </motion.svg>
              )}

              {activeScene.id === 'footprint' && (
                <motion.svg
                  key={`scene-footprint-${cycleSeed}`}
                  viewBox="0 0 560 220"
                  className="w-full h-56 sm:h-64 overflow-visible"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                >
                  {/* Footprint Cluster Columns (Bid x Ask) */}
                  {FOOTPRINT_BARS.map((bar, bIdx) => (
                    <motion.g
                      key={bIdx}
                      initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.35,
                        delay: prefersReduced ? 0 : bIdx * 0.11,
                        ease: EASE_OUT_EXPO,
                      }}
                    >
                      {bar.cells.map((cell, cIdx) => (
                        <g key={cIdx}>
                          <rect
                            x={bar.x}
                            y={cell.y}
                            width="68"
                            height="14"
                            rx="2"
                            fill={
                              cell.poc
                                ? '#FBBF24'
                                : cell.imb
                                ? '#22D3EE'
                                : '#1E293B'
                            }
                            fillOpacity={cell.poc ? 0.25 : cell.imb ? 0.18 : 0.65}
                            stroke={
                              cell.poc
                                ? '#FBBF24'
                                : cell.imb
                                ? '#22D3EE'
                                : '#334155'
                            }
                            strokeWidth={cell.poc ? '1.2' : '0.6'}
                          />
                          <text
                            x={bar.x + 34}
                            y={cell.y + 10}
                            textAnchor="middle"
                            className={`font-mono text-[8.5px] tabular-nums ${
                              cell.poc
                                ? 'fill-amber-300 font-semibold'
                                : cell.imb
                                ? 'fill-cyan-300 font-medium'
                                : 'fill-slate-300'
                            }`}
                          >
                            {cell.bid} × {cell.ask}
                          </text>
                        </g>
                      ))}
                    </motion.g>
                  ))}

                  {/* Bottom Synchronized CVD Line Sub-Pane */}
                  <line x1="40" y1="184" x2="510" y2="184" stroke="#334155" strokeWidth="1" />
                  <text x="40" y="178" className="fill-slate-400 font-mono text-[9px]">
                    CVD (Cumulative Volume Delta)
                  </text>
                  <motion.path
                    d="M 54 202 L 136 196 L 218 190 L 300 182 L 382 172 L 478 164"
                    fill="none"
                    stroke="#22D3EE"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={prefersReduced ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.3, ease: EASE_OUT_EXPO }}
                  />
                  <motion.circle
                    cx="478"
                    cy="164"
                    r="3.5"
                    fill="#22D3EE"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9 }}
                  />
                </motion.svg>
              )}

              {activeScene.id === 'auction' && (
                <motion.svg
                  key={`scene-auction-${cycleSeed}`}
                  viewBox="0 0 560 220"
                  className="w-full h-56 sm:h-64 overflow-visible"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                >
                  {/* Left Side: AMT Bell Volume Profile (dVAH / dPOC / dVAL) */}
                  <text x="44" y="30" className="fill-cyan-300 font-mono text-[9.5px] font-semibold">
                    AMT VOLUME PROFILE (dVAH / dPOC / dVAL)
                  </text>
                  {[40, 62, 108, 156, 178, 150, 94, 58, 36].map((w, idx) => {
                    const y = 44 + idx * 16;
                    const isPoc = idx === 3;
                    const inVa = idx >= 2 && idx <= 5;
                    return (
                      <motion.rect
                        key={idx}
                        x="44"
                        y={y}
                        width={w}
                        height="11"
                        rx="2"
                        fill={isPoc ? '#FBBF24' : inVa ? '#22D3EE' : '#818CF8'}
                        fillOpacity={isPoc ? 0.9 : inVa ? 0.55 : 0.32}
                        initial={prefersReduced ? false : { scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: 0.45,
                          delay: prefersReduced ? 0 : idx * 0.05,
                          ease: EASE_OUT_EXPO,
                        }}
                        style={{ transformOrigin: 'left' }}
                      />
                    );
                  })}
                  <line x1="40" y1="92" x2="235" y2="92" stroke="#FBBF24" strokeDasharray="3 3" strokeOpacity="0.8" />
                  <text x="206" y="88" className="fill-amber-300 font-mono text-[9px] font-semibold">
                    dPOC
                  </text>

                  {/* Center Divider */}
                  <line x1="278" y1="26" x2="278" y2="196" stroke="#1E293B" strokeDasharray="3 3" />

                  {/* Right Side: Liquidation Fuel Symmetry ±1% */}
                  <text x="304" y="30" className="fill-indigo-300 font-mono text-[9.5px] font-semibold">
                    LIQUIDATION FUEL (±1% CLUSTER)
                  </text>
                  {[
                    { label: '+1,0%', w: 150, ask: true },
                    { label: '+0,6%', w: 112, ask: true },
                    { label: '+0,3%', w: 58, ask: true },
                    { label: '−0,3%', w: 72, ask: false },
                    { label: '−0,6%', w: 138, ask: false },
                    { label: '−1,0%', w: 176, ask: false },
                  ].map((bar, i) => {
                    const y = 52 + i * 24;
                    return (
                      <g key={bar.label}>
                        <text x="304" y={y + 11} className="fill-slate-400 font-mono text-[9px]">
                          {bar.label}
                        </text>
                        <motion.rect
                          x="342"
                          y={y}
                          width={bar.w}
                          height="14"
                          rx="2"
                          fill={bar.ask ? '#818CF8' : '#22D3EE'}
                          fillOpacity={0.78}
                          initial={prefersReduced ? false : { scaleX: 0 }}
                          animate={{ scaleX: 1 }}
                          transition={{
                            duration: 0.5,
                            delay: prefersReduced ? 0 : 0.15 + i * 0.06,
                            ease: EASE_OUT_EXPO,
                          }}
                          style={{ transformOrigin: 'left' }}
                        />
                      </g>
                    );
                  })}
                </motion.svg>
              )}

              {activeScene.id === 'mcp' && (
                <motion.svg
                  key={`scene-mcp-${cycleSeed}`}
                  viewBox="0 0 560 220"
                  className="w-full h-56 sm:h-64 overflow-visible"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                >
                  {/* Left: Calibration Reliability Curve */}
                  <text x="40" y="28" className="fill-cyan-300 font-mono text-[9.5px] font-semibold">
                    RELIABILITY CURVE (BRIER 0,142)
                  </text>
                  <rect x="40" y="38" width="180" height="150" rx="4" fill="#0B1120" stroke="#1E293B" />
                  <line x1="50" y1="178" x2="210" y2="48" stroke="#475569" strokeDasharray="3 3" strokeWidth="1" />
                  <motion.path
                    d="M 50 176 L 82 152 L 114 128 L 146 98 L 178 72 L 210 50"
                    fill="none"
                    stroke="#22D3EE"
                    strokeWidth="2.2"
                    initial={prefersReduced ? false : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
                  />
                  {[
                    [50, 176],
                    [82, 152],
                    [114, 128],
                    [146, 98],
                    [178, 72],
                    [210, 50],
                  ].map(([cx, cy], idx) => (
                    <motion.circle
                      key={idx}
                      cx={cx}
                      cy={cy}
                      r="3.5"
                      fill="#FBBF24"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.25 + idx * 0.08 }}
                    />
                  ))}

                  {/* Right: MCP Server JSON Stream Frame */}
                  <text x="252" y="28" className="fill-indigo-300 font-mono text-[9.5px] font-semibold">
                    MCP READ-ONLY CONTEXT STREAM
                  </text>
                  <rect x="252" y="38" width="272" height="150" rx="6" fill="#0B1120" stroke="#334155" />
                  {[
                    { txt: 'tool: "hyperquant.get_session_state"', color: 'fill-cyan-300' },
                    { txt: 'vwap_dist_sigma: +0.78', color: 'fill-slate-200' },
                    { txt: 'liq_fuel_minus_1pct: "$22.6M"', color: 'fill-amber-300' },
                    { txt: 'rvol_session: 1.28', color: 'fill-slate-200' },
                    { txt: 'ledger_brier_90d: 0.142', color: 'fill-indigo-300' },
                    { txt: 'directional_signal: null', color: 'fill-slate-400' },
                  ].map((line, i) => (
                    <motion.text
                      key={i}
                      x="268"
                      y={66 + i * 21}
                      className={`font-mono text-[10px] ${line.color}`}
                      initial={prefersReduced ? false : { opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: prefersReduced ? 0 : 0.2 + i * 0.1,
                      }}
                    >
                      {line.txt}
                    </motion.text>
                  ))}
                </motion.svg>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Timeline Progress Sweep Line */}
          <div className="relative h-1 w-full bg-slate-900">
            {shouldAdvance && (
              <motion.div
                key={`progress-${activeIdx}-${cycleSeed}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: SCENE_DURATION_MS / 1000, ease: 'linear' }}
                style={{ transformOrigin: '0%' }}
                className="h-full w-full bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-400"
              />
            )}
          </div>
        </div>

        {/* Right 4 Cols: Scene Context, Metrics & Interactive 5-Chapter Filmstrip */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeScene.id}
                initial={prefersReduced ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: EASE_OUT_EXPO }}
                className="space-y-2.5"
              >
                <div className="flex items-center gap-2 font-mono text-xs text-cyan-700 dark:text-cyan-400 font-semibold">
                  <span>{activeScene.index}</span>
                  <span>·</span>
                  <span>{activeScene.tabLabel[lang]}</span>
                </div>
                <h3 className="font-display text-base font-bold text-slate-900 dark:text-white leading-snug">
                  {activeScene.title[lang]}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeScene.subtitle[lang]}
                </p>

                {/* Live Synchronized Scene Telemetry Grid */}
                <div className="pt-2 grid grid-cols-3 gap-2">
                  {activeScene.telemetry.map((m) => (
                    <div
                      key={m.label.en}
                      className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#0D1322] border border-slate-200/80 dark:border-slate-800"
                    >
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {m.label[lang]}
                      </span>
                      <AnimatedTicker
                        value={m.value[lang]}
                        className="font-mono text-xs font-semibold text-slate-900 dark:text-white tabular-nums mt-0.5 block"
                      />
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* 5-Chapter Interactive Selector List */}
          <div
            role="tablist"
            aria-label={lang === 'pl' ? 'Rozdziały symulacji' : 'Reel chapters'}
            className="space-y-1.5 pt-2 border-t border-slate-200/70 dark:border-slate-800/80"
          >
            {SCENES.map((scene, idx) => {
              const Icon = scene.icon;
              const isSelected = idx === activeIdx;
              return (
                <button
                  key={scene.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => handleSelectScene(idx)}
                  className={`relative w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'text-slate-900 dark:text-cyan-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="reel-chapter-active-bg"
                      transition={SPRING_SNAPPY}
                      className="absolute inset-0 rounded-lg bg-slate-100 dark:bg-[#101726] border border-slate-200 dark:border-cyan-500/40"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2.5 truncate">
                    <span className="font-mono text-[10px] opacity-70">
                      {scene.index}
                    </span>
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{scene.tabLabel[lang]}</span>
                  </span>
                  <span className="relative z-10 font-mono text-[10px] opacity-65 shrink-0">
                    {scene.provenance}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
};
