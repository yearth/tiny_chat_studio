"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Settings, Info } from "lucide-react";

interface SettingsSidebarProps {
  selectedSection: string;
  onSelectSection: (section: string) => void;
}

export function SettingsSidebar({
  selectedSection,
  onSelectSection,
}: SettingsSidebarProps) {
  // 设置类别列表
  const sections = [
    {
      id: "model-services",
      label: "模型服务",
      icon: <Settings className="h-4 w-4 mr-2" />,
    },
    {
      id: "about",
      label: "关于",
      icon: <Info className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <div className="w-64 border-r">
      <ScrollArea className="h-full">
        <div className="space-y-1 p-4">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant="ghost"
              className={cn(
                "w-full justify-start",
                selectedSection === section.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              )}
              onClick={() => onSelectSection(section.id)}
            >
              {section.icon}
              {section.label}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
