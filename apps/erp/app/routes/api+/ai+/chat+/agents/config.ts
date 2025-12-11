import type { AgentConfig } from "./shared/tools";

// Dynamically import all agent configs
const agentModules = import.meta.glob("./*-agent.ts", {
  eager: true
}) as Record<string, { config: AgentConfig }>;

// Export agent configs as a record keyed by agent name
export const agentConfigs: Record<string, AgentConfig> = Object.values(
  agentModules
).reduce(
  (acc, module) => {
    if (module.config) {
      acc[module.config.name] = module.config;
    }
    return acc;
  },
  {} as Record<string, AgentConfig>
);
