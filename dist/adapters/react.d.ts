/**
 * React Hook Adapter for SearchOptimizer
 * Provides a convenient way to use SearchOptimizer in React applications with
 * optimized re-renders and type safety.
 *
 * @packageDocumentation
 */
import type { SearchExecutor, SearchOptimizerOptions, SearchOptimizerResult } from '../types';
/**
 * Props object returned by the useSearchOptimizer hook for easy input element integration
 */
export interface SearchInputProps {
    /** Current value of the search input */
    value: string;
    /** Change handler for the input element */
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    /** Optional placeholder text */
    placeholder?: string;
    /** Optional aria-label for accessibility */
    'aria-label'?: string;
}
/**
 * Extended result type that includes React-specific additions
 */
export interface SearchOptimizerHookResult<T> extends Omit<SearchOptimizerResult<T>, 'setQuery'> {
    /** Current search query */
    query: string;
    /** Function to update the search query */
    setQuery: (value: string) => void;
    /** Props object for easy input element integration */
    inputProps: SearchInputProps;
}
/**
 * React Hook for using SearchOptimizer in functional components.
 * This hook provides an optimized way to integrate search-as-you-type functionality
 * with automatic debouncing, request cancellation, and state management.
 *
 * @example
 * ```tsx
 * function SearchComponent() {
 *   const searchExecutor = useMemo(() =>
 *     createFetchExecutor({
 *       baseUrl: 'https://api.example.com/search'
 *     }),
 *   []);
 *
 *   const { inputProps, loading, results } = useSearchOptimizer(searchExecutor, {
 *     debounceDelay: 300,
 *     minChars: 2
 *   });
 *
 *   return (
 *     <div>
 *       <input {...inputProps} placeholder="Search..." />
 *       {loading && <div>Loading...</div>}
 *       {results && <ResultsList items={results} />}
 *     </div>
 *   );
 * }
 * ```
 *
 * @param executor - The search executor implementation
 * @param options - Configuration options for SearchOptimizer
 * @returns A SearchOptimizerHookResult object with methods, state, and React-specific additions
 *
 * @throws {Error} If executor is undefined or null
 */
export declare function useSearchOptimizer<T = any>(executor: SearchExecutor<T>, options?: SearchOptimizerOptions<T>): SearchOptimizerHookResult<T>;
