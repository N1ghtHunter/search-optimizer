/**
 * Generic adapter for SearchOptimizer
 * Allows creating custom search executors with minimal code
 */

import type { SearchExecutor } from '../../types';

/**
 * Options for the generic search executor
 */
export interface GenericExecutorOptions<T = any> {
  /**
   * Name for this custom executor (optional, useful for debugging)
   */
  name?: string;

  /**
   * Optional error handler to format errors consistently
   */
  errorHandler?: (error: unknown) => Error;
}

/**
 * Creates a SearchExecutor using a custom search function
 *
 * @param searchFn The function that will perform the search
 * @param options Additional configuration options
 * @returns A SearchExecutor implementation
 *
 * @example
 * ```typescript
 * // Create a custom executor with any search implementation
 * const myCustomExecutor = createGenericExecutor(
 *   async (query, signal) => {
 *     // Your custom implementation here
 *     const response = await customSearchLibrary.search(query, { signal });
 *     return response.results;
 *   }
 * );
 *
 * // Use with SearchOptimizer
 * const searchOptimizer = createSearchOptimizer(myCustomExecutor);
 * ```
 */
export function createGenericExecutor<T = any>(
  searchFn: (query: string, signal?: AbortSignal) => Promise<T>,
  options: GenericExecutorOptions = {},
): SearchExecutor<T> {
  const { name = 'GenericExecutor', errorHandler } = options;

  return {
    execute: async (query: string, signal?: AbortSignal): Promise<T> => {
      try {
        return await searchFn(query, signal);
      } catch (error) {
        // Use the custom error handler if provided, otherwise format error consistently
        if (errorHandler) {
          throw errorHandler(error);
        }

        // Ensure we always throw an Error object with useful context
        if (error instanceof Error) {
          throw error;
        }
        throw new Error(`${name} error: ${String(error)}`);
      }
    },
  };
}
