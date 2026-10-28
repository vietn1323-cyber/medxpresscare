import React, { useState } from 'react';
import { 
  CATEGORIES, COUNTRIES, DOSAGE_FORMS, TARGET_AUDIENCES, BRANDS_LIST, cleanCountryName 
} from '../data/products';
import { 
  Check, Filter, ArrowUpDown, Sparkles, SlidersHorizontal,
  Activity, Heart, Brain, Sparkles as SparklesIcon, ShieldCheck,
  Flame, Zap, Baby, LayoutGrid, Droplets, Eye, Scale, Wind,
  Smile, Pill, Users, Tag, RotateCcw, ChevronDown, CheckCircle2,
  Search, X
} from 'lucide-react';

const CATEGORY_ICONS = {
  all: LayoutGrid,
  'bo-nao-than-kinh': Brain,
  'bo-tri-nao-bo-mat-tre-em': Baby,
  'chong-lao-hoa-dep-da': SparklesIcon,
  'co-xuong-khop': Activity,
  'ddvs-phu-khoa': ShieldCheck,
  'dinh-duong-me-bau-bu': Heart,
  'dinh-duong-mien-dich-tre-em': Baby,
  'duong-toc-mong': Droplets,
  'gan-mat': Flame,
  'ho-hap': Wind,
  'mien-dich-suc-khoe-tong-quat': ShieldCheck,
  'mo-mau-tim-mach': Heart,
  'phu-khoa': Smile,
  'sinh-ly-nam': Zap,
  'sinh-ly-nu': Smile,
  'tang-chieu-cao-tre-em': Scale,
  'tieu-hoa': Flame,
  'tieu-hoa-ho-hap-tre-em': Baby,
  'than-tiet-nieu': Droplets,
  'tieu-duong-chuyen-hoa': Activity,
  'duoc-my-pham': SparklesIcon,
  bone_joint: Activity,
  cardio: Heart,
  brain_nerve: Brain,
  beauty_skin: SparklesIcon,
  immunity: ShieldCheck,
  digestive_liver: Flame,
  mens_health: Zap,
  womens_health: Smile,
  kids_mom: Baby,
  diabetes: Droplets,
  eye_care: Eye,
  weight_loss: Scale,
  respiratory: Wind,
};

