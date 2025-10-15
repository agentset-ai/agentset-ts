import type { ApiClient } from "../client";
import type { FetchOptions } from "../types/common";
import type {
  SearchParamsSchema,
  SearchResultSchema,
  UpdateNamespaceOptionsSchema,
} from "../types/schemas";
import type { NamespacesResource } from "./namespaces";
import { DocumentsResource } from "./documents";
import { HostingResource } from "./hosting";
import { IngestionResource } from "./ingestion";
import { UploadsResource } from "./uploads";

export class NamespaceResource {
  public readonly ingestion: IngestionResource;
  public readonly documents: DocumentsResource;
  public readonly uploads: UploadsResource;
  public readonly hosting: HostingResource;

  constructor(
    private readonly client: ApiClient,
    public readonly namespaces: NamespacesResource,
    private readonly namespaceId: string,
  ) {
    this.ingestion = new IngestionResource(client, namespaceId);
    this.documents = new DocumentsResource(client, namespaceId);
    this.uploads = new UploadsResource(client, namespaceId);
    this.hosting = new HostingResource(client, namespaceId);
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
}
