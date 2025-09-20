import type { ApiClient } from "../client";
import type { FetchOptions } from "../types/common";
import type {
  DocumentSchema,
  DocumentStatusSchema,
  ListDocumentsOptionsSchema,
} from "../types/schemas";

type ListOptions = Omit<NonNullable<ListDocumentsOptionsSchema>, "statuses"> & {
  statuses?: DocumentStatusSchema[];
};

export class DocumentsResource {
  constructor(
    private readonly client: ApiClient,
    private readonly namespaceId: string,
  ) {}

  private prepareParams(params: ListOptions): string {
    const queryParams = new URLSearchParams();

    if (params.statuses && params.statuses.length > 0)
      queryParams.append("statuses", params.statuses.join(","));

    if (params.orderBy) queryParams.append("orderBy", params.orderBy);
    if (params.order) queryParams.append("order", params.order);
    if (params.cursor) queryParams.append("cursor", params.cursor);
    if (params.cursorDirection)
      queryParams.append("cursorDirection", params.cursorDirection);
    if (params.perPage)
      queryParams.append("perPage", params.perPage.toString());

    const str = queryParams.toString();
    return str ? `?${str}` : "";
  }

  /**
   * List all documents for the namespace
   */
  async all(
    params: ListOptions = {},
    options?: FetchOptions,
  ): Promise<{
    documents: DocumentSchema[];
    pagination: { nextCursor: string | null };
  }> {
    const query = this.prepareParams(params);

    const response = await this.client.get<{
      success: boolean;
      data: DocumentSchema[];
      pagination: { nextCursor: string | null };
    }>(`/v1/namespace/${this.namespaceId}/documents${query}`, options);

    return {
      documents: response.data,
      pagination: response.pagination,
    };
  }

  /**
   * Get a document by ID
   */
  async get(
    documentId: string,
    options?: FetchOptions,
  ): Promise<DocumentSchema> {
    const response = await this.client.get<{
      success: boolean;
      data: DocumentSchema;
    }>(`/v1/namespace/${this.namespaceId}/documents/${documentId}`, options);

    return response.data;
  }

  /**
   * Delete a document
   */
  async delete(documentId: string, options?: FetchOptions): Promise<void> {
    await this.client.delete<{ success: boolean; data: DocumentSchema }>(
      `/v1/namespace/${this.namespaceId}/documents/${documentId}`,
      options,
    );
  }
}
