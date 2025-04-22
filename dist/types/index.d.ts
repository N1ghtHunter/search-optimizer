export interface SearchOptimizerOptions<T = any> {
    debounceDelay?: number;
    minChars?: number;
    trimInput?: boolean;
    lowercaseInput?: boolean;
    enableCancellation?: boolean;
    inputProcessor?: (value: string) => string;
    onSearchStart?: () => void;
    onSearchSuccess?: (results: T, query: string) => void;
    onSearchError?: (error: Error, query: string) => void;
    onSearchCanceled?: (query: string) => void;
    ariaLabel?: string;
}
export interface SearchExecutor<T = any> {
    execute: (query: string, signal?: AbortSignal) => Promise<T>;
}
export type SearchExecutorFactory<T = any> = (options?: any) => SearchExecutor<T>;
export interface SearchOptimizerResult<T = any> {
    query: string;
    loading: boolean;
    results: T | null;
    error: Error | null;
    setQuery: (value: string) => void;
    search: () => Promise<void>;
    cancel: () => void;
    reset: () => void;
    onSearchStart?: () => void;
    onSearchSuccess?: (results: T, query: string) => void;
    onSearchError?: (error: Error, query: string) => void;
    onSearchCanceled?: (query: string) => void;
}
