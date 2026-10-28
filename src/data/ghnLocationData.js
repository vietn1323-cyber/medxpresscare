/**
 * CƠ SỞ DỮ LIỆU ĐỊA GIỚI HÀNH CHÍNH CHUẨN GHN (GIAO HÀNG NHANH EXPRESS)
 * Cung cấp danh mục chuẩn: ProvinceID, DistrictID, WardCode
 * Dùng cho cả Frontend Dropdown động <option value="WardCode"> và Backend Resolver Payload
 */

export const GHN_PROVINCES = [
  { ProvinceID: 201, ProvinceName: 'Hà Nội', Code: 'HN' },
  { ProvinceID: 202, ProvinceName: 'Hồ Chí Minh', Code: 'HCM' },
  { ProvinceID: 203, ProvinceName: 'Đà Nẵng', Code: 'DN' },
  { ProvinceID: 204, ProvinceName: 'Hải Phòng', Code: 'HP' },
  { ProvinceID: 205, ProvinceName: 'Cần Thơ', Code: 'CT' },
  { ProvinceID: 206, ProvinceName: 'Thừa Thiên Huế', Code: 'HUE' },
  { ProvinceID: 207, ProvinceName: 'Quảng Ninh', Code: 'QN' },
  { ProvinceID: 208, ProvinceName: 'Bắc Ninh', Code: 'BN' },
  { ProvinceID: 209, ProvinceName: 'Đồng Nai', Code: 'DNI' },
  { ProvinceID: 210, ProvinceName: 'Bình Dương', Code: 'BD' },
  { ProvinceID: 211, ProvinceName: 'Hưng Yên', Code: 'HY' },
  { ProvinceID: 212, ProvinceName: 'Ninh Bình', Code: 'NB' },
  { ProvinceID: 213, ProvinceName: 'Thanh Hóa', Code: 'TH' },
  { ProvinceID: 214, ProvinceName: 'Nghệ An', Code: 'NA' },
  { ProvinceID: 215, ProvinceName: 'Hà Tĩnh', Code: 'HT' },
  { ProvinceID: 216, ProvinceName: 'Quảng Trị', Code: 'QT' },
  { ProvinceID: 217, ProvinceName: 'Quảng Ngãi', Code: 'QNG' },
  { ProvinceID: 218, ProvinceName: 'Khánh Hòa', Code: 'KH' },
  { ProvinceID: 219, ProvinceName: 'Gia Lai', Code: 'GL' },
  { ProvinceID: 220, ProvinceName: 'Đắk Lắk', Code: 'DL' },
  { ProvinceID: 221, ProvinceName: 'Lâm Đồng', Code: 'LD' },
  { ProvinceID: 222, ProvinceName: 'Tây Ninh', Code: 'TN' },
  { ProvinceID: 223, ProvinceName: 'Vĩnh Long', Code: 'VL' },
  { ProvinceID: 224, ProvinceName: 'Đồng Tháp', Code: 'DT' },
  { ProvinceID: 225, ProvinceName: 'An Giang', Code: 'AG' },
  { ProvinceID: 226, ProvinceName: 'Cà Mau', Code: 'CM' },
  { ProvinceID: 227, ProvinceName: 'Lào Cai', Code: 'LC' },
  { ProvinceID: 228, ProvinceName: 'Thái Nguyên', Code: 'TN' },
  { ProvinceID: 229, ProvinceName: 'Phú Thọ', Code: 'PT' },
  { ProvinceID: 230, ProvinceName: 'Lạng Sơn', Code: 'LS' },
  { ProvinceID: 231, ProvinceName: 'Sơn La', Code: 'SL' },
  { ProvinceID: 232, ProvinceName: 'Tuyên Quang', Code: 'TQ' },
  { ProvinceID: 233, ProvinceName: 'Cao Bằng', Code: 'CB' },
  { ProvinceID: 234, ProvinceName: 'Điện Biên', Code: 'DB' }
];

