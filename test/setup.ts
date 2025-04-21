import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { cleanup } from '@testing-library/react-hooks';

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
