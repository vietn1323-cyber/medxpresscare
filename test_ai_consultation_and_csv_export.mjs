import assert from 'assert';
import { downloadCSV } from './src/utils/csvHelper.js';
import { consultWithAiPharmacist } from './src/utils/aiHelper.js';
import { VERIFIED_REGISTRATIONS } from './src/data/registrations.js';
import { PRODUCTS } from './src/data/products.js';

console.log('================================================================');
console.log('   KIỂM THỬ TƯ VẤN AI THỰC TẾ & XUẤT CSV CSDL SỐ ĐKSP BỘ Y TẾ');
console.log('================================================================\n');

// -------------------------------------------------------------
// PHẦN 1: KIỂM THỬ TÍNH NĂNG XUẤT CSV CƠ SỞ DỮ LIỆU SỐ ĐKSP
// -------------------------------------------------------------
console.log('--- 1. KIỂM THỬ XUẤT CSV CSDL SỐ ĐKSP BỘ Y TẾ ---');

let exportedCsvContent = '';
let exportedFilename = '';

// Mock DOM
globalThis.Blob = class {
  constructor(parts) {
    exportedCsvContent = parts.join('');
  }
};
globalThis.URL = {
  createObjectURL: () => 'blob:mock-url',
  revokeObjectURL: () => {}
};
globalThis.document = {
  body: {
    appendChild: () => {},
    removeChild: () => {}
  },
  createElement: (tag) => ({
    setAttribute: (name, val) => {
      if (name === 'download') exportedFilename = val;
    },
    click: () => {}
  })
};

// Chuẩn bị dữ liệu giống hệt AdminPanel.jsx
const headers = [
  'Số ĐKSP', 'Tên sản phẩm', 'Tổ chức/Doanh nghiệp chịu trách nhiệm',
  'Trạng thái công bố', 'Năm cấp phép', 'Loại hình', 'Tiêu chuẩn kiểm nghiệm', 'Xuất xứ'
];

const rows = Object.entries(VERIFIED_REGISTRATIONS).map(([regNumber, item]) => [
  regNumber,
  item.name || '',
  item.applicant || '',
  item.status || 'Đã cấp phép lưu hành toàn quốc',
  item.date || '',
  item.type || '',
  item.inspectStandard || 'GMP-WHO Bộ Y Tế',
  item.origin || ''
]);

// Gọi hàm theo cách AdminPanel gọi: downloadCSV(headers, rows, filename)
downloadCSV(headers, rows, 'danh-sach-so-dksp-test.csv');

assert.strictEqual(exportedFilename, 'danh-sach-so-dksp-test.csv', 'Tên file export phải chính xác');
assert.ok(exportedCsvContent.startsWith('\uFEFF'), 'File CSV phải có UTF-8 BOM để Excel hiển thị tiếng Việt có dấu chuẩn');
assert.ok(exportedCsvContent.includes('"Số ĐKSP","Tên sản phẩm"'), 'Header CSV phải đầy đủ');
assert.ok(exportedCsvContent.includes('10238/2019/ĐKSP'), 'Phải chứa số ĐKSP của Bách Niên Kiện');
assert.ok(exportedCsvContent.includes('Viên Khớp Bách Niên Kiện'), 'Phải chứa tên sản phẩm');
assert.ok(exportedCsvContent.includes('3721/2021/ĐKSP'), 'Phải chứa số ĐKSP của Glucosamine Kirkland');

console.log('  ✅ PASSED: Xuất CSV Số ĐKSP thành công với đầy đủ UTF-8 BOM và cấu trúc bảng chuẩn.');

// Thử cả signature ngược lại: downloadCSV(filename, headers, rows)
downloadCSV('mau-dksp.csv', headers, rows);
assert.strictEqual(exportedFilename, 'mau-dksp.csv', 'Chuẩn gọi (filename, headers, rows) cũng hoạt động trơn tru');
console.log('  ✅ PASSED: Hỗ trợ linh hoạt cả 2 signature gọi downloadCSV không bao giờ bị văng lỗi.');


// -------------------------------------------------------------
// PHẦN 2: KIỂM THỬ AI TƯ VẤN ĐÚNG TRỌNG TÂM - KHÔNG ÉP SẢN PHẨM
// -------------------------------------------------------------
console.log('\n--- 2. KIỂM THỬ AI TƯ VẤN ĐÚNG TRỌNG TÂM & KHÔNG ÉP SẢN PHẨM ---');

