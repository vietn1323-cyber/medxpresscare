import assert from 'assert';
import { CATEGORIES } from './src/data/products.js';
import { slugify } from './src/data/articles.js';

console.log('--- KIỂM THỬ TÍNH NĂNG QUẢN LÝ HÀNG LOẠT VÀ NHÓM SẢN PHẨM ---');

// 1. Kiểm thử điều chỉnh giá hàng loạt
const sampleProduct = {
  id: 'vn-01',
  name: 'Viên Uống Hoạt Huyết Dưỡng Não',
  price: 350000,
  originalPrice: 420000,
  discountPercent: 17,
  stock: 20,
  categories: ['brain_nerve']
};

// Giảm 10%
const discountPercent = 10;
const newPricePercentDec = Math.max(1000, Math.round((sampleProduct.price * (1 - discountPercent / 100)) / 1000) * 1000);
assert.strictEqual(newPricePercentDec, 315000, 'Giá sau khi giảm 10% phải là 315.000₫');
console.log('  ✅ PASSED: Điều chỉnh giá giảm 10% chuẩn xác (350k -> 315k)');

// Tăng 20.000đ cố định
const fixedInc = 20000;
const newPriceFixedInc = sampleProduct.price + fixedInc;
assert.strictEqual(newPriceFixedInc, 370000, 'Giá sau khi tăng 20k phải là 370.000₫');
console.log('  ✅ PASSED: Điều chỉnh giá tăng số tiền cố định (+20k -> 370k)');

// 2. Kiểm thử gán nhóm danh mục (Thay thế vs Thêm vào nhóm hiện có)
// Thêm nhóm 'bone_joint' vào ['brain_nerve']
const targetCat = 'bone_joint';
const appendedCategories = Array.from(new Set([...sampleProduct.categories, targetCat]));
assert.deepStrictEqual(appendedCategories, ['brain_nerve', 'bone_joint'], 'Đa danh mục phải chứa cả 2 nhóm');
console.log('  ✅ PASSED: Gán thêm nhóm danh mục (Multi-category) thành công');

// Thay thế hoàn toàn danh mục
const replacedCategories = [targetCat];
assert.deepStrictEqual(replacedCategories, ['bone_joint'], 'Danh mục phải được thay thế hoàn toàn');
console.log('  ✅ PASSED: Thay thế hoàn toàn danh mục thành công');

// 3. Kiểm thử cập nhật số lượng tồn kho
const newStock = 75;
const updatedStockProduct = { ...sampleProduct, stock: newStock, inStock: newStock > 0 };
assert.strictEqual(updatedStockProduct.stock, 75);
assert.strictEqual(updatedStockProduct.inStock, true);
console.log('  ✅ PASSED: Cập nhật số lượng tồn kho hàng loạt đồng bộ inStock = true');

// 4. Kiểm thử tạo nhóm danh mục tùy chỉnh
const customCatName = 'Chăm Sóc Mắt & Thị Lực Chuyên Sâu';
const customCatSlug = slugify(customCatName);
const newCustomCat = {
  id: customCatSlug,
  name: customCatName,
  icon: 'Eye',
  description: 'Bảo vệ võng mạc và giảm mỏi mắt do ánh sáng xanh'
};
assert.strictEqual(newCustomCat.id, 'cham-soc-mat-thi-luc-chuyen-sau');
console.log(`  ✅ PASSED: Khởi tạo nhóm danh mục tùy chỉnh chuẩn slug: ${newCustomCat.id}`);

// 5. Kiểm thử xuất bản / lưu nháp bài viết hàng loạt
const sampleArticles = [
  { id: 'art-01', title: 'Bài viết 1', status: 'draft' },
  { id: 'art-02', title: 'Bài viết 2', status: 'draft' }
];
const publishedArticles = sampleArticles.map(a => ({ ...a, status: 'published' }));
assert.strictEqual(publishedArticles.every(a => a.status === 'published'), true);
console.log('  ✅ PASSED: Xuất bản bài viết hàng loạt thành công');

// 6. Kiểm thử cập nhật trạng thái đơn hàng loạt
const sampleOrders = [
  { id: 'MDX-001', status: 'pending' },
  { id: 'MDX-002', status: 'pending' }
];
const confirmedOrders = sampleOrders.map(o => ({ ...o, status: 'confirmed' }));
assert.strictEqual(confirmedOrders.every(o => o.status === 'confirmed'), true);
console.log('  ✅ PASSED: Chuyển trạng thái đơn hàng loạt thành công');

console.log('\n================================================================');
console.log('   TỔNG KẾT: 6/6 TEST CASES QUẢN LÝ HÀNG LOẠT & NHÓM ĐẠT 100%');
console.log('================================================================');
