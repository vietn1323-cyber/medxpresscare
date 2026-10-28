/**
 * Logistics & Carrier Automated Tracking Engine for MedXpressCare
 * Tự động tạo mã vận đơn, đồng bộ trạng thái bưu cục (GHTK, GHN, Viettel Post, MedXpress Hỏa Tốc)
 * và tự động chuyển các trạng thái: Đã xác nhận -> Đang giao -> Hoàn thành.
 */

/**
 * Định dạng mốc thời gian hành trình sang dạng sạch: "HH:mm - DD/MM/YYYY"
 * Ví dụ: "23:04 - 28/10/2026"
 */
export const formatCleanTrackingTime = (input) => {
  if (!input) return '';
  if (typeof input === 'string' && /^\d{2}:\d{2}\s*-\s*\d{2}\/\d{2}\/\d{4}$/.test(input.trim())) {
    return input.trim();
  }
  if (input instanceof Date && !isNaN(input.getTime())) {
    const hh = String(input.getHours()).padStart(2, '0');
    const mm = String(input.getMinutes()).padStart(2, '0');
    const dd = String(input.getDate()).padStart(2, '0');
    const MM = String(input.getMonth() + 1).padStart(2, '0');
    const yyyy = input.getFullYear();
    return `${hh}:${mm} - ${dd}/${MM}/${yyyy}`;
  }
  if (typeof input === 'number') {
    return formatCleanTrackingTime(new Date(input));
  }
  if (typeof input === 'string') {
    const s = input.trim();
    // Pattern A: HH:mm[:ss][, ] DD/MM/YYYY
    const matchA = s.match(/(\d{1,2}):(\d{2})(?::\d{2})?(?:[^\d]+)(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
    if (matchA) {
      const hh = matchA[1].padStart(2, '0');
      const mm = matchA[2];
      const dd = matchA[3].padStart(2, '0');
      const MM = matchA[4].padStart(2, '0');
      const yyyy = matchA[5];
      return `${hh}:${mm} - ${dd}/${MM}/${yyyy}`;
    }
    // Pattern B: DD/MM/YYYY[, ] HH:mm[:ss]
    const matchB = s.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:[^\d]+)(\d{1,2}):(\d{2})(?::\d{2})?/);
    if (matchB) {
      const dd = matchB[1].padStart(2, '0');
      const MM = matchB[2].padStart(2, '0');
      const yyyy = matchB[3];
      const hh = matchB[4].padStart(2, '0');
      const mm = matchB[5];
      return `${hh}:${mm} - ${dd}/${MM}/${yyyy}`;
    }
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return formatCleanTrackingTime(d);
    }
    return s;
  }
  return String(input);
};

/**
 * Rút gọn địa điểm kho hàng, bỏ định danh dài dòng nội bộ
 */
export const formatCleanTrackingLocation = (location) => {
  if (!location) return 'Kho hàng MedXpressCare';
  let loc = String(location).trim();
  loc = loc.replace(/Tổng kho Dược MedXpressCare(?:\s*\([^)]*\))?/gi, 'Kho hàng MedXpressCare');
  loc = loc.replace(/Tổng kho Dược(?:\s*\([^)]*\))?/gi, 'Kho hàng MedXpressCare');
  loc = loc.replace(/Cửa nhận hàng hoàn - Tổng kho Dược MedXpressCare/gi, 'Kho hàng MedXpressCare');
  loc = loc.replace(/Cửa nhận hàng hoàn - Kho hàng MedXpressCare/gi, 'Kho hàng MedXpressCare');
  loc = loc.replace(/Hệ thống MedXpressCare Online/gi, 'Kho hàng MedXpressCare');
  loc = loc.replace(/Hệ thống online/gi, 'Kho hàng MedXpressCare');
  return loc;
};

/**
 * Viết lại tiêu đề hành trình ngắn gọn, hướng tới khách hàng, loại bỏ raw strings
 */
