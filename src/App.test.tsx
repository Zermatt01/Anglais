import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App.tsx';

describe('App (Phase 0 placeholder)', () => {
  it('renders the French placeholder page', () => {
    render(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'Anglais' })).toBeInTheDocument();
    expect(screen.getByText('Application en construction.')).toBeInTheDocument();
  });
});
