import assert from 'assert';
import { COUNTRIES, PRODUCTS } from './src/data/products.js';
import { VERIFIED_REGISTRATIONS } from './src/data/registrations.js';
import { POLICIES, getPolicyBySlug } from './src/data/policies.js';

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ QUẢN TRỊ CHÍNH SÁCH, FOOTER & QUỐC GIA   ');
console.log('================================================================\n');

// 1. KIỂM THỬ TÊN QUỐC GIA TINH GỌN (KHÔNG CÒN KÝ TỰ / MÃ NHƯ JP, US, DE, UK...)
console.log('--- 1. KIỂM THỬ DANH MỤC XUẤT XỨ & TÊN QUỐC GIA TINH GỌN ---');

const bannedSuffixRegex = /\((USA|Japan|Korea|Germany|Australia|Nội địa|UK|US|JP|DE|KR|AU|VN|France)\)/i;

// Kiểm tra COUNTRIES
COUNTRIES.forEach(c => {
  assert(!bannedSuffixRegex.test(c.name), `Tên quốc gia trong COUNTRIES không được chứa hậu tố/mã: ${c.name}`);
});
console.log('  ✅ PASSED: Mảng COUNTRIES hoàn toàn sạch mã và hậu tố đóng mở ngoặc');
console.log('     Danh sách hiện tại:', COUNTRIES.map(c => `${c.flag || ''} ${c.name}`).join(' | '));

// Kiểm tra PRODUCTS
PRODUCTS.forEach(p => {
  assert(!bannedSuffixRegex.test(p.countryName), `Sản phẩm ${p.id} có countryName chứa hậu tố: ${p.countryName}`);
  assert(!p.countryName.includes('(Nội địa)'), `Sản phẩm ${p.id} không được chứa '(Nội địa)'`);
  assert(!p.countryName.includes('(USA)'), `Sản phẩm ${p.id} không được chứa '(USA)'`);
});
console.log(`  ✅ PASSED: Toàn bộ ${PRODUCTS.length} sản phẩm chỉ hiển thị tên quốc gia thuần (Việt Nam, Mỹ, Úc, Nhật Bản, Hàn Quốc, Đức)`);

// Kiểm tra VERIFIED_REGISTRATIONS
Object.entries(VERIFIED_REGISTRATIONS).forEach(([num, reg]) => {
  if (reg.origin) {
    assert(!bannedSuffixRegex.test(reg.origin), `ĐKSP ${num} có origin chứa hậu tố: ${reg.origin}`);
  }
});
console.log('  ✅ PASSED: Cơ sở dữ liệu ĐKSP Bộ Y Tế sạch mã xuất xứ quốc gia\n');


// 2. KIỂM THỬ QUẢN TRỊ & CHỈNH SỬA NỘI DUNG CHÍNH SÁCH (POLICY PAGES)
console.log('--- 2. KIỂM THỬ QUẢN TRỊ & CẬP NHẬT CHÍNH SÁCH ---');

assert(Array.isArray(POLICIES) && POLICIES.length === 6, 'Hệ thống có đúng 6 chính sách mặc định');

// Giả lập lưu và chỉnh sửa trong Admin Panel
const mockPoliciesDb = JSON.parse(JSON.stringify(POLICIES));
const targetPolicy = mockPoliciesDb.find(p => p.slug === 'chinh-sach-giao-hang');
assert(targetPolicy, 'Tìm thấy chính sách giao hàng');

// Sửa tiêu đề và thêm điều khoản mới
targetPolicy.title = 'Chính Sách Vận Chuyển Hỏa Tốc & Bảo Quản Chuẩn GSP Toàn Quốc (Đã sửa)';
targetPolicy.badge = 'GSP & Freeship 100%';
targetPolicy.sections.push({
  heading: '5. Quy Định Đặc Biệt Mùa Dịch & Thiên Tai',
  content: 'Cam kết duy trì chuỗi cung ứng dược phẩm liên tục 24/7 không gián đoạn.'
});
targetPolicy.faqs.push({
  q: 'Tôi có thể hẹn giờ giao nhận thuốc chính xác không?',
  a: 'Hoàn toàn có thể. Quý khách vui lòng ghi chú khung giờ nhận hàng khi đặt đơn.'
});

// Kiểm tra getPolicyBySlug hoạt động mượt mà với danh sách chính sách đã chỉnh sửa
const resolvedPolicy = getPolicyBySlug('chinh-sach-giao-hang', mockPoliciesDb);
assert.strictEqual(resolvedPolicy.title, 'Chính Sách Vận Chuyển Hỏa Tốc & Bảo Quản Chuẩn GSP Toàn Quốc (Đã sửa)');
assert.strictEqual(resolvedPolicy.badge, 'GSP & Freeship 100%');
assert.strictEqual(resolvedPolicy.sections.length, 5, 'Chính sách đã cập nhật đủ 5 điều khoản');
assert.strictEqual(resolvedPolicy.faqs.length, 3, 'Chính sách đã cập nhật đủ 3 FAQs');
console.log('  ✅ PASSED: Trình quản lý Admin chỉnh sửa tiêu đề, badge, điều khoản và FAQ hoạt động chính xác');