export const formatCleanTrackingTitle = (rawTitle = '', stage = '', status = '') => {
  const t = String(rawTitle || '').trim();
  const s = String(stage || '').toLowerCase();

  // Loại bỏ các mã trạng thái hệ thống dạng raw string
  if (t.includes('ready_to_pick') || s.includes('ready_to_pick')) {
    return 'Bưu tá đang trên đường đến lấy hàng';
  }
  if (t.includes('picking') || s.includes('picking')) {
    return 'Bưu tá đang lấy hàng';
  }
  if (t.includes('storing') || t.includes('sorting') || s.includes('storing') || s.includes('sorting')) {
    return 'Đang vận chuyển';
  }
  if (t.includes('delivering') || s.includes('delivering')) {
    return 'Đang giao hàng tới người nhận';
  }
  if (t.includes('delivered') || s.includes('delivered')) {
    return 'Giao hàng thành công';
  }
  if (t.includes('cancel') || s.includes('cancel')) {
    return 'Đơn hàng đã hủy';
  }

  let cleaned = t.replace(/^\[GHN\s*Trực\s*Tiếp\]\s*/i, '').trim();

  if (s === 'order_created' || cleaned.includes('khởi tạo') || cleaned.includes('Đơn hàng được khởi tạo')) {
    return 'Đơn hàng đã được khởi tạo thành công';
  }
  if (s === 'pharmacist_confirmed' || s === 'printed_and_packed' || cleaned.includes('Dược sĩ') || cleaned.includes('chuẩn bị hàng') || cleaned.includes('đóng gói')) {
    return 'Hệ thống đang chuẩn bị hàng';
  }
  if (s === 'ghn_created' || cleaned.includes('Đã tạo vận đơn') || cleaned.includes('bàn giao cho đơn vị vận chuyển')) {
    return 'Đã bàn giao cho đơn vị vận chuyển (GHN Express)';
  }
  if (cleaned.includes('chờ bưu tá lấy hàng') || cleaned.includes('chờ lấy hàng')) {
    return 'Bưu tá đang trên đường đến lấy hàng';
  }
  if (cleaned.includes('Đang phát') || cleaned.includes('đang giao') || cleaned.includes('Bưu tá đang giao')) {
    return 'Đang giao hàng tới người nhận';
  }
  if (cleaned.includes('Giao hàng thành công') || cleaned.includes('Hoàn tất đơn hàng')) {
    return 'Giao hàng thành công';
  }
  if (cleaned.includes('Giao thất bại') || cleaned.includes('chuyển hoàn')) {
    return 'Đang chuyển hoàn về kho';
  }
  if (cleaned.includes('về tới kho') || cleaned.includes('kiểm nhận hàng hoàn')) {
    return 'Đã chuyển hoàn về kho hàng';
  }

  return cleaned || 'Đang vận chuyển';
};

/**
 * Ẩn toàn bộ thông tin nhạy cảm nội bộ (cước phí bưu cục, mã phân loại, raw system string)
 */
