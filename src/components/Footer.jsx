import React from 'react';
import { 
  ShieldCheck, PhoneCall, Mail, MapPin, Award, 
  Truck, RefreshCw, FileText, Heart, Stethoscope,
  Smartphone, Download
} from 'lucide-react';

export const Footer = ({ 
  onOpenVerifier, 
  onOpenAdvisor, 
  onOpenAdmin, 
  onNavigateToTracking, 
  onNavigateToPolicy, 
  onOpenPWAInstall,
  hotline = '1800 6868',
  storeConfig = {},
  policies = []
}) => {
  const currentHotline = storeConfig?.hotline || hotline || '1800 6868';
  const companyName = storeConfig?.companyName || 'Công ty Cổ phần Dược phẩm MedXpressCare Việt Nam';
  const dkkdNumber = storeConfig?.dkkdNumber || '0108923412 - Sở KH&ĐT TP. Hà Nội cấp';
  const pharmacyCert = storeConfig?.pharmacyCert || 'Số 452/ĐKKDD-BYT';
  const pharmacistInCharge = storeConfig?.pharmacistInCharge || 'DS. Nguyễn Thu Trang';
  const headquartersAddress = storeConfig?.headquartersAddress || 'Tầng 6, Tòa nhà Dược Phẩm MedXpress, Số 168 Cầu Giấy, Quan Hoa, Q. Cầu Giấy, Hà Nội.';
  const warehouseAddress = storeConfig?.warehouseAddress || 'KCN Đài Tư, Q. Long Biên, TP. Hà Nội.';
  const deliveryScope = storeConfig?.deliveryScope || 'Hỏa tốc nội thành Hà Nội & Giao hàng nhanh toàn quốc qua đối tác bưu cục.';
  const emailPharmacist = storeConfig?.emailPharmacist || 'duocsi@medxpresscare.com';
  const emailContract = storeConfig?.emailContract || 'hopdong@medxpresscare.com';
  const workingHours = storeConfig?.workingHours || '8:00 - 22:00 tất cả các ngày trong tuần';
  const aboutDesc = storeConfig?.aboutDesc || 'Hệ thống bán lẻ & phân phối Thực phẩm chức năng cao cấp chuẩn Y Khoa. Đảm bảo nguồn gốc xuất xứ minh bạch: Hàng Nội Địa Chuẩn GMP-WHO và Hàng Nhập Ngoại Chính Ngạch (Mỹ, Úc, Nhật, Hàn, Đức).';
  const regulatoryWarning = storeConfig?.regulatoryWarning || '⚠️ LƯU Ý QUAN TRỌNG TỪ BỘ Y TẾ: Thực phẩm chức năng (Thực phẩm bảo vệ sức khỏe) không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh. Tác dụng của sản phẩm tùy thuộc vào cơ địa và mức độ dung nạp của từng người. Đọc kỹ hướng dẫn sử dụng trước khi dùng.';

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Mandatory Regulatory Warning Box */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center mb-12">
          <p className="text-xs text-amber-400 font-semibold leading-relaxed">
            {regulatoryWarning}
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
              {aboutDesc}
            </p>

            <div className="pt-1 space-y-1.5 text-xs text-slate-400">
              <div>• <strong>Đơn vị sở hữu:</strong> {companyName}</div>
              <div>• <strong>ĐKKD số:</strong> {dkkdNumber}</div>
              <div>• <strong>Chứng chỉ Dược:</strong> {pharmacyCert}</div>
              <div>• <strong>Dược sĩ phụ trách CM:</strong> {pharmacistInCharge}</div>
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
                  <strong className="text-slate-200">Địa chỉ (Trụ sở chính):</strong> {headquartersAddress}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <Truck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Tổng kho phân phối:</strong> {warehouseAddress}
                </span>
              </div>

              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-slate-200">Phạm vi giao hàng:</strong> {deliveryScope}
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
                  onClick={onNavigateToTracking || onOpenVerifier}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                >
                  <span>🚚</span> Tra cứu Vận đơn Trực Tuyến
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenVerifier}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🔍</span> Tra cứu Số ĐKSP Bộ Y Tế
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenAdvisor}
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>🩺</span> Dược Sĩ AI Tư Vấn Liệu Trình 24/7
                </button>
              </li>
              
              {/* Dynamic Policy Links */}
              {Array.isArray(policies) && policies.length > 0 ? (
                policies.map((p) => {
                  const iconEmoji = 
                    p.id.includes('giao-hang') ? '📦' :
                    p.id.includes('doi-tra') ? '🔄' :
                    p.id.includes('kiem-hang') ? '🛡️' :
                    p.id.includes('bao-mat') ? '🔒' :
                    p.id.includes('thanh-toan') ? '💳' : '📜';
                  return (
                    <li key={p.id}>
                      <button 
                        onClick={() => onNavigateToPolicy ? onNavigateToPolicy(p.slug) : (window.location.hash = `#chinh-sach?tab=${p.slug}`)}
                        className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                        title={p.title}
                      >
                        <span>{iconEmoji}</span> <span className="line-clamp-1">{p.title}</span>
                      </button>
                    </li>
                  );
                })
              ) : (
                <>
                  <li>
                    <button 
                      onClick={() => onNavigateToPolicy ? onNavigateToPolicy('chinh-sach-giao-hang') : (window.location.hash = '#rules')}
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                    >
                      <span>📦</span> Chính sách giao hỏa tốc HN & Giao nhanh GSP
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => onNavigateToPolicy ? onNavigateToPolicy('chinh-sach-doi-tra') : (window.location.hash = '#return')}
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                    >
                      <span>🔄</span> Chính sách đổi trả 30 ngày & Bồi hoàn 300%
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => onNavigateToPolicy ? onNavigateToPolicy('chinh-sach-kiem-hang') : (window.location.hash = '#kiem-hang')}
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                    >
                      <span>🛡️</span> Chính sách đồng kiểm 100% khi nhận hàng
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => onNavigateToPolicy ? onNavigateToPolicy('chinh-sach-bao-mat') : (window.location.hash = '#privacy')}
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                    >
                      <span>🔒</span> Bảo mật hồ sơ thông tin sức khỏe (NĐ 13/2023)
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => onNavigateToPolicy ? onNavigateToPolicy('chinh-sach-thanh-toan') : (window.location.hash = '#thanh-toan')}
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                    >
                      <span>💳</span> Hướng dẫn thanh toán VietQR & COD
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => onNavigateToPolicy ? onNavigateToPolicy('dieu-khoan-su-dung') : (window.location.hash = '#dieu-khoan')}
                      className="hover:text-emerald-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer"
                    >
                      <span>📜</span> Điều khoản dịch vụ & Quy chế hoạt động
                    </button>
                  </li>
                </>
              )}
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
                href={`tel:${currentHotline.replace(/\s+/g, '')}`}
                className="text-xl font-extrabold text-amber-400 hover:text-white transition-colors flex items-center gap-2"
              >
                <PhoneCall className="w-5 h-5 animate-pulse" />
                {currentHotline}
              </a>
              <div className="text-[10px] text-slate-400">{workingHours}</div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{emailPharmacist}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{emailContract}</span>
              </div>
            </div>

            {/* Badges Chứng Nhận & PWA Mobile App Button */}
            <div className="flex items-center gap-2 pt-2">
              <span className="text-[10px] font-bold px-2 py-1 bg-emerald-950 text-emerald-300 rounded border border-emerald-800">
                ĐÃ THÔNG BÁO BỘ CÔNG THƯƠNG
              </span>
              <span className="text-[10px] font-bold px-2 py-1 bg-blue-950 text-blue-300 rounded border border-blue-800">
                CHUẨN GSP
              </span>
            </div>

            {onOpenPWAInstall && (
              <div className="pt-2">
                <button
                  onClick={onOpenPWAInstall}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Smartphone className="w-4 h-4 text-amber-300" />
                  <span>Cài App MedXpressCare Vào ĐT</span>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Copyright & Payment Methods */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div 
            onClick={onOpenAdmin}
            className="cursor-default select-none"
            title="MedXpressCare Pharmacy Platform"
          >
            © 2026 MedXpressCare.com - Bản quyền thuộc về {companyName}.
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
