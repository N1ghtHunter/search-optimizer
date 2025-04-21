/**
 * Fetch adapter for SearchOptimizer
 * Allows using the Fetch API with SearchOptimizer
 */
import { SearchExecutor } from '../types';
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
export declare function createFetchExecutor<T = any>(options: FetchAdapterOptions): SearchExecutor<T>;
