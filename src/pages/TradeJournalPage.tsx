import { useMemo, useState } from 'react';
import Card from '../components/Card';
import GlossaryCard from '../components/GlossaryCard';
import { ErrorType, MarketCondition, SetupType, Trade } from '../types';

const setupTypes: SetupType[] = ['强突破 + 回调继续', '区间假突破反转', 'High 2 / Low 2', '其他'];
const marketConditions: MarketCondition[] = ['强趋势上涨','弱趋势上涨','强趋势下跌','弱趋势下跌','交易区间','突破失败','趋势转震荡','震荡转趋势'];
const errorTypes: ErrorType[] = ['无','提前入场','追单','提前止盈','不止损','移动止损','报复交易','过度交易','没有 setup 也交易','仓位过大','逆势交易'];

interface Props { trades: Trade[]; activeUserId: string; onSave: (trades: Trade[]) => void; }

export default function TradeJournalPage({ trades, activeUserId, onSave }: Props) {
  const emptyTrade: Omit<Trade, 'id'> = {
    userId: activeUserId, date: new Date().toISOString().slice(0, 10), symbol: '', timeframe: '5m', direction: '多', setupType: '强突破 + 回调继续', marketCondition: '交易区间',
    entryPrice: 0, stopLossPrice: 0, exitPrice: 0, targetPrice: 0, rMultiple: 0, setupQualified: true, plannedEntry: true, plannedStop: true,
    earlyTakeProfit: false, chasing: false, revengeTrading: false, isQualifiedTrade: true, errorType: '无', emotion: '', preTradePlan: '', postTradeReview: '', screenshot: '',
  };
  const [form, setForm] = useState<Omit<Trade, 'id'>>(emptyTrade);
  const [editingId, setEditingId] = useState<string | null>(null);

  const sortedTrades = useMemo(() => [...trades].sort((a, b) => b.date.localeCompare(a.date)), [trades]);
  const setField = <K extends keyof Omit<Trade, 'id'>>(key: K, value: Omit<Trade, 'id'>[K]) => setForm((p) => ({ ...p, [key]: value }));

  const submit = () => {
    if (!form.symbol.trim()) return;
    const next: Trade = { ...form, userId: activeUserId, id: editingId ?? crypto.randomUUID() };
    const result = editingId ? trades.map((t) => (t.id === editingId ? next : t)) : [next, ...trades];
    onSave(result); setForm({ ...emptyTrade, userId: activeUserId }); setEditingId(null);
  };

  return <div className="space-y-4">
    <GlossaryCard />
    <Card>
      <h2 className="mb-3 text-lg font-semibold">新增 / 编辑交易</h2>
      <p className="mb-1 text-xs text-slate-500">当前账户：仅保存到该用户数据。</p>
      <p className="mb-3 text-xs text-slate-500">术语提示：R 倍数 = 单笔盈亏 / 初始风险；High2/Low2 = 趋势里的第二次顺势信号。</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <input className="input" type="date" value={form.date} onChange={(e)=>setField('date',e.target.value)} />
        <input className="input" placeholder="品种" value={form.symbol} onChange={(e)=>setField('symbol',e.target.value)} />
        <input className="input" placeholder="周期" value={form.timeframe} onChange={(e)=>setField('timeframe',e.target.value)} />
        <select className="input" value={form.direction} onChange={(e)=>setField('direction',e.target.value as Trade['direction'])}><option>多</option><option>空</option></select>
        <select className="input" value={form.setupType} onChange={(e)=>setField('setupType',e.target.value as SetupType)}>{setupTypes.map(v=><option key={v}>{v}</option>)}</select>
        <select className="input" value={form.marketCondition} onChange={(e)=>setField('marketCondition',e.target.value as MarketCondition)}>{marketConditions.map(v=><option key={v}>{v}</option>)}</select>
        <input className="input" type="number" placeholder="R 倍数" value={form.rMultiple} onChange={(e)=>setField('rMultiple',Number(e.target.value))} />
        <select className="input" value={form.errorType} onChange={(e)=>setField('errorType',e.target.value as ErrorType)}>{errorTypes.map(v=><option key={v}>{v}</option>)}</select>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">{([
        ['符合setup','setupQualified'],['按计划入场','plannedEntry'],['按计划止损','plannedStop'],['提前止盈','earlyTakeProfit'],['追单','chasing'],['报复交易','revengeTrading'],['合格交易','isQualifiedTrade'],
      ] as const).map(([label,key])=><label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form[key]} onChange={e=>setField(key,e.target.checked as never)} />{label}</label>)}</div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <input className="input" placeholder="情绪状态" value={form.emotion} onChange={(e)=>setField('emotion',e.target.value)} />
        <input className="input" placeholder="截图链接" value={form.screenshot} onChange={(e)=>setField('screenshot',e.target.value)} />
        <button className="rounded-md bg-slate-800 px-4 py-2 text-white" onClick={submit}>{editingId ? '更新交易' : '新增交易'}</button>
      </div>
    </Card>
    <Card><h2 className="mb-3 text-lg font-semibold">交易记录</h2><div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left"><th>日期</th><th>品种</th><th>Setup</th><th>R</th><th>错误</th><th>操作</th></tr></thead>
      <tbody>{sortedTrades.map(t=><tr key={t.id} className="border-t"><td>{t.date}</td><td>{t.symbol}</td><td>{t.setupType}</td><td>{t.rMultiple}</td><td>{t.errorType}</td><td className="space-x-2"><button onClick={()=>{const {id,...rest}=t;setEditingId(id);setForm(rest);}} className="text-blue-600">编辑</button><button onClick={()=>onSave(trades.filter(x=>x.id!==t.id))} className="text-red-600">删除</button></td></tr>)}</tbody></table></div></Card>
  </div>;
}
