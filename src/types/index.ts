/**
 * SearchOptimizer Types
 * This file contains all the type definitions for the SearchOptimizer package.
 */

/**
 * Options for configuring the SearchOptimizer behavior
 */
export interface SearchOptimizerOptions<T = any> {
	/**
	 * Debounce delay in milliseconds
	 * @default 500
	 */
	debounceDelay?: number;

	/**
	 * Minimum number of characters required before triggering a search
	 * @default 3
	 */
	minChars?: number;

	/**
	 * Whether to trim the input value
	 * @default true
	 */
	trimInput?: boolean;

	/**
	 * Whether to convert the input value to lowercase
	 * @default true
	 */
	lowercaseInput?: boolean;

	/**
	 * Whether to enable request cancellation to prevent race conditions
	 * @default true
	 */
	enableCancellation?: boolean;

	/**
	 * Custom processor function to transform the input value before searching
	 * @param value The current input value
	 * @returns The processed value
	 */
	inputProcessor?: (value: string) => string;

	/**
	 * Callback fired when search starts
	 */
	onSearchStart?: () => void;

	/**
	 * Callback fired when search completes successfully
	 * @param results The search results
	 * @param query The search query that produced these results
	 */
	onSearchSuccess?: (results: T, query: string) => void;

	/**
	 * Callback fired when search fails
	 * @param error The error that occurred
	 * @param query The search query that caused the error
	 */
	onSearchError?: (error: Error, query: string) => void;

	/**
	 * Callback fired when search is canceled
	 * @param query The search query that was canceled
	 */
	onSearchCanceled?: (query: string) => void;

	/**
	 * Accessibility label for the search input (React-specific)
	 */
	ariaLabel?: string;
}

/**
 * Interface for search operation executors.
 * Implement this to add support for different request libraries.
 */
export interface SearchExecutor<T = any> {
	/**
	 * Execute the search operation
	 * @param query The search query
	 * @param signal Optional AbortSignal for request cancellation
	 * @returns A promise resolving to the search results
	 */
	execute: (query: string, signal?: AbortSignal) => Promise<T>;
}

/**
 * Factory function type for creating a SearchExecutor
 */
export type SearchExecutorFactory<T = any> = (options?: any) => SearchExecutor<T>;

/**
 * Return type of the SearchOptimizer function
 */
export interface SearchOptimizerResult<T = any> {
	/**
	 * The current search query
	 */
	query: string;

	/**
	 * Whether a search is currently in progress
	 */
	loading: boolean;

	/**
	 * Search results, if available
	 */
	results: T | null;

	/**
	 * Error from the last search, if any
	 */
	error: Error | null;

	/**
	 * Function to set a new search query
	 * @param value The new search query
	 */
	setQuery: (value: string) => void;

	/**
	 * Manually trigger a search with the current query
	 */
	search: () => Promise<void>;

	/**
	 * Cancel the current search, if any
	 */
	cancel: () => void;

	/**
	 * Reset the search state
	 */
	reset: () => void;

	/**
	 * Callback fired when search starts
	 */
	onSearchStart?: () => void;

	/**
	 * Callback fired when search completes successfully
	 */
	onSearchSuccess?: (results: T, query: string) => void;

	/**
	 * Callback fired when search fails
	 */
	onSearchError?: (error: Error, query: string) => void;

	/**
	 * Callback fired when search is canceled
	 */
	onSearchCanceled?: (query: string) => void;
}
