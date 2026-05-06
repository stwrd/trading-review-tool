import Card from './Card';

const terms = [
  ['R 倍数（R multiple）', 'R = (出场价-入场价)/每笔风险。+1R 表示赚到 1 个风险单位，-1R 表示亏 1 个风险单位。'],
  ['总 R 倍数', '一段时间内所有交易 R 的总和，用来衡量策略与执行的综合收益质量。'],
  ['执行率', '合格交易数 / 总交易数。重点衡量是否按计划执行，而不是预测对错。'],
  ['High 2 / Low 2', 'Al Brooks 两次尝试入场形态：High2 常见于回调后的第二次向上尝试；Low2 相反。'],
  ['强突破 + 回调继续', '价格有效突破后，回踩不破关键位并沿原方向延续。'],
  ['区间假突破反转', '价格短暂突破区间后迅速回到区间内，常触发反向机会。'],
  ['最大连续亏损', '按时间顺序统计连续亏损交易的最大次数，用于控制心理与仓位风险。'],
];

export default function GlossaryCard() {
  return (
    <Card>
      <details open>
        <summary className="cursor-pointer text-base font-semibold">术语解释（Al Brooks 训练常用）</summary>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          {terms.map(([term, explain]) => (
            <div key={term}>
              <p className="font-medium text-slate-900">{term}</p>
              <p>{explain}</p>
            </div>
          ))}
        </div>
      </details>
    </Card>
  );
}
