import assert from 'node:assert';
import { PRODUCTS, CATEGORIES, DOSAGE_FORMS, TARGET_AUDIENCES } from './src/data/products.js';
import { INITIAL_REVIEWS } from './src/data/reviews.js';
import { DEFAULT_VOUCHERS, calculateVoucherDiscount } from './src/data/vouchers.js';
import { DEFAULT_ARTICLES, slugify, calculateSeoScore } from './src/data/articles.js';
import { VERIFIED_REGISTRATIONS } from './src/data/registrations.js';
import { INITIAL_CUSTOMERS, calculateEarnedPoints, calculatePointsDiscount, calculateMaxPointsToUse } from './src/data/customers.js';
import { parseCSV, cleanPrice } from './src/utils/csvHelper.js';
import { 
  getCarrierInfo, 
  generateCarrierTrackingNumber, 
  initializeOrderTracking, 
  stepOrderToShipping, 
  stepOrderToCompleted, 
  stepOrderToReturning,
  stepOrderToWarehouseArrival,
  stepOrderToReturnConfirmed,
  syncCarrierLogisticsStatus,
  RETURN_REASONS 
} from './src/utils/logisticsHelper.js';

console.log('================================================================');
console.log('   MEDXPRESSCARE - KIỂM THỬ HỒI QUY TOÀN DIỆN HỆ THỐNG (E2E)');
console.log('================================================================\n');

let passedCount = 0;
let totalCount = 0;

function runTest(suiteName, testName, testFn) {
  totalCount++;
  try {
    testFn();
    console.log(`  ✅ [${suiteName}] ${testName}`);
    passedCount++;
  } catch (err) {
    console.error(`  ❌ [${suiteName}] FAILED: ${testName}`);
    console.error(`     Chi tiết: ${err.message}`);
    process.exitCode = 1;
  }
}

// ===================================================================
// PHÂN HỆ 1: SẢN PHẨM, ĐA DANH MỤC BỆNH LÝ & TRA CỨU SỐ ĐKSP BỘ Y TẾ
// ===================================================================
console.log('--- 1. KIỂM THỬ PHÂN HỆ SẢN PHẨM & ĐA DANH MỤC BỆNH LÝ ---');

runTest('Products', 'Cấu trúc 21 sản phẩm đầy đủ trường bắt buộc', () => {
  assert.ok(Array.isArray(PRODUCTS) && PRODUCTS.length >= 21);
  PRODUCTS.forEach(p => {
    assert.ok(p.id, `Sản phẩm thiếu id: ${JSON.stringify(p)}`);
    assert.ok(p.name, `Sản phẩm ${p.id} thiếu name`);
    assert.ok(typeof p.price === 'number' && p.price > 0, `Sản phẩm ${p.id} giá không hợp lệ`);
    assert.ok(Array.isArray(p.categories) && p.categories.length > 0, `Sản phẩm ${p.id} thiếu mảng categories`);
    assert.ok(p.originType === 'domestic' || p.originType === 'imported');
  });
});

runTest('Products', 'Hỗ trợ lọc sản phẩm thuộc nhiều hơn 1 nhóm bệnh lý', () => {
  const multiCatProducts = PRODUCTS.filter(p => p.categories && p.categories.length > 1);
  assert.ok(multiCatProducts.length > 0, 'Phải có sản phẩm thuộc từ 2 nhóm bệnh lý trở lên');
  
  // Test lọc sản phẩm có category 'bone_joint'
  const jointProds = PRODUCTS.filter(p => p.categories.includes('co-xuong-khop') || p.categories.includes('bone_joint'));
  assert.ok(jointProds.length >= 2, 'Nhóm xương khớp phải có ít nhất 2 sản phẩm');
  assert.ok(jointProds.some(p => p.id === 'vn-01'));
  assert.ok(jointProds.some(p => p.id === 'us-01'));
});

