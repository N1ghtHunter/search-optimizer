import { SearchOptimizerOptions, SearchExecutor, SearchOptimizerResult } from './types/index';
export declare function createSearchOptimizer<T = any>(executor: SearchExecutor<T>, options?: SearchOptimizerOptions<T>): SearchOptimizerResult<T>;
