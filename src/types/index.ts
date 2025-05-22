/**
 * SearchOptimizer Types
 * This file contains all the type definitions for the SearchOptimizer package.
 *
 * @packageDocumentation
 * @example
 * ```typescript
 * import { SearchOptimizer } from 'search-optimizer';
 *
 * const { query, results, loading, setQuery } = SearchOptimizer({
 *   debounceDelay: 300,
 *   minChars: 2,
 *   onSearchSuccess: (results) => console.log('Search completed:', results)
 * });
 * ```
 */

/**
 * Options for configuring the SearchOptimizer behavior.
 * These options allow you to customize how the search behaves, including
 * debouncing, input processing, and event handling.
 *
 * @template T The type of search results returned by your search function
 *
 * @example
 * ```typescript
 * const options: SearchOptimizerOptions<User[]> = {
 *   debounceDelay: 300,
 *   minChars: 2,
 *   trimInput: true,
 *   inputProcessor: (value) => value.replace(/[^\w\s]/g, ''),
 *   onSearchSuccess: (users) => updateUserList(users)
 * };
 * ```
 */
export interface SearchOptimizerOptions<T = any> {
  /**
   * Debounce delay in milliseconds.
   * This prevents excessive API calls by waiting for the user to stop typing.
   *
   * @default 500
   * @example
   * ```typescript
   * // Wait 300ms after user stops typing before searching
   * debounceDelay: 300
   * ```
   */
  debounceDelay?: number;

  /**
   * Minimum number of characters required before triggering a search.
   * This helps prevent unnecessary API calls for very short queries.
   *
   * @default 3
   * @example
   * ```typescript
   * // Only search when user types at least 2 characters
   * minChars: 2
   * ```
   */
  minChars?: number;

  /**
   * Whether to trim whitespace from the input value.
   * This helps prevent searches with just spaces.
   *
   * @default true
   * @example
   * ```typescript
   * // Don't trim input, allowing searches with leading/trailing spaces
   * trimInput: false
   * ```
   */
  trimInput?: boolean;

  /**
   * Whether to convert the input value to lowercase.
   * This helps with case-insensitive searching.
   *
   * @default true
   * @example
   * ```typescript
   * // Keep original case for case-sensitive searching
   * lowercaseInput: false
   * ```
   */
  lowercaseInput?: boolean;

  /**
   * Whether to enable request cancellation.
   * When true, previous in-flight requests are cancelled when a new search starts.
   * This prevents race conditions where older results might override newer ones.
   *
   * @default true
   * @example
   * ```typescript
   * // Disable cancellation if your API doesn't support it
   * enableCancellation: false
   * ```
   */
  enableCancellation?: boolean;

  /**
   * Custom processor function to transform the input value before searching.
   * Use this for custom input normalization or filtering.
   *
   * @param value The current input value
   * @returns The processed value
   * @example
   * ```typescript
   * // Remove special characters and normalize spaces
   * inputProcessor: (value) => value.replace(/[^\w\s]/g, '').replace(/\s+/g, ' ')
   * ```
   */
  inputProcessor?: (value: string) => string;

  /**
   * Callback fired when search starts.
   * Use this to show loading indicators or prepare UI for results.
   *
   * @example
   * ```typescript
   * onSearchStart: () => setLoading(true)
   * ```
   */
  onSearchStart?: () => void;

  /**
   * Callback fired when search completes successfully.
   * Use this to update your UI with the search results.
   *
   * @param results The search results
   * @param query The search query that produced these results
   * @example
   * ```typescript
   * onSearchSuccess: (users, query) => {
   *   setResults(users);
   *   setLastQuery(query);
   * }
   * ```
   */
  onSearchSuccess?: (results: T, query: string) => void;

  /**
   * Callback fired when search fails.
   * Use this to handle and display errors to the user.
   *
   * @param error The error that occurred
   * @param query The search query that caused the error
   * @example
   * ```typescript
   * onSearchError: (error, query) => {
   *   showError(`Failed to search for "${query}": ${error.message}`);
   * }
   * ```
   */
  onSearchError?: (error: Error, query: string) => void;

  /**
   * Callback fired when search is canceled.
   * Use this to handle UI updates when a search is cancelled.
   *
   * @param query The search query that was canceled
   * @example
   * ```typescript
   * onSearchCanceled: (query) => {
   *   console.log(`Search for "${query}" was cancelled`);
   * }
   * ```
   */
  onSearchCanceled?: (query: string) => void;

