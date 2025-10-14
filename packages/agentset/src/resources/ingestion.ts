import type { ApiClient } from "../client";
import type { FetchOptions } from "../types/common";
import type {
  CreateIngestJobOptionsSchema,
  IngestJobSchema,
  IngestJobStatusSchema,
  ListIngestJobsOptionsSchema,
} from "../types/schemas";

type ListOptions = Omit<
  NonNullable<ListIngestJobsOptionsSchema>,
  "statuses"
> & {
  statuses?: IngestJobStatusSchema[];
};

export class IngestionResource {
  constructor(
    private readonly client: ApiClient,
    private readonly namespaceId: string,
  ) {}

  /**
   * List all ingest jobs for the namespace
   */
  async all(
    params: ListOptions = {},
    options?: FetchOptions,
  ): Promise<{
    jobs: IngestJobSchema[];
    pagination: { nextCursor: string | null };
  }> {
    const query = this.client.prepareParams(params);
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

  /**
   * Re-ingest a job
   */
  async reIngest(
    jobId: string,
    options?: FetchOptions,
  ): Promise<Pick<IngestJobSchema, "id">> {
    const response = await this.client.post<{
      success: boolean;
      data: Pick<IngestJobSchema, "id">;
    }>(
      `/v1/namespace/${this.namespaceId}/ingest-jobs/${jobId}/re-ingest`,
      options,
    );

    return response.data;
  }
}
