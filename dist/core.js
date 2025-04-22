import { debounce, processInput, shouldPerformSearch, createAbortController } from './utils';
export function createSearchOptimizer(executor, options = {}) {
    const { debounceDelay = 500, minChars = 3, trimInput = true, lowercaseInput = true, enableCancellation = true, inputProcessor, onSearchStart: initialOnSearchStart, onSearchSuccess: initialOnSearchSuccess, onSearchError: initialOnSearchError, onSearchCanceled: initialOnSearchCanceled, } = options;
    let currentQuery = '';
    let previousQuery = '';
    let searchResults = null;
    let searchError = null;
    let isLoading = false;
    let currentAbortController = null;
    let onSearchStart = initialOnSearchStart;
    let onSearchSuccess = initialOnSearchSuccess;
    let onSearchError = initialOnSearchError;
    let onSearchCanceled = initialOnSearchCanceled;
    const cancelCurrentRequest = () => {
        if (enableCancellation && currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
            if (onSearchCanceled) {
                onSearchCanceled(currentQuery);
            }
        }
    };
    const executeSearch = async (query) => {
        if (!shouldPerformSearch(query, previousQuery, minChars)) {
            return;
        }
        isLoading = true;
        searchError = null;
        previousQuery = query;
        if (onSearchStart) {
            onSearchStart();
        }
        cancelCurrentRequest();
        if (enableCancellation) {
            currentAbortController = createAbortController();
        }
        const requestController = currentAbortController;
        const requestQuery = query;
        try {
            const results = await executor.execute(query, requestController === null || requestController === void 0 ? void 0 : requestController.signal);
            if ((!requestController || !requestController.signal.aborted) && requestQuery === currentQuery) {
                searchResults = results;
                isLoading = false;
                if (onSearchSuccess) {
                    onSearchSuccess(results, query);
                }
            }
        }
        catch (error) {
            if (error instanceof Error && error.name !== 'AbortError' && requestQuery === currentQuery) {
                searchError = error;
                isLoading = false;
                if (onSearchError) {
                    onSearchError(error, query);
                }
            }
        }
        finally {
            if (currentAbortController === requestController) {
                currentAbortController = null;
            }
        }
    };
    const debouncedSearch = debounce(executeSearch, debounceDelay);
    const setQuery = (value) => {
        const processedValue = processInput(value, {
            trimInput,
            lowercaseInput,
            inputProcessor,
        });
        currentQuery = processedValue;
        if (processedValue.length < minChars) {
            if (enableCancellation) {
                cancelCurrentRequest();
            }
            return;
        }
        debouncedSearch(processedValue);
    };
    const search = async () => {
        await executeSearch(currentQuery);
    };
    const reset = () => {
        cancelCurrentRequest();
        currentQuery = '';
        previousQuery = '';
        searchResults = null;
        searchError = null;
        isLoading = false;
    };
    const instance = {
        get query() {
            return currentQuery;
        },
        get loading() {
            return isLoading;
        },
        get results() {
            return searchResults;
        },
        get error() {
            return searchError;
        },
        setQuery,
        search,
        cancel: cancelCurrentRequest,
        reset,
        get onSearchStart() {
            return onSearchStart;
        },
        set onSearchStart(callback) {
            onSearchStart = callback;
        },
        get onSearchSuccess() {
            return onSearchSuccess;
        },
        set onSearchSuccess(callback) {
            onSearchSuccess = callback;
        },
        get onSearchError() {
            return onSearchError;
        },
        set onSearchError(callback) {
            onSearchError = callback;
        },
        get onSearchCanceled() {
            return onSearchCanceled;
        },
        set onSearchCanceled(callback) {
            onSearchCanceled = callback;
        },
    };
    return instance;
}
