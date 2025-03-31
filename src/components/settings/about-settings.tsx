"use client";

import { Twitch } from "lucide-react";

export function AboutSettings() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-3">
        <Twitch className="h-8 w-8 text-primary" />
        <h2 className="text-2xl font-bold">TinyChat</h2>
      </div>

      <div className="space-y-2">
        <p className="text-lg">一个 AI 聊天平台</p>
        <p className="text-sm text-muted-foreground">版本: 1.0.0</p>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-2">关于 TinyChat</h3>
        <p className="text-muted-foreground">
          TinyChat 是一个简洁、高效的 AI 聊天应用，支持多种 AI 模型，
          为用户提供流畅的对话体验。
        </p>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-2">技术栈</h3>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>Next.js</li>
          <li>React</li>
          <li>TypeScript</li>
          <li>Tailwind CSS</li>
          <li>Framer Motion</li>
        </ul>
      </div>
    </div>
  );
}
