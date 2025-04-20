/**
 * SearchOptimizer
 * An optimized, framework-agnostic solution for handling search-as-you-type functionality
 *
 * This package helps reduce unnecessary HTTP requests, prevent race conditions,
 * and improve user experience with search-as-you-type inputs.
 */

// Export core functionality
export { createSearchOptimizer } from './core';
export type { SearchExecutor, SearchOptimizerOptions, SearchOptimizerResult } from './types/index';

// Export types
export * from './types';

// Export adapters
export { createFetchExecutor } from './adapters/fetch';
export { createAxiosExecutor } from './adapters/axios';
export { createGraphQLExecutor } from './adapters/graphql';
export { useSearchOptimizer, useTypeAhead } from './adapters/react';

// Export utilities
export { debounce, processInput, shouldPerformSearch } from './utils';
