import type { ApiClient } from "../client";
import type {
  CreateNamespaceOptionsSchema,
  NamespaceSchema,
  UpdateNamespaceOptionsSchema,
} from "../types/schemas";

/**
 * Class for working with namespaces
 */
export class NamespacesResource {
  private readonly client: ApiClient;
  constructor(client: ApiClient) {
    this.client = client;
  }

  /**
   * List all namespaces
   */
  async list(): Promise<NamespaceSchema[]> {
    const response = await this.client.get<{
      success: boolean;
      data: NamespaceSchema[];
    }>("/v1/namespace");
    return response.data;
  }

  /**
   * Create a new namespace
   */
  async create(params: CreateNamespaceOptionsSchema): Promise<NamespaceSchema> {
    const response = await this.client.post<{
      success: boolean;
      data: NamespaceSchema;
    }>("/v1/namespace", params);

    return response.data;
  }

  /**
   * Get a namespace by ID or slug
   */
  async get(namespaceId: string): Promise<NamespaceSchema> {
    const response = await this.client.get<{
      success: boolean;
      data: NamespaceSchema;
    }>(`/v1/namespace/${namespaceId}`);

    return response.data;
  }

  /**
   * Update a namespace
   */
  async update(
    namespaceId: string,
    params: UpdateNamespaceOptionsSchema,
  ): Promise<NamespaceSchema> {
    const response = await this.client.patch<{
      success: boolean;
      data: NamespaceSchema;
    }>(`/v1/namespace/${namespaceId}`, params);

    return response.data;
  }

  /**
   * Delete a namespace
   */
  async delete(namespaceId: string): Promise<void> {
    await this.client.delete<{ success: boolean; data: NamespaceSchema }>(
      `/v1/namespace/${namespaceId}`,
    );
  }
}