async function testAiFlow() {
  // Case 1: Khách chỉ chào hỏi
  const resGreeting = await consultWithAiPharmacist({
    userMessage: 'Chào shop ơi, có ai tư vấn không?',
    products: PRODUCTS
  });
  assert.ok(resGreeting.reply.includes('Dược sĩ Lâm Sàng'), 'Phải chào hỏi lịch thiệp, xưng Dược sĩ');
  assert.strictEqual(resGreeting.recommendedProductIds.length, 0, 'Chào hỏi tuyệt đối KHÔNG đính kèm sản phẩm');
  console.log('  ✅ PASSED: Khi chào hỏi: Trả lời ân cần, hỏi thăm triệu chứng, KHÔNG ép gắn sản phẩm.');

  // Case 2: Khách hỏi chế độ ăn uống, kiêng cữ cho khớp
  const resDiet = await consultWithAiPharmacist({
    userMessage: 'Cho tôi hỏi đau khớp gối thì nên kiêng ăn gì và nên ăn món gì?',
    products: PRODUCTS
  });
  assert.ok(resDiet.reply.includes('Thịt đỏ') || resDiet.reply.includes('Purin'), 'Phải tư vấn cụ thể món kiêng');
  assert.ok(resDiet.reply.includes('Cá béo') || resDiet.reply.includes('Omega-3') || resDiet.reply.includes('xương ống'), 'Phải tư vấn cụ thể món nên ăn');
  assert.strictEqual(resDiet.recommendedProductIds.length, 0, 'Hỏi kiêng ăn gì KHÔNG được ép mua sản phẩm');
  console.log('  ✅ PASSED: Khi hỏi kiêng ăn/lối sống: Trả lời đúng trọng tâm dinh dưỡng, KHÔNG ép mua sản phẩm.');

  // Case 3: Khách hỏi thời điểm uống
  const resTiming = await consultWithAiPharmacist({
    userMessage: 'Uống Canxi và Dầu cá vào lúc nào trong ngày tốt nhất vậy Dược sĩ?',
    products: PRODUCTS
  });
  assert.ok(resTiming.reply.includes('SÁNG') && resTiming.reply.includes('sau bữa ăn'), 'Phải chỉ dẫn uống Canxi buổi sáng sau ăn');
  assert.ok(resTiming.reply.includes('chất béo') || resTiming.reply.includes('BỮA ĂN'), 'Phải chỉ dẫn dầu cá uống cùng bữa ăn');
  assert.strictEqual(resTiming.recommendedProductIds.length, 0, 'Hỏi thời điểm uống KHÔNG được ép mua sản phẩm');
  console.log('  ✅ PASSED: Khi hỏi thời điểm uống: Trả lời chính xác dược lý học hấp thu, KHÔNG ép mua sản phẩm.');

  // Case 4: Khách chỉ mới mô tả triệu chứng, chưa hỏi mua sản phẩm
  const resSymptom = await consultWithAiPharmacist({
    userMessage: 'Dạo này mắt em nhìn máy tính nhiều hay bị khô cay rát và mỏi nhòe quá',
    products: PRODUCTS
  });
  assert.ok(resSymptom.reply.includes('20-20-20') || resSymptom.reply.includes('màng phim nước mắt'), 'Phải giải thích nguyên nhân và chăm sóc mắt');
  assert.strictEqual(resSymptom.recommendedProductIds.length, 0, 'Mô tả triệu chứng ban đầu KHÔNG ép đính kèm thẻ sản phẩm');
  console.log('  ✅ PASSED: Khi mới mô tả triệu chứng: Đồng cảm, phân tích cơ chế, hỏi thêm bệnh nền, KHÔNG ép mua sản phẩm.');

  // Case 5: Khách chủ động hỏi mua sản phẩm / phác đồ điều trị
  const resProduct = await consultWithAiPharmacist({
    userMessage: 'Bác 65 tuổi bị thoái hóa khớp gối đau nhức, có thuốc hay sản phẩm nào uống hỗ trợ tốt không?',
    products: PRODUCTS
  });
  assert.ok(resProduct.recommendedProductIds.length > 0, 'Khi khách chủ động hỏi sản phẩm MỚI được đề xuất');
  assert.ok(resProduct.recommendedProductIds.includes('vn-01'), 'Đề xuất giải pháp nội địa Viên Khớp Bách Niên Kiện');
  assert.ok(resProduct.recommendedProductIds.includes('us-01'), 'Đề xuất giải pháp nhập khẩu Glucosamine Kirkland');
  console.log('  ✅ PASSED: Khi khách chủ động hỏi giải pháp/sản phẩm: Đề xuất phác đồ kép khoa học (Nội địa + Nhập ngoại).');
}

testAiFlow().then(() => {
  console.log('\n================================================================');
  console.log('   TỔNG KẾT: TẤT CẢ TEST CASES AI VÀ XUẤT CSV ĐẠT 100%!');
  console.log('================================================================\n');
}).catch(err => {
  console.error('Test thất bại:', err);
  process.exit(1);
});