export const GHN_DISTRICTS = {
  // 1. Hà Nội (201)
  201: [
    { DistrictID: 1442, DistrictName: 'Quận Cầu Giấy', ProvinceID: 201 },
    { DistrictID: 1443, DistrictName: 'Quận Ba Đình', ProvinceID: 201 },
    { DistrictID: 1444, DistrictName: 'Quận Hoàn Kiếm', ProvinceID: 201 },
    { DistrictID: 1447, DistrictName: 'Quận Đống Đa', ProvinceID: 201 },
    { DistrictID: 1448, DistrictName: 'Quận Hai Bà Trưng', ProvinceID: 201 },
    { DistrictID: 1446, DistrictName: 'Quận Tây Hồ', ProvinceID: 201 },
    { DistrictID: 1449, DistrictName: 'Quận Long Biên', ProvinceID: 201 },
    { DistrictID: 1450, DistrictName: 'Quận Thanh Xuân', ProvinceID: 201 },
    { DistrictID: 1451, DistrictName: 'Quận Hoàng Mai', ProvinceID: 201 },
    { DistrictID: 1452, DistrictName: 'Quận Nam Từ Liêm', ProvinceID: 201 },
    { DistrictID: 1453, DistrictName: 'Quận Bắc Từ Liêm', ProvinceID: 201 },
    { DistrictID: 1454, DistrictName: 'Quận Hà Đông', ProvinceID: 201 },
    { DistrictID: 1455, DistrictName: 'Huyện Gia Lâm', ProvinceID: 201 },
    { DistrictID: 1456, DistrictName: 'Huyện Đông Anh', ProvinceID: 201 },
    { DistrictID: 1457, DistrictName: 'Huyện Sóc Sơn', ProvinceID: 201 },
    { DistrictID: 1458, DistrictName: 'Huyện Thanh Trì', ProvinceID: 201 },
    { DistrictID: 1459, DistrictName: 'Huyện Hoài Đức', ProvinceID: 201 },
    { DistrictID: 1460, DistrictName: 'Huyện Đan Phượng', ProvinceID: 201 },
    { DistrictID: 1461, DistrictName: 'Huyện Thường Tín', ProvinceID: 201 },
    { DistrictID: 1462, DistrictName: 'Thị xã Sơn Tây', ProvinceID: 201 }
  ],

  // 2. TP. Hồ Chí Minh (202)
  202: [
    { DistrictID: 1482, DistrictName: 'Quận 1', ProvinceID: 202 },
    { DistrictID: 1484, DistrictName: 'Quận 3', ProvinceID: 202 },
    { DistrictID: 1485, DistrictName: 'Quận 4', ProvinceID: 202 },
    { DistrictID: 1486, DistrictName: 'Quận 5', ProvinceID: 202 },
    { DistrictID: 1492, DistrictName: 'Quận 6', ProvinceID: 202 },
    { DistrictID: 1487, DistrictName: 'Quận 7', ProvinceID: 202 },
    { DistrictID: 1493, DistrictName: 'Quận 8', ProvinceID: 202 },
    { DistrictID: 1494, DistrictName: 'Quận 10', ProvinceID: 202 },
    { DistrictID: 1495, DistrictName: 'Quận 11', ProvinceID: 202 },
    { DistrictID: 1496, DistrictName: 'Quận 12', ProvinceID: 202 },
    { DistrictID: 1488, DistrictName: 'Thành phố Thủ Đức', ProvinceID: 202 },
    { DistrictID: 1489, DistrictName: 'Quận Bình Thạnh', ProvinceID: 202 },
    { DistrictID: 1490, DistrictName: 'Quận Tân Bình', ProvinceID: 202 },
    { DistrictID: 1491, DistrictName: 'Quận Phú Nhuận', ProvinceID: 202 },
    { DistrictID: 1497, DistrictName: 'Quận Gò Vấp', ProvinceID: 202 },
    { DistrictID: 1498, DistrictName: 'Quận Tân Phú', ProvinceID: 202 },
    { DistrictID: 1499, DistrictName: 'Quận Bình Tân', ProvinceID: 202 },
    { DistrictID: 1500, DistrictName: 'Huyện Củ Chi', ProvinceID: 202 },
    { DistrictID: 1501, DistrictName: 'Huyện Hóc Môn', ProvinceID: 202 },
    { DistrictID: 1502, DistrictName: 'Huyện Bình Chánh', ProvinceID: 202 }
  ],

  // 3. Đà Nẵng (203)
  203: [
    { DistrictID: 1534, DistrictName: 'Quận Hải Châu', ProvinceID: 203 },
    { DistrictID: 1535, DistrictName: 'Quận Thanh Khê', ProvinceID: 203 },
    { DistrictID: 1536, DistrictName: 'Quận Sơn Trà', ProvinceID: 203 },
    { DistrictID: 1537, DistrictName: 'Quận Ngũ Hành Sơn', ProvinceID: 203 },
    { DistrictID: 1538, DistrictName: 'Quận Liên Chiểu', ProvinceID: 203 },
    { DistrictID: 1539, DistrictName: 'Quận Cẩm Lệ', ProvinceID: 203 },
    { DistrictID: 1540, DistrictName: 'Huyện Hòa Vang', ProvinceID: 203 }
  ],

  // 4. Hải Phòng (204)
  204: [
    { DistrictID: 1541, DistrictName: 'Quận Hồng Bàng', ProvinceID: 204 },
    { DistrictID: 1542, DistrictName: 'Quận Ngô Quyền', ProvinceID: 204 },
    { DistrictID: 1543, DistrictName: 'Quận Lê Chân', ProvinceID: 204 },
    { DistrictID: 1548, DistrictName: 'Thành phố Thủy Nguyên', ProvinceID: 204 },
    { DistrictID: 1544, DistrictName: 'Quận Hải An', ProvinceID: 204 },
    { DistrictID: 1545, DistrictName: 'Quận Kiến An', ProvinceID: 204 }
  ],

  // 5. Cần Thơ (205)
  205: [
    { DistrictID: 1561, DistrictName: 'Quận Ninh Kiều', ProvinceID: 205 },
    { DistrictID: 1562, DistrictName: 'Quận Bình Thủy', ProvinceID: 205 },
    { DistrictID: 1563, DistrictName: 'Quận Cái Răng', ProvinceID: 205 }
  ],

  // 6. Huế (206)
  206: [
    { DistrictID: 1571, DistrictName: 'Thành phố Huế', ProvinceID: 206 },
    { DistrictID: 1572, DistrictName: 'Thị xã Hương Thủy', ProvinceID: 206 }
  ],

  // 7. Quảng Ninh (207)
  207: [
    { DistrictID: 1581, DistrictName: 'Thành phố Hạ Long', ProvinceID: 207 },
    { DistrictID: 1582, DistrictName: 'Thành phố Cẩm Phả', ProvinceID: 207 }
  ],

  // 8. Bắc Ninh (208)
  208: [
    { DistrictID: 1591, DistrictName: 'Thành phố Bắc Ninh', ProvinceID: 208 },
    { DistrictID: 1592, DistrictName: 'Thành phố Từ Sơn', ProvinceID: 208 }
  ],

  // 9. Đồng Nai (209)
  209: [
    { DistrictID: 1601, DistrictName: 'Thành phố Biên Hòa', ProvinceID: 209 },
    { DistrictID: 1602, DistrictName: 'Thành phố Long Khánh', ProvinceID: 209 }
  ]
};

