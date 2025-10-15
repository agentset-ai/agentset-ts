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

export type SearchParamsSchema = Omit<
  NonNullable<
    operations["search"]["requestBody"]
  >["content"]["application/json"],
  "query"
>;

export type SearchResultSchema = NonNullable<
  operations["search"]["responses"]["200"]["content"]["application/json"]
>["data"][number];

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

// Hosting types
export type HostingSchema = Schemas["hosting"];
export type UpdateHostingOptionsSchema = NonNullable<
  operations["updateHosting"]["requestBody"]
>["content"]["application/json"];

export type RerankingModel = NonNullable<SearchParamsSchema["rerankModel"]>;
