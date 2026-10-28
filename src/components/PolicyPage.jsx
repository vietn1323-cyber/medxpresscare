import React, { useState, useEffect } from 'react';
import { 
  Truck, RotateCcw, ShieldCheck, Lock, CreditCard, 
  FileText, ArrowLeft, PhoneCall, CheckCircle2, ChevronRight, 
  ExternalLink, Printer, Share2, HelpCircle, ChevronDown,
  AlertTriangle, Stethoscope, Sparkles, Copy, Check
} from 'lucide-react';
import { POLICIES, getPolicyBySlug } from '../data/policies';

export const PolicyPage = ({ 
  initialSlug = 'chinh-sach-giao-hang', 
  onGoHome, 
  onOpenAdvisor, 
  hotline = '1800 6868' 
}) => {
  const [activeSlug, setActiveSlug] = useState(() => {
    return initialSlug || 'chinh-sach-giao-hang';
  });
  const [expandedFaqIndex, setExpandedFaqIndex] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Đồng bộ với initialSlug khi prop thay đổi
  useEffect(() => {
    if (initialSlug) {
      setActiveSlug(initialSlug);
      setExpandedFaqIndex(null);
    }
  }, [initialSlug]);

  const activePolicy = getPolicyBySlug(activeSlug);

  const handleSelectPolicy = (slug) => {
    setActiveSlug(slug);
    setExpandedFaqIndex(null);
    window.location.hash = `#chinh-sach?tab=${slug}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyLink = () => {
    const url = `${window.location.origin}/#chinh-sach?tab=${activePolicy.slug}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper render icon tương ứng
  const renderIcon = (iconName, className = "w-5 h-5") => {
    switch (iconName) {
      case 'Truck': return <Truck className={className} />;
      case 'RotateCcw': return <RotateCcw className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Lock': return <Lock className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'FileText': return <FileText className={className} />;
      default: return <FileText className={className} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-20">
      
      {/* 1. Header Banner & Breadcrumb */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-emerald-950 text-white pt-8 pb-12 px-4 shadow-md relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumb & Back button */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <button 
                onClick={onGoHome}
                className="hover:text-white flex items-center gap-1 transition-colors underline underline-offset-2 cursor-pointer"
              >
                Trang chủ
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Trung tâm Chính sách & Pháp chế</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-emerald-400 font-semibold">{activePolicy.title}</span>
            </div>

            <button
              onClick={onGoHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại Cửa Hàng</span>
            </button>
          </div>

          {/* Hero Title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-3xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{activePolicy.badge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
                {activePolicy.title}
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                {activePolicy.shortDesc}
              </p>
              <div className="text-[11px] text-slate-400 font-medium">
                • Phiên bản hiệu lực: <strong className="text-slate-200">{activePolicy.lastUpdated}</strong> • Phê duyệt bởi Hội Đồng Dược Sĩ MedXpressCare
              </div>
            </div>

            {/* Quick Action Tools */}
            <div className="flex flex-wrap md:flex-col items-center sm:items-end gap-2.5 shrink-0">
              <button
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
                title="Sao chép liên kết"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Đã sao chép link!' : 'Chia sẻ chính sách'}</span>
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm transition-all cursor-pointer"
                title="In văn bản"
              >
                <Printer className="w-4 h-4" />
                <span>In bản lưu trữ</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Content Grid: Sidebar + Policy Detail */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR: Danh sách tất cả chính sách */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Nav Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sticky top-24">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 px-2">
                Danh mục Quy định & Chính sách
              </div>

              <div className="space-y-1.5">
                {POLICIES.map((p) => {
                  const isActive = p.slug === activePolicy.slug || p.id === activePolicy.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPolicy(p.slug)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-300 text-emerald-950 font-bold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                        isActive 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {renderIcon(p.icon, "w-4 h-4")}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold leading-snug flex items-center justify-between gap-1">
                          <span className="truncate">{p.title}</span>
                          {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
                          {p.badge}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Box Hỗ Trợ Dược Sĩ 24/7 */}
              <div className="mt-6 pt-5 border-t border-slate-100 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <span>Cần Dược Sĩ Giải Đáp Thêm?</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Nếu quý khách có câu hỏi về quyền lợi đổi trả hoặc điều kiện kiểm hàng, hãy trao đổi trực tiếp với Dược sĩ phụ trách chuyên môn.
                </p>
                <div className="space-y-2 pt-1">
                  {onOpenAdvisor && (
                    <button
                      onClick={onOpenAdvisor}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Chat với Dược Sĩ AI 24/7</span>
                    </button>
                  )}
                  <a
                    href={`tel:${hotline.replace(/\s+/g, '')}`}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-white hover:bg-amber-50 text-slate-900 border border-slate-300 font-bold text-xs transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                    <span>Hotline: {hotline}</span>
                  </a>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Nội dung chi tiết của Chính sách đang chọn */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Card Văn Bản Chính Sách */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 sm:p-8 space-y-8">
              
              {/* Cảnh báo quy chế chính thức */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong>QUY CHUẨN HOẠT ĐỘNG CHÍNH THỨC:</strong> Văn bản chính sách này có giá trị ràng buộc pháp lý giữa Công ty Cổ phần Dược phẩm MedXpressCare Việt Nam và Khách hàng khi thực hiện giao dịch mua bán trực tuyến. Mọi quyền lợi của khách hàng được bảo hộ theo Luật Bảo vệ Quyền lợi Người Tiêu Dùng và Quy chế Quản lý Dược phẩm Bộ Y Tế.
                </div>
              </div>

              {/* Render Các Đoạn Văn Bản (Sections) */}
              <div className="space-y-8 divide-y divide-slate-100">
                {activePolicy.sections.map((sec, idx) => (
                  <div key={idx} className={idx > 0 ? "pt-6 space-y-3" : "space-y-3"}>
                    <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>{sec.heading}</span>
                    </h2>

                    <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2 whitespace-pre-line font-normal">
                      {sec.content.split('\n').map((line, lineIdx) => {
                        const trimmed = line.trim();
                        if (trimmed.startsWith('-') || trimmed.startsWith('+')) {
                          return (
                            <div key={lineIdx} className="pl-4 relative">
                              <span className="absolute left-0 top-1 text-emerald-600 font-bold">•</span>
                              <span dangerouslySetInnerHTML={{ 
                                __html: trimmed.replace(/^[-\+]\s*/, '')
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/`(.*?)`/g, '<code class="bg-slate-100 text-emerald-800 px-1 py-0.5 rounded font-mono text-xs">$1</code>')
                              }} />
                            </div>
                          );
                        }
                        if (/^\d+\./.test(trimmed)) {
                          return (
                            <div key={lineIdx} className="pl-4 font-medium text-slate-800">
                              <span dangerouslySetInnerHTML={{ 
                                __html: trimmed
                                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                  .replace(/`(.*?)`/g, '<code class="bg-slate-100 text-emerald-800 px-1 py-0.5 rounded font-mono text-xs">$1</code>')
                              }} />
                            </div>
                          );
                        }
                        return (
                          <p key={lineIdx} dangerouslySetInnerHTML={{ 
                            __html: trimmed
                              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                              .replace(/`(.*?)`/g, '<code class="bg-slate-100 text-emerald-800 px-1 py-0.5 rounded font-mono text-xs">$1</code>')
                          }} />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Phần Câu Hỏi Thường Gặp (FAQ Accordion) */}
              {Array.isArray(activePolicy.faqs) && activePolicy.faqs.length > 0 && (
                <div className="pt-8 border-t border-slate-200/80 space-y-4">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-600" />
                    <span>Giải Đáp Thắc Mắc Về {activePolicy.title}</span>
                  </h3>

                  <div className="space-y-2.5">
                    {activePolicy.faqs.map((faq, fIdx) => {
                      const isExpanded = expandedFaqIndex === fIdx;
                      return (
                        <div 
                          key={fIdx}
                          className="border border-slate-200 rounded-xl overflow-hidden transition-all"
                        >
                          <button
                            onClick={() => setExpandedFaqIndex(isExpanded ? null : fIdx)}
                            className="w-full flex items-center justify-between p-3.5 text-left bg-slate-50 hover:bg-slate-100 text-xs sm:text-sm font-bold text-slate-800 cursor-pointer"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                          </button>
                          {isExpanded && (
                            <div className="p-3.5 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Chân Trang Chính Sách: Thông Tin Xác Thực Pháp Lý */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
                <div>
                  <strong>Đại diện Pháp lý:</strong> Công ty Cổ phần Dược phẩm MedXpressCare Việt Nam
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    BỘ Y TẾ CHỨNG NHẬN
                  </span>
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                    ĐÃ ĐĂNG KÝ BỘ CÔNG THƯƠNG
                  </span>
                </div>
              </div>

            </div>

            {/* Khối Cam Kết Uy Tín MedXpressCare */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center font-bold">
                  ✓
                </div>
                <div className="text-xs font-bold text-slate-900">Bồi Hoàn 300%</div>
                <div className="text-[11px] text-slate-500">Nếu phát hiện hàng giả, hàng cận date</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 mx-auto flex items-center justify-center font-bold">
                  🚚
                </div>
                <div className="text-xs font-bold text-slate-900">Đồng Kiểm 100%</div>
                <div className="text-[11px] text-slate-500">Mở hộp kiểm tra tem chống giả trước khi trả tiền</div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs text-center space-y-1">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 mx-auto flex items-center justify-center font-bold">
                  🩺
                </div>
                <div className="text-xs font-bold text-slate-900">Dược Sĩ Đại Học</div>
                <div className="text-[11px] text-slate-500">Tư vấn đúng liều dùng, không ép bán thuốc</div>
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
  );
};
