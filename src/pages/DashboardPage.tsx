import Card from '../components/Card';
import { Trade } from '../types';

interface Props {
  trades: Trade[];
}

function computeMaxConsecutiveLosses(trades: Trade[]): number {
  let max = 0;
  let current = 0;
  for (const t of [...trades].sort((a, b) => a.date.localeCompare(b.date))) {
    if (t.rMultiple < 0) {
      current += 1;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  }
  return max;
}

export default function DashboardPage({ trades }: Props) {
  const totalTrades = trades.length;
  const qualifiedTrades = trades.filter((t) => t.isQualifiedTrade).length;
  const unqualifiedTrades = totalTrades - qualifiedTrades;
  const executionRate = totalTrades ? (qualifiedTrades / totalTrades) * 100 : 0;
  const totalR = trades.reduce((sum, t) => sum + t.rMultiple, 0);
  const avgR = totalTrades ? totalR / totalTrades : 0;
  const maxConsecutiveLosses = computeMaxConsecutiveLosses(trades);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);
  const weeklyTrades = trades.filter((t) => new Date(t.date) >= weekStart);
  const weeklyErrorMap = weeklyTrades.reduce<Record<string, number>>((acc, t) => {
    if (t.errorType !== '无') acc[t.errorType] = (acc[t.errorType] || 0) + 1;
    return acc;
  }, {});
  const weeklyMainError = Object.entries(weeklyErrorMap).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '无';

  const metrics = [
    ['总交易数', totalTrades],
    ['合格交易数', qualifiedTrades],
    ['不合格交易数', unqualifiedTrades],
    ['执行率', `${executionRate.toFixed(1)}%`],
    ['总 R 倍数', totalR.toFixed(2)],
    ['平均 R', avgR.toFixed(2)],
    ['最大连续亏损', maxConsecutiveLosses],
    ['本周主要错误类型', weeklyMainError],
    ['本周交易次数', weeklyTrades.length],
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {metrics.map(([label, value]) => (
        <Card key={label}>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </Card>
      ))}
    </div>
  );
}
