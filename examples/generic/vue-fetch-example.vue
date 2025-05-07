<template>
  <div class="search-container">
    <h2>Vue.js Search Example with Generic Adapter</h2>

    <div class="search-input-wrapper">
      <input
        type="text"
        v-model="searchInput"
        placeholder="Search products..."
        class="search-input"
        @input="handleInput"
      />
      <div v-if="searchState && searchState.loading" class="search-loader">
        <span>Loading...</span>
      </div>
    </div>

    <div v-if="searchState && searchState.error" class="search-error">Error: {{ searchState.error.message }}</div>

    <div v-if="searchState && searchState.results && searchState.results.length > 0" class="search-results">
      <div v-for="(item, index) in searchState.results" :key="index" class="search-result-item">
        <h3>{{ item.name }}</h3>
        <p>{{ item.description }}</p>
        <div class="price">{{ formatPrice(item.price) }}</div>
      </div>
    </div>

    <div
      v-else-if="searchState && searchState.query && !searchState.loading && !searchState.error"
      class="search-no-results"
    >
      No results found for "{{ searchState.query }}"
    </div>

    <div class="search-stats" v-if="searchState && searchState.query">
      <p>Query: "{{ searchState.query }}"</p>
      <p v-if="searchState.results">Results: {{ searchState.results.length }}</p>
      <button @click="searchState && searchState.reset()" class="reset-button">Reset Search</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { createSearchOptimizer } from 'search-optimizer';
import { createGenericExecutor } from 'search-optimizer/adapters/generic';

export default {
  name: 'SearchWithGenericAdapter',

  setup() {
    const searchInput = ref('');
    const searchState = ref(null);

    // Initialize the search optimizer with our generic adapter
    onMounted(() => {
      // Create a custom search executor using Fetch API
      const searchExecutor = createGenericExecutor(
        async (query, signal) => {
          try {
            // Example API endpoint - replace with your actual API
            const response = await fetch(`https://api.example.com/products/search?q=${encodeURIComponent(query)}`, {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
              signal, // Pass the AbortSignal to enable cancellation
            });

            if (!response.ok) {
              throw new Error(`Search request failed with status: ${response.status}`);
            }

            const data = await response.json();
            return data.products; // Assuming the API returns { products: [...] }
          } catch (error) {
            // Rethrow abortion errors
            if (error.name === 'AbortError') {
              throw error;
            }
            // Handle and transform other errors
            throw new Error(`Search failed: ${error.message}`);
          }
        },
        {
          name: 'VueFetchSearchExecutor', // Optional name for debugging
        },
      );

      // Create the search optimizer with our custom executor
      const optimizer = createSearchOptimizer(searchExecutor, {
        debounceDelay: 400, // 400ms debounce
        minChars: 2, // Minimum 2 characters
        onSearchStart: () => {
          console.log('Search started');
        },
        onSearchSuccess: (results, query) => {
          console.log(`Found ${results.length} results for "${query}"`);
        },
        onSearchError: error => {
          console.error('Search error:', error);
        },
      });

      // Assign to ref for template access
      searchState.value = optimizer;
    });

    // Clean up on component unmount
    onBeforeUnmount(() => {
      if (searchState.value) {
        searchState.value.cancel();
      }
    });

    // Handle input changes
    const handleInput = event => {
      if (searchState.value) {
        searchState.value.setQuery(event.target.value);
      }
    };

    // Format price for display
    const formatPrice = price => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(price);
    };

    return {
      searchInput,
      searchState,
      handleInput,
      formatPrice,
    };
  },
};
</script>

<style scoped>
.search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.search-input-wrapper {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 15px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.search-input:focus {
  border-color: #4a90e2;
  outline: none;
}

.search-loader {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-results {
  margin-top: 20px;
}

.search-result-item {
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.search-result-item h3 {
  margin-top: 0;
  color: #333;
}

.search-result-item .price {
  font-weight: bold;
  color: #2c3e50;
  margin-top: 10px;
}

.search-error {
  padding: 15px;
  background-color: #ffecec;
  color: #f44336;
  border-radius: 4px;
  margin-bottom: 20px;
}

.search-no-results {
  padding: 20px;
  text-align: center;
  color: #666;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.search-stats {
  margin-top: 20px;
  padding: 10px;
  background-color: #eee;
  border-radius: 4px;
  font-size: 14px;
}

.reset-button {
  background-color: #4a90e2;
  color: white;
  border: none;
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.reset-button:hover {
  background-color: #3a80d2;
}
</style>
