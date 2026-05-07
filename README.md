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

## OSS 上传安全建议（重要）
- **不要**把 OSS/COS/S3 的 AK/SK 写在前端代码里（包括 `src/`、`.env` 提交到仓库、打包后的 JS）。
- 前端代码与环境变量（`VITE_*`）都会进入浏览器，用户可直接查看，因此放 AK/SK 等同于泄露。
- 推荐做法：
  1. 前端只请求你的后端“签名接口”；
  2. 后端用 AK/SK（仅保存在服务端）生成短时效、最小权限的上传凭证（STS / pre-signed URL / policy）；
  3. 前端拿临时凭证直传 OSS，上传完成后只保存文件 URL。
- 仓库可提供 `.env.example` 作为占位，但真实密钥只放在服务器环境变量或密钥管理系统。


## 阿里云 OSS：AK/SK 应该怎么设置
> 结论：AK/SK 只放后端，不进前端。前端只拿临时上传凭证。

### 1) 服务端环境变量（示例）
```bash
# 仅后端可见，禁止以 VITE_ 前缀暴露给前端
ALIYUN_OSS_ACCESS_KEY_ID=your-ak
ALIYUN_OSS_ACCESS_KEY_SECRET=your-sk
ALIYUN_OSS_REGION=oss-cn-hangzhou
ALIYUN_OSS_BUCKET=your-bucket
```

### 2) 前端环境变量（示例）
```bash
# 前端只保存你的后端签名接口地址
VITE_UPLOAD_SIGN_API=https://api.example.com/oss/sign
```

### 3) 推荐上传流程
1. 前端请求 `VITE_UPLOAD_SIGN_API`；
2. 后端使用 AK/SK 生成短时效签名（或 STS 临时凭证）；
3. 前端用签名直传 OSS；
4. 上传成功后把文件 URL 写入 `screenshot` 字段保存。

### 4) 最小权限建议
- 为上传创建独立 RAM 用户/角色，仅授予目标 bucket 指定目录写入权限。
- 凭证有效期尽量短（如 1~10 分钟）。
- 限制允许上传的文件类型和大小，并在后端校验。
