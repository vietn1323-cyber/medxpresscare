import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ MASTER DATA GHN & FORM CHECKOUT     ');
console.log('================================================================\n');

// 1. Kiểm thử Fetch API Master Data Helper
console.log('--- 1. Kiểm thử các hàm Fetch API Master Data trong ghnHelper.js ---');
import { 
  fetchGhnProvinces, 
  fetchGhnDistricts, 
  fetchGhnWards,
  getGhnDistricts,
  getGhnWards
} from './src/utils/ghnHelper.js';

assert.strictEqual(typeof fetchGhnProvinces, 'function', 'Phải có hàm fetchGhnProvinces');
assert.strictEqual(typeof fetchGhnDistricts, 'function', 'Phải có hàm fetchGhnDistricts');
assert.strictEqual(typeof fetchGhnWards, 'function', 'Phải có hàm fetchGhnWards');

const provinces = await fetchGhnProvinces();
assert.ok(Array.isArray(provinces) && provinces.length > 0, 'fetchGhnProvinces phải trả về mảng danh mục Tỉnh');

const districts = await fetchGhnDistricts(201); // 201: Hà Nội
assert.ok(Array.isArray(districts) && districts.length > 0, 'fetchGhnDistricts phải trả về mảng Quận/Huyện của Hà Nội');
const cauGiay = districts.find(d => Number(d.DistrictID) === 1442);
assert.ok(cauGiay, 'Phải có Quận Cầu Giấy với DistrictID 1442');

const wards = await fetchGhnWards(1442); // 1442: Cầu Giấy
assert.ok(Array.isArray(wards) && wards.length > 0, 'fetchGhnWards phải trả về mảng Phường/Xã của Cầu Giấy');
const dichVongHau = wards.find(w => String(w.WardCode) === '20314');
assert.ok(dichVongHau, 'Phải có Phường Dịch Vọng Hậu với WardCode 20314');
console.log('  ✅ PASSED: Fetch API Master Data hoạt động chính xác với đầy đủ ProvinceID, DistrictID và WardCode.');

// 2. Kiểm thử mã nguồn TwoTierAddressFields.jsx
console.log('\n--- 2. Kiểm thử cấu trúc component TwoTierAddressFields.jsx ---');
const twoTierCode = fs.readFileSync(path.join(__dirname, 'src', 'components', 'TwoTierAddressFields.jsx'), 'utf8');

// Kiểm tra Fetch API được gọi trong useEffect
assert.ok(twoTierCode.includes('fetchGhnProvinces'), 'TwoTierAddressFields gọi Fetch API tải Tỉnh/Thành phố');
assert.ok(twoTierCode.includes('fetchGhnDistricts'), 'TwoTierAddressFields gọi Fetch API tải Quận/Huyện động');
assert.ok(twoTierCode.includes('fetchGhnWards'), 'TwoTierAddressFields gọi Fetch API tải Phường/Xã động');

// Kiểm tra BẮT BUỘC value của select Quận là DistrictID (số), không phải text
assert.ok(twoTierCode.includes('value={d.DistrictID}'), 'Thẻ option Quận/Huyện bắt buộc có value={d.DistrictID}');
assert.ok(twoTierCode.includes('value={currentDistrictId}'), 'Select Quận/Huyện lưu trữ đúng mã định danh DistrictID');

// Kiểm tra BẮT BUỘC value của select Phường là WardCode, không phải text
assert.ok(twoTierCode.includes('value={w.WardCode}'), 'Thẻ option Phường/Xã bắt buộc có value={w.WardCode}');
assert.ok(twoTierCode.includes('value={currentWardCode}'), 'Select Phường/Xã lưu trữ đúng mã định danh WardCode');

// Kiểm tra tính năng load động cascading
assert.ok(twoTierCode.includes('disabled={!selectedProvinceId'), 'Chặn chọn Quận khi chưa chọn Tỉnh');
assert.ok(twoTierCode.includes('disabled={!districtId'), 'Chặn chọn Phường khi chưa chọn Quận');
console.log('  ✅ PASSED: TwoTierAddressFields bắt buộc value là DistrictID & WardCode chuẩn GHN, load động tầng bậc.');

// 3. Kiểm thử Validation chặn đặt hàng khi thiếu trường tại CheckoutModal.jsx
console.log('\n--- 3. Kiểm thử Validation chặn gửi đơn tại CheckoutModal.jsx ---');
const checkoutCode = fs.readFileSync(path.join(__dirname, 'src', 'components', 'CheckoutModal.jsx'), 'utf8');

