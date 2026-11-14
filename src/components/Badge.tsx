import React from 'react';
import { ProvenanceType, Language } from '../theme/tokens';

export interface BadgeProps {
  type: ProvenanceType;
  timestamp: string;
  lang?: Language;
  className?: string;
}

const PROVENANCE_TOOLTIPS: Record<ProvenanceType, { pl: string; en: string }> = {
  LIVE: {
    pl: 'Dane na żywo bezpośrednio z Hyperliquid L1 Info API (allMids / metaAndAssetCtxs)',
    en: 'Live telemetry directly from Hyperliquid L1 Info API (allMids / metaAndAssetCtxs)',
  },
  MODEL: {
    pl: 'Wartość wyliczona przez deterministyczny model mikrostruktury HyperQuant',
    en: 'Computed by the deterministic HyperQuant microstructure model',
  },
  SIM: {
    pl: 'Dane symulowane / referencyjne dla prototypu lub oczekujących rynków HIP-3',
    en: 'Simulated / reference data for prototype or pending HIP-3 markets',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  type,
  timestamp,
  lang = 'pl',
  className = '',
}) => {
  const toneClass =
    type === 'LIVE'
      ? 'text-cyan-700 dark:text-cyan-300'
      : type === 'MODEL'
      ? 'text-violet-700 dark:text-violet-300'
      : 'text-amber-700 dark:text-amber-300';

  const tooltip = PROVENANCE_TOOLTIPS[type][lang];

  return (
    <span
      title={tooltip}
      aria-label={`${type} ${timestamp} — ${tooltip}`}
      className={`inline-flex items-center gap-1.5 font-mono text-[11px] leading-none tracking-tight tabular-nums select-none whitespace-nowrap shrink-0 ${className}`}
    >
      <span className={`font-semibold ${toneClass}`}>{type}</span>
      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
        ·
      </span>
      <time className="text-slate-500 dark:text-slate-400">{timestamp}</time>
    </span>
  );
};

export interface MissingValueProps {
  reason: string;
  className?: string;
}

export const MissingValue: React.FC<MissingValueProps> = ({ reason, className = '' }) => {
  return (
    <span
      tabIndex={0}
      title={reason}
      aria-label={`Brak danych / Missing data: ${reason}`}
      className={`group relative inline-flex items-center gap-1 font-mono text-slate-400 dark:text-slate-500 cursor-help border-b border-dashed border-slate-400 dark:border-slate-600 focus-visible:outline-2 focus-visible:outline-cyan-500 ${className}`}
    >
      <span>—</span>
      <span
        role="tooltip"
        className="pointer-events-none invisible opacity-0 group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100 transition-opacity duration-150 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-60 p-2 rounded bg-slate-900 dark:bg-slate-800 text-slate-100 text-[11px] font-sans leading-snug shadow-lg border border-slate-700"
      >
        {reason}
      </span>
    </span>
  );
};
