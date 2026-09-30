/** Rendering helpers for component tests, on a real in-memory database. */
import { render, type RenderResult } from '@testing-library/react';
import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router';
import { AppRoutes } from '../app/AppShell.tsx';
import {
  AppServicesContext,
  createAppServices,
  type AppServices,
  type ServerServices,
} from '../features/app-services.ts';
import type { SpeechSynthesizer } from '../domain/speech.ts';
import { createTestClock, createTestDatabase } from './database.ts';

/**
 * Services on a fresh in-memory database. By default no server is configured
 * and the device is online.
 */
export async function createTestServices(
  options: {
    readonly server?: ServerServices | null;
    readonly isOnline?: () => boolean;
    readonly speech?: SpeechSynthesizer | null;
  } = {},
): Promise<AppServices> {
  return createAppServices(await createTestDatabase(), createTestClock(), {
    server: options.server ?? null,
    isOnline: options.isOnline ?? (() => true),
    speech: options.speech ?? null,
  });
}

/** Renders `ui` with services (a fresh database unless given) and a router. */
export async function renderWithServices(
  ui: ReactNode,
  options: { services?: AppServices; path?: string } = {},
): Promise<RenderResult & { services: AppServices }> {
  const services = options.services ?? (await createTestServices());
  const result = render(
    <AppServicesContext value={services}>
      <MemoryRouter initialEntries={[options.path ?? '/']}>{ui}</MemoryRouter>
    </AppServicesContext>,
  );
  return { ...result, services };
}

/** Renders the whole application at `path`. */
export function renderApp(
  path: string,
  services?: AppServices,
): Promise<RenderResult & { services: AppServices }> {
  return renderWithServices(<AppRoutes />, { path, ...(services ? { services } : {}) });
}
