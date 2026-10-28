/**
 * CƠ SỞ DỮ LIỆU CÁC CHÍNH SÁCH HOẠT ĐỘNG & BẢO VỆ NGƯỜI TIÊU DÙNG MEDXPRESSCARE
 * Tuân thủ đầy đủ Luật Dược 2016, Nghị định 52/2013/NĐ-CP & Nghị định 85/2021/NĐ-CP (TMĐT),
 * Nghị định 13/2023/NĐ-CP (Bảo vệ dữ liệu cá nhân) và Quy chuẩn GSP bảo quản dược phẩm.
 */

export const POLICIES = [
  {
    id: 'chinh-sach-giao-hang',
    slug: 'chinh-sach-giao-hang',
    legacyAliases: ['rules', 'shipping', 'giao-hang'],
    title: 'Chính Sách Vận Chuyển & Giao Hàng Chuẩn GSP',
    shortDesc: 'Giao hỏa tốc 1h-2h nội thành Hà Nội, giao nhanh toàn quốc với quy trình kiểm soát nhiệt độ chuẩn GSP.',
    icon: 'Truck',
    badge: 'Chuẩn GSP Bộ Y Tế',
    lastUpdated: '15/10/2026',
    sections: [
      {
        heading: '1. Phạm Vi Áp Dụng & Hình Thức Giao Hàng',
        content: `MedXpressCare áp dụng dịch vụ giao nhận dược phẩm và thực phẩm bảo vệ sức khỏe trên phạm vi toàn quốc với 2 hình thức chính:
- **Giao hỏa tốc nội thành Hà Nội (1 - 2 giờ):** Áp dụng cho các quận Ba Đình, Cầu Giấy, Đống Đa, Hoàn Kiếm, Hai Bà Trưng, Thanh Xuân, Tây Hồ, Nam Từ Liêm, Bắc Từ Liêm, Hà Đông, Hoàng Mai, Long Biên. Đơn vị vận chuyển chuyên nghiệp MedXpress Express vận chuyển sản phẩm trực tiếp từ Tổng kho Cầu Giấy tới tay khách hàng.
- **Giao hàng nhanh toàn quốc (1 - 3 ngày làm việc):** Phối hợp cùng các đối tác bưu chính uy tín hàng đầu: Giao Hàng Tiết Kiệm (GHTK), Giao Hàng Nhanh (GHN), Viettel Post và VNPost. Hàng hóa được đóng thùng niêm phong và gửi trực tiếp từ trung tâm phân phối Hà Nội.`
      },
      {
        heading: '2. Tiêu Chuẩn Bảo Quản Vận Chuyển GSP (Good Storage Practice)',
        content: `Dược phẩm và thực phẩm chức năng đòi hỏi điều kiện bảo quản nghiêm ngặt nhằm bảo toàn 100% hoạt tính sinh học của vi chất:
- **Nhiệt độ bảo quản khi vận chuyển:** Đảm bảo duy trì dưới 30°C đối với thực phẩm chức năng thông thường và từ 2°C - 8°C đối với các dòng men vi sinh hoặc chế phẩm sinh học đặc biệt (sử dụng túi gel giữ nhiệt chuyên dụng).
- **Quy cách đóng gói chống va đập:** 100% đơn hàng được bọc màng xốp khí chống sốc 3 lớp, cố định vị trí hộp thuốc, đựng trong hộp carton cứng cáp và dán tem niêm phong vỡ MedXpressCare.
- **Chống ẩm và ánh sáng:** Hạn chế tối đa sự tiếp xúc trực tiếp của ánh nắng mặt trời và độ ẩm cao trong suốt lộ trình vận chuyển.`
      },
      {
        heading: '3. Biểu Phí Vận Chuyển & Chính Sách Miễn Phí (Freeship)',
        content: `MedXpressCare hỗ trợ tối đa chi phí vận chuyển cho người bệnh và gia đình:
- **Miễn phí vận chuyển toàn quốc (Freeship):** Áp dụng cho tất cả các đơn hàng có giá trị thanh toán từ **500.000₫** trở lên hoặc các đơn hàng áp dụng thành công mã voucher \`FREESHIP\`.
- **Đơn hàng tiêu chuẩn dưới 500.000₫:**
  + Nội thành Hà Nội: Phí đồng giá 25.000₫ / đơn.
  + Ngoại thành và các tỉnh thành khác: Phí đồng giá 30.000₫ - 35.000₫ / đơn tùy thuộc khoảng cách địa lý.
- **Đơn giao hỏa tốc 1h - 2h:** Cước phí được tính toán tự động theo khoảng cách thực tế từ kho Cầu Giấy qua các dịch vụ đối tác (GrabExpress/Ahamove/GooShip), Dược sĩ sẽ thông báo rõ ràng trước khi xuất kho.`
      },
      {
        heading: '4. Thời Gian Xử Lý & Giao Nhận Hàng',
        content: `- **Xác nhận đơn hàng & liều dùng:** Dược sĩ chuyên môn liên hệ xác nhận tiền sử dị ứng, tình trạng thể chất và hướng dẫn liều lượng bổ sung vi chất trong vòng 15 - 30 phút sau khi quý khách đặt hàng trực tuyến (8h00 - 21h30 hàng ngày).
- **Thời gian giao dự kiến:**
  + Hà Nội hỏa tốc: 1 - 2 giờ sau khi Dược sĩ duyệt đơn.
  + Các tỉnh miền Bắc: 1 - 2 ngày làm việc.
  + Các tỉnh miền Trung và miền Nam: 2 - 3 ngày làm việc.
- *Lưu ý:* Trong trường hợp thiên tai, bão lũ hoặc dịp lễ tết, thời gian giao hàng có thể kéo dài hơn từ 12 - 24 giờ, tổng đài MedXpressCare sẽ chủ động gửi tin nhắn SMS/Zalo thông báo lộ trình cụ thể.`
      }
    ],
    faqs: [
      {
        q: 'Tôi có được xem hàng trước khi thanh toán không?',
        a: 'Hoàn toàn CÓ. MedXpressCare áp dụng 100% chính sách ĐỒNG KIỂM. Quý khách được quyền mở hộp kiểm tra số lượng, tem chống giả, tem phụ tiếng Việt và hạn sử dụng trước khi trả tiền cho bưu tá.'
      },
      {
        q: 'Nếu sản phẩm bị móp méo hộp do vận chuyển thì xử lý thế nào?',
        a: 'Quý khách vui lòng từ chối nhận hàng và gọi ngay hotline 1800 6868. Chúng tôi sẽ điều phối gửi kiện hàng mới thay thế ngay lập tức hoàn toàn miễn phí.'
      }
    ]
  },
  {
    id: 'chinh-sach-doi-tra',
    slug: 'chinh-sach-doi-tra',
    legacyAliases: ['return', 'doi-tra', 'hoan-tien'],
    title: 'Chính Sách Đổi Trả 30 Ngày & Bồi Hoàn 300%',
    shortDesc: 'Cam kết bồi hoàn 300% nếu phát hiện hàng giả; hỗ trợ đổi trả miễn phí trong 30 ngày.',
    icon: 'RotateCcw',
    badge: 'Cam kết bồi hoàn 300%',
    lastUpdated: '18/10/2026',
    sections: [
      {
        heading: '1. Cam Kết Chất Lượng Vàng & Chính Sách Bồi Hoàn 300%',
        content: `MedXpressCare đặt sinh mệnh và sức khỏe của người tiêu dùng lên hàng đầu:
- **Cam kết 100% chính hãng:** Toàn bộ sản phẩm phân phối đều có hồ sơ công bố hợp pháp tại Cục An Toàn Thực Phẩm - Bộ Y Tế, có đầy đủ hóa đơn chứng từ VAT và tem chống hàng giả.
- **Bồi hoàn 300% giá trị đơn hàng:** Nếu quý khách phát hiện bất kỳ sản phẩm nào mua tại MedXpressCare là hàng giả, hàng nhái kém chất lượng hoặc hàng xách tay không rõ nguồn gốc, MedXpressCare cam kết:
  1. Hoàn trả 100% số tiền đơn hàng đã mua.
  2. Bồi thường thêm 200% giá trị đơn hàng bằng tiền mặt.
  3. Chịu hoàn toàn trách nhiệm pháp lý trước cơ quan quản lý nhà nước.`
      },
      {
        heading: '2. Thời Hạn & Điều Kiện Đổi Trả Miễn Phí (Trong Vòng 30 Ngày)',
        content: `Quý khách được đổi trả sản phẩm hoàn toàn miễn phí trong vòng **30 ngày** kể từ ngày nhận hàng thành công trong các trường hợp sau:
- Sản phẩm bị lỗi do nhà sản xuất (viên ẩm, biến màu, nứt vỡ vỉ thuốc, rách bao bì bên trong).
- Sản phẩm bị đổ vỡ, móp méo nghiêm trọng do quá trình vận chuyển.
- Giao nhầm mã sản phẩm, sai hàm lượng hoặc sai số lượng so với đơn đặt hàng.
- Sản phẩm có hạn sử dụng (HSD) còn lại dưới 6 tháng tại thời điểm giao hàng (trừ trường hợp sản phẩm xả kho thanh lý đã được thông báo rõ trước khi đặt).
- **Yêu cầu đối với sản phẩm đổi trả:** Sản phẩm còn nguyên tem niêm phong nắp lọ (chưa bị cạy mở), bao bì ngoài và quà tặng kèm theo (nếu có).`
      },
      {
        heading: '3. Các Trường Hợp Không Áp Dụng Đổi Trả',
        content: `- Sản phẩm đã bị bóc seal nắp lọ, viên thuốc đã lấy ra sử dụng (trừ trường hợp đổi trả do phát hiện viên thuốc bên trong bị lỗi do sản xuất).
- Sản phẩm bị hư hỏng do khách hàng bảo quản sai hướng dẫn (để nơi ẩm ướt, nhiệt độ >30°C hoặc dưới ánh sáng mặt trời gay gắt).
- Các sản phẩm thuộc danh mục hàng bảo quản lạnh đặc biệt (men vi sinh sống) sau khi đã giao thành công quá 48 giờ.
- Sản phẩm không chứng minh được nguồn gốc đã mua từ MedXpressCare (không có mã đơn hàng hợp lệ trên hệ thống).`
      },
      {
        heading: '4. Quy Trình Thu Hồi & Hoàn Tiền Chuẩn GSP',
        content: `- **Bước 1 (Gửi yêu cầu):** Quý khách liên hệ hotline **1800 6868** (miễn phí) hoặc nhắn tin qua Dược Sĩ AI trên web/Zalo Official kèm ảnh/video chụp sản phẩm.
- **Bước 2 (Kiểm duyệt chuyên môn):** Dược sĩ phụ trách chuyên môn xem xét và phê duyệt trong vòng 2 giờ làm việc.
- **Bước 3 (Thu hồi tận nhà):** Bưu tá MedXpressCare sẽ đến tận địa chỉ của quý khách để nhận lại sản phẩm hoàn, quý khách không cần phải mang ra bưu cục.
- **Bước 4 (Hoàn tiền hoặc đổi mới):** Ngay khi kiện hàng được Dược sĩ kho GSP kiểm nhận, MedXpressCare tiến hành gửi sản phẩm mới thay thế hoặc chuyển khoản hoàn tiền 100% qua VietQR/Ngân hàng trong vòng **24 giờ làm việc**.`
      }
    ],
    faqs: [
      {
        q: 'Tôi có phải trả phí vận chuyển khi gửi đổi trả không?',
        a: 'KHÔNG. 100% chi phí bưu tá đến thu hồi hàng đổi trả do MedXpressCare chi trả.'
      },
      {
        q: 'Tôi mua hộ cho bố mẹ uống nhưng bác sĩ chỉ định ngừng thuốc, có được trả lại không?',
        a: 'Nếu sản phẩm còn nguyên tem seal nắp hộp và trong vòng 30 ngày, MedXpressCare hỗ trợ quý khách đổi sang dòng sản phẩm bổ trợ khác phù hợp với thể trạng của bố mẹ.'
      }
    ]
  },
  {
    id: 'chinh-sach-kiem-hang',
    slug: 'chinh-sach-kiem-hang',
    legacyAliases: ['kiem-hang', 'dong-kiem', 'inspection'],
    title: 'Chính Sách Đồng Kiểm & Kiểm Hàng Khi Nhận',
    shortDesc: 'Khách hàng có quyền mở kiện hàng đồng kiểm tra tem phụ Bộ Y Tế, tem chống giả trước khi thanh toán.',
    icon: 'ShieldCheck',
    badge: 'Đồng Kiểm 100%',
    lastUpdated: '20/10/2026',
    sections: [
      {
        heading: '1. Quyền Lợi Đồng Kiểm Toàn Diện',
        content: `Nhằm đảm bảo sự an tâm tuyệt đối của khách hàng khi mua thực phẩm chức năng qua mạng, MedXpressCare áp dụng chính sách **ĐỒNG KIỂM 100%** cùng nhân viên giao vận tại thời điểm nhận hàng:
- Khách hàng được quyền mở thùng carton bên ngoài để kiểm tra số lượng và tính nguyên vẹn của từng hộp sản phẩm.
- Được kiểm tra tem chống hàng giả, tem cào mã SMS Bộ Công An hoặc mã QR xác thực của nhà phân phối chính thức.
- Được kiểm tra hạn sử dụng (Date) in rõ trên đáy hộp và vỏ lọ.`
      },
      {
        heading: '2. Giới Hạn Của Việc Kiểm Tra Hàng',
        content: `Để bảo đảm tính vô trùng và an toàn dược phẩm cho các trường hợp hoàn trả tái nhập kho:
- Quý khách **KHÔNG** bóc lớp màng niêm phong (seal) nắp lọ thuốc hoặc xé vỉ viên uống khi chưa đồng ý thanh toán.
- Không thử nếm hoặc bẻ viên sản phẩm tại chỗ.
- Nếu bưu tá đối tác bưu cục (GHTK, GHN, Viettel Post) từ chối cho quý khách kiểm tra hàng, vui lòng gọi ngay hotline **1800 6868** tại thời điểm đó để nhân viên tổng đài MedXpressCare can thiệp yêu cầu bưu tá thực hiện đúng quy chế.`
      },
      {
        heading: '3. Quy Trình Xử Lý Khi Hàng Hóa Không Đúng Thỏa Thuận',
        content: `- Nếu kiện hàng bị thiếu sản phẩm, sai mẫu hoặc có dấu hiệu móp méo biến dạng, quý khách có quyền **từ chối nhận hàng ngay tại chỗ**.
- Bưu tá sẽ lập biên bản đồng kiểm ghi nhận tình trạng hàng và hoàn trả về kho MedXpressCare.
- Quý khách không phải thanh toán bất kỳ chi phí nào (kể cả cước vận chuyển). Dược sĩ MedXpressCare sẽ liên hệ để đóng gói kiện hàng mới đạt chuẩn gửi hỏa tốc bổ sung cho quý khách.`
      }
    ],
    faqs: [
      {
        q: 'Tôi nhờ người nhà nhận hộ thì có được đồng kiểm không?',
        a: 'Có. Người nhận hộ có đầy đủ quyền lợi đồng kiểm tra như người đặt hàng. Quý khách vui lòng dặn dò người nhà mở hộp kiểm tra đúng số lượng trước khi ký nhận.'
      }
    ]
  },
  {
    id: 'chinh-sach-bao-mat',
    slug: 'chinh-sach-bao-mat',
    legacyAliases: ['privacy', 'bao-mat', 'du-lieu'],
    title: 'Chính Sách Bảo Mật Thông Tin & Dữ Liệu Y Tế',
    shortDesc: 'Tuân thủ Nghị định 13/2023/NĐ-CP, cam kết bảo vệ tuyệt đối hồ sơ sức khỏe và thông tin cá nhân khách hàng.',
    icon: 'Lock',
    badge: 'Nghị định 13/2023/NĐ-CP',
    lastUpdated: '12/10/2026',
    sections: [
      {
        heading: '1. Cam Kết Bảo Vệ Quyền Riêng Tư & Dữ Liệu Sức Khỏe',
        content: `MedXpressCare nhận thức sâu sắc rằng dữ liệu y tế, tiền sử bệnh và hồ sơ sử dụng thuốc là thông tin nhạy cảm và thiêng liêng nhất của mỗi cá nhân:
- Chúng tôi cam kết tuân thủ nghiêm ngặt **Nghị định số 13/2023/NĐ-CP** của Chính phủ về Bảo vệ dữ liệu cá nhân.
- Không bao giờ bán, chia sẻ hoặc tiết lộ thông tin bệnh lý của khách hàng cho bất kỳ công ty bảo hiểm, đơn vị quảng cáo hay bên thứ ba nào vì mục đích thương mại.`
      },
      {
        heading: '2. Mục Đích & Phạm Vi Thu Thập Dữ Liệu',
        content: `MedXpressCare chỉ thu thập các thông tin thực sự cần thiết nhằm phục vụ hoạt động chăm sóc sức khỏe:
- **Thông tin giao hàng:** Họ tên, số điện thoại, địa chỉ nhận hàng để nhân viên giao vận liên hệ.
- **Dữ liệu tư vấn dược lý:** Tiền sử dị ứng thuốc, triệu chứng bệnh lý, độ tuổi, đang mang thai/cho con bú do khách hàng tự nguyện cung cấp cho Dược sĩ để tính toán tương tác thuốc an toàn.
- **Lịch sử tích điểm & chăm sóc:** Lưu trữ số điểm thưởng thành viên (100k = 1 điểm) và lịch nhắc tái bổ sung liệu trình (như bổ sung Canxi, Glucosamine định kỳ).`
      },
      {
        heading: '3. Biện Pháp Kỹ Thuật Bảo Mật Thông Tin',
        content: `- **Mã hóa đường truyền:** 100% dữ liệu trao đổi giữa trình duyệt của khách hàng và máy chủ MedXpressCare được mã hóa qua giao thức SSL/TLS (HTTPS 256-bit).
- **Phân quyền truy cập nội bộ:** Chỉ các Dược sĩ có chứng chỉ hành nghề và nhân viên phụ trách đơn hàng được cấp quyền tra cứu thông tin theo nguyên tắc bảo mật y đức.
- **Ẩn thông tin nhạy cảm (PII Masking):** Trên các trang tra cứu công khai hoặc nhãn vận đơn dán ngoài gói hàng, số điện thoại khách hàng luôn được che các số giữa (ví dụ: 098****456) nhằm phòng ngừa lộ lọt thông tin khi shipper vận chuyển.`
      },
      {
        heading: '4. Quyền Của Khách Hàng Đối Với Dữ Liệu Cá Nhân',
        content: `Khách hàng có toàn quyền kiểm soát dữ liệu cá nhân của mình:
- **Quyền tra cứu & chỉnh sửa:** Đăng nhập vào mục Tài Khoản Cá Nhân trên website để cập nhật thông tin.
- **Quyền yêu cầu xóa bỏ (Right to be forgotten):** Quý khách có thể gửi yêu cầu qua email \`privacy@medxpresscare.com\` hoặc hotline **1800 6868** để yêu cầu xóa toàn bộ lịch sử tư vấn và tài khoản vĩnh viễn khỏi hệ thống.`
      }
    ],
    faqs: [
      {
        q: 'Đoạn chat tư vấn của tôi với Dược Sĩ AI có được bảo mật không?',
        a: 'Toàn bộ nội dung hội thoại tư vấn được mã hóa bảo mật đầu cuối, phục vụ trực tiếp cho việc đưa ra lời khuyên liều dùng và không bao giờ bị sử dụng ngoài mục đích y khoa.'
      }
    ]
  },
  {
    id: 'chinh-sach-thanh-toan',
    slug: 'chinh-sach-thanh-toan',
    legacyAliases: ['payment', 'thanh-toan', 'vietqr'],
    title: 'Chính Sách & Hướng Dẫn Phương Thức Thanh Toán',
    shortDesc: 'Thanh toán COD tiền mặt linh hoạt, chuyển khoản VietQR chuẩn xác tự động qua hệ thống MB Bank.',
    icon: 'CreditCard',
    badge: 'VietQR • COD An Toàn',
    lastUpdated: '22/10/2026',
    sections: [
      {
        heading: '1. Các Phương Thức Thanh Toán Được Hỗ Trợ',
        content: `Để tạo sự thuận tiện nhất cho khách hàng trên toàn quốc, MedXpressCare hỗ trợ đa dạng phương thức thanh toán an toàn:
1. **Thanh toán tiền mặt khi nhận hàng (COD - Cash On Delivery):**
   - Quý khách thanh toán trực tiếp cho nhân viên giao hàng sau khi đã mở kiện kiểm tra hàng đạt chuẩn.
   - Không phát sinh phụ phí thu hộ COD.
2. **Chuyển khoản ngân hàng qua mã VietQR (Tự động xác nhận 24/7):**
   - Quét mã QR trực tiếp trên màn hình đặt hàng hoặc qua ứng dụng của hơn 40 ngân hàng tại Việt Nam.
   - Số tiền và nội dung chuyển khoản được điền sẵn chuẩn xác theo mã đơn hàng, không lo nhầm lẫn.
   - Thông tin tài khoản tiếp nhận chính thức:
     + **Ngân hàng:** MB Bank (Ngân hàng TMCP Quân Đội)
     + **Số tài khoản:** \`0968686868\`
     + **Chủ tài khoản:** \`MEDXPRESS CARE VIET NAM\`
3. **Thanh toán thẻ quốc tế / Ví điện tử:** Sắp ra mắt tích hợp cổng thanh toán trực tiếp.`
      },
      {
        heading: '2. Bảo Vệ Giao Dịch & Xử Lý Sự Cố Thanh Toán',
        content: `- **Tự động đối soát đơn:** Khi chuyển khoản VietQR thành công, hệ thống webhook của MedXpressCare sẽ tự động đổi trạng thái đơn sang "Đã thanh toán" trong vòng 30 giây.
- **Trường hợp chuyển khoản sai nội dung hoặc sai số tiền:**
  + Quý khách chỉ cần gửi ảnh chụp biên lai giao dịch qua Zalo Hotline **1800 6868**.
  + Bộ phận Kế toán Dược sẽ đối soát và xác nhận đơn hàng thủ công trong vòng 10 phút.
- **Hoàn trả tiền thừa:** Trường hợp quý khách vô tình chuyển khoản 2 lần hoặc hủy đơn trước khi giao, số tiền sẽ được hoàn trả đầy đủ vào số tài khoản của quý khách trong vòng 2 - 4 giờ làm việc.`
      }
    ],
    faqs: [
      {
        q: 'Tôi thanh toán qua VietQR có xuất được hóa đơn điện tử VAT không?',
        a: 'CÓ. 100% đơn hàng tại MedXpressCare đều có hóa đơn VAT điện tử hợp pháp từ Bộ Tài Chính. Quý khách vui lòng cung cấp thông tin xuất hóa đơn công ty (Mã số thuế, tên công ty, địa chỉ) tại bước ghi chú đặt hàng.'
      }
    ]
  },
  {
    id: 'dieu-khoan-su-dung',
    slug: 'dieu-khoan-su-dung',
    legacyAliases: ['terms', 'dieu-khoan', 'quy-che'],
    title: 'Điều Khoản Dịch Vụ & Quy Chế Hoạt Động',
    shortDesc: 'Quy chế giao dịch thương mại điện tử, quyền và trách nhiệm của khách hàng và tuyên bố miễn trừ y khoa.',
    icon: 'FileText',
    badge: 'Quy Chế Bộ Công Thương',
    lastUpdated: '10/10/2026',
    sections: [
      {
        heading: '1. Quy Chế Hoạt Động & Cơ Sở Pháp Lý',
        content: `Website MedXpressCare.com là kênh giao dịch điện tử và tư vấn dược phẩm chính thức của:
- **Tên doanh nghiệp:** CÔNG TY CỔ PHẦN DƯỢC PHẨM MEDXPRESSCARE VIỆT NAM.
- **Giấy chứng nhận ĐKKD số:** 0108923412 do Sở Kế hoạch & Đầu tư TP. Hà Nội cấp.
- **Chứng chỉ đủ điều kiện kinh doanh Dược:** Số 452/ĐKKDD-BYT do Bộ Y Tế cấp.
- **Dược sĩ phụ trách chuyên môn:** DS. CKI Nguyễn Thu Trang.
- Khi truy cập hoặc đặt hàng trên MedXpressCare, quý khách xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ các điều khoản trong bản quy chế này.`
      },
      {
        heading: '2. Tuyên Bố Miễn Trừ Trách Nhiệm Y Khoa Quan Trọng',
        content: `Căn cứ theo quy định của Luật An toàn Thực phẩm, Luật Dược 2016 và Bộ Y Tế Việt Nam:
- ❌ **QUY ĐỊNH VỀ THUỐC KÊ ĐƠN & PHẠM VI HOẠT ĐỘNG:** Website MedXpressCare **HOÀN TOÀN KHÔNG BÁN THUỐC KÊ ĐƠN (Thuốc Rx)** và **KHÔNG CUNG CẤP PHÁC ĐỒ ĐIỀU TRỊ BỆNH THAY THẾ BÁC SĨ**. Danh mục kinh doanh của MedXpressCare chỉ bao gồm: Thực phẩm bảo vệ sức khỏe (TPCN), sản phẩm bổ sung dinh dưỡng (vitamin, khoáng chất, thảo dược bản địa & nhập ngoại) và Dược mỹ phẩm chính hãng.
- ⚠️ **LƯU Ý:** Toàn bộ sản phẩm được phân loại là **Thực phẩm chức năng (Thực phẩm bảo vệ sức khỏe)** trên website KHÔNG PHẢI LÀ THUỐC VÀ KHÔNG CÓ TÁC DỤNG THAY THẾ THUỐC CHỮA BỆNH.
- Tác dụng và hiệu quả của các vi chất dinh dưỡng phụ thuộc vào cơ địa, chế độ ăn uống và mức độ dung nạp của từng người.
- Các nội dung bài viết cẩm nang y khoa hoặc gợi ý của Dược Sĩ AI mang tính chất tham khảo khoa học, không thay thế cho các chẩn đoán cận lâm sàng chuyên sâu (như chụp X-quang, xét nghiệm máu) tại các bệnh viện tuyến trung ương.`
      },
      {
        heading: '3. Quyền & Nghĩa Vụ Của Khách Hàng',
        content: `- **Quyền lợi:** Được cung cấp thông tin trung thực, rõ ràng về nguồn gốc xuất xứ, số ĐKSP Bộ Y Tế cấp phép; được hưởng chính sách bảo hành, đổi trả và bồi hoàn 300% theo đúng cam kết.
- **Nghĩa vụ:** Cung cấp thông tin nhận hàng chính xác; thông báo trung thực về tiền sử dị ứng hoặc bệnh nền cho Dược sĩ để nhận phác đồ an toàn; không lạm dụng thuốc hoặc sử dụng sai hướng dẫn của chuyên gia y tế.`
      },
      {
        heading: '4. Giải Quyết Khiếu Nại & Tranh Chấp',
        content: `- MedXpressCare tôn trọng mọi ý kiến phản ánh của quý khách và cam kết giải quyết khiếu nại trong vòng 24 giờ làm việc qua hotline chuyên trách **1800 6868** hoặc email \`khieunai@medxpresscare.com\`.
- Mọi tranh chấp nếu không thể giải quyết qua thương lượng hòa giải sẽ được đưa ra giải quyết tại Tòa án nhân dân có thẩm quyền tại TP. Hà Nội theo pháp luật hiện hành của nước Cộng hòa Xã hội Chủ nghĩa Việt Nam.`
      }
    ],
    faqs: [
      {
        q: 'Tôi có cần tạo tài khoản để đặt hàng không?',
        a: 'Quý khách có thể đặt hàng nhanh không cần tài khoản. Tuy nhiên, việc đăng ký tài khoản thành viên sẽ giúp quý khách được tích điểm thưởng 100k = 1đ và dễ dàng theo dõi lịch sử liệu trình sức khỏe.'
      }
    ]
  }
];

export const getPolicyBySlug = (slugOrAlias, policiesList = POLICIES) => {
  const list = (Array.isArray(policiesList) && policiesList.length > 0) ? policiesList : POLICIES;
  if (!slugOrAlias) return list[0];
  const clean = slugOrAlias.trim().toLowerCase().replace(/^#/, '');
  const found = list.find(p => 
    p.id === clean || 
    p.slug === clean || 
    (Array.isArray(p.legacyAliases) && p.legacyAliases.includes(clean))
  );
  return found || list[0];
};