export const formatCleanTrackingDesc = (rawDesc = '', title = '') => {
  if (!rawDesc) return '';
  let d = String(rawDesc).trim();

  // Đơn hàng tạo GHN hoặc sync trực tiếp từ bưu cục
  if (d.includes('Cước phí:') || d.includes('Phân loại bưu cục:') || d.includes('ready_to_pick') || d.includes('Trạng thái hiện tại trên hệ thống GHN')) {
    if (d.includes('ready_to_pick') || d.includes('chờ bưu tá')) {
      return 'Bưu tá đang trên đường đến lấy hàng. Đơn vị vận chuyển: GHN Express.';
    }
    if (d.includes('delivering') || d.includes('giao')) {
      return 'Kiện hàng đang được bưu tá giao tới địa chỉ người nhận.';
    }
    if (d.includes('delivered') || d.includes('thành công')) {
      return 'Kiện hàng đã được giao thành công tới người nhận.';
    }
    return 'Bưu tá đang trên đường đến lấy hàng. Đơn vị vận chuyển: GHN Express.';
  }

  // Loại bỏ các trường cước phí và phân loại bưu cục nếu còn sót
  d = d.replace(/[\s,.-]*Cước phí[^.]*(?:\.|$)/gi, '.');
  d = d.replace(/[\s,.-]*Cước vận chuyển[^.]*(?:\.|$)/gi, '.');
  d = d.replace(/[\s,.-]*Phân loại bưu cục[^.]*(?:\.|$)/gi, '.');
  d = d.replace(/[\s,.-]*Mã phân loại[^.]*(?:\.|$)/gi, '.');
  d = d.replace(/[\s,.-]*Sort Code[^.]*(?:\.|$)/gi, '.');

  // Loại bỏ các mã trạng thái hệ thống dạng raw string
  d = d.replace(/["']?(?:ready_to_pick|picking|storing|sorting|delivering|money_collect_delivering|delivery_fail)["']?/gi, 'Đang xử lý');

  // Rút gọn địa điểm kho
  d = d.replace(/Tổng kho Dược MedXpressCare(?:\s*\([^)]*\))?/gi, 'Kho hàng MedXpressCare');
  d = d.replace(/Tổng kho Dược(?:\s*\([^)]*\))?/gi, 'Kho hàng MedXpressCare');
  d = d.replace(/Cửa nhận hàng hoàn - Tổng kho Dược MedXpressCare/gi, 'Kho hàng MedXpressCare');

  d = d.replace(/\.\.+/g, '.').replace(/\s+/g, ' ').trim();
  if (d.endsWith('.')) d = d.slice(0, -1).trim() + '.';

  return d;
};

/**
 * Chuẩn hóa 1 mục hành trình sang dạng sạch tối ưu cho khách hàng
 */
export const cleanTrackingItem = (item) => {
  if (!item) return null;
  return {
    ...item,
    time: formatCleanTrackingTime(item.time),
    title: formatCleanTrackingTitle(item.title, item.stage, item.status),
    desc: formatCleanTrackingDesc(item.desc, item.title),
    location: formatCleanTrackingLocation(item.location)
  };
};

export const CARRIER_METADATA = {
  express: {
    id: 'express',
    name: 'Giao Hỏa Tốc (Nội thành Hà Nội)',
    badge: 'Chỉ nội thành HN',
    icon: '⚡',
    color: 'emerald',
    hotline: '1800 6868',
    isExpress: true,
    shipper: {
      name: 'Đội Vận Chuyển Hỏa Tốc MedXpressCare',
      phone: '1800 6868',
      vehicle: 'Xe chuyên dụng bảo quản thuốc',
      storage: 'Thùng bảo ôn chuyên dụng'
    }
  },
  ghtk: {
    id: 'ghtk',
    name: 'Giao Hàng Nhanh (GHTK)',
    badge: 'Giao hàng nhanh',
    icon: '📦',
    color: 'emerald',
    hotline: '1900 6092',
    shipper: {
      name: 'Điều phối viên GHTK',
      phone: '1900 6092',
      vehicle: 'Giao hàng tiêu chuẩn',
      storage: 'Kiện hàng đóng gói niêm phong cẩn thận'
    }
  },
  ghn: {
    id: 'ghn',
    name: 'Giao Hàng Nhanh (GHN Express)',
    badge: 'Giao hàng nhanh',
    icon: '🚚',
    color: 'blue',
    hotline: '1900 636677',
    shipper: {
      name: 'Điều phối viên GHN Express',
      phone: '1900 636677',
      vehicle: 'Mạng lưới bưu cục GHN Express toàn quốc',
      storage: 'Kiện hàng đóng gói niêm phong cẩn thận'
    }
  },
  viettel: {
    id: 'viettel',
    name: 'Giao Hàng Nhanh (Viettel Post)',
    badge: 'Giao hàng nhanh',
    icon: '🏣',
    color: 'rose',
    hotline: '1900 8095',
    shipper: {
      name: 'Điều phối viên Viettel Post',
      phone: '1900 8095',
      vehicle: 'Bưu chính tiêu chuẩn Viettel Post',
      storage: 'Kiện hàng đóng gói niêm phong cẩn thận'
    }
  }
};

