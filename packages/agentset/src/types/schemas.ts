import type { components, operations } from "./openapi";

export type Schemas = components["schemas"];

export type EmbeddingConfigSchema = Schemas["embedding-model-config"];
export type VectorStoreSchema = Schemas["vector-store-config"];

export type NamespaceSchema = Schemas["namespace"];
export type CreateNamespaceOptionsSchema = NonNullable<
  operations["createNamespace"]["requestBody"]
>["content"]["application/json"];
export type UpdateNamespaceOptionsSchema = NonNullable<
  operations["updateNamespace"]["requestBody"]
>["content"]["application/json"];

export type IngestJobSchema = Schemas["ingest-job"];
export type ListIngestJobsOptionsSchema = NonNullable<
  operations["listIngestJobs"]["parameters"]
>["query"];
export type CreateIngestJobOptionsSchema = NonNullable<
  operations["createIngestJob"]["requestBody"]
>["content"]["application/json"];
export type IngestJobStatusSchema = Schemas["document-status"];

export type DocumentSchema = Schemas["document"];
export type DocumentStatusSchema = Schemas["document-status"];
export type ListDocumentsOptionsSchema = NonNullable<
  operations["listDocuments"]["parameters"]
>["query"];

export interface SearchParamsSchema {
  topK?: number;
  rerank?: boolean;
  rerankLimit?: number;
  filter?: Record<string, unknown>;
  minScore?: number;
  includeRelationships?: boolean;
  includeMetadata?: boolean;
}

export interface SearchResultSchema {
  id: string;
  text: string;
  score: number;
  rerankScore?: number;
  relationships?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// Upload types
export type CreateUploadOptionsSchema = NonNullable<
  operations["createUpload"]["requestBody"]
>["content"]["application/json"];

export type CreateBatchUploadOptionsSchema = NonNullable<
  operations["createBatchUpload"]["requestBody"]
>["content"]["application/json"];

export type UploadResponseSchema = NonNullable<
  operations["createUpload"]["responses"]["201"]["content"]["application/json"]
>["data"];

export type BatchUploadResponseSchema = NonNullable<
  operations["createBatchUpload"]["responses"]["201"]["content"]["application/json"]
>["data"];
