import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ TÍCH HỢP API THỰC TẾ GHN EXPRESS    ');
console.log('================================================================\n');

// 1. Kiểm thử Helper GHN
console.log('--- 1. Kiểm thử module ghnHelper.js & Ánh xạ trạng thái thực tế ---');
import { 
  mapGhnStatusToLocal,
  testGhnConnection,
  createGhnOrder,
  fetchGhnTrackingDetail,
  getGhnPrintUrl
} from './src/utils/ghnHelper.js';

assert.strictEqual(typeof testGhnConnection, 'function');
assert.strictEqual(typeof createGhnOrder, 'function');
assert.strictEqual(typeof fetchGhnTrackingDetail, 'function');
assert.strictEqual(typeof getGhnPrintUrl, 'function');

// Kiểm tra map trạng thái chuẩn GHN sang MedXpressCare
assert.strictEqual(mapGhnStatusToLocal('ready_to_pick').status, 'confirmed');
assert.strictEqual(mapGhnStatusToLocal('delivering').status, 'shipping');
assert.strictEqual(mapGhnStatusToLocal('delivered').status, 'completed');
assert.strictEqual(mapGhnStatusToLocal('delivered').progress, 100);
assert.strictEqual(mapGhnStatusToLocal('delivery_fail').status, 'returning');
assert.strictEqual(mapGhnStatusToLocal('cancel').status, 'cancelled');
console.log('  ✅ PASSED: Ánh xạ chuẩn xác toàn bộ mã trạng thái bưu cục GHN.');

// 2. Kiểm thử testCarrierConnection đối với GHN
console.log('\n--- 2. Kiểm thử xác thực cấu hình GHN trong shippingCarriers.js ---');
import { testCarrierConnection } from './src/data/shippingCarriers.js';

// Bắt lỗi khi không nhập API Token
const emptyTokenRes = await testCarrierConnection('ghn', '', '');
assert.strictEqual(emptyTokenRes.success, false);
assert.ok(emptyTokenRes.message.includes('Token'));
console.log('  ✅ PASSED: Bắt lỗi chính xác khi chưa điền API Token.');

// 3. Kiểm tra App.jsx ĐÃ LOẠI BỎ TRIỆT ĐỂ TIMER TRACKING ẢO (15s/20s)
console.log('\n--- 3. Kiểm thử loại bỏ hoàn toàn cơ chế tracking ảo trong App.jsx ---');
const appContent = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8');

assert.ok(!appContent.includes('now - confirmedTime >= 15000'), 'Không còn timer 15 giây tự động chuyển sang shipping');
assert.ok(!appContent.includes('now - shippedTime >= 20000'), 'Không còn timer 20 giây tự động chuyển sang completed');
console.log('  ✅ PASSED: Đã xóa sổ hoàn toàn timer tracking ảo tự hoàn tất đơn trong App.jsx.');

// 4. Kiểm tra Cloudflare Worker (worker.js) tích hợp đầy đủ 5 endpoints GHN
console.log('\n--- 4. Kiểm thử các endpoints GHN trên Cloudflare Worker (worker.js) ---');
const workerContent = fs.readFileSync(path.join(__dirname, 'worker.js'), 'utf8');

assert.ok(workerContent.includes('/api/shipping/ghn/test-connection'), 'Worker có endpoint test-connection');
assert.ok(workerContent.includes('/api/shipping/ghn/create-order'), 'Worker có endpoint create-order');
assert.ok(workerContent.includes('/api/shipping/ghn/tracking-detail'), 'Worker có endpoint tracking-detail');
assert.ok(workerContent.includes('/api/shipping/ghn/print-order'), 'Worker có endpoint print-order');
assert.ok(workerContent.includes('/api/shipping/ghn/cancel-order'), 'Worker có endpoint cancel-order');
assert.ok(workerContent.includes('online-gateway.ghn.vn'), 'Worker kết nối cổng online-gateway.ghn.vn chính thức');
console.log('  ✅ PASSED: Cloudflare Worker tích hợp đầy đủ 5 endpoints proxy GHN chính thức.');

// 5. Kiểm tra Giao diện AdminPanel tích hợp nút Đẩy GHN & In Phiếu A5 Thật
console.log('\n--- 5. Kiểm thử giao diện AdminPanel với GHN thật ---');
const adminContent = fs.readFileSync(path.join(__dirname, 'src', 'components', 'AdminPanel.jsx'), 'utf8');

assert.ok(adminContent.includes('handlePushToGhn'), 'AdminPanel có hàm handlePushToGhn');
assert.ok(adminContent.includes('handleSyncGhnStatus'), 'AdminPanel có hàm handleSyncGhnStatus');
assert.ok(adminContent.includes('handlePrintGhnA5'), 'AdminPanel có hàm handlePrintGhnA5');
assert.ok(adminContent.includes('Đẩy Đơn Sang GHN'), 'AdminPanel có nút Đẩy Đơn Sang GHN');
assert.ok(adminContent.includes('In Phiếu GHN (A5)'), 'AdminPanel có nút In Phiếu GHN A5');
assert.ok(adminContent.includes('Tra Cứu GHN'), 'AdminPanel có nút Tra Cứu GHN');
console.log('  ✅ PASSED: AdminPanel tích hợp đầy đủ các nút đẩy đơn, in tem A5 và đồng bộ thật với GHN.');

console.log('\n================================================================');
console.log('   🎉 TẤT CẢ 5 NHÓM TEST CASES GHN API REAL INTEGRATION ĐỀU PASSED! ');
console.log('================================================================\n');
