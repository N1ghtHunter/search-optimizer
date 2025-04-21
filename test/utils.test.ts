/**
 * Tests for SearchOptimizer utility functions
 */

import { debounce, processInput, shouldPerformSearch, createAbortController } from '../src/utils';

describe('Utility Functions', () => {
  // Test debounce function
  describe('debounce', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('should delay function execution', () => {
      const mockFn = jest.fn();
      const debounced = debounce(mockFn, 300);

      // Call the debounced function
      debounced();

      // Function should not be called immediately
      expect(mockFn).not.toHaveBeenCalled();

      // Fast-forward time
      jest.advanceTimersByTime(300);

      // Now the function should have been called
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('should cancel previous timeouts on subsequent calls', () => {
      const mockFn = jest.fn();
      const debounced = debounce(mockFn, 300);

      // Call the debounced function multiple times
      debounced();
      debounced();
      debounced();

      // Function should not be called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Fast-forward time
      jest.advanceTimersByTime(300);

      // Should only have been called once
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    test('should preserve function context and arguments', () => {
      const object = {
        value: 'test',
        method: function (arg1: string, arg2: number) {
          return `${this.value}-${arg1}-${arg2}`;
        },
      };

      const result: string[] = [];
      const spy = jest.spyOn(object, 'method');
      const debounced = debounce(function (this: any, arg1: string, arg2: number) {
        const val = object.method.call(this, arg1, arg2);
        result.push(val);
      }, 300);

      // Call with context and arguments
      debounced.call(object, 'arg1', 123);

      jest.advanceTimersByTime(300);

      expect(spy).toHaveBeenCalledWith('arg1', 123);
      expect(result).toEqual(['test-arg1-123']);
    });
  });

  // Test processInput function
  describe('processInput', () => {
    test('should trim input when trimInput is true', () => {
      const result = processInput('  test  ', { trimInput: true });
      expect(result).toBe('test');
    });

    test('should not trim input when trimInput is false', () => {
      const result = processInput('  test  ', { trimInput: false });
      expect(result).toBe('  test  ');
    });

    test('should convert to lowercase when lowercaseInput is true', () => {
      const result = processInput('TEST', { lowercaseInput: true });
      expect(result).toBe('test');
    });

    test('should not convert to lowercase when lowercaseInput is false', () => {
      const result = processInput('TEST', { lowercaseInput: false });
      expect(result).toBe('TEST');
    });

    test('should apply custom inputProcessor when provided', () => {
      const processor = (val: string) => val.replace(/\s+/g, '-');
      const result = processInput('test input', { inputProcessor: processor });
      expect(result).toBe('test-input');
    });

    test('should apply all transformations in the correct order', () => {
      const processor = (val: string) => val + '-processed';
      const result = processInput('  TEST Input  ', {
        trimInput: true,
        lowercaseInput: true,
        inputProcessor: processor,
      });
      expect(result).toBe('test input-processed');
    });
  });

  // Test shouldPerformSearch function
  describe('shouldPerformSearch', () => {
    test('should return false if query is shorter than minChars', () => {
      expect(shouldPerformSearch('ab', '', 3)).toBe(false);
    });

    test('should return false if query is the same as previous query', () => {
      expect(shouldPerformSearch('test', 'test', 3)).toBe(false);
    });

    test('should return true if query meets requirements', () => {
      expect(shouldPerformSearch('test', 'different', 3)).toBe(true);
      expect(shouldPerformSearch('testing', '', 3)).toBe(true);
    });
  });

  // Test createAbortController function
  describe('createAbortController', () => {
    const originalAbortController = global.AbortController;

    afterEach(() => {
      global.AbortController = originalAbortController;
    });

    test('should return an AbortController instance when available', () => {
      const controller = createAbortController();
      expect(controller).toBeInstanceOf(AbortController);
      expect(controller?.signal).toBeDefined();
    });

    test('should return null when AbortController is not available', () => {
      // Mock absence of AbortController
      delete (global as any).AbortController;
      const controller = createAbortController();
      expect(controller).toBeNull();
    });
  });
});
