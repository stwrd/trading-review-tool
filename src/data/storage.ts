import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Trade, UserProfile } from '../types';

const USERS_KEY = 'trading-review-tool:users';
const ACTIVE_USER_KEY = 'trading-review-tool:active-user';

const SUPABASE_URL = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY;
const TRADE_TABLE = 'trades';

let supabase: SupabaseClient | null = null;
let supabaseConfigError: string | null = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (error) {
    supabaseConfigError = error instanceof Error ? error.message : 'Supabase 初始化失败';
  }
}

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

function assertSupabaseReady() {
  if (supabaseConfigError) throw new Error(`Supabase 配置错误：${supabaseConfigError}`);
  if (!supabase) throw new Error('未配置 Supabase（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY）');
}

export async function getTrades(): Promise<Trade[]> {
  assertSupabaseReady();
  const { data, error } = await supabase!.from(TRADE_TABLE).select('*').order('date', { ascending: false });
  if (error || !data) throw new Error(error?.message || '读取 Supabase 交易数据失败');
  return data as Trade[];
}

export async function saveTrades(trades: Trade[]): Promise<void> {
  assertSupabaseReady();

  const { error: deleteError } = await supabase!.from(TRADE_TABLE).delete().neq('id', '');
  if (deleteError) throw new Error(`Supabase 同步失败（清空阶段）：${deleteError.message}`);
  if (trades.length === 0) return;

  const { error: insertError } = await supabase!.from(TRADE_TABLE).insert(trades);
  if (insertError) throw new Error(`Supabase 同步失败（写入阶段）：${insertError.message}`);
}

export function hasSupabaseConfig(): boolean {
  return Boolean(supabase);
}

export function getSupabaseConfigError(): string | null {
  return supabaseConfigError;
}
