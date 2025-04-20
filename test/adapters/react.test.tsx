import React, { PropsWithChildren, act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useSearchOptimizer } from '../../src/adapters/react';
import { SearchExecutor } from '../../src/types/index';
import '@testing-library/jest-dom';
import { renderHook } from '@testing-library/react-hooks/dom/pure';

// Mock search executor for testing
const createMockExecutor = (delay = 0): SearchExecutor<string[]> => ({
	execute: jest.fn().mockImplementation(async (query: string) => {
		await new Promise((resolve) => setTimeout(resolve, delay));
		return [`Result for ${query}`];
	}),
});

// Test component using the hook
const TestComponent: React.FC<{
	executor: SearchExecutor<string[]>;
	onSearchStart?: () => void;
	onSearchSuccess?: (results: string[], query: string) => void;
	onSearchError?: (error: Error, query: string) => void;
	onSearchCanceled?: (query: string) => void;
	options?: { ariaLabel?: string };
}> = ({ executor, onSearchStart, onSearchSuccess, onSearchError, onSearchCanceled, options }) => {
	const { inputProps, loading, results, error, reset, cancel, search } = useSearchOptimizer<string[]>(executor, {
		debounceDelay: 100,
		minChars: 2,
		onSearchStart,
		onSearchSuccess,
		onSearchError,
		onSearchCanceled,
	});

	return (
		<div>
			<input
				data-testid='search-input'
				{...inputProps}
				placeholder='Search...'
				{...(options && { 'aria-label': options.ariaLabel })}
			/>
			{loading && <div data-testid='loading'>Loading...</div>}
			{error && <div data-testid='error'>{error.message}</div>}
			{results && (
				<ul data-testid='results'>
					{results.map((result, index) => (
						<li key={index}>{result}</li>
					))}
				</ul>
			)}
			<button
				onClick={reset}
				data-testid='reset'
			>
				Reset
			</button>
			<button
				onClick={cancel}
				data-testid='cancel'
			>
				Cancel
			</button>
			<button
				onClick={() => search()}
				data-testid='search-button'
			>
				Search
			</button>
		</div>
	);
};

// Create a properly typed wrapper component
const TestWrapper: React.FC<PropsWithChildren> = ({ children }) => <React.StrictMode>{children}</React.StrictMode>;

