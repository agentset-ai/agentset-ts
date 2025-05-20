import type { SearchParamsSchema, SearchResultSchema } from "agentset";
import type { CoreMessage, JSONValue, LanguageModelV1 } from "ai";
import { createDataStreamResponse, streamText } from "ai";

import type { NamespaceInstance } from "../types";
import type { Queries } from "./utils";
import { ANSWER_SYSTEM_PROMPT, NEW_MESSAGE_PROMPT } from "./prompts";
import { evaluateQueries, formatSources, generateQueries } from "./utils";

export type AgenticEngineAnnotation =
  | {
      type: "status";
      value: "generating-queries";
    }
  | {
      type: "status";
      value: "searching";
      queries: string[];
    }
  | {
      type: "status";
      value: "generating-answer";
    }
  | {
      type: "agentset_sources";
      value: SearchResultSchema[];
    };

export interface AgenticEngineParams {
  /**
   * The chat history.
   */
  messages: CoreMessage[];

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
  generateQueriesStep: { model: LanguageModelV1 };

  /**
   * Parameters for the `evaluateQueries` step.
   */
  evaluateQueriesStep: { model: LanguageModelV1 };

  /**
   * Parameters for the `answerStep` step.
   */
  answerStep: Omit<Parameters<typeof streamText>[0], "messages">;

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
    Parameters<typeof createDataStreamResponse>[0],
    "execute"
  >,
) => {
  const lastMessage = messages[messages.length - 1]?.content;
  const messagesWithoutQuery = messages.slice(0, -1);

  return createDataStreamResponse({
    execute: async (dataStream) => {
      dataStream.writeMessageAnnotation({
        type: "status",
        value: "generating-queries",
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

        dataStream.writeMessageAnnotation({
          type: "status",
          value: "searching",
          queries: newQueries.map((q) => q.query),
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

      dataStream.writeMessageAnnotation({
        type: "status",
        value: "generating-answer",
      });

      const dedupedData = Object.values(chunks);
      const finalChunks = postProcessChunks
        ? await postProcessChunks(dedupedData)
        : dedupedData;

      const newMessages: CoreMessage[] = [
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

      const { system, temperature, ...rest } = answerStep;
      const messageStream = streamText({
        messages: newMessages,
        system: system ?? ANSWER_SYSTEM_PROMPT,
        temperature: temperature ?? 0,
        ...rest,
      });

      dataStream.writeMessageAnnotation({
        type: "agentset_sources",
        value: finalChunks as unknown as JSONValue,
      });
      messageStream.mergeIntoDataStream(dataStream);
    },
    ...(dataStreamParams ?? {}),
  });
};
