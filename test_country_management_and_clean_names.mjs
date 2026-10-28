import assert from 'assert';
import { COUNTRIES, PRODUCTS, cleanCountryName } from './src/data/products.js';

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ XUẤT XỨ QUỐC GIA & BỘ LỌC ĐỘNG     ');
console.log('================================================================\n');

// 1. KIỂM THỬ HÀM cleanCountryName VỚI CÁC TRƯỜNG HỢP NHIỄU DỮ LIỆU
console.log('--- 1. KIỂM THỬ HÀM cleanCountryName ---');

const testCases = [
  { input: 'Mỹ (USA)', expected: 'Mỹ' },
  { input: 'VN Việt Nam', expected: 'Việt Nam' },
  { input: 'US Mỹ', expected: 'Mỹ' },
  { input: 'DE Đức', expected: 'Đức' },
  { input: 'AU Úc', expected: 'Úc' },
  { input: 'JP Nhật Bản', expected: 'Nhật Bản' },
  { input: 'KR Hàn Quốc', expected: 'Hàn Quốc' },
  { input: 'Đức (Germany)', expected: 'Đức' },
  { input: 'Nhật Bản (Japan)', expected: 'Nhật Bản' },
  { input: 'Hàn Quốc (Korea)', expected: 'Hàn Quốc' },
  { input: 'Úc (Australia)', expected: 'Úc' },
  { input: 'Pháp (France)', expected: 'Pháp' },
  { input: 'Thụy Sĩ', expected: 'Thụy Sĩ' },
  { input: 'Canada', expected: 'Canada' },
  { input: 'Việt Nam (Nội địa)', expected: 'Việt Nam' },
  { input: '🇻🇳 Việt Nam', expected: 'Việt Nam' },
  { input: '🇺🇸 Mỹ', expected: 'Mỹ' },
  { input: '🇩🇪 Đức', expected: 'Đức' },
  { input: '🇯🇵 Nhật Bản', expected: 'Nhật Bản' },
];

testCases.forEach(({ input, expected }) => {
  const actual = cleanCountryName(input);
  assert.strictEqual(actual, expected, `cleanCountryName("${input}") phải trả về "${expected}", nhận được: "${actual}"`);
  console.log(`  ✅ PASSED: "${input}" ==> "${actual}"`);
});

// 2. KIỂM THỬ CẤU TRÚC VÀ TÍNH TOÀN VẸN CỦA COUNTRIES & PRODUCTS
console.log('\n--- 2. KIỂM THỬ COUNTRIES & PRODUCTS KHÔNG CÒN KÝ TỰ MÃ CỜ WINDOWS ---');

