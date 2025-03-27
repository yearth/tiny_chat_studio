# 技术上下文 (Tech Context)

## 使用的技术

### 前端技术

1. **框架和库**：
   - **Next.js 15.x**：React 框架，用于构建服务端渲染和静态生成的 Web 应用
   - **React 18.x**：用户界面库
   - **TypeScript**：类型安全的 JavaScript 超集
   - **Tailwind CSS**：实用优先的 CSS 框架
   - **shadcn/ui**：基于 Radix UI 的组件库
   - **Lucide React**：图标库

2. **状态管理和数据获取**：
   - **React Query (TanStack Query)**：用于服务器状态管理
   - **React Context**：用于全局状态管理
   - **React Hooks**：用于组件状态和生命周期管理

3. **UI 增强**：
   - **React Markdown**：Markdown 渲染
   - **Syntax Highlighter**：代码语法高亮
   - **Next Themes**：主题切换支持

### 后端技术

1. **服务器框架**：
   - **Next.js API Routes**：处理 API 请求
   - **Server-Sent Events (SSE)**：实现流式响应

2. **数据库和 ORM**：
   - **Prisma**：类型安全的 ORM
   - **SQLite**：轻量级关系型数据库
   - **PostgreSQL**（可选部署）：生产环境数据库选项

3. **AI 集成**：
   - **AI 提供商 API**：
     - Deepseek API
     - OpenRouter API
   - **自定义 AI 客户端**：封装 AI API 调用

4. **认证**：
   - **NextAuth.js**：认证解决方案
   - **基于 JWT 的会话管理**

## 开发环境设置

1. **本地开发环境**：
   - Node.js 18.x 或更高版本
   - pnpm 包管理器
   - VS Code 或其他代码编辑器
   - Git 版本控制

2. **环境变量**：
   - `DATABASE_URL`：数据库连接字符串
   - `NEXTAUTH_SECRET`：NextAuth.js 密钥
   - `NEXTAUTH_URL`：认证回调 URL
   - `DEEPSEEK_API_KEY`：Deepseek API 密钥
   - `OPENROUTER_API_KEY`：OpenRouter API 密钥

3. **开发工作流**：
   - 使用 `pnpm dev` 启动开发服务器
   - 使用 `pnpm build` 构建生产版本
   - 使用 `pnpm lint` 运行代码检查

## 技术限制

1. **AI 模型限制**：
   - 依赖第三方 AI 提供商的 API 可用性
   - 不同模型的响应格式和质量可能有差异
   - API 调用可能受到速率限制或配额限制

2. **数据库限制**：
   - SQLite 适用于小规模部署，但不适合高并发场景
   - 需要定期备份以防数据丢失

3. **部署限制**：
   - 需要支持 Node.js 的托管环境
   - 流式响应需要服务器支持长连接

4. **浏览器兼容性**：
   - 主要支持现代浏览器（Chrome、Firefox、Safari、Edge）
   - 可能不完全支持旧版浏览器

## 依赖项

### 核心依赖

```json
{
  "dependencies": {
    "@prisma/client": "^6.5.0",
    "next": "^15.2.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-markdown": "^9.0.1",
    "react-syntax-highlighter": "^15.5.0",
    "@tanstack/react-query": "^5.17.19",
    "next-auth": "^4.24.5",
    "tailwindcss": "^3.4.1",
    "lucide-react": "^0.309.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "prisma": "^6.5.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.2.1"
  }
}
```

### 关键 API 和集成

1. **Deepseek API**：
   - 基础 URL：`https://api.deepseek.com`
   - 文档：[Deepseek API 文档](https://platform.deepseek.com/)

2. **OpenRouter API**：
   - 基础 URL：`https://openrouter.ai/api`
   - 文档：[OpenRouter API 文档](https://openrouter.ai/docs)
