"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, History, BookOpen } from "lucide-react";

interface WelcomePageProps {
  features: string[];
}

export function WelcomePage({ features }: WelcomePageProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleNewChat = () => {
    router.push("/chat/new");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">欢迎使用 Tiny Chat Studio</h1>
          <p className="text-muted-foreground">
            {session ? `您好，${session.user?.name || '用户'}` : '开始您的AI对话之旅'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PlusCircle className="mr-2 h-5 w-5" />
                新建对话
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                开始一个全新的AI对话，探索无限可能
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNewChat} className="w-full">
                开始对话
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" />
                历史记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                浏览和继续您之前的对话
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => router.push("/history")} className="w-full">
                查看历史
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="mr-2 h-5 w-5" />
                使用指南
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                了解如何更有效地使用AI助手
              </CardDescription>
            </CardContent>
            <CardFooter>
              <Button variant="outline" onClick={() => router.push("/guide")} className="w-full">
                查看指南
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">功能亮点</h2>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <span className="mr-2 text-primary">•</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
