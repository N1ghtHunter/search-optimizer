export function createFetchExecutor(options) {
    const { baseUrl, queryParam = 'q', fetchOptions = {}, responseTransformer = response => response.json() } = options;
    return {
        execute: async (query, signal) => {
            const url = new URL(baseUrl);
            url.searchParams.append(queryParam, query);
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
                if (error instanceof Error) {
                    throw error;
                }
                throw new Error(String(error));
            }
        },
    };
}
