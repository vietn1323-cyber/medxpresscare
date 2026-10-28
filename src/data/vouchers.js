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
    minOrderValue: 200000,
    maxDiscount: 35000,
    minQuantity: 1,
    usageLimit: 1000,
    usedCount: 0,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    applicableScope: 'all',
    applicableCategories: [],
    applicableProducts: [],
    enabled: true,
    badgeText: 'Freeship 100%',
    description: 'Miễn 100% cước Giao hàng nhanh toàn quốc cho đơn từ 200.000₫.'
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
    enabled: true,
    badgeText: 'Combo 6 Hộp -20%',
    description: 'Ưu đãi Combo 6 Hộp: Giảm sâu 20% tổng đơn, Miễn phí vận chuyển toàn quốc và Nhân đôi (X2) điểm tích lũy thành viên.'
  },
  {
    id: 'vouch-gift-01',
    code: 'QUATANG500',
    title: 'Quà Tặng Tri Ân Đơn Từ 500K',
    discountType: 'gift',
    giftName: 'Hộp Trà Thảo Mộc Đông Trùng Cao Cấp (15 túi lọc)',
    giftValue: 120000,
    giftImage: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80',
    discountValue: 0,
    minOrderValue: 500000,
    maxDiscount: 0,
    minQuantity: 1,
    comboTier: null,
    usageLimit: 500,
    usedCount: 0,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    applicableScope: 'all',
    applicableCategories: [],
    applicableProducts: [],
    enabled: true,
    badgeText: 'Tặng Trà Thảo Mộc 120K',
    description: 'Tặng ngay 01 Hộp Trà Thảo Mộc Đông Trùng cao cấp trị giá 120.000₫ cho đơn hàng từ 500.000₫.'
  },
  {
    id: 'vouch-gift-02',
    code: 'BINHYTE',
    title: 'Quà Tặng Bình Giữ Nhiệt Inox 316 Chuẩn Y Tế',
    discountType: 'gift',
    giftName: 'Bình Nước Giữ Nhiệt Kháng Khuẩn MedXpress 500ml',
    giftValue: 180000,
    giftImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
    discountValue: 0,
    minOrderValue: 1000000,
    maxDiscount: 0,
    minQuantity: 1,
    comboTier: null,
    usageLimit: 300,
    usedCount: 0,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    applicableScope: 'all',
    applicableCategories: [],
    applicableProducts: [],
    enabled: true,
    badgeText: 'Tặng Bình Giữ Nhiệt 180K',
    description: 'Tặng 01 Bình giữ nhiệt Inox 316 hiển thị nhiệt độ thông minh cho đơn hàng từ 1.000.000₫.'
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
  if (!voucher.applicableScope || voucher.applicableScope === 'all') return true;

  if (voucher.applicableScope === 'category') {
    return Array.isArray(voucher.applicableCategories) && voucher.applicableCategories.includes(product.category);
  }

  if (voucher.applicableScope === 'specific') {
    return Array.isArray(voucher.applicableProducts) && voucher.applicableProducts.includes(product.id);
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
 * Tính số tiền giảm giá từ voucher cho đơn hàng
 */
export const calculateVoucherDiscount = (voucher, subtotal = 0, currentShippingFee = 25000, cartItems = []) => {
  if (!voucher || !voucher.enabled) return { discountAmount: 0, shippingDiscount: 0, isValid: false, reason: 'Mã không tồn tại hoặc đã bị khóa' };

  if (subtotal < (voucher.minOrderValue || 0)) {
    const missing = voucher.minOrderValue - subtotal;
    return {
      discountAmount: 0,
      shippingDiscount: 0,
      isValid: false,
      reason: `Đơn hàng cần tối thiểu ${voucher.minOrderValue.toLocaleString('vi-VN')}₫ (còn thiếu ${missing.toLocaleString('vi-VN')}₫)`
    };
  }

  // Kiểm tra phạm vi thời gian (startDate & expiryDate)
  const timeStatus = getVoucherTimeStatus(voucher);
  if (timeStatus === 'upcoming') {
    return { discountAmount: 0, shippingDiscount: 0, isValid: false, reason: `Chương trình khuyến mại chưa bắt đầu (bắt đầu từ ${voucher.startDate})` };
  }
  if (timeStatus === 'expired') {
    return { discountAmount: 0, shippingDiscount: 0, isValid: false, reason: 'Mã giảm giá đã hết hạn sử dụng' };
  }

  // Kiểm tra giới hạn lượt dùng
  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
    return { discountAmount: 0, shippingDiscount: 0, isValid: false, reason: 'Mã giảm giá đã hết lượt sử dụng' };
  }

  // Kiểm tra phạm vi sản phẩm áp dụng nếu có danh sách giỏ hàng
  if (Array.isArray(cartItems) && cartItems.length > 0 && voucher.applicableScope && voucher.applicableScope !== 'all') {
    const eligibleItems = cartItems.filter(item => isVoucherApplicableToProduct(voucher, item));
    if (eligibleItems.length === 0) {
      return { 
        discountAmount: 0, 
        shippingDiscount: 0, 
        isValid: false, 
        reason: 'Mã khuyến mại này không áp dụng cho các sản phẩm trong giỏ hàng hiện tại' 
      };
    }
  }

  // Khuyến mại Tặng Quà (Gift Promotion)
  if (voucher.discountType === 'gift') {
    return {
      discountAmount: 0,
      shippingDiscount: 0,
      isGift: true,
      giftItem: {
        id: voucher.id,
        code: voucher.code,
        name: voucher.giftName || voucher.title || 'Quà tặng MedXpressCare',
        value: Number(voucher.giftValue) || 0,
        image: voucher.giftImage || 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600&auto=format&fit=crop&q=80',
        description: voucher.description || ''
      },
      isValid: true,
      reason: `Áp dụng thành công quà tặng: ${voucher.giftName || voucher.title}`
    };
  }

  if (voucher.discountType === 'shipping') {
    return {
      discountAmount: 0,
      shippingDiscount: currentShippingFee,
      isValid: true,
      reason: 'Áp dụng thành công miễn phí vận chuyển'
    };
  }

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

  // Fixed amount
  const finalDiscount = Math.min(voucher.discountValue, subtotal);
  return {
    discountAmount: finalDiscount,
    shippingDiscount: 0,
    isValid: true,
    reason: `Áp dụng thành công giảm ${finalDiscount.toLocaleString('vi-VN')}₫`
  };
};
