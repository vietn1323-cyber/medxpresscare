/**
 * MedXpressCare - Medication Reminder & Refill Engine
 * Bộ sinh lịch uống thuốc thông minh bằng AI & Tính toán thời điểm tái đặt hàng trước 2-3 ngày
 */

/**
 * Trích xuất số lượng viên / gói từ tên hoặc mô tả sản phẩm
 */
export const extractUnitsPerPackage = (product) => {
  if (!product) return 60;
  if (product.unitsPerBox && typeof product.unitsPerBox === 'number') return product.unitsPerBox;

  const text = `${product.name || ''} ${product.packaging || ''} ${product.specification || ''} ${product.specifications || ''} ${product.dosageForm || ''} ${product.description || ''}`;
  
  // Tìm pattern: "80 viên", "60 viên", "100 viên", "30 gói", "15 túi", "120 viên", "50ml", "100ml"
  const matchPills = text.match(/(\d+)\s*(viên|capsule|softgel|tablets|gói|túi|ống)/i);
  if (matchPills && matchPills[1]) {
    const val = parseInt(matchPills[1], 10);
    if (val >= 10 && val <= 500) return val;
  }

  // Mặc định chuẩn theo ngành TPCN
  return 60;
};

export const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase();
};

/**
 * Trích xuất liều dùng hàng ngày (số viên / ngày)
 */
export const extractDailyDose = (product) => {
  if (!product) return 2;
  if (product.dailyDose && typeof product.dailyDose === 'number') return product.dailyDose;

  const rawText = `${product.name || ''} ${product.instruction || ''} ${product.instructions || ''} ${product.usage || ''} ${product.dosage || ''} ${product.dosageForm || ''} ${product.description || ''}`.toLowerCase();
  const text = removeVietnameseTones(rawText);

  // Pattern: "ngày 2 lần mỗi lần 1 viên" -> 2
  if (text.includes('ngay 2 lan') || text.includes('ngay uong 2 lan') || text.includes('2 vien/ngay') || text.includes('2 vien moi ngay') || text.includes('uong 2 vien')) {
    return 2;
  }
  // Pattern: "ngày 3 lần" -> 3
  if (text.includes('ngay 3 lan') || text.includes('ngay uong 3 lan') || text.includes('3 vien/ngay') || text.includes('3 vien moi ngay') || text.includes('uong 3 vien')) {
    return 3;
  }
  // Pattern: "ngày 1 lần" -> 1
  if (text.includes('ngay 1 lan') || text.includes('ngay uong 1 lan') || text.includes('1 vien/ngay') || text.includes('ngay 1 vien') || text.includes('1 vien moi ngay') || text.includes('ngay uong 1 vien') || text.includes('uong 1 vien') || text.includes('uong 1 goi')) {
    return 1;
  }

  // Khớp theo phân loại y khoa
  const cat = removeVietnameseTones(product.category || '');
  const name = removeVietnameseTones(product.name || '');

  if (name.includes('ngu') || name.includes('sleep') || name.includes('melatonin') || name.includes('an than')) return 1; // Ngủ ngon: 1 viên tối
  if (name.includes('canxi') || name.includes('calcium') || name.includes('kem') || name.includes('zinc')) return 1; // Canxi / Kẽm: 1-2 viên/ngày (chuẩn 1 viên)
  if (cat.includes('khop') || name.includes('bach nien kien') || name.includes('glucosamine')) return 2; // Khớp: 2 viên/ngày
  if (cat.includes('nao') || name.includes('ginkgo') || name.includes('cebraton')) return 2; // Bổ não: 2 viên/ngày
  if (name.includes('sam') || name.includes('ginseng') || name.includes('dong trung')) return 1; // Sâm: 1 gói/lần/ngày

  return 2; // Mặc định 2 viên/ngày
};

/**
 * AI Clinical Rule Engine: Tự động đề xuất lịch uống thuốc chuẩn y khoa theo sản phẩm
 */
