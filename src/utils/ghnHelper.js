/**
 * MedXpressCare - GHN (Giao Hàng Nhanh Express) Integration Helper
 * Xử lý kết nối API, tạo vận đơn thật, lấy mã vận đơn, in phiếu A5 và tra cứu hành trình bưu kiện
 */

/**
 * Kiểm tra kết nối API với GHN (gọi qua Cloudflare Worker proxy để tránh CORS)
 */
export async function testGhnConnection(apiKey, shopId, isDev = false) {
  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      message: 'Vui lòng nhập Token API của GHN.'
    };
  }

  try {
    const res = await fetch('/api/shipping/ghn/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey: apiKey.trim(),
        shopId: shopId ? String(shopId).trim() : '',
        isDev: Boolean(isDev)
      })
    });
    return await res.json();
  } catch (err) {
    return {
      success: false,
      message: `Lỗi kết nối cổng vận chuyển GHN: ${err.message}`
    };
  }
}

/**
 * Đẩy đơn hàng sang GHN để tạo vận đơn THẬT
 */
export async function createGhnOrder(order, ghnCarrier, storeConfig = {}) {
  if (!ghnCarrier || !ghnCarrier.apiKey) {
    throw new Error('Chưa cấu hình Token API cho Giao Hàng Nhanh (GHN)');
  }

  const res = await fetch('/api/shipping/ghn/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order,
      apiKey: ghnCarrier.apiKey,
      shopId: ghnCarrier.shopId,
      isDev: Boolean(ghnCarrier.isDev),
      storeConfig
    })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'GHN từ chối tạo vận đơn');
  }

  return data;
}

/**
 * Tra cứu hành trình bưu tá và trạng thái thực tế từ GHN
 */
export async function fetchGhnTrackingDetail(orderCode, ghnCarrier) {
  if (!orderCode) throw new Error('Thiếu mã vận đơn GHN');
  if (!ghnCarrier || !ghnCarrier.apiKey) throw new Error('Thiếu Token GHN');

  const res = await fetch('/api/shipping/ghn/tracking-detail', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderCode,
      apiKey: ghnCarrier.apiKey,
      isDev: Boolean(ghnCarrier.isDev)
    })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || 'Không thể tra cứu vận đơn từ GHN');
  }

  return data.data;
}

/**
 * Lấy link in phiếu gửi hàng A5 chuẩn chính thức của GHN
 */
export async function getGhnPrintUrl(orderCodes, ghnCarrier) {
  const codes = Array.isArray(orderCodes) ? orderCodes : [orderCodes];
  if (codes.length === 0) throw new Error('Thiếu mã vận đơn cần in');
  if (!ghnCarrier || !ghnCarrier.apiKey) throw new Error('Thiếu Token GHN');

  const res = await fetch('/api/shipping/ghn/print-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderCodes: codes,
      apiKey: ghnCarrier.apiKey,
      isDev: Boolean(ghnCarrier.isDev)
    })
  });

  const data = await res.json();
  if (!res.ok || !data.success || !data.printUrl) {
    throw new Error(data.message || 'Không thể lấy URL in phiếu từ GHN');
  }

  return data.printUrl;
}

/**
 * Hủy đơn hàng trên GHN
 */
export async function cancelGhnOrder(orderCodes, ghnCarrier) {
  const codes = Array.isArray(orderCodes) ? orderCodes : [orderCodes];
  const res = await fetch('/api/shipping/ghn/cancel-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderCodes: codes,
      apiKey: ghnCarrier.apiKey,
      isDev: Boolean(ghnCarrier.isDev)
    })
  });

  const data = await res.json();
  return data;
}

/**
 * Chuyển đổi trạng thái từ GHN sang trạng thái chuẩn của MedXpressCare
 */
export function mapGhnStatusToLocal(ghnStatus) {
  switch (ghnStatus) {
    case 'ready_to_pick':
    case 'picking':
    case 'money_collect_picking':
      return { status: 'confirmed', label: 'GHN chờ bưu tá lấy hàng', progress: 35 };
    case 'storing':
    case 'sorting':
      return { status: 'confirmed', label: 'Kiện hàng đã nhập kho GHN', progress: 50 };
    case 'delivering':
    case 'money_collect_delivering':
      return { status: 'shipping', label: 'Bưu tá GHN đang giao tới khách', progress: 75 };
    case 'delivered':
      return { status: 'completed', label: 'Giao hàng thành công', progress: 100 };
    case 'delivery_fail':
      return { status: 'returning', label: 'GHN báo giao không thành công', progress: 85 };
    case 'return':
    case 'returning':
      return { status: 'returning', label: 'GHN đang chuyển hoàn về kho', progress: 90 };
    case 'returned':
      return { status: 'returned_pending_check', label: 'Kiện hàng hoàn đã về tới kho', progress: 95 };
    case 'cancel':
      return { status: 'cancelled', label: 'Đã hủy trên GHN', progress: 0 };
    default:
      return { status: 'confirmed', label: `Bưu cục GHN: ${ghnStatus}`, progress: 50 };
  }
}
