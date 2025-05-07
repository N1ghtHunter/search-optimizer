/**
 * Axios adapter for SearchOptimizer
 * Allows using the Axios HTTP client with SearchOptimizer
 */

import type { SearchExecutor } from '../../types';

// Define the type for axios-like interface
// This allows users to provide their own axios instance
export interface AxiosLike {
  get<T = any>(url: string, config?: any): Promise<{ data: T }>;
  CancelToken?: {
    source(): { token: any; cancel: (reason?: string) => void };
  };
}

export interface AxiosAdapterOptions {
  /**
   * Axios instance to use for requests
   */
  axios: AxiosLike;

  /**
   * Base URL for the search endpoint
   */
  baseUrl: string;

  /**
   * Query parameter name for the search term
   * @default 'q'
   */
  queryParam?: string;

  /**
   * Additional axios request options to include with every request
   */
  axiosOptions?: any;
}

/**
 * Creates a SearchExecutor implementation using Axios
 *
 * @param options Configuration options for the axios adapter
 * @returns A SearchExecutor implementation
 */
export function createAxiosExecutor<T = any>(options: AxiosAdapterOptions): SearchExecutor<T> {
  const { axios, baseUrl, queryParam = 'q', axiosOptions = {} } = options;

  // Keep track of the cancel function from axios
  let cancelFn: ((reason?: string) => void) | null = null;

  return {
    execute: async (query: string, signal?: AbortSignal): Promise<T> => {
      // Set up AbortController to cancel axios request when external signal is aborted
      if (signal) {
        signal.addEventListener('abort', () => {
          if (cancelFn) cancelFn('Request was canceled');
        });
      }

      // Get cancel token if available
      let cancelToken;
      if (axios.CancelToken) {
        const source = axios.CancelToken.source();
        cancelToken = source.token;
        cancelFn = source.cancel;
      }

      // Create URL parameters
      const params: Record<string, string> = {};
      params[queryParam] = query;

      try {
        const response = await axios.get(baseUrl, {
          ...axiosOptions,
          params,
          cancelToken,
        });

        return response.data;
      } catch (error) {
        // Rethrow the error but make sure it's a proper Error object
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(String(error));
      }
    },
  };
}
