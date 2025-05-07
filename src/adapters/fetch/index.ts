/**
 * Fetch adapter for SearchOptimizer
 * Allows using the Fetch API with SearchOptimizer
 */

import type { SearchExecutor } from '../../types';

export interface FetchAdapterOptions {
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
   * Additional fetch request options to include with every request
   */
  fetchOptions?: RequestInit;

  /**
   * Function to transform the fetch response
   * @param response The fetch Response object
   * @returns The processed data
   */
  responseTransformer?: (response: Response) => Promise<any>;
}

/**
 * Creates a SearchExecutor implementation using the Fetch API
 *
 * @param options Configuration options for the fetch adapter
 * @returns A SearchExecutor implementation
 */
export function createFetchExecutor<T = any>(options: FetchAdapterOptions): SearchExecutor<T> {
  const { baseUrl, queryParam = 'q', fetchOptions = {}, responseTransformer = response => response.json() } = options;

  return {
    execute: async (query: string, signal?: AbortSignal): Promise<T> => {
      // Create URL with parameters
      const url = new URL(baseUrl);
      url.searchParams.append(queryParam, query);

      // Add the abort signal to the fetch options
      const requestOptions: RequestInit = {
        ...fetchOptions,
        signal,
      };

      try {
        const response = await fetch(url.toString(), requestOptions);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await responseTransformer(response);
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
