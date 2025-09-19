import type { Agentset, SearchResultSchema } from "agentset";
import { UIMessage } from "ai";

export type NamespaceInstance = ReturnType<Agentset["namespace"]>;

export type AgentsetUIMessage = UIMessage<
  {},
  {
    sources: SearchResultSchema[];
    queries: string[];
    status: "generating-queries" | "searching" | "generating-answer";
  }
>;