export const GHN_WARDS = {
  // Cầu Giấy (1442)
  1442: [
    { WardCode: '20314', WardName: 'Phường Dịch Vọng Hậu', DistrictID: 1442 },
    { WardCode: '20305', WardName: 'Phường Dịch Vọng', DistrictID: 1442 },
    { WardCode: '20307', WardName: 'Phường Mai Dịch', DistrictID: 1442 },
    { WardCode: '20308', WardName: 'Phường Nghĩa Đô', DistrictID: 1442 },
    { WardCode: '20309', WardName: 'Phường Nghĩa Tân', DistrictID: 1442 },
    { WardCode: '20311', WardName: 'Phường Quan Hoa', DistrictID: 1442 },
    { WardCode: '20313', WardName: 'Phường Trung Hòa', DistrictID: 1442 },
    { WardCode: '20312', WardName: 'Phường Yên Hòa', DistrictID: 1442 }
  ],

  // Ba Đình (1443)
  1443: [
    { WardCode: '20404', WardName: 'Phường Giảng Võ', DistrictID: 1443 },
    { WardCode: '20405', WardName: 'Phường Kim Mã', DistrictID: 1443 },
    { WardCode: '20407', WardName: 'Phường Ngọc Hà', DistrictID: 1443 },
    { WardCode: '20408', WardName: 'Phường Ngọc Khánh', DistrictID: 1443 },
    { WardCode: '20403', WardName: 'Phường Đội Cấn', DistrictID: 1443 },
    { WardCode: '20401', WardName: 'Phường Cống Vị', DistrictID: 1443 },
    { WardCode: '20402', WardName: 'Phường Điện Biên', DistrictID: 1443 },
    { WardCode: '20406', WardName: 'Phường Liễu Giai', DistrictID: 1443 },
    { WardCode: '20410', WardName: 'Phường Phúc Xá', DistrictID: 1443 },
    { WardCode: '20411', WardName: 'Phường Quán Thánh', DistrictID: 1443 },
    { WardCode: '20412', WardName: 'Phường Thành Công', DistrictID: 1443 },
    { WardCode: '20413', WardName: 'Phường Trúc Bạch', DistrictID: 1443 },
    { WardCode: '20414', WardName: 'Phường Vĩnh Phúc', DistrictID: 1443 },
    { WardCode: '20409', WardName: 'Phường Nguyễn Trung Trực', DistrictID: 1443 }
  ],

  // Hoàn Kiếm (1444)
  1444: [
    { WardCode: '20103', WardName: 'Phường Cửa Nam', DistrictID: 1444 },
    { WardCode: '20102', WardName: 'Phường Cửa Đông', DistrictID: 1444 },
    { WardCode: '20105', WardName: 'Phường Hàng Bạc', DistrictID: 1444 },
    { WardCode: '20106', WardName: 'Phường Hàng Bài', DistrictID: 1444 },
    { WardCode: '20107', WardName: 'Phường Hàng Bồ', DistrictID: 1444 },
    { WardCode: '20108', WardName: 'Phường Hàng Bông', DistrictID: 1444 },
    { WardCode: '20109', WardName: 'Phường Hàng Buồm', DistrictID: 1444 },
    { WardCode: '20110', WardName: 'Phường Hàng Đào', DistrictID: 1444 },
    { WardCode: '20111', WardName: 'Phường Hàng Gai', DistrictID: 1444 },
    { WardCode: '20112', WardName: 'Phường Hàng Mã', DistrictID: 1444 },
    { WardCode: '20113', WardName: 'Phường Hàng Trống', DistrictID: 1444 },
    { WardCode: '20104', WardName: 'Phường Đồng Xuân', DistrictID: 1444 },
    { WardCode: '20101', WardName: 'Phường Chương Dương', DistrictID: 1444 },
    { WardCode: '20114', WardName: 'Phường Lý Thái Tổ', DistrictID: 1444 },
    { WardCode: '20115', WardName: 'Phường Phan Chu Trinh', DistrictID: 1444 },
    { WardCode: '20116', WardName: 'Phường Phúc Tân', DistrictID: 1444 },
    { WardCode: '20117', WardName: 'Phường Tràng Tiền', DistrictID: 1444 },
    { WardCode: '20118', WardName: 'Phường Trần Hưng Đạo', DistrictID: 1444 }
  ],

  // Đống Đa (1447)
  1447: [
    { WardCode: '20501', WardName: 'Phường Cát Linh', DistrictID: 1447 },
    { WardCode: '20502', WardName: 'Phường Hàng Bột', DistrictID: 1447 },
    { WardCode: '20503', WardName: 'Phường Khâm Thiên', DistrictID: 1447 },
    { WardCode: '20504', WardName: 'Phường Khương Thượng', DistrictID: 1447 },
    { WardCode: '20505', WardName: 'Phường Kim Liên', DistrictID: 1447 },
    { WardCode: '20506', WardName: 'Phường Láng Hạ', DistrictID: 1447 },
    { WardCode: '20507', WardName: 'Phường Láng Thượng', DistrictID: 1447 },
    { WardCode: '20508', WardName: 'Phường Nam Đồng', DistrictID: 1447 },
    { WardCode: '20509', WardName: 'Phường Ngã Tư Sở', DistrictID: 1447 },
    { WardCode: '20510', WardName: 'Phường Ô Chợ Dừa', DistrictID: 1447 },
    { WardCode: '20511', WardName: 'Phường Phương Liên', DistrictID: 1447 },
    { WardCode: '20512', WardName: 'Phường Phương Mai', DistrictID: 1447 },
    { WardCode: '20513', WardName: 'Phường Quang Trung', DistrictID: 1447 },
    { WardCode: '20514', WardName: 'Phường Quốc Tử Giám', DistrictID: 1447 },
    { WardCode: '20515', WardName: 'Phường Thịnh Quang', DistrictID: 1447 },
    { WardCode: '20516', WardName: 'Phường Thổ Quan', DistrictID: 1447 },
    { WardCode: '20517', WardName: 'Phường Trung Liệt', DistrictID: 1447 },
    { WardCode: '20518', WardName: 'Phường Trung Phụng', DistrictID: 1447 },
    { WardCode: '20519', WardName: 'Phường Trung Tự', DistrictID: 1447 },
    { WardCode: '20520', WardName: 'Phường Văn Chương', DistrictID: 1447 },
    { WardCode: '20521', WardName: 'Phường Văn Miếu', DistrictID: 1447 }
  ],

  // Hai Bà Trưng (1448)
  1448: [
    { WardCode: '20601', WardName: 'Phường Bạch Đằng', DistrictID: 1448 },
    { WardCode: '20602', WardName: 'Phường Bách Khoa', DistrictID: 1448 },
    { WardCode: '20603', WardName: 'Phường Bạch Mai', DistrictID: 1448 },
    { WardCode: '20604', WardName: 'Phường Cầu Dền', DistrictID: 1448 },
    { WardCode: '20605', WardName: 'Phường Đống Mác', DistrictID: 1448 },
    { WardCode: '20606', WardName: 'Phường Đồng Nhân', DistrictID: 1448 },
    { WardCode: '20607', WardName: 'Phường Đồng Tâm', DistrictID: 1448 },
    { WardCode: '20608', WardName: 'Phường Lê Đại Hành', DistrictID: 1448 },
    { WardCode: '20609', WardName: 'Phường Minh Khai', DistrictID: 1448 },
    { WardCode: '20610', WardName: 'Phường Nguyễn Du', DistrictID: 1448 },
    { WardCode: '20611', WardName: 'Phường Phạm Đình Hổ', DistrictID: 1448 },
    { WardCode: '20612', WardName: 'Phường Phố Huế', DistrictID: 1448 },
    { WardCode: '20613', WardName: 'Phường Quỳnh Lôi', DistrictID: 1448 },
    { WardCode: '20614', WardName: 'Phường Quỳnh Mai', DistrictID: 1448 },
    { WardCode: '20615', WardName: 'Phường Thanh Lương', DistrictID: 1448 },
    { WardCode: '20616', WardName: 'Phường Thanh Nhàn', DistrictID: 1448 },
    { WardCode: '20617', WardName: 'Phường Trương Định', DistrictID: 1448 },
    { WardCode: '20618', WardName: 'Phường Vĩnh Tuy', DistrictID: 1448 }
  ],

  // Tây Hồ (1446)
  1446: [
    { WardCode: '20201', WardName: 'Phường Bưởi', DistrictID: 1446 },
    { WardCode: '20202', WardName: 'Phường Nhật Tân', DistrictID: 1446 },
    { WardCode: '20203', WardName: 'Phường Phú Thượng', DistrictID: 1446 },
    { WardCode: '20204', WardName: 'Phường Quảng An', DistrictID: 1446 },
    { WardCode: '20205', WardName: 'Phường Thụy Khuê', DistrictID: 1446 },
    { WardCode: '20206', WardName: 'Phường Tứ Liên', DistrictID: 1446 },
    { WardCode: '20207', WardName: 'Phường Xuân La', DistrictID: 1446 },
    { WardCode: '20208', WardName: 'Phường Yên Phụ', DistrictID: 1446 }
  ],

  // Thanh Xuân (1450)
  1450: [
    { WardCode: '20801', WardName: 'Phường Hạ Đình', DistrictID: 1450 },
    { WardCode: '20802', WardName: 'Phường Khương Đình', DistrictID: 1450 },
    { WardCode: '20803', WardName: 'Phường Khương Mai', DistrictID: 1450 },
    { WardCode: '20804', WardName: 'Phường Khương Trung', DistrictID: 1450 },
    { WardCode: '20805', WardName: 'Phường Kim Giang', DistrictID: 1450 },
    { WardCode: '20806', WardName: 'Phường Nhân Chính', DistrictID: 1450 },
    { WardCode: '20807', WardName: 'Phường Phương Liệt', DistrictID: 1450 },
    { WardCode: '20808', WardName: 'Phường Thanh Xuân Bắc', DistrictID: 1450 },
    { WardCode: '20809', WardName: 'Phường Thanh Xuân Nam', DistrictID: 1450 },
    { WardCode: '20810', WardName: 'Phường Thanh Xuân Trung', DistrictID: 1450 },
    { WardCode: '20811', WardName: 'Phường Thượng Đình', DistrictID: 1450 }
  ],

  // Nam Từ Liêm (1452)
  1452: [
    { WardCode: '21101', WardName: 'Phường Cầu Diễn', DistrictID: 1452 },
    { WardCode: '21102', WardName: 'Phường Đại Mỗ', DistrictID: 1452 },
    { WardCode: '21103', WardName: 'Phường Mễ Trì', DistrictID: 1452 },
    { WardCode: '21104', WardName: 'Phường Mỹ Đình 1', DistrictID: 1452 },
    { WardCode: '21105', WardName: 'Phường Mỹ Đình 2', DistrictID: 1452 },
    { WardCode: '21106', WardName: 'Phường Phú Đô', DistrictID: 1452 },
    { WardCode: '21107', WardName: 'Phường Phương Canh', DistrictID: 1452 },
    { WardCode: '21108', WardName: 'Phường Tây Mỗ', DistrictID: 1452 },
    { WardCode: '21109', WardName: 'Phường Trung Văn', DistrictID: 1452 },
    { WardCode: '21110', WardName: 'Phường Xuân Phương', DistrictID: 1452 }
  ],

  // Bắc Từ Liêm (1453)
  1453: [
    { WardCode: '21201', WardName: 'Phường Cổ Nhuế 1', DistrictID: 1453 },
    { WardCode: '21202', WardName: 'Phường Cổ Nhuế 2', DistrictID: 1453 },
    { WardCode: '21203', WardName: 'Phường Đông Ngạc', DistrictID: 1453 },
    { WardCode: '21204', WardName: 'Phường Đức Thắng', DistrictID: 1453 },
    { WardCode: '21205', WardName: 'Phường Liên Mạc', DistrictID: 1453 },
    { WardCode: '21206', WardName: 'Phường Minh Khai', DistrictID: 1453 },
    { WardCode: '21207', WardName: 'Phường Phú Diễn', DistrictID: 1453 },
    { WardCode: '21208', WardName: 'Phường Phúc Diễn', DistrictID: 1453 },
    { WardCode: '21209', WardName: 'Phường Tây Tựu', DistrictID: 1453 },
    { WardCode: '21210', WardName: 'Phường Thượng Cát', DistrictID: 1453 },
    { WardCode: '21211', WardName: 'Phường Thụy Phương', DistrictID: 1453 },
    { WardCode: '21212', WardName: 'Phường Xuân Đỉnh', DistrictID: 1453 },
    { WardCode: '21213', WardName: 'Phường Xuân Tảo', DistrictID: 1453 }
  ],

  // Hà Đông (1454)
  1454: [
    { WardCode: '21307', WardName: 'Phường Mộ Lao', DistrictID: 1454 },
    { WardCode: '21315', WardName: 'Phường Văn Quán', DistrictID: 1454 },
    { WardCode: '21314', WardName: 'Phường Vạn Phúc', DistrictID: 1454 },
    { WardCode: '21304', WardName: 'Phường Hà Cầu', DistrictID: 1454 },
    { WardCode: '21306', WardName: 'Phường La Khê', DistrictID: 1454 },
    { WardCode: '21313', WardName: 'Phường Quang Trung', DistrictID: 1454 },
    { WardCode: '21317', WardName: 'Phường Yết Kiêu', DistrictID: 1454 },
    { WardCode: '21308', WardName: 'Phường Nguyễn Trãi', DistrictID: 1454 },
    { WardCode: '21312', WardName: 'Phường Phúc La', DistrictID: 1454 },
    { WardCode: '21309', WardName: 'Phường Phú La', DistrictID: 1454 },
    { WardCode: '21305', WardName: 'Phường Kiến Hưng', DistrictID: 1454 },
    { WardCode: '21316', WardName: 'Phường Yên Nghĩa', DistrictID: 1454 },
    { WardCode: '21303', WardName: 'Phường Dương Nội', DistrictID: 1454 }
  ],

  // TP.HCM - Quận 1 (1482)
  1482: [
    { WardCode: '21001', WardName: 'Phường Bến Nghé', DistrictID: 1482 },
    { WardCode: '21002', WardName: 'Phường Bến Thành', DistrictID: 1482 },
    { WardCode: '21003', WardName: 'Phường Cầu Kho', DistrictID: 1482 },
    { WardCode: '21004', WardName: 'Phường Cầu Ông Lãnh', DistrictID: 1482 },
    { WardCode: '21005', WardName: 'Phường Cô Giang', DistrictID: 1482 },
    { WardCode: '21006', WardName: 'Phường Đa Kao', DistrictID: 1482 },
    { WardCode: '21007', WardName: 'Phường Nguyễn Cư Trinh', DistrictID: 1482 },
    { WardCode: '21008', WardName: 'Phường Nguyễn Thái Bình', DistrictID: 1482 },
    { WardCode: '21009', WardName: 'Phường Phạm Ngũ Lão', DistrictID: 1482 },
    { WardCode: '21010', WardName: 'Phường Tân Định', DistrictID: 1482 }
  ],

  // TP.HCM - Quận 3 (1484)
  1484: [
    { WardCode: '21101', WardName: 'Phường 1', DistrictID: 1484 },
    { WardCode: '21102', WardName: 'Phường 2', DistrictID: 1484 },
    { WardCode: '21103', WardName: 'Phường 3', DistrictID: 1484 },
    { WardCode: '21104', WardName: 'Phường 4', DistrictID: 1484 },
    { WardCode: '21105', WardName: 'Phường 5', DistrictID: 1484 },
    { WardCode: '21106', WardName: 'Phường Võ Thị Sáu', DistrictID: 1484 },
    { WardCode: '21109', WardName: 'Phường 9', DistrictID: 1484 },
    { WardCode: '21110', WardName: 'Phường 10', DistrictID: 1484 },
    { WardCode: '21111', WardName: 'Phường 11', DistrictID: 1484 },
    { WardCode: '21112', WardName: 'Phường 12', DistrictID: 1484 },
    { WardCode: '21113', WardName: 'Phường 13', DistrictID: 1484 },
    { WardCode: '21114', WardName: 'Phường 14', DistrictID: 1484 }
  ],

  // TP.HCM - Thủ Đức (1488)
  1488: [
    { WardCode: '21501', WardName: 'Phường Thảo Điền', DistrictID: 1488 },
    { WardCode: '21502', WardName: 'Phường An Phú', DistrictID: 1488 },
    { WardCode: '21503', WardName: 'Phường An Khánh', DistrictID: 1488 },
    { WardCode: '21504', WardName: 'Phường Thủ Thiêm', DistrictID: 1488 },
    { WardCode: '21507', WardName: 'Phường Hiệp Bình Chánh', DistrictID: 1488 },
    { WardCode: '21508', WardName: 'Phường Hiệp Bình Phước', DistrictID: 1488 },
    { WardCode: '21509', WardName: 'Phường Hiệp Phú', DistrictID: 1488 },
    { WardCode: '21510', WardName: 'Phường Linh Chiểu', DistrictID: 1488 },
    { WardCode: '21511', WardName: 'Phường Linh Đông', DistrictID: 1488 },
    { WardCode: '21513', WardName: 'Phường Linh Trung', DistrictID: 1488 },
    { WardCode: '21514', WardName: 'Phường Linh Xuân', DistrictID: 1488 },
    { WardCode: '21519', WardName: 'Phường Phú Hữu', DistrictID: 1488 },
    { WardCode: '21520', WardName: 'Phường Phước Bình', DistrictID: 1488 },
    { WardCode: '21521', WardName: 'Phường Phước Long A', DistrictID: 1488 },
    { WardCode: '21522', WardName: 'Phường Phước Long B', DistrictID: 1488 },
    { WardCode: '21527', WardName: 'Phường Thạnh Mỹ Lợi', DistrictID: 1488 }
  ],

  // Đà Nẵng - Hải Châu (1534)
  1534: [
    { WardCode: '22001', WardName: 'Phường Bình Hiên', DistrictID: 1534 },
    { WardCode: '22002', WardName: 'Phường Bình Thuận', DistrictID: 1534 },
    { WardCode: '22003', WardName: 'Phường Hải Châu 1', DistrictID: 1534 },
    { WardCode: '22004', WardName: 'Phường Hải Châu 2', DistrictID: 1534 },
    { WardCode: '22005', WardName: 'Phường Hòa Cường Bắc', DistrictID: 1534 },
    { WardCode: '22006', WardName: 'Phường Hòa Cường Nam', DistrictID: 1534 },
    { WardCode: '22007', WardName: 'Phường Hòa Thuận Đông', DistrictID: 1534 },
    { WardCode: '22008', WardName: 'Phường Hòa Thuận Tây', DistrictID: 1534 },
    { WardCode: '22009', WardName: 'Phường Nam Dương', DistrictID: 1534 },
    { WardCode: '22010', WardName: 'Phường Phước Ninh', DistrictID: 1534 },
    { WardCode: '22011', WardName: 'Phường Thạch Thang', DistrictID: 1534 },
    { WardCode: '22012', WardName: 'Phường Thanh Bình', DistrictID: 1534 },
    { WardCode: '22013', WardName: 'Phường Thuận Phước', DistrictID: 1534 }
  ],

  // Hải Phòng - Thủy Nguyên (1548)
  1548: [
    { WardCode: '22301', WardName: 'Phường Thủy Nguyên', DistrictID: 1548 },
    { WardCode: '22302', WardName: 'Phường Thiên Hương', DistrictID: 1548 },
    { WardCode: '22303', WardName: 'Phường Hòa Bình', DistrictID: 1548 },
    { WardCode: '22304', WardName: 'Phường Nam Triệu', DistrictID: 1548 },
    { WardCode: '22305', WardName: 'Phường Bạch Đằng', DistrictID: 1548 }
  ]
};

