import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ThemePreference } from '../domain/settings.ts';
import css from '../ui/theme.css?raw';
import { THEME_COLORS, useApplyTheme } from './use-apply-theme.ts';

function Probe({ preference }: { readonly preference: ThemePreference }) {
  useApplyTheme(preference);
  return null;
}

function themeColors(): string[] {
  return [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')].map(
    (meta) => meta.content,
  );
}

beforeEach(() => {
  document.head.innerHTML = `
    <meta name="theme-color" content="" media="(prefers-color-scheme: light)">
    <meta name="theme-color" content="" media="(prefers-color-scheme: dark)">`;
});

afterEach(() => {
  document.documentElement.removeAttribute('data-theme');
  document.head.innerHTML = '';
});

describe('useApplyTheme', () => {
  it('follows the phone by default', () => {
    render(<Probe preference="system" />);
    expect(document.documentElement).not.toHaveAttribute('data-theme');
    expect(themeColors()).toEqual([THEME_COLORS.light, THEME_COLORS.dark]);
  });

  it('forces the chosen scheme, toolbar colour included', () => {
    const { rerender } = render(<Probe preference="dark" />);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(themeColors()).toEqual([THEME_COLORS.dark, THEME_COLORS.dark]);

    rerender(<Probe preference="light" />);
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(themeColors()).toEqual([THEME_COLORS.light, THEME_COLORS.light]);

    rerender(<Probe preference="system" />);
    expect(document.documentElement).not.toHaveAttribute('data-theme');
  });

  it('uses the paper colours of theme.css', () => {
    expect(css).toContain(`--paper: light-dark(${THEME_COLORS.light}, ${THEME_COLORS.dark});`);
  });
});
