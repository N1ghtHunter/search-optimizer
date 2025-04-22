export function debounce(func, delay) {
    let timeoutId = null;
    return function (...args) {
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
export function processInput(value, { trimInput = true, lowercaseInput = true, inputProcessor, }) {
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
