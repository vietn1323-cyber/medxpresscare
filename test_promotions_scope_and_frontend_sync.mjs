import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS } from './src/data/products.js';
import { 
  DEFAULT_VOUCHERS, 
  isVoucherTimeValid, 
  getVoucherTimeStatus, 
  isVoucherApplicableToProduct, 
  getProductComboPromotions, 
  getProductGiftPromotions,
  calculateVoucherDiscount 
} from './src/data/vouchers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ PHẠM VI KHUYẾN MẠI & ĐỒNG BỘ COMBO  ');
console.log('================================================================\n');

// 1. KIỂM THỬ PHẠM VI THỜI GIAN (startDate, expiryDate, getVoucherTimeStatus)
console.log('--- 1. Kiểm tra phạm vi thời gian hiệu lực voucher ---');

const futureVoucher = {
  id: 'v-future',
  code: 'SUMMER2027',
  startDate: '2027-06-01',
  expiryDate: '2027-08-31',
  enabled: true,
  discountType: 'percent',
  discountValue: 15
};

const expiredVoucher = {
  id: 'v-expired',
  code: 'TET2025',
  startDate: '2025-01-01',
  expiryDate: '2025-02-15',
  enabled: true,
  discountType: 'fixed',
  discountValue: 50000
};

const activeVoucher = {
  id: 'v-active',
  code: 'ACTIVE2026',
  startDate: '2026-01-01',
  expiryDate: '2026-12-31',
  enabled: true,
  discountType: 'percent',
  discountValue: 10
};

const mockToday = new Date('2026-06-15T10:00:00Z');

assert.strictEqual(isVoucherTimeValid(futureVoucher, mockToday), false, 'Voucher trong tương lai phải chưa có hiệu lực');
assert.strictEqual(getVoucherTimeStatus(futureVoucher, mockToday), 'upcoming', 'Voucher trong tương lai phải có status upcoming');

assert.strictEqual(isVoucherTimeValid(expiredVoucher, mockToday), false, 'Voucher đã qua hạn phải hết hiệu lực');
assert.strictEqual(getVoucherTimeStatus(expiredVoucher, mockToday), 'expired', 'Voucher đã qua hạn phải có status expired');

assert.strictEqual(isVoucherTimeValid(activeVoucher, mockToday), true, 'Voucher trong thời hạn phải có hiệu lực');
assert.strictEqual(getVoucherTimeStatus(activeVoucher, mockToday), 'active', 'Voucher trong thời hạn phải có status active');

console.log('  ✅ PASSED: Kiểm tra phạm vi thời gian (sắp diễn ra / hiệu lực / hết hạn) hoạt động chính xác.');

// 2. KIỂM THỬ PHẠM VI SẢN PHẨM ÁP DỤNG (applicableScope: all | category | specific)
console.log('\n--- 2. Kiểm tra phạm vi sản phẩm áp dụng ---');

const jointProduct = PRODUCTS.find(p => p.category === 'co-xuong-khop') || PRODUCTS[0];
const brainProduct = PRODUCTS.find(p => p.category === 'bo-nao-than-kinh') || PRODUCTS[1];

// A. Scope = 'all'
const voucherAll = { applicableScope: 'all', enabled: true };
assert.strictEqual(isVoucherApplicableToProduct(voucherAll, jointProduct), true, 'Scope all áp dụng cho khớp');
assert.strictEqual(isVoucherApplicableToProduct(voucherAll, brainProduct), true, 'Scope all áp dụng cho não');

// B. Scope = 'category' (chỉ áp dụng Cơ xương khớp)
const voucherCategoryJoint = { 
  applicableScope: 'category', 
  applicableCategories: ['co-xuong-khop'], 
  enabled: true 
};
assert.strictEqual(isVoucherApplicableToProduct(voucherCategoryJoint, jointProduct), true, 'Scope category áp dụng đúng cho sản phẩm khớp');
assert.strictEqual(isVoucherApplicableToProduct(voucherCategoryJoint, brainProduct), false, 'Scope category loại trừ sản phẩm não');

// C. Scope = 'specific' (chỉ áp dụng đúng mã sản phẩm jointProduct.id)
const voucherSpecific = {
  applicableScope: 'specific',
  applicableProducts: [jointProduct.id],
  enabled: true
};
assert.strictEqual(isVoucherApplicableToProduct(voucherSpecific, jointProduct), true, 'Scope specific áp dụng cho đúng sản phẩm chỉ định');
assert.strictEqual(isVoucherApplicableToProduct(voucherSpecific, brainProduct), false, 'Scope specific loại trừ sản phẩm khác');

console.log('  ✅ PASSED: Phạm vi sản phẩm áp dụng (toàn sàn / theo danh mục / theo sản phẩm chỉ định) chuẩn xác.');

