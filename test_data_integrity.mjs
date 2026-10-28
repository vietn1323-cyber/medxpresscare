import { PRODUCTS, CATEGORIES, COUNTRIES, DOSAGE_FORMS, TARGET_AUDIENCES } from './src/data/products.js';
import { INITIAL_REVIEWS } from './src/data/reviews.js';
import { DEFAULT_VOUCHERS, calculateVoucherDiscount } from './src/data/vouchers.js';
import { DEFAULT_ARTICLES, calculateSeoScore, slugify } from './src/data/articles.js';
import { VERIFIED_REGISTRATIONS } from './src/data/registrations.js';

console.log('--- KIỂM TRA DATA MODEL INTEGRITY MEDXPRESSCARE ---');

const errors = [];
const warnings = [];

// 1. PRODUCTS TEST
console.log(`\n1. Kiểm tra PRODUCTS (Tổng: ${PRODUCTS.length} sản phẩm):`);
const productIds = new Set();
const validCatIds = new Set(CATEGORIES.map(c => c.id));
const validCountries = new Set(COUNTRIES.map(c => c.id));

PRODUCTS.forEach((p, idx) => {
  const pName = p.name || `Index ${idx}`;
  if (!p.id) errors.push(`[PRODUCTS] Sản phẩm #${idx} thiếu id`);
  if (productIds.has(p.id)) errors.push(`[PRODUCTS] Trùng lặp ID sản phẩm: ${p.id}`);
  productIds.add(p.id);

  if (!p.name || typeof p.name !== 'string') errors.push(`[PRODUCTS] ${p.id}: Tên sản phẩm không hợp lệ`);
  if (typeof p.price !== 'number' || p.price <= 0) errors.push(`[PRODUCTS] ${p.id}: Giá không hợp lệ: ${p.price}`);
  if (p.originalPrice && p.originalPrice < p.price) warnings.push(`[PRODUCTS] ${p.id}: originalPrice (${p.originalPrice}) nhỏ hơn price (${p.price})`);
  
  if (typeof p.rating !== 'number' || p.rating < 0 || p.rating > 5) errors.push(`[PRODUCTS] ${p.id}: Rating không hợp lệ: ${p.rating}`);
  if (typeof p.reviewsCount !== 'number' || p.reviewsCount < 0) errors.push(`[PRODUCTS] ${p.id}: reviewsCount không hợp lệ: ${p.reviewsCount}`);

  // categories
  if (!Array.isArray(p.categories) || p.categories.length === 0) {
    errors.push(`[PRODUCTS] ${p.id}: Thiếu mảng categories hoặc mảng rỗng`);
  } else {
    p.categories.forEach(cat => {
      if (!validCatIds.has(cat)) {
        errors.push(`[PRODUCTS] ${p.id}: Category '${cat}' không nằm trong CATEGORIES`);
      }
    });
  }

  // category fallback
  if (!p.category || !validCatIds.has(p.category)) {
    warnings.push(`[PRODUCTS] ${p.id}: Primary category '${p.category}' không hợp lệ hoặc thiếu`);
  }

  // Số ĐKSP
  if (!p.regNumber) {
    warnings.push(`[PRODUCTS] ${p.id}: Không có số ĐKSP (regNumber)`);
  }

  // Country
  if (!p.countryCode || (!validCountries.has(p.countryCode) && p.countryCode !== 'all')) {
    warnings.push(`[PRODUCTS] ${p.id}: countryCode '${p.countryCode}' không khớp COUNTRIES list`);
  }
});

console.log(`-> Đã kiểm tra ${PRODUCTS.length} sản phẩm. Tìm thấy ${errors.length} lỗi, ${warnings.length} cảnh báo.`);

// 2. REVIEWS TEST
console.log(`\n2. Kiểm tra INITIAL_REVIEWS (Tổng: ${INITIAL_REVIEWS.length} đánh giá):`);
const reviewIds = new Set();
INITIAL_REVIEWS.forEach((rev, idx) => {
  if (!rev.id) errors.push(`[REVIEWS] Review #${idx} thiếu id`);
  if (reviewIds.has(rev.id)) errors.push(`[REVIEWS] Trùng lặp Review id: ${rev.id}`);
  reviewIds.add(rev.id);

  if (!productIds.has(rev.productId)) {
    errors.push(`[REVIEWS] ${rev.id}: productId '${rev.productId}' không tồn tại trong danh sách PRODUCTS!`);
  }

  if (typeof rev.rating !== 'number' || rev.rating < 1 || rev.rating > 5) {
    errors.push(`[REVIEWS] ${rev.id}: Rating không hợp lệ: ${rev.rating}`);
  }

  if (typeof rev.isVerifiedPurchase !== 'boolean') {
    warnings.push(`[REVIEWS] ${rev.id}: isVerifiedPurchase không phải boolean (${rev.isVerifiedPurchase})`);
  }

  if (!rev.customerName) errors.push(`[REVIEWS] ${rev.id}: Thiếu customerName`);
  if (!rev.content) errors.push(`[REVIEWS] ${rev.id}: Thiếu content`);
});

