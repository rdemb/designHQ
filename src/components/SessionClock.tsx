import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  Language,
  formatNumber,
  getAmsterdamSessionStatus,
  formatCountdown,
} from '../theme/tokens';
import { Badge } from './Badge';
import {
  SpotlightCard,
  EASE_OUT_EXPO,
  SPRING_SMOOTH,
} from './MotionPrimitives';

export interface SessionClockProps {
  lang: Language;
  compact?: boolean;
}

type InspectSessionId = 'asia' | 'london' | 'ny';

const SESSION_SIGNATURES: Record<
  InspectSessionId,
  {
    windowCet: string;
    ibMedianNum: number;
    volumeShareNum: number;
    note: { pl: string; en: string };
    accentText: string;
  }
> = {
  asia: {
    windowCet: '01:00 – 09:00 CET',
    ibMedianNum: 0.42,
    volumeShareNum: 18.4,
    note: {
      pl: 'Węższy zakres rotacyjny i budowanie spoczywających zleceń limit przed otwarciem Frankfurtu/Londynu.',
      en: 'Tighter rotational range building resting limit pools ahead of Frankfurt and London cash opens.',
    },
    accentText: 'text-slate-600 dark:text-slate-300',
  },
  london: {
    windowCet: '09:00 – 17:30 CET',
    ibMedianNum: 0.68,
    volumeShareNum: 33.2,
    note: {
      pl: 'Pierwszy wyraźny skok RVOL o 09:00 CET; częste testowanie ekstremów sesji azjatyckiej i dVAH/dVAL.',
      en: 'Initial RVOL expansion at 09:00 CET; frequent probing of Asia range extremes and prior dVAH/dVAL.',
    },
    accentText: 'text-cyan-700 dark:text-cyan-400',
  },
  ny: {
    windowCet: '15:30 – 22:00 CET',
    ibMedianNum: 0.86,
    volumeShareNum: 48.4,
    note: {
      pl: 'Maksymalna głębokość księgi L2 i najszerszy Initial Balance (15:30–16:30 CET) zsynchronizowany z otwarciem US equity.',
      en: 'Peak L2 book turnover and widest Initial Balance (15:30–16:30 CET) aligned with US cash equity open.',
    },
    accentText: 'text-indigo-700 dark:text-indigo-400',
  },
};

