import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { MarketSymbol } from '../theme/tokens';
import { EASE_OUT_EXPO, SPRING_SMOOTH } from './MotionPrimitives';

export interface HeaderChartWaveformProps {
  market: MarketSymbol;
  change24hPct: number | null;
}

/**
 * Compact header order-flow & price-path sparkline + VWAP anchor line
 * styled after HyperQuant's own candlestick & depth visualizations.
 */
export const HeaderChartWaveform: React.FC<HeaderChartWaveformProps> = ({
  market,
  change24hPct,
}) => {
  const prefersReduced = useReducedMotion();
  const positive = (change24hPct ?? 0) >= 0;

  const { pricePath, vwapPath, candles, endY } = useMemo(() => {
    const seed =
      market === 'BTC'
        ? 0.4
        : market === 'ETH'
        ? 1.5
        : market === 'SOL'
        ? 2.6
        : 3.7;
    const trend = positive ? -0.8 : 0.8;

    const pts: { x: number; y: number }[] = [];
    const candleBars: { x: number; y: number; h: number; bull: boolean }[] = [];

    for (let i = 0; i < 12; i++) {
      const x = 3 + i * 6.5;
      const base =
        13 +
        trend * (i - 5.5) * 0.45 +
        Math.sin(i * 0.85 + seed) * 3.8 +
        Math.cos(i * 1.4 - seed) * 1.6;
      const clampedY = Math.max(3, Math.min(21, base));
      pts.push({ x, y: clampedY });

      const bull = i % 3 !== 0 ? positive : !positive;
      const h = Math.max(3, Math.min(9, 4 + Math.abs(Math.sin(i + seed)) * 5));
      candleBars.push({
        x: x - 1.4,
        y: Math.max(2, Math.min(22 - h, clampedY - h / 2)),
        h,
        bull,
      });
    }

    const d = pts
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(' ');

    const vwapYStart = positive ? 16 : 9;
    const vwapYEnd = positive ? 10 : 15;
    const vwapD = `M 2 ${vwapYStart} Q 38 13, 76 ${vwapYEnd}`;

    return {
      pricePath: d,
      vwapPath: vwapD,
      candles: candleBars,
      endY: pts[pts.length - 1]?.y ?? 12,
    };
  }, [market, positive]);

  return (
    <div
      className="hidden lg:flex items-center gap-2 px-2 py-1 rounded-md bg-slate-100/80 dark:bg-[#0D1322]/90 border border-slate-200/80 dark:border-slate-800/90"
      aria-hidden="true"
      title={`${market}-PERP Microstructure Contour`}
    >
      <svg viewBox="0 0 80 24" className="w-[74px] h-[22px] overflow-visible">
        {/* Background micro-candlesticks */}
        {candles.map((c, idx) => (
          <motion.rect
            key={`${market}-c-${idx}`}
            x={c.x}
            width="2.6"
            rx="0.6"
            initial={false}
            animate={{ y: c.y, height: c.h }}
            transition={prefersReduced ? { duration: 0 } : SPRING_SMOOTH}
            fill={c.bull ? '#22D3EE' : '#FBBF24'}
            fillOpacity="0.28"
          />
        ))}

        {/* Dashed VWAP benchmark */}
        <motion.path
          d={vwapPath}
          fill="none"
          stroke="#818CF8"
          strokeWidth="1"
          strokeDasharray="2 2"
          strokeOpacity="0.7"
          initial={false}
          animate={{ d: vwapPath }}
          transition={prefersReduced ? { duration: 0 } : SPRING_SMOOTH}
        />

        {/* Price microstructure spline */}
        <motion.path
          key={market}
          d={pricePath}
          fill="none"
          stroke={positive ? '#22D3EE' : '#FBBF24'}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={prefersReduced ? false : { pathLength: 0.3, opacity: 0.5 }}
          animate={{ pathLength: 1, opacity: 1, d: pricePath }}
          transition={
            prefersReduced
              ? { duration: 0 }
              : { duration: 0.45, ease: EASE_OUT_EXPO }
          }
        />

        {/* Active endpoint marker */}
        <motion.circle
          cx="74.5"
          r="2.2"
          initial={false}
          animate={{ cy: endY }}
          transition={prefersReduced ? { duration: 0 } : SPRING_SMOOTH}
          fill={positive ? '#22D3EE' : '#FBBF24'}
        />
      </svg>

      {/* OpenBot-inspired L2 Bid/Ask Horizon Balance Bar */}
      <div className="flex flex-col gap-0.5 w-8" title="L2 Bid / Ask Depth Balance">
        <div className="flex justify-between font-mono text-[8px] leading-none text-slate-400">
          <span>B</span>
          <span>A</span>
        </div>
        <div className="h-1 w-full rounded-full bg-indigo-500/40 overflow-hidden flex">
          <motion.div
            initial={false}
            animate={{ width: positive ? '58%' : '44%' }}
            transition={prefersReduced ? { duration: 0 } : SPRING_SMOOTH}
            className="h-full bg-cyan-400 rounded-full"
          />
        </div>
      </div>
    </div>
  );
};
