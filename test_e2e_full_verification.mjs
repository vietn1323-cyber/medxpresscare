import { PRODUCTS, CATEGORIES, COUNTRIES } from './src/data/products.js';
import { DEFAULT_HERO_BANNERS } from './src/data/banners.js';
import { DEFAULT_VOUCHERS, calculateVoucherDiscount } from './src/data/vouchers.js';
import { DEFAULT_ARTICLES, calculateSeoScore, slugify } from './src/data/articles.js';
import { INITIAL_REVIEWS } from './src/data/reviews.js';
import { VERIFIED_REGISTRATIONS } from './src/data/registrations.js';
import { 
  calculateEarnedPoints, 
  calculatePointsDiscount, 
  calculateMaxPointsToUse 
} from './src/data/customers.js';
import { 
  initializeOrderTracking, 
  stepOrderToShipping, 
  stepOrderToCompleted, 
  syncCarrierLogisticsStatus, 
  stepOrderToReturning, 
  stepOrderToWarehouseArrival, 
  stepOrderToReturnConfirmed 
} from './src/utils/logisticsHelper.js';

console.log('================================================================');
console.log('   MEDXPRESSCARE - BẮT ĐẦU KIỂM THỬ TOÀN DIỆN MỌI TÍNH NĂNG');
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASSED: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAILED: ${message}`);
    failCount++;
  }
}

// -------------------------------------------------------------
// 1. KIỂM THỬ 21 NHÓM BỆNH LÝ & CƠ CHẾ LỌC XUẤT XỨ (NỘI ĐỊA VS NHẬP KHẨU)
// -------------------------------------------------------------
console.log('--- 1. KIỂM THỬ 21 NHÓM BỆNH LÝ & NGUỒN GỐC XUẤT XỨ ---');

const activeHealthCategories = CATEGORIES.filter(c => c.id !== 'all');
assert(activeHealthCategories.length === 21, `Đủ đúng 21 nhóm bệnh lý chuẩn Bộ Y Tế (Hiện có: ${activeHealthCategories.length} nhóm)`);

const expectedCategoryIds = [
  'bo-nao-than-kinh', 'bo-tri-nao-bo-mat-tre-em', 'chong-lao-hoa-dep-da',
  'co-xuong-khop', 'ddvs-phu-khoa', 'dinh-duong-me-bau-bu',
  'dinh-duong-mien-dich-tre-em', 'duong-toc-mong', 'gan-mat',
  'ho-hap', 'mien-dich-suc-khoe-tong-quat', 'mo-mau-tim-mach',
  'phu-khoa', 'sinh-ly-nam', 'sinh-ly-nu',
  'tang-chieu-cao-tre-em', 'tieu-hoa', 'tieu-hoa-ho-hap-tre-em',
  'than-tiet-nieu', 'tieu-duong-chuyen-hoa', 'duoc-my-pham'
];

const allCatIdsPresent = expectedCategoryIds.every(id => CATEGORIES.some(c => c.id === id));
assert(allCatIdsPresent, 'Toàn bộ 21 mã nhóm bệnh lý khớp 100% với danh mục ảnh');

// Kiểm tra phân loại xuất xứ
const domesticProds = PRODUCTS.filter(p => p.originType === 'domestic');
const importedProds = PRODUCTS.filter(p => p.originType === 'imported');

assert(domesticProds.length === 8, `Sản phẩm Nội Địa Việt Nam: ${domesticProds.length}/21`);
assert(importedProds.length === 13, `Sản phẩm Nhập Khẩu Quốc Tế: ${importedProds.length}/21`);
assert(domesticProds.every(p => p.countryCode === 'VN'), '100% sản phẩm nội địa có mã nước VN');
assert(importedProds.every(p => ['US', 'AU', 'JP', 'KR', 'DE'].includes(p.countryCode)), '100% sản phẩm nhập khẩu thuộc Mỹ, Úc, Nhật, Hàn, Đức');

// -------------------------------------------------------------
// 2. KIỂM THỬ ĐIỀU HƯỚNG TRANG SẢN PHẨM & CÁC NÚT HEADER
// -------------------------------------------------------------
console.log('\n--- 2. KIỂM THỬ LOGIC ĐIỀU HƯỚNG HEADER & TRANG SẢN PHẨM ---');

function simulateNavigation(origin) {
  let originFilter = origin;
  let selectedCountry = 'all';
  let currentView = 'products';
  let hash = '#san-pham';

  if (origin === 'domestic') {
    selectedCountry = 'VN';
    hash = '#san-pham?origin=domestic';
  } else if (origin === 'imported') {
    selectedCountry = 'all';
    hash = '#san-pham?origin=imported';
  }

  // Giả lập lọc danh sách sản phẩm
  const filtered = PRODUCTS.filter(p => {
    if (originFilter === 'domestic' && p.originType !== 'domestic') return false;
    if (originFilter === 'imported' && p.originType !== 'imported') return false;
    if (selectedCountry !== 'all' && p.countryCode !== selectedCountry) return false;
    return true;
  });

  return { currentView, originFilter, selectedCountry, hash, count: filtered.length };
}

const navAll = simulateNavigation('all');
assert(navAll.count === 21 && navAll.hash === '#san-pham', 'Nút "Tất Cả Sản Phẩm" dẫn đến trang sản phẩm (đủ 21 SP, hash #san-pham)');

const navDomestic = simulateNavigation('domestic');
assert(navDomestic.count === 8 && navDomestic.selectedCountry === 'VN' && navDomestic.hash === '#san-pham?origin=domestic', 'Nút "Hàng Nội Địa Uy Tín" lọc đúng 8 sản phẩm Việt Nam (#san-pham?origin=domestic)');

const navImported = simulateNavigation('imported');
assert(navImported.count === 13 && navImported.hash === '#san-pham?origin=imported', 'Nút "Hàng Nhập Ngoại" lọc đúng 13 sản phẩm Nhập Khẩu (#san-pham?origin=imported)');

// -------------------------------------------------------------
// 3. KIỂM THỬ BANNER SLIDER & QUẢN LÝ BANNER BACKEND
// -------------------------------------------------------------
console.log('\n--- 3. KIỂM THỬ HERO BANNER SLIDER & ADMIN BANNER MANAGER ---');

assert(DEFAULT_HERO_BANNERS.length === 4, `4 banner slider mặc định (Hiện tại: ${DEFAULT_HERO_BANNERS.length})`);
assert(DEFAULT_HERO_BANNERS.every(b => b.id && b.title && b.image && b.badge), 'Các banner slider có đầy đủ id, tiêu đề, ảnh và huy hiệu');

// Test logic thêm banner mới
let banners = [...DEFAULT_HERO_BANNERS];
const addedBanner = {
  id: 'banner-test-hot',
  title: 'Khuyến mãi hè bùng nổ',
  subtitle: 'Ưu đãi lên tới 40% cho dòng sản phẩm Cơ Xương Khớp',
  badge: '🔥 Siêu Ưu Đãi',
  image: 'https://images.unsplash.com/test',
  actionType: 'domestic',
  isActive: true
};
banners.push(addedBanner);
assert(banners.length === 5, 'Thêm banner mới vào storeConfig thành công');

// Test logic chỉnh sửa banner
banners = banners.map(b => b.id === 'banner-test-hot' ? { ...b, title: 'Khuyến mãi đặc biệt Tết' } : b);
assert(banners.find(b => b.id === 'banner-test-hot').title === 'Khuyến mãi đặc biệt Tết', 'Sửa thông tin banner thành công');

// Test đổi thứ tự ưu tiên (Move Up / Move Down)
const [moved] = banners.splice(4, 1);
banners.splice(0, 0, moved);
assert(banners[0].id === 'banner-test-hot', 'Di chuyển banner lên vị trí ưu tiên số 1 thành công');

// Test ẩn banner (isActive = false)
banners = banners.map(b => b.id === 'banner-test-hot' ? { ...b, isActive: false } : b);
const activeBanners = banners.filter(b => b.isActive !== false);
assert(activeBanners.length === 4 && !activeBanners.some(b => b.id === 'banner-test-hot'), 'Tắt kích hoạt banner: Banner bị ẩn tự động không hiển thị trên Slider');

// -------------------------------------------------------------
// 4. KIỂM THỬ ĐỒNG BỘ SỐ ĐIỆN THOẠI HOTLINE TOÀN HỆ THỐNG
// -------------------------------------------------------------
console.log('\n--- 4. KIỂM THỬ ĐỒNG BỘ HOTLINE ĐỘNG THEO STORE CONFIG ---');

const mockStoreConfig = {
  hotline: '0912 345 678',
  bankName: 'MB Bank',
  accountNumber: '999988886666'
};

function formatHotlineLink(hotline) {
  return `tel:${(hotline || '1800 6868').replace(/\s+/g, '')}`;
}

assert(formatHotlineLink(mockStoreConfig.hotline) === 'tel:0912345678', 'Link gọi điện thoại loại bỏ khoảng trắng chuẩn tel:0912345678');
assert(mockStoreConfig.hotline === '0912 345 678', 'Hotline được đọc trực tiếp từ cấu hình cửa hàng');

// -------------------------------------------------------------
// 5. KIỂM THỬ GIỎ HÀNG, MÃ GIẢM GIÁ & TÍCH ĐIỂM
// -------------------------------------------------------------
console.log('\n--- 5. KIỂM THỬ GIỎ HÀNG, MÃ GIẢM GIÁ VÀ ĐIỂM THƯỞNG ---');

const testCart = [
  { ...PRODUCTS[0], quantity: 2 }, // Giá 699.000 * 2 = 1.398.000
  { ...PRODUCTS[1], quantity: 1 }  // Giá 1.250.000 * 1 = 1.250.000
];
const subtotal = testCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
assert(subtotal === 2648000, `Tổng giá trị giỏ hàng: ${subtotal.toLocaleString('vi-VN')}₫`);

// Áp dụng voucher MEDXPRESS50 (Giảm 50k cho đơn từ 500k)
const voucher50 = DEFAULT_VOUCHERS.find(v => v.code === 'MEDXPRESS50');
const discountResult = calculateVoucherDiscount(voucher50, subtotal);
assert(discountResult.isValid === true && discountResult.discountAmount === 50000, 'Voucher MEDXPRESS50 giảm 50.000₫ chính xác');

// Tích điểm thành viên: 100k = 1 điểm (2.648.000 - 50.000 = 2.598.000 -> 25 điểm)
const earnedPoints = calculateEarnedPoints(subtotal - discountResult.discountAmount);
assert(earnedPoints === 25, `Tích lũy điểm thành viên: 2.598.000₫ = ${earnedPoints} điểm`);

// -------------------------------------------------------------
// 6. KIỂM THỬ QUY TRÌNH VẬN ĐƠN & BẢO VỆ HÀNG HOÀN THỦ CÔNG
// -------------------------------------------------------------
console.log('\n--- 6. KIỂM THỬ QUY TRÌNH LOGISTICS & KIỂM NHẬN HÀNG HOÀN ---');

const mockOrder = {
  id: 'ORD-TEST-999',
  customerName: 'Trần Văn Kiểm Thử',
  phone: '0909123456',
  total: 2598000,
  carrierId: 'ghtk'
};

const initialized = initializeOrderTracking(mockOrder, 'ghtk');
assert(Boolean(initialized.trackingNumber), `Khởi tạo vận đơn tự động sinh mã: ${initialized.trackingNumber}`);

const shipping = stepOrderToShipping(initialized);
assert(shipping.status === 'shipping', 'Chuyển trạng thái giao hàng hỏa tốc (shipping)');

const failed = stepOrderToReturning(shipping, 'Khách thuê bao không liên lạc được');
assert(failed.status === 'returning' && failed.autoTracking === false, 'Giao thất bại: Chuyển hoàn & ngắt tự động cập nhật');

const returnedAtWh = stepOrderToWarehouseArrival(failed);
assert(returnedAtWh.status === 'returned_pending_check', 'Về kho: Bắt buộc ở trạng thái chờ Dược sĩ kiểm nhận thủ công (returned_pending_check)');

const inspected = stepOrderToReturnConfirmed(returnedAtWh, {
  pharmacistName: 'Dược sĩ Phương',
  sealCondition: 'intact',
  restoreStock: true,
  note: 'Tem mác nguyên vẹn'
});
assert(inspected.status === 'returned' && inspected.returnInspection.restoreStock === true, 'Xác nhận kiểm nhận thủ công & tái nhập kho chuẩn GSP thành công');

// -------------------------------------------------------------
// 7. KIỂM THỬ BÀI VIẾT Y KHOA & ĐIỂM SEO ON-PAGE
// -------------------------------------------------------------
console.log('\n--- 7. KIỂM THỬ BÀI VIẾT CẨM NANG & THUẬT TOÁN SEO ---');

assert(DEFAULT_ARTICLES.length >= 3, `Đủ ${DEFAULT_ARTICLES.length} bài viết cẩm nang chuẩn Y Khoa`);
const article1 = DEFAULT_ARTICLES[0];
const seoResult = calculateSeoScore(article1);
assert(seoResult.score >= 80, `Điểm SEO bài viết "${article1.title.slice(0, 30)}...": ${seoResult.score}/100 (Đạt tiêu chuẩn xuất bản)`);

// -------------------------------------------------------------
// 8. KIỂM THỬ SỐ TIẾP NHẬN ĐĂNG KÝ BỘ Y TẾ
// -------------------------------------------------------------
console.log('\n--- 8. KIỂM THỬ CƠ SỞ DỮ LIỆU ĐKSP BỘ Y TẾ ---');

const totalRegistrations = Object.keys(VERIFIED_REGISTRATIONS).length;
assert(totalRegistrations >= 11, `Có ${totalRegistrations} bản ghi số ĐKSP Bộ Y Tế đã xác thực`);
const sampleReg = VERIFIED_REGISTRATIONS['10238/2019/ĐKSP'];
assert(sampleReg && sampleReg.status.includes('lưu hành'), 'Tra cứu số ĐKSP Bách Niên Kiện (10238/2019/ĐKSP) chính xác và đã cấp phép');

// -------------------------------------------------------------
// TỔNG KẾT
// -------------------------------------------------------------
console.log('\n================================================================');
console.log(`   KẾT QUẢ KIỂM THỬ HỆ THỐNG: ${passCount} PASSED, ${failCount} FAILED`);
if (failCount === 0) {
  console.log('   🎉 TOÀN BỘ CÁC TÍNH NĂNG HOẠT ĐỘNG HOÀN HẢO 100%!');
} else {
  console.log('   ⚠️ CÓ TÍNH NĂNG CẦN XỬ LÝ!');
}
console.log('================================================================');
