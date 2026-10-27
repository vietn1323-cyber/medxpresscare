import React from 'react';
import { 
  ShieldCheck, PhoneCall, Mail, MapPin, Award, 
  Truck, RefreshCw, FileText, Heart, Stethoscope 
} from 'lucide-react';

export const Footer = ({ onOpenVerifier, onOpenAdvisor, onOpenAdmin }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Mandatory Regulatory Warning Box */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center mb-12">
          <p className="text-xs text-amber-400 font-semibold leading-relaxed">
            ⚠️ <strong>LƯU Ý QUAN TRỌNG TỪ BỘ Y TẾ:</strong> Thực phẩm chức năng (Thực phẩm bảo vệ sức khỏe) không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh. Tác dụng của sản phẩm tùy thuộc vào cơ địa và mức độ dung nạp của từng người. Đọc kỹ hướng dẫn sử dụng trước khi dùng.
          </p>
        </div>

        {/* 4 Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1: About MedXpressCare */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <img 
                src="/logo-icon.png" 
                alt="MedXpress Care" 
                className="w-10 h-10 object-contain rounded-xl bg-white p-0.5 shadow-sm" 
              />
              <div>
                <span className="text-xl font-black text-white">
                  Med<span className="text-emerald-400">Xpress</span> <span className="text-blue-400">Care</span>
                  <span className="text-xs text-emerald-400 ml-1 font-mono">.com</span>
                </span>
                <p className="text-[10px] text-emerald-400 font-bold">
                  Sức khỏe thật – Giá trị thật
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Hệ thống bán lẻ & phân phối Thực phẩm chức năng cao cấp chuẩn Y Khoa. Đảm bảo nguồn gốc xuất xứ minh bạch: Hàng Nội Địa Chuẩn GMP-WHO và Hàng Nhập Ngoại Chính Ngạch (Mỹ, Úc, Nhật, Hàn, Đức).
            </p>

            <div className="pt-1 space-y-1.5 text-xs text-slate-400">
              <div>• <strong>ĐKKD số:</strong> 0108923412 - Sở KH&ĐT TP. Hà Nội cấp</div>
              <div>• <strong>Chứng chỉ Dược:</strong> Số 452/ĐKKDD-BYT</div>
              <div>• <strong>Dược sĩ phụ trách CM:</strong> DS. Nguyễn Thu Trang</div>
            </div>
          </div>

          {/* Col 2: Hệ Thống Kho & Văn Phòng */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Trụ Sở & Kho Hàng (Hà Nội)
            </h4>
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Địa chỉ (Duy nhất tại Hà Nội):</strong> Tầng 6, Tòa nhà Dược Phẩm MedXpress, Số 168 Cầu Giấy, Quan Hoa, Q. Cầu Giấy, Hà Nội.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Tổng kho phân phối:</strong> KCN Đài Tư, Q. Long Biên, TP. Hà Nội.
                </span>
              </div>

              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Phạm vi giao hàng:</strong> Hỏa tốc nội thành Hà Nội & Giao hàng nhanh toàn quốc qua đối tác bưu cục.
                </span>
              </div>
            </div>
          </div>

          {/* Col 3: Hỗ Trợ Khách Hàng & Pháp Lý */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Dịch Vụ & Tra Cứu
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <button 
                  onClick={onOpenVerifier}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>🔍</span> Tra cứu Số ĐKSP Bộ Y Tế
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenAdvisor}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
                >
                  <span>🩺</span> Dược Sĩ AI Tư Vấn Liệu Trình 24/7
                </button>
              </li>
              <li>
                <a href="#rules" className="hover:text-emerald-400 transition-colors">
                  Chính sách giao hỏa tốc HN & Giao hàng nhanh
                </a>
              </li>
              <li>
                <a href="#return" className="hover:text-emerald-400 transition-colors">
                  Chính sách đổi trả 30 ngày & Bồi hoàn 300%
                </a>
              </li>
              <li>
                <a href="#privacy" className="hover:text-emerald-400 transition-colors">
                  Bảo mật hồ sơ thông tin sức khỏe khách hàng
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Tổng Đài Dược Sĩ 24/7 */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Liên Hệ Dược Sĩ Trực Tuyến
            </h4>
            
            <div className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-1">
              <div className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                Tư vấn chuyên môn miễn phí
              </div>
              <a 
                href="tel:18006868"
                className="text-xl font-extrabold text-amber-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <PhoneCall className="w-5 h-5 animate-pulse" />
                1800 6868
              </a>
              <div className="text-[10px] text-slate-400">8:00 - 22:00 tất cả các ngày trong tuần</div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400" />
                <span>duocsi@medxpresscare.com</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>hopdong@medxpresscare.com</span>
              </div>
            </div>

            {/* Badges Chứng Nhận */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[10px] font-bold px-2 py-1 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
                ĐÃ THÔNG BÁO BỘ CÔNG THƯƠNG
              </span>
              <span className="text-[10px] font-bold px-2 py-1 bg-blue-950 text-blue-300 rounded border border-blue-800">
                CHUẨN GSP
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Payment Methods */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div 
            onClick={onOpenAdmin}
            className="cursor-default select-none"
            title="MedXpressCare Pharmacy Platform"
          >
            © 2026 MedXpressCare.com - Bản quyền thuộc về Công ty Cổ phần Dược phẩm MedXpressCare Việt Nam.
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-slate-500 text-[11px] font-medium hidden sm:inline">Phương thức thanh toán:</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[10px] border border-slate-700">VietQR</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[10px] border border-slate-700">COD Tiền mặt</span>
            <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 font-mono text-[10px] border border-slate-700">Visa / Master</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
