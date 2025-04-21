/**
 * Tests for SearchOptimizer GraphQL Adapter
 */

import { createGraphQLExecutor, GraphQLAdapterOptions, GraphQLClientLike } from '../src/adapters/graphql';

describe('GraphQL Adapter', () => {
  // Mock GraphQL client
  const mockGraphQLClient: GraphQLClientLike = {
    query: jest.fn(),
  };

  // Mock GraphQL query document
  const mockQuery = `
    query SearchItems($query: String!) {
      search(query: $query) {
        id
        title
      }
    }
  `;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a SearchExecutor instance', () => {
    const options: GraphQLAdapterOptions = {
      client: mockGraphQLClient,
      query: mockQuery,
    };

    const executor = createGraphQLExecutor(options);

    expect(executor).toBeDefined();
    expect(typeof executor.execute).toBe('function');
  });

  test('should make a GraphQL query with correct variables', async () => {
    // Mock successful response
    const mockResponse = {
      data: {
        search: [
          { id: '1', title: 'Result 1' },
          { id: '2', title: 'Result 2' },
        ],
      },
    };
    (mockGraphQLClient.query as jest.Mock).mockResolvedValue(mockResponse);

    const options: GraphQLAdapterOptions = {
      client: mockGraphQLClient,
      query: mockQuery,
      queryVariableName: 'query',
    };

    const executor = createGraphQLExecutor(options);
    const results = await executor.execute('test search');

    // Check that client.query was called with the correct parameters
    expect(mockGraphQLClient.query).toHaveBeenCalledWith({
      query: mockQuery,
      variables: {
        query: 'test search',
      },
      context: undefined,
    });

    // Verify the results
    expect(results).toEqual(mockResponse.data);
  });

  test('should apply custom resultExtractor', async () => {
    // Mock successful response
    const mockResponse = {
      data: {
        search: {
          items: [
            { id: '1', title: 'Result 1' },
            { id: '2', title: 'Result 2' },
          ],
          totalCount: 2,
        },
      },
    };
    (mockGraphQLClient.query as jest.Mock).mockResolvedValue(mockResponse);

    const resultExtractor = (data: any) => data.search.items;

    const options: GraphQLAdapterOptions = {
      client: mockGraphQLClient,
      query: mockQuery,
      resultExtractor,
    };

    const executor = createGraphQLExecutor(options);
    const results = await executor.execute('test');

    // Verify the results have been transformed by the extractor
    expect(results).toEqual([
      { id: '1', title: 'Result 1' },
      { id: '2', title: 'Result 2' },
    ]);
  });

  test('should include additional variables in the query', async () => {
    // Mock successful response
    (mockGraphQLClient.query as jest.Mock).mockResolvedValue({
      data: { search: [] },
    });

    const options: GraphQLAdapterOptions = {
      client: mockGraphQLClient,
      query: mockQuery,
      additionalVariables: {
        limit: 10,
        filter: { category: 'books' },
      },
    };

    const executor = createGraphQLExecutor(options);
    await executor.execute('test');

    // Check that the additional variables were included
    expect(mockGraphQLClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        variables: {
          query: 'test',
          limit: 10,
          filter: { category: 'books' },
        },
      }),
    );
  });

  test('should handle GraphQL errors', async () => {
    // Mock error response
    const graphQLError = new Error('GraphQL error');
    (mockGraphQLClient.query as jest.Mock).mockRejectedValue(graphQLError);

    const executor = createGraphQLExecutor({
      client: mockGraphQLClient,
      query: mockQuery,
    });

    await expect(executor.execute('test')).rejects.toThrow('GraphQL error');
  });

  test('should include abort signal in the context if provided', async () => {
    // Mock successful response
    (mockGraphQLClient.query as jest.Mock).mockResolvedValue({
      data: { search: [] },
    });

    const executor = createGraphQLExecutor({
      client: mockGraphQLClient,
      query: mockQuery,
    });

    // Create an abort controller and signal
    const controller = new AbortController();
    const signal = controller.signal;

    // Execute with signal
    await executor.execute('test', signal);

    // Check that the signal was included in the context
    expect(mockGraphQLClient.query).toHaveBeenCalledWith(
      expect.objectContaining({
        context: {
          fetchOptions: {
            signal,
          },
        },
      }),
    );
  });

  test('should correctly handle non-Error objects in GraphQL errors', async () => {
    // Mock a non-Error object rejection
    (mockGraphQLClient.query as jest.Mock).mockRejectedValue('String error message');

    const executor = createGraphQLExecutor({
      client: mockGraphQLClient,
      query: mockQuery,
    });

    await expect(executor.execute('test')).rejects.toThrow('String error message');
  });
});