/**
 * Lấy danh sách Quận/Huyện theo Tỉnh/Thành
 */
export function getGhnDistricts(provinceIdOrName) {
  if (!provinceIdOrName) return GHN_DISTRICTS[201] || [];

  // Tìm theo ProvinceID
  if (typeof provinceIdOrName === 'number' || !isNaN(Number(provinceIdOrName))) {
    const id = Number(provinceIdOrName);
    if (GHN_DISTRICTS[id]) return GHN_DISTRICTS[id];
  }

  // Tìm theo tên tỉnh
  const clean = String(provinceIdOrName).toLowerCase().replace(/^(tỉnh|thành phố|tp\.?|tp)\s+/i, '').trim();
  const matchedProv = GHN_PROVINCES.find(p => {
    const pClean = p.ProvinceName.toLowerCase().replace(/^(tỉnh|thành phố|tp\.?|tp)\s+/i, '').trim();
    return pClean.includes(clean) || clean.includes(pClean);
  });

  if (matchedProv && GHN_DISTRICTS[matchedProv.ProvinceID]) {
    return GHN_DISTRICTS[matchedProv.ProvinceID];
  }

  return GHN_DISTRICTS[201];
}

/**
 * Lấy danh sách Phường/Xã theo Quận/Huyện kèm WardCode chuẩn GHN
 */