/**
 * Lấy thông tin nhà vận chuyển theo ID
 */
export const getCarrierInfo = (carrierId = 'ghtk') => {
  return CARRIER_METADATA[carrierId] || CARRIER_METADATA.ghtk;
};

/**
 * Tạo mã vận đơn chuẩn định dạng từng bưu cục
 */
export const generateCarrierTrackingNumber = (carrierId = 'ghtk', orderId = '') => {
  const numericId = orderId ? orderId.replace(/[^0-9]/g, '') : Math.floor(100000 + Math.random() * 900000);
  switch (carrierId) {
    case 'ghtk':
      return `S22.HN1.${numericId.slice(-4) || '8839'}.${Math.floor(1000000 + Math.random() * 9000000)}`;
    case 'ghn':
      return `GHN${numericId || '774911'}VN`;
    case 'viettel':
      return `VTP${numericId || '982314'}HN`;
    case 'express':
      return `MPX-2H-${numericId || '09211'}`;
    default:
      return `GHTK-${numericId || '883921'}VN`;
  }
};

/**
 * Khởi tạo dữ liệu Tracking cho đơn hàng khi Dược sĩ Xác nhận hoặc In đơn
 */
export const initializeOrderTracking = (order, carrierId = null, triggerType = 'confirm') => {
  const chosenCarrierId = carrierId || order.shippingMethod || 'ghtk';
  const carrier = getCarrierInfo(chosenCarrierId);
  const trackingNo = order.trackingNumber || generateCarrierTrackingNumber(chosenCarrierId, order.id);
  const now = new Date();
  const timeStr = formatCleanTrackingTime(now);

  const existingTimeline = Array.isArray(order.trackingTimeline) && order.trackingTimeline.length > 0 
    ? order.trackingTimeline 
    : [
        {
          time: formatCleanTrackingTime(order.createdAt || now),
          status: 'pending',
          stage: 'order_created',
          title: 'Đơn hàng đã được khởi tạo thành công',
          desc: `Khách hàng đặt đơn qua cổng trực tuyến MedXpressCare (${order.paymentMethod === 'vietqr' ? 'Đã quét VietQR' : 'Thanh toán COD khi nhận hàng'}).`,
          location: 'Kho hàng MedXpressCare'
        }
      ];

  const confirmLog = {
    time: timeStr,
    status: 'confirmed',
    stage: triggerType === 'print' ? 'printed_and_packed' : 'pharmacist_confirmed',
    title: triggerType === 'print' 
      ? 'Dược sĩ đã in phiếu gửi bưu điện & đóng gói cẩn thận' 
      : 'Dược sĩ chuyên môn đã xác nhận đơn hàng & chuẩn bị hàng',
    desc: `Đơn vị vận chuyển [${carrier.name}] đã tiếp nhận thông tin điện tử. Mã vận đơn chính thức: ${trackingNo}.`,
    location: 'Kho hàng MedXpressCare'
  };

  // Tránh trùng lặp mốc confirmed nếu đã có
  const hasConfirmLog = existingTimeline.some(item => item.stage === 'pharmacist_confirmed' || item.stage === 'printed_and_packed');
  const updatedTimeline = hasConfirmLog ? existingTimeline : [...existingTimeline, confirmLog];

  return {
    ...order,
    status: order.status === 'pending' ? 'confirmed' : order.status,
    trackingNumber: trackingNo,
    shippingMethod: chosenCarrierId,
    shippingCarrierName: carrier.name,
    carrierProgress: 30, // 30% khi xác nhận/in đơn
    autoTracking: order.isGhnSynced ? false : (order.autoTracking !== undefined ? order.autoTracking : true),
    isPrinted: triggerType === 'print' ? true : order.isPrinted,
    confirmedAt: order.confirmedAt || now.toISOString(),
    printedAt: triggerType === 'print' ? now.toISOString() : order.printedAt,
    shipper: carrier.shipper,
    trackingTimeline: updatedTimeline
  };
};

