import type { ApiClient } from "../client";
import type { FetchOptions } from "../types/common";
import type {
  CreateBatchUploadOptionsSchema,
  CreateUploadOptionsSchema,
  UploadResponseSchema,
} from "../types/schemas";
import { getFilePayload, Uploadable } from "../lib/uploads";

export class UploadsResource {
  constructor(
    private readonly client: ApiClient,
    private readonly namespaceId: string,
  ) {}

  /**
   * Generate a presigned URL for uploading a single file to the specified namespace.
   */
  async create(
    params: CreateUploadOptionsSchema,
    options?: FetchOptions,
  ): Promise<UploadResponseSchema> {
    const response = await this.client.post<{
      success: boolean;
      data: UploadResponseSchema;
    }>(`/v1/namespace/${this.namespaceId}/uploads`, params, options);

    return response.data;
  }

  /**
   * Generate presigned URLs for uploading multiple files to the specified namespace.
   */
  async createBatch(
    params: CreateBatchUploadOptionsSchema,
    options?: FetchOptions,
  ): Promise<UploadResponseSchema[]> {
    const response = await this.client.post<{
      success: boolean;
      data: UploadResponseSchema[];
    }>(`/v1/namespace/${this.namespaceId}/uploads/batch`, params, options);

    return response.data;
  }

  /**
   * Upload a single file directly
   */
  async upload(file: Uploadable, options?: FetchOptions) {
    const payload = await getFilePayload(file);
    const uploadResponse = await this.create(
      {
        fileName: payload.name,
        contentType: payload.type,
        fileSize: payload.size,
      },
      options,
    );

    await this.uploadToPresignedUrl(
      uploadResponse.url,
      payload.data as Uploadable["file"],
      payload.type,
    );

    return { key: uploadResponse.key };
  }

  /**
   * Upload multiple files directly
   */
  async uploadBatch(files: Uploadable[], options?: FetchOptions) {
    const filePayloads = await Promise.all(
      files.map((file) => getFilePayload(file)),
    );

    const batchRequest = {
      files: filePayloads.map((file) => ({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      })),
    };

    const uploadResponses = await this.createBatch(batchRequest, options);
    const uploadPromises = filePayloads.map(async (file, index) => {
      const uploadResponse = uploadResponses[index]!;

      await this.uploadToPresignedUrl(
        uploadResponse.url,
        file.data as Uploadable["file"],
        file.type,
      );

      return { key: uploadResponse.key };
    });

    return await Promise.all(uploadPromises);
  }

  /**
   * Upload content to a presigned URL
   */
  private async uploadToPresignedUrl(
    url: string,
    content: Uploadable["file"],
    contentType: string,
  ): Promise<void> {
    const fetcher = this.client.getFetcher();

    const response = await fetcher(url, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
      },
      body: content,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to upload file: ${response.status} ${response.statusText}`,
      );
    }
  }
}
