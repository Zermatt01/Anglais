import { useEffect } from 'react';

export const APP_NAME = 'Anglais';

/** Sets the browser tab title of a screen ("Réglages · Anglais"). */
export function usePageTitle(title: string | null): void {
  useEffect(() => {
    document.title = title === null ? APP_NAME : `${title} · ${APP_NAME}`;
  }, [title]);
}
