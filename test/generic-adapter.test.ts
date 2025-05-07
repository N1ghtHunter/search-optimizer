import { createGenericExecutor } from '../src/adapters/generic';

describe('Generic Adapter', () => {
  // Helper function to create a mock search function
  const createMockSearchFn = (responseData = { results: ['item1', 'item2'] }, delay = 10) => {
    return jest.fn().mockImplementation((query: string, signal?: AbortSignal): Promise<any> => {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          if (signal?.aborted) {
            reject(new Error('Aborted'));
            return;
          }

          if (query === 'error') {
            reject(new Error('Search failed'));
            return;
          }

          resolve({ ...responseData, query });
        }, delay);

        if (signal) {
          signal.addEventListener('abort', () => {
            clearTimeout(timeoutId);
            reject(new Error('Aborted'));
          });
        }
      });
    });
  };

  it('should create a valid SearchExecutor', () => {
    const searchFn = createMockSearchFn();
    const executor = createGenericExecutor(searchFn);

    expect(executor).toHaveProperty('execute');
    expect(typeof executor.execute).toBe('function');
  });

  it('should forward query and signal to the search function', async () => {
    const searchFn = createMockSearchFn();
    const executor = createGenericExecutor(searchFn);

    const controller = new AbortController();
    await executor.execute('test query', controller.signal);

    expect(searchFn).toHaveBeenCalledWith('test query', controller.signal);
  });

  it('should return search function results', async () => {
    const mockData = { results: ['result1', 'result2'] };
    const searchFn = createMockSearchFn(mockData);
    const executor = createGenericExecutor(searchFn);

    const result = await executor.execute('test');

    expect(result).toEqual({ ...mockData, query: 'test' });
  });

  it('should handle search function errors', async () => {
    const searchFn = createMockSearchFn();
    const executor = createGenericExecutor(searchFn);

    await expect(executor.execute('error')).rejects.toThrow('Search failed');
  });

  it('should handle abort signals', async () => {
    const searchFn = createMockSearchFn(
      {
        results: ['result1', 'result2'],
      },
      100,
    ); // Longer delay to ensure we can abort
    const executor = createGenericExecutor(searchFn);

    const controller = new AbortController();

    // Start the search and abort it immediately
    const searchPromise = executor.execute('test', controller.signal);
    controller.abort();

    await expect(searchPromise).rejects.toThrow('Aborted');
  });

  it('should use custom error handler when provided', async () => {
    const searchFn = jest.fn().mockRejectedValue('string error');
    const errorHandler = jest.fn().mockReturnValue(new Error('Custom error'));

    const executor = createGenericExecutor(searchFn, { errorHandler });

    await expect(executor.execute('test')).rejects.toThrow('Custom error');
    expect(errorHandler).toHaveBeenCalledWith('string error');
  });

  it('should convert non-Error objects to Error in default error handling', async () => {
    const searchFn = jest.fn().mockRejectedValue('string error');
    const executor = createGenericExecutor(searchFn, { name: 'TestExecutor' });

    await expect(executor.execute('test')).rejects.toThrow('TestExecutor error: string error');
  });
});
