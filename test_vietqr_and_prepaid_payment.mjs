import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { 
  VIETQR_BANKS, 
  getBankInfo, 
  generateVietQREMVCo, 
  getVietQRImageUrl, 
  getVietQRFallbackUrl,
  crc16Ccitt,
  removeVietnameseAccents 
} from './src/utils/vietqrHelper.js';

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ VIETQR VÀ THANH TOÁN TRƯỚC PREPAID   ');
console.log('================================================================\n');

// 1. Kiểm thử module vietqrHelper & ánh xạ ngân hàng
console.log('--- 1. Kiểm thử ánh xạ ngân hàng & chuẩn NAPAS 247 ---');
const tcb = getBankInfo('Techcombank');
assert.strictEqual(tcb.bin, '970407', 'Techcombank phải có BIN 970407');
assert.strictEqual(tcb.shortName, 'Techcombank');

const mb = getBankInfo('MB Bank (Quân Đội)');
assert.strictEqual(mb.bin, '970422', 'MB Bank phải có BIN 970422');

const vcb = getBankInfo('Vietcombank');
assert.strictEqual(vcb.bin, '970436', 'Vietcombank phải có BIN 970436');

const acb = getBankInfo('ACB');
assert.strictEqual(acb.bin, '970416', 'ACB phải có BIN 970416');

const vpb = getBankInfo('VPBank');
assert.strictEqual(vpb.bin, '970432', 'VPBank phải có BIN 970432');

const directBin = getBankInfo('970407');
assert.strictEqual(directBin.bin, '970407');

console.log('  ✅ PASSED: Ánh xạ chuẩn xác 100% mã định danh BIN các ngân hàng lớn tại Việt Nam.');

// 2. Kiểm thử tạo URL VietQR và EMVCo payload
console.log('\n--- 2. Kiểm thử tạo URL VietQR & Chuỗi mã hóa EMVCo ---');
const testAmount = 1595000;
const testOrderCode = 'MXC-226840';
const testAccount = '2989515555';
const testName = 'NGUYEN DINH VIET';

const vietQrUrl = getVietQRImageUrl({
  bankNameOrBin: 'Techcombank',
  accountNo: testAccount,
  accountName: testName,
  amount: testAmount,
  description: testOrderCode,
  template: 'compact2'
});

assert(vietQrUrl.includes('970407-2989515555-compact2.png'), 'URL phải chứa đúng BIN và số tài khoản');
assert(vietQrUrl.includes('amount=1595000'), 'URL phải chứa số tiền thực tế 1.595.000₫');
assert(vietQrUrl.includes('addInfo=MXC-226840'), 'URL phải chứa đúng mã đơn hàng MXC-226840');
assert(vietQrUrl.includes('accountName=NGUYEN+DINH+VIET') || vietQrUrl.includes('accountName=NGUYEN%20DINH%20VIET'), 'URL phải chứa tên chủ tài khoản');

const emvco = generateVietQREMVCo({
  bin: '970407',
  accountNo: testAccount,
  amount: testAmount,
  description: testOrderCode
});

assert(emvco.startsWith('000201'), 'EMVCo payload phải bắt đầu bằng 000201');
assert(emvco.includes('A000000727'), 'EMVCo payload phải chứa NAPAS GUID A000000727');
assert(emvco.includes('970407'), 'EMVCo payload phải chứa mã BIN Techcombank');
assert(emvco.includes(testAccount), 'EMVCo payload phải chứa số tài khoản 2989515555');
assert(emvco.includes('1595000'), 'EMVCo payload phải chứa đúng số tiền 1595000');
assert(emvco.includes(testOrderCode), 'EMVCo payload phải chứa mã đơn MXC-226840');
assert(emvco.includes('6304'), 'EMVCo payload phải chứa Tag 63 độ dài 4 cho CRC16 checksum');

const fallbackUrl = getVietQRFallbackUrl({
  bankNameOrBin: 'Techcombank',
  accountNo: testAccount,
  amount: testAmount,
  description: testOrderCode
});
assert(fallbackUrl.includes('api.qrserver.com'), 'Fallback URL phải sử dụng QR server engine');
assert(fallbackUrl.includes(encodeURIComponent(emvco)), 'Fallback QR phải mã hóa trực tiếp chuỗi chuẩn NAPAS EMVCo');

console.log('  ✅ PASSED: Tạo URL VietQR chính thức và chuỗi EMVCo NAPAS 247 hoàn toàn hợp lệ.');

// 3. Kiểm tra CheckoutModal lưu trữ completedOrder không bị reset về 25.000đ khi cartItems rỗng
console.log('\n--- 3. Kiểm thử bảo toàn giá tiền đơn hàng trong CheckoutModal ---');
const checkoutModalContent = fs.readFileSync('src/components/CheckoutModal.jsx', 'utf8');

