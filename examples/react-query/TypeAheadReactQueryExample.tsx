/**
 * TypeAhead integration with React Query
 *
 * This example demonstrates how to use TypeAhead with React Query
 * to handle data fetching and caching.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query'; // In real usage, you'd install this package
import { createTypeAhead } from '../../src'; // In real usage, this would be 'typeahead'

// Example search result type
interface SearchResult {
	id: string;
	title: string;
	description: string;
}

/**
 * React Query integration with TypeAhead
 * This shows how to use TypeAhead with React Query's useQuery hook
 */
const TypeAheadReactQueryExample: React.FC = () => {
	// Local state for the input value and processed query
	const [inputValue, setInputValue] = useState('');
	const [debouncedQuery, setDebouncedQuery] = useState('');

	// Configure TypeAhead for debouncing and input processing
	const typeAhead = React.useMemo(() => {
		return createTypeAhead(
			{
				// Custom executor that just returns the query - we'll use React Query for actual fetching
				execute: async (query) => query,
			},
			{
				debounceDelay: 400,
				minChars: 2,
				onSearchSuccess: (query) => {
					// When TypeAhead processes a query successfully, update our state
					setDebouncedQuery(query);
				},
			}
		);
	}, []);

	// Use React Query's useQuery hook for data fetching
	const {
		data: results,
		isLoading,
		error,
	} = useQuery({
		// Only run the query if we have a valid debounced query
		queryKey: ['search', debouncedQuery],
		queryFn: async () => {
			if (!debouncedQuery || debouncedQuery.length < 2) {
				return [];
			}

			// Fetch data from API
			const response = await fetch(`https://api.example.com/search?q=${encodeURIComponent(debouncedQuery)}`);

			if (!response.ok) {
				throw new Error('Search failed');
			}

			return response.json() as Promise<SearchResult[]>;
		},
		// Only run if we have a valid query
		enabled: debouncedQuery.length >= 2,
		// Configure stale time and caching as needed
		staleTime: 1000 * 60 * 5, // 5 minutes
	});

	// Handle input changes
	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const value = e.target.value;
			setInputValue(value);

			// Let TypeAhead handle debouncing and processing
			typeAhead.setQuery(value);
		},
		[typeAhead]
	);

	// Clean up
	useEffect(() => {
		return () => {
			typeAhead.cancel();
		};
	}, [typeAhead]);

	return (
		<div className='typeahead-react-query-example'>
			<h2>TypeAhead with React Query</h2>

			<div className='search-container'>
				<input
					type='text'
					value={inputValue}
					className='search-input'
					placeholder='Search...'
					onChange={handleInputChange}
					aria-label='Search'
				/>

				<button
					onClick={() => {
						setInputValue('');
						setDebouncedQuery('');
						typeAhead.reset();
					}}
					disabled={!inputValue}
					className='reset-button'
				>
					Clear
				</button>

				{isLoading && <div className='loading-indicator'>Loading...</div>}
			</div>

			{error && <div className='error-message'>Error: {error instanceof Error ? error.message : 'Unknown error'}</div>}

			{results && results.length > 0 ? (
				<ul className='search-results'>
					{results.map((item) => (
						<li
							key={item.id}
							className='result-item'
						>
							<h3>{item.title}</h3>
							<p>{item.description}</p>
						</li>
					))}
				</ul>
			) : debouncedQuery && !isLoading ? (
				<div className='no-results'>No results found</div>
			) : null}

			<div className='search-info'>
				<h3>How this works:</h3>
				<ol>
					<li>TypeAhead handles debouncing and input processing</li>
					<li>The processed query is used as a React Query query key</li>
					<li>React Query manages caching, refetching, and loading states</li>
					<li>UI renders based on React Query's state (isLoading, error, data)</li>
				</ol>
				<p>
					<strong>Current query:</strong> {debouncedQuery || 'None'}
				</p>
			</div>
		</div>
	);
};

export default TypeAheadReactQueryExample;
