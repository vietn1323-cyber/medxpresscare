import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle2, ShieldCheck, Truck, CreditCard, 
  Banknote, QrCode, PhoneCall, ArrowRight, Sparkles, AlertCircle,
  Award, User, Tag, RefreshCw, Radio, Gift, ChevronRight,
  Copy, Check, ExternalLink, Download
} from 'lucide-react';
import { calculateEarnedPoints, calculatePointsDiscount, calculateMaxPointsToUse } from '../data/customers';
import { sendTelegramOrderNotification } from '../utils/telegramHelper';
import { DEFAULT_SHIPPING_CARRIERS } from '../data/shippingCarriers';
import { DEFAULT_VOUCHERS, calculateVoucherDiscount } from '../data/vouchers';
import { TwoTierAddressFields } from './TwoTierAddressFields';
import { getBankInfo, getVietQRImageUrl, getVietQRFallbackUrl } from '../utils/vietqrHelper';

export const CheckoutModal = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  appliedVoucher, 
  setAppliedVoucher,
  onClearCart,
  onOrderCreated,
  onUpdateOrderPaymentMethod,
  customer,
  onOpenAuthModal,
  onUpdateCustomerPoints,
  vouchers = DEFAULT_VOUCHERS,
  onOpenVoucherModal,
  onNavigateToTracking,
  onOpenMedicineCabinet,
  storeConfig = {
    bankName: 'MB Bank (Quân Đội)',
    bankAccountNumber: '0968686868',
    bankAccountName: 'MEDXPRESS CARE VIET NAM'
  }
}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    province: 'Thành phố Hà Nội',
    district: 'Quận Cầu Giấy',
    districtId: 1442,
    to_district_id: 1442,
    ward: 'Phường Dịch Vọng Hậu',
    wardCode: '20314',
    to_ward_code: '20314',
    address: '',
    shippingMethod: 'ghtk', // ghtk (Giao hàng nhanh) | express (Giao hỏa tốc HN) | ghn | viettel
    paymentMethod: 'vietqr', // cod | vietqr | vnpay
    note: ''
  });

  // Điểm thưởng state
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToRedeem, setPointsToRedeem] = useState(0);
  const [lastOrderPointsInfo, setLastOrderPointsInfo] = useState(null);

  const [isSuccess, setIsSuccess] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);
  const [copiedField, setCopiedField] = useState('');
  const [useQrFallback, setUseQrFallback] = useState(false);
  const [isChangingPaymentMethod, setIsChangingPaymentMethod] = useState(false);
  const [errors, setErrors] = useState({});

  const isHanoiProvince = (prov) => {
    if (!prov) return false;
    const s = String(prov).toLowerCase();
    return s.includes('hà nội') || s === 'hn';
  };

  const handleChangePaymentMethod = (newMethod) => {
    setFormData(prev => ({ ...prev, paymentMethod: newMethod }));
    setIsChangingPaymentMethod(false);

    const targetOrderId = completedOrder?.id || orderCode;
    if (completedOrder) {
      const updatedOrder = {
        ...completedOrder,
        paymentMethod: newMethod,
        paymentStatus: newMethod === 'cod' ? 'unpaid' : completedOrder.paymentStatus,
        status: newMethod === 'cod' ? 'pending' : completedOrder.status
      };
      setCompletedOrder(updatedOrder);

      // Cập nhật localStorage
      try {
        const stored = localStorage.getItem('medxpress_admin_orders');
        if (stored) {
          const list = JSON.parse(stored);
          const next = list.map(o => o.id === targetOrderId ? { ...o, paymentMethod: newMethod } : o);
          localStorage.setItem('medxpress_admin_orders', JSON.stringify(next));
        }
      } catch (e) {
        console.warn('Lỗi cập nhật local storage order:', e);
      }

      // Thông báo cập nhật đơn hàng
      if (onUpdateOrderPaymentMethod) {
        onUpdateOrderPaymentMethod(targetOrderId, newMethod);
      }
    }
  };

  const handleCopyText = (text, fieldName) => {
    if (!text) return;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(String(text));
    }
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(prev => prev === fieldName ? '' : prev);
    }, 2000);
  };

  const handleModalClose = () => {
    setIsSuccess(false);
    setCompletedOrder(null);
    setPaymentConfirmed(false);
    setOrderCode('');
    setUseQrFallback(false);
    setCopiedField('');
    setIsChangingPaymentMethod(false);
    onClose();
  };

  // State xác nhận thanh toán VietQR Webhook tự động
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);

  // Auto fill form when customer logs in
  useEffect(() => {
    if (customer) {
      setFormData(prev => ({
        ...prev,
        fullName: customer.fullName || prev.fullName,
        phone: customer.phone || prev.phone,
        email: customer.email || prev.email,
        province: customer.province || prev.province,
        district: customer.district || prev.district,
        address: customer.address || prev.address
      }));
    }
  }, [customer]);

  // Polling webhook thanh toán tự động khi mở màn hình VietQR thành công
  useEffect(() => {
    let interval = null;
    if (isSuccess && formData.paymentMethod === 'vietqr' && !paymentConfirmed && orderCode) {
      setIsVerifyingPayment(true);
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/webhook-payment.php?order_id=${encodeURIComponent(orderCode)}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.paid) {
              setPaymentConfirmed(true);
              setIsVerifyingPayment(false);
              clearInterval(interval);
            }
          }
        } catch {
          // Bỏ qua lỗi kết nối khi chạy vite dev local
        }
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSuccess, formData.paymentMethod, paymentConfirmed, orderCode]);

  if (!isOpen) return null;

  // Lọc chỉ những đơn vị vận chuyển ĐƯỢC BẬT TRONG QUẢN TRỊ (BACKEND)
  const allCarriers = storeConfig?.shippingCarriers || DEFAULT_SHIPPING_CARRIERS;
  const activeCarriers = allCarriers.filter(c => c.enabled);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Tính discount theo voucher động
  const currentVoucherObj = vouchers.find(v => v.code === (appliedVoucher?.code || appliedVoucher));
  let discountAmount = 0;
  let voucherShippingDiscount = 0;
  let giftItem = null;

  if (currentVoucherObj) {
    const res = calculateVoucherDiscount(currentVoucherObj, subtotal, 35000, cartItems);
    if (res.isValid) {
      discountAmount = res.discountAmount;
      voucherShippingDiscount = res.shippingDiscount;
      if (res.isGift && res.giftItem) {
        giftItem = res.giftItem;
      }
    }
  } else if (appliedVoucher === 'MEDXPRESS20') {
    discountAmount = 20000;
  } else if (appliedVoucher === 'NOIDIA10') {
    discountAmount = Math.round(subtotal * 0.1);
  }

  // Tính điểm thưởng được tích từ đơn hàng này: 100k = 1 điểm
  const earnedPoints = calculateEarnedPoints(subtotal);

  // Tính điểm thưởng tối đa có thể trừ
  const maxPossiblePoints = customer ? calculateMaxPointsToUse(customer.points, Math.max(0, subtotal - discountAmount)) : 0;
  const actualPointsToUse = usePoints ? Math.min(pointsToRedeem, maxPossiblePoints) : 0;
  const pointsDiscountAmount = calculatePointsDiscount(actualPointsToUse); // 1 điểm = 1.000₫

  // Kiểm tra giỏ hàng có combo liệu trình không (combo 3 / 6 hộp được miễn phí ship)
  const selectedCarrier = activeCarriers.find(c => c.id === formData.shippingMethod) || activeCarriers[0] || { baseFee: 35000, name: 'Giao hàng' };
  const hasComboItem = cartItems.some(item => item.comboType && item.comboType !== 'single');
  const isExpress = formData.shippingMethod === 'express';
  // Đơn hỏa tốc không áp dụng freeship; Giao hàng nhanh áp dụng freeship khi >= 500k hoặc có voucher FREESHIP hoặc combo
  const isStandardFreeShip = !isExpress && (subtotal >= 500000 || appliedVoucher === 'FREESHIP' || voucherShippingDiscount > 0 || hasComboItem);
  const isFreeShip = isStandardFreeShip;
  // Mặc định phí giao hàng 35.000đ nếu không được freeship
  const shippingFee = isExpress ? 0 : (isFreeShip ? 0 : (selectedCarrier.baseFee ?? 35000));

  const grandTotal = Math.max(0, subtotal - discountAmount - pointsDiscountAmount + shippingFee);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ và tên';
    if (!formData.phone.trim()) newErrors.phone = 'Vui lòng nhập số điện thoại để Dược sĩ liên hệ';
    if (!formData.province || !formData.province.trim()) {
      newErrors.province = 'Vui lòng chọn Tỉnh / Thành phố';
    }
    // Ràng buộc bắt buộc phải chọn Quận/Huyện với mã DistrictID chuẩn GHN
    if (!formData.to_district_id && !formData.districtId) {
      newErrors.district = 'Vui lòng chọn Quận / Huyện';
    }
    // Ràng buộc bắt buộc phải chọn Phường/Xã với mã WardCode chuẩn GHN
    if (!formData.to_ward_code && !formData.wardCode) {
      newErrors.ward = 'Vui lòng chọn Phường / Xã';
      newErrors.district = newErrors.district || 'Vui lòng chọn Phường / Xã';
    }
    if (!formData.address.trim()) newErrors.address = 'Vui lòng nhập địa chỉ nhận hàng chi tiết';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Generate random order code
    const generated = 'MXC-' + Math.floor(100000 + Math.random() * 900000);
    // Đối với GHN Express thực tế, mã vận đơn sẽ do API máy chủ GHN cấp chính thức (VD: GYMHGEYK) khi Shop đẩy đơn
    const trackingNo = formData.shippingMethod === 'ghn' 
      ? '' 
      : (formData.shippingMethod === 'ghtk' ? 'GHTK-' : 'MXC-') + Math.floor(100000 + Math.random() * 900000) + 'VN';
    setOrderCode(generated);

    // Lưu thông tin điểm thưởng
    setLastOrderPointsInfo({
      used: actualPointsToUse,
      usedAmount: pointsDiscountAmount,
      earned: earnedPoints,
      newTotalPoints: customer ? ((customer.points || 0) - actualPointsToUse + earnedPoints) : 0
    });

    const newOrderObj = {
      id: generated,
      trackingNumber: trackingNo,
      createdAt: new Date().toISOString(),
      customer: { 
        ...formData,
        to_district_id: Number(formData.to_district_id || formData.districtId || 1442),
        to_ward_code: String(formData.to_ward_code || formData.wardCode || '20314')
      },
      items: [...cartItems],
      giftItem,
      subtotal,
      discountAmount,
      pointsUsed: actualPointsToUse,
      pointsDiscount: pointsDiscountAmount,
      pointsEarned: earnedPoints,
      shippingFee,
      shippingCarrierName: selectedCarrier.name,
      shippingFeeNote: isExpress ? 'Cước hỏa tốc thực tế trao đổi khi xác nhận đơn' : (isFreeShip ? 'Miễn phí vận chuyển' : 'Cước tiêu chuẩn'),
      grandTotal,
      paymentMethod: formData.paymentMethod,
      shippingMethod: formData.shippingMethod,
      status: formData.paymentMethod === 'vietqr' ? 'pending' : 'pending',
      paymentStatus: 'unpaid'
    };

    // Save order object into admin system
    if (onOrderCreated) {
      onOrderCreated(newOrderObj);
    }

    // Bắn thông báo Telegram tự động cho Admin
    sendTelegramOrderNotification(newOrderObj, storeConfig).then(res => {
      if (res.success) {
        console.log('Đã bắn thông báo đơn hàng mới qua Telegram Bot cho Admin!');
      }
    }).catch(err => console.warn('Lỗi gửi Telegram:', err));

    // Cập nhật điểm cho tài khoản khách hàng
    if (customer && onUpdateCustomerPoints) {
      onUpdateCustomerPoints(customer.id, actualPointsToUse, earnedPoints, generated);
    }

    setCompletedOrder(newOrderObj);
    setIsSuccess(true);
    onClearCart();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-6 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="font-extrabold text-base sm:text-lg">
                Thanh Toán Đơn Hàng Dược Phẩm MedXpressCare
              </h2>
              <p className="text-[11px] text-slate-300">
                Cam kết bảo mật thông tin y tế & giao hàng chuẩn nhiệt độ
              </p>
            </div>
          </div>
          <button 
            onClick={handleModalClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5 sm:p-7 flex-1">
          {isSuccess ? (
            /* Order Success View */
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full uppercase tracking-wider">
                  Đặt Hàng Thành Công
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Cảm Ơn Quý Khách Đã Lựa Chọn MedXpressCare!
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mt-1">
                  Mã đơn hàng của quý khách: <strong className="font-mono text-emerald-700 font-bold text-base">{orderCode}</strong>
                </p>
              </div>

              {/* Lời Nhắc Uống Thuốc AI & Nhắc Tái Đặt Hàng Trước 2 - 3 Ngày */}
              <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-2 border-emerald-300 max-w-lg mx-auto text-left text-xs space-y-2.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="font-extrabold text-emerald-950 flex items-center gap-2">
                    <span className="text-xl">💊</span>
                    <span>Dược Sĩ AI Đã Lên Sẵn Lịch Uống Thuốc Cho Bạn</span>
                  </div>
                  <span className="text-[10px] bg-emerald-700 text-white font-black px-2 py-0.5 rounded-full">
                    AI 24/7
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Hệ thống đã tự động cài đặt các cữ uống thuốc chuẩn y khoa (Sáng/Tối) và hẹn <strong>nhắc tái đặt hàng trước 2 - 3 ngày</strong> khi hộp thuốc sắp hết để bạn nhận hàng vừa kịp lúc hộp cũ hết!
                </p>
                <div className="flex items-center gap-2 pt-1">
                  {onOpenMedicineCabinet && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenMedicineCabinet();
                      }}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <span>Xem & Tùy Chỉnh Giờ Uống (Tủ Thuốc AI)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* VietQR dynamic transfer box if VietQR selected */}
              {formData.paymentMethod === 'vietqr' && (() => {
                const displayGrandTotal = completedOrder ? completedOrder.grandTotal : grandTotal;
                const displayOrderCode = completedOrder ? completedOrder.id : orderCode;
                const bank = getBankInfo(storeConfig?.bankBin || storeConfig?.bankName);
                const officialVietQrUrl = getVietQRImageUrl({
                  bankNameOrBin: bank.bin,
                  accountNo: storeConfig.bankAccountNumber,
                  accountName: storeConfig.bankAccountName,
                  amount: displayGrandTotal,
                  description: displayOrderCode,
                  template: 'compact2'
                });
                const fallbackQrUrl = getVietQRFallbackUrl({
                  bankNameOrBin: bank.bin,
                  accountNo: storeConfig.bankAccountNumber,
                  amount: displayGrandTotal,
                  description: displayOrderCode
                });

                return (
                  <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        <span>Quét Mã VietQR Chuyển Khoản:</span>
                      </div>
                      {paymentConfirmed ? (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Đã Nhận Tiền
                        </span>
                      ) : (
                        <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
                          Chờ Webhook
                        </span>
                      )}
                    </div>

                    {paymentConfirmed ? (
                      <div className="p-4 rounded-2xl bg-emerald-500 text-white space-y-2 text-center animate-in zoom-in-95 shadow-md">
                        <div className="w-12 h-12 rounded-full bg-white text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                          <CheckCircle2 className="w-8 h-8" />
                        </div>
                        <h4 className="font-black text-sm uppercase tracking-wide">
                          Ngân Hàng Đã Xác Nhận Thanh Toán!
                        </h4>
                        <p className="text-xs text-emerald-100 leading-relaxed">
                          Hệ thống đã nhận đủ <strong>{displayGrandTotal.toLocaleString('vi-VN')}₫</strong>. Dược sĩ đang tiến hành đóng gói hỏa tốc cho quý khách.
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col items-center gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
                          <div className="relative group flex justify-center w-full">
                            <img 
                              src={useQrFallback ? fallbackQrUrl : officialVietQrUrl} 
                              onError={() => setUseQrFallback(true)}
                              alt={`VietQR ${bank.shortName} ${storeConfig.bankAccountNumber}`}
                              className="w-56 max-w-full h-auto rounded-2xl border border-slate-200 shadow-xs object-contain"
                            />
                          </div>

                          {/* Nút thao tác nhanh */}
                          <div className="flex flex-wrap items-center justify-center gap-2 w-full pt-1">
                            <a
                              href={useQrFallback ? fallbackQrUrl : officialVietQrUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              download={`VietQR_${displayOrderCode}.png`}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center gap-1.5 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5 text-slate-600" />
                              <span>Tải Mã QR Về Máy</span>
                            </a>
                            <a
                              href={officialVietQrUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[11px] flex items-center gap-1.5 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Mở Toàn Màn Hình</span>
                            </a>
                          </div>

                          {/* Chi tiết tài khoản với nút Copy 1-chạm */}
                          <div className="w-full space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-slate-700">
                            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                              <span className="text-slate-500">Ngân hàng:</span>
                              <strong className="text-slate-900 font-bold">{bank.shortName} ({bank.name})</strong>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                              <span className="text-slate-500">Số tài khoản:</span>
                              <div className="flex items-center gap-1.5">
                                <strong className="font-mono text-emerald-700 font-extrabold text-xs">{storeConfig.bankAccountNumber}</strong>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(storeConfig.bankAccountNumber, 'accountNumber')}
                                  className="p-1 rounded-md hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                  title="Sao chép số tài khoản"
                                >
                                  {copiedField === 'accountNumber' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                              <span className="text-slate-500">Chủ tài khoản:</span>
                              <strong className="text-slate-900 font-bold">{storeConfig.bankAccountName}</strong>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl bg-rose-50 border border-rose-100">
                              <span className="text-rose-700 font-bold">Số tiền chuyển:</span>
                              <div className="flex items-center gap-1.5">
                                <strong className="font-mono text-rose-600 font-black text-sm">{displayGrandTotal.toLocaleString('vi-VN')}₫</strong>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(displayGrandTotal, 'amount')}
                                  className="p-1 rounded-md hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                                  title="Sao chép số tiền"
                                >
                                  {copiedField === 'amount' ? <Check className="w-3.5 h-3.5 text-rose-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50 border border-blue-100">
                              <span className="text-blue-800 font-bold">Nội dung CK:</span>
                              <div className="flex items-center gap-1.5">
                                <strong className="font-mono text-blue-700 font-extrabold text-xs bg-white px-1.5 py-0.5 rounded border border-blue-200">{displayOrderCode}</strong>
                                <button
                                  type="button"
                                  onClick={() => handleCopyText(displayOrderCode, 'orderCode')}
                                  className="p-1 rounded-md hover:bg-blue-100 text-blue-700 transition-colors cursor-pointer"
                                  title="Sao chép nội dung chuyển khoản"
                                >
                                  {copiedField === 'orderCode' ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-500 text-center leading-relaxed">
                            💡 <em>Khi quét bằng bất kỳ App ngân hàng nào ({bank.shortName}, VCB, MB, BIDV, VPBank, ACB...), số tiền và nội dung chuyển khoản sẽ được tự động điền sẵn chính xác 100%.</em>
                          </p>
                        </div>

                        {/* Trạng thái lắng nghe Webhook an toàn chuẩn bảo mật */}
                        <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-900 flex items-center justify-between gap-2 text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                            </span>
                            <span className="font-semibold">Hệ thống đang tự động kiểm tra giao dịch chuyển khoản VietQR...</span>
                          </div>
                          <span className="text-[10px] text-blue-700 bg-white px-2 py-0.5 rounded-md border border-blue-200 shrink-0 font-medium shadow-2xs">
                            Tự động xác nhận 24/7
                          </span>
                        </div>

                        {/* Đổi phương thức thanh toán khác */}
                        <div className="pt-2 text-center border-t border-slate-200/80">
                          {!isChangingPaymentMethod ? (
                            <button
                              type="button"
                              onClick={() => setIsChangingPaymentMethod(true)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 underline decoration-slate-300 hover:decoration-emerald-500 underline-offset-4 transition-colors cursor-pointer py-1"
                            >
                              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                              <span>Đổi phương thức thanh toán khác</span>
                            </button>
                          ) : (
                            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-left space-y-2.5 animate-in fade-in zoom-in-95 mt-1">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-xs text-amber-900 flex items-center gap-1.5">
                                  <Banknote className="w-4 h-4 text-amber-700" />
                                  Chọn phương thức thanh toán thay thế:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setIsChangingPaymentMethod(false)}
                                  className="text-[11px] text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
                                >
                                  Đóng
                                </button>
                              </div>

                              <div className="space-y-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleChangePaymentMethod('cod')}
                                  className="w-full p-2.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50/70 flex items-center justify-between transition-all cursor-pointer text-left shadow-2xs"
                                >
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                                      <Banknote className="w-4 h-4 text-emerald-700" />
                                    </div>
                                    <div>
                                      <div className="font-bold text-xs text-slate-900">Thanh toán tiền mặt khi nhận hàng (COD)</div>
                                      <div className="text-[10px] text-slate-500">Thanh toán trực tiếp cho bưu tá khi nhận kiện hàng</div>
                                    </div>
                                  </div>
                                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
                                    Chuyển sang COD
                                  </span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}

              {/* Khối xác nhận đơn COD nếu khách chọn thanh toán khi nhận hàng */}
              {formData.paymentMethod === 'cod' && (() => {
                const displayGrandTotal = completedOrder ? completedOrder.grandTotal : grandTotal;
                return (
                  <div className="p-4 rounded-3xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left text-xs space-y-3 shadow-sm animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-800 flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span>Thanh Toán Tiền Mặt Khi Nhận Hàng (COD):</span>
                      </div>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        COD Tiền Mặt
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600">Số tiền bưu tá sẽ thu khi giao:</span>
                        <strong className="font-mono text-emerald-700 font-black text-base">{displayGrandTotal.toLocaleString('vi-VN')}₫</strong>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        📦 Quý khách vui lòng chuẩn bị đúng số tiền trên khi bưu tá giao hàng. Kiện hàng được niêm phong cẩn thận, quý khách được đồng kiểm xem hàng trước khi thanh toán.
                      </p>
                    </div>

                    {/* Nút đổi sang VietQR nếu khách muốn chuyển sang thanh toán trước */}
                    <div className="pt-1 text-center border-t border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => handleChangePaymentMethod('vietqr')}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-700 underline decoration-slate-300 hover:decoration-emerald-500 underline-offset-4 transition-colors cursor-pointer py-1"
                      >
                        <QrCode className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Đổi phương thức thanh toán khác</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* Thông Báo Biến Động Điểm Thưởng Khách Hàng */}
              {lastOrderPointsInfo && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 max-w-md mx-auto text-left text-xs text-amber-950 space-y-2 shadow-xs">
                  <div className="font-extrabold flex items-center gap-2 text-amber-900">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Điểm Thưởng Thành Viên MedXpress:</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    {lastOrderPointsInfo.used > 0 && (
                      <div className="flex justify-between items-center bg-white/70 p-2 rounded-lg">
                        <span>• Đã dùng trừ tiền đơn hàng:</span>
                        <strong className="text-rose-600 font-mono">
                          -{lastOrderPointsInfo.used} điểm (-{lastOrderPointsInfo.usedAmount.toLocaleString('vi-VN')}₫)
                        </strong>
                      </div>
                    )}
                    {lastOrderPointsInfo.earned > 0 && (
                      <div className="flex justify-between items-center bg-white/70 p-2 rounded-lg">
                        <span>• Tích lũy mới từ đơn hàng này (100k = 1đ):</span>
                        <strong className="text-emerald-700 font-mono">
                          +{lastOrderPointsInfo.earned} điểm (+{(lastOrderPointsInfo.earned * 1000).toLocaleString('vi-VN')}₫)
                        </strong>
                      </div>
                    )}
                    {customer && (
                      <div className="flex justify-between items-center pt-1.5 border-t border-amber-200/80 font-bold text-slate-800">
                        <span>Số dư điểm hiện tại của quý khách:</span>
                        <span className="text-amber-800 text-xs">
                          {lastOrderPointsInfo.newTotalPoints} điểm ({((lastOrderPointsInfo.newTotalPoints) * 1000).toLocaleString('vi-VN')}₫)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs max-w-lg mx-auto text-left space-y-1.5">
                <div className="font-bold flex items-center gap-1.5">
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                  Quy Trình Xử Lý Đơn Hàng Dược Phẩm:
                </div>
                <p>1. Dược sĩ phụ trách tại cơ sở Hà Nội sẽ gọi điện qua số <strong className="underline">{formData.phone}</strong> trong vòng 15 phút để xác nhận tiền sử bệnh lý và hướng dẫn liều dùng.</p>
                <p>2. Đơn hàng được đóng gói kín đáo, cẩn thận, có đính kèm hóa đơn VAT và tem phụ sản phẩm.</p>
                <p>3. Quý khách được quyền mở hộp kiểm tra tem chống hàng giả trước khi thanh toán.</p>
                {formData.shippingMethod === 'express' && (
                  <p className="text-amber-800 font-semibold bg-amber-100/70 p-2 rounded-lg border border-amber-200 mt-1">
                    ⚡ <strong>Đơn Giao Hỏa Tốc Hà Nội:</strong> Cước phí vận chuyển tính theo app thực tế tại thời điểm giao hàng, Dược sĩ sẽ trao đổi trực tiếp khi gọi xác nhận đơn.
                  </p>
                )}
              </div>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                {onNavigateToTracking && (
                  <button
                    type="button"
                    onClick={() => {
                      const finalId = completedOrder?.id || orderCode;
                      handleModalClose();
                      onNavigateToTracking(finalId);
                    }}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>🚚 Theo Dõi Vận Đơn Ngay</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Hoàn Tất & Tiếp Tục Mua Sắm
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form View */
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Order Items Mini Summary */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                <div className="font-bold text-slate-800 flex justify-between">
                  <span>Sản phẩm trong đơn ({cartItems.reduce((a, b) => a + b.quantity, 0)} hộp):</span>
                  <span className="text-emerald-700 font-extrabold">{grandTotal.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-slate-600">
                      <span className="truncate max-w-[70%]">• {item.name} (x{item.quantity})</span>
                      <span className="font-mono font-medium">{(item.price * item.quantity).toLocaleString('vi-VN')}₫</span>
                    </div>
                  ))}
                  {giftItem && (
                    <div className="flex justify-between items-center text-rose-700 bg-rose-50/80 p-1.5 rounded-lg border border-rose-200 font-bold mt-1">
                      <span className="truncate max-w-[70%] flex items-center gap-1">
                        <span>🎁 Quà tặng:</span>
                        <span className="truncate">{giftItem.name}</span>
                      </span>
                      <span className="text-emerald-700 font-extrabold shrink-0">0₫ (Miễn phí)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* KHỐI ĐIỂM THƯỞNG THÀNH VIÊN (TÍCH ĐIỂM 100K = 1Đ & ĐỔI 1Đ = 1K TRỪ TIỀN) */}
              <div className="p-4 rounded-2xl border bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-amber-50/90 border-amber-300/80 shadow-xs space-y-3">
                {customer ? (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-200/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                            <span>{customer.fullName}</span>
                            <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded-full font-bold">
                              {customer.tier || 'Thành viên MedXpress'}
                            </span>
                          </div>
                          <div className="text-[11px] text-amber-900">
                            Số dư: <strong className="text-amber-800 font-black">{customer.points || 0} điểm</strong> (= {((customer.points || 0) * 1000).toLocaleString('vi-VN')}₫)
                          </div>
                        </div>
                      </div>

                      <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-300/60 self-start sm:self-auto">
                        🎁 Tích thêm: <strong>+{earnedPoints} điểm</strong> (100k = 1đ)
                      </div>
                    </div>

                    {/* Lựa chọn dùng điểm trừ tiền */}
                    {(customer.points || 0) > 0 ? (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={usePoints}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              setUsePoints(checked);
                              if (checked) {
                                setPointsToRedeem(maxPossiblePoints);
                              }
                            }}
                            className="w-4 h-4 text-emerald-600 rounded border-amber-300 focus:ring-emerald-500"
                          />
                          <span className="text-xs font-bold text-slate-800">
                            Dùng điểm tích lũy để trừ tiền ngay cho đơn này
                          </span>
                        </label>

                        {usePoints && (
                          <div className="p-3 bg-white rounded-xl border border-amber-300 space-y-2 animate-in fade-in text-xs">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-600">Số điểm muốn đổi (1 điểm = 1.000₫):</span>
                              <button
                                type="button"
                                onClick={() => setPointsToRedeem(maxPossiblePoints)}
                                className="text-[11px] font-bold text-amber-800 underline hover:text-amber-900"
                              >
                                Dùng tối đa ({maxPossiblePoints} điểm)
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max={maxPossiblePoints}
                                value={pointsToRedeem}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 0;
                                  setPointsToRedeem(Math.min(maxPossiblePoints, Math.max(0, val)));
                                }}
                                className="w-28 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-emerald-700 text-sm focus:outline-none focus:border-emerald-500"
                              />
                              <span className="text-xs font-bold text-slate-700">điểm</span>
                              <span className="text-xs text-rose-600 font-extrabold ml-auto">
                                -{(actualPointsToUse * 1000).toLocaleString('vi-VN')}₫
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-600">
                        Bạn hiện chưa có điểm tích lũy. Hoàn tất đơn hàng này bạn sẽ nhận được <strong className="text-emerald-700">+{earnedPoints} điểm</strong> để trừ tiền cho lần mua sau!
                      </p>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="font-extrabold text-amber-950 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-amber-600" />
                        <span>Chương Trình Khách Hàng Thân Thiết MedXpressCare:</span>
                      </div>
                      <p className="text-slate-600 text-[11px]">
                        Đăng nhập để đổi điểm tích lũy hoặc tích ngay <strong className="text-emerald-700">+{earnedPoints} điểm</strong> (+{(earnedPoints * 1000).toLocaleString('vi-VN')}₫) từ đơn này!
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={onOpenAuthModal}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl text-xs shadow-xs transition-all shrink-0"
                    >
                      Đăng Nhập / Đăng Ký
                    </button>
                  </div>
                )}
              </div>

              {/* Thông tin giao hàng */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                  Thông Tin Người Nhận Hàng
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Họ và tên người nhận <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    {errors.fullName && <p className="text-[11px] text-rose-500 mt-0.5">{errors.fullName}</p>}
                  </div>

                  <div>
                    <label className="block text-slate-600 font-semibold mb-1">
                      Số điện thoại nhận hàng <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="0912 345 678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    {errors.phone && <p className="text-[11px] text-rose-500 mt-0.5">{errors.phone}</p>}
                  </div>
                </div>

                {/* Mô Hình Địa Chỉ Chuẩn GHN (Tỉnh/Thành phố, Quận/Huyện to_district_id, Phường/Xã <option value="Mã_WardCode">) */}
                <TwoTierAddressFields
                  province={formData.province}
                  provinceId={formData.provinceId}
                  district={formData.district}
                  districtId={formData.to_district_id || formData.districtId}
                  ward={formData.ward}
                  wardCode={formData.to_ward_code || formData.wardCode}
                  apiKey={storeConfig?.shippingCarriers?.find(c => c.id === 'ghn')?.apiKey}
                  onProvinceChange={(newProv, newProvId) => {
                    setFormData(prev => ({
                      ...prev,
                      province: newProv,
                      provinceId: newProvId,
                      district: '',
                      districtId: null,
                      to_district_id: null,
                      ward: '',
                      wardCode: '',
                      to_ward_code: '',
                      // Nếu chuyển sang tỉnh khác ngoài Hà Nội mà đang chọn hỏa tốc, tự động chuyển về Giao hàng nhanh (GHTK)
                      shippingMethod: (!isHanoiProvince(newProv) && prev.shippingMethod === 'express') ? 'ghtk' : prev.shippingMethod
                    }));
                    if (errors.province) setErrors(prev => ({ ...prev, province: '' }));
                  }}
                  onDistrictChange={(distName, distId) => {
                    setFormData(prev => ({
                      ...prev,
                      district: distName,
                      districtId: distId ? Number(distId) : null,
                      to_district_id: distId ? Number(distId) : null,
                      ward: '',
                      wardCode: '',
                      to_ward_code: ''
                    }));
                    if (errors.district) setErrors(prev => ({ ...prev, district: '' }));
                  }}
                  onWardChange={(newWard, newWardCode, distId, distName) => {
                    setFormData(prev => ({
                      ...prev,
                      ward: newWard,
                      district: distName || prev.district,
                      districtId: distId ? Number(distId) : prev.districtId,
                      to_district_id: distId ? Number(distId) : prev.to_district_id,
                      wardCode: newWardCode ? String(newWardCode) : '',
                      to_ward_code: newWardCode ? String(newWardCode) : ''
                    }));
                    if (errors.ward) setErrors(prev => ({ ...prev, ward: '' }));
                    if (errors.district) setErrors(prev => ({ ...prev, district: '' }));
                  }}
                  onWardCodeChange={(code) => {
                    setFormData(prev => ({ ...prev, wardCode: code ? String(code) : '', to_ward_code: code ? String(code) : '' }));
                    if (errors.ward) setErrors(prev => ({ ...prev, ward: '' }));
                    if (errors.district) setErrors(prev => ({ ...prev, district: '' }));
                  }}
                  errorProvince={errors.province}
                  errorDistrict={errors.district}
                  errorWard={errors.ward || errors.district}
                />

                <div className="text-xs">
                  <label className="block text-slate-600 font-semibold mb-1">
                    Địa chỉ chi tiết (Số nhà, tên đường, thôn xóm, tòa nhà) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Số 123 Đường Cầu Giấy, Tòa nhà Indochina..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                  {errors.address && <p className="text-[11px] text-rose-500 mt-0.5">{errors.address}</p>}
                </div>

                <div className="text-xs">
                  <label className="block text-slate-600 font-semibold mb-1">
                    Ghi chú cho Dược sĩ tư vấn (tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Người dùng có tiền sử đau dạ dày, gọi trước khi giao..."
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Hình thức giao hàng */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                    Đơn Vị & Hình Thức Vận Chuyển
                  </h4>
                  {isStandardFreeShip && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      Miễn Phí Vận Chuyển (Giao Nhanh)
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  {activeCarriers.length === 0 ? (
                    <div className="col-span-2 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                      ⚠️ Tuyến vận chuyển cho khu vực của quý khách đang được tối ưu hóa. Vui lòng liên hệ Dược sĩ hotline <strong>{storeConfig?.hotline || '1800 6868'}</strong> để được hỗ trợ giao hàng hỏa tốc.
                    </div>
                  ) : (
                    activeCarriers.map((carrier) => {
                      const isExpressCarrier = carrier.id === 'express';
                      const isExpressDisabled = isExpressCarrier && !isHanoiProvince(formData.province);

                      return (
                        <label 
                          key={carrier.id}
                          className={`p-3 rounded-2xl border-2 flex items-start gap-2.5 transition-all ${
                            isExpressDisabled
                              ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                              : formData.shippingMethod === carrier.id 
                                ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 cursor-pointer' 
                                : 'border-slate-200 hover:border-slate-300 bg-white cursor-pointer'
                          }`}
                        >
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={carrier.id}
                            disabled={isExpressDisabled}
                            checked={formData.shippingMethod === carrier.id}
                            onChange={() => !isExpressDisabled && setFormData({ ...formData, shippingMethod: carrier.id })}
                            className="mt-0.5 text-emerald-600 focus:ring-emerald-500 disabled:opacity-40"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 flex items-center justify-between gap-1">
                              <span className="flex items-center gap-1.5 truncate">
                                <span>{carrier.icon || '📦'}</span>
                                <span className="truncate">{carrier.name}</span>
                              </span>
                              <strong className="text-emerald-700 font-mono shrink-0">
                                {isExpressCarrier ? (
                                  <span className="text-amber-700 font-extrabold text-[11px]">Theo thực tế</span>
                                ) : isStandardFreeShip ? (
                                  '0₫'
                                ) : (
                                  `${(carrier.baseFee || 22000).toLocaleString('vi-VN')}₫`
                                )}
                              </strong>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {carrier.badge && (
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  isExpressCarrier ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {carrier.badge}
                                </span>
                              )}
                              <span className="text-[10px] text-emerald-800 font-medium">
                                ⏱️ {carrier.estimatedDays || '1-2 ngày'}
                              </span>
                              {isExpressCarrier && (
                                <span className="text-[9px] text-rose-600 font-semibold bg-rose-50 px-1 py-0.2 rounded border border-rose-100">
                                  Không Freeship
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                              {isExpressDisabled 
                                ? '⚠️ Hỏa tốc chỉ áp dụng tại nội thành Hà Nội (cơ sở duy nhất).'
                                : carrier.description}
                            </p>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>

                {/* Hướng dẫn cước khi chọn Giao Hỏa Tốc */}
                {formData.shippingMethod === 'express' && (
                  <div className="p-3 bg-amber-50/90 border border-amber-200/80 rounded-2xl text-[11px] text-amber-950 flex items-start gap-2 shadow-2xs mt-2">
                    <span className="text-amber-600 text-base leading-none">⚡</span>
                    <div>
                      <strong>Chính sách Giao Hỏa Tốc (Nội thành Hà Nội):</strong> Cước vận chuyển tính theo thực tế ứng dụng giao hàng (Grab/Ahamove) tại thời điểm xuất kho. Dược sĩ sẽ liên hệ trao đổi trực tiếp khi gọi điện xác nhận đơn. <em>Lưu ý: Đơn hỏa tốc không áp dụng chính sách miễn phí vận chuyển.</em>
                    </div>
                  </div>
                )}
              </div>

              {/* Phương thức thanh toán */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                  Phương Thức Thanh Toán
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                  <label className={`p-3 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                    formData.paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'cod' })}
                        className="text-emerald-600"
                      />
                      <Banknote className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900">COD Tiền Mặt</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Kiểm tra tem cào trước khi trả tiền</p>
                  </label>

                  <label className={`p-3 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                    formData.paymentMethod === 'vietqr' ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="vietqr"
                        checked={formData.paymentMethod === 'vietqr'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'vietqr' })}
                        className="text-emerald-600"
                      />
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900">VietQR Tự Động</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Quét mã chuyển khoản qua mọi app ngân hàng</p>
                  </label>

                  <label className={`p-3 rounded-xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                    formData.paymentMethod === 'vnpay' ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="vnpay"
                        checked={formData.paymentMethod === 'vnpay'}
                        onChange={() => setFormData({ ...formData, paymentMethod: 'vnpay' })}
                        className="text-emerald-600"
                      />
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-slate-900">Visa / Ví MoMo</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-2">Cổng thanh toán bảo mật PCI-DSS</p>
                  </label>
                </div>
              </div>

              {/* Khối áp dụng Voucher & Khuyến mãi */}
              <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="font-extrabold text-slate-900">
                      {appliedVoucher ? `Mã ưu đãi: ${appliedVoucher}` : 'Mã giảm giá & Khuyến mãi'}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {currentVoucherObj ? currentVoucherObj.title : 'Chưa áp dụng mã ưu đãi'}
                    </p>
                  </div>
                </div>
                {onOpenVoucherModal && (
                  <button
                    type="button"
                    onClick={onOpenVoucherModal}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors"
                  >
                    {appliedVoucher ? 'Đổi mã' : 'Chọn Voucher'}
                  </button>
                )}
              </div>

              {/* Chi tiết tính tiền & Điểm thưởng */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-1.5 text-slate-600">
                <div className="flex justify-between">
                  <span>Tạm tính tiền hàng:</span>
                  <span className="font-semibold text-slate-900">{subtotal.toLocaleString('vi-VN')}₫</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Mã ưu đãi ({appliedVoucher}):</span>
                    <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}

                {giftItem && (
                  <div className="flex justify-between items-center text-rose-700 font-extrabold bg-rose-50 p-2 rounded-xl border border-rose-200">
                    <span className="flex items-center gap-1">
                      <span>🎁 Quà tặng kèm ({appliedVoucher}):</span>
                    </span>
                    <span className="truncate max-w-[200px] text-right">
                      {giftItem.name} (0₫)
                    </span>
                  </div>
                )}

                {actualPointsToUse > 0 && (
                  <div className="flex justify-between text-rose-600 font-bold">
                    <span>Giảm trừ điểm thưởng ({actualPointsToUse} điểm):</span>
                    <span>-{pointsDiscountAmount.toLocaleString('vi-VN')}₫</span>
                  </div>
                )}

                <div className="flex justify-between items-start">
                  <div>
                    <span>Phí vận chuyển:</span>
                    {isExpress && (
                      <span className="block text-[10px] text-amber-700 font-medium">
                        (Cước thực tế trao đổi khi xác nhận đơn, không Freeship)
                      </span>
                    )}
                  </div>
                  <span>
                    {isExpress ? (
                      <strong className="text-amber-700 font-bold">Theo thực tế</strong>
                    ) : shippingFee === 0 ? (
                      <strong className="text-emerald-600">MIỄN PHÍ</strong>
                    ) : (
                      `${shippingFee.toLocaleString('vi-VN')}₫`
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center text-amber-900 bg-amber-100/70 p-2 rounded-xl border border-amber-200 font-semibold text-[11px] mt-1">
                  <span>✨ Tích lũy thêm từ đơn này (100k = 1đ):</span>
                  <strong className="text-emerald-700 font-bold">+{earnedPoints} điểm (+{(earnedPoints * 1000).toLocaleString('vi-VN')}₫)</strong>
                </div>

                <div className="flex justify-between items-start text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <div>
                    <span>Tổng thanh toán:</span>
                    {isExpress && (
                      <span className="block text-[10px] font-normal text-slate-500">
                        (Chưa gồm cước ship hỏa tốc - Dược sĩ sẽ báo khi chốt đơn)
                      </span>
                    )}
                  </div>
                  <span className="text-emerald-700 text-base">{grandTotal.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                {Object.keys(errors).length > 0 && (
                  <div className="mb-2.5 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-shake">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện, Phường/Xã và nhập địa chỉ chi tiết trước khi đặt hàng.</span>
                  </div>
                )}
                <button
                  type="submit"
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Xác Nhận Đặt Hàng ({grandTotal.toLocaleString('vi-VN')}₫)</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Bằng việc đặt hàng, quý khách đồng ý với các chính sách vận chuyển và bảo mật của MedXpressCare.
                </p>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
