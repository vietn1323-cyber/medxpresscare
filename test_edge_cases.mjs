import { parseCSV, cleanPrice, normalizeKey } from './src/utils/csvHelper.js';
import { calculateVoucherDiscount } from './src/data/vouchers.js';
import { calculateEarnedPoints, calculatePointsDiscount, calculateMaxPointsToUse } from './src/data/customers.js';
import { slugify, calculateSeoScore } from './src/data/articles.js';

console.log('--- BẮT ĐẦU KIỂM THỬ NGOẠI LỆ & DỮ LIỆU BIÊN (EDGE CASES) ---');

const results = [];

function assert(description, condition, actualValue) {
  if (condition) {
    results.push({ desc: description, passed: true });
    console.log(`  ✅ PASSED: ${description}`);
  } else {
    results.push({ desc: description, passed: false, actual: actualValue });
    console.log(`  ❌ FAILED: ${description} (Actual: ${JSON.stringify(actualValue)})`);
  }
}

// 1. CSV Parser Edge Cases
console.log('\n1. Test csvHelper.parseCSV Edge Cases:');
assert('CSV rỗng trả về mảng rỗng', parseCSV('').length === 0, parseCSV(''));
assert('CSV chỉ có ký tự xuống dòng trả về mảng rỗng', parseCSV('\r\n\r\n').length === 0, parseCSV('\r\n\r\n'));
assert('CSV chỉ có 1 dòng header không có data trả về mảng rỗng', parseCSV('name,price').length === 0, parseCSV('name,price'));

const malformedCSV = `name,price,category\n"Thuốc X",250000\n"Thuốc Y"`;
const malformedParsed = parseCSV(malformedCSV);
assert('CSV thiếu cột vẫn parse an toàn không gây crash', malformedParsed.length === 2, malformedParsed.length);
assert('Dòng thiếu cột giá trị mặc định là chuỗi rỗng', malformedParsed[0].category === '' && malformedParsed[1].price === '', malformedParsed);

const utf8BOMCSV = `\uFEFFname,price\n"Viên Khớp",350000`;
const utf8Parsed = parseCSV(utf8BOMCSV);
assert('CSV có UTF-8 BOM được bóc tách sạch', utf8Parsed[0].name === 'Viên Khớp', utf8Parsed[0].name);

const semicolonCSV = `Ten_San_Pham;Gia_Ban;Xuat_Xu\n"Sâm Ngọc Linh";1200000;"Việt Nam"`;
const semiParsed = parseCSV(semicolonCSV);
assert('CSV phân cách bằng dấu chấm phẩy được nhận diện đúng', semiParsed[0].name === 'Sâm Ngọc Linh' && semiParsed[0].price === '1200000', semiParsed[0]);

// 2. cleanPrice Edge Cases
console.log('\n2. Test cleanPrice Edge Cases:');
assert('cleanPrice với null trả về 0', cleanPrice(null) === 0, cleanPrice(null));
assert('cleanPrice với undefined trả về 0', cleanPrice(undefined) === 0, cleanPrice(undefined));
assert('cleanPrice với chuỗi rỗng trả về 0', cleanPrice('') === 0, cleanPrice(''));
assert('cleanPrice với "350.000₫" trả về 350000', cleanPrice('350.000₫') === 350000, cleanPrice('350.000₫'));
assert('cleanPrice với "1,250,000 VND" trả về 1250000', cleanPrice('1,250,000 VND') === 1250000, cleanPrice('1,250,000 VND'));
assert('cleanPrice với ký tự không số "abc" trả về 0', cleanPrice('abc') === 0, cleanPrice('abc'));
assert('cleanPrice với số thực 350000.75 trả về làm tròn', cleanPrice(350000.75) === 350001, cleanPrice(350000.75));

// 3. Voucher & Discount Edge Cases
console.log('\n3. Test calculateVoucherDiscount Edge Cases:');
assert('Voucher null trả về isValid: false', calculateVoucherDiscount(null, 500000).isValid === false, calculateVoucherDiscount(null, 500000));
assert('Voucher disabled trả về isValid: false', calculateVoucherDiscount({ enabled: false }, 500000).isValid === false, calculateVoucherDiscount({ enabled: false }, 500000));

const voucherFixed = { code: 'FIXED500', discountType: 'fixed', discountValue: 500000, minOrderValue: 200000, enabled: true };
const discountOverSubtotal = calculateVoucherDiscount(voucherFixed, 300000);
assert('Voucher giảm cố định không bao giờ vượt quá subtotal', discountOverSubtotal.discountAmount === 300000, discountOverSubtotal.discountAmount);

