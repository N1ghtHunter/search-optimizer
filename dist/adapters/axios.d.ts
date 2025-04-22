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
    axios: AxiosLike;
    baseUrl: string;
    queryParam?: string;
    axiosOptions?: any;
}
export declare function createAxiosExecutor<T = any>(options: AxiosAdapterOptions): SearchExecutor<T>;