export function getGhnWards(districtIdOrName) {
  if (!districtIdOrName) return GHN_WARDS[1442] || [];

  // Tìm theo DistrictID
  if (typeof districtIdOrName === 'number' || !isNaN(Number(districtIdOrName))) {
    const id = Number(districtIdOrName);
    if (GHN_WARDS[id]) return GHN_WARDS[id];
  }

  // Tìm theo tên quận
  const clean = String(districtIdOrName).toLowerCase().replace(/^(quận|huyện|thị xã|thành phố|tp\.?|tp)\s+/i, '').trim();
  for (const [distId, wards] of Object.entries(GHN_WARDS)) {
    for (const [provId, districts] of Object.entries(GHN_DISTRICTS)) {
      const foundDist = districts.find(d => String(d.DistrictID) === String(distId));
      if (foundDist) {
        const dClean = foundDist.DistrictName.toLowerCase().replace(/^(quận|huyện|thị xã|thành phố|tp\.?|tp)\s+/i, '').trim();
        if (dClean === clean || dClean.includes(clean) || clean.includes(dClean)) {
          return wards;
        }
      }
    }
  }

  return GHN_WARDS[1442] || [];
}

/**
 * Tự động giải quyết to_district_id và to_ward_code chuẩn từ chuỗi địa chỉ
 */
