/**
 * MedXpress Care - Cloudflare D1 Live Database Client
 * Tự động đồng bộ dữ liệu hai chiều với Cloudflare D1 Serverless Database
 */

const debounceTimers = {};

function debounceCall(key, fn, delay = 400) {
  if (debounceTimers[key]) {
    clearTimeout(debounceTimers[key]);
  }
  debounceTimers[key] = setTimeout(fn, delay);
}

export const apiClient = {
  // Đồng bộ toàn bộ dữ liệu từ Cloudflare D1 khi mở trang
  async fetchAll() {
    try {
      const res = await fetch('/api/sync');
      if (!res.ok) return null;
      const json = await res.json();
      return json?.data || null;
    } catch {
      return null;
    }
  },

  // Khởi tạo hoặc nạp hàng loạt dữ liệu lên D1
  async batchSync(payload) {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Lưu danh sách sản phẩm (khi thêm, sửa, xóa, hoặc import CSV) - Debounced
  saveProducts(products) {
    debounceCall('products', async () => {
      try {
        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(products)
        });
      } catch (e) {
        console.warn('D1 Sync Products error:', e);
      }
    });
  },

  // Lưu danh sách đơn hàng (trạng thái, logistics tracking, kiểm định GSP) - Debounced
  saveOrdersList(orders) {
    debounceCall('orders', async () => {
      try {
        await fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orders)
        });
      } catch (e) {
        console.warn('D1 Sync Orders List error:', e);
      }
    });
  },

  // Lưu tức thì 1 đơn hàng mới khi khách checkout
  async saveNewOrder(order) {
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
    } catch (e) {
      console.warn('D1 Save Order error:', e);
    }
  },

  // Xóa đơn hàng thử nghiệm
  async clearTestOrders() {
    try {
      await fetch('/api/orders?clearTest=true', { method: 'DELETE' });
    } catch (e) {
      console.warn('D1 Clear Test Orders error:', e);
    }
  },

  // Lưu bài viết cẩm nang y khoa & SEO - Debounced
  saveArticles(articles) {
    debounceCall('articles', async () => {
      try {
        await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(articles)
        });
      } catch (e) {
        console.warn('D1 Sync Articles error:', e);
      }
    });
  },

  // Lưu đánh giá sản phẩm & phản hồi dược sĩ - Debounced
  saveReviews(reviews) {
    debounceCall('reviews', async () => {
      try {
        await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(reviews)
        });
      } catch (e) {
        console.warn('D1 Sync Reviews error:', e);
      }
    });
  },

  // Lưu cấu hình nhà thuốc (Hotline, VietQR, Phí ship) - Debounced
  saveConfig(config) {
    debounceCall('config', async () => {
      try {
        await fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(config)
        });
      } catch (e) {
        console.warn('D1 Sync Config error:', e);
      }
    });
  },

  // Lưu danh sách khách hàng & điểm tích lũy - Debounced
  saveCustomers(customers) {
    debounceCall('customers', async () => {
      try {
        await fetch('/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(customers)
        });
      } catch (e) {
        console.warn('D1 Sync Customers error:', e);
      }
    });
  }
};
