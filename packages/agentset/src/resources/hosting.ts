import type { ApiClient } from "../client";
import type { FetchOptions } from "../types/common";
import type {
  HostingSchema,
  UpdateHostingOptionsSchema,
} from "../types/schemas";

export class HostingResource {
  constructor(
    private readonly client: ApiClient,
    private readonly namespaceId: string,
  ) {}

  /**
   * Get the hosting configuration for the namespace
   */
  async get(options?: FetchOptions): Promise<HostingSchema> {
    const response = await this.client.get<{
      success: boolean;
      data: HostingSchema;
    }>(`/v1/namespace/${this.namespaceId}/hosting`, options);

    return response.data;
  }

  /**
   * Enable hosting for the namespace
   */
  async enable(options?: FetchOptions): Promise<HostingSchema> {
    const response = await this.client.post<{
      success: boolean;
      data: HostingSchema;
    }>(`/v1/namespace/${this.namespaceId}/hosting`, {}, options);

    return response.data;
  }

  /**
   * Update the hosting configuration for the namespace
   */
  async update(
    params: UpdateHostingOptionsSchema,
    options?: FetchOptions,
  ): Promise<HostingSchema> {
    const response = await this.client.patch<{
      success: boolean;
      data: HostingSchema;
    }>(`/v1/namespace/${this.namespaceId}/hosting`, params, options);

    return response.data;
  }

  /**
   * Delete the hosting configuration for the namespace
   */
  async delete(options?: FetchOptions): Promise<void> {
    await this.client.delete<{ success: boolean; data: HostingSchema }>(
      `/v1/namespace/${this.namespaceId}/hosting`,
      options,
    );
  }
}