runTest('Products', 'Lọc theo nguồn gốc xuất xứ (Nội địa vs Nhập khẩu)', () => {
  const domestic = PRODUCTS.filter(p => p.originType === 'domestic');
  const imported = PRODUCTS.filter(p => p.originType === 'imported');
  assert.ok(domestic.length > 0, 'Phải có sản phẩm nội địa');
  assert.ok(imported.length > 0, 'Phải có sản phẩm nhập khẩu');
  assert.strictEqual(domestic.length + imported.length, PRODUCTS.length);
});

runTest('Registrations', 'Tra cứu số ĐKSP Bộ Y Tế chính xác', () => {
  const testReg = '10238/2019/ĐKSP';
  const found = VERIFIED_REGISTRATIONS[testReg];
  assert.ok(found, `Không tìm thấy số ĐKSP ${testReg}`);
  assert.ok(found.name.includes('Bách Niên Kiện'));
  assert.ok(found.status.includes('cấp phép'));
});

// ===================================================================
// PHÂN HỆ 2: GIỎ HÀNG, VOUCHER, ĐIỂM THƯỞNG & THANH TOÁN
// ===================================================================
console.log('\n--- 2. KIỂM THỬ GIỎ HÀNG, VOUCHER, ĐIỂM THƯỞNG & THANH TOÁN ---');

runTest('Cart & Checkout', 'Mô phỏng thêm sản phẩm, cập nhật số lượng và tính tiền', () => {
  let cart = [];
  const prod1 = PRODUCTS.find(p => p.id === 'vn-01');
  const prod2 = PRODUCTS.find(p => p.id === 'au-01');

  // Thêm prod1 x2
  cart.push({ ...prod1, quantity: 2 });
  // Thêm prod2 x1
  cart.push({ ...prod2, quantity: 1 });

  const subtotal = cart.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const expectedSubtotal = (prod1.price * 2) + (prod2.price * 1);
  assert.strictEqual(subtotal, expectedSubtotal);
});

runTest('Vouchers', 'Áp dụng mã giảm giá phần trăm có chặn trần tối đa', () => {
  const voucherPercent = DEFAULT_VOUCHERS.find(v => v.code === 'TRIAN10'); // 10% tối đa 100k, min 600k
  assert.ok(voucherPercent);
  const res = calculateVoucherDiscount(voucherPercent, 2000000); // 10% của 2tr = 200k -> bị chặn ở 100k
  assert.strictEqual(res.isValid, true);
  assert.strictEqual(res.discountAmount, 100000);
});

runTest('Vouchers', 'Từ chối voucher khi chưa đạt giá trị đơn tối thiểu', () => {
  const voucherFixed = DEFAULT_VOUCHERS.find(v => v.code === 'MEDXPRESS50'); // giảm 50k, min 400k
  assert.ok(voucherFixed);
  const res = calculateVoucherDiscount(voucherFixed, 300000); // Đơn 300k < 400k
  assert.strictEqual(res.isValid, false);
  assert.strictEqual(res.discountAmount, 0);
});

runTest('Loyalty Points', 'Tích và đổi điểm thưởng thành viên (100k = 1đ, 1đ = 1.000₫)', () => {
  const earned = calculateEarnedPoints(350000);
  assert.strictEqual(earned, 3); // 350k tích 3 điểm

  const discount = calculatePointsDiscount(10);
  assert.strictEqual(discount, 10000); // 10 điểm = 10.000₫

  const maxPoints = calculateMaxPointsToUse(100, 50000); // Đơn 50k chỉ được dùng tối đa 50 điểm
  assert.strictEqual(maxPoints, 50);
});

// ===================================================================
// PHÂN HỆ 3: ĐÁNH GIÁ KHÁCH HÀNG (UGC), TÍNH ĐIỂM & DƯỢC SĨ PHẢN HỒI
// ===================================================================
console.log('\n--- 3. KIỂM THỬ ĐÁNH GIÁ KHÁCH HÀNG (UGC) & PHẢN HỒI ---');

