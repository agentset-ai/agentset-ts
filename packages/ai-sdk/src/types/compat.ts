/**
 * Compatibility types for AI SDK v5 and v6.
 *
 * AI SDK v6 introduced breaking type changes:
 * - LanguageModel: specificationVersion changed from 'v2' to 'v3'
 * - ModelMessage: providerOptions type changed from SharedV2ProviderOptions to SharedV3ProviderOptions
 *
 * These types are inferred from the actual function signatures, making them
 * compatible with whichever version of the AI SDK is installed.
 */
import type { generateText, streamText } from "ai";

/**
 * A language model type compatible with both AI SDK v5 and v6.
 * Inferred from streamText's model parameter.
 */
export type CompatLanguageModel = Parameters<typeof streamText>[0]["model"];

/**
 * A message type compatible with both AI SDK v5 and v6.
 * Inferred from generateText's messages parameter.
 */
export type CompatModelMessage = NonNullable<
  Parameters<typeof generateText>[0]["messages"]
>[number];

/**
 * Array of messages compatible with both AI SDK v5 and v6.
 */
export type CompatModelMessages = CompatModelMessage[];
