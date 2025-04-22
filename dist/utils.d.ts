import type { SearchOptimizerOptions } from './types/index';
export declare function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void;
export declare function processInput(input: string, options: Pick<SearchOptimizerOptions<any>, 'trimInput' | 'lowercaseInput' | 'inputProcessor'>): string;
export declare function shouldPerformSearch(query: string, previousQuery: string, minChars: number): boolean;
export declare function createAbortController(): AbortController | null;
