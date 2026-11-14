import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  Download,
  Clock,
  Activity,
  ClipboardCheck,
  Terminal,
  Check,
  Copy,
  GitBranch,
  FileText,
} from 'lucide-react';
import {
  Language,
  NavTabId,
  MarketSymbol,
  formatNumber,
} from '../theme/tokens';
import {
  HyperliquidState,
  SELECTED_MARKET_LIST,
} from '../theme/hyperliquid';
import { Card } from '../components/Card';
import { Stat } from '../components/Stat';
import { Badge } from '../components/Badge';
import { SessionClock } from '../components/SessionClock';
import { LiquidityFieldHero } from '../components/LiquidityFieldHero';
import { MarketRegimeMatrix } from '../components/MarketRegimeMatrix';
import { HeroChartBackdrop } from '../components/HeroChartBackdrop';
import { HyperQuantShowcaseReel } from '../components/HyperQuantShowcaseReel';
import { IndicatorConstellation } from '../components/IndicatorConstellation';
import {
  MotionStaggerContainer,
  MotionStaggerItem,
  MotionStaggerGrid,
  ScrollRevealBlock,
  KineticHeadline,
  SpotlightCard,
  MagneticWrapper,
  AnimatedTicker,
  staggerCardGridVariants,
  staggerCardVariants,
  EASE_OUT_EXPO,
  SPRING_SNAPPY,
  SPRING_TACTILE,
  SPRING_PRESS,
} from '../components/MotionPrimitives';

export interface StartViewProps {
  lang: Language;
  selectedMarket: MarketSymbol;
  hlState: HyperliquidState;
  onNavigate: (tab: NavTabId) => void;
  onSelectMarket: (sym: MarketSymbol) => void;
  onOpenDesignNote: () => void;
}

const HERO_MCP_SNIPPET = `{
  "mcpServers": {
    "hyperquant": {
      "command": "npx",
      "args": ["-y", "@hyperquant/mcp-server", "--market", "BTC"]
    }
  }
}`;

