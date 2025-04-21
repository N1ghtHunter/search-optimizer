/**
 * Utility functions for SearchOptimizer
 */
/**
 * Creates a debounced version of a function
 * @param func - The function to debounce
 * @param delay - The delay in milliseconds
 */
export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
    };
}
/**
 * Processes the input string according to the provided options
 * @param input - The input string to process
 * @param options - Input processing options
 */
export function processInput(input, options) {
    let processedInput = input;
    if (options.trimInput) {
        processedInput = processedInput.trim();
    }
    if (options.lowercaseInput) {
        processedInput = processedInput.toLowerCase();
    }
    if (options.inputProcessor) {
        processedInput = options.inputProcessor(processedInput);
    }
    return processedInput;
}
/**
 * Determines if a search should be performed based on the current conditions
 * @param query - The current query
 * @param previousQuery - The previous query
 * @param minChars - Minimum characters required
 */
export function shouldPerformSearch(query, previousQuery, minChars) {
    // Skip if query is too short
    if (query.length < minChars) {
        return false;
    }
    // Skip if query hasn't changed
    if (query === previousQuery) {
        return false;
    }
    return true;
}
/**
 * Creates a new AbortController instance if available in the environment
 */
export function createAbortController() {
    if (typeof AbortController !== 'undefined') {
        return new AbortController();
    }
    return null;
}
//# sourceMappingURL=utils.js.map