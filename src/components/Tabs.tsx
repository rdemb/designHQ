import React from 'react';
import { motion } from 'motion/react';

export interface TabOption<T extends string = string> {
  id: T;
  label: string;
  count?: number;
}

export interface TabsProps<T extends string = string> {
  options: TabOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  className?: string;
}

export function Tabs<T extends string = string>({
  options,
  activeId,
  onChange,
  ariaLabel,
  className = '',
}: TabsProps<T>) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const next = options[(index + 1) % options.length];
      onChange(next.id);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prev = options[(index - 1 + options.length) % options.length];
      onChange(prev.id);
    } else if (e.key === 'Home') {
      e.preventDefault();
      onChange(options[0].id);
    } else if (e.key === 'End') {
      e.preventDefault();
      onChange(options[options.length - 1].id);
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 overflow-x-auto max-w-full ${className}`}
    >
      {options.map((opt, idx) => {
        const isActive = opt.id === activeId;
        return (
          <button
            key={opt.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(opt.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`relative px-3 py-1.5 text-xs font-medium rounded-md transition-colors duration-150 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-500 ${
              isActive
                ? 'text-slate-900 dark:text-slate-100'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            {isActive && (
              <motion.span
                layoutId={`tab-bg-${ariaLabel}`}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 rounded-md bg-white dark:bg-[#141B29] shadow-xs border border-slate-200/80 dark:border-slate-700/80"
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              <span>{opt.label}</span>
              {opt.count !== undefined && (
                <span className="font-mono text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
                  {opt.count}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
