"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ApiKeyInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onTest?: () => void;
  extraAction?: React.ReactNode;
}

export function ApiKeyInput({
  label,
  value,
  onChange,
  placeholder = "输入 API 密钥",
  onTest,
  extraAction,
}: ApiKeyInputProps) {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor="api-key">{label}</Label>
      <div className="flex space-x-2">
        <Input
          id="api-key"
          type={showApiKey ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowApiKey(!showApiKey)}
        >
          {showApiKey ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
        {onTest && <Button onClick={onTest}>检测</Button>}
        {extraAction}
      </div>
    </div>
  );
}
