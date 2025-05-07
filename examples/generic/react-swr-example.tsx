import React, { useState, useEffect, useRef } from 'react';
import { createGenericExecutor, createSearchOptimizer } from 'search-optimizer';
import useSWR from 'swr';

/**
 * React component demonstrating the use of SearchOptimizer's generic adapter with SWR
 *
 * This example shows how to integrate SearchOptimizer with the SWR data fetching library
 * for React, combining the benefits of both libraries.
 */
const SearchWithSWR: React.FC = () => {
  // State for the search input
  const [inputValue, setInputValue] = useState('');

  // Reference to store the SearchOptimizer instance
  const searchOptimizerRef = useRef<any>(null);

  // State to track the current search query after debouncing and processing
  const [processedQuery, setProcessedQuery] = useState('');

  // Function to create our search fetcher that will be passed to SWR
  const createSearchFetcher = () => {
    // Create a closure over the AbortController so we can access it later
    let controller: AbortController | null = null;

    return async (query: string) => {
      // Skip empty queries
      if (!query) return null;

      // Cancel previous request if it exists
      if (controller) {
        controller.abort();
      }

      // Create a new controller for this request
      controller = new AbortController();
      const { signal } = controller;

      try {
        // Make the API call with the fetch API
        const response = await fetch(`https://api.example.com/search?q=${encodeURIComponent(query)}`, { signal });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.results;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          // This error is expected when we cancel the request
          console.log('Request was aborted');
          return null;
        }
        throw error;
      }
    };
  };

  // Set up SWR with our search fetcher
  const {
    data: searchResults,
    error: searchError,
    isValidating: isLoading,
  } = useSWR(
    processedQuery || null, // Only fetch if we have a processed query
    createSearchFetcher(),
    {
      revalidateOnFocus: false, // Don't refetch when window regains focus
      dedupingInterval: 2000, // Deduplicate requests within this time window
    },
  );

  // Initialize the search optimizer
  useEffect(() => {
    // Create a generic executor that will drive our search
    const searchExecutor = createGenericExecutor(async (query, signal) => {
      // In this example, we're not actually performing the search here
      // We're just updating the processedQuery state, which will trigger SWR
      // This demonstrates how SearchOptimizer can be used for input processing
      // while delegating the actual data fetching to another library
      setProcessedQuery(query);

      // Return an empty array, as SWR will handle the actual data fetching
      return [] as any[];
    });

    // Create the search optimizer
    const searchOptimizer = createSearchOptimizer(searchExecutor, {
      debounceDelay: 500,
      minChars: 2,
      trimInput: true,
      lowercaseInput: true,
    });

    // Store in ref for access in event handlers
    searchOptimizerRef.current = searchOptimizer;

    // Cleanup function
    return () => {
      if (searchOptimizerRef.current) {
        searchOptimizerRef.current.cancel();
      }
    };
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (searchOptimizerRef.current) {
      searchOptimizerRef.current.setQuery(value);
    }
  };

  // Handle search reset
  const handleResetSearch = () => {
    setInputValue('');
    setProcessedQuery('');

    if (searchOptimizerRef.current) {
      searchOptimizerRef.current.reset();
    }
  };

  return (
    <div className="search-container">
      <h2>Search with SWR + Generic Adapter</h2>

      <div className="search-input-wrapper">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Search..."
          className="search-input"
        />
        {isLoading && (
          <div className="search-loading-indicator">
            <span>Loading...</span>
          </div>
        )}
      </div>

      {searchError && <div className="search-error">Error: {searchError.message}</div>}

      {processedQuery && !isLoading && !searchError && searchResults && searchResults.length === 0 && (
        <div className="no-results">No results found for "{processedQuery}"</div>
      )}

      {searchResults && searchResults.length > 0 && (
        <div className="search-results">
          <h3>Results for "{processedQuery}"</h3>
          <ul className="results-list">
            {searchResults.map((item: any, index: number) => (
              <li key={index} className="result-item">
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {processedQuery && (
        <div className="search-controls">
          <button onClick={handleResetSearch} className="reset-button">
            Reset Search
          </button>
        </div>
      )}
    </div>
  );
};

export default SearchWithSWR;

/**
 * CSS for this component (could be in a separate file):
 *
 * .search-container {
 *   max-width: 800px;
 *   margin: 0 auto;
 *   padding: 20px;
 *   font-family: system-ui, -apple-system, sans-serif;
 * }
 *
 * .search-input-wrapper {
 *   position: relative;
 *   margin-bottom: 20px;
 * }
 *
 * .search-input {
 *   width: 100%;
 *   padding: 12px;
 *   font-size: 16px;
 *   border: 1px solid #ccc;
 *   border-radius: 4px;
 * }
 *
 * .search-loading-indicator {
 *   position: absolute;
 *   right: 10px;
 *   top: 50%;
 *   transform: translateY(-50%);
 *   color: #666;
 * }
 *
 * .search-error {
 *   padding: 10px;
 *   background-color: #ffebeb;
 *   color: #d8000c;
 *   border-radius: 4px;
 *   margin-bottom: 15px;
 * }
 *
 * .no-results {
 *   padding: 15px;
 *   background-color: #f8f8f8;
 *   border-radius: 4px;
 *   text-align: center;
 *   color: #666;
 * }
 *
 * .search-results h3 {
 *   margin-bottom: 15px;
 *   color: #333;
 * }
 *
 * .results-list {
 *   list-style: none;
 *   padding: 0;
 * }
 *
 * .result-item {
 *   padding: 15px;
 *   border: 1px solid #eee;
 *   border-radius: 4px;
 *   margin-bottom: 10px;
 *   background-color: #f9f9f9;
 * }
 *
 * .result-item h4 {
 *   margin-top: 0;
 *   margin-bottom: 5px;
 *   color: #2c3e50;
 * }
 *
 * .result-item p {
 *   margin: 0;
 *   color: #666;
 * }
 *
 * .search-controls {
 *   margin-top: 20px;
 *   display: flex;
 *   justify-content: center;
 * }
 *
 * .reset-button {
 *   background-color: #4a90e2;
 *   color: white;
 *   border: none;
 *   padding: 8px 16px;
 *   border-radius: 4px;
 *   cursor: pointer;
 * }
 *
 * .reset-button:hover {
 *   background-color: #3a80d2;
 * }
 */
