import type { ApiClient } from "../client";
import type { FetchOptions } from "../types/common";
import type {
  CreateIngestJobOptionsSchema,
  IngestJobSchema,
  ListIngestJobsOptionsSchema,
} from "../types/schemas";

/**
 * Class for working with ingest jobs for a namespace
 */
export class IngestionsResource {
  private readonly client: ApiClient;
  private readonly namespaceId: string;

  constructor(client: ApiClient, namespaceId: string) {
    this.client = client;
    this.namespaceId = namespaceId;
  }

  private prepareParams(
    params: NonNullable<ListIngestJobsOptionsSchema>,
  ): string {
    // Build query parameters
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

    const queryString = queryParams.toString();
    return queryString ? `?${queryString}` : "";
  }

  /**
   * List all ingest jobs for the namespace
   */
  async all(
    params: ListIngestJobsOptionsSchema = {},
    options?: FetchOptions,
  ): Promise<{
    jobs: IngestJobSchema[];
    pagination: { nextCursor: string | null };
  }> {
    const query = this.prepareParams(params);
    const response = await this.client.get<{
      success: boolean;
      data: IngestJobSchema[];
      pagination: { nextCursor: string | null };
    }>(`/v1/namespace/${this.namespaceId}/ingest-jobs${query}`, options);

    return {
      jobs: response.data,
      pagination: response.pagination,
    };
  }

  /**
   * Create a new ingest job
   */
  async create(
    params: CreateIngestJobOptionsSchema,
    options?: FetchOptions,
  ): Promise<IngestJobSchema> {
    const response = await this.client.post<{
      success: boolean;
      data: IngestJobSchema;
    }>(`/v1/namespace/${this.namespaceId}/ingest-jobs`, params, options);

    return response.data;
  }

  /**
   * Get an ingest job by ID
   */
  async get(jobId: string, options?: FetchOptions): Promise<IngestJobSchema> {
    const response = await this.client.get<{
      success: boolean;
      data: IngestJobSchema;
    }>(`/v1/namespace/${this.namespaceId}/ingest-jobs/${jobId}`, options);

    return response.data;
  }

  /**
   * Delete an ingest job
   */
  async delete(jobId: string, options?: FetchOptions): Promise<void> {
    await this.client.delete<{ success: boolean; data: IngestJobSchema }>(
      `/v1/namespace/${this.namespaceId}/ingest-jobs/${jobId}`,
      options,
    );
  }
}
