import '@testing-library/jest-dom/vitest';
// In-memory IndexedDB for Dexie in tests. Each test opens its own database
// name (see `createTestDatabase`), so tests never share data.
import 'fake-indexeddb/auto';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Vitest globals are disabled, so Testing Library cannot register its
// automatic cleanup: unmount rendered trees explicitly after each test.
afterEach(() => {
  cleanup();
});
