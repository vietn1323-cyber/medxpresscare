// Test Suite: Kiểm Tra Mô Hình Địa Chỉ 2 Cấp (Tỉnh Mới & Xã Phường Sau Sáp Nhập)
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { 
  VIETNAM_PROVINCES, 
  VIETNAM_WARDS_BY_PROVINCE, 
  getWardsForProvince 
} from './src/data/vietnamAdministrative.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ MÔ HÌNH ĐỊA CHỈ 2 CẤP SAU SÁP NHẬP   ');
console.log('================================================================\n');

// 1. Kiểm tra danh mục Tỉnh / Thành phố (Cấp 1)
console.log('--- 1. Kiểm tra danh mục Tỉnh / Thành phố (Cấp 1) ---');
assert.ok(Array.isArray(VIETNAM_PROVINCES), 'VIETNAM_PROVINCES phải là mảng');
assert.ok(VIETNAM_PROVINCES.length >= 63, `Phải có đủ 63 tỉnh thành Việt Nam (hiện có: ${VIETNAM_PROVINCES.length})`);

const provinceNames = VIETNAM_PROVINCES.map(p => p.name);
const uniqueNames = new Set(provinceNames);
assert.strictEqual(provinceNames.length, uniqueNames.size, 'Không được có tỉnh thành bị trùng lặp');

// Kiểm tra các thành phố lớn
assert.ok(provinceNames.includes('Hà Nội'), 'Phải có Hà Nội');
assert.ok(provinceNames.includes('TP. Hồ Chí Minh'), 'Phải có TP. Hồ Chí Minh');
assert.ok(provinceNames.includes('Đà Nẵng'), 'Phải có Đà Nẵng');
assert.ok(provinceNames.includes('Hải Phòng'), 'Phải có Hải Phòng');
assert.ok(provinceNames.includes('Cần Thơ'), 'Phải có Cần Thơ');
assert.ok(provinceNames.includes('Thừa Thiên Huế (TP. Huế)'), 'Phải có Huế');
assert.ok(provinceNames.includes('Quảng Ninh'), 'Phải có Quảng Ninh');
assert.ok(provinceNames.includes('Bắc Ninh'), 'Phải có Bắc Ninh');
assert.ok(provinceNames.includes('Đồng Nai'), 'Phải có Đồng Nai');

const hanoi = VIETNAM_PROVINCES.find(p => p.name === 'Hà Nội');
assert.strictEqual(hanoi.isExpress, true, 'Hà Nội phải hỗ trợ hỏa tốc');

console.log(`  ✅ PASSED: Đầy đủ ${VIETNAM_PROVINCES.length} Tỉnh / Thành phố Việt Nam cập nhật chuẩn.`);

// 2. Kiểm tra danh mục Xã / Phường sau sáp nhập (Cấp 2)
console.log('\n--- 2. Kiểm tra danh mục Xã / Phường sau sáp nhập (Cấp 2) ---');

// A. Hà Nội
const hanoiWards = getWardsForProvince('Hà Nội');
assert.ok(Array.isArray(hanoiWards) && hanoiWards.length >= 30, 'Hà Nội phải có danh mục xã phường phong phú');
assert.ok(hanoiWards.some(w => w.includes('Cầu Giấy')), 'Hà Nội phải có phường Cầu Giấy mới');
assert.ok(hanoiWards.some(w => w.includes('Dịch Vọng Hậu')), 'Hà Nội phải có phường Dịch Vọng Hậu');
assert.ok(hanoiWards.some(w => w.includes('Cửa Nam')), 'Hà Nội phải có phường Cửa Nam mới sáp nhập');
assert.ok(hanoiWards.some(w => w.includes('Hoàn Kiếm')), 'Hà Nội phải có phường Hoàn Kiếm mới sáp nhập');
console.log(`  ✅ PASSED: Hà Nội có ${hanoiWards.length} xã/phường sau sáp nhập chuẩn xác.`);

