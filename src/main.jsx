import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { registerServiceWorker } from './registerSW.js'

// Register PWA Service Worker for offline capabilities & mobile installation
registerServiceWorker()

// Chống zoom in / zoom out toàn bộ trang trên thiết bị di động (iOS Safari, Android Chrome, PWA Mobile App)
if (typeof window !== 'undefined') {
  // 1. Chống iOS gesture zoom (Pinch-to-zoom)
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());

  // 2. Chống multi-touch pinch zoom
  document.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 1) {
      e.preventDefault();
    }
  }, { passive: false });

  // 3. Chống double-tap to zoom (nhấp đúp màn hình phóng to)
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    // Không chặn thao tác chạm trên ô nhập liệu (input, textarea)
    const targetTag = e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '';
    if (targetTag !== 'input' && targetTag !== 'textarea') {
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
    }
    lastTouchEnd = now;
  }, false);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
