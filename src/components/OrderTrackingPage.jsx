import React, { useState, useEffect } from 'react';
import { 
  Truck, Search, CheckCircle2, Clock, MapPin, Phone, 
  Package, ShieldCheck, ArrowRight, RefreshCw, Copy, Check,
  AlertCircle, Sparkles, ExternalLink, PhoneCall, HelpCircle,
  FileCheck2, ChevronRight, Stethoscope, ChevronDown, RotateCcw
} from 'lucide-react';
import { getCarrierInfo } from '../utils/logisticsHelper';
import { PRODUCTS } from '../data/products';

// Đơn hàng mẫu Demo giúp khách hàng trải nghiệm tính năng tra cứu ngay lập tức
// Đơn hàng mẫu demo đã được loại bỏ để chỉ tra cứu đơn thực tế của khách
export const DEMO_TRACKING_ORDERS = [];

export const OrderTrackingPage = ({
  orders = [],
  initialCode = '',
  onGoHome,
  onOpenAdvisor,
  onOpenProductDetail,
  hotline = '1800 6868'
}) => {
  const [searchInput, setSearchInput] = useState(initialCode || '');
  const [searchedKeyword, setSearchedKeyword] = useState(initialCode || '');
  const [matchedOrders, setMatchedOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);

  // Tổng hợp tất cả đơn hàng (Đơn thực tế trong hệ thống + Đơn mẫu demo để khách luôn tra cứu được)
  const allAvailableOrders = orders || [];

  // Helper hàm mask bảo vệ dữ liệu PII người nhận
  const maskPhone = (phone) => {
    if (!phone) return '098****456';
    const clean = phone.replace(/\s+/g, '');
    if (clean.length < 7) return clean;
    return clean.slice(0, 3) + '****' + clean.slice(-3);
  };

  const maskName = (name) => {
    if (!name) return 'Khách hàng';
    const parts = name.trim().split(' ');
    if (parts.length <= 1) return name[0] + '***';
    return parts[0] + ' *** ' + parts[parts.length - 1];
  };

  // Hàm thực hiện tra cứu
  const executeSearch = (rawKeyword) => {
    const q = (rawKeyword || '').trim().toLowerCase().replace(/\s+/g, '');
    if (!q) {
      setMatchedOrders([]);
      setSelectedOrder(null);
      setHasSearched(false);
      return;
    }

    setSearchedKeyword(rawKeyword.trim());
    setHasSearched(true);

    // Tìm kiếm thông minh: Khớp Mã đơn, Mã vận đơn bưu cục, hoặc Số điện thoại
    const results = allAvailableOrders.filter(o => {
      const idMatch = o.id && o.id.toLowerCase().replace(/\s+/g, '').includes(q);
      const trackingMatch = o.trackingNumber && o.trackingNumber.toLowerCase().replace(/\s+/g, '').includes(q);
      const phoneMatch = o.customer?.phone && o.customer.phone.replace(/\s+/g, '').includes(q);
      return idMatch || trackingMatch || phoneMatch;
    });

    setMatchedOrders(results);
    if (results.length > 0) {
      setSelectedOrder(results[0]);
    } else {
      setSelectedOrder(null);
    }
  };

  // Khởi chạy tra cứu tự động nếu có mã truyền từ ngoài vào (ví dụ từ URL hash)
  useEffect(() => {
    if (initialCode) {
      setSearchInput(initialCode);
      executeSearch(initialCode);
    } else if (orders && orders.length > 0) {
      // Nếu có đơn hàng thực tế của khách hàng, hiển thị đơn mới nhất
      const latest = orders[0];
      if (latest && (latest.id || latest.trackingNumber)) {
        setSearchInput(latest.id || latest.trackingNumber);
        setSelectedOrder(latest);
        setMatchedOrders([latest]);
        setHasSearched(true);
      }
    }
  }, [initialCode, orders]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    executeSearch(searchInput);
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const currentCarrier = selectedOrder ? getCarrierInfo(selectedOrder.shippingMethod) : null;

  // Tính bước hiện tại của đơn hàng
  const getStepIndex = (status) => {
    if (status === 'completed') return 4;
    if (status === 'shipping') return 3;
    if (status === 'confirmed') return 2;
    return 1;
  };

  const currentStep = selectedOrder ? getStepIndex(selectedOrder.status) : 1;

  // Danh mục câu hỏi thường gặp
  const FAQS = [
    {
      q: 'Thời gian giao hàng thuốc và thực phẩm chức năng mất bao lâu?',
      a: 'Nội thành Hà Nội: Quý khách nhận hàng hỏa tốc trong 2 giờ sau khi Dược sĩ xác nhận. Các tỉnh thành khác trên toàn quốc: Giao hàng nhanh từ 1 - 2 ngày qua GHTK, GHN hoặc Viettel Post chuẩn nhiệt độ mát.'
    },
    {
      q: 'Tôi có được mở hộp kiểm tra sản phẩm trước khi thanh toán không?',
      a: '100% CÓ. MedXpressCare cam kết chính sách ĐỒNG KIỂM toàn quốc. Quý khách được quyền bóc hộp carton bảo vệ để kiểm tra số ĐKSP Bộ Y Tế, tem phụ tiếng Việt, tem chống hàng giả niêm phong và hóa đơn chứng từ trước khi thanh toán tiền cho bưu tá.'
    },
    {
      q: 'Sản phẩm có được bảo quản chuẩn GSP trong lúc vận chuyển không?',
      a: 'Toàn bộ đơn hàng được đóng gói trong hộp xốp chống sốc, màng bọc chống ẩm và túi khí chuyên dụng cho dược phẩm, duy trì nhiệt độ mát dưới 30°C trong suốt hành trình vận chuyển.'
    },
    {
      q: 'Nếu tôi muốn đổi địa chỉ nhận hàng hoặc dời lịch giao thì làm thế nào?',
      a: `Quý khách chỉ cần gọi trực tiếp cho Bưu tá qua SĐT hiển thị trên trang này, hoặc gọi Tổng đài Dược sĩ miễn cước ${hotline} (24/7) để được hỗ trợ điều phối lại tuyến phát ngay lập tức.`
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 animate-in fade-in">
      
      {/* 1. HERO BANNER & BREADCRUMB */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white pt-8 pb-14 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-emerald-300/80 mb-4 font-medium">
            <button onClick={onGoHome} className="hover:text-white transition-colors cursor-pointer">
              Trang Chủ
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-white font-semibold">Tra Cứu Vận Đơn & Hành Trình Bưu Tá</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                <Truck className="w-3.5 h-3.5 animate-pulse" />
                <span>Theo Dõi Đơn Hàng Dược Phẩm Theo Thời Gian Thực</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
                Tra Cứu Vận Đơn Trực Tuyến
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Nhập <strong>Mã đơn hàng (MXC-...)</strong>, <strong>Mã vận đơn bưu cục</strong> hoặc <strong>Số điện thoại</strong> để theo dõi trực tiếp vị trí bưu tá, điều kiện bảo quản GSP và thời gian giao dự kiến.
              </p>
            </div>

            {/* Hotline Box */}
            <div className="shrink-0 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-400/30">
                <PhoneCall className="w-5 h-5 animate-pulse text-emerald-300" />
              </div>
              <div className="text-left text-xs">
                <div className="text-slate-300 font-medium">Tổng đài hỗ trợ giao hàng:</div>
                <a href={`tel:${hotline.replace(/\s+/g, '')}`} className="text-base font-black text-amber-300 hover:text-white transition-colors">
                  {hotline} <span className="text-[10px] text-emerald-300 font-normal">(Miễn cước 24/7)</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. THANH TÌM KIẾM THÔNG MINH (FLOATING SEARCH BAR) */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-4 sm:p-6 space-y-4">
          <form onSubmit={handleFormSubmit} className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder="Nhập Mã đơn hàng (MXC-...), Mã vận đơn bưu cục, hoặc Số điện thoại đặt hàng..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => { setSearchInput(''); executeSearch(''); }}
                  className="absolute right-3.5 top-3.5 text-xs text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  Xóa
                </button>
              )}
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-7 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Tra Cứu Ngay</span>
            </button>
          </form>
        </div>
      </div>

      {/* 3. NỘI DUNG KẾT QUẢ TRA CỨU */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        
        {/* Trường hợp tìm thấy nhiều hơn 1 đơn hàng (Ví dụ tra cứu theo Số điện thoại) */}
        {matchedOrders.length > 1 && (
          <div className="mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
              <span>Tìm thấy {matchedOrders.length} đơn hàng liên quan đến "{searchedKeyword}":</span>
              <span className="text-emerald-700 font-normal">Nhấp vào đơn để xem hành trình</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {matchedOrders.map(ord => (
                <button
                  key={ord.id}
                  onClick={() => setSelectedOrder(ord)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedOrder?.id === ord.id
                      ? 'bg-emerald-50 border-emerald-500 shadow-xs ring-1 ring-emerald-500'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900">{ord.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ord.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                      ord.status === 'shipping' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.status === 'completed' ? 'Đã giao' : ord.status === 'shipping' ? 'Đang giao' : 'Đang xử lý'}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    {ord.customer?.fullName} • {ord.grandTotal?.toLocaleString('vi-VN')}₫
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* NẾU TÌM THẤY ĐƠN HÀNG */}
        {selectedOrder ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* CỘT TRÁI (2 CỘT): TIẾN TRÌNH & HÀNH TRÌNH THỜI GIAN THỰC */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* THẺ TỔNG QUAN ĐƠN HÀNG */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Mã Đơn Hàng
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xl text-slate-900">{selectedOrder.id}</span>
                      <button
                        onClick={() => handleCopy(selectedOrder.id, 'orderId')}
                        className="p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Sao chép mã đơn"
                      >
                        {copiedText === 'orderId' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Đơn Vị Vận Chuyển
                      </div>
                      <div className="font-bold text-xs text-slate-800 flex items-center gap-1.5 justify-end">
                        <span>{currentCarrier?.icon}</span>
                        <span>{currentCarrier?.name}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mã vận đơn bưu cục */}
                <div className="bg-slate-50 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-slate-100">
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-emerald-600" />
                      <span>Mã Vận Đơn Bưu Cục Chính Thức:</span>
                    </div>
                    <div className="font-mono font-black text-base text-emerald-800 tracking-wide">
                      {selectedOrder.trackingNumber || 'S22.HN1.8839.2991882'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(selectedOrder.trackingNumber || selectedOrder.id, 'trackingNo')}
                      className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      {copiedText === 'trackingNo' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedText === 'trackingNo' ? 'Đã sao chép' : 'Sao chép mã'}</span>
                    </button>
                    
                    {/* Link sang trang bưu cục chính thức nếu có */}
                    <a
                      href={
                        selectedOrder.shippingMethod === 'viettel' ? `https://viettelpost.com.vn/tra-cuu-hanh-trinh-don/?code=${selectedOrder.trackingNumber}` :
                        selectedOrder.shippingMethod === 'ghn' ? `https://donhang.ghn.vn/?order_code=${selectedOrder.trackingNumber}` :
                        `https://khachhang.giaohangtietkiem.vn/web/khach-hang/tra-cuu-van-don?tracking_code=${selectedOrder.trackingNumber}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition-all flex items-center gap-1"
                    >
                      <span>Kiểm tra trên Bưu cục</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* THANH TIẾN TRÌNH 4 BƯỚC (VISUAL STEPPER) */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">Tiến trình vận đơn dược phẩm:</span>
                    <span className="font-black text-emerald-700">
                      {selectedOrder.status === 'completed' ? 'Hoàn thành 100%' :
                       selectedOrder.status === 'shipping' ? 'Đang giao hàng (75%)' :
                       selectedOrder.status === 'confirmed' ? 'Đã đóng gói GSP (35%)' : 'Tiếp nhận (15%)'}
                    </span>
                  </div>

                  {/* Progress Line */}
                  <div className="relative">
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                        style={{ width: `${selectedOrder.carrierProgress || (currentStep === 1 ? 15 : currentStep === 2 ? 35 : currentStep === 3 ? 75 : 100)}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center mt-3">
                      <div className={`space-y-1 ${currentStep >= 1 ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          1
                        </div>
                        <div className="text-[11px] font-bold">Tiếp nhận đơn</div>
                      </div>

                      <div className={`space-y-1 ${currentStep >= 2 ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          2
                        </div>
                        <div className="text-[11px] font-bold">Đóng gói GSP</div>
                      </div>

                      <div className={`space-y-1 ${currentStep >= 3 ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 3 ? 'bg-emerald-600 text-white animate-bounce' : 'bg-slate-200 text-slate-500'}`}>
                          3
                        </div>
                        <div className="text-[11px] font-bold">Bưu tá đang giao</div>
                      </div>

                      <div className={`space-y-1 ${currentStep >= 4 ? 'text-emerald-700' : 'text-slate-400'}`}>
                        <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center font-bold text-xs ${currentStep >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                          4
                        </div>
                        <div className="text-[11px] font-bold">Đã nhận & Đồng kiểm</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* THÔNG TIN BƯU TÁ GIAO HÀNG (SHIPPER CARD) */}
                {currentCarrier?.shipper && (
                  <div className="bg-gradient-to-r from-emerald-50/60 via-teal-50/30 to-emerald-50/60 rounded-2xl p-4 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                        {currentCarrier.shipper.name[0]}
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                          Bưu tá phụ trách kiện hàng
                        </div>
                        <div className="font-extrabold text-sm text-slate-900">
                          {currentCarrier.shipper.name}
                        </div>
                        <div className="text-[11px] text-slate-600 flex items-center gap-2">
                          <span>{currentCarrier.shipper.vehicle}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">{currentCarrier.shipper.storage}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={`tel:${currentCarrier.shipper.phone.replace(/\s+/g, '')}`}
                      className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                      <Phone className="w-4 h-4 animate-pulse" />
                      <span>Gọi Bưu Tá: {currentCarrier.shipper.phone}</span>
                    </a>
                  </div>
                )}
              </div>

              {/* LỊCH SỬ HÀNH TRÌNH THỜI GIAN THỰC (TIMELINE DETAIL) */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Lịch Sử Hành Trình Vận Chuyển Chi Tiết</span>
                  </h3>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                    Cập nhật thời gian thực
                  </span>
                </div>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                  {(selectedOrder.trackingTimeline || []).slice().reverse().map((step, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline dot */}
                      <div className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full border-2 bg-white transition-all ${
                        idx === 0 
                          ? 'border-emerald-500 ring-4 ring-emerald-100 bg-emerald-500' 
                          : 'border-slate-300'
                      }`}></div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className={`text-xs font-bold ${idx === 0 ? 'text-emerald-800' : 'text-slate-800'}`}>
                            {step.title}
                          </span>
                          <span className="font-mono text-[11px] text-slate-400">
                            {step.time}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                          {step.desc}
                        </p>

                        {step.location && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 pt-0.5">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{step.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* CỘT PHẢI (1 CỘT): THÔNG TIN NGƯỜI NHẬN, SẢN PHẨM & HỖ TRỢ */}
            <div className="space-y-6">
              
              {/* THÔNG TIN NGƯỜI NHẬN & ĐỊA CHỈ */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Địa Chỉ Giao Nhận Thuốc</span>
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Người nhận:</span>
                    <strong className="text-slate-900 font-bold">{maskName(selectedOrder.customer?.fullName)}</strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Số điện thoại:</span>
                    <strong className="font-mono text-slate-900 font-bold">{maskPhone(selectedOrder.customer?.phone)}</strong>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-100">
                    <span className="text-slate-500 block">Địa chỉ nhận hàng:</span>
                    <p className="font-semibold text-slate-800 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {selectedOrder.customer?.address || 'Hà Nội'}
                    </p>
                  </div>

                  <div className="pt-2 text-[11px] text-slate-500 bg-blue-50/60 p-2.5 rounded-xl border border-blue-200/60 text-blue-900 space-y-1">
                    <div className="font-bold flex items-center gap-1 text-blue-950">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Quyền Lợi Đồng Kiểm Toàn Quốc:</span>
                    </div>
                    <p>Quý khách được quyền mở hộp kiểm tra đầy đủ tem phụ Bộ Y Tế, số ĐKSP và niêm phong trước khi thanh toán.</p>
                  </div>
                </div>
              </div>

              {/* CHI TIẾT SẢN PHẨM TRONG ĐƠN HÀNG */}
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                    <Package className="w-4 h-4 text-emerald-600" />
                    <span>Kiện Hàng ({selectedOrder.items?.reduce((a, b) => a + (b.quantity || 1), 0) || 0} Hộp)</span>
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">
                    {selectedOrder.paymentMethod === 'vietqr' ? 'Đã TT VietQR' : 'Thanh toán COD'}
                  </span>
                </div>

                {/* Danh sách items */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {(selectedOrder.items || []).map((it, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                      {it.image && (
                        <img 
                          src={it.image} 
                          alt={it.name} 
                          className="w-12 h-12 object-contain rounded-lg bg-white border border-slate-100 p-1 shrink-0" 
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-slate-800 text-[11px] truncate">{it.name}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>Số lượng: <strong className="text-slate-700">x{it.quantity || 1}</strong></span>
                          <span>•</span>
                          <span className="font-mono text-emerald-700 font-bold">{(it.price || 0).toLocaleString('vi-VN')}₫</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tổng tiền */}
                <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Tạm tính:</span>
                    <span>{(selectedOrder.subtotal || selectedOrder.grandTotal || 0).toLocaleString('vi-VN')}₫</span>
                  </div>
                  {selectedOrder.discountAmount > 0 && (
                    <div className="flex justify-between text-rose-600 font-semibold">
                      <span>Giảm giá voucher:</span>
                      <span>-{selectedOrder.discountAmount.toLocaleString('vi-VN')}₫</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-500">
                    <span>Phí vận chuyển:</span>
                    <span className="text-emerald-700 font-bold">Miễn phí toàn quốc</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-black text-slate-900 pt-2 border-t border-slate-100">
                    <span>{selectedOrder.paymentMethod === 'vietqr' ? 'Tổng giá trị đơn hàng:' : 'Tổng thu bưu tá (COD):'}</span>
                    <span className="text-base font-mono text-emerald-800 font-extrabold">
                      {(selectedOrder.grandTotal || 0).toLocaleString('vi-VN')}₫
                    </span>
                  </div>
                  {selectedOrder.paymentMethod === 'vietqr' && (
                    <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Tiền thu hộ COD (Bưu tá thu):</span>
                      </div>
                      <span className="font-mono text-emerald-700 font-extrabold">0₫ (Đã Thanh Toán VietQR)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* KHỐI HỖ TRỢ TRỰC TIẾP TỪ DƯỢC SĨ */}
              <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-sm space-y-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <h4 className="font-extrabold text-sm text-white">Cần Dược Sĩ Trợ Giúp Về Đơn Hàng?</h4>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Nếu quý khách cần đổi địa chỉ nhận thuốc, dời giờ giao, hoặc cần Dược sĩ tư vấn lại cách uống thuốc, hãy bấm liên hệ ngay:
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    onClick={onOpenAdvisor}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Chat Trực Tiếp Với Dược Sĩ AI 24/7</span>
                  </button>

                  <a
                    href={`tel:${hotline.replace(/\s+/g, '')}`}
                    className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-all flex items-center justify-center gap-2"
                  >
                    <PhoneCall className="w-4 h-4 text-amber-300" />
                    <span>Gọi Tổng Đài: {hotline}</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        ) : hasSearched ? (
          /* TRƯỜNG HỢP KHÔNG TÌM THẤY ĐƠN HÀNG */
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto border border-slate-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-900 text-lg">
                Không Tìm Thấy Đơn Hàng Hoặc Mã Vận Đơn
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Hệ thống chưa tìm thấy dữ liệu vận đơn khớp với từ khóa <strong>"{searchedKeyword}"</strong>. Quý khách vui lòng kiểm tra lại mã đơn hoặc số điện thoại đặt hàng.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-2 max-w-md mx-auto">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-600" />
                <span>Mẹo Tra Cứu Nhanh:</span>
              </div>
              <ul className="space-y-1 list-disc list-inside text-[11px] text-slate-500">
                <li>Nhập đúng định dạng mã đơn hàng: <strong>MXC-xxxxxx</strong></li>
                <li>Nhập mã vận đơn bưu cục: <strong>S22.HN1...</strong>, <strong>GHN...</strong>, <strong>VTP...</strong></li>
                <li>Hoặc nhập chính xác số điện thoại người nhận đã đăng ký khi đặt hàng.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              
              
              <a
                href={`tel:${hotline.replace(/\s+/g, '')}`}
                className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4 text-emerald-600" />
                <span>Gọi Tổng Đài Hỗ Trợ: {hotline}</span>
              </a>
            </div>
          </div>
        ) : null}

        {/* 4. CAM KẾT VẬN CHUYỂN CHUẨN GSP (TRUST BADGES) */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg shrink-0">
              ⚡
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Hỏa Tốc 2 Giờ Nội Thành HN</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Shipper chuyên trách giao trực tiếp từ kho dược</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg shrink-0">
              🛡️
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">100% Đồng Kiểm Khi Nhận</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Kiểm tra tem niêm phong Bộ Y Tế trước khi trả tiền</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg shrink-0">
              📦
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Bảo Quản Chuẩn Mát GSP</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Hộp chống sốc, màng chống ẩm nhiệt độ dưới 30°C</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-lg shrink-0">
              🔄
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900">Đổi Trả Miễn Phí 30 Ngày</h4>
              <p className="text-[11px] text-slate-500 mt-0.5">Hỗ trợ thu hồi tận nhà nếu phát sinh bất kỳ lỗi nào</p>
            </div>
          </div>
        </div>

        {/* 5. CÂU HỎI THƯỜNG GẶP VỀ GIAO NHẬN THUỐC (FAQ ACCORDION) */}
        <div className="mt-12 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Giải Đáp Thắc Mắc
            </span>
            <h3 className="font-extrabold text-slate-900 text-lg">
              Câu Hỏi Thường Gặp Về Vận Chuyển Dược Phẩm
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {FAQS.map((faq, idx) => (
              <div key={idx} className="py-3.5">
                <button
                  type="button"
                  onClick={() => setExpandedFaqIndex(expandedFaqIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-800 hover:text-emerald-700 transition-colors gap-3 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${expandedFaqIndex === idx ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>
                {expandedFaqIndex === idx && (
                  <p className="text-xs text-slate-600 mt-2.5 pl-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 animate-in fade-in">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
