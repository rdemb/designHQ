import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Language } from '../theme/tokens';
import { EASE_OUT_EXPO } from './MotionPrimitives';

export interface DeskBootLoaderProps {
  lang: Language;
}

const BOOT_CANDLES = [
  { x: 26, y: 44, h: 14, wickTop: 38, wickBot: 64, bull: true },
  { x: 46, y: 38, h: 18, wickTop: 31, wickBot: 60, bull: true },
  { x: 66, y: 42, h: 12, wickTop: 36, wickBot: 58, bull: false },
  { x: 86, y: 30, h: 20, wickTop: 22, wickBot: 54, bull: true },
  { x: 106, y: 26, h: 15, wickTop: 18, wickBot: 46, bull: false },
  { x: 126, y: 20, h: 22, wickTop: 12, wickBot: 45, bull: true },
  { x: 146, y: 16, h: 14, wickTop: 10, wickBot: 34, bull: true },
];

/**
 * Brief, non-blocking studio HUD initialization curtain featuring an animated
 * candlestick + VWAP spline sweep. Automatically skipped when prefers-reduced-motion is set.
 */
export const DeskBootLoader: React.FC<DeskBootLoaderProps> = ({ lang }) => {
  const prefersReduced = useReducedMotion();
  const [visible, setVisible] = useState<boolean>(() => !prefersReduced);

  useEffect(() => {
    if (prefersReduced) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => {
      setVisible(false);
    }, 920);
    return () => clearTimeout(timer);
  }, [prefersReduced]);

  if (prefersReduced) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="hyperquant-boot-curtain"
          aria-hidden="true"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            y: -14,
            filter: 'blur(6px)',
            transition: { duration: 0.42, ease: EASE_OUT_EXPO },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#05070C]/98 backdrop-blur-xl pointer-events-none select-none"
        >
          {/* Precision HUD Corner Frame */}
          <div className="relative w-72 sm:w-84 p-6 rounded-2xl border border-slate-800/90 bg-[#0A0F1A]/90 shadow-[0_24px_80px_rgba(0,0,0,0.85)] overflow-hidden">
            {/* Corner Reticles */}
            <span className="absolute top-2.5 left-2.5 w-2.5 h-2.5 border-t border-l border-cyan-400/70" />
            <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 border-t border-r border-cyan-400/70" />
            <span className="absolute bottom-2.5 left-2.5 w-2.5 h-2.5 border-b border-l border-cyan-400/70" />
            <span className="absolute bottom-2.5 right-2.5 w-2.5 h-2.5 border-b border-r border-cyan-400/70" />

            {/* Animated Chart & VWAP Waveform */}
            <div className="flex flex-col items-center gap-4">
              <svg
                viewBox="0 0 180 76"
                className="w-48 h-20 overflow-visible"
                fill="none"
              >
                {/* Faint Grid Lines */}
                {[18, 38, 58].map((gy) => (
                  <line
                    key={gy}
                    x1="10"
                    y1={gy}
                    x2="170"
                    y2={gy}
                    stroke="#1E293B"
                    strokeWidth="0.75"
                    strokeDasharray="2 4"
                  />
                ))}

                {/* Volume Profile Horizontal Micro-Bars */}
                {[12, 22, 34, 48, 30, 18].map((w, idx) => (
                  <motion.rect
                    key={idx}
                    x={168 - w}
                    y={12 + idx * 9}
                    width={w}
                    height="5"
                    rx="1"
                    fill="#818CF8"
                    fillOpacity="0.28"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.08 + idx * 0.04,
                      ease: EASE_OUT_EXPO,
                    }}
                    style={{ transformOrigin: 'right' }}
                  />
                ))}

                {/* Sequential Candlestick Unfold */}
                {BOOT_CANDLES.map((c, idx) => (
                  <motion.g
                    key={idx}
                    initial={{ opacity: 0, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    transition={{
                      duration: 0.24,
                      delay: 0.05 + idx * 0.055,
                      ease: EASE_OUT_EXPO,
                    }}
                    style={{ transformOrigin: `${c.x + 4}px ${c.y + c.h / 2}px` }}
                  >
                    <line
                      x1={c.x + 4}
                      y1={c.wickTop}
                      x2={c.x + 4}
                      y2={c.wickBot}
                      stroke={c.bull ? '#22D3EE' : '#FBBF24'}
                      strokeWidth="1.2"
                      strokeOpacity="0.75"
                    />
                    <rect
                      x={c.x}
                      y={c.y}
                      width="8"
                      height={c.h}
                      rx="1.5"
                      fill={c.bull ? '#22D3EE' : '#FBBF24'}
                      fillOpacity={c.bull ? 0.9 : 0.8}
                    />
                  </motion.g>
                ))}

                {/* Sweeping VWAP Spline */}
                <motion.path
                  d="M 16 58 Q 52 50, 88 41 T 164 21"
                  stroke="#38BDF8"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0.4 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
                />
              </svg>

              <div className="w-full space-y-2 text-center">
                <div className="flex items-center justify-center gap-2">
                  <span className="font-display font-bold text-base tracking-tight text-white">
                    HyperQuant
                  </span>
                  <span className="font-mono text-[10px] text-cyan-400">
                    HYPERLIQUID L1
                  </span>
                </div>

                <p className="font-mono text-[11px] text-slate-400">
                  {lang === 'pl'
                    ? 'Synchronizacja arkusza L2 i profilu aukcji...'
                    : 'Synchronizing L2 orderbook & auction profile...'}
                </p>

                {/* Smooth Progress Sweep Bar */}
                <div className="h-0.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.78, ease: EASE_OUT_EXPO }}
                    style={{ transformOrigin: '0%' }}
                    className="h-full w-full bg-gradient-to-r from-cyan-500 via-cyan-300 to-indigo-400 shadow-[0_0_12px_rgba(34,211,238,0.85)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
