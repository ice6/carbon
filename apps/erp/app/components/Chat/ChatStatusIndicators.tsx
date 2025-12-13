import { AnimatedStatus } from "./AnimatedStatus";
import { Loader } from "./Loader";
import { getStatusMessage } from "./lib/agent";
import type { AgentStatus } from "./lib/types";
import { getToolIcon, getToolMessage } from "./ToolCallIndicator";

interface ChatStatusIndicatorsProps {
  agentStatus: AgentStatus | null;
  currentToolCall: string | null;
  status?: string;
}

export function ChatStatusIndicators({
  agentStatus,
  currentToolCall,
  status
}: ChatStatusIndicatorsProps) {
  const statusMessage = getStatusMessage(agentStatus);
  const toolMessage = currentToolCall ? getToolMessage(currentToolCall) : null;

  // Always prioritize tool message over agent status when a tool is running
  const displayMessage = toolMessage || statusMessage;

  // Get icon for current tool - always show icon when tool is running
  const toolIcon = currentToolCall ? getToolIcon(currentToolCall) : null;

  return (
    <div className="h-8 flex items-center">
      <AnimatedStatus
        text={displayMessage ?? null}
        shimmerDuration={0.75}
        fadeDuration={0.1}
        variant="slide"
        className="text-xs font-normal"
        icon={toolIcon}
      />

      {((agentStatus && !getStatusMessage(agentStatus)) ||
        (status === "submitted" && !agentStatus && !currentToolCall)) && (
        <Loader />
      )}
    </div>
  );
}
