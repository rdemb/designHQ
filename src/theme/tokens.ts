export type Language = 'pl' | 'en';
export type ThemeMode = 'dark' | 'light' | 'system';
export type ProvenanceType = 'LIVE' | 'MODEL' | 'SIM';

export type NavTabId =
  | 'start'
  | 'pre-session'
  | 'in-session'
  | 'post-session'
  | 'markets'
  | 'lessons'
  | 'research'
  | 'sources'
  | 'mcp';

export type MarketSymbol = 'BTC' | 'ETH' | 'SOL' | 'HYPE';

export interface DataProvenance {
  type: ProvenanceType;
  timestamp: string; // HH:MM:SS
  missingReason?: string;
}

/**
 * Format numbers strictly per locale rules required by HyperQuant:
 * Polish (pl): 75 791 and 22,6 mln
 * English (en): 75,791 and 22.6M
 */
export function formatNumber(
  value: number | null | undefined,
  lang: Language,
  options?: {
    decimals?: number;
    compact?: boolean;
    prefix?: string;
    suffix?: string;
    sign?: boolean;
  }
): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }

  const { decimals = 0, compact = false, prefix = '', suffix = '', sign = false } = options || {};
  const signStr = sign && value > 0 ? '+' : value < 0 ? '−' : '';
  const absVal = Math.abs(value);

  if (compact) {
    if (absVal >= 1_000_000_000) {
      const scaled = absVal / 1_000_000_000;
      const formatted = scaled.toFixed(1);
      if (lang === 'pl') {
        return `${signStr}${prefix}${formatted.replace('.', ',')} mld${suffix}`;
      }
      return `${signStr}${prefix}${formatted}B${suffix}`;
    }
    if (absVal >= 1_000_000) {
      const scaled = absVal / 1_000_000;
      const formatted = scaled.toFixed(1);
      if (lang === 'pl') {
        return `${signStr}${prefix}${formatted.replace('.', ',')} mln${suffix}`;
      }
      return `${signStr}${prefix}${formatted}M${suffix}`;
    }
    if (absVal >= 10_000) {
      const scaled = absVal / 1_000;
      const formatted = scaled.toFixed(1);
      if (lang === 'pl') {
        return `${signStr}${prefix}${formatted.replace('.', ',')} tys.${suffix}`;
      }
      return `${signStr}${prefix}${formatted}K${suffix}`;
    }
  }

  const fixed = absVal.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');

  if (lang === 'pl') {
    const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    const decStr = decPart !== undefined ? `,${decPart}` : '';
    return `${signStr}${prefix}${groupedInt}${decStr}${suffix}`;
  } else {
    const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const decStr = decPart !== undefined ? `.${decPart}` : '';
    return `${signStr}${prefix}${groupedInt}${decStr}${suffix}`;
  }
}

export function formatTimeAmsterdam(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Amsterdam',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date);
  } catch {
    return date.toTimeString().slice(0, 8);
  }
}

export interface SessionStatusInfo {
  currentSessionKey: 'asia' | 'london' | 'ny' | 'overlap' | 'afterhours';
  currentSessionLabel: { pl: string; en: string };
  nextSessionLabel: { pl: string; en: string };
  nextSessionOpensAt: string;
  countdownSeconds: number;
  amsterdamTimeStr: string;
  amsterdamMinutes: number; // 0..1439
}

/**
 * Computes session status in Europe/Amsterdam time:
 * - Asia: 01:00 – 09:00 CET
 * - London opens: 09:00 CET (09:00 – 17:30)
 * - New York opens: 15:30 CET (15:30 – 22:00)
 * - London/NY Overlap: 15:30 – 17:30 CET
 */
