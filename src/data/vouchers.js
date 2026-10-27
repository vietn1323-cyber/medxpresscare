// Dữ liệu Mã Giảm Giá & Khuyến Mãi MedXpressCare.com
// Hỗ trợ Voucher giảm tiền cố định, giảm theo %, Freeship và điều kiện đơn tối thiểu

export const DEFAULT_VOUCHERS = [
  {
    id: 'vouch-01',
    code: 'MEDXPRESS50',
    title: 'Ưu Đãi Khách Hàng Mới',
    discountType: 'fixed', // 'fixed' | 'percent' | 'shipping'
    discountValue: 50000,
    minOrderValue: 400000,
    maxDiscount: 50000,
    usageLimit: 500,
    usedCount: 142,
    expiryDate: '2026-12-31',
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
    usageLimit: 1000,
    usedCount: 524,
    expiryDate: '2026-12-31',
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
    usageLimit: 300,
    usedCount: 89,
    expiryDate: '2026-12-31',
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
    usageLimit: 200,
    usedCount: 65,
    expiryDate: '2026-12-31',
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
    usageLimit: 150,
    usedCount: 41,
    expiryDate: '2026-12-31',
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
    minOrderValue: 400000,
    maxDiscount: 300000,
    usageLimit: 1000,
    usedCount: 168,
    expiryDate: '2026-12-31',
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
    minOrderValue: 800000,
    maxDiscount: 600000,
    usageLimit: 1000,
    usedCount: 92,
    expiryDate: '2026-12-31',
    enabled: true,
    badgeText: 'Combo 6 Hộp -20%',
    description: 'Ưu đãi Combo 6 Hộp: Giảm sâu 20% tổng đơn, Miễn phí vận chuyển toàn quốc và Nhân đôi (X2) điểm tích lũy thành viên.'
  }
];

/**
 * Tính số tiền giảm giá từ voucher cho đơn hàng
 */
export const calculateVoucherDiscount = (voucher, subtotal = 0, currentShippingFee = 25000) => {
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

  // Kiểm tra hạn sử dụng
  if (voucher.expiryDate) {
    const now = new Date();
    const exp = new Date(voucher.expiryDate);
    if (now > exp) {
      return { discountAmount: 0, shippingDiscount: 0, isValid: false, reason: 'Mã giảm giá đã hết hạn sử dụng' };
    }
  }

  // Kiểm tra giới hạn lượt dùng
  if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
    return { discountAmount: 0, shippingDiscount: 0, isValid: false, reason: 'Mã giảm giá đã hết lượt sử dụng' };
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
