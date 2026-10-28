// Dữ liệu Mã Giảm Giá & Khuyến Mãi MedXpressCare.com
// Hỗ trợ Voucher giảm tiền cố định, giảm theo %, Freeship, phạm vi thời gian và phạm vi sản phẩm áp dụng

export const DEFAULT_VOUCHERS = [
  {
    id: 'vouch-01',
    code: 'MEDXPRESS50',
    title: 'Ưu Đãi Khách Hàng Mới',
    discountType: 'fixed', // 'fixed' | 'percent' | 'shipping'
    discountValue: 50000,
    minOrderValue: 400000,
    maxDiscount: 50000,
    minQuantity: 1,
    usageLimit: 500,
    usedCount: 0,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    applicableScope: 'all', // 'all' | 'category' | 'specific'
    applicableCategories: [],
    applicableProducts: [],
    target_customer: 'all', // 'all' | 'new' | 'vip'
    enabled: true,
    badgeText: 'Giảm 50.000₫',
    description: 'Giảm ngay 50.000₫ cho đơn hàng Thực phẩm chức năng từ 400.000₫ trở lên.'
  },
  {
    id: 'vouch-02',
    code: 'FREESHIP',
    title: 'Miễn Phí Giao Hàng Nhanh Toàn Quốc',
    discountType: 'shipping',
    discountValue: 35000,
    minOrderValue: 500000,
    maxDiscount: 35000,
    minQuantity: 1,
    usageLimit: 1000,
    usedCount: 0,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    applicableScope: 'all',
    applicableCategories: [],
    applicableProducts: [],
    target_customer: 'all',
    enabled: true,
    badgeText: 'Freeship 100%',
    description: 'Miễn 100% cước Giao hàng nhanh toàn quốc cho đơn từ 500.000₫.'
  },
  {
    id: 'vouch-03',
    code: 'TRIAN10',
    title: 'Tri Ân Khách Hàng Thân Thiết',
    discountType: 'percent',
    discountValue: 10,
    minOrderValue: 600000,
    maxDiscount: 100000,
    minQuantity: 1,
    usageLimit: 300,
    usedCount: 0,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    applicableScope: 'all',
    applicableCategories: [],
    applicableProducts: [],
    target_customer: 'all',
    enabled: true,
    badgeText: 'Giảm 10%',
    description: 'Giảm 10% (tối đa 100.000₫) cho đơn hàng từ 600.000₫.'
  },
  {
    id: 'vouch-04',
    code: 'DUOCSI30',
    title: 'Ưu Đãi Tư Vấn Dược Sĩ AI 24/7',
    discountType: 'fixed',
    discountValue: 30000,
    minOrderValue: 300000,
    maxDiscount: 30000,
    minQuantity: 1,
    usageLimit: 200,
    usedCount: 0,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    applicableScope: 'all',
    applicableCategories: [],
    applicableProducts: [],
    target_customer: 'all',
    enabled: true,
    badgeText: 'Giảm 30.000₫',
    description: 'Quà tặng khi khách hàng hoàn tất tư vấn thể trạng cùng Dược sĩ AI.'
  },
  {
    id: 'vouch-05',
    code: 'COMBO15',
    title: 'Ưu Đãi Liệu Trình Toàn Diện',
    discountType: 'percent',
    discountValue: 15,
    minOrderValue: 1200000,
    maxDiscount: 200000,
    minQuantity: 1,
    usageLimit: 150,
    usedCount: 0,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    applicableScope: 'all',
    applicableCategories: [],
    applicableProducts: [],
    target_customer: 'all',
    enabled: true,
    badgeText: 'Giảm 15%',
    description: 'Giảm 15% tối đa 200.000₫ khi mua liệu trình 2-3 hộp chăm sóc sức khỏe.'
  },
  {
    id: 'vouch-combo-3',
    code: 'COMBO3HOP',
    title: 'Khuyến Mại Combo Liệu Trình 3 Hộp',
    discountType: 'percent',
    discountValue: 10,
    minOrderValue: 0,
    maxDiscount: 500000,
    minQuantity: 3,
    comboTier: 3,
    usageLimit: 1000,
    usedCount: 0,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    applicableScope: 'all',
    applicableCategories: [],
    applicableProducts: [],
    target_customer: 'all',
    enabled: true,
    badgeText: 'Combo 3 Hộp -10%',
    description: 'Ưu đãi Combo 3 Hộp: Giảm ngay 10% đơn giá sản phẩm và Miễn 100% cước Giao hàng nhanh toàn quốc.'
  },
  {
    id: 'vouch-combo-6',
    code: 'COMBO6HOP',
    title: 'Khuyến Mại Combo Chuyên Sâu 6 Hộp',
    discountType: 'percent',
    discountValue: 20,
    minOrderValue: 0,
    maxDiscount: 1000000,
    minQuantity: 6,
    comboTier: 6,
    usageLimit: 1000,
    usedCount: 0,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    applicableScope: 'all',
    applicableCategories: [],
    applicableProducts: [],
    target_customer: 'all',
    enabled: true,
    badgeText: 'Combo 6 Hộp -20%',
    description: 'Ưu đãi Combo 6 Hộp: Giảm sâu 20% tổng đơn, Miễn phí vận chuyển toàn quốc và Nhân đôi (X2) điểm tích lũy thành viên.'
  }
];

