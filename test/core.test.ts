/**
 * TypeAhead Core Tests
 */

import { createSearchOptimizer } from '../src';
import type { SearchExecutor as SearchExecutorType } from '../src/types/index';

// Mock implementation of SearchExecutor for testing
class MockSearchExecutor implements SearchExecutorType<string[]> {
	private mockResults: string[];
	private delayMs: number;
	private shouldFail: boolean;
	private lastQuery: string = '';

	constructor(mockResults: string[] = [], delayMs = 0, shouldFail = false) {
		this.mockResults = mockResults;
		this.delayMs = delayMs;
		this.shouldFail = shouldFail;
	}

	async execute(query: string, signal?: AbortSignal): Promise<string[]> {
		this.lastQuery = query;

		if (signal?.aborted) {
			throw new Error('AbortError');
		}

		if (this.delayMs > 0) {
			await new Promise((resolve) => setTimeout(resolve, this.delayMs));
		}

		if (signal?.aborted) {
			throw new Error('AbortError');
		}

		if (this.shouldFail) {
			throw new Error('Mock search failed');
		}

		return this.mockResults.filter((item) => item.toLowerCase().includes(query.toLowerCase()));
	}

	getLastQuery(): string {
		return this.lastQuery;
	}
}

describe('TypeAhead Core', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	test('should initialize with default state', () => {
		const executor = new MockSearchExecutor();
		const typeahead = createSearchOptimizer(executor);

		expect(typeahead.query).toBe('');
		expect(typeahead.loading).toBe(false);
		expect(typeahead.results).toBeNull();
		expect(typeahead.error).toBeNull();
	});

	test('should debounce search requests', async () => {
		const executor = new MockSearchExecutor(['apple', 'banana', 'cherry']);
		const mockSearchStartFn = jest.fn();

		const typeahead = createSearchOptimizer(executor, {
			debounceDelay: 300,
			minChars: 2,
			onSearchStart: mockSearchStartFn,
		});

		// Set query multiple times in quick succession
		typeahead.setQuery('a');
		typeahead.setQuery('ap');
		typeahead.setQuery('app');

		expect(mockSearchStartFn).not.toHaveBeenCalled();

		// Fast-forward timer
		jest.advanceTimersByTime(300);

		// Need to wait for the next tick to allow promises to resolve
		await Promise.resolve();

		expect(mockSearchStartFn).toHaveBeenCalledTimes(1);
		expect(executor.getLastQuery()).toBe('app');
	});

	test('should not search for queries shorter than minChars', async () => {
		const executor = new MockSearchExecutor();
		const mockSearchStartFn = jest.fn();

		const typeahead = createSearchOptimizer(executor, {
			minChars: 3,
			onSearchStart: mockSearchStartFn,
		});

		typeahead.setQuery('a');
		jest.advanceTimersByTime(500);
		await Promise.resolve();

		typeahead.setQuery('ab');
		jest.advanceTimersByTime(500);
		await Promise.resolve();

		expect(mockSearchStartFn).not.toHaveBeenCalled();

		typeahead.setQuery('abc');
		jest.advanceTimersByTime(500);
		await Promise.resolve();

		expect(mockSearchStartFn).toHaveBeenCalledTimes(1);
	});

	test('should process input according to options', async () => {
		const executor = new MockSearchExecutor();
		const customProcessor = jest.fn((value: string) => value + '-processed');

		const typeahead = createSearchOptimizer(executor, {
			minChars: 1,
			trimInput: true,
			lowercaseInput: true,
			inputProcessor: customProcessor,
		});

		typeahead.setQuery('  TEST  ');
		jest.advanceTimersByTime(500);
		await Promise.resolve();

		expect(customProcessor).toHaveBeenCalledWith('test');
		expect(typeahead.query).toBe('test-processed');
	});

	test('should handle search success', async () => {
		const mockResults = ['apple', 'apricot', 'avocado'];
		const executor = new MockSearchExecutor(mockResults);
		const mockSuccessFn = jest.fn();

		const typeahead = createSearchOptimizer(executor, {
			onSearchSuccess: mockSuccessFn,
			minChars: 2,
			debounceDelay: 100,
		});

		typeahead.setQuery('ap');

		jest.advanceTimersByTime(100);
		await Promise.resolve();

		expect(mockSuccessFn).toHaveBeenCalledWith(['apple', 'apricot'], 'ap');
		expect(typeahead.results).toEqual(['apple', 'apricot']);
		expect(typeahead.loading).toBe(false);
	});

	test('should handle search error', async () => {
		const executor = new MockSearchExecutor([], 0, true);
		const mockErrorFn = jest.fn();

		const typeahead = createSearchOptimizer(executor, {
			onSearchError: mockErrorFn,
			minChars: 2,
			debounceDelay: 100,
		});

		typeahead.setQuery('error');

		jest.advanceTimersByTime(100);
		await Promise.resolve();

		expect(mockErrorFn).toHaveBeenCalledWith(expect.any(Error), 'error');
		expect(typeahead.error).toBeInstanceOf(Error);
		expect(typeahead.loading).toBe(false);
	});

	test('should cancel ongoing requests when a new query is made', async () => {
		// Create a mock executor with a delay that's long enough to ensure we can cancel it
		const delayedExecutor = new MockSearchExecutor(['apple', 'banana'], 200);

		// Create TypeAhead with immediate execution (no debounce)
		const typeahead = createSearchOptimizer(delayedExecutor, {
			minChars: 1,
			debounceDelay: 0,
			enableCancellation: true,
		});

		// Set up to use real timers for this test
		jest.useRealTimers();

		// Start a search for 'ap'
		typeahead.setQuery('ap');

		// Wait briefly to make sure the first search has started
		await new Promise((resolve) => setTimeout(resolve, 50));

		// Start a new search for 'ba' which should cancel the first
		typeahead.setQuery('ba');

		// Wait long enough for both searches to complete
		// The second search should complete and update results
		await new Promise((resolve) => setTimeout(resolve, 300));

		// Check final results - should only see "banana" (not "apple")
		expect(typeahead.results).toEqual(['banana']);

		// Reset to fake timers for other tests
		jest.useFakeTimers();
	});

	test('should reset search state', async () => {
		const mockResults = ['apple', 'banana'];
		const executor = new MockSearchExecutor(mockResults);

		const typeahead = createSearchOptimizer(executor, {
			minChars: 1,
			debounceDelay: 0,
		});

		// Use direct search instead of debounced setQuery
		typeahead.setQuery('ap');
		await typeahead.search();

		// Confirm we have results
		expect(typeahead.results).toEqual(['apple']);

		// Reset state
		typeahead.reset();

		// Verify reset worked
		expect(typeahead.query).toBe('');
		expect(typeahead.loading).toBe(false);
		expect(typeahead.results).toBeNull();
		expect(typeahead.error).toBeNull();
	});

	it('should handle callback updates after initialization', () => {
		const executor: SearchExecutorType<string[]> = {
			execute: jest.fn().mockResolvedValue(['test']),
		};

		const optimizer = createSearchOptimizer<string[]>(executor);
		const newStartCallback = jest.fn();
		const newSuccessCallback = jest.fn();
		const newErrorCallback = jest.fn();
		const newCanceledCallback = jest.fn();

		// Update callbacks
		optimizer.onSearchStart = newStartCallback;
		optimizer.onSearchSuccess = newSuccessCallback;
		optimizer.onSearchError = newErrorCallback;
		optimizer.onSearchCanceled = newCanceledCallback;

		// Trigger search to test callbacks
		optimizer.setQuery('test');
		jest.advanceTimersByTime(500);

		expect(newStartCallback).toHaveBeenCalled();
	});

	it('should handle search cancellation with undefined callbacks', async () => {
		const executor: SearchExecutorType<string[]> = {
			execute: jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve(['test']), 100))),
		};

		const optimizer = createSearchOptimizer<string[]>(executor);

		// Start search
		optimizer.setQuery('test');
		jest.advanceTimersByTime(500); // Wait for debounce

		// Wait for execute to be called
		await Promise.resolve();
		expect(executor.execute).toHaveBeenCalled();

		// Cancel without callback
		optimizer.cancel();
	});

	it('should handle getter methods for callbacks', () => {
		const executor: SearchExecutorType<string[]> = {
			execute: jest.fn().mockResolvedValue(['test']),
		};

		const onSearchStart = jest.fn();
		const onSearchSuccess = jest.fn();
		const onSearchError = jest.fn();
		const onSearchCanceled = jest.fn();

		const optimizer = createSearchOptimizer<string[]>(executor, {
			onSearchStart,
			onSearchSuccess,
			onSearchError,
			onSearchCanceled,
		});

		expect(optimizer.onSearchStart).toBe(onSearchStart);
		expect(optimizer.onSearchSuccess).toBe(onSearchSuccess);
		expect(optimizer.onSearchError).toBe(onSearchError);
		expect(optimizer.onSearchCanceled).toBe(onSearchCanceled);
	});

	it('should handle search with all input processing options', () => {
		const executor: SearchExecutorType<string[]> = {
			execute: jest.fn().mockResolvedValue(['test']),
		};

		const inputProcessor = jest.fn((value) => value.toUpperCase());
		const optimizer = createSearchOptimizer<string[]>(executor, {
			trimInput: true,
			lowercaseInput: true,
			inputProcessor,
			minChars: 2,
		});

		optimizer.setQuery('  Test  ');
		jest.advanceTimersByTime(500);

		expect(inputProcessor).toHaveBeenCalledWith('test');
		expect(executor.execute).toHaveBeenCalledWith('TEST', expect.any(AbortSignal));
	});

	it('should handle search with minimum characters edge case', () => {
		const executor: SearchExecutorType<string[]> = {
			execute: jest.fn().mockResolvedValue(['test']),
		};

		const optimizer = createSearchOptimizer<string[]>(executor, {
			minChars: 0,
		});

		optimizer.setQuery('');
		jest.advanceTimersByTime(500);

		expect(executor.execute).not.toHaveBeenCalled();
	});
});
