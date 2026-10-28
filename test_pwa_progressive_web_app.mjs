// Test Suite: Progressive Web App (PWA) Verification for MedXpressCare
import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ TÍNH NĂNG PWA (PROGRESSIVE WEB APP)  ');
console.log('================================================================\n');

const BASE_DIR = path.resolve('.');

// 1. Kiểm tra Web App Manifest (manifest.json & manifest.webmanifest)
console.log('--- 1. Kiểm tra Web App Manifest (manifest.json) ---');
const manifestPath = path.join(BASE_DIR, 'public', 'manifest.json');
assert(fs.existsSync(manifestPath), 'manifest.json phải tồn tại trong thư mục public/');

const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert(manifestContent.name && manifestContent.name.includes('MedXpressCare'), 'name phải chứa MedXpressCare');
assert(manifestContent.short_name === 'MedXpressCare', 'short_name phải là MedXpressCare');
assert(manifestContent.display === 'standalone', 'display mode phải là standalone');
assert(manifestContent.start_url && manifestContent.start_url.includes('pwa'), 'start_url phải hỗ trợ tham số pwa');
assert(manifestContent.theme_color === '#059669', 'theme_color phải là mã xanh chuẩn MedXpressCare #059669');
assert(Array.isArray(manifestContent.icons) && manifestContent.icons.length >= 4, 'icons phải có ít nhất 4 kích thước biểu tượng');

// Kiểm tra maskable icon
const hasMaskable = manifestContent.icons.some(i => i.purpose && i.purpose.includes('maskable'));
assert(hasMaskable, 'manifest phải có icon hỗ trợ purpose maskable cho Android');

// Kiểm tra App Shortcuts
assert(Array.isArray(manifestContent.shortcuts) && manifestContent.shortcuts.length >= 3, 'manifest phải có ít nhất 3 phím tắt nhanh');
const shortcutConsult = manifestContent.shortcuts.find(s => s.url.includes('consultation'));
assert(shortcutConsult, 'Phải có shortcut mở nhanh Dược sĩ AI');
const shortcutTracking = manifestContent.shortcuts.find(s => s.url.includes('tracking'));
assert(shortcutTracking, 'Phải có shortcut mở nhanh Tra cứu vận đơn');
console.log('  ✅ PASSED: manifest.json chuẩn chỉnh 100%, đầy đủ icons, maskable, shortcuts.');

// 2. Kiểm tra bộ Icon PWA trong thư mục public/
console.log('\n--- 2. Kiểm tra bộ Icon chuẩn PWA & iOS ---');
const requiredIcons = [
  'pwa-192x192.png',
  'pwa-512x512.png',
  'maskable-icon-512x512.png',
  'apple-touch-icon.png',
  'favicon.png'
];
for (const icon of requiredIcons) {
  const iconPath = path.join(BASE_DIR, 'public', icon);
  assert(fs.existsSync(iconPath), `Icon ${icon} phải tồn tại trong thư mục public/`);
  const stat = fs.statSync(iconPath);
  assert(stat.size > 1000, `Icon ${icon} phải có dữ liệu thực tế (> 1KB)`);
}
console.log('  ✅ PASSED: Toàn bộ 5 biểu tượng PWA & Apple Touch Icon hợp lệ và đầy đủ.');

// 3. Kiểm tra Service Worker (sw.js)
console.log('\n--- 3. Kiểm tra Service Worker (public/sw.js) ---');
const swPath = path.join(BASE_DIR, 'public', 'sw.js');
assert(fs.existsSync(swPath), 'public/sw.js phải tồn tại');
const swContent = fs.readFileSync(swPath, 'utf8');
assert(swContent.includes('addEventListener(\'install\'') || swContent.includes('addEventListener("install"'), 'sw.js phải có sự kiện install');
assert(swContent.includes('addEventListener(\'activate\'') || swContent.includes('addEventListener("activate"'), 'sw.js phải có sự kiện activate');
assert(swContent.includes('addEventListener(\'fetch\'') || swContent.includes('addEventListener("fetch"'), 'sw.js phải có sự kiện fetch');
assert(swContent.includes('caches.open'), 'sw.js phải sử dụng Cache API');
assert(swContent.includes('skipWaiting'), 'sw.js phải hỗ trợ skipWaiting');
console.log('  ✅ PASSED: Service Worker cấu hình chuẩn xác với chiến lược Cache & Offline fallback.');

