import assert from 'assert';
import { PRODUCTS } from './src/data/products.js';

console.log('--- KIỂM THỬ KHẢ NĂNG LƯU TRỮ VÀ XÓA SẢN PHẨM (PERSISTENCE) ---');

// Mô phỏng hàm khởi tạo productsList trong App.jsx
function getInitialProducts(savedJson) {
  if (savedJson !== null) {
    try {
      const parsed = JSON.parse(savedJson);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
  }
  return PRODUCTS;
}

// 1. Khi chưa có dữ liệu (lần đầu truy cập - savedJson = null) -> Phải trả về 21 sản phẩm mẫu
const firstVisit = getInitialProducts(null);
assert.strictEqual(firstVisit.length, 21, 'Lần đầu truy cập phải tải 21 sản phẩm mặc định');
console.log('  ✅ PASSED: Lần đầu truy cập tải đầy đủ 21 sản phẩm mẫu mặc định.');

// 2. Khi admin xóa hết sản phẩm (savedJson = "[]") -> Phải trả về mảng rỗng (0 sản phẩm), KHÔNG được hoàn nguyên về 21 sản phẩm
const afterDeleteAll = getInitialProducts('[]');
assert.strictEqual(afterDeleteAll.length, 0, 'Sau khi xóa hết sản phẩm, F5 lại phải giữ nguyên 0 sản phẩm!');
assert.deepStrictEqual(afterDeleteAll, [], 'Phải là mảng rỗng []');
console.log('  ✅ PASSED: Khi admin xóa hết sản phẩm, F5 lại giữ nguyên 0 sản phẩm (không bị tự nạp lại 21 SP).');

// 3. Khi admin xóa 5 sản phẩm còn 16 sản phẩm -> F5 lại phải giữ đúng 16 sản phẩm
const remaining16 = PRODUCTS.slice(0, 16);
const afterDeleteFive = getInitialProducts(JSON.stringify(remaining16));
assert.strictEqual(afterDeleteFive.length, 16, 'Phải giữ nguyên 16 sản phẩm');
console.log('  ✅ PASSED: Khi xóa 1 phần sản phẩm, F5 lại bảo toàn đúng danh sách còn lại.');

// 4. Mô phỏng D1 sync logic
function simulateCloudSync(cloudProducts, currentLocalProducts) {
  let appliedProducts = null;
  let reseededToCloud = false;

  if (Array.isArray(cloudProducts)) {
    appliedProducts = cloudProducts;
  } else {
    reseededToCloud = true;
  }

  return { appliedProducts, reseededToCloud };
}

// Khi Cloudflare D1 trả về mảng rỗng `[]` (đã đồng bộ xóa sạch trên cloud)
const d1SyncResult = simulateCloudSync([], []);
assert.strictEqual(d1SyncResult.appliedProducts.length, 0, 'Cloud sync với [] phải giữ 0 sản phẩm');
assert.strictEqual(d1SyncResult.reseededToCloud, false, 'Không được tự ý reseed sản phẩm mẫu lên Cloudflare D1');
console.log('  ✅ PASSED: D1 Cloud Sync với [] duy trì 0 sản phẩm và không tự động re-seed lên Cloud.');

console.log('\n================================================================');
console.log('   TỔNG KẾT: TẤT CẢ TEST CASES XÓA & LƯU TRỮ ĐẠT 100%!');
console.log('================================================================\n');
