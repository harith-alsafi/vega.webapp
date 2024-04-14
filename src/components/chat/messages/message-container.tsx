import { IconOpenAI, IconUser } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import React from "react";

export interface MessageContainerProps {
  children: React.ReactNode;
  isUser: boolean;
  showIcon: boolean;
}

export default function MessageContainer({
  children,
  isUser,
  showIcon,
  ...props
}: MessageContainerProps) {
  return (
    <div
      className={cn("group relative mb-4 flex items-start md:-ml-12")}
      {...props}
    >
      <div
        className={cn(
          "flex size-8 mt-[0.23rem] shrink-0 select-none items-center justify-center rounded-md ",
          showIcon && ("shadow border "),
          showIcon && isUser ? "bg-background" : "",
          showIcon && !isUser ?"bg-primary text-primary-foreground" : "",
        )}
      >
        {showIcon && !isUser ? <IconOpenAI /> : null}
        {showIcon && isUser ? <IconUser /> : null}
        {!showIcon && (
              <div
              className="h-4 w-4"
            />
        )}
      </div>
      <div className="flex-1 px-1 ml-4 space-y-2 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
