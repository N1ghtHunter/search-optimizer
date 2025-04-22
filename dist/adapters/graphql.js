export function createGraphQLExecutor(options) {
    const { client, query, queryVariableName = 'query', resultExtractor = data => data, additionalVariables = {}, } = options;
    return {
        execute: async (searchQuery, signal) => {
            const variables = {
                ...additionalVariables,
                [queryVariableName]: searchQuery,
            };
            const context = signal ? { fetchOptions: { signal } } : undefined;
            try {
                const response = await client.query({
                    query,
                    variables,
                    context,
                });
                return resultExtractor(response.data);
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
