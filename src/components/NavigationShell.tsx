import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Compass,
  Sun,
  Moon,
  Monitor,
  Clock,
  Activity,
  ClipboardCheck,
  BarChart3,
  BookOpen,
  FlaskConical,
  Database,
  Bot,
  FileText,
  RefreshCw,
  PanelLeft,
  LayoutGrid,
  Command,
} from 'lucide-react';
import {
  Language,
  ThemeMode,
  NavTabId,
  MarketSymbol,
  TRANSLATIONS,
  formatNumber,
  getAmsterdamSessionStatus,
  formatCountdown,
} from '../theme/tokens';
import {
  HyperliquidState,
  SELECTED_MARKET_LIST,
} from '../theme/hyperliquid';
import { Badge, MissingValue } from './Badge';
import {
  AnimatedTicker,
  ScrollProgressLine,
  SPRING_SNAPPY,
  EASE_OUT_EXPO,
} from './MotionPrimitives';
import { HeaderChartWaveform } from './HeaderChartWaveform';

export interface NavigationShellProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  selectedMarket: MarketSymbol;
  onSelectMarket: (sym: MarketSymbol) => void;
  lang: Language;
  onChangeLang: (lang: Language) => void;
  themeMode: ThemeMode;
  onChangeTheme: (mode: ThemeMode) => void;
  hlState: HyperliquidState;
  onOpenDesignNote: () => void;
  onOpenCommandPalette: () => void;
  children: React.ReactNode;
}

interface NavItemConfig {
  id: NavTabId;
  group: 'desk' | 'intelligence';
  phaseNum?: string;
  icon: React.FC<{ className?: string }>;
  mobilePrimary?: boolean;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'start', group: 'desk', icon: Compass, mobilePrimary: true },
  { id: 'pre-session', group: 'desk', phaseNum: '01', icon: Clock, mobilePrimary: true },
  { id: 'in-session', group: 'desk', phaseNum: '02', icon: Activity, mobilePrimary: true },
  { id: 'post-session', group: 'desk', phaseNum: '03', icon: ClipboardCheck, mobilePrimary: true },
  { id: 'markets', group: 'intelligence', icon: BarChart3, mobilePrimary: true },
  { id: 'lessons', group: 'intelligence', icon: BookOpen },
  { id: 'research', group: 'intelligence', icon: FlaskConical },
  { id: 'sources', group: 'intelligence', icon: Database },
  { id: 'mcp', group: 'intelligence', icon: Bot },
];

