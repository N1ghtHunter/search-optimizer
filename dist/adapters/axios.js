/**
 * Axios adapter for SearchOptimizer
 * Allows using the Axios HTTP client with SearchOptimizer
 */
/**
 * Creates a SearchExecutor implementation using Axios
 *
 * @param options Configuration options for the axios adapter
 * @returns A SearchExecutor implementation
 */
export function createAxiosExecutor(options) {
    const { axios, baseUrl, queryParam = 'q', axiosOptions = {} } = options;
    // Keep track of the cancel function from axios
    let cancelFn = null;
    return {
        execute: async (query, signal) => {
            // Set up AbortController to cancel axios request when external signal is aborted
            if (signal) {
                signal.addEventListener('abort', () => {
                    if (cancelFn)
                        cancelFn('Request was canceled');
                });
            }
            // Get cancel token if available
            let cancelToken;
            if (axios.CancelToken) {
                const source = axios.CancelToken.source();
                cancelToken = source.token;
                cancelFn = source.cancel;
            }
            // Create URL parameters
            const params = {};
            params[queryParam] = query;
            try {
                const response = await axios.get(baseUrl, {
                    ...axiosOptions,
                    params,
                    cancelToken,
                });
                return response.data;
            }
            catch (error) {
                // Rethrow the error but make sure it's a proper Error object
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error(String(error));
            }
        },
    };
}
//# sourceMappingURL=axios.js.map