export const OriginFilterTabs = ({
  originFilter,
  setOriginFilter,
  selectedCountry,
  setSelectedCountry,
  selectedCategory,
  setSelectedCategory,
  selectedDosage = 'all',
  setSelectedDosage,
  selectedAudience = 'all',
  setSelectedAudience,
  selectedBrand = 'all',
  setSelectedBrand,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
  totalResults,
  onResetFilters,
  availableCountries = [],
  productsList = [],
  searchQuery = '',
  setSearchQuery
}) => {
  // Dimension tab mode: 'category' (Công dụng) | 'dosage' (Dạng bào chế) | 'audience' (Đối tượng) | 'brand' (Thương hiệu)
  const [activeDimension, setActiveDimension] = useState('category');

  // Lấy danh sách quốc gia động: gom từ productsList và availableCountries (loại bỏ cờ, mã ký tự US, VN, DE...)
  const dynamicCountries = React.useMemo(() => {
    const countrySet = new Set();
    
    if (Array.isArray(productsList) && productsList.length > 0) {
      productsList.forEach(p => {
        const cName = cleanCountryName(p.countryName);
        if (cName) countrySet.add(cName);
      });
    }

    if (Array.isArray(availableCountries) && availableCountries.length > 0) {
      availableCountries.forEach(c => {
        const cName = cleanCountryName(c);
        if (cName) countrySet.add(cName);
      });
    }

    if (countrySet.size === 0) {
      COUNTRIES.forEach(c => {
        if (c.id !== 'all') countrySet.add(cleanCountryName(c.name));
      });
    }

    const list = Array.from(countrySet).filter(Boolean);
    return list.sort((a, b) => {
      if (a === 'Việt Nam') return -1;
      if (b === 'Việt Nam') return 1;
      return a.localeCompare(b, 'vi');
    });
  }, [productsList, availableCountries]);

  // Count active filters
  let activeFilterCount = 0;
  if (searchQuery && searchQuery.trim()) activeFilterCount++;
  if (originFilter !== 'all') activeFilterCount++;
  if (selectedCountry !== 'all') activeFilterCount++;
  if (selectedCategory !== 'all') activeFilterCount++;
  if (selectedDosage !== 'all') activeFilterCount++;
  if (selectedAudience !== 'all') activeFilterCount++;
  if (selectedBrand !== 'all') activeFilterCount++;
  if (priceRange !== 'all') activeFilterCount++;

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-4 sm:p-6 mb-8 transition-all">
      
      {/* 1. Header: Tiêu Đề & Switcher Xuất Xứ (Nội Địa vs Nhập Ngoại) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              Phân Loại & Tra Cứu Thực Phẩm Chức Năng
            </h2>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {totalResults} sản phẩm
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân loại đa chiều: Theo nhóm bệnh, dạng bào chế, độ tuổi và nguồn gốc kiểm định
          </p>
        </div>

        {/* 3 Main Origin Mode Buttons */}
        <div className="inline-flex p-1.5 bg-slate-100 rounded-2xl gap-1 self-start lg:self-auto shadow-inner">
          <button
            onClick={() => { setOriginFilter('all'); setSelectedCountry('all'); }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              originFilter === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất Cả ({totalResults})
          </button>

          <button
            onClick={() => { setOriginFilter('domestic'); setSelectedCountry('VN'); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              originFilter === 'domestic'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <span>Hàng Nội Địa</span>
            <span className="text-[10px] hidden sm:inline px-1 py-0.2 rounded bg-white/20">GMP</span>
          </button>

          <button
            onClick={() => { setOriginFilter('imported'); if (selectedCountry === 'VN' || selectedCountry === 'Việt Nam') setSelectedCountry('all'); }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
              originFilter === 'imported'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-blue-700 hover:bg-blue-50'
            }`}
          >
            <span>Hàng Nhập Ngoại</span>
            <span className="text-[10px] hidden sm:inline px-1 py-0.2 rounded bg-white/20">Chính Ngạch</span>
          </button>
        </div>
      </div>

      {/* 1.5. Thanh Tìm Kiếm Sản Phẩm Ngay Trong Khu Vực Phân Loại & Tra Cứu (Image 2) */}
      <div className="py-3.5 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 group">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 group-focus-within:text-emerald-600 transition-colors pointer-events-none" />
            <input
              type="text"
              placeholder="🔍 Tìm nhanh theo tên sản phẩm, hoạt chất, thương hiệu, nhóm công dụng (VD: Canxi, Ginkgo, OIC, DHC...)"
              value={searchQuery || ''}
              onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-sm font-medium rounded-2xl border border-slate-200/90 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all placeholder:text-slate-400 text-slate-800 shadow-2xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery && setSearchQuery('')}
                className="absolute right-3.5 top-2.5 p-1 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"
                title="Xóa từ khóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {searchQuery && (
            <div className="flex items-center justify-between sm:justify-start gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2.5 rounded-xl border border-emerald-200/80 shrink-0 animate-fadeIn">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Kết quả cho: &quot;{searchQuery}&quot; ({totalResults} sản phẩm)
              </span>
              <button
                onClick={() => setSearchQuery && setSearchQuery('')}
                className="text-xs text-rose-600 hover:text-rose-700 underline font-bold cursor-pointer ml-1"
              >
                Bỏ lọc
              </button>
            </div>
          )}
        </div>

        {/* Gợi ý từ khóa tìm nhanh phổ biến khi ô tìm kiếm trống */}
        {!searchQuery && (
          <div className="flex items-center gap-1.5 pt-2.5 overflow-x-auto no-scrollbar text-xs">
            <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Gợi ý tìm nhanh:
            </span>
            {['Viên khớp', 'Canxi cho bé', 'Bổ não Ginkgo', 'Dạ dày Curcumin', 'Hồng sâm KGC', 'Glucosamine', 'DHC Lutein'].map((kw) => (
              <button
                key={kw}
                onClick={() => setSearchQuery && setSearchQuery(kw)}
                className="px-2.5 py-0.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 border border-transparent text-slate-600 font-medium shrink-0 transition-colors cursor-pointer"
              >
                {kw}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Dimension Mode Selector Tabs (Chọn Góc Nhìn Phân Loại) */}
      <div className="pt-4 pb-2 border-b border-slate-100">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Góc nhìn:
            </span>

            <button
              onClick={() => setActiveDimension('category')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeDimension === 'category'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>1. Nhóm Bệnh & Công Dụng ({CATEGORIES.length - 1})</span>
              {selectedCategory !== 'all' && <span className="w-2 h-2 rounded-full bg-amber-300"></span>}
            </button>

            <button
              onClick={() => setActiveDimension('dosage')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeDimension === 'dosage'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Pill className="w-3.5 h-3.5" />
              <span>2. Dạng Bào Chế ({DOSAGE_FORMS.length - 1})</span>
              {selectedDosage !== 'all' && <span className="w-2 h-2 rounded-full bg-amber-300"></span>}
            </button>

            <button
              onClick={() => setActiveDimension('audience')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeDimension === 'audience'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>3. Đối Tượng Dùng ({TARGET_AUDIENCES.length - 1})</span>
              {selectedAudience !== 'all' && <span className="w-2 h-2 rounded-full bg-amber-300"></span>}
            </button>

            <button
              onClick={() => setActiveDimension('brand')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                activeDimension === 'brand'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>4. Thương Hiệu ({BRANDS_LIST.length - 1})</span>
              {selectedBrand !== 'all' && <span className="w-2 h-2 rounded-full bg-amber-300"></span>}
            </button>
          </div>

          {/* Reset Filters button if any active */}
          {activeFilterCount > 0 && (
            <button
              onClick={onResetFilters}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors ml-auto shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Đặt lại bộ lọc ({activeFilterCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Sub-Category Content Depending on Active Dimension */}
      <div className="py-3">
        {/* DIMENSION 1: Nhóm Sức Khỏe & Bệnh Lý */}
        {activeDimension === 'category' && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] || LayoutGrid;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-800'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* DIMENSION 2: Dạng Bào Chế */}
        {activeDimension === 'dosage' && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {DOSAGE_FORMS.map((d) => {
              const isSelected = selectedDosage === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setSelectedDosage && setSelectedDosage(d.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-teal-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span>{d.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* DIMENSION 3: Đối Tượng Sử Dụng */}
        {activeDimension === 'audience' && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {TARGET_AUDIENCES.map((aud) => {
              const isSelected = selectedAudience === aud.id;
              return (
                <button
                  key={aud.id}
                  onClick={() => setSelectedAudience && setSelectedAudience(aud.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-indigo-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{aud.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* DIMENSION 4: Thương Hiệu Nổi Tiếng */}
        {activeDimension === 'brand' && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {BRANDS_LIST.map((brandName) => {
              const brandId = brandName === 'Tất cả thương hiệu' ? 'all' : brandName;
              const isSelected = selectedBrand === brandId;
              return (
                <button
                  key={brandName}
                  onClick={() => setSelectedBrand && setSelectedBrand(brandId)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                    isSelected
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{brandName}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Quốc Gia & Nguồn Gốc Xuất Xứ Pills */}
      <div className="pt-2 pb-3 border-t border-slate-100">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
            Quốc gia:
          </span>

          {/* Tất cả xuất xứ */}
          <button
            onClick={() => setSelectedCountry('all')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition-all ${
              selectedCountry === 'all'
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
            }`}
          >
            <span>Tất cả xuất xứ</span>
          </button>

          {/* Danh sách quốc gia động không cờ emoji, không mã chữ VN, US... */}
          {dynamicCountries.map((cName) => {
            if (originFilter === 'domestic' && cName !== 'Việt Nam') return null;
            if (originFilter === 'imported' && cName === 'Việt Nam') return null;

            const isSelected = selectedCountry === cName || 
              (cName === 'Việt Nam' && selectedCountry === 'VN') ||
              (cName === 'Mỹ' && selectedCountry === 'US') ||
              (cName === 'Úc' && selectedCountry === 'AU') ||
              (cName === 'Nhật Bản' && selectedCountry === 'JP') ||
              (cName === 'Hàn Quốc' && selectedCountry === 'KR') ||
              (cName === 'Đức' && selectedCountry === 'DE');

            return (
              <button
                key={cName}
                onClick={() => setSelectedCountry(isSelected ? 'all' : cName)}
                className={`flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 border transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm font-bold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <span>{cName}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Sub-filters & Sort Bar (Mức Giá & Sắp Xếp) */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Price Range selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-500">Mức giá:</span>
          {[
            { id: 'all', label: 'Tất cả giá' },
            { id: 'under_300', label: '< 300.000₫' },
            { id: '300_600', label: '300k - 600k' },
            { id: '600_1000', label: '600k - 1 triệu' },
            { id: 'over_1000', label: '> 1 triệu' },
          ].map((pr) => (
            <button
              key={pr.id}
              onClick={() => setPriceRange(pr.id)}
              className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
                priceRange === pr.id
                  ? 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {pr.label}
            </button>
          ))}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 ml-auto">
          <span className="font-bold text-slate-500 flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sắp xếp:
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-bold focus:outline-none focus:border-emerald-500"
          >
            <option value="featured">Nổi bật nhất</option>
            <option value="best_seller">Bán chạy hàng đầu</option>
            <option value="price_asc">Giá: Thấp đến cao</option>
            <option value="price_desc">Giá: Cao đến thấp</option>
            <option value="rating">Đánh giá cao (5★)</option>
          </select>
        </div>

      </div>

    </div>
  );
};
