import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { getActiveUserId, getTrades, getUsers, saveActiveUserId, saveTrades, saveUsers } from './data/storage';
import DashboardPage from './pages/DashboardPage';
import PlaceholderPage from './pages/PlaceholderPage';
import TradeJournalPage from './pages/TradeJournalPage';
import { Trade, UserProfile } from './types';
import { useMemo, useState } from 'react';

export default function App() {
  const [users, setUsers] = useState<UserProfile[]>(() => getUsers());
  const [activeUserId, setActiveUserId] = useState<string>(() => getActiveUserId());
  const [allTrades, setAllTrades] = useState<Trade[]>(() => getTrades());

  const trades = useMemo(() => allTrades.filter((t) => t.userId === activeUserId), [allTrades, activeUserId]);

  const errorStats = useMemo(() => {
    const stats = new Map<string, number>();
    trades.forEach((t) => { if (t.errorType !== '无') stats.set(t.errorType, (stats.get(t.errorType) || 0) + 1); });
    return [...stats.entries()].sort((a, b) => b[1] - a[1]);
  }, [trades]);

  const persistTrades = (nextUserTrades: Trade[]) => {
    const others = allTrades.filter((t) => t.userId !== activeUserId);
    const next = [...others, ...nextUserTrades];
    setAllTrades(next);
    saveTrades(next);
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
