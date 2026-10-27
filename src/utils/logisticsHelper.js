/**
 * Logistics & Carrier Automated Tracking Engine for MedXpressCare
 * Tự động tạo mã vận đơn, đồng bộ trạng thái bưu cục (GHTK, GHN, Viettel Post, MedXpress Hỏa Tốc)
 * và tự động chuyển các trạng thái: Đã xác nhận -> Đang giao -> Hoàn thành.
 */

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
      name: 'Trần Hoàng Nam',
      phone: '0918 667 223',
      vehicle: 'Giao hàng hỏa tốc',
      storage: 'Kiện hàng đóng gói niêm phong cẩn thận'
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
      name: 'Nguyễn Văn Hưng',
      phone: '0982 331 450',
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
      name: 'Lê Quốc Tuấn',
      phone: '0974 112 589',
      vehicle: 'Giao hàng nhanh',
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
      name: 'Phạm Minh Đức',
      phone: '0965 882 119',
      vehicle: 'Bưu chính tiêu chuẩn',
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
  const timeStr = now.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

  const existingTimeline = Array.isArray(order.trackingTimeline) && order.trackingTimeline.length > 0 
    ? order.trackingTimeline 
    : [
        {
          time: new Date(order.createdAt || now).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
          status: 'pending',
          stage: 'order_created',
          title: 'Đơn hàng được khởi tạo thành công',
          desc: `Khách hàng đặt đơn qua cổng trực tuyến MedXpressCare (${order.paymentMethod === 'vietqr' ? 'Đã quét VietQR' : 'Thanh toán COD khi nhận hàng'}).`,
          location: 'Hệ thống MedXpressCare Online'
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
    location: 'Tổng kho Dược MedXpressCare (Cầu Giấy, Hà Nội)'
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
    autoTracking: true,
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
  const timeStr = now.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  const shipper = order.shipper || carrier.shipper;

  const currentTimeline = Array.isArray(order.trackingTimeline) ? order.trackingTimeline : [];
  const newTimelineItem = {
    time: timeStr,
    status: 'shipping',
    stage: 'carrier_pickup',
    title: `Bưu tá ${carrier.name} đã lấy hàng & Đang phát hỏa tốc`,
    desc: `Bưu tá ${shipper.name} (SĐT: ${shipper.phone}) đã nhận kiện hàng, đang trên tuyến đường giao tới: ${order.customer?.address || 'địa chỉ khách hàng'}.`,
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
  const timeStr = now.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

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
  const timeStr = now.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  const failureReason = reason || RETURN_REASONS[0];

  const currentTimeline = Array.isArray(order.trackingTimeline) ? order.trackingTimeline : [];
  const newTimelineItem = {
    time: timeStr,
    status: 'returning',
    stage: 'delivery_failed_returning',
    title: `⚠️ Giao thất bại - ${carrier.name} chuyển hoàn về kho`,
    desc: `Lý do: "${failureReason}". Kiện hàng đã được bưu tá đóng gói niêm phong quay đầu, đang trên đường hoàn về Tổng kho Dược MedXpressCare.`,
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
  const timeStr = now.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

  const currentTimeline = Array.isArray(order.trackingTimeline) ? order.trackingTimeline : [];
  const newTimelineItem = {
    time: timeStr,
    status: 'returned_pending_check',
    stage: 'arrived_at_warehouse',
    title: `📦 Kiện hàng hoàn đã về tới kho - Chờ Dược sĩ kiểm nhận`,
    desc: `Bưu tá ${carrier.name} đã bàn giao kiện hàng tại Tổng kho Dược. YÊU CẦU DƯỢC SĨ KIỂM TRA TEM NIÊM PHONG & XÁC NHẬN THỦ CÔNG ĐỂ NHẬP LẠI KHO.`,
    location: 'Cửa nhận hàng hoàn - Tổng kho Dược MedXpressCare'
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
 * Dược sĩ xác nhận thủ công đã nhận hàng hoàn về kho & nhập lại kho GSP
 */
export const stepOrderToReturnConfirmed = (order, inspectionData = {}) => {
  const now = new Date();
  const timeStr = now.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
  const pharmacistName = inspectionData.pharmacistName || 'DS. CKI Nguyễn Thu Trang';
  const sealCondition = inspectionData.sealCondition || 'intact'; // intact | damaged
  const note = inspectionData.note || 'Hàng nguyên vẹn tem chống giả Bộ Y Tế, đã nhập lại giá kệ kho mát GSP.';
  const restoreStock = inspectionData.restoreStock !== false;

  const currentTimeline = Array.isArray(order.trackingTimeline) ? order.trackingTimeline : [];
  const newTimelineItem = {
    time: timeStr,
    status: 'returned',
    stage: 'warehouse_accepted',
    title: `✅ Dược sĩ đã kiểm nhận hàng hoàn & Nhập lại kho GSP`,
    desc: `Dược sĩ kiểm nhận: ${pharmacistName}. Tình trạng tem mác: ${sealCondition === 'intact' ? 'Nguyên vẹn 100%' : 'Có dấu hiệu mở seal'}. Hoàn lại tồn kho: ${restoreStock ? 'Đã hoàn lại tồn' : 'Không nhập lại'}. Ghi chú: ${note}.`,
    location: 'Tổng kho Dược MedXpressCare (Cầu Giấy, Hà Nội)'
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
