import { SearchExecutor } from '../types';
export interface FetchAdapterOptions {
    baseUrl: string;
    queryParam?: string;
    fetchOptions?: RequestInit;
    responseTransformer?: (response: Response) => Promise<any>;
}
export declare function createFetchExecutor<T = any>(options: FetchAdapterOptions): SearchExecutor<T>;