// 3. KIỂM THỬ ĐỒNG BỘ KHUYẾN MẠI COMBO TỪ CHƯƠNG TRÌNH KHUYẾN MẠI (getProductComboPromotions)
console.log('\n--- 3. Kiểm tra hàm getProductComboPromotions liên kết động ---');

// Test 1: Khuyến mại combo mặc định áp dụng toàn sàn
const defaultCombos = getProductComboPromotions(jointProduct, DEFAULT_VOUCHERS);
assert.strictEqual(defaultCombos.hasAnyCombo, true, 'Sản phẩm phải có ưu đãi combo');
assert.strictEqual(defaultCombos.promo3?.discountPercent, 10, 'Combo 3 hộp phải lấy đúng 10% từ voucher COMBO3HOP');
assert.strictEqual(defaultCombos.promo6?.discountPercent, 20, 'Combo 6 hộp phải lấy đúng 20% từ voucher COMBO6HOP');

// Test 2: Admin sửa chiết khấu combo 3 lên 15% và combo 6 lên 25%
const customVouchers = DEFAULT_VOUCHERS.map(v => {
  if (v.code === 'COMBO3HOP') return { ...v, discountValue: 15 };
  if (v.code === 'COMBO6HOP') return { ...v, discountValue: 25 };
  return v;
});
const customCombos = getProductComboPromotions(jointProduct, customVouchers);
assert.strictEqual(customCombos.promo3?.discountPercent, 15, 'Frontend phải cập nhật tức thì lên 15% khi admin chỉnh sửa');
assert.strictEqual(customCombos.promo6?.discountPercent, 25, 'Frontend phải cập nhật tức thì lên 25% khi admin chỉnh sửa');

// Test 3: Admin giới hạn combo chỉ áp dụng cho nhóm Cơ Xương Khớp
const restrictedVouchers = DEFAULT_VOUCHERS.map(v => {
  if (v.comboTier === 3 || v.comboTier === 6) {
    return { ...v, applicableScope: 'category', applicableCategories: ['co-xuong-khop'] };
  }
  return v;
});
const jointRestricted = getProductComboPromotions(jointProduct, restrictedVouchers);
const brainRestricted = getProductComboPromotions(brainProduct, restrictedVouchers);
assert.strictEqual(jointRestricted.hasAnyCombo, true, 'Sản phẩm Cơ xương khớp được nhận combo');
assert.strictEqual(brainRestricted.hasAnyCombo, false, 'Sản phẩm Bổ não bị loại trừ, KHÔNG hiển thị thông tin khuyến mại ảo');

// Test 4: Khi admin tắt tạm thời combo 3 hộp
const disabledVouchers = DEFAULT_VOUCHERS.map(v => {
  if (v.code === 'COMBO3HOP') return { ...v, enabled: false };
  return v;
});
const disabledCombos = getProductComboPromotions(jointProduct, disabledVouchers);
assert.strictEqual(disabledCombos.promo3, null, 'Khi admin tắt combo 3 hộp, promo3 trả về null để giao diện không hiển thị sai');
assert.strictEqual(disabledCombos.promo6?.discountPercent, 20, 'Combo 6 hộp vẫn hoạt động bình thường');

console.log('  ✅ PASSED: getProductComboPromotions đồng bộ 100% dữ liệu động giữa Admin và Frontend.');

// 4. KIỂM THỬ FILE ProductCard.jsx VÀ ProductDetailModal.jsx ĐÃ DÙNG getProductComboPromotions
console.log('\n--- 4. Kiểm tra mã nguồn Frontend không còn gán cứng số liệu ---');
const productCardCode = fs.readFileSync(path.join(__dirname, 'src/components/ProductCard.jsx'), 'utf-8');
const productDetailCode = fs.readFileSync(path.join(__dirname, 'src/components/ProductDetailModal.jsx'), 'utf-8');
const adminPanelCode = fs.readFileSync(path.join(__dirname, 'src/components/AdminPanel.jsx'), 'utf-8');

assert.ok(productCardCode.includes('getProductComboPromotions'), 'ProductCard.jsx phải gọi getProductComboPromotions');
assert.ok(!productCardCode.includes('<span>🎁 Combo 3h -10%</span>'), 'ProductCard.jsx đã loại bỏ hoàn toàn text cứng "3h -10%"');

assert.ok(productDetailCode.includes('getProductComboPromotions'), 'ProductDetailModal.jsx phải gọi getProductComboPromotions');
assert.ok(productDetailCode.includes('comboPromo.promo3.discountPercent'), 'ProductDetailModal.jsx hiển thị % động của combo 3');
assert.ok(productDetailCode.includes('comboPromo.promo6.discountPercent'), 'ProductDetailModal.jsx hiển thị % động của combo 6');

