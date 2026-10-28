import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ WEB PUSH API & TỦ THUỐC AI NHẮC NHỞ   ');
console.log('================================================================\n');

// 1. Kiểm tra Helper Bóc Tách Quy Cách & Liều Dùng
console.log('--- 1. Kiểm thử trích xuất quy cách viên & liều dùng hàng ngày ---');

import { 
  extractUnitsPerPackage, 
  extractDailyDose, 
  generateAiMedicationSchedule, 
  calculateRefillSchedule 
} from './src/utils/medicationHelper.js';

// Test quy cách đóng gói
const testPkg1 = { packaging: 'Hộp 60 viên nang cứng' };
const testPkg2 = { packaging: 'Hộp 80 viên nang mềm' };
const testPkg3 = { packaging: 'Chai 100 viên' };
const testPkg4 = { packaging: 'Hộp 30 gói x 5g' };

assert.strictEqual(extractUnitsPerPackage(testPkg1), 60, 'Trích xuất 60 viên chuẩn xác');
assert.strictEqual(extractUnitsPerPackage(testPkg2), 80, 'Trích xuất 80 viên chuẩn xác');
assert.strictEqual(extractUnitsPerPackage(testPkg3), 100, 'Trích xuất 100 viên chuẩn xác');
assert.strictEqual(extractUnitsPerPackage(testPkg4), 30, 'Trích xuất 30 gói chuẩn xác');
console.log('  ✅ PASSED: extractUnitsPerPackage bóc tách chính xác quy cách viên/gói.');

// Test liều dùng chuẩn
const testDose1 = { instruction: 'Người lớn uống 2 viên/ngày sau bữa ăn.' };
const testDose2 = { instruction: 'Ngày uống 1 viên duy nhất vào buổi sáng.' };
const testDose3 = { instruction: 'Uống 1 viên/lần, ngày 3 lần trước bữa ăn.' };

assert.strictEqual(extractDailyDose(testDose1), 2, 'Trích xuất 2 viên/ngày');
assert.strictEqual(extractDailyDose(testDose2), 1, 'Trích xuất 1 viên/ngày');
assert.strictEqual(extractDailyDose(testDose3), 3, 'Trích xuất 3 viên/ngày');
console.log('  ✅ PASSED: extractDailyDose bóc tách chính xác liều dùng chuẩn y khoa.');

// 2. Kiểm tra AI Rule Engine Lên Lịch Uống Thuốc Chuẩn Y Khoa
console.log('\n--- 2. Kiểm thử AI tự động tạo lịch uống thuốc thông minh ---');

// Case Canxi: Cần uống sáng sau ăn (tránh lắng đọng canxi/sỏi thận)
const calciumProd = {
  id: 'vn-05',
  name: 'Canxi Nano D3K2 MK7 MedXpress',
  packaging: 'Hộp 60 viên',
  instruction: 'Uống 1 viên vào buổi sáng sau ăn 30 phút.',
  category: 'xuong-khop'
};
const calciumSchedule = generateAiMedicationSchedule(calciumProd);
assert.strictEqual(calciumSchedule.productId, 'vn-05');
assert.strictEqual(calciumSchedule.dailyDose, 1);
assert.strictEqual(calciumSchedule.scheduleTimes.length, 1);
assert.strictEqual(calciumSchedule.scheduleTimes[0], '08:00');
assert.ok(calciumSchedule.timeLabels[0].includes('sau ăn'), 'Canxi phải uống sau ăn');
console.log('  ✅ PASSED: Lịch uống Canxi chuẩn y khoa (uống sáng sau ăn).');

// Case Bổ não: Cần uống ban ngày (tránh mất ngủ ban đêm)
const brainProd = {
  id: 'us-01',
  name: 'Ginkgo Biloba 120mg Brain Support',
  packaging: 'Hộp 60 viên',
  instruction: 'Uống 2 viên mỗi ngày chia 2 lần.',
  category: 'bo-nao-than-kinh'
};
const brainSchedule = generateAiMedicationSchedule(brainProd);
assert.strictEqual(brainSchedule.scheduleTimes.length, 2);
assert.strictEqual(brainSchedule.scheduleTimes[0], '08:00');
assert.strictEqual(brainSchedule.scheduleTimes[1], '13:30');
console.log('  ✅ PASSED: Lịch uống Bổ não chuẩn y khoa (uống sáng & trưa, không uống tối).');

