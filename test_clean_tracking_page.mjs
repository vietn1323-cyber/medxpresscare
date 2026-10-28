import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { 
  formatCleanTrackingTime, 
  formatCleanTrackingLocation, 
  formatCleanTrackingTitle, 
  formatCleanTrackingDesc, 
  cleanTrackingItem,
  initializeOrderTracking,
  stepOrderToShipping,
  stepOrderToCompleted
} from './src/utils/logisticsHelper.js';
import { mapGhnStatusToLocal } from './src/utils/ghnHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ CHUẨN HÓA TRANG TRA CỨU VẬN ĐƠN   ');
console.log('================================================================\n');

// 1. Kiểm tra Ẩn toàn bộ thông tin nhạy cảm/nội bộ
console.log('--- 1. Kiểm thử ẩn toàn bộ cước phí gốc, mã phân loại & raw status ---');

const internalRawLog = {
  time: '23:04:15, 28/10/2026',
  status: 'confirmed',
  stage: 'ghn_created',
  title: 'Đã tạo vận đơn thành công trên GHN Express',
  desc: 'Mã vận đơn chính thức: GYMHGEYK. Phân loại bưu cục: 4x16-G-85-A4. Cước phí: 32.001₫. Đang chờ bưu tá GHN tới kho lấy hàng.',
  location: 'Tổng kho Dược MedXpressCare (Cầu Giấy, Hà Nội)'
};

const cleaned = cleanTrackingItem(internalRawLog);

assert.ok(!cleaned.desc.includes('Cước phí'), 'Desc không được chứa "Cước phí"');
assert.ok(!cleaned.desc.includes('32.001'), 'Desc không được chứa số tiền cước bưu cục 32.001₫');
assert.ok(!cleaned.desc.includes('4x16-G-85-A4'), 'Desc không được chứa mã phân loại 4x16-G-85-A4');
assert.ok(!cleaned.desc.includes('ready_to_pick'), 'Desc không chứa mã trạng thái raw');
assert.ok(!cleaned.location.includes('Tổng kho Dược MedXpressCare (Cầu Giấy, Hà Nội)'), 'Kho phải được rút gọn');
assert.strictEqual(cleaned.location, 'Kho hàng MedXpressCare', 'Vị trí kho được rút gọn thành "Kho hàng MedXpressCare"');

console.log('  ✅ PASSED: Ẩn 100% cước phí nội bộ, mã phân loại và rút gọn tên kho hàng.');

// 2. Kiểm thử định dạng mốc thời gian sạch: "HH:mm - DD/MM/YYYY"
console.log('\n--- 2. Kiểm thử chuẩn hóa định dạng thời gian "HH:mm - DD/MM/YYYY" ---');

const time1 = formatCleanTrackingTime(new Date(2026, 9, 28, 23, 4, 0));
assert.strictEqual(time1, '23:04 - 28/10/2026', 'Date object chuyển thành "23:04 - 28/10/2026"');

const time2 = formatCleanTrackingTime('23:04 - 28/10/2026');
assert.strictEqual(time2, '23:04 - 28/10/2026', 'Chuỗi sạch giữ nguyên');

const time3 = formatCleanTrackingTime('23:04:15, 28/10/2026');
assert.strictEqual(time3, '23:04 - 28/10/2026', 'Chuỗi vi-VN chuyển thành "23:04 - 28/10/2026"');

const time4 = formatCleanTrackingTime('28/10/2026 23:04');
assert.strictEqual(time4, '23:04 - 28/10/2026', 'Chuỗi ngày trước giờ sau chuyển đúng');

console.log('  ✅ PASSED: Mọi định dạng thời gian chuẩn hóa chuẩn mực sang "HH:mm - DD/MM/YYYY".');

// 3. Kiểm thử thông báo hành trình ngắn gọn, hướng tới khách hàng
console.log('\n--- 3. Kiểm thử câu thông báo hành trình ngắn gọn chuẩn GHN ---');

const titleCreated = formatCleanTrackingTitle('Đơn hàng được khởi tạo thành công', 'order_created');
assert.strictEqual(titleCreated, 'Đơn hàng đã được khởi tạo thành công');

const titlePrep = formatCleanTrackingTitle('Dược sĩ chuyên môn đã xác nhận đơn hàng & chuẩn bị hàng', 'pharmacist_confirmed');
assert.strictEqual(titlePrep, 'Hệ thống đang chuẩn bị hàng');

const titleGhnPush = formatCleanTrackingTitle('Đã tạo vận đơn thành công trên GHN Express', 'ghn_created');
assert.strictEqual(titleGhnPush, 'Đã bàn giao cho đơn vị vận chuyển (GHN Express)');

const titlePick = formatCleanTrackingTitle('ready_to_pick');
assert.strictEqual(titlePick, 'Bưu tá đang trên đường đến lấy hàng');

const titleDelivering = formatCleanTrackingTitle('delivering');
assert.strictEqual(titleDelivering, 'Đang giao hàng tới người nhận');

const titleDelivered = formatCleanTrackingTitle('delivered');
assert.strictEqual(titleDelivered, 'Giao hàng thành công');

console.log('  ✅ PASSED: Các câu thông báo hành trình ngắn gọn, chuẩn mực, khách hàng dễ hiểu.');

