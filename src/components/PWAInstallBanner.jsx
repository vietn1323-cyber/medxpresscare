import React from 'react';
import { Smartphone, Download, X, Sparkles } from 'lucide-react';

export const PWAInstallBanner = ({
  isOpen,
  onInstall,
  onOpenModal,
  onDismiss,
  isIOS,
  hasDeferredPrompt
}) => {
  if (!isOpen) return null;

  return (
    <aside 
      aria-label="Cài đặt ứng dụng di động"
      className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 bg-white/95 backdrop-blur-md border border-emerald-200/90 shadow-2xl rounded-2xl p-3.5 sm:p-4 text-slate-800 animate-slideUp transition-all"
    >
      <div className="flex items-start gap-3">
        {/* App Icon */}
        <div className="relative shrink-0">
          <img 
            src="/logo-icon.png" 
            alt="MedXpressCare Icon" 
            className="w-12 h-12 rounded-xl object-contain shadow-xs border border-emerald-100 bg-white p-0.5"
          />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
              Thêm MedXpressCare Vào Điện Thoại
            </h4>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
              PWA
            </span>
          </div>

          <p className="text-[11px] sm:text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            Mở nhanh như app điện thoại, nhận ưu đãi độc quyền & tư vấn Dược sĩ AI 24/7.
          </p>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 mt-2.5">
            <button
              onClick={async () => {
                if (hasDeferredPrompt && onInstall) {
                  await onInstall();
                } else if (onOpenModal) {
                  onOpenModal();
                }
              }}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
            >
              {hasDeferredPrompt ? (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Cài Đặt Ngay (1 Chạm)</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Thêm Vào MH Chính</span>
                </>
              )}
            </button>

            <button
              onClick={onDismiss}
              className="text-xs font-medium text-slate-400 hover:text-slate-600 px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Để sau
            </button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-2.5 right-2.5 p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Đóng thông báo"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
