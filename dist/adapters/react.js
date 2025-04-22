import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createSearchOptimizer } from '../core';
export function useSearchOptimizer(executor, options = {}) {
    if (!executor) {
        throw new Error('SearchExecutor is required');
    }
    const searchOptimizerRef = useRef(null);
    if (!searchOptimizerRef.current) {
        searchOptimizerRef.current = createSearchOptimizer(executor, options);
    }
    const searchOptimizer = searchOptimizerRef.current;
    const [query, setQueryState] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);
    const handleSearchStart = useCallback(() => {
        var _a;
        setLoading(true);
        (_a = options.onSearchStart) === null || _a === void 0 ? void 0 : _a.call(options);
    }, [options.onSearchStart]);
    const handleSearchSuccess = useCallback((results, query) => {
        var _a;
        setLoading(false);
        setResults(results);
        setError(null);
        (_a = options.onSearchSuccess) === null || _a === void 0 ? void 0 : _a.call(options, results, query);
    }, [options.onSearchSuccess]);
    const handleSearchError = useCallback((error, query) => {
        var _a;
        setLoading(false);
        setError(error);
        (_a = options.onSearchError) === null || _a === void 0 ? void 0 : _a.call(options, error, query);
    }, [options.onSearchError]);
    const handleSearchCanceled = useCallback((query) => {
        var _a;
        setLoading(false);
        (_a = options.onSearchCanceled) === null || _a === void 0 ? void 0 : _a.call(options, query);
    }, [options.onSearchCanceled]);
    useEffect(() => {
        searchOptimizer.onSearchStart = handleSearchStart;
        searchOptimizer.onSearchSuccess = handleSearchSuccess;
        searchOptimizer.onSearchError = handleSearchError;
        searchOptimizer.onSearchCanceled = handleSearchCanceled;
    }, [searchOptimizer, handleSearchStart, handleSearchSuccess, handleSearchError, handleSearchCanceled]);
    const handleQueryChange = useCallback((value) => {
        setQueryState(value);
        searchOptimizer.setQuery(value);
    }, [searchOptimizer]);
    const inputProps = useMemo(() => ({
        value: query,
        onChange: (e) => handleQueryChange(e.target.value),
        'aria-label': options.ariaLabel || 'Search input',
    }), [query, handleQueryChange, options.ariaLabel]);
    const reset = useCallback(() => {
        searchOptimizer.reset();
        setQueryState('');
        setLoading(false);
        setResults(null);
        setError(null);
    }, [searchOptimizer]);
    useEffect(() => {
        const optimizer = searchOptimizer;
        return () => {
            optimizer.cancel();
        };
    }, [searchOptimizer]);
    return {
        query,
        loading,
        results,
        error,
        setQuery: handleQueryChange,
        search: searchOptimizer.search,
        cancel: searchOptimizer.cancel,
        reset,
        inputProps,
    };
}