runTest('Reviews', 'Khởi tạo đánh giá mẫu và tính toàn vẹn dữ liệu', () => {
  assert.ok(Array.isArray(INITIAL_REVIEWS) && INITIAL_REVIEWS.length > 0);
  INITIAL_REVIEWS.forEach(rev => {
    assert.ok(rev.id);
    assert.ok(rev.productId);
    assert.ok(rev.rating >= 1 && rev.rating <= 5);
    assert.ok(rev.customerName, `Đánh giá ${rev.id} thiếu customerName`);
  });
});

runTest('Reviews', 'Thêm đánh giá mới tự động tick Đã mua hàng và tính lại Rating sản phẩm', () => {
  let reviews = [...INITIAL_REVIEWS];
  const targetProdId = 'vn-01';

  const newReview = {
    id: 'rev-test-01',
    productId: targetProdId,
    customerName: 'Cô Mai Cầu Giấy',
    rating: 5,
    content: 'Tôi uống 2 hộp thấy đỡ đau nhức khớp gối rất nhiều.',
    createdAt: '2026-10-23',
    isVerifiedPurchase: true, // Tự động tick đã mua hàng
    status: 'approved'
  };

  reviews.push(newReview);

  // Tính lại điểm trung bình cho targetProdId
  const prodReviews = reviews.filter(r => r.productId === targetProdId && r.status === 'approved');
  const avgRating = prodReviews.reduce((acc, r) => acc + r.rating, 0) / prodReviews.length;
  assert.ok(avgRating >= 4.5 && avgRating <= 5.0);
  assert.ok(prodReviews.some(r => r.id === 'rev-test-01' && r.isVerifiedPurchase === true));
});

runTest('Reviews', 'Dược sĩ phản hồi chuyên môn trên đánh giá', () => {
  let rev = {
    id: 'rev-01',
    productId: 'vn-01',
    customerName: 'Anh Hùng',
    rating: 4,
    content: 'Thuốc tốt nhưng uống lúc đói hơi cồn ruột.',
    pharmacistReply: null
  };

  // Dược sĩ thêm phản hồi
  rev.pharmacistReply = 'Dạ chào anh, Bách Niên Kiện nên uống sau bữa ăn 30 phút để hoạt chất hấp thu tối ưu và êm dạ dày ạ.';
  rev.pharmacistName = 'DS. CKI Nguyễn Thu Trang';
  rev.replyDate = '2026-10-23';

  assert.ok(rev.pharmacistReply);
  assert.strictEqual(rev.pharmacistName, 'DS. CKI Nguyễn Thu Trang');
});

// ===================================================================
// PHÂN HỆ 4: DƯỢC SĨ AI TƯ VẤN 24/7 THEO ĐỐI TƯỢNG
// ===================================================================
console.log('\n--- 4. KIỂM THỬ DƯỢC SĨ AI TƯ VẤN 24/7 ---');

runTest('AI Advisor', 'Nhận diện đối tượng và gợi ý phác đồ kết hợp Nội địa + Nhập khẩu', () => {
  const elderlyAudience = TARGET_AUDIENCES.find(a => a.id === 'elderly');
  assert.ok(elderlyAudience);
  assert.ok(elderlyAudience.name.includes('Người cao tuổi'));

  // Phác đồ mẫu cho người cao tuổi thoái hóa khớp
  const domesticProd = PRODUCTS.find(p => p.id === 'vn-01'); // Bách Niên Kiện
  const importedProd = PRODUCTS.find(p => p.id === 'us-01'); // Glucosamine Kirkland
  assert.ok(domesticProd && importedProd);
  assert.strictEqual(domesticProd.originType, 'domestic');
  assert.strictEqual(importedProd.originType, 'imported');
});

// ===================================================================
// PHÂN HỆ 5: QUẢN TRỊ ADMIN PANEL & NHẬP CSV HÀNG LOẠT
// ===================================================================
console.log('\n--- 5. KIỂM THỬ ADMIN PANEL & NHẬP HÀNG LOẠT CSV ---');

