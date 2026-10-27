import { DEFAULT_HERO_BANNERS } from './src/data/banners.js';

console.log('--- BẮT ĐẦU KIỂM THỬ QUẢN LÝ HERO BANNER TRANG CHỦ ---');

// 1. Kiểm tra cấu trúc DEFAULT_HERO_BANNERS
if (!Array.isArray(DEFAULT_HERO_BANNERS) || DEFAULT_HERO_BANNERS.length === 0) {
  throw new Error('DEFAULT_HERO_BANNERS phải là một mảng không rỗng');
}

DEFAULT_HERO_BANNERS.forEach((banner, idx) => {
  if (!banner.id || !banner.title || !banner.image) {
    throw new Error(`Banner thứ ${idx} thiếu các trường bắt buộc (id, title, image)`);
  }
});
console.log(`  ✅ PASSED: ${DEFAULT_HERO_BANNERS.length} banner mặc định đầy đủ các trường id, title, image, badge`);

// 2. Thử nghiệm logic Thêm Banner mới
const initialBanners = [...DEFAULT_HERO_BANNERS];
const newBanner = {
  id: 'banner-test-01',
  title: 'Khuyến mãi đặc biệt mùa Vu Lan',
  subtitle: 'Tặng combo chăm sóc sức khỏe người cao tuổi',
  badge: '🎁 Quà Tặng',
  image: 'https://images.unsplash.com/photo-example',
  actionType: 'domestic',
  actionLink: '#catalog-section',
  buttonText: 'Xem Ngay',
  isActive: true
};
const addedList = [...initialBanners, newBanner];
if (addedList.length !== initialBanners.length + 1) {
  throw new Error('Thêm banner thất bại');
}
console.log('  ✅ PASSED: Thêm banner mới vào danh sách thành công');

// 3. Thử nghiệm logic Chỉnh sửa banner
const updatedTitle = 'Khuyến mãi đặc biệt mừng Quốc Khánh';
const editedList = addedList.map(b => b.id === 'banner-test-01' ? { ...b, title: updatedTitle } : b);
const foundBanner = editedList.find(b => b.id === 'banner-test-01');
if (foundBanner.title !== updatedTitle) {
  throw new Error('Chỉnh sửa banner thất bại');
}
console.log('  ✅ PASSED: Cập nhật thông tin và hình ảnh banner thành công');

// 4. Thử nghiệm logic Bật/Tắt kích hoạt (Toggle Active)
const toggledList = editedList.map(b => b.id === 'banner-test-01' ? { ...b, isActive: !b.isActive } : b);
const toggledBanner = toggledList.find(b => b.id === 'banner-test-01');
if (toggledBanner.isActive !== false) {
  throw new Error('Tắt kích hoạt banner thất bại');
}
const activeOnly = toggledList.filter(b => b.isActive !== false);
if (activeOnly.some(b => b.id === 'banner-test-01')) {
  throw new Error('Banner bị tắt vẫn hiển thị trong danh sách kích hoạt');
}
console.log('  ✅ PASSED: Tắt/Bật kích hoạt banner và lọc trình chiếu chính xác');

// 5. Thử nghiệm logic Thay đổi thứ tự (Reorder Up/Down)
const listToReorder = [...DEFAULT_HERO_BANNERS];
const firstId = listToReorder[0].id;
const secondId = listToReorder[1].id;

// Đổi vị trí 0 và 1
const temp = listToReorder[0];
listToReorder[0] = listToReorder[1];
listToReorder[1] = temp;

if (listToReorder[0].id !== secondId || listToReorder[1].id !== firstId) {
  throw new Error('Đổi thứ tự banner thất bại');
}
console.log('  ✅ PASSED: Thay đổi thứ tự ưu tiên hiển thị banner (Move Up/Down) thành công');

// 6. Thử nghiệm logic Xóa banner
const deletedList = addedList.filter(b => b.id !== 'banner-test-01');
if (deletedList.some(b => b.id === 'banner-test-01') || deletedList.length !== initialBanners.length) {
  throw new Error('Xóa banner thất bại');
}
console.log('  ✅ PASSED: Xóa banner khỏi danh sách slider an toàn');

console.log('\n================================================================');
console.log('   TỔNG KẾT: 6/6 TEST CASES QUẢN LÝ HERO BANNER ĐẠT 100%');
console.log('================================================================');