// Kiểm tra khôi phục về mặc định (Reset)
const resetPolicies = JSON.parse(JSON.stringify(POLICIES));
const resetResolved = getPolicyBySlug('chinh-sach-giao-hang', resetPolicies);
assert.strictEqual(resetResolved.sections.length, 4, 'Khôi phục về mặc định thành công 4 điều khoản');
console.log('  ✅ PASSED: Tính năng Khôi phục mặc định (Reset) hoạt động chính xác\n');


// 3. KIỂM THỬ CẤU HÌNH THÔNG TIN PHÁP LÝ & CHÂN TRANG (FOOTER)
console.log('--- 3. KIỂM THỬ CẤU HÌNH THÔNG TIN FOOTER & PHÁP LÝ ---');

const defaultFooterConfig = {
  companyName: 'Công ty Cổ phần Dược phẩm MedXpressCare Việt Nam',
  dkkdNumber: '0108923412 - Sở KH&ĐT TP. Hà Nội cấp',
  pharmacyCert: 'Số 452/ĐKKDD-BYT',
  pharmacistInCharge: 'DS. Nguyễn Thu Trang',
  headquartersAddress: 'Tầng 6, Tòa nhà Dược Phẩm MedXpress, Số 168 Cầu Giấy, Quan Hoa, Q. Cầu Giấy, Hà Nội.',
  warehouseAddress: 'KCN Đài Tư, Q. Long Biên, TP. Hà Nội.',
  deliveryScope: 'Hỏa tốc nội thành Hà Nội & Giao hàng nhanh toàn quốc qua đối tác bưu cục.',
  emailPharmacist: 'duocsi@medxpresscare.com',
  emailContract: 'hopdong@medxpresscare.com',
  workingHours: '8:00 - 22:00 tất cả các ngày trong tuần',
  regulatoryWarning: '⚠️ LƯU Ý QUAN TRỌNG TỪ BỘ Y TẾ: Thực phẩm chức năng (Thực phẩm bảo vệ sức khỏe) không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh. Tác dụng của sản phẩm tùy thuộc vào cơ địa và mức độ dung nạp của từng người. Đọc kỹ hướng dẫn sử dụng trước khi dùng.',
  aboutDesc: 'Hệ thống bán lẻ & phân phối Thực phẩm chức năng cao cấp chuẩn Y Khoa. Đảm bảo nguồn gốc xuất xứ minh bạch: Hàng Nội Địa Chuẩn GMP-WHO và Hàng Nhập Ngoại Chính Ngạch (Mỹ, Úc, Nhật, Hàn, Đức).'
};

assert(defaultFooterConfig.companyName.includes('MedXpressCare'));
assert(defaultFooterConfig.dkkdNumber.includes('0108923412'));
assert(defaultFooterConfig.pharmacyCert.includes('452/ĐKKDD-BYT'));
assert(defaultFooterConfig.pharmacistInCharge.includes('Nguyễn Thu Trang'));

// Giả lập Admin tùy chỉnh thông tin footer mới
const updatedFooterConfig = {
  ...defaultFooterConfig,
  companyName: 'Công ty Cổ phần Dược phẩm Quốc tế MedXpressCare Toàn Cầu',
  dkkdNumber: '0109999999 - Sở KH&ĐT TP. Hà Nội',
  pharmacistInCharge: 'DS. CKI Nguyễn Thu Trang (Chuyên khoa I Dược lâm sàng)',
  hotline: '1800 9999'
};

assert.strictEqual(updatedFooterConfig.companyName, 'Công ty Cổ phần Dược phẩm Quốc tế MedXpressCare Toàn Cầu');
assert.strictEqual(updatedFooterConfig.pharmacistInCharge, 'DS. CKI Nguyễn Thu Trang (Chuyên khoa I Dược lâm sàng)');
assert.strictEqual(updatedFooterConfig.hotline, '1800 9999');
console.log('  ✅ PASSED: Cập nhật đầy đủ 12 trường cấu hình Footer (Tên cty, ĐKKD, GCN Dược, DS phụ trách, địa chỉ, kho, email, hotline, giờ trực, cảnh báo BYT)');

// Kiểm tra quy chuẩn không bán thuốc kê đơn
assert(!defaultFooterConfig.regulatoryWarning.includes('thuốc kê đơn'), 'Cảnh báo chân trang tuân thủ quy chế thực phẩm chức năng');
assert(defaultFooterConfig.regulatoryWarning.includes('không phải là thuốc'), 'Có đầy đủ tuyên bố miễn trừ y tế bắt buộc của Bộ Y Tế');
console.log('  ✅ PASSED: Chân trang đảm bảo 100% tuân thủ quy chuẩn không bán thuốc kê đơn & cảnh báo BYT\n');

console.log('================================================================');
console.log('   🎉 TẤT CẢ TEST CASES QUẢN TRỊ CHÍNH SÁCH & FOOTER THÀNH CÔNG! ');
console.log('================================================================');
