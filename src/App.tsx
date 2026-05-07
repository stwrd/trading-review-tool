import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { getActiveUserId, getTrades, getUsers, hasSupabaseConfig, saveActiveUserId, saveTrades, saveUsers } from './data/storage';
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './pages/PlaceholderPage';
import TradeJournalPage from './pages/TradeJournalPage';
import { Trade, UserProfile } from './types';
import { useEffect, useMemo, useState } from 'react';

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>(() => getUsers());
  const [activeUserId, setActiveUserId] = useState<string>(() => getActiveUserId());
  const [allTrades, setAllTrades] = useState<Trade[]>([]);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    getTrades().then(setAllTrades).catch((error) => {
      setSyncError(error instanceof Error ? error.message : '读取 Supabase 失败');
    });
  }, []);

  const trades = useMemo(() => allTrades.filter((t) => t.userId === activeUserId), [allTrades, activeUserId]);

  const errorStats = useMemo(() => {
    const stats = new Map<string, number>();
    trades.forEach((t) => { if (t.errorType !== '无') stats.set(t.errorType, (stats.get(t.errorType) || 0) + 1); });
    return [...stats.entries()].sort((a, b) => b[1] - a[1]);
  }, [trades]);

  const persistTrades = async (nextUserTrades: Trade[]) => {
    const others = allTrades.filter((t) => t.userId !== activeUserId);
    const next = [...others, ...nextUserTrades];
    try {
      await saveTrades(next);
      setAllTrades(next);
      setSyncError(null);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : '保存 Supabase 失败');
    }
  };

  const handleSwitchUser = (userId: string) => {
    setActiveUserId(userId);
    saveActiveUserId(userId);
  };

  const handleAddUser = (name: string) => {
    const user: UserProfile = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString() };
    const nextUsers = [...users, user];
    setUsers(nextUsers);
    saveUsers(nextUsers);
    handleSwitchUser(user.id);
  };

  return (
    <Layout users={users} activeUserId={activeUserId} onSwitchUser={handleSwitchUser} onAddUser={handleAddUser}>
      {!hasSupabaseConfig() && <div className="mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">未配置 Supabase，交易数据功能不可用（已移除 localStorage 回退）。</div>}
      {syncError && <div className="mb-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">{syncError}</div>}
      <Routes>
        <Route path="/" element={<DashboardPage trades={trades} />} />
        <Route path="/journal" element={<TradeJournalPage trades={trades} activeUserId={activeUserId} onSave={persistTrades} />} />
        <Route path="/setups" element={<PlaceholderPage title="Setup Library" description="MVP 已预留样本库页面（后续可扩展为完整 CRUD）。" />} />
        <Route path="/errors" element={<div className="space-y-4"><PlaceholderPage title="Error Analytics" description="基于交易日志自动统计错误次数。" /><div className="rounded-lg border bg-white p-4 shadow-sm">{errorStats.length === 0 ? '暂无错误数据' : errorStats.map(([k, v]) => <p key={k}>{k}: {v}</p>)}</div></div>} />
        <Route path="/weekly" element={<PlaceholderPage title="Weekly Review" description="MVP 已预留周复盘字段结构，下一阶段可完善录入表单与历史记录。" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
