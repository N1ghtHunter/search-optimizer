export declare function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void;
export declare function processInput(value: string, { trimInput, lowercaseInput, inputProcessor, }: {
    trimInput?: boolean;
    lowercaseInput?: boolean;
    inputProcessor?: (value: string) => string;
}): string;
export declare function shouldPerformSearch(query: string, previousQuery: string, minChars: number): boolean;
export declare function createAbortController(): AbortController | null;