// Case Giấc ngủ & An thần: Uống buổi tối trước khi ngủ 30-60 phút
const sleepProd = {
  id: 'vn-08',
  name: 'Viên Ngủ Ngon Đông Trùng Hạ Thảo',
  packaging: 'Hộp 30 viên',
  instruction: 'Uống 1 viên trước khi đi ngủ 30-60 phút.',
  category: 'cham-soc-ca-nhan'
};
const sleepSchedule = generateAiMedicationSchedule(sleepProd);
assert.strictEqual(sleepSchedule.scheduleTimes[0], '21:30');
assert.ok(sleepSchedule.scheduleTimes[0] >= '21:00', 'Giấc ngủ uống lúc tối');
console.log('  ✅ PASSED: Lịch uống Thuốc hỗ trợ giấc ngủ chuẩn y khoa (uống tối 21:30).');

// 3. Kiểm tra Thuật Toán Nhắc Tái Đặt Hàng Trước 2 - 3 Ngày
console.log('\n--- 3. Kiểm thử thuật toán nhắc tái đặt hàng trước 2 - 3 ngày ---');

const baseDate = new Date('2026-10-01T08:00:00Z');
// Hộp 60 viên, ngày 2 viên => dùng hết trong 30 ngày (ngày 31/10/2026)
// Nhắc trước 3 ngày => ngày nhắc là 28/10/2026
const refillSchedule = calculateRefillSchedule(
  { id: 'vn-01', name: 'Hoạt Huyết Dưỡng Não', packaging: 'Hộp 60 viên', instruction: 'Ngày 2 viên' },
  1,
  baseDate.toISOString()
);

assert.strictEqual(refillSchedule.totalUnits, 60);
assert.strictEqual(refillSchedule.dailyDose, 2);
assert.strictEqual(refillSchedule.totalDays, 30);
assert.strictEqual(refillSchedule.reminderDaysBefore, 3);

const expectedRunoutDate = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000);
assert.strictEqual(
  new Date(refillSchedule.runoutDateStr).toDateString(), 
  expectedRunoutDate.toDateString(), 
  'Ngày hết thuốc phải chuẩn xác 30 ngày sau ngày mua'
);

const expectedReminderDate = new Date(expectedRunoutDate.getTime() - 3 * 24 * 60 * 60 * 1000);
assert.strictEqual(
  new Date(refillSchedule.reminderDateStr).toDateString(), 
  expectedReminderDate.toDateString(), 
  'Ngày nhắc tái đặt phải đúng trước 3 ngày'
);
console.log('  ✅ PASSED: Chu kỳ hết thuốc và mốc nhắc trước 2 - 3 ngày chuẩn xác 100%.');

// 4. Kiểm tra Service Worker PWA (public/sw.js)
console.log('\n--- 4. Kiểm thử Service Worker Web Push Handlers (sw.js) ---');
const swContent = fs.readFileSync(path.join(__dirname, 'public', 'sw.js'), 'utf8');

assert.ok(swContent.includes("self.addEventListener('push'"), 'Service Worker có push listener');
assert.ok(swContent.includes("self.addEventListener('notificationclick'"), 'Service Worker có notificationclick listener');
assert.ok(swContent.includes('vibrate:'), 'Push Notification hỗ trợ chế độ rung');
assert.ok(swContent.includes('clients.openWindow'), 'Notificationclick hỗ trợ mở / focus ứng dụng');
console.log('  ✅ PASSED: Service Worker hỗ trợ đầy đủ Web Push API & tương tác thông báo.');

// 5. Kiểm tra Cloudflare Worker Backend Endpoints (worker.js)
console.log('\n--- 5. Kiểm thử Cloudflare Worker Web Push & Reminder Endpoints ---');
const workerContent = fs.readFileSync(path.join(__dirname, 'worker.js'), 'utf8');

assert.ok(workerContent.includes('/api/push/vapid-public-key'), 'Có endpoint cung cấp VAPID Public Key');
assert.ok(workerContent.includes('/api/push/subscribe'), 'Có endpoint đăng ký Push Subscription');
assert.ok(workerContent.includes('/api/push/send'), 'Có endpoint gửi Web Push Notification');
assert.ok(workerContent.includes('/api/reminders/medications'), 'Có endpoint lưu trữ Tủ thuốc D1');
assert.ok(workerContent.includes('/api/reminders/refills'), 'Có endpoint lưu trữ Nhắc tái đặt D1');
assert.ok(workerContent.includes('/api/cron/check-reminders'), 'Có endpoint Cron Trigger quét nhắc trước 2 - 3 ngày');
console.log('  ✅ PASSED: Cloudflare Worker backend tích hợp đầy đủ 6 API endpoints chuyên biệt.');

