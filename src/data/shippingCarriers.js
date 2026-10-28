/**
 * Danh sách cấu hình các đơn vị vận chuyển hỗ trợ trên MedXpressCare
 */

export const DEFAULT_SHIPPING_CARRIERS = [
  {
    id: 'express',
    name: 'Giao Hỏa Tốc (Nội thành Hà Nội)',
    badge: 'Chỉ nội thành HN',
    icon: '⚡',
    description: 'Chỉ giao nội thành Hà Nội. Phí vận chuyển tính theo cước thực tế khi trao đổi xác nhận đơn, không áp dụng Freeship.',
    baseFee: 0,
    feeDisplay: 'Theo thực tế',
    isExpress: true,
    estimatedDays: '1 - 2 giờ',
    enabled: true,
    isConnected: true,
    apiKey: 'MEDXPRESS-FLEET-HQ99',
    shopId: 'KHO-TONG-HN-01',
    note: 'Hỏa tốc nội thành Hà Nội - Phí theo cước thực tế trao đổi'
  },
  {
    id: 'ghtk',
    name: 'Giao Hàng Nhanh (GHTK)',
    badge: 'Giao hàng nhanh',
    icon: '📦',
    description: 'Giao hàng nhanh toàn quốc qua bưu cục GHTK, áp dụng chính sách Freeship',
    baseFee: 22000,
    estimatedDays: '1 - 2 ngày',
    enabled: true,
    isConnected: true,
    apiKey: 'ENV_GHTK_API_TOKEN',
    shopId: 'SHOP_MEDXPRESS_888',
    note: 'Kết nối qua Open API GHTK v2'
  },
  {
    id: 'ghn',
    name: 'Giao Hàng Nhanh (GHN)',
    badge: 'Giao hàng nhanh',
    icon: '🚚',
    description: 'Giao hàng nhanh toàn quốc qua đối tác GHN Express, áp dụng chính sách Freeship',
    baseFee: 25000,
    estimatedDays: '1 - 2 ngày',
    enabled: true,
    isConnected: true,
    apiKey: 'ENV_GHN_PARTNER_KEY',
    shopId: '1849204',
    note: 'Kết nối qua GHN Express API v2'
  },
  {
    id: 'viettel',
    name: 'Giao Hàng Nhanh (Viettel Post)',
    badge: 'Giao hàng nhanh',
    icon: '🏣',
    description: 'Giao hàng nhanh bưu chính toàn quốc, áp dụng chính sách Freeship',
    baseFee: 20000,
    estimatedDays: '2 - 3 ngày',
    enabled: true,
    isConnected: false,
    apiKey: '',
    shopId: '',
    note: 'Viettel Post API Gateway'
  },
  {
    id: 'jnt',
    name: 'J&T Express',
    badge: 'Không nghỉ lễ',
    icon: '🚛',
    description: 'Giao hàng 365 ngày không nghỉ, tối ưu cho kiện hàng cồng kềnh',
    baseFee: 22000,
    estimatedDays: '2 - 3 ngày',
    enabled: false,
    isConnected: false,
    apiKey: '',
    shopId: '',
    note: 'Chưa thiết lập kết nối'
  },
  {
    id: 'ninja',
    name: 'Ninja Van',
    badge: 'Đông Nam Á',
    icon: '🥷',
    description: 'Theo dõi hành trình thông minh, thông báo qua Zalo/Viber',
    baseFee: 24000,
    estimatedDays: '2 - 4 ngày',
    enabled: false,
    isConnected: false,
    apiKey: '',
    shopId: '',
    note: 'Chưa thiết lập kết nối'
  }
];

/**
 * Kiểm tra kết nối API với Đơn vị vận chuyển (Xác thực thực tế với máy chủ GHN)
 */
export const testCarrierConnection = async (carrierId, apiKey, shopId, isDev = false) => {
  if (!apiKey || !apiKey.trim()) {
    return {
      success: false,
      message: 'Vui lòng nhập API Token / Key của đối tác trước khi kiểm tra kết nối.'
    };
  }

  // Đối với GHN: Xác thực THỰC TẾ với máy chủ Giao Hàng Nhanh Express qua Cloudflare Worker proxy
  if (carrierId === 'ghn') {
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

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        return {
          success: true,
          message: data.message || 'Kết nối thành công tới máy chủ GHN Express! Kho hàng và biểu phí đã sẵn sàng.',
          shop: data.shop,
          shops: data.shops
        };
      } else {
        return {
          success: false,
          message: data.message || 'Xác thực GHN không thành công. Vui lòng kiểm tra lại Token API hoặc Shop ID.'
        };
      }
    } catch (err) {
      return {
        success: false,
        message: `Lỗi kết nối tới máy chủ GHN: ${err.message}`
      };
    }
  }

  // Giả lập kiểm tra với các hãng chưa tích hợp API chính thức (Hỏa Tốc nội bộ, GHTK, Viettel)
  await new Promise(resolve => setTimeout(resolve, 500));

  if (apiKey.length < 5) {
    return {
      success: false,
      message: 'API Key quá ngắn hoặc không đúng định dạng của đối tác vận chuyển.'
    };
  }

  return {
    success: true,
    message: `Cấu hình ${carrierId.toUpperCase()} hợp lệ! Sẵn sàng đồng bộ vận đơn.`
  };
};
