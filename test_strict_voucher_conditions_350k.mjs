/**
 * Test Suite: Kiểm Tra Nghiêm Ngặt Điều Kiện Voucher & Khuyến Mại
 * - Đơn hàng 350.000₫ (1 hộp) KHÔNG THỂ áp dụng:
 *   1. FREESHIP (yêu cầu đơn từ 500.000₫)
 *   2. TRIAN10 (yêu cầu đơn từ 600.000₫)
 *   3. COMBO3HOP (yêu cầu mua từ 3 hộp trở lên)
 *   4. COMBO6HOP (yêu cầu mua từ 6 hộp trở lên)
 * - Đơn hàng đủ 3 hộp hoặc 6 hộp hoặc đủ ngưỡng tiền mới được áp dụng hợp lệ.
 * - Kiểm tra ProductDetailModal mặc định chọn gói 1 hộp ('single') và nhãn hiển thị chính xác.
 * - Đảm bảo tuyệt đối không có từ khóa "GSP" trong toàn bộ mã nguồn.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  DEFAULT_VOUCHERS, 
  calculateVoucherDiscount 
} from './src/data/vouchers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log(' KIỂM THỬ ĐIỀU KIỆN ÁP DỤNG VOUCHER & COMBO CHO ĐƠN HÀNG 350K ');
console.log('================================================================');

// -------------------------------------------------------------
// 1. KIỂM THỬ ĐƠN HÀNG 1 HỘP 350.000₫ VỚI CÁC MÃ KHUYẾN MẠI
// -------------------------------------------------------------
console.log('\n--- 1. Kiểm thử đơn hàng 1 hộp giá 350.000₫ ---');
const singleBoxCart = [
  { id: 'prod-01', name: 'Đông Trùng Hạ Thảo', price: 350000, quantity: 1, comboType: 'single', comboBoxes: 1 }
];
const subtotal350k = 350000;
const shippingFee = 35000;

// 1.1 Voucher FREESHIP (500k min)
const freeshipVoucher = DEFAULT_VOUCHERS.find(v => v.code === 'FREESHIP');
assert.ok(freeshipVoucher, 'Voucher FREESHIP phải tồn tại');
assert.strictEqual(freeshipVoucher.minOrderValue, 500000, 'FREESHIP phải yêu cầu tối thiểu 500.000₫');
const resFreeship350k = calculateVoucherDiscount(freeshipVoucher, subtotal350k, shippingFee, singleBoxCart);
assert.strictEqual(resFreeship350k.isValid, false, 'Đơn 350k KHÔNG được hợp lệ với FREESHIP (500k)');
assert.strictEqual(resFreeship350k.shippingDiscount, 0, 'Giảm ship phải là 0');
assert.ok(resFreeship350k.reason.includes('còn thiếu 150.000₫'), 'Phải báo còn thiếu 150.000₫');
console.log('  ✔ Mã FREESHIP (500k) bị TỪ CHỐI chuẩn xác cho đơn 350k (thiếu 150k)');

// 1.2 Voucher TRIAN10 (600k min)
const trian10Voucher = DEFAULT_VOUCHERS.find(v => v.code === 'TRIAN10');
assert.ok(trian10Voucher, 'Voucher TRIAN10 phải tồn tại');
assert.strictEqual(trian10Voucher.minOrderValue, 600000, 'TRIAN10 phải yêu cầu tối thiểu 600.000₫');
const resTrian350k = calculateVoucherDiscount(trian10Voucher, subtotal350k, shippingFee, singleBoxCart);
assert.strictEqual(resTrian350k.isValid, false, 'Đơn 350k KHÔNG được hợp lệ với TRIAN10 (600k)');
assert.strictEqual(resTrian350k.discountAmount, 0, 'Giảm giá phải là 0');
assert.ok(resTrian350k.reason.includes('còn thiếu 250.000₫'), 'Phải báo còn thiếu 250.000₫');
console.log('  ✔ Mã TRIAN10 (600k) bị TỪ CHỐI chuẩn xác cho đơn 350k (thiếu 250k)');

// 1.3 Voucher COMBO3HOP (minQuantity: 3, comboTier: 3)
const combo3Voucher = DEFAULT_VOUCHERS.find(v => v.code === 'COMBO3HOP');
assert.ok(combo3Voucher, 'Voucher COMBO3HOP phải tồn tại');
assert.strictEqual(combo3Voucher.minQuantity, 3, 'COMBO3HOP phải yêu cầu minQuantity = 3');
assert.strictEqual(combo3Voucher.comboTier, 3, 'COMBO3HOP phải có comboTier = 3');
const resCombo3_350k = calculateVoucherDiscount(combo3Voucher, subtotal350k, shippingFee, singleBoxCart);
assert.strictEqual(resCombo3_350k.isValid, false, 'Đơn 1 hộp KHÔNG được hợp lệ với COMBO3HOP');
assert.strictEqual(resCombo3_350k.discountAmount, 0, 'Giảm giá phải là 0');
assert.strictEqual(resCombo3_350k.shippingDiscount, 0, 'Giảm ship phải là 0');
assert.ok(resCombo3_350k.reason.includes('3 hộp trở lên'), 'Lý do phải nêu rõ yêu cầu 3 hộp trở lên');
assert.ok(resCombo3_350k.reason.includes('hiện có 1 hộp'), 'Lý do phải nêu rõ hiện có 1 hộp');
console.log('  ✔ Mã COMBO3HOP bị TỪ CHỐI chuẩn xác khi giỏ hàng chỉ có 1 hộp');

// 1.4 Voucher COMBO6HOP (minQuantity: 6, comboTier: 6)
const combo6Voucher = DEFAULT_VOUCHERS.find(v => v.code === 'COMBO6HOP');
assert.ok(combo6Voucher, 'Voucher COMBO6HOP phải tồn tại');
assert.strictEqual(combo6Voucher.minQuantity, 6, 'COMBO6HOP phải yêu cầu minQuantity = 6');
assert.strictEqual(combo6Voucher.comboTier, 6, 'COMBO6HOP phải có comboTier = 6');
const resCombo6_350k = calculateVoucherDiscount(combo6Voucher, subtotal350k, shippingFee, singleBoxCart);
assert.strictEqual(resCombo6_350k.isValid, false, 'Đơn 1 hộp KHÔNG được hợp lệ với COMBO6HOP');
assert.strictEqual(resCombo6_350k.discountAmount, 0, 'Giảm giá phải là 0');
assert.ok(resCombo6_350k.reason.includes('6 hộp trở lên'), 'Lý do phải nêu rõ yêu cầu 6 hộp trở lên');
console.log('  ✔ Mã COMBO6HOP bị TỪ CHỐI chuẩn xác khi giỏ hàng chỉ có 1 hộp');

// 1.5 Voucher MEDXPRESS50 (400k min)
const medxpress50Voucher = DEFAULT_VOUCHERS.find(v => v.code === 'MEDXPRESS50');
const resMedxpress50_350k = calculateVoucherDiscount(medxpress50Voucher, subtotal350k, shippingFee, singleBoxCart);
assert.strictEqual(resMedxpress50_350k.isValid, false, 'Đơn 350k KHÔNG được hợp lệ với MEDXPRESS50 (400k)');
assert.ok(resMedxpress50_350k.reason.includes('còn thiếu 50.000₫'), 'Phải báo còn thiếu 50.000₫');
console.log('  ✔ Mã MEDXPRESS50 (400k) bị TỪ CHỐI chuẩn xác cho đơn 350k (thiếu 50k)');

// 1.6 Voucher DUOCSI30 (300k min) -> ĐỦ ĐIỀU KIỆN
const duocsi30Voucher = DEFAULT_VOUCHERS.find(v => v.code === 'DUOCSI30');
const resDuocsi30_350k = calculateVoucherDiscount(duocsi30Voucher, subtotal350k, shippingFee, singleBoxCart);
assert.strictEqual(resDuocsi30_350k.isValid, true, 'Đơn 350k ĐỦ ĐIỀU KIỆN với DUOCSI30 (300k min)');
assert.strictEqual(resDuocsi30_350k.discountAmount, 30000, 'Giảm giá 30.000₫');
console.log('  ✔ Mã DUOCSI30 (300k min) được CHẤP THUẬN chính xác (350k >= 300k)');

// -------------------------------------------------------------
// 2. KIỂM THỬ ĐƠN HÀNG ĐỦ ĐIỀU KIỆN (3 HỘP, 6 HỘP, TRÊN 500K, TRÊN 600K)
// -------------------------------------------------------------
console.log('\n--- 2. Kiểm thử đơn hàng đạt điều kiện hợp lệ ---');

// 2.1 Đơn 3 hộp lẻ (3 x 350k = 1.050.000₫)
const threeBoxesCart = [
  { id: 'prod-01', name: 'Đông Trùng Hạ Thảo', price: 350000, quantity: 3, comboType: 'single', comboBoxes: 1 }
];
const subtotal1050k = 1050000;

const resCombo3_valid = calculateVoucherDiscount(combo3Voucher, subtotal1050k, shippingFee, threeBoxesCart);
assert.strictEqual(resCombo3_valid.isValid, true, '3 hộp phải hợp lệ với COMBO3HOP');
assert.strictEqual(resCombo3_valid.discountAmount, 105000, 'Giảm 10% của 1.050.000₫ = 105.000₫');
assert.strictEqual(resCombo3_valid.shippingDiscount, shippingFee, 'Combo 3 được miễn phí ship toàn quốc');
console.log('  ✔ Đơn 3 hộp áp dụng thành công COMBO3HOP (-10% + Freeship)');

const resFreeship_valid = calculateVoucherDiscount(freeshipVoucher, subtotal1050k, shippingFee, threeBoxesCart);
assert.strictEqual(resFreeship_valid.isValid, true, 'Đơn 1.050.000₫ >= 500k áp dụng Freeship hợp lệ');
assert.strictEqual(resFreeship_valid.shippingDiscount, shippingFee);
console.log('  ✔ Đơn 1.050.000₫ áp dụng thành công FREESHIP');

const resTrian10_valid = calculateVoucherDiscount(trian10Voucher, subtotal1050k, shippingFee, threeBoxesCart);
assert.strictEqual(resTrian10_valid.isValid, true, 'Đơn 1.050.000₫ >= 600k áp dụng TRIAN10 hợp lệ');
assert.strictEqual(resTrian10_valid.discountAmount, 100000, 'TRIAN10 giảm 10% kịch trần 100.000₫');
console.log('  ✔ Đơn 1.050.000₫ áp dụng thành công TRIAN10 (giảm kịch trần 100k)');

// 2.2 Đơn 6 hộp lẻ (6 x 350k = 2.100.000₫)
const sixBoxesCart = [
  { id: 'prod-01', name: 'Đông Trùng Hạ Thảo', price: 350000, quantity: 6, comboType: 'single', comboBoxes: 1 }
];
const subtotal2100k = 2100000;
const resCombo6_valid = calculateVoucherDiscount(combo6Voucher, subtotal2100k, shippingFee, sixBoxesCart);
assert.strictEqual(resCombo6_valid.isValid, true, '6 hộp phải hợp lệ với COMBO6HOP');
assert.strictEqual(resCombo6_valid.discountAmount, 420000, 'Giảm 20% của 2.100.000₫ = 420.000₫');
assert.strictEqual(resCombo6_valid.shippingDiscount, shippingFee, 'Combo 6 được miễn phí ship toàn quốc');
console.log('  ✔ Đơn 6 hộp áp dụng thành công COMBO6HOP (-20% + Freeship)');

// 2.3 Đơn thêm qua gói Combo3 trực tiếp (comboType = combo3, comboBoxes = 3)
const comboItemCart = [
  { id: 'prod-01-combo3', name: 'Đông Trùng Hạ Thảo (Liệu Trình 3 Hộp)', price: 945000, quantity: 1, comboType: 'combo3', comboBoxes: 3 }
];
const resComboItemCheck = calculateVoucherDiscount(combo3Voucher, 945000, shippingFee, comboItemCart);
assert.strictEqual(resComboItemCheck.isValid, true, 'Gói combo 3 hộp được tính đủ 3 hộp và hợp lệ');
console.log('  ✔ Gói Combo 3 hộp tính đúng 3 hộp cho điều kiện minQuantity');

// -------------------------------------------------------------
// 3. KIỂM TRA MÃ NGUỒN FRONTEND
// -------------------------------------------------------------
console.log('\n--- 3. Kiểm tra mã nguồn Frontend ---');

// 3.1 ProductDetailModal: Mặc định chọn single và nhãn hiển thị chính xác
const productDetailModalContent = fs.readFileSync(path.join(__dirname, 'src/components/ProductDetailModal.jsx'), 'utf8');
assert.ok(
  productDetailModalContent.includes("useState('single')"),
  'ProductDetailModal phải mặc định selectedCombo là single'
);
assert.ok(
  !productDetailModalContent.includes("<span>Mã ưu đãi đang áp dụng:</span>"),
  'Không được dùng nhãn gây hiểu nhầm "Mã ưu đãi đang áp dụng"'
);
assert.ok(
  productDetailModalContent.includes("<span>Mã ưu đãi có thể dùng khi thanh toán:</span>"),
  'Phải dùng nhãn chuẩn xác "Mã ưu đãi có thể dùng khi thanh toán:"'
);
console.log('  ✔ ProductDetailModal mặc định gói 1 hộp (single) và nhãn hiển thị voucher chính xác');

// 3.2 CartDrawer: Kiểm tra cảnh báo khi mã không hợp lệ
const cartDrawerContent = fs.readFileSync(path.join(__dirname, 'src/components/CartDrawer.jsx'), 'utf8');
assert.ok(
  cartDrawerContent.includes('currentVoucherCheck?.isValid'),
  'CartDrawer phải kiểm tra tính hợp lệ của voucher trước khi hiển thị khung thành công'
);
assert.ok(
  cartDrawerContent.includes('Chưa đủ điều kiện'),
  'CartDrawer phải hiển thị thẻ cảnh báo Chưa đủ điều kiện'
);
console.log('  ✔ CartDrawer kiểm tra chặt chẽ tính hợp lệ của voucher và cảnh báo rõ ràng');

// 3.3 CheckoutModal: Không hiển thị thành công nếu mã chưa hợp lệ
const checkoutModalContent = fs.readFileSync(path.join(__dirname, 'src/components/CheckoutModal.jsx'), 'utf8');
assert.ok(
  checkoutModalContent.includes('(Chưa đủ điều kiện)'),
  'CheckoutModal phải nêu rõ (Chưa đủ điều kiện) khi mã không thỏa mãn'
);
console.log('  ✔ CheckoutModal thông báo rõ ràng trạng thái chưa đủ điều kiện');

// 3.4 App.jsx: Bảo vệ ngưỡng voucher hệ thống khỏi cache cũ
const appContent = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf8');
assert.ok(
  appContent.includes("effectiveMinOrderValue < 500000"),
  'App.jsx phải bảo vệ ngưỡng 500k của FREESHIP'
);
assert.ok(
  appContent.includes("effectiveMinOrderValue < 600000"),
  'App.jsx phải bảo vệ ngưỡng 600k của TRIAN10'
);
console.log('  ✔ App.jsx tự động bảo vệ và di trú ngưỡng voucher hệ thống');

// -------------------------------------------------------------
// 4. KIỂM TRA TUYỆT ĐỐI KHÔNG CÓ TỪ KHÓA GSP TRONG CODEBASE
// -------------------------------------------------------------
console.log('\n--- 4. Kiểm tra tiêu chuẩn quy trình: Không chứa từ khóa GSP ---');
function checkDirForKeyword(dirPath, keyword) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        checkDirForKeyword(fullPath, keyword);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.jsx') || entry.name.endsWith('.js'))) {
      const text = fs.readFileSync(fullPath, 'utf8');
      if (text.includes(keyword)) {
        throw new Error(`Phát hiện từ khóa cấm "${keyword}" tại file: ${fullPath}`);
      }
    }
  }
}
checkDirForKeyword(path.join(__dirname, 'src'), 'GSP');
console.log('  ✔ Đã quét toàn bộ thư mục src/: Tuyệt đối 0 từ khóa "GSP"');

console.log('\n================================================================');
console.log(' TẤT CẢ CÁC TEST CASES ĐÃ VƯỢT QUA XUẤT SẮC (100% PASSED)! ');
console.log('================================================================\n');
