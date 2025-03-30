import { Button } from "@/components/ui/button";
import { Paperclip } from "lucide-react";
import React from "react";

interface FileUploadProps {
  files: File[];
  setFiles: (files: File[]) => void;
  isDisabled: boolean;
  showPreview?: boolean;
}

/**
 * 文件上传组件
 * 处理文件的上传、预览和删除
 */
export function FileUpload({
  files,
  setFiles,
  isDisabled,
  showPreview = false,
}: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  // 文件预览区域
  if (showPreview && files.length > 0) {
    return (
      <div className="px-4 pt-3 pb-1 border-b border-input">
        <div className="flex flex-wrap gap-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center bg-muted rounded-md px-2 py-1 text-xs"
            >
              <span className="truncate max-w-[150px]">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 ml-1"
                onClick={() => setFiles(files.filter((_, i) => i !== index))}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 文件上传按钮
  return (
    <label
      className={`p-1 text-muted-foreground rounded-md ${
        !isDisabled
          ? "cursor-pointer hover:text-foreground hover:bg-accent"
          : "opacity-50 cursor-not-allowed"
      }`}
    >
      <Paperclip className="h-5 w-5" />
      <input
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={isDisabled}
      />
    </label>
  );
}
