/**
 * GraphQL adapter for SearchOptimizer
 * Allows using GraphQL clients like Apollo with SearchOptimizer
 */

import { SearchExecutor } from '../types';

export interface GraphQLClientLike {
	/**
	 * Method to execute a GraphQL query
	 */
	query<T = any>(options: {
		query: string | any;
		variables?: Record<string, any>;
		context?: any;
	}): Promise<{ data: T }>;
}

export interface GraphQLAdapterOptions {
	/**
	 * GraphQL client instance
	 */
	client: GraphQLClientLike;

	/**
	 * GraphQL query document
	 * Can be a string or a parsed GraphQL document (for Apollo, etc.)
	 */
	query: string | any;

	/**
	 * Name of the variable to pass the search term to
	 * @default 'query'
	 */
	queryVariableName?: string;

	/**
	 * Function to extract the search results from the GraphQL response
	 * @param data The GraphQL response data
	 * @returns The search results
	 */
	resultExtractor?: (data: any) => any;

	/**
	 * Additional variables to include with every GraphQL request
	 */
	additionalVariables?: Record<string, any>;
}

/**
 * Creates a SearchExecutor implementation using a GraphQL client
 *
 * @param options Configuration options for the GraphQL adapter
 * @returns A SearchExecutor implementation
 */
export function createGraphQLExecutor<T = any>(options: GraphQLAdapterOptions): SearchExecutor<T> {
	const {
		client,
		query,
		queryVariableName = 'query',
		resultExtractor = (data) => data,
		additionalVariables = {},
	} = options;

	return {
		execute: async (searchQuery: string, signal?: AbortSignal): Promise<T> => {
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
			} catch (error) {
				if (error instanceof Error) {
					throw error;
				}
				throw new Error(String(error));
			}
		},
	};
}
