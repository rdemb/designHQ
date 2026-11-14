import React from 'react';
import { Badge } from './Badge';
import { ProvenanceType, Language } from '../theme/tokens';
import { SpotlightCard } from './MotionPrimitives';

export interface CardProps {
  title?: string;
  kicker?: string;
  subtitle?: string;
  provenance?: {
    type: ProvenanceType;
    timestamp: string;
  };
  lang?: Language;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  spotlightColor?: string;
  interactive?: boolean;
  tilt3d?: boolean;
  borderBeam?: boolean;
  inheritStagger?: boolean;
  ariaLabel?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  title,
  kicker,
  subtitle,
  provenance,
  lang = 'pl',
  headerRight,
  children,
  noPadding = false,
  className = '',
  spotlightColor,
  interactive = false,
  tilt3d = false,
  borderBeam = false,
  inheritStagger = false,
  ariaLabel,
  onClick,
}) => {
  const hasHeader = Boolean(title || kicker || provenance || headerRight);

  return (
    <SpotlightCard
      className={className}
      spotlightColor={spotlightColor}
      interactive={interactive}
      tilt3d={tilt3d}
      borderBeam={borderBeam}
      inheritStagger={inheritStagger}
      ariaLabel={ariaLabel}
      onClick={onClick}
    >
      {hasHeader && (
        <header className="flex flex-wrap items-start justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-slate-800/80">
          <div className="min-w-0">
            {kicker && (
              <p className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                {kicker}
              </p>
            )}
            {title && (
              <h2 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {provenance && (
              <Badge
                type={provenance.type}
                timestamp={provenance.timestamp}
                lang={lang}
              />
            )}
            {headerRight}
          </div>
        </header>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
    </SpotlightCard>
  );
};
