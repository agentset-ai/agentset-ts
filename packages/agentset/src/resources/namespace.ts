import type { ApiClient } from "../client";
import type { FetchOptions } from "../types/common";
import type {
  ChatMessageSchema,
  ChatParamsSchema,
  ChatResponseSchema,
  SearchParamsSchema,
  SearchResultSchema,
  UpdateNamespaceOptionsSchema,
} from "../types/schemas";
import type { NamespacesResource } from "./namespaces";
import { DocumentsResource } from "./document";
import { IngestionsResource } from "./ingestion";

/**
 * Class for working with a specific namespace
 */
export class NamespaceResource {
  private readonly namespaceId: string;
  private readonly client: ApiClient;

  /** Access ingestion operations for this namespace */
  readonly ingestion: IngestionsResource;

  /** Access document operations for this namespace */
  readonly documents: DocumentsResource;
  readonly namespaces: NamespacesResource;

  constructor(
    client: ApiClient,
    namespaces: NamespacesResource,
    namespaceId: string,
  ) {
    this.client = client;
    this.namespaceId = namespaceId;
    this.ingestion = new IngestionsResource(client, namespaceId);
    this.documents = new DocumentsResource(client, namespaceId);
    this.namespaces = namespaces;
  }

  /**
   * Get the namespace
   */
  async get() {
    return this.namespaces.get(this.namespaceId);
  }

  async update(params: UpdateNamespaceOptionsSchema) {
    return this.namespaces.update(this.namespaceId, params);
  }

  async delete() {
    return this.namespaces.delete(this.namespaceId);
  }

  /**
   * Search the namespace
   */
  async search(
    query: string,
    params: SearchParamsSchema = {},
    options?: FetchOptions,
  ) {
    const response = await this.client.post<{
      success: boolean;
      data: SearchResultSchema[];
    }>(
      `/v1/namespace/${this.namespaceId}/search`,
      {
        query,
        ...params,
      },
      options,
    );

    return response.data;
  }

  /**
   * Chat with the namespace
   */
  async chat(
    messages: ChatMessageSchema[],
    params: ChatParamsSchema = {},
    options?: FetchOptions,
  ) {
    const response = await this.client.post<{
      success: boolean;
      data: ChatResponseSchema;
    }>(
      `/v1/namespace/${this.namespaceId}/chat`,
      {
        messages,
        ...params,
      },
      options,
    );

    return response.data;
  }
}
