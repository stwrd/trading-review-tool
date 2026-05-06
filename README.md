# trading-review-tool

一个基于 **Al Brooks 价格行为训练体系** 的交易复盘工具 MVP，帮助你专注于：
- setup 质量
- 执行纪律
- R 倍数表现
- 错误类型与情绪跟踪
- 周复盘改进

## 技术栈
- React + TypeScript
- Tailwind CSS
- React Router
- LocalStorage（无后端、无登录）

## 已实现（MVP）
- Dashboard 指标卡片统计
- Trade Journal 交易记录 CRUD（新增 / 编辑 / 删除）
- Error Analytics 错误次数统计
- Setup Library / Weekly Review 页面占位（便于下一阶段扩展）
- 本地数据持久化（LocalStorage）

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
- 交易数据存储在浏览器 `LocalStorage`
- key: `trading-review-tool:trades`
- 后续可将数据层替换为 Supabase API 而不影响页面结构
