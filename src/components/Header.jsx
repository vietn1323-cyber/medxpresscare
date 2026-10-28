import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Search, ShoppingBag, Heart, ShieldCheck, Stethoscope, 
  PhoneCall, Zap, Sparkles, X, ChevronDown, CheckCircle2,
  FileCheck2, Globe2, Truck, RefreshCw, User, Award, BookOpen, Tag,
  Smartphone
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

  // Gợi ý sản phẩm nhanh khi nhập từ khóa
  const suggestedProducts = useMemo(() => {
    if (!searchQuery || !searchQuery.trim() || !Array.isArray(products)) return [];
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
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-100">
      {/* 1. Top Banner Cam Kết Y Khoa */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-emerald-800 text-white text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 font-medium bg-emerald-600/60 px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              100% Chính Hãng - Bồi hoàn 300% nếu phát hiện giả
            </span>
            <button 
              onClick={() => onNavigateToPolicy ? onNavigateToPolicy('chinh-sach-giao-hang') : window.location.hash = '#rules'}
              className="hidden md:flex items-center gap-1 text-emerald-100 hover:text-white transition-colors cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Giao hỏa tốc Hà Nội • Giao nhanh toàn quốc</span>
            </button>
            <button 
              onClick={() => onNavigateToPolicy ? onNavigateToPolicy('chinh-sach-doi-tra') : window.location.hash = '#return'}
              className="hidden lg:flex items-center gap-1 text-emerald-100 hover:text-white transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Đổi trả 30 ngày • Bồi hoàn 300%</span>
            </button>
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

            {onOpenPWAInstall && (
              <>
                <button 
                  onClick={onOpenPWAInstall}
                  className="bg-emerald-600/90 hover:bg-emerald-500 text-white transition-all flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs hover:shadow cursor-pointer"
                  title="Thêm ứng dụng MedXpressCare vào điện thoại"
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                  <span>Cài App</span>
                </button>
                <span className="text-emerald-500 hidden sm:inline">|</span>
              </>
            )}

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
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6">
          {/* Logo & Brand Slogan */}
          <div 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer shrink-0" 
            onClick={() => { setSelectedCategory('all'); setOriginFilter('all'); setSearchQuery(''); if (onGoHome) onGoHome(); }}
          >
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

          {/* Ô Tìm Kiếm Thông Minh (Mở rộng theo phương ngang khi click/focus & thu nhỏ các nút bên phải) */}
          <div 
            ref={searchContainerRef}
            className={`relative transition-all duration-300 ease-in-out hidden md:block ${
              isSearchFocused 
                ? 'flex-1 max-w-2xl lg:max-w-3xl mx-1 sm:mx-3' 
                : 'flex-1 min-w-[200px] lg:min-w-[260px] max-w-md mx-2'
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
                className={`w-full pl-10 pr-10 py-2.5 text-sm rounded-full border transition-all duration-300 focus:outline-none ${
                  isSearchFocused
                    ? 'bg-white border-emerald-500 ring-4 ring-emerald-500/15 shadow-lg shadow-emerald-600/10 text-slate-800'
                    : 'bg-slate-100 hover:bg-slate-50 border-slate-200 text-slate-700 placeholder:text-slate-400'
                }`}
              />
              <Search className={`w-4 h-4 absolute left-3.5 top-3.5 transition-colors ${
                isSearchFocused ? 'text-emerald-600' : 'text-slate-400'
              }`} />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-2.5 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Smart Suggestions Dropdown */}
            {isSearchFocused && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-3 z-50 animate-fadeIn">
                {searchQuery.trim() ? (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>Sản phẩm gợi ý nhanh</span>
                      <span className="text-emerald-600 font-bold lowercase">{suggestedProducts.length} kết quả</span>
                    </div>
                    {suggestedProducts.length > 0 ? (
                      <div className="space-y-1.5 max-h-72 overflow-y-auto no-scrollbar">
                        {suggestedProducts.map(prod => (
                          <div
                            key={prod.id}
                            onMouseDown={() => {
                              if (onOpenProductDetail) onOpenProductDetail(prod);
                              setIsSearchFocused(false);
                            }}
                            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img 
                                src={prod.image || '/logo-icon.png'} 
                                alt={prod.name} 
                                className="w-10 h-10 object-contain rounded-lg border border-slate-100 bg-slate-50 shrink-0" 
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 truncate">
                                  {prod.name}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {prod.category} • {prod.countryName || 'Chính hãng'}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0 ml-2">
                              <span className="text-xs font-black text-rose-600">
                                {typeof prod.price === 'number' ? prod.price.toLocaleString('vi-VN') + '₫' : prod.price}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 py-3 text-center">
                        Không tìm thấy sản phẩm khớp với &quot;{searchQuery}&quot;. Xem danh sách bên dưới hoặc thử từ khóa khác.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Tìm kiếm phổ biến</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Bách Niên Kiện', 'Bio Island Canxi', 'Nano Curcumin OIC', 'Hồng Sâm KGC', 'Glucosamine', 'DHC Lutein', 'Vitamin C'].map(tag => (
                        <button
                          key={tag}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchQuery(tag);
                          }}
                          className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-medium transition-colors cursor-pointer border border-transparent hover:border-emerald-200"
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

          {/* Action Tools: Dược sĩ AI, Tra cứu, Giỏ hàng (Tự động thu nhỏ khi tìm kiếm mở rộng) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 transition-all duration-300">
            {/* Dược sĩ AI Consult Button */}
            <button
              onClick={onOpenAdvisor}
              className={`flex items-center gap-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-all shadow-2xs hover:shadow-xs cursor-pointer ${
                isSearchFocused ? 'p-2 sm:p-2.5' : 'px-3.5 py-2 hidden lg:flex'
              }`}
              title="Dược Sĩ AI Tư Vấn 24/7"
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Stethoscope className="w-3.5 h-3.5" />
              </div>
              {!isSearchFocused && (
                <>
                  <span className="hidden xl:inline">Dược Sĩ AI Tư Vấn</span>
                  <span className="xl:hidden">Dược Sĩ AI</span>
                  <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">24/7</span>
                </>
              )}
            </button>

            {/* Kho Voucher & Ưu Đãi button */}
            {onOpenVouchers && (
              <button
                onClick={onOpenVouchers}
                className={`flex items-center gap-1.5 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                  isSearchFocused ? 'p-2 sm:p-2.5' : 'px-3 py-2 hidden md:flex'
                }`}
                title="Kho Voucher & Ưu Đãi"
              >
                <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                {!isSearchFocused && (
                  <>
                    <span>Săn Voucher</span>
                    <span className="bg-amber-500 text-slate-900 text-[9px] font-black px-1.5 py-0.5 rounded-full">Hot</span>
                  </>
                )}
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
              className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer shrink-0"
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
                className={`flex items-center gap-2 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-slate-800 transition-all text-xs font-bold shadow-xs cursor-pointer ${
                  isSearchFocused ? 'p-1.5' : 'px-3 py-1.5'
                }`}
                title={`Tài khoản: ${customer.fullName} (${customer.points || 0} điểm)`}
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center text-xs font-black shadow-xs shrink-0">
                  ★
                </div>
                {!isSearchFocused && (
                  <div className="text-left hidden md:block">
                    <div className="text-[10px] text-amber-800 font-semibold leading-none">Điểm tích lũy</div>
                    <div className="text-xs font-black text-slate-900 mt-0.5">{customer.points || 0} đ</div>
                  </div>
                )}
              </button>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className={`flex items-center gap-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer ${
                  isSearchFocused ? 'p-2 sm:p-2.5' : 'px-3 py-2'
                }`}
                title="Đăng nhập để tích điểm"
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
              className={`relative flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0 ${
                isSearchFocused ? 'p-2 px-2.5 sm:px-3' : 'px-3.5 py-2'
              }`}
              title={`Giỏ Hàng (${cartCount} sản phẩm)`}
            >
              <ShoppingBag className="w-4 h-4" />
              {!isSearchFocused && (
                <span className="hidden sm:inline">Giỏ Hàng</span>
              )}
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
              <span className="text-[10px] font-normal px-1 py-0.2 bg-white/20 rounded">Mỹ • Úc • Nhật • Hàn • Đức</span>
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
            {onOpenPWAInstall && (
              <button
                onClick={onOpenPWAInstall}
                className="flex items-center gap-1 text-xs font-bold text-emerald-800 bg-emerald-100/90 hover:bg-emerald-200 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                title="Cài đặt App vào điện thoại"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cài App</span>
              </button>
            )}
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              ✨ Dược sĩ ĐH Dược tư vấn liệu trình miễn phí 24/7
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