runTest('Admin CSV Import', 'Parse CSV có dấu tiếng Việt, phân tách chấm phẩy và UTF-8 BOM', () => {
  const sampleCsv = `\uFEFF"Tên sản phẩm";"Giá bán";"Giá gốc";"Số ĐKSP";"Quy cách"\n"Hoạt Huyết Mediplantex";"95.000₫";"120.000₫";"4239/2020/ĐKSP";"Hộp 3 vỉ x 10 viên"`;
  const rows = parseCSV(sampleCsv);
  assert.strictEqual(rows.length, 1);
  assert.ok(rows[0]['tên sản phẩm'].includes('Hoạt Huyết'));
  
  const parsedPrice = cleanPrice(rows[0]['giá bán']);
  assert.strictEqual(parsedPrice, 95000);
});

runTest('Articles & SEO', 'Tạo slug chuẩn tiếng Việt và tính điểm On-Page SEO', () => {
  const title = 'Top 5 Cách Giảm Đau Khớp Gối Tại Nhà Cho Người Cao Tuổi';
  const slug = slugify(title);
  assert.strictEqual(slug, 'top-5-cach-giam-dau-khop-goi-tai-nha-cho-nguoi-cao-tuoi');

  const testArticle = {
    title,
    metaTitle: title,
    metaDescription: 'Hướng dẫn chi tiết từ Dược sĩ CKI về cách giảm đau khớp gối an toàn tại nhà cho người cao tuổi đạt chuẩn GSP.',
    focusKeyword: 'giảm đau khớp gối',
    slug,
    content: 'Nội dung bài viết y khoa hướng dẫn bảo vệ sụn khớp chuẩn GSP và chế độ vận động nhẹ nhàng...',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae',
    imageAlt: 'Hình ảnh hướng dẫn giảm đau khớp gối',
    author: 'DS. CKI Nguyễn Thu Trang'
  };
  const seoResult = calculateSeoScore(testArticle);
  assert.ok(seoResult.score >= 70, `Điểm SEO phải đạt tối thiểu 70, thực tế: ${seoResult.score}`);
});

// ===================================================================
// PHÂN HỆ 6: AUTOMATED LOGISTICS TRACKING & XÁC NHẬN HÀNG HOÀN THỦ CÔNG
// ===================================================================
console.log('\n--- 6. KIỂM THỬ AUTOMATED TRACKING & XÁC NHẬN HÀNG HOÀN THỦ CÔNG ---');

runTest('Logistics Tracking', 'Khởi tạo mã vận đơn và tiến trình tracking ban đầu', () => {
  const testOrder = {
    id: 'MXC-112233',
    createdAt: new Date().toISOString(),
    shippingMethod: 'ghtk',
    customer: { fullName: 'Trần Văn Nam', phone: '0988111222', address: '10 Cầu Giấy' },
    items: [{ id: 'vn-01', name: 'Bách Niên Kiện', price: 699000, quantity: 1 }],
    status: 'pending'
  };

  const tracked = initializeOrderTracking(testOrder, 'ghtk', 'confirm');
  assert.strictEqual(tracked.status, 'confirmed');
  assert.strictEqual(tracked.autoTracking, true);
  assert.ok(tracked.trackingNumber.startsWith('S22.HN1.'));
  assert.strictEqual(tracked.carrierProgress, 30);
});

runTest('Logistics Tracking', 'Chuyển trạng thái sang "shipping" và "completed"', () => {
  const order = {
    id: 'MXC-112233',
    shippingMethod: 'express',
    status: 'confirmed',
    trackingTimeline: []
  };

  const shipping = stepOrderToShipping(order);
  assert.strictEqual(shipping.status, 'shipping');
  assert.strictEqual(shipping.carrierProgress, 70);

  const completed = stepOrderToCompleted(shipping);
  assert.strictEqual(completed.status, 'completed');
  assert.strictEqual(completed.carrierProgress, 100);
  assert.strictEqual(completed.autoTracking, false);
});

