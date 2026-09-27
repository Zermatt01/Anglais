/**
 * Stand-in for `virtual:pwa-register/react` in unit tests (see vitest.config.ts):
 * the service worker only exists in production builds, covered by the e2e tests.
 * Tests of the update banner replace it with `vi.mock`.
 */
import type { useRegisterSW as UseRegisterSW } from 'virtual:pwa-register/react';

export const useRegisterSW: typeof UseRegisterSW = () => ({
  needRefresh: [false, () => undefined],
  offlineReady: [false, () => undefined],
  updateServiceWorker: () => Promise.resolve(),
});
