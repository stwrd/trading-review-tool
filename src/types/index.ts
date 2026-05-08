export type Direction = '多' | '空';

export type SetupType =
  | '强突破 + 回调继续'
  | '区间假突破反转'
  | 'High 2 / Low 2'
  | '其他';

export type MarketCondition =
  | '强趋势上涨'
  | '弱趋势上涨'
  | '强趋势下跌'
  | '弱趋势下跌'
  | '交易区间'
  | '突破失败'
  | '趋势转震荡'
  | '震荡转趋势';

export type ErrorType =
  | '提前入场'
  | '追单'
  | '提前止盈'
  | '不止损'
  | '移动止损'
  | '报复交易'
  | '过度交易'
  | '没有 setup 也交易'
  | '仓位过大'
  | '逆势交易'
  | '无';

export interface UserProfile {
  id: string;
  name: string;
  createdAt: string;
}

export interface Trade {
  id: string;
  userId: string;
  date: string;
  symbol: string;
  timeframe: string;
  direction: Direction;
  setupType: SetupType;
  marketCondition: MarketCondition;
  entryPrice: number;
  entryTime: string;
  stopLossPrice: number;
  exitPrice: number;
  targetPrice: number;
  exitTime: string;
  rMultiple: number;
  setupQualified: boolean;
  plannedEntry: boolean;
  plannedStop: boolean;
  earlyTakeProfit: boolean;
  chasing: boolean;
  revengeTrading: boolean;
  isQualifiedTrade: boolean;
  errorType: ErrorType;
  emotion: string;
  preTradePlan: string;
  postTradeReview: string;
  screenshot: string;
}

export interface SetupSample {
  id: string;
  setupType: SetupType;
  symbol: string;
  timeframe: string;
  date: string;
  marketCondition: MarketCondition;
  success: boolean;
  hit1R: boolean;
  hit2R: boolean;
  maxFavorableExcursion: number;
  maxAdverseExcursion: number;
  screenshotUrl: string;
  notes: string;
}

export interface WeeklyReview {
  id: string;
  period: string;
  weeklyTrades: number;
  qualifiedTrades: number;
  unqualifiedTrades: number;
  executionRate: number;
  totalR: number;
  maxConsecutiveLosses: number;
  primaryError: ErrorType;
  strengths: string;
  majorIssue: string;
  nextWeekOneFix: string;
}
