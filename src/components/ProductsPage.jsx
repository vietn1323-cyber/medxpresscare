import React from 'react';
import { 
  Home, ChevronRight, ShieldCheck, Sparkles, Filter, 
  RotateCcw, ArrowLeft, CheckCircle2, Globe2, Award, 
  Zap, Check, Stethoscope, Search, X
} from 'lucide-react';
import { OriginFilterTabs } from './OriginFilterTabs';
import { ProductCard } from './ProductCard';

export const ProductsPage = ({
  products = [],
  allProducts = [],
  availableCountries = [],
  originFilter = 'all',
  setOriginFilter,
  selectedCountry = 'all',
  setSelectedCountry,
  selectedCategory = 'all',
  setSelectedCategory,
  selectedDosage = 'all',
  setSelectedDosage,
  selectedAudience = 'all',
  setSelectedAudience,
  selectedBrand = 'all',
  setSelectedBrand,
  sortBy = 'featured',
  setSortBy,
  priceRange = 'all',
  setPriceRange,
  searchQuery = '',
  setSearchQuery,
  onAddToCart,
  onOpenDetail,
  wishlist = [],
  onToggleWishlist,
  onBackHome,
  onNavigateToProducts,
  onOpenAdvisor
}) => {
  // Thống kê số lượng theo xuất xứ
  const domesticCount = allProducts.filter(p => p.originType === 'domestic').length;
  const importedCount = allProducts.filter(p => p.originType === 'imported').length;
  const totalCount = allProducts.length;

  const handleResetFilters = () => {
    if (setSearchQuery) setSearchQuery('');
    setOriginFilter('all');
    setSelectedCountry('all');
    setSelectedCategory('all');
    setSelectedDosage('all');
    setSelectedAudience('all');
    setSelectedBrand('all');
    setPriceRange('all');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-6 px-4 animate-in fade-in">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* 1. Breadcrumbs & Nút Quay lại Trang Chủ */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={onBackHome}
              className="flex items-center gap-1 hover:text-emerald-700 font-semibold transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Trang Chủ</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-semibold text-slate-700">Sản Phẩm</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {originFilter === 'domestic' && '🇻🇳 Hàng Nội Địa Uy Tín'}
              {originFilter === 'imported' && '🌍 Hàng Nhập Ngoại Chính Ngạch'}
              {originFilter === 'all' && 'Tất Cả Sản Phẩm'}
            </span>
          </div>

          <button
            onClick={onBackHome}
            className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 font-bold hover:underline transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>← Quay Lại Trang Chủ</span>
          </button>
        </div>

        {/* 2. Banner Tiêu Đề Trang Sản Phẩm Chuyên Biệt */}
        <div className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden transition-all ${
          originFilter === 'domestic'
            ? 'bg-gradient-to-r from-rose-800 via-red-700 to-rose-900 border border-rose-500/30'
            : originFilter === 'imported'
            ? 'bg-gradient-to-r from-blue-900 via-sky-800 to-indigo-900 border border-blue-500/30'
            : 'bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 border border-emerald-500/30'
        }`}>
          {/* Background Ambient Glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-white/15 border border-white/20">
              {originFilter === 'domestic' && (
                <>
                  <span className="text-base">🇻🇳</span>
                  <span>Chuẩn GMP-WHO • Dược Liệu Việt Nam</span>
                </>
              )}
              {originFilter === 'imported' && (
                <>
                  <span className="text-base">🌍</span>
                  <span>Chính Ngạch Quốc Tế • USA • Úc • Nhật • Hàn • Đức</span>
                </>
              )}
              {originFilter === 'all' && (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Cầu Nối Phân Phối TPCN Chuẩn Y Khoa Toàn Diện</span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              {originFilter === 'domestic' && 'Gian Hàng TPCN & Dược Liệu Nội Địa Chuẩn GMP-WHO'}
              {originFilter === 'imported' && 'Gian Hàng TPCN Nhập Khẩu Chính Ngạch Quốc Tế'}
              {originFilter === 'all' && 'Tất Cả Sản Phẩm Thực Phẩm Chức Năng Chuẩn Y Khoa'}
            </h1>

            <p className="text-slate-100 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal opacity-90">
              {originFilter === 'domestic' && 'Tuyển chọn dược liệu quý Việt Nam: Sâm Ngọc Linh, Đông trùng Sa Pa, Tinh nghệ Nano Curcumin, Bách Niên Kiện... sản xuất tại các nhà máy GMP-WHO của Bộ Y Tế, tối ưu hiệu quả theo thể trạng người Việt.'}
              {originFilter === 'imported' && '100% nhập khẩu chính ngạch từ các cường quốc y dược (Mỹ, Úc, Nhật, Hàn, Đức). Đầy đủ tem phụ tiếng Việt theo nghị định 43/2017/NĐ-CP, tem chống giả điện tử và số ĐKSP do Cục An Toàn Thực Phẩm cấp.'}
              {originFilter === 'all' && 'Hơn 20 dòng sản phẩm minh bạch nguồn gốc giữa Hàng Nội Địa Uy Tín và Hàng Nhập Ngoại Chính Ngạch. Cam kết bồi hoàn 300% nếu phát hiện hàng giả, hàng cận date.'}
            </p>

            {/* Quick Badges & Count */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
              <span className="bg-white/20 px-3 py-1 rounded-full border border-white/20">
                📦 {products.length} sản phẩm phù hợp
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full border border-white/20">
                🛡️ 100% Hóa đơn VAT
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-full border border-white/20">
                📜 Tiếp nhận đăng ký Bộ Y Tế
              </span>
            </div>
          </div>
        </div>

        {/* 3. Thanh Chuyển Đổi Nhanh Xuất Xứ (Origin Quick Switcher) */}
        <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-1 hidden sm:inline">Xem theo:</span>
            
            {/* Nút 1: Tất Cả Sản Phẩm */}
            <button
              onClick={() => {
                if (onNavigateToProducts) onNavigateToProducts('all');
                else {
                  setOriginFilter('all');
                  setSelectedCountry('all');
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                originFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <span>Tất Cả Sản Phẩm</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                originFilter === 'all' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {totalCount}
              </span>
            </button>

            {/* Nút 2: Hàng Nội Địa Uy Tín */}
            <button
              onClick={() => {
                if (onNavigateToProducts) onNavigateToProducts('domestic');
                else {
                  setOriginFilter('domestic');
                  setSelectedCountry('VN');
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                originFilter === 'domestic'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60'
              }`}
            >
              <span>Hàng Nội Địa Uy Tín</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                originFilter === 'domestic' ? 'bg-rose-800 text-white' : 'bg-rose-200 text-rose-800'
              }`}>
                {domesticCount}
              </span>
            </button>

            {/* Nút 3: Hàng Nhập Ngoại Chính Ngạch */}
            <button
              onClick={() => {
                if (onNavigateToProducts) onNavigateToProducts('imported');
                else {
                  setOriginFilter('imported');
                  setSelectedCountry('all');
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                originFilter === 'imported'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60'
              }`}
            >
              <span>Hàng Nhập Khẩu Chính Ngạch</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                originFilter === 'imported' ? 'bg-blue-800 text-white' : 'bg-blue-200 text-blue-800'
              }`}>
                {importedCount}
              </span>
            </button>
          </div>

          {/* Quick Clear All Filters */}
          <button
            onClick={handleResetFilters}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Đặt lại bộ lọc</span>
          </button>
        </div>

        {/* 4. Bộ Lọc Đa Năng Thông Minh (21 Nhóm bệnh lý, Dạng bào chế, Đối tượng, v.v.) */}
        <OriginFilterTabs
          originFilter={originFilter}
          setOriginFilter={setOriginFilter}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDosage={selectedDosage}
          setSelectedDosage={setSelectedDosage}
          selectedAudience={selectedAudience}
          setSelectedAudience={setSelectedAudience}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          sortBy={sortBy}
          setSortBy={setSortBy}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          totalResults={products.length}
          onResetFilters={handleResetFilters}
          availableCountries={availableCountries}
          productsList={allProducts}
        />

        {/* 5. Lưới Danh Sách Sản Phẩm (Product Grid) */}
        {products.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 my-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <RotateCcw className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Không tìm thấy sản phẩm phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Không có sản phẩm nào khớp với bộ lọc hiện tại. Quý khách vui lòng thử chọn danh mục khác hoặc đặt lại bộ lọc.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
            >
              Đặt Lại Toàn Bộ Bộ Lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 pt-2">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onOpenDetail={onOpenDetail}
                isWishlisted={wishlist.some(item => item.id === product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        )}

        {/* 6. Hộp Tư Vấn Dược Sĩ Lâm Sàng */}
        {onOpenAdvisor && (
          <div className="mt-12 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-400/30">
                <Stethoscope className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-extrabold text-base sm:text-lg">
                  Chưa biết chọn sản phẩm nào phù hợp với thể trạng?
                </h4>
                <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                  Đội ngũ Dược sĩ Đại học Dược kết hợp Trợ lý Trí tuệ Nhân tạo tư vấn phân tích tương tác thuốc, phác đồ kết hợp Đông - Tây Y chuẩn xác 24/7.
                </p>
              </div>
            </div>

            <button
              onClick={onOpenAdvisor}
              className="shrink-0 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 cursor-pointer"
            >
              Nhận Tư Vấn Miễn Phí
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
