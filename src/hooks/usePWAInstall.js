import { useState, useEffect, useCallback } from 'react';

const DISMISS_STORAGE_KEY = 'medxpress_pwa_dismissed_until';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // 1. Check if running in Standalone mode (already installed & opened from home screen)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(Boolean(isStandaloneMode));
      if (isStandaloneMode) {
        setIsInstalled(true);
      }
    };
    checkStandalone();

    // 2. Platform detection
    const ua = (navigator.userAgent || '').toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    const isAndroidDevice = /android/.test(ua);
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // 3. Check dismissed timestamp
    try {
      const dismissedUntil = localStorage.getItem(DISMISS_STORAGE_KEY);
      if (dismissedUntil && Number(dismissedUntil) > Date.now()) {
        setIsBannerDismissed(true);
      }
    } catch {
      // Ignore storage errors
    }

    // 4. Listen for beforeinstallprompt event (Chrome, Edge, Android, Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('[PWA] beforeinstallprompt event captured.');
    };

    // 5. Listen for appinstalled event
    const handleAppInstalled = () => {
      console.log('[PWA] Ứng dụng đã được cài đặt thành công!');
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger installation
  const triggerInstall = useCallback(async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          console.log('[PWA] Người dùng đã chấp nhận cài đặt ứng dụng.');
          setIsInstalled(true);
        } else {
          console.log('[PWA] Người dùng từ chối cài đặt ứng dụng.');
        }
        setDeferredPrompt(null);
        return choiceResult.outcome;
      } catch (err) {
        console.warn('[PWA] Lỗi khi kích hoạt cài đặt:', err);
      }
    }
    return null;
  }, [deferredPrompt]);

  // Dismiss banner for 7 days
  const dismissBanner = useCallback((days = 7) => {
    setIsBannerDismissed(true);
    try {
      const expireTime = Date.now() + days * 24 * 60 * 60 * 1000;
      localStorage.setItem(DISMISS_STORAGE_KEY, String(expireTime));
    } catch {
      // Ignore storage errors
    }
  }, []);

  return {
    deferredPrompt,
    isInstallable: Boolean(deferredPrompt) || isIOS,
    isStandalone,
    isInstalled,
    isIOS,
    isAndroid,
    isBannerDismissed,
    triggerInstall,
    dismissBanner
  };
}
