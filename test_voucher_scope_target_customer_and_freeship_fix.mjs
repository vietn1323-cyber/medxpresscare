/**
 * Test Suite: Nâng Cấp Form Voucher, Đối Tượng Khách Hàng (target_customer),
 * Phạm Vi Sản Phẩm (scope) & Khắc Phục Lỗi Freeship Đơn 350k
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  DEFAULT_VOUCHERS, 
  calculateVoucherDiscount, 
  isVoucherApplicableToProduct 
} from './src/data/vouchers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log(' KIỂM THỬ NÂNG CẤP VOUCHER, TARGET_CUSTOMER & SỬA LỖI FREESHIP ');
console.log('================================================================');

// -------------------------------------------------------------
// 1. KIỂM THỬ SỬA LỖI ĐƠN 350K KHÔNG ĐƯỢC FREESHIP NẾU YÊU CẦU 500K
// -------------------------------------------------------------
console.log('\n--- 1. Kiểm thử giải quyết dứt điểm lỗi đơn 350k vẫn được Freeship ---');
const freeshipVoucher = DEFAULT_VOUCHERS.find(v => v.code === 'FREESHIP');
assert.ok(freeshipVoucher, 'Phải tồn tại voucher FREESHIP');
assert.strictEqual(freeshipVoucher.minOrderValue, 500000, 'minOrderValue của voucher FREESHIP phải là 500.000₫');

// Đơn 350k áp voucher FREESHIP phải bị TỪ CHỐI
const res350k = calculateVoucherDiscount(freeshipVoucher, 350000, 35000);
assert.strictEqual(res350k.isValid, false, 'Đơn 350k KHÔNG được hợp lệ với voucher Freeship 500k');
assert.strictEqual(res350k.shippingDiscount, 0, 'Cước phí giảm phải bằng 0');
assert.ok(res350k.reason.includes('còn thiếu 150.000₫'), 'Thông báo phải nêu rõ còn thiếu 150.000₫');
console.log('  ✔ Đơn 350.000₫ bị từ chối chính xác khi voucher yêu cầu tối thiểu 500.000₫');

// Đơn 500k áp voucher FREESHIP được CHẤP THUẬN
const res500k = calculateVoucherDiscount(freeshipVoucher, 500000, 35000);
assert.strictEqual(res500k.isValid, true, 'Đơn 500k phải được áp dụng Freeship thành công');
assert.strictEqual(res500k.shippingDiscount, 35000, 'Cước phí được miễn 100%');
console.log('  ✔ Đơn 500.000₫ được miễn phí vận chuyển chính xác');

// -------------------------------------------------------------
// 2. KIỂM THỬ XÁC THỰC NGHIÊM NGẶT KHÁCH ẨN DANH (AUTHENTICATION CHECK)
// -------------------------------------------------------------
console.log('\n--- 2. Kiểm thử Authentication Check với khách hàng mua ẩn danh ---');

const newCustomerVoucher = {
  id: 'vouch-test-new',
  code: 'CHAO-BAN-MOI',
  title: 'Giảm 50k Cho Đơn Đầu Tiên Của Thành Viên Mới',
  discountType: 'fixed',
  discountValue: 50000,
  minOrderValue: 200000,
  target_customer: 'new',
  enabled: true
};

const vipCustomerVoucher = {
  id: 'vouch-test-vip',
  code: 'TRI-AN-VIP',
  title: 'Giảm 100k Dành Riêng Cho Khách VIP',
  discountType: 'fixed',
  discountValue: 100000,
  minOrderValue: 300000,
  target_customer: 'vip',
  enabled: true
};

// Khách ẩn danh (currentUser = null) áp dụng mã Khách hàng mới
const anonNewRes = calculateVoucherDiscount(newCustomerVoucher, 300000, 25000, [], null);
assert.strictEqual(anonNewRes.isValid, false, 'Khách ẩn danh không được dùng mã Khách hàng mới');
assert.strictEqual(anonNewRes.requiresAuth, true, 'Cờ requiresAuth phải là true');
assert.strictEqual(
  anonNewRes.reason, 
  'Ưu đãi này chỉ dành cho thành viên. Vui lòng đăng nhập hoặc đăng ký tài khoản để áp dụng.'
);
console.log('  ✔ Khách ẩn danh bị chặn khi áp dụng mã Khách hàng mới, thông báo chuẩn xác');

// Khách ẩn danh (currentUser = null) áp dụng mã Khách VIP
const anonVipRes = calculateVoucherDiscount(vipCustomerVoucher, 400000, 25000, [], null);
assert.strictEqual(anonVipRes.isValid, false, 'Khách ẩn danh không được dùng mã VIP');
assert.strictEqual(anonVipRes.requiresAuth, true, 'Cờ requiresAuth phải là true');
assert.strictEqual(
  anonVipRes.reason, 
  'Ưu đãi này chỉ dành cho thành viên. Vui lòng đăng nhập hoặc đăng ký tài khoản để áp dụng.'
);
console.log('  ✔ Khách ẩn danh bị chặn khi áp dụng mã Khách VIP, thông báo chuẩn xác');

// -------------------------------------------------------------
// 3. KIỂM THỬ XÁC THỰC THÀNH VIÊN ĐÃ ĐĂNG NHẬP
// -------------------------------------------------------------
console.log('\n--- 3. Kiểm thử phân nhóm khách hàng sau khi đã đăng nhập ---');

// Thành viên mới (0 đơn hàng thành công)
const freshMember = {
  id: 'cust-01',
  fullName: 'Nguyễn Văn Mới',
  phone: '0988111222',
  orderCount: 0,
  ordersHistory: []
};
const freshRes = calculateVoucherDiscount(newCustomerVoucher, 300000, 25000, [], freshMember);
assert.strictEqual(freshRes.isValid, true, 'Thành viên mới (0 đơn) được hưởng ưu đãi');
assert.strictEqual(freshRes.discountAmount, 50000);
console.log('  ✔ Thành viên mới có 0 đơn hàng áp dụng thành công mã giảm 50.000₫');

// Khách hàng cũ (đã có 2 đơn hàng thành công) cố tình dùng mã khách mới
const oldCustomer = {
  id: 'cust-02',
  fullName: 'Trần Văn Cũ',
  phone: '0977333444',
  orderCount: 2,
  ordersHistory: ['ORD-01', 'ORD-02']
};
const oldCustRes = calculateVoucherDiscount(newCustomerVoucher, 300000, 25000, [], oldCustomer);
assert.strictEqual(oldCustRes.isValid, false, 'Khách hàng cũ không được dùng mã Khách hàng mới');
assert.strictEqual(oldCustRes.reason, 'Ưu đãi này chỉ áp dụng cho đơn hàng đầu tiên của khách hàng mới.');
console.log('  ✔ Khách hàng cũ bị từ chối mã chào mừng bạn mới chính xác');

// Khách hàng thường thử dùng mã VIP
const regularCustomer = {
  id: 'cust-03',
  fullName: 'Lê Thị Thường',
  phone: '0966555666',
  tier: 'Thành viên Đồng',
  totalSpent: 400000,
  points: 4,
  isVip: false
};
const regVipRes = calculateVoucherDiscount(vipCustomerVoucher, 500000, 25000, [], regularCustomer);
assert.strictEqual(regVipRes.isValid, false, 'Khách hàng thường không được dùng mã VIP');
assert.strictEqual(regVipRes.reason, 'Ưu đãi này chỉ dành cho khách hàng thân thiết / VIP.');
console.log('  ✔ Khách hàng thường bị chặn khi áp dụng mã VIP');

// Khách hàng VIP xịn
const genuineVip = {
  id: 'cust-04',
  fullName: 'Phạm Minh VIP',
  phone: '0912888999',
  tier: 'Khách hàng VIP',
  isVip: true,
  totalSpent: 5000000,
  points: 120
};
const genuineVipRes = calculateVoucherDiscount(vipCustomerVoucher, 500000, 25000, [], genuineVip);
assert.strictEqual(genuineVipRes.isValid, true, 'Khách hàng VIP được áp dụng mã VIP thành công');
assert.strictEqual(genuineVipRes.discountAmount, 100000);
console.log('  ✔ Khách hàng VIP được chiết khấu 100.000₫ trọn vẹn');

// -------------------------------------------------------------
// 4. KIỂM THỬ PHẠM VI SẢN PHẨM ÁP DỤNG (SCOPE CHECK)
// -------------------------------------------------------------
console.log('\n--- 4. Kiểm thử Phạm Vi Sản Phẩm Áp Dụng (category & specific) ---');

// Voucher theo danh mục (category)
const catVoucher = {
  id: 'vouch-cat',
  code: 'CAT-KHOP',
  applicableScope: 'category',
  applicableCategories: ['tpcn-khop'],
  discountType: 'fixed',
  discountValue: 30000,
  minOrderValue: 100000,
  enabled: true
};

const cartMatchingCat = [
  { id: 'vn-01', name: 'Viên Khớp Bách Niên Kiện', category: 'tpcn-khop', price: 200000, quantity: 1 }
];
const cartNotMatchingCat = [
  { id: 'us-01', name: 'Vitamin C 1000mg', category: 'vitamin-khoang-chat', price: 250000, quantity: 1 }
];

const catMatchRes = calculateVoucherDiscount(catVoucher, 200000, 25000, cartMatchingCat);
assert.strictEqual(catMatchRes.isValid, true, 'Giỏ hàng có sản phẩm khớp danh mục phải hợp lệ');

const catMismatchRes = calculateVoucherDiscount(catVoucher, 250000, 25000, cartNotMatchingCat);
assert.strictEqual(catMismatchRes.isValid, false, 'Giỏ hàng không có sản phẩm khớp danh mục phải bị từ chối');
assert.strictEqual(catMismatchRes.reason, 'Mã giảm giá này chỉ áp dụng cho sản phẩm thuộc danh mục quy định.');
console.log('  ✔ Kiểm tra phạm vi Theo Danh Mục (category) hoạt động chuẩn xác');

// Voucher sản phẩm cụ thể (specific)
const specificVoucher = {
  id: 'vouch-specific',
  code: 'ONLY-VN01',
  applicableScope: 'specific',
  applicableProducts: ['vn-01'],
  discountType: 'fixed',
  discountValue: 40000,
  minOrderValue: 100000,
  enabled: true
};

const specMatchRes = calculateVoucherDiscount(specificVoucher, 200000, 25000, cartMatchingCat);
assert.strictEqual(specMatchRes.isValid, true, 'Giỏ hàng có sản phẩm chỉ định vn-01 phải hợp lệ');

const specMismatchRes = calculateVoucherDiscount(specificVoucher, 250000, 25000, cartNotMatchingCat);
assert.strictEqual(specMismatchRes.isValid, false, 'Giỏ hàng không có vn-01 phải bị từ chối');
assert.strictEqual(specMismatchRes.reason, 'Mã giảm giá này chỉ áp dụng cho một số sản phẩm chỉ định trong chương trình.');
console.log('  ✔ Kiểm tra phạm vi Sản Phẩm Cụ Thể (specific) hoạt động chuẩn xác');

// -------------------------------------------------------------
// 5. KIỂM THỬ TRẢI NGHIỆM GIAO DIỆN UI/UX FRONTEND
// -------------------------------------------------------------
console.log('\n--- 5. Kiểm tra trải nghiệm UI/UX tại CheckoutModal, CartDrawer & AdminPanel ---');

const checkoutCode = fs.readFileSync(path.join(__dirname, 'src/components/CheckoutModal.jsx'), 'utf8');
assert.ok(checkoutCode.includes('Đăng ký / Đăng nhập ngay'), 'CheckoutModal phải có nút điều hướng "Đăng ký / Đăng nhập ngay"');
assert.ok(!checkoutCode.includes("appliedVoucher === 'FREESHIP'"), 'CheckoutModal không được chứa hardcode bypass appliedVoucher === "FREESHIP"');
assert.ok(checkoutCode.includes('freeShipThreshold'), 'CheckoutModal phải dùng ngưỡng freeship động');
console.log('  ✔ CheckoutModal.jsx tích hợp đầy đủ nút Đăng nhập nhanh và loại bỏ hoàn toàn bypass Freeship');

const cartDrawerCode = fs.readFileSync(path.join(__dirname, 'src/components/CartDrawer.jsx'), 'utf8');
assert.ok(cartDrawerCode.includes('Đăng ký / Đăng nhập ngay'), 'CartDrawer phải có nút điều hướng "Đăng ký / Đăng nhập ngay"');
assert.ok(!cartDrawerCode.includes("appliedVoucher === 'FREESHIP'"), 'CartDrawer không được chứa hardcode bypass appliedVoucher === "FREESHIP"');
console.log('  ✔ CartDrawer.jsx tích hợp đầy đủ nút Đăng nhập nhanh và loại bỏ hoàn toàn bypass Freeship');

const stickyCartCode = fs.readFileSync(path.join(__dirname, 'src/components/StickyCart.jsx'), 'utf8');
assert.ok(stickyCartCode.includes('freeShipThreshold'), 'StickyCart.jsx đọc đúng storeConfig.freeShipThreshold');
console.log('  ✔ StickyCart.jsx đọc đồng bộ ngưỡng freeship với Admin');

const adminPanelCode = fs.readFileSync(path.join(__dirname, 'src/components/AdminPanel.jsx'), 'utf8');
assert.ok(adminPanelCode.includes('target_customer'), 'AdminPanel.jsx có cấu hình target_customer');
assert.ok(adminPanelCode.includes('Tất cả khách hàng'), 'AdminPanel.jsx có option Tất cả khách hàng');
assert.ok(adminPanelCode.includes('Khách hàng mới'), 'AdminPanel.jsx có option Khách hàng mới');
assert.ok(adminPanelCode.includes('Khách hàng thân thiết / VIP'), 'AdminPanel.jsx có option Khách hàng VIP');
assert.ok(adminPanelCode.includes('category_ids'), 'AdminPanel.jsx lưu đúng category_ids');
assert.ok(adminPanelCode.includes('product_ids'), 'AdminPanel.jsx lưu đúng product_ids');
console.log('  ✔ AdminPanel.jsx cấu hình đầy đủ Radio button Scope và Dropdown target_customer');

console.log('\n================================================================');
console.log(' TẤT CẢ CÁC TEST CASES ĐÃ VƯỢT QUA XUẤT SẮC (100% PASSED)! ');
console.log('================================================================\n');
