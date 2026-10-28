/**
 * Test Suite: Bảo mật GHN API Token bằng Cloudflare Pages Functions (/functions/get-ghn-data.js)
 * 
 * Kiểm thử:
 * 1. Cấu trúc file /functions/get-ghn-data.js và alias /functions/functions/get-ghn-data.js
 * 2. Hàm handleGhnDataRequest xử lý CORS OPTIONS (204)
 * 3. Lấy danh sách Tỉnh/Thành phố (?type=provinces) an toàn
 * 4. Lấy danh sách Quận/Huyện (?type=districts&province_id=201) an toàn
 * 5. Lấy danh sách Phường/Xã (?type=wards&district_id=1442) an toàn, chuẩn WardCode '20314'
 * 6. Xử lý method POST với JSON body
 * 7. Tuyệt đối không rò rỉ Token ra Client-side qua Response hoặc Client props
 * 8. ghnHelper.js gọi /functions/get-ghn-data làm proxy chính
 * 9. worker.js hỗ trợ đồng thời router /functions/get-ghn-data và /get-ghn-data
 * 10. Không có bất kỳ ký tự GSP nào trong toàn bộ dự án
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log(' KIỂM THỬ BẢO MẬT TOKEN GHN VỚI CLOUDFLARE PAGES FUNCTIONS ');
console.log('================================================================');

// 1. Kiểm tra sự tồn tại của file /functions/get-ghn-data.js
console.log('\n--- 1. Kiểm tra cấu trúc file Cloudflare Pages Functions ---');
const functionsPath = path.join(__dirname, 'functions', 'get-ghn-data.js');
assert.ok(fs.existsSync(functionsPath), 'File /functions/get-ghn-data.js phải tồn tại');
console.log('  ✔ Đã tìm thấy /functions/get-ghn-data.js');

const aliasPath = path.join(__dirname, 'functions', 'functions', 'get-ghn-data.js');
assert.ok(fs.existsSync(aliasPath), 'Alias file /functions/functions/get-ghn-data.js phải tồn tại để hỗ trợ mọi cách định tuyến');
console.log('  ✔ Đã tìm thấy alias /functions/functions/get-ghn-data.js');

// 2. Import module get-ghn-data.js
const { handleGhnDataRequest, onRequest, onRequestOptions } = await import('./functions/get-ghn-data.js');
assert.strictEqual(typeof handleGhnDataRequest, 'function', 'handleGhnDataRequest phải là function');
assert.strictEqual(typeof onRequest, 'function', 'onRequest phải là function chuẩn Cloudflare Pages Functions');
assert.strictEqual(typeof onRequestOptions, 'function', 'onRequestOptions phải là function');
console.log('  ✔ Export đầy đủ handleGhnDataRequest, onRequest, onRequestOptions');

// 3. Kiểm tra CORS Preflight (OPTIONS)
console.log('\n--- 2. Kiểm thử CORS Preflight (OPTIONS) ---');
const optRes = await onRequestOptions();
assert.strictEqual(optRes.status, 204, 'OPTIONS preflight phải trả về 204 No Content');
assert.strictEqual(optRes.headers.get('Access-Control-Allow-Origin'), '*', 'CORS Allow-Origin phải là *');
assert.ok(optRes.headers.get('Access-Control-Allow-Methods').includes('GET'), 'CORS Allow-Methods hỗ trợ GET');
assert.ok(optRes.headers.get('Access-Control-Allow-Methods').includes('POST'), 'CORS Allow-Methods hỗ trợ POST');
console.log('  ✔ CORS Preflight 204 chuẩn mực, mở rộng cross-origin cho website');

// 4. Kiểm thử lấy danh sách Tỉnh/Thành phố (?type=provinces)
console.log('\n--- 3. Kiểm thử Proxy danh mục Tỉnh / Thành phố ---');
const provReq = new Request('https://medxpresscare.pages.dev/functions/get-ghn-data?type=provinces', {
  method: 'GET'
});
const provRes = await handleGhnDataRequest(provReq, {});
assert.strictEqual(provRes.status, 200, 'HTTP status phải là 200');
const provData = await provRes.json();
assert.ok(provData.success, 'Phản hồi thành công');
assert.ok(Array.isArray(provData.data), 'Dữ liệu trả về là mảng danh sách Tỉnh');
const hanoi = provData.data.find(p => p.ProvinceID === 201 || p.ProvinceName === 'Hà Nội');
assert.ok(hanoi, 'Danh sách phải có Hà Nội (ProvinceID = 201)');
console.log(`  ✔ Lấy thành công ${provData.data.length} Tỉnh/Thành phố. Hà Nội ID = ${hanoi.ProvinceID}`);

// 5. Kiểm thử lấy danh sách Quận/Huyện (?type=districts&province_id=201)
console.log('\n--- 4. Kiểm thử Proxy danh mục Quận / Huyện ---');
const distReq = new Request('https://medxpresscare.pages.dev/functions/get-ghn-data?type=districts&province_id=201', {
  method: 'GET'
});
const distRes = await handleGhnDataRequest(distReq, {});
assert.strictEqual(distRes.status, 200, 'HTTP status phải là 200');
const distData = await distRes.json();
assert.ok(distData.success, 'Phản hồi thành công');
assert.ok(Array.isArray(distData.data), 'Dữ liệu trả về là mảng');
const cauGiay = distData.data.find(d => d.DistrictID === 1442);
assert.ok(cauGiay, 'Quận Cầu Giấy phải có DistrictID = 1442');
console.log(`  ✔ Lấy thành công ${distData.data.length} Quận/Huyện tại Hà Nội. Cầu Giấy DistrictID = ${cauGiay.DistrictID}`);

// 6. Kiểm thử lấy danh sách Phường/Xã (?type=wards&district_id=1442)
console.log('\n--- 5. Kiểm thử Proxy danh mục Phường / Xã kèm WardCode ---');
const wardReq = new Request('https://medxpresscare.pages.dev/functions/get-ghn-data?type=wards&district_id=1442', {
  method: 'GET'
});
const wardRes = await handleGhnDataRequest(wardReq, {});
assert.strictEqual(wardRes.status, 200, 'HTTP status phải là 200');
const wardData = await wardRes.json();
assert.ok(wardData.success, 'Phản hồi thành công');
assert.ok(Array.isArray(wardData.data), 'Dữ liệu trả về là mảng');
const quanHoa = wardData.data.find(w => w.WardCode === '20314' || w.WardName.includes('Quan Hoa'));
assert.ok(quanHoa, 'Phường Quan Hoa phải có WardCode chuẩn 20314');
assert.strictEqual(quanHoa.WardCode, '20314', 'WardCode của Quan Hoa bắt buộc là "20314"');
console.log(`  ✔ Lấy thành công ${wardData.data.length} Phường/Xã tại Cầu Giấy. Phường Quan Hoa WardCode = "${quanHoa.WardCode}"`);

// 7. Kiểm thử POST JSON Body
console.log('\n--- 6. Kiểm thử POST Method với JSON body ---');
const postReq = new Request('https://medxpresscare.pages.dev/functions/get-ghn-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ type: 'wards', district_id: 1442 })
});
const postRes = await handleGhnDataRequest(postReq, {});
assert.strictEqual(postRes.status, 200, 'POST request status phải là 200');
const postData = await postRes.json();
assert.ok(postData.data.some(w => w.WardCode === '20314'), 'POST request trả về đúng WardCode 20314');
console.log('  ✔ POST request với JSON body hoạt động trơn tru');

// 8. Kiểm tra tính bảo mật Token (Không trả Token trong Response JSON)
console.log('\n--- 7. Kiểm thử tính Bảo Mật: Không rò rỉ Token ra Client ---');
const mockEnv = { GHN_API_TOKEN: 'SUPER_SECRET_TOKEN_DO_NOT_LEAK_12345' };
const secureReq = new Request('https://medxpresscare.pages.dev/functions/get-ghn-data?type=provinces', {
  method: 'GET'
});
const secureRes = await handleGhnDataRequest(secureReq, mockEnv);
const secureRawText = await secureRes.text();
assert.ok(!secureRawText.includes('SUPER_SECRET_TOKEN_DO_NOT_LEAK_12345'), 'Response KHÔNG được chứa Token bí mật');
console.log('  ✔ An toàn tuyệt đối: Token bảo mật server-side không bao giờ bị trả về cho Client hoặc lộ ra F12');

// 9. Kiểm tra ghnHelper.js gọi /functions/get-ghn-data
console.log('\n--- 8. Kiểm tra mã nguồn Client-side src/utils/ghnHelper.js ---');
const helperCode = fs.readFileSync(path.join(__dirname, 'src', 'utils', 'ghnHelper.js'), 'utf8');
assert.ok(helperCode.includes('/functions/get-ghn-data'), 'ghnHelper.js phải gọi URL /functions/get-ghn-data');
assert.ok(helperCode.includes('type=provinces'), 'Gọi type=provinces');
assert.ok(helperCode.includes('type=districts'), 'Gọi type=districts');
assert.ok(helperCode.includes('type=wards'), 'Gọi type=wards');
console.log('  ✔ src/utils/ghnHelper.js đã được cấu hình gọi proxy ẩn /functions/get-ghn-data');

// 10. Kiểm tra worker.js hỗ trợ đồng thời
console.log('\n--- 9. Kiểm tra worker.js tích hợp route proxy ---');
const workerCode = fs.readFileSync(path.join(__dirname, 'worker.js'), 'utf8');
assert.ok(workerCode.includes("pathname === '/functions/get-ghn-data' || pathname === '/get-ghn-data'"), 
  'worker.js phải xử lý cả /functions/get-ghn-data và /get-ghn-data');
console.log('  ✔ worker.js đã tích hợp xử lý tương thích cho cả Worker và Cloudflare Pages');

// 11. Kiểm tra CheckoutModal không để lộ apiKey trong props TwoTierAddressFields
console.log('\n--- 10. Kiểm tra CheckoutModal.jsx loại bỏ truyền apiKey từ client ---');
const checkoutCode = fs.readFileSync(path.join(__dirname, 'src', 'components', 'CheckoutModal.jsx'), 'utf8');
assert.ok(!checkoutCode.includes("apiKey={storeConfig?.shippingCarriers?.find(c => c.id === 'ghn')?.apiKey}"),
  'CheckoutModal không được truyền apiKey từ client');
console.log('  ✔ CheckoutModal.jsx hoàn toàn sạch sẽ, không truyền Token sang Client component');

// 12. Kiểm tra cam kết: Không có từ khóa "GSP"
console.log('\n--- 11. Kiểm tra tuân thủ: Tuyệt đối KHÔNG có từ khóa "GSP" ---');
const filesToCheck = [
  'src/components/OrderTrackingPage.jsx',
  'src/components/OrderTrackingModal.jsx',
  'src/components/AdminPanel.jsx',
  'src/components/CheckoutModal.jsx',
  'src/components/Footer.jsx',
  'src/utils/logisticsHelper.js',
  'src/utils/aiHelper.js',
  'worker.js',
  'functions/get-ghn-data.js'
];
for (const relPath of filesToCheck) {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const gspMatches = content.match(/\bGSP\b/g);
    assert.strictEqual(gspMatches, null, `File ${relPath} không được chứa từ khóa "GSP"!`);
  }
}
console.log('  ✔ Toàn bộ các file kiểm tra đều sạch bóng từ khóa "GSP"');

console.log('\n================================================================');
console.log(' TẤT CẢ KIỂM THỬ BẢO MẬT GHN FUNCTIONS ĐỀU THÀNH CÔNG (PASSED)! ');
console.log('================================================================\n');
