/**
 * Axios adapter for SearchOptimizer
 * Allows using the Axios HTTP client with SearchOptimizer
 */
import { SearchExecutor } from '../types';
export interface AxiosLike {
    get<T = any>(url: string, config?: any): Promise<{
        data: T;
    }>;
    CancelToken?: {
        source(): {
            token: any;
            cancel: (reason?: string) => void;
        };
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
export declare function createAxiosExecutor<T = any>(options: AxiosAdapterOptions): SearchExecutor<T>;
