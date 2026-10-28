/**
 * MedXpressCare - Cloudflare Web Push Client Helper
 * Quản lý đăng ký Web Push API, lưu token thiết bị và cấp quyền thông báo
 */

export const VAPID_PUBLIC_KEY = 'BGiqquRV_799dDEJLH1DYpT-k957puxsiEPvORHnVoh2MZc2wRFxwEWtAJ45_CyQDUUWGrZO2em9KqHJNrybPgA';

/**
 * Chuyển đổi VAPID base64url sang Uint8Array theo chuẩn RFC 8292
 */
export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Kiểm tra xem trình duyệt / thiết bị có hỗ trợ Web Push hay không
 */
export function isPushNotificationSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

/**
 * Lấy trạng thái quyền hiện tại ('default' | 'granted' | 'denied')
 */
export function getNotificationPermissionState() {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

/**
 * Yêu cầu quyền thông báo từ người dùng
 */
export async function requestNotificationPermission() {
  if (!isPushNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('[WebPush] Error requesting permission:', err);
    return 'denied';
  }
}

/**
 * Đăng ký Push Manager và gửi Subscription lên Cloudflare Worker
 */
export async function subscribeUserToPush(customer = null) {
  if (!isPushNotificationSupported()) {
    throw new Error('Thiết bị hoặc trình duyệt này không hỗ trợ Web Push');
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    throw new Error('Người dùng chưa cấp quyền nhận thông báo');
  }

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    const convertedKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey
    });
  }

  // Gửi subscription lên Backend Cloudflare Worker lưu vào D1 Database
  const subData = subscription.toJSON();
  const payload = {
    endpoint: subData.endpoint,
    keys: subData.keys,
    customerId: customer?.id || null,
    customerName: customer?.fullName || null,
    customerPhone: customer?.phone || null,
    userAgent: navigator.userAgent,
    platform: navigator.platform || 'web',
    timestamp: new Date().toISOString()
  };

  try {
    const res = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json().catch(() => ({}));
    console.log('[WebPush] Subscribed successfully to Cloudflare D1:', result);
  } catch (err) {
    console.warn('[WebPush] Could not sync subscription to backend, caching locally:', err);
  }

  // Lưu trạng thái vào localStorage
  localStorage.setItem('medxpress_push_subscribed', 'true');
  localStorage.setItem('medxpress_push_subscription', JSON.stringify(payload));

  return subscription;
}

/**
 * Hủy đăng ký nhận thông báo
 */
export async function unsubscribeUserFromPush() {
  if (!isPushNotificationSupported()) return false;
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      try {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem('medxpress_push_subscribed');
    localStorage.removeItem('medxpress_push_subscription');
    return true;
  } catch (err) {
    console.error('[WebPush] Error unsubscribing:', err);
    return false;
  }
}

/**
 * Gửi thông báo đẩy thông qua Backend Cloudflare Worker (Ký VAPID chuẩn RFC 8292 & web-push)
 */
export async function sendPushNotification(payload, endpoint = null) {
  try {
    const res = await fetch('/api/push/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: payload.title || 'MedXpressCare - Nhắc Nhở',
        body: payload.body || 'Đã đến giờ uống thuốc theo phác đồ Dược sĩ AI!',
        icon: payload.icon || '/pwa-192x192.png',
        url: payload.url || '/',
        endpoint: endpoint || undefined
      })
    });
    return await res.json();
  } catch (err) {
    console.error('[WebPush] Error sending push via backend:', err);
    throw err;
  }
}
