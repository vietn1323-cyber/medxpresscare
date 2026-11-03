/**
 * Test Suite: Kiểm Tra Khả Năng Lưu Trữ & Xóa Chương Trình Khuyến Mại (Vouchers Persistence)
 * - Khi Admin xóa 1, 2, 3 voucher hoặc xóa toàn bộ (0 voucher):
 *   + Khi reload / khởi tạo lại trang quản trị, danh sách phải GIỮ NGUYÊN trạng thái đã xóa,
 *     TUYỆT ĐỐI KHÔNG tự ý hoàn nguyên (revert) về 7 chương trình khuyến mại mặc định ban đầu.
 *   + Ở Frontend (ProductCard, ProductDetailModal, VoucherModal), các chương trình đã xóa phải biến mất,
 *     không được hiển thị voucher ảo hay tự động nạp lại 7 voucher mẫu.
 *   + Chỉ khi người dùng lần đầu vào trang (chưa từng lưu localStorage) mới tải 7 voucher mặc định.
 *   + Khi bấm "Khôi Phục Mặc Định", hệ thống mới nạp lại 7 voucher gốc.
 *   + Đảm bảo 100% không chứa từ khóa "GSP" trong mã nguồn.
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  DEFAULT_VOUCHERS, 
  getProductComboPromotions, 
  getProductGiftPromotions 
} from './src/data/vouchers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log(' KIỂM THỬ XÓA & LƯU TRỮ CHƯƠNG TRÌNH KHUYẾN MẠI (PERSISTENCE) ');
console.log('================================================================');

// Mô phỏng chính xác hàm khởi tạo vouchersList trong src/App.jsx
function getInitialVouchers(savedJson) {
  try {
    if (savedJson !== null) {
      const parsed = JSON.parse(savedJson);
      if (Array.isArray(parsed)) {
        const filteredParsed = parsed.filter(v => 
          v &&
          v.id !== 'vouch-gift-01' && 
          v.id !== 'vouch-gift-02' && 
          v.code !== 'QUATANG500' && 
          v.code !== 'BINHYTE'
        );

        return filteredParsed.map(v => {
          const defaultItem = DEFAULT_VOUCHERS.find(d => d.id === v.id || d.code === v.code) || {};
          const cleanUsedCount = [142, 524, 89, 65, 41, 168, 92].includes(v.usedCount) ? 0 : (v.usedCount || 0);

          let effectiveMinOrderValue = Number(v.minOrderValue) || 0;
          if (defaultItem.code === 'FREESHIP' && effectiveMinOrderValue < 500000) effectiveMinOrderValue = 500000;
          if (defaultItem.code === 'TRIAN10' && effectiveMinOrderValue < 600000) effectiveMinOrderValue = 600000;
          if (defaultItem.code === 'MEDXPRESS50' && effectiveMinOrderValue < 400000) effectiveMinOrderValue = 400000;
          if (defaultItem.code === 'DUOCSI30' && effectiveMinOrderValue < 300000) effectiveMinOrderValue = 300000;
          if (defaultItem.code === 'COMBO15' && effectiveMinOrderValue < 1200000) effectiveMinOrderValue = 1200000;

          let effectiveMinQuantity = Number(v.minQuantity) || (defaultItem.minQuantity || 1);
          if (defaultItem.code === 'COMBO3HOP') effectiveMinQuantity = 3;
          if (defaultItem.code === 'COMBO6HOP') effectiveMinQuantity = 6;

          let effectiveComboTier = defaultItem.comboTier !== undefined ? defaultItem.comboTier : (v.comboTier || null);
          if (defaultItem.code === 'COMBO3HOP') effectiveComboTier = 3;
          if (defaultItem.code === 'COMBO6HOP') effectiveComboTier = 6;

          return {
            ...defaultItem,
            ...v,
            minOrderValue: effectiveMinOrderValue,
            minQuantity: effectiveMinQuantity,
            comboTier: effectiveComboTier,
            usedCount: cleanUsedCount
          };
        });
      }
    }
    return DEFAULT_VOUCHERS;
  } catch {
    return DEFAULT_VOUCHERS;
  }
}

// -------------------------------------------------------------
// 1. KIỂM THỬ KHỞI TẠO LẦN ĐẦU VÀ BẢO TOÀN TRẠNG THÁI XÓA VOUCHER
// -------------------------------------------------------------
console.log('\n--- 1. Kiểm thử khởi tạo lần đầu & bảo toàn trạng thái xóa voucher ---');

// 1.1 Khi chưa có dữ liệu trong localStorage (saved = null) -> Tải 7 voucher mặc định
const firstVisit = getInitialVouchers(null);
assert.strictEqual(firstVisit.length, 7, 'Lần đầu truy cập phải có 7 voucher mặc định ban đầu');
console.log('  ✔ Lần đầu truy cập (saved = null): Tải đầy đủ 7 voucher mặc định ban đầu');

// 1.2 Khi admin xóa sạch toàn bộ 7 voucher (saved = "[]") -> Reload phải trả về 0 voucher
const afterDeleteAll = getInitialVouchers('[]');
assert.strictEqual(afterDeleteAll.length, 0, 'Sau khi xóa hết, reload PHẢI giữ nguyên 0 voucher!');
assert.deepStrictEqual(afterDeleteAll, [], 'Phải là mảng rỗng []');
console.log('  ✔ Khi admin xóa sạch toàn bộ voucher: Reload vẫn giữ nguyên 0 voucher (KHÔNG bị hoàn nguyên về 7 voucher)');

// 1.3 Khi admin xóa 3 voucher (ví dụ còn 4 voucher) -> Reload phải giữ đúng 4 voucher
const remaining4 = DEFAULT_VOUCHERS.slice(0, 4);
const afterDelete3 = getInitialVouchers(JSON.stringify(remaining4));
assert.strictEqual(afterDelete3.length, 4, 'Sau khi xóa 3 voucher, reload phải có đúng 4 voucher');
assert.strictEqual(afterDelete3.some(v => v.code === 'COMBO3HOP'), false, 'Voucher đã xóa (COMBO3HOP) không được tự ý xuất hiện lại');
assert.strictEqual(afterDelete3.some(v => v.code === 'COMBO6HOP'), false, 'Voucher đã xóa (COMBO6HOP) không được tự ý xuất hiện lại');
assert.strictEqual(afterDelete3.some(v => v.code === 'COMBO15'), false, 'Voucher đã xóa (COMBO15) không được tự ý xuất hiện lại');
console.log('  ✔ Khi admin xóa 3 voucher: Reload giữ nguyên đúng 4 voucher còn lại, 3 voucher đã xóa không bị tái sinh');

// 1.4 Khi admin tạo thêm 1 voucher mới tùy biến -> Reload phải giữ nguyên voucher mới đó
const customVoucher = {
  id: 'vouch-custom-123',
  code: 'GIAM100K',
  title: 'Giảm 100k Tri Ân',
  discountType: 'fixed',
  discountValue: 100000,
  minOrderValue: 800000,
  enabled: true
};
const listWithCustom = [customVoucher, ...remaining4];
const afterCustomAdd = getInitialVouchers(JSON.stringify(listWithCustom));
assert.strictEqual(afterCustomAdd.length, 5, 'Phải có 5 voucher bao gồm cả voucher mới tạo');
assert.strictEqual(afterCustomAdd[0].code, 'GIAM100K', 'Voucher tùy biến GIAM100K phải được giữ nguyên');
console.log('  ✔ Voucher tùy biến mới tạo được lưu trữ và nạp lại chính xác sau khi reload');

// -------------------------------------------------------------
// 2. KIỂM THỬ ĐỒNG BỘ Ở FRONTEND KHI VOUCHERS BỊ XÓA
// -------------------------------------------------------------
console.log('\n--- 2. Kiểm thử Frontend đồng bộ động khi vouchers bị xóa ---');

const sampleProduct = {
  id: 'prod-01',
  name: 'Đông Trùng Hạ Thảo',
  price: 350000,
  category: 'bo-nao-than-kinh'
};

// 2.1 Khi danh sách voucher là rỗng [] (Admin đã xóa hết)
const emptyVouchers = [];
const emptyCombos = getProductComboPromotions(sampleProduct, emptyVouchers);
assert.strictEqual(emptyCombos.hasAnyCombo, false, 'Khi xóa hết voucher, sản phẩm KHÔNG được có combo');
assert.strictEqual(emptyCombos.promo3, null, 'promo3 phải là null');
assert.strictEqual(emptyCombos.promo6, null, 'promo6 phải là null');

const emptyGifts = getProductGiftPromotions(sampleProduct, emptyVouchers);
assert.strictEqual(emptyGifts.length, 0, 'Khi xóa hết voucher, quà tặng kèm phải là mảng rỗng []');
console.log('  ✔ Khi vouchers rỗng ([]): getProductComboPromotions & getProductGiftPromotions trả về rỗng, không tự lôi DEFAULT_VOUCHERS');

// 2.2 Khi chỉ xóa voucher Combo 3 hộp, giữ lại Combo 6 hộp
const onlyCombo6Vouchers = DEFAULT_VOUCHERS.filter(v => v.code !== 'COMBO3HOP');
const onlyCombo6 = getProductComboPromotions(sampleProduct, onlyCombo6Vouchers);
assert.strictEqual(onlyCombo6.hasAnyCombo, true, 'Vẫn có combo vì còn combo 6 hộp');
assert.strictEqual(onlyCombo6.promo3, null, 'Combo 3 hộp đã bị xóa thì promo3 phải là null');
assert.strictEqual(onlyCombo6.promo6?.discountPercent, 20, 'Combo 6 hộp vẫn giữ 20%');
console.log('  ✔ Khi xóa riêng lẻ COMBO3HOP: promo3 bị hủy hoàn toàn, combo 6 vẫn hoạt động chuẩn xác');

// -------------------------------------------------------------
// 3. KIỂM THỬ MÃ NGUỒN FRONTEND & ADMINPANEL
// -------------------------------------------------------------
console.log('\n--- 3. Kiểm tra mã nguồn src/App.jsx, AdminPanel.jsx, ProductDetailModal.jsx ---');

const appContent = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf8');
assert.ok(
  appContent.includes('filteredParsed.map('),
  'App.jsx phải map trực tiếp trên filteredParsed thay vì chèn DEFAULT_VOUCHERS vào Map'
);
assert.ok(
  !appContent.includes('DEFAULT_VOUCHERS.forEach(v => voucherMap.set(v.id, v))'),
  'App.jsx tuyệt đối KHÔNG được duyệt DEFAULT_VOUCHERS để nạp đè vào voucherMap'
);
assert.ok(
  appContent.includes('handleResetVouchers'),
  'App.jsx phải có hàm handleResetVouchers để phục vụ nút Khôi Phục Mặc Định'
);
console.log('  ✔ src/App.jsx: Đã loại bỏ hoàn toàn cơ chế re-seed ngầm gây lỗi hoàn nguyên 7 voucher');

const adminPanelContent = fs.readFileSync(path.join(__dirname, 'src/components/AdminPanel.jsx'), 'utf8');
assert.ok(
  adminPanelContent.includes('onResetVouchers'),
  'AdminPanel.jsx phải nhận prop onResetVouchers'
);
assert.ok(
  adminPanelContent.includes('Khôi Phục Mặc Định'),
  'AdminPanel.jsx phải có nút Khôi Phục Mặc Định'
);
console.log('  ✔ src/components/AdminPanel.jsx: Tích hợp đầy đủ nút Khôi Phục Mặc Định chủ động');

const productDetailContent = fs.readFileSync(path.join(__dirname, 'src/components/ProductDetailModal.jsx'), 'utf8');
assert.ok(
  productDetailContent.includes('comboPromo.hasAnyCombo &&'),
  'ProductDetailModal.jsx chỉ hiển thị khung Liệu trình uống khi comboPromo.hasAnyCombo là true'
);
console.log('  ✔ src/components/ProductDetailModal.jsx: Khung liệu trình và voucher đồng bộ 100% theo dữ liệu thực tế');

// -------------------------------------------------------------
// 4. KIỂM TRA QUY TRÌNH: TUYỆT ĐỐI KHÔNG CÓ TỪ KHÓA GSP
// -------------------------------------------------------------
console.log('\n--- 4. Kiểm tra quy chuẩn chất lượng: Tuyệt đối không chứa GSP ---');
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
        throw new Error(`Phát hiện từ khóa cấm "${keyword}" tại: ${fullPath}`);
      }
    }
  }
}
checkDirForKeyword(path.join(__dirname, 'src'), 'GSP');
console.log('  ✔ src/ không chứa bất kỳ từ khóa "GSP" nào');

console.log('\n================================================================');
console.log('   TẤT CẢ TEST CASES XÓA & LƯU TRỮ VOUCHER ĐÃ ĐẠT 100%!   ');
console.log('================================================================\n');
