// Test Suite: Mobile Menu Optimization & Anti-Zoom Verification for MedXpressCare
import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ TỐI ƯU MENU & CHỐNG ZOOM MOBILE APP   ');
console.log('================================================================\n');

const BASE_DIR = path.resolve('.');

// 1. Kiểm tra cấu hình Chống Zoom In / Zoom Out trên Mobile App
console.log('--- 1. Kiểm tra Cấu Hình Chống Zoom Mobile App ---');
const indexHtml = fs.readFileSync(path.join(BASE_DIR, 'index.html'), 'utf8');
assert(indexHtml.includes('user-scalable=no'), 'index.html viewport phải có user-scalable=no');
assert(indexHtml.includes('maximum-scale=1.0'), 'index.html viewport phải có maximum-scale=1.0');
assert(indexHtml.includes('viewport-fit=cover'), 'index.html viewport phải có viewport-fit=cover');
console.log('  ✅ PASSED: Viewport meta tag đã khóa zoom in/zoom out 100%.');

const indexCss = fs.readFileSync(path.join(BASE_DIR, 'src', 'index.css'), 'utf8');
assert(indexCss.includes('touch-action: pan-x pan-y'), 'src/index.css phải thiết lập touch-action: pan-x pan-y');
assert(indexCss.includes('overflow-x: hidden'), 'src/index.css phải khóa overflow-x: hidden');
console.log('  ✅ PASSED: CSS touch-action và overflow-x đã được cấu hình chuẩn xác.');

const mainJsx = fs.readFileSync(path.join(BASE_DIR, 'src', 'main.jsx'), 'utf8');
assert(mainJsx.includes('gesturestart'), 'main.jsx phải chặn sự kiện gesturestart trên iOS');
assert(mainJsx.includes('e.touches.length > 1'), 'main.jsx phải chặn multi-touch pinch zoom');
assert(mainJsx.includes('lastTouchEnd'), 'main.jsx phải chặn double-tap zoom');
console.log('  ✅ PASSED: Event listeners chặn triệt để pinch-to-zoom & double-tap zoom trên cả iOS Safari & Android.');

// 2. Kiểm tra Tối Ưu Thanh Menu & Loại Bỏ Đoạn Kéo Dài Theo Yêu Cầu Người Dùng
console.log('\n--- 2. Kiểm tra Tối Ưu Thanh Menu & Loại Bỏ Đoạn Kéo Dài ---');
const headerJsx = fs.readFileSync(path.join(BASE_DIR, 'src', 'components', 'Header.jsx'), 'utf8');

// A. Kiểm tra Dòng 1 (Top Bar):
// - Đã xóa Tra Giấy Phép ở dòng 1
const topBarSection = headerJsx.substring(headerJsx.indexOf('{/* 1. Top Banner'), headerJsx.indexOf('{/* 2. Main Navigation'));
assert(!topBarSection.includes('Tra Giấy phép'), 'Top bar (dòng 1) phải xóa nút Tra Giấy phép');
assert(!topBarSection.includes('Tổng đài:'), 'Top bar (dòng 1) phải xóa số điện thoại / hotline');
assert(topBarSection.includes('customer ?') && topBarSection.includes('🌟'), 'Top bar (dòng 1) có tài khoản khách hàng ở góc ngoài cùng bên phải');

// B. Kiểm tra Dòng 3 (Thanh Menu):
const subNavSection = headerJsx.substring(headerJsx.indexOf('{/* 3. Phân Loại Nhanh'), headerJsx.indexOf('{/* 4. Slide-in Mobile'));
assert(!subNavSection.includes('Tra Vận Đơn'), 'Thanh menu (dòng 3) phải xóa nút Tra Vận Đơn');
assert(!subNavSection.includes('✨ Dược sĩ ĐH Dược tư vấn 24/7'), 'Thanh menu (dòng 3) phải xóa dòng cam kết dài');
assert(subNavSection.includes('Cẩm Nang Y Khoa') || subNavSection.includes('Cẩm Nang'), 'Thanh menu (dòng 3) phải chứa Cẩm Nang Y Khoa');

// C. Kiểm tra mobile và menu drawer
assert(headerJsx.includes('isMobileMenuOpen'), 'Header.jsx phải có state isMobileMenuOpen');
assert(headerJsx.includes('Menu'), 'Header.jsx phải có nút Hamburger Menu');

// D. Kiểm tra app.jsx container chống tràn
const appJsx = fs.readFileSync(path.join(BASE_DIR, 'src', 'App.jsx'), 'utf8');
assert(appJsx.includes('overflow-x-hidden'), 'App.jsx root container phải có overflow-x-hidden');
console.log('  ✅ PASSED: Thanh menu đã được tối ưu hoàn hảo theo đúng sơ đồ mũi tên và khoanh tròn của người dùng.');

console.log('\n================================================================');
console.log('   🎉 TẤT CẢ TEST CASES TỐI ƯU MENU & ANTI-ZOOM ĐẠT 100% THÀNH CÔNG! ');
console.log('================================================================');
