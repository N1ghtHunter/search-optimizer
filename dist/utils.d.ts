/**
 * Utility functions for SearchOptimizer
 */
import type { SearchOptimizerOptions } from './types/index';
/**
 * Creates a debounced version of a function
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 */
export declare function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void;
/**
 * Processes the input string according to the provided options
 * @param input - The input string to process
 * @param options - Input processing options
 */
export declare function processInput(input: string, options: Pick<SearchOptimizerOptions<any>, 'trimInput' | 'lowercaseInput' | 'inputProcessor'>): string;
/**
 * Determines if a search should be performed based on the current conditions
 * @param query - The current query
 * @param previousQuery - The previous query
 * @param minChars - Minimum characters required
 */
export declare function shouldPerformSearch(query: string, previousQuery: string, minChars: number): boolean;
/**
 * Creates a new AbortController instance if available in the environment
 */
export declare function createAbortController(): AbortController | null;
