/**
 * Danh sách Banner trình chiếu mặc định tại trang chủ MedXpressCare
 * Có thể tùy chỉnh, thêm, sửa, xóa và thay ảnh trực tiếp trong Admin Panel
 */

export const DEFAULT_HERO_BANNERS = [
  {
    id: 'banner-01',
    title: 'Hàng Nội Địa Uy Tín Chuẩn GMP-WHO',
    subtitle: 'Dược liệu Sâm Ngọc Linh K5, Đông trùng Traphaco Sapa, Nano Curcumin, Khớp Thái Minh chính ngạch.',
    badge: 'Tinh Hoa Dược Liệu Việt Nam',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=1000&auto=format&fit=crop&q=80',
    actionType: 'domestic',
    actionLink: '#catalog-section',
    buttonText: 'Xem Gian Hàng Nội Địa',
    isActive: true
  },
  {
    id: 'banner-02',
    title: 'Hàng Nhập Khẩu Quốc Tế Tem Phụ',
    subtitle: 'Kirkland USA, Blackmores Úc, DHC Nhật Bản, Hồng Sâm KGC Hàn Quốc, Doppelherz Đức đầy đủ số ĐKSP.',
    badge: 'Nhập Khẩu Chính Ngạch',
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=1000&auto=format&fit=crop&q=80',
    actionType: 'imported',
    actionLink: '#catalog-section',
    buttonText: 'Xem Hàng Nhập Ngoại',
    isActive: true
  },
  {
    id: 'banner-03',
    title: 'Dược Sĩ AI Tư Vấn Thể Trạng 24/7',
    subtitle: 'Đội ngũ Dược sĩ lâm sàng kết hợp Trí tuệ Nhân tạo tư vấn phác đồ và giải đáp tương tác thuốc.',
    badge: '🩺 Trợ Lý Dược Sĩ AI',
    image: 'https://images.unsplash.com/photo-1631815589968-fdb09a223b1e?w=1000&auto=format&fit=crop&q=80',
    actionType: 'advisor',
    actionLink: '#advisor',
    buttonText: 'Nhận Tư Vấn Ngay',
    isActive: true
  },
  {
    id: 'banner-04',
    title: 'Miễn Phí Giao Hàng & Bảo Quản GSP',
    subtitle: 'Kiện hàng niêm phong tem chống giả, đóng gói thùng xốp đá gel chuẩn GSP Bộ Y Tế.',
    badge: '⚡ Giao Hỏa Tốc',
    image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=1000&auto=format&fit=crop&q=80',
    actionType: 'custom',
    actionLink: '#catalog-section',
    buttonText: 'Mua Sắm Ngay',
    isActive: true
  }
];
