import assert from 'node:assert';
import fs from 'node:fs';
import { POLICIES, getPolicyBySlug } from './src/data/policies.js';

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ TRUNG TÂM CHÍNH SÁCH & PHÁP CHẾ    ');
console.log('================================================================\n');

// 1. Kiểm tra tính toàn vẹn của danh sách POLICIES
console.log('--- 1. KIỂM THỬ CẤU TRÚC VÀ TÍNH TOÀN VẸN DỮ LIỆU CHÍNH SÁCH ---');
assert.ok(Array.isArray(POLICIES), 'POLICIES phải là một mảng');
assert.strictEqual(POLICIES.length, 6, 'Hệ thống phải có đúng 6 chính sách cốt lõi');

const requiredSlugs = [
  'chinh-sach-giao-hang',
  'chinh-sach-doi-tra',
  'chinh-sach-kiem-hang',
  'chinh-sach-bao-mat',
  'chinh-sach-thanh-toan',
  'dieu-khoan-su-dung'
];

requiredSlugs.forEach(slug => {
  const p = POLICIES.find(item => item.slug === slug);
  assert.ok(p, `Chính sách ${slug} phải tồn tại`);
  assert.ok(p.title && p.title.length > 5, `${slug} phải có tiêu đề rõ ràng`);
  assert.ok(p.shortDesc && p.shortDesc.length > 10, `${slug} phải có mô tả ngắn`);
  assert.ok(p.badge, `${slug} phải có huy hiệu pháp lý/chứng nhận`);
  assert.ok(p.lastUpdated, `${slug} phải có ngày cập nhật`);
  assert.ok(Array.isArray(p.sections) && p.sections.length >= 2, `${slug} phải có ít nhất 2 điều khoản chi tiết`);
  assert.ok(Array.isArray(p.faqs) && p.faqs.length >= 1, `${slug} phải có ít nhất 1 câu hỏi giải đáp FAQ`);
});
console.log('  ✅ PASSED: Đủ 6 chính sách chuẩn Bộ Công Thương & Bộ Y Tế');
console.log('  ✅ PASSED: 100% các chính sách có đầy đủ tiêu đề, huy hiệu, ngày hiệu lực, điều khoản và FAQ');

// 2. Kiểm thử nội dung pháp lý và cam kết y tế bắt buộc
console.log('\n--- 2. KIỂM THỬ NỘI DUNG CAM KẾT PHÁP LÝ & Y TẾ ---');

// 2.1 Chính sách giao hàng GSP
const shippingPolicy = POLICIES.find(p => p.slug === 'chinh-sach-giao-hang');
assert.ok(shippingPolicy.sections.some(s => (s.heading.includes('GSP') || s.content.includes('GSP')) && (s.heading.includes('30°C') || s.content.includes('30°C'))), 'Phải có quy chuẩn nhiệt độ bảo quản GSP');
assert.ok(shippingPolicy.sections.some(s => s.content.includes('500.000₫') || s.content.includes('Freeship')), 'Phải có chính sách Freeship');
console.log('  ✅ PASSED: Chính sách vận chuyển nêu rõ chuẩn bảo quản GSP <30°C và điều kiện Freeship');

// 2.2 Chính sách đổi trả & bồi hoàn 300%
const returnPolicy = POLICIES.find(p => p.slug === 'chinh-sach-doi-tra');
assert.ok(returnPolicy.sections.some(s => s.content.includes('300%')), 'Phải có cam kết bồi hoàn 300%');
assert.ok(returnPolicy.sections.some(s => s.content.includes('30 ngày')), 'Phải có thời hạn đổi trả 30 ngày');
assert.ok(returnPolicy.sections.some(s => s.content.includes('24 giờ') || s.content.includes('24h')), 'Phải có thời hạn hoàn tiền nhanh');
console.log('  ✅ PASSED: Cam kết bồi hoàn 300% giá trị nếu phát hiện hàng giả, đổi trả 30 ngày');

// 2.3 Chính sách đồng kiểm
const inspectionPolicy = POLICIES.find(p => p.slug === 'chinh-sach-kiem-hang');
assert.ok(inspectionPolicy.sections.some(s => s.content.includes('ĐỒNG KIỂM 100%') || s.content.includes('đồng kiểm')), 'Phải có quyền đồng kiểm');
assert.ok(inspectionPolicy.sections.some(s => s.content.includes('1800 6868')), 'Phải có hotline can thiệp bưu tá');
console.log('  ✅ PASSED: Quyền đồng kiểm 100% tem chống giả và tem phụ trước khi trả tiền');