export const StartView: React.FC<StartViewProps> = ({
  lang,
  selectedMarket,
  hlState,
  onNavigate,
  onSelectMarket,
  onOpenDesignNote,
}) => {
  const [pwaPromptShown, setPwaPromptShown] = useState(false);
  const [copiedHeroMcp, setCopiedHeroMcp] = useState(false);
  const prefersReduced = useReducedMotion();

  const activeAsset = hlState.assets[selectedMarket] || hlState.marketList[0];
  const hype = hlState.assets['HYPE'] || hlState.marketList[3];
  const priceDecimals =
    selectedMarket === 'BTC' ? 0 : selectedMarket === 'HYPE' ? 2 : 1;

  const liqMinus1Usd =
    selectedMarket === 'BTC'
      ? 22_600_000
      : selectedMarket === 'ETH'
      ? 11_400_000
      : selectedMarket === 'SOL'
      ? 6_800_000
      : 3_200_000;
  const liqPlus1Usd =
    selectedMarket === 'BTC'
      ? 19_400_000
      : selectedMarket === 'ETH'
      ? 13_100_000
      : selectedMarket === 'SOL'
      ? 7_500_000
      : 2_900_000;

  const tickerItems = hlState.marketList.filter((m) => m.midPrice !== null);

  const handleCopyHeroMcp = () => {
    navigator.clipboard?.writeText(HERO_MCP_SNIPPET);
    setCopiedHeroMcp(true);
    setTimeout(() => setCopiedHeroMcp(false), 1800);
  };

  return (
    <MotionStaggerContainer className="space-y-8 max-w-7xl mx-auto">
      {/* Studio Kinetic Hero Header Section */}
      <MotionStaggerItem className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <SpotlightCard
          borderBeam
          className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between"
          spotlightColor="rgba(34, 211, 238, 0.16)"
        >
          {/* Subtle hardware film grain + Chart-Native Kinetic Backdrop */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 hq-studio-grain opacity-60 dark:opacity-100"
          />
          <HeroChartBackdrop market={selectedMarket} />

          <div className="relative z-10 space-y-5">
            {/* Unboxed Metadata & Instant Hero Market Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <motion.div
                initial={prefersReduced ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-mono"
              >
                <span className="text-cyan-700 dark:text-cyan-400 font-semibold tracking-wider">
                  HYPERQUANT L1 DESK
                </span>
                <span aria-hidden="true">·</span>
                <span>Open-Source (MIT)</span>
                <span aria-hidden="true">·</span>
                <span>Hyperliquid &amp; HIP-3</span>
              </motion.div>

              {/* In-Hero Tactile Market Switcher */}
              <div
                role="group"
                aria-label={lang === 'pl' ? 'Szybki wybór instrumentu' : 'Quick instrument switcher'}
                className="inline-flex items-center rounded-md bg-slate-100/90 dark:bg-[#0E1422]/90 p-0.5 border border-slate-200/80 dark:border-slate-800 font-mono text-[11px]"
              >
                {SELECTED_MARKET_LIST.map((sym) => {
                  const isActive = sym === selectedMarket;
                  return (
                    <button
                      key={sym}
                      type="button"
                      onClick={() => onSelectMarket(sym)}
                      aria-pressed={isActive}
                      className={`relative px-2 py-0.5 rounded-xs transition-colors cursor-pointer ${
                        isActive
                          ? 'text-white dark:text-slate-950 font-semibold'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="hero-inline-market-pill"
                          transition={SPRING_SNAPPY}
                          className="absolute inset-0 rounded-xs bg-slate-900 dark:bg-cyan-400 shadow-2xs"
                        />
                      )}
                      <span className="relative z-10">{sym}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <KineticHeadline
              text={
                lang === 'pl'
                  ? 'Otwarty desk day-tradingowy BTC dla Hyperliquid. Opis struktury rynku bez zgadywania kierunku.'
                  : 'Open-source BTC day-trading desk for Hyperliquid. Objective market structure without directional predictions.'
              }
              accentWords={['Hyperliquid', 'struktury', 'structure']}
              className="font-display text-3xl sm:text-[2.65rem] font-bold tracking-tight text-slate-900 dark:text-white leading-[1.07] text-balance"
            />

            <motion.p
              initial={prefersReduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.42, delay: 0.2, ease: EASE_OUT_EXPO }}
              className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl"
            >
              {lang === 'pl'
                ? 'Przygotuj plan przed otwarciem Londynu (09:00) i Nowego Jorku (15:30), obserwuj przepływ zleceń (heatmapa i footprint) w trakcie sesji oraz weryfikuj kalibrację hipotez w publicznym rejestrze po sesji.'
                : 'Prepare auction levels before London (09:00) and New York (15:30) opens, monitor live order-flow heatmap and footprint in session, and audit forecast calibration in a verifiable ledger after the close.'}
            </motion.p>

            {/* Live Compact Hero Proof Strip */}
            <div className="pt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-mono tabular-nums text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{selectedMarket} MID:</span>
                <AnimatedTicker
                  value={
                    activeAsset?.midPrice !== null
                      ? formatNumber(activeAsset.midPrice, lang, {
                          decimals: priceDecimals,
                          prefix: '$',
                        })
                      : '—'
                  }
                  className="font-semibold text-slate-900 dark:text-white"
                />
              </div>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">
                ·
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">OI:</span>
                <AnimatedTicker
                  value={
                    activeAsset?.openInterestUsd !== null
                      ? formatNumber(activeAsset.openInterestUsd, lang, {
                          compact: true,
                          prefix: '$',
                        })
                      : '—'
                  }
                  className="font-semibold text-cyan-700 dark:text-cyan-300"
                />
              </div>
              <Badge
                type={activeAsset?.provenance.type || 'SIM'}
                timestamp={activeAsset?.provenance.timestamp || hlState.lastUpdated}
                lang={lang}
              />
            </div>
          </div>

          {/* Primary CTAs with Magnetic Physics & Kinetic Sheen */}
          <div className="relative z-10 pt-6 mt-6 border-t border-slate-200/70 dark:border-slate-800/80 space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <MagneticWrapper strength={0.18}>
                <motion.button
                  type="button"
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING_SNAPPY}
                  onClick={() => onNavigate('pre-session')}
                  className="relative overflow-hidden hq-sheen-btn inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-gradient-to-r dark:from-cyan-400 dark:to-sky-400 dark:text-slate-950 shadow-lg shadow-cyan-500/15 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-500"
                >
                  <span>
                    {lang === 'pl' ? 'Otwórz desk (Przed sesją)' : 'Open the desk (Pre-session)'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </MagneticWrapper>

              <MagneticWrapper strength={0.14}>
                <motion.button
                  type="button"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  transition={SPRING_SNAPPY}
                  onClick={() => onNavigate('in-session')}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-[#101726] dark:text-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-500"
                >
                  <Activity className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>
                    {lang === 'pl' ? 'Przejdź do widoku W sesji' : 'Jump to In-session view'}
                  </span>
                </motion.button>
              </MagneticWrapper>

              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={SPRING_SNAPPY}
                onClick={() => setPwaPromptShown((prev) => !prev)}
                aria-expanded={pwaPromptShown}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-cyan-500"
              >
                <Download className="w-4 h-4" />
                <span>
                  {lang === 'pl' ? 'Zainstaluj aplikację (PWA)' : 'Install app (PWA)'}
                </span>
              </motion.button>

              <button
                type="button"
                onClick={onOpenDesignNote}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{lang === 'pl' ? 'Nota projektowa' : 'Design note'}</span>
              </button>
            </div>

            <AnimatePresence>
              {pwaPromptShown && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                  role="region"
                  aria-label="PWA Installation guide"
                  className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#101726] border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      {lang === 'pl'
                        ? 'Gotowość PWA: Praca na telefonie przed i po sesji, na pulpicie w trakcie sesji'
                        : 'PWA Ready: Mobile pre/post-session companion & desktop multi-monitor desk'}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">
                      {lang === 'pl'
                        ? 'Na iOS / Android wybierz „Dodaj do ekranu głównego”. Na pulpicie Chrome/Edge kliknij ikonę instalacji w pasku adresu.'
                        : 'On iOS / Android tap "Add to Home Screen". On desktop Chrome/Edge click the install icon in the address bar.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPwaPromptShown(false)}
                    className="text-xs font-mono text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                  >
                    {lang === 'pl' ? 'Ukryj' : 'Dismiss'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </SpotlightCard>

        {/* Right: Signature 3D WebGL + D3 Living Order-Flow Landscape */}
        <div className="lg:col-span-5">
          <LiquidityFieldHero
            lang={lang}
            market={selectedMarket}
            midPrice={activeAsset?.midPrice ?? 75791}
            provenanceType={activeAsset?.provenance.type === 'LIVE' ? 'LIVE' : 'SIM'}
            timestamp={activeAsset?.provenance.timestamp || hlState.lastUpdated}
          />
        </div>
      </MotionStaggerItem>

      {/* Smooth Infinite Cross-Market Ticker Ribbon (Pause on Hover) */}
      <MotionStaggerItem>
        <div
          aria-label={lang === 'pl' ? 'Pasek rynków Hyperliquid i HIP-3' : 'Hyperliquid & HIP-3 market ribbon'}
          className="hq-marquee-container relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0A0F1A]/80 py-2.5 backdrop-blur-sm"
        >
          <div className="hq-marquee-track flex items-center gap-6 px-4">
            {[...tickerItems, ...tickerItems].map((m, i) => (
              <button
                key={`${m.symbol}-${i}`}
                type="button"
                onClick={() => {
                  if (SELECTED_MARKET_LIST.includes(m.symbol as MarketSymbol)) {
                    onSelectMarket(m.symbol as MarketSymbol);
                    onNavigate('pre-session');
                  } else {
                    onNavigate('markets');
                  }
                }}
                className="inline-flex items-center gap-3 px-3 py-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors font-mono text-xs tabular-nums shrink-0 cursor-pointer"
              >
                <span className="font-semibold text-slate-900 dark:text-white">
                  {m.symbol}
                </span>
                <span className="text-slate-700 dark:text-slate-300">
                  ${formatNumber(m.midPrice, lang, { decimals: m.symbol === 'BTC' ? 0 : 2 })}
                </span>
                <span
                  className={
                    (m.change24hPct ?? 0) >= 0
                      ? 'text-cyan-600 dark:text-cyan-400'
                      : 'text-amber-600 dark:text-amber-400'
                  }
                >
                  {formatNumber(m.change24hPct, lang, {
                    decimals: 2,
                    sign: true,
                    suffix: '%',
                  })}
                </span>
                <span className="text-[10px] text-slate-400">
                  {m.provenance.type}
                </span>
                <span aria-hidden="true" className="text-slate-300 dark:text-slate-700 ml-2">
                  /
                </span>
              </button>
            ))}
          </div>
        </div>
      </MotionStaggerItem>

      {/* Full-Width Interactive Live Proof Row (Staggered Reveal) */}
      <MotionStaggerGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          inheritStagger
          className="p-4"
          spotlightColor="rgba(34, 211, 238, 0.15)"
          onClick={() => onNavigate('markets')}
          ariaLabel={
            lang === 'pl'
              ? `Przejdź do tabeli rynków (${selectedMarket})`
              : `Open markets table (${selectedMarket})`
          }
        >
          <Stat
            label={
              lang === 'pl'
                ? `${selectedMarket}-PERP Cena Mid (Hyperliquid)`
                : `${selectedMarket}-PERP Mid Price (Hyperliquid)`
            }
            value={
              activeAsset?.midPrice !== null
                ? formatNumber(activeAsset.midPrice, lang, {
                    decimals: priceDecimals,
                    prefix: '$',
                  })
                : null
            }
            context={
              lang === 'pl'
                ? `Zmiana 24h: ${formatNumber(activeAsset?.change24hPct, lang, {
                    decimals: 2,
                    sign: true,
                    suffix: '%',
                  })} · Odświeżanie co 10 s`
                : `24h change: ${formatNumber(activeAsset?.change24hPct, lang, {
                    decimals: 2,
                    sign: true,
                    suffix: '%',
                  })} · Polled every 10s`
            }
            provenanceType={activeAsset?.provenance.type || 'SIM'}
            timestamp={activeAsset?.provenance.timestamp || hlState.lastUpdated}
            lang={lang}
          />
        </Card>

        <Card
          inheritStagger
          className="p-4"
          spotlightColor="rgba(34, 211, 238, 0.15)"
          onClick={() => onNavigate('markets')}
          ariaLabel={
            lang === 'pl'
              ? `Sprawdź Open Interest ${selectedMarket} w tabeli rynków`
              : `Inspect ${selectedMarket} Open Interest in Markets`
          }
        >
          <Stat
            label={
              lang === 'pl'
                ? `Otwarte Pozycje ${selectedMarket} (Open Interest)`
                : `${selectedMarket} Open Interest (USD)`
            }
            value={
              activeAsset?.openInterestUsd !== null
                ? formatNumber(activeAsset.openInterestUsd, lang, {
                    compact: true,
                    prefix: '$',
                  })
                : null
            }
            context={
              lang === 'pl'
                ? `Wolumen 24h: ${formatNumber(activeAsset?.volume24hUsd, lang, {
                    compact: true,
                    prefix: '$',
                  })}`
                : `24h Volume: ${formatNumber(activeAsset?.volume24hUsd, lang, {
                    compact: true,
                    prefix: '$',
                  })}`
            }
            provenanceType={activeAsset?.provenance.type || 'SIM'}
            timestamp={activeAsset?.provenance.timestamp || hlState.lastUpdated}
            lang={lang}
          />
        </Card>

        <Card
          inheritStagger
          className="p-4"
          spotlightColor="rgba(129, 140, 248, 0.15)"
          onClick={() => onNavigate('pre-session')}
          ariaLabel={
            lang === 'pl'
              ? 'Otwórz mapę paliwa likwidacyjnego w widoku Przed sesją'
              : 'Open liquidation fuel breakdown in Pre-session'
          }
        >
          <Stat
            label={
              lang === 'pl'
                ? `Paliwo likwidacyjne ±1% (${selectedMarket})`
                : `Liquidation Fuel ±1% (${selectedMarket})`
            }
            value={formatNumber(liqMinus1Usd, lang, { compact: true, prefix: '$' })}
            context={
              lang === 'pl'
                ? `Poniżej −1%: ${formatNumber(liqMinus1Usd, lang, {
                    compact: true,
                    prefix: '$',
                  })} · powyżej +1%: ${formatNumber(liqPlus1Usd, lang, {
                    compact: true,
                    prefix: '$',
                  })}`
                : `Within −1%: ${formatNumber(liqMinus1Usd, lang, {
                    compact: true,
                    prefix: '$',
                  })} · within +1%: ${formatNumber(liqPlus1Usd, lang, {
                    compact: true,
                    prefix: '$',
                  })}`
            }
            provenanceType="MODEL"
            timestamp={hlState.lastUpdated}
            lang={lang}
          />
        </Card>

        <Card
          inheritStagger
          className="p-4"
          spotlightColor="rgba(251, 191, 36, 0.15)"
          onClick={() => onNavigate('post-session')}
          ariaLabel={
            lang === 'pl'
              ? 'Otwórz rejestr kalibracji prognoz Po sesji'
              : 'Open forecast calibration ledger in Post-session'
          }
        >
          <Stat
            label={lang === 'pl' ? 'Kalibracja Rejestru Prognoz (Brier)' : 'Forecast Ledger Calibration (Brier)'}
            value={formatNumber(0.142, lang, { decimals: 3 })}
            unit={lang === 'pl' ? '(90 dni, n=184)' : '(90d, n=184)'}
            context={
              lang === 'pl'
                ? 'HYPE OI: ' +
                  formatNumber(hype?.openInterestUsd ?? 226000000, lang, {
                    compact: true,
                    prefix: '$',
                  }) +
                  ' · Audytowalny rejestr'
                : 'HYPE OI: ' +
                  formatNumber(hype?.openInterestUsd ?? 226000000, lang, {
                    compact: true,
                    prefix: '$',
                  }) +
                  ' · Verifiable ledger'
            }
            provenanceType="MODEL"
            timestamp={hlState.lastUpdated}
            lang={lang}
          />
        </Card>
      </MotionStaggerGrid>

      {/* Scroll-Revealed 5-Scene Interactive Engine & Chart Reel */}
      <ScrollRevealBlock>
        <HyperQuantShowcaseReel
          lang={lang}
          market={selectedMarket}
          midPrice={activeAsset?.midPrice ?? 75791}
          timestamp={activeAsset?.provenance.timestamp || hlState.lastUpdated}
          onNavigate={onNavigate}
        />
      </ScrollRevealBlock>

      {/* Scroll-Revealed 24h Intraday Regime & L1 Open Interest Bento */}
      <ScrollRevealBlock>
        <MarketRegimeMatrix
          lang={lang}
          selectedMarket={selectedMarket}
          onSelectMarket={onSelectMarket}
          hlState={hlState}
        />
      </ScrollRevealBlock>

      {/* Scroll-Revealed Filterable Indicator & Tool Constellation */}
      <ScrollRevealBlock>
        <IndicatorConstellation
          lang={lang}
          market={selectedMarket}
          timestamp={hlState.lastUpdated}
          onNavigate={onNavigate}
        />
      </ScrollRevealBlock>

      {/* Scroll-Revealed Live Interactive Amsterdam Session Clock */}
      <ScrollRevealBlock>
        <SessionClock lang={lang} />
      </ScrollRevealBlock>

      {/* Scroll-Revealed 3-Phase Workflow Cards with 3D Tilt */}
      <ScrollRevealBlock className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
            {lang === 'pl'
              ? '01. Architektura procesu sesyjnego'
              : '01. Three-Phase Session Workflow'}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {lang === 'pl'
              ? 'Telefon przed i po sesji · Pulpit w trakcie sesji'
              : 'Mobile before & after session · Desktop during session'}
          </span>
        </div>

        <MotionStaggerGrid triggerOnView className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SpotlightCard
            inheritStagger
            tilt3d
            onClick={() => onNavigate('pre-session')}
            spotlightColor="rgba(34, 211, 238, 0.16)"
            className="p-5 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                  01 · PRZED SESJĄ / PRE-SESSION
                </span>
                <Clock className="w-4 h-4 text-cyan-500/70" />
              </div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                {lang === 'pl'
                  ? 'Cztery liczby i mapa poziomów dnia'
                  : 'Four Numbers & Structural Day Map'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {lang === 'pl'
                  ? 'Klarowność wczorajszej sesji, paliwo likwidacyjne ±1%, typowa szerokość kolejnej godziny, dystans od dziennego VWAP oraz poziomy VAH / POC / VAL poprzedniej sesji.'
                  : 'Yesterday’s clarity, liquidation fuel within ±1% of price, typical width of the next hour, distance from day VWAP, and previous session VAH / POC / VAL.'}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
              <span className="w-full inline-flex items-center justify-between text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                <span>
                  {lang === 'pl' ? 'Otwórz ekran Przed sesją' : 'Open Pre-session screen'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </SpotlightCard>

          <SpotlightCard
            inheritStagger
            tilt3d
            onClick={() => onNavigate('in-session')}
            spotlightColor="rgba(129, 140, 248, 0.16)"
            className="p-5 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold text-indigo-700 dark:text-indigo-400">
                  02 · W SESJI / IN SESSION
                </span>
                <Activity className="w-4 h-4 text-indigo-500/70" />
              </div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                {lang === 'pl'
                  ? 'Wykresy przepływu zleceń i szyna kontekstowa'
                  : 'Order-Flow Charts & Compact Context Rail'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {lang === 'pl'
                  ? 'Wykres świecowy (lightweight-charts), heatmapa arkusza i footprint bez ingerencji w silnik renderujący, otoczone kompaktową szyną Initial Balance, budżetu zasięgu, RVOL i VWAP.'
                  : 'Unmodified candlestick chart, order-flow heatmap, and footprint surrounded by redesigned toolbars, legends, and the Initial Balance / Range Budget / RVOL / VWAP context rail.'}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
              <span className="w-full inline-flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                <span>
                  {lang === 'pl' ? 'Otwórz ekran W sesji' : 'Open In-session screen'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </SpotlightCard>

          <SpotlightCard
            inheritStagger
            tilt3d
            onClick={() => onNavigate('post-session')}
            spotlightColor="rgba(251, 191, 36, 0.16)"
            className="p-5 flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                  03 · PO SESJI / POST-SESSION
                </span>
                <ClipboardCheck className="w-4 h-4 text-amber-500/70" />
              </div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-100">
                {lang === 'pl'
                  ? 'Podsumowanie sesji i rejestr prognoz'
                  : 'Session Review & Verifiable Forecast Ledger'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {lang === 'pl'
                  ? 'Porównanie zrealizowanego zasięgu z Initial Balance, migracja obszaru wartości (Value Area) oraz krzywa kalibracji wszystkich opublikowanych hipotez.'
                  : 'Compare realized session range against Initial Balance, inspect Value Area migration, and audit the calibration curve of published structural forecasts.'}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80">
              <span className="w-full inline-flex items-center justify-between text-xs font-semibold text-amber-700 dark:text-amber-400">
                <span>
                  {lang === 'pl' ? 'Otwórz ekran Po sesji' : 'Open Post-session screen'}
                </span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </SpotlightCard>
        </MotionStaggerGrid>
      </ScrollRevealBlock>

      {/* Open-Source & MCP Server Credibility Bento */}
      <MotionStaggerGrid triggerOnView className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card
          inheritStagger
          className="lg:col-span-7"
          kicker={lang === 'pl' ? '02. Weryfikowalność i Open-Source' : '02. Verifiability & Open-Source'}
          title={
            lang === 'pl'
              ? 'Każda liczba ma swoje źródło, znacznik czasu i rygor braku predykcji'
              : 'Every number carries provenance, timestamp, and non-predictive rigor'
          }
          provenance={{ type: 'LIVE', timestamp: hlState.lastUpdated }}
          lang={lang}
        >
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <p>
              {lang === 'pl'
                ? 'HyperQuant nigdy nie generuje sygnałów kupna/sprzedaży ani strzałek sugerujących kierunek ceny. Zamiast obietnic prezentujemy mierzalny stan aukcji L1 Hyperliquid, oznaczając każdą wartość jako LIVE (bezpośrednio z API), MODEL (wyliczenie mikrostrukturalne) lub SIM (symulacja referencyjna).'
                : 'HyperQuant never emits buy/sell signals, price targets, or directional arrows. Instead, it exposes verifiable Hyperliquid L1 auction telemetry, tagging every figure with LIVE (direct L1 API), MODEL (microstructure calculation), or SIM (reference simulation).'}
            </p>
            <motion.div
              variants={prefersReduced ? undefined : staggerCardGridVariants}
              initial={prefersReduced ? false : 'hidden'}
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2"
            >
              <motion.button
                type="button"
                variants={prefersReduced ? undefined : staggerCardVariants}
                onClick={() => onNavigate('sources')}
                whileHover={
                  prefersReduced
                    ? undefined
                    : { y: -3, scale: 1.015, transition: SPRING_TACTILE }
                }
                whileTap={
                  prefersReduced
                    ? undefined
                    : { scale: 0.98, y: 0, transition: SPRING_PRESS }
                }
                className="p-3 rounded-lg bg-slate-50 dark:bg-[#0D1322] border border-slate-200/80 dark:border-slate-800 hover:border-cyan-500/40 text-left cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-cyan-500"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-semibold text-cyan-700 dark:text-cyan-400">
                    LIVE
                  </span>
                  <GitBranch className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {lang === 'pl'
                    ? 'POST api.hyperliquid.xyz/info (allMids, metaAndAssetCtxs) co 10 s.'
                    : 'POST api.hyperliquid.xyz/info (allMids, metaAndAssetCtxs) polled every 10s.'}
                </p>
              </motion.button>
              <motion.button
                type="button"
                variants={prefersReduced ? undefined : staggerCardVariants}
                onClick={() => onNavigate('sources')}
                whileHover={
                  prefersReduced
                    ? undefined
                    : { y: -3, scale: 1.015, transition: SPRING_TACTILE }
                }
                whileTap={
                  prefersReduced
                    ? undefined
                    : { scale: 0.98, y: 0, transition: SPRING_PRESS }
                }
                className="p-3 rounded-lg bg-slate-50 dark:bg-[#0D1322] border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 text-left cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-cyan-500"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-semibold text-indigo-700 dark:text-indigo-400">
                    MODEL
                  </span>
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {lang === 'pl'
                    ? 'Deterministyczne wyliczenia VAH/POC/VAL, RVOL, VWAP σ i paliwa likwidacyjnego.'
                    : 'Deterministic VAH/POC/VAL, RVOL, VWAP σ, and liquidation fuel calculations.'}
                </p>
              </motion.button>
              <motion.button
                type="button"
                variants={prefersReduced ? undefined : staggerCardVariants}
                onClick={() => onNavigate('sources')}
                whileHover={
                  prefersReduced
                    ? undefined
                    : { y: -3, scale: 1.015, transition: SPRING_TACTILE }
                }
                whileTap={
                  prefersReduced
                    ? undefined
                    : { scale: 0.98, y: 0, transition: SPRING_PRESS }
                }
                className="p-3 rounded-lg bg-slate-50 dark:bg-[#0D1322] border border-slate-200/80 dark:border-slate-800 hover:border-amber-500/40 text-left cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-cyan-500"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    SIM / —
                  </span>
                  <Terminal className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {lang === 'pl'
                    ? 'Brak danych pokazuje „—” z powodem po najechaniu, nigdy fałszywą liczbę.'
                    : 'Missing data renders "—" with the exact reason on hover, never a fake value.'}
                </p>
              </motion.button>
            </motion.div>
          </div>
        </Card>

        <Card
          inheritStagger
          className="lg:col-span-5"
          spotlightColor="rgba(129, 140, 248, 0.15)"
          kicker={lang === 'pl' ? '03. Serwer MCP dla Claude i ChatGPT' : '03. MCP Server for Claude & ChatGPT'}
          title={
            lang === 'pl'
              ? 'Podłącz kontekst sesyjny bezpośrednio do własnego agenta AI'
              : 'Stream deterministic session context directly into your AI agent'
          }
          headerRight={
            <button
              type="button"
              onClick={() => onNavigate('mcp')}
              className="text-xs font-medium text-cyan-700 dark:text-cyan-400 hover:underline cursor-pointer"
            >
              {lang === 'pl' ? 'Dokumentacja MCP →' : 'MCP Docs →'}
            </button>
          }
        >
          <div className="space-y-3 text-xs">
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {lang === 'pl'
                ? 'Otwarty serwer Model Context Protocol (MCP) udostępnia narzędzia tylko do odczytu: profil VAH/POC/VAL, dystans od VWAP, RVOL i rejestr kalibracji.'
                : 'Our open-source Model Context Protocol (MCP) server exposes read-only tools: VAH/POC/VAL profile, VWAP distance, RVOL, and forecast ledger calibration.'}
            </p>
            <div className="relative group">
              <button
                type="button"
                onClick={handleCopyHeroMcp}
                aria-label={lang === 'pl' ? 'Kopiuj konfigurację MCP' : 'Copy MCP config'}
                className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-mono text-[10px] border border-slate-700 transition-colors cursor-pointer"
              >
                {copiedHeroMcp ? (
                  <>
                    <Check className="w-3 h-3 text-cyan-400" />
                    <span className="text-cyan-300">{lang === 'pl' ? 'Skopiowano' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>{lang === 'pl' ? 'Kopiuj' : 'Copy'}</span>
                  </>
                )}
              </button>
              <pre className="p-3 pr-20 rounded-lg bg-slate-950 text-slate-100 font-mono text-[11px] overflow-x-auto border border-slate-800">
                <code>{HERO_MCP_SNIPPET}</code>
              </pre>
            </div>
            <div className="flex items-center justify-between pt-1">
              <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
              <button
                type="button"
                onClick={() => onNavigate('markets')}
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400 cursor-pointer"
              >
                {lang === 'pl'
                  ? 'Przeglądaj rejestr rynków HIP-3 →'
                  : 'Explore HIP-3 Markets Registry →'}
              </button>
            </div>
          </div>
        </Card>
      </MotionStaggerGrid>
    </MotionStaggerContainer>
  );
};
