/**
 * React Hook Adapter for SearchOptimizer
 * Provides a convenient way to use SearchOptimizer in React applications with
 * optimized re-renders and type safety.
 *
 * @packageDocumentation
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createSearchOptimizer } from '../core';
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
export function useSearchOptimizer(executor, options = {}) {
    if (!executor) {
        throw new Error('SearchExecutor is required');
    }
    // Create SearchOptimizer instance with stable reference
    const searchOptimizerRef = useRef(null);
    if (!searchOptimizerRef.current) {
        searchOptimizerRef.current = createSearchOptimizer(executor, options);
    }
    const searchOptimizer = searchOptimizerRef.current;
    // State for component re-rendering
    const [query, setQueryState] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    // Memoize callbacks to prevent unnecessary re-renders
    const handleSearchStart = useCallback(() => {
        var _a;
        setLoading(true);
        (_a = options.onSearchStart) === null || _a === void 0 ? void 0 : _a.call(options);
    }, [options.onSearchStart]);
    const handleSearchSuccess = useCallback((results, query) => {
        var _a;
        setLoading(false);
        setResults(results);
        setError(null);
        (_a = options.onSearchSuccess) === null || _a === void 0 ? void 0 : _a.call(options, results, query);
    }, [options.onSearchSuccess]);
    const handleSearchError = useCallback((error, query) => {
        var _a;
        setLoading(false);
        setError(error);
        (_a = options.onSearchError) === null || _a === void 0 ? void 0 : _a.call(options, error, query);
    }, [options.onSearchError]);
    const handleSearchCanceled = useCallback((query) => {
        var _a;
        setLoading(false);
        (_a = options.onSearchCanceled) === null || _a === void 0 ? void 0 : _a.call(options, query);
    }, [options.onSearchCanceled]);
    // Enhanced options with stable callbacks
    useEffect(() => {
        searchOptimizer.onSearchStart = handleSearchStart;
        searchOptimizer.onSearchSuccess = handleSearchSuccess;
        searchOptimizer.onSearchError = handleSearchError;
        searchOptimizer.onSearchCanceled = handleSearchCanceled;
    }, [searchOptimizer, handleSearchStart, handleSearchSuccess, handleSearchError, handleSearchCanceled]);
    // Handle query changes with debouncing handled by SearchOptimizer
    const handleQueryChange = useCallback((value) => {
        setQueryState(value);
        searchOptimizer.setQuery(value);
    }, [searchOptimizer]);
    // Input props with memoized handlers
    const inputProps = useMemo(() => ({
        value: query,
        onChange: (e) => handleQueryChange(e.target.value),
        'aria-label': options.ariaLabel || 'Search input',
    }), [query, handleQueryChange, options.ariaLabel]);
    // Reset function with state cleanup
    const reset = useCallback(() => {
        searchOptimizer.reset();
        setQueryState('');
        setLoading(false);
        setResults(null);
        setError(null);
    }, [searchOptimizer]);
    // Cleanup on unmount
    useEffect(() => {
        const optimizer = searchOptimizer;
        return () => {
            optimizer.cancel();
        };
    }, [searchOptimizer]);
    return {
        // State
        query,
        loading,
        results,
        error,
        // Methods
        setQuery: handleQueryChange,
        search: searchOptimizer.search,
        cancel: searchOptimizer.cancel,
        reset,
        // React-specific additions
        inputProps,
    };
}
//# sourceMappingURL=react.js.map