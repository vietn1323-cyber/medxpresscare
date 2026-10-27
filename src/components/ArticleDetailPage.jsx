import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, Clock, Calendar, User, ArrowLeft, Share2, Check, 
  Copy, Tag, Eye, ShieldCheck, Stethoscope, ChevronRight, 
  ShoppingBag, Flame, ExternalLink, ThumbsUp, Bookmark, Printer,
  Sparkles, CheckCircle2, AlertCircle, HelpCircle, ArrowUpRight
} from 'lucide-react';

export const ArticleDetailPage = ({ 
  article, 
  allArticles = [], 
  products = [], 
  onBack, 
  onSelectArticle, 
  onSelectProduct,
  onAddToCart,
  hotline = '1800 6868' 
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(() => (article?.views ? Math.floor(article.views / 8) + 12 : 45));
  const [hasLiked, setHasLiked] = useState(false);

  // Cuộn lên đầu trang khi bài viết thay đổi
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setHasLiked(false);
  }, [article?.id]);

  // Thanh tiến trình cuộn đọc bài (Reading Progress Bar)
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Trích xuất mục lục bài viết tự động từ các thẻ ## H2
  const tableOfContents = useMemo(() => {
    if (!article?.content) return [];
    const lines = article.content.split('\n');
    const headings = [];
    lines.forEach((line) => {
      if (line.startsWith('## ')) {
        const title = line.replace('## ', '').trim();
        const anchor = title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-');
        headings.push({ title, anchor });
      }
    });
    return headings;
  }, [article?.content]);

  // Bài viết liên quan (cùng chuyên mục)
  const relatedArticles = useMemo(() => {
    if (!article) return [];
    return (allArticles || [])
      .filter(a => a.id !== article.id && a.status !== 'draft')
      .filter(a => a.category === article.category || (a.tags && article.tags && a.tags.some(t => article.tags.includes(t))))
      .slice(0, 3);
  }, [article, allArticles]);

  // Gợi ý sản phẩm y khoa liên quan đến bài viết
  const recommendedProducts = useMemo(() => {
    if (!products || products.length === 0 || !article) return [];
    const artText = `${article.title} ${article.category} ${article.summary} ${(article.tags || []).join(' ')}`.toLowerCase();
    
    // Tìm sản phẩm khớp với từ khóa trong bài viết
    const matched = products.filter(p => {
      const pName = p.name.toLowerCase();
      const pCats = (Array.isArray(p.categories) ? p.categories.join(' ') : (p.category || '')).toLowerCase();
      if (artText.includes('canxi') && (pName.includes('canxi') || pCats.includes('xương'))) return true;
      if (artText.includes('khớp') && (pName.includes('khớp') || pName.includes('glucosamine'))) return true;
      if (artText.includes('sâm') && (pName.includes('sâm') || pCats.includes('dược liệu'))) return true;
      if (artText.includes('tim') && (pName.includes('omega') || pName.includes('tim') || pCats.includes('tim'))) return true;
      if (artText.includes('chính ngạch') || artText.includes('phân biệt')) return p.originType === 'imported';
      return false;
    });

    if (matched.length > 0) return matched.slice(0, 3);
    // Fallback lấy 3 sản phẩm nổi bật
    return products.slice(0, 3);
  }, [article, products]);

  // Xử lý sao chép đường dẫn bài viết
  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikesCount(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikesCount(prev => prev + 1);
      setHasLiked(true);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!article) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500 mb-4">Không tìm thấy bài viết yêu cầu.</p>
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
        >
          Quay lại Cẩm Nang Sức Khỏe
        </button>
      </div>
    );
  }

  // Helper render các khối nội dung Markdown gồm H2, H3, Blockquote, Ảnh minh họa, và Danh sách
  const renderFormattedParagraph = (paragraph, pIndex) => {
    const trimmed = paragraph.trim();

    // 1. Đề mục lớn H2
    if (trimmed.startsWith('## ')) {
      const headingText = trimmed.replace('## ', '').trim();
      const anchor = headingText
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      return (
        <h2 
          key={pIndex} 
          id={anchor}
          className="text-xl sm:text-2xl font-black text-slate-900 pt-6 pb-2 border-b-2 border-emerald-100 flex items-center gap-2 mt-4 scroll-mt-24"
        >
          <span className="w-2.5 h-6 bg-gradient-to-b from-emerald-500 to-teal-700 rounded-full inline-block"></span>
          <span>{headingText}</span>
        </h2>
      );
    }

    // 2. Đề mục con H3
    if (trimmed.startsWith('### ')) {
      return (
        <h3 key={pIndex} className="text-base sm:text-lg font-extrabold text-slate-800 pt-3 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-emerald-400 rounded-full inline-block"></span>
          <span>{trimmed.replace('### ', '')}</span>
        </h3>
      );
    }

    // 3. Khối trích dẫn / Lời khuyên Dược sĩ y khoa
    if (trimmed.startsWith('> ')) {
      return (
        <div key={pIndex} className="my-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/90 to-orange-50/70 border-l-4 border-amber-500 text-amber-950 shadow-xs space-y-1.5">
          <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-amber-800">
            <Stethoscope className="w-4 h-4 text-amber-600" />
            <span>Lời Khuyên Chuyên Môn Từ Dược Sĩ MedXpressCare</span>
          </div>
          <p className="text-xs sm:text-sm font-medium leading-relaxed italic text-amber-900">
            {trimmed.replace(/^>\s*/, '').replace(/\*\*/g, '')}
          </p>
        </div>
      );
    }

    // 4. Khối Ảnh Minh Họa Trong Bài Viết cú pháp markdown: ![Alt Text](image_url)
    const imgRegex = /^!\[(.*?)\]\((.*?)\)$/;
    const imgMatch = trimmed.match(imgRegex);
    if (imgMatch) {
      const altText = imgMatch[1] || 'Hình ảnh minh họa chuẩn y khoa';
      const imgUrl = imgMatch[2];
      return (
        <figure key={pIndex} className="my-6 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-md">
          <div className="relative overflow-hidden group">
            <img 
              src={imgUrl} 
              alt={altText} 
              className="w-full max-h-[460px] object-cover transition-transform duration-500 group-hover:scale-102"
              loading="lazy"
            />
          </div>
          {altText && (
            <figcaption className="p-3 bg-slate-100/90 text-slate-600 text-center text-xs italic border-t border-slate-200/80 flex items-center justify-center gap-1.5">
              <span className="font-semibold text-slate-700">Hình:</span>
              <span>{altText}</span>
            </figcaption>
          )}
        </figure>
      );
    }

    // 5. Nếu trong đoạn văn có chứa ảnh markdown nằm xen kẽ chữ
    if (trimmed.includes('![') && trimmed.includes('](')) {
      const parts = trimmed.split(/(!\[.*?\]\(.*?\))/g);
      return (
        <div key={pIndex} className="space-y-4">
          {parts.map((part, subIdx) => {
            const subMatch = part.match(imgRegex);
            if (subMatch) {
              const alt = subMatch[1] || 'Ảnh minh họa y tế';
              const src = subMatch[2];
              return (
                <figure key={subIdx} className="my-5 rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 shadow-sm">
                  <img src={src} alt={alt} className="w-full max-h-[420px] object-cover" loading="lazy" />
                  {alt && (
                    <figcaption className="p-2.5 bg-slate-100 text-slate-600 text-center text-xs italic">
                      {alt}
                    </figcaption>
                  )}
                </figure>
              );
            }
            if (!part.trim()) return null;
            return (
              <p key={subIdx} className="text-slate-700 leading-relaxed whitespace-pre-line">
                {part}
              </p>
            );
          })}
        </div>
      );
    }

    // 6. Danh sách gạch đầu dòng
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = trimmed.split('\n').filter(Boolean);
      return (
        <ul key={pIndex} className="my-3 space-y-2 pl-2">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{item.replace(/^[-*]\s*/, '')}</span>
            </li>
          ))}
        </ul>
      );
    }

    // 7. Đoạn văn bản thông thường
    return (
      <p key={pIndex} className="text-slate-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
        {trimmed}
      </p>
    );
  };

  return (
    <article className="min-h-screen bg-white pb-20 animate-in fade-in duration-300">
      
      {/* 1. THANH TIẾN TRÌNH ĐỌC (READING PROGRESS BAR) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100 z-50">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. THANH BREADCRUMB & ĐIỀU HƯỚNG ĐẦU TRANG */}
      <nav className="bg-slate-50/90 border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          
          {/* Breadcrumb Links */}
          <div className="flex items-center gap-2 text-xs text-slate-500 truncate mr-2">
            <button
              onClick={onBack}
              className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 shrink-0"
              title="Quay lại Cẩm Nang Sức Khỏe"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quay lại Cẩm Nang</span>
              <span className="sm:hidden">Quay lại</span>
            </button>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-700 hidden md:inline truncate max-w-[150px]">
              {article.category}
            </span>
            <span className="text-slate-300 hidden md:inline">/</span>
            <span className="text-slate-500 truncate max-w-[220px] font-medium hidden lg:inline">
              {article.title}
            </span>
          </div>

          {/* Action Tools: Chia sẻ, Like, In */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLike}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                hasLiked 
                  ? 'bg-rose-50 border-rose-300 text-rose-600 shadow-xs' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
              title="Thích bài viết"
            >
              <ThumbsUp className={`w-3.5 h-3.5 ${hasLiked ? 'fill-rose-500' : ''}`} />
              <span>{likesCount}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              title="Sao chép liên kết bài viết"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Đã sao chép</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Chia sẻ</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="p-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all hidden sm:flex"
              title="In bài viết"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

        </div>
      </nav>

      {/* 3. HERO HEADER BÀI VIẾT */}
      <header className="bg-gradient-to-b from-slate-50 to-white py-8 sm:py-12 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          
          {/* Chuyên mục & Nhãn chứng nhận */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black tracking-wide uppercase">
              {article.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Thẩm Định Y Khoa Chuẩn Bộ Y Tế</span>
            </span>
          </div>

          {/* Tiêu Đề Bài Viết H1 */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 leading-tight sm:leading-snug tracking-tight mb-6">
            {article.title}
          </h1>

          {/* Hộp Thông Tin Tác Giả & Ban Kiểm Duyệt Y Tế (EEAT) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-base shadow-md shrink-0">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                    {article.author}
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                    Dược Sĩ Kiểm Duyệt
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {article.authorRole}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-500 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span className="font-medium">{article.readTime || '5 phút đọc'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{article.publishedAt || '2026-10-23'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>{(article.views || 1240).toLocaleString('vi-VN')} lượt xem</span>
              </span>
            </div>

          </div>

        </div>
      </header>

      {/* 4. MAIN ARTICLE BODY CONTAINER (BỐ CỤC 2 CỘT CHUẨN TRANG BÁO Y KHOA) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* CỘT TRÁI: NỘI DUNG CHÍNH (8 CỘT) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Ảnh Bìa Toàn Cảnh (Featured Hero Image) */}
            <div className="rounded-3xl overflow-hidden bg-slate-100 shadow-lg border border-slate-200">
              <img
                src={article.image}
                alt={article.imageAlt || article.title}
                className="w-full max-h-[460px] object-cover"
              />
              {article.imageAlt && (
                <div className="p-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs text-center italic">
                  {article.imageAlt}
                </div>
              )}
            </div>

            {/* Đoạn Sapo Tóm Tắt Mở Đầu */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-emerald-50/90 to-teal-50/60 border-l-4 border-emerald-600 text-slate-800 text-sm sm:text-base font-semibold leading-relaxed shadow-xs">
              {article.summary}
            </div>

            {/* Khung Mục Lục Tự Động (Table of Contents) nếu bài viết có từ 2 mục trở lên */}
            {tableOfContents.length >= 2 && (
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm mb-3">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Mục Lục Bài Viết (Nhấp để chuyển nhanh đến nội dung)</span>
                </div>
                <nav className="space-y-1.5">
                  {tableOfContents.map((item, idx) => (
                    <a
                      key={idx}
                      href={`#${item.anchor}`}
                      className="block text-xs sm:text-sm text-slate-600 hover:text-emerald-700 hover:translate-x-1 transition-all py-1 border-b border-slate-100/80"
                    >
                      <span className="font-bold text-emerald-600 mr-2">{idx + 1}.</span>
                      <span>{item.title}</span>
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Nội Dung Chi Tiết Bài Viết (Render H2, H3, Ảnh Minh Họa, Quote, Paragraphs) */}
            <div className="space-y-5 text-slate-700 text-sm sm:text-base leading-relaxed">
              {article.content ? (
                article.content.split('\n\n').map((para, idx) => renderFormattedParagraph(para, idx))
              ) : (
                <p>Nội dung chi tiết đang được đội ngũ Dược sĩ MedXpressCare tổng hợp và cập nhật.</p>
              )}
            </div>

            {/* Thẻ Từ Khóa (SEO Tags) */}
            {article.tags && article.tags.length > 0 && (
              <div className="pt-6 border-t border-slate-200">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    Từ khóa liên quan:
                  </span>
                  {article.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-medium transition-colors cursor-pointer border border-slate-200/60"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Khối Cam Kết Bản Quyền & Trách Nhiệm Y Tế */}
            <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h4 className="font-bold text-sm sm:text-base text-slate-900">
                  Cam Kết Kiểm Duyệt Y Khoa & Tuyên Bố Miễn Trừ Trách Nhiệm
                </h4>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Nội dung bài viết được biên soạn dựa trên các tài liệu Dược thư Quốc gia, Cục Quản Lý Dược (Bộ Y Tế) và các nghiên cứu khoa học lâm sàng quốc tế (PubMed, FDA, TGA). Thông tin chỉ mang tính chất tham khảo kiến thức chăm sóc sức khỏe chủ động, không thay thế cho chẩn đoán hoặc phác đồ điều trị của bác sĩ chuyên khoa. Khách hàng không tự ý ngừng thuốc theo đơn khi chưa có chỉ định y tế.
              </p>
            </div>

            {/* Nút Quay Lại Cẩm Nang Sau Khi Đọc Xong */}
            <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
              <button
                onClick={onBack}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại Danh Sách Cẩm Nang</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-700/20"
              >
                <Share2 className="w-4 h-4" />
                <span>Chia sẻ bài viết này</span>
              </button>
            </div>

          </div>

          {/* CỘT PHẢI: STICKY SIDEBAR (4 CỘT) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* 1. HỘP SẢN PHẨM KHUYÊN DÙNG TRONG BÀI VIẾT */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <span>Sản Phẩm Đề Xuất Phác Đồ</span>
                </div>
                <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                  Chính ngạch
                </span>
              </div>

              <div className="space-y-3">
                {recommendedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all group flex gap-3"
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 bg-white"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="text-[10px] text-emerald-700 font-bold truncate">{prod.brand}</div>
                        <h5 
                          onClick={() => onSelectProduct && onSelectProduct(prod)}
                          className="font-bold text-xs text-slate-900 line-clamp-1 group-hover:text-emerald-700 cursor-pointer"
                        >
                          {prod.name}
                        </h5>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-xs text-rose-600">
                          {prod.price.toLocaleString('vi-VN')}₫
                        </span>
                        <button
                          onClick={() => {
                            if (onAddToCart) onAddToCart(prod);
                            alert(`Đã thêm ${prod.name} vào giỏ hàng!`);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors"
                        >
                          + Mua
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. HỘP DƯỢC SĨ TƯ VẤN TRỰC TIẾP 24/7 */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  <Stethoscope className="w-4 h-4 text-emerald-200" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm">Cần Tư Vấn Phác Đồ Riêng?</h4>
                  <p className="text-[11px] text-emerald-100">Dược sĩ Đại học sẵn sàng hỗ trợ 24/7</p>
                </div>
              </div>

              <p className="text-xs text-emerald-100/90 leading-relaxed">
                Mỗi thể trạng, độ tuổi và bệnh lý nền cần phác đồ vi chất khác nhau. Đừng ngần ngại trò chuyện với Dược Sĩ AI 24/7 của chúng tôi.
              </p>

              <div className="pt-1">
                <a
                  href={`tel:${(hotline || '1800 6868').replace(/\s+/g, '')}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-white text-emerald-900 font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:bg-emerald-50 transition-colors"
                >
                  <span>Gọi Hotline {hotline || '1800 6868'} (Miễn cước)</span>
                </a>
              </div>
            </div>

            {/* 3. BÀI VIẾT LIÊN QUAN CÙNG CHUYÊN MỤC */}
            {relatedArticles.length > 0 && (
              <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
                <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Bài Viết Cùng Chuyên Mục</span>
                </div>

                <div className="space-y-3">
                  {relatedArticles.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => onSelectArticle && onSelectArticle(rel)}
                      className="flex gap-3 items-center group cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <img
                        src={rel.image}
                        alt={rel.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-emerald-700 font-bold">{rel.category}</div>
                        <h5 className="font-bold text-xs text-slate-800 line-clamp-2 group-hover:text-emerald-700 transition-colors leading-snug">
                          {rel.title}
                        </h5>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>{rel.readTime || '5 phút'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </aside>

        </div>
      </main>

    </article>
  );
};
