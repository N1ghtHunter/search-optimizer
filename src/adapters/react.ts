/**
 * React Hook Adapter for SearchOptimizer
 * Provides a convenient way to use SearchOptimizer in React applications with
 * optimized re-renders and type safety.
 *
 * @packageDocumentation
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createSearchOptimizer } from '../core';
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
export function useSearchOptimizer<T = any>(
  executor: SearchExecutor<T>,
  options: SearchOptimizerOptions<T> = {},
): SearchOptimizerHookResult<T> {
  if (!executor) {
    throw new Error('SearchExecutor is required');
  }

  // Create SearchOptimizer instance with stable reference
  const searchOptimizerRef = useRef<SearchOptimizerResult<T> | null>(null);
  if (!searchOptimizerRef.current) {
    searchOptimizerRef.current = createSearchOptimizer<T>(executor, options);
  }
  const searchOptimizer = searchOptimizerRef.current;

  // State for component re-rendering
  const [query, setQueryState] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleSearchStart = useCallback(() => {
    setLoading(true);
    options.onSearchStart?.();
  }, [options.onSearchStart]);

  const handleSearchSuccess = useCallback(
    (results: T, query: string) => {
      setLoading(false);
      setResults(results);
      setError(null);
      options.onSearchSuccess?.(results, query);
    },
    [options.onSearchSuccess],
  );

  const handleSearchError = useCallback(
    (error: Error, query: string) => {
      setLoading(false);
      setError(error);
      options.onSearchError?.(error, query);
    },
    [options.onSearchError],
  );

  const handleSearchCanceled = useCallback(
    (query: string) => {
      setLoading(false);
      options.onSearchCanceled?.(query);
    },
    [options.onSearchCanceled],
  );

  // Enhanced options with stable callbacks
  useEffect(() => {
    searchOptimizer.onSearchStart = handleSearchStart;
    searchOptimizer.onSearchSuccess = handleSearchSuccess;
    searchOptimizer.onSearchError = handleSearchError;
    searchOptimizer.onSearchCanceled = handleSearchCanceled;
  }, [searchOptimizer, handleSearchStart, handleSearchSuccess, handleSearchError, handleSearchCanceled]);

  // Handle query changes with debouncing handled by SearchOptimizer
  const handleQueryChange = useCallback(
    (value: string) => {
      setQueryState(value);
      searchOptimizer.setQuery(value);
    },
    [searchOptimizer],
  );

  // Input props with memoized handlers
  const inputProps = useMemo<SearchInputProps>(
    () => ({
      value: query,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleQueryChange(e.target.value),
      'aria-label': options.ariaLabel || 'Search input',
    }),
    [query, handleQueryChange, options.ariaLabel],
  );

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

// For backward compatibility
/** @deprecated Use useSearchOptimizer instead */
export const useTypeAhead = useSearchOptimizer;
