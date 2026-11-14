import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Compass,
  Clock,
  Activity,
  ClipboardCheck,
  BarChart3,
  BookOpen,
  FlaskConical,
  Database,
  Bot,
  Sun,
  Moon,
  Globe,
  CornerDownLeft,
} from 'lucide-react';
import {
  Language,
  ThemeMode,
  NavTabId,
  MarketSymbol,
  TRANSLATIONS,
} from '../theme/tokens';
import { SELECTED_MARKET_LIST } from '../theme/hyperliquid';
import { EASE_OUT_EXPO } from './MotionPrimitives';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSelectTab: (tab: NavTabId) => void;
  onSelectMarket: (sym: MarketSymbol) => void;
  onChangeLang: (lang: Language) => void;
  onChangeTheme: (mode: ThemeMode) => void;
}

interface CommandAction {
  id: string;
  group: string;
  label: string;
  shortcut?: string;
  icon: React.FC<{ className?: string }>;
  perform: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  lang,
  onSelectTab,
  onSelectMarket,
  onChangeLang,
  onChangeTheme,
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const t = TRANSLATIONS[lang];

  const actions: CommandAction[] = useMemo(() => {
    const navActions: CommandAction[] = [
      { id: 'tab-start', group: lang === 'pl' ? 'Widoki' : 'Views', label: t.nav.start, shortcut: '1', icon: Compass, perform: () => onSelectTab('start') },
      { id: 'tab-pre', group: lang === 'pl' ? 'Widoki' : 'Views', label: t.nav['pre-session'], shortcut: '2', icon: Clock, perform: () => onSelectTab('pre-session') },
      { id: 'tab-in', group: lang === 'pl' ? 'Widoki' : 'Views', label: t.nav['in-session'], shortcut: '3', icon: Activity, perform: () => onSelectTab('in-session') },
      { id: 'tab-post', group: lang === 'pl' ? 'Widoki' : 'Views', label: t.nav['post-session'], shortcut: '4', icon: ClipboardCheck, perform: () => onSelectTab('post-session') },
      { id: 'tab-markets', group: lang === 'pl' ? 'Widoki' : 'Views', label: t.nav.markets, shortcut: '5', icon: BarChart3, perform: () => onSelectTab('markets') },
      { id: 'tab-lessons', group: lang === 'pl' ? 'Widoki' : 'Views', label: t.nav.lessons, icon: BookOpen, perform: () => onSelectTab('lessons') },
      { id: 'tab-research', group: lang === 'pl' ? 'Widoki' : 'Views', label: t.nav.research, icon: FlaskConical, perform: () => onSelectTab('research') },
      { id: 'tab-sources', group: lang === 'pl' ? 'Widoki' : 'Views', label: t.nav.sources, icon: Database, perform: () => onSelectTab('sources') },
      { id: 'tab-mcp', group: lang === 'pl' ? 'Widoki' : 'Views', label: t.nav.mcp, icon: Bot, perform: () => onSelectTab('mcp') },
    ];

    const marketActions: CommandAction[] = SELECTED_MARKET_LIST.map((sym) => ({
      id: `mkt-${sym}`,
      group: lang === 'pl' ? 'Rynki Hyperliquid' : 'Hyperliquid Markets',
      label: `${sym}-PERP`,
      icon: BarChart3,
      perform: () => onSelectMarket(sym),
    }));

    const prefActions: CommandAction[] = [
      {
        id: 'lang-switch',
        group: lang === 'pl' ? 'Ustawienia' : 'Preferences',
        label: lang === 'pl' ? 'Switch language to English (EN)' : 'Zmień język na Polski (PL)',
        icon: Globe,
        perform: () => onChangeLang(lang === 'pl' ? 'en' : 'pl'),
      },
      {
        id: 'theme-dark',
        group: lang === 'pl' ? 'Ustawienia' : 'Preferences',
        label: lang === 'pl' ? 'Motyw ciemny (Obsidian)' : 'Dark Theme (Obsidian)',
        icon: Moon,
        perform: () => onChangeTheme('dark'),
      },
      {
        id: 'theme-light',
        group: lang === 'pl' ? 'Ustawienia' : 'Preferences',
        label: lang === 'pl' ? 'Motyw jasny (Alabaster)' : 'Light Theme (Alabaster)',
        icon: Sun,
        perform: () => onChangeTheme('light'),
      },
    ];

    return [...navActions, ...marketActions, ...prefActions];
  }, [lang, t, onSelectTab, onSelectMarket, onChangeLang, onChangeTheme]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter(
      (a) =>
        a.label.toLowerCase().includes(q) || a.group.toLowerCase().includes(q)
    );
  }, [actions, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      return;
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) =>
          (i - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length)
        );
      } else if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault();
        filtered[activeIndex].perform();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, filtered, activeIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'pl' ? 'Paleta poleceń' : 'Command palette'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4 bg-slate-950/65 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-xl bg-white dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <Search className="w-4 h-4 text-cyan-500 shrink-0" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  lang === 'pl'
                    ? 'Przejdź do widoku, rynku (BTC, HYPE) lub ustawień...'
                    : 'Jump to view, market (BTC, HYPE), or preference...'
                }
                className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
              />
              <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                ESC
              </kbd>
            </div>

            <div className="max-h-80 overflow-y-auto p-2 space-y-0.5">
              {filtered.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-500">
                  {lang === 'pl' ? 'Brak wyników' : 'No matching commands'}
                </p>
              ) : (
                filtered.map((item, idx) => {
                  const Icon = item.icon;
                  const isActive = idx === activeIndex;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => {
                        item.perform();
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-cyan-500/15 dark:text-cyan-300'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 opacity-80" />
                        <span className="font-medium">{item.label}</span>
                        <span className="text-[10px] opacity-55 font-mono">
                          · {item.group}
                        </span>
                      </span>
                      {isActive ? (
                        <CornerDownLeft className="w-3 h-3 opacity-80" />
                      ) : (
                        item.shortcut && (
                          <kbd className="font-mono text-[10px] opacity-50">
                            {item.shortcut}
                          </kbd>
                        )
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