// 4. Kiểm thử mapGhnStatusToLocal không để lộ raw string status
console.log('\n--- 4. Kiểm thử ánh xạ trạng thái GHN trong ghnHelper.js ---');

const mappedReady = mapGhnStatusToLocal('ready_to_pick');
assert.strictEqual(mappedReady.label, 'Bưu tá đang trên đường đến lấy hàng');
assert.ok(!mappedReady.label.includes('ready_to_pick'));

const mappedSorting = mapGhnStatusToLocal('sorting');
assert.strictEqual(mappedSorting.label, 'Đang vận chuyển');

const mappedDelivering = mapGhnStatusToLocal('delivering');
assert.strictEqual(mappedDelivering.label, 'Đang giao hàng tới người nhận');

const mappedDelivered = mapGhnStatusToLocal('delivered');
assert.strictEqual(mappedDelivered.label, 'Giao hàng thành công');

console.log('  ✅ PASSED: mapGhnStatusToLocal chuẩn hóa 100% không còn raw string hoặc bracketed prefix.');

// 5. Kiểm thử mã nguồn AdminPanel.jsx không ghi cước phí hoặc mã phân loại vào timeline
console.log('\n--- 5. Kiểm tra mã nguồn AdminPanel.jsx không leak dữ liệu nhạy cảm ---');

const adminContent = fs.readFileSync(path.join(__dirname, 'src', 'components', 'AdminPanel.jsx'), 'utf8');

assert.ok(!adminContent.includes('Cước phí: ${(res.totalFee'), 'AdminPanel không còn ghi cước phí vào timeline log');
assert.ok(!adminContent.includes('Phân loại bưu cục: ${res.sortCode'), 'AdminPanel không còn ghi sortCode vào timeline log');
assert.ok(!adminContent.includes('Trạng thái hiện tại trên hệ thống GHN: "${detail.status}"'), 'AdminPanel không còn ghi raw status vào desc');
assert.ok(adminContent.includes("formatCleanTrackingTime(new Date())"), 'AdminPanel sử dụng formatCleanTrackingTime khi ghi log mới');

console.log('  ✅ PASSED: AdminPanel.jsx được bảo vệ hoàn toàn, không tạo log chứa dữ liệu nhạy cảm.');

// 6. Kiểm thử OrderTrackingPage.jsx & OrderTrackingModal.jsx
console.log('\n--- 6. Kiểm tra OrderTrackingPage.jsx & OrderTrackingModal.jsx ---');

const pageContent = fs.readFileSync(path.join(__dirname, 'src', 'components', 'OrderTrackingPage.jsx'), 'utf8');
const modalContent = fs.readFileSync(path.join(__dirname, 'src', 'components', 'OrderTrackingModal.jsx'), 'utf8');

assert.ok(pageContent.includes('cleanTrackingItem'), 'OrderTrackingPage tích hợp bộ lọc cleanTrackingItem');
assert.ok(modalContent.includes('cleanTrackingItem'), 'OrderTrackingModal tích hợp bộ lọc cleanTrackingItem');
assert.ok(pageContent.includes('.toUpperCase()'), 'OrderTrackingPage hiển thị mã vận đơn viết hoa');
assert.ok(modalContent.includes('.toUpperCase()'), 'OrderTrackingModal hiển thị mã vận đơn viết hoa');

console.log('  ✅ PASSED: OrderTrackingPage và OrderTrackingModal chuẩn hóa hiển thị sạch sẽ và viết hoa mã vận đơn.');

// 7. Kiểm thử loại bỏ hoàn toàn tiêu chuẩn GSP theo yêu cầu
console.log('\n--- 7. Kiểm tra loại bỏ 100% GSP và chuẩn hóa bước "Đóng gói" ---');

assert.ok(!pageContent.includes('GSP'), 'OrderTrackingPage.jsx không còn bất kỳ chữ GSP nào');
assert.ok(!modalContent.includes('GSP'), 'OrderTrackingModal.jsx không còn bất kỳ chữ GSP nào');
assert.ok(pageContent.includes('>Đóng gói<'), 'Bước 2 trong stepper phải là "Đóng gói"');
assert.ok(!pageContent.includes('Đóng gói GSP'), 'Đã xóa bỏ hoàn toàn "Đóng gói GSP"');
assert.ok(pageContent.includes("'Đã đóng gói (35%)'"), 'Tiến trình phải hiển thị "Đã đóng gói (35%)"');
assert.ok(!pageContent.includes('Bảo quản tiêu chuẩn GSP Dược phẩm 15-25°C'), 'Đã xóa bỏ hoàn toàn dòng Bảo quản tiêu chuẩn GSP');
assert.ok(!pageContent.includes('Bưu tá trực tiếp liên hệ người nhận trước khi phát'), 'Đã xóa bỏ hoàn toàn dòng lưu ý bưu tá');

console.log('  ✅ PASSED: Đã thay thế "Đóng gói" và loại bỏ 100% tiêu chuẩn GSP.');

console.log('\n================================================================');
console.log('   🎉 TẤT CẢ 7 NHÓM TEST CASES TRA CỨU VẬN ĐƠN ĐỀU PASSED 100%! ');
console.log('================================================================\n');
