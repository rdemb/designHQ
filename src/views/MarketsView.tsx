import React, { useState, useMemo } from 'react';
import { Search, CheckCircle2 } from 'lucide-react';
import {
  Language,
  MarketSymbol,
  formatNumber,
} from '../theme/tokens';
import {
  HyperliquidState,
  HyperliquidAssetMetric,
  SELECTED_MARKET_LIST,
} from '../theme/hyperliquid';
import { Card } from '../components/Card';
import { Badge, MissingValue } from '../components/Badge';
import { DataTable, ColumnDef } from '../components/DataTable';
import { Tabs } from '../components/Tabs';
import { MotionStaggerContainer, MotionStaggerItem } from '../components/MotionPrimitives';

export interface MarketsViewProps {
  lang: Language;
  selectedMarket: MarketSymbol;
  onSelectMarket: (sym: MarketSymbol) => void;
  hlState: HyperliquidState;
}

type CategoryFilter = 'all' | 'crypto' | 'hip3-equity-index' | 'hip3-commodity';

export const MarketsView: React.FC<MarketsViewProps> = ({
  lang,
  selectedMarket,
  onSelectMarket,
  hlState,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');

  const filteredMarkets = useMemo(() => {
    return hlState.marketList.filter((m) => {
      if (categoryFilter === 'crypto' && m.category !== 'crypto') return false;
      if (
        categoryFilter === 'hip3-equity-index' &&
        m.category !== 'hip3-equity' &&
        m.category !== 'hip3-index'
      ) {
        return false;
      }
      if (categoryFilter === 'hip3-commodity' && m.category !== 'hip3-commodity') {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.symbol.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [hlState.marketList, categoryFilter, searchQuery]);

  const columns: ColumnDef<HyperliquidAssetMetric>[] = useMemo(
    () => [
      {
        key: 'symbol',
        header: lang === 'pl' ? 'Instrument / Rejestr' : 'Instrument / Registry',
        sortable: true,
        sortValue: (r) => r.symbol,
        render: (r) => {
          const isDeskActive = r.symbol === selectedMarket;
          return (
            <div className="flex items-center gap-2.5 font-sans">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-semibold text-slate-900 dark:text-white">
                    {r.symbol}
                  </span>
                  {isDeskActive && (
                    <CheckCircle2
                      className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400"
                      aria-label="Active desk market"
                    />
                  )}
                </div>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                  {r.name}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: 'midPrice',
        header: lang === 'pl' ? 'Cena mid (USD)' : 'Mid Price (USD)',
        align: 'right',
        sortable: true,
        sortValue: (r) => r.midPrice ?? -1,
        render: (r) =>
          r.midPrice !== null ? (
            <span className="font-semibold text-slate-900 dark:text-white">
              $
              {formatNumber(r.midPrice, lang, {
                decimals: r.symbol === 'BTC' ? 0 : r.symbol === 'HYPE' ? 2 : 2,
              })}
            </span>
          ) : (
            <MissingValue
              reason={
                r.provenance.missingReason ||
                'Brak strumienia cenowego / Price feed unavailable'
              }
            />
          ),
      },
      {
        key: 'change24hPct',
        header: lang === 'pl' ? 'Zmiana 24h' : '24h Change',
        align: 'right',
        sortable: true,
        sortValue: (r) => r.change24hPct ?? -999,
        render: (r) =>
          r.change24hPct !== null ? (
            <span
              className={
                r.change24hPct >= 0
                  ? 'text-cyan-700 dark:text-cyan-400 font-medium'
                  : 'text-amber-700 dark:text-amber-400 font-medium'
              }
            >
              {formatNumber(r.change24hPct, lang, {
                decimals: 2,
                sign: true,
                suffix: '%',
              })}
            </span>
          ) : (
            <MissingValue
              reason={
                r.provenance.missingReason ||
                'Brak ceny odniesienia z poprzedniej doby / Missing 24h reference price'
              }
            />
          ),
      },
      {
        key: 'volume24hUsd',
        header: lang === 'pl' ? 'Wolumen 24h (USD)' : '24h Volume (USD)',
        align: 'right',
        sortable: true,
        sortValue: (r) => r.volume24hUsd ?? -1,
        render: (r) =>
          r.volume24hUsd !== null ? (
            <span className="text-slate-800 dark:text-slate-200">
              {formatNumber(r.volume24hUsd, lang, {
                compact: true,
                prefix: '$',
              })}
            </span>
          ) : (
            <MissingValue
              reason={
                r.provenance.missingReason ||
                'Rynek HIP-3 oczekuje na start obrotu / HIP-3 market awaiting launch'
              }
            />
          ),
      },
      {
        key: 'openInterestUsd',
        header: lang === 'pl' ? 'Otwarte pozycje (OI USD)' : 'Open Interest (USD)',
        align: 'right',
        sortable: true,
        sortValue: (r) => r.openInterestUsd ?? -1,
        render: (r) =>
          r.openInterestUsd !== null ? (
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {formatNumber(r.openInterestUsd, lang, {
                compact: true,
                prefix: '$',
              })}
            </span>
          ) : (
            <MissingValue
              reason={
                r.provenance.missingReason ||
                'Brak otwartych pozycji w kontrakcie HIP-3 / Zero active OI'
              }
            />
          ),
      },
      {
        key: 'fundingAnnualizedPct',
        header: lang === 'pl' ? 'Funding (rocznie)' : 'Annualised Funding',
        align: 'right',
        sortable: true,
        sortValue: (r) => r.fundingAnnualizedPct ?? -999,
        render: (r) =>
          r.fundingAnnualizedPct !== null ? (
            <span className="text-slate-800 dark:text-slate-200">
              {formatNumber(r.fundingAnnualizedPct, lang, {
                decimals: 2,
                sign: true,
                suffix: '%',
              })}
            </span>
          ) : (
            <MissingValue
              reason={
                r.provenance.missingReason ||
                'Brak stawki finansowania / Funding rate not initialized'
              }
            />
          ),
      },
      {
        key: 'marketHoursLabel',
        header: lang === 'pl' ? 'Godziny handlu (US / L1)' : 'Market Hours Label',
        align: 'left',
        render: (r) => (
          <span className="font-sans text-xs text-slate-600 dark:text-slate-300">
            {r.marketHoursLabel[lang]}
          </span>
        ),
      },
      {
        key: 'provenance',
        header: lang === 'pl' ? 'Pochodzenie i czas' : 'Provenance & Time',
        align: 'right',
        render: (r) => (
          <Badge
            type={r.provenance.type}
            timestamp={r.provenance.timestamp}
            lang={lang}
          />
        ),
      },
    ],
    [lang, selectedMarket]
  );

  return (
    <MotionStaggerContainer className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <MotionStaggerItem className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <p className="text-xs font-mono text-cyan-700 dark:text-cyan-400">
            HYPERLIQUID L1 &amp; HIP-3 REGISTRY
          </p>
          <h1 className="font-display text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
            {lang === 'pl'
              ? 'Rynki — Rejestr kontraktów Perpetual i HIP-3'
              : 'Markets — Hyperliquid Perpetuals & HIP-3 Registry'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {lang === 'pl'
              ? 'Aktywne rynki krypto L1 (BTC, ETH, SOL, HYPE) odpytywane na żywo co 10 s oraz rejestr nadchodzących akcji, indeksów i surowców HIP-3.'
              : 'Live L1 crypto markets (BTC, ETH, SOL, HYPE) polled every 10s alongside the HIP-3 equities, indices, and commodities registry.'}
          </p>
        </div>

        <Badge
          type={hlState.isLiveConnected ? 'LIVE' : 'SIM'}
          timestamp={hlState.lastUpdated}
          lang={lang}
        />
      </MotionStaggerItem>

      {/* Filter & Search Bar */}
      <MotionStaggerItem className="flex flex-wrap items-center justify-between gap-3">
        <Tabs<CategoryFilter>
          ariaLabel={lang === 'pl' ? 'Kategoria rynków' : 'Market category filter'}
          activeId={categoryFilter}
          onChange={setCategoryFilter}
          options={[
            {
              id: 'all',
              label: lang === 'pl' ? 'Wszystkie rynki' : 'All Markets',
              count: hlState.marketList.length,
            },
            {
              id: 'crypto',
              label: lang === 'pl' ? 'Krypto L1 (LIVE)' : 'Crypto L1 (LIVE)',
              count: 4,
            },
            {
              id: 'hip3-equity-index',
              label:
                lang === 'pl'
                  ? 'Akcje i Indeksy (HIP-3)'
                  : 'Equities & Indices (HIP-3)',
              count: 2,
            },
            {
              id: 'hip3-commodity',
              label: lang === 'pl' ? 'Surowce (HIP-3)' : 'Commodities (HIP-3)',
              count: 2,
            },
          ]}
        />

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              lang === 'pl'
                ? 'Szukaj symbolu (np. BTC, HYPE, XAU)...'
                : 'Search symbol (e.g. BTC, HYPE, XAU)...'
            }
            aria-label={lang === 'pl' ? 'Szukaj rynku' : 'Search market'}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-white dark:bg-[#0E131D] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-2 focus-visible:outline-cyan-500"
          />
        </div>
      </MotionStaggerItem>

      {/* Markets Registry Table */}
      <MotionStaggerItem>
      <DataTable
        ariaLabel={lang === 'pl' ? 'Tabela rynków Hyperliquid' : 'Hyperliquid markets table'}
        columns={columns}
        data={filteredMarkets}
        rowKey={(r) => r.symbol}
        isLoading={hlState.isLoading}
        selectedRowKey={selectedMarket}
        onRowClick={(row) => {
          if (SELECTED_MARKET_LIST.includes(row.symbol as MarketSymbol)) {
            onSelectMarket(row.symbol as MarketSymbol);
          }
        }}
        emptyTitle={
          lang === 'pl'
            ? 'Brak rynków spełniających kryteria filtra'
            : 'No markets match your current filter'
        }
        emptyDescription={
          lang === 'pl'
            ? 'Zmień kategorię HIP-3 lub wyczyść frazę wyszukiwania, aby wyświetlić pełny rejestr.'
            : 'Switch the HIP-3 category tab or clear the search input to restore the full registry.'
        }
        resetLabel={lang === 'pl' ? 'Wyczyść filtry' : 'Reset filters'}
        onResetEmpty={() => {
          setCategoryFilter('all');
          setSearchQuery('');
        }}
      />
      </MotionStaggerItem>

      {/* HIP-3 Cross-Market Context Note */}
      <MotionStaggerItem>
      <Card
        kicker={lang === 'pl' ? 'Architektura rejestru HIP-3' : 'HIP-3 Registry Architecture'}
        title={
          lang === 'pl'
            ? 'Zunifikowana tabela kontraktów ciągłych krypto (24/7) i aktywów tradycyjnych (US Market Hours)'
            : 'Unified registry across 24/7 crypto perpetuals and US RTH / CME session assets'
        }
        provenance={{ type: 'SIM', timestamp: hlState.lastUpdated }}
        lang={lang}
      >
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {lang === 'pl'
            ? 'Kliknij wiersz BTC, ETH, SOL lub HYPE, aby przełączyć aktywny rynek na całym desku. Kontrakty HIP-3 (NVDA, SPX, XAU, WTI) prezentują strukturę rejestru dla nadchodzących rynków powiązanych z godzinami sesji amerykańskiej (15:30–22:00 CET). Brakujące odczyty wyroczni (np. WTI-HIP3) wyświetlają znak „—” wraz z uzasadnieniem technicznym po najechaniu kursorem.'
            : 'Click any BTC, ETH, SOL, or HYPE row to switch the active instrument across the entire desk. HIP-3 contracts (NVDA, SPX, XAU, WTI) demonstrate the cross-asset registry schema with explicit US Regular Trading Hours labels (15:30–22:00 CET). Uninitialized oracle feeds (such as WTI-HIP3) render "—" with the exact reason on hover.'}
        </p>
      </Card>
      </MotionStaggerItem>
    </MotionStaggerContainer>
  );
};