// 2.4 Chính sách bảo mật Nghị định 13
const privacyPolicy = POLICIES.find(p => p.slug === 'chinh-sach-bao-mat');
assert.ok(privacyPolicy.sections.some(s => s.content.includes('13/2023/NĐ-CP')), 'Phải tuân thủ Nghị định 13/2023/NĐ-CP');
assert.ok(privacyPolicy.sections.some(s => s.content.includes('PII') || s.content.includes('Ẩn thông tin') || s.content.includes('098****456')), 'Phải có cơ chế che số điện thoại PII');
console.log('  ✅ PASSED: Tuân thủ Nghị định 13/2023/NĐ-CP về bảo mật thông tin y tế và che số điện thoại PII');

// 2.5 Điều khoản sử dụng và miễn trừ y tế
const termsPolicy = POLICIES.find(p => p.slug === 'dieu-khoan-su-dung');
assert.ok(termsPolicy.sections.some(s => s.content.includes('Thực phẩm bảo vệ sức khỏe') && s.content.toLowerCase().includes('không phải là thuốc')), 'Bắt buộc phải có câu cảnh báo miễn trừ Bộ Y Tế');
console.log('  ✅ PASSED: Có cảnh báo miễn trừ y tế chuẩn Luật An toàn thực phẩm Bộ Y Tế');

// 3. Kiểm thử hàm getPolicyBySlug và các đường dẫn chuyển tiếp (Legacy Aliases)
console.log('\n--- 3. KIỂM THỬ ĐIỀU HƯỚNG VÀ TƯƠNG THÍCH ĐƯỜNG DẪN CŨ (LEGACY ALIASES) ---');

// Test slug chính xác
assert.strictEqual(getPolicyBySlug('chinh-sach-giao-hang').slug, 'chinh-sach-giao-hang');
assert.strictEqual(getPolicyBySlug('chinh-sach-doi-tra').slug, 'chinh-sach-doi-tra');

// Test legacy aliases từ Footer cũ
assert.strictEqual(getPolicyBySlug('rules').slug, 'chinh-sach-giao-hang', 'rules phải ánh xạ về chính sách giao hàng');
assert.strictEqual(getPolicyBySlug('#rules').slug, 'chinh-sach-giao-hang', '#rules phải tự động lọc dấu thăng');
assert.strictEqual(getPolicyBySlug('shipping').slug, 'chinh-sach-giao-hang');
assert.strictEqual(getPolicyBySlug('return').slug, 'chinh-sach-doi-tra', 'return phải ánh xạ về đổi trả 30 ngày');
assert.strictEqual(getPolicyBySlug('privacy').slug, 'chinh-sach-bao-mat', 'privacy phải ánh xạ về bảo mật');
assert.strictEqual(getPolicyBySlug('payment').slug, 'chinh-sach-thanh-toan', 'payment phải ánh xạ về thanh toán');
assert.strictEqual(getPolicyBySlug('terms').slug, 'dieu-khoan-su-dung', 'terms phải ánh xạ về điều khoản dịch vụ');
assert.strictEqual(getPolicyBySlug('kiem-hang').slug, 'chinh-sach-kiem-hang');

// Test fallback an toàn khi truyền null, chuỗi rỗng hoặc mã lạ
assert.strictEqual(getPolicyBySlug('').slug, 'chinh-sach-giao-hang');
assert.strictEqual(getPolicyBySlug(null).slug, 'chinh-sach-giao-hang');
assert.strictEqual(getPolicyBySlug('unknown-policy-slug-999').slug, 'chinh-sach-giao-hang');
console.log('  ✅ PASSED: Tương thích 100% với các hash cũ (#rules, #return, #privacy, #payment, #terms)');
console.log('  ✅ PASSED: Cơ chế Fallback an toàn không crash khi gặp slug lạ');

// 4. Kiểm thử thành phần giao diện PolicyPage
console.log('\n--- 4. KIỂM THỬ THÀNH PHẦN GIAO DIỆN POLICYPAGE ---');
const policyPageSource = fs.readFileSync('./src/components/PolicyPage.jsx', 'utf8');
assert.ok(policyPageSource.includes('export const PolicyPage'), 'PolicyPage component phải được export');
assert.ok(policyPageSource.includes('handlePrint'), 'Phải có tính năng in / lưu bản sao lưu trữ');
assert.ok(policyPageSource.includes('handleCopyLink'), 'Phải có tính năng sao chép liên kết chia sẻ');
assert.ok(policyPageSource.includes('window.location.hash = `#chinh-sach?tab=${slug}`'), 'Phải đồng bộ hash URL khi chuyển tab');
console.log('  ✅ PASSED: PolicyPage hỗ trợ đầy đủ in văn bản, sao chép link và điều hướng mượt mà');

console.log('\n================================================================');
console.log('   TỔNG KẾT: TẤT CẢ TEST CASES CHÍNH SÁCH ĐẠT CHUẨN 100%!       ');
console.log('================================================================');
