"use client";

import { WelcomePage } from "@/components/welcome/welcome-page";

export default function Home() {
  // 迁移原有聊天组件到新路由
  return <WelcomePage features={[
    "使用多种AI模型进行对话",
    "保存和管理对话历史",
    "支持Google账号登录",
    "响应式设计，适配各种设备",
    "实时流式对话体验"
  ]} />;
}