// 3. VOUCHERS TEST
console.log(`\n3. Kiểm tra DEFAULT_VOUCHERS & calculateVoucherDiscount (Tổng: ${DEFAULT_VOUCHERS.length} vouchers):`);
const voucherCodes = new Set();
DEFAULT_VOUCHERS.forEach(v => {
  if (!v.code) errors.push(`[VOUCHERS] Voucher thiếu code`);
  if (voucherCodes.has(v.code)) errors.push(`[VOUCHERS] Trùng lặp mã voucher: ${v.code}`);
  voucherCodes.add(v.code);

  if (!['fixed', 'percent', 'shipping', 'gift'].includes(v.discountType)) {
    errors.push(`[VOUCHERS] ${v.code}: Loại discountType không hợp lệ: ${v.discountType}`);
  }
});

// Test calculateVoucherDiscount logic
const testVoucherFixed = DEFAULT_VOUCHERS.find(v => v.discountType === 'fixed');
const testVoucherPercent = DEFAULT_VOUCHERS.find(v => v.discountType === 'percent');
const testVoucherShip = DEFAULT_VOUCHERS.find(v => v.discountType === 'shipping');
const testVoucherGift = DEFAULT_VOUCHERS.find(v => v.discountType === 'gift');

if (testVoucherGift) {
  const resGift = calculateVoucherDiscount(testVoucherGift, (testVoucherGift.minOrderValue || 0) + 10000);
  if (!resGift.isValid || !resGift.isGift || !resGift.giftItem) {
    errors.push(`[VOUCHERS LOGIC] calculateVoucherDiscount không trả về đúng thông tin quà tặng cho voucher gift`);
  }
}

// Subtotal < minOrderValue
if (testVoucherFixed) {
  const resUnder = calculateVoucherDiscount(testVoucherFixed, (testVoucherFixed.minOrderValue || 100000) - 10000);
  if (resUnder.isValid) errors.push(`[VOUCHERS LOGIC] calculateVoucherDiscount cho phép áp voucher khi đơn chưa đủ giá trị tối thiểu`);
  
  // Subtotal >= minOrderValue
  const resValid = calculateVoucherDiscount(testVoucherFixed, (testVoucherFixed.minOrderValue || 100000) + 10000);
  if (!resValid.isValid || resValid.discountAmount <= 0) errors.push(`[VOUCHERS LOGIC] calculateVoucherDiscount không tính đúng giảm giá cố định`);

  // Edge case: discountValue > subtotal
  const edgeVoucher = { ...testVoucherFixed, discountValue: 500000, minOrderValue: 0, enabled: true };
  const resCapped = calculateVoucherDiscount(edgeVoucher, 200000);
  if (resCapped.discountAmount > 200000) {
    errors.push(`[VOUCHERS LOGIC] Giảm giá (${resCapped.discountAmount}) vượt quá tổng tiền đơn hàng (200000)!`);
  }
}

// Percent voucher test maxDiscount
if (testVoucherPercent && testVoucherPercent.maxDiscount) {
  const bigSubtotal = 10000000;
  const resPercent = calculateVoucherDiscount(testVoucherPercent, bigSubtotal);
  if (resPercent.discountAmount > testVoucherPercent.maxDiscount) {
    errors.push(`[VOUCHERS LOGIC] Giảm % (${resPercent.discountAmount}) vượt quá maxDiscount (${testVoucherPercent.maxDiscount})`);
  }
}

// Shipping voucher test
if (testVoucherShip) {
  const resShip = calculateVoucherDiscount(testVoucherShip, testVoucherShip.minOrderValue + 50000, 30000);
  if (!resShip.isValid || resShip.shippingDiscount !== 30000) {
    errors.push(`[VOUCHERS LOGIC] Freeship không giảm đúng currentShippingFee`);
  }
}

// 4. ARTICLES TEST
console.log(`\n4. Kiểm tra ARTICLES & calculateSeoScore:`);
DEFAULT_ARTICLES.forEach(art => {
  if (!art.id || !art.title || !art.slug) errors.push(`[ARTICLES] Bài viết thiếu id, title hoặc slug`);
  const seo = calculateSeoScore(art);
  if (typeof seo.score !== 'number' || seo.score < 0 || seo.score > 100) {
    errors.push(`[ARTICLES] ${art.slug}: calculateSeoScore trả về điểm không hợp lệ: ${seo.score}`);
  }
});

// Test slugify
const testSlug = slugify('Cách Phân Biệt TPCN Chính Ngạch Chuẩn 100%!');
if (testSlug !== 'cach-phan-biet-tpcn-chinh-ngach-chuan-100') {
  warnings.push(`[ARTICLES] slugify output khác kỳ vọng: ${testSlug}`);
}

// 5. REGISTRATIONS DATABASE
console.log(`\n5. Kiểm tra VERIFIED_REGISTRATIONS:`);
const regKeys = Object.keys(VERIFIED_REGISTRATIONS);
console.log(`-> Có ${regKeys.length} bản ghi tiếp nhận đăng ký Bộ Y Tế.`);
PRODUCTS.forEach(p => {
  if (p.regNumber && !VERIFIED_REGISTRATIONS[p.regNumber]) {
    warnings.push(`[REGISTRATIONS] Sản phẩm ${p.id} có số ĐKSP ${p.regNumber} nhưng chưa có trong VERIFIED_REGISTRATIONS`);
  }
});

console.log('\n--- TỔNG KẾT ---');
console.log(`LỖI (Errors): ${errors.length}`);
errors.forEach(e => console.log('  ❌ ' + e));
console.log(`CẢNH BÁO (Warnings): ${warnings.length}`);
warnings.forEach(w => console.log('  ⚠️ ' + w));
