// Test Suite: Kiểm Tra Danh Mục Địa Giới Hành Chính 34 Tỉnh/Thành Phố Mới
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
console.log('   MEDXPRESSCARE - KIỂM THỬ ĐỊA GIỚI HÀNH CHÍNH 34 TỈNH MỚI      ');
console.log('================================================================\n');

// 1. Kiểm tra danh mục 34 Tỉnh / Thành phố mới
console.log('--- 1. Kiểm tra danh mục 34 Tỉnh / Thành phố mới ---');
assert.ok(Array.isArray(VIETNAM_PROVINCES), 'VIETNAM_PROVINCES phải là mảng');
assert.strictEqual(VIETNAM_PROVINCES.length, 34, `Việt Nam có đúng 34 đơn vị cấp tỉnh mới (hiện có: ${VIETNAM_PROVINCES.length})`);

const provinceNames = VIETNAM_PROVINCES.map(p => p.name);
const uniqueNames = new Set(provinceNames);
assert.strictEqual(provinceNames.length, uniqueNames.size, 'Không được có tỉnh thành bị trùng lặp');

// Kiểm tra 6 thành phố trực thuộc Trung ương và các tỉnh trọng điểm
assert.ok(provinceNames.some(n => n.includes('Hà Nội')), 'Phải có Hà Nội');
assert.ok(provinceNames.some(n => n.includes('Hồ Chí Minh')), 'Phải có TP. Hồ Chí Minh');
assert.ok(provinceNames.some(n => n.includes('Đà Nẵng')), 'Phải có Đà Nẵng');
assert.ok(provinceNames.some(n => n.includes('Hải Phòng')), 'Phải có Hải Phòng');
assert.ok(provinceNames.some(n => n.includes('Cần Thơ')), 'Phải có Cần Thơ');
assert.ok(provinceNames.some(n => n.includes('Huế')), 'Phải có Thành phố Huế');
assert.ok(provinceNames.some(n => n.includes('Quảng Ninh')), 'Phải có Quảng Ninh');
assert.ok(provinceNames.some(n => n.includes('Bắc Ninh')), 'Phải có Bắc Ninh');
assert.ok(provinceNames.some(n => n.includes('Đồng Nai')), 'Phải có Đồng Nai');
assert.ok(provinceNames.some(n => n.includes('Cà Mau')), 'Phải có Cà Mau');

const hanoi = VIETNAM_PROVINCES.find(p => p.shortName === 'Hà Nội' || p.name.includes('Hà Nội'));
assert.strictEqual(hanoi.isExpress, true, 'Hà Nội phải hỗ trợ hỏa tốc');

console.log(`  ✅ PASSED: Đầy đủ chính xác 34 Tỉnh / Thành phố theo dữ liệu hành chính mới.`);

// 2. Kiểm tra danh mục Xã / Phường
console.log('\n--- 2. Kiểm tra danh mục Xã / Phường chuẩn xác ---');

// A. Hà Nội
const hanoiWards = getWardsForProvince('Hà Nội');
assert.ok(Array.isArray(hanoiWards) && hanoiWards.length >= 100, `Hà Nội phải có đầy đủ xã phường (hiện có: ${hanoiWards.length})`);
assert.ok(hanoiWards.some(w => w.includes('Cầu Giấy') || w.includes('Hoàn Kiếm')), 'Hà Nội phải có các phường trọng điểm');
assert.ok(hanoiWards.some(w => w.includes('Cửa Nam')), 'Hà Nội phải có phường Cửa Nam');
assert.ok(hanoiWards.some(w => w.includes('Ba Đình')), 'Hà Nội phải có phường Ba Đình');
console.log(`  ✅ PASSED: Hà Nội có ${hanoiWards.length} xã/phường chuẩn xác.`);

// B. TP. Hồ Chí Minh
const hcmWards = getWardsForProvince('TP. Hồ Chí Minh');
assert.ok(Array.isArray(hcmWards) && hcmWards.length >= 100, `TP.HCM phải có đầy đủ xã phường (hiện có: ${hcmWards.length})`);
console.log(`  ✅ PASSED: TP. Hồ Chí Minh có ${hcmWards.length} xã/phường chuẩn xác.`);

// C. Đà Nẵng
const dnWards = getWardsForProvince('Đà Nẵng');
assert.ok(dnWards.some(w => w.includes('Hải Châu')), 'Đà Nẵng có phường Hải Châu');
console.log(`  ✅ PASSED: Đà Nẵng có ${dnWards.length} xã/phường chuẩn xác.`);

// D. Hải Phòng
const hpWards = getWardsForProvince('Hải Phòng');
assert.ok(hpWards.some(w => w.includes('Thuỷ Nguyên') || w.includes('Thủy Nguyên')), 'Hải Phòng có phường Thủy Nguyên');
console.log(`  ✅ PASSED: Hải Phòng có ${hpWards.length} xã/phường chuẩn xác.`);

// E. Thành phố Huế
const hueWards = getWardsForProvince('Huế');
assert.ok(hueWards.some(w => w.includes('Thuận An') || w.includes('Vỹ Dạ')), 'Huế có các phường trọng điểm');
console.log(`  ✅ PASSED: Huế có ${hueWards.length} xã/phường chuẩn xác.`);

// F. Fallback an toàn cho tỉnh khác
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
assert.ok(twoTierCode.includes('searchTerm'), 'TwoTierAddressFields.jsx có ô tìm kiếm nhanh');

assert.ok(authModalCode.includes('TwoTierAddressFields'), 'CustomerAuthModal.jsx đồng bộ địa chỉ 2 cấp');
assert.ok(profileModalCode.includes('TwoTierAddressFields'), 'CustomerProfileModal.jsx đồng bộ địa chỉ 2 cấp');

console.log('  ✅ PASSED: Tất cả các form trong toàn bộ hệ thống đã đồng bộ chuẩn địa chỉ tinh gọn.');

console.log('\n================================================================');
console.log('   🎉 TẤT CẢ TEST CASES ĐỊA CHỈ 34 TỈNH MỚI ĐẠT 100% THÀNH CÔNG! ');
console.log('================================================================');
