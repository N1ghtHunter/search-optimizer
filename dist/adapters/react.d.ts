import type { SearchExecutor, SearchOptimizerOptions, SearchOptimizerResult } from '../types';
export interface SearchInputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    'aria-label'?: string;
}
export interface SearchOptimizerHookResult<T> extends Omit<SearchOptimizerResult<T>, 'setQuery'> {
    query: string;
    setQuery: (value: string) => void;
    inputProps: SearchInputProps;
}
export declare function useSearchOptimizer<T = any>(executor: SearchExecutor<T>, options?: SearchOptimizerOptions<T>): SearchOptimizerHookResult<T>;
