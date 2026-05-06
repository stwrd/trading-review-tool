import { NavLink } from 'react-router-dom';
import { PropsWithChildren } from 'react';
import { UserProfile } from '../types';

const navItems = [
  { to: '/', label: 'Dashboard' },
  { to: '/journal', label: 'Trade Journal' },
  { to: '/setups', label: 'Setup Library' },
  { to: '/errors', label: 'Error Analytics' },
  { to: '/weekly', label: 'Weekly Review' },
];

interface Props {
  users: UserProfile[];
  activeUserId: string;
  onSwitchUser: (userId: string) => void;
  onAddUser: (name: string) => void;
}

export default function Layout({ users, activeUserId, onSwitchUser, onAddUser, children }: PropsWithChildren<Props>) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-xl font-semibold">Trading Review Tool</h1>
            <div className="flex items-center gap-2">
              <select className="input" value={activeUserId} onChange={(e) => onSwitchUser(e.target.value)}>
                {users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
              <button className="rounded-md bg-slate-800 px-3 py-2 text-sm text-white" onClick={() => {
                const name = prompt('输入新用户名称');
                if (name?.trim()) onAddUser(name.trim());
              }}>+ 添加用户</button>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => `rounded-md px-3 py-1.5 text-sm ${isActive ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl space-y-4 p-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          <p className="font-medium">操作引导（建议首次按顺序完成）</p>
          <ol className="mt-1 list-decimal pl-5">
            <li>先在 Trade Journal 录入最近 5~10 笔交易。</li>
            <li>回到 Dashboard 查看执行率、R 倍数和本周主要错误。</li>
            <li>在 Error Analytics 锁定最高频错误，下周只改一个。</li>
          </ol>
        </div>
        {children}
      </main>
    </div>
  );
}
