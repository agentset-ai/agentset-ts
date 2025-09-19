import type { SearchResultSchema } from "agentset";
import { UIMessage } from "ai";

export type AgentsetUIMessage = UIMessage<
  {},
  {
    sources: SearchResultSchema[];
    queries: string[];
    status: "generating-queries" | "searching" | "generating-answer";
  }
>;
