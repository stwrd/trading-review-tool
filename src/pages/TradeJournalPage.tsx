import { ClipboardEvent, useMemo, useState } from 'react';
import Card from '../components/Card';
import GlossaryCard from '../components/GlossaryCard';
import { ErrorType, MarketCondition, SetupType, Trade } from '../types';

const MAX_SCREENSHOT_SIZE_MB = 1;
const UPLOAD_SIGN_API = '/api/oss/sign';

const setupTypes: SetupType[] = ['强突破 + 回调继续', '区间假突破反转', 'High 2 / Low 2', '其他'];
const marketConditions: MarketCondition[] = ['强趋势上涨','弱趋势上涨','强趋势下跌','弱趋势下跌','交易区间','突破失败','趋势转震荡','震荡转趋势'];
const errorTypes: ErrorType[] = ['无','提前入场','追单','提前止盈','不止损','移动止损','报复交易','过度交易','没有 setup 也交易','仓位过大','逆势交易'];

interface Props { trades: Trade[]; activeUserId: string; onSave: (trades: Trade[]) => void; }

interface UploadSignResponse { uploadUrl: string; objectKey: string; }
interface ViewSignResponse { viewUrl: string; }

export default function TradeJournalPage({ trades, activeUserId, onSave }: Props) {
  const emptyTrade: Omit<Trade, 'id'> = {
    userId: activeUserId, date: new Date().toISOString().slice(0, 10), symbol: '', timeframe: '5m', direction: '多', setupType: '强突破 + 回调继续', marketCondition: '交易区间',
    entryPrice: 0, stopLossPrice: 0, exitPrice: 0, targetPrice: 0, rMultiple: 0, setupQualified: true, plannedEntry: true, plannedStop: true,
    earlyTakeProfit: false, chasing: false, revengeTrading: false, isQualifiedTrade: true, errorType: '无', emotion: '', preTradePlan: '', postTradeReview: '', screenshot: '',
  };
  const [form, setForm] = useState<Omit<Trade, 'id'>>(emptyTrade);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploadHint, setUploadHint] = useState('');

  const sortedTrades = useMemo(() => [...trades].sort((a, b) => b.date.localeCompare(a.date)), [trades]);
  const setField = <K extends keyof Omit<Trade, 'id'>>(key: K, value: Omit<Trade, 'id'>[K]) => setForm((p) => ({ ...p, [key]: value }));

  const requestSignedUpload = async (file: File): Promise<UploadSignResponse> => {
    const response = await fetch(UPLOAD_SIGN_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'upload', filename: file.name, contentType: file.type }),
    });
    if (!response.ok) throw new Error('获取上传签名失败');
    return response.json() as Promise<UploadSignResponse>;
  };

  const requestSignedView = async (objectKey: string): Promise<string> => {
    const response = await fetch(UPLOAD_SIGN_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'view', objectKey }),
    });
    if (!response.ok) throw new Error('获取访问签名失败');
    const data = await response.json() as ViewSignResponse;
    return data.viewUrl;
  };

  const onScreenshotUpload = async (file?: File) => {
    if (!file) return;
    if (file.size > MAX_SCREENSHOT_SIZE_MB * 1024 * 1024) {
      setUploadHint(`图片超过 ${MAX_SCREENSHOT_SIZE_MB}MB，建议压缩后再上传。`);
      return;
    }

    try {
      setUploadHint('正在请求 OSS 上传签名...');
      const signed = await requestSignedUpload(file);
      const uploadResponse = await fetch(signed.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      if (!uploadResponse.ok) throw new Error('上传到 OSS 失败');
      setField('screenshot', signed.objectKey);
      setUploadHint('截图已上传到 OSS。');
    } catch (error) {
      setUploadHint(error instanceof Error ? error.message : '上传失败');
    }
  };

  const openScreenshot = async (screenshot: string) => {
    if (!screenshot) return;
    if (screenshot.startsWith('http') || screenshot.startsWith('data:')) {
      window.open(screenshot, '_blank', 'noreferrer');
      return;
    }
    try {
      const viewUrl = await requestSignedView(screenshot);
      window.open(viewUrl, '_blank', 'noreferrer');
    } catch (error) {
      setUploadHint(error instanceof Error ? error.message : '打开截图失败');
    }
  };


  const onScreenshotPaste = async (event: ClipboardEvent<HTMLInputElement>) => {
    const imageItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith('image/'));
    if (!imageItem) {
      setUploadHint('剪贴板里没有检测到图片，请先截图再粘贴。');
      return;
    }
    event.preventDefault();
    const file = imageItem.getAsFile();
    await onScreenshotUpload(file ?? undefined);
  };

  const submit = () => {
    if (!form.symbol.trim()) return;
    const next: Trade = { ...form, userId: activeUserId, id: editingId ?? crypto.randomUUID() };
    const result = editingId ? trades.map((t) => (t.id === editingId ? next : t)) : [next, ...trades];
    onSave(result); setForm({ ...emptyTrade, userId: activeUserId }); setEditingId(null); setUploadHint('');
  };

  return <div className="space-y-4">
    <GlossaryCard />
    <Card>
      <h2 className="mb-3 text-lg font-semibold">新增 / 编辑交易</h2>
      <p className="mb-1 text-xs text-slate-500">当前账户：仅保存到该用户数据。</p>
      <p className="mb-1 text-xs text-slate-500">术语提示：R 倍数 = 单笔盈亏 / 初始风险；High2/Low2 = 趋势里的第二次顺势信号。</p>
      <p className="mb-3 text-xs text-slate-500">新手填写建议：R 倍数填本单结果（如 +1.5 / -0.8）；“符合 setup”= 入场前就满足你定义的形态；情绪状态可写“平静/急躁/害怕错过”等。</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <input className="input" type="date" value={form.date} onChange={(e)=>setField('date',e.target.value)} />
        <input className="input" placeholder="品种" value={form.symbol} onChange={(e)=>setField('symbol',e.target.value)} />
        <input className="input" placeholder="周期" value={form.timeframe} onChange={(e)=>setField('timeframe',e.target.value)} />
        <select className="input" value={form.direction} onChange={(e)=>setField('direction',e.target.value as Trade['direction'])}><option>多</option><option>空</option></select>
        <select className="input" value={form.setupType} onChange={(e)=>setField('setupType',e.target.value as SetupType)}>{setupTypes.map(v=><option key={v}>{v}</option>)}</select>
        <select className="input" value={form.marketCondition} onChange={(e)=>setField('marketCondition',e.target.value as MarketCondition)}>{marketConditions.map(v=><option key={v}>{v}</option>)}</select>
        <input className="input" type="number" step="0.1" placeholder="R 倍数（例如 +1.2 / -0.6）" title="R = (出场价-入场价)/每笔风险，盈利填正数，亏损填负数" value={form.rMultiple} onChange={(e)=>setField('rMultiple',Number(e.target.value))} />
        <select className="input" value={form.errorType} onChange={(e)=>setField('errorType',e.target.value as ErrorType)}>{errorTypes.map(v=><option key={v}>{v}</option>)}</select>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-4">{([
        ['符合 setup（信号出现后才入场）','setupQualified'],['按计划入场','plannedEntry'],['按计划止损','plannedStop'],['提前止盈','earlyTakeProfit'],['追单','chasing'],['报复交易','revengeTrading'],['合格交易','isQualifiedTrade'],
      ] as const).map(([label,key])=><label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form[key]} onChange={e=>setField(key,e.target.checked as never)} />{label}</label>)}</div>
      <div className="mt-3 grid gap-3 md:grid-cols-4">
        <input className="input" placeholder="情绪状态（如：平静、急躁、FOMO）" title="记录下单时的真实状态，越具体越利于复盘" value={form.emotion} onChange={(e)=>setField('emotion',e.target.value)} />
        <input className="input" placeholder="直接 Ctrl/Cmd+V 粘贴截图（推荐）" title="点击此输入框后，直接粘贴截图即可自动上传 OSS" onPaste={onScreenshotPaste} readOnly />
        <input className="input file:mr-2 file:rounded file:border-0 file:bg-slate-100 file:px-2 file:py-1 file:text-xs" type="file" accept="image/*" title="也可选择本地图片上传到 OSS" onChange={(e)=>onScreenshotUpload(e.target.files?.[0])} />
        <button className="rounded-md bg-slate-800 px-4 py-2 text-white" onClick={submit}>{editingId ? '更新交易' : '新增交易'}</button>
      </div>
      <p className="mt-2 text-xs text-slate-500">截图支持两种最便捷方式：1）截图后在上方输入框直接粘贴；2）选择本地图片文件。默认走 Vercel 一体化 /api/oss/sign，上传到已配置的阿里云 OSS。</p>
      {uploadHint && <p className="mt-1 text-xs text-amber-600">{uploadHint}</p>}
    </Card>
    <Card><h2 className="mb-3 text-lg font-semibold">交易记录</h2><div className="overflow-auto"><table className="w-full text-sm"><thead><tr className="text-left"><th>日期</th><th>品种</th><th>Setup</th><th>R</th><th>截图</th><th>错误</th><th>操作</th></tr></thead>
      <tbody>{sortedTrades.map(t=><tr key={t.id} className="border-t"><td>{t.date}</td><td>{t.symbol}</td><td>{t.setupType}</td><td>{t.rMultiple}</td><td>{t.screenshot ? <button className="text-blue-600 underline" onClick={()=>openScreenshot(t.screenshot)}>查看</button> : '—'}</td><td>{t.errorType}</td><td className="space-x-2"><button onClick={()=>{const {id,...rest}=t;setEditingId(id);setForm(rest);}} className="text-blue-600">编辑</button><button onClick={()=>onSave(trades.filter(x=>x.id!==t.id))} className="text-red-600">删除</button></td></tr>)}</tbody></table></div></Card>
  </div>;
}
