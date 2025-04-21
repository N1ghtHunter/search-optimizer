import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useOptimizedSearchQuery } from '../../src/adapters/react-query';

const queryClient = new QueryClient();

// Mock API call
const searchAPI = async (query: string): Promise<string[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  return [`Result 1 for ${query}`, `Result 2 for ${query}`, `Result 3 for ${query}`];
};

function SearchComponent() {
  const { searchTerm, optimizedSearchTerm, handleSearch, data, isLoading, error } = useOptimizedSearchQuery({
    queryKey: ['search'],
    queryFn: searchAPI,
    searchConfig: {
      debounceDelay: 300,
      minChars: 3,
    },
  });

  return (
    <div className="p-4">
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search..."
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="mb-2">
        <strong>Current search term:</strong> {searchTerm}
      </div>
      <div className="mb-4">
        <strong>Optimized search term:</strong> {optimizedSearchTerm}
      </div>

      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {(error as Error).message}</div>}
      {data && (
        <ul className="list-disc pl-5">
          {data.map((result, index) => (
            <li key={index}>{result}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">Search with React Query Example</h1>
        <SearchComponent />
      </div>
    </QueryClientProvider>
  );
}
