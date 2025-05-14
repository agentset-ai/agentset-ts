import type { AgentsetOptions, CustomFetcher } from "./types/common";
import { ApiClient } from "./client";
import { NamespaceResource } from "./resources/namespace";
import { NamespacesResource } from "./resources/namespaces";

/**
 * Main class for interacting with the Agentset API
 */
export class Agentset {
  private readonly client: ApiClient;

  /** Access namespace operations */
  readonly namespaces: NamespacesResource;

  /**
   * Create a new Agentset client
   * @param options Options for initializing the client
   */
  constructor(options: AgentsetOptions) {
    const baseUrl = options.baseUrl || "https://api.agentset.ai";
    const fetcher = options.fetcher || this.getDefaultFetcher();

    this.client = new ApiClient(options.apiKey, baseUrl, fetcher);
    this.namespaces = new NamespacesResource(this.client);
  }

  /**
   * Get a specific namespace by ID or slug
   * @param namespaceId The ID or slug of the namespace
   */
  namespace(namespaceId: string): NamespaceResource {
    return new NamespaceResource(this.client, this.namespaces, namespaceId);
  }

  /**
   * Gets the default fetcher for the current environment
   * @returns The default fetcher function
   */
  private getDefaultFetcher(): CustomFetcher {
    // Use the native fetch if available
    if (typeof fetch === "function") {
      return fetch;
    }

    throw new Error(
      "No fetch implementation found. In Node.js, make sure to install and use node-fetch, or provide a custom fetcher implementation.",
    );
  }
}