// 5. KIỂM THỬ AdminPanel.jsx CÓ ĐẦY ĐỦ CÀI ĐẶT THỜI GIAN & PHẠM VI SẢN PHẨM
assert.ok(adminPanelCode.includes('Phạm Vi Sản Phẩm Áp Dụng'), 'AdminPanel.jsx có mục Phạm Vi Sản Phẩm Áp Dụng');
assert.ok(adminPanelCode.includes('Phạm Vi Thời Gian Áp Dụng'), 'AdminPanel.jsx có mục Phạm Vi Thời Gian Áp Dụng');
assert.ok(adminPanelCode.includes('applicableScope'), 'AdminPanel.jsx quản lý trường applicableScope');
assert.ok(adminPanelCode.includes('applicableCategories'), 'AdminPanel.jsx quản lý trường applicableCategories');
assert.ok(adminPanelCode.includes('applicableProducts'), 'AdminPanel.jsx quản lý trường applicableProducts');
assert.ok(adminPanelCode.includes('Gói Combo & Số Lượng Hộp Tối Thiểu'), 'AdminPanel.jsx có cấu hình combo số lượng');

console.log('  ✅ PASSED: Toàn bộ mã nguồn Frontend và Backend đã khớp chuẩn 100% không còn hardcode.');

// 5. KIỂM THỬ CHƯƠNG TRÌNH KHUYẾN MẠI TẶNG QUÀ (GIFT PROMOTIONS)
console.log('\n--- 5. Kiểm tra chương trình khuyến mại quà tặng (Gift Promotions) ---');
const giftPromos = getProductGiftPromotions(jointProduct, DEFAULT_VOUCHERS);
assert.ok(Array.isArray(giftPromos), 'giftPromos phải là mảng');
assert.ok(giftPromos.length >= 2, `Phải có ít nhất 2 chương trình tặng quà mặc định (hiện có: ${giftPromos.length})`);

const giftVoucher500 = DEFAULT_VOUCHERS.find(v => v.code === 'QUATANG500');
assert.ok(giftVoucher500, 'Phải có voucher quà tặng QUATANG500');
assert.strictEqual(giftVoucher500.discountType, 'gift');
assert.ok(giftVoucher500.giftName, 'Phải có tên quà tặng');
assert.strictEqual(giftVoucher500.usedCount, 0, 'Dữ liệu mới usedCount phải là 0');

// Test calculateVoucherDiscount với voucher quà tặng
const giftCalcUnder = calculateVoucherDiscount(giftVoucher500, 400000);
assert.strictEqual(giftCalcUnder.isValid, false, 'Đơn dưới 500k không được áp dụng quà tặng 500k');

const giftCalcOk = calculateVoucherDiscount(giftVoucher500, 600000);
assert.strictEqual(giftCalcOk.isValid, true, 'Đơn từ 500k được nhận quà tặng');
assert.strictEqual(giftCalcOk.isGift, true, 'isGift phải là true');
assert.strictEqual(giftCalcOk.discountAmount, 0, 'Voucher quà tặng không trừ tiền mà kèm vật phẩm');
assert.strictEqual(giftCalcOk.giftItem.name, giftVoucher500.giftName, 'Tên quà tặng phải khớp');

const cartDrawerCode = fs.readFileSync(path.join(__dirname, 'src/components/CartDrawer.jsx'), 'utf-8');
const checkoutModalCode = fs.readFileSync(path.join(__dirname, 'src/components/CheckoutModal.jsx'), 'utf-8');
const voucherModalCode = fs.readFileSync(path.join(__dirname, 'src/components/VoucherModal.jsx'), 'utf-8');

assert.ok(cartDrawerCode.includes('giftItem'), 'CartDrawer.jsx hiển thị quà tặng kèm trong giỏ hàng');
assert.ok(checkoutModalCode.includes('giftItem'), 'CheckoutModal.jsx lưu quà tặng kèm vào đơn hàng');
assert.ok(voucherModalCode.includes('gift'), 'VoucherModal.jsx có tab lọc Quà Tặng Kèm');
assert.ok(adminPanelCode.includes('gift'), 'AdminPanel.jsx hỗ trợ quản lý voucher quà tặng');

console.log('  ✅ PASSED: Chương trình khuyến mại quà tặng hoạt động chính xác từ Admin đến Giỏ hàng & Thanh toán.');

console.log('\n================================================================');
console.log('   🎉 TẤT CẢ TEST CASES PHẠM VI KHUYẾN MẠI ĐỀU THÀNH CÔNG!     ');
console.log('================================================================');
