import React, { useState, useMemo } from 'react';
import { 
  BookOpen, Clock, User, ChevronRight, CheckCircle2, 
  HelpCircle, ChevronDown, ChevronUp, Sparkles, ShieldCheck,
  Search, Tag, Eye, Share2, Copy, Check, ArrowRight, ExternalLink,
  Award, Stethoscope, ThumbsUp, ShoppingBag
} from 'lucide-react';
import { DEFAULT_ARTICLES } from '../data/articles';

export const HealthBlogSection = ({ 
  articles = DEFAULT_ARTICLES,
  products = [],
  onSelectProduct,
  onOpenArticle
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchArticle, setSearchArticle] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  // Danh mục bài viết
  const categories = useMemo(() => {
    const cats = new Set();
    (articles || []).forEach(a => {
      if (a.category) cats.add(a.category);
    });
    return ['all', ...Array.from(cats)];
  }, [articles]);

  // Lọc bài viết
  const filteredArticles = useMemo(() => {
    return (articles || [])
      .filter(a => a.status !== 'draft') // Chỉ hiện bài đã xuất bản
      .filter(a => {
        const matchCat = selectedCategory === 'all' || a.category === selectedCategory;
        const q = searchArticle.toLowerCase().trim();
        const matchSearch = !q || 
          (a.title && a.title.toLowerCase().includes(q)) ||
          (a.summary && a.summary.toLowerCase().includes(q)) ||
          (a.focusKeyword && a.focusKeyword.toLowerCase().includes(q)) ||
          (a.tags && a.tags.some(t => t.toLowerCase().includes(q)));
        return matchCat && matchSearch;
      });
  }, [articles, selectedCategory, searchArticle]);

  // Bài viết nổi bật ghim đầu (Featured)
  const featuredArticle = useMemo(() => {
    return filteredArticles.find(a => a.featured) || filteredArticles[0];
  }, [filteredArticles]);

  const regularArticles = useMemo(() => {
    return filteredArticles.filter(a => a.id !== featuredArticle?.id);
  }, [filteredArticles, featuredArticle]);

  // Xử lý copy link chia sẻ
  const handleCopyShareLink = (slug) => {
    const url = `${window.location.origin}/#health-blog?article=${slug}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const FAQS = [
    {
      q: 'Thực phẩm chức năng (TPCN) tại MedXpressCare có phải là thuốc chữa bệnh không?',
      a: 'Theo quy định của Bộ Y Tế, Thực phẩm bảo vệ sức khỏe không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh. Sản phẩm có công dụng hỗ trợ bổ sung vi chất, tăng cường chức năng cơ quan, giảm nguy cơ mắc bệnh và cải thiện thể trạng.'
    },
    {
      q: 'Nên chọn TPCN Nội Địa hay TPCN Nhập Ngoại (Mỹ, Úc, Nhật, Hàn)?',
      a: 'Cả hai đều có thế mạnh riêng biệt: TPCN Nội Địa rất ưu việt với các dòng dược liệu quý bản địa (Sâm Ngọc Linh, Đông Trùng Hạ Thảo Sa Pa, Tinh nghệ Nano Curcumin, Đinh Lăng...) rất hợp với cơ địa người Việt và có giá thành hợp lý. Trong khi đó, TPCN Nhập Ngoại vượt trội ở các dòng hoạt chất công nghệ cao (Glucosamine HCL 1500mg, Dầu cá Omega-3 biển sâu, Tảo xoắn Spirulina...) đạt chuẩn kiểm định khắt khe của FDA hay TGA.'
    },
    {
      q: 'Làm thế nào để khách hàng biết chắc chắn là hàng chính ngạch?',
      a: 'MedXpressCare cam kết 100% sản phẩm có tem phụ tiếng Việt theo Nghị định 43/2017/NĐ-CP, tem chống giả có mã cào SMS xác thực, xuất trình được hóa đơn đỏ điện tử VAT và đã được Cục An Toàn Thực Phẩm cấp Số tiếp nhận Đăng ký công bố sản phẩm (Số ĐKSP).'
    },
    {
      q: 'Chính sách giao hàng của MedXpressCare như thế nào?',
      a: 'MedXpressCare hiện hoạt động với 1 cơ sở duy nhất tại Hà Nội. Đối với khách hàng tại nội thành Hà Nội, quý khách có thể chọn Giao hỏa tốc (cước phí tính theo thực tế qua ứng dụng giao hàng, Dược sĩ sẽ trao đổi trực tiếp khi gọi xác nhận đơn, không áp dụng miễn phí vận chuyển). Với khách hàng tại các quận huyện xa hoặc các tỉnh thành toàn quốc, đơn hàng được gửi qua hình thức Giao hàng nhanh (GHTK, GHN, Viettel Post...) và vẫn áp dụng đầy đủ chương trình ưu đãi Freeship như hiện tại.'
    }
  ];

  return (
    <section id="health-blog" className="mt-16 pt-12 border-t border-slate-200 scroll-mt-20">
      
      {/* 1. Header Cẩm Nang Sức Khỏe Chuẩn SEO */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2 border border-emerald-200">
            <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
            <span>Góc Nhìn Chuyên Gia Y Khoa & Dược Phẩm</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Cẩm Nang Sức Khỏe & Hướng Dẫn Sử Dụng TPCN Đúng Cách
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Biên soạn và kiểm duyệt y khoa bởi đội ngũ Dược sĩ Đại học Dược Hà Nội. Cung cấp kiến thức chuẩn xác, cập nhật phác đồ khoa học.
          </p>
        </div>

        {/* Ô tìm kiếm bài viết */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Tìm bài viết, từ khóa y khoa..."
            value={searchArticle}
            onChange={(e) => setSearchArticle(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* 2. Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            {cat === 'all' ? 'Tất Cả Bài Viết' : cat}
          </button>
        ))}
      </div>

      {/* 3. Featured Post (Bài viết nổi bật nhất) */}
      {featuredArticle && !searchArticle && selectedCategory === 'all' && (
        <div 
          onClick={() => onOpenArticle && onOpenArticle(featuredArticle)}
          className="mb-8 group cursor-pointer bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl overflow-hidden shadow-xl border border-slate-800 transition-all hover:border-emerald-500/50"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between h-full text-white">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Bài Viết Nổi Bật
                  </span>
                  <span className="text-slate-400 text-xs font-medium">
                    {featuredArticle.category}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white group-hover:text-emerald-300 transition-colors leading-snug">
                  {featuredArticle.title}
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm mt-3 line-clamp-3 leading-relaxed">
                  {featuredArticle.summary}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs border border-emerald-500/30">
                    <User className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-white font-bold block">{featuredArticle.author}</span>
                    <span className="text-[10px] text-slate-400">{featuredArticle.authorRole}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    {featuredArticle.readTime}
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 transition-colors">
                    <span>Đọc chuyên sâu</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 h-64 lg:h-full relative min-h-[280px]">
              <img
                src={featuredArticle.image}
                alt={featuredArticle.imageAlt || featuredArticle.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-transparent to-transparent"></div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Blog Cards Grid */}
      {filteredArticles.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center text-slate-500 my-6">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-700">Không tìm thấy bài viết nào phù hợp</h4>
          <p className="text-xs text-slate-400 mt-1">Thử thay đổi từ khóa hoặc chọn danh mục khác</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-14">
          {(searchArticle || selectedCategory !== 'all' ? filteredArticles : regularArticles).map((art) => (
            <article
              key={art.id}
              onClick={() => onOpenArticle && onOpenArticle(art)}
              className="group cursor-pointer bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative pt-[56%] overflow-hidden bg-slate-100">
                  <img
                    src={art.image}
                    alt={art.imageAlt || art.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                    {art.category}
                  </span>
                  {art.focusKeyword && (
                    <span className="absolute bottom-2 right-2 bg-emerald-950/80 backdrop-blur-sm text-emerald-300 text-[10px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />
                      {art.focusKeyword}
                    </span>
                  )}
                </div>

                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                    <span className="flex items-center gap-1 font-medium text-slate-700 truncate max-w-[150px]">
                      <User className="w-3 h-3 text-emerald-600 shrink-0" />
                      {art.author}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {art.readTime}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2">
                    {art.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 mt-3 flex items-center justify-between text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                <span>Đọc bài viết chuẩn y khoa</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </article>
          ))}
        </div>
      )}

      {/* 5. FAQ Accordion: Câu Hỏi Thường Gặp */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Giải Đáp Thắc Mắc Khách Hàng
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-2">
            Câu Hỏi Thường Gặp Khi Mua Thực Phẩm Chức Năng
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Hiểu đúng về TPCN Nội Địa và Nhập Ngoại để lựa chọn an toàn cho sức khỏe gia đình
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 bg-slate-50/60 hover:bg-slate-100/60 transition-colors"
                >
                  <span className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 text-xs sm:text-sm text-slate-600 bg-white border-t border-slate-100 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
};
