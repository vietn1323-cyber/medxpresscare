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

  // Lưu sản phẩm ngay lập tức (dùng khi xóa, xóa hàng loạt để tránh mất dữ liệu khi F5 nhanh)
  async saveProductsNow(products) {
    if (debounceTimers['products']) {
      clearTimeout(debounceTimers['products']);
    }
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(products)
      });
    } catch (e) {
      console.warn('D1 Sync Products Now error:', e);
    }
  },

  // Lưu danh sách đơn hàng (trạng thái, logistics tracking, kiểm nhận hoàn) - Debounced
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
  },

  // Lưu phiên tư vấn Dược sĩ AI & khảo sát nhu cầu cá nhân hóa - Debounced
  saveConsultation(consultation) {
    debounceCall(`consultation_${consultation.id || 'current'}`, async () => {
      try {
        await fetch('/api/consultations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(consultation)
        });
      } catch (e) {
        console.warn('D1 Sync Consultation error:', e);
      }
    }, 300);
  },

  // Lưu tức thì phiên tư vấn (dùng khi khách hoàn thành khảo sát hoặc gửi tin nhắn quan trọng)
  async saveConsultationNow(consultation) {
    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consultation)
      });
      if (res.ok) {
        const json = await res.json();
        return json?.consultation || consultation;
      }
    } catch (e) {
      console.warn('D1 Save Consultation Now error:', e);
    }
    return consultation;
  },

  // Lấy lịch sử tư vấn Dược sĩ AI (theo khách hàng hoặc toàn bộ)
  async fetchConsultations(customerId = null, phone = null) {
    try {
      let url = '/api/consultations';
      const params = new URLSearchParams();
      if (customerId) params.append('customerId', customerId);
      if (phone) params.append('phone', phone);
      const queryStr = params.toString();
      if (queryStr) url += `?${queryStr}`;

      const res = await fetch(url);
      if (!res.ok) return null;
      const json = await res.json();
      return json?.consultations || [];
    } catch (e) {
      console.warn('D1 Fetch Consultations error:', e);
      return null;
    }
  },

  // Xóa phiên tư vấn
  async deleteConsultation(id) {
    try {
      await fetch(`/api/consultations?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('D1 Delete Consultation error:', e);
    }
  }
};
