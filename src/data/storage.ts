import { Trade, UserProfile } from '../types';

const TRADE_KEY = 'trading-review-tool:trades';
const USERS_KEY = 'trading-review-tool:users';
const ACTIVE_USER_KEY = 'trading-review-tool:active-user';

const defaultUser: UserProfile = {
  id: 'default-user',
  name: '我的账户',
  createdAt: new Date().toISOString(),
};

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function getUsers(): UserProfile[] {
  const users = safeParse<UserProfile[]>(localStorage.getItem(USERS_KEY), [defaultUser]);
  if (users.length === 0) return [defaultUser];
  return users;
}

export function saveUsers(users: UserProfile[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getActiveUserId(): string {
  return localStorage.getItem(ACTIVE_USER_KEY) ?? getUsers()[0].id;
}

export function saveActiveUserId(userId: string): void {
  localStorage.setItem(ACTIVE_USER_KEY, userId);
}

export function getTrades(): Trade[] {
  return safeParse<Trade[]>(localStorage.getItem(TRADE_KEY), []);
}

export function saveTrades(trades: Trade[]): void {
  localStorage.setItem(TRADE_KEY, JSON.stringify(trades));
}
