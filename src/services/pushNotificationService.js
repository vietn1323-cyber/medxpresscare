import webpush from 'web-push';

export const VAPID_PUBLIC_KEY = 'BGiqquRV_799dDEJLH1DYpT-k957puxsiEPvORHnVoh2MZc2wRFxwEWtAJ45_CyQDUUWGrZO2em9KqHJNrybPgA';
export const VAPID_PRIVATE_KEY = 'ZmS4M078UwQACEzUmzsGgKQPaSHfcFR2ylEBQjxxaRY';
export const VAPID_SUBJECT = 'mailto:support@medxpresscare.com';

// Khởi tạo cấu hình VAPID chuẩn
try {
  webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
} catch (e) {
  console.warn('[WebPush] setVapidDetails init error:', e);
}

/**
 * Gửi thông báo đẩy chuẩn Web Push protocol (RFC 8030 / RFC 8291 / RFC 8292)
 * Ký VAPID chuẩn và mã hóa payload bằng aes128gcm với cặp khóa của thiết bị
 * @param {Object} subscription - Đối tượng subscription { endpoint, keys: { p256dh, auth } }
 * @param {Object|string} payload - Dữ liệu thông báo đẩy (title, body, icon, url, data...)
 * @param {Object} [options] - Tuỳ chọn thêm: TTL, urgency, topic...
 * @returns {Promise<Object>}
 */
export async function sendPushNotification(subscription, payload, options = {}) {
  if (!subscription || !subscription.endpoint) {
    throw new Error('Push subscription endpoint is required');
  }

  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.keys?.p256dh || subscription.p256dh,
      auth: subscription.keys?.auth || subscription.auth
    }
  };

  const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);

  const pushOptions = {
    TTL: options.TTL || 86400, // 24 giờ
    urgency: options.urgency || 'high',
    topic: options.topic || 'medxpress-reminder',
    ...options
  };

  try {
    const result = await webpush.sendNotification(pushSubscription, payloadString, pushOptions);
    return {
      success: true,
      statusCode: result.statusCode,
      headers: result.headers,
      body: result.body,
      endpoint: subscription.endpoint
    };
  } catch (error) {
    console.error(`[WebPush] sendNotification error (${subscription.endpoint}):`, error?.message || error);
    return {
      success: false,
      statusCode: error?.statusCode || 500,
      error: error?.message || String(error),
      endpoint: subscription.endpoint
    };
  }
}

export default {
  sendPushNotification,
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY,
  VAPID_SUBJECT
};
