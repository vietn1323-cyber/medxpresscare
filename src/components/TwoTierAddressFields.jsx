import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ChevronDown, Check, X } from 'lucide-react';
import { VIETNAM_PROVINCES, getWardsForProvince } from '../data/vietnamAdministrative';

/**
 * Component lựa chọn địa chỉ giao hàng chuẩn xác, tinh gọn
 * - Tỉnh / Thành phố: Dropdown danh sách 34 tỉnh/thành phố hiện hành
 * - Phường / Xã: Danh mục địa giới chuẩn theo CSDL hành chính, hỗ trợ tìm kiếm nhanh & chọn tiện lợi
 */
export const TwoTierAddressFields = ({
  province = 'Thành phố Hà Nội',
  ward = '',
  onProvinceChange,
  onWardChange,
  errorWard = '',
  compact = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Tìm tỉnh thành tương ứng từ prop province (chấp nhận cả tên đầy đủ và tên rút gọn)
  const matchedProvince = VIETNAM_PROVINCES.find(p => 
    p.name === province || 
    p.shortName === province ||
    p.name.toLowerCase() === (province || '').toLowerCase() ||
    p.shortName.toLowerCase() === (province || '').toLowerCase() ||
    (province && p.name.toLowerCase().includes(province.toLowerCase()))
  );
  const selectedProvinceName = matchedProvince ? matchedProvince.name : (province || VIETNAM_PROVINCES[0]?.name || 'Thành phố Hà Nội');

  // Lấy danh sách xã/phường chuẩn
  const availableWards = getWardsForProvince(selectedProvinceName);

  // Lọc theo từ khóa tìm kiếm
  const filteredWards = availableWards.filter(w => 
    w.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Reset tìm kiếm khi đổi tỉnh/thành
  useEffect(() => {
    setSearchTerm('');
  }, [province]);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectWard = (selectedWard) => {
    onWardChange(selectedWard);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`space-y-3 ${compact ? 'text-xs' : 'text-xs'}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* TỈNH / THÀNH PHỐ */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tỉnh / Thành phố</span>
              <span className="text-rose-500">*</span>
            </span>
          </label>

          <select
            value={selectedProvinceName}
            onChange={(e) => {
              const newProv = e.target.value;
              onProvinceChange(newProv);
              onWardChange(''); // reset phường/xã khi đổi tỉnh
            }}
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-all cursor-pointer"
          >
            {VIETNAM_PROVINCES.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* PHƯỜNG / XÃ */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-slate-700 font-bold mb-1">
            <span className="flex items-center gap-1">
              <span>Phường / Xã</span>
              <span className="text-rose-500">*</span>
            </span>
          </label>

          <div className="relative">
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`w-full px-3 py-2.5 bg-white border rounded-xl flex items-center justify-between cursor-pointer shadow-2xs transition-all ${
                isDropdownOpen
                  ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                  : errorWard
                    ? 'border-rose-400 bg-rose-50/20'
                    : 'border-slate-300 hover:border-emerald-400'
              }`}
            >
              <span className={`truncate font-medium ${ward ? 'text-slate-900 font-semibold' : 'text-slate-400'}`}>
                {ward || '-- Chọn Phường / Xã --'}
              </span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
            </div>

            {/* Dropdown Menu Phường / Xã */}
            {isDropdownOpen && (
              <div 
                className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-64 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Ô tìm kiếm nhanh */}
                <div className="p-2 border-b border-slate-100 bg-slate-50 sticky top-0 z-10">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                    <input
                      type="text"
                      autoFocus
                      placeholder={`Tìm Phường / Xã tại ${selectedProvinceName}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-7 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Danh sách các phường / xã */}
                <div className="overflow-y-auto flex-1 p-1 space-y-0.5">
                  {filteredWards.length === 0 ? (
                    <div className="p-3 text-center text-slate-500 text-[11px]">
                      Không tìm thấy "{searchTerm}".
                      <button
                        type="button"
                        onClick={() => handleSelectWard(searchTerm)}
                        className="block mx-auto mt-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        Sử dụng "{searchTerm}"
                      </button>
                    </div>
                  ) : (
                    filteredWards.map((w, idx) => {
                      const isSelected = ward === w;
                      return (
                        <div
                          key={idx}
                          onClick={() => handleSelectWard(w)}
                          className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-emerald-600 text-white font-bold'
                              : 'hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <span className="truncate pr-2">{w}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {errorWard && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errorWard}</p>}
        </div>
      </div>
    </div>
  );
};