const voucherPercent = { code: 'PERC50', discountType: 'percent', discountValue: 50, maxDiscount: 100000, minOrderValue: 0, enabled: true };
const discountCapped = calculateVoucherDiscount(voucherPercent, 1000000);
assert('Voucher % bị chặn bởi maxDiscount', discountCapped.discountAmount === 100000, discountCapped.discountAmount);

const voucherExpired = { code: 'EXP', discountType: 'fixed', discountValue: 50000, minOrderValue: 0, enabled: true, expiryDate: '2020-01-01' };
assert('Voucher quá hạn trả về isValid: false', calculateVoucherDiscount(voucherExpired, 500000).isValid === false, calculateVoucherDiscount(voucherExpired, 500000));

const voucherOutOfUses = { code: 'MAX', discountType: 'fixed', discountValue: 50000, minOrderValue: 0, enabled: true, usageLimit: 10, usedCount: 10 };
assert('Voucher hết lượt dùng trả về isValid: false', calculateVoucherDiscount(voucherOutOfUses, 500000).isValid === false, calculateVoucherDiscount(voucherOutOfUses, 500000));

const voucherGift = { code: 'GIFT_TEST', discountType: 'gift', giftName: 'Bình Giữ Nhiệt Test', giftValue: 150000, minOrderValue: 200000, enabled: true };
assert('Voucher quà tặng chưa đủ giá trị tối thiểu phải bị từ chối', calculateVoucherDiscount(voucherGift, 150000).isValid === false);
const resGiftOk = calculateVoucherDiscount(voucherGift, 250000);
assert('Voucher quà tặng đạt điều kiện phải trả về quà tặng kèm', resGiftOk.isValid === true && resGiftOk.isGift === true && resGiftOk.giftItem.name === 'Bình Giữ Nhiệt Test');

// 4. Loyalty Points Edge Cases
console.log('\n4. Test Loyalty Points Edge Cases:');
assert('calculateEarnedPoints với số âm trả về 0', calculateEarnedPoints(-50000) === 0, calculateEarnedPoints(-50000));
assert('calculateEarnedPoints với 0 trả về 0', calculateEarnedPoints(0) === 0, calculateEarnedPoints(0));
assert('calculateEarnedPoints với 299.000₫ trả về 2 điểm (100k = 1đ)', calculateEarnedPoints(299000) === 2, calculateEarnedPoints(299000));
assert('calculateEarnedPoints với 500.000₫ trả về 5 điểm', calculateEarnedPoints(500000) === 5, calculateEarnedPoints(500000));

assert('calculatePointsDiscount với điểm âm trả về 0', calculatePointsDiscount(-10) === 0, calculatePointsDiscount(-10));
assert('calculatePointsDiscount với 0 điểm trả về 0', calculatePointsDiscount(0) === 0, calculatePointsDiscount(0));
assert('calculatePointsDiscount với 35 điểm trả về 35.000₫', calculatePointsDiscount(35) === 35000, calculatePointsDiscount(35));

assert('calculateMaxPointsToUse không vượt quá subtotal / 1000', calculateMaxPointsToUse(10000, 250000) === 250, calculateMaxPointsToUse(10000, 250000));
assert('calculateMaxPointsToUse với userPoints nhỏ hơn subtotal / 1000', calculateMaxPointsToUse(50, 250000) === 50, calculateMaxPointsToUse(50, 250000));
assert('calculateMaxPointsToUse với subtotal = 0 trả về 0', calculateMaxPointsToUse(50, 0) === 0, calculateMaxPointsToUse(50, 0));

// 5. SEO & Articles Edge Cases
console.log('\n5. Test Articles & SEO Edge Cases:');
assert('slugify chuỗi rỗng trả về chuỗi rỗng không lỗi', slugify('') === '', slugify(''));
assert('slugify chuỗi chỉ có dấu gạch trả về rỗng', slugify('---') === '', slugify('---'));
assert('slugify loại bỏ ký tự đặc biệt tiếng Việt', slugify('Dược Liệu Việt Chuẩn GMP-WHO 100%!!') === 'duoc-lieu-viet-chuan-gmp-who-100', slugify('Dược Liệu Việt Chuẩn GMP-WHO 100%!!'));

const seoEmpty = calculateSeoScore({});
assert('calculateSeoScore với object rỗng trả về điểm an toàn không crash', typeof seoEmpty.score === 'number' && seoEmpty.score >= 0, seoEmpty.score);

console.log('\n--- TỔNG KẾT EDGE CASES ---');
const total = results.length;
const passed = results.filter(r => r.passed).length;
const failed = total - passed;
console.log(`Tổng số: ${total} tests | Đạt (Passed): ${passed} | Không đạt (Failed): ${failed}`);
