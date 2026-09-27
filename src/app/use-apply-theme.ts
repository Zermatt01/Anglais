import { useEffect } from 'react';
import type { ThemePreference } from '../domain/settings.ts';

/** Paper colour of each scheme (`--paper` in theme.css), for the browser's toolbar. */
export const THEME_COLORS = { light: '#fbf8f1', dark: '#16181d' } as const;

/**
 * Applies the theme chosen in the settings: `data-theme` on the root element
 * forces a scheme; without it, theme.css follows the phone.
 */
export function useApplyTheme(preference: ThemePreference): void {
  useEffect(() => {
    const root = document.documentElement;
    if (preference === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', preference);

    // index.html declares one theme-color per scheme, selected by a media query.
    for (const meta of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) {
      const media = meta.getAttribute('media') ?? '';
      const scheme =
        preference === 'system' ? (media.includes('dark') ? 'dark' : 'light') : preference;
      meta.content = THEME_COLORS[scheme];
    }
  }, [preference]);
}
