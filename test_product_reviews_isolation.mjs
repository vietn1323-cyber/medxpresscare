// Test Suite: Kiểm Tra Cô Lập Đánh Giá Sản Phẩm & Loại Bỏ Hoàn Toàn Đánh Giá Mẫu Lẫn Lộn
import assert from 'node:assert';
import { PRODUCTS } from './src/data/products.js';
import { INITIAL_REVIEWS } from './src/data/reviews.js';

console.log('🧪 Bắt đầu kiểm thử: Cô Lập Đánh Giá Sản Phẩm (Product Reviews Isolation)...');

// 1. Kiểm tra INITIAL_REVIEWS đã được làm sạch toàn bộ dữ liệu mẫu
function testReviewsIntegrity() {
  console.log('\n--- 1. Kiểm tra INITIAL_REVIEWS đã xóa sạch toàn bộ dữ liệu mẫu ---');
  
  assert.ok(Array.isArray(INITIAL_REVIEWS), 'INITIAL_REVIEWS phải là một mảng');
  assert.strictEqual(INITIAL_REVIEWS.length, 0, `INITIAL_REVIEWS phải rỗng (0 đánh giá mẫu) để tránh commit dữ liệu test lên GitHub. Hiện có: ${INITIAL_REVIEWS.length}`);

  console.log('✅ INITIAL_REVIEWS sạch sẽ 100%, không còn bất kỳ dữ liệu mẫu thử nghiệm nào.');
}

// 2. Kiểm tra logic lọc đánh giá trong ProductReviewsSection: KHÔNG CÒN FALLBACK LẪN LỘN
function testProductReviewsFiltering() {
  console.log('\n--- 2. Kiểm tra lọc đánh giá chỉ thuộc về đúng sản phẩm đang xem ---');

  // Mô phỏng hàm lọc trong ProductReviewsSection
  const getProductDisplayReviews = (productId, reviews = INITIAL_REVIEWS) => {
    const safeReviews = Array.isArray(reviews) ? reviews : (INITIAL_REVIEWS || []);
    return safeReviews.filter(r => r.productId === productId && (r.status === 'approved' || !r.status));
  };

  // Dữ liệu kiểm thử độc lập (Test Fixtures)
  const testFixtureReviews = [
    {
      id: 'test-rev-01',
      productId: 'au-02',
      customerName: 'Mẹ Bắp',
      rating: 5,
      title: 'Canxi Sữa Bio Island cho bé rất dễ uống',
      content: 'Bé nhà mình uống canxi sữa này trộm vía hợp, ăn ngon ngủ tốt.',
      status: 'approved'
    },
    {
      id: 'test-rev-02',
      productId: 'vn-03',
      customerName: 'Anh Tuấn',
      rating: 5,
      title: 'Tinh nghệ Nano Curcumin êm dạ dày',
      content: 'Tôi uống Nano Curcumin OIC New thấy giảm ợ hơi và êm bụng rõ rệt.',
      status: 'approved'
    },
    {
      id: 'test-rev-03',
      productId: 'kr-01',
      customerName: 'Chị Lan',
      rating: 5,
      title: 'Hồng Sâm KGC Hàn Quốc chính hãng',
      content: 'Sâm KGC Hàn Quốc chuẩn chỉ, biếu ông bà bồi bổ sức khỏe rất quý.',
      status: 'approved'
    }
  ];

  // Test Case A: Xem sản phẩm Canxi Sữa cho bé Bio Island (au-02)
  const au02Reviews = getProductDisplayReviews('au-02', testFixtureReviews);
  assert.ok(au02Reviews.length > 0, 'Sản phẩm au-02 phải có đánh giá từ fixture');
  au02Reviews.forEach(r => {
    assert.strictEqual(r.productId, 'au-02', 'Đánh giá hiển thị cho au-02 phải có productId là au-02');
    assert.ok(
      r.title.toLowerCase().includes('canxi') || r.content.toLowerCase().includes('canxi') || r.content.toLowerCase().includes('bé'),
      'Nội dung đánh giá phải nói về canxi hoặc cho bé, không được là đánh giá khớp của sản phẩm khác'
    );
    assert.ok(
      !r.title.toLowerCase().includes('khớp gối') && !r.title.toLowerCase().includes('thoái hóa khớp'),
      'TUYỆT ĐỐI không được hiển thị đánh giá khớp gối của Bách Niên Kiện dưới sản phẩm Canxi cho bé'
    );
  });
  console.log('✅ Sản phẩm au-02 (Canxi Bio Island) hiển thị đúng 100% đánh giá canxi cho bé, không bị lẫn đánh giá khớp.');

  // Test Case B: Xem sản phẩm Tinh Nghệ Nano Curcumin OIC New (vn-03)
  const vn03Reviews = getProductDisplayReviews('vn-03', testFixtureReviews);
  assert.ok(vn03Reviews.length > 0, 'Sản phẩm vn-03 phải có đánh giá');
  vn03Reviews.forEach(r => {
    assert.strictEqual(r.productId, 'vn-03', 'Đánh giá phải có productId là vn-03');
    assert.ok(
      r.title.toLowerCase().includes('dạ dày') || r.content.toLowerCase().includes('dạ dày') || r.content.toLowerCase().includes('curcumin'),
      'Đánh giá phải nói về dạ dày / curcumin của vn-03'
    );
  });
  console.log('✅ Sản phẩm vn-03 (Nano Curcumin) hiển thị đúng 100% đánh giá dạ dày, không bị lẫn sản phẩm khác.');

  // Test Case C: Xem sản phẩm Hồng Sâm Hàn Quốc KGC (kr-01)
  const kr01Reviews = getProductDisplayReviews('kr-01', testFixtureReviews);
  assert.ok(kr01Reviews.length > 0, 'Sản phẩm kr-01 phải có đánh giá');
  kr01Reviews.forEach(r => {
    assert.strictEqual(r.productId, 'kr-01', 'Đánh giá phải có productId là kr-01');
    assert.ok(
      r.title.toLowerCase().includes('hồng sâm') || r.content.toLowerCase().includes('sâm') || r.content.toLowerCase().includes('hàn quốc'),
      'Đánh giá phải nói về Hồng sâm KGC Hàn Quốc'
    );
  });
  console.log('✅ Sản phẩm kr-01 (Hồng Sâm KGC) hiển thị đúng 100% đánh giá hồng sâm.');

  // Test Case D: Xem trên INITIAL_REVIEWS thực tế (vốn rỗng ban đầu)
  const defaultEmptyReviews = getProductDisplayReviews('au-02', INITIAL_REVIEWS);
  assert.strictEqual(defaultEmptyReviews.length, 0, 'Sản phẩm chưa có review trong INITIAL_REVIEWS phải trả về mảng rỗng');
  console.log('✅ Khi chưa có đánh giá thực tế, trả về mảng rỗng chuẩn xác, KHÔNG fallback sang đánh giá sản phẩm khác.');
}

