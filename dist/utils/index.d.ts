/**
 * Utility functions for SearchOptimizer
 */
/**
 * Creates a debounced function that delays invoking the provided function
 * until after `delay` milliseconds have elapsed since the last time it was invoked.
 *
 * @param func - The function to debounce
 * @param delay - The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void;
/**
 * Processes the input string according to configuration options
 *
 * @param value - The input string to process
 * @param options - Processing options
 * @returns The processed string
 */
export declare function processInput(value: string, { trimInput, lowercaseInput, inputProcessor, }: {
    trimInput?: boolean;
    lowercaseInput?: boolean;
    inputProcessor?: (value: string) => string;
}): string;
/**
 * Determines if a search should be performed based on the given query and options
 *
 * @param query - The search query
 * @param previousQuery - The previous search query
 * @param minChars - Minimum number of characters required to perform a search
 * @returns Boolean indicating whether a search should be performed
 */
export declare function shouldPerformSearch(query: string, previousQuery: string, minChars: number): boolean;
/**
 * Creates an AbortController for canceling requests
 *
 * @returns A new AbortController instance
 */
export declare function createAbortController(): AbortController | null;
