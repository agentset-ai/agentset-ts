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
    const query = this.client.prepareParams(params);

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

  /**
   * Get a presigned download URL for a document's chunks
   */
  async getChunksDownloadUrl(
    documentId: string,
    options?: FetchOptions,
  ): Promise<{ url: string }> {
    const response = await this.client.post<{
      success: boolean;
      data: { url: string };
    }>(
      `/v1/namespace/${this.namespaceId}/documents/${documentId}/chunks-download-url`,
      undefined,
      options,
    );

    return response.data;
  }

  /**
   * Get a presigned download URL for a document's source file
   */
  async getFileDownloadUrl(
    documentId: string,
    options?: FetchOptions,
  ): Promise<{ url: string }> {
    const response = await this.client.post<{
      success: boolean;
      data: { url: string };
    }>(
      `/v1/namespace/${this.namespaceId}/documents/${documentId}/file-download-url`,
      undefined,
      options,
    );

    return response.data;
  }
}
