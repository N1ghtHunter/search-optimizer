/**
 * SearchOptimizer Core Implementation
 * A framework-agnostic solution for optimized search-as-you-type functionality
 */
import { debounce, processInput, shouldPerformSearch, createAbortController } from './utils';
/**
 * Creates a SearchOptimizer instance that optimizes search-as-you-type functionality
 * by implementing debouncing, minimum character checks, and request cancellation.
 *
 * @param executor - The search executor implementation
 * @param options - Configuration options for SearchOptimizer
 * @returns A SearchOptimizerResult object with methods and state
 */
export function createSearchOptimizer(executor, options = {}) {
    // Extract and apply default options
    const { debounceDelay = 500, minChars = 3, trimInput = true, lowercaseInput = true, enableCancellation = true, inputProcessor, onSearchStart: initialOnSearchStart, onSearchSuccess: initialOnSearchSuccess, onSearchError: initialOnSearchError, onSearchCanceled: initialOnSearchCanceled, } = options;
    // Internal state
    let currentQuery = '';
    let previousQuery = '';
    let searchResults = null;
    let searchError = null;
    let isLoading = false;
    let currentAbortController = null;
    // Callback references that can be updated
    let onSearchStart = initialOnSearchStart;
    let onSearchSuccess = initialOnSearchSuccess;
    let onSearchError = initialOnSearchError;
    let onSearchCanceled = initialOnSearchCanceled;
    /**
     * Cancels the current search request if one is in progress
     */
    const cancelCurrentRequest = () => {
        if (enableCancellation && currentAbortController) {
            currentAbortController.abort();
            currentAbortController = null;
            if (onSearchCanceled) {
                onSearchCanceled(currentQuery);
            }
        }
    };
    /**
     * Executes a search with the given query
     */
    const executeSearch = async (query) => {
        // Skip search if conditions aren't met
        if (!shouldPerformSearch(query, previousQuery, minChars)) {
            return;
        }
        // Update state and notify listeners
        isLoading = true;
        searchError = null;
        previousQuery = query;
        if (onSearchStart) {
            onSearchStart();
        }
        // Cancel any existing request
        cancelCurrentRequest();
        // Create a new abort controller for this request if enabled
        if (enableCancellation) {
            currentAbortController = createAbortController();
        }
        // Store a reference to the controller and query for this specific request
        const requestController = currentAbortController;
        const requestQuery = query;
        try {
            // Execute the search
            const results = await executor.execute(query, requestController === null || requestController === void 0 ? void 0 : requestController.signal);
            // Only update state if this request wasn't canceled and it's still the latest request
            if ((!requestController || !requestController.signal.aborted) && requestQuery === currentQuery) {
                searchResults = results;
                isLoading = false;
                if (onSearchSuccess) {
                    onSearchSuccess(results, query);
                }
            }
        }
        catch (error) {
            // Only update state if this request wasn't canceled or if it's an actual error
            // and if it's still the latest request
            if (error instanceof Error && error.name !== 'AbortError' && requestQuery === currentQuery) {
                searchError = error;
                isLoading = false;
                if (onSearchError) {
                    onSearchError(error, query);
                }
            }
        }
        finally {
            // Clear the abort controller reference only if it's still the one we created
            if (currentAbortController === requestController) {
                currentAbortController = null;
            }
        }
    };
    // Create a debounced version of the search function
    const debouncedSearch = debounce(executeSearch, debounceDelay);
    /**
     * Sets a new search query and triggers a debounced search
     */
    const setQuery = (value) => {
        // Process the input according to options
        const processedValue = processInput(value, {
            trimInput,
            lowercaseInput,
            inputProcessor,
        });
        // Update the current query
        currentQuery = processedValue;
        // Skip search for empty or short queries
        if (processedValue.length < minChars) {
            if (enableCancellation) {
                cancelCurrentRequest();
            }
            return;
        }
        // Trigger the debounced search
        debouncedSearch(processedValue);
    };
    /**
     * Immediately executes a search with the current query, bypassing debounce
     */
    const search = async () => {
        await executeSearch(currentQuery);
    };
    /**
     * Resets the search state
     */
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
//# sourceMappingURL=core.js.map