export const SessionClock: React.FC<SessionClockProps> = ({
  lang,
  compact = false,
}) => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [inspectedSession, setInspectedSession] =
    useState<InspectSessionId>('london');
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const status = getAmsterdamSessionStatus(now);
  const progressPct = Math.min(
    100,
    Math.max(0, (status.amsterdamMinutes / 1440) * 100)
  );

  if (compact) {
    return (
      <div className="flex items-center gap-2 font-mono text-xs tabular-nums whitespace-nowrap shrink-0">
        <span className="text-slate-700 dark:text-slate-200 font-medium">
          {status.currentSessionLabel[lang]}
        </span>
        <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
          ·
        </span>
        <span className="text-slate-500 dark:text-slate-400">
          {status.amsterdamTimeStr} CET
        </span>
      </div>
    );
  }

  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progressPct / 100) * circumference;
  const activeSignature = SESSION_SIGNATURES[inspectedSession];

  return (
    <SpotlightCard
      className="p-5"
      spotlightColor="rgba(129, 140, 248, 0.12)"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-4">
          {/* Kinetic Radial Chronometer Dial */}
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
            <svg
              viewBox="0 0 56 56"
              className="w-14 h-14 -rotate-90"
              aria-hidden="true"
            >
              <circle
                cx="28"
                cy="28"
                r={radius}
                fill="none"
                strokeWidth="3"
                className="stroke-slate-200 dark:stroke-slate-800"
              />
              <motion.circle
                cx="28"
                cy="28"
                r={radius}
                fill="none"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={false}
                animate={{ strokeDashoffset: dashOffset }}
                transition={prefersReduced ? { duration: 0 } : SPRING_SMOOTH}
                className="stroke-cyan-500 dark:stroke-cyan-400"
              />
            </svg>
            <span className="absolute font-mono text-[10px] font-semibold tabular-nums text-slate-700 dark:text-slate-200">
              CET
            </span>
          </div>

          <div>
            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-0.5">
              {lang === 'pl'
                ? 'Zegar sesji · Amsterdam / Warszawa'
                : 'Session Chronometer · Amsterdam / CET'}
            </p>
            <div className="flex flex-wrap items-baseline gap-3">
              <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                {status.currentSessionLabel[lang]}
              </h3>
              <span className="font-mono text-sm tabular-nums text-cyan-600 dark:text-cyan-400 font-semibold">
                {status.amsterdamTimeStr}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-1">
          <Badge type="LIVE" timestamp={status.amsterdamTimeStr} lang={lang} />
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
            {lang === 'pl' ? 'Kolejne okno:' : 'Next window:'}{' '}
            <span className="text-slate-900 dark:text-slate-100 font-semibold">
              {status.nextSessionLabel[lang]}
            </span>{' '}
            <span className="text-amber-600 dark:text-amber-400 font-semibold">
              ({formatCountdown(status.countdownSeconds)})
            </span>
          </div>
        </div>
      </div>

      {/* Interactive 24h Amsterdam Timeline Bar */}
      <div className="space-y-2">
        <div
          className="relative h-10 rounded-md bg-slate-100 dark:bg-[#060910] border border-slate-200/80 dark:border-slate-800/90 overflow-hidden"
          role="region"
          aria-label={
            lang === 'pl'
              ? `Oś 24-godzinna sesji: Londyn otwiera 09:00, Nowy Jork otwiera 15:30 czasu Amsterdam. Obecna godzina ${status.amsterdamTimeStr}.`
              : `24-hour session timeline: London opens 09:00, New York opens 15:30 Amsterdam time. Current time ${status.amsterdamTimeStr}.`
          }
        >
          <motion.div
            initial={false}
            animate={{ width: `${progressPct}%` }}
            transition={prefersReduced ? { duration: 0 } : { duration: 0.4 }}
            className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-transparent via-cyan-500/5 to-cyan-500/15 pointer-events-none"
          />

          {/* Interactive Asia Window 01:00 - 09:00 */}
          <button
            type="button"
            onClick={() => setInspectedSession('asia')}
            aria-pressed={inspectedSession === 'asia'}
            style={{ left: '4.17%', width: '33.33%' }}
            className={`absolute top-1.5 bottom-1.5 rounded-xs border-x flex items-center px-2 cursor-pointer transition-colors ${
              inspectedSession === 'asia'
                ? 'bg-slate-300/80 dark:bg-slate-700/75 border-slate-400 dark:border-slate-500'
                : 'bg-slate-200/70 dark:bg-slate-800/60 border-slate-300 dark:border-slate-700/80 hover:bg-slate-300/60 dark:hover:bg-slate-800'
            }`}
          >
            <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300 truncate">
              Asia 01:00–09:00
            </span>
          </button>

          {/* Interactive London Window 09:00 - 17:30 */}
          <button
            type="button"
            onClick={() => setInspectedSession('london')}
            aria-pressed={inspectedSession === 'london'}
            style={{ left: '37.5%', width: '35.42%' }}
            className={`absolute top-1 bottom-1 rounded-xs border-x flex items-center px-2 cursor-pointer transition-colors ${
              inspectedSession === 'london'
                ? 'bg-cyan-500/24 dark:bg-cyan-500/30 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                : 'bg-cyan-500/12 dark:bg-cyan-500/18 border-cyan-500/50 hover:bg-cyan-500/20'
            }`}
          >
            <span className="text-[10px] font-mono font-medium text-cyan-900 dark:text-cyan-200 truncate">
              {lang === 'pl' ? 'Londyn 09:00–17:30' : 'London 09:00–17:30'}
            </span>
          </button>

          {/* Interactive New York Window 15:30 - 22:00 */}
          <button
            type="button"
            onClick={() => setInspectedSession('ny')}
            aria-pressed={inspectedSession === 'ny'}
            style={{ left: '64.58%', width: '27.08%' }}
            className={`absolute top-2 bottom-1 rounded-xs border-x flex items-center justify-end px-2 cursor-pointer transition-colors ${
              inspectedSession === 'ny'
                ? 'bg-indigo-500/28 dark:bg-indigo-500/35 border-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.22)]'
                : 'bg-indigo-500/15 dark:bg-indigo-500/22 border-indigo-500/60 hover:bg-indigo-500/25'
            }`}
          >
            <span className="text-[10px] font-mono font-medium text-indigo-900 dark:text-indigo-200 truncate">
              {lang === 'pl' ? 'Nowy Jork 15:30–22:00' : 'New York 15:30–22:00'}
            </span>
          </button>

          {/* Current time cursor */}
          <motion.div
            initial={false}
            animate={{ left: `${progressPct}%` }}
            transition={prefersReduced ? { duration: 0 } : SPRING_SMOOTH}
            className="absolute top-0 bottom-0 w-0.5 bg-amber-500 dark:bg-amber-400 z-10 pointer-events-none shadow-[0_0_8px_rgba(251,191,36,0.75)]"
          />
        </div>

        <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-400 dark:text-slate-500">
          <span>00:00</span>
          <span>06:00</span>
          <span className="text-cyan-700 dark:text-cyan-400 font-semibold">
            09:00 LDN
          </span>
          <span>12:00</span>
          <span className="text-indigo-700 dark:text-indigo-400 font-semibold">
            15:30 NY
          </span>
          <span>17:30</span>
          <span>22:00</span>
          <span>24:00</span>
        </div>

        {/* Inline Session Microstructure Signature Drawer */}
        <AnimatePresence mode="wait">
          <motion.div
            key={inspectedSession}
            initial={prefersReduced ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
            className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center text-xs"
          >
            <div className="sm:col-span-5 flex items-center gap-4 font-mono tabular-nums">
              <div>
                <span className="block font-sans text-[10px] text-slate-400">
                  {lang === 'pl' ? 'Kliknij okno na osi' : 'Selected session'}
                </span>
                <span className={`font-semibold ${activeSignature.accentText}`}>
                  {activeSignature.windowCet}
                </span>
              </div>
              <div>
                <span className="block font-sans text-[10px] text-slate-400">
                  IB (p50)
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatNumber(activeSignature.ibMedianNum, lang, {
                    decimals: 2,
                    suffix: '%',
                  })}
                </span>
              </div>
              <div>
                <span className="block font-sans text-[10px] text-slate-400">
                  {lang === 'pl' ? 'Udział wol.' : 'Vol. share'}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatNumber(activeSignature.volumeShareNum, lang, {
                    decimals: 1,
                    suffix: '%',
                  })}
                </span>
              </div>
            </div>
            <p className="sm:col-span-7 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              {activeSignature.note[lang]}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
    </SpotlightCard>
  );
};
