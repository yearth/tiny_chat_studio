# Tiny Chat Studio

一个简洁、高效的聊天应用，支持多对话管理和多种AI模型集成。

## 项目特点

- **多对话管理**：创建和管理多个独立对话，轻松切换上下文
- **响应式设计**：完美适配桌面端、平板和移动设备
- **多模型支持**：集成多种AI大语言模型，满足不同场景需求
- **数据持久化**：使用PostgreSQL数据库存储对话历史
- **现代技术栈**：基于Next.js、React、Prisma和TypeScript构建

## 快速开始

### 环境要求

- Node.js 18+
- PostgreSQL

### 安装步骤

1. 克隆仓库
```bash
git clone https://github.com/yourusername/tiny_chat_studio.git
cd tiny_chat_studio
```

2. 安装依赖
```bash
npm install
# 或
yarn install
```

3. 配置环境变量
```bash
cp .env.example .env
# 编辑.env文件，填入必要的配置信息
```

4. 初始化数据库
```bash
npx prisma migrate dev
```

5. 启动开发服务器
```bash
npm run dev
# 或
yarn dev
```

6. 在浏览器中访问 [http://localhost:3000](http://localhost:3000)

## 技术架构

- **前端**：React, Next.js, TailwindCSS
- **后端**：Next.js API Routes
- **数据库**：PostgreSQL, Prisma ORM
- **类型安全**：TypeScript

## 贡献指南

欢迎提交问题和拉取请求，共同改进这个项目！
