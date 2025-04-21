/**
 * Fetch adapter for SearchOptimizer
 * Allows using the Fetch API with SearchOptimizer
 */
/**
 * Creates a SearchExecutor implementation using the Fetch API
 *
 * @param options Configuration options for the fetch adapter
 * @returns A SearchExecutor implementation
 */
export function createFetchExecutor(options) {
    const { baseUrl, queryParam = 'q', fetchOptions = {}, responseTransformer = response => response.json() } = options;
    return {
        execute: async (query, signal) => {
            // Create URL with parameters
            const url = new URL(baseUrl);
            url.searchParams.append(queryParam, query);
            // Add the abort signal to the fetch options
            const requestOptions = {
                ...fetchOptions,
                signal,
            };
            try {
                const response = await fetch(url.toString(), requestOptions);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return await responseTransformer(response);
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
//# sourceMappingURL=fetch.js.map