import React, { useState, useRef } from 'react';
import { 
  X, UploadCloud, FileText, CheckCircle2, AlertCircle, 
  Download, ArrowRight, Table, Sparkles, RefreshCw 
} from 'lucide-react';
import { parseCSV, downloadCSV, downloadJSON, cleanPrice } from '../utils/csvHelper';

export const BulkImportModal = ({ 
  isOpen, 
  onClose, 
  type = 'registrations', // 'registrations' | 'products'
  onConfirmImport,
  onImportProducts,
  onImportRegistrations
}) => {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [parseError, setParseError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const isReg = type === 'registrations';

  // Tải file mẫu CSV
  const handleDownloadTemplateCSV = () => {
    if (isReg) {
      const headers = [
        { key: 'regNumber', label: 'So_DKSP' },
        { key: 'name', label: 'Ten_San_Pham' },
        { key: 'applicant', label: 'Cong_Ty_Cong_Bo' },
        { key: 'date', label: 'Ngay_Cap' },
        { key: 'type', label: 'Loai_Hang' },
        { key: 'inspectStandard', label: 'Tieu_Chuan_Kiem_Dinh' },
        { key: 'origin', label: 'Xuat_Xu' },
        { key: 'status', label: 'Trang_Thai' }
      ];
      const sampleRows = [
        {
          regNumber: '10238/2019/ĐKSP',
          name: 'Viên Khớp Bách Niên Kiện',
          applicant: 'Công ty Cổ phần Công nghệ Dược phẩm Lotus',
          date: '28/08/2019',
          type: 'Thực phẩm bảo vệ sức khỏe Nội Địa',
          inspectStandard: 'GMP-WHO Bộ Y Tế',
          origin: 'Việt Nam',
          status: 'Đã cấp phép lưu hành toàn quốc'
        },
        {
          regNumber: '3721/2021/ĐKSP',
          name: 'Kirkland Glucosamine HCL 1500mg with MSM',
          applicant: 'Công ty TNHH Nhập Khẩu Quốc Tế MedXpress',
          date: '15/04/2021',
          type: 'Thực phẩm bảo vệ sức khỏe Nhập Khẩu',
          inspectStandard: 'USP & FDA Hoa Kỳ / Cục ATTP Bộ Y Tế',
          origin: 'Mỹ',
          status: 'Đã cấp phép & thông quan Hải quan chính ngạch'
        },
        {
          regNumber: '8954/2023/ĐKSP',
          name: 'Sâm Ngọc Linh Mật Ong Rừng OCOP',
          applicant: 'Công ty Cổ phần Dược Liệu Kon Tum',
          date: '12/10/2023',
          type: 'Thực phẩm bảo vệ sức khỏe Nội Địa',
          inspectStandard: 'OCOP 5 Sao & GMP-WHO',
          origin: 'Việt Nam',
          status: 'Đã cấp phép lưu hành toàn quốc'
        }
      ];
      downloadCSV('Mau_So_DKSP_MedXpress.csv', headers, sampleRows);
    } else {
      // Mẫu sản phẩm
      const headers = [
        { key: 'name', label: 'Ten_San_Pham' },
        { key: 'brand', label: 'Thuong_Hieu' },
        { key: 'price', label: 'Gia_Ban' },
        { key: 'originalPrice', label: 'Gia_Goc' },
        { key: 'categories', label: 'Nhom_Suc_Khoe_Benh_Ly' },
        { key: 'originType', label: 'Xuat_Xu_Noi_Dia_Hay_Nhap_Khau' },
        { key: 'countryName', label: 'Quoc_Gia' },
        { key: 'regNumber', label: 'So_DKSP' },
        { key: 'packaging', label: 'Quy_Cach_Dong_Goi' },
        { key: 'shortDesc', label: 'Mo_Ta_Ngan' },
        { key: 'usage', label: 'Lieu_Dung_Huong_Dan' }
      ];
      const sampleRows = [
        {
          name: 'Viên Uống Bổ Não & Sáng Mắt Ginkgo Biloba with Lutein',
          brand: 'Trunature',
          price: 360000,
          originalPrice: 420000,
          categories: 'brain_nerve, eye_care, cardio',
          originType: 'imported',
          countryName: 'Mỹ',
          regNumber: '7824/2020/ĐKSP',
          packaging: 'Hộp 300 viên nang mềm',
          shortDesc: 'Hỗ trợ tuần hoàn máu não, tăng cường trí nhớ và giảm nhức mỏi mắt khi dùng máy tính.',
          usage: 'Uống 1 viên/lần, ngày 2 lần sau bữa ăn.'
        },
        {
          name: 'Trà Sâm Ngọc Linh & Đông Trùng Hạ Thảo Thượng Hạng',
          brand: 'TraphacoSapa',
          price: 490000,
          originalPrice: 550000,
          categories: 'immunity, respiratory, digestive_liver',
          originType: 'domestic',
          countryName: 'Việt Nam',
          regNumber: '5684/2021/ĐKSP',
          packaging: 'Hộp 20 gói x 3g',
          shortDesc: 'Bồi bổ khí huyết, tăng cường sinh lực, bổ phổi và tăng cường miễn dịch tự nhiên.',
          usage: 'Hãm 1 gói với 200ml nước sôi, uống hàng ngày.'
        }
      ];
      downloadCSV('Mau_San_Pham_MedXpress.csv', headers, sampleRows);
    }
  };

  // Đọc file tải lên
  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setParseError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        if (selectedFile.name.endsWith('.json')) {
          const json = JSON.parse(text);
          if (Array.isArray(json)) {
            setParsedRows(json);
          } else if (typeof json === 'object') {
            // Trường hợp file JSON dạng key-value của registrations
            const rows = Object.entries(json).map(([k, v]) => ({
              regNumber: k,
              ...v
            }));
            setParsedRows(rows);
          }
        } else {
          // File CSV
          const rows = parseCSV(text);
          if (rows.length === 0) {
            setParseError('Không tìm thấy dữ liệu hợp lệ trong file. Vui lòng kiểm tra định dạng file mẫu.');
            setParsedRows([]);
            return;
          }
          setParsedRows(rows);
        }
      } catch (err) {
        console.error(err);
        setParseError('Lỗi đọc file: ' + err.message + '. Vui lòng kiểm tra lại cấu trúc file.');
        setParsedRows([]);
      }
    };
    reader.readAsText(selectedFile, 'UTF-8');
  };

  const handleConfirm = () => {
    if (parsedRows.length === 0) return;
    try {
      if (isReg) {
        if (typeof onImportRegistrations === 'function') {
          onImportRegistrations(parsedRows);
        } else if (typeof onConfirmImport === 'function') {
          onConfirmImport(parsedRows);
        }
      } else {
        if (typeof onImportProducts === 'function') {
          onImportProducts(parsedRows);
        } else if (typeof onConfirmImport === 'function') {
          onConfirmImport(parsedRows);
        }
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi nạp dữ liệu hàng loạt:', err);
      setParseError('Đã xảy ra lỗi khi nạp dữ liệu: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                Nhập Dữ Liệu Hàng Loạt
              </span>
              <h3 className="text-base font-black text-white mt-0.5">
                {isReg 
                  ? 'Cập Nhật Hàng Loạt Số ĐKSP Bộ Y Tế Bằng File (CSV / Excel)'
                  : 'Cập Nhật Hàng Loạt Sản Phẩm Bằng File (CSV / Excel)'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
          
          {/* Bước 1: Hướng dẫn & Tải file mẫu */}
          <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="font-extrabold text-emerald-950 text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Bước 1: Tải File Mẫu Chuẩn Định Dạng</span>
              </div>
              <p className="text-slate-600 text-xs">
                Tải file mẫu về máy tính, mở bằng Microsoft Excel hoặc Google Sheets, điền danh sách hàng chục đến hàng trăm mục rồi lưu lại.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownloadTemplateCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Tải File Mẫu Excel (.csv)</span>
            </button>
          </div>

          {/* Bước 2: Kéo thả hoặc chọn file từ máy tính */}
          <div className="space-y-2">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center font-bold">2</span>
              <span>Bước 2: Chọn File Đã Điền Dữ Liệu Từ Máy Tính</span>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .json, text/csv, application/json, text/plain"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  processFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />

            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  processFile(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                dragOver 
                  ? 'border-emerald-500 bg-emerald-50' 
                  : 'border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/30'
              }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-emerald-600 mx-auto flex items-center justify-center mb-2 shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="font-bold text-sm text-slate-900">
                {file ? file.name : 'Bấm để chọn file CSV / JSON hoặc kéo thả file vào đây'}
              </div>
              <p className="text-slate-400 text-xs mt-1">
                Hỗ trợ file Excel CSV (.csv) có dấu tiếng Việt UTF-8 hoặc file JSON (.json)
              </p>
            </div>
          </div>

          {/* Thông báo lỗi nếu có */}
          {parseError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Bước 3: Xem trước dữ liệu đọc được từ file */}
          {parsedRows.length > 0 && (
            <div className="space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                  <span>Xem Trước Dữ Liệu Sẽ Nạp ({parsedRows.length} mục tìm thấy):</span>
                </div>
                <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-lg text-[11px]">
                  ✓ File hợp lệ
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white max-h-60 overflow-y-auto">
                <table className="w-full text-left text-[11px] text-slate-600">
                  <thead className="bg-slate-100 font-bold border-b text-slate-800 uppercase tracking-wider text-[10px] sticky top-0">
                    <tr>
                      <th className="p-2.5">#</th>
                      {isReg ? (
                        <>
                          <th className="p-2.5">Số ĐKSP</th>
                          <th className="p-2.5">Tên Sản Phẩm</th>
                          <th className="p-2.5">Công Ty Công Bố</th>
                          <th className="p-2.5">Tiêu Chuẩn</th>
                          <th className="p-2.5">Xuất Xứ</th>
                        </>
                      ) : (
                        <>
                          <th className="p-2.5">Tên Sản Phẩm</th>
                          <th className="p-2.5">Thương Hiệu</th>
                          <th className="p-2.5">Nhóm Bệnh / Sức Khỏe</th>
                          <th className="p-2.5">Giá Bán</th>
                          <th className="p-2.5">Số ĐKSP</th>
                          <th className="p-2.5">Xuất Xứ</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 50).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-400">{idx + 1}</td>
                        {isReg ? (
                          <>
                            <td className="p-2.5 font-mono font-bold text-emerald-700">
                              {row.regNumber || row.regnumber || row.so_dksp || row.so_dang_ky || row['số đksp'] || String(Object.values(row)[0] || '—')}
                            </td>
                            <td className="p-2.5 font-bold text-slate-900 truncate max-w-xs">
                              {row.name || row.ten_san_pham || row['tên sản phẩm'] || String(Object.values(row)[1] || 'Sản phẩm')}
                            </td>
                            <td className="p-2.5 text-slate-600 truncate max-w-xs">
                              {row.applicant || row.cong_ty_cong_bo || row['công ty'] || String(Object.values(row)[2] || '—')}
                            </td>
                            <td className="p-2.5 font-semibold text-slate-700">
                              {row.inspectStandard || row.inspectstandard || row.tieu_chuan_kiem_dinh || 'GMP-WHO'}
                            </td>
                            <td className="p-2.5">
                              {row.origin || row.xuat_xu || 'Việt Nam'}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="p-2.5 font-bold text-slate-900 truncate max-w-xs">
                              {row.name || row.ten_san_pham || String(Object.values(row)[0] || `Sản phẩm ${idx + 1}`)}
                            </td>
                            <td className="p-2.5 text-slate-600">
                              {row.brand || row.thuong_hieu || 'Chính Hãng'}
                            </td>
                            <td className="p-2.5 text-emerald-800 font-semibold truncate max-w-[150px]">
                              {row.categories || row.category || row.nhom_suc_khoe || row.nhom_cong_dung || '—'}
                            </td>
                            <td className="p-2.5 font-bold text-emerald-700">
                              {cleanPrice(row.price || row.gia_ban || 0).toLocaleString('vi-VN')}₫
                            </td>
                            <td className="p-2.5 font-mono text-slate-500">
                              {row.regNumber || row.regnumber || row.so_dksp || '—'}
                            </td>
                            <td className="p-2.5">
                              {row.countryName || row.countryname || row.quoc_gia || row.origin || 'Việt Nam'}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 50 && (
                <p className="text-[11px] text-slate-400 text-right">
                  (Hiển thị trước 50 / {parsedRows.length} dòng. Toàn bộ sẽ được nạp khi xác nhận).
                </p>
              )}
            </div>
          )}

        </div>

        {/* Footer Buttons */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
          >
            Đóng
          </button>

          <button
            type="button"
            disabled={parsedRows.length === 0}
            onClick={handleConfirm}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 ${
              parsedRows.length > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Xác Nhận Nạp {parsedRows.length} Mục Vào Website</span>
          </button>
        </div>

      </div>
    </div>
  );
};