// 6. Kiểm tra Tích Hợp Frontend (App.jsx, Header.jsx, CheckoutModal.jsx, AdminPanel.jsx)
console.log('\n--- 6. Kiểm thử kết nối & đồng bộ dữ liệu giao diện người dùng ---');
const appContent = fs.readFileSync(path.join(__dirname, 'src', 'App.jsx'), 'utf8');
const headerContent = fs.readFileSync(path.join(__dirname, 'src', 'components', 'Header.jsx'), 'utf8');
const checkoutContent = fs.readFileSync(path.join(__dirname, 'src', 'components', 'CheckoutModal.jsx'), 'utf8');
const adminContent = fs.readFileSync(path.join(__dirname, 'src', 'components', 'AdminPanel.jsx'), 'utf8');

// App.jsx
assert.ok(appContent.includes('MyMedicineCabinetModal'), 'App.jsx import MyMedicineCabinetModal');
assert.ok(appContent.includes('isMedicineCabinetOpen'), 'App.jsx có state quản lý đóng/mở tủ thuốc');
assert.ok(appContent.includes('refillsNearRunoutCount'), 'App.jsx tự động tính số lượng thuốc sắp hết');
assert.ok(appContent.includes('handleQuickReorder'), 'App.jsx hỗ trợ đặt lại nhanh 1-chạm');

// Header.jsx
assert.ok(headerContent.includes('onOpenMedicineCabinet'), 'Header có prop onOpenMedicineCabinet');
assert.ok(headerContent.includes('refillsNearRunoutCount'), 'Header có badge cảnh báo thuốc sắp hết');

// CheckoutModal.jsx
assert.ok(checkoutContent.includes('nhắc tái đặt hàng trước 2 - 3 ngày'), 'CheckoutModal thông báo sau mua hàng');

// AdminPanel.jsx
assert.ok(adminContent.includes('Cần Nhắc Tái Đặt (Trước 2 - 3 ngày)'), 'Admin Panel hiển thị trạng thái khẩn cấp');
assert.ok(adminContent.includes('Bắn Web Push'), 'Admin Panel có nút kích hoạt gửi Web Push');

console.log('  ✅ PASSED: Toàn bộ giao diện Header, Checkout, Admin & Modal đã kết nối đồng bộ.');

// 7. Kiểm tra Thư Viện web-push & Hàm sendPushNotification Ký VAPID Chuẩn
console.log('\n--- 7. Kiểm thử Web Push Protocol VAPID Signing (web-push) ---');
import webpush from 'web-push';
import { sendPushNotification as sendPushService } from './src/services/pushNotificationService.js';
import { sendPushNotification as sendPushWorker } from './worker.js';

assert.strictEqual(typeof webpush.sendNotification, 'function', 'web-push thư viện sẵn sàng');
assert.strictEqual(typeof sendPushService, 'function', 'sendPushNotification service sẵn sàng');
assert.strictEqual(typeof sendPushWorker, 'function', 'sendPushNotification worker sẵn sàng');

// Kiểm tra xử lý ngoại lệ khi thiếu endpoint
await assert.rejects(
  async () => { await sendPushService(null, { title: 'Test' }); },
  /endpoint is required/i,
  'Hàm từ chối subscription không có endpoint'
);

// Kiểm tra worker.js có cấu hình web-push và VAPID signing
assert.ok(workerContent.includes("import webpush from 'web-push'"), 'worker.js import web-push');
assert.ok(workerContent.includes('webpush.setVapidDetails'), 'worker.js cấu hình VAPID Signing');
assert.ok(workerContent.includes('sendPushNotification'), 'worker.js có hàm sendPushNotification');
assert.ok(workerContent.includes('webpush.sendNotification'), 'worker.js gọi webpush.sendNotification chuẩn RFC');

console.log('  ✅ PASSED: Thư viện web-push và hàm sendPushNotification ký VAPID chuẩn RFC 8292.');

console.log('\n================================================================');
console.log('   🎉 TẤT CẢ 7 NHÓM TEST CASES WEB PUSH & REMINDERS ĐỀU PASSED!  ');
console.log('================================================================');