const flagEmojiRegex = /[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/u;

COUNTRIES.forEach(c => {
  assert(!flagEmojiRegex.test(c.name), `Tên quốc gia trong COUNTRIES không được chứa emoji cờ: ${c.name}`);
  assert(!flagEmojiRegex.test(c.flag || ''), `Cột flag trong COUNTRIES không được chứa emoji cờ: ${c.flag}`);
  assert.strictEqual(cleanCountryName(c.name), c.name, `Tên quốc gia trong COUNTRIES phải là tên sạch: ${c.name}`);
});
console.log('  ✅ PASSED: Toàn bộ danh mục COUNTRIES không chứa mã cờ hoặc ký tự thừa.');

PRODUCTS.forEach(p => {
  assert(!flagEmojiRegex.test(p.countryName), `Sản phẩm ${p.id} không được chứa emoji cờ trong countryName: ${p.countryName}`);
  assert(!flagEmojiRegex.test(p.flag || ''), `Sản phẩm ${p.id} không được chứa emoji cờ trong flag: ${p.flag}`);
  assert.strictEqual(cleanCountryName(p.countryName), p.countryName, `Sản phẩm ${p.id} phải có countryName đã làm sạch: ${p.countryName}`);
});
console.log(`  ✅ PASSED: Toàn bộ ${PRODUCTS.length} sản phẩm chỉ chứa tên quốc gia thuần tuý.`);

// 3. KIỂM THỬ LOGIC THÊM QUỐC GIA MỚI VÀ HỢP NHẤT DANH SÁCH ĐỘNG
console.log('\n--- 3. KIỂM THỬ QUẢN TRỊ THÊM QUỐC GIA MỚI & LỌC ĐỘNG ---');

let availableCountries = ['Việt Nam', 'Mỹ', 'Úc', 'Nhật Bản', 'Hàn Quốc', 'Đức', 'Pháp', 'Anh'];

const handleAddCountry = (newCountry) => {
  const cleaned = cleanCountryName(newCountry);
  if (!cleaned) return availableCountries;
  if (!availableCountries.includes(cleaned)) {
    availableCountries = [...availableCountries, cleaned];
  }
  return availableCountries;
};

// Thêm Thụy Sĩ và Canada
handleAddCountry('Thụy Sĩ');
handleAddCountry('Canada (CA)');
assert(availableCountries.includes('Thụy Sĩ'), 'availableCountries phải chứa Thụy Sĩ');
assert(availableCountries.includes('Canada'), 'availableCountries phải chứa Canada đã làm sạch');
console.log('  ✅ PASSED: Thêm quốc gia mới thành công:', availableCountries.join(', '));

// Giả lập sản phẩm mới từ Thụy Sĩ
const mockSwissProduct = {
  id: 'imp-swiss-01',
  name: 'Viên Uống Hỗ Trợ Đề Kháng Swiss Immunity Complex',
  brand: 'SwissBio',
  originType: 'imported',
  countryName: cleanCountryName('Thụy Sĩ'),
  price: 650000
};

// Kiểm tra logic lọc theo quốc gia
const mockProducts = [...PRODUCTS, mockSwissProduct];

const filterByCountry = (list, selectedCountry) => {
  return list.filter(p => {
    if (selectedCountry === 'all') return true;
    const cleanPCountry = cleanCountryName(p.countryName || '');
    const targetClean = cleanCountryName(selectedCountry);
    
    const isTargetVN = targetClean === 'Việt Nam' || selectedCountry === 'VN';
    if (isTargetVN) {
      if (p.originType !== 'domestic' && cleanPCountry !== 'Việt Nam' && p.countryCode !== 'VN') return false;
    } else {
      const matchCode = p.countryCode && p.countryCode.toLowerCase() === selectedCountry.toLowerCase();
      const matchName = cleanPCountry.toLowerCase() === targetClean.toLowerCase() ||
                        cleanPCountry.toLowerCase() === selectedCountry.toLowerCase();
      if (!matchCode && !matchName) return false;
    }
    return true;
  });
};

const swissFiltered = filterByCountry(mockProducts, 'Thụy Sĩ');
assert.strictEqual(swissFiltered.length, 1, 'Lọc theo Thụy Sĩ phải tìm thấy đúng 1 sản phẩm');
assert.strictEqual(swissFiltered[0].id, 'imp-swiss-01', 'Sản phẩm tìm thấy là mockSwissProduct');
console.log('  ✅ PASSED: Lọc theo quốc gia mới (Thụy Sĩ) chính xác');

const vnFiltered = filterByCountry(mockProducts, 'Việt Nam');
assert(vnFiltered.every(p => p.originType === 'domestic' || p.countryName === 'Việt Nam'), 'Lọc Việt Nam chỉ chứa hàng nội địa hoặc Việt Nam');
console.log(`  ✅ PASSED: Lọc theo Việt Nam trả về đúng ${vnFiltered.length} sản phẩm nội địa`);

const usFiltered = filterByCountry(mockProducts, 'Mỹ');
assert(usFiltered.every(p => p.countryName === 'Mỹ' || p.countryCode === 'US'), 'Lọc Mỹ trả về đúng các sản phẩm xuất xứ Mỹ');
console.log(`  ✅ PASSED: Lọc theo Mỹ trả về đúng ${usFiltered.length} sản phẩm xuất xứ Mỹ`);

console.log('\n================================================================');
console.log('   🎉 TẤT CẢ TEST CASES XUẤT XỨ QUỐC GIA & BỘ LỌC ĐẠT 100%!    ');
console.log('================================================================\n');
