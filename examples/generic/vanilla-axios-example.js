/**
 * Vanilla JavaScript example using the generic adapter with Axios
 *
 * This example demonstrates how to use the generic adapter to create a search
 * executor using Axios in a vanilla JavaScript application.
 */

import { createSearchOptimizer } from 'search-optimizer';
import { createGenericExecutor } from 'search-optimizer/adapters/generic';
import axios from 'axios';

document.addEventListener('DOMContentLoaded', function () {
  // Get DOM elements
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');
  const searchStatus = document.getElementById('search-status');
  const resetButton = document.getElementById('reset-button');

  // Create a custom Axios instance
  const axiosInstance = axios.create({
    baseURL: 'https://api.example.com',
    timeout: 5000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  // Create a generic executor using Axios
  const searchExecutor = createGenericExecutor(
    async (query, signal) => {
      try {
        // Make sure we use the signal for cancellation
        const response = await axiosInstance.get(`/search`, {
          params: { q: query },
          signal, // Axios supports AbortSignal directly
        });

        return response.data.items; // Assuming the API returns { items: [...] }
      } catch (error) {
        // Axios wraps AbortError, so we need to check for it
        if (axios.isCancel(error)) {
          // Create a standard AbortError for consistent handling
          const abortError = new Error('Request was canceled');
          abortError.name = 'AbortError';
          throw abortError;
        }

        // Format error message based on Axios error structure
        if (error.response) {
          // Server responded with error status code
          throw new Error(`Server error: ${error.response.status}`);
        } else if (error.request) {
          // Request was made but no response was received
          throw new Error('No response from server');
        } else {
          // Something happened in setting up the request
          throw new Error(`Request failed: ${error.message}`);
        }
      }
    },
    {
      name: 'AxiosSearchExecutor',
      // Custom error handler example
      errorHandler: error => {
        console.error('Search error:', error);
        return new Error(`Search failed: ${error.message || 'Unknown error'}`);
      },
    },
  );

  // Create the search optimizer
  const searchOptimizer = createSearchOptimizer(searchExecutor, {
    debounceDelay: 350,
    minChars: 2,
    onSearchStart: () => {
      updateStatus('Searching...', 'searching');
    },
    onSearchSuccess: (results, query) => {
      updateStatus(`Found ${results.length} results for "${query}"`, 'success');
      displayResults(results);
    },
    onSearchError: error => {
      updateStatus(`Error: ${error.message}`, 'error');
      clearResults();
    },
    onSearchCanceled: query => {
      console.log(`Search for "${query}" was canceled`);
    },
  });

  // Add event listener to input
  searchInput.addEventListener('input', e => {
    searchOptimizer.setQuery(e.target.value);
  });

  // Add event listener to reset button
  resetButton.addEventListener('click', () => {
    searchInput.value = '';
    searchOptimizer.reset();
    clearResults();
    updateStatus('Search reset', 'info');
  });

  // Helper function to update status
  function updateStatus(message, type = 'info') {
    searchStatus.textContent = message;
    searchStatus.className = `status ${type}`;
  }

  // Helper function to display results
  function displayResults(results) {
    clearResults();

    if (results.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'no-results';
      noResults.textContent = 'No results found';
      searchResults.appendChild(noResults);
      return;
    }

    results.forEach(item => {
      const resultItem = document.createElement('div');
      resultItem.className = 'result-item';

      const title = document.createElement('h3');
      title.textContent = item.title;

      const description = document.createElement('p');
      description.textContent = item.description;

      resultItem.appendChild(title);
      resultItem.appendChild(description);
      searchResults.appendChild(resultItem);
    });
  }

  // Helper function to clear results
  function clearResults() {
    searchResults.innerHTML = '';
  }

  // Initial status
  updateStatus('Enter a search term', 'info');
});

/*
 * HTML structure for this example:
 *
 * <div class="search-container">
 *   <h1>Search Example with Generic Adapter + Axios</h1>
 *   <div class="search-input-container">
 *     <input type="text" id="search-input" placeholder="Search...">
 *     <button id="reset-button">Reset</button>
 *   </div>
 *   <div id="search-status" class="status info">Enter a search term</div>
 *   <div id="search-results" class="results-container"></div>
 * </div>
 *
 * CSS styling would include:
 * - Styling for the search input and container
 * - Styling for the status messages (info, searching, success, error)
 * - Styling for the search results
 */
