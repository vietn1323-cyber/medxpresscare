// Test Suite: Kiểm Tra Lưu Trữ Phiên Tư Vấn AI Trên Cloudflare D1 & Tính Năng Cá Nhân Hóa Khách Hàng
import assert from 'node:assert';
import worker from './worker.js';
import { consultWithAiPharmacist } from './src/utils/aiHelper.js';
import { apiClient } from './src/services/apiClient.js';
import { PRODUCTS } from './src/data/products.js';

console.log('🧪 Bắt đầu kiểm thử: Lưu Trữ AI Consultations trên Cloudflare D1 & Cá Nhân Hóa Khách Hàng...');

// 1. MOCK CLOUDFLARE D1 DATABASE IN-MEMORY
const inMemoryD1 = new Map();

const mockDb = {
  prepare: (query) => {
    return {
      run: async () => ({ success: true }),
      bind: (...args) => ({
        first: async () => {
          if (query.includes('SELECT data FROM store_data WHERE collection = ?')) {
            const collectionName = args[0];
            const data = inMemoryD1.get(collectionName);
            return data !== undefined ? { data } : null;
          }
          return null;
        },
        all: async () => ({ results: [] }),
        run: async () => {
          if (query.includes('INSERT INTO store_data')) {
            const collectionName = args[0];
            const data = args[1];
            inMemoryD1.set(collectionName, data);
            return { success: true };
          }
          return { success: true };
        }
      })
    };
  }
};

const mockEnv = {
  DB: mockDb
};

// 2. TEST WORKER.JS ENDPOINT /api/consultations & TỰ ĐỘNG CẬP NHẬT HEALTH PROFILE KHÁCH HÀNG
async function testWorkerConsultationsD1() {
  console.log('\n--- 1. Kiểm tra Worker.js /api/consultations trên Cloudflare D1 ---');

  // Khởi tạo trước một khách hàng mẫu trong D1
  const initialCustomer = {
    id: 'cust-test-99',
    fullName: 'Nguyễn Thu Trang',
    phone: '0988776655',
    email: 'thutrang@gmail.com',
    points: 15,
    healthProfile: null
  };
  inMemoryD1.set('customers', JSON.stringify([initialCustomer]));

  // A. POST /api/consultations: Lưu phiên tư vấn và khảo sát nhu cầu mới
  const newConsultationPayload = {
    id: 'cst-test-001',
    customerId: 'cust-test-99',
    customerName: 'Nguyễn Thu Trang',
    customerPhone: '0988776655',
    healthProfile: {
      audience: 'kids',
      audienceTitle: 'Trẻ Nhỏ & Học Sinh (Dưới 18 tuổi)',
      primaryConcern: 'kids_height',
      primaryConcernTitle: 'Trẻ Thấp Còi, Chậm Tăng Chiều Cao (Bổ sung Canxi)',
      conditionId: 'none',
      conditionTitle: 'Cơ thể khỏe mạnh, không bệnh lý nền',
      keyNutrients: 'Canxi sữa Hydroxyapatite tự nhiên từ bò sữa, Vitamin D3 và K2 MK-7',
      specificNotes: 'Nhu cầu bổ sung canxi sinh lý hàng ngày cho con'
    },
    chatHistory: [
      { id: 'msg-1', sender: 'user', text: 'Bé nhà em 4 tuổi, muốn bổ sung canxi cho con cao lớn thì uống loại nào?' },
      { id: 'msg-2', sender: 'pharmacist', text: 'Dược sĩ chào mẹ Trang! Canxi sữa tự nhiên kết hợp D3K2 là lựa chọn tối ưu...', time: '10:00' }
    ],
    recommendedProductIds: ['vn-01', 'au-02'],
    status: 'active'
  };

  const postReq = new Request('https://medxpresscare.com/api/consultations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newConsultationPayload)
  });

  const postRes = await worker.fetch(postReq, mockEnv);
  assert.strictEqual(postRes.status, 200, 'POST /api/consultations phải trả về HTTP 200');
  const postData = await postRes.json();
  assert.strictEqual(postData.success, true, 'POST /api/consultations phải trả về success: true');
  assert.strictEqual(postData.consultation?.id, 'cst-test-001', 'ID phiên tư vấn phải đúng');
  console.log('✅ POST /api/consultations thành công lưu phiên vào D1.');

  // B. Kiểm tra tự động cập nhật healthProfile và lastConcern trong danh mục customers
  const customersAfter = JSON.parse(inMemoryD1.get('customers') || '[]');
  const updatedCust = customersAfter.find(c => c.id === 'cust-test-99');
  assert.ok(updatedCust, 'Khách hàng phải tồn tại trong danh mục customers');
  assert.ok(updatedCust.healthProfile, 'healthProfile của khách phải được tự động cập nhật');
  assert.strictEqual(updatedCust.healthProfile.primaryConcern, 'kids_height', 'Mối quan tâm sức khỏe phải được cập nhật đúng');
  assert.strictEqual(updatedCust.lastConcern, 'Trẻ Thấp Còi, Chậm Tăng Chiều Cao (Bổ sung Canxi)', 'lastConcern phải được cập nhật');
  assert.ok(updatedCust.lastConsultationDate, 'lastConsultationDate phải được ghi nhận');
  console.log('✅ Hồ sơ khách hàng (healthProfile) được tự động đồng bộ khi lưu phiên tư vấn!');

  // C. GET /api/consultations: Lấy lịch sử theo số điện thoại
  const getByPhoneReq = new Request('https://medxpresscare.com/api/consultations?phone=0988776655');
  const getByPhoneRes = await worker.fetch(getByPhoneReq, mockEnv);
  assert.strictEqual(getByPhoneRes.status, 200, 'GET /api/consultations?phone=... phải trả về HTTP 200');
  const getByPhoneData = await getByPhoneRes.json();
  assert.strictEqual(getByPhoneData.success, true);
  assert.strictEqual(getByPhoneData.consultations.length, 1, 'Phải tìm thấy 1 phiên tư vấn cho số điện thoại này');
  assert.strictEqual(getByPhoneData.consultations[0].id, 'cst-test-001');
  console.log('✅ GET /api/consultations?phone=... trả về đúng lịch sử tư vấn của khách hàng.');

  // D. GET /api/consultations: Lấy theo customerId
  const getByIdReq = new Request('https://medxpresscare.com/api/consultations?customerId=cust-test-99');
  const getByIdRes = await worker.fetch(getByIdReq, mockEnv);
  const getByIdData = await getByIdRes.json();
  assert.strictEqual(getByIdData.consultations.length, 1);
  console.log('✅ GET /api/consultations?customerId=... hoạt động chính xác.');

  // E. DELETE /api/consultations: Xóa phiên tư vấn
  const deleteReq = new Request('https://medxpresscare.com/api/consultations?id=cst-test-001', { method: 'DELETE' });
  const deleteRes = await worker.fetch(deleteReq, mockEnv);
  assert.strictEqual(deleteRes.status, 200);
  const getAfterDeleteReq = new Request('https://medxpresscare.com/api/consultations');
  const getAfterDeleteRes = await worker.fetch(getAfterDeleteReq, mockEnv);
  const getAfterDeleteData = await getAfterDeleteRes.json();
  assert.strictEqual(getAfterDeleteData.consultations.length, 0, 'Phiên tư vấn phải được xóa khỏi D1');
  console.log('✅ DELETE /api/consultations xóa phiên tư vấn thành công.');
}

