import { cn, TextShimmer } from "@carbon/react";
import type { IconType } from "react-icons";
import { LuBrain } from "react-icons/lu";
import { toolConfigs as toolDisplayConfig } from "~/routes/api+/ai+/chat+/tools/config";

export type SupportedToolName = keyof typeof toolDisplayConfig;

export interface ToolCallIndicatorProps {
  toolName: SupportedToolName;
  className?: string;
}

export function getToolIcon(toolName: SupportedToolName): IconType | null {
  if (toolName === "handoff_to_agent") {
    return LuBrain;
  }
  if (toolName === "updateWorkingMemory") {
    return LuBrain;
  }
  return toolDisplayConfig[toolName]?.icon ?? null;
}

export function getToolMessage(toolName: SupportedToolName): string | null {
  if (toolName === "handoff_to_agent") {
    return "Connecting you with the right specialist...";
  }
  if (toolName === "updateWorkingMemory") {
    return "Updating working memory...";
  }
  return toolDisplayConfig[toolName]?.message ?? null;
}

export function ToolCallIndicator({
  toolName,
  className
}: ToolCallIndicatorProps) {
  const config = toolDisplayConfig[toolName];

  if (!config) {
    return null;
  }

  return (
    <div className={cn("flex justify-start mt-3 animate-fade-in", className)}>
      <div className="border px-3 py-1 flex items-center gap-2 w-fit">
        <div className="flex items-center justify-center size-3.5">
          <config.icon size={14} />
        </div>
        <TextShimmer className="text-xs text-muted-foreground" duration={1}>
          {config.displayText ?? ""}
        </TextShimmer>
      </div>
    </div>
  );
}
