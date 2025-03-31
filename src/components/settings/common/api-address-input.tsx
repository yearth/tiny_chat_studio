"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ApiAddressInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ApiAddressInput({
  label,
  value,
  onChange,
  placeholder = "输入 API 地址",
}: ApiAddressInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="api-address">{label}</Label>
      <Input
        id="api-address"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
