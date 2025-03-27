# 系统模式 (System Patterns)

## 系统架构

TinyChatStudio 采用 Next.js 全栈架构，包含以下主要组件：

1. **前端 UI 层**：
   - 基于 React 和 Next.js App Router
   - 使用 Tailwind CSS 和 shadcn/ui 组件库构建界面
   - 客户端状态管理使用 React 钩子和上下文

2. **API 层**：
   - Next.js API 路由处理前后端通信
   - REST API 设计用于聊天、消息和模型管理
   - 支持流式响应的 SSE (Server-Sent Events) 实现

3. **服务层**：
   - 聊天服务管理聊天会话的创建、读取、更新和删除
   - 消息服务处理消息的存储和检索
   - AI 模型服务负责与不同 AI 提供商的 API 通信

4. **数据持久化层**：
   - 使用 Prisma ORM 与数据库交互
   - 支持 SQLite 数据库进行本地开发和部署

## 关键技术决策

1. **Next.js 全栈应用**：
   - 选择 Next.js 作为全栈框架，简化开发流程
   - 利用 App Router 实现更清晰的路由结构
   - 使用服务器组件和客户端组件的混合架构

2. **AI 模型抽象**：
   - 创建统一的 AI 模型接口，支持多种 AI 提供商
   - 工厂模式用于实例化不同的模型实现
   - 适配器模式处理不同 AI API 的差异

3. **流式响应处理**：
   - 使用 Server-Sent Events (SSE) 实现流式响应
   - 客户端实时解析和渲染流式内容
   - 支持中止正在进行的 AI 响应

4. **状态管理策略**：
   - 使用 React Query 管理服务器状态
   - 本地 UI 状态使用 React 钩子
   - 乐观更新提高用户体验

## 使用的设计模式

1. **工厂模式**：
   - `ModelFactory` 用于创建不同 AI 模型的实例
   - 根据配置动态选择合适的模型实现

2. **适配器模式**：
   - 为不同的 AI API 提供统一接口
   - 处理请求格式和响应解析的差异

3. **仓库模式**：
   - 数据访问逻辑封装在专用服务中
   - 提供统一的 CRUD 操作接口

4. **钩子模式**：
   - 自定义 React 钩子封装复杂的业务逻辑
   - 如 `useMessage`、`useChat` 等提供可重用的功能

5. **观察者模式**：
   - 流式响应处理中使用事件监听和回调
   - 实时更新 UI 以响应流式数据

## 组件关系

1. **页面组件**：
   - `WelcomePage`：欢迎页面，允许创建新聊天
   - `ChatPage`：主聊天界面，显示消息并处理用户输入

2. **功能组件**：
   - `EnhancedChatInput`：处理用户输入、文件上传和模型选择
   - `MessageList`：渲染消息历史记录
   - `Message`：单条消息的渲染，支持 Markdown 和代码高亮

3. **服务和钩子**：
   - `useMessage`：管理消息状态和操作
   - `useChat`：处理聊天会话管理
   - `chatService`：提供聊天相关 API 调用
   - `messageService`：处理消息相关操作

4. **模型实现**：
   - `BaseModel`：所有 AI 模型的基类
   - 具体模型实现（如 `DeepseekModel`、`OpenRouterDeepseekModel` 等）
   - `ModelFactory`：创建模型实例的工厂
