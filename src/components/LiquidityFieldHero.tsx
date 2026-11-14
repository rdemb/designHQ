import React, { useMemo, useState, useEffect } from 'react';
import * as d3 from 'd3';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Language,
  MarketSymbol,
  formatNumber,
  formatTimeAmsterdam,
} from '../theme/tokens';
import { Badge } from './Badge';
import {
  SPRING_SMOOTH,
  SPRING_SNAPPY,
  AnimatedTicker,
  SpotlightCard,
  EASE_OUT_EXPO,
} from './MotionPrimitives';
import { LiquidityTerrain3D } from './LiquidityTerrain3D';

export interface LiquidityFieldHeroProps {
  lang: Language;
  market?: MarketSymbol;
  midPrice: number;
  provenanceType: 'LIVE' | 'SIM';
  timestamp: string;
}

interface DepthStratum {
  id: number;
  offsetPct: number;
  side: 'bid' | 'ask';
  restingLiquidityUsd: number;
  liqClusterUsd: number;
  volumeProfilePct: number;
  isKeyAuctionNode?: 'dVAH' | 'dPOC' | 'dVAL' | 'PDH' | 'PDL';
}

type FieldViewMode = 'terrain3d' | 'liquidity' | 'profile' | 'fuel';

export const LiquidityFieldHero: React.FC<LiquidityFieldHeroProps> = ({
  lang,
  market = 'BTC',
  midPrice,
  provenanceType,
  timestamp,
}) => {
  const [phase, setPhase] = useState<number>(0);
  const [viewMode, setViewMode] = useState<FieldViewMode>('terrain3d');
  const [hoveredIdx, setHoveredIdx] = useState<number>(15);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    if (prefersReduced || viewMode === 'terrain3d') return;
    const timer = setInterval(() => {
      setPhase((p) => (p + 1) % 360);
    }, 950);
    return () => clearInterval(timer);
  }, [prefersReduced, viewMode]);

  const strata: DepthStratum[] = useMemo(() => {
    const levels: DepthStratum[] = [];
    const total = 30;
    for (let i = 0; i < total; i++) {
      const norm = (total / 2 - i - 0.5) / (total / 2);
      const offsetPct = Number((norm * 1.25).toFixed(2));
      const side: 'bid' | 'ask' = offsetPct < 0 ? 'bid' : 'ask';
      const wave =
        Math.sin(i * 0.55 + phase * 0.35) * 0.13 +
        Math.cos(i * 0.28 - phase * 0.22) * 0.07;
      const cluster =
        Math.exp(-Math.pow((Math.abs(offsetPct) - 0.56) / 0.34, 2)) * 0.8 +
        0.2;
      const bellCurve = Math.exp(-Math.pow((offsetPct + 0.06) / 0.5, 2));

      const restingLiquidityUsd = Math.round(
        Math.max(0.14, cluster + wave) * 22_400_000
      );
      const liqClusterUsd = Math.round(
        Math.max(0.1, Math.pow(Math.abs(offsetPct), 1.32) * 0.82 + Math.abs(wave)) *
          19_800_000
      );
      const volumeProfilePct = Math.round(
        Math.min(98, Math.max(8, bellCurve * 90 + wave * 24 + 8))
      );

      let isKeyAuctionNode: DepthStratum['isKeyAuctionNode'];
      if (i === 2) isKeyAuctionNode = 'PDH';
      if (i === 7) isKeyAuctionNode = 'dVAH';
      if (i === 16) isKeyAuctionNode = 'dPOC';
      if (i === 22) isKeyAuctionNode = 'dVAL';
      if (i === 27) isKeyAuctionNode = 'PDL';

      levels.push({
        id: i,
        offsetPct,
        side,
        restingLiquidityUsd,
        liqClusterUsd,
        volumeProfilePct,
        isKeyAuctionNode,
      });
    }
    return levels;
  }, [phase]);

  const xScale = useMemo(
    () => d3.scaleLinear().domain([0, 25_000_000]).range([12, 208]),
    []
  );

  const profileScale = useMemo(
    () => d3.scaleLinear().domain([0, 100]).range([16, 330]),
    []
  );

  const { bidContourPath, askContourPath } = useMemo(() => {
    const lineGen = d3
      .line<{ x: number; y: number }>()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(d3.curveCatmullRom.alpha(0.5));

    const bidPts: { x: number; y: number }[] = [];
    const askPts: { x: number; y: number }[] = [];

    strata.forEach((s, idx) => {
      const y = 16 + idx * 9.2;
      const metricVal =
        viewMode === 'liquidity' ? s.restingLiquidityUsd : s.liqClusterUsd;
      const w =
        viewMode === 'profile'
          ? profileScale(s.volumeProfilePct)
          : xScale(metricVal);

      if (viewMode === 'profile') {
        askPts.push({ x: 88 + w, y });
      } else if (s.side === 'ask') {
        askPts.push({ x: 270 + w, y });
      } else {
        bidPts.push({ x: 270 - w, y });
      }
    });

    return {
      bidContourPath: lineGen(bidPts) || '',
      askContourPath: lineGen(askPts) || '',
    };
  }, [strata, viewMode, xScale, profileScale]);

  const activeStratum = strata[hoveredIdx] || strata[16];
  const levelPrice = Math.round(midPrice * (1 + activeStratum.offsetPct / 100));
  const scannerY = 16 + hoveredIdx * 9.2;

  const modes: { id: FieldViewMode; label: string }[] = [
    { id: 'terrain3d', label: '3D WebGL' },
    { id: 'liquidity', label: lang === 'pl' ? 'Arkusz L2' : 'L2 Depth' },
    { id: 'fuel', label: lang === 'pl' ? 'Paliwo ±1%' : 'Liq Fuel' },
    { id: 'profile', label: lang === 'pl' ? 'Profil AMT' : 'AMT Profile' },
  ];

  return (
    <SpotlightCard
      borderBeam
      className="p-5 flex flex-col justify-between h-full select-none"
      spotlightColor="rgba(34, 211, 238, 0.16)"
    >
      {/* Top Instrument Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200/80 dark:border-slate-800/90">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-semibold tracking-wider text-cyan-600 dark:text-cyan-400">
              ORDER-FLOW LANDSCAPE · ±1,25%
            </span>
            <Badge
              type="MODEL"
              timestamp={timestamp || formatTimeAmsterdam()}
              lang={lang}
            />
          </div>
          <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-white mt-0.5">
            {lang === 'pl'
              ? 'Żywe pole płynności i węzłów aukcji'
              : 'Living Order-Flow Field & Auction Nodes'}
          </h3>
        </div>

        {/* Interactive 4-Mode Switcher (3D WebGL + 3 D3 modes) */}
        <div
          role="group"
          aria-label="Field visualization mode"
          className="inline-flex rounded-md bg-slate-100 dark:bg-[#111827] p-0.5 border border-slate-200 dark:border-slate-800 font-mono text-[10px]"
        >
          {modes.map((m) => {
            const isActive = viewMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setViewMode(m.id)}
                className={`relative px-2 py-1 rounded-xs transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-slate-900 dark:text-cyan-300 font-semibold'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="hero-field-mode-pill"
                    transition={SPRING_SNAPPY}
                    className="absolute inset-0 rounded-xs bg-white dark:bg-cyan-500/20 border border-slate-200/80 dark:border-cyan-500/40 shadow-2xs"
                  />
                )}
                <span className="relative z-10">{m.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Central Interactive Viewport: 3D WebGL Terrain OR D3 Strata Field */}
      <div className="my-3 relative h-72 group">
        {/* OpenBot-inspired Precision HUD Corner Reticles */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-1 -left-1 z-20 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-500/60 dark:border-cyan-400/70 transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-1 -right-1 z-20 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-500/60 dark:border-cyan-400/70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-1 -left-1 z-20 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-500/60 dark:border-cyan-400/70 transition-transform duration-200 group-hover:-translate-x-0.5 group-hover:translate-y-0.5"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-1 -right-1 z-20 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-500/60 dark:border-cyan-400/70 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:translate-y-0.5"
        />

        <AnimatePresence mode="wait">
          {viewMode === 'terrain3d' ? (
            <motion.div
              key="terrain3d"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              className="relative w-full h-full rounded-lg bg-slate-950/95 border border-slate-800/80 overflow-hidden"
            >
              <LiquidityTerrain3D className="w-full h-full" market={market} />

              {/* Crisp HUD Annotations over 3D Terrain */}
              <div className="pointer-events-none absolute top-3 left-3 right-3 flex items-center justify-between font-mono text-[10px]">
                <span className="text-cyan-400 font-medium">
                  {lang === 'pl' ? 'GRZBIET BID (−1,25%)' : 'BID RIDGE (−1.25%)'}
                </span>
                <span className="text-amber-400 font-semibold">
                  {market} MID ${formatNumber(midPrice, lang, { decimals: market === 'HYPE' ? 2 : 0 })}
                </span>
                <span className="text-indigo-400 font-medium">
                  {lang === 'pl' ? 'GRZBIET ASK (+1,25%)' : 'ASK RIDGE (+1.25%)'}
                </span>
              </div>

              {/* OpenBot-inspired Bid/Ask Horizon Equilibrium Gimbal + Orbit Hint */}
              <div className="pointer-events-none absolute bottom-2.5 left-3 right-3 flex items-center justify-between gap-3 font-mono text-[10px] text-slate-400">
                <span className="hidden sm:inline">
                  {lang === 'pl'
                    ? 'Przesuń kursor, aby zmienić perspektywę 3D'
                    : 'Move pointer to orbit 3D liquidity surface'}
                </span>
                <div className="flex items-center gap-2 mx-auto sm:mx-0">
                  <span className="text-cyan-400">BID 54%</span>
                  <div className="relative w-20 h-1 rounded-full bg-indigo-500/40 overflow-hidden">
                    <motion.div
                      initial={false}
                      animate={{ width: market === 'ETH' ? '51%' : market === 'SOL' ? '56%' : '54%' }}
                      transition={prefersReduced ? { duration: 0 } : SPRING_SMOOTH}
                      className="h-full bg-cyan-400 rounded-full"
                    />
                  </div>
                  <span className="text-indigo-300">ASK 46%</span>
                </div>
                <span>Three.js WebGL</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="d3strata"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              className="w-full h-full flex items-center"
            >
              <svg
                viewBox="0 0 540 302"
                className="w-full h-72 overflow-visible"
                role="img"
                aria-label="Order-flow liquidity topography"
              >
                <defs>
                  <linearGradient id="hqAskGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#818CF8" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.92" />
                  </linearGradient>
                  <linearGradient id="hqBidGrad" x1="100%" y1="0%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#22D3EE" stopOpacity="0.92" />
                  </linearGradient>
                  <linearGradient id="hqProfileGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.22" />
                    <stop offset="65%" stopColor="#22D3EE" stopOpacity="0.72" />
                    <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.95" />
                  </linearGradient>
                </defs>

                {[90, 180, 270, 360, 450].map((gx) => (
                  <line
                    key={gx}
                    x1={gx}
                    y1="10"
                    x2={gx}
                    y2="292"
                    stroke="currentColor"
                    className={
                      gx === 270
                        ? 'text-cyan-500/45 dark:text-cyan-400/45'
                        : 'text-slate-200/70 dark:text-slate-800/70'
                    }
                    strokeDasharray={gx === 270 ? '3 3' : '1 4'}
                    strokeWidth="1"
                  />
                ))}

                <motion.line
                  x1="14"
                  x2="528"
                  initial={false}
                  animate={{ y1: scannerY, y2: scannerY }}
                  transition={prefersReduced ? { duration: 0 } : SPRING_SNAPPY}
                  stroke="#22D3EE"
                  strokeOpacity="0.45"
                  strokeWidth="1"
                  strokeDasharray="2 3"
                />

                {bidContourPath && viewMode !== 'profile' && (
                  <motion.path
                    d={bidContourPath}
                    fill="none"
                    stroke="#22D3EE"
                    strokeWidth="1.5"
                    strokeOpacity="0.55"
                    initial={false}
                    animate={{ d: bidContourPath }}
                    transition={prefersReduced ? { duration: 0 } : SPRING_SMOOTH}
                  />
                )}
                {askContourPath && (
                  <motion.path
                    d={askContourPath}
                    fill="none"
                    stroke={viewMode === 'profile' ? '#FBBF24' : '#A78BFA'}
                    strokeWidth="1.5"
                    strokeOpacity="0.6"
                    initial={false}
                    animate={{ d: askContourPath }}
                    transition={prefersReduced ? { duration: 0 } : SPRING_SMOOTH}
                  />
                )}

                {strata.map((s, idx) => {
                  const y = 16 + idx * 9.2;
                  const isAsk = s.side === 'ask';
                  const isHovered = hoveredIdx === idx;

                  const metricVal =
                    viewMode === 'liquidity'
                      ? s.restingLiquidityUsd
                      : s.liqClusterUsd;

                  const barWidth =
                    viewMode === 'profile'
                      ? profileScale(s.volumeProfilePct)
                      : xScale(metricVal);

                  const x =
                    viewMode === 'profile'
                      ? 88
                      : isAsk
                      ? 270
                      : 270 - barWidth;

                  const fillUrl =
                    viewMode === 'profile'
                      ? 'url(#hqProfileGrad)'
                      : isAsk
                      ? 'url(#hqAskGrad)'
                      : 'url(#hqBidGrad)';

                  const nodeCx =
                    viewMode === 'profile'
                      ? 88 + barWidth
                      : isAsk
                      ? 270 + barWidth
                      : 270 - barWidth;

                  return (
                    <g
                      key={s.id}
                      onMouseEnter={() => setHoveredIdx(idx)}
                      onFocus={() => setHoveredIdx(idx)}
                      className="cursor-crosshair"
                    >
                      <rect
                        x="10"
                        y={y - 4.5}
                        width="520"
                        height="9"
                        fill="transparent"
                      />

                      {idx % 3 === 0 && (
                        <text
                          x="76"
                          y={y + 3}
                          textAnchor="end"
                          className={`font-mono text-[9.5px] tabular-nums ${
                            isHovered
                              ? 'fill-cyan-500 font-semibold'
                              : 'fill-slate-400 dark:fill-slate-500'
                          }`}
                        >
                          ${formatNumber(Math.round(midPrice * (1 + s.offsetPct / 100)), lang)}
                        </text>
                      )}

                      <motion.rect
                        y={y - 2.8}
                        height={isHovered ? 6.8 : 5.4}
                        rx={1.5}
                        fill={fillUrl}
                        initial={false}
                        animate={{
                          x,
                          width: barWidth,
                          opacity: isHovered ? 1 : 0.82,
                        }}
                        transition={
                          prefersReduced
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 260, damping: 28 }
                        }
                      />

                      <motion.circle
                        cy={y}
                        r={s.isKeyAuctionNode ? 4 : isHovered ? 3.2 : 1.8}
                        initial={false}
                        animate={{ cx: nodeCx }}
                        transition={
                          prefersReduced
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 260, damping: 28 }
                        }
                        className={
                          s.isKeyAuctionNode
                            ? 'fill-amber-400 stroke-slate-950 stroke-1'
                            : isAsk
                            ? 'fill-indigo-400'
                            : 'fill-cyan-400'
                        }
                      />

                      {s.isKeyAuctionNode && (
                        <text
                          x="530"
                          y={y + 3}
                          textAnchor="end"
                          className="fill-amber-600 dark:fill-amber-400 font-mono text-[10px] font-semibold"
                        >
                          {s.isKeyAuctionNode} ({s.offsetPct > 0 ? `+${s.offsetPct}%` : `${s.offsetPct}%`})
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Live Readout Strip */}
      <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/90 grid grid-cols-3 gap-3 text-xs font-mono tabular-nums bg-slate-50/70 dark:bg-[#0D1322] -mx-5 -mb-5 px-5 py-3">
        <div>
          <span className="block font-sans text-[10px] text-slate-500 dark:text-slate-400">
            {viewMode === 'terrain3d'
              ? lang === 'pl'
                ? 'Węzeł kontroli (dPOC)'
                : 'Control Node (dPOC)'
              : lang === 'pl'
              ? 'Badany poziom cenowy'
              : 'Inspected price stratum'}
          </span>
          <AnimatedTicker
            value={`$${formatNumber(levelPrice, lang)} (${
              activeStratum.offsetPct > 0
                ? `+${activeStratum.offsetPct}%`
                : `${activeStratum.offsetPct}%`
            })`}
            className="font-semibold text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <span className="block font-sans text-[10px] text-slate-500 dark:text-slate-400">
            {viewMode === 'fuel'
              ? lang === 'pl'
                ? 'Paliwo likwidacyjne'
                : 'Liquidation fuel'
              : lang === 'pl'
              ? 'Spoczywająca płynność L2'
              : 'Resting L2 depth'}
          </span>
          <AnimatedTicker
            value={formatNumber(
              viewMode === 'fuel'
                ? activeStratum.liqClusterUsd
                : activeStratum.restingLiquidityUsd,
              lang,
              { compact: true, prefix: '$' }
            )}
            className="font-semibold text-cyan-700 dark:text-cyan-300"
          />
        </div>
        <div className="text-right">
          <span className="block font-sans text-[10px] text-slate-500 dark:text-slate-400">
            {lang === 'pl' ? 'Kotwica Mid (Hyperliquid)' : 'Mid Anchor (Hyperliquid)'}
          </span>
          <AnimatedTicker
            value={`${provenanceType} · $${formatNumber(midPrice, lang)}`}
            className="font-semibold text-amber-600 dark:text-amber-400"
          />
        </div>
      </div>
    </SpotlightCard>
  );
};
