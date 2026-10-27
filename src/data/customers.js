// Dữ liệu mẫu và các hàm xử lý tài khoản khách hàng & tích điểm MedXpressCare
// Quy tắc tích điểm:
// - Tích điểm: 100.000₫ giá trị đơn hàng = 1 điểm (Math.floor(subtotal / 100000))
// - Đổi điểm: 1 điểm = 1.000₫ giảm trừ trực tiếp vào đơn hàng kế tiếp

export const INITIAL_CUSTOMERS = [];

// Hàm tính số điểm tích lũy được: 100.000₫ = 1 điểm
export const calculateEarnedPoints = (orderAmount) => {
  if (!orderAmount || orderAmount <= 0) return 0;
  return Math.floor(orderAmount / 100000);
};

// Hàm quy đổi điểm sang tiền giảm trừ: 1 điểm = 1.000₫
export const calculatePointsDiscount = (points) => {
  if (!points || points <= 0) return 0;
  return Number(points) * 1000;
};

// Hàm tính điểm tối đa có thể dùng cho đơn hàng
export const calculateMaxPointsToUse = (userPoints, subtotal) => {
  if (!userPoints || userPoints <= 0 || !subtotal || subtotal <= 0) return 0;
  const maxPointsBySubtotal = Math.floor(subtotal / 1000);
  return Math.min(userPoints, maxPointsBySubtotal);
};