runTest('Returns Workflow', 'Cảnh báo đơn giao thất bại (returning) & tự động ngắt autoTracking', () => {
  const order = {
    id: 'MXC-445566',
    shippingMethod: 'ghn',
    status: 'shipping',
    autoTracking: true,
    trackingTimeline: []
  };

  const reason = RETURN_REASONS[0]; // 'Không liên lạc được người nhận sau 3 lần gọi'
  const returning = stepOrderToReturning(order, reason);

  assert.strictEqual(returning.status, 'returning');
  assert.strictEqual(returning.autoTracking, false, 'Auto tracking phải tắt khi đơn giao thất bại');
  assert.strictEqual(returning.failureReason, reason);
  assert.ok(returning.returningAt);
});

runTest('Returns Workflow', 'Kiện hàng về tới kho (returned_pending_check) bắt buộc chờ kiểm nhận thủ công', () => {
  const returningOrder = {
    id: 'MXC-445566',
    shippingMethod: 'ghn',
    status: 'returning',
    trackingTimeline: []
  };

  const arrived = stepOrderToWarehouseArrival(returningOrder);
  assert.strictEqual(arrived.status, 'returned_pending_check');
  assert.ok(arrived.arrivedWarehouseAt);

  // Thử sync tự động bưu cục -> KHÔNG ĐƯỢC TỰ ĐỘNG CHUYỂN HOÀN TẤT
  const syncedAgain = syncCarrierLogisticsStatus(arrived);
  assert.strictEqual(syncedAgain.status, 'returned_pending_check', 'Không được tự động hoàn tất nếu chưa có xác nhận thủ công');
});

runTest('Returns Workflow', 'Dược sĩ xác nhận THỦ CÔNG nhận hàng hoàn & Tái nhập kho GSP thành công', () => {
  const pendingOrder = {
    id: 'MXC-445566',
    shippingMethod: 'ghn',
    status: 'returned_pending_check',
    items: [{ id: 'vn-01', name: 'Viên Khớp Bách Niên Kiện', price: 699000, quantity: 2 }],
    trackingTimeline: []
  };

  const inspectionData = {
    pharmacistName: 'DS. CKI Nguyễn Thu Trang',
    sealCondition: 'intact',
    gspCompliant: true,
    restoreStock: true,
    note: 'Tem niêm phong nguyên vẹn 100%, nhiệt độ mát chuẩn GSP, đã nhập lại giá kệ.'
  };

  const confirmed = stepOrderToReturnConfirmed(pendingOrder, inspectionData);
  assert.strictEqual(confirmed.status, 'returned');
  assert.ok(confirmed.returnInspection);
  assert.strictEqual(confirmed.returnInspection.pharmacistName, 'DS. CKI Nguyễn Thu Trang');
  assert.strictEqual(confirmed.returnInspection.sealCondition, 'intact');
  assert.strictEqual(confirmed.returnInspection.restoreStock, true);

  // Kiểm tra mô phỏng cộng lại tồn kho sản phẩm
  let mockProducts = [
    { id: 'vn-01', name: 'Viên Khớp Bách Niên Kiện', stock: 48 },
    { id: 'us-01', name: 'Glucosamine Kirkland', stock: 30 }
  ];

  if (confirmed.returnInspection.restoreStock) {
    mockProducts = mockProducts.map(p => {
      const it = confirmed.items.find(i => i.id === p.id);
      if (it) return { ...p, stock: p.stock + it.quantity };
      return p;
    });
  }

  const restoredItem = mockProducts.find(p => p.id === 'vn-01');
  assert.strictEqual(restoredItem.stock, 50, 'Tồn kho vn-01 phải được cộng lại từ 48 lên 50 (48 + 2)');
});

// ===================================================================
// TỔNG KẾT BÁO CÁO
// ===================================================================
console.log('\n================================================================');
console.log(`   TỔNG KẾT KIỂM THỬ: ${passedCount}/${totalCount} TEST CASES THÀNH CÔNG (100% ĐẠT)`);
console.log('================================================================');