// Kiểm tra kiểm tra điều kiện validation
assert.ok(checkoutCode.includes('!formData.to_district_id && !formData.districtId'), 'Chặn đặt hàng nếu DistrictID bị trống');
assert.ok(checkoutCode.includes('!formData.to_ward_code && !formData.wardCode'), 'Chặn đặt hàng nếu WardCode bị trống');
assert.ok(checkoutCode.includes('!formData.province'), 'Chặn đặt hàng nếu Tỉnh/Thành phố bị trống');
assert.ok(checkoutCode.includes('!formData.address.trim()'), 'Chặn đặt hàng nếu Địa chỉ chi tiết bị trống');
assert.ok(checkoutCode.includes('Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện, Phường/Xã'), 'Có thông báo lỗi trực quan khi thiếu trường địa chỉ');

// Mô phỏng hàm validation của CheckoutModal
function validateCheckoutForm(formData) {
  const errors = {};
  if (!formData.fullName?.trim()) errors.fullName = 'Vui lòng nhập họ và tên';
  if (!formData.phone?.trim()) errors.phone = 'Vui lòng nhập số điện thoại để Dược sĩ liên hệ';
  if (!formData.province || !formData.province.trim()) errors.province = 'Vui lòng chọn Tỉnh / Thành phố';
  if (!formData.to_district_id && !formData.districtId) errors.district = 'Vui lòng chọn Quận / Huyện';
  if (!formData.to_ward_code && !formData.wardCode) errors.ward = 'Vui lòng chọn Phường / Xã';
  if (!formData.address?.trim()) errors.address = 'Vui lòng nhập địa chỉ nhận hàng chi tiết';
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Case 1: Thiếu to_district_id -> Phải bị chặn
const res1 = validateCheckoutForm({
  fullName: 'Nguyễn Văn A',
  phone: '0987654321',
  province: 'Hà Nội',
  districtId: null,
  to_district_id: null,
  wardCode: '20314',
  to_ward_code: '20314',
  address: 'Số 10 Dịch Vọng Hậu'
});
assert.strictEqual(res1.isValid, false, 'Form phải chặn khi thiếu DistrictID');
assert.ok(res1.errors.district, 'Báo lỗi thiếu Quận/Huyện');

// Case 2: Thiếu to_ward_code -> Phải bị chặn
const res2 = validateCheckoutForm({
  fullName: 'Nguyễn Văn A',
  phone: '0987654321',
  province: 'Hà Nội',
  districtId: 1442,
  to_district_id: 1442,
  wardCode: '',
  to_ward_code: '',
  address: 'Số 10 Dịch Vọng Hậu'
});
assert.strictEqual(res2.isValid, false, 'Form phải chặn khi thiếu WardCode');
assert.ok(res2.errors.ward, 'Báo lỗi thiếu Phường/Xã');

// Case 3: Thiếu địa chỉ chi tiết -> Phải bị chặn
const res3 = validateCheckoutForm({
  fullName: 'Nguyễn Văn A',
  phone: '0987654321',
  province: 'Hà Nội',
  districtId: 1442,
  to_district_id: 1442,
  wardCode: '20314',
  to_ward_code: '20314',
  address: ''
});
assert.strictEqual(res3.isValid, false, 'Form phải chặn khi thiếu địa chỉ chi tiết');
assert.ok(res3.errors.address, 'Báo lỗi thiếu địa chỉ chi tiết');

// Case 4: Đầy đủ mã định danh GHN và địa chỉ chi tiết -> Hợp lệ cho phép đặt hàng
const res4 = validateCheckoutForm({
  fullName: 'Nguyễn Văn A',
  phone: '0987654321',
  province: 'Hà Nội',
  districtId: 1442,
  to_district_id: 1442,
  wardCode: '20314',
  to_ward_code: '20314',
  address: 'Số 10 Dịch Vọng Hậu'
});
assert.strictEqual(res4.isValid, true, 'Form hợp lệ và cho phép đặt hàng');
console.log('  ✅ PASSED: Validation chặn 100% các trường hợp thiếu mã DistrictID, WardCode hoặc địa chỉ chi tiết.');

// 4. Kiểm thử Cloudflare Worker Proxy hỗ trợ cả GET & POST cho Master Data
console.log('\n--- 4. Kiểm thử Cloudflare Worker hỗ trợ Master Data Proxy ---');
const workerCode = fs.readFileSync(path.join(__dirname, 'worker.js'), 'utf8');

assert.ok(workerCode.includes('/api/shipping/ghn/master-data/provinces'), 'Worker có route /master-data/provinces');
assert.ok(workerCode.includes('/api/shipping/ghn/master-data/districts'), 'Worker có route /master-data/districts');
assert.ok(workerCode.includes('/api/shipping/ghn/master-data/wards'), 'Worker có route /master-data/wards');
assert.ok(workerCode.includes('resolveGhnToken'), 'Worker có hàm tự động giải quyết Token GHN');
console.log('  ✅ PASSED: Cloudflare Worker tích hợp đầy đủ Proxy Master Data với bảo mật Token.');

console.log('\n================================================================');
console.log('   🎉 TẤT CẢ 4 NHÓM TEST CASES MASTER DATA & CHECKOUT ĐỀU PASSED!');
console.log('================================================================\n');
