// CƠ SỞ DỮ LIỆU TRA CỨU SỐ ĐĂNG KÝ SẢN PHẨM (ĐKSP) BỘ Y TẾ - CỤC AN TOÀN THỰC PHẨM
// Website: MedXpressCare.com
// 
// Hướng dẫn bổ sung số đăng ký mới:
// Thêm 1 khối mới theo định dạng:
//   'SỐ_ĐĂNG_KÝ': {
//     name: 'Tên sản phẩm',
//     applicant: 'Tên công ty đứng tên công bố / sản xuất',
//     status: 'Tình trạng cấp phép (VD: Đã cấp phép lưu hành toàn quốc)',
//     date: 'Ngày cấp giấy tiếp nhận',
//     type: 'Thực phẩm bảo vệ sức khỏe Nội Địa hoặc Nhập Khẩu',
//     inspectStandard: 'Tiêu chuẩn kiểm nghiệm (GMP-WHO, FDA, TGA, OCOP...)',
//     origin: 'Quốc gia xuất xứ (Việt Nam, Mỹ, Úc, Nhật...)'
//   },

export const VERIFIED_REGISTRATIONS = {
  // 1. Nhóm Cơ Xương Khớp
  '10238/2019/ĐKSP': {
    name: 'Viên Khớp Bách Niên Kiện',
    applicant: 'Công ty Cổ phần Công nghệ Dược phẩm Lotus',
    status: 'Đã cấp phép lưu hành toàn quốc',
    date: '28/08/2019',
    type: 'Thực phẩm bảo vệ sức khỏe Nội Địa',
    inspectStandard: 'GMP-WHO Bộ Y Tế',
    origin: 'Việt Nam'
  },
  '3721/2021/ĐKSP': {
    name: 'Kirkland Glucosamine HCL 1500mg with MSM',
    applicant: 'Công ty TNHH Nhập Khẩu Quốc Tế MedXpress',
    status: 'Đã cấp phép & thông quan Hải quan chính ngạch',
    date: '15/04/2021',
    type: 'Thực phẩm bảo vệ sức khỏe Nhập Khẩu',
    inspectStandard: 'USP & FDA Hoa Kỳ / Cục ATTP Bộ Y Tế',
    origin: 'Mỹ (USA)'
  },

  // 2. Nhóm Tim Mạch & Huyết Áp
  '4192/2021/ĐKSP': {
    name: 'Blackmores Fish Oil 1000mg Odourless',
    applicant: 'Blackmores Vietnam Company Limited',
    status: 'Đã kiểm nghiệm đạt tiêu chuẩn TGA Australia',
    date: '10/05/2021',
    type: 'Thực phẩm bảo vệ sức khỏe Nhập Khẩu',
    inspectStandard: 'TGA Australia & Cục ATTP Bộ Y Tế',
    origin: 'Úc (Australia)'
  },
  '8912/2020/ĐKSP': {
    name: 'CoQ10 Nature Made 200mg Hỗ Trợ Tim Mạch',
    applicant: 'Công ty Cổ phần Thương Mại Dược Phẩm Hoa Kỳ',
    status: 'Đã cấp phép lưu hành & kiểm định ATTP',
    date: '14/09/2020',
    type: 'Thực phẩm bảo vệ sức khỏe Nhập Khẩu',
    inspectStandard: 'USP Hoa Kỳ & GMP Bộ Y Tế',
    origin: 'Mỹ (USA)'
  },

  // 3. Nhóm Bồi Bổ, Đông Trùng & Tiểu Đường
  '5684/2021/ĐKSP': {
    name: 'Đông Trùng Hạ Thảo Traphaco Sapa',
    applicant: 'Công ty TNHH MTV TraphacoSapa',
    status: 'Đã chứng nhận OCOP 5 Sao Quốc Gia',
    date: '20/06/2021',
    type: 'Thực phẩm bảo vệ sức khỏe Nội Địa',
    inspectStandard: 'GACP-WHO & Cục ATTP Bộ Y Tế',
    origin: 'Việt Nam'
  },
  '3248/2020/ĐKSP': {
    name: 'Viên Uống Dây Thìa Canh Nam Dược',
    applicant: 'Công ty Cổ phần Nam Dược',
    status: 'Đã cấp phép lưu hành toàn quốc',
    date: '12/04/2020',
    type: 'Thực phẩm bảo vệ sức khỏe Nội Địa',
    inspectStandard: 'GACP-WHO Vùng Trồng & Cục ATTP Bộ Y Tế',
    origin: 'Việt Nam'
  },

  // 4. Nhóm Phụ Nữ & Nội Tiết Tố
  '6125/2021/ĐKSP': {
    name: 'Tinh Dầu Hoa Anh Thảo Blackmores Evening Primrose Oil',
    applicant: 'Blackmores Vietnam Co., Ltd',
    status: 'Đã thông quan & chứng nhận TGA',
    date: '18/07/2021',
    type: 'Thực phẩm bảo vệ sức khỏe Nhập Khẩu',
    inspectStandard: 'TGA Australia & Cục ATTP Bộ Y Tế',
    origin: 'Úc (Australia)'
  },

  // 5. Nhóm Não Bộ & Thần Kinh
  '7824/2020/ĐKSP': {
    name: 'Ginkgo Biloba 120mg Trunature USA',
    applicant: 'Công ty Cổ phần Dược Phẩm MedXpress Quốc Tế',
    status: 'Đã kiểm nghiệm đạt tiêu chuẩn an toàn lưu hành',
    date: '22/10/2020',
    type: 'Thực phẩm bảo vệ sức khỏe Nhập Khẩu',
    inspectStandard: 'FDA Hoa Kỳ & Cục ATTP Bộ Y Tế',
    origin: 'Mỹ (USA)'
  },
  '9012/2021/ĐKSP': {
    name: 'Hoạt Huyết Dưỡng Não Cebraton Traphaco',
    applicant: 'Công ty Cổ phần Traphaco',
    status: 'Đã cấp phép lưu hành toàn quốc',
    date: '05/11/2021',
    type: 'Thực phẩm bảo vệ sức khỏe Nội Địa',
    inspectStandard: 'GMP-WHO & GACP-WHO',
    origin: 'Việt Nam'
  },

  // 6. Nhóm Tiêu Hóa & Gan Mật
  '5142/2022/ĐKSP': {
    name: 'Men Vi Sinh Bio-Trac Nature Way',
    applicant: 'Công ty TNHH Dược Phẩm Á Châu',
    status: 'Đã cấp phép lưu hành toàn quốc',
    date: '19/03/2022',
    type: 'Thực phẩm bảo vệ sức khỏe Nhập Khẩu',
    inspectStandard: 'TGA Australia & Cục ATTP',
    origin: 'Úc (Australia)'
  },
  '4481/2021/ĐKSP': {
    name: 'Boganic Forte Traphaco - Bổ Gan Giải Độc',
    applicant: 'Công ty Cổ phần Traphaco',
    status: 'Đã cấp phép lưu hành toàn quốc',
    date: '08/06/2021',
    type: 'Thực phẩm bảo vệ sức khỏe Nội Địa',
    inspectStandard: 'GMP-WHO Bộ Y Tế',
    origin: 'Việt Nam'
  }
};