export const NavigationShell: React.FC<NavigationShellProps> = ({
  activeTab,
  onSelectTab,
  selectedMarket,
  onSelectMarket,
  lang,
  onChangeLang,
  themeMode,
  onChangeTheme,
  hlState,
  onOpenDesignNote,
  onOpenCommandPalette,
  children,
}) => {
  const [shellLayout, setShellLayout] = useState<'horizon' | 'rail'>('rail');
  const [isSpinningRefresh, setIsSpinningRefresh] = useState(false);
  const t = TRANSLATIONS[lang];
  const currentAsset = hlState.assets[selectedMarket] || hlState.marketList[0];
  const sessionStatus = getAmsterdamSessionStatus();

  const deskNavItems = NAV_ITEMS.filter((i) => i.group === 'desk');
  const intelNavItems = NAV_ITEMS.filter((i) => i.group === 'intelligence');
  const mobileNavItems = NAV_ITEMS.filter((i) => i.mobilePrimary);

  const pdl = currentAsset?.pdl ?? (currentAsset?.midPrice ?? 75791) * 0.985;
  const pdh = currentAsset?.pdh ?? (currentAsset?.midPrice ?? 75791) * 1.015;
  const mid = currentAsset?.midPrice ?? 75791;
  const rangePinPct = Math.min(
    98,
    Math.max(2, ((mid - pdl) / Math.max(1, pdh - pdl)) * 100)
  );

  const handleManualRefresh = () => {
    setIsSpinningRefresh(true);
    hlState.refreshNow();
    setTimeout(() => setIsSpinningRefresh(false), 500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8FC] dark:bg-[#05070C] text-slate-900 dark:text-[#EEF2F8] hq-grid-bg transition-colors duration-150">
      <ScrollProgressLine resetKey={activeTab} />

      {/* Persistent Studio Command Header */}
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-[#070A12]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80">
        {/* Top Row: Brand + Tactile Instrument Selector + Telemetry Ribbon + Controls */}
        <div className="max-w-[1920px] mx-auto px-3 sm:px-5 h-14 flex items-center justify-between gap-3">
          {/* Left Zone: Brand Mark + Instrument Switcher + Telemetry */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0 overflow-x-auto no-scrollbar">
            <motion.button
              type="button"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => onSelectTab('start')}
              aria-label="HyperQuant Start"
              className="group flex items-center gap-2.5 text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-500 rounded pr-1 shrink-0"
            >
              {/* Custom Chart-Native Candlestick + VWAP Brand Mark */}
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-gradient-to-br dark:from-[#121A2B] dark:to-[#0A0F1A] border border-slate-800 dark:border-cyan-400/35 flex items-center justify-center shadow-xs overflow-hidden">
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 overflow-visible"
                  fill="none"
                  aria-hidden="true"
                >
                  <motion.rect
                    key={`bm1-${selectedMarket}`}
                    x="4"
                    y="11"
                    width="3"
                    height="7"
                    rx="0.8"
                    fill="#22D3EE"
                    initial={{ scaleY: 0.4, opacity: 0.5 }}
                    animate={{ scaleY: 1, opacity: 0.9 }}
                    transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                    style={{ transformOrigin: '5.5px 14.5px' }}
                  />
                  <motion.rect
                    key={`bm2-${selectedMarket}`}
                    x="10.5"
                    y="7"
                    width="3"
                    height="9"
                    rx="0.8"
                    fill="#FBBF24"
                    initial={{ scaleY: 0.4, opacity: 0.5 }}
                    animate={{ scaleY: 1, opacity: 0.9 }}
                    transition={{ duration: 0.35, delay: 0.05, ease: EASE_OUT_EXPO }}
                    style={{ transformOrigin: '12px 11.5px' }}
                  />
                  <motion.rect
                    key={`bm3-${selectedMarket}`}
                    x="17"
                    y="5"
                    width="3"
                    height="8"
                    rx="0.8"
                    fill="#22D3EE"
                    initial={{ scaleY: 0.4, opacity: 0.5 }}
                    animate={{ scaleY: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: EASE_OUT_EXPO }}
                    style={{ transformOrigin: '18.5px 9px' }}
                  />
                  <motion.path
                    key={`bmv-${selectedMarket}`}
                    d="M3 16 Q12 12 21 6"
                    stroke="#818CF8"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    initial={{ pathLength: 0.2, opacity: 0.4 }}
                    animate={{ pathLength: 1, opacity: 0.95 }}
                    transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
                  />
                </svg>
              </div>
              <div>
                <span className="block font-display font-bold text-sm leading-none tracking-tight text-slate-900 dark:text-white">
                  HyperQuant
                </span>
                <span className="block font-mono text-[9px] text-slate-500 dark:text-slate-400 tracking-wider mt-0.5">
                  HYPERLIQUID L1
                </span>
              </div>
            </motion.button>

            {/* Tactile Instrument Switcher (BTC / ETH / SOL / HYPE) */}
            <div
              role="group"
              aria-label={t.header.market}
              className="inline-flex items-center bg-slate-100/90 dark:bg-[#0E1422] p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-800 shrink-0"
            >
              {SELECTED_MARKET_LIST.map((sym) => {
                const isSelected = sym === selectedMarket;
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => onSelectMarket(sym)}
                    aria-pressed={isSelected}
                    className={`relative px-2.5 py-1 rounded-md font-mono text-xs transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'text-white dark:text-slate-950 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="active-market-selector-pill"
                        transition={SPRING_SNAPPY}
                        className="absolute inset-0 rounded-md bg-slate-900 dark:bg-gradient-to-r dark:from-cyan-400 dark:to-sky-400 shadow-xs"
                      />
                    )}
                    <span className="relative z-10">{sym}</span>
                  </button>
                );
              })}
            </div>

            {/* Live Telemetry Strip */}
            {currentAsset && (
              <div className="flex items-center gap-4 font-mono text-xs tabular-nums shrink-0 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <AnimatedTicker
                        value={
                          currentAsset.midPrice !== null
                            ? `$${formatNumber(currentAsset.midPrice, lang, {
                                decimals:
                                  currentAsset.symbol === 'BTC'
                                    ? 0
                                    : currentAsset.symbol === 'HYPE'
                                    ? 2
                                    : 1,
                              })}`
                            : '—'
                        }
                        className="text-sm font-semibold text-slate-900 dark:text-white"
                      />
                      <span
                        className={`text-[11px] font-medium ${
                          (currentAsset.change24hPct ?? 0) >= 0
                            ? 'text-cyan-700 dark:text-cyan-400'
                            : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {currentAsset.change24hPct !== null
                          ? formatNumber(currentAsset.change24hPct, lang, {
                              decimals: 2,
                              sign: true,
                              suffix: '%',
                            })
                          : '—'}
                      </span>
                    </div>
                    <Badge
                      type={currentAsset.provenance.type}
                      timestamp={currentAsset.provenance.timestamp}
                      lang={lang}
                      className="hidden sm:inline-flex"
                    />
                  </div>
                </div>

                {/* Live Chart-Native Microstructure Sparkline + L2 Bid/Ask Horizon */}
                <HeaderChartWaveform
                  market={selectedMarket}
                  change24hPct={currentAsset.change24hPct}
                />

                {/* Desktop Extended Telemetry Cells */}
                <div className="hidden xl:flex items-center gap-5 text-[11px] border-l border-slate-200 dark:border-slate-800 pl-4">
                  <div>
                    <span className="block font-sans text-[10px] text-slate-400 dark:text-slate-500">
                      {t.header.funding}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {currentAsset.fundingHourlyPct !== null
                        ? `${formatNumber(currentAsset.fundingHourlyPct, lang, {
                            decimals: 4,
                            sign: true,
                            suffix: '%',
                          })} · ${formatNumber(
                            currentAsset.fundingAnnualizedPct,
                            lang,
                            { decimals: 1, sign: true, suffix: '%/r' }
                          )}`
                        : '—'}
                    </span>
                  </div>

                  <div>
                    <span className="block font-sans text-[10px] text-slate-400 dark:text-slate-500">
                      {t.header.basis}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium">
                      {currentAsset.basisBps !== null ? (
                        `${formatNumber(currentAsset.basisBps, lang, {
                          decimals: 1,
                          sign: true,
                          suffix: ' bps',
                        })}`
                      ) : (
                        <MissingValue reason="Brak strumienia spot-oracle / Missing spot-oracle feed" />
                      )}
                    </span>
                  </div>

                  {/* PDL — PDH Visual Range Thermometer */}
                  <div className="w-36">
                    <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                      <span>PDL ${formatNumber(pdl, lang)}</span>
                      <span className="text-amber-500">SIM</span>
                      <span>PDH ${formatNumber(pdh, lang)}</span>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-slate-200 dark:bg-slate-800">
                      <motion.div
                        initial={false}
                        animate={{ left: `${rangePinPct}%` }}
                        transition={SPRING_SNAPPY}
                        className="absolute -top-0.5 w-2 h-2.5 -translate-x-1/2 rounded-xs bg-cyan-500 dark:bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"
                        title={`Mid: $${formatNumber(mid, lang)}`}
                      />
                    </div>
                  </div>

                  <div className="pl-2 border-l border-slate-200 dark:border-slate-800">
                    <span className="block font-sans text-[10px] text-slate-400 dark:text-slate-500">
                      {t.header.session} · {sessionStatus.amsterdamTimeStr}
                    </span>
                    <span className="text-cyan-700 dark:text-cyan-300 font-semibold">
                      {sessionStatus.currentSessionLabel[lang]}{' '}
                      <span className="text-slate-400 font-normal">
                        ({formatCountdown(sessionStatus.countdownSeconds)})
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Zone: Cmd+K + Layout Switcher + Design Note + Refresh + PL/EN + Theme */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Cmd+K Quick Jump Button */}
            <button
              type="button"
              onClick={onOpenCommandPalette}
              aria-label={lang === 'pl' ? 'Otwórz paletę poleceń' : 'Open command palette'}
              className="hidden md:inline-flex items-center gap-2 px-2.5 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1422] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Command className="w-3 h-3 text-cyan-500" />
              <span>{lang === 'pl' ? 'Szukaj' : 'Jump'}</span>
              <kbd className="font-mono text-[10px] px-1 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                ⌘K
              </kbd>
            </button>

            <button
              type="button"
              onClick={() =>
                setShellLayout((prev) => (prev === 'rail' ? 'horizon' : 'rail'))
              }
              title={
                lang === 'pl'
                  ? 'Przełącz układ: Szyna boczna / Pełny horyzont'
                  : 'Toggle layout: Sidebar Rail / Full-Width Horizon Deck'
              }
              aria-label={
                lang === 'pl'
                  ? 'Przełącz układ nawigacji'
                  : 'Toggle navigation layout'
              }
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap"
            >
              {shellLayout === 'rail' ? (
                <>
                  <LayoutGrid className="w-3.5 h-3.5 text-cyan-500" />
                  <span>{lang === 'pl' ? 'Szyna' : 'Rail'}</span>
                </>
              ) : (
                <>
                  <PanelLeft className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'pl' ? 'Horyzont' : 'Horizon'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenDesignNote}
              aria-label={t.header.designNote}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-500"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>{t.header.designNote}</span>
            </button>

            <button
              type="button"
              onClick={handleManualRefresh}
              title={
                lang === 'pl'
                  ? 'Odśwież dane z Hyperliquid Info API (limit 10 s)'
                  : 'Refresh Hyperliquid Info API telemetry (10s rate limit)'
              }
              aria-label={
                lang === 'pl'
                  ? 'Odśwież dane rynkowe'
                  : 'Refresh market telemetry'
              }
              className="p-1.5 rounded-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-500"
            >
              <motion.div
                animate={{ rotate: isSpinningRefresh ? 360 : 0 }}
                transition={{ duration: 0.45, ease: 'easeInOut' }}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </motion.div>
            </button>

            {/* Language Switch PL / EN */}
            <div
              role="group"
              aria-label={
                lang === 'pl'
                  ? 'Wybór języka interfejsu'
                  : 'Interface language switch'
              }
              className="inline-flex rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0E1422] p-0.5 text-[11px] font-mono"
            >
              <button
                type="button"
                onClick={() => onChangeLang('pl')}
                aria-pressed={lang === 'pl'}
                className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                  lang === 'pl'
                    ? 'bg-white dark:bg-cyan-500 dark:text-slate-950 text-slate-900 font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                PL
              </button>
              <button
                type="button"
                onClick={() => onChangeLang('en')}
                aria-pressed={lang === 'en'}
                className={`px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                  lang === 'en'
                    ? 'bg-white dark:bg-cyan-500 dark:text-slate-950 text-slate-900 font-semibold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                EN
              </button>
            </div>

            {/* Theme Mode Switch */}
            <div
              role="group"
              aria-label={
                lang === 'pl'
                  ? 'Przełącznik motywu kolorystycznego'
                  : 'Color theme mode selector'
              }
              className="inline-flex rounded-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0E1422] p-0.5"
            >
              <button
                type="button"
                onClick={() => onChangeTheme('dark')}
                aria-pressed={themeMode === 'dark'}
                aria-label={lang === 'pl' ? 'Motyw ciemny' : 'Dark theme'}
                className={`p-1 rounded-xs transition-colors cursor-pointer ${
                  themeMode === 'dark'
                    ? 'bg-white dark:bg-slate-800 text-cyan-600 dark:text-cyan-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChangeTheme('light')}
                aria-pressed={themeMode === 'light'}
                aria-label={lang === 'pl' ? 'Motyw jasny' : 'Light theme'}
                className={`p-1 rounded-xs transition-colors cursor-pointer ${
                  themeMode === 'light'
                    ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => onChangeTheme('system')}
                aria-pressed={themeMode === 'system'}
                aria-label={lang === 'pl' ? 'Motyw systemowy' : 'System theme'}
                className={`p-1 rounded-xs transition-colors cursor-pointer ${
                  themeMode === 'system'
                    ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Continuous Session Phase Pipeline & Intelligence Bar */}
        <div className="max-w-[1920px] mx-auto px-3 sm:px-5 py-1.5 border-t border-slate-200/70 dark:border-slate-800/70 bg-slate-50/80 dark:bg-[#090D18]/90 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <nav
            aria-label={t.navGroups.desk}
            className="flex items-center gap-1.5 shrink-0"
          >
            {deskNavItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const label = t.nav[item.id];
              return (
                <React.Fragment key={item.id}>
                  <button
                    type="button"
                    onClick={() => onSelectTab(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'text-white dark:text-cyan-300 font-semibold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="active-top-nav-pill"
                        transition={SPRING_SNAPPY}
                        className="absolute inset-0 rounded-md bg-slate-900 dark:bg-cyan-500/15 border border-slate-900 dark:border-cyan-500/40 shadow-2xs"
                      />
                    )}
                    <span className="relative z-10 inline-flex items-center gap-2">
                      {item.phaseNum && (
                        <span className="font-mono text-[10px] opacity-75">
                          {item.phaseNum}
                        </span>
                      )}
                      <Icon className="w-3.5 h-3.5" />
                      <span>{label}</span>
                    </span>
                  </button>
                  {idx < deskNavItems.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="text-slate-300 dark:text-slate-700 font-mono text-xs select-none"
                    >
                      →
                    </span>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          <nav
            aria-label={t.navGroups.intelligence}
            className="flex items-center gap-1 shrink-0"
          >
            {intelNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const label = t.nav[item.id];
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'text-white dark:text-cyan-300 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="active-top-nav-pill"
                      transition={SPRING_SNAPPY}
                      className="absolute inset-0 rounded-md bg-slate-900 dark:bg-cyan-500/15 border border-slate-900 dark:border-cyan-500/40 shadow-2xs"
                    />
                  )}
                  <span className="relative z-10 inline-flex items-center gap-1.5">
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Workspace Container */}
      <div className="flex-1 max-w-[1920px] w-full mx-auto flex">
        {shellLayout === 'rail' && (
          <aside
            aria-label={
              lang === 'pl'
                ? 'Główna szyna nawigacyjna HyperQuant'
                : 'Primary HyperQuant navigation rail'
            }
            className="hidden lg:flex flex-col justify-between w-60 shrink-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-[#070A12]/60 backdrop-blur-sm p-3.5 select-none"
          >
            <div className="space-y-6">
              <div>
                <p className="px-2.5 mb-2 font-mono text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  {t.navGroups.desk}
                </p>
                <nav aria-label={t.navGroups.desk} className="space-y-1">
                  {deskNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const label = t.nav[item.id];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectTab(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={label}
                        className={`relative w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'text-white dark:text-cyan-300 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="active-sidebar-rail-pill"
                            transition={SPRING_SNAPPY}
                            className="absolute inset-0 rounded-lg bg-slate-900 dark:bg-[#101726] border border-slate-800 dark:border-cyan-500/40 shadow-xs"
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2.5 truncate">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{label}</span>
                        </span>
                        {item.phaseNum && (
                          <span className="relative z-10 font-mono text-[10px] opacity-60">
                            {item.phaseNum}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div>
                <p className="px-2.5 mb-2 font-mono text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  {t.navGroups.intelligence}
                </p>
                <nav aria-label={t.navGroups.intelligence} className="space-y-1">
                  {intelNavItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    const label = t.nav[item.id];
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onSelectTab(item.id)}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={label}
                        className={`relative w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'text-white dark:text-cyan-300 font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                        }`}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="active-sidebar-rail-pill"
                            transition={SPRING_SNAPPY}
                            className="absolute inset-0 rounded-lg bg-slate-900 dark:bg-[#101726] border border-slate-800 dark:border-cyan-500/40 shadow-xs"
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-2.5 truncate">
                          <Icon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{label}</span>
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-100/90 dark:bg-[#0A0F1A] border border-slate-200 dark:border-slate-800 space-y-2 text-[11px]">
              <div className="flex items-center justify-between font-mono">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Hyperliquid Info API
                </span>
                <span className="text-cyan-700 dark:text-cyan-400 font-semibold">
                  {hlState.isLiveConnected ? 'LIVE (10s)' : 'SIM'}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 leading-snug">
                {lang === 'pl'
                  ? 'Zero sygnałów kupna/sprzedaży. Wyłącznie weryfikowalny opis mikrostruktury rynku.'
                  : 'Zero buy/sell signals. Strictly verifiable market microstructure telemetry.'}
              </p>
            </div>
          </aside>
        )}

        {/* Active View Area */}
        <div className="flex-1 min-w-0 flex flex-col justify-between pb-16 lg:pb-0">
          <main id="main-content" className="flex-1 p-4 sm:p-6">
            {children}
          </main>

          {/* Mandatory Non-Predictive Product Identity Footer */}
          <footer className="px-4 sm:px-6 py-4 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-[#070A12]/60 text-xs text-slate-500 dark:text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Opis rynku, nie porada inwestycyjna. / Market description, not investment advice.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
              <span>{t.footer.openSource}</span>
              <span aria-hidden="true">·</span>
              <span>{hlState.lastUpdated} CET</span>
            </div>
          </footer>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label={
          lang === 'pl' ? 'Nawigacja mobilna' : 'Mobile bottom navigation'
        }
        className="lg:hidden fixed bottom-0 left-0 right-0 z-30 h-13 bg-white/95 dark:bg-[#070A12]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 grid grid-cols-5"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const label = t.nav[item.id];
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              aria-current={isActive ? 'page' : undefined}
              aria-label={label}
              className={`relative flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-cyan-500 ${
                isActive
                  ? 'text-cyan-700 dark:text-cyan-400 font-semibold'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="active-mobile-bottom-indicator"
                  transition={SPRING_SNAPPY}
                  className="absolute top-0 left-3 right-3 h-0.5 bg-cyan-500 dark:bg-cyan-400 rounded-full"
                />
              )}
              <Icon className="w-4 h-4" />
              <span className="truncate max-w-[68px]">{label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
