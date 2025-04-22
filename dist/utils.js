export function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(context, args), delay);
    };
}
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
export function shouldPerformSearch(query, previousQuery, minChars) {
    if (query.length < minChars) {
        return false;
    }
    if (query === previousQuery) {
        return false;
    }
    return true;
}
export function createAbortController() {
    if (typeof AbortController !== 'undefined') {
        return new AbortController();
    }
    return null;
}