export const generateAiMedicationSchedule = (product, userWakeTime = '07:00') => {
  if (!product) return null;

  const rawName = (product.name || '').toLowerCase();
  const name = removeVietnameseTones(rawName);
  const cat = removeVietnameseTones(product.category || '');
  const dailyDose = extractDailyDose(product);
  const unitsPerPackage = extractUnitsPerPackage(product);

  let scheduleTimes = ['08:00', '19:30'];
  let timeLabels = ['Buổi sáng (sau ăn 30p)', 'Buổi tối (sau ăn 30p)'];
  let pillsPerDose = 1;
  let dietaryAdvice = 'Uống sau bữa ăn 30 phút cùng nhiều nước ấm.';
  let categoryTag = 'TPCN Hàng Ngày';
  let warningNote = '';

  // 4. Nhóm Hỗ trợ giấc ngủ, An thần (Melatonin, Bình vôi, Lạc tiên, Ngủ ngon) - Ưu tiên uống trước khi đi ngủ
  if (name.includes('ngu') || name.includes('sleep') || name.includes('melatonin') || name.includes('an than')) {
    scheduleTimes = ['21:30'];
    timeLabels = ['Buổi tối (trước khi đi ngủ 30-45p)'];
    pillsPerDose = 1;
    dietaryAdvice = 'Uống trước khi đi ngủ 30-45 phút cùng nửa ly nước ấm. Tắt màn hình điện thoại để dễ vào giấc.';
    categoryTag = 'Hỗ Trợ Giấc Ngủ';
  }
  // 1. Nhóm Canxi, Vitamin D3, Khoáng chất
  else if (name.includes('canxi') || name.includes('calcium') || cat.includes('xuong')) {
    scheduleTimes = ['08:00'];
    timeLabels = ['Buổi sáng (sau ăn sáng 30p)'];
    pillsPerDose = dailyDose >= 2 ? 2 : 1;
    dietaryAdvice = 'Uống vào buổi sáng sau ăn 30 - 60 phút, kết hợp uống nhiều nước và tắm nắng nhẹ.';
    warningNote = '⚠️ Không uống vào buổi chiều/tối để tránh nguy cơ lắng cặn thận.';
    categoryTag = 'Bổ Sung Canxi';
  }
  // 2. Nhóm Xương khớp (Bách Niên Kiện, Glucosamine, Kháng viêm)
  else if (name.includes('khop') || name.includes('bach nien kien') || name.includes('glucosamine')) {
    scheduleTimes = ['08:00', '19:30'];
    timeLabels = ['Buổi sáng (sau ăn)', 'Buổi tối (sau ăn)'];
    pillsPerDose = 1;
    dietaryAdvice = 'Uống sau bữa ăn 30 phút. Duy trì đều đặn đủ liệu trình để phục hồi màng sụn khớp.';
    categoryTag = 'Chăm Sóc Xương Khớp';
  }
  // 3. Nhóm Bổ não, Tuần hoàn máu, Tiền đình (Ginkgo Biloba, Cebraton)
  else if (name.includes('nao') || name.includes('ginkgo') || name.includes('cebraton') || cat.includes('nao')) {
    if (dailyDose === 1) {
      scheduleTimes = ['08:00'];
      timeLabels = ['Buổi sáng (sau ăn)'];
      pillsPerDose = 1;
    } else {
      scheduleTimes = ['08:00', '13:30'];
      timeLabels = ['Buổi sáng (sau ăn)', 'Đầu giờ chiều (sau ăn trưa)'];
      pillsPerDose = 1;
    }
    dietaryAdvice = 'Uống sau bữa ăn. Uống đủ 2 lít nước mỗi ngày giúp tăng cường lưu thông máu não.';
    warningNote = '💡 Nên uống trước 16h chiều để có giấc ngủ ngon vào buổi tối.';
    categoryTag = 'Bổ Não & Trí Nhớ';
  }
  // 5. Nhóm Men tiêu hóa, Dạ dày (Curcumin, Lợi khuẩn)
  else if (name.includes('curcumin') || name.includes('da day') || name.includes('men') || cat.includes('tieu-hoa')) {
    scheduleTimes = ['07:00', '18:30'];
    timeLabels = ['Buổi sáng (trước ăn 30p)', 'Buổi tối (trước ăn 30p)'];
    pillsPerDose = 1;
    dietaryAdvice = 'Uống trước bữa ăn 30 phút với nước ấm để tạo màng bảo vệ niêm mạc dạ dày.';
    categoryTag = 'Dạ Dày & Tiêu Hóa';
  }
  // 6. Nhóm Đông trùng hạ thảo, Hồng sâm, Tăng lực ban ngày
  else if (name.includes('sam') || name.includes('ginseng') || name.includes('dong trung')) {
    scheduleTimes = ['07:45'];
    timeLabels = ['Buổi sáng sớm (sau ăn nhẹ)'];
    pillsPerDose = 1;
    dietaryAdvice = 'Uống vào buổi sáng để tối ưu hấp thu năng lượng, hỗ trợ cơ thể khỏe khoắn cả ngày.';
    warningNote = '💡 Tránh dùng vào buổi tối vì tính chất tỉnh táo có thể gây khó ngủ.';
    categoryTag = 'Đại Bổ Khí Huyết';
  }

  return {
    id: 'med-' + (product.id || Date.now()),
    productId: product.id,
    productName: product.name,
    productImage: product.image,
    productBrand: product.brand,
    unitsPerPackage,
    dailyDose,
    scheduleTimes,
    timeLabels,
    pillsPerDose,
    dietaryAdvice,
    warningNote,
    categoryTag,
    enabled: true,
    createdAt: new Date().toISOString()
  };
};

