import { useSyncExternalStore } from 'react';
import { useAppServices } from './app-services.ts';

function subscribe(listener: () => void): () => void {
  window.addEventListener('online', listener);
  window.addEventListener('offline', listener);
  return () => {
    window.removeEventListener('online', listener);
    window.removeEventListener('offline', listener);
  };
}

/** Whether the device has network, kept up to date. */
export function useOnline(): boolean {
  const { isOnline } = useAppServices();
  return useSyncExternalStore(subscribe, isOnline);
}
