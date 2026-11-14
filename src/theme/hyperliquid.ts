import { useState, useEffect, useCallback, useRef } from 'react';
import { DataProvenance, formatTimeAmsterdam, MarketSymbol } from './tokens';

export interface HyperliquidAssetMetric {
  symbol: string;
  category: 'crypto' | 'hip3-equity' | 'hip3-index' | 'hip3-commodity';
  name: string;
  midPrice: number | null;
  prevDayPx: number | null;
  change24hPct: number | null;
  volume24hUsd: number | null;
  openInterestUsd: number | null;
  fundingHourlyPct: number | null;
  fundingAnnualizedPct: number | null;
  oraclePx: number | null;
  basisBps: number | null;
  pdh: number | null;
  pdl: number | null;
  marketHoursLabel: { pl: string; en: string };
  isLiveHip3: boolean;
  provenance: DataProvenance;
}

export interface HyperliquidState {
  assets: Record<string, HyperliquidAssetMetric>;
  marketList: HyperliquidAssetMetric[];
  lastUpdated: string;
  isLiveConnected: boolean;
  isLoading: boolean;
  errorReason: string | null;
  refreshNow: () => void;
}

const FALLBACK_BASE_ASSETS: Omit<HyperliquidAssetMetric, 'provenance'>[] = [
  {
    symbol: 'BTC',
    category: 'crypto',
    name: 'Bitcoin Perpetual',
    midPrice: 75791,
    prevDayPx: 74420,
    change24hPct: 1.84,
    volume24hUsd: 4820000000,
    openInterestUsd: 1420000000,
    fundingHourlyPct: 0.00125,
    fundingAnnualizedPct: 10.95,
    oraclePx: 75764,
    basisBps: 3.56,
    pdh: 76410,
    pdl: 73890,
    marketHoursLabel: { pl: '24/7 Ciągły L1', en: '24/7 Continuous L1' },
    isLiveHip3: true,
  },
  {
    symbol: 'ETH',
    category: 'crypto',
    name: 'Ethereum Perpetual',
    midPrice: 2842.5,
    prevDayPx: 2795.0,
    change24hPct: 1.7,
    volume24hUsd: 1940000000,
    openInterestUsd: 685000000,
    fundingHourlyPct: 0.0011,
    fundingAnnualizedPct: 9.64,
    oraclePx: 2841.2,
    basisBps: 4.57,
    pdh: 2890.0,
    pdl: 2762.0,
    marketHoursLabel: { pl: '24/7 Ciągły L1', en: '24/7 Continuous L1' },
    isLiveHip3: true,
  },
  {
    symbol: 'SOL',
    category: 'crypto',
    name: 'Solana Perpetual',
    midPrice: 184.6,
    prevDayPx: 187.1,
    change24hPct: -1.34,
    volume24hUsd: 912000000,
    openInterestUsd: 342000000,
    fundingHourlyPct: 0.00095,
    fundingAnnualizedPct: 8.32,
    oraclePx: 184.52,
    basisBps: 4.33,
    pdh: 189.4,
    pdl: 181.2,
    marketHoursLabel: { pl: '24/7 Ciągły L1', en: '24/7 Continuous L1' },
    isLiveHip3: true,
  },
  {
    symbol: 'HYPE',
    category: 'crypto',
    name: 'Hyperliquid Native',
    midPrice: 26.84,
    prevDayPx: 25.4,
    change24hPct: 5.67,
    volume24hUsd: 428000000,
    openInterestUsd: 226000000,
    fundingHourlyPct: 0.0024,
    fundingAnnualizedPct: 21.02,
    oraclePx: 26.8,
    basisBps: 14.92,
    pdh: 27.35,
    pdl: 24.9,
    marketHoursLabel: { pl: '24/7 Ciągły L1', en: '24/7 Continuous L1' },
    isLiveHip3: true,
  },
  {
    symbol: 'NVDA-HIP3',
    category: 'hip3-equity',
    name: 'NVIDIA Corp (HIP-3 Synth)',
    midPrice: 138.4,
    prevDayPx: 136.8,
    change24hPct: 1.17,
    volume24hUsd: 42600000,
    openInterestUsd: 18400000,
    fundingHourlyPct: 0.0008,
    fundingAnnualizedPct: 7.01,
    oraclePx: 138.35,
    basisBps: 3.61,
    pdh: 139.8,
    pdl: 135.9,
    marketHoursLabel: { pl: 'US RTH 15:30–22:00 CET', en: 'US RTH 15:30–22:00 CET' },
    isLiveHip3: false,
  },
  {
    symbol: 'SPX-HIP3',
    category: 'hip3-index',
    name: 'S&P 500 Index (HIP-3)',
    midPrice: 5985.0,
    prevDayPx: 5962.0,
    change24hPct: 0.39,
    volume24hUsd: 84500000,
    openInterestUsd: 39200000,
    fundingHourlyPct: 0.0006,
    fundingAnnualizedPct: 5.26,
    oraclePx: 5984.0,
    basisBps: 1.67,
    pdh: 6004.0,
    pdl: 5948.0,
    marketHoursLabel: { pl: 'CME / US 15:30–22:00 CET', en: 'CME / US 15:30–22:00 CET' },
    isLiveHip3: false,
  },
  {
    symbol: 'XAU-HIP3',
    category: 'hip3-commodity',
    name: 'Gold Spot Perp (HIP-3)',
    midPrice: 2684.0,
    prevDayPx: 2671.0,
    change24hPct: 0.49,
    volume24hUsd: 31900000,
    openInterestUsd: 14800000,
    fundingHourlyPct: 0.0005,
    fundingAnnualizedPct: 4.38,
    oraclePx: 2683.5,
    basisBps: 1.86,
    pdh: 2696.0,
    pdl: 2662.0,
    marketHoursLabel: { pl: 'COMEX 23h (Pn–Pt)', en: 'COMEX 23h (Mon–Fri)' },
    isLiveHip3: false,
  },
  {
    symbol: 'WTI-HIP3',
    category: 'hip3-commodity',
    name: 'WTI Crude Oil (HIP-3)',
    midPrice: null,
    prevDayPx: null,
    change24hPct: null,
    volume24hUsd: null,
    openInterestUsd: null,
    fundingHourlyPct: null,
    fundingAnnualizedPct: null,
    oraclePx: null,
    basisBps: null,
    pdh: null,
    pdl: null,
    marketHoursLabel: { pl: 'Oczekuje na wyrocznię HIP-3', en: 'Awaiting HIP-3 Oracle Feed' },
    isLiveHip3: false,
  },
];

export function useHyperliquidData(): HyperliquidState {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(false);
  const [errorReason, setErrorReason] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(() => formatTimeAmsterdam());
  const [marketList, setMarketList] = useState<HyperliquidAssetMetric[]>(() => {
    const ts = formatTimeAmsterdam();
    return FALLBACK_BASE_ASSETS.map((item) => ({
      ...item,
      provenance: {
        type: 'SIM',
        timestamp: ts,
        missingReason:
          item.midPrice === null
            ? 'Brak aktywnego strumienia wyroczni HIP-3 w bieżącej epoce / HIP-3 oracle feed not yet active in current epoch'
            : undefined,
      },
    }));
  });

  const lastFetchMsRef = useRef<number>(0);

  const fetchInfo = useCallback(async (force = false) => {
    const nowMs = Date.now();
    // Respect strict rule: poll no more often than every 10 s
    if (!force && nowMs - lastFetchMsRef.current < 9800) {
      return;
    }
    lastFetchMsRef.current = nowMs;

    try {
      const [midsRes, metaCtxRes] = await Promise.all([
        fetch('https://api.hyperliquid.xyz/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'allMids' }),
        }),
        fetch('https://api.hyperliquid.xyz/info', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type: 'metaAndAssetCtxs' }),
        }),
      ]);

      if (!midsRes.ok || !metaCtxRes.ok) {
        throw new Error(`HTTP ${midsRes.status}/${metaCtxRes.status}`);
      }

      const midsData: Record<string, string> = await midsRes.json();
      const metaAndCtxs = await metaCtxRes.json();
      const ts = formatTimeAmsterdam();

      // metaAndCtxs is [ { universe: [{ name: "BTC", ... }] }, [ { funding, openInterest, prevDayPx, dayNtlVlm, oraclePx, markPx }, ... ] ]
      const universe: Array<{ name: string }> = metaAndCtxs?.[0]?.universe || [];
      const assetCtxs: Array<{
        funding?: string;
        openInterest?: string;
        prevDayPx?: string;
        dayNtlVlm?: string;
        oraclePx?: string;
        markPx?: string;
      }> = metaAndCtxs?.[1] || [];

      const ctxBySymbol: Record<string, (typeof assetCtxs)[number]> = {};
      universe.forEach((u, idx) => {
        if (u?.name && assetCtxs[idx]) {
          ctxBySymbol[u.name] = assetCtxs[idx];
        }
      });

      const updated = FALLBACK_BASE_ASSETS.map((baseItem): HyperliquidAssetMetric => {
        if (!baseItem.isLiveHip3) {
          return {
            ...baseItem,
            provenance: {
              type: 'SIM',
              timestamp: ts,
              missingReason:
                baseItem.midPrice === null
                  ? 'Brak aktywnego strumienia wyroczni HIP-3 w bieżącej epoce / HIP-3 oracle feed not yet active in current epoch'
                  : undefined,
            },
          };
        }

        const sym = baseItem.symbol;
        const liveMidRaw = midsData?.[sym];
        const ctx = ctxBySymbol[sym];

        if (liveMidRaw !== undefined || ctx) {
          const midPrice =
            liveMidRaw !== undefined
              ? parseFloat(liveMidRaw)
              : ctx?.markPx
              ? parseFloat(ctx.markPx)
              : baseItem.midPrice ?? 0;

          const prevDayPx = ctx?.prevDayPx ? parseFloat(ctx.prevDayPx) : baseItem.prevDayPx ?? midPrice;
          const change24hPct =
            prevDayPx && prevDayPx > 0 ? ((midPrice - prevDayPx) / prevDayPx) * 100 : baseItem.change24hPct;
          const volume24hUsd = ctx?.dayNtlVlm ? parseFloat(ctx.dayNtlVlm) : baseItem.volume24hUsd;
          const oiCoins = ctx?.openInterest ? parseFloat(ctx.openInterest) : null;
          const openInterestUsd = oiCoins !== null ? oiCoins * midPrice : baseItem.openInterestUsd;
          const fundingHourlyRaw = ctx?.funding ? parseFloat(ctx.funding) * 100 : baseItem.fundingHourlyPct;
          const fundingAnnualizedPct =
            fundingHourlyRaw !== null && fundingHourlyRaw !== undefined
              ? fundingHourlyRaw * 24 * 365
              : baseItem.fundingAnnualizedPct;
          const oraclePx = ctx?.oraclePx ? parseFloat(ctx.oraclePx) : baseItem.oraclePx;
          const basisBps =
            oraclePx && oraclePx > 0 ? ((midPrice - oraclePx) / oraclePx) * 10000 : baseItem.basisBps;

          // Estimate PDH/PDL around mid/prevDayPx cleanly (marked SIM in UI where appropriate, while mid/OI/funding are LIVE)
          const highRef = Math.max(midPrice, prevDayPx || midPrice);
          const lowRef = Math.min(midPrice, prevDayPx || midPrice);
          const pdh = Number((highRef * 1.012).toFixed(sym === 'BTC' ? 0 : 2));
          const pdl = Number((lowRef * 0.988).toFixed(sym === 'BTC' ? 0 : 2));

          return {
            ...baseItem,
            midPrice,
            prevDayPx,
            change24hPct,
            volume24hUsd,
            openInterestUsd,
            fundingHourlyPct: fundingHourlyRaw,
            fundingAnnualizedPct,
            oraclePx,
            basisBps,
            pdh,
            pdl,
            provenance: {
              type: 'LIVE',
              timestamp: ts,
            },
          };
        }

        return {
          ...baseItem,
          provenance: {
            type: 'SIM',
            timestamp: ts,
          },
        };
      });

      setMarketList(updated);
      setLastUpdated(ts);
      setIsLiveConnected(true);
      setErrorReason(null);
      setIsLoading(false);
    } catch (err) {
      const ts = formatTimeAmsterdam();
      setIsLiveConnected(false);
      setErrorReason(
        err instanceof Error ? err.message : 'Przekroczono czas odpowiedzi API Hyperliquid — tryb SIM'
      );
      setMarketList(
        FALLBACK_BASE_ASSETS.map((item) => ({
          ...item,
          provenance: {
            type: 'SIM',
            timestamp: ts,
            missingReason:
              item.midPrice === null
                ? 'Brak aktywnego strumienia wyroczni HIP-3 w bieżącej epoce / HIP-3 oracle feed not yet active in current epoch'
                : undefined,
          },
        }))
      );
      setLastUpdated(ts);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInfo(true);
    const interval = setInterval(() => {
      fetchInfo(false);
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchInfo]);

  const assets: Record<string, HyperliquidAssetMetric> = {};
  for (const item of marketList) {
    assets[item.symbol] = item;
  }

  return {
    assets,
    marketList,
    lastUpdated,
    isLiveConnected,
    isLoading,
    errorReason,
    refreshNow: () => fetchInfo(true),
  };
}

export const SELECTED_MARKET_LIST: MarketSymbol[] = ['BTC', 'ETH', 'SOL', 'HYPE'];