/**
 * Tự động chuyển đơn hàng sang trạng thái 'shipping' (Đang giao hỏa tốc)
 */
export const stepOrderToShipping = (order) => {
  const carrier = getCarrierInfo(order.shippingMethod);
  const now = new Date();
  const timeStr = formatCleanTrackingTime(now);
  const shipper = order.shipper || carrier.shipper;

  const currentTimeline = Array.isArray(order.trackingTimeline) ? order.trackingTimeline : [];
  const newTimelineItem = {
    time: timeStr,
    status: 'shipping',
    stage: 'carrier_pickup',
    title: `Bưu tá ${carrier.name} đã lấy hàng & Đang phát hỏa tốc`,
    desc: `Bưu cục ${carrier.name} (Hotline hỗ trợ: ${carrier.hotline}) đã nhận kiện hàng, đang trên tuyến đường giao tới: ${order.customer?.address || 'địa chỉ khách hàng'}.`,
    location: `Bưu cục chuyển phát ${carrier.name}`
  };

  return {
    ...order,
    status: 'shipping',
    carrierProgress: 70, // 70% khi đang giao
    shippedAt: now.toISOString(),
    trackingTimeline: [...currentTimeline, newTimelineItem]
  };
};

/**
 * Tự động chuyển đơn hàng sang trạng thái 'completed' (Giao hàng thành công / Hoàn thành)
 */
export const stepOrderToCompleted = (order) => {
  const carrier = getCarrierInfo(order.shippingMethod);
  const now = new Date();
  const timeStr = formatCleanTrackingTime(now);

  const currentTimeline = Array.isArray(order.trackingTimeline) ? order.trackingTimeline : [];
  const newTimelineItem = {
    time: timeStr,
    status: 'completed',
    stage: 'delivered_success',
    title: 'Giao hàng thành công & Hoàn tất đơn hàng',
    desc: `Khách hàng ${order.customer?.fullName || 'Người nhận'} đã nhận kiện hàng nguyên vẹn, nhận đủ ${order.items?.length || 1} sản phẩm và ký nhận/thanh toán hoàn tất.`,
    location: `Tại địa chỉ khách: ${order.customer?.address || 'Địa chỉ khách hàng'}, ${order.customer?.district || ''}`
  };

  return {
    ...order,
    status: 'completed',
    carrierProgress: 100, // 100% khi hoàn thành
    completedAt: now.toISOString(),
    autoTracking: false, // Dừng auto tracking khi đã hoàn thành
    trackingTimeline: [...currentTimeline, newTimelineItem]
  };
};

/**
 * Danh sách lý do giao thất bại & chuyển hoàn thường gặp
 */
export const RETURN_REASONS = [
  'Không liên lạc được người nhận sau 3 lần gọi',
  'Người nhận đổi ý, từ chối nhận thuốc',
  'Sai địa chỉ nhận thuốc / Số điện thoại không đúng',
  'Khách hàng hẹn dời lịch phát quá 3 ngày quy định',
  'Kiện hàng bị ảnh hưởng thời tiết, quay đầu bảo quản'
];

/**
 * Đánh dấu đơn giao thất bại & bưu cục chuyển hoàn về kho
 */
export const stepOrderToReturning = (order, reason = null) => {
  const carrier = getCarrierInfo(order.shippingMethod);
  const now = new Date();
  const timeStr = formatCleanTrackingTime(now);
  const failureReason = reason || RETURN_REASONS[0];

  const currentTimeline = Array.isArray(order.trackingTimeline) ? order.trackingTimeline : [];
  const newTimelineItem = {
    time: timeStr,
    status: 'returning',
    stage: 'delivery_failed_returning',
    title: `⚠️ Giao thất bại - ${carrier.name} chuyển hoàn về kho`,
    desc: `Lý do: "${failureReason}". Kiện hàng đã được bưu tá đóng gói niêm phong quay đầu, đang trên đường hoàn về Kho hàng MedXpressCare.`,
    location: `Bưu cục chuyển phát ${carrier.name}`
  };

  return {
    ...order,
    status: 'returning',
    failureReason,
    carrierProgress: 85,
    autoTracking: false, // Dừng auto-complete vì giao thất bại
    returningAt: now.toISOString(),
    trackingTimeline: [...currentTimeline, newTimelineItem]
  };
};

