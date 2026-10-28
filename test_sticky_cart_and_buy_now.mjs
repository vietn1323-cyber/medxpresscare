// Test Suite: Kiểm Tra Sticky Cart & Nút Mua Ngay Trên Trang Chi Tiết Sản Phẩm
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ STICKY CART & NÚT MUA NGAY          ');
console.log('================================================================\n');

// 1. Kiểm tra component StickyCart.jsx
console.log('--- 1. Kiểm tra component StickyCart.jsx ---');
const stickyCartPath = path.join(__dirname, 'src', 'components', 'StickyCart.jsx');
assert.ok(fs.existsSync(stickyCartPath), 'File StickyCart.jsx phải tồn tại');

const stickyCartContent = fs.readFileSync(stickyCartPath, 'utf8');
assert.ok(stickyCartContent.includes('export const StickyCart'), 'StickyCart.jsx phải export component StickyCart');
assert.ok(stickyCartContent.includes('cartItems.length === 0'), 'StickyCart tự động ẩn khi giỏ hàng rỗng');
assert.ok(stickyCartContent.includes('hidden'), 'StickyCart hỗ trợ prop hidden để ẩn khi mở modal/admin');
assert.ok(stickyCartContent.includes('totalQuantity'), 'StickyCart tính toán tổng số lượng sản phẩm');
assert.ok(stickyCartContent.includes('subtotal'), 'StickyCart tính toán tổng giá tiền tạm tính');
assert.ok(stickyCartContent.includes('isFreeShip'), 'StickyCart kiểm tra và hiển thị trạng thái Freeship');
assert.ok(stickyCartContent.includes('onOpenCart'), 'StickyCart có nút mở giỏ hàng');
assert.ok(stickyCartContent.includes('onProceedCheckout'), 'StickyCart có nút Thanh Toán Ngay 1-chạm');
assert.ok(stickyCartContent.includes('Thanh Toán Ngay'), 'Nút Thanh Toán Ngay hiển thị rõ ràng trên giao diện');
assert.ok(stickyCartContent.includes('isMinimized'), 'StickyCart hỗ trợ thu nhỏ và mở rộng linh hoạt');

console.log('  ✅ PASSED: Component StickyCart.jsx được xây dựng hoàn thiện, tối ưu trải nghiệm thanh toán.');

// 2. Kiểm tra tích hợp StickyCart vào App.jsx
console.log('\n--- 2. Kiểm tra tích hợp StickyCart vào App.jsx ---');
const appPath = path.join(__dirname, 'src', 'App.jsx');
const appContent = fs.readFileSync(appPath, 'utf8');

assert.ok(appContent.includes("import { StickyCart } from './components/StickyCart'"), 'App.jsx phải import StickyCart');
assert.ok(appContent.includes('<StickyCart'), 'App.jsx phải render component StickyCart');
assert.ok(appContent.includes('cartItems={cart}'), 'App.jsx truyền cart vào StickyCart');
assert.ok(appContent.includes('onOpenCart={() => setIsCartOpen(true)}'), 'App.jsx truyền hàm mở giỏ hàng');
assert.ok(appContent.includes('onProceedCheckout={() => setIsCheckoutOpen(true)}'), 'App.jsx truyền hàm thanh toán ngay');
assert.ok(appContent.includes('hidden={isCartOpen || isCheckoutOpen || currentView === \'admin\'}'), 'App.jsx ẩn StickyCart khi mở modal/admin');

console.log('  ✅ PASSED: App.jsx đã tích hợp trơn tru StickyCart đồng bộ với CartDrawer và CheckoutModal.');

// 3. Kiểm tra nút Mua Ngay trên ProductDetailModal.jsx
console.log('\n--- 3. Kiểm tra nút Mua Ngay trên ProductDetailModal.jsx ---');
const productDetailPath = path.join(__dirname, 'src', 'components', 'ProductDetailModal.jsx');
const productDetailContent = fs.readFileSync(productDetailPath, 'utf8');

assert.ok(productDetailContent.includes('<span>Mua Ngay</span>'), 'Nút mua trên ProductDetailModal.jsx phải là "Mua Ngay"');
assert.ok(!productDetailContent.includes('Mua Ngay Hỏa Tốc'), 'Không còn nhãn "Mua Ngay Hỏa Tốc"');
assert.ok(!productDetailContent.includes('Mua ngay hỏa tốc'), 'Không còn nhãn "Mua ngay hỏa tốc"');
assert.ok(productDetailContent.includes('handleBuyNowWithCombo'), 'Nút Mua Ngay vẫn kích hoạt đúng logic mua ngay');

console.log('  ✅ PASSED: Trang chi tiết sản phẩm đã cập nhật chuẩn xác nút "Mua Ngay"!');

console.log('\n================================================================');
console.log('   🎉 TẤT CẢ TEST CASES STICKY CART & MUA NGAY ĐỀU PASSED 100%! ');
console.log('================================================================\n');
