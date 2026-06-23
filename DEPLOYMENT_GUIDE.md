# GrassFlow 部署指南

## 部署方案对比

| 方案 | 费用 | 难度 | 可靠性 | 推荐场景 |
|------|------|------|--------|---------|
| **Railway.app** | 免费额度 ($5/月) | ⭐ 极简 | ⭐⭐⭐⭐⭐ | **最推荐** - 新手首选 |
| **Docker VPS** | ¥38-68/月 | ⭐⭐⭐ 中等 | ⭐⭐⭐⭐⭐ | 需要更高性能 |
| **Cloudflare Tunnel + Mac Mini** | 免费 | ⭐⭐ 简单 | ⭐⭐⭐ | 开发测试 |

---

## 方案 A: Railway.app (推荐 ⭐)

### 步骤
1. **注册 Railway.app**
   - 访问 https://railway.app
   - 使用 GitHub 账号登录 (选择 `qiyuan-studio`)
   - 授权 Railway 访问 GitHub

2. **关联项目**
   - 点击 "New Project" → "Deploy from GitHub repo"
   - 选择 `qiyuan-studio/grassflow`
   - Railway 会自动检测 Next.js 项目

3. **配置环境变量**
   ```env
   DEEPSEEK_API_KEY=sk-your-deepseek-api-key
   DEEPSEEK_BASE_URL=https://api.deepseek.com
   DEEPSEEK_MODEL=deepseek-v4-flash
   JWT_SECRET=grassflow-jwt-prod-$(openssl rand -hex 16)
   ```

4. **部署**
   - Railway 自动触发部署
   - 等待 2-3 分钟构建完成
   - 获得 `https://grassflow.up.railway.app` 域名

5. **绑定自定义域名 (可选)**
   - 在 Railway Dashboard → Settings → Domains
   - 添加你的域名 (如 `grassflow.ai`)
   - 在域名 DNS 添加 CNAME 记录到 Railway

### 免费额度
- $5/月的免费额度
- 足够跑一个 Next.js 应用
- 每月 500 小时运行时间
- 每月 1GB 存储

---

## 方案 B: 腾讯云轻量服务器

### 步骤
1. **购买服务器**
   - 腾讯云轻量应用服务器
   - ¥38/月起 (2核2G)
   - 选择 CentOS 7.6 或 Ubuntu 22.04

2. **安装 Docker**
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo systemctl enable docker
   ```

3. **部署项目**
   ```bash
   # 克隆项目
   git clone https://github.com/qiyuan-studio/grassflow.git
   cd grassflow

   # 创建 .env 文件
   cat > .env << 'ENVEOF'
   DEEPSEEK_API_KEY=sk-your-deepseek-api-key
   DEEPSEEK_BASE_URL=https://api.deepseek.com
   DEEPSEEK_MODEL=deepseek-v4-flash
   JWT_SECRET=grassflow-jwt-prod-$(openssl rand -hex 16)
   ENVEOF

   # 使用 Docker 部署
   docker build -t grassflow .
   docker run -d --name grassflow -p 3000:3000 --env-file .env grassflow
   ```

4. **配置 Nginx + HTTPS (Cloudflare)**
   - 域名指向服务器 IP
   - 使用 Cloudflare 免费 CDN + SSL

---

## 方案 C: Cloudflare Tunnel (免费, 无服务器)

### 步骤
1. **安装 cloudflared**
   ```bash
   brew install cloudflared
   ```

2. **登录 Cloudflare**
   ```bash
   cloudflared tunnel login
   ```
   (需要在浏览器中授权)

3. **创建 Tunnel**
   ```bash
   cloudflared tunnel create grassflow
   ```

4. **配置 Tunnel**
   ```yaml
   # ~/.cloudflared/config.yml
   tunnel: grassflow
   credentials-file: /Users/ai2/.cloudflared/grassflow.json
   
   ingress:
     - hostname: grassflow.yourdomain.com
       service: http://localhost:3000
     - service: http_status:404
   ```

5. **启动**
   ```bash
   # 先启动 Next.js
   cd /Users/ai2/grassflow && npm run dev
   
   # 另开终端启动 Tunnel
   cloudflared tunnel run grassflow
   ```

---

## 支付接入

### 方案 A: Lemon Squeezy (海外用户)
1. 注册 https://lemonsqueezy.com
2. 创建产品 "GrassFlow"
3. 设置价格:
   - Free: $0 (注册即用)
   - Pro: $9/月
   - Lifetime: $69
4. 获取 API Key 和 Webhook URL
5. 更新 `/api/buy` 路由

### 方案 B: 支付宝当面付 (国内用户)
1. 注册支付宝商家平台
2. 创建当面付应用
3. 获取 APP_ID + 商户私钥
4. 集成支付宝 SDK

### 方案 C: 先人工收款 (MVP 阶段)
- 微信: GrassFlow_AI
- 收到转账后手动生成 License Key
- 成本最低，适合初期验证

---

## 日常维护

### 查看日志
```bash
# Railway: 在 Dashboard 查看 Logs 标签
# Docker: docker logs grassflow -f
# 本地: npm run dev 终端输出
```

### 更新代码
```bash
cd /Users/ai2/grassflow
git pull origin main
npm install
npm run build
# Railway 自动重新部署
# Docker: docker restart grassflow
```

### 数据库备份
```bash
cp data/grassflow.db data/grassflow.db.backup.$(date +%Y%m%d)
```