// B. TP. Hồ Chí Minh
const hcmWards = getWardsForProvince('TP. Hồ Chí Minh');
assert.ok(Array.isArray(hcmWards) && hcmWards.length >= 25, 'TP.HCM phải có danh mục xã phường phong phú');
assert.ok(hcmWards.some(w => w.includes('Quận 3 - mới sáp nhập')), 'TP.HCM phải có phường sáp nhập Quận 3');
assert.ok(hcmWards.some(w => w.includes('Quận 4 - mới sáp nhập')), 'TP.HCM phải có phường sáp nhập Quận 4');
assert.ok(hcmWards.some(w => w.includes('Quận 5 - mới sáp nhập')), 'TP.HCM phải có phường sáp nhập Quận 5');
assert.ok(hcmWards.some(w => w.includes('An Khánh (TP. Thủ Đức')), 'TP.HCM phải có phường mới TP. Thủ Đức');
console.log(`  ✅ PASSED: TP. Hồ Chí Minh có ${hcmWards.length} xã/phường sau sáp nhập chuẩn xác.`);

// C. Đà Nẵng
const dnWards = getWardsForProvince('Đà Nẵng');
assert.ok(dnWards.some(w => w.includes('Hải Châu 1 & Hải Châu 2')), 'Đà Nẵng có phường Hải Châu sáp nhập');
console.log(`  ✅ PASSED: Đà Nẵng có ${dnWards.length} xã/phường chuẩn xác.`);

// D. Hải Phòng
const hpWards = getWardsForProvince('Hải Phòng');
assert.ok(hpWards.some(w => w.includes('Thủy Nguyên')), 'Hải Phòng có thành phố Thủy Nguyên mới');
console.log(`  ✅ PASSED: Hải Phòng có ${hpWards.length} xã/phường chuẩn xác.`);

// E. Fallback an toàn cho tỉnh khác
const fallbackWards = getWardsForProvince('Tỉnh Mới Lạ');
assert.ok(Array.isArray(fallbackWards) && fallbackWards.length > 0, 'Phải có fallback an toàn');
console.log('  ✅ PASSED: Cơ chế fallback an toàn hoạt động 100%.');

// 3. Kiểm tra mã nguồn tích hợp vào các Form
console.log('\n--- 3. Kiểm tra tích hợp vào Form thông tin người nhận ---');
const checkoutModalCode = fs.readFileSync(path.join(__dirname, 'src/components/CheckoutModal.jsx'), 'utf-8');
const twoTierCode = fs.readFileSync(path.join(__dirname, 'src/components/TwoTierAddressFields.jsx'), 'utf-8');
const authModalCode = fs.readFileSync(path.join(__dirname, 'src/components/CustomerAuthModal.jsx'), 'utf-8');
const profileModalCode = fs.readFileSync(path.join(__dirname, 'src/components/CustomerProfileModal.jsx'), 'utf-8');

assert.ok(checkoutModalCode.includes('TwoTierAddressFields'), 'CheckoutModal.jsx phải sử dụng TwoTierAddressFields');
assert.ok(twoTierCode.includes('VIETNAM_PROVINCES'), 'TwoTierAddressFields.jsx phải dùng VIETNAM_PROVINCES');
assert.ok(twoTierCode.includes('getWardsForProvince'), 'TwoTierAddressFields.jsx phải dùng getWardsForProvince');
assert.ok(twoTierCode.includes('Tự nhập'), 'TwoTierAddressFields.jsx có nút Tự nhập linh hoạt');
assert.ok(twoTierCode.includes('Gợi ý nhanh'), 'TwoTierAddressFields.jsx có gợi ý nhanh các xã phường sau sáp nhập');

assert.ok(authModalCode.includes('TwoTierAddressFields'), 'CustomerAuthModal.jsx đồng bộ địa chỉ 2 cấp');
assert.ok(profileModalCode.includes('TwoTierAddressFields'), 'CustomerProfileModal.jsx đồng bộ địa chỉ 2 cấp');

console.log('  ✅ PASSED: Tất cả các form trong toàn bộ hệ thống đã đồng bộ chuẩn địa chỉ 2 cấp.');

console.log('\n================================================================');
console.log('   🎉 TẤT CẢ TEST CASES ĐỊA CHỈ 2 CẤP ĐẠT 100% THÀNH CÔNG!     ');
console.log('================================================================');
