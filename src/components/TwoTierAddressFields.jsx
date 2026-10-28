import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ChevronDown, Check, X, Building2 } from 'lucide-react';
import { VIETNAM_PROVINCES, getWardsForProvince } from '../data/vietnamAdministrative';
import { 
  GHN_PROVINCES, 
  GHN_DISTRICTS, 
  GHN_WARDS, 
  getGhnDistricts, 
  getGhnWards, 
  resolveGhnCodes 
} from '../data/ghnLocationData';

/**
 * Component lựa chọn địa chỉ giao hàng chuẩn xác, tinh gọn
 * Đồng bộ Master Data GHN (to_district_id, to_ward_code) & Danh mục 34 Tỉnh mới
 * Thẻ <option value="Mã_WardCode"> trực tiếp truyền mã chuẩn vào payload GHN
 */
export const TwoTierAddressFields = ({
  province = 'Thành phố Hà Nội',
  district = '',
  districtId = null,
  ward = '',
  wardCode = '',
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  onWardCodeChange,
  errorWard = '',
  compact = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Tìm tỉnh thành
  const matchedProvince = VIETNAM_PROVINCES.find(p => 
    p.name === province || 
    p.shortName === province ||
    p.name.toLowerCase() === (province || '').toLowerCase() ||
    p.shortName.toLowerCase() === (province || '').toLowerCase() ||
    (province && p.name.toLowerCase().includes(province.toLowerCase()))
  );
  const selectedProvinceName = matchedProvince ? matchedProvince.name : (province || VIETNAM_PROVINCES[0]?.name || 'Thành phố Hà Nội');

  // Danh sách Quận/Huyện theo Tỉnh từ GHN Master Data
  const availableDistricts = getGhnDistricts(selectedProvinceName);

  // Xác định Quận/Huyện đang chọn
  let currentDistrict = null;
  if (districtId) {
    currentDistrict = availableDistricts.find(d => Number(d.DistrictID) === Number(districtId));
  }
  if (!currentDistrict && district) {
    const cleanDist = district.toLowerCase().replace(/^(quận|huyện|thị xã|thành phố)\s+/i, '').trim();
    currentDistrict = availableDistricts.find(d => {
      const dClean = d.DistrictName.toLowerCase().replace(/^(quận|huyện|thị xã|thành phố)\s+/i, '').trim();
      return dClean === cleanDist || dClean.includes(cleanDist) || cleanDist.includes(dClean);
    });
  }
  if (!currentDistrict && availableDistricts.length > 0) {
    currentDistrict = availableDistricts[0];
  }
  const selectedDistrictId = currentDistrict ? currentDistrict.DistrictID : 1442;
  const selectedDistrictName = currentDistrict ? currentDistrict.DistrictName : (district || 'Quận Cầu Giấy');

  // Danh sách Xã/Phường theo to_district_id kèm WardCode chuẩn GHN
  const availableGhnWards = getGhnWards(selectedDistrictId);
  // Danh sách fallback xã/phường cho backwards compatibility
  const fallbackWards = getWardsForProvince(selectedProvinceName);

  // Lọc theo từ khóa tìm kiếm
  const filteredWards = availableGhnWards.filter(w => 
    w.WardName.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    w.WardCode.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Reset tìm kiếm khi đổi tỉnh hoặc quận
  useEffect(() => {
    setSearchTerm('');
  }, [province, selectedDistrictId]);

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

  const handleProvinceChange = (newProv) => {
    if (onProvinceChange) onProvinceChange(newProv);
    const newDistricts = getGhnDistricts(newProv);
    const firstDist = newDistricts[0] || { DistrictID: 1442, DistrictName: 'Quận Cầu Giấy' };
    const newWards = getGhnWards(firstDist.DistrictID);
    const firstWard = newWards[0] || { WardCode: '20314', WardName: 'Phường Dịch Vọng Hậu' };

    if (onDistrictChange) onDistrictChange(firstDist.DistrictName, firstDist.DistrictID);
    if (onWardChange) onWardChange(firstWard.WardName, firstWard.WardCode, firstDist.DistrictID, firstDist.DistrictName);
    if (onWardCodeChange) onWardCodeChange(firstWard.WardCode);
  };

  const handleDistrictChange = (e) => {
    const distId = Number(e.target.value);
    const matchedD = availableDistricts.find(d => d.DistrictID === distId) || { DistrictID: distId, DistrictName: e.target.options[e.target.selectedIndex]?.text || '' };
    const newWards = getGhnWards(distId);
    const firstWard = newWards[0] || { WardCode: '20314', WardName: '' };

    if (onDistrictChange) onDistrictChange(matchedD.DistrictName, matchedD.DistrictID);
    if (onWardChange) onWardChange(firstWard.WardName, firstWard.WardCode, matchedD.DistrictID, matchedD.DistrictName);
    if (onWardCodeChange) onWardCodeChange(firstWard.WardCode);
  };

  const handleWardSelect = (wardCodeVal) => {
    const matchedW = availableGhnWards.find(w => String(w.WardCode) === String(wardCodeVal));
    const wardNameVal = matchedW ? matchedW.WardName : wardCodeVal;
    const finalCode = matchedW ? matchedW.WardCode : (wardCodeVal || '20314');

    if (onWardChange) onWardChange(wardNameVal, finalCode, selectedDistrictId, selectedDistrictName);
    if (onWardCodeChange) onWardCodeChange(finalCode);
    if (onDistrictChange && !district) onDistrictChange(selectedDistrictName, selectedDistrictId);

    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  // Ward Code đang chọn
  const currentWardCode = wardCode || (availableGhnWards.find(w => w.WardName === ward)?.WardCode) || (availableGhnWards[0]?.WardCode || '20314');

  return (
    <div className={`space-y-3 ${compact ? 'text-xs' : 'text-xs'}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {/* 1. TỈNH / THÀNH PHỐ */}
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
            onChange={(e) => handleProvinceChange(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-all cursor-pointer"
          >
            {VIETNAM_PROVINCES.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2. QUẬN / HUYỆN (to_district_id Master Data GHN) */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quận / Huyện</span>
              <span className="text-rose-500">*</span>
            </span>
          </label>
          <select
            value={selectedDistrictId}
            onChange={handleDistrictChange}
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-all cursor-pointer"
          >
            {availableDistricts.map((d) => (
              <option key={d.DistrictID} value={d.DistrictID}>
                {d.DistrictName}
              </option>
            ))}
          </select>
        </div>

        {/* 3. PHƯỜNG / XÃ (Dropdown động theo to_district_id với thẻ <option value="Mã_WardCode">) */}
        <div className="relative" ref={dropdownRef}>
          <label className="block text-slate-700 font-bold mb-1">
            <span className="flex items-center gap-1">
              <span>Phường / Xã</span>
              <span className="text-rose-500">*</span>
            </span>
          </label>

          {/* Native HTML Select với các thẻ <option value="Mã_WardCode"> chuẩn theo yêu cầu của GHN */}
          <select
            value={currentWardCode}
            onChange={(e) => handleWardSelect(e.target.value)}
            className={`w-full px-3 py-2.5 bg-white border rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs transition-all cursor-pointer ${
              errorWard ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
            }`}
          >
            <option value="">-- Chọn Phường / Xã --</option>
            {availableGhnWards.map((w) => (
              <option key={w.WardCode} value={w.WardCode}>
                {w.WardName}
              </option>
            ))}
          </select>

          {errorWard && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errorWard}</p>}
        </div>
      </div>
    </div>
  );
};
