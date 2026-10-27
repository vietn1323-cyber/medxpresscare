import React from 'react';
import { 
  ShieldCheck, Truck, Stethoscope, Award, ArrowRight, 
  Sparkles, CheckCircle2, ChevronRight, HeartHandshake, Flame
} from 'lucide-react';

export const HeroBanner = ({ onSelectOrigin, onOpenAdvisor, onOpenVerifier }) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-teal-900 to-slate-900 text-white py-10 lg:py-14 px-4">
      {/* Background ambient medical glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Headline */}
          <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-400/30 px-3.5 py-1.5 rounded-full text-emerald-300 text-xs font-semibold backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Hệ Thống Phân Phối TPCN & Dược Phẩm Chính Hãng</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Sức Khỏe Vàng Cho Mọi Gia Đình Với{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-cyan-300">
                Thực Phẩm Chức Năng
              </span>{' '}
              Chuẩn Y Khoa
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              <strong className="text-white font-semibold">MedXpressCare.com</strong> là cầu nối tin cậy phân phối độc quyền và chính ngạch các dòng TPCN cao cấp. Minh bạch nguồn gốc giữa <strong className="text-rose-300">Hàng Nội Địa Chuẩn GMP-WHO</strong> và <strong className="text-sky-300">Hàng Nhập Khẩu Quốc Tế (Mỹ, Úc, Nhật, Hàn, Đức)</strong>.
            </p>

            {/* Origin Quick Pick Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => onSelectOrigin('domestic')}
                className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-rose-900/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="text-xl">🇻🇳</span>
                <div className="text-left">
                  <div className="text-[11px] text-rose-200 font-normal leading-none">Tinh Hoa Dược Liệu</div>
                  <div className="font-bold">Gian Hàng Nội Địa</div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onSelectOrigin('imported')}
                className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition-all hover:-translate-y-0.5 active:translate-y-0"
              >
                <span className="text-xl">🌍</span>
                <div className="text-left">
                  <div className="text-[11px] text-sky-200 font-normal leading-none">Chính Ngạch Tem Phụ</div>
                  <div className="font-bold">Gian Hàng Nhập Ngoại</div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenAdvisor}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-emerald-200 hover:text-white font-semibold text-sm backdrop-blur-sm transition-all"
              >
                <Stethoscope className="w-4 h-4 text-emerald-400" />
                <span>Trắc Nghiệm Sức Khỏe AI</span>
              </button>
            </div>

            {/* Quick Micro Proof */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Đầy đủ số ĐKSP Cục ATTP Bộ Y Tế
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Tem cào chống giả Bộ Công An
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                Hóa đơn VAT minh bạch 100%
              </span>
            </div>
          </div>

          {/* Dual Origin Comparison Showcase Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Box 1: Gian Hàng Nội Địa */}
            <div 
              onClick={() => onSelectOrigin('domestic')}
              className="group cursor-pointer bg-gradient-to-b from-rose-950/40 to-slate-900/80 border border-rose-500/30 hover:border-rose-400/70 rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] backdrop-blur-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">🇻🇳</span>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Chuẩn GMP-WHO
                </span>
              </div>
              <h3 className="font-extrabold text-white text-base group-hover:text-rose-300 transition-colors">
                Hàng Nội Địa Uy Tín
              </h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                Dược liệu Sâm Ngọc Linh K5, Đông trùng Traphaco, Khớp Thái Minh, Nano Curcumin...
              </p>
              <div className="mt-3 pt-3 border-t border-rose-500/20 flex items-center justify-between text-xs text-rose-300 font-semibold">
                <span>Xem 6+ sản phẩm tiêu biểu</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Box 2: Gian Hàng Nhập Ngoại */}
            <div 
              onClick={() => onSelectOrigin('imported')}
              className="group cursor-pointer bg-gradient-to-b from-sky-950/40 to-slate-900/80 border border-sky-500/30 hover:border-sky-400/70 rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] backdrop-blur-md shadow-xl"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1 text-lg">
                  <span>🇺🇸</span>
                  <span>🇦🇺</span>
                  <span>🇯🇵</span>
                  <span>🇰🇷</span>
                  <span>🇩🇪</span>
                </div>
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
                  Tem Phụ Chính Ngạch
                </span>
              </div>
              <h3 className="font-extrabold text-white text-base group-hover:text-sky-300 transition-colors">
                Hàng Nhập Khẩu Quốc Tế
              </h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                Kirkland USA, Blackmores Úc, DHC Nhật Bản, Hồng Sâm KGC Hàn Quốc, Doppelherz Đức...
              </p>
              <div className="mt-3 pt-3 border-t border-sky-500/20 flex items-center justify-between text-xs text-sky-300 font-semibold">
                <span>Xem 6+ thương hiệu toàn cầu</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>

            {/* Box 3: Hotline Dược Sĩ & Cam kết bảo quản GSP */}
            <div className="sm:col-span-2 bg-gradient-to-r from-emerald-950/60 to-teal-950/60 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-emerald-300 font-semibold">Cần tư vấn lựa chọn sản phẩm phù hợp?</div>
                  <div className="text-sm font-bold text-white">Dược sĩ chuyên môn trực tuyến hỗ trợ 24/7</div>
                </div>
              </div>
              <button
                onClick={onOpenAdvisor}
                className="shrink-0 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-3.5 py-2 rounded-xl transition-all shadow-md"
              >
                Tư Vấn Ngay
              </button>
            </div>

          </div>

        </div>

        {/* 4 Trụ Cột Vàng MedXpressCare */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-10 pt-8 border-t border-slate-700/60">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">100% Chính Hãng</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Cam kết đền gấp 3 lần nếu phát hiện hàng giả</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Hỏa Tốc Hà Nội • Giao Nhanh</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Hỏa tốc nội thành Hà Nội & Giao hàng nhanh toàn quốc</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Dược Sĩ 1:1 Miễn Phí</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Tư vấn đúng liều dùng, đúng thể trạng người bệnh</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-white">Đổi Trả 30 Ngày</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Đổi trả miễn phí nếu sản phẩm lỗi bao bì, móp vỡ</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
