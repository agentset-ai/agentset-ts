import type { SearchParamsSchema, SearchResultSchema } from "agentset";
import type { LanguageModel, ModelMessage } from "ai";
import { createUIMessageStream, streamText } from "ai";

import type { AgentsetUIMessage, NamespaceInstance } from "../types";
import type { Queries } from "./utils";
import { ANSWER_SYSTEM_PROMPT, NEW_MESSAGE_PROMPT } from "./prompts";
import { evaluateQueries, formatSources, generateQueries } from "./utils";

export interface AgenticEngineParams {
  /**
   * The chat history.
   */
  messages: ModelMessage[];

  /**
   * Maximum number of evaluations loops to run.
   * @default 3
   */
  maxEvals?: number;

  /**
   * Maximum number of tokens to use in the evaluation loop(s). This doesn't include the tokens used in the answer step.
   * @default 4096
   */
  tokenBudget?: number;

  /**
   * Additional options to pass to the `namespace.search` function.
   * @default "{ topK: 50, rerankLimit: 15, rerank: true }"
   */
  queryOptions?: SearchParamsSchema;

  /**
   * Parameters for the `generateQueries` step.
   */
  generateQueriesStep: { model: LanguageModel };

  /**
   * Parameters for the `evaluateQueries` step.
   */
  evaluateQueriesStep: { model: LanguageModel };

  /**
   * Parameters for the `answerStep` step.
   */
  answerStep: Omit<Parameters<typeof streamText>[0], "messages" | "prompt">;

  /**
   * Callback function that is called after the evaluation loop(s) are finished with the total number of queries that were generated and searched.
   */
  afterQueries?: (totalQueries: number) => void;

  /**
   * Optional function post-process all the chunks that were retrieved before the answer step.
   */
  postProcessChunks?: (
    chunks: SearchResultSchema[],
  ) => SearchResultSchema[] | Promise<SearchResultSchema[]>;
}

const STATUS_PART_ID = "agentset-status";

export const AgenticEngine = (
  namespace: NamespaceInstance,
  {
    messages,
    maxEvals = 3,
    tokenBudget = 4096,
    queryOptions,
    generateQueriesStep,
    evaluateQueriesStep,
    answerStep,
    afterQueries,
    postProcessChunks,
  }: AgenticEngineParams,
  dataStreamParams?: Omit<
    Parameters<typeof createUIMessageStream<AgentsetUIMessage>>[0],
    "execute"
  >,
) => {
  const lastMessage = messages[messages.length - 1]?.content;
  const messagesWithoutQuery = messages.slice(0, -1);

  return createUIMessageStream<AgentsetUIMessage>({
    execute: async ({ writer }) => {
      writer.write({
        id: STATUS_PART_ID,
        type: "data-status",
        data: "generating-queries",
      });

      // step 1. generate queries
      const queries: Queries = [];
      const chunks: Record<string, SearchResultSchema> = {};
      const queryToResult: Record<
        string,
        { query: string; results: SearchResultSchema[] }
      > = {};
      let totalQueries = 0;
      let totalTokens = 0;

      for (let i = 0; i < maxEvals; i++) {
        console.log(`[EVAL LOOP] ${i + 1} / ${maxEvals}`);

        const { queries: newQueries, totalTokens: queriesTokens } =
          await generateQueries(generateQueriesStep.model, {
            messages,
            oldQueries: queries,
          });
        newQueries.forEach((q) => {
          if (queries.includes(q)) return;
          queries.push(q);
        });

        totalTokens += queriesTokens;

        writer.write({
          id: STATUS_PART_ID,
          type: "data-status",
          data: "searching",
        });

        writer.write({
          type: "data-queries",
          data: newQueries.map((q) => q.query),
        });

        const data = (
          await Promise.all(
            newQueries.map(async (query) => {
              try {
                const queryResult = await namespace.search(query.query, {
                  topK: 50,
                  rerankLimit: 15,
                  rerank: true,
                  ...(queryOptions ?? {}),
                });

                totalQueries++;
                return { query: query.query, results: queryResult };
              } catch (error) {
                console.error(error);
                return null;
              }
            }),
          )
        ).filter((d) => d !== null);

        data.forEach((d) => {
          queryToResult[d.query] = d;

          d.results.forEach((r) => {
            if (chunks[r.id]) return;
            chunks[r.id] = r;
          });
        });

        const { canAnswer, totalTokens: evalsTokens } = await evaluateQueries(
          evaluateQueriesStep.model,
          {
            messages,
            sources: Object.values(chunks),
          },
        );
        totalTokens += evalsTokens;

        if (canAnswer || totalTokens >= tokenBudget) break;
      }

      afterQueries?.(totalQueries);

      writer.write({
        id: STATUS_PART_ID,
        type: "data-status",
        data: "generating-answer",
      });

      const dedupedData = Object.values(chunks);
      const finalChunks = postProcessChunks
        ? await postProcessChunks(dedupedData)
        : dedupedData;

      const newMessages: ModelMessage[] = [
        ...messagesWithoutQuery,
        {
          role: "user",
          content: NEW_MESSAGE_PROMPT({
            chunks: formatSources(finalChunks),
            // put the original query in the message to help with context
            query: lastMessage
              ? `<query>${lastMessage as string}</query>`
              : "No query provided",
          }),
        },
      ];

      const { system, temperature, model, ...rest } = answerStep;
      const messageStream = streamText({
        model,
        messages: newMessages,
        system: system ?? ANSWER_SYSTEM_PROMPT,
        temperature: temperature ?? 0,
        ...rest,
      });

      writer.write({
        type: "data-sources",
        data: finalChunks,
      });

      writer.merge(messageStream.toUIMessageStream());
    },
    ...(dataStreamParams ?? {}),
  });
};
