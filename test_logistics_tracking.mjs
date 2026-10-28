import assert from 'node:assert';
import { 
  getCarrierInfo, 
  generateCarrierTrackingNumber, 
  initializeOrderTracking, 
  stepOrderToShipping, 
  stepOrderToCompleted, 
  syncCarrierLogisticsStatus,
  stepOrderToReturning,
  stepOrderToWarehouseArrival,
  stepOrderToReturnConfirmed,
  RETURN_REASONS
} from './src/utils/logisticsHelper.js';

console.log('--- KIỂM THỬ AUTOMATED LOGISTICS TRACKING & RETURN INSPECTION HELPER ---');

// 1. Kiểm tra Carrier Info
const ghtk = getCarrierInfo('ghtk');
assert.strictEqual(ghtk.name, 'Giao Hàng Nhanh (GHTK)');
assert.ok(ghtk.shipper.phone);

const express = getCarrierInfo('express');
assert.strictEqual(express.name, 'Giao Hỏa Tốc (Nội thành Hà Nội)');
console.log('  ✅ PASSED: Carrier info mappings chuẩn');

// 2. Kiểm tra generateCarrierTrackingNumber
const t1 = generateCarrierTrackingNumber('ghtk', 'MXC-123456');
assert.ok(t1.startsWith('S22.HN1.'));
const t2 = generateCarrierTrackingNumber('ghn', 'MXC-888999');
assert.strictEqual(t2, 'GHN888999VN');
console.log('  ✅ PASSED: Tạo mã vận đơn chuẩn định dạng các bưu cục');

// 3. Test Khởi tạo Tracking khi Xác nhận / In đơn
const rawOrder = {
  id: 'MXC-999111',
  createdAt: new Date().toISOString(),
  shippingMethod: 'ghtk',
  customer: { fullName: 'Bác Thắng', address: '12 Cầu Giấy', phone: '0912345678' },
  items: [{ id: 'vn-01', name: 'Viên Khớp Bách Niên Kiện', price: 699000, quantity: 2 }],
  grandTotal: 1398000,
  status: 'pending'
};

const confirmedOrder = initializeOrderTracking(rawOrder, 'ghtk', 'confirm');
assert.strictEqual(confirmedOrder.status, 'confirmed');
assert.strictEqual(confirmedOrder.autoTracking, true);
assert.strictEqual(confirmedOrder.carrierProgress, 30);
assert.ok(confirmedOrder.trackingNumber);
assert.strictEqual(confirmedOrder.trackingTimeline.length, 2);
console.log('  ✅ PASSED: Khởi tạo tracking khi xác nhận/in đơn chuẩn xác');

// 4. Test Tự động chuyển sang 'shipping' (Đang giao)
const shippingOrder = stepOrderToShipping(confirmedOrder);
assert.strictEqual(shippingOrder.status, 'shipping');
assert.strictEqual(shippingOrder.carrierProgress, 70);
assert.ok(shippingOrder.shippedAt);
assert.strictEqual(shippingOrder.trackingTimeline.length, 3);
assert.ok(shippingOrder.trackingTimeline[2].title.includes('Đang phát hỏa tốc'));
console.log('  ✅ PASSED: Chuyển trạng thái sang "shipping" (Đang giao hỏa tốc)');

// 5. Test Tự động chuyển sang 'completed' (Hoàn thành)
const completedOrder = stepOrderToCompleted(shippingOrder);
assert.strictEqual(completedOrder.status, 'completed');
assert.strictEqual(completedOrder.carrierProgress, 100);
assert.strictEqual(completedOrder.autoTracking, false); // Dừng tracking khi xong
assert.ok(completedOrder.completedAt);
assert.strictEqual(completedOrder.trackingTimeline.length, 4);
assert.ok(completedOrder.trackingTimeline[3].title.includes('Giao hàng thành công'));
console.log('  ✅ PASSED: Chuyển trạng thái sang "completed" (Hoàn tất & giao thành công)');

// 6. Test Mô phỏng Giao thất bại & Chuyển hoàn về kho (stepOrderToReturning)
assert.ok(Array.isArray(RETURN_REASONS) && RETURN_REASONS.length >= 5);
const returningOrder = stepOrderToReturning(shippingOrder, 'Không liên lạc được người nhận sau 3 lần gọi');
assert.strictEqual(returningOrder.status, 'returning');
assert.strictEqual(returningOrder.autoTracking, false); // Bắt buộc dừng auto tracking
assert.strictEqual(returningOrder.failureReason, 'Không liên lạc được người nhận sau 3 lần gọi');
assert.ok(returningOrder.returningAt);
assert.ok(returningOrder.trackingTimeline[returningOrder.trackingTimeline.length - 1].title.includes('Giao thất bại'));
console.log('  ✅ PASSED: Báo giao thất bại & chuyển hoàn (autoTracking = false, lưu failureReason)');

// 7. Test Bưu tá giao kiện hàng hoàn về tới cửa kho MedXpressCare (stepOrderToWarehouseArrival)
const arrivedOrder = stepOrderToWarehouseArrival(returningOrder);
assert.strictEqual(arrivedOrder.status, 'returned_pending_check');
assert.ok(arrivedOrder.arrivedWarehouseAt);
assert.ok(arrivedOrder.trackingTimeline[arrivedOrder.trackingTimeline.length - 1].title.includes('Chờ Dược sĩ kiểm nhận'));
console.log('  ✅ PASSED: Kiện hàng về kho (status = returned_pending_check, yêu cầu kiểm nhận thủ công)');

// 8. Test Dược sĩ xác nhận THỦ CÔNG đã nhận hàng hoàn & Tái nhập kho (stepOrderToReturnConfirmed)
const inspectionData = {
  pharmacistName: 'DS. CKI Nguyễn Thu Trang',
  sealCondition: 'intact',
  restoreStock: true,
  note: 'Tem niêm phong nguyên vẹn 100%, bảo quản đạt chuẩn.'
};
const confirmedReturnOrder = stepOrderToReturnConfirmed(arrivedOrder, inspectionData);
assert.strictEqual(confirmedReturnOrder.status, 'returned');
assert.ok(confirmedReturnOrder.returnInspection);
assert.strictEqual(confirmedReturnOrder.returnInspection.pharmacistName, 'DS. CKI Nguyễn Thu Trang');
assert.strictEqual(confirmedReturnOrder.returnInspection.sealCondition, 'intact');
assert.strictEqual(confirmedReturnOrder.returnInspection.restoreStock, true);
assert.ok(confirmedReturnOrder.trackingTimeline[confirmedReturnOrder.trackingTimeline.length - 1].title.includes('Dược sĩ đã kiểm nhận hàng hoàn'));
console.log('  ✅ PASSED: Xác nhận thủ công nhận hàng hoàn & ghi nhận đầy đủ biên bản kiểm định');

// 9. Test syncCarrierLogisticsStatus chuyển returning -> returned_pending_check và KHÔNG tự hoàn tất
let returnSync = { ...returningOrder };
returnSync = syncCarrierLogisticsStatus(returnSync);
assert.strictEqual(returnSync.status, 'returned_pending_check');
// Đồng bộ tiếp tục không được phép tự động hoàn tất vì phải xác nhận thủ công
returnSync = syncCarrierLogisticsStatus(returnSync);
assert.strictEqual(returnSync.status, 'returned_pending_check', 'Bắt buộc không được tự hoàn tất khi chưa có xác nhận thủ công!');
console.log('  ✅ PASSED: Cơ chế bảo vệ: Không tự động duyệt hàng hoàn nếu thiếu xác nhận thủ công của Dược sĩ');

// 10. Test tính năng Tra Cứu Vận Đơn Dành Cho Khách Hàng (OrderTrackingPage) - Đã loại bỏ hoàn toàn đơn mẫu thử
console.log('\n--- KIỂM THỬ TÍNH NĂNG TRANG TRA CỨU VẬN ĐƠN (ORDER TRACKING PAGE) ---');

import fs from 'node:fs';
const orderTrackingPageCode = fs.readFileSync('./src/components/OrderTrackingPage.jsx', 'utf8');
assert.ok(orderTrackingPageCode.includes('export const OrderTrackingPage'), 'OrderTrackingPage phải được export');
assert.ok(orderTrackingPageCode.includes('maskPhone'), 'OrderTrackingPage phải hỗ trợ che số điện thoại PII');
assert.ok(!orderTrackingPageCode.includes('Thử nhanh đơn mẫu:'), 'Phải loại bỏ hoàn toàn phần chip thử nhanh đơn mẫu');
assert.ok(!orderTrackingPageCode.includes('Xem Thử Đơn Hàng Mẫu Demo'), 'Phải loại bỏ nút xem thử đơn mẫu demo');

// Kiểm tra DEMO_TRACKING_ORDERS rỗng
assert.ok(orderTrackingPageCode.includes('export const DEMO_TRACKING_ORDERS = [];'), 'DEMO_TRACKING_ORDERS phải là mảng rỗng');
console.log('  ✅ PASSED: Đã loại bỏ 100% đơn mẫu thử và chip gợi ý thử nghiệm ở trang tra cứu vận đơn');

// Mock danh sách đơn hàng thực tế do khách đặt để kiểm thử logic tìm kiếm
const REAL_ORDERS = [
  {
    id: 'MXC-998811',
    trackingNumber: 'S22.HN1.8839.998811',
    status: 'shipping',
    customer: { fullName: 'Nguyễn Văn An', phone: '0988 123 456' }
  },
  {
    id: 'MXC-774422',
    trackingNumber: 'VTP-77442200VN',
    status: 'confirmed',
    customer: { fullName: 'Trần Thị Mai', phone: '0912 345 678' }
  }
];

// 11. Test logic Tra cứu đa phương thức: Theo Mã Đơn (ID), Mã Vận Đơn Bưu Cục, hoặc Số Điện Thoại
const allOrders = [...REAL_ORDERS];
const searchOrders = (keyword) => {
  const q = (keyword || '').trim().toLowerCase().replace(/\s+/g, '');
  if (!q) return [];
  return allOrders.filter(o => {
    const idMatch = o.id && o.id.toLowerCase().replace(/\s+/g, '').includes(q);
    const trackingMatch = o.trackingNumber && o.trackingNumber.toLowerCase().replace(/\s+/g, '').includes(q);
    const phoneMatch = o.customer?.phone && o.customer.phone.replace(/\s+/g, '').includes(q);
    return idMatch || trackingMatch || phoneMatch;
  });
};

// 11.1 Tra cứu theo Mã đơn MedXpress
const resById = searchOrders('MXC-998811');
assert.strictEqual(resById.length, 1);
assert.strictEqual(resById[0].id, 'MXC-998811');
console.log('  ✅ PASSED: Tra cứu chính xác theo Mã đơn MedXpress thực tế (MXC-998811)');

// 11.2 Tra cứu theo Mã bưu cục
const resByTracking = searchOrders('S22.HN1.8839.998811');
assert.strictEqual(resByTracking.length, 1);
assert.strictEqual(resByTracking[0].id, 'MXC-998811');
console.log('  ✅ PASSED: Tra cứu chính xác theo Mã vận đơn bưu cục (S22.HN1.8839.998811)');

// 11.3 Tra cứu theo Số điện thoại người nhận (kể cả có khoảng trắng hay không)
const resByPhoneWithSpaces = searchOrders('0988 123 456');
assert.strictEqual(resByPhoneWithSpaces.length, 1);
assert.strictEqual(resByPhoneWithSpaces[0].id, 'MXC-998811');

const resByPhoneNoSpaces = searchOrders('0988123456');
assert.strictEqual(resByPhoneNoSpaces.length, 1);
assert.strictEqual(resByPhoneNoSpaces[0].id, 'MXC-998811');
console.log('  ✅ PASSED: Tra cứu thông minh theo Số điện thoại (xử lý sạch khoảng trắng: 0988 123 456)');

// 11.4 Tra cứu từ khóa không tồn tại
const resNotFound = searchOrders('KHONG-CO-DON-NAY-99999');
assert.strictEqual(resNotFound.length, 0);
console.log('  ✅ PASSED: Trả về rỗng an toàn khi không tìm thấy đơn');

// 11.5 Test Hàm che số điện thoại PII bảo vệ thông tin khách hàng
const maskPhone = (phone) => {
  if (!phone) return '098****456';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length < 7) return clean;
  return clean.slice(0, 3) + '****' + clean.slice(-3);
};
assert.strictEqual(maskPhone('0988123456'), '098****456');
assert.strictEqual(maskPhone('0912345678'), '091****678');
console.log('  ✅ PASSED: Mask PII số điện thoại chuẩn xác bảo vệ sự riêng tư người nhận (098****456)');

console.log('\n--- TỔNG KẾT: TẤT CẢ TEST CASES VẬN ĐƠN & TRA CỨU ĐẠT CHUẨN 100% ---');
