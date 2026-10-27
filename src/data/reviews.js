// Dữ liệu Đánh Giá Khách Hàng (Customer Reviews & UGC) MedXpressCare.com
// Phân tách đánh giá có hình ảnh thực tế, tem phụ Bộ Y Tế, và phản hồi chính thức từ Dược sĩ Chuyên môn

export const INITIAL_REVIEWS = [
  {
    id: 'rev-01',
    productId: 'vn-01', // Viên Khớp Bách Niên Kiện
    productName: 'Viên Khớp Bách Niên Kiện - Chiết xuất Vỏ Liễu Trắng & Móng Quỷ',
    customerName: 'Bác Nguyễn Văn Thắng',
    customerPhone: '0912***678',
    rating: 5,
    createdAt: '2026-10-18',
    audience: 'elderly',
    audienceLabel: 'Người cao tuổi (63 tuổi)',
    isVerifiedPurchase: true,
    title: 'Khớp gối đỡ kêu lục cục hẳn sau 2 tuần dùng',
    content: 'Tôi 63 tuổi bị thoái hóa khớp gối 5 năm nay, leo cầu thang rất đau buốt và phát ra tiếng lạo xạo. Sau khi được Dược sĩ tư vấn dùng liệu trình 3 hộp Bách Niên Kiện, uống sau ăn sáng và tối. Đến nay hết 1 hộp thấy đầu gối nhẹ hẳn, đứng lên ngồi xuống không còn phải vịn tay. Hàng có tem Bộ Y Tế và tem chống giả cào mã rất an tâm.',
    photos: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1576073719676-aa95576db207?w=600&auto=format&fit=crop&q=80'
    ],
    pharmacistReply: 'Kính chào Bác Thắng! Dược sĩ MedXpressCare rất vui khi nhận được phản hồi tích cực từ bác. Hoạt chất Vỏ Liễu Trắng và Móng Quỷ trong Bách Niên Kiện giúp kháng viêm sinh học rất an toàn cho dạ dày. Bác nhớ duy trì đủ liệu trình 3 hộp và tập co duỗi khớp nhẹ nhàng mỗi sáng bác nhé!',
    pharmacistName: 'DS. CKI Nguyễn Thu Trang',
    replyDate: '2026-10-18',
    status: 'approved',
    likes: 24
  },
  {
    id: 'rev-02',
    productId: 'us-01', // Glucosamine Kirkland
    productName: 'Glucosamine HCL 1500mg With MSM 1500mg Kirkland Signature USA',
    customerName: 'Cô Lê Thị Mai',
    customerPhone: '0983***122',
    rating: 5,
    createdAt: '2026-10-15',
    audience: 'elderly',
    audienceLabel: 'Người cao tuổi (58 tuổi)',
    isVerifiedPurchase: true,
    title: 'Hàng chuẩn chính ngạch có tem phụ tiếng Việt và hóa đơn đỏ',
    content: 'Trước đây tôi hay mua hàng xách tay bên ngoài rất sợ hàng giả. Mua ở MedXpressCare được kiểm tra mã vạch, có tem phụ tiếng Việt đúng chuẩn Nghị định 43 và xuất cả hóa đơn điện tử. Lọ 375 viên dùng được cả năm, tính ra rất tiết kiệm. Khớp tay và lưng bớt đau mỏi rõ rệt.',
    photos: [
      'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80'
    ],
    pharmacistReply: 'Dạ chào Cô Mai! Toàn bộ sản phẩm nhập khẩu tại MedXpressCare đều có giấy tiếp nhận đăng ký của Cục ATTP - Bộ Y Tế. Do hàm lượng Glucosamine 1500mg chuẩn, cô uống 1-2 viên sau bữa ăn trưa là tối ưu nhất cô nhé!',
    pharmacistName: 'DS. Trần Quốc Tuấn',
    replyDate: '2026-10-16',
    status: 'approved',
    likes: 18
  },
  {
    id: 'rev-03',
    productId: 'jp-03', // DHC Lutein
    productName: 'Viên Uống Bổ Mắt DHC Lutein Quang Học Chống Ánh Sáng Xanh',
    customerName: 'Bạn Phạm Minh Khang',
    customerPhone: '0977***890',
    rating: 5,
    createdAt: '2026-10-12',
    audience: 'office',
    audienceLabel: 'Dân văn phòng (28 tuổi)',
    isVerifiedPurchase: true,
    title: 'Cứu tinh cho dân IT ngồi máy tính 10h mỗi ngày',
    content: 'Mình làm lập trình viên nhìn màn hình liên tục từ sáng tới tối, mắt hay bị cay xè, nhòe và chảy nước mắt. Uống DHC Lutein này được 3 tuần thấy mắt êm hẳn, không còn cảm giác căng mỏi rát mắt nữa. Gói nhỏ gọn tiện mang lên công ty. Giao hàng hỏa tốc nhận trong 2 tiếng rất ưng ý!',
    photos: [
      'https://images.unsplash.com/photo-1550572017-ed211516e812?w=600&auto=format&fit=crop&q=80'
    ],
    pharmacistReply: 'Cảm ơn Khang đã tin dùng sản phẩm! Mỗi viên DHC chứa 16mg Lutein chiết xuất cúc vạn thọ giúp tái lập điểm vàng. Khang kết hợp thêm quy tắc 20-20-20 để bảo vệ mắt lâu dài nhé.',
    pharmacistName: 'DS. CKI Nguyễn Thu Trang',
    replyDate: '2026-10-13',
    status: 'approved',
    likes: 31
  },
  {
    id: 'rev-04',
    productId: 'au-03', // Tinh dầu hoa anh thảo Blackmores
    productName: 'Tinh Dầu Hoa Anh Thảo Blackmores Evening Primrose Oil 1000mg Úc',
    customerName: 'Chị Đỗ Thu Thảo',
    customerPhone: '0905***456',
    rating: 5,
    createdAt: '2026-10-10',
    audience: 'women',
    audienceLabel: 'Phụ nữ sau sinh (34 tuổi)',
    isVerifiedPurchase: true,
    title: 'Hết hẳn bốc hỏa, da dẻ mịn màng và giảm rụng tóc',
    content: 'Sau khi sinh bé thứ 2 nội tiết tố mình thay đổi dữ lắm, người hay bốc hỏa đêm khó ngủ, da khô nám và tóc rụng cả nắm. Được Dược sĩ AI trên web tư vấn dòng EPO Úc này, dùng được hơn 1 tháng thấy ngủ ngon hơn, da ẩm mượt căng bóng và tâm trạng vui vẻ trở lại. Đóng gói rất kỹ, có cả thư dặn dò của dược sĩ.',
    photos: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'
    ],
    pharmacistReply: 'Chào Chị Thảo! Acid béo GLA trong Hoa Anh Thảo là chìa khóa vàng cho chị em phụ nữ sau sinh và tiền mãn kinh. Chị Thảo tiếp tục duy trì 2 viên mỗi ngày sau ăn nhé!',
    pharmacistName: 'DS. CKI Nguyễn Thu Trang',
    replyDate: '2026-10-11',
    status: 'approved',
    likes: 42
  },
  {
    id: 'rev-05',
    productId: 'us-02', // Milk Thistle Silymarin Now Foods
    productName: 'Viên Uống Bổ Gan Milk Thistle Silymarin 1000mg Now Foods USA',
    customerName: 'Anh Vũ Hoàng Long',
    customerPhone: '0934***789',
    rating: 5,
    createdAt: '2026-10-08',
    audience: 'men',
    audienceLabel: 'Nam giới (42 tuổi)',
    isVerifiedPurchase: true,
    title: 'Hạ men gan ALT từ 78 xuống 35, hết mẩn ngứa',
    content: 'Tôi làm kinh doanh tuần phải tiếp khách bia rượu 3-4 lần, người ngứa ngáy và men gan tăng cao. Uống Now Silymarin 1000mg này ngày 1 viên trước khi đi tiệc, đi khám lại chỉ số men gan đã về ngưỡng an toàn. Hàng Mỹ chuẩn có tem chống giả Bộ Công An quét QR ra ngay.',
    photos: [
      'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'
    ],
    pharmacistReply: 'Chào Anh Long! Chiết xuất Milk Thistle nồng độ Silymarin cao bảo vệ màng tế bào gan rất tốt. Dù có sản phẩm bảo vệ nhưng anh cố gắng uống nhiều nước ấm và hạn chế uống rượu quá khuya anh nhé!',
    pharmacistName: 'DS. Trần Quốc Tuấn',
    replyDate: '2026-10-09',
    status: 'approved',
    likes: 29
  },
  {
    id: 'rev-06',
    productId: 'de-01', // Doppelherz Kinder Thymo
    productName: 'Doppelherz Aktiv Kinder Thymo Tăng Đề Kháng Miễn Dịch Cho Bé',
    customerName: 'Mẹ Bỉm Hoàng Bích Ngọc',
    customerPhone: '0966***345',
    rating: 5,
    createdAt: '2026-10-05',
    audience: 'kids',
    audienceLabel: 'Mẹ có con 4 tuổi',
    isVerifiedPurchase: true,
    title: 'Bé trộm vía không còn ốm vặt khi đi nhà trẻ',
    content: 'Bé nhà mình 4 tuổi đi mẫu giáo cứ dăm bữa nửa tháng lại sổ mũi viêm phế quản. Dùng siro Thymo Doppelherz của Đức này được 2 chai thấy bé khỏe hẳn, đợt lạnh vừa rồi các bạn lớp nghỉ nhiều mà bé vẫn đi học đều. Vị dâu ngọt dịu bé rất thích uống.',
    photos: [
      'https://images.unsplash.com/photo-1576073719676-aa95576db207?w=600&auto=format&fit=crop&q=80'
    ],
    pharmacistReply: 'Chào Mẹ Bích Ngọc! Thymomodulin chuẩn Đức kết hợp Kẽm sinh học giúp tăng sinh tế bào T-lymphocyte tự nhiên cho bé. Mẹ nhớ cho bé uống đều mỗi sáng 5ml mẹ nhé!',
    pharmacistName: 'DS. CKI Nguyễn Thu Trang',
    replyDate: '2026-10-06',
    status: 'approved',
    likes: 38
  }
];
