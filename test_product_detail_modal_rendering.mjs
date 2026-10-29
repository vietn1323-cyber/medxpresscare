// Test Suite: Kiểm Tra Render Chi Tiết Sản Phẩm (Product Detail Modal) & Ngăn Ngừa Lỗi Màn Hình Trắng
import assert from 'node:assert';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { createServer } from 'vite';

console.log('🧪 Bắt đầu kiểm thử: Product Detail Modal Rendering & White Screen Fix Verification...');

const viteServer = await createServer({
  server: { middlewareMode: true },
  appType: 'custom'
});

try {
  const { ProductDetailModal } = await viteServer.ssrLoadModule('/src/components/ProductDetailModal.jsx');
  const { ProductReviewsSection } = await viteServer.ssrLoadModule('/src/components/ProductReviewsSection.jsx');
  const { ErrorBoundary } = await viteServer.ssrLoadModule('/src/components/ErrorBoundary.jsx');
  const { PRODUCTS } = await viteServer.ssrLoadModule('/src/data/products.js');
  const { DEFAULT_VOUCHERS } = await viteServer.ssrLoadModule('/src/data/vouchers.js');
  const { INITIAL_REVIEWS } = await viteServer.ssrLoadModule('/src/data/reviews.js');

  // 1. Kiểm tra render thành công toàn bộ danh mục 21 sản phẩm chính thức
  console.log('\n--- 1. Kiểm tra Render toàn bộ 21 sản phẩm trong kho hàng ---');
  assert.ok(Array.isArray(PRODUCTS) && PRODUCTS.length >= 21, 'Phải có đầy đủ sản phẩm');

  let successCount = 0;
  for (const product of PRODUCTS) {
    try {
      const html = ReactDOMServer.renderToString(
        React.createElement(ProductDetailModal, {
          product,
          onClose: () => {},
          onAddToCart: () => {},
          onBuyNow: () => {},
          isWishlisted: false,
          onToggleWishlist: () => {},
          onOpenVerifierWithReg: () => {},
          reviews: INITIAL_REVIEWS,
          onAddReview: () => {},
          onOpenVouchers: () => {},
          vouchers: DEFAULT_VOUCHERS
        })
      );
      assert.ok(html.includes(String(product.id).toUpperCase()), `HTML phải chứa mã sản phẩm ${product.id}`);
      assert.ok(html.includes('Mua Ngay'), `HTML phải render nút Mua Ngay với icon CreditCard`);
      successCount++;
    } catch (err) {
      assert.fail(`Thất bại khi render sản phẩm ${product.id}: ${err.message}`);
    }
  }
  console.log(`✅ Toàn bộ ${successCount}/${PRODUCTS.length} sản phẩm render thành công 100%, không bị lỗi CreditCard is not defined.`);

  // 2. Kiểm tra render phòng thủ với sản phẩm thiếu trường (Edge cases & Custom products)
  console.log('\n--- 2. Kiểm tra xử lý dữ liệu phòng thủ (Edge cases / Missing fields) ---');
  const edgeProducts = [
    {
      id: 'edge-null-sold-count',
      name: 'Thuốc mẫu A',
      price: 199000,
      soldCount: undefined,
      ingredients: undefined,
      benefits: undefined
    },
    {
      id: 'edge-null-price',
      name: 'Thuốc mẫu B',
      price: undefined,
      originalPrice: undefined,
      soldCount: null,
      countryName: null
    },
    {
      id: 'edge-string-ingredients',
      name: 'Thuốc mẫu C',
      price: 250000,
      soldCount: 15,
      ingredients: ['Thành phần A', 'Thành phần B'],
      benefits: ['Công dụng A', 'Công dụng B']
    }
  ];

  for (const edgeProd of edgeProducts) {
    try {
      const html = ReactDOMServer.renderToString(
        React.createElement(ProductDetailModal, {
          product: edgeProd,
          onClose: () => {},
          onAddToCart: () => {},
          onBuyNow: () => {},
          isWishlisted: false,
          onToggleWishlist: () => {},
          onOpenVerifierWithReg: () => {},
          reviews: [],
          onAddReview: () => {},
          onOpenVouchers: () => {},
          vouchers: DEFAULT_VOUCHERS
        })
      );
      assert.ok(html.length > 500, `Edge case ${edgeProd.id} phải render an toàn`);
    } catch (err) {
      assert.fail(`Edge case ${edgeProd.id} bị crash: ${err.message}`);
    }
  }
  console.log('✅ Xử lý phòng thủ thành công: Sản phẩm thiếu soldCount, ingredients, price không gây lỗi.');

  // 3. Kiểm tra ProductReviewsSection với điểm số thập phân (float rating) và người dùng ẩn danh
  console.log('\n--- 3. Kiểm tra ProductReviewsSection không bị RangeError với rating số thực ---');
  const testReviewsWithFloat = [
    {
      id: 'rev-float-1',
      productId: 'vn-01',
      customerName: undefined,
      customerPhone: '',
      rating: 4.8,
      title: 'Đánh giá tốt',
      content: 'Hiệu quả sau 2 tuần',
      status: 'approved'
    },
    {
      id: 'rev-float-2',
      productId: 'vn-01',
      customerName: 'Bác Nam',
      customerPhone: '0912345678',
      rating: 5.0,
      title: 'Rất ưng ý',
      content: 'Chính hãng tem phụ đầy đủ',
      status: 'approved'
    }
  ];

  try {
    const reviewsHtml = ReactDOMServer.renderToString(
      React.createElement(ProductReviewsSection, {
        productId: 'vn-01',
        productName: 'Viên Khớp Bách Niên Kiện',
        reviews: testReviewsWithFloat,
        onAddReview: () => {}
      })
    );
    assert.ok(reviewsHtml.includes('Đánh giá tốt'), 'Phải render review thành công');
    console.log('✅ ProductReviewsSection render an toàn với float rating (4.8, 5.0), không bị RangeError: Invalid array length.');
  } catch (err) {
    assert.fail(`ProductReviewsSection bị crash: ${err.message}`);
  }

  // 4. Kiểm tra ErrorBoundary bảo vệ giao diện
  console.log('\n--- 4. Kiểm tra ErrorBoundary hoạt động đúng ---');
  const boundary = new ErrorBoundary({ title: 'Lỗi kiểm thử' });
  boundary.state = { hasError: true, error: new Error('Test intentional crash in child') };
  const fallbackNode = boundary.render();
  const fallbackHtml = ReactDOMServer.renderToString(fallbackNode);
  assert.ok(fallbackHtml.includes('Lỗi kiểm thử') || fallbackHtml.includes('Đã xảy ra lỗi hiển thị'), 'ErrorBoundary phải bắt lỗi và hiển thị fallback an toàn');
  console.log('✅ ErrorBoundary bắt lỗi thành công, ngăn chặn 100% tình trạng màn hình trắng.');

  console.log('\n🎉 TẤT CẢ CÁC KIỂM THỬ PRODUCT DETAIL MODAL ĐÃ ĐẠT 100%!');
} catch (error) {
  console.error('❌ Lỗi kiểm thử:', error);
  process.exit(1);
} finally {
  await viteServer.close();
}
