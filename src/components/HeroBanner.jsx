import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Truck, Stethoscope, Award, ArrowRight, 
  Sparkles, CheckCircle2, ChevronRight, ChevronLeft, HeartHandshake, Flame, Globe
} from 'lucide-react';
import { DEFAULT_HERO_BANNERS } from '../data/banners';

export const HeroBanner = ({ 
  onSelectOrigin, 
  onOpenAdvisor, 
  onOpenVerifier,
  banners = DEFAULT_HERO_BANNERS,
  hotline = '1800 6868'
}) => {
  // Filter active banners
  const activeBanners = (Array.isArray(banners) && banners.length > 0)
    ? banners.filter(b => b.isActive !== false)
    : DEFAULT_HERO_BANNERS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto slide every 4.5 seconds
  useEffect(() => {
    if (activeBanners.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeBanners.length, isPaused]);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const currentBanner = activeBanners[currentIndex] || activeBanners[0] || DEFAULT_HERO_BANNERS[0];

  const handleBannerAction = () => {
    if (!currentBanner) return;
    if (currentBanner.actionType === 'domestic') {
      onSelectOrigin('domestic');
    } else if (currentBanner.actionType === 'imported') {
      onSelectOrigin('imported');
    } else if (currentBanner.actionType === 'advisor') {
      onOpenAdvisor();
    } else if (currentBanner.actionLink) {
      if (currentBanner.actionLink.startsWith('#')) {
        const el = document.querySelector(currentBanner.actionLink);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.open(currentBanner.actionLink, '_blank');
      }
    } else {
      onSelectOrigin('all');
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-teal-900 to-slate-900 text-white py-10 lg:py-14 px-4">
      {/* Background ambient medical glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Headline (Left Column) */}
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
                className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-bold text-sm shadow-lg shadow-rose-900/40 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <ShieldCheck className="w-5 h-5 text-rose-200 shrink-0" />
                <div className="text-left">
                  <div className="text-[11px] text-rose-200 font-normal leading-none">Tinh Hoa Dược Liệu</div>
                  <div className="font-bold">Gian Hàng Nội Địa</div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onSelectOrigin('imported')}
                className="group flex items-center gap-3 px-5 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-900/40 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                <Globe className="w-5 h-5 text-sky-200 shrink-0" />
                <div className="text-left">
                  <div className="text-[11px] text-sky-200 font-normal leading-none">Chính Ngạch Tem Phụ</div>
                  <div className="font-bold">Gian Hàng Nhập Ngoại</div>
                </div>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenAdvisor}
                className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-emerald-200 hover:text-white font-semibold text-sm backdrop-blur-sm transition-all cursor-pointer"
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

          {/* Ô BANNER NHIỀU ẢNH (SLIDER / CAROUSEL) - RIGHT COLUMN */}
          <div className="lg:col-span-5 space-y-3">
            <div 
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onClick={handleBannerAction}
              className="relative w-full h-[320px] sm:h-[350px] rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-2xl bg-slate-950 group cursor-pointer transition-all duration-300 hover:border-emerald-400/70 hover:shadow-emerald-950/50"
            >
              {/* Background Slide Image with smooth animation */}
              <img 
                key={currentBanner.id || currentIndex}
                src={currentBanner.image} 
                alt={currentBanner.title}
                className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 animate-in fade-in"
              />

              {/* Gradient Scrim Overlay for Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/55 to-slate-950/20 pointer-events-none" />

              {/* Top Bar on Banner: Badge + Slide Indicator Counter */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-500/90 text-white shadow-md backdrop-blur-md border border-emerald-300/40">
                  {currentBanner.badge || '✨ Nổi Bật'}
                </span>
                <span className="text-[11px] font-bold font-mono px-2.5 py-1 rounded-full bg-slate-900/80 text-slate-300 border border-slate-700/80 backdrop-blur-md">
                  {currentIndex + 1} / {activeBanners.length}
                </span>
              </div>

              {/* Navigation Arrows */}
              {activeBanners.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Banner trước"
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-emerald-600 text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 backdrop-blur-md border border-white/20 shadow-lg z-20 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Banner tiếp theo"
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-emerald-600 text-white flex items-center justify-center transition-all opacity-80 sm:opacity-0 sm:group-hover:opacity-100 backdrop-blur-md border border-white/20 shadow-lg z-20 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Content Card at the bottom of the banner */}
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 z-10 flex flex-col justify-end">
                <h3 className="font-black text-white text-lg sm:text-xl leading-snug drop-shadow-md group-hover:text-emerald-300 transition-colors">
                  {currentBanner.title}
                </h3>
                {currentBanner.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-200 mt-1.5 line-clamp-2 leading-relaxed drop-shadow">
                    {currentBanner.subtitle}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between pt-3 border-t border-white/15">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:text-emerald-300 group-hover:translate-x-1 transition-all">
                    <span>{currentBanner.buttonText || 'Khám Phá Ngay'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>

                  {/* Slide Dots Indicator */}
                  {activeBanners.length > 1 && (
                    <div 
                      className="flex items-center gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {activeBanners.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentIndex(idx)}
                          aria-label={`Chuyển tới slide ${idx + 1}`}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            currentIndex === idx 
                              ? 'w-6 bg-emerald-400' 
                              : 'w-2 bg-white/40 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Hotline & Cam kết GSP Pill */}
            <div className="bg-gradient-to-r from-emerald-950/70 to-teal-950/70 border border-emerald-500/30 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] text-emerald-300 font-semibold truncate">Cần tư vấn lựa chọn sản phẩm?</div>
                  <div className="text-xs font-bold text-white truncate">Dược sĩ trực tuyến 24/7 • Hotline: {hotline}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenAdvisor}
                className="shrink-0 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-3 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Tư Vấn Ngay
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