/**
 * Tính toán lịch tái đặt hàng (Refill Schedule) trước 2 - 3 ngày
 */
export const calculateRefillSchedule = (product, quantity = 1, orderDate = new Date()) => {
  const unitsPerPackage = extractUnitsPerPackage(product);
  const dailyDose = extractDailyDose(product);
  const totalUnits = unitsPerPackage * (Number(quantity) || 1);
  const totalDays = Math.max(1, Math.floor(totalUnits / dailyDose));

  const start = new Date(orderDate);
  const runoutTime = start.getTime() + (totalDays * 24 * 60 * 60 * 1000);
  const runoutDate = new Date(runoutTime);

  // Nhắc trước 3 ngày (trong khoảng 2 - 3 ngày như yêu cầu)
  const REMINDER_DAYS_BEFORE = 3;
  const reminderTime = runoutTime - (REMINDER_DAYS_BEFORE * 24 * 60 * 60 * 1000);
  const reminderDate = new Date(reminderTime);

  // Tính số ngày còn lại so với hôm nay
  const now = new Date();
  const diffDays = Math.ceil((runoutDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
  const daysRemaining = Math.max(0, diffDays);

  return {
    productId: product.id,
    productName: product.name,
    productImage: product.image,
    productPrice: Number(product.price) || 0,
    productBrand: product.brand || '',
    quantity: Number(quantity) || 1,
    unitsPerPackage,
    dailyDose,
    totalUnits,
    totalDays,
    startDateStr: start.toISOString().slice(0, 10),
    runoutDateStr: runoutDate.toISOString().slice(0, 10),
    reminderDateStr: reminderDate.toISOString().slice(0, 10),
    reminderDaysBefore: REMINDER_DAYS_BEFORE,
    daysRemaining,
    // Trạng thái: Sắp hết nếu còn từ 0 đến 3 ngày
    isNearRunout: daysRemaining <= 3 && daysRemaining >= 0,
    isOverdue: diffDays < 0,
    enabled: true
  };
};
