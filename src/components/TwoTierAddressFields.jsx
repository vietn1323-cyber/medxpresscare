import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Search, ChevronDown, Check, X, Building2, Loader2 } from 'lucide-react';
import { VIETNAM_PROVINCES, getWardsForProvince } from '../data/vietnamAdministrative';
import { 
  GHN_PROVINCES, 
  GHN_DISTRICTS, 
  GHN_WARDS, 
  getGhnDistricts, 
  getGhnWards, 
  resolveGhnCodes 
} from '../data/ghnLocationData';
import { fetchGhnProvinces, fetchGhnDistricts, fetchGhnWards } from '../utils/ghnHelper';

/**
 * Component lựa chọn địa chỉ giao hàng chuẩn xác Master Data GHN
 * Sử dụng Fetch API gọi động:
 * - Chọn Tỉnh/Thành phố -> Load động Quận/Huyện (DistrictID)
 * - Chọn Quận/Huyện -> Load động Phường/Xã (WardCode)
 * Bắt buộc giá trị (value) của thẻ select lưu đúng mã định danh DistrictID và WardCode
 */
export const TwoTierAddressFields = ({
  province = 'Thành phố Hà Nội',
  provinceId = null,
  district = '',
  districtId = null,
  ward = '',
  wardCode = '',
  onProvinceChange,
  onDistrictChange,
  onWardChange,
  onWardCodeChange,
  errorProvince = '',
  errorDistrict = '',
  errorWard = '',
  apiKey = '',
  compact = false
}) => {
  const [provincesList, setProvincesList] = useState(GHN_PROVINCES);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableGhnWards, setAvailableGhnWards] = useState([]);
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 1. Xác định ProvinceID và ProvinceName hiện tại
  let currentProvId = provinceId ? Number(provinceId) : null;
  if (!currentProvId && province) {
    const pClean = province.toLowerCase().replace(/^(tỉnh|thành phố|tp\.?)\s+/i, '').trim();
    const matchedP = provincesList.find(p => {
      const gClean = (p.ProvinceName || '').toLowerCase().replace(/^(tỉnh|thành phố|tp\.?)\s+/i, '').trim();
      return gClean === pClean || gClean.includes(pClean) || pClean.includes(gClean);
    }) || VIETNAM_PROVINCES.find(p => {
      const vClean = p.name.toLowerCase().replace(/^(tỉnh|thành phố|tp\.?)\s+/i, '').trim();
      return vClean === pClean || p.shortName.toLowerCase() === pClean;
    });

    if (matchedP) {
      currentProvId = matchedP.ProvinceID || 201;
    }
  }
  const selectedProvinceId = currentProvId || 201;

  const matchedProvObj = provincesList.find(p => p.ProvinceID === selectedProvinceId) ||
    VIETNAM_PROVINCES.find(p => p.name === province || p.shortName === province);
  const selectedProvinceName = matchedProvObj 
    ? (matchedProvObj.ProvinceName || matchedProvObj.name) 
    : (province || 'Thành phố Hà Nội');

  // Fallback wards cho backwards compatibility với các test suite
  const fallbackWards = getWardsForProvince(selectedProvinceName);

  // 2. Tải Tỉnh/Thành phố từ Master Data API GHN khi khởi tạo
  useEffect(() => {
    let isMounted = true;
    async function loadMasterProvinces() {
      try {
        const data = await fetchGhnProvinces(apiKey);
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setProvincesList(data);
        }
      } catch (err) {
        // Giữ danh sách ban đầu
      }
    }
    loadMasterProvinces();
    return () => { isMounted = false; };
  }, [apiKey]);

  // 3. Tải động Quận/Huyện từ GHN Master Data API theo selectedProvinceId
  useEffect(() => {
    if (!selectedProvinceId) {
      setAvailableDistricts([]);
      return;
    }

    let isMounted = true;
    async function loadMasterDistricts() {
      setIsLoadingDistricts(true);
      try {
        const data = await fetchGhnDistricts(selectedProvinceId, apiKey);
        if (isMounted) {
          const list = (Array.isArray(data) && data.length > 0) ? data : getGhnDistricts(selectedProvinceId);
          setAvailableDistricts(list);
        }
      } catch (err) {
        if (isMounted) {
          setAvailableDistricts(getGhnDistricts(selectedProvinceId));
        }
      } finally {
        if (isMounted) setIsLoadingDistricts(false);
      }
    }

    loadMasterDistricts();
    return () => { isMounted = false; };
  }, [selectedProvinceId, apiKey]);

  // 4. Tải động Phường/Xã từ GHN Master Data API theo to_district_id
  useEffect(() => {
    if (!districtId) {
      setAvailableGhnWards([]);
      return;
    }

    let isMounted = true;
    async function loadMasterWards() {
      setIsLoadingWards(true);
      try {
        const data = await fetchGhnWards(Number(districtId), apiKey);
        if (isMounted) {
          const list = (Array.isArray(data) && data.length > 0) ? data : getGhnWards(districtId);
          setAvailableGhnWards(list);
        }
      } catch (err) {
        if (isMounted) {
          setAvailableGhnWards(getGhnWards(districtId));
        }
      } finally {
        if (isMounted) setIsLoadingWards(false);
      }
    }

    loadMasterWards();
    return () => { isMounted = false; };
  }, [districtId, apiKey]);

  // 5. Lọc Phường/Xã theo từ khóa tìm kiếm nhanh
  const filteredWards = availableGhnWards.filter(w => 
    (w.WardName || '').toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
    String(w.WardCode || '').toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Reset tìm kiếm khi đổi tỉnh hoặc quận
  useEffect(() => {
    setSearchTerm('');
  }, [selectedProvinceId, districtId]);

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

  // Xử lý khi người dùng chọn Tỉnh / Thành phố
  const handleProvinceChange = (e) => {
    const val = e.target.value;
    if (!val) {
      if (onProvinceChange) onProvinceChange('', null);
      if (onDistrictChange) onDistrictChange('', null);
      if (onWardChange) onWardChange('', '', null, '');
      if (onWardCodeChange) onWardCodeChange('');
      return;
    }

    const pId = Number(val);
    const matchedP = provincesList.find(p => p.ProvinceID === pId) || 
      VIETNAM_PROVINCES.find(p => p.name === val || p.id === val);
    const pName = matchedP ? (matchedP.ProvinceName || matchedP.name) : val;

    if (onProvinceChange) onProvinceChange(pName, pId);
    // Khi đổi Tỉnh, bắt buộc reset Quận và Phường để người dùng chọn lại
    if (onDistrictChange) onDistrictChange('', null);
    if (onWardChange) onWardChange('', '', null, '');
    if (onWardCodeChange) onWardCodeChange('');
  };

  // Xử lý khi người dùng chọn Quận / Huyện (Lưu mã số định danh DistrictID)
  const handleDistrictChange = (e) => {
    const val = e.target.value;
    if (!val) {
      if (onDistrictChange) onDistrictChange('', null);
      if (onWardChange) onWardChange('', '', null, '');
      if (onWardCodeChange) onWardCodeChange('');
      return;
    }

    const distId = Number(val);
    const matchedD = availableDistricts.find(d => Number(d.DistrictID) === distId) || {
      DistrictID: distId,
      DistrictName: e.target.options[e.target.selectedIndex]?.text || ''
    };

    if (onDistrictChange) onDistrictChange(matchedD.DistrictName, matchedD.DistrictID);
    // Khi đổi Quận, reset Phường để tải động danh sách phường mới
    if (onWardChange) onWardChange('', '', matchedD.DistrictID, matchedD.DistrictName);
    if (onWardCodeChange) onWardCodeChange('');
  };

  // Xử lý khi người dùng chọn Phường / Xã (Lưu mã số định danh WardCode)
  const handleWardSelect = (wardCodeVal) => {
    if (!wardCodeVal) {
      if (onWardChange) onWardChange('', '', districtId, district);
      if (onWardCodeChange) onWardCodeChange('');
      return;
    }

    const matchedW = availableGhnWards.find(w => String(w.WardCode) === String(wardCodeVal));
    const wardNameVal = matchedW ? matchedW.WardName : wardCodeVal;
    const finalCode = String(wardCodeVal);

    if (onWardChange) onWardChange(wardNameVal, finalCode, districtId, district);
    if (onWardCodeChange) onWardCodeChange(finalCode);

    setIsDropdownOpen(false);
    setSearchTerm('');
  };

  // Ward Code hiện tại đang chọn
  const currentWardCode = wardCode ? String(wardCode) : '';
  const currentDistrictId = districtId ? Number(districtId) : '';

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
            value={selectedProvinceId || ''}
            onChange={handleProvinceChange}
            className={`w-full px-3 py-2.5 bg-white border rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-all cursor-pointer ${
              errorProvince ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
            }`}
          >
            <option value="">-- Chọn Tỉnh / Thành phố --</option>
            {provincesList.map((p) => (
              <option key={p.ProvinceID || p.id} value={p.ProvinceID || p.name}>
                {p.ProvinceName || p.name}
              </option>
            ))}
          </select>
          {errorProvince && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errorProvince}</p>}
        </div>

        {/* 2. QUẬN / HUYỆN (Bắt buộc value là mã số định danh DistrictID) */}
        <div>
          <label className="block text-slate-700 font-bold mb-1">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Quận / Huyện</span>
              <span className="text-rose-500">*</span>
            </span>
          </label>
          <div className="relative">
            <select
              value={currentDistrictId}
              onChange={handleDistrictChange}
              disabled={!selectedProvinceId || isLoadingDistricts}
              className={`w-full px-3 py-2.5 bg-white border rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 ${
                errorDistrict ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            >
              <option value="">
                {isLoadingDistricts ? '⏳ Đang tải danh sách Quận/Huyện...' : '-- Chọn Quận / Huyện --'}
              </option>
              {availableDistricts.map((d) => (
                <option key={d.DistrictID} value={d.DistrictID}>
                  {d.DistrictName}
                </option>
              ))}
            </select>
            {isLoadingDistricts && (
              <div className="absolute right-8 top-3 text-emerald-600">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>
          {errorDistrict && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errorDistrict}</p>}
        </div>

        {/* 3. PHƯỜNG / XÃ (Bắt buộc value là mã số định danh WardCode) */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-slate-700 font-bold">
              <span className="flex items-center gap-1">
                <span>Phường / Xã</span>
                <span className="text-rose-500">*</span>
              </span>
            </label>
            {availableGhnWards.length > 8 && (
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-[10px] text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-0.5 cursor-pointer"
              >
                <Search className="w-3 h-3" />
                <span>{isDropdownOpen ? 'Chọn nhanh' : 'Tìm kiếm'}</span>
              </button>
            )}
          </div>

          {/* Ô tìm kiếm nhanh khi danh sách phường xã dài */}
          {isDropdownOpen && (
            <div className="mb-1.5 relative">
              <input
                type="text"
                placeholder="Gõ tên Phường / Xã để lọc nhanh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 bg-slate-50 border border-emerald-400 rounded-lg text-xs font-semibold focus:outline-none focus:bg-white focus:ring-1 focus:ring-emerald-500"
                autoFocus
              />
              <Search className="w-3.5 h-3.5 text-emerald-600 absolute left-2 top-2" />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Native HTML Select với các thẻ <option value="Mã_WardCode"> chuẩn theo yêu cầu của GHN */}
          <div className="relative">
            <select
              value={currentWardCode}
              onChange={(e) => handleWardSelect(e.target.value)}
              disabled={!districtId || isLoadingWards}
              className={`w-full px-3 py-2.5 bg-white border rounded-xl font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 ${
                errorWard ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            >
              <option value="">
                {isLoadingWards ? '⏳ Đang tải danh sách Phường/Xã...' : '-- Chọn Phường / Xã --'}
              </option>
              {filteredWards.map((w) => (
                <option key={w.WardCode} value={w.WardCode}>
                  {w.WardName}
                </option>
              ))}
            </select>
            {isLoadingWards && (
              <div className="absolute right-8 top-3 text-emerald-600">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            )}
          </div>

          {errorWard && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errorWard}</p>}
        </div>
      </div>
    </div>
  );
};
