/**
 * Tests for SearchOptimizer Axios Adapter
 */

import { createAxiosExecutor, AxiosAdapterOptions, AxiosLike } from '../src/adapters/axios';

describe('Axios Adapter', () => {
  // Mock Axios instance
  const mockAxios: AxiosLike = {
    get: jest.fn(),
    CancelToken: {
      source: jest.fn().mockReturnValue({
        token: 'mock-token',
        cancel: jest.fn(),
      }),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should create a SearchExecutor instance', () => {
    const options: AxiosAdapterOptions = {
      axios: mockAxios,
      baseUrl: 'https://api.example.com/search',
    };

    const executor = createAxiosExecutor(options);

    expect(executor).toBeDefined();
    expect(typeof executor.execute).toBe('function');
  });

  test('should make an axios request with the correct URL and parameters', async () => {
    // Mock successful response
    (mockAxios.get as jest.Mock).mockResolvedValue({
      data: ['result1', 'result2'],
    });

    const options: AxiosAdapterOptions = {
      axios: mockAxios,
      baseUrl: 'https://api.example.com/search',
      queryParam: 'query',
    };

    const executor = createAxiosExecutor(options);
    const results = await executor.execute('test search');

    // Check that axios.get was called with the correct URL and parameters
    expect(mockAxios.get).toHaveBeenCalledWith(
      'https://api.example.com/search',
      expect.objectContaining({
        params: {
          query: 'test search',
        },
        cancelToken: 'mock-token',
      }),
    );

    // Verify the results
    expect(results).toEqual(['result1', 'result2']);
  });

  test('should apply custom axiosOptions', async () => {
    // Mock successful response
    (mockAxios.get as jest.Mock).mockResolvedValue({
      data: ['result1', 'result2'],
    });

    const options: AxiosAdapterOptions = {
      axios: mockAxios,
      baseUrl: 'https://api.example.com/search',
      axiosOptions: {
        headers: {
          Authorization: 'Bearer token123',
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      },
    };

    const executor = createAxiosExecutor(options);
    await executor.execute('test');

    // Check that axios.get was called with the custom options
    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: {
          Authorization: 'Bearer token123',
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }),
    );
  });

  test('should handle axios errors', async () => {
    // Mock error response
    const axiosError = new Error('Request failed');
    (mockAxios.get as jest.Mock).mockRejectedValue(axiosError);

    const executor = createAxiosExecutor({
      axios: mockAxios,
      baseUrl: 'https://api.example.com/search',
    });

    await expect(executor.execute('test')).rejects.toThrow('Request failed');
  });

  test('should create a cancel token if available', async () => {
    // Mock successful response
    (mockAxios.get as jest.Mock).mockResolvedValue({
      data: ['result1', 'result2'],
    });

    const executor = createAxiosExecutor({
      axios: mockAxios,
      baseUrl: 'https://api.example.com/search',
    });

    await executor.execute('test');

    // Check that cancel token source was created
    expect(mockAxios.CancelToken?.source).toHaveBeenCalled();
  });

  test('should handle abort signal to cancel axios request', async () => {
    // Mock successful response
    (mockAxios.get as jest.Mock).mockResolvedValue({
      data: ['result1', 'result2'],
    });

    const cancelSource = {
      token: 'mock-token',
      cancel: jest.fn(),
    };
    (mockAxios.CancelToken?.source as jest.Mock).mockReturnValue(cancelSource);

    const executor = createAxiosExecutor({
      axios: mockAxios,
      baseUrl: 'https://api.example.com/search',
    });

    // Create an abort controller and signal
    const controller = new AbortController();
    const signal = controller.signal;

    // Start the request
    const promise = executor.execute('test', signal);

    // Simulate aborting the request
    controller.abort();

    // Verify that the axios cancel function was called
    expect(cancelSource.cancel).toHaveBeenCalledWith('Request was canceled');

    // Complete the promise
    await promise;
  });

  test('should correctly handle non-Error objects in axios errors', async () => {
    // Mock a non-Error object rejection (which can happen in Axios)
    (mockAxios.get as jest.Mock).mockRejectedValue('String error message');

    const executor = createAxiosExecutor({
      axios: mockAxios,
      baseUrl: 'https://api.example.com/search',
    });

    await expect(executor.execute('test')).rejects.toThrow('String error message');
  });

  test('should work with axios instances without CancelToken', async () => {
    // Create mock axios without CancelToken
    const axiosWithoutCancel: AxiosLike = {
      get: jest.fn().mockResolvedValue({
        data: ['result1', 'result2'],
      }),
    };

    const executor = createAxiosExecutor({
      axios: axiosWithoutCancel,
      baseUrl: 'https://api.example.com/search',
    });

    const results = await executor.execute('test');

    // Should still make the request without a cancel token
    expect(axiosWithoutCancel.get).toHaveBeenCalledWith(
      'https://api.example.com/search',
      expect.objectContaining({
        params: {
          q: 'test',
        },
      }),
    );

    expect(results).toEqual(['result1', 'result2']);
  });
});