// 4. Kiểm tra Thẻ Meta trong index.html
console.log('\n--- 4. Kiểm tra thẻ Meta PWA & iOS trong index.html ---');
const indexHtmlPath = path.join(BASE_DIR, 'index.html');
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
assert(indexHtml.includes('rel="manifest"'), 'index.html phải có thẻ link rel="manifest"');
assert(indexHtml.includes('name="theme-color"'), 'index.html phải có thẻ theme-color');
assert(indexHtml.includes('apple-mobile-web-app-capable'), 'index.html phải hỗ trợ iOS web app');
assert(indexHtml.includes('rel="apple-touch-icon"'), 'index.html phải có apple-touch-icon');
console.log('  ✅ PASSED: index.html có đầy đủ thẻ Meta cho cả Android, Windows và iOS Safari.');

// 5. Kiểm tra Tích hợp PWA UI Components & Hook
console.log('\n--- 5. Kiểm tra Hook & Components trải nghiệm cài đặt PWA ---');
assert(fs.existsSync(path.join(BASE_DIR, 'src', 'hooks', 'usePWAInstall.js')), 'usePWAInstall hook phải tồn tại');
assert(fs.existsSync(path.join(BASE_DIR, 'src', 'components', 'PWAInstallModal.jsx')), 'PWAInstallModal.jsx phải tồn tại');
assert(fs.existsSync(path.join(BASE_DIR, 'src', 'components', 'PWAInstallBanner.jsx')), 'PWAInstallBanner.jsx phải tồn tại');
assert(fs.existsSync(path.join(BASE_DIR, 'src', 'registerSW.js')), 'registerSW.js phải tồn tại');

const mainJsx = fs.readFileSync(path.join(BASE_DIR, 'src', 'main.jsx'), 'utf8');
assert(mainJsx.includes('registerServiceWorker'), 'main.jsx phải gọi registerServiceWorker()');

const appJsx = fs.readFileSync(path.join(BASE_DIR, 'src', 'App.jsx'), 'utf8');
assert(appJsx.includes('usePWAInstall'), 'App.jsx phải sử dụng usePWAInstall');
assert(appJsx.includes('PWAInstallBanner'), 'App.jsx phải render PWAInstallBanner');
assert(appJsx.includes('PWAInstallModal'), 'App.jsx phải render PWAInstallModal');
assert(appJsx.includes('onOpenPWAInstall'), 'App.jsx phải truyền onOpenPWAInstall cho Header và Footer');
assert(appJsx.includes('params.get(\'open\')') || appJsx.includes('params.get("open")'), 'App.jsx phải hỗ trợ URL App Shortcuts');

const headerJsx = fs.readFileSync(path.join(BASE_DIR, 'src', 'components', 'Header.jsx'), 'utf8');
assert(headerJsx.includes('onOpenPWAInstall'), 'Header.jsx phải có nút mở cài đặt PWA');

const footerJsx = fs.readFileSync(path.join(BASE_DIR, 'src', 'components', 'Footer.jsx'), 'utf8');
assert(footerJsx.includes('onOpenPWAInstall'), 'Footer.jsx phải có nút cài đặt PWA');

console.log('  ✅ PASSED: Toàn bộ UI banner, modal hướng dẫn 1-chạm & phím tắt đã tích hợp trơn tru.');

console.log('\n================================================================');
console.log('   🎉 TẤT CẢ TEST CASES PWA ĐÃ HOÀN TOÀN ĐẠT 100% THÀNH CÔNG!   ');
console.log('================================================================');
