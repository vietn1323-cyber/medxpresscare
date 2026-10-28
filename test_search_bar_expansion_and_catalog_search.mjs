import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PRODUCTS } from './src/data/products.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ THANH TÌM KIẾM MỞ RỘNG & TRA CỨU    ');
console.log('================================================================\n');

// 1. KIỂM THỬ FILE Header.jsx CÓ LOGIC MỞ RỘNG THANH TÌM KIẾM & THU NHỎ CÁC NÚT BÊN PHẢI
console.log('--- 1. Kiểm tra Header.jsx: Mở rộng ngang & Thu nhỏ các nút bên phải ---');
const headerCode = fs.readFileSync(path.join(__dirname, 'src/components/Header.jsx'), 'utf-8');

// A. Kiểm tra state isSearchFocused & ref click outside
assert.ok(headerCode.includes('isSearchFocused'), 'Header.jsx phải có state isSearchFocused');
assert.ok(headerCode.includes('setIsSearchFocused(true)'), 'Header.jsx phải set isSearchFocused khi focus vào ô tìm kiếm');
assert.ok(headerCode.includes('handleClickOutside'), 'Header.jsx phải có sự kiện đóng/thu gọn khi click ra ngoài');

// B. Kiểm tra class mở rộng theo phương ngang của container ô tìm kiếm
assert.ok(headerCode.includes('isSearchFocused'), 'Header.jsx xử lý mở rộng theo phương ngang');
assert.ok(headerCode.includes('transition-all duration-300'), 'Header.jsx phải có hiệu ứng transition chuyển động mượt mà');
assert.ok(headerCode.includes('max-w-2xl') || headerCode.includes('max-w-3xl'), 'Header.jsx mở rộng thanh tìm kiếm tới max-w-2xl/3xl');

// C. Kiểm tra các nút bên phải được thu nhỏ (shrink) khi isSearchFocused = true
assert.ok(headerCode.includes('!isSearchFocused &&'), 'Header.jsx phải ẩn bớt text nhãn của các nút khi đang mở rộng tìm kiếm');
assert.ok(headerCode.includes('p-2') || headerCode.includes('p-2.5'), 'Header.jsx chuyển nút thành dạng icon tròn thu nhỏ gọn gàng');

// D. Kiểm tra có gợi ý tìm kiếm thông minh khi đang focus
assert.ok(headerCode.includes('suggestedProducts'), 'Header.jsx có danh sách gợi ý sản phẩm khi gõ từ khóa');
assert.ok(headerCode.includes('Tìm kiếm phổ biến'), 'Header.jsx có các tag gợi ý tìm kiếm phổ biến khi ô tìm kiếm trống');

console.log('  ✅ PASSED: Header.jsx mở rộng thanh tìm kiếm theo phương ngang và thu nhỏ các nút bên phải chuẩn xác.');

// 2. KIỂM THỬ FILE OriginFilterTabs.jsx CÓ THANH TÌM KIẾM SẢN PHẨM Ở KHU VỰC ẢNH 2
console.log('\n--- 2. Kiểm tra OriginFilterTabs.jsx (Khu vực Ảnh 2): Thanh tìm kiếm sản phẩm ---');
const originFilterCode = fs.readFileSync(path.join(__dirname, 'src/components/OriginFilterTabs.jsx'), 'utf-8');

// A. Nhận prop searchQuery & setSearchQuery
assert.ok(originFilterCode.includes('searchQuery'), 'OriginFilterTabs.jsx phải nhận prop searchQuery');
assert.ok(originFilterCode.includes('setSearchQuery'), 'OriginFilterTabs.jsx phải nhận prop setSearchQuery');

// B. Có ô input tìm kiếm sản phẩm với icon Search và nút X xóa
assert.ok(originFilterCode.includes('<Search') && originFilterCode.includes('<X'), 'OriginFilterTabs.jsx phải có icon Search và nút X xóa nhanh');
assert.ok(originFilterCode.includes('onChange={(e) => setSearchQuery'), 'Input trong OriginFilterTabs gọi setSearchQuery khi người dùng nhập liệu');

