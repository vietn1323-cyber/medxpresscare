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

// 8. Test Dược sĩ xác nhận THỦ CÔNG đã nhận hàng hoàn & Tái nhập kho GSP (stepOrderToReturnConfirmed)
const inspectionData = {
  pharmacistName: 'DS. CKI Nguyễn Thu Trang',
  sealCondition: 'intact',
  restoreStock: true,
  note: 'Tem niêm phong nguyên vẹn 100%, nhiệt độ mát chuẩn GSP.'
};
const confirmedReturnOrder = stepOrderToReturnConfirmed(arrivedOrder, inspectionData);
assert.strictEqual(confirmedReturnOrder.status, 'returned');
assert.ok(confirmedReturnOrder.returnInspection);
assert.strictEqual(confirmedReturnOrder.returnInspection.pharmacistName, 'DS. CKI Nguyễn Thu Trang');
assert.strictEqual(confirmedReturnOrder.returnInspection.sealCondition, 'intact');
assert.strictEqual(confirmedReturnOrder.returnInspection.restoreStock, true);
assert.ok(confirmedReturnOrder.trackingTimeline[confirmedReturnOrder.trackingTimeline.length - 1].title.includes('Dược sĩ đã kiểm nhận hàng hoàn'));
console.log('  ✅ PASSED: Xác nhận thủ công nhận hàng hoàn & ghi nhận đầy đủ biên bản kiểm định GSP');

// 9. Test syncCarrierLogisticsStatus chuyển returning -> returned_pending_check và KHÔNG tự hoàn tất
let returnSync = { ...returningOrder };
returnSync = syncCarrierLogisticsStatus(returnSync);
assert.strictEqual(returnSync.status, 'returned_pending_check');
// Đồng bộ tiếp tục không được phép tự động hoàn tất vì phải xác nhận thủ công
returnSync = syncCarrierLogisticsStatus(returnSync);
assert.strictEqual(returnSync.status, 'returned_pending_check', 'Bắt buộc không được tự hoàn tất khi chưa có xác nhận thủ công!');
console.log('  ✅ PASSED: Cơ chế bảo vệ: Không tự động duyệt hàng hoàn nếu thiếu xác nhận thủ công của Dược sĩ');

console.log('\n--- TỔNG KẾT: 9/9 TEST CASES ĐẠT CHUẨN 100% ---');