export function resolveGhnCodes(provinceName = '', districtName = '', wardName = '') {
  let districtId = 1442; // Mặc định Cầu Giấy
  let wardCode = '20314'; // Mặc định Dịch Vọng Hậu
  let matchedDistrictName = 'Quận Cầu Giấy';
  let matchedWardName = 'Phường Dịch Vọng Hậu';

  const cleanWard = String(wardName || '').toLowerCase().trim();
  const cleanDist = String(districtName || '').toLowerCase().trim();

  // 1. Tìm trực tiếp trong danh sách các Wards
  for (const [dId, wards] of Object.entries(GHN_WARDS)) {
    const foundW = wards.find(w => {
      const wClean = w.WardName.toLowerCase();
      const codeClean = w.WardCode.toLowerCase();
      return wClean === cleanWard || 
             wClean.includes(cleanWard) || 
             cleanWard.includes(wClean) ||
             w.WardName.replace(/^(phường|xã|thị trấn)\s+/i, '').trim().toLowerCase() === cleanWard.replace(/^(phường|xã|thị trấn)\s+/i, '').trim().toLowerCase() ||
             codeClean === cleanWard;
    });

    if (foundW) {
      wardCode = foundW.WardCode;
      districtId = Number(dId);
      matchedWardName = foundW.WardName;

      // Tìm tên quận
      for (const districts of Object.values(GHN_DISTRICTS)) {
        const dObj = districts.find(d => d.DistrictID === districtId);
        if (dObj) matchedDistrictName = dObj.DistrictName;
      }
      return { districtId, wardCode, districtName: matchedDistrictName, wardName: matchedWardName };
    }
  }

  // 2. Tìm theo tên Quận trước nếu có
  const districts = getGhnDistricts(provinceName);
  const foundDist = districts.find(d => {
    const dClean = d.DistrictName.toLowerCase();
    return dClean.includes(cleanDist) || cleanDist.includes(dClean);
  });

  if (foundDist) {
    districtId = foundDist.DistrictID;
    matchedDistrictName = foundDist.DistrictName;
    const wards = GHN_WARDS[districtId] || [];
    const foundW = wards.find(w => w.WardName.toLowerCase().includes(cleanWard) || cleanWard.includes(w.WardName.toLowerCase()));
    if (foundW) {
      wardCode = foundW.WardCode;
      matchedWardName = foundW.WardName;
    } else if (wards.length > 0) {
      wardCode = wards[0].WardCode;
      matchedWardName = wards[0].WardName;
    }
  }

  return { districtId, wardCode, districtName: matchedDistrictName, wardName: matchedWardName };
}
