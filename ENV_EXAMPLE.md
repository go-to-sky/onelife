# 环境变量配置说明

复制此文件为 `.env.local` 并填入真实的配置值：

```env
# 数据库连接
DATABASE_URL="mysql://username:password@localhost:3306/onelife"

# NextAuth.js 认证配置
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth 配置（如果需要）
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# 环境设置
NODE_ENV="development"
```

## 配置说明

- `DATABASE_URL`: MySQL数据库连接字符串
- `NEXTAUTH_SECRET`: NextAuth.js加密密钥，可以是任意随机字符串
- `NEXTAUTH_URL`: 应用的完整URL
- `GITHUB_CLIENT_ID` 和 `GITHUB_CLIENT_SECRET`: GitHub OAuth应用的凭据（可选） 