export function getAmsterdamSessionStatus(now: Date = new Date()): SessionStatusInfo {
  let hours = now.getUTCHours() + 1;
  let minutes = now.getUTCMinutes();
  let seconds = now.getUTCSeconds();

  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Amsterdam',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).formatToParts(now);
    const h = parts.find((p) => p.type === 'hour')?.value;
    const m = parts.find((p) => p.type === 'minute')?.value;
    const s = parts.find((p) => p.type === 'second')?.value;
    if (h !== undefined && m !== undefined && s !== undefined) {
      hours = parseInt(h, 10) % 24;
      minutes = parseInt(m, 10);
      seconds = parseInt(s, 10);
    }
  } catch {
    hours = (now.getUTCHours() + 1) % 24;
  }

  const totalMinutes = hours * 60 + minutes;
  const totalSeconds = totalMinutes * 60 + seconds;
  const londonOpenMin = 9 * 60; // 09:00
  const nyOpenMin = 15 * 60 + 30; // 15:30
  const londonCloseMin = 17 * 60 + 30; // 17:30
  const nyCloseMin = 22 * 60; // 22:00

  let currentSessionKey: SessionStatusInfo['currentSessionKey'] = 'afterhours';
  let currentSessionLabel = { pl: 'Poza główną sesją', en: 'Inter-session' };
  let nextSessionLabel = { pl: 'Londyn (09:00 CET)', en: 'London (09:00 CET)' };
  let nextSessionOpensAt = '09:00';
  let targetSec = londonOpenMin * 60;

  if (totalMinutes >= 60 && totalMinutes < londonOpenMin) {
    currentSessionKey = 'asia';
    currentSessionLabel = { pl: 'Sesja Azja', en: 'Asia Session' };
    nextSessionLabel = { pl: 'Londyn (09:00)', en: 'London (09:00)' };
    nextSessionOpensAt = '09:00';
    targetSec = londonOpenMin * 60;
  } else if (totalMinutes >= londonOpenMin && totalMinutes < nyOpenMin) {
    currentSessionKey = 'london';
    currentSessionLabel = { pl: 'Sesja Londyn', en: 'London Session' };
    nextSessionLabel = { pl: 'Nowy Jork (15:30)', en: 'New York (15:30)' };
    nextSessionOpensAt = '15:30';
    targetSec = nyOpenMin * 60;
  } else if (totalMinutes >= nyOpenMin && totalMinutes < londonCloseMin) {
    currentSessionKey = 'overlap';
    currentSessionLabel = { pl: 'Londyn + Nowy Jork', en: 'London / NY Overlap' };
    nextSessionLabel = { pl: 'Zamknięcie Londynu (17:30)', en: 'London Close (17:30)' };
    nextSessionOpensAt = '17:30';
    targetSec = londonCloseMin * 60;
  } else if (totalMinutes >= londonCloseMin && totalMinutes < nyCloseMin) {
    currentSessionKey = 'ny';
    currentSessionLabel = { pl: 'Sesja Nowy Jork', en: 'New York Session' };
    nextSessionLabel = { pl: 'Londyn jutro (09:00)', en: 'London tomorrow (09:00)' };
    nextSessionOpensAt = '09:00';
    targetSec = (24 * 60 + londonOpenMin) * 60;
  } else {
    currentSessionKey = 'afterhours';
    currentSessionLabel = { pl: 'Sesja Nocna / Azja', en: 'Overnight / Asia' };
    nextSessionLabel = { pl: 'Londyn (09:00)', en: 'London (09:00)' };
    nextSessionOpensAt = '09:00';
    targetSec =
      totalMinutes < londonOpenMin
        ? londonOpenMin * 60
        : (24 * 60 + londonOpenMin) * 60;
  }

  const countdownSeconds = Math.max(0, targetSec - totalSeconds);
  const pad = (n: number) => String(n).padStart(2, '0');
  const amsterdamTimeStr = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return {
    currentSessionKey,
    currentSessionLabel,
    nextSessionLabel,
    nextSessionOpensAt,
    countdownSeconds,
    amsterdamTimeStr,
    amsterdamMinutes: totalMinutes,
  };
}

export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export const TRANSLATIONS = {
  pl: {
    nav: {
      start: 'Start',
      'pre-session': 'Przed sesją',
      'in-session': 'W sesji',
      'post-session': 'Po sesji',
      markets: 'Rynki',
      lessons: 'Lekcje',
      research: 'Badania',
      sources: 'Źródła',
      mcp: 'Agenci AI (MCP)',
    },
    navGroups: {
      desk: 'Proces sesyjny',
      intelligence: 'Rynki i wiedza',
    },
    header: {
      market: 'Rynek',
      price: 'Cena mid',
      change24h: 'Zmiana 24h',
      funding: 'Funding (1h / rocznie)',
      basis: 'Baza perp-spot',
      pdhPdl: 'PDH / PDL',
      session: 'Sesja (CET)',
      designNote: 'Nota projektowa',
    },
    footer: {
      disclaimer: 'Opis rynku, nie porada inwestycyjna.',
      openSource: 'Kod otwarty (MIT) · Bezpośrednie połączenie z Hyperliquid L1 Info API',
      polling: 'Odświeżanie co 10 s · Wszystkie wartości posiadają znacznik pochodzenia LIVE / MODEL / SIM',
    },
  },
  en: {
    nav: {
      start: 'Start',
      'pre-session': 'Pre-session',
      'in-session': 'In session',
      'post-session': 'Post-session',
      markets: 'Markets',
      lessons: 'Lessons',
      research: 'Research',
      sources: 'Sources',
      mcp: 'AI Agents (MCP)',
    },
    navGroups: {
      desk: 'Session workflow',
      intelligence: 'Markets & research',
    },
    header: {
      market: 'Market',
      price: 'Mid price',
      change24h: '24h change',
      funding: 'Funding (1h / ann.)',
      basis: 'Perp-spot basis',
      pdhPdl: 'PDH / PDL',
      session: 'Session (CET)',
      designNote: 'Design note',
    },
    footer: {
      disclaimer: 'Market description, not investment advice.',
      openSource: 'Open-source (MIT) · Direct browser connection to Hyperliquid L1 Info API',
      polling: 'Polled every 10s · Every figure carries a LIVE / MODEL / SIM provenance badge',
    },
  },
} as const;