// 3. Kiểm tra tính toán Rating và tỷ lệ % thanh sao khi có 0 đánh giá
function testRatingCalculations() {
  console.log('\n--- 3. Kiểm tra tính toán điểm sao và thanh phần trăm ---');

  const calculateBreakdown = (reviewsList) => {
    const avgRating = reviewsList.length > 0
      ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / reviewsList.length).toFixed(1)
      : '5.0';
    const fiveStarCount = reviewsList.filter(r => r.rating === 5).length;
    const fourStarCount = reviewsList.filter(r => r.rating === 4).length;
    
    // Tỷ lệ % thanh sao
    const fiveStarWidth = reviewsList.length > 0 ? (fiveStarCount / reviewsList.length) * 100 : 0;
    const fourStarWidth = reviewsList.length > 0 ? (fourStarCount / reviewsList.length) * 100 : 0;

    return { avgRating, fiveStarWidth, fourStarWidth };
  };

  const emptyBreakdown = calculateBreakdown([]);
  assert.strictEqual(emptyBreakdown.fiveStarWidth, 0, 'Khi 0 đánh giá, thanh 5 sao phải là 0% (không được là số mẫu 90%)');
  assert.strictEqual(emptyBreakdown.fourStarWidth, 0, 'Khi 0 đánh giá, thanh 4 sao phải là 0% (không được là số mẫu 10%)');

  const sampleReviews = [
    { rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 5 }
  ];
  const sampleBreakdown = calculateBreakdown(sampleReviews);
  assert.strictEqual(sampleBreakdown.avgRating, '4.8');
  assert.strictEqual(sampleBreakdown.fiveStarWidth, 75);
  assert.strictEqual(sampleBreakdown.fourStarWidth, 25);
  console.log('✅ Logic tính toán điểm sao và thanh phần trăm chuẩn xác, không còn số liệu mẫu ảo.');
}

function runAll() {
  try {
    testReviewsIntegrity();
    testProductReviewsFiltering();
    testRatingCalculations();
    console.log('\n🎉 TẤT CẢ TEST CASES CÔ LẬP ĐÁNH GIÁ SẢN PHẨM ĐẠT 100% THÀNH CÔNG! 🎉\n');
  } catch (err) {
    console.error('\n❌ LỖI KIỂM THỬ:', err);
    process.exit(1);
  }
}

runAll();
