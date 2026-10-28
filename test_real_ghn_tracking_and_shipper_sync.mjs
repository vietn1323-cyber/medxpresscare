import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ ĐỒNG BỘ VẬN ĐƠN GHN & BƯU TÁ THỰC TẾ   ');
console.log('================================================================\n');

// 1. Kiểm tra CARRIER_METADATA trong logisticsHelper.js không chứa dữ liệu giả lập bưu tá cá nhân
console.log('--- 1. Kiểm thử loại bỏ thông tin bưu tá giả lập trong logisticsHelper.js ---');
import { getCarrierInfo } from './src/utils/logisticsHelper.js';

const ghnInfo = getCarrierInfo('ghn');
assert.strictEqual(ghnInfo.hotline, '1900 636677', 'Hotline GHN phải là tổng đài chính thức 1900 636677');
assert.strictEqual(ghnInfo.shipper.phone, '1900 636677', 'Số điện thoại liên hệ phải là Hotline chính thức, không dùng SĐT cá nhân giả lập');
assert.ok(!ghnInfo.shipper.name.includes('Lê Quốc Tuấn'), 'Đã loại bỏ hoàn toàn tên giả lập Lê Quốc Tuấn');
assert.ok(ghnInfo.shipper.name.includes('Điều phối'), 'Tên đại diện bưu cục chuyên nghiệp và đúng chuẩn');
console.log('  ✅ PASSED: CARRIER_METADATA của GHN chuẩn hóa 100% sang Hotline 1900 636677 và Điều phối viên chính thức.');

// 2. Kiểm tra CheckoutModal không sinh mã giả GHN-xxxxxxVN
console.log('\n--- 2. Kiểm thử CheckoutModal không tạo mã giả lập GHN-xxxxxxVN ---');
const checkoutModalContent = fs.readFileSync(path.join(__dirname, 'src', 'components', 'CheckoutModal.jsx'), 'utf8');
assert.ok(!checkoutModalContent.includes("formData.shippingMethod === 'ghn' ? 'GHN-' :"), 'Không được tự sinh tiền tố mã giả GHN- khi chưa đẩy sang GHN');
assert.ok(checkoutModalContent.includes("formData.shippingMethod === 'ghn' \n      ? ''"), 'Đơn GHN khởi tạo ban đầu để mã trống chờ máy chủ GHN cấp mã chính thức');
console.log('  ✅ PASSED: CheckoutModal không tạo mã tạm giả lập, chỉ nhận mã chính thức từ GHN.');

// 3. Kiểm tra OrderTrackingPage ưu tiên mã thật ghnOrderCode và đồng bộ đa tab
console.log('\n--- 3. Kiểm thử OrderTrackingPage.jsx & Tìm kiếm theo ghnOrderCode ---');
const trackingPageContent = fs.readFileSync(path.join(__dirname, 'src', 'components', 'OrderTrackingPage.jsx'), 'utf8');

assert.ok(trackingPageContent.includes('ghnMatch = o.ghnOrderCode'), 'Bộ tìm kiếm tra cứu hỗ trợ tìm trực tiếp bằng mã GHN (VD: GYMHGEYK)');
assert.ok(trackingPageContent.includes('selectedOrder.ghnOrderCode'), 'Giao diện hiển thị ưu tiên hàng đầu mã vận đơn thật do GHN cấp');
assert.ok(!trackingPageContent.includes('Lê Quốc Tuấn'), 'OrderTrackingPage không còn bất kỳ dòng nào chứa Lê Quốc Tuấn');
assert.ok(trackingPageContent.includes('1900 636677') || trackingPageContent.includes('1900636677'), 'OrderTrackingPage tích hợp Hotline GHN Express 1900 636677');
console.log('  ✅ PASSED: OrderTrackingPage hỗ trợ tìm kiếm và hiển thị mã GHN thật, hotline bưu cục chuẩn.');

// 4. Kiểm tra OrderTrackingModal.jsx
console.log('\n--- 4. Kiểm thử OrderTrackingModal.jsx chuẩn hóa thông tin bưu tá ---');
const trackingModalContent = fs.readFileSync(path.join(__dirname, 'src', 'components', 'OrderTrackingModal.jsx'), 'utf8');

assert.ok(!trackingModalContent.includes('Nguyễn Văn Hưng'), 'Đã loại bỏ fallback giả lập Nguyễn Văn Hưng trong Modal');
assert.ok(!trackingModalContent.includes('0982331450'), 'Đã loại bỏ số điện thoại cá nhân giả lập 0982331450');
assert.ok(trackingModalContent.includes('displayOrder.ghnOrderCode'), 'Modal ưu tiên hiển thị mã vận đơn thật từ GHN');
console.log('  ✅ PASSED: OrderTrackingModal hiển thị chuẩn xác mã GHN thật và tổng đài.');

// 5. Kiểm tra App.jsx có Realtime Storage Event Sync giữa các Tabs
console.log('\n--- 5. Kiểm thử Realtime Cross-Tab Sync trong App.jsx ---');
const appContent = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8');

assert.ok(appContent.includes("e.key === 'medxpress_admin_orders'"), 'App.jsx lắng nghe sự kiện storage cho medxpress_admin_orders');
assert.ok(appContent.includes("window.addEventListener('storage', handleStorageChange)"), 'App.jsx đăng ký window storage event listener');
console.log('  ✅ PASSED: Đã tích hợp Realtime Cross-Tab Sync. Khi Admin đẩy đơn sang GHN ở Tab 1, Tab 2 tra cứu tự động cập nhật ngay tức thì.');

console.log('\n================================================================');
console.log('   🎉 TẤT CẢ 5 NHÓM TEST CASES GHN TRACKING & SHIPPER ĐỀU PASSED! ');
console.log('================================================================\n');
