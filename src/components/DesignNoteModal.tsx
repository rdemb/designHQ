import React from 'react';
import { X } from 'lucide-react';
import { Language } from '../theme/tokens';

export interface DesignNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const DesignNoteModal: React.FC<DesignNoteModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="design-note-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-lg bg-white dark:bg-[#0E131D] border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-slate-900 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <p className="text-xs font-mono text-cyan-600 dark:text-cyan-400">
              HYPERQUANT ARCHITECTURE SPECIFICATION
            </p>
            <h2
              id="design-note-title"
              className="text-lg font-semibold mt-0.5 font-display"
            >
              {lang === 'pl'
                ? 'Nota Projektowa: System Projektowy i Architektura Informacji'
                : 'Design Note: Visual Direction, Tokens & Component Architecture'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={lang === 'pl' ? 'Zamknij notę projektową' : 'Close design note'}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-5 py-5 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              01. Two Proposed Visual Directions & Chosen Direction
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-md border border-cyan-500/40 bg-cyan-500/5">
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Direction A (CHOSEN): Precision Telemetry Desk (&ldquo;Chronometric Instrument Panel&rdquo;)
                </p>
                <p>
                  High-contrast obsidian slate surfaces (`#080B11` / `#0E131D`), 1px structural hairlines, zero nested card clutter, strict tabular numerals (`IBM Plex Mono`), and non-directional semantic telemetry (Cyan for resting bid liquidity/LIVE feeds, Violet for ask liquidity/MODEL outputs, Amber for SIM/value nodes). Built for 8-hour desktop sessions without eye fatigue and instant mobile scannability before/after sessions.
                </p>
              </div>
              <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  Direction B (Alternative): Editorial Quantitative Broadsheet
                </p>
                <p>
                  Magazine-inspired asymmetric layout with serif headlines, wide narrative margins, and research-first reading flow. While compelling for post-session essays and lessons, it sacrifices horizontal data density during live London/NY overlap execution.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                02. Typography (2+1 System)
              </h3>
              <ul className="space-y-1 font-mono text-[11px]">
                <li>--font-display: &quot;Bricolage Grotesque&quot; (Headings & Brand)</li>
                <li>--font-sans: &quot;Plus Jakarta Sans&quot; (UI Controls & Prose)</li>
                <li>--font-mono: &quot;IBM Plex Mono&quot; (Tabular Telemetry & Timestamps)</li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                03. Colour Tokens (@theme & WCAG AA)
              </h3>
              <ul className="space-y-1 font-mono text-[11px]">
                <li>Canvas: #080B11 (Dark) / #F8FAFC (Light)</li>
                <li>Surface: #0E131D (Dark) / #FFFFFF (Light)</li>
                <li>LIVE Provenance / Bid Liquidity: #06B6D4 (Cyan)</li>
                <li>MODEL Provenance / Ask Liquidity: #8B5CF6 (Violet)</li>
                <li>SIM Provenance / Auction POC: #F59E0B (Amber)</li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                04. Spacing & Motion Rules
              </h3>
              <p>
                4px/8px spatial grid (`--spacing-xs: 0.25rem` to `--spacing-xl: 2.25rem`). Single-elevation cards (`border-slate-200 dark:border-slate-800/90`). Motion strictly restricted to `transform` and `opacity` (150–250ms `cubic-bezier(0.16, 1, 0.3, 1)`), respecting `prefers-reduced-motion: reduce`.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">
                05. Reusable Component Inventory
              </h3>
              <p className="font-mono text-[11px]">
                Card · Badge (LIVE/MODEL/SIM + MissingValue) · Stat · DataTable · Tabs · SessionClock · EmptyState · LiquidityFieldHero · NavigationShell
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-md bg-slate-900 text-white dark:bg-cyan-500 dark:text-slate-950 hover:opacity-90 transition-opacity cursor-pointer"
          >
            {lang === 'pl' ? 'Zamknij' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