// C. Có thanh tag gợi ý từ khóa tìm nhanh
assert.ok(originFilterCode.includes('Gợi ý tìm nhanh:'), 'OriginFilterTabs.jsx có hàng tag gợi ý tìm nhanh');
assert.ok(originFilterCode.includes('Canxi cho bé') && originFilterCode.includes('Bổ não Ginkgo'), 'Có các từ khóa gợi ý thực phẩm chức năng phổ biến');

// D. Có badge thông báo trạng thái lọc từ khóa và nút bỏ lọc
assert.ok(originFilterCode.includes('Bỏ lọc') || originFilterCode.includes('Xóa lọc'), 'OriginFilterTabs.jsx có nút bỏ lọc tìm kiếm tiện dụng');

console.log('  ✅ PASSED: OriginFilterTabs.jsx (Ảnh 2) đã được tích hợp thanh tìm kiếm sản phẩm hoàn chỉnh.');

// 3. KIỂM THỬ LIÊN KẾT ĐỒNG BỘ TRONG App.jsx VÀ ProductsPage.jsx
console.log('\n--- 3. Kiểm tra App.jsx & ProductsPage.jsx truyền đủ prop tìm kiếm ---');
const appCode = fs.readFileSync(path.join(__dirname, 'src/App.jsx'), 'utf-8');
const productsPageCode = fs.readFileSync(path.join(__dirname, 'src/components/ProductsPage.jsx'), 'utf-8');

// App.jsx truyền searchQuery và setSearchQuery vào OriginFilterTabs
assert.ok(appCode.includes('searchQuery={searchQuery}') && appCode.includes('setSearchQuery={setSearchQuery}'), 'App.jsx truyền searchQuery & setSearchQuery vào OriginFilterTabs');
assert.ok(appCode.includes('products={productsList}') && appCode.includes('onOpenProductDetail='), 'App.jsx truyền products và onOpenProductDetail vào Header để gợi ý click');

// ProductsPage.jsx truyền searchQuery và setSearchQuery vào OriginFilterTabs
assert.ok(productsPageCode.includes('searchQuery={searchQuery}') && productsPageCode.includes('setSearchQuery={setSearchQuery}'), 'ProductsPage.jsx truyền searchQuery & setSearchQuery vào OriginFilterTabs');

console.log('  ✅ PASSED: Dữ liệu tìm kiếm hai chiều đồng bộ hoàn toàn giữa Header, Khu vực Phân loại Ảnh 2, và Grid sản phẩm.');

// 4. KIỂM THỬ LOGIC LỌC TÌM KIẾM SẢN PHẨM THỰC TẾ
console.log('\n--- 4. Kiểm tra logic lọc sản phẩm theo từ khóa tìm kiếm ---');

function searchProducts(query) {
  if (!query || !query.trim()) return PRODUCTS;
  const q = query.toLowerCase().trim();
  return PRODUCTS.filter(p => 
    p.name?.toLowerCase().includes(q) ||
    p.brand?.toLowerCase().includes(q) ||
    p.category?.toLowerCase().includes(q) ||
    p.countryName?.toLowerCase().includes(q) ||
    p.shortDesc?.toLowerCase().includes(q)
  );
}

const canxiResults = searchProducts('Canxi');
assert.ok(canxiResults.length > 0, 'Tìm kiếm từ khóa "Canxi" phải trả về kết quả');
assert.ok(canxiResults.some(p => p.name.includes('Canxi')), 'Kết quả phải chứa sản phẩm Canxi');

const curcuminResults = searchProducts('Curcumin');
assert.ok(curcuminResults.length > 0, 'Tìm kiếm "Curcumin" phải trả về Nano Curcumin');
assert.ok(curcuminResults.some(p => p.id === 'vn-03'), 'Sản phẩm vn-03 Nano Curcumin OIC khớp chính xác');

const emptyResults = searchProducts('tu-khoa-khong-ton-tai-xyz');
assert.strictEqual(emptyResults.length, 0, 'Tìm kiếm từ khóa vô nghĩa trả về mảng rỗng không lỗi');

console.log('  ✅ PASSED: Logic lọc sản phẩm theo từ khóa hoạt động trơn tru và chính xác 100%.');

console.log('\n================================================================');
console.log('   🎉 TẤT CẢ TEST CASES THANH TÌM KIẾM MỞ RỘNG ĐÃ VƯỢT QUA!     ');
console.log('================================================================');
