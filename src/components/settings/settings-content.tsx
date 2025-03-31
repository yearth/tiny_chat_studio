"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { ModelServicesSettings } from "@/components/settings/model-services-settings";
import { AboutSettings } from "@/components/settings/about-settings";

interface SettingsContentProps {
  selectedSection: string;
}

export function SettingsContent({ selectedSection }: SettingsContentProps) {
  return (
    <div className="flex-1 p-6">
      <ScrollArea className="h-full">
        {selectedSection === "model-services" ? (
          <ModelServicesSettings />
        ) : selectedSection === "about" ? (
          <AboutSettings />
        ) : null}
      </ScrollArea>
    </div>
  );
}
