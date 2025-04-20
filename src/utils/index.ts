/**
 * Utility functions for TypeAhead
 */

/**
 * Creates a debounced function that delays invoking the provided function
 * until after `delay` milliseconds have elapsed since the last time it was invoked.
 *
 * @param func - The function to debounce
 * @param delay - The number of milliseconds to delay
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: any, ...args: Parameters<T>): void {
    const context = this;

    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      func.apply(context, args);
    }, delay);
  };
}

/**
 * Processes the input string according to configuration options
 *
 * @param value - The input string to process
 * @param options - Processing options
 * @returns The processed string
 */
export function processInput(
  value: string,
  {
    trimInput = true,
    lowercaseInput = true,
    inputProcessor,
  }: {
    trimInput?: boolean;
    lowercaseInput?: boolean;
    inputProcessor?: (value: string) => string;
  },
): string {
  let processedValue = value;

  if (trimInput) {
    processedValue = processedValue.trim();
  }

  if (lowercaseInput) {
    processedValue = processedValue.toLowerCase();
  }

  if (inputProcessor) {
    processedValue = inputProcessor(processedValue);
  }

  return processedValue;
}

/**
 * Determines if a search should be performed based on the given query and options
 *
 * @param query - The search query
 * @param previousQuery - The previous search query
 * @param minChars - Minimum number of characters required to perform a search
 * @returns Boolean indicating whether a search should be performed
 */
export function shouldPerformSearch(query: string, previousQuery: string, minChars: number): boolean {
  // Skip if query is too short
  if (query.length < minChars) {
    return false;
  }

  // Skip if query is the same as previous
  if (query === previousQuery) {
    return false;
  }

  return true;
}

/**
 * Creates an AbortController for canceling requests
 *
 * @returns A new AbortController instance
 */
export function createAbortController(): AbortController | null {
  // Check if AbortController is available (it's a newer API)
  if (typeof AbortController !== 'undefined') {
    return new AbortController();
  }

  return null;
}
