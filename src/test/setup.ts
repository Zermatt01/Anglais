import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest globals are disabled, so Testing Library cannot register its
// automatic cleanup: unmount rendered trees explicitly after each test.
afterEach(() => {
  cleanup();
});
