# 人生博物馆 | Life Museum

一个用于记录和展示人生中有意义时刻的全栈 Web 应用程序。基于 T3 Stack 构建，提供完整的展品管理、分类系统和用户认证功能。

## ✨ 功能特性

### 核心功能
- 📝 **展品管理**: 创建、编辑、删除和查看人生展品
- 🏷️ **分类系统**: 预设丰富的人生主题分类
- 🏷️ **标签系统**: 自定义标签，灵活分类展品
- 📊 **情绪评分**: 1-10 分情绪量表，记录心情变化
- 🔒 **权限控制**: 私密、公开、不公开等可见性设置
- 💬 **评论系统**: 支持多级评论和回复

### 特色版块
- 🌑 **阴影馆藏**: 记录失败、遗憾与教训
- 🌌 **平行时空**: 探索未选择的人生道路
- 🗺️ **母题地图**: 发现反复出现的人生主题
- 🎭 **情绪肖像**: 追踪情感状态和触发器
- 💻 **数字考古**: 记录虚拟身份与足迹
- 💪 **身体编年史**: 记录身体变化和健康历程
- 💭 **梦境档案**: 收集和分析梦境内容
- 💰 **人生账本**: 记录财务里程碑和价值观变化

### 技术特性
- 🎨 **响应式设计**: 完美适配桌面和移动设备
- 📝 **Markdown 支持**: 丰富的文本编辑和展示
- 🔐 **GitHub OAuth**: 安全便捷的登录体系
- 🚀 **服务端渲染**: 优秀的 SEO 和性能表现
- 📱 **渐进式 Web 应用**: 提供类原生应用体验

## 🛠️ 技术栈

### 前端
- **Next.js 14**: React 全栈框架，支持 App Router
- **TypeScript**: 类型安全的 JavaScript 超集
- **Tailwind CSS**: 实用优先的 CSS 框架
- **React Markdown**: Markdown 内容渲染

### 后端
- **tRPC**: 端到端类型安全的 API
- **Prisma**: 现代化的数据库 ORM
- **NextAuth.js**: 身份认证解决方案
- **PostgreSQL**: 强大的关系型数据库

### 开发工具
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **TypeScript**: 静态类型检查

## 🚀 快速开始

### 环境要求
- Node.js 18.17 或更高版本
- PostgreSQL 数据库
- GitHub OAuth 应用

### 1. 克隆项目
\`\`\`bash
git clone <repository-url>
cd life-museum
\`\`\`

### 2. 安装依赖
\`\`\`bash
npm install
\`\`\`

### 3. 配置环境变量
复制 \`.env.example\` 为 \`.env\` 并填写以下信息：

\`\`\`env
# 数据库连接
DATABASE_URL="postgresql://username:password@localhost:5432/life_museum"

# NextAuth 配置
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
\`\`\`

### 4. 数据库设置
\`\`\`bash
# 推送数据库架构
npm run db:push

# 运行种子数据（可选）
npx prisma db seed
\`\`\`

### 5. 启动开发服务器
\`\`\`bash
npm run dev
\`\`\`

访问 [http://localhost:3000](http://localhost:3000) 开始使用！

## 📁 项目结构

\`\`\`
src/
├── app/                    # Next.js App Router 页面
│   ├── admin/             # 管理后台
│   ├── api/               # API 路由
│   ├── exhibit/           # 展品详情页
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── server/                # 服务器端代码
│   ├── api/               # tRPC API 路由
│   ├── auth.ts            # 身份认证配置
│   └── db.ts              # 数据库配置
├── trpc/                  # tRPC 客户端配置
│   ├── react.tsx          # React 客户端
│   └── server.ts          # 服务器端客户端
└── env.js                 # 环境变量验证

prisma/
├── schema.prisma          # 数据库模型定义
└── seed.ts               # 种子数据
\`\`\`

## 🎨 使用指南

### 创建展品
1. 访问管理后台 (/admin)
2. 使用 GitHub 登录
3. 点击"创建新展品"
4. 填写标题、内容、选择分类等信息
5. 设置可见性和情绪评分
6. 保存并发布

### 分类系统
项目预设了 10 个人生主题分类，每个分类都有独特的颜色和图标标识。用户也可以通过标签系统进行更细粒度的分类。

### 情绪追踪
每个展品都可以设置 1-10 分的情绪评分，系统会用不同颜色的进度条直观展示：
- 1-3 分：红色（负面情绪）
- 4-5 分：橙色（中性偏负）
- 6-7 分：绿色（中性偏正）
- 8-10 分：蓝色（正面情绪）

## 🔧 常用命令

\`\`\`bash
# 开发
npm run dev              # 启动开发服务器
npm run build            # 构建生产版本
npm start               # 启动生产服务器

# 数据库
npm run db:push         # 推送数据库架构
npm run db:studio       # 打开 Prisma Studio

# 代码质量
npm run lint            # 运行 ESLint 检查
npm run type-check      # TypeScript 类型检查
\`\`\`

## 📝 开发计划

- [ ] 数据可视化（情绪曲线、时间轴）
- [ ] 文件上传功能（图片、音频、视频）
- [ ] 全文搜索
- [ ] 数据导出（PDF、JSON）
- [ ] 主题切换（深色模式）
- [ ] 国际化支持
- [ ] PWA 功能
- [ ] 社交分享

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！在贡献代码前，请确保：

1. 遵循现有的代码风格
2. 添加适当的测试
3. 更新相关文档
4. 提交前运行 \`npm run lint\`

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 💝 致谢

感谢所有开源项目和社区的贡献，特别是：
- [T3 Stack](https://create.t3.gg/) - 为快速开发提供的优秀脚手架
- [Next.js](https://nextjs.org/) - 强大的 React 框架
- [Prisma](https://prisma.io/) - 现代化的数据库工具
- [Tailwind CSS](https://tailwindcss.com/) - 实用的 CSS 框架

---

**开始记录你的人生故事吧！** ✨ 