/**
 * Kiểm tra phạm vi thời gian hiệu lực của voucher
 */
export const isVoucherTimeValid = (voucher, checkDate = new Date()) => {
  if (!voucher) return false;
  const now = new Date(checkDate);
  
  if (voucher.startDate) {
    const start = new Date(voucher.startDate);
    start.setHours(0, 0, 0, 0);
    if (now < start) return false;
  }
  
  if (voucher.expiryDate) {
    const end = new Date(voucher.expiryDate);
    end.setHours(23, 59, 59, 999);
    if (now > end) return false;
  }
  
  return true;
};

/**
 * Lấy trạng thái thời gian của voucher ('upcoming' | 'active' | 'expired')
 */
export const getVoucherTimeStatus = (voucher, checkDate = new Date()) => {
  if (!voucher) return 'expired';
  const now = new Date(checkDate);

  if (voucher.startDate) {
    const start = new Date(voucher.startDate);
    start.setHours(0, 0, 0, 0);
    if (now < start) return 'upcoming';
  }

  if (voucher.expiryDate) {
    const end = new Date(voucher.expiryDate);
    end.setHours(23, 59, 59, 999);
    if (now > end) return 'expired';
  }

  return 'active';
};

/**
 * Kiểm tra xem voucher có áp dụng cho sản phẩm cụ thể hay không
 */
export const isVoucherApplicableToProduct = (voucher, product) => {
  if (!voucher || !product) return false;
  const scope = voucher.applicableScope || voucher.scope || 'all';
  if (scope === 'all') return true;

  if (scope === 'category') {
    const categories = voucher.applicableCategories || voucher.category_ids || [];
    return Array.isArray(categories) && categories.includes(product.category);
  }

  if (scope === 'specific') {
    const products = voucher.applicableProducts || voucher.product_ids || [];
    const prodId = product.id || product.productId;
    return Array.isArray(products) && products.includes(prodId);
  }

  return true;
};

/**
 * Lấy thông tin khuyến mại combo (mua 3, mua 6) áp dụng cho sản phẩm này dựa trên chương trình khuyến mại thực tế
 */
export const getProductComboPromotions = (product, vouchers = DEFAULT_VOUCHERS) => {
  if (!product) return { hasAnyCombo: false, promo3: null, promo6: null };
  const activeVouchers = Array.isArray(vouchers) && vouchers.length > 0 ? vouchers : DEFAULT_VOUCHERS;

  // 1. Tìm voucher Combo 3 hộp áp dụng cho sản phẩm này
  const promo3Voucher = activeVouchers.find(v => 
    v.enabled && 
    isVoucherTimeValid(v) && 
    isVoucherApplicableToProduct(v, product) && 
    (v.comboTier === 3 || v.minQuantity === 3 || v.code === 'COMBO3HOP')
  );

  // 2. Tìm voucher Combo 6 hộp áp dụng cho sản phẩm này
  const promo6Voucher = activeVouchers.find(v => 
    v.enabled && 
    isVoucherTimeValid(v) && 
    isVoucherApplicableToProduct(v, product) && 
    (v.comboTier === 6 || v.minQuantity === 6 || v.code === 'COMBO6HOP')
  );

  const promo3 = promo3Voucher ? {
    discountPercent: Number(promo3Voucher.discountValue) || 10,
    title: promo3Voucher.title,
    badgeText: promo3Voucher.badgeText || `Combo 3 Hộp -${promo3Voucher.discountValue}%`,
    description: promo3Voucher.description,
    code: promo3Voucher.code,
    voucher: promo3Voucher
  } : null;

  const promo6 = promo6Voucher ? {
    discountPercent: Number(promo6Voucher.discountValue) || 20,
    title: promo6Voucher.title,
    badgeText: promo6Voucher.badgeText || `Combo 6 Hộp -${promo6Voucher.discountValue}%`,
    description: promo6Voucher.description,
    code: promo6Voucher.code,
    voucher: promo6Voucher
  } : null;

  return {
    hasAnyCombo: !!(promo3 || promo6),
    promo3,
    promo6
  };
};

/**
 * Lấy các chương trình khuyến mại tặng quà (Gift Promotions) áp dụng cho sản phẩm này
 */
export const getProductGiftPromotions = (product, vouchers = DEFAULT_VOUCHERS) => {
  if (!product) return [];
  const activeVouchers = Array.isArray(vouchers) && vouchers.length > 0 ? vouchers : DEFAULT_VOUCHERS;
  return activeVouchers.filter(v => 
    v.enabled && 
    v.discountType === 'gift' && 
    isVoucherTimeValid(v) && 
    isVoucherApplicableToProduct(v, product)
  );
};

/**
 * Tính số tiền giảm giá từ voucher cho đơn hàng (Voucher Validator)
 * Hỗ trợ xác thực:
 * 1. Authentication Check nghiêm ngặt cho target_customer ('new' | 'vip')
 * 2. Phạm vi sản phẩm áp dụng ('all' | 'category' | 'specific')
 * 3. Hạn mức đơn tối thiểu, thời gian, lượt sử dụng
 */
export const calculateVoucherDiscount = (
  voucher, 
  subtotal = 0, 
  currentShippingFee = 25000, 
  cartItems = [], 
  currentUser = null, 
  options = {}
) => {
  if (!voucher || !voucher.enabled) {
    return { discountAmount: 0, shippingDiscount: 0, isValid: false, reason: 'Mã không tồn tại hoặc đã bị khóa' };
  }

  // 1. KIỂM TRA ĐỐI TƯỢNG KHÁCH HÀNG (target_customer) & TRẠNG THÁI ĐĂNG NHẬP (AUTHENTICATION CHECK)
  const targetCustomer = voucher.target_customer || voucher.targetCustomer || 'all';

  if (targetCustomer === 'new' || targetCustomer === 'Khách hàng mới') {
    if (!currentUser) {
      return {
        discountAmount: 0,
        shippingDiscount: 0,
        isValid: false,
        requiresAuth: true,
        targetCustomer: 'new',
        reason: 'Ưu đãi này chỉ dành cho thành viên. Vui lòng đăng nhập hoặc đăng ký tài khoản để áp dụng.'
      };
    }

    // Đã đăng nhập: Kiểm tra tài khoản có số đơn hàng thành công = 0 trên hệ thống
    const orderCount = Number(currentUser.orderCount) || 0;
    const historyCount = Array.isArray(currentUser.ordersHistory) ? currentUser.ordersHistory.length : 0;
    const hasSuccessfulOrders = orderCount > 0 || historyCount > 0 || Boolean(currentUser.hasOrdered);

    if (hasSuccessfulOrders) {
      return {
        discountAmount: 0,
        shippingDiscount: 0,
        isValid: false,
        requiresAuth: false,
        targetCustomer: 'new',
        reason: 'Ưu đãi này chỉ áp dụng cho đơn hàng đầu tiên của khách hàng mới.'
      };
    }
  } else if (targetCustomer === 'vip' || targetCustomer === 'Khách hàng thân thiết / VIP') {
    if (!currentUser) {
      return {
        discountAmount: 0,
        shippingDiscount: 0,
        isValid: false,
        requiresAuth: true,
        targetCustomer: 'vip',
        reason: 'Ưu đãi này chỉ dành cho thành viên. Vui lòng đăng nhập hoặc đăng ký tài khoản để áp dụng.'
      };
    }

    // Đã đăng nhập: Kiểm tra tài khoản đã được gắn tag VIP hoặc dựa trên lịch sử mua hàng
    const isVip = Boolean(
      currentUser.isVip || 
      currentUser.tier === 'vip' || 
      (typeof currentUser.tier === 'string' && currentUser.tier.toLowerCase().includes('vip')) ||
      (Number(currentUser.totalSpent) >= 2000000) ||
      (Number(currentUser.points) >= 50) ||
      (Number(currentUser.orderCount) >= 3)
    );

    if (!isVip) {
      return {
        discountAmount: 0,
        shippingDiscount: 0,
        isValid: false,
        requiresAuth: false,
        targetCustomer: 'vip',
        reason: 'Ưu đãi này chỉ dành cho khách hàng thân thiết / VIP.'
      };
    }
  }

  // 2. KIỂM TRA ĐIỀU KIỆN GIÁ TRỊ ĐƠN HÀNG TỐI THIỂU
  if (subtotal < (voucher.minOrderValue || 0)) {
    const missing = (voucher.minOrderValue || 0) - subtotal;
    return {
      discountAmount: 0,
      shippingDiscount: 0,
      isValid: false,
      reason: `Đơn hàng cần tối thiểu ${(voucher.minOrderValue || 0).toLocaleString('vi-VN')}₫ (còn thiếu ${missing.toLocaleString('vi-VN')}₫)`
    };
  }

  // 3. KIỂM TRA PHẠM VI THỜI GIAN
  const timeStatus = getVoucherTimeStatus(voucher);
  if (timeStatus === 'upcoming') {
    return { discountAmount: 0, shippingDiscount: 0, isValid: false, reason: `Chương trình khuyến mại chưa bắt đầu (bắt đầu từ ${voucher.startDate})` };
  }
  if (timeStatus === 'expired') {
    return { discountAmount: 0, shippingDiscount: 0, isValid: false, reason: 'Mã giảm giá đã hết hạn sử dụng' };
  }

  // 4. KIỂM TRA GIỚI HẠN LƯỢT DÙNG
  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
    return { discountAmount: 0, shippingDiscount: 0, isValid: false, reason: 'Mã giảm giá đã hết lượt sử dụng' };
  }

  // 5. KIỂM TRA PHẠM VI SẢN PHẨM ÁP DỤNG (PRODUCT SCOPE CHECK)
  const scope = voucher.applicableScope || voucher.scope || 'all';
  if (Array.isArray(cartItems) && cartItems.length > 0 && scope !== 'all') {
    const eligibleItems = cartItems.filter(item => isVoucherApplicableToProduct(voucher, item));
    if (eligibleItems.length === 0) {
      if (scope === 'category') {
        return { 
          discountAmount: 0, 
          shippingDiscount: 0, 
          isValid: false, 
          reason: 'Mã giảm giá này chỉ áp dụng cho sản phẩm thuộc danh mục quy định.' 
        };
      }
      return { 
        discountAmount: 0, 
        shippingDiscount: 0, 
        isValid: false, 
        reason: 'Mã giảm giá này chỉ áp dụng cho một số sản phẩm chỉ định trong chương trình.' 
      };
    }
  }

  // 6. KHUYẾN MẠI TẶNG QUÀ
  if (voucher.discountType === 'gift') {
    return {
      discountAmount: 0,
      shippingDiscount: 0,
      isGift: true,
      giftItem: {
        id: voucher.giftProductId || voucher.id,
        voucherId: voucher.id,
        productId: voucher.giftProductId || null,
        code: voucher.code,
        name: voucher.giftName || voucher.title || 'Quà tặng chính hãng',
        value: Number(voucher.giftValue) || 0,
        image: voucher.giftImage || '/logo-icon.png',
        description: voucher.description || ''
      },
      isValid: true,
      reason: `Áp dụng thành công quà tặng: ${voucher.giftName || voucher.title}`
    };
  }

  // 7. KHUYẾN MẠI MIỄN PHÍ VẬN CHUYỂN
  if (voucher.discountType === 'shipping') {
    return {
      discountAmount: 0,
      shippingDiscount: currentShippingFee,
      isValid: true,
      reason: 'Áp dụng thành công miễn phí vận chuyển'
    };
  }

  // 8. KHUYẾN MẠI GIẢM THEO PHẦN TRĂM (%)
  if (voucher.discountType === 'percent') {
    const calc = Math.round(subtotal * (voucher.discountValue / 100));
    const capped = voucher.maxDiscount ? Math.min(calc, voucher.maxDiscount) : calc;
    return {
      discountAmount: capped,
      shippingDiscount: 0,
      isValid: true,
      reason: `Áp dụng thành công giảm ${voucher.discountValue}% (-${capped.toLocaleString('vi-VN')}₫)`
    };
  }

  // 9. KHUYẾN MẠI SỐ TIỀN CỐ ĐỊNH
  const finalDiscount = Math.min(voucher.discountValue, subtotal);
  return {
    discountAmount: finalDiscount,
    shippingDiscount: 0,
    isValid: true,
    reason: `Áp dụng thành công giảm ${finalDiscount.toLocaleString('vi-VN')}₫`
  };
};
