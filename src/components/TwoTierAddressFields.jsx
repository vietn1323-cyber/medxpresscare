import React, { useState, useEffect } from 'react';
import { MapPin, Search, ChevronDown, Check, Edit3, List, Sparkles } from 'lucide-react';
import { VIETNAM_PROVINCES, VIETNAM_WARDS_BY_PROVINCE, getWardsForProvince } from '../data/vietnamAdministrative';

/**
 * Component Địa Chỉ 2 Cấp Hành Chính Việt Nam
 * Cấp 1: Tỉnh / Thành phố (Đầy đủ các tỉnh/thành phố mới và hiện hữu)
 * Cấp 2: Xã / Phường / Thị trấn (Cập nhật sau sáp nhập theo mô hình 2 cấp)
 */
export const TwoTierAddressFields = ({
  province = 'Hà Nội',
  ward = '',
  onProvinceChange,
  onWardChange,
  errorWard = '',
  compact = false
}) => {
  const [isManualInput, setIsManualInput] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const availableWards = getWardsForProvince(province);

  // Lọc xã phường theo từ khóa tìm kiếm
  const filteredWards = availableWards.filter(w => 
    w.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Các xã phường mới sáp nhập gợi ý nhanh (có chữ mới sáp nhập hoặc top 4)
  const quickWards = availableWards
    .filter(w => w.includes('mới sáp nhập') || w.includes('mới thành lập'))
    .slice(0, 4);

  // Nếu không có phường có tag mới sáp nhập thì lấy 4 phường đầu tiên
  const displayQuickWards = quickWards.length > 0 ? quickWards : availableWards.slice(0, 4);

  // Khi đổi tỉnh thành, reset tìm kiếm
  useEffect(() => {
    setSearchTerm('');
  }, [province]);

  const handleSelectWard = (selectedWard) => {
    onWardChange(selectedWard);
    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  return (
    <div className={`space-y-3 ${compact ? 'text-xs' : 'text-xs'}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* CẤP 1: TỈNH / THÀNH PHỐ */}
        <div>
          <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tỉnh / Thành phố (Cấp 1)</span>
              <span className="text-rose-500">*</span>
            </span>
            <span className="text-[10px] text-emerald-700 font-medium hidden sm:inline">
              Mô hình 2 cấp mới
            </span>
          </label>

          <select
            value={province}
            onChange={(e) => {
              const newProv = e.target.value;
              onProvinceChange(newProv);
              onWardChange(''); // reset xã/phường khi đổi tỉnh
            }}
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-all cursor-pointer"
          >
            <optgroup label="⭐ Đô Thị Lớn & Thành Phố Trực Thuộc TW">
              {VIETNAM_PROVINCES.slice(0, 6).map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name} {p.note ? `(${p.note})` : ''}
                </option>
              ))}
            </optgroup>

            <optgroup label="Khu Vực Đồng Bằng Sông Hồng & Bắc Bộ">
              {VIETNAM_PROVINCES.slice(6, 29).map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </optgroup>

            <optgroup label="Khu Vực Miền Trung & Duyên Hải">
              {VIETNAM_PROVINCES.slice(29, 41).map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </optgroup>

            <optgroup label="Khu Vực Tây Nguyên">
              {VIETNAM_PROVINCES.slice(41, 46).map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </optgroup>

            <optgroup label="Khu Vực Đông Nam Bộ & Nam Bộ">
              {VIETNAM_PROVINCES.slice(46).map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>

        {/* CẤP 2: XÃ / PHƯỜNG / THỊ TRẤN SAU SÁP NHẬP */}
        <div className="relative">
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-700 font-bold flex items-center gap-1">
              <span>Xã / Phường / Thị trấn (Cấp 2)</span>
              <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setIsManualInput(!isManualInput);
                setIsDropdownOpen(false);
              }}
              className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 transition-colors cursor-pointer"
            >
              {isManualInput ? (
                <>
                  <List className="w-3 h-3" />
                  <span>Chọn danh sách</span>
                </>
              ) : (
                <>
                  <Edit3 className="w-3 h-3" />
                  <span>Tự nhập</span>
                </>
              )}
            </button>
          </div>

          {isManualInput ? (
            /* Chế độ nhập tự do */
            <div>
              <input
                type="text"
                placeholder="Nhập tên Xã, Phường hoặc Thị trấn..."
                value={ward}
                onChange={(e) => onWardChange(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
              />
            </div>
          ) : (
            /* Chế độ chọn danh sách Xã/Phường sau sáp nhập */
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
                  {ward || '-- Chọn Xã / Phường sau sáp nhập --'}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ${isDropdownOpen ? 'rotate-180 text-emerald-600' : ''}`} />
              </div>

              {/* Dropdown Menu Xã/Phường */}
              {isDropdownOpen && (
                <div 
                  className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 max-h-64 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Ô tìm kiếm nhanh */}
                  <div className="p-2 border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        autoFocus
                        placeholder={`Tìm xã/phường tại ${province}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Danh sách các xã phường */}
                  <div className="overflow-y-auto flex-1 p-1 space-y-0.5">
                    {filteredWards.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 text-[11px]">
                        Không tìm thấy xã/phường "{searchTerm}".
                        <button
                          type="button"
                          onClick={() => {
                            onWardChange(searchTerm);
                            setIsDropdownOpen(false);
                          }}
                          className="block mx-auto mt-1 text-emerald-700 font-bold underline"
                        >
                          Dùng tên "{searchTerm}"
                        </button>
                      </div>
                    ) : (
                      filteredWards.map((w, idx) => {
                        const isSelected = ward === w;
                        const isMerged = w.includes('mới sáp nhập') || w.includes('mới thành lập');
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
                            {isMerged && !isSelected && (
                              <span className="text-[9px] font-extrabold px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded shrink-0">
                                Mới
                              </span>
                            )}
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Nút tùy chọn tự nhập ở đáy dropdown */}
                  <div className="p-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Chưa tìm thấy xã/phường?</span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsManualInput(true);
                        setIsDropdownOpen(false);
                      }}
                      className="text-emerald-700 font-bold hover:underline"
                    >
                      Tự gõ tay
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {errorWard && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errorWard}</p>}
        </div>
      </div>

      {/* Gợi ý chọn nhanh các xã phường mới sáp nhập tiêu biểu */}
      {!isManualInput && displayQuickWards.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>Gợi ý nhanh {province}:</span>
          </span>
          {displayQuickWards.map((qw, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onWardChange(qw)}
              className={`text-[10px] px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                ward === qw
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold shadow-2xs'
                  : 'bg-slate-100/80 hover:bg-slate-200 border-slate-200 text-slate-700'
              }`}
            >
              {qw.replace(' (mới sáp nhập)', ' ⭐').replace(' (mới thành lập)', ' ⭐')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
