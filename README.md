# trading-review-tool

一个基于 **Al Brooks 价格行为训练体系** 的交易复盘工具 MVP。

## MVP 功能
- Dashboard 指标卡片统计
- Trade Journal 交易记录 CRUD（新增 / 编辑 / 删除）
- Error Analytics 错误次数统计
- 顶部操作引导（帮助快速上手）
- 内置术语解释（R 倍数、High2/Low2、假突破等）
- 简单多用户管理（本地创建用户 + 切换用户数据）
- LocalStorage 数据持久化

## 启动项目
```bash
npm install
npm run dev
```

## 构建
```bash
npm run build
```

## 数据说明
- 用户列表 key: `trading-review-tool:users`
- 当前用户 key: `trading-review-tool:active-user`
- 交易数据 key: `trading-review-tool:trades`
- 后续可将数据层替换为 Supabase API
