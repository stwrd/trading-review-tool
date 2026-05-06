import { Trade } from '../types';

const TRADE_KEY = 'trading-review-tool:trades';

const defaultTrades: Trade[] = [];

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getTrades(): Trade[] {
  return safeParse<Trade[]>(localStorage.getItem(TRADE_KEY), defaultTrades);
}

export function saveTrades(trades: Trade[]): void {
  localStorage.setItem(TRADE_KEY, JSON.stringify(trades));
}
