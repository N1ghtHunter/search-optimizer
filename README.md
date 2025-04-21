# 🔍 SearchOptimizer

[![npm version](https://img.shields.io/npm/v/search-optimizer.svg)](https://www.npmjs.com/package/search-optimizer)
[![build status](https://github.com/N1ghtHunter/search-optimizer/actions/workflows/ci.yml/badge.svg)](https://github.com/N1ghtHunter/search-optimizer/actions)
[![coverage](https://img.shields.io/codecov/c/github/N1ghtHunter/search-optimizer)](https://codecov.io/gh/N1ghtHunter/search-optimizer)
[![license](https://img.shields.io/npm/l/search-optimizer)](LICENSE)

> An optimized, framework-agnostic solution for handling search-as-you-type functionality.

## 📖 Table of Contents

1. [Overview](#-overview)
2. [Installation](#️-installation)
3. [Quick Start](#-quick-start)
4. [API Reference](#-api-reference)
5. [Adapters & Hooks](#-adapters--hooks)
6. [Examples](#-examples)
7. [Contributing](#-contributing)
8. [Changelog](#-changelog)
9. [License](#-license)

## 📋 Overview

SearchOptimizer is a lightweight, framework-agnostic library that helps optimize search inputs with real-time results (search-as-you-type). It provides a clean, efficient way to:

- Debounce user input to reduce unnecessary API calls
- Prevent race conditions by automatically canceling outdated requests
- Apply minimum character limits before triggering searches
- Process input uniformly (trim, lowercase, etc.)
- Works with any request library or framework

## ⚙️ Installation

```bash
npm install search-optimizer
# or
yarn add search-optimizer
```

## 🚀 Quick Start

### Basic Usage

```javascript
import { createSearchOptimizer, createFetchExecutor } from 'search-optimizer';

// Create a search executor using fetch
const searchExecutor = createFetchExecutor({
  baseUrl: 'https://api.example.com/search',
  queryParam: 'q',
});

// Create the search optimizer
const searchOptimizer = createSearchOptimizer(searchExecutor, {
  debounceDelay: 500,
  minChars: 3,
});

// Get the search input element
const searchInput = document.getElementById('search-input');

// Connect the input to the search optimizer
searchInput.addEventListener('input', event => {
  searchOptimizer.setQuery(event.target.value);
});

// Subscribe to changes in the search state
setInterval(() => {
  console.log('Loading:', searchOptimizer.loading);
  console.log('Results:', searchOptimizer.results);
  console.log('Error:', searchOptimizer.error);
}, 1000);
```

### React Hook Usage

```jsx
import React from 'react';
import { useSearchOptimizer, createFetchExecutor } from 'search-optimizer';

function SearchComponent() {
  // Create the search executor
  const searchExecutor = React.useMemo(
    () =>
      createFetchExecutor({
        baseUrl: 'https://api.example.com/search',
        queryParam: 'q',
      }),
    [],
  );

  // Use the hook to manage search state
  const { inputProps, loading, results, error } = useSearchOptimizer(searchExecutor, {
    debounceDelay: 400,
    minChars: 2,
  });

  return (
    <div>
      <input type="text" placeholder="Search..." {...inputProps} />

      {loading && <div>Loading...</div>}

      {results && (
        <ul>
          {results.map(item => (
            <li key={item.id}>{item.name}</li>
          ))}
        </ul>
      )}

      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

## 📖 API Reference

### Core

#### `createSearchOptimizer(executor, options)`

Creates a new SearchOptimizer instance.

**Parameters:**

- `executor`: A SearchExecutor implementation
- `options`: Configuration options

**Returns:** A SearchOptimizerResult object with methods and state properties

**Options:**

- `debounceDelay`: Debounce delay in milliseconds (default: 500)
- `minChars`: Minimum characters required before triggering search (default: 3)
- `trimInput`: Whether to trim the input value (default: true)
- `lowercaseInput`: Whether to convert the input to lowercase (default: true)
- `enableCancellation`: Whether to enable request cancellation (default: true)
- `inputProcessor`: Custom function to process input
- `onSearchStart`: Callback when search starts
- `onSearchSuccess`: Callback when search succeeds
- `onSearchError`: Callback when search fails
- `onSearchCanceled`: Callback when search is canceled

## 🔌 Adapters & Hooks

### Adapters

#### `createFetchExecutor(options)`

Creates a SearchExecutor using the Fetch API.

**Options:**

- `baseUrl`: Base URL for the search endpoint (required)
- `queryParam`: Query parameter name for the search term (default: 'q')
- `fetchOptions`: Additional fetch request options
- `responseTransformer`: Function to transform the fetch response

#### `createAxiosExecutor(options)`

Creates a SearchExecutor using Axios.

**Options:**

- `axios`: Axios instance to use for requests (required)
- `baseUrl`: Base URL for the search endpoint (required)
- `queryParam`: Query parameter name for the search term (default: 'q')
- `axiosOptions`: Additional axios request options

#### `createGraphQLExecutor(options)`

Creates a SearchExecutor for GraphQL clients.

**Options:**

- `client`: GraphQL client instance (required)
- `query`: GraphQL query document (required)
- `queryVariableName`: Name of the variable to pass the search term (default: 'query')
- `resultExtractor`: Function to extract search results from the GraphQL response
- `additionalVariables`: Additional variables to include with every GraphQL request

### React Hook

#### `useSearchOptimizer(executor, options)`

React hook for using SearchOptimizer in functional components.

**Returns:**

- `query`: Current search query string
- `loading`: Boolean indicating if a search is in progress
- `results`: Search results (null if no search has been performed)
- `error`: Error object (null if no error occurred)
- `setQuery`: Function to update the search query
- `search`: Function to manually trigger a search
- `cancel`: Function to cancel the current search
- `reset`: Function to reset the search state
- `inputProps`: Props object for easy React input element integration

## 🧪 Examples

Check out the examples directory for complete working demos:

- [Basic React Example](examples/react/SearchOptimizerHookExample.tsx)
- [React Query Integration](examples/react-query/) (Coming soon)

## 🤝 Contributing

We welcome contributions to SearchOptimizer! If you'd like to contribute, please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please make sure to update tests as appropriate.

## 📝 Changelog

See the [CHANGELOG.md](CHANGELOG.md) file for details on version updates.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
