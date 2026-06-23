# GrassFlow 部署指南 (2026年6月更新)

## 部署方案对比

| 方案 | 费用 | 难度 | HTTPS | 域名 | 推荐度 |
|------|------|------|-------|------|--------|
| **Railway.app** | 免费额度 $5/月 | ⭐ | 自动 | 可选 | ⭐⭐⭐⭐⭐ |
| **VPS (Oracle免费)** | ¥0/月 | ⭐⭐⭐ | 需Cloudflare | 需自行配置 | ⭐⭐⭐⭐ |
| **VPS (腾讯云轻量)** | ¥38/月 | ⭐⭐⭐ | 需Cloudflare | 需自行配置 | ⭐⭐⭐ |
| **Zeabur** | 免费额度 | ⭐ | 自动 | 可选 | ⭐⭐⭐⭐ |
| **本地部署+内网穿透** | ¥0/月 | ⭐⭐ | 需Cloudflare Tunnel | 需自行配置 | ⭐⭐ |

## 方案一：Railway.app（推荐，最省心）

### 步骤（需要用户在 GitHub 上操作）

1. **注册 Railway.app**
   - 访问 https://railway.app
   - 点击 "Login with GitHub"
   - 授权 GitHub 账号登录
   - 免费额度: $5/月，足够跑一个 Next.js + SQLite

2. **创建新项目**
   - 点击 "New Project" → "Deploy from GitHub repo"
   - 选择 `qiyuan-studio/grassflow`
   - Railway 会自动检测 Next.js 项目

3. **配置环境变量**
   - 在项目 Dashboard → Variables 中添加：
   ```
   DEEPSEEK_API_KEY=sk-your-deepseek-api-key
   DEEPSEEK_BASE_URL=https://api.deepseek.com
   DEEPSEEK_MODEL=deepseek-v4-flash
   JWT_SECRET=grassflow-jwt-secret-2026
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   ```

4. **部署**
   - 每次 push 到 GitHub main 分支自动部署
   - 部署完成后会自动分配域名: `grassflow.up.railway.app`
   - 可选：绑定自定义域名

## 方案二：Docker VPS 部署

### Dockerfile（已内置）
项目根目录已包含 Dockerfile：
```dockerfile
FROM node:20-alpine AS base
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### 部署命令
```bash
# 构建
docker build -t grassflow .

# 运行
docker run -d -p 3000:3000 \
  -e DEEPSEEK_API_KEY=sk-xxx \
  -e JWT_SECRET=xxx \
  -v grassflow_data:/app/data \
  --name grassflow \
  grassflow
```

## 方案三：Zeabur（中国用户友好）

1. 访问 https://zeabur.com
2. 用 GitHub 登录
3. 创建项目 → 选择 grassflow repo
4. 自动部署，自动 HTTPS
5. 支持绑定自定义域名

## 验证部署
部署后访问：
- `https://your-domain.com` → 首页
- `https://your-domain.com/register` → 注册
- `https://your-domain.com/login` → 登录
- `https://your-domain.com/dashboard` → 控制台
- `https://your-domain.com/buy` → 购买页

## 数据库
- SQLite 存储在 `data/grassflow.db`
- Railway.app 的存储是临时的，重启后会丢失
- **建议**: 每天手动备份或使用 Railway 的 Volume 功能

## 环境变量说明
| 变量 | 说明 | 示例 |
|------|------|------|
| DEEPSEEK_API_KEY | DeepSeek API Key | sk-xxx |
| DEEPSEEK_BASE_URL | API 地址 | https://api.deepseek.com |
| DEEPSEEK_MODEL | 模型名 | deepseek-v4-flash |
| JWT_SECRET | JWT 加密密钥 | 任意长字符串 |
| JWT_EXPIRES_IN | Token 有效期 | 7d |

## 正式上线 Checklist
- [ ] 修改 JWT_SECRET 为强随机字符串
- [ ] 注册自定义域名（可选）
- [ ] 配置数据库定期备份
- [ ] 添加 Google Analytics / 统计
- [ ] 配置错误监控
- [ ] 设置自动 SSL 证书续期
