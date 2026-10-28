/**
 * Service Worker Registration for MedXpressCare PWA
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully with scope:', registration.scope);

          // Check for service worker updates periodically
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('[PWA] Nội dung mới đã sẵn sàng. Tải lại để cập nhật.');
                    window.dispatchEvent(new CustomEvent('pwa-updated', { detail: registration }));
                  } else {
                    console.log('[PWA] Ứng dụng đã được lưu vào bộ nhớ đệm để sử dụng ngoại tuyến.');
                    window.dispatchEvent(new CustomEvent('pwa-cached'));
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.warn('[PWA] Service Worker registration failed:', error);
        });
    });
  }
}
