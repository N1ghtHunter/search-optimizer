import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { createSearchOptimizer } from '../core';
import type { SearchOptimizerOptions } from '../types';
import { useCallback, useEffect, useState } from 'react';

export interface UseOptimizedSearchQueryOptions<TData, TError>
  extends Omit<UseQueryOptions<TData, TError, TData>, 'queryKey' | 'queryFn'> {
  searchConfig?: Partial<SearchOptimizerOptions<TData>>;
  queryKey: string[];
  queryFn: (searchTerm: string) => Promise<TData>;
}

export function useOptimizedSearchQuery<TData, TError = Error>({
  searchConfig,
  queryKey,
  queryFn,
  ...queryOptions
}: UseOptimizedSearchQueryOptions<TData, TError>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [optimizedSearchTerm, setOptimizedSearchTerm] = useState('');

  const searchOptimizer = createSearchOptimizer<TData>({
    execute: async (query: string) => queryFn(query),
    onSearchSuccess: (results: TData, optimizedQuery: string) => setOptimizedSearchTerm(optimizedQuery),
    ...searchConfig,
  });

  useEffect(() => {
    searchOptimizer.setQuery(searchTerm);
  }, [searchTerm]);

  const query = useQuery({
    queryKey: [...queryKey, optimizedSearchTerm],
    queryFn: () => queryFn(optimizedSearchTerm),
    enabled: optimizedSearchTerm !== '',
    ...queryOptions,
  });

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return {
    ...query,
    searchTerm,
    optimizedSearchTerm,
    handleSearch,
  };
}