describe('useSearchOptimizer', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should initialize with empty state', () => {
		const executor = createMockExecutor();
		render(<TestComponent executor={executor} />);

		const input = screen.getByTestId('search-input');
		expect(input).toHaveValue('');
		expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
		expect(screen.queryByTestId('results')).not.toBeInTheDocument();
		expect(screen.queryByTestId('error')).not.toBeInTheDocument();
	});

	it('should handle input changes and trigger search', async () => {
		const executor = createMockExecutor();
		const onSearchSuccess = jest.fn();

		render(
			<TestComponent
				executor={executor}
				onSearchSuccess={onSearchSuccess}
			/>
		);

		const input = screen.getByTestId('search-input');

		// Type into input
		fireEvent.change(input, { target: { value: 'test' } });

		// Wait for debounce
		act(() => {
			jest.advanceTimersByTime(100);
		});

		// Wait for search to complete
		await waitFor(() => {
			expect(screen.getByTestId('results')).toBeInTheDocument();
		});

		expect(executor.execute).toHaveBeenCalledWith('test', expect.any(AbortSignal));
		expect(onSearchSuccess).toHaveBeenCalledWith(['Result for test'], 'test');
	});

	it('should handle search errors', async () => {
		const error = new Error('Search failed');
		const executor: SearchExecutor<string[]> = {
			execute: jest.fn().mockRejectedValue(error),
		};
		const onSearchError = jest.fn();

		render(
			<TestComponent
				executor={executor}
				onSearchError={onSearchError}
			/>
		);

		const input = screen.getByTestId('search-input');
		fireEvent.change(input, { target: { value: 'test' } });

		act(() => {
			jest.advanceTimersByTime(100);
		});

		await waitFor(() => {
			expect(screen.getByTestId('error')).toHaveTextContent('Search failed');
		});

		expect(onSearchError).toHaveBeenCalledWith(error, 'test');
	});

	it('should handle reset', async () => {
		const executor = createMockExecutor();
		render(<TestComponent executor={executor} />);

		const input = screen.getByTestId('search-input');
		fireEvent.change(input, { target: { value: 'test' } });

		act(() => {
			jest.advanceTimersByTime(100);
		});

		await waitFor(() => {
			expect(screen.getByTestId('results')).toBeInTheDocument();
		});

		fireEvent.click(screen.getByTestId('reset'));

		expect(input).toHaveValue('');
		expect(screen.queryByTestId('results')).not.toBeInTheDocument();
	});

	it('should handle cancellation', async () => {
		const executor = createMockExecutor(500); // Long delay to ensure we can cancel
		const onSearchCanceled = jest.fn();

		render(
			<TestComponent
				executor={executor}
				onSearchCanceled={onSearchCanceled}
			/>
		);

		const input = screen.getByTestId('search-input');
		fireEvent.change(input, { target: { value: 'test' } });

		act(() => {
			jest.advanceTimersByTime(100);
		});

		// Cancel while loading
		fireEvent.click(screen.getByTestId('cancel'));

		expect(onSearchCanceled).toHaveBeenCalledWith('test');
		expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
	});

	it('should not trigger search for short inputs', async () => {
		const executor = createMockExecutor();
		render(<TestComponent executor={executor} />);

		const input = screen.getByTestId('search-input');
		fireEvent.change(input, { target: { value: 'a' } });

		act(() => {
			jest.advanceTimersByTime(100);
		});

		expect(executor.execute).not.toHaveBeenCalled();
	});

	it('should cleanup on unmount', () => {
		const executor = createMockExecutor();
		const { unmount } = render(<TestComponent executor={executor} />);

		const input = screen.getByTestId('search-input');
		fireEvent.change(input, { target: { value: 'test' } });

		unmount();

		// No need to assert anything specific here as we're mainly testing that
		// unmounting doesn't throw any errors and cleanup runs properly
	});

	it('should throw error if executor is not provided', () => {
		const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

		expect(() => {
			// @ts-ignore - Testing runtime check
			render(<TestComponent executor={undefined} />);
		}).toThrow('SearchExecutor is required');

		consoleError.mockRestore();
	});

	it('should handle direct search method call', async () => {
		const executor = createMockExecutor();
		const onSearchSuccess = jest.fn();

		const TestComponentWithSearch: React.FC = () => {
			const { inputProps, search, results } = useSearchOptimizer<string[]>(executor, {
				onSearchSuccess,
			});

			return (
				<div>
					<input
						{...inputProps}
						data-testid='search-input'
					/>
					<button
						onClick={() => search()}
						data-testid='search-button'
					>
						Search
					</button>
					{results && <div data-testid='results'>{results.join(', ')}</div>}
				</div>
			);
		};

		render(<TestComponentWithSearch />);

		fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'test' } });
		fireEvent.click(screen.getByTestId('search-button'));

		await waitFor(() => {
			expect(screen.getByTestId('results')).toBeInTheDocument();
		});

		expect(executor.execute).toHaveBeenCalledWith('test', expect.any(AbortSignal));
	});

	it('should handle aria label from options', () => {
		const executor = createMockExecutor();
		render(
			<TestComponent
				executor={executor}
				options={{ ariaLabel: 'Custom search' }}
			/>
		);

		const input = screen.getByTestId('search-input');
		expect(input).toHaveAttribute('aria-label', 'Custom search');
	});

	it('should handle race conditions between multiple searches', async () => {
		const executor = createMockExecutor(100);
		const onSearchSuccess = jest.fn();

		render(
			<TestComponent
				executor={executor}
				onSearchSuccess={onSearchSuccess}
			/>
		);

		const input = screen.getByTestId('search-input');

		// Type first search
		fireEvent.change(input, { target: { value: 'first' } });

		// Wait half the debounce time
		act(() => {
			jest.advanceTimersByTime(50);
		});

		// Type second search
		fireEvent.change(input, { target: { value: 'second' } });

		// Complete debounce
		act(() => {
			jest.advanceTimersByTime(100);
		});

		await waitFor(() => {
			expect(screen.getByTestId('results')).toBeInTheDocument();
		});

		// Only the second search should have triggered onSearchSuccess
		expect(onSearchSuccess).toHaveBeenCalledTimes(1);
		expect(onSearchSuccess).toHaveBeenCalledWith(['Result for second'], 'second');
	});

	it('should handle search with exact minimum characters', async () => {
		const executor = createMockExecutor();
		const onSearchStart = jest.fn();

		render(
			<TestComponent
				executor={executor}
				onSearchStart={onSearchStart}
			/>
		);

		const input = screen.getByTestId('search-input');

		// Type exactly minChars characters (2 in TestComponent)
		fireEvent.change(input, { target: { value: 'ab' } });

		act(() => {
			jest.advanceTimersByTime(100);
		});

		expect(onSearchStart).toHaveBeenCalled();
		expect(executor.execute).toHaveBeenCalledWith('ab', expect.any(AbortSignal));
	});

	it('should handle callback behavior with undefined options', async () => {
		const executor = createMockExecutor();

		// Component without any callback props
		render(<TestComponent executor={executor} />);

		const input = screen.getByTestId('search-input');
		fireEvent.change(input, { target: { value: 'test' } });

		act(() => {
			jest.advanceTimersByTime(100);
		});

		// Should not throw and should complete search
		await waitFor(() => {
			expect(screen.getByTestId('results')).toBeInTheDocument();
		});
	});

	it('should handle state updates during search lifecycle', async () => {
		const executor = createMockExecutor(50);
		const onSearchStart = jest.fn();
		const onSearchSuccess = jest.fn();

		const { result } = renderHook(
			() =>
				useSearchOptimizer<string[]>(executor, {
					onSearchStart,
					onSearchSuccess,
					debounceDelay: 100,
					minChars: 2,
				}),
			{
				wrapper: TestWrapper,
			}
		);

		// Initial state
		expect(result.current.loading).toBe(false);
		expect(result.current.results).toBeNull();
		expect(result.current.error).toBeNull();

		// Set query
		act(() => {
			result.current.setQuery('test');
		});

		// After debounce, before search completes
		act(() => {
			jest.advanceTimersByTime(100);
		});

		expect(result.current.loading).toBe(true);
		expect(onSearchStart).toHaveBeenCalled();

		// After search completes
		await act(async () => {
			jest.advanceTimersByTime(50);
		});

		expect(result.current.loading).toBe(false);
		expect(result.current.results).toEqual(['Result for test']);
		expect(onSearchSuccess).toHaveBeenCalledWith(['Result for test'], 'test');
	});

	it('should handle component unmount during search', async () => {
		const executor = createMockExecutor(100);
		const onSearchCanceled = jest.fn();

		const { unmount, result } = renderHook(
			() =>
				useSearchOptimizer<string[]>(executor, {
					onSearchCanceled,
					debounceDelay: 50,
				}),
			{
				wrapper: TestWrapper,
			}
		);

		// Start a search
		act(() => {
			result.current.setQuery('test');
		});

		// Wait for debounce
		act(() => {
			jest.advanceTimersByTime(50);
		});

		// Unmount during search
		unmount();

		expect(onSearchCanceled).toHaveBeenCalledWith('test');
	});

	it('should handle rapid query updates', async () => {
		const executor = createMockExecutor(50);
		const onSearchSuccess = jest.fn();

		const { result } = renderHook(
			() =>
				useSearchOptimizer<string[]>(executor, {
					onSearchSuccess,
					debounceDelay: 100,
				}),
			{
				wrapper: TestWrapper,
			}
		);

		// Rapid query updates
		act(() => {
			result.current.setQuery('a');
			result.current.setQuery('ab');
			result.current.setQuery('abc');
		});

		// Wait for debounce
		act(() => {
			jest.advanceTimersByTime(100);
		});

		// Only the last query should trigger a search
		await act(async () => {
			jest.advanceTimersByTime(50);
		});

		expect(executor.execute).toHaveBeenCalledTimes(1);
		expect(executor.execute).toHaveBeenCalledWith('abc', expect.any(AbortSignal));
	});

	it('should handle search cancellation mid-request', async () => {
		const executor = createMockExecutor(100);
		const onSearchCanceled = jest.fn();

		const { result } = renderHook(
			() =>
				useSearchOptimizer<string[]>(executor, {
					onSearchCanceled,
					debounceDelay: 50,
				}),
			{
				wrapper: TestWrapper,
			}
		);

		// Start search
		act(() => {
			result.current.setQuery('test');
		});

		// Wait for debounce
		act(() => {
			jest.advanceTimersByTime(50);
		});

		// Cancel during search
		act(() => {
			result.current.cancel();
		});

		expect(onSearchCanceled).toHaveBeenCalledWith('test');
		expect(result.current.loading).toBe(false);
	});

	it('should handle search reset during loading state', async () => {
		const executor = createMockExecutor(100);

		const { result } = renderHook(
			() =>
				useSearchOptimizer<string[]>(executor, {
					debounceDelay: 50,
				}),
			{
				wrapper: TestWrapper,
			}
		);

		// Start search
		act(() => {
			result.current.setQuery('test');
		});

		// Wait for debounce
		act(() => {
			jest.advanceTimersByTime(50);
		});

		// Reset during loading
		act(() => {
			result.current.reset();
		});

		expect(result.current.loading).toBe(false);
		expect(result.current.query).toBe('');
		expect(result.current.results).toBeNull();
		expect(result.current.error).toBeNull();
	});

	it('should initialize with default state', () => {
		const executor = createMockExecutor();
		const { result } = renderHook(() => useSearchOptimizer(executor));

		expect(result.current.query).toBe('');
		expect(result.current.loading).toBe(false);
		expect(result.current.results).toBeNull();
		expect(result.current.error).toBeNull();
		expect(result.current.inputProps).toBeDefined();
		expect(result.current.inputProps.value).toBe('');
		expect(result.current.inputProps['aria-label']).toBe('Search input');
	});

	it('should handle input change events', () => {
		const executor = createMockExecutor();
		const { result } = renderHook(() => useSearchOptimizer(executor));

		act(() => {
			result.current.inputProps.onChange({ target: { value: 'test' } } as React.ChangeEvent<HTMLInputElement>);
		});

		expect(result.current.query).toBe('test');
		expect(result.current.inputProps.value).toBe('test');
	});

	it('should handle search lifecycle with callbacks', async () => {
		const executor = createMockExecutor(50);
		const onSearchStart = jest.fn();
		const onSearchSuccess = jest.fn();

		const { result } = renderHook(
			() =>
				useSearchOptimizer(executor, {
					onSearchStart,
					onSearchSuccess,
					debounceDelay: 100,
				}),
			{
				wrapper: TestWrapper,
			}
		);

		// Set query
		act(() => {
			result.current.setQuery('test');
		});

		// After debounce
		act(() => {
			jest.advanceTimersByTime(100);
		});

		expect(onSearchStart).toHaveBeenCalled();
		expect(result.current.loading).toBe(true);

		// After search completes
		await act(async () => {
			jest.advanceTimersByTime(50);
		});

		expect(result.current.loading).toBe(false);
		expect(result.current.results).toEqual(['Result for test']);
		expect(onSearchSuccess).toHaveBeenCalledWith(['Result for test'], 'test');
	});

	it('should handle search errors', async () => {
		const error = new Error('Search failed');
		const executor: SearchExecutor<string[]> = {
			execute: jest.fn().mockRejectedValue(error),
		};
		const onSearchError = jest.fn();

		const { result } = renderHook(
			() =>
				useSearchOptimizer(executor, {
					onSearchError,
					debounceDelay: 100,
				}),
			{
				wrapper: TestWrapper,
			}
		);

		act(() => {
			result.current.setQuery('test');
		});

		act(() => {
			jest.advanceTimersByTime(100);
		});

		await act(async () => {
			await Promise.resolve();
		});

		expect(result.current.loading).toBe(false);
		expect(result.current.error).toBe(error);
		expect(onSearchError).toHaveBeenCalledWith(error, 'test');
	});

	it('should handle search cancellation', async () => {
		const executor = createMockExecutor(100);
		const onSearchCanceled = jest.fn();

		const { result, unmount } = renderHook(
			() =>
				useSearchOptimizer(executor, {
					onSearchCanceled,
					debounceDelay: 50,
				}),
			{
				wrapper: TestWrapper,
			}
		);

		// Start search
		act(() => {
			result.current.setQuery('test');
		});

		// Wait for debounce
		act(() => {
			jest.advanceTimersByTime(50);
		});

		// Cancel search
		act(() => {
			result.current.cancel();
		});

		expect(onSearchCanceled).toHaveBeenCalledWith('test');
		expect(result.current.loading).toBe(false);

		// Cleanup
		unmount();
	});

	it('should handle custom aria label', () => {
		const executor = createMockExecutor();
		const { result } = renderHook(
			() =>
				useSearchOptimizer(executor, {
					ariaLabel: 'Custom search',
				}),
			{
				wrapper: TestWrapper,
			}
		);

		expect(result.current.inputProps['aria-label']).toBe('Custom search');
	});

	it('should handle search reset', () => {
		const executor = createMockExecutor();
		const { result } = renderHook(() => useSearchOptimizer(executor));

		// Set initial state
		act(() => {
			result.current.setQuery('test');
		});

		expect(result.current.query).toBe('test');

		// Reset
		act(() => {
			result.current.reset();
		});

		expect(result.current.query).toBe('');
		expect(result.current.results).toBeNull();
		expect(result.current.error).toBeNull();
		expect(result.current.loading).toBe(false);
	});

	it('should handle direct search method call', async () => {
		const executor = createMockExecutor(50);
		const { result } = renderHook(() => useSearchOptimizer(executor));

		// Set query and call search directly
		act(() => {
			result.current.setQuery('test');
			result.current.search();
		});

		expect(result.current.loading).toBe(true);

		await act(async () => {
			jest.advanceTimersByTime(50);
		});

		expect(result.current.loading).toBe(false);
		expect(result.current.results).toEqual(['Result for test']);
	});
});
