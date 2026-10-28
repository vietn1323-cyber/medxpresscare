/**
 * MedXpressCare - GHN (Giao Hàng Nhanh Express) Integration Helper
 * Xử lý kết nối API, tạo vận đơn thật, lấy mã vận đơn, in phiếu A5 và tra cứu hành trình bưu kiện
 */

import { 
  GHN_PROVINCES, 
  GHN_DISTRICTS, 
  GHN_WARDS, 
  getGhnDistricts, 
  getGhnWards, 
  resolveGhnCodes 
} from '../data/ghnLocationData.js';

export { GHN_PROVINCES, GHN_DISTRICTS, GHN_WARDS, getGhnDistricts, getGhnWards, resolveGhnCodes };

/**
 * Lấy danh sách Tỉnh/Thành phố chuẩn từ GHN Master Data API
 */
export async function fetchGhnProvinces(apiKey = '') {
  try {
    const res = await fetch('/api/shipping/ghn/master-data/provinces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });
    const result = await res.json();
    return result.data || GHN_PROVINCES;
  } catch (err) {
    return GHN_PROVINCES;
  }
}

/**
 * Lấy danh sách Quận/Huyện của GHN theo ProvinceID
 */
export async function fetchGhnDistricts(provinceId, apiKey = '') {
  try {
    const res = await fetch('/api/shipping/ghn/master-data/districts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provinceId, apiKey })
    });
    const result = await res.json();
    return result.data || getGhnDistricts(provinceId);
  } catch (err) {
    return getGhnDistricts(provinceId);
  }
}

/**
 * Lấy danh sách Phường/Xã chuẩn của GHN theo to_district_id kèm WardCode
 */
export async function fetchGhnWards(districtId, apiKey = '') {
  try {
    const res = await fetch('/api/shipping/ghn/master-data/wards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ districtId, apiKey })
    });
    const result = await res.json();
    return result.data || getGhnWards(districtId);
  } catch (err) {
    return getGhnWards(districtId);
  }
}

/**
 * Kiểm tra kết nối API với GHN (gọi qua Cloudflare Worker proxy để tránh CORS)
 */
export async function testGhnConnection(apiKey, shopId) {
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
        shopId: shopId ? String(shopId).trim() : ''
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

  // Bước 1: Log/print Payload Request trước khi đẩy đi
  console.log('[GHN Frontend Dispatch Request]', {
    order_id: order.id,
    to_name: order.customer?.fullName || order.customer?.name,
    to_phone: order.customer?.phone,
    to_address: order.customer?.address,
    to_district_id: order.customer?.to_district_id || order.customer?.districtId,
    to_ward_code: order.customer?.to_ward_code || order.customer?.wardCode,
    service_type_id: 2
  });

  const res = await fetch('/api/shipping/ghn/create-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order,
      apiKey: ghnCarrier.apiKey,
      shopId: ghnCarrier.shopId,
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
      apiKey: ghnCarrier.apiKey
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
      apiKey: ghnCarrier.apiKey
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
      apiKey: ghnCarrier.apiKey
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