// 3. TEST API CLIENT METHODS TRONG SRC/SERVICES/APICLIENT.JS
async function testApiClientMethods() {
  console.log('\n--- 2. Kiểm tra API Client (src/services/apiClient.js) ---');
  assert.strictEqual(typeof apiClient.saveConsultation, 'function', 'apiClient.saveConsultation phải là hàm');
  assert.strictEqual(typeof apiClient.saveConsultationNow, 'function', 'apiClient.saveConsultationNow phải là hàm');
  assert.strictEqual(typeof apiClient.fetchConsultations, 'function', 'apiClient.fetchConsultations phải là hàm');
  assert.strictEqual(typeof apiClient.deleteConsultation, 'function', 'apiClient.deleteConsultation phải là hàm');
  console.log('✅ Tất cả các phương thức tư vấn AI trong apiClient đều được export đầy đủ.');
}

// 4. TEST CÁ NHÂN HÓA VÀ NGUYÊN TẮC DƯỢC LÝ TRONG SRC/UTILS/AIHELPER.JS
async function testAiPersonalizationAndClinicalRules() {
  console.log('\n--- 3. Kiểm tra Cá Nhân Hóa & Quy Tắc Y Khoa trong aiHelper.js ---');

  // Test Case 1: Khách hàng quay lại chào hỏi -> Nhận diện họ tên & nhắc nhớ nhu cầu đã khảo sát
  const greetingCustomerContext = {
    name: 'Anh Dũng',
    phone: '0912345678',
    healthProfile: {
      audienceTitle: 'Trẻ Nhỏ & Học Sinh',
      primaryConcernTitle: 'Trẻ Thấp Còi, Chậm Tăng Chiều Cao (Bổ sung Canxi)'
    },
    lastConcern: 'Trẻ Thấp Còi, Chậm Tăng Chiều Cao (Bổ sung Canxi)'
  };

  const greetingResult = await consultWithAiPharmacist({
    userMessage: 'Chào dược sĩ nhé!',
    products: PRODUCTS,
    customerContext: greetingCustomerContext
  });

  assert.ok(
    greetingResult.reply.includes('Anh Dũng'),
    'Lời chào phải nhận diện và xưng hô tên riêng của khách hàng (Anh Dũng)'
  );
  assert.ok(
    greetingResult.reply.includes('Trẻ Thấp Còi') || greetingResult.reply.includes('Canxi'),
    'Lời chào phải nhắc đến hồ sơ sức khỏe / nhu cầu khảo sát trước đó của khách'
  );
  assert.strictEqual(greetingResult.recommendedProductIds.length, 0, 'Chào hỏi tuyệt đối KHÔNG ép mua sản phẩm');
  console.log('✅ Cá nhân hóa lời chào & nhắc nhớ hồ sơ đã lưu hoạt động xuất sắc.');

  // Test Case 2: Nhu cầu bổ sung Canxi sinh lý hàng ngày cho con (không phải bệnh lý)
  const calciumResult = await consultWithAiPharmacist({
    userMessage: 'Nhu cầu của anh là bổ sung canxi cho con cao lớn, chứ con không có bệnh tật gì cả',
    targetAudience: 'kids',
    products: PRODUCTS,
    customerContext: { name: 'Anh Nam' }
  });

  assert.ok(
    !calciumResult.reply.toLowerCase().includes('bệnh tật'),
    'Không dùng các từ ngữ bệnh tật khi khách chỉ có nhu cầu bổ sung canxi sinh lý'
  );
  assert.ok(
    calciumResult.reply.includes('Canxi') || calciumResult.reply.includes('xương'),
    'Giải thích rõ vai trò của Canxi đối với khung xương của con'
  );
  console.log('✅ Phân biệt chính xác giữa nhu cầu dinh dưỡng sinh lý cho con và bệnh tật.');

  // Test Case 3: Hỏi về thuốc kê đơn / kháng sinh (Website không bán thuốc kê đơn, không có phác đồ điều trị)
  const prescriptionResult = await consultWithAiPharmacist({
    userMessage: 'Cho tôi mua thuốc kháng sinh Amoxicillin và đơn thuốc đặc trị',
    products: PRODUCTS
  });

  assert.ok(
    prescriptionResult.reply.includes('KHÔNG BÁN THUỐC KÊ ĐƠN') || prescriptionResult.reply.includes('không bán thuốc kê đơn'),
    'Phải cảnh báo rõ ràng website không bán thuốc kê đơn'
  );
  assert.ok(
    prescriptionResult.reply.includes('bệnh viện') || prescriptionResult.reply.includes('Bác sĩ'),
    'Phải hướng dẫn khách đến bệnh viện gặp bác sĩ thăm khám'
  );
  assert.strictEqual(prescriptionResult.recommendedProductIds.length, 0, 'Tuyệt đối không gợi ý sản phẩm khi khách hỏi thuốc kê đơn');
  console.log('✅ Tuân thủ 100% quy định dược phẩm: từ chối thuốc kê đơn và hướng dẫn khám bác sĩ.');

  // Test Case 4: Cấp cứu đỏ (Red Flag Emergency)
  const emergencyResult = await consultWithAiPharmacist({
    userMessage: 'Bố tôi đang bị đau thắt ngực dữ dội, khó thở và vã mồ hôi',
    products: PRODUCTS
  });

  assert.ok(
    emergencyResult.reply.includes('115') || emergencyResult.reply.includes('CẤP CỨU'),
    'Phải kích hoạt cảnh báo cấp cứu khẩn cấp 115'
  );
  assert.strictEqual(emergencyResult.recommendedProductIds.length, 0, 'Tuyệt đối không bán hàng khi đang cấp cứu');
  console.log('✅ Xử trí cấp cứu đỏ (Red Flag Triage) chuẩn xác.');
}

async function runAllTests() {
  try {
    await testWorkerConsultationsD1();
    await testApiClientMethods();
    await testAiPersonalizationAndClinicalRules();

    console.log('\n🎉 TẤT CẢ CÁC BÀI KIỂM THỬ ĐÃ VƯỢT QUA 100% THÀNH CÔNG! 🎉\n');
  } catch (err) {
    console.error('\n❌ LỖI KIỂM THỬ:', err);
    process.exit(1);
  }
}

runAllTests();
