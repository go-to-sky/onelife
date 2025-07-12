# 部署指南

本文档提供了人生博物馆项目的部署指南，包括多种部署方式。

## 🚀 Vercel + Supabase (推荐)

这是最简单、快速的部署方式，适合个人项目和小团队。

### 1. 准备 Supabase 数据库

1. 访问 [Supabase](https://supabase.com/) 并创建账户
2. 创建新项目
3. 在 `Settings > Database` 中找到连接字符串
4. 记录下 `Connection string` 中的 URI

### 2. 配置 GitHub OAuth

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 创建新的 OAuth App
3. 设置：
   - Application name: `Life Museum`
   - Homepage URL: `https://your-app.vercel.app`
   - Authorization callback URL: `https://your-app.vercel.app/api/auth/callback/github`
4. 记录 `Client ID` 和 `Client Secret`

### 3. 部署到 Vercel

1. Fork 本项目到你的 GitHub
2. 访问 [Vercel](https://vercel.com/) 并连接 GitHub
3. 导入项目
4. 配置环境变量：

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
NEXTAUTH_SECRET=your-random-secret-key
NEXTAUTH_URL=https://your-app.vercel.app
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

5. 部署完成后，通过 Vercel CLI 运行数据库迁移：

```bash
vercel env pull .env.local
npx prisma db push
```

## 🐳 Docker 部署

适合自托管和生产环境部署。

### 1. 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/life_museum
      - NEXTAUTH_SECRET=your-secret-key
      - NEXTAUTH_URL=http://localhost:3000
      - GITHUB_CLIENT_ID=your-github-client-id
      - GITHUB_CLIENT_SECRET=your-github-client-secret
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=life_museum
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

### 2. 创建 Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the app
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "server.js"]
```

### 3. 构建和运行

```bash
# 构建并启动
docker-compose up -d

# 运行数据库迁移
docker-compose exec app npx prisma db push

# 运行种子数据
docker-compose exec app npx prisma db seed
```

## ☁️ AWS/阿里云部署

### 使用 AWS Amplify

1. 连接 GitHub 仓库
2. 配置构建设置：

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install
    build:
      commands:
        - npx prisma generate
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

3. 配置环境变量（同 Vercel）
4. 使用 RDS PostgreSQL 作为数据库

### 使用阿里云 ECS

1. 购买 ECS 实例和 RDS PostgreSQL
2. 安装 Docker 和 Docker Compose
3. 上传项目文件
4. 修改 docker-compose.yml 中的数据库连接
5. 运行部署命令

## 🔧 环境变量说明

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `DATABASE_URL` | ✅ | PostgreSQL 数据库连接字符串 |
| `NEXTAUTH_SECRET` | ✅ | NextAuth.js 加密密钥 |
| `NEXTAUTH_URL` | ✅ | 应用的完整 URL |
| `GITHUB_CLIENT_ID` | ✅ | GitHub OAuth 应用 ID |
| `GITHUB_CLIENT_SECRET` | ✅ | GitHub OAuth 应用密钥 |

### 生成 NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## 📊 性能优化

### 1. 图片优化
- 使用 CDN 存储图片
- 配置 Next.js Image 组件的域名白名单

### 2. 数据库优化
- 为经常查询的字段添加索引
- 使用连接池
- 定期备份数据

### 3. 缓存策略
- 使用 Redis 缓存热点数据
- 配置 ISR (Incremental Static Regeneration)

```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['your-cdn-domain.com'],
  },
  experimental: {
    esmExternals: true,
  },
}
```

## 🔒 安全配置

### 1. 环境变量保护
- 生产环境不要在代码中硬编码敏感信息
- 使用 Vercel/AWS 的环境变量管理

### 2. 数据库安全
- 使用强密码
- 限制数据库访问 IP
- 定期更新数据库版本

### 3. 应用安全
- 配置 CORS 策略
- 使用 HTTPS
- 定期更新依赖包

## 📈 监控和日志

### 1. 错误监控
推荐使用 Sentry:

```javascript
// sentry.client.config.js
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### 2. 性能监控
- Vercel Analytics
- Google Analytics
- 自定义埋点

### 3. 日志管理
- 使用结构化日志
- 配置日志轮转
- 监控关键指标

## 🚨 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 DATABASE_URL 格式
   - 确认数据库服务状态
   - 检查网络连接

2. **GitHub OAuth 失败**
   - 验证回调 URL 配置
   - 检查客户端 ID 和密钥
   - 确认应用域名设置

3. **构建失败**
   - 检查 Node.js 版本兼容性
   - 清理 node_modules 重新安装
   - 检查依赖包版本冲突

### 健康检查

```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
}
```

## 📝 维护计划

### 定期任务
- 每周检查依赖包更新
- 每月数据库备份验证
- 每季度性能评估
- 年度安全审计

### 更新流程
1. 在开发环境测试
2. 更新文档
3. 部署到预发布环境
4. 生产环境发布
5. 监控部署结果

---

如有部署问题，请提交 Issue 或参考项目文档。 