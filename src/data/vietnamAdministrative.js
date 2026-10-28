// CƠ SỞ DỮ LIỆU ĐỊA CHÍNH 2 CẤP VIỆT NAM (TỈNH/THÀNH PHỐ & XÃ/PHƯỜNG SAU SÁP NHẬP)
// Cập nhật theo Nghị quyết của Ủy ban Thường vụ Quốc hội về sắp xếp các đơn vị hành chính cấp xã, phường giai đoạn 2023 - 2025
// và mô hình chính quyền địa phương 2 cấp tinh gọn (Cấp 1: Tỉnh/Thành phố; Cấp 2: Xã/Phường/Thị trấn sau sáp nhập).

export const VIETNAM_PROVINCES = [
  // 1. Các Đô thị lớn & Thành phố trực thuộc Trung ương
  { id: 'HN', name: 'Hà Nội', isExpress: true, note: 'Hỗ trợ Giao Hỏa Tốc & Giao Hàng Nhanh' },
  { id: 'HCM', name: 'TP. Hồ Chí Minh', isExpress: false, note: 'Giao Hàng Nhanh Toàn Quốc' },
  { id: 'DN', name: 'Đà Nẵng', isExpress: false, note: 'Giao Hàng Nhanh Toàn Quốc' },
  { id: 'HP', name: 'Hải Phòng', isExpress: false, note: 'Giao Hàng Nhanh Toàn Quốc' },
  { id: 'CT', name: 'Cần Thơ', isExpress: false, note: 'Giao Hàng Nhanh Toàn Quốc' },
  { id: 'HUE', name: 'Thừa Thiên Huế (TP. Huế)', isExpress: false, note: 'Giao Hàng Nhanh Toàn Quốc' },

  // 2. Miền Bắc & Vùng Thủ Đô
  { id: 'QN', name: 'Quảng Ninh', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'BN', name: 'Bắc Ninh', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'BG', name: 'Bắc Giang', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'HY', name: 'Hưng Yên', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'TB', name: 'Thái Bình', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'HD', name: 'Hải Dương', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'NB', name: 'Ninh Bình', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'ND', name: 'Nam Định', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'HNAM', name: 'Hà Nam', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'VP', name: 'Vĩnh Phúc', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'PT', name: 'Phú Thọ', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'TN', name: 'Thái Nguyên', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'BK', name: 'Bắc Kạn', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'TQ', name: 'Tuyên Quang', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'HG', name: 'Hà Giang', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'LC', name: 'Lào Cai', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'YB', name: 'Yên Bái', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'LS', name: 'Lạng Sơn', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'CB', name: 'Cao Bằng', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'HB', name: 'Hòa Bình', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'SL', name: 'Sơn La', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'DB', name: 'Điện Biên', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'LCH', name: 'Lai Châu', isExpress: false, note: 'Giao Hàng Nhanh' },

  // 3. Miền Trung & Duyên Hải
  { id: 'TH', name: 'Thanh Hóa', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'NA', name: 'Nghệ An', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'HT', name: 'Hà Tĩnh', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'QB', name: 'Quảng Bình', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'QT', name: 'Quảng Trị', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'QNAM', name: 'Quảng Nam', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'QNG', name: 'Quảng Ngãi', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'BDINH', name: 'Bình Định', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'PY', name: 'Phú Yên', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'KH', name: 'Khánh Hòa', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'NT', name: 'Ninh Thuận', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'BTH', name: 'Bình Thuận', isExpress: false, note: 'Giao Hàng Nhanh' },

  // 4. Tây Nguyên
  { id: 'KT', name: 'Kon Tum', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'GL', name: 'Gia Lai', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'DL', name: 'Đắk Lắk', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'DNONG', name: 'Đắk Nông', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'LD', name: 'Lâm Đồng', isExpress: false, note: 'Giao Hàng Nhanh' },

  // 5. Đông Nam Bộ & Nam Bộ
  { id: 'DNI', name: 'Đồng Nai', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'BD', name: 'Bình Dương', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'VT', name: 'Bà Rịa - Vũng Tàu', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'TNINH', name: 'Tây Ninh', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'BP', name: 'Bình Phước', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'LA', name: 'Long An', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'TG', name: 'Tiền Giang', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'BTRE', name: 'Bến Tre', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'TV', name: 'Trà Vinh', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'VL', name: 'Vĩnh Long', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'DT', name: 'Đồng Tháp', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'AG', name: 'An Giang', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'KG', name: 'Kiên Giang', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'HG', name: 'Hậu Giang', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'ST', name: 'Sóc Trăng', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'BL', name: 'Bạc Liêu', isExpress: false, note: 'Giao Hàng Nhanh' },
  { id: 'CM', name: 'Cà Mau', isExpress: false, note: 'Giao Hàng Nhanh' }
];

// DANH MỤC XÃ / PHƯỜNG / THỊ TRẤN SAU SÁP NHẬP (ĐỊA CHỈ CẤP 2)
export const VIETNAM_WARDS_BY_PROVINCE = {
  'Hà Nội': [
    // Các phường mới thành lập sau sáp nhập tại Hà Nội
    'Phường Cầu Giấy (mới sáp nhập)',
    'Phường Dịch Vọng Hậu (mới sáp nhập)',
    'Phường Cửa Nam (mới sáp nhập)',
    'Phường Hoàn Kiếm (mới sáp nhập)',
    'Phường Hàng Gai - Hàng Trống (mới sáp nhập)',
    'Phường Hàng Bạc - Hàng Bông (mới sáp nhập)',
    'Phường Nguyễn Du (mới sáp nhập)',
    'Phường Phương Liên - Trung Phụng (mới sáp nhập)',
    'Phường Khâm Thiên (mới sáp nhập)',
    'Phường Hà Đông (mới sáp nhập)',
    'Phường Quang Trung (mới sáp nhập)',
    
    // Các phường & thị trấn tiêu biểu quận Cầu Giấy, Nam Từ Liêm, Bắc Từ Liêm
    'Phường Dịch Vọng (Cầu Giấy)',
    'Phường Nghĩa Đô (Cầu Giấy)',
    'Phường Nghĩa Tân (Cầu Giấy)',
    'Phường Mai Dịch (Cầu Giấy)',
    'Phường Yên Hòa (Cầu Giấy)',
    'Phường Trung Hòa (Cầu Giấy)',
    'Phường Mễ Trì (Nam Từ Liêm)',
    'Phường Mỹ Đình 1 (Nam Từ Liêm)',
    'Phường Mỹ Đình 2 (Nam Từ Liêm)',
    'Phường Phú Đô (Nam Từ Liêm)',
    'Phường Cầu Diễn (Nam Từ Liêm)',
    'Phường Tây Mỗ (Nam Từ Liêm)',
    'Phường Đại Mỗ (Nam Từ Liêm)',
    'Phường Trung Văn (Nam Từ Liêm)',
    'Phường Cổ Nhuế 1 (Bắc Từ Liêm)',
    'Phường Cổ Nhuế 2 (Bắc Từ Liêm)',
    'Phường Xuân Đỉnh (Bắc Từ Liêm)',
    'Phường Đông Ngạc (Bắc Từ Liêm)',
    'Phường Phú Diễn (Bắc Từ Liêm)',

    // Quận Đống Đa, Ba Đình, Hoàn Kiếm, Hai Bà Trưng
    'Phường Láng Hạ (Đống Đa)',
    'Phường Láng Thượng (Đống Đa)',
    'Phường Ô Chợ Dừa (Đống Đa)',
    'Phường Kim Liên (Đống Đa)',
    'Phường Văn Miếu (Đống Đa)',
    'Phường Quốc Tử Giám (Đống Đa)',
    'Phường Giảng Võ (Ba Đình)',
    'Phường Kim Mã (Ba Đình)',
    'Phường Liễu Giai (Ba Đình)',
    'Phường Đội Cấn (Ba Đình)',
    'Phường Ngọc Hà (Ba Đình)',
    'Phường Thành Công (Ba Đình)',
    'Phường Tràng Tiền (Hoàn Kiếm)',
    'Phường Phan Chu Trinh (Hoàn Kiếm)',
    'Phường Lý Thái Tổ (Hoàn Kiếm)',
    'Phường Bách Khoa (Hai Bà Trưng)',
    'Phường Lê Đại Hành (Hai Bà Trưng)',
    'Phường Đồng Tâm (Hai Bà Trưng)',
    'Phường Vĩnh Tuy (Hai Bà Trưng)',
    'Phường Minh Khai (Hai Bà Trưng)',

    // Quận Thanh Xuân, Hoàng Mai, Long Biên, Tây Hồ, Hà Đông
    'Phường Nhân Chính (Thanh Xuân)',
    'Phường Khương Trung (Thanh Xuân)',
    'Phường Khương Mai (Thanh Xuân)',
    'Phường Thanh Xuân Bắc (Thanh Xuân)',
    'Phường Thanh Xuân Nam (Thanh Xuân)',
    'Phường Hoàng Liệt (Hoàng Mai)',
    'Phường Định Công (Hoàng Mai)',
    'Phường Đại Kim (Hoàng Mai)',
    'Phường Giáp Bát (Hoàng Mai)',
    'Phường Bồ Đề (Long Biên)',
    'Phường Ngọc Thụy (Long Biên)',
    'Phường Đức Giang (Long Biên)',
    'Phường Việt Hưng (Long Biên)',
    'Phường Sài Đồng (Long Biên)',
    'Phường Bưởi (Tây Hồ)',
    'Phường Thụy Khuê (Tây Hồ)',
    'Phường Quảng An (Tây Hồ)',
    'Phường Xuân La (Tây Hồ)',
    'Phường Mộ Lao (Hà Đông)',
    'Phường Văn Quán (Hà Đông)',
    'Phường Vạn Phúc (Hà Đông)',
    'Phường La Khê (Hà Đông)',
    'Phường Dương Nội (Hà Đông)',

    // Khu vực ngoại thành: Gia Lâm, Đông Anh, Thanh Trì, Hoài Đức...
    'Thị trấn Trâu Quỳ (Gia Lâm)',
    'Xã Ninh Hiệp (Gia Lâm)',
    'Xã Bát Tràng (Gia Lâm)',
    'Thị trấn Đông Anh (Đông Anh)',
    'Xã Hải Bối (Đông Anh)',
    'Xã Kim Nỗ (Đông Anh)',
    'Xã Vĩnh Ngọc (Đông Anh)',
    'Thị trấn Văn Điển (Thanh Trì)',
    'Xã Tân Triều (Thanh Trì)',
    'Xã Tả Thanh Oai (Thanh Trì)',
    'Thị trấn Trạm Trôi (Hoài Đức)',
    'Xã An Khánh (Hoài Đức)',
    'Xã Vân Canh (Hoài Đức)',
    'Thị trấn Phùng (Đan Phượng)',
    'Thị trấn Thường Tín (Thường Tín)',
    'Thị xã Sơn Tây (Sơn Tây)'
  ],

  'TP. Hồ Chí Minh': [
    // Phường mới sau sáp nhập tại TP.HCM
    'Phường 1 & Phường 2 (Quận 3 - mới sáp nhập)',
    'Phường 9 & Phường 10 (Quận 3 - mới sáp nhập)',
    'Phường 6 & Phường 7 (Quận 4 - mới sáp nhập)',
    'Phường 8 & Phường 9 (Quận 4 - mới sáp nhập)',
    'Phường 2 & Phường 3 (Quận 5 - mới sáp nhập)',
    'Phường 5 & Phường 6 (Quận 5 - mới sáp nhập)',
    'Phường 1 & Phường 2 (Quận 10 - mới sáp nhập)',
    'Phường 1 & Phường 2 (Quận 11 - mới sáp nhập)',
    'Phường An Khánh (TP. Thủ Đức - mới sáp nhập)',
    
    // Quận 1, 3, 5, 7, 10
    'Phường Bến Nghé (Quận 1)',
    'Phường Bến Thành (Quận 1)',
    'Phường Đa Kao (Quận 1)',
    'Phường Tân Định (Quận 1)',
    'Phường Phạm Ngũ Lão (Quận 1)',
    'Phường Võ Thị Sáu (Quận 3)',
    'Phường 4 (Quận 3)',
    'Phường Chợ Lớn (Quận 5)',
    'Phường 11 (Quận 5)',
    'Phường Tân Phong (Quận 7)',
    'Phường Tân Phú (Quận 7)',
    'Phường Tân Quy (Quận 7)',
    'Phường Phú Mỹ (Quận 7)',
    'Phường 12 (Quận 10)',
    'Phường 14 (Quận 10)',

    // TP. Thủ Đức & Bình Thạnh, Phú Nhuận, Gò Vấp
    'Phường Thảo Điền (TP. Thủ Đức)',
    'Phường An Phú (TP. Thủ Đức)',
    'Phường Hiệp Bình Chánh (TP. Thủ Đức)',
    'Phường Hiệp Bình Phước (TP. Thủ Đức)',
    'Phường Linh Trung (TP. Thủ Đức)',
    'Phường Linh Chiểu (TP. Thủ Đức)',
    'Phường Phước Long B (TP. Thủ Đức)',
    'Phường 1, 2, 3 (Bình Thạnh)',
    'Phường 24, 25, 26 (Bình Thạnh)',
    'Phường 1, 2, 8, 9 (Phú Nhuận)',
    'Phường 1, 3, 5, 10, 11 (Gò Vấp)',
    
    // Tân Bình, Tân Phú, Bình Tân, Quận 12, Ngoại thành
    'Phường 2 (Tân Bình - Sân bay)',
    'Phường 12, 13, 14 (Tân Bình)',
    'Phường Tây Thạnh (Tân Phú)',
    'Phường Sơn Kỳ (Tân Phú)',
    'Phường Bình Trị Đông (Bình Tân)',
    'Phường Bình Hưng Hòa (Bình Tân)',
    'Phường An Lạc (Bình Tân)',
    'Phường Tân Chánh Hiệp (Quận 12)',
    'Phường An Phú Đông (Quận 12)',
    'Thị trấn Hóc Môn (Hóc Môn)',
    'Xã Bà Điểm (Hóc Môn)',
    'Thị trấn Tân Túc (Bình Chánh)',
    'Xã Bình Hưng (Bình Chánh)',
    'Thị trấn Nhà Bè (Nhà Bè)',
    'Thị trấn Củ Chi (Củ Chi)'
  ],

  'Đà Nẵng': [
    'Phường Hải Châu 1 & Hải Châu 2 (mới sáp nhập)',
    'Phường Bình Hiên - Bình Thuận (mới sáp nhập)',
    'Phường Thạch Thang (Hải Châu)',
    'Phường Thuận Phước (Hải Châu)',
    'Phường Hòa Cường Bắc (Hải Châu)',
    'Phường Hòa Cường Nam (Hải Châu)',
    'Phường Vĩnh Trung (Thanh Khê)',
    'Phường Tân Chính (Thanh Khê)',
    'Phường Tam Thuận (Thanh Khê)',
    'Phường An Hải Bắc (Sơn Trà)',
    'Phường Phước Mỹ (Sơn Trà)',
    'Phường Thọ Quang (Sơn Trà)',
    'Phường Mỹ An (Ngũ Hành Sơn)',
    'Phường Khuê Mỹ (Ngũ Hành Sơn)',
    'Phường Hòa Khánh Bắc (Liên Chiểu)',
    'Phường Hòa Khánh Nam (Liên Chiểu)',
    'Phường Hòa Minh (Liên Chiểu)',
    'Phường Khuê Trung (Cẩm Lệ)',
    'Phường Hòa Xuân (Cẩm Lệ)',
    'Xã Hòa Phong (Hòa Vang)',
    'Xã Hòa Châu (Hòa Vang)'
  ],

  'Hải Phòng': [
    'Phường Thủy Nguyên (Thành phố mới Thủy Nguyên)',
    'Phường Minh Đức (Thủy Nguyên)',
    'Phường Quảng Thanh (Thủy Nguyên)',
    'Phường Hoàng Văn Thụ (Hồng Bàng - mới sáp nhập)',
    'Phường Minh Khai (Hồng Bàng)',
    'Phường Quán Toan (Hồng Bàng)',
    'Phường Cầu Đất (Ngô Quyền)',
    'Phường Lạc Viên (Ngô Quyền)',
    'Phường Máy Tơ (Ngô Quyền)',
    'Phường An Dương (Lê Chân)',
    'Phường Cát Dài (Lê Chân)',
    'Phường Đằng Hải (Hải An)',
    'Phường Đông Hải 1 (Hải An)',
    'Phường Trần Thành Ngọ (Kiến An)',
    'Phường Vạn Sơn (Đồ Sơn)',
    'Thị trấn Cát Bà (Cát Hải)',
    'Thị trấn An Dương (An Dương)'
  ],

  'Cần Thơ': [
    'Phường Tân An (Ninh Kiều - mới sáp nhập)',
    'Phường An Hội (Ninh Kiều - mới sáp nhập)',
    'Phường An Cư (Ninh Kiều)',
    'Phường An Hòa (Ninh Kiều)',
    'Phường An Khánh (Ninh Kiều)',
    'Phường Xuân Khánh (Ninh Kiều)',
    'Phường Hưng Lợi (Ninh Kiều)',
    'Phường Cái Khế (Ninh Kiều)',
    'Phường Lê Bình (Cái Răng)',
    'Phường Hưng Phú (Cái Răng)',
    'Phường Hưng Thạnh (Cái Răng)',
    'Phường Bình Thủy (Bình Thủy)',
    'Phường Trà Nóc (Bình Thủy)',
    'Phường Thốt Nốt (Thốt Nốt)',
    'Thị trấn Phong Điền (Phong Điền)'
  ],

  'Thừa Thiên Huế (TP. Huế)': [
    'Phường Thuận Hóa (mới thành lập)',
    'Phường Phú Xuân (mới thành lập)',
    'Phường Vĩnh Ninh (TP. Huế)',
    'Phường Phú Nhuận (TP. Huế)',
    'Phường Thuận Thành (TP. Huế)',
    'Phường Hương Sơ (TP. Huế)',
    'Phường An Cựu (TP. Huế)',
    'Phường An Đông (TP. Huế)',
    'Phường Thủy Biều (TP. Huế)',
    'Thị xã Hương Thủy',
    'Thị xã Hương Trà',
    'Thị trấn Thuận An'
  ],

  'Quảng Ninh': [
    'Phường Bạch Đằng (Hạ Long)',
    'Phường Bãi Cháy (Hạ Long)',
    'Phường Hòn Gai (Hạ Long)',
    'Phường Hồng Gai (Hạ Long - mới sáp nhập)',
    'Phường Cao Xanh (Hạ Long)',
    'Phường Giếng Đáy (Hạ Long)',
    'Phường Cẩm Phả (Cẩm Phả - mới sáp nhập)',
    'Phường Cẩm Trung (Cẩm Phả)',
    'Phường Cẩm Thành (Cẩm Phả)',
    'Phường Mạo Khê (Đông Triều)',
    'Phường Đông Triều (Đông Triều)',
    'Phường Uông Bí (Uông Bí)',
    'Phường Trần Phú (Móng Cái)',
    'Phường Trà Cổ (Móng Cái)',
    'Thị trấn Cái Rồng (Vân Đồn)'
  ],

  'Bắc Ninh': [
    'Phường Tiền An - Vệ An (mới sáp nhập)',
    'Phường Ninh Xá (TP. Bắc Ninh)',
    'Phường Suối Hoa (TP. Bắc Ninh)',
    'Phường Võ Cường (TP. Bắc Ninh)',
    'Phường Kinh Bắc (TP. Bắc Ninh)',
    'Phường Đông Ngàn (Từ Sơn)',
    'Phường Đồng Kỵ (Từ Sơn)',
    'Phường Trang Hạ (Từ Sơn)',
    'Phường Phố Mới (Quế Võ)',
    'Phường Hồ (Thuận Thành)',
    'Thị trấn Chờ (Yên Phong)',
    'Thị trấn Thứa (Lương Tài)',
    'Thị trấn Gia Bình (Gia Bình)'
  ],

  'Hưng Yên': [
    'Phường Hiến Nam (TP. Hưng Yên)',
    'Phường Lê Lợi (TP. Hưng Yên - mới sáp nhập)',
    'Phường Lam Sơn (TP. Hưng Yên)',
    'Phường An Tảo (TP. Hưng Yên)',
    'Phường Bần Yên Nhân (Mỹ Hào)',
    'Phường Dị Sử (Mỹ Hào)',
    'Phường Phùng Chí Kiên (Mỹ Hào)',
    'Thị trấn Văn Giang (Văn Giang)',
    'Xã Cửu Cao - Ecopark (Văn Giang)',
    'Thị trấn Như Quỳnh (Văn Lâm)',
    'Thị trấn Yên Mỹ (Yên Mỹ)',
    'Thị trấn Khoái Châu (Khoái Châu)'
  ],

  'Ninh Bình': [
    'Phường Đông Thành (TP. Ninh Bình - mới sáp nhập)',
    'Phường Vân Giang (TP. Ninh Bình - mới sáp nhập)',
    'Phường Nam Thành (TP. Ninh Bình)',
    'Phường Ninh Khánh (TP. Ninh Bình)',
    'Phường Bích Đào (TP. Ninh Bình)',
    'Phường Bắc Sơn (Tam Điệp)',
    'Phường Trung Sơn (Tam Điệp)',
    'Thị trấn Nho Quan (Nho Quan)',
    'Thị trấn Me (Gia Viễn)',
    'Thị trấn Yên Ninh (Yên Khánh)',
    'Thị trấn Phát Diệm (Kim Sơn)'
  ],

  'Nghệ An': [
    'Phường Trường Thi (TP. Vinh - mới sáp nhập)',
    'Phường Quang Trung (TP. Vinh - mới sáp nhập)',
    'Phường Lê Lợi (TP. Vinh)',
    'Phường Hưng Dũng (TP. Vinh)',
    'Phường Hưng Bình (TP. Vinh)',
    'Phường Bến Thủy (TP. Vinh)',
    'Phường Nghi Thu (Thị xã Cửa Lò)',
    'Phường Nghi Hương (Thị xã Cửa Lò)',
    'Phường Thu Thủy (Thị xã Cửa Lò)',
    'Phường Hòa Hiếu (Thị xã Thái Hòa)',
    'Thị trấn Diễn Châu (Diễn Châu)',
    'Thị trấn Đô Lương (Đô Lương)',
    'Thị trấn Nam Đàn (Nam Đàn)'
  ],

  'Thanh Hóa': [
    'Phường Ba Đình (TP. Thanh Hóa - mới sáp nhập)',
    'Phường Điện Biên (TP. Thanh Hóa - mới sáp nhập)',
    'Phường Lam Sơn (TP. Thanh Hóa)',
    'Phường Đông Thọ (TP. Thanh Hóa)',
    'Phường Đông Sơn (TP. Thanh Hóa)',
    'Phường Quảng Thắng (TP. Thanh Hóa)',
    'Phường Bắc Sơn (Sầm Sơn)',
    'Phường Trung Sơn (Sầm Sơn)',
    'Phường Trường Sơn (Sầm Sơn)',
    'Phường Hải Hòa (Nghi Sơn)',
    'Thị trấn Bỉm Sơn',
    'Thị trấn Rừng Thông (Đông Sơn)'
  ],

  'Đồng Nai': [
    'Phường Trung Dũng (Biên Hòa - mới sáp nhập)',
    'Phường Quyết Thắng (Biên Hòa - mới sáp nhập)',
    'Phường Thống Nhất (Biên Hòa)',
    'Phường Tân Tiến (Biên Hòa)',
    'Phường Tân Mai (Biên Hòa)',
    'Phường Tam Hiệp (Biên Hòa)',
    'Phường Trảng Dài (Biên Hòa)',
    'Phường Hố Nai (Biên Hòa)',
    'Phường Long Bình (Biên Hòa)',
    'Phường Xuân An (Long Khánh)',
    'Thị trấn Long Thành (Long Thành)',
    'Thị trấn Trảng Bom (Trảng Bom)'
  ],

  'Bình Dương': [
    'Phường Phú Cường (Thủ Dầu Một)',
    'Phường Hiệp Thành (Thủ Dầu Một)',
    'Phường Chánh Nghĩa (Thủ Dầu Một)',
    'Phường Phú Hòa (Thủ Dầu Một)',
    'Phường Định Hòa (Thủ Dầu Một)',
    'Phường Dĩ An (Dĩ An)',
    'Phường Đông Hòa (Dĩ An)',
    'Phường An Bình (Dĩ An)',
    'Phường Lái Thiêu (Thuận An)',
    'Phường An Phú (Thuận An)',
    'Phường Mỹ Phước (Bến Cát)',
    'Phường Tân Uyên (Tân Uyên)'
  ],

  'Bà Rịa - Vũng Tàu': [
    'Phường 1 (TP. Vũng Tàu - mới sáp nhập)',
    'Phường 2 (TP. Vũng Tàu)',
    'Phường 3 (TP. Vũng Tàu)',
    'Phường Thắng Tam (TP. Vũng Tàu)',
    'Phường Thắng Nhì (TP. Vũng Tàu)',
    'Phường Nguyễn An Ninh (TP. Vũng Tàu)',
    'Phường Phước Trung (TP. Bà Rịa)',
    'Phường Phước Hưng (TP. Bà Rịa)',
    'Phường Phú Mỹ (Thị xã Phú Mỹ)',
    'Thị trấn Long Hải (Long Điền)',
    'Đặc khu Côn Đảo'
  ],

  'Khánh Hòa': [
    'Phường Vạn Thắng (Nha Trang - mới sáp nhập)',
    'Phường Phương Sài (Nha Trang - mới sáp nhập)',
    'Phường Lộc Thọ (Nha Trang)',
    'Phường Tân Lập (Nha Trang)',
    'Phường Phước Hải (Nha Trang)',
    'Phường Vĩnh Hải (Nha Trang)',
    'Phường Cam Ranh (TP. Cam Ranh)',
    'Phường Ninh Hòa (Thị xã Ninh Hòa)',
    'Thị trấn Diên Khánh (Diên Khánh)'
  ],

  'Lâm Đồng': [
    'Phường 1 (TP. Đà Lạt)',
    'Phường 2 (TP. Đà Lạt - mới sáp nhập)',
    'Phường 3 (TP. Đà Lạt)',
    'Phường 9 (TP. Đà Lạt)',
    'Phường 10 (TP. Đà Lạt)',
    'Phường B’Lao (Bảo Lộc)',
    'Phường Lộc Sơn (Bảo Lộc)',
    'Thị trấn Đức Trọng (Liên Nghĩa)'
  ],

  'Đắk Lắk': [
    'Phường Thắng Lợi (Buôn Ma Thuột - mới sáp nhập)',
    'Phường Thống Nhất (Buôn Ma Thuột)',
    'Phường Tân Lợi (Buôn Ma Thuột)',
    'Phường Tân An (Buôn Ma Thuột)',
    'Phường Tự An (Buôn Ma Thuột)',
    'Thị xã Buôn Hồ',
    'Thị trấn Ea Drăng (Ea H’leo)',
    'Thị trấn Phước An (Krông Pắc)'
  ],

  'An Giang': [
    'Phường Mỹ Bình (TP. Long Xuyên)',
    'Phường Mỹ Long (TP. Long Xuyên - mới sáp nhập)',
    'Phường Mỹ Xuyên (TP. Long Xuyên)',
    'Phường Mỹ Phước (TP. Long Xuyên)',
    'Phường Châu Phú A (Châu Đốc)',
    'Phường Châu Phú B (Châu Đốc)',
    'Thị trấn Tân Châu'
  ],

  'Cà Mau': [
    'Phường 2 (TP. Cà Mau - mới sáp nhập)',
    'Phường 5 (TP. Cà Mau)',
    'Phường 7 (TP. Cà Mau)',
    'Phường 8 (TP. Cà Mau)',
    'Phường 9 (TP. Cà Mau)',
    'Thị trấn Năm Căn',
    'Thị trấn Sông Đốc (Trần Văn Thời)',
    'Thị trấn Cái Nước'
  ]
};

// Hàm lấy danh sách Xã/Phường theo Tỉnh thành đã chọn
export const getWardsForProvince = (provinceName) => {
  if (!provinceName) return [];
  
  // Tìm khớp chính xác hoặc khớp tên tỉnh
  const matchedKey = Object.keys(VIETNAM_WARDS_BY_PROVINCE).find(k => 
    provinceName.includes(k) || k.includes(provinceName)
  );

  if (matchedKey && VIETNAM_WARDS_BY_PROVINCE[matchedKey]) {
    return VIETNAM_WARDS_BY_PROVINCE[matchedKey];
  }

  // Danh sách xã/phường tiêu chuẩn cho các tỉnh thành khác
  return [
    'Phường Trung Tâm Hành Chính (mới sáp nhập)',
    'Phường 1 (mới sáp nhập)',
    'Phường 2 (mới sáp nhập)',
    'Phường Quyết Thắng',
    'Phường Tân Thành',
    'Phường Thống Nhất',
    'Phường Quang Trung',
    'Thị trấn Huyện lỵ Trung tâm',
    'Xã Trung tâm Nông thôn mới'
  ];
};
