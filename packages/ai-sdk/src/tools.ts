import type { FetchOptions, SearchParamsSchema } from "agentset";
import { tool } from "ai";
import { z } from "zod";

import type { NamespaceInstance } from "./types";

export const makeAgentsetTool = (
  namespaceInstance: NamespaceInstance,
  options?: SearchParamsSchema,
  extra?: FetchOptions,
) => {
  return tool({
    description: `get information from your knowledge base to answer questions.`,
    parameters: z.object({
      question: z.string().describe("The user's question"),
    }),
    execute: async ({ question }) => {
      const results = await namespaceInstance.search(question, options, extra);
      return results;
    },
  });
};
