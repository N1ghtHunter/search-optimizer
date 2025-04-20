/**
 * Tests for TypeAhead Fetch Adapter
 */

import { createFetchExecutor, FetchAdapterOptions } from '../src/adapters/fetch';
import { SearchExecutor } from '../src/types';

// Mock global fetch API
global.fetch = jest.fn();

describe('Fetch Adapter', () => {
	beforeEach(() => {
		// Clear mocks before each test
		jest.clearAllMocks();
	});

	test('should create a SearchExecutor instance', () => {
		const options: FetchAdapterOptions = {
			baseUrl: 'https://api.example.com/search',
		};

		const executor = createFetchExecutor(options);

		expect(executor).toBeDefined();
		expect(typeof executor.execute).toBe('function');
	});

	test('should make a fetch request with the correct URL and parameters', async () => {
		// Mock successful response
		const mockResponse = {
			ok: true,
			json: jest.fn().mockResolvedValue(['result1', 'result2']),
		};
		(fetch as jest.Mock).mockResolvedValue(mockResponse);

		const options: FetchAdapterOptions = {
			baseUrl: 'https://api.example.com/search',
			queryParam: 'query',
		};

		const executor = createFetchExecutor(options);
		await executor.execute('test search');

		// Check that fetch was called with the correct URL
		// Note: URL encoding can use either '+' or '%20' for spaces, so we check that the URL was
		// called with any valid encoding rather than expecting a specific format
		expect(fetch).toHaveBeenCalledWith(
			expect.stringMatching(/https:\/\/api\.example\.com\/search\?query=test(\+|%20)search/),
			expect.objectContaining({
				signal: undefined,
			})
		);

		// Verify that json() was called to parse the response
		expect(mockResponse.json).toHaveBeenCalled();
	});

	test('should apply custom fetchOptions', async () => {
		// Mock successful response
		const mockResponse = {
			ok: true,
			json: jest.fn().mockResolvedValue(['result1', 'result2']),
		};
		(fetch as jest.Mock).mockResolvedValue(mockResponse);

		const options: FetchAdapterOptions = {
			baseUrl: 'https://api.example.com/search',
			fetchOptions: {
				headers: {
					Authorization: 'Bearer token123',
					'Content-Type': 'application/json',
				},
				mode: 'cors',
			},
		};

		const executor = createFetchExecutor(options);
		await executor.execute('test');

		// Check that fetch was called with the custom options
		expect(fetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				headers: {
					Authorization: 'Bearer token123',
					'Content-Type': 'application/json',
				},
				mode: 'cors',
			})
		);
	});

	test('should use a custom responseTransformer if provided', async () => {
		// Mock successful response
		const mockResponse = {
			ok: true,
			text: jest.fn().mockResolvedValue('plain text response'),
		};
		(fetch as jest.Mock).mockResolvedValue(mockResponse);

		const customTransformer = jest
			.fn()
			.mockImplementation((response) => response.text().then((text: string) => ({ data: text })));

		const options: FetchAdapterOptions = {
			baseUrl: 'https://api.example.com/search',
			responseTransformer: customTransformer,
		};

		const executor = createFetchExecutor(options);
		const result = await executor.execute('test');

		// Verify the transformer was called
		expect(customTransformer).toHaveBeenCalledWith(mockResponse);

		// Check the result includes the transformed data
		expect(result).toEqual({ data: 'plain text response' });
	});

	test('should throw an error when response is not ok', async () => {
		// Mock error response
		const mockResponse = {
			ok: false,
			status: 404,
			statusText: 'Not Found',
		};
		(fetch as jest.Mock).mockResolvedValue(mockResponse);

		const executor = createFetchExecutor({
			baseUrl: 'https://api.example.com/search',
		});

		await expect(executor.execute('test')).rejects.toThrow('HTTP error! Status: 404');
	});

	test('should handle network errors', async () => {
		// Mock network error
		const networkError = new Error('Network failure');
		(fetch as jest.Mock).mockRejectedValue(networkError);

		const executor = createFetchExecutor({
			baseUrl: 'https://api.example.com/search',
		});

		await expect(executor.execute('test')).rejects.toThrow('Network failure');
	});

	test('should include abort signal when provided', async () => {
		// Mock successful response
		const mockResponse = {
			ok: true,
			json: jest.fn().mockResolvedValue(['result1', 'result2']),
		};
		(fetch as jest.Mock).mockResolvedValue(mockResponse);

		// Create an abort controller and signal
		const controller = new AbortController();
		const signal = controller.signal;

		const executor = createFetchExecutor({
			baseUrl: 'https://api.example.com/search',
		});

		// Start the fetch
		const promise = executor.execute('test', signal);

		// Verify fetch was called with the signal
		expect(fetch).toHaveBeenCalledWith(
			expect.any(String),
			expect.objectContaining({
				signal,
			})
		);

		// Abort the operation
		controller.abort();

		// The abort should be handled by fetch internally
		await promise; // This should now resolve or reject based on how AbortController works
	});
});