  /**
   * Accessibility label for the search input (React-specific).
   * This helps screen readers understand the purpose of the input.
   *
   * @example
   * ```typescript
   * ariaLabel: "Search for users"
   * ```
   */
  ariaLabel?: string;
}

/**
 * Interface for search operation executors.
 * Implement this to add support for different request libraries or search backends.
 *
 * @template T The type of search results returned by the executor
 *
 * @example
 * ```typescript
 * class AxiosSearchExecutor implements SearchExecutor<User[]> {
 *   async execute(query: string, signal?: AbortSignal): Promise<User[]> {
 *     const response = await axios.get('/api/users/search', {
 *       params: { q: query },
 *       signal
 *     });
 *     return response.data;
 *   }
 * }
 * ```
 */
export interface SearchExecutor<T = any> {
  /**
   * Execute the search operation.
   * This method should handle the actual API call or search logic.
   *
   * @param query The search query
   * @param signal Optional AbortSignal for request cancellation
   * @returns A promise resolving to the search results
   * @throws {Error} If the search operation fails
   */
  execute: (query: string, signal?: AbortSignal) => Promise<T>;
}

/**
 * Factory function type for creating a SearchExecutor.
 * Use this to create executors with different configurations.
 *
 * @template T The type of search results returned by the executor
 *
 * @example
 * ```typescript
 * const createAxiosExecutor: SearchExecutorFactory<User[]> = (config) => {
 *   return {
 *     execute: async (query, signal) => {
 *       const response = await axios.get(config.endpoint, {
 *         params: { q: query },
 *         signal
 *       });
 *       return response.data;
 *     }
 *   };
 * };
 * ```
 */
export type SearchExecutorFactory<T = any> = (options?: any) => SearchExecutor<T>;

/**
 * Return type of the SearchOptimizer function.
 * This object provides the current search state and methods to control the search.
 *
 * @template T The type of search results
 *
 * @example
 * ```typescript
 * const {
 *   query,        // Current search query
 *   results,      // Latest search results
 *   loading,      // Whether a search is in progress
 *   setQuery,     // Function to update the query
 *   search,       // Function to manually trigger search
 *   cancel,       // Function to cancel current search
 *   reset         // Function to reset search state
 * } = SearchOptimizer<User[]>(options);
 * ```
 */
export interface SearchOptimizerResult<T = any> {
  /**
   * The current search query.
   * This is automatically updated when setQuery is called.
   */
  query: string;

  /**
   * Whether a search is currently in progress.
   * Use this to show loading indicators.
   */
  loading: boolean;

  /**
   * Search results, if available.
   * Will be null if no search has been performed or if the last search failed.
   */
  results: T | null;

  /**
   * Error from the last search, if any.
   * Will be null if no error occurred.
   */
  error: Error | null;

  /**
   * Function to set a new search query.
   * This will automatically trigger a search if the query meets the minimum length requirement.
   *
   * @param value The new search query
   * @example
   * ```typescript
   * // Update query and trigger search
   * setQuery('john');
   * ```
   */
  setQuery: (value: string) => void;

  /**
   * Manually trigger a search with the current query.
   * Useful when you want to force a search regardless of the current query.
   *
   * @example
   * ```typescript
   * // Force a search with current query
   * await search();
   * ```
   */
  search: () => Promise<void>;

  /**
   * Cancel the current search, if any.
   * This will trigger the onSearchCanceled callback if one is provided.
   *
   * @example
   * ```typescript
   * // Cancel any in-progress search
   * cancel();
   * ```
   */
  cancel: () => void;

  /**
   * Reset the search state.
   * This clears the query, results, and error state.
   *
   * @example
   * ```typescript
   * // Reset everything to initial state
   * reset();
   * ```
   */
  reset: () => void;

  /**
   * Callback fired when search starts.
   * @see SearchOptimizerOptions.onSearchStart
   */
  onSearchStart?: () => void;

  /**
   * Callback fired when search completes successfully.
   * @see SearchOptimizerOptions.onSearchSuccess
   */
  onSearchSuccess?: (results: T, query: string) => void;

  /**
   * Callback fired when search fails.
   * @see SearchOptimizerOptions.onSearchError
   */
  onSearchError?: (error: Error, query: string) => void;

  /**
   * Callback fired when search is canceled.
   * @see SearchOptimizerOptions.onSearchCanceled
   */
  onSearchCanceled?: (query: string) => void;
}
