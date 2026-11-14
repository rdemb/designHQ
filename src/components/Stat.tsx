import React from 'react';
import { Badge, MissingValue } from './Badge';
import { AnimatedTicker } from './MotionPrimitives';
import { ProvenanceType, Language } from '../theme/tokens';

export interface StatProps {
  label: string;
  value: string | null;
  missingReason?: string;
  unit?: string;
  context?: string;
  provenanceType: ProvenanceType;
  timestamp: string;
  lang?: Language;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Stat: React.FC<StatProps> = ({
  label,
  value,
  missingReason = 'Brak danych z wyroczni / Feed unavailable',
  unit,
  context,
  provenanceType,
  timestamp,
  lang = 'pl',
  size = 'md',
  className = '',
}) => {
  const valueSizeClass =
    size === 'lg'
      ? 'text-2xl sm:text-3xl font-semibold'
      : size === 'sm'
      ? 'text-base font-semibold'
      : 'text-xl sm:text-2xl font-semibold';

  const isMissing = value === null || value === '—';

  return (
    <div className={`flex flex-col justify-between gap-2 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {label}
        </span>
        <Badge type={provenanceType} timestamp={timestamp} lang={lang} />
      </div>

      <div className="flex items-baseline gap-1.5 font-mono tabular-nums tracking-tight text-slate-900 dark:text-slate-100">
        {isMissing ? (
          <MissingValue reason={missingReason} className={valueSizeClass} />
        ) : (
          <AnimatedTicker value={value} className={valueSizeClass} />
        )}
        {unit && !isMissing && (
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {context && (
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {context}
        </p>
      )}
    </div>
  );
};
