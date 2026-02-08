import type { SearchResultSchema } from "agentset";
import type { UIMessage } from "ai";

export type AgentsetUIMessage = UIMessage<
  {},
  {
    sources: SearchResultSchema[];
    queries: string[];
    status: "generating-queries" | "searching" | "generating-answer";
  }
>;
