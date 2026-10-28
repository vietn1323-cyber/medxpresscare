import React, { useState, useEffect } from 'react';
import { 
  X, Truck, CheckCircle2, Clock, Phone, MapPin, 
  Package, ShieldCheck, RefreshCw, Copy, ExternalLink,
  Printer, ArrowRight, AlertCircle, Sparkles, Search
} from 'lucide-react';
import { getCarrierInfo, cleanTrackingItem, formatCleanTrackingTime } from '../utils/logisticsHelper';

export const OrderTrackingModal = ({
  isOpen,
  onClose,
  order = null,
  orders = [],
  initialOrderCode = '',
  onSyncCarrierStatus,
  onPrintSlip,
  isAdmin = false,
  hotline = '1800 6868'
}) => {
  const [copied, setCopied] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialOrderCode || (order ? order.id : ''));
  const [phoneAuth, setPhoneAuth] = useState('');
  const [authError, setAuthError] = useState('');
  const [currentSelectedOrder, setCurrentSelectedOrder] = useState(order);

  const maskPhone = (phone) => {
    if (!phone) return '***';
    const clean = phone.replace(/\s+/g, '');
    if (clean.length < 7) return '***';
    return clean.slice(0, 3) + '****' + clean.slice(-3);
  };

  const maskName = (name) => {
    if (!name) return 'Khách hàng';
    const parts = name.trim().split(' ');
    if (parts.length <= 1) return name[0] + '***';
    return parts[0] + ' *** ' + parts[parts.length - 1];
  };

  useEffect(() => {
    if (order) {
      setCurrentSelectedOrder(order);
      setSearchQuery(order.id);
    } else if (initialOrderCode) {
      const found = orders.find(
        o => o.id === initialOrderCode || o.trackingNumber === initialOrderCode
      );
      if (found) {
        setCurrentSelectedOrder(found);
        setSearchQuery(found.id);
      }
    } else if (isAdmin && orders.length > 0) {
      // Chỉ Admin mới được mặc định xem đơn gần nhất
      setCurrentSelectedOrder(orders[0]);
    } else {
      setCurrentSelectedOrder(null);
    }
  }, [order, orders, initialOrderCode, isAdmin]);

  if (!isOpen) return null;

  const displayOrder = currentSelectedOrder || (orders.length > 0 ? orders[0] : null);

  if (!displayOrder) {
    return (
      <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in" onClick={onClose}>
        <div className="bg-white p-6 sm:p-8 rounded-3xl max-w-md w-full text-center space-y-4 shadow-2xl border border-slate-100 animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-base">Tra Cứu Hành Trình Đơn Hàng</h4>
            <p className="text-xs text-slate-500 mt-1">Bảo mật thông tin người nhận theo Nghị định 13/2023/NĐ-CP</p>
          </div>

          <form onSubmit={handleSearchOrder} className="space-y-3 text-left">
            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mã Đơn Hàng / Mã Vận Đơn *</label>
              <input
                type="text"
                placeholder="VD: MXC-482910 hoặc GHTK-883921VN"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số Điện Thoại (hoặc 4 số cuối SĐT nhận thuốc) *</label>
              <input
                type="text"
                placeholder="VD: 0988123456 hoặc 3456"
                value={phoneAuth}
                onChange={e => setPhoneAuth(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Search className="w-4 h-4" />
              <span>Xác Thực & Tra Cứu Vận Đơn</span>
            </button>
          </form>

          <button onClick={onClose} className="text-xs font-semibold text-slate-400 hover:text-slate-600 underline">
            Đóng Lại
          </button>
        </div>
      </div>
    );
  }

  const carrier = getCarrierInfo(displayOrder.shippingMethod);
  const trackingNo = (displayOrder.ghnOrderCode || (displayOrder.trackingNumber && !displayOrder.trackingNumber.startsWith('GHN-') ? displayOrder.trackingNumber : (displayOrder.shippingMethod === 'ghn' ? 'Chờ bưu cục GHN cấp mã' : displayOrder.trackingNumber || 'Đang cập nhật'))).toUpperCase();
  const timeline = Array.isArray(displayOrder.trackingTimeline) && displayOrder.trackingTimeline.length > 0
    ? displayOrder.trackingTimeline
    : [
        {
          time: formatCleanTrackingTime(displayOrder.createdAt || new Date()),
          status: 'pending',
          stage: 'order_created',
          title: 'Đơn hàng đã được khởi tạo thành công',
          desc: 'Khách hàng đặt hàng trực tuyến trên MedXpressCare.',
          location: 'Kho hàng MedXpressCare'
        }
      ];

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      if (onSyncCarrierStatus) {
        onSyncCarrierStatus(displayOrder);
      }
      setIsSyncing(false);
    }, 500);
  };

  const handleSearchOrder = (e) => {
    e.preventDefault();
    setAuthError('');
    const q = searchQuery.trim().toLowerCase();
    const pInput = phoneAuth.trim().replace(/\s+/g, '');

    const found = orders.find(
      o => o.id.toLowerCase() === q || 
           (o.trackingNumber && o.trackingNumber.toLowerCase() === q)
    );

    if (!found) {
      setAuthError(`Không tìm thấy đơn hàng hoặc mã vận đơn: "${searchQuery}"`);
      return;
    }

    // Cơ chế phòng chống IDOR & Bảo vệ PII theo Nghị định 13/2023/NĐ-CP:
    // Nếu không phải Quản trị viên, yêu cầu đối soát số điện thoại hoặc 4 số cuối SĐT nhận thuốc
    if (!isAdmin) {
      const orderPhone = (found.customer?.phone || '').replace(/\s+/g, '');
      if (!pInput || (!orderPhone.endsWith(pInput) && pInput !== orderPhone)) {
        setAuthError('Số điện thoại xác thực không khớp với người nhận đơn hàng này. Vui lòng kiểm tra lại 4 số cuối SĐT.');
        return;
      }
    }

    setCurrentSelectedOrder(found);
    setAuthError('');
  };

  // Tính toán bước hiện tại
  let currentStep = 1;
  if (displayOrder.status === 'confirmed') currentStep = 2;
  if (displayOrder.status === 'shipping') currentStep = 3;
  if (displayOrder.status === 'completed') currentStep = 4;

  const progressPercent = displayOrder.carrierProgress || (currentStep === 1 ? 15 : currentStep === 2 ? 35 : currentStep === 3 ? 70 : 100);

  return (
    <div 
      className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/30 shrink-0">
              <Truck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-sm text-emerald-300">
                  {displayOrder.id}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-900/80 text-emerald-200 border border-emerald-700/60 flex items-center gap-1">
                  <span>{carrier.icon}</span>
                  <span>{carrier.name}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Theo dõi bưu tá giao hàng & tự động tracking theo thời gian thực
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* Quick Search Bar (nếu mở từ header hoặc có nhiều đơn) */}
          {orders.length > 1 && !order && (
            <form onSubmit={handleSearchOrder} className="flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Tra cứu theo Mã đơn (MXC-...) hoặc Mã vận đơn (GHTK-...)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
              >
                Tra cứu
              </button>
            </form>
          )}

          {/* Tracking Number Card */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Mã vận đơn bưu cục (Tracking No.):
                </span>
                {displayOrder.autoTracking && (
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.2 rounded-full border border-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>{isAdmin ? 'Auto-tracking Active' : 'Cập nhật trực tiếp'}</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-base text-slate-900 selection:bg-emerald-200">
                  {trackingNo}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(trackingNo)}
                  className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 font-bold text-[11px] flex items-center gap-1 shadow-2xs transition-colors"
                  title="Sao chép mã vận đơn"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'Đã sao chép!' : 'Chép mã'}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-2xs ${
                displayOrder.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : displayOrder.status === 'returned'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : displayOrder.status === 'returned_pending_check'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : displayOrder.status === 'returning'
                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                  : displayOrder.status === 'shipping'
                  ? 'bg-blue-100 text-blue-800 border border-blue-300 animate-pulse'
                  : displayOrder.status === 'confirmed'
                  ? 'bg-indigo-100 text-indigo-800 border border-indigo-300'
                  : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {displayOrder.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {displayOrder.status === 'returned' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {displayOrder.status === 'returned_pending_check' && <AlertCircle className="w-4 h-4 text-amber-600 animate-pulse" />}
                {displayOrder.status === 'returning' && <AlertCircle className="w-4 h-4 text-rose-600" />}
                {displayOrder.status === 'shipping' && <Truck className="w-4 h-4 text-blue-600" />}
                {displayOrder.status === 'confirmed' && <Clock className="w-4 h-4 text-indigo-600" />}
                {displayOrder.status === 'pending' && <Clock className="w-4 h-4 text-amber-600" />}

                <span>
                  {displayOrder.status === 'completed' ? 'Đã Giao Thành Công' :
                   displayOrder.status === 'returned' ? 'Đã Nhận Hàng Hoàn & Tái Nhập Kho' :
                   displayOrder.status === 'returned_pending_check' ? 'Hàng Hoàn Đã Về Kho (Chờ Dược Sĩ Kiểm)' :
                   displayOrder.status === 'returning' ? 'Giao Thất Bại & Đang Chuyển Hoàn' :
                   displayOrder.status === 'shipping' ? 'Đang Giao Hỏa Tốc' :
                   displayOrder.status === 'confirmed' ? 'Đã Đóng Gói (Chờ phát)' : 'Chờ Dược Sĩ Gọi'}
                </span>
              </span>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-slate-500">Tiến trình vận chuyển đơn hàng:</span>
              <span className="text-emerald-700 font-extrabold">{progressPercent}% hoàn tất</span>
            </div>

            {/* Progress Bar Line */}
            <div className="relative w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* 4 Steps Indicators */}
            <div className="grid grid-cols-4 gap-2 text-center pt-1">
              {[
                { step: 1, label: 'Đã Đặt Hàng', sub: 'Chờ duyệt' },
                { step: 2, label: 'Dược Sĩ In Đơn', sub: 'Đóng gói hàng' },
                { step: 3, label: 'Đang Giao Hàng', sub: 'Bưu tá phát' },
                { step: 4, label: 'Giao Thành Công', sub: 'Đã nhận hàng' }
              ].map(st => {
                const isPassed = currentStep >= st.step;
                const isCurrent = currentStep === st.step;
                return (
                  <div key={st.step} className="flex flex-col items-center">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-1 transition-all ${
                      isPassed 
                        ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200' 
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isPassed ? '✓' : st.step}
                    </div>
                    <span className={`text-[10px] font-bold ${isCurrent ? 'text-emerald-800' : isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                      {st.label}
                    </span>
                    <span className="text-[9px] text-slate-400 hidden sm:inline">{st.sub}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Carrier Dispatch & Support Card */}
          <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold flex items-center justify-center text-sm border border-emerald-300 shrink-0">
                🚚
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900">
                    {displayOrder.shippingMethod === 'ghn' ? 'Điều phối GHN Express' : (carrier.shipper?.name || carrier.name)}
                  </span>
                  <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200">
                    {carrier.name}
                  </span>
                  {displayOrder.ghnOrderCode && (
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded uppercase">
                      {displayOrder.ghnOrderCode.toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Hình thức giao: <strong>{displayOrder.shippingMethod === 'ghn' ? 'Mạng lưới chuyển phát nhanh GHN' : (carrier.shipper?.vehicle || 'Giao hàng tiêu chuẩn')}</strong>
                </div>
                <div className="text-[10px] text-emerald-700 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Bảo quản tiêu chuẩn GSP Dược phẩm 15-25°C • Bưu tá liên hệ trước khi phát</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`tel:${displayOrder.shippingMethod === 'ghn' ? '1900636677' : (carrier.hotline?.replace(/\s+/g, '') || '18006868')}`}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Phone className="w-3 h-3" />
                <span>Tổng Đài {displayOrder.shippingMethod === 'ghn' ? 'GHN: 1900 636677' : (carrier.hotline || 'Hỗ Trợ')}</span>
              </a>
            </div>
          </div>

          {/* Admin Fast Actions & Simulation Controls */}
          {isAdmin && (
            <div className="p-3 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                <div>
                  <span className="font-extrabold text-indigo-950 text-xs">
                    Cơ Chế Tự Động Tracking Với Bưu Cục:
                  </span>
                  <p className="text-[10px] text-indigo-700">
                    Hệ thống tự động chuyển trạng thái: <em>Xác nhận/In đơn ➔ Đang giao ➔ Hoàn thành</em>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {displayOrder.status !== 'completed' && (
                  <button
                    type="button"
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Đang đồng bộ...' : '⚡ Đồng bộ bưu cục ngay'}</span>
                  </button>
                )}

                {onPrintSlip && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onPrintSlip(displayOrder);
                    }}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl font-bold text-xs border border-slate-300 flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>In Lại Phiếu</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Cảnh báo đơn chuyển hoàn hoặc đã về kho */}
          {displayOrder.status === 'returning' && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-rose-950">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <strong className="font-extrabold text-rose-900 block">
                  {isAdmin ? '⚠️ CẢNH BÁO: ĐƠN HÀNG GIAO THẤT BẠI & ĐANG CHUYỂN HOÀN VỀ KHO' : 'Thông Báo: Đơn hàng giao không thành công & Đang chuyển hoàn'}
                </strong>
                <p className="text-rose-800">
                  Lý do: <em>"{displayOrder.failureReason || 'Bưu tá không liên lạc được người nhận'}"</em>
                </p>
                <p className="text-[11px] text-rose-700">
                  {isAdmin 
                    ? 'Kiện hàng đang được quay đầu về Kho hàng MedXpressCare.' 
                    : `Kiện hàng đang được chuyển hoàn về nhà thuốc. Dược sĩ sẽ liên hệ hỗ trợ bạn, hoặc quý khách vui lòng gọi Hotline ${hotline || '1800 6868'}.`}
                </p>
              </div>
            </div>
          )}

          {displayOrder.status === 'returned_pending_check' && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-950 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-0.5 text-xs">
                <strong className="font-extrabold text-amber-950 block">
                  {isAdmin ? '📦 CẢNH BÁO: KIỆN HÀNG HOÀN ĐÃ VỀ KHO - CHỜ DƯỢC SĨ KIỂM NHẬN THỦ CÔNG' : 'Thông Báo: Kiện hàng đã được tiếp nhận hoàn về nhà thuốc'}
                </strong>
                <p className="text-amber-900">
                  {isAdmin 
                    ? 'Bưu tá đã giao bưu kiện về kho. Dược sĩ cần thực hiện kiểm tra tem niêm phong và điều kiện bảo quản GSP trước khi tái nhập kho.' 
                    : 'Nhà thuốc MedXpressCare đã tiếp nhận lại kiện hàng. Dược sĩ sẽ liên hệ để hỗ trợ hoàn tiền hoặc gửi lại theo yêu cầu của quý khách.'}
                </p>
              </div>
            </div>
          )}

          {displayOrder.status === 'returned' && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-emerald-950">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <strong className="font-extrabold text-emerald-900 block">
                  {isAdmin ? '✅ ĐÃ XÁC NHẬN THỦ CÔNG NHẬN HÀNG HOÀN & TÁI NHẬP KHO GSP' : 'Đơn Hàng Đã Hoàn Trả Về Nhà Thuốc Thành Công'}
                </strong>
                {isAdmin ? (
                  <p className="text-emerald-800 text-[11px]">
                    Dược sĩ kiểm nhận: <strong>{displayOrder.returnInspection?.pharmacistName || 'DS. CKI Nguyễn Thu Trang'}</strong> • 
                    Tem seal: <strong>{displayOrder.returnInspection?.sealCondition === 'intact' ? 'Nguyên vẹn' : 'Có dấu hiệu bóc mở'}</strong>
                  </p>
                ) : (
                  <p className="text-emerald-800 text-[11px]">
                    Quy trình xử lý hoàn trả tại MedXpressCare đã hoàn tất. Cảm ơn quý khách!
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Detailed Timeline Logs */}
          <div className="space-y-3">
            <h5 className="font-extrabold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Nhật Ký Hành Trình Vận Đơn (Chi Tiết):</span>
            </h5>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timeline.map(cleanTrackingItem).filter(Boolean).slice().reverse().map((item, idx) => {
                const isLatest = idx === 0;
                return (
                  <div key={idx} className="relative group">
                    {/* Timeline Node Dot */}
                    <div className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 bg-white transition-all ${
                      isLatest 
                        ? 'border-emerald-600 text-emerald-600 shadow-md ring-4 ring-emerald-100' 
                        : 'border-slate-300 text-slate-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${isLatest ? 'bg-emerald-600 animate-ping' : 'bg-slate-300'}`} />
                    </div>

                    {/* Content */}
                    <div className={`p-3 rounded-2xl border transition-all ${
                      isLatest 
                        ? 'bg-emerald-50/60 border-emerald-200 shadow-2xs' 
                        : 'bg-white border-slate-200/80'
                    }`}>
                      <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                        <span className={`font-extrabold text-xs ${isLatest ? 'text-emerald-950' : 'text-slate-800'}`}>
                          {item.title}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400 font-semibold">
                          {item.time}
                        </span>
                      </div>

                      <p className="text-slate-600 text-[11px] leading-relaxed">
                        {item.desc}
                      </p>

                      {item.location && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium mt-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recipient & Package Summary (Tuân thủ Nghị định 13/2023/NĐ-CP che giấu PII) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-slate-700">
            <div className="font-bold text-slate-900 pb-1 border-b border-slate-200/80 flex items-center justify-between">
              <span>Người nhận hàng:</span>
              <span className="font-mono text-emerald-800 font-extrabold">
                {displayOrder.paymentMethod === 'vietqr'
                  ? `Tổng giá trị: ${displayOrder.grandTotal?.toLocaleString('vi-VN')}₫ (Đã thanh toán VietQR • Bưu tá thu 0₫)`
                  : `Tổng thu COD: ${displayOrder.grandTotal?.toLocaleString('vi-VN')}₫`}
              </span>
            </div>
            <div>
              <strong>{isAdmin ? displayOrder.customer?.fullName : maskName(displayOrder.customer?.fullName)}</strong>
              {' '}({isAdmin ? displayOrder.customer?.phone : maskPhone(displayOrder.customer?.phone)})
            </div>
            <div className="text-[11px] text-slate-500">
              {isAdmin 
                ? `${displayOrder.customer?.address || ''}, ${displayOrder.customer?.district || ''}, ${displayOrder.customer?.province || ''}`
                : `***, ${displayOrder.customer?.district || ''}, ${displayOrder.customer?.province || ''}`}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
          >
            Đóng Lại
          </button>
        </div>

      </div>
    </div>
  );
};
