/**
 * GraphQL adapter for SearchOptimizer
 * Allows using GraphQL clients like Apollo with SearchOptimizer
 */
/**
 * Creates a SearchExecutor implementation using a GraphQL client
 *
 * @param options Configuration options for the GraphQL adapter
 * @returns A SearchExecutor implementation
 */
export function createGraphQLExecutor(options) {
    const { client, query, queryVariableName = 'query', resultExtractor = data => data, additionalVariables = {}, } = options;
    return {
        execute: async (searchQuery, signal) => {
            // Prepare variables with the search query
            const variables = {
                ...additionalVariables,
                [queryVariableName]: searchQuery,
            };
            // Prepare context with AbortSignal if provided
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
//# sourceMappingURL=graphql.js.map