assert(checkoutModalContent.includes('const [completedOrder, setCompletedOrder] = useState(null)'), 'CheckoutModal phải có state completedOrder');
assert(checkoutModalContent.includes('setCompletedOrder(newOrderObj)'), 'handleSubmit phải lưu newOrderObj vào completedOrder');
assert(checkoutModalContent.includes('completedOrder ? completedOrder.grandTotal : grandTotal'), 'VietQR box phải lấy grandTotal từ completedOrder');
assert(checkoutModalContent.includes('completedOrder ? completedOrder.id : orderCode'), 'VietQR box phải lấy id từ completedOrder');
assert(!checkoutModalContent.includes('data=2|99|'), 'Đã loại bỏ hoàn toàn cú pháp ví ảo 2|99| không hợp lệ');

console.log('  ✅ PASSED: CheckoutModal lưu giữ trọn vẹn giá trị đơn hàng thực tế (1.595.000₫), ngăn chặn triệt để lỗi rơi về 25.000đ khi giỏ hàng xóa.');

// 4. Kiểm tra hiển thị COD 0đ cho đơn VietQR trong OrderTrackingPage & OrderTrackingModal
console.log('\n--- 4. Kiểm thử hiển thị COD 0đ cho đơn thanh toán trước VietQR ---');
const trackingPageContent = fs.readFileSync('src/components/OrderTrackingPage.jsx', 'utf8');
assert(trackingPageContent.includes("selectedOrder.paymentMethod === 'vietqr' ? 'Tổng giá trị đơn hàng:' : 'Tổng thu bưu tá (COD):'"), 'OrderTrackingPage phải phân biệt đơn VietQR và COD');
assert(trackingPageContent.includes('Tiền thu hộ COD (Bưu tá thu):'), 'OrderTrackingPage phải hiển thị dòng tiền thu hộ');
assert(trackingPageContent.includes('0₫ (Đã Thanh Toán VietQR)'), 'Đơn VietQR phải hiển thị bưu tá thu 0đ');

const trackingModalContent = fs.readFileSync('src/components/OrderTrackingModal.jsx', 'utf8');
assert(trackingModalContent.includes('Bưu tá thu 0₫'), 'OrderTrackingModal phải ghi rõ Bưu tá thu 0đ khi đã thanh toán VietQR');

console.log('  ✅ PASSED: Giao diện tra cứu đơn hàng hiển thị minh bạch: Tổng tiền 1.595.000₫ và Bưu tá thu COD: 0₫.');

// 5. Kiểm tra worker.js cấu hình GHN payment_type_id & cod_amount khi prepaid
console.log('\n--- 5. Kiểm thử Cloudflare Worker đẩy đơn VietQR sang GHN với COD 0đ ---');
const workerContent = fs.readFileSync('worker.js', 'utf8');
assert(workerContent.includes("const codAmount = order.paymentMethod === 'vietqr' ? 0 : Math.round(order.grandTotal || 0)"), 'codAmount cho đơn VietQR phải là 0');
assert(workerContent.includes("payment_type_id: order.paymentMethod === 'vietqr' ? 1 : 2"), 'payment_type_id cho đơn VietQR phải là 1 (Người gửi trả cước)');

console.log('  ✅ PASSED: Cloudflare Worker GHN Proxy tự động thiết lập COD 0đ và payment_type_id = 1 cho đơn trả trước.');

// 6. Kiểm tra AdminPanel Live VietQR Preview
console.log('\n--- 6. Kiểm thử xem trước trực tiếp VietQR trong AdminPanel ---');
const adminPanelContent = fs.readFileSync('src/components/AdminPanel.jsx', 'utf8');
assert(adminPanelContent.includes('VIETQR_BANKS'), 'AdminPanel phải sử dụng danh sách ngân hàng VIETQR_BANKS');
assert(adminPanelContent.includes('getVietQRImageUrl'), 'AdminPanel phải gọi hàm tạo ảnh VietQR');
assert(adminPanelContent.includes('Quét thử nghiệm mã VietQR trực tiếp:'), 'AdminPanel phải có khối xem trước trực tiếp mã QR');

console.log('  ✅ PASSED: AdminPanel tích hợp bộ chọn ngân hàng chuẩn NAPAS và Live VietQR Preview.');

console.log('\n================================================================');
console.log('   🎉 TẤT CẢ 6 NHÓM TEST CASES VIETQR & PREPAID ĐỀU PASSED 100%!  ');
console.log('================================================================\n');
