import type { FetchOptions, SearchParamsSchema } from "agentset";
import { tool } from "ai";
import { z } from "zod/v4";

import type { NamespaceInstance } from "./types/ns";

export const makeAgentsetTool = (
  namespaceInstance: NamespaceInstance,
  options?: SearchParamsSchema,
  extra?: FetchOptions,
) => {
  return tool({
    description:
      "get information from your knowledge base to answer questions.",
    inputSchema: z.object({
      question: z.string().describe("The user's question"),
    }),
    execute: async ({ question }) => {
      const results = await namespaceInstance.search(question, options, extra);
      return results;
    },
  });
};
