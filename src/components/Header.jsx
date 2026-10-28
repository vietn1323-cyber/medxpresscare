import React, { useState } from 'react';
import { 
  Search, ShoppingBag, Heart, ShieldCheck, Stethoscope, 
  PhoneCall, Zap, Sparkles, X, ChevronDown, CheckCircle2,
  FileCheck2, Globe2, Truck, RefreshCw, User, Award, BookOpen, Tag
} from 'lucide-react';
import { CATEGORIES } from '../data/products';

export const Header = ({ 
  cartCount, 
  onOpenCart, 
  wishlistCount, 
  onOpenWishlist, 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory,
  originFilter, 
  setOriginFilter,
  onOpenAdvisor,
  onOpenVerifier,
  onOpenOrderTracking,
  onNavigateToTracking,
  customer,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenVouchers,
  onGoHome,
  currentView = 'home',
  onNavigateToProducts,
  hotline = '1800 6868'
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-100">
      {/* 1. Top Banner Cam Kết Y Khoa */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 font-medium bg-emerald-600/60 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              100% Chính Hãng - Bồi hoàn 300% nếu phát hiện giả
            </span>
            <span className="hidden md:flex items-center gap-1 text-emerald-100">
              <Truck className="w-3.5 h-3.5" />
              Giao hỏa tốc nội thành Hà Nội • Giao hàng nhanh toàn quốc
            </span>
            <span className="hidden lg:flex items-center gap-1 text-emerald-100">
              <RefreshCw className="w-3.5 h-3.5" />
              Đổi trả miễn phí 30 ngày
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {/* Customer Account & Points Top Bar Badge */}
            {customer ? (
              <button 
                onClick={onOpenProfileModal}
                className="flex items-center gap-1.5 font-bold text-xs bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs transition-colors"
              >
                <span>🌟 {customer.points || 0} điểm</span>
                <span className="text-amber-800">|</span>
                <span className="truncate max-w-[120px]">{customer.fullName}</span>
              </button>
            ) : (
              <button 
                onClick={onOpenAuthModal}
                className="hover:text-emerald-200 transition-colors flex items-center gap-1 font-semibold"
              >
                <User className="w-3.5 h-3.5 text-amber-300" />
                <span>Đăng Nhập / Tích Điểm (100k = 1đ)</span>
              </button>
            )}

            <span className="text-emerald-500 hidden sm:inline">|</span>

            <button 
              onClick={() => {
                if (onNavigateToTracking) {
                  onNavigateToTracking();
                } else if (onOpenOrderTracking) {
                  onOpenOrderTracking();
                }
              }}
              className="hover:text-emerald-200 transition-colors flex items-center gap-1 font-medium underline underline-offset-2 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-300" />
              Tra cứu Vận đơn
            </button>
            <span className="text-emerald-500 hidden sm:inline">|</span>

            <button 
              onClick={onOpenVerifier}
              className="hover:text-emerald-200 transition-colors hidden md:flex items-center gap-1 font-medium underline underline-offset-2"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-300" />
              Tra cứu Giấy phép
            </button>
            <span className="text-emerald-500 hidden md:inline">|</span>
            <a 
              href="#health-blog"
              className="hover:text-emerald-200 transition-colors hidden lg:flex items-center gap-1 font-medium underline underline-offset-2"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-300" />
              Cẩm Nang Y Khoa
            </a>
            <span className="text-emerald-500 hidden lg:inline">|</span>
            <a 
              href={`tel:${(hotline || '1800 6868').replace(/\s+/g, '')}`} 
              className="flex items-center gap-1 font-bold text-amber-300 hover:text-white transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
              Tổng đài: {hotline || '1800 6868'}
            </a>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Brand Slogan */}
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" onClick={() => { setSelectedCategory('all'); setOriginFilter('all'); setSearchQuery(''); if (onGoHome) onGoHome(); }}>
            <img 
              src="/logo-icon.png" 
              alt="MedXpress Care Logo" 
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded-2xl shadow-xs hover:scale-105 transition-transform" 
            />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-blue-900">
                  Med<span className="text-emerald-600">Xpress</span> <span className="text-blue-600">Care</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">.COM</span>
              </div>
              <p className="text-[11px] text-emerald-800 font-bold tracking-tight hidden sm:block">
                — Sức khỏe thật – Giá trị thật —
              </p>
            </div>
          </div>

          {/* Ô Tìm Kiếm Thông Minh */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
            <div className="relative group">
              <input
                type="text"
                placeholder="Tìm tên TPCN, thảo dược, thương hiệu (VD: Bách Niên Kiện, Sâm Ngọc Linh, Glucosamine, DHC...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-100 hover:bg-slate-50 focus:bg-white text-sm rounded-full border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none transition-all placeholder:text-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-emerald-600 transition-colors" />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Action Tools: Dược sĩ AI, Tra cứu, Giỏ hàng */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dược sĩ AI Consult Button */}
            <button
              onClick={onOpenAdvisor}
              className="hidden lg:flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all shadow-sm hover:shadow"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
              <span>Dược Sĩ AI Tư Vấn</span>
              <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">24/7</span>
            </button>

            {/* Kho Voucher & Ưu Đãi button */}
            {onOpenVouchers && (
              <button
                onClick={onOpenVouchers}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all shadow-2xs"
                title="Kho Voucher & Ưu Đãi"
              >
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                <span>Săn Voucher</span>
                <span className="bg-amber-500 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">Hot</span>
              </button>
            )}

            {/* Tra cứu chính hãng button */}
            <button
              onClick={onOpenVerifier}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-all"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
              <span>Kiểm Tra Giấy Phép</span>
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              title="Danh sách yêu thích"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Customer Account Button (Đăng nhập / Xem điểm thưởng) */}
            {customer ? (
              <button
                onClick={onOpenProfileModal}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-slate-800 transition-all text-xs font-bold shadow-xs"
                title="Tài khoản & Điểm thưởng"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center text-xs font-black shadow-xs">
                  ★
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-[10px] text-amber-800 font-semibold leading-none">Điểm tích lũy</div>
                  <div className="text-xs font-black text-slate-900 mt-0.5">{customer.points || 0} điểm</div>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                title="Đăng nhập để tích điểm"
              >
                <User className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Đăng Nhập</span>
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-full font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Giỏ Hàng</span>
              <span className="bg-white text-emerald-700 font-extrabold text-xs px-2 py-0.5 rounded-full shadow-inner">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm TPCN, thảo dược, thương hiệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-100 text-xs rounded-full border border-slate-200 focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Phân Loại Nhanh: Xuất Xứ (Nội Địa vs Nhập Ngoại) & Danh Mục */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
          {/* Quick Origin Filters Toggle */}
          <div className="flex items-center gap-1.5 shrink-0 bg-white p-1 rounded-lg border border-slate-200 shadow-xs">
            <button
              onClick={() => onNavigateToProducts ? onNavigateToProducts('all') : setOriginFilter('all')}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'products' && originFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Tất Cả Sản Phẩm
            </button>

            <button
              onClick={() => onNavigateToProducts ? onNavigateToProducts('domestic') : setOriginFilter('domestic')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                currentView === 'products' && originFilter === 'domestic'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100/80'
              }`}
            >
              <span>🇻🇳 Hàng Nội Địa Uy Tín</span>
              <span className="text-[10px] font-normal px-1 py-0.2 bg-white/20 rounded">GMP</span>
            </button>

            <button
              onClick={() => onNavigateToProducts ? onNavigateToProducts('imported') : setOriginFilter('imported')}
              className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                currentView === 'products' && originFilter === 'imported'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 bg-blue-50/70 hover:bg-blue-100/80'
              }`}
            >
              <span>🌍 Hàng Nhập Ngoại Chính Ngạch</span>
              <span className="text-[10px] font-normal px-1 py-0.2 bg-white/20 rounded">USA • Úc • Nhật • Hàn • Đức</span>
            </button>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigateToTracking ? onNavigateToTracking() : onOpenOrderTracking ? onOpenOrderTracking() : null}
              className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                currentView === 'tracking'
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-teal-800 bg-teal-100/80 hover:bg-teal-200/90'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Tra Vận Đơn</span>
            </button>
            {onOpenVouchers && (
              <button
                onClick={onOpenVouchers}
                className="lg:hidden flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100/70 px-2 py-1 rounded-md"
              >
                <Tag className="w-3.5 h-3.5 text-amber-600" />
                Voucher
              </button>
            )}
            <button
              onClick={onOpenAdvisor}
              className="lg:hidden flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-md"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Dược Sĩ AI
            </button>
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              ✨ Dược sĩ ĐH Dược tư vấn liệu trình miễn phí 24/7
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
