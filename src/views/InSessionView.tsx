import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  SlidersHorizontal,
  Layers,
  Maximize2,
  Eye,
} from 'lucide-react';
import {
  Language,
  MarketSymbol,
  formatNumber,
  getAmsterdamSessionStatus,
} from '../theme/tokens';
import { HyperliquidState } from '../theme/hyperliquid';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Tabs } from '../components/Tabs';
import { EmptyState } from '../components/EmptyState';
import {
  MotionStaggerContainer,
  MotionStaggerItem,
  MotionStaggerGrid,
  SpotlightCard,
  SPRING_SMOOTH,
} from '../components/MotionPrimitives';

export interface InSessionViewProps {
  lang: Language;
  selectedMarket: MarketSymbol;
  hlState: HyperliquidState;
}

type TimeframeId = '1m' | '5m' | '15m' | '1h';
type TickGroup = '1' | '5' | '10' | '25';
type ViewportStateMode = 'normal' | 'loading' | 'empty';

export const InSessionView: React.FC<InSessionViewProps> = ({
  lang,
  selectedMarket,
  hlState,
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeId>('5m');
  const [tickGroup, setTickGroup] = useState<TickGroup>('10');
  const [showVwapBands, setShowVwapBands] = useState<boolean>(true);
  const [showIbLevels, setShowIbLevels] = useState<boolean>(true);
  const [showPrevVa, setShowPrevVa] = useState<boolean>(true);
  const [viewportMode, setViewportMode] = useState<ViewportStateMode>('normal');

  const asset = hlState.assets[selectedMarket] || hlState.marketList[0];
  const midPrice = asset?.midPrice ?? 75791;
  const decimals = selectedMarket === 'BTC' ? 0 : selectedMarket === 'HYPE' ? 2 : 1;
  const sessionStatus = getAmsterdamSessionStatus();

  const ibHigh = Number((midPrice * 1.0048).toFixed(decimals));
  const ibLow = Number((midPrice * 0.9962).toFixed(decimals));
  const ibWidthPct = 0.86;
  const rangeBudgetUsedPct = 64;
  const dailyAtrUsd = Number((midPrice * 0.024).toFixed(decimals));
  const realizedRangeUsd = Number((dailyAtrUsd * 0.64).toFixed(decimals));
  const rvol = 1.28;
  const vwapPrice = Number((midPrice * 0.9966).toFixed(decimals));
  const vwapDistPct = 0.34;
  const vwapSigma = 0.78;

  // Radial Range Budget Gauge geometry
  const gaugeR = 18;
  const gaugeCirc = 2 * Math.PI * gaugeR;
  const gaugeOffset = gaugeCirc - (rangeBudgetUsedPct / 100) * gaugeCirc;

  return (
    <MotionStaggerContainer className="space-y-4 max-w-[1840px] mx-auto">
      {/* Top Workspace Toolbar around the Unchanged Charts */}
      <MotionStaggerItem>
        <SpotlightCard className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex flex-wrap items-center gap-3">
              <Tabs<TimeframeId>
                ariaLabel={lang === 'pl' ? 'Interwał wykresu' : 'Chart timeframe'}
                activeId={timeframe}
                onChange={setTimeframe}
                options={[
                  { id: '1m', label: '1m' },
                  { id: '5m', label: '5m' },
                  { id: '15m', label: '15m' },
                  { id: '1h', label: '1h' },
                ]}
              />

              <div className="flex items-center gap-1.5 text-xs font-mono">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <label
                  htmlFor="tick-agg-select"
                  className="text-slate-500 dark:text-slate-400 font-sans"
                >
                  {lang === 'pl' ? 'Agregacja ticków:' : 'Tick step:'}
                </label>
                <select
                  id="tick-agg-select"
                  value={tickGroup}
                  onChange={(e) => setTickGroup(e.target.value as TickGroup)}
                  className="bg-slate-100 dark:bg-[#101726] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700/80 rounded px-2 py-1 text-xs cursor-pointer"
                >
                  <option value="1">1 tick</option>
                  <option value="5">5 ticks</option>
                  <option value="10">10 ticks</option>
                  <option value="25">25 ticks</option>
                </select>
              </div>

              <div className="hidden md:flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-3 text-xs">
                <button
                  type="button"
                  onClick={() => setShowVwapBands((v) => !v)}
                  aria-pressed={showVwapBands}
                  className={`px-2.5 py-1 rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    showVwapBands
                      ? 'border-cyan-500/50 bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 font-medium'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  VWAP ±1σ/2σ
                </button>
                <button
                  type="button"
                  onClick={() => setShowIbLevels((v) => !v)}
                  aria-pressed={showIbLevels}
                  className={`px-2.5 py-1 rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    showIbLevels
                      ? 'border-indigo-500/50 bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 font-medium'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  IBH / IBL
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrevVa((v) => !v)}
                  aria-pressed={showPrevVa}
                  className={`px-2.5 py-1 rounded border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                    showPrevVa
                      ? 'border-amber-500/50 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-medium'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500'
                  }`}
                >
                  dVAH / dPOC / dVAL
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="text-slate-500 dark:text-slate-400 font-sans">
                  {lang === 'pl' ? 'Głębokość L2:' : 'L2 Depth:'}
                </span>
                <span className="text-slate-400">0</span>
                <div
                  className="w-24 h-2.5 rounded-xs bg-gradient-to-r from-slate-900 via-cyan-500 to-amber-400 border border-slate-300 dark:border-slate-700"
                  aria-label="Heatmap depth scale from 0 to 25M USD"
                />
                <span className="text-amber-600 dark:text-amber-400 font-semibold">
                  {lang === 'pl' ? '25 mln$' : '$25M'}
                </span>
              </div>

              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-3 text-[11px]">
                <Eye className="w-3.5 h-3.5 text-slate-400 mr-1" />
                {(['normal', 'loading', 'empty'] as ViewportStateMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setViewportMode(mode)}
                    aria-pressed={viewportMode === mode}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono cursor-pointer ${
                      viewportMode === mode
                        ? 'bg-slate-900 text-white dark:bg-slate-800 dark:text-cyan-300 font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
                    }`}
                  >
                    {mode === 'normal'
                      ? lang === 'pl'
                        ? 'Widok'
                        : 'Live'
                      : mode === 'loading'
                      ? 'Skeleton'
                      : 'Empty'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SpotlightCard>
      </MotionStaggerItem>

      {/* Main In-Session Grid */}
      <MotionStaggerItem className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-stretch">
        <div className="xl:col-span-9 flex flex-col gap-4">
          {viewportMode === 'empty' ? (
            <EmptyState
              title={
                lang === 'pl'
                  ? 'Strumień L2 WebSocket wstrzymany dla wybranego instrumentu'
                  : 'L2 Orderbook WebSocket stream paused for selected instrument'
              }
              description={
                lang === 'pl'
                  ? 'Brak zagregowanych pakietów L2/Footprint w buforze lokalnym. Przywróć połączenie ze strumieniem, aby wyrenderować wykres świecowy, heatmapę i footprint.'
                  : 'No aggregated L2/Footprint packets in local ring buffer. Resume stream connection to render candlestick, heatmap, and footprint canvases.'
              }
              actionLabel={
                lang === 'pl' ? 'Wznów strumień wykresów' : 'Resume chart stream'
              }
              onAction={() => setViewportMode('normal')}
            />
          ) : (
            <>
              <MotionStaggerGrid className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* 1. Candlestick Chart Placeholder (lightweight-charts) */}
                <SpotlightCard inheritStagger className="lg:col-span-6 flex flex-col overflow-hidden group">
                  <span aria-hidden="true" className="pointer-events-none absolute top-1.5 left-1.5 z-20 w-2 h-2 border-t border-l border-cyan-500/50 dark:border-cyan-400/55" />
                  <span aria-hidden="true" className="pointer-events-none absolute top-1.5 right-1.5 z-20 w-2 h-2 border-t border-r border-cyan-500/50 dark:border-cyan-400/55" />
                  <span aria-hidden="true" className="pointer-events-none absolute bottom-1.5 left-1.5 z-20 w-2 h-2 border-b border-l border-cyan-500/50 dark:border-cyan-400/55" />
                  <span aria-hidden="true" className="pointer-events-none absolute bottom-1.5 right-1.5 z-20 w-2 h-2 border-b border-r border-cyan-500/50 dark:border-cyan-400/55" />
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {selectedMarket}-PERP · {timeframe} (lightweight-charts)
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        {showVwapBands ? 'VWAP+σ' : ''}{' '}
                        {showIbLevels ? '· IB' : ''}{' '}
                        {showPrevVa ? '· dVA' : ''}
                      </span>
                    </div>
                    <Badge
                      type={asset?.provenance.type || 'SIM'}
                      timestamp={asset?.provenance.timestamp || hlState.lastUpdated}
                      lang={lang}
                    />
                  </div>

                  {viewportMode === 'loading' ? (
                    <div className="aspect-[16/10] p-6 flex flex-col justify-between animate-pulse bg-slate-50/50 dark:bg-[#060910]">
                      <div className="h-3 w-36 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="space-y-3">
                        <div className="h-20 w-full bg-slate-200/70 dark:bg-slate-800/60 rounded" />
                        <div className="h-12 w-5/6 bg-slate-200/70 dark:bg-slate-800/60 rounded" />
                      </div>
                      <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  ) : (
                    <div
                      className="aspect-[16/10] relative flex flex-col items-center justify-center p-6 bg-slate-50/70 dark:bg-[#060910] text-center select-none"
                      style={{
                        backgroundImage:
                          'linear-gradient(to right, rgba(148,163,184,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.06) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                      }}
                    >
                      <div className="absolute right-2 top-4 bottom-4 flex flex-col justify-between text-[10px] font-mono tabular-nums text-right pointer-events-none">
                        {showIbLevels && (
                          <span className="px-1.5 py-0.5 rounded-xs bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40">
                            IBH ${formatNumber(ibHigh, lang, { decimals })}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded-xs bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-500/40 font-semibold">
                          MID ${formatNumber(midPrice, lang, { decimals })}
                        </span>
                        {showVwapBands && (
                          <span className="px-1.5 py-0.5 rounded-xs bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/40">
                            VWAP ${formatNumber(vwapPrice, lang, { decimals })}
                          </span>
                        )}
                        {showIbLevels && (
                          <span className="px-1.5 py-0.5 rounded-xs bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/40">
                            IBL ${formatNumber(ibLow, lang, { decimals })}
                          </span>
                        )}
                      </div>

                      <div className="max-w-xs p-4 rounded-lg bg-white/90 dark:bg-[#0E1422]/95 border border-slate-200 dark:border-slate-700 shadow-xs">
                        <p className="font-mono text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                          Wykres bez zmian / Chart unchanged
                        </p>
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                          Candlestick Chart (lightweight-charts)
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {lang === 'pl'
                            ? 'Istniejący komponent wykresu świecowego z nałożonymi pasmami VWAP, IBH/IBL i poziomami dVAH/dPOC/dVAL (proporcje 16:10).'
                            : 'Existing lightweight-charts canvas with VWAP bands, IBH/IBL, and dVAH/dPOC/dVAL overlays preserved (16:10 aspect ratio).'}
                        </p>
                      </div>
                    </div>
                  )}
                </SpotlightCard>

                {/* 2. Order-Flow Heatmap Placeholder */}
                <SpotlightCard inheritStagger className="lg:col-span-6 flex flex-col overflow-hidden group">
                  <span aria-hidden="true" className="pointer-events-none absolute top-1.5 left-1.5 z-20 w-2 h-2 border-t border-l border-cyan-500/50 dark:border-cyan-400/55" />
                  <span aria-hidden="true" className="pointer-events-none absolute top-1.5 right-1.5 z-20 w-2 h-2 border-t border-r border-cyan-500/50 dark:border-cyan-400/55" />
                  <span aria-hidden="true" className="pointer-events-none absolute bottom-1.5 left-1.5 z-20 w-2 h-2 border-b border-l border-cyan-500/50 dark:border-cyan-400/55" />
                  <span aria-hidden="true" className="pointer-events-none absolute bottom-1.5 right-1.5 z-20 w-2 h-2 border-b border-r border-cyan-500/50 dark:border-cyan-400/55" />
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {lang === 'pl'
                          ? 'Heatmapa przepływu zleceń (L2 DOM)'
                          : 'Order-Flow Heatmap (L2 DOM)'}
                      </span>
                      <span className="font-mono text-[11px] text-slate-400">
                        Step: {tickGroup}t
                      </span>
                    </div>
                    <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
                  </div>

                  {viewportMode === 'loading' ? (
                    <div className="aspect-[16/10] p-6 flex flex-col justify-between animate-pulse bg-slate-50/50 dark:bg-[#060910]">
                      <div className="h-3 w-40 bg-slate-200 dark:bg-slate-800 rounded" />
                      <div className="h-28 w-full bg-slate-200/70 dark:bg-slate-800/60 rounded" />
                      <div className="h-3 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                    </div>
                  ) : (
                    <div
                      className="aspect-[16/10] relative flex flex-col items-center justify-center p-6 bg-slate-50/70 dark:bg-[#060910] text-center select-none"
                      style={{
                        backgroundImage:
                          'linear-gradient(to bottom, rgba(34,211,238,0.06) 2px, transparent 2px)',
                        backgroundSize: '100% 14px',
                      }}
                    >
                      <div className="max-w-xs p-4 rounded-lg bg-white/90 dark:bg-[#0E1422]/95 border border-slate-200 dark:border-slate-700 shadow-xs">
                        <p className="font-mono text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                          Wykres bez zmian / Chart unchanged
                        </p>
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                          Live Order-Flow Heatmap Canvas
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          {lang === 'pl'
                            ? 'Istniejąca mapa płynności L2 z historią spoczywających zleceń limit i profilowaniem absorpcji (16:10).'
                            : 'Existing WebGL/Canvas L2 resting limit orderbook heatmap with depth histogram (16:10 aspect ratio).'}
                        </p>
                      </div>
                    </div>
                  )}
                </SpotlightCard>
              </MotionStaggerGrid>

              {/* Bottom Wide Panel: Footprint Cluster Chart Placeholder */}
              <SpotlightCard className="flex flex-col overflow-hidden group">
                <span aria-hidden="true" className="pointer-events-none absolute top-1.5 left-1.5 z-20 w-2 h-2 border-t border-l border-cyan-500/50 dark:border-cyan-400/55" />
                <span aria-hidden="true" className="pointer-events-none absolute top-1.5 right-1.5 z-20 w-2 h-2 border-t border-r border-cyan-500/50 dark:border-cyan-400/55" />
                <span aria-hidden="true" className="pointer-events-none absolute bottom-1.5 left-1.5 z-20 w-2 h-2 border-b border-l border-cyan-500/50 dark:border-cyan-400/55" />
                <span aria-hidden="true" className="pointer-events-none absolute bottom-1.5 right-1.5 z-20 w-2 h-2 border-b border-r border-cyan-500/50 dark:border-cyan-400/55" />
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {lang === 'pl'
                        ? `Footprint (Bid × Ask Cluster · ${timeframe} · krok ${tickGroup}t)`
                        : `Footprint (Bid × Ask Cluster · ${timeframe} · step ${tickGroup}t)`}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      CVD Delta: +14,2 mln USD · Imbalance threshold: 300%
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
                    <Maximize2
                      className="w-3.5 h-3.5 text-slate-400"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {viewportMode === 'loading' ? (
                  <div className="aspect-[21/8] p-6 flex items-center justify-center animate-pulse bg-slate-50/50 dark:bg-[#060910]">
                    <div className="h-32 w-full bg-slate-200/70 dark:bg-slate-800/60 rounded" />
                  </div>
                ) : (
                  <div
                    className="aspect-[21/8] min-h-[210px] relative flex flex-col items-center justify-center p-6 bg-slate-50/70 dark:bg-[#060910] text-center select-none"
                    style={{
                      backgroundImage:
                        'linear-gradient(to right, rgba(148,163,184,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.05) 1px, transparent 1px)',
                      backgroundSize: '84px 20px',
                    }}
                  >
                    <div className="max-w-md p-4 rounded-lg bg-white/90 dark:bg-[#0E1422]/95 border border-slate-200 dark:border-slate-700 shadow-xs">
                      <p className="font-mono text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                        Wykres bez zmian / Chart unchanged
                      </p>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-1">
                        Order-Flow Footprint (Bid × Ask Volume &amp; Delta Profile)
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {lang === 'pl'
                          ? 'Istniejący wykres Footprint z podsumowaniem wolumenu, skumulowaną deltą (CVD) i oznaczeniem nierównowagi (proporcje 21:8).'
                          : 'Existing Footprint cluster canvas with bar delta footer, POC highlights, and diagonal bid/ask imbalances (21:8 aspect ratio).'}
                      </p>
                    </div>
                  </div>
                )}
              </SpotlightCard>
            </>
          )}
        </div>

        {/* Right 3 Columns: Compact Context Rail with Radial Range Budget Gauge */}
        <aside
          aria-label={
            lang === 'pl' ? 'Kompaktowa szyna kontekstowa' : 'Compact in-session context rail'
          }
          className="xl:col-span-3"
        >
          <MotionStaggerGrid className="flex flex-col gap-3">
          <Card
            inheritStagger
            title={
              lang === 'pl'
                ? 'Szyna kontekstowa (Context Rail)'
                : 'In-Session Context Rail'
            }
            subtitle={
              lang === 'pl'
                ? 'Parametry odniesienia w czasie rzeczywistym'
                : 'Real-time structural benchmarks'
            }
            provenance={{ type: 'MODEL', timestamp: hlState.lastUpdated }}
            lang={lang}
          >
            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              <div className="pt-1">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span>{lang === 'pl' ? '1. Aktywna sesja' : '1. Active session'}</span>
                  <Badge type="LIVE" timestamp={sessionStatus.amsterdamTimeStr} lang={lang} />
                </div>
                <div className="flex items-baseline justify-between font-mono tabular-nums">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {sessionStatus.currentSessionLabel[lang]}
                  </span>
                  <span className="text-cyan-700 dark:text-cyan-400">
                    {sessionStatus.amsterdamTimeStr} CET
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {lang === 'pl'
                    ? `Kolejne okno: ${sessionStatus.nextSessionLabel.pl}`
                    : `Next window: ${sessionStatus.nextSessionLabel.en}`}
                </p>
              </div>

              <div className="pt-3.5">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span>
                    {lang === 'pl'
                      ? '2. Initial Balance (60m)'
                      : '2. Initial Balance (60m)'}
                  </span>
                  <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono tabular-nums my-1.5 p-2 rounded bg-slate-50 dark:bg-[#0D1322]">
                  <div>
                    <span className="block text-[10px] font-sans text-slate-400">
                      IB High
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      ${formatNumber(ibHigh, lang, { decimals })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] font-sans text-slate-400">
                      IB Low
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      ${formatNumber(ibLow, lang, { decimals })}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {lang === 'pl'
                    ? `Szerokość IB: ${formatNumber(ibWidthPct, lang, {
                        decimals: 2,
                        suffix: '%',
                      })} · Cena wewnątrz IB`
                    : `IB Width: ${formatNumber(ibWidthPct, lang, {
                        decimals: 2,
                        suffix: '%',
                      })} · Price inside IB`}
                </p>
              </div>

              {/* 3. Animated Radial Range Budget Gauge */}
              <div className="pt-3.5">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
                  <span>
                    {lang === 'pl'
                      ? '3. Budżet zasięgu dnia'
                      : '3. Daily Range Budget'}
                  </span>
                  <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 44 44" className="w-12 h-12 -rotate-90">
                      <circle
                        cx="22"
                        cy="22"
                        r={gaugeR}
                        fill="none"
                        strokeWidth="3.5"
                        className="stroke-slate-200 dark:stroke-slate-800"
                      />
                      <motion.circle
                        cx="22"
                        cy="22"
                        r={gaugeR}
                        fill="none"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeDasharray={gaugeCirc}
                        initial={{ strokeDashoffset: gaugeCirc }}
                        animate={{ strokeDashoffset: gaugeOffset }}
                        transition={SPRING_SMOOTH}
                        className="stroke-cyan-500"
                      />
                    </svg>
                    <span className="absolute font-mono text-[10px] font-bold text-slate-900 dark:text-white">
                      {rangeBudgetUsedPct}%
                    </span>
                  </div>
                  <div className="font-mono text-xs tabular-nums">
                    <span className="block font-semibold text-slate-900 dark:text-white">
                      ${formatNumber(realizedRangeUsd, lang, { decimals })} / $
                      {formatNumber(dailyAtrUsd, lang, { decimals })}
                    </span>
                    <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400">
                      {lang === 'pl' ? 'vs 14-dniowa mediana ATR' : 'vs 14d median ATR'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3.5">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span>
                    {lang === 'pl'
                      ? '4. Względny wolumen (RVOL)'
                      : '4. Relative Volume (RVOL)'}
                  </span>
                  <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
                </div>
                <div className="flex items-baseline justify-between font-mono tabular-nums">
                  <span className="text-base font-semibold text-cyan-700 dark:text-cyan-400">
                    {formatNumber(rvol, lang, { decimals: 2, suffix: '×' })}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {lang === 'pl' ? 'Powyżej mediany 20d' : 'Above 20d median'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {lang === 'pl'
                    ? 'Obecny skumulowany obrót stanowi 128% normy dla tej godziny CET.'
                    : 'Cumulative session volume is at 128% of the 20-day norm for this CET hour.'}
                </p>
              </div>

              <div className="pt-3.5">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
                  <span>
                    {lang === 'pl'
                      ? '5. Dystans od VWAP'
                      : '5. Session VWAP Distance'}
                  </span>
                  <Badge
                    type={asset?.provenance.type || 'SIM'}
                    timestamp={asset?.provenance.timestamp || hlState.lastUpdated}
                    lang={lang}
                  />
                </div>
                <div className="flex items-baseline justify-between font-mono tabular-nums">
                  <span className="text-base font-semibold text-slate-900 dark:text-white">
                    {formatNumber(vwapDistPct, lang, {
                      decimals: 2,
                      sign: true,
                      suffix: '%',
                    })}
                  </span>
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    {formatNumber(vwapSigma, lang, {
                      decimals: 2,
                      sign: true,
                      suffix: ' σ',
                    })}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono tabular-nums">
                  VWAP: ${formatNumber(vwapPrice, lang, { decimals })} · +1σ: $
                  {formatNumber(Number((vwapPrice * 1.0044).toFixed(decimals)), lang)}
                </p>
              </div>
            </div>
          </Card>

          <SpotlightCard inheritStagger className="p-3.5 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                {lang === 'pl' ? 'Stan aukcji' : 'Auction state'}
              </span>
              <Badge type="MODEL" timestamp={hlState.lastUpdated} lang={lang} />
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {lang === 'pl'
                ? 'Handel dwustronny wewnątrz Initial Balance przy RVOL 1,28×. Brak potwierdzonej migracji obszaru wartości poza dVAH/dVAL.'
                : 'Two-sided rotational trade inside Initial Balance on 1.28× RVOL. No confirmed Value Area migration outside dVAH/dVAL.'}
            </p>
          </SpotlightCard>
          </MotionStaggerGrid>
        </aside>
      </MotionStaggerItem>
    </MotionStaggerContainer>
  );
};
