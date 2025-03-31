"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomDialogContent } from "@/components/ui/custom-dialog";
import { SettingsSidebar } from "@/components/settings/settings-sidebar";
import { SettingsContent } from "@/components/settings/settings-content";

// 设置对话框的类型定义
type SettingsSectionType = "model-services" | "about";

export function SettingsDialog() {
  // 状态管理：当前选中的设置部分
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState<SettingsSectionType>("model-services");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <CustomDialogContent className="w-[80vw] h-[80vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle>设置</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* 左侧设置导航 */}
          <SettingsSidebar 
            selectedSection={selectedSection} 
            onSelectSection={(section: string) => setSelectedSection(section as SettingsSectionType)} 
          />
          
          {/* 右侧设置内容 */}
          <SettingsContent selectedSection={selectedSection} />
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            关闭
          </Button>
        </DialogFooter>
      </CustomDialogContent>
    </Dialog>
  );
}
