// Tiện ích xử lý Nhập (Import) & Xuất (Export) file CSV / JSON hỗ trợ tiếng Việt có dấu chuẩn UTF-8 (Excel)

// Helper chuẩn hóa chuỗi tiêu đề tiếng Việt loại bỏ dấu và ký tự đặc biệt
export const normalizeKey = (str) => {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
};

// Helper làm sạch giá tiền từ file CSV/Excel (ví dụ: "350.000", "350,000", "350.000₫", 350000)
export const cleanPrice = (val, defaultVal = 0) => {
  if (val === null || val === undefined || val === '') return defaultVal;
  if (typeof val === 'number') return isNaN(val) ? defaultVal : Math.round(val);
  const str = String(val).trim();
  const digits = str.replace(/[^\d]/g, '');
  if (!digits) return defaultVal;
  const num = parseInt(digits, 10);
  return isNaN(num) ? defaultVal : num;
};

// Tạo file CSV với tiền tố UTF-8 BOM (\uFEFF) để Excel mở tiếng Việt không bị lỗi font
export const downloadCSV = (arg1, arg2, arg3) => {
  let filename = 'export.csv';
  let headers = [];
  let rows = [];

  // Hỗ trợ linh hoạt cả 2 chuẩn gọi:
  // Chuẩn 1: downloadCSV(filename, headers, rows)
  // Chuẩn 2: downloadCSV(headers, rows, filename)
  if (typeof arg1 === 'string') {
    filename = arg1;
    headers = Array.isArray(arg2) ? arg2 : [];
    rows = Array.isArray(arg3) ? arg3 : [];
  } else if (Array.isArray(arg1)) {
    headers = arg1;
    rows = Array.isArray(arg2) ? arg2 : [];
    filename = typeof arg3 === 'string' ? arg3 : 'export.csv';
  }

  const escapeCell = (val) => {
    if (val === null || val === undefined) return '""';
    let str = String(val);
    // [SEC-PATCH: MXC-SEC-12] Phòng chống CSV Formula Injection (CWE-1236)
    if (/^[=+\-@\t\r]/.test(str)) {
      str = "'" + str;
    }
    return `"${str.replace(/"/g, '""')}"`;
  };

  const headerRow = headers.map(h => escapeCell(h?.label || h?.key || h)).join(',');
  const dataRows = rows.map(row => {
    // Nếu row là mảng con (array of arrays):
    if (Array.isArray(row)) {
      return row.map(cell => escapeCell(cell)).join(',');
    }
    // Nếu row là object:
    if (row && typeof row === 'object') {
      return headers.map(h => {
        const key = h?.key || h;
        return escapeCell(row[key]);
      }).join(',');
    }
    return escapeCell(row);
  });

  const csvContent = '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Tải file JSON
export const downloadJSON = (filename, data) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename.endsWith('.json') ? filename : `${filename}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Parser CSV hỗ trợ phân cách dấu phẩy, dấu chấm phẩy, tab, nháy kép đa dòng
export const parseCSV = (csvText) => {
  if (!csvText) return [];
  const clean = csvText.replace(/^\uFEFF/, '').trim();
  if (!clean) return [];

  // Tách các dòng nhưng bảo vệ xuống dòng bên trong dấu ngoặc kép
  const lines = [];
  let currentLine = '';
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if ((char === '\n' || (char === '\r' && clean[i + 1] === '\n')) && !inQuotes) {
      if (char === '\r') i++;
      lines.push(currentLine);
      currentLine = '';
    } else if (char === '\r' && !inQuotes) {
      lines.push(currentLine);
      currentLine = '';
    } else {
      currentLine += char;
    }
  }
  if (currentLine) lines.push(currentLine);

  if (lines.length < 2) return [];

  // Xác định dấu phân cách (, hoặc ; hoặc \t) ngoài dấu ngoặc kép
  const firstLine = lines[0];
  let commaCount = 0;
  let semiCount = 0;
  let tabCount = 0;
  let inQ = false;
  for (let c of firstLine) {
    if (c === '"') inQ = !inQ;
    if (!inQ) {
      if (c === ',') commaCount++;
      else if (c === ';') semiCount++;
      else if (c === '\t') tabCount++;
    }
  }

  let delimiter = ',';
  if (tabCount > commaCount && tabCount > semiCount) {
    delimiter = '\t';
  } else if (semiCount > commaCount) {
    delimiter = ';';
  }

  // Hàm làm sạch ô và bỏ ngoặc kép bao ngoài
  const cleanCell = (str) => {
    if (!str) return '';
    let val = str.trim();
    if (val.startsWith('"') && val.endsWith('"') && val.length >= 2) {
      val = val.slice(1, -1).replace(/""/g, '"').trim();
    }
    return val;
  };

  // Hàm tách 1 dòng thành các cột
  const parseRow = (line) => {
    const cells = [];
    let currentCell = '';
    let insideQuote = false;

    for (let j = 0; j < line.length; j++) {
      const c = line[j];
      if (c === '"') {
        if (insideQuote && line[j + 1] === '"') {
          currentCell += '"';
          j++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (c === delimiter && !insideQuote) {
        cells.push(cleanCell(currentCell));
        currentCell = '';
      } else {
        currentCell += c;
      }
    }
    cells.push(cleanCell(currentCell));
    return cells;
  };

  const rawHeaders = parseRow(lines[0]);
  const parsedData = [];

  for (let k = 1; k < lines.length; k++) {
    const rowLine = lines[k].trim();
    if (!rowLine) continue;
    const values = parseRow(rowLine);
    if (values.every(v => !v)) continue; // Bỏ qua dòng hoàn toàn rỗng

    const rowObj = {};
    rawHeaders.forEach((rawH, idx) => {
      const val = values[idx] !== undefined ? values[idx] : '';
      const rawTrim = rawH.trim();
      const lower = rawTrim.toLowerCase();
      const norm = normalizeKey(rawTrim);
      const noUnder = norm.replace(/_/g, '');

      // Lưu dưới cả 4 dạng key để tương thích mọi trường hợp
      rowObj[rawTrim] = val;
      rowObj[lower] = val;
      rowObj[norm] = val;
      rowObj[noUnder] = val;

      // Map tự động sang các field chuẩn trong hệ thống MedXpressCare:
      // Tên sản phẩm
      if (['name', 'ten_san_pham', 'tensanpham', 'ten_sp', 'tensp', 'ten_thuoc', 'san_pham'].includes(norm) || norm.includes('ten_san_pham') || norm.includes('tensanpham')) {
        rowObj.name = val;
        rowObj.ten_san_pham = val;
      }
      // Thương hiệu
      if (['brand', 'thuong_hieu', 'thuonghieu', 'hang_san_xuat', 'nha_san_xuat', 'hang'].includes(norm)) {
        rowObj.brand = val;
        rowObj.thuong_hieu = val;
      }
      // Giá bán
      if (['price', 'gia_ban', 'giaban', 'gia', 'don_gia'].includes(norm) || (norm.includes('gia') && !norm.includes('goc') && !norm.includes('niem_yet'))) {
        rowObj.price = val;
        rowObj.gia_ban = val;
      }
      // Giá gốc / Giá niêm yết
      if (['originalprice', 'original_price', 'gia_goc', 'giagoc', 'gia_niem_yet', 'gianiemyet'].includes(norm)) {
        rowObj.originalPrice = val;
        rowObj.gia_goc = val;
      }
      // Giảm giá %
      if (['discount', 'discountpercent', 'discount_percent', 'giam_gia', 'giamgia', 'phan_tram_giam'].includes(norm)) {
        rowObj.discountPercent = val;
        rowObj.giam_gia = val;
      }
      // Xuất xứ nội địa / nhập khẩu
      if (['origintype', 'origin_type', 'xuat_xu_noi_dia_hay_nhap_khau', 'xuat_xu_noi_dia_nhap_khau', 'loai_xuat_xu', 'phan_loai_xuat_xu'].includes(norm)) {
        rowObj.originType = val;
        rowObj.xuat_xu_noi_dia_hay_nhap_khau = val;
      }
      // Quốc gia / Nước sản xuất
      if (['countryname', 'country_name', 'quoc_gia', 'quocgia', 'nuoc_san_xuat', 'xuat_xu', 'xuatxu', 'origin'].includes(norm)) {
        rowObj.countryName = val;
        rowObj.quoc_gia = val;
        rowObj.origin = val;
      }
      // Số ĐKSP Bộ Y Tế
      if (['regnumber', 'reg_number', 'so_dksp', 'sodksp', 'so_dang_ky', 'sodangky', 'so_cb', 'giay_phep'].includes(norm) || norm.includes('so_dksp') || norm.includes('dksp')) {
        rowObj.regNumber = val;
        rowObj.regnumber = val;
        rowObj.so_dksp = val;
      }
      // Quy cách đóng gói
      if (['packaging', 'quy_cach_dong_goi', 'quycachdonggoi', 'quy_cach', 'quycach', 'dong_goi'].includes(norm)) {
        rowObj.packaging = val;
        rowObj.quy_cach_dong_goi = val;
      }
      // Mô tả ngắn
      if (['shortdesc', 'short_desc', 'mo_ta_ngan', 'motangan', 'mo_ta', 'mota', 'gioi_thieu'].includes(norm)) {
        rowObj.shortDesc = val;
        rowObj.mo_ta_ngan = val;
      }
      // Hướng dẫn sử dụng / Liều dùng
      if (['usage', 'lieu_dung_huong_dan', 'lieudunghuongdan', 'lieu_dung', 'lieudung', 'huong_dan_su_dung', 'huong_dan'].includes(norm)) {
        rowObj.usage = val;
        rowObj.lieu_dung_huong_dan = val;
      }
      // Nhóm danh mục / Công dụng / Bệnh lý (cho phép nhiều nhóm)
      if (['category', 'categories', 'danh_muc', 'danhmuc', 'nhom_san_pham', 'cong_dung', 'nhom_cong_dung', 'nhom_suc_khoe', 'nhom_suc_khoe_benh_ly', 'benh_ly'].includes(norm)) {
        rowObj.category = val;
        rowObj.categories = val;
      }
      // Dạng bào chế
      if (['dosageform', 'dosage_form', 'dang_bao_che', 'dangbaoche', 'dang_thuoc'].includes(norm)) {
        rowObj.dosageForm = val;
      }
      // Đối tượng sử dụng
      if (['targetaudience', 'target_audience', 'doi_tuong_su_dung', 'doi_tuong'].includes(norm)) {
        rowObj.targetAudience = val;
      }
      // Công ty công bố (ĐKSP)
      if (['applicant', 'cong_ty_cong_bo', 'congtycongbo', 'cong_ty', 'congty', 'doanh_nghiep'].includes(norm)) {
        rowObj.applicant = val;
        rowObj.cong_ty_cong_bo = val;
      }
      // Ngày cấp (ĐKSP)
      if (['date', 'ngay_cap', 'ngaycap', 'nam_cap'].includes(norm)) {
        rowObj.date = val;
        rowObj.ngay_cap = val;
      }
      // Tiêu chuẩn kiểm định (ĐKSP)
      if (['inspectstandard', 'inspect_standard', 'tieu_chuan_kiem_dinh', 'tieuchuankiemdinh', 'tieu_chuan'].includes(norm)) {
        rowObj.inspectStandard = val;
        rowObj.tieu_chuan_kiem_dinh = val;
      }
      // Trạng thái (ĐKSP)
      if (['status', 'trang_thai', 'trangthai'].includes(norm)) {
        rowObj.status = val;
        rowObj.trang_thai = val;
      }
      // Hình ảnh
      if (['image', 'anh', 'hinh_anh', 'hinhanh', 'link_anh'].includes(norm)) {
        rowObj.image = val;
      }
    });

    parsedData.push(rowObj);
  }

  return parsedData;
};
