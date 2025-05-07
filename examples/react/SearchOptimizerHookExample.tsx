import React from 'react';
import { useSearchOptimizer } from '../../src/adapters/react';
import { createFetchExecutor } from '../../src/adapters/fetch';

interface SearchResult {
  id: string;
  title: string;
  description: string;
}

/**
 * Example React component demonstrating the useSearchOptimizer hook
 */
const SearchOptimizerHookExample: React.FC = () => {
  // Create a fetch executor to search a hypothetical API
  const searchExecutor = React.useMemo(
    () =>
      createFetchExecutor<SearchResult[]>({
        baseUrl: 'https://api.example.com/search',
        queryParam: 'q',
        fetchOptions: {
          headers: { 'Content-Type': 'application/json' },
        },
        responseTransformer: async response => {
          const data = await response.json();
          return data.results || [];
        },
      }),
    [],
  );

  // Use the SearchOptimizer hook with configuration options
  const { inputProps, loading, results, error, reset } = useSearchOptimizer<SearchResult[]>(searchExecutor, {
    debounceDelay: 400,
    minChars: 2,
    trimInput: true,
    lowercaseInput: true,
    onSearchStart: () => console.log('Search started'),
    onSearchSuccess: results => console.log(`Found ${results?.length || 0} results`),
    onSearchError: error => console.error('Search error:', error.message),
    onSearchCanceled: query => console.log(`Search canceled for: ${query}`),
  });

  return (
    <div className="search-container">
      <h2>SearchOptimizer Example</h2>

      <div className="search-input-wrapper">
        {/* Use the inputProps directly with the input element */}
        <input type="text" placeholder="Search..." className="search-input" {...inputProps} />

        {loading && <div className="search-loading-indicator">Loading...</div>}
        {error && <div className="search-error">{error.message}</div>}

        <button className="search-reset-button" onClick={reset} disabled={!inputProps.value}>
          Clear
        </button>
      </div>

      {results && results.length > 0 ? (
        <ul className="search-results-list">
          {results.map(item => (
            <li key={item.id} className="search-result-item">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>
      ) : (
        inputProps.value && !loading && !error && <div className="search-no-results">No results found</div>
      )}

      <div className="search-instructions">
        <p>Start typing to search. The search will automatically trigger after you stop typing.</p>
      </div>
    </div>
  );
};

export default SearchOptimizerHookExample;
