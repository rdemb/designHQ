import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MarketSymbol } from '../theme/tokens';
import { EASE_OUT_EXPO, SPRING_SMOOTH } from './MotionPrimitives';

export interface HeroChartBackdropProps {
  market: MarketSymbol;
}

/**
 * Chart-native kinetic backdrop for the Start Hero Header.
 * Draws directly from HyperQuant's candlesticks, VWAP bands, L2 heatmap strata,
 * and Volume Profile nodes — replacing generic decorative geometry.
 */
export const HeroChartBackdrop: React.FC<HeroChartBackdropProps> = ({
  market,
}) => {
  const prefersReduced = useReducedMotion();

  const { candles, vwapPath, upperBandPath, lowerBandPath, volumeNodes } =
    useMemo(() => {
      const seed =
        market === 'BTC'
          ? 0.5
          : market === 'ETH'
          ? 1.4
          : market === 'SOL'
          ? 2.3
          : 3.1;

      const candleList = Array.from({ length: 16 }, (_, i) => {
        const x = 180 + i * 24;
        const center =
          145 - i * 4.5 + Math.sin(i * 0.65 + seed) * 24 + Math.cos(i * 1.1) * 10;
        const h = 14 + Math.abs(Math.sin(i * 0.9 + seed)) * 22;
        const y = Math.max(36, Math.min(220, center - h / 2));
        const bull = Math.sin(i * 1.3 + seed) >= -0.15;
        return {
          x,
          y,
          h,
          wickTop: y - (6 + (i % 3) * 5),
          wickBot: y + h + (6 + ((i + 1) % 3) * 5),
          bull,
        };
      });

      const vwapPts = candleList
        .map(
          (c, i) =>
            `${i === 0 ? 'M' : 'L'} ${c.x + 4} ${(
              c.y +
              c.h / 2 +
              Math.sin(i * 0.4) * 6
            ).toFixed(1)}`
        )
        .join(' ');

      const upperPts = candleList
        .map(
          (c, i) =>
            `${i === 0 ? 'M' : 'L'} ${c.x + 4} ${(
              c.y +
              c.h / 2 -
              26 +
              Math.sin(i * 0.4) * 5
            ).toFixed(1)}`
        )
        .join(' ');

      const lowerPts = candleList
        .map(
          (c, i) =>
            `${i === 0 ? 'M' : 'L'} ${c.x + 4} ${(
              c.y +
              c.h / 2 +
              26 +
              Math.sin(i * 0.4) * 5
            ).toFixed(1)}`
        )
        .join(' ');

      const profile = Array.from({ length: 14 }, (_, i) => {
        const dist = Math.abs(i - 6.5) / 6.5;
        const width = Math.round(
          Math.exp(-Math.pow(dist / 0.55, 2)) * 105 +
            Math.abs(Math.sin(i + seed)) * 22 +
            14
        );
        return {
          y: 34 + i * 15,
          w: width,
          isPoc: i === 6,
          inVa: i >= 4 && i <= 9,
        };
      });

      return {
        candles: candleList,
        vwapPath: vwapPts,
        upperBandPath: upperPts,
        lowerBandPath: lowerPts,
        volumeNodes: profile,
      };
    }, [market]);

  if (prefersReduced) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Subtle Ambient Cyan / Indigo Wash */}
      <motion.div
        animate={{
          x: [0, 28, -14, 0],
          y: [0, -20, 14, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-24 -right-20 w-84 h-84 rounded-full bg-cyan-500/12 dark:bg-cyan-400/10 blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -24, 16, 0],
          y: [0, 18, -12, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -bottom-24 -left-16 w-76 h-76 rounded-full bg-indigo-500/10 dark:bg-indigo-500/10 blur-3xl"
      />

      {/* Chart-Native SVG Layer (Candlesticks + VWAP ±1σ + L2 Strata + Volume Profile) */}
      <svg
        viewBox="0 0 600 260"
        preserveAspectRatio="xMaxYMid slice"
        className="absolute inset-0 w-full h-full opacity-[0.26] dark:opacity-[0.34]"
        fill="none"
      >
        <defs>
          <linearGradient id="heroHeatmapBand" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22D3EE" stopOpacity="0" />
            <stop offset="60%" stopColor="#22D3EE" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id="heroChartFade" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="35%" stopColor="white" stopOpacity="0.35" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>
          <mask id="heroRightMask">
            <rect width="600" height="260" fill="url(#heroChartFade)" />
          </mask>
        </defs>

        <g mask="url(#heroRightMask)">
          {/* L2 Resting Depth Horizontal Liquidity Strata */}
          {[58, 96, 148, 198].map((hy, idx) => (
            <motion.rect
              key={`strata-${idx}`}
              x="160"
              y={hy}
              width="430"
              height={idx % 2 === 0 ? '4' : '2.5'}
              fill="url(#heroHeatmapBand)"
              animate={{ opacity: [0.35, 0.85, 0.35] }}
              transition={{
                duration: 4.5 + idx * 1.1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Volume Profile Horizontal Histogram anchored on right edge */}
          {volumeNodes.map((node, idx) => (
            <motion.rect
              key={`vp-${market}-${idx}`}
              x={592 - node.w}
              y={node.y}
              width={node.w}
              height="9"
              rx="1.5"
              fill={
                node.isPoc
                  ? '#FBBF24'
                  : node.inVa
                  ? '#22D3EE'
                  : '#818CF8'
              }
              fillOpacity={node.isPoc ? 0.55 : node.inVa ? 0.28 : 0.16}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                duration: 0.45,
                delay: idx * 0.025,
                ease: EASE_OUT_EXPO,
              }}
              style={{ transformOrigin: 'right' }}
            />
          ))}

          {/* VWAP ±1σ Outer Band Paths */}
          <motion.path
            d={upperBandPath}
            stroke="#818CF8"
            strokeWidth="1"
            strokeDasharray="3 4"
            strokeOpacity="0.65"
            initial={false}
            animate={{ d: upperBandPath }}
            transition={SPRING_SMOOTH}
          />
          <motion.path
            d={lowerBandPath}
            stroke="#818CF8"
            strokeWidth="1"
            strokeDasharray="3 4"
            strokeOpacity="0.65"
            initial={false}
            animate={{ d: lowerBandPath }}
            transition={SPRING_SMOOTH}
          />

          {/* Primary VWAP Benchmark Curve */}
          <motion.path
            key={`vwap-${market}`}
            d={vwapPath}
            stroke="#22D3EE"
            strokeWidth="1.6"
            strokeOpacity="0.9"
            initial={{ pathLength: 0.2, opacity: 0.3 }}
            animate={{ pathLength: 1, opacity: 0.9, d: vwapPath }}
            transition={{ duration: 0.75, ease: EASE_OUT_EXPO }}
          />

          {/* Candlestick Silhouette Series */}
          {candles.map((c, idx) => (
            <motion.g
              key={`hc-${market}-${idx}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.32,
                delay: idx * 0.022,
                ease: EASE_OUT_EXPO,
              }}
            >
              <line
                x1={c.x + 4}
                y1={c.wickTop}
                x2={c.x + 4}
                y2={c.wickBot}
                stroke={c.bull ? '#22D3EE' : '#FBBF24'}
                strokeWidth="1.2"
                strokeOpacity="0.55"
              />
              <rect
                x={c.x}
                y={c.y}
                width="8"
                height={c.h}
                rx="1.5"
                fill={c.bull ? '#22D3EE' : '#FBBF24'}
                fillOpacity={c.bull ? 0.52 : 0.42}
              />
            </motion.g>
          ))}
        </g>
      </svg>
    </div>
  );
};
