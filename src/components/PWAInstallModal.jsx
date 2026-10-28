import React from 'react';
import { 
  X, Smartphone, Share, PlusSquare, CheckCircle2, 
  Zap, BellRing, Stethoscope, Package, Download, ArrowRight, ShieldCheck 
} from 'lucide-react';

export const PWAInstallModal = ({ 
  isOpen, 
  onClose, 
  onInstall, 
  isIOS, 
  isAndroid, 
  isStandalone, 
  hasDeferredPrompt 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with App Branding */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 relative shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md shrink-0 flex items-center justify-center">
              <img 
                src="/logo-icon.png" 
                alt="MedXpressCare App" 
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight">MedXpressCare App</span>
                <span className="bg-amber-400 text-slate-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                  PWA Mobile
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                Nhà thuốc & TPCN chính hãng ngay trên màn hình điện thoại
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* If already running in standalone */}
          {isStandalone ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h4 className="font-bold text-emerald-900 text-base">
                Bạn đang sử dụng phiên bản App MedXpressCare!
              </h4>
              <p className="text-xs text-emerald-700">
                Ứng dụng đã được cài đặt vào màn hình chính của bạn với trải nghiệm đầy đủ, mượt mà và bảo mật cao nhất.
              </p>
            </div>
          ) : (
            <>
              {/* 1-Click Install Button (When beforeinstallprompt is ready) */}
              {hasDeferredPrompt && (
                <div className="space-y-3 bg-gradient-to-br from-emerald-50 via-teal-50 to-white p-4 rounded-2xl border border-emerald-200 text-center">
                  <div className="flex items-center justify-center gap-2 text-emerald-800 font-bold text-sm">
                    <Smartphone className="w-5 h-5 text-emerald-600" />
                    <span>Cài đặt trực tiếp chỉ với 1 chạm</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Bấm nút bên dưới để thêm biểu tượng ứng dụng MedXpressCare vào màn hình chính điện thoại mà không cần tải từ kho ứng dụng.
                  </p>
                  <button
                    onClick={async () => {
                      if (onInstall) {
                        await onInstall();
                        onClose();
                      }
                    }}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span>CÀI ĐẶT ỨNG DỤNG NGAY</span>
                  </button>
                </div>
              )}

              {/* iOS Safari Instruction Guide */}
              {isIOS && (
                <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>Hướng dẫn cài đặt trên iPhone / iPad (Safari):</span>
                  </div>
                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </span>
                      <div>
                        Chạm vào biểu tượng <strong>Chia sẻ (Share)</strong> <Share className="w-3.5 h-3.5 inline text-blue-600 mx-1" /> ở thanh công cụ dưới cùng trình duyệt Safari.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        2
                      </span>
                      <div>
                        Cuộn xuống trong danh sách tùy chọn và nhấn vào <strong>"Thêm vào MH chính"</strong> (Add to Home Screen <PlusSquare className="w-3.5 h-3.5 inline text-slate-700 mx-1" />).
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        3
                      </span>
                      <div>
                        Nhấn nút <strong>"Thêm"</strong> (Add) ở góc trên bên phải. Logo MedXpressCare sẽ xuất hiện trên màn hình điện thoại của bạn như ứng dụng thông thường!
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Android Alternative (when prompt not available or in other browsers) */}
              {!hasDeferredPrompt && !isIOS && (
                <div className="space-y-3 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center gap-2 font-bold text-slate-800 text-sm">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Hướng dẫn thêm vào màn hình chính:</span>
                  </div>
                  <div className="space-y-2 text-xs text-slate-600">
                    <p>
                      1. Nhấn vào biểu tượng <strong>dấu 3 chấm (⋮)</strong> ở góc trên bên phải trình duyệt.
                    </p>
                    <p>
                      2. Chọn dòng <strong>"Cài đặt ứng dụng"</strong> hoặc <strong>"Thêm vào màn hình chính"</strong>.
                    </p>
                    <p>
                      3. Nhấn xác nhận <strong>"Cài đặt"</strong> để hoàn tất.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 4 Key Benefits of MedXpressCare App */}
          <div className="space-y-3 pt-1">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Lợi ích khi thêm vào điện thoại:
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Mở siêu tốc & Nhẹ máy</div>
                  <div className="text-[11px] text-slate-500">Khởi động ngay lập tức, dung lượng siêu nhẹ &lt; 2MB</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Dược Sĩ AI 1 Chạm</div>
                  <div className="text-[11px] text-slate-500">Tư vấn sức khỏe, tương tác thuốc mọi lúc 24/7</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <BellRing className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Ưu Đãi Độc Quyền</div>
                  <div className="text-[11px] text-slate-500">Không bỏ lỡ mã voucher giảm giá và quà tặng combo</div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <Package className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-800">Tra Cứu Đơn Tiện Lợi</div>
                  <div className="text-[11px] text-slate-500">Kiểm tra lộ trình bưu tá giao hỏa tốc trực tiếp</div>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Authenticity Footnote */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Ứng dụng an toàn 100%, chuẩn PWA Google & Apple, bảo mật thông tin theo NĐ 13/2023.</span>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
