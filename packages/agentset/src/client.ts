import type { CustomFetcher, FetchOptions } from "./types/common";
import { createError } from "./errors";

/**
 * Base HTTP client for making API requests to the Agentset API
 * @internal
 */
export class ApiClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly fetcher: CustomFetcher;

  constructor(apiKey: string, baseUrl: string, fetcher: CustomFetcher) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.fetcher = fetcher;
  }

  /**
   * Make a GET request to the API
   */
  async get<T>(path: string, options: FetchOptions = {}): Promise<T> {
    return this.request<T>("GET", path, undefined, options);
  }

  /**
   * Make a POST request to the API
   */
  async post<T>(
    path: string,
    body?: unknown,
    options: FetchOptions = {},
  ): Promise<T> {
    return this.request<T>("POST", path, body, options);
  }

  /**
   * Make a PATCH request to the API
   */
  async patch<T>(
    path: string,
    body?: unknown,
    options: FetchOptions = {},
  ): Promise<T> {
    return this.request<T>("PATCH", path, body, options);
  }

  /**
   * Make a DELETE request to the API
   */
  async delete<T>(path: string, options: FetchOptions = {}): Promise<T> {
    return this.request<T>("DELETE", path, undefined, options);
  }

  /**
   * Make a request to the API with error handling
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: FetchOptions = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const { tenantId, ...fetchOptions } = options;

    const headers = new Headers(fetchOptions.headers);
    headers.set("Authorization", `Bearer ${this.apiKey}`);
    headers.set("Content-Type", "application/json");

    if (tenantId) {
      headers.set("x-tenant-id", tenantId);
    }

    const response = await this.fetcher(url, {
      ...fetchOptions,
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok || response.status >= 300) {
      await this.handleErrorResponse(response);
    }

    // Handle 204 No Content responses
    // if (response.status === 204) {
    //   return {} as T;
    // }

    const data = await response.json();
    return data as T;
  }

  /**
   * Handle error responses from the API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorMessage = `HTTP error ${response.status}`;
    let docUrl: string | undefined;

    try {
      const errorData = (await response.json()) as
        | {
            error?: {
              message: string;
              doc_url: string;
            };
          }
        | undefined;

      if (errorData?.error) {
        if (errorData.error.message) errorMessage = errorData.error.message;
        if (errorData.error.doc_url) docUrl = errorData.error.doc_url;
      }
    } catch {
      // If we can't parse the error response, just use the default error message
    }

    throw createError(response.status, errorMessage, docUrl);
  }
}
