import { debounce, processInput, shouldPerformSearch, createAbortController } from '../../src/utils/index';

describe('debounce', () => {
	beforeEach(() => {
		jest.useFakeTimers();
	});

	afterEach(() => {
		jest.useRealTimers();
	});

	it('should delay function execution', () => {
		const func = jest.fn();
		const debouncedFunc = debounce(func, 100);

		debouncedFunc();
		expect(func).not.toHaveBeenCalled();

		jest.advanceTimersByTime(50);
		expect(func).not.toHaveBeenCalled();

		jest.advanceTimersByTime(50);
		expect(func).toHaveBeenCalledTimes(1);
	});

	it('should cancel previous timeout on subsequent calls', () => {
		const func = jest.fn();
		const debouncedFunc = debounce(func, 100);

		debouncedFunc();
		debouncedFunc();
		debouncedFunc();

		jest.advanceTimersByTime(99);
		expect(func).not.toHaveBeenCalled();

		jest.advanceTimersByTime(1);
		expect(func).toHaveBeenCalledTimes(1);
	});

	it('should preserve function context and arguments', () => {
		const context = { value: 42 };
		const func = jest.fn(function (this: typeof context, arg: string) {
			expect(this.value).toBe(42);
			expect(arg).toBe('test');
		});

		const debouncedFunc = debounce(func, 100);
		debouncedFunc.call(context, 'test');

		jest.advanceTimersByTime(100);
		expect(func).toHaveBeenCalledTimes(1);
	});
});

describe('processInput', () => {
	it('should trim input when trimInput is true', () => {
		expect(processInput('  test  ', { trimInput: true })).toBe('test');
	});

	it('should not trim input when trimInput is false', () => {
		expect(processInput('  test  ', { trimInput: false })).toBe('  test  ');
	});

	it('should convert to lowercase when lowercaseInput is true', () => {
		expect(processInput('TEST', { lowercaseInput: true })).toBe('test');
	});

	it('should not convert to lowercase when lowercaseInput is false', () => {
		expect(processInput('TEST', { lowercaseInput: false })).toBe('TEST');
	});

	it('should apply custom input processor', () => {
		const processor = (value: string) => value.replace(/\s+/g, '-');
		expect(processInput('hello world', { inputProcessor: processor })).toBe('hello-world');
	});

	it('should apply all transformations in correct order', () => {
		const processor = (value: string) => value.replace(/\s+/g, '-');
		expect(
			processInput('  HELLO WORLD  ', {
				trimInput: true,
				lowercaseInput: true,
				inputProcessor: processor,
			})
		).toBe('hello-world');
	});
});

describe('shouldPerformSearch', () => {
	it('should return false if query is too short', () => {
		expect(shouldPerformSearch('a', '', 2)).toBe(false);
	});

	it('should return false if query is same as previous', () => {
		expect(shouldPerformSearch('test', 'test', 2)).toBe(false);
	});

	it('should return true if query meets requirements', () => {
		expect(shouldPerformSearch('test', '', 2)).toBe(true);
	});

	it('should handle edge cases', () => {
		expect(shouldPerformSearch('', '', 0)).toBe(false);
		expect(shouldPerformSearch('a', 'b', 1)).toBe(true);
	});
});

describe('createAbortController', () => {
	const originalAbortController = global.AbortController;

	afterEach(() => {
		global.AbortController = originalAbortController;
	});

	it('should create AbortController when available', () => {
		const controller = createAbortController();
		expect(controller).toBeInstanceOf(AbortController);
	});

	it('should return null when AbortController is not available', () => {
		// @ts-ignore - Testing environment without AbortController
		delete global.AbortController;
		const controller = createAbortController();
		expect(controller).toBeNull();
	});
});
