/**
 * SearchOptimizer
 * An optimized, framework-agnostic solution for handling search-as-you-type functionality
 *
 * This package helps reduce unnecessary HTTP requests, prevent race conditions,
 * and improve user experience with search-as-you-type inputs.
 */
export { createSearchOptimizer } from './core';
export type { SearchExecutor, SearchOptimizerOptions, SearchOptimizerResult } from './types/index';
export * from './types';
export { createFetchExecutor } from './adapters/fetch';
export { createAxiosExecutor } from './adapters/axios';
export { createGraphQLExecutor } from './adapters/graphql';
export { useSearchOptimizer } from './adapters/react';
export { debounce, processInput, shouldPerformSearch } from './utils';
