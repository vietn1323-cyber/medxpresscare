// Dữ liệu mẫu và các hàm xử lý tài khoản khách hàng & tích điểm MedXpressCare
// Quy tắc tích điểm:
// - Tích điểm: 100.000₫ giá trị đơn hàng = 1 điểm (Math.floor(subtotal / 100000))
// - Đổi điểm: 1 điểm = 1.000₫ giảm trừ trực tiếp vào đơn hàng kế tiếp

export const INITIAL_CUSTOMERS = [
  {
    id: 'cust-101',
    phone: '0988123456',
    password: 'password123',
    fullName: 'Trần Văn Minh',
    email: 'minhtran@gmail.com',
    province: 'Hà Nội',
    district: 'Quận Cầu Giấy',
    address: 'Số 45 Trần Thái Tông',
    points: 35, // 35 điểm = 35.000₫
    totalSpent: 3500000,
    tier: 'Thành viên Bạc',
    createdAt: '2026-08-10T08:00:00.000Z',
    pointsHistory: [
      {
        id: 'ph-1',
        date: '2026-09-15T10:30:00.000Z',
        orderId: 'MXC-892410',
        type: 'earn',
        points: 25,
        desc: 'Tích điểm đơn hàng 2.500.000₫ (100k = 1 điểm)'
      },
      {
        id: 'ph-2',
        date: '2026-10-01T14:20:00.000Z',
        orderId: 'MXC-458921',
        type: 'earn',
        points: 10,
        desc: 'Tích điểm đơn hàng 1.000.000₫ (100k = 1 điểm)'
      }
    ]
  },
  {
    id: 'cust-102',
    phone: '0912888999',
    password: 'password123',
    fullName: 'Nguyễn Thị Hồng',
    email: 'hongnguyen@gmail.com',
    province: 'TP. Hồ Chí Minh',
    district: 'Quận 1',
    address: 'Số 12 Lê Duẩn',
    points: 50, // 50 điểm = 50.000₫
    totalSpent: 5000000,
    tier: 'Thành viên Vàng',
    createdAt: '2026-07-22T09:15:00.000Z',
    pointsHistory: [
      {
        id: 'ph-3',
        date: '2026-10-10T16:45:00.000Z',
        orderId: 'MXC-741285',
        type: 'earn',
        points: 50,
        desc: 'Tích điểm đơn hàng 5.000.000₫ (100k = 1 điểm)'
      }
    ]
  }
];

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
