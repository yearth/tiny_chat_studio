"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ModelListEditorProps {
  title: string;
  models: string[];
  onModelsChange: (models: string[]) => void;
  onAddModel: () => void;
}

export function ModelListEditor({
  title,
  models,
  onModelsChange,
  onAddModel,
}: ModelListEditorProps) {
  const handleDeleteModel = (modelName: string) => {
    onModelsChange(models.filter((model) => model !== modelName));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="font-medium">{title}</h4>
        <Button variant="outline" size="sm" onClick={onAddModel}>
          <Plus className="h-4 w-4 mr-2" />
          添加模型
        </Button>
      </div>

      <ScrollArea className="max-h-[200px]">
        <div className="space-y-2">
          {models.length ? (
            models.map((model) => (
              <div
                key={model}
                className="flex justify-between items-center p-2 bg-accent/30 rounded-md"
              >
                <span>{model}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteModel(model)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              暂无模型
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
