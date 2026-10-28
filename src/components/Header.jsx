import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, ShoppingBag, Heart, ShieldCheck, Stethoscope, 
  PhoneCall, Zap, Sparkles, X, ChevronDown, CheckCircle2,
  FileCheck2, Globe2, Truck, RefreshCw, User, Award, BookOpen, Tag,
  Smartphone, Menu, ChevronRight
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
  onNavigateToPolicy,
  customer,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenVouchers,
  onGoHome,
  currentView = 'home',
  onNavigateToProducts,
  hotline = '1800 6868',
  products = [],
  onOpenProductDetail,
  onOpenPWAInstall
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef(null);

  // Xử lý đóng dropdown gợi ý & thu gọn thanh tìm kiếm khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Đóng Mobile Drawer khi đổi route/view
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentView, originFilter]);

  // Gợi ý thông minh khi tìm kiếm
  const suggestedProducts = useMemo(() => {
    if (!searchQuery || searchQuery.trim().length < 2) return [];
    const q = searchQuery.toLowerCase().trim();
    return products
      .filter(p => 
        p.name?.toLowerCase().includes(q) || 
        p.brand?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.countryName?.toLowerCase().includes(q)
      )
      .slice(0, 4);
  }, [searchQuery, products]);

  return (
    <header className="sticky top-0 z-40 bg-white shadow-xs border-b border-slate-100 w-full overflow-x-clip">
      {/* 1. Top Banner Cam Kết Y Khoa (Tối ưu hiển thị gọn gàng, không bị kéo dài hoặc vỡ dòng) */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-800 text-white text-xs py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Bên trái: Huy hiệu cam kết */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="flex items-center gap-1 font-semibold text-[11px] sm:text-xs truncate bg-emerald-600/50 sm:bg-emerald-600/60 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="sm:hidden">100% Chính Hãng (Bồi hoàn 300%)</span>
              <span className="hidden sm:inline">100% Chính Hãng - Bồi hoàn 300% nếu phát hiện giả</span>
            </span>

            <button 
              onClick={() => onNavigateToPolicy ? onNavigateToPolicy('chinh-sach-giao-hang') : (window.location.hash = '#rules')}
              className="hidden md:flex items-center gap-1 text-emerald-100 hover:text-white transition-colors cursor-pointer text-[11px]"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Giao hỏa tốc Hà Nội</span>
            </button>

            <button 
              onClick={() => onNavigateToPolicy ? onNavigateToPolicy('chinh-sach-doi-tra') : (window.location.hash = '#return')}
              className="hidden xl:flex items-center gap-1 text-emerald-100 hover:text-white transition-colors cursor-pointer text-[11px]"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-300" />
              <span>Đổi trả 30 ngày</span>
            </button>
          </div>

          {/* Bên phải: Cài App | Tra cứu Vận đơn | [Tài khoản khách hàng / Đăng Nhập di chuyển sang vị trí SĐT cũ] */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-[11px]">
            {/* Nút Cài App PWA */}
            {onOpenPWAInstall && (
              <button 
                onClick={onOpenPWAInstall}
                className="bg-emerald-600/90 hover:bg-emerald-500 text-white transition-all flex items-center gap-1 font-bold text-[10px] sm:text-[11px] px-2.5 py-0.5 rounded-full shadow-2xs cursor-pointer shrink-0"
                title="Thêm ứng dụng MedXpressCare vào điện thoại"
              >
                <Smartphone className="w-3 h-3 text-amber-300" />
                <span>Cài App</span>
              </button>
            )}

            {/* Tra cứu vận đơn link (giữ ở dòng 1) */}
            <button 
              onClick={() => {
                if (onNavigateToTracking) onNavigateToTracking();
                else if (onOpenOrderTracking) onOpenOrderTracking();
              }}
              className="hover:text-emerald-200 transition-colors flex items-center gap-1 font-medium underline underline-offset-2 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden sm:inline">Tra cứu Vận đơn</span>
              <span className="sm:hidden">Tra đơn</span>
            </button>

            {/* Khách hàng & Điểm thưởng - Đã di chuyển sang vị trí ngoài cùng bên phải (thay thế vị trí SĐT cũ) */}
            {customer ? (
              <button 
                onClick={onOpenProfileModal}
                className="flex items-center gap-1 font-bold text-[11px] bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-0.5 rounded-full shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <span>🌟 {customer.points || 0}đ</span>
                <span className="hidden sm:inline">| {customer.fullName}</span>
              </button>
            ) : (
              <button 
                onClick={onOpenAuthModal}
                className="hover:text-emerald-200 transition-colors flex items-center gap-1 font-semibold cursor-pointer shrink-0 bg-emerald-600/70 hover:bg-emerald-600 px-2.5 py-0.5 rounded-full"
              >
                <User className="w-3.5 h-3.5 text-amber-300" />
                <span>Đăng Nhập</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
          {/* Logo & Brand Slogan */}
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" 
            onClick={() => { setSelectedCategory('all'); setOriginFilter('all'); setSearchQuery(''); if (onGoHome) onGoHome(); }}
          >
            <img 
              src="/logo-icon.png" 
              alt="MedXpress Care Logo" 
              className="w-9 h-9 sm:w-11 sm:h-11 object-contain rounded-xl sm:rounded-2xl shadow-2xs hover:scale-105 transition-transform" 
            />
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-lg sm:text-2xl font-black tracking-tight text-blue-900 leading-none">
                  Med<span className="text-emerald-600">Xpress</span> <span className="text-blue-600">Care</span>
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded border border-emerald-200 leading-none">.COM</span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-emerald-800 font-bold tracking-tight hidden sm:block mt-0.5">
                — Sức khỏe thật – Giá trị thật —
              </p>
            </div>
          </div>

          {/* Ô Tìm Kiếm Mở Rộng Theo Phương Ngang Trên Desktop */}
          <div 
            ref={searchContainerRef}
            className={`relative transition-all duration-300 ease-in-out hidden md:block ${
              isSearchFocused 
                ? 'flex-1 max-w-2xl lg:max-w-3xl mx-1 sm:mx-2' 
                : 'flex-1 min-w-[200px] max-w-sm lg:max-w-md mx-1 sm:mx-2'
            }`}
          >
            <div className="relative group">
              <input
                type="text"
                placeholder={
                  isSearchFocused
                    ? "Nhập tên TPCN, thảo dược, thương hiệu (VD: Bách Niên Kiện, Bio Island, Curcumin...)"
                    : "Tìm TPCN, thảo dược, thương hiệu..."
                }
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsSearchFocused(false);
                }}
                className={`w-full pl-9 pr-9 py-2 text-xs sm:text-sm rounded-full border transition-all duration-300 focus:outline-none ${
                  isSearchFocused
                    ? 'bg-white border-emerald-500 ring-3 ring-emerald-500/15 shadow-md shadow-emerald-600/10 text-slate-800'
                    : 'bg-slate-100 hover:bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400'
                }`}
              />
              <Search className={`w-4 h-4 absolute left-3 top-2.5 transition-colors ${
                isSearchFocused ? 'text-emerald-600' : 'text-slate-400'
              }`} />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Smart Suggestions Dropdown */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 z-50 animate-scaleUp">
                {searchQuery.trim() ? (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Sản phẩm gợi ý nhanh</span>
                      <span className="text-emerald-600 font-bold lowercase">{suggestedProducts.length} kết quả</span>
                    </div>
                    {suggestedProducts.length > 0 ? (
                      <div className="space-y-1">
                        {suggestedProducts.map((p) => (
                          <div 
                            key={p.id}
                            onClick={() => {
                              setIsSearchFocused(false);
                              if (onOpenProductDetail) {
                                onOpenProductDetail(p);
                              } else {
                                setSearchQuery(p.name);
                              }
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-emerald-50/80 cursor-pointer transition-colors group"
                          >
                            <img 
                              src={p.image} 
                              alt={p.name} 
                              className="w-10 h-10 object-contain rounded-lg bg-slate-50 p-1 border border-slate-100 shrink-0" 
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 truncate">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                                <span className="text-emerald-600 font-semibold">{p.brand}</span>
                                <span>•</span>
                                <span className="font-extrabold text-rose-600">
                                  {Number(p.price || 0).toLocaleString('vi-VN')}₫
                                </span>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 shrink-0" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-3 text-center text-xs text-slate-400">
                        Không tìm thấy sản phẩm phù hợp với từ khóa "{searchQuery}"
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Tìm kiếm phổ biến
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Bách Niên Kiện', 'Bio Island Canxi', 'Nano Curcumin', 'Hồng Sâm', 'DHC Kẽm'].map((tag) => (
                        <button
                          key={tag}
                          onMouseDown={() => {
                            setSearchQuery(tag);
                            setIsSearchFocused(false);
                          }}
                          className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-medium transition-colors cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Các nút hành động bên phải */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Dược sĩ AI Button (Desktop) */}
            <button
              onClick={onOpenAdvisor}
              className={`flex items-center gap-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                isSearchFocused ? 'p-2 sm:p-2.5' : 'px-3 py-1.5 hidden lg:flex'
              }`}
              title="Dược Sĩ AI Tư Vấn 24/7"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Stethoscope className="w-3 h-3" />
              </div>
              {!isSearchFocused && (
                <>
                  <span className="hidden xl:inline">Dược Sĩ AI</span>
                  <span className="bg-emerald-600 text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">24/7</span>
                </>
              )}
            </button>

            {/* Kho Voucher (Desktop) */}
            {onOpenVouchers && (
              <button
                onClick={onOpenVouchers}
                className={`flex items-center gap-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                  isSearchFocused ? 'p-2 sm:p-2.5' : 'px-2.5 py-1.5 hidden md:flex'
                }`}
                title="Kho Voucher & Ưu Đãi"
              >
                <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                {!isSearchFocused && <span>Voucher</span>}
              </button>
            )}

            {/* Tra cứu chính hãng button */}
            <button
              onClick={onOpenVerifier}
              className={`flex items-center gap-1.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-all cursor-pointer ${
                isSearchFocused ? 'p-2 sm:p-2.5' : 'px-3 py-2 hidden sm:flex'
              }`}
              title="Kiểm Tra Giấy Phép Tiếp Nhận BYT"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
              {!isSearchFocused && (
                <span className="hidden xl:inline">Kiểm Tra Giấy Phép</span>
              )}
            </button>

            {/* Wishlist Button */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
              title="Danh sách yêu thích"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Customer Account Button */}
            {customer ? (
              <button
                onClick={onOpenProfileModal}
                className={`flex items-center gap-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-slate-800 text-xs font-bold shadow-2xs cursor-pointer ${
                  isSearchFocused ? 'p-1.5' : 'p-1.5 sm:px-2.5 sm:py-1'
                }`}
                title={`Tài khoản: ${customer.fullName} (${customer.points || 0} điểm)`}
              >
                <div className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-black shrink-0">
                  ★
                </div>
                {!isSearchFocused && (
                  <span className="hidden md:inline text-xs">{customer.points || 0}đ</span>
                )}
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className={`flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer ${
                  isSearchFocused ? 'p-2 sm:p-2.5' : 'p-2 sm:px-2.5 sm:py-1.5'
                }`}
                title="Đăng nhập / Tích điểm"
              >
                <User className="w-4 h-4 text-emerald-600 shrink-0" />
                {!isSearchFocused && (
                  <span className="hidden sm:inline">Đăng Nhập</span>
                )}
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className={`relative flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold text-xs sm:text-sm shadow-sm shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 ${
                isSearchFocused ? 'p-2 px-2.5 sm:px-3' : 'px-2.5 sm:px-3 py-1.5'
              }`}
              title={`Giỏ Hàng (${cartCount} sản phẩm)`}
            >
              <ShoppingBag className="w-4 h-4" />
              {!isSearchFocused && (
                <span className="hidden sm:inline font-bold">Giỏ</span>
              )}
              <span className="bg-white text-emerald-700 font-extrabold text-[11px] px-1.5 py-0.2 rounded-full shadow-inner">
                {cartCount}
              </span>
            </button>

            {/* Mobile Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors md:hidden cursor-pointer shrink-0"
              aria-label="Mở Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Search Input (Hiển thị ngay dưới Logo trên Mobile) */}
        <div className="mt-2 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm TPCN, thảo dược, thương hiệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-100 text-xs rounded-full border border-slate-200 focus:outline-none focus:border-emerald-500 focus:bg-white transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')} 
                className="absolute right-3 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. Phân Loại Nhanh: Xuất Xứ (Nội Địa vs Nhập Ngoại) & Cẩm Nang Y Khoa */}
      <div className="bg-slate-50 border-t border-slate-200/80 px-3 sm:px-4 py-1.5">
        <div className="max-w-7xl mx-auto">
          {/* GIAO DIỆN MOBILE: 4 Tab vừa khít 100% màn hình, không bị tràn hay kéo dài */}
          <div className="md:hidden grid grid-cols-4 gap-1 bg-slate-200/80 p-0.5 rounded-xl text-center text-xs font-bold">
            <button
              onClick={() => onNavigateToProducts ? onNavigateToProducts('all') : setOriginFilter('all')}
              className={`py-1.5 px-0.5 rounded-lg transition-all cursor-pointer truncate ${
                currentView === 'products' && originFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất Cả
            </button>

            <button
              onClick={() => onNavigateToProducts ? onNavigateToProducts('domestic') : setOriginFilter('domestic')}
              className={`py-1.5 px-0.5 rounded-lg transition-all cursor-pointer truncate ${
                currentView === 'products' && originFilter === 'domestic'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Nội Địa GMP
            </button>

            <button
              onClick={() => onNavigateToProducts ? onNavigateToProducts('imported') : setOriginFilter('imported')}
              className={`py-1.5 px-0.5 rounded-lg transition-all cursor-pointer truncate ${
                currentView === 'products' && originFilter === 'imported'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 hover:text-blue-900'
              }`}
            >
              Nhập Ngoại
            </button>

            <a
              href="#health-blog"
              className="py-1.5 px-0.5 rounded-lg text-emerald-800 hover:text-emerald-950 transition-all cursor-pointer truncate flex items-center justify-center gap-1"
            >
              <BookOpen className="w-3 h-3 text-amber-500 shrink-0" />
              <span>Cẩm Nang</span>
            </a>
          </div>

          {/* GIAO DIỆN DESKTOP (MD & TRỞ LÊN): Gọn gàng, vừa vặn hoàn hảo, không bị scroll ngang */}
          <div className="hidden md:flex items-center justify-between gap-4">
            {/* Origin Filters */}
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
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
                <span>Hàng Nội Địa Uy Tín</span>
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
                <span>Hàng Nhập Khẩu Chính Ngạch</span>
                <span className="text-[10px] font-normal px-1 py-0.2 bg-white/20 rounded hidden lg:inline">Mỹ • Úc • Nhật • Hàn • Đức</span>
              </button>
            </div>

            {/* Cẩm Nang Y Khoa đã chuyển xuống thanh menu (đã xóa dòng cam kết và nút tra vận đơn ở dòng 3) */}
            <div className="flex items-center gap-2">
              <a
                href="#health-blog"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 transition-all cursor-pointer shadow-2xs border border-emerald-200"
              >
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                <span>Cẩm Nang Y Khoa</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Slide-in Mobile Navigation Drawer (Menu chuyên biệt cho Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs md:hidden animate-fadeIn"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="fixed top-0 right-0 bottom-0 w-4/5 max-w-sm bg-white shadow-2xl flex flex-col z-50 animate-slideLeft"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 bg-emerald-800 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src="/logo-icon.png" alt="Logo" className="w-8 h-8 rounded-lg bg-white p-0.5" />
                <span className="font-black text-sm tracking-tight">MedXpressCare</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer"
                aria-label="Đóng Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Account Strip in Drawer */}
            <div className="p-3 bg-emerald-50 border-b border-emerald-100">
              {customer ? (
                <div 
                  onClick={() => { setIsMobileMenuOpen(false); onOpenProfileModal(); }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs">
                      ★
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800">{customer.fullName}</div>
                      <div className="text-[11px] text-amber-700 font-semibold">{customer.points || 0} điểm tích lũy</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-emerald-600" />
                </div>
              ) : (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); onOpenAuthModal(); }}
                  className="w-full py-2 px-3 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4 text-amber-300" />
                  <span>Đăng Nhập / Đăng Ký Tài Khoản</span>
                </button>
              )}
            </div>

            {/* Drawer Menu List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs font-semibold text-slate-700">
              {/* Cài đặt App PWA */}
              {onOpenPWAInstall && (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); onOpenPWAInstall(); }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-amber-300" />
                    <span>Cài Đặt App Vào Điện Thoại</span>
                  </div>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">PWA</span>
                </button>
              )}

              {/* Dược sĩ AI */}
              <button
                onClick={() => { setIsMobileMenuOpen(false); onOpenAdvisor(); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <span>Dược Sĩ AI Tư Vấn Liệu Trình 24/7</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>

              {/* Kho Voucher */}
              {onOpenVouchers && (
                <button
                  onClick={() => { setIsMobileMenuOpen(false); onOpenVouchers(); }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Tag className="w-4 h-4 text-amber-600" />
                    <span>Săn Voucher & Mã Khuyến Mại</span>
                  </div>
                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">Hot</span>
                </button>
              )}

              {/* Tra Cứu Vận Đơn */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  if (onNavigateToTracking) onNavigateToTracking();
                  else if (onOpenOrderTracking) onOpenOrderTracking();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Truck className="w-4 h-4 text-teal-600" />
                  <span>Tra Cứu Vận Đơn Hàng Hóa</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>

              {/* Tra Cứu Giấy Phép */}
              <button
                onClick={() => { setIsMobileMenuOpen(false); onOpenVerifier(); }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileCheck2 className="w-4 h-4 text-emerald-600" />
                  <span>Tra Cứu Số ĐKSP Bộ Y Tế</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </button>

              {/* Cẩm Nang Sức Khỏe */}
              <a
                href="#health-blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Cẩm Nang Sức Khỏe & Blog Y Khoa</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </a>

              {/* Hotline Dược Sĩ */}
              <a
                href={`tel:${(hotline || '1800 6868').replace(/\s+/g, '')}`}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 mt-2"
              >
                <div className="flex items-center gap-2.5 font-bold">
                  <PhoneCall className="w-4 h-4 text-amber-600 animate-pulse" />
                  <span>Tổng Đài Miễn Cước: {hotline || '1800 6868'}</span>
                </div>
              </a>
            </div>

            {/* Drawer Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center">
              100% Thực Phẩm Chức Năng Chính Hãng Chuẩn GMP
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
