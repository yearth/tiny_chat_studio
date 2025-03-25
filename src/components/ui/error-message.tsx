"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({
  message,
  onRetry,
  className = "",
}: ErrorMessageProps) {
  return (
    <div className={`rounded-md bg-destructive/15 p-4 ${className}`}>
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-destructive mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-destructive font-medium">{message}</p>
          {onRetry && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 text-xs flex items-center"
              onClick={onRetry}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              重试
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
