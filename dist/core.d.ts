/**
 * SearchOptimizer Core Implementation
 * A framework-agnostic solution for optimized search-as-you-type functionality
 */
import { SearchOptimizerOptions, SearchExecutor, SearchOptimizerResult } from './types/index';
/**
 * Creates a SearchOptimizer instance that optimizes search-as-you-type functionality
 * by implementing debouncing, minimum character checks, and request cancellation.
 *
 * @param executor - The search executor implementation
 * @param options - Configuration options for SearchOptimizer
 * @returns A SearchOptimizerResult object with methods and state
 */
export declare function createSearchOptimizer<T = any>(executor: SearchExecutor<T>, options?: SearchOptimizerOptions<T>): SearchOptimizerResult<T>;
