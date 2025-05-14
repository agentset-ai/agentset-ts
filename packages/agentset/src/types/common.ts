/**
 * Options for initializing the Agentset client
 */
export interface AgentsetOptions {
  /**
   * Base URL for the Agentset API. Change this if you're self-hosting.
   * @default https://api.agentset.ai
   */
  baseUrl?: string;

  /**
   * API key for authentication with the Agentset API
   */
  apiKey: string;

  /**
   * Custom fetcher to use for making API requests
   * @default window.fetch or node-fetch
   */
  fetcher?: CustomFetcher;
}

/**
 * Custom fetcher function type that matches the native fetch API
 */
export type CustomFetcher = typeof fetch;

/**
 * Options for API requests
 */
export interface FetchOptions extends RequestInit {
  /**
   * Optional tenant ID to use for the request
   */
  tenantId?: string;
}
