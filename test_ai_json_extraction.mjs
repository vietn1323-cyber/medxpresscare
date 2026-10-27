import { extractJsonFromText, sanitizeJsonCandidate } from './src/utils/aiHelper.js';

console.log('--- KIỂM THỬ AI JSON EXTRACTION & PARSING RESILIENCE ---');

let passed = 0;
let failed = 0;

function assert(name, condition) {
  if (condition) {
    console.log(`  ✅ PASSED: ${name}`);
    passed++;
  } else {
    console.error(`  ❌ FAILED: ${name}`);
    failed++;
  }
}

// 1. Parse chuỗi JSON thuần túy
const test1 = '{"title": "Bí quyết bổ sung Canxi D3K2", "readTime": "5 phút"}';
const res1 = extractJsonFromText(test1);
assert('Parse JSON thuần túy', res1?.title === 'Bí quyết bổ sung Canxi D3K2' && res1?.readTime === '5 phút');

// 2. Parse JSON bọc trong markdown code block
const test2 = '```json\n{\n  "title": "Bảo vệ tim mạch",\n  "tags": ["omega 3", "coq10"]\n}\n```';
const res2 = extractJsonFromText(test2);
assert('Parse JSON trong markdown fence ```json', res2?.title === 'Bảo vệ tim mạch' && res2?.tags?.[0] === 'omega 3');

// 3. Parse JSON có lời dạo đầu của Senior Pharmacist (đúng lỗi thực tế vừa xảy ra)
const test3 = `Senior Pharmacist here: Dưới đây là bài viết đã được viết lại chuẩn SEO:
\`\`\`json
{
  "title": "Chống Đột Quỵ và Xơ Vữa Động Mạch Hiệu Quả",
  "metaTitle": "Chống Đột Quỵ Chuẩn Y Khoa | MedXpressCare",
  "tags": ["tim mach", "huyet ap",]
}
\`\`\`
Hy vọng bài viết này đạt chuẩn yêu cầu của bạn!`;
const res3 = extractJsonFromText(test3);
assert('Parse JSON có văn bản chào hỏi mở đầu và kết thúc', res3?.title === 'Chống Đột Quỵ và Xơ Vữa Động Mạch Hiệu Quả');
assert('Tự động sửa trailing comma trong mảng tags', Array.isArray(res3?.tags) && res3?.tags.length === 2);

// 4. Parse JSON thuần bị bao quanh bởi text nhưng KHÔNG có markdown fence
const test4 = 'Chào bạn, kết quả phân tích y khoa: {"reply": "Nên uống sau bữa ăn sáng 30 phút", "precautions": "Người đau dạ dày uống sau ăn no"} Cần hỗ trợ thêm hãy nhắn tôi nhé!';
const res4 = extractJsonFromText(test4);
assert('Parse JSON không có fence nhưng nằm giữa text hội thoại', res4?.reply === 'Nên uống sau bữa ăn sáng 30 phút' && res4?.precautions.includes('Người đau dạ dày'));

// 5. Parse mảng JSON Array
const test5 = 'Gợi ý danh sách sản phẩm: ["vn-01", "us-02", "jp-01"]';
const res5 = extractJsonFromText(test5);
assert('Parse mảng JSON Array', Array.isArray(res5) && res5.length === 3 && res5[1] === 'us-02');

// 6. Xử lý chuỗi rỗng / null / sai định dạng an toàn không văng lỗi
assert('Xử lý null an toàn', extractJsonFromText(null) === null);
assert('Xử lý undefined an toàn', extractJsonFromText(undefined) === null);
assert('Xử lý chuỗi rỗng an toàn', extractJsonFromText('') === null);
assert('Xử lý chuỗi text không có JSON an toàn', extractJsonFromText('Hôm nay trời đẹp quá không có JSON nào cả') === null);

// 7. Sanitize helper
const cleanSanitize = sanitizeJsonCandidate('{"a": 1, "b": 2,}');
assert('Sanitize trailing comma thành công', cleanSanitize === '{"a": 1, "b": 2}');

console.log(`\n--- TỔNG KẾT: ${passed} PASSED, ${failed} FAILED ---`);
if (failed > 0) {
  process.exit(1);
}
