# 🔍 SearchOptimizer

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![npm version](https://img.shields.io/npm/v/search-optimizer.svg?style=flat)](https://www.npmjs.com/package/search-optimizer)

> An optimized, framework-agnostic solution for handling search-as-you-type functionality.

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

## 🚀 Usage

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
searchInput.addEventListener('input', (event) => {
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
import React, { useState, useEffect } from 'react';
import { useSearchOptimizer, createFetchExecutor } from 'search-optimizer';

function SearchComponent() {
	// Create the search executor
	const searchExecutor = React.useMemo(
		() =>
			createFetchExecutor({
				baseUrl: 'https://api.example.com/search',
				queryParam: 'q',
			}),
		[]
	);

	// Use the hook to manage search state
	const { inputProps, loading, results, error } = useSearchOptimizer(searchExecutor, {
		debounceDelay: 400,
		minChars: 2,
	});

	return (
		<div>
			<input
				type='text'
				placeholder='Search...'
				{...inputProps}
			/>

			{loading && <div>Loading...</div>}

			{results && (
				<ul>
					{results.map((item) => (
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

### Adapters

#### `createFetchExecutor(options)`

Creates a SearchExecutor using the Fetch API.

#### `createAxiosExecutor(options)`

Creates a SearchExecutor using Axios.

#### `createGraphQLExecutor(options)`

Creates a SearchExecutor for GraphQL clients.

### React Hook

#### `useSearchOptimizer(executor, options)`

React hook for using SearchOptimizer in functional components.

## 📄 License

MIT
