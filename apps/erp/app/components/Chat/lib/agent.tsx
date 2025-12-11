import type { AgentStatus } from "./types";

// Generate user-friendly status messages
export const getStatusMessage = (status?: AgentStatus | null) => {
  if (!status) {
    return null;
  }

  const { agent, status: state } = status;

  if (state === "executing") {
    const messages: Record<AgentStatus["agent"], string> = {
      triage: "Thinking...",

      general: "Searching the web...",
      purchasing: "Calling the purchasing agent...",
      parts: "Calling the parts agent...",
      suppliers: "Calling the suppliers agent..."
    };

    return messages[agent];
  }

  return null;
};