/**
 * Đánh dấu kiện hàng hoàn đã về tới cửa kho MedXpressCare (Chờ Dược sĩ kiểm nhận thủ công)
 */
export const stepOrderToWarehouseArrival = (order) => {
  const carrier = getCarrierInfo(order.shippingMethod);
  const now = new Date();
  const timeStr = formatCleanTrackingTime(now);

  const currentTimeline = Array.isArray(order.trackingTimeline) ? order.trackingTimeline : [];
  const newTimelineItem = {
    time: timeStr,
    status: 'returned_pending_check',
    stage: 'arrived_at_warehouse',
    title: `📦 Kiện hàng hoàn đã về tới kho - Chờ Dược sĩ kiểm nhận`,
    desc: `Bưu tá ${carrier.name} đã bàn giao kiện hàng tại Kho hàng MedXpressCare. YÊU CẦU DƯỢC SĨ KIỂM TRA TEM NIÊM PHONG & XÁC NHẬN THỦ CÔNG ĐỂ NHẬP LẠI KHO.`,
    location: 'Kho hàng MedXpressCare'
  };

  return {
    ...order,
    status: 'returned_pending_check',
    carrierProgress: 95,
    arrivedWarehouseAt: now.toISOString(),
    trackingTimeline: [...currentTimeline, newTimelineItem]
  };
};

/**
 * Dược sĩ xác nhận thủ công đã nhận hàng hoàn về kho & nhập lại kho
 */
export const stepOrderToReturnConfirmed = (order, inspectionData = {}) => {
  const now = new Date();
  const timeStr = formatCleanTrackingTime(now);
  const pharmacistName = inspectionData.pharmacistName || 'DS. CKI Nguyễn Thu Trang';
  const sealCondition = inspectionData.sealCondition || 'intact'; // intact | damaged
  const note = inspectionData.note || 'Hàng nguyên vẹn tem chống giả Bộ Y Tế, đã nhập lại giá kệ kho mát.';
  const restoreStock = inspectionData.restoreStock !== false;

  const currentTimeline = Array.isArray(order.trackingTimeline) ? order.trackingTimeline : [];
  const newTimelineItem = {
    time: timeStr,
    status: 'returned',
    stage: 'warehouse_accepted',
    title: `✅ Dược sĩ đã kiểm nhận hàng hoàn & Nhập lại kho`,
    desc: `Dược sĩ kiểm nhận: ${pharmacistName}. Tình trạng tem mác: ${sealCondition === 'intact' ? 'Nguyên vẹn 100%' : 'Có dấu hiệu mở seal'}. Hoàn lại tồn kho: ${restoreStock ? 'Đã hoàn lại tồn' : 'Không nhập lại'}. Ghi chú: ${note}.`,
    location: 'Kho hàng MedXpressCare'
  };

  return {
    ...order,
    status: 'returned',
    carrierProgress: 100,
    returnInspection: {
      confirmedAt: now.toISOString(),
      pharmacistName,
      sealCondition,
      restoreStock,
      note
    },
    trackingTimeline: [...currentTimeline, newTimelineItem]
  };
};

/**
 * Hàm mô phỏng đồng bộ tức thì với API hãng vận chuyển (Instant Sync)
 */
export const syncCarrierLogisticsStatus = (order) => {
  if (order.status === 'pending') {
    return initializeOrderTracking(order, order.shippingMethod, 'confirm');
  }
  if (order.status === 'confirmed') {
    return stepOrderToShipping(order);
  }
  if (order.status === 'shipping') {
    return stepOrderToCompleted(order);
  }
  if (order.status === 'returning') {
    return stepOrderToWarehouseArrival(order);
  }
  return order;
};
