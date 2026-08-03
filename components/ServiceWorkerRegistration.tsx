'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration(): null {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    // Disable service worker in development to avoid offline page on API errors
    if (process.env.NODE_ENV === 'development') {
      console.log('Service worker disabled in development');
      return;
    }

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered:', registration.scope);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                if (confirm('A new version is available. Reload to update?')) {
                  newWorker.postMessage({ type: 'SKIP_WAITING' });
                  window.location.reload();
                }
              }
            });
          }
        });
      } catch (error) {
        console.warn('SW registration failed:', error);
      }
    };

    register();
  }, []);

  return null;
}
