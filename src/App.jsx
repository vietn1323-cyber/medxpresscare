import React, { useState, useEffect, useMemo } from 'react';
import { PRODUCTS, cleanCountryName } from './data/products';
import { INITIAL_CUSTOMERS } from './data/customers';
import { VERIFIED_REGISTRATIONS } from './data/registrations';
import { DEFAULT_SHIPPING_CARRIERS } from './data/shippingCarriers';
import { DEFAULT_ARTICLES } from './data/articles';
import { DEFAULT_HERO_BANNERS } from './data/banners';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { OriginFilterTabs } from './components/OriginFilterTabs';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { HealthAdvisorModal } from './components/HealthAdvisorModal';
import { VerificationTool } from './components/VerificationTool';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { WishlistModal } from './components/WishlistModal';
import { HealthBlogSection } from './components/HealthBlogSection';
import { ArticleDetailPage } from './components/ArticleDetailPage';
import { ProductsPage } from './components/ProductsPage';
import { VoucherModal } from './components/VoucherModal';
import { DEFAULT_VOUCHERS } from './data/vouchers';
import { INITIAL_REVIEWS } from './data/reviews';
import { Footer } from './components/Footer';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CustomerAuthModal } from './components/CustomerAuthModal';
import { CustomerProfileModal } from './components/CustomerProfileModal';
import { OrderTrackingModal } from './components/OrderTrackingModal';
import { OrderTrackingPage } from './components/OrderTrackingPage';
import { PolicyPage } from './components/PolicyPage';
import { POLICIES } from './data/policies';
import { cleanPrice } from './utils/csvHelper';
import { apiClient } from './services/apiClient';
import { usePWAInstall } from './hooks/usePWAInstall';
import { PWAInstallModal } from './components/PWAInstallModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { MyMedicineCabinetModal } from './components/MyMedicineCabinetModal';
import { generateAiMedicationSchedule, calculateRefillSchedule } from './utils/medicationHelper';
import { 
  initializeOrderTracking, 
  stepOrderToShipping, 
  stepOrderToCompleted, 
  syncCarrierLogisticsStatus,
  stepOrderToReturning,
  stepOrderToWarehouseArrival,
  stepOrderToReturnConfirmed,
  RETURN_REASONS
} from './utils/logisticsHelper';
import { 
  Flame, Clock, ShieldCheck, Sparkles, Stethoscope, 
  PhoneCall, CheckCircle2, ChevronRight, ArrowRight, RotateCcw
} from 'lucide-react';

const INITIAL_ORDERS = [];

const DEFAULT_CONFIG = {
  hotline: '1800 6868',
  bankName: 'Techcombank',
  bankBin: '970407',
  bankAccountNumber: '2989515555',
  bankAccountName: 'NGUYEN DINH VIET',
  telegramBotToken: '',
  telegramChatId: '',
  shippingCarriers: DEFAULT_SHIPPING_CARRIERS,
  heroBanners: DEFAULT_HERO_BANNERS,
  aiProvider: 'gemini',
  aiModel: 'gemini-2.5-flash',
  aiApiKey: '',
  companyName: 'Công ty Cổ phần Dược phẩm MedXpressCare Việt Nam',
  dkkdNumber: '0108923412 - Sở KH&ĐT TP. Hà Nội cấp',
  pharmacyCert: 'Số 452/ĐKKDD-BYT',
  pharmacistInCharge: 'DS. Nguyễn Thu Trang',
  headquartersAddress: 'Tầng 6, Tòa nhà Dược Phẩm MedXpress, Số 168 Cầu Giấy, Quan Hoa, Q. Cầu Giấy, Hà Nội.',
  warehouseAddress: 'KCN Đài Tư, Q. Long Biên, TP. Hà Nội.',
  deliveryScope: 'Hỏa tốc nội thành Hà Nội & Giao hàng nhanh toàn quốc qua đối tác bưu cục.',
  emailPharmacist: 'duocsi@medxpresscare.com',
  emailContract: 'hopdong@medxpresscare.com',
  workingHours: '8:00 - 22:00 tất cả các ngày trong tuần',
  aboutDesc: 'Hệ thống bán lẻ & phân phối Thực phẩm chức năng cao cấp chuẩn Y Khoa. Đảm bảo nguồn gốc xuất xứ minh bạch: Hàng Nội Địa Chuẩn GMP-WHO và Hàng Nhập Ngoại Chính Ngạch (Mỹ, Úc, Nhật, Hàn, Đức).',
  regulatoryWarning: '⚠️ LƯU Ý QUAN TRỌNG TỪ BỘ Y TẾ: Thực phẩm chức năng (Thực phẩm bảo vệ sức khỏe) không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh. Tác dụng của sản phẩm tùy thuộc vào cơ địa và mức độ dung nạp của từng người. Đọc kỹ hướng dẫn sử dụng trước khi dùng.'
};

export default function App() {
  // Navigation & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDosage, setSelectedDosage] = useState('all');
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [originFilter, setOriginFilter] = useState('all'); // all | domestic | imported
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');

  // Products state (Database gốc + các sản phẩm do Admin tự thêm)
  const [productsList, setProductsList] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_custom_products');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.map(p => {
            const country = cleanCountryName(p.countryName);
            const categories = Array.isArray(p.categories) && p.categories.length > 0 
              ? p.categories 
              : (p.category ? [p.category] : ['bo-nao-than-kinh']);
            return {
              ...p,
              countryName: country,
              flag: '',
              categories,
              category: categories[0] || 'bo-nao-than-kinh'
            };
          });
        }
      }
      return PRODUCTS.map(p => ({
        ...p,
        countryName: cleanCountryName(p.countryName),
        flag: ''
      }));
    } catch {
      return PRODUCTS;
    }
  });

  // Available Countries state (Quản lý các quốc gia xuất xứ động cho Admin và Frontend)
  const DEFAULT_AVAILABLE_COUNTRIES = ['Việt Nam', 'Mỹ', 'Úc', 'Nhật Bản', 'Hàn Quốc', 'Đức', 'Pháp', 'Anh'];

  const [availableCountries, setAvailableCountries] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_available_countries');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return Array.from(new Set(parsed.map(cleanCountryName).filter(Boolean)));
        }
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_AVAILABLE_COUNTRIES;
  });

  const handleAddCountry = (newCountry) => {
    const cleaned = cleanCountryName(newCountry);
    if (!cleaned) return;
    setAvailableCountries(prev => {
      if (prev.includes(cleaned)) return prev;
      const next = [...prev, cleaned];
      localStorage.setItem('medxpress_available_countries', JSON.stringify(next));
      return next;
    });
  };

  // Tự động dọn sạch cache trình duyệt (loại bỏ mọi ký tự mã cờ Windows và hậu tố cũ như (USA))
  useEffect(() => {
    const saved = localStorage.getItem('medxpress_custom_products');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          let hasDiff = false;
          const cleaned = parsed.map(p => {
            const cleanC = cleanCountryName(p.countryName);
            if (p.flag || p.countryName !== cleanC) {
              hasDiff = true;
              return { ...p, countryName: cleanC, flag: '' };
            }
            return p;
          });
          if (hasDiff) {
            localStorage.setItem('medxpress_custom_products', JSON.stringify(cleaned));
            setProductsList(cleaned);
          }
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Admin Orders state (Đơn hàng khách đặt thực tế)
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_admin_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Lọc sạch toàn bộ các đơn hàng thử nghiệm cũ nếu còn sót lại trong cache trình duyệt
          const cleaned = parsed.filter(o => !['MXC-892410', 'MXC-741285', 'MXC-339182', 'MXC-883921'].includes(o.id) && !String(o.id).startsWith('MXC-TEST-'));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('medxpress_admin_orders', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Store Config state (Hotline & VietQR bank info & Shipping Carriers)
  const [storeConfig, setStoreConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_store_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_CONFIG,
          ...parsed,
          shippingCarriers: Array.isArray(parsed.shippingCarriers) && parsed.shippingCarriers.length > 0
            ? parsed.shippingCarriers
            : DEFAULT_SHIPPING_CARRIERS,
          heroBanners: Array.isArray(parsed.heroBanners) && parsed.heroBanners.length > 0
            ? parsed.heroBanners
            : DEFAULT_HERO_BANNERS
        };
      }
      return DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });

  // E-Commerce States (Giỏ hàng & Yêu thích lưu localStorage)
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedVoucher, setAppliedVoucher] = useState('FREESHIP');

  // Customer Loyalty & Account States
  const [customersList, setCustomersList] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_customers_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Lọc sạch toàn bộ tài khoản khách hàng mẫu
          const cleaned = parsed.filter(c => !['cust-101', 'cust-102', 'cust-103'].includes(c.id) && !String(c.id).startsWith('cust-test-'));
          if (cleaned.length !== parsed.length) {
            localStorage.setItem('medxpress_customers_db', JSON.stringify(cleaned));
          }
          return cleaned;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  const [currentCustomer, setCurrentCustomer] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_current_customer');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && ['cust-101', 'cust-102', 'cust-103'].includes(parsed.id)) {
          localStorage.removeItem('medxpress_current_customer');
          return null;
        }
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Quản lý các phiên khảo sát nhu cầu & tư vấn Dược sĩ AI cá nhân hóa (Đồng bộ Cloudflare D1)
  const [consultationsList, setConsultationsList] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_consultations_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });
  const [activeAdvisorSession, setActiveAdvisorSession] = useState(null);

  // Cơ sở dữ liệu Số ĐKSP Bộ Y Tế (Hỗ trợ thêm/sửa thủ công & nhập hàng loạt qua file)
  const [registrationsDb, setRegistrationsDb] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_registrations_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
      return VERIFIED_REGISTRATIONS;
    } catch {
      return VERIFIED_REGISTRATIONS;
    }
  });

  // Articles & SEO Handbook State (Cẩm nang y khoa & Bài viết chuẩn SEO)
  const [articlesList, setArticlesList] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_articles_db');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return DEFAULT_ARTICLES;
    } catch {
      return DEFAULT_ARTICLES;
    }
  });

  // Policies State (Danh mục chính sách hoạt động & pháp chế lưu localStorage)
  const [policiesList, setPoliciesList] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_policies_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return POLICIES;
    } catch {
      return POLICIES;
    }
  });

  const handleUpdatePolicies = (newPolicies) => {
    setPoliciesList(newPolicies);
    try {
      localStorage.setItem('medxpress_policies_db', JSON.stringify(newPolicies));
    } catch (e) {
      console.error('Lỗi lưu danh sách chính sách:', e);
    }
    showToast('🛡️ Đã cập nhật và lưu danh sách chính sách thành công!');
  };

  // Dedicated Article Detail Page View (Hiển thị bài viết trên trang riêng thay vì modal nổi)
  const [viewingArticle, setViewingArticle] = useState(null);

  // View mode hiện tại: 'home' (Trang chủ) | 'products' (Trang danh mục sản phẩm) | 'tracking' (Trang tra cứu vận đơn) | 'policy' (Trang chính sách & pháp chế)
  const [currentView, setCurrentView] = useState('home');
  const [trackingPageInitialCode, setTrackingPageInitialCode] = useState('');
  const [policyPageInitialSlug, setPolicyPageInitialSlug] = useState('chinh-sach-giao-hang');

  // Điều hướng chuyển sang Trang Sản Phẩm chuyên biệt với bộ lọc nguồn gốc
  const handleNavigateToProducts = (origin = 'all') => {
    setViewingArticle(null);
    setCurrentView('products');
    setOriginFilter(origin);
    if (origin === 'domestic') {
      setSelectedCountry('VN');
      window.location.hash = '#san-pham?origin=domestic';
    } else if (origin === 'imported') {
      if (selectedCountry === 'VN') setSelectedCountry('all');
      window.location.hash = '#san-pham?origin=imported';
    } else {
      setSelectedCountry('all');
      window.location.hash = '#san-pham';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Điều hướng chuyển sang Trang Tra Cứu Vận Đơn chuyên biệt cho khách hàng
  const handleNavigateToTracking = (code = '') => {
    setViewingArticle(null);
    setCurrentView('tracking');
    setTrackingPageInitialCode(code || '');
    if (code) {
      window.location.hash = `#tra-cuu-van-don?code=${encodeURIComponent(code)}`;
    } else {
      window.location.hash = '#tra-cuu-van-don';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Điều hướng chuyển sang Trang Chính Sách & Pháp Chế
  const handleNavigateToPolicy = (slug = 'chinh-sach-giao-hang') => {
    setViewingArticle(null);
    setCurrentView('policy');
    setPolicyPageInitialSlug(slug || 'chinh-sach-giao-hang');
    window.location.hash = `#chinh-sach?tab=${encodeURIComponent(slug || 'chinh-sach-giao-hang')}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoHome = () => {
    setViewingArticle(null);
    setCurrentView('home');
    setTrackingPageInitialCode('');
    setPolicyPageInitialSlug('chinh-sach-giao-hang');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Đồng bộ bài viết, trang sản phẩm, trang tra cứu vận đơn và các trang chính sách với URL hash
  useEffect(() => {
    const handleHashSync = () => {
      const hash = window.location.hash || '';
      if (hash.startsWith('#cam-nang/')) {
        const slug = hash.replace('#cam-nang/', '').split('?')[0];
        const found = articlesList.find(a => a.slug === slug);
        if (found) {
          setViewingArticle(found);
          return;
        }
      } else if (hash.startsWith('#health-blog?article=')) {
        const slug = hash.replace('#health-blog?article=', '').split('?')[0];
        const found = articlesList.find(a => a.slug === slug);
        if (found) {
          setViewingArticle(found);
          return;
        }
      } else if (hash.startsWith('#san-pham')) {
        setViewingArticle(null);
        setCurrentView('products');
        if (hash.includes('origin=domestic')) {
          setOriginFilter('domestic');
          setSelectedCountry('VN');
        } else if (hash.includes('origin=imported')) {
          setOriginFilter('imported');
          setSelectedCountry('all');
        } else {
          setOriginFilter('all');
          setSelectedCountry('all');
        }
        return;
      } else if (hash.startsWith('#tra-cuu-van-don') || hash.startsWith('#tra-cuu-don-hang')) {
        setViewingArticle(null);
        setCurrentView('tracking');
        const codeMatch = hash.match(/code=([^&]+)/);
        if (codeMatch && codeMatch[1]) {
          setTrackingPageInitialCode(decodeURIComponent(codeMatch[1]));
        }
        return;
      } else if (hash.startsWith('#chinh-sach')) {
        setViewingArticle(null);
        setCurrentView('policy');
        const tabMatch = hash.match(/tab=([^&]+)/);
        if (tabMatch && tabMatch[1]) {
          setPolicyPageInitialSlug(decodeURIComponent(tabMatch[1]));
        } else {
          const slugPart = hash.replace('#chinh-sach/', '').replace('#chinh-sach', '').split('?')[0];
          if (slugPart) {
            setPolicyPageInitialSlug(slugPart);
          }
        }
        return;
      } else if (['#rules', '#shipping', '#giao-hang'].includes(hash)) {
        setViewingArticle(null);
        setCurrentView('policy');
        setPolicyPageInitialSlug('chinh-sach-giao-hang');
        return;
      } else if (['#return', '#doi-tra', '#hoan-tien'].includes(hash)) {
        setViewingArticle(null);
        setCurrentView('policy');
        setPolicyPageInitialSlug('chinh-sach-doi-tra');
        return;
      } else if (['#privacy', '#bao-mat'].includes(hash)) {
        setViewingArticle(null);
        setCurrentView('policy');
        setPolicyPageInitialSlug('chinh-sach-bao-mat');
        return;
      } else if (['#kiem-hang', '#dong-kiem'].includes(hash)) {
        setViewingArticle(null);
        setCurrentView('policy');
        setPolicyPageInitialSlug('chinh-sach-kiem-hang');
        return;
      } else if (['#thanh-toan', '#payment'].includes(hash)) {
        setViewingArticle(null);
        setCurrentView('policy');
        setPolicyPageInitialSlug('chinh-sach-thanh-toan');
        return;
      } else if (['#dieu-khoan', '#terms', '#quy-che'].includes(hash)) {
        setViewingArticle(null);
        setCurrentView('policy');
        setPolicyPageInitialSlug('dieu-khoan-su-dung');
        return;
      }

      if (viewingArticle) {
        setViewingArticle(null);
      }
      if (!hash.startsWith('#san-pham') && !hash.startsWith('#tra-cuu') && !hash.startsWith('#chinh-sach') && (currentView === 'products' || currentView === 'tracking' || currentView === 'policy') && (hash === '' || hash === '#')) {
        setCurrentView('home');
      }
    };

    handleHashSync();
    window.addEventListener('hashchange', handleHashSync);
    return () => window.removeEventListener('hashchange', handleHashSync);
  }, [articlesList, viewingArticle, currentView]);

  const handleOpenArticle = (art) => {
    setViewingArticle(art);
    if (art?.slug) {
      window.location.hash = `#cam-nang/${art.slug}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackFromArticle = () => {
    setViewingArticle(null);
    window.location.hash = '#health-blog';
    setTimeout(() => {
      document.getElementById('health-blog')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Vouchers Management State (Mã giảm giá & Khuyến mãi)
  const [vouchersList, setVouchersList] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_vouchers_db');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Bảo toàn và nâng cấp dữ liệu: loại bỏ các mẫu quà tặng test cũ (vouch-gift-01, vouch-gift-02, QUATANG500, BINHYTE)
          const filteredParsed = parsed.filter(v => 
            v.id !== 'vouch-gift-01' && 
            v.id !== 'vouch-gift-02' && 
            v.code !== 'QUATANG500' && 
            v.code !== 'BINHYTE'
          );
          const voucherMap = new Map();
          DEFAULT_VOUCHERS.forEach(v => voucherMap.set(v.id, v));
          filteredParsed.forEach(v => {
            const defaultItem = voucherMap.get(v.id) || {};
            // Nếu usedCount là số liệu mẫu cũ (142, 524, 89, 65, 41, 168, 92), reset về 0
            const cleanUsedCount = [142, 524, 89, 65, 41, 168, 92].includes(v.usedCount) ? 0 : (v.usedCount || 0);
            voucherMap.set(v.id, {
              ...defaultItem,
              ...v,
              usedCount: cleanUsedCount,
              startDate: v.startDate || defaultItem.startDate || '2026-01-01',
              expiryDate: v.expiryDate || defaultItem.expiryDate || '2026-12-31',
              applicableScope: v.applicableScope || defaultItem.applicableScope || 'all',
              applicableCategories: Array.isArray(v.applicableCategories) ? v.applicableCategories : (defaultItem.applicableCategories || []),
              applicableProducts: Array.isArray(v.applicableProducts) ? v.applicableProducts : (defaultItem.applicableProducts || []),
              minQuantity: v.minQuantity || defaultItem.minQuantity || 1,
              comboTier: v.comboTier !== undefined ? v.comboTier : (defaultItem.comboTier || null),
              giftProductId: v.giftProductId || defaultItem.giftProductId || '',
              giftName: v.giftName || defaultItem.giftName || '',
              giftValue: v.giftValue !== undefined ? v.giftValue : (defaultItem.giftValue || 0),
              giftImage: v.giftImage || defaultItem.giftImage || ''
            });
          });
          return Array.from(voucherMap.values());
        }
      }
      return DEFAULT_VOUCHERS;
    } catch {
      return DEFAULT_VOUCHERS;
    }
  });

  // Customer Reviews State (Đánh giá khách hàng & UGC)
  const [reviewsList, setReviewsList] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_reviews_db');
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Lọc sạch toàn bộ các đánh giá mẫu thử nghiệm cũ khỏi cache trình duyệt
          const isSampleReview = (r) => {
            if (!r || !r.id) return true;
            return (
              r.id.startsWith('rev-vn-') ||
              r.id.startsWith('rev-us-') ||
              r.id.startsWith('rev-au-') ||
              r.id.startsWith('rev-jp-') ||
              r.id.startsWith('rev-kr-') ||
              r.id.startsWith('rev-fr-') ||
              r.id.startsWith('rev-de-') ||
              r.id.startsWith('rev-test-') ||
              /^rev-\d+$/.test(r.id)
            );
          };
          const cleanReviews = parsed.filter(r => !isSampleReview(r));
          if (cleanReviews.length !== parsed.length) {
            localStorage.setItem('medxpress_reviews_db', JSON.stringify(cleanReviews));
          }
          return cleanReviews;
        }
      }
      return INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  // Modal Visibility States
  const [isCustomerAuthOpen, setIsCustomerAuthOpen] = useState(false);
  const [customerAuthInitialTab, setCustomerAuthInitialTab] = useState('login');
  const [isCustomerProfileOpen, setIsCustomerProfileOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAdvisorOpen, setIsAdvisorOpen] = useState(false);
  const [isVerifierOpen, setIsVerifierOpen] = useState(false);
  const [isOrderTrackingOpen, setIsOrderTrackingOpen] = useState(false);
  const [trackingOrderCode, setTrackingOrderCode] = useState('');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [verifierInitialReg, setVerifierInitialReg] = useState('');
  const [activeProductDetail, setActiveProductDetail] = useState(null);

  // Tủ Thuốc AI & Lịch Nhắc Uống Thuốc & Nhắc Tái Đặt Hàng Trước 2 - 3 Ngày
  const [isMedicineCabinetOpen, setIsMedicineCabinetOpen] = useState(false);
  const [medicationsList, setMedicationsList] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_medications_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });
  const [refillsList, setRefillsList] = useState(() => {
    try {
      const saved = localStorage.getItem('medxpress_refills_list');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // Tự động tính số lượng sản phẩm sắp hết cần nhắc tái đặt hàng trước 2 - 3 ngày
  const refillsNearRunoutCount = useMemo(() => {
    const now = new Date();
    return refillsList.filter(r => {
      if (!r.enabled) return false;
      if (r.runoutDateStr) {
        const runout = new Date(r.runoutDateStr);
        const diffDays = Math.ceil((runout.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
        return diffDays <= 3 && diffDays >= 0;
      }
      return r.isNearRunout || (r.daysRemaining <= 3 && r.daysRemaining >= 0);
    }).length;
  }, [refillsList]);

  useEffect(() => {
    try {
      localStorage.setItem('medxpress_medications_list', JSON.stringify(medicationsList));
    } catch {}
  }, [medicationsList]);

  useEffect(() => {
    try {
      localStorage.setItem('medxpress_refills_list', JSON.stringify(refillsList));
    } catch {}
  }, [refillsList]);

  // PWA (Progressive Web App) State & Installation Hook
  const {
    deferredPrompt,
    isInstallable,
    isStandalone,
    isInstalled,
    isIOS,
    isAndroid,
    isBannerDismissed,
    triggerInstall,
    dismissBanner
  } = usePWAInstall();
  const [isPWAInstallModalOpen, setIsPWAInstallModalOpen] = useState(false);

  // Xử lý App Shortcuts & URL Parameters khi mở từ màn hình chính PWA (?open=consultation, ?open=promotions, ...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const openTarget = params.get('open');
      if (openTarget === 'consultation') {
        setIsAdvisorOpen(true);
      } else if (openTarget === 'promotions') {
        setIsVoucherModalOpen(true);
      } else if (openTarget === 'tracking') {
        setIsOrderTrackingOpen(true);
      } else if (openTarget === 'cart') {
        setIsCartOpen(true);
      } else if (openTarget === 'pwa') {
        setIsPWAInstallModalOpen(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Hàm kiểm tra tính hợp lệ của Token Quản Trị Viên (chống bypass giả mạo sessionStorage)
  const isValidAdminToken = (token) => {
    if (!token || typeof token !== 'string' || token.length < 16) return false;
    if (token.startsWith('mock_token_admin_')) {
      const parts = token.split('_');
      const timestamp = parseInt(parts[parts.length - 1], 10);
      if (isNaN(timestamp) || Date.now() - timestamp > 8 * 3600 * 1000) return false;
      return true;
    }
    if (/^[a-f0-9]{64}$/i.test(token)) return true;
    try {
      const decoded = atob(token);
      return decoded.includes('|');
    } catch {
      return false;
    }
  };

  // Function to open Admin: checks session token first
  const handleOpenAdminPortal = () => {
    const token = sessionStorage.getItem('medxpress_admin_token');
    if (token && isValidAdminToken(token)) {
      setIsAdminOpen(true);
    } else {
      if (token) {
        sessionStorage.removeItem('medxpress_admin_token');
      }
      setIsAdminLoginOpen(true);
    }
  };

  // Keyboard shortcut Ctrl+Shift+A & URL hash #admin listener
  useEffect(() => {
    const checkHash = () => {
      if (window.location.hash === '#admin') {
        handleOpenAdminPortal();
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);

    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        handleOpenAdminPortal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('hashchange', checkHash);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Trạng thái kết nối Cloudflare D1 Serverless Database
  const [d1Status, setD1Status] = useState('connecting'); // 'connected' | 'offline'
  const [isD1Loaded, setIsD1Loaded] = useState(false);

  // 1. Tự động đồng bộ hai chiều với Cloudflare D1 Database khi tải trang
  useEffect(() => {
    let isMounted = true;
    async function initCloudSync() {
      try {
        const cloudData = await apiClient.fetchAll();
        if (!isMounted) return;

        if (cloudData && typeof cloudData === 'object') {
          setD1Status('connected');

          // Products
          if (Array.isArray(cloudData.products)) {
            setProductsList(cloudData.products);
            try {
              localStorage.setItem('medxpress_custom_products', JSON.stringify(cloudData.products));
            } catch (e) {
              console.error(e);
            }
          } else {
            apiClient.saveProducts(productsList);
          }

          // Orders
          if (Array.isArray(cloudData.orders)) {
            setOrders(cloudData.orders);
            try {
              localStorage.setItem('medxpress_admin_orders', JSON.stringify(cloudData.orders));
            } catch (e) {
              console.error(e);
            }
          } else {
            apiClient.saveOrdersList(orders);
          }

          // Articles
          if (Array.isArray(cloudData.articles)) {
            setArticlesList(cloudData.articles);
            try {
              localStorage.setItem('medxpress_articles_db', JSON.stringify(cloudData.articles));
            } catch (e) {
              console.error(e);
            }
          } else {
            apiClient.saveArticles(articlesList);
          }

          // Reviews
          if (Array.isArray(cloudData.reviews) && cloudData.reviews.length > 0) {
            const isSampleReview = (r) => {
              if (!r || !r.id) return true;
              return (
                r.id.startsWith('rev-vn-') ||
                r.id.startsWith('rev-us-') ||
                r.id.startsWith('rev-au-') ||
                r.id.startsWith('rev-jp-') ||
                r.id.startsWith('rev-kr-') ||
                r.id.startsWith('rev-fr-') ||
                r.id.startsWith('rev-de-') ||
                r.id.startsWith('rev-test-') ||
                /^rev-\d+$/.test(r.id)
              );
            };
            const reviewMap = new Map();
            INITIAL_REVIEWS.forEach(r => { if (!isSampleReview(r)) reviewMap.set(r.id, r); });
            cloudData.reviews.forEach(r => { if (!isSampleReview(r)) reviewMap.set(r.id, r); });
            const mergedReviews = Array.from(reviewMap.values());
            setReviewsList(mergedReviews);
            try {
              localStorage.setItem('medxpress_reviews_db', JSON.stringify(mergedReviews));
            } catch (e) {
              console.error(e);
            }
          } else {
            apiClient.saveReviews(reviewsList);
          }

          // Store Config
          if (cloudData.storeConfig && typeof cloudData.storeConfig === 'object' && Object.keys(cloudData.storeConfig).length > 0) {
            setStoreConfig(prev => ({ ...prev, ...cloudData.storeConfig }));
          } else {
            apiClient.saveConfig(storeConfig);
          }

          // Customers
          if (Array.isArray(cloudData.customers)) {
            setCustomersList(cloudData.customers);
            try {
              localStorage.setItem('medxpress_customers_db', JSON.stringify(cloudData.customers));
            } catch (e) {
              console.error(e);
            }
          } else {
            apiClient.saveCustomers(customersList);
          }

          // Consultations & Health Surveys
          try {
            const cloudConsultations = await apiClient.fetchConsultations();
            if (Array.isArray(cloudConsultations)) {
              setConsultationsList(cloudConsultations);
              localStorage.setItem('medxpress_consultations_db', JSON.stringify(cloudConsultations));
            }
          } catch (e) {
            console.warn('Sync consultations error:', e);
          }
        } else {
          setD1Status('offline');
        }
      } catch (err) {
        console.warn('D1 Sync notice:', err);
        if (isMounted) setD1Status('offline');
      } finally {
        if (isMounted) setIsD1Loaded(true);
      }
    }

    initCloudSync();
    return () => { isMounted = false; };
  }, []);

  // 2. Tự động lưu lên Cloudflare D1 khi có thay đổi từ Admin hoặc Người dùng (sau khi đã nạp D1)
  useEffect(() => {
    if (!isD1Loaded) return;
    apiClient.saveProducts(productsList);
  }, [productsList, isD1Loaded]);

  useEffect(() => {
    if (!isD1Loaded) return;
    apiClient.saveOrdersList(orders);
  }, [orders, isD1Loaded]);

  useEffect(() => {
    if (!isD1Loaded) return;
    apiClient.saveArticles(articlesList);
  }, [articlesList, isD1Loaded]);

  useEffect(() => {
    if (!isD1Loaded) return;
    apiClient.saveReviews(reviewsList);
  }, [reviewsList, isD1Loaded]);

  useEffect(() => {
    if (!isD1Loaded) return;
    apiClient.saveConfig(storeConfig);
  }, [storeConfig, isD1Loaded]);

  useEffect(() => {
    if (!isD1Loaded) return;
    apiClient.saveCustomers(customersList);
  }, [customersList, isD1Loaded]);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('medxpress_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('medxpress_wishlist', JSON.stringify(wishlist));
    } catch (e) {
      console.error(e);
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('medxpress_admin_orders', JSON.stringify(orders));
    } catch (e) {
      console.error(e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('medxpress_custom_products', JSON.stringify(productsList));
    } catch (e) {
      console.error(e);
    }
  }, [productsList]);

  useEffect(() => {
    try {
      localStorage.setItem('medxpress_store_config', JSON.stringify(storeConfig));
    } catch (e) {
      console.error(e);
    }
  }, [storeConfig]);

  useEffect(() => {
    try {
      localStorage.setItem('medxpress_customers_db', JSON.stringify(customersList));
    } catch (e) {
      console.error(e);
    }
  }, [customersList]);

  useEffect(() => {
    try {
      if (currentCustomer) {
        localStorage.setItem('medxpress_current_customer', JSON.stringify(currentCustomer));
      } else {
        localStorage.removeItem('medxpress_current_customer');
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentCustomer]);

  useEffect(() => {
    try {
      localStorage.setItem('medxpress_registrations_db', JSON.stringify(registrationsDb));
    } catch (e) {
      console.error(e);
    }
  }, [registrationsDb]);

  useEffect(() => {
    try {
      localStorage.setItem('medxpress_vouchers_db', JSON.stringify(vouchersList));
    } catch (e) {
      console.error(e);
    }
  }, [vouchersList]);

  useEffect(() => {
    try {
      localStorage.setItem('medxpress_reviews_db', JSON.stringify(reviewsList));
    } catch (e) {
      console.error(e);
    }
  }, [reviewsList]);

  // Real-time Countdown timer for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 24, seconds: 45 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cart Operations
  const handleAddToCart = (product, qty = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { ...product, quantity: qty }];
    });
    showToast(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: newQty } : item));
  };

  const handleRemoveItem = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Wishlist Operations
  const handleToggleWishlist = (product) => {
    setWishlist(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        showToast(`Đã bỏ ${product.name} khỏi danh sách yêu thích.`);
        return prev.filter(item => item.id !== product.id);
      } else {
        showToast(`Đã thêm ${product.name} vào danh sách yêu thích!`);
        return [...prev, product];
      }
    });
  };

  // Buy Now (Add to cart & directly open Checkout)
  const handleBuyNow = (product, qty = 1) => {
    handleAddToCart(product, qty);
    setActiveProductDetail(null);
    setIsCheckoutOpen(true);
  };

  // Order created callback from CheckoutModal (syncs to Cloudflare D1 and local state)
  const handleOrderCreated = async (newOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    showToast(`Đơn hàng ${newOrder.id} đã được gửi thành công đến Dược sĩ!`);

    // Gửi tức thì lên Cloudflare D1
    apiClient.saveNewOrder(newOrder);

    // Dược sĩ AI tự động lên lịch uống thuốc thông minh & hẹn ngày nhắc tái đặt hàng trước 2 - 3 ngày
    if (Array.isArray(newOrder.items) && newOrder.items.length > 0) {
      const orderDate = newOrder.createdAt || new Date().toISOString();
      const newMeds = [];
      const newRefills = [];

      newOrder.items.forEach(item => {
        const product = productsList.find(p => p.id === item.id) || item;
        // 1. Sinh lịch nhắc uống thuốc AI chuẩn y khoa (Sáng/Tối, trước/sau ăn)
        const medSchedule = generateAiMedicationSchedule(product);
        newMeds.push(medSchedule);

        // 2. Tính toán ngày hết thuốc và thời điểm nhắc tái đặt hàng trước 2 - 3 ngày
        const refillSchedule = calculateRefillSchedule(product, item.quantity || 1, orderDate);
        newRefills.push(refillSchedule);
      });

      // Cập nhật State Tủ thuốc
      setMedicationsList(prev => {
        const merged = [...prev];
        newMeds.forEach(nm => {
          const idx = merged.findIndex(m => m.productId === nm.productId);
          if (idx >= 0) merged[idx] = { ...merged[idx], ...nm };
          else merged.unshift(nm);
        });
        return merged;
      });

      // Cập nhật State Nhắc tái đặt hàng
      setRefillsList(prev => {
        const merged = [...prev];
        newRefills.forEach(nr => {
          const idx = merged.findIndex(r => r.productId === nr.productId);
          if (idx >= 0) merged[idx] = { ...merged[idx], ...nr };
          else merged.unshift(nr);
        });
        return merged;
      });

      // Đồng bộ background lên Cloudflare D1 API
      try {
        newMeds.forEach(med => {
          fetch('/api/reminders/medications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(med)
          }).catch(() => {});
        });
        newRefills.forEach(refill => {
          fetch('/api/reminders/refills', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(refill)
          }).catch(() => {});
        });
      } catch (e) {
        // Safe fallback
      }
    }
  };

  // Cập nhật phương thức thanh toán của đơn hàng khi khách đổi phương thức sau khi đặt
  const handleUpdateOrderPaymentMethod = (orderId, newPaymentMethod) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const updated = {
          ...o,
          paymentMethod: newPaymentMethod,
          paymentStatus: newPaymentMethod === 'cod' ? 'unpaid' : o.paymentStatus,
          status: newPaymentMethod === 'cod' ? 'pending' : o.status
        };
        apiClient.saveNewOrder(updated);
        return updated;
      }
      return o;
    }));
    showToast(`Đã chuyển đơn hàng ${orderId} sang thanh toán ${newPaymentMethod === 'cod' ? 'tiền mặt khi nhận hàng (COD)' : 'Chuyển khoản VietQR'}!`);
  };

  // Nhanh chóng đặt lại sản phẩm từ Tủ thuốc AI / Nhắc tái đặt hàng
  const handleQuickReorder = (item) => {
    const prod = productsList.find(p => p.id === (item.productId || item.id)) || {
      id: item.productId || item.id,
      name: item.name || item.productName,
      price: item.price || 0,
      image: item.image || item.productImage || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300&auto=format&fit=crop&q=80',
      brand: item.brand || 'Chính hãng',
      countryName: item.countryName || 'Chính hãng',
      origin: item.origin || 'domestic',
      inStock: true
    };
    handleAddToCart(prod, 1);
    setIsMedicineCabinetOpen(false);
    setIsCartOpen(true);
    showToast(`Đã thêm "${prod.name}" vào giỏ hàng để bạn tái đặt hàng kịp thời!`);
  };

  // Customer Account & Loyalty Points Handlers
  const handleCustomerLogin = (user) => {
    setCurrentCustomer(user);
    showToast(`Xin chào ${user.fullName}! Bạn đang có ${user.points || 0} điểm thưởng.`);
  };

  const handleCustomerRegister = (newUser) => {
    setCustomersList(prev => [newUser, ...prev]);
    setCurrentCustomer(newUser);
    showToast(`Đăng ký thành công! Bạn nhận được +10 điểm thưởng (10.000₫)!`);
  };

  const handleCustomerLogout = () => {
    setCurrentCustomer(null);
    showToast('Đã đăng xuất khỏi tài khoản.');
  };

  const handleUpdateCustomerInfo = (updatedUser) => {
    setCustomersList(prev => prev.map(c => c.id === updatedUser.id ? updatedUser : c));
    setCurrentCustomer(updatedUser);
    showToast('Đã lưu thông tin khách hàng thành công!');
  };

  const handleUpdateCustomerPoints = (customerId, pointsUsed, pointsEarned, orderId) => {
    setCustomersList(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      const newPoints = Math.max(0, (c.points || 0) - pointsUsed + pointsEarned);
      const newHistory = [...(c.pointsHistory || [])];
      if (pointsUsed > 0) {
        newHistory.push({
          id: 'ph-' + Date.now() + '-u',
          date: new Date().toISOString(),
          orderId,
          type: 'redeem',
          points: pointsUsed,
          desc: `Đổi ${pointsUsed} điểm giảm trừ ${(pointsUsed * 1000).toLocaleString('vi-VN')}₫ cho đơn ${orderId}`
        });
      }
      if (pointsEarned > 0) {
        newHistory.push({
          id: 'ph-' + Date.now() + '-e',
          date: new Date().toISOString(),
          orderId,
          type: 'earn',
          points: pointsEarned,
          desc: `Tích điểm đơn hàng ${orderId} (100k = 1đ)`
        });
      }
      const updated = {
        ...c,
        points: newPoints,
        totalSpent: (c.totalSpent || 0) + (pointsEarned * 100000),
        pointsHistory: newHistory
      };
      // Cập nhật session nếu đúng khách hàng này
      setCurrentCustomer(updated);
      return updated;
    }));
  };

  const handleAdminBonusPoints = (customerId, bonusPoints) => {
    setCustomersList(prev => prev.map(c => {
      if (c.id !== customerId) return c;
      const newPoints = (c.points || 0) + bonusPoints;
      const newHistory = [
        ...(c.pointsHistory || []),
        {
          id: 'ph-' + Date.now() + '-bonus',
          date: new Date().toISOString(),
          type: 'earn',
          points: bonusPoints,
          desc: `Quản trị viên tặng điểm tri ân (+${bonusPoints} điểm)`
        }
      ];
      const updated = { ...c, points: newPoints, pointsHistory: newHistory };
      if (currentCustomer && currentCustomer.id === customerId) {
        setCurrentCustomer(updated);
      }
      return updated;
    }));
    showToast(`Đã tặng +${bonusPoints} điểm tri ân cho khách hàng!`);
  };

  // Quản lý và đồng bộ phiên khảo sát & tư vấn Dược sĩ AI
  const handleSaveConsultation = (consultationData) => {
    if (!consultationData) return;
    setConsultationsList(prev => {
      const idx = prev.findIndex(c => c.id === consultationData.id);
      let updated;
      if (idx >= 0) {
        updated = [...prev];
        updated[idx] = { ...updated[idx], ...consultationData, updatedAt: new Date().toISOString() };
      } else {
        updated = [{ ...consultationData, updatedAt: new Date().toISOString() }, ...prev];
      }
      try {
        localStorage.setItem('medxpress_consultations_db', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    apiClient.saveConsultation(consultationData);

    // Cập nhật hồ sơ sức khỏe khách hàng vào state customers nếu có thông tin khách
    const custId = consultationData.customerId || currentCustomer?.id;
    const custPhone = consultationData.customerPhone || currentCustomer?.phone;
    if (custId || custPhone) {
      setCustomersList(prev => prev.map(c => {
        if ((custId && c.id === custId) || (custPhone && c.phone === custPhone)) {
          const updatedCust = {
            ...c,
            healthProfile: consultationData.healthProfile || c.healthProfile,
            lastConsultationDate: consultationData.updatedAt || new Date().toISOString(),
            lastConcern: consultationData.healthProfile?.primaryConcernTitle || c.lastConcern || ''
          };
          if (currentCustomer && (currentCustomer.id === c.id || currentCustomer.phone === c.phone)) {
            setCurrentCustomer(updatedCust);
          }
          return updatedCust;
        }
        return c;
      }));
    }
  };

  // Admin Operations & Automated Logistics Tracking
  const handleUpdateOrderStatus = async (orderId, newStatus, additionalData = {}) => {
    let toastMessage = `Đã cập nhật trạng thái đơn ${orderId}`;

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        if (newStatus === 'confirmed') {
          const tracked = initializeOrderTracking({ ...o, ...additionalData }, o.shippingMethod, additionalData.isPrinted ? 'print' : 'confirm');
          toastMessage = `✅ Đơn ${orderId}: Dược sĩ xác nhận & kích hoạt tự động tracking với ${tracked.shippingCarrierName || 'Bưu cục'}!`;
          return tracked;
        } else if (newStatus === 'shipping') {
          const tracked = stepOrderToShipping({ ...o, ...additionalData });
          toastMessage = `🚚 Đơn ${orderId}: Bưu tá ${tracked.shippingCarrierName || 'Bưu cục'} đã lấy hàng & đang phát hỏa tốc!`;
          return tracked;
        } else if (newStatus === 'completed') {
          const tracked = stepOrderToCompleted({ ...o, ...additionalData });
          toastMessage = `🏆 Đơn ${orderId}: Giao hàng thành công & Hoàn tất đơn hàng!`;
          return tracked;
        } else if (newStatus === 'returning') {
          const tracked = stepOrderToReturning(o, additionalData.reason);
          toastMessage = `⚠️ Đơn ${orderId}: Bưu cục báo giao thất bại & chuyển hoàn về kho!`;
          return tracked;
        } else if (newStatus === 'returned_pending_check') {
          const tracked = stepOrderToWarehouseArrival(o);
          toastMessage = `📦 Đơn ${orderId}: Kiện hàng hoàn đã về kho - Chờ Dược sĩ kiểm nhận!`;
          return tracked;
        } else if (newStatus === 'returned') {
          const tracked = stepOrderToReturnConfirmed(o, additionalData.inspectionData);
          toastMessage = `✅ Đơn ${orderId}: Dược sĩ đã kiểm nhận hàng hoàn & nhập lại kho GSP thành công!`;
          return tracked;
        } else {
          return { ...o, status: newStatus, ...additionalData };
        }
      }
      return o;
    }));

    showToast(toastMessage);

    const token = sessionStorage.getItem('medxpress_admin_token');
    if (token) {
      try {
        await fetch('/api/orders.php', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ orderId, status: newStatus })
        });
      } catch {
        // Offline fallback
      }
    }
  };

  // Đánh dấu đơn giao thất bại & bưu cục chuyển hoàn về kho
  const handleFailAndReturnOrder = (orderId, reason) => {
    let carrierName = 'Bưu cục';
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const advanced = stepOrderToReturning(o, reason);
        carrierName = advanced.shippingCarrierName || 'Bưu cục';
        return advanced;
      }
      return o;
    }));
    showToast(`⚠️ [${carrierName}] Đơn ${orderId}: Giao thất bại! Chuyển trạng thái sang "Đang chuyển hoàn về kho".`);
  };

  // Đánh dấu bưu tá đã mang kiện hàng hoàn về tới cửa kho MedXpressCare
  const handleWarehouseArrival = (orderId) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return stepOrderToWarehouseArrival(o);
      }
      return o;
    }));
    showToast(`📦 Đơn ${orderId}: Kiện hàng hoàn đã về kho! Chờ Dược sĩ kiểm tra tem niêm phong & xác nhận thủ công.`);
  };

  // Dược sĩ xác nhận THỦ CÔNG đã nhận hàng hoàn về kho & phục hồi tồn kho GSP
  const handleConfirmReturnedOrder = (orderId, inspectionData = {}) => {
    let orderToRestore = null;
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const advanced = stepOrderToReturnConfirmed(o, inspectionData);
        orderToRestore = advanced;
        return advanced;
      }
      return o;
    }));

    // Tự động phục hồi tồn kho sản phẩm nếu Dược sĩ duyệt tái nhập kho
    if (orderToRestore && inspectionData.restoreStock !== false && Array.isArray(orderToRestore.items)) {
      setProductsList(prevProds => {
        return prevProds.map(p => {
          const item = orderToRestore.items.find(i => i.id === p.id);
          if (item) {
            const currentStock = typeof p.stock === 'number' ? p.stock : 50;
            return { ...p, stock: currentStock + (item.quantity || 1) };
          }
          return p;
        });
      });
    }

    showToast(`✅ Đã xác nhận thủ công nhận hàng hoàn đơn ${orderId} & nhập lại kho GSP thành công!`);
  };

  // Đồng bộ bưu cục tức thì (Instant Carrier Sync)
  const handleSyncCarrierStatus = (order) => {
    if (!order) return;
    const nextOrder = syncCarrierLogisticsStatus(order);
    setOrders(prev => prev.map(o => o.id === order.id ? nextOrder : o));
    
    if (nextOrder.status === 'shipping') {
      showToast(`🚚 [${nextOrder.shippingCarrierName || 'Bưu cục'}] Đã lấy hàng! Tự động chuyển: Đang giao hàng.`);
    } else if (nextOrder.status === 'completed') {
      showToast(`🏆 [${nextOrder.shippingCarrierName || 'Bưu cục'}] Giao thành công! Tự động chuyển: Hoàn thành.`);
    } else if (nextOrder.status === 'returned_pending_check') {
      showToast(`📦 [${nextOrder.shippingCarrierName || 'Bưu cục'}] Kiện hàng hoàn đã về kho! Chờ Dược sĩ kiểm nhận thủ công.`);
    } else {
      showToast(`✅ Đã đồng bộ mã vận đơn bưu cục cho đơn ${order.id}`);
    }
  };

  // Background Auto-Tracking Engine: Đã tắt bỏ timer chuyển trạng thái ảo (15s/20s)
  // Đơn hàng chỉ chuyển trạng thái khi Dược sĩ thao tác hoặc khi đồng bộ trực tiếp từ API bưu cục GHN
  useEffect(() => {
    // Không chạy auto-complete ảo để đảm bảo tính toàn vẹn dữ liệu đơn hàng thực tế
  }, []);

  const handleAddProduct = (newProd) => {
    setProductsList(prev => [newProd, ...prev]);
    showToast(`Đã thêm sản phẩm mới: ${newProd.name}!`);
  };

  const handleDeleteProduct = (prodId) => {
    const updated = productsList.filter(p => p.id !== prodId);
    setProductsList(updated);
    try {
      localStorage.setItem('medxpress_custom_products', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    apiClient.saveProductsNow(updated);
    showToast(`Đã xóa sản phẩm khỏi danh sách.`);
  };

  const handleUpdateProduct = (updatedProd) => {
    const updated = productsList.map(p => p.id === updatedProd.id ? updatedProd : p);
    setProductsList(updated);
    try {
      localStorage.setItem('medxpress_custom_products', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    apiClient.saveProductsNow(updated);
    showToast(`Đã cập nhật sản phẩm: ${updatedProd.name}!`);
  };

  const handleBulkDeleteProducts = (prodIds) => {
    if (!Array.isArray(prodIds) || prodIds.length === 0) return;
    const updated = productsList.filter(p => !prodIds.includes(p.id));
    setProductsList(updated);
    try {
      localStorage.setItem('medxpress_custom_products', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    apiClient.saveProductsNow(updated);
    showToast(`✅ Đã xóa ${prodIds.length} sản phẩm thành công!`);
  };

  const handleBulkUpdateProducts = (updatedProducts) => {
    if (!Array.isArray(updatedProducts) || updatedProducts.length === 0) return;
    const map = new Map(updatedProducts.map(p => [p.id, p]));
    setProductsList(prev => prev.map(p => map.has(p.id) ? map.get(p.id) : p));
    showToast(`✅ Đã cập nhật hàng loạt ${updatedProducts.length} sản phẩm thành công!`);
  };

  const handleBulkDeleteArticles = (artIds) => {
    if (!Array.isArray(artIds) || artIds.length === 0) return;
    setArticlesList(prev => prev.filter(a => !artIds.includes(a.id)));
    showToast(`✅ Đã xóa ${artIds.length} bài viết thành công!`);
  };

  const handleBulkUpdateArticles = (updatedArticles) => {
    if (!Array.isArray(updatedArticles) || updatedArticles.length === 0) return;
    const map = new Map(updatedArticles.map(a => [a.id, a]));
    setArticlesList(prev => prev.map(a => map.has(a.id) ? map.get(a.id) : a));
    showToast(`✅ Đã cập nhật hàng loạt ${updatedArticles.length} bài viết thành công!`);
  };

  const handleBulkUpdateOrdersStatus = (orderIds, newStatus) => {
    if (!Array.isArray(orderIds) || orderIds.length === 0) return;
    setOrders(prev => prev.map(o => {
      if (orderIds.includes(o.id)) {
        if (newStatus === 'confirmed') {
          return initializeOrderTracking(o, o.shippingMethod, 'confirm');
        } else if (newStatus === 'shipping') {
          return stepOrderToShipping(o);
        }
        return { ...o, status: newStatus };
      }
      return o;
    }));
    showToast(`✅ Đã cập nhật trạng thái ${orderIds.length} đơn hàng sang "${newStatus}"!`);
  };

  // Quản lý Số ĐKSP Bộ Y Tế (Thủ công & Hàng loạt)
  const handleManualSyncD1 = async () => {
    try {
      showToast('🔄 Đang đồng bộ toàn bộ dữ liệu lên Cloudflare D1...');
      await fetch('/api/init-db').catch(() => null);
      const ok = await apiClient.batchSync({
        products: productsList,
        orders: orders,
        articles: articlesList,
        reviews: reviewsList,
        customers: customersList,
        storeConfig: storeConfig
      });
      if (ok) {
        setD1Status('connected');
        showToast('✅ Đã đồng bộ thành công Sản phẩm, Đơn hàng, Bài viết lên Cloudflare D1!');
      } else {
        showToast('⚠️ Đồng bộ D1 chưa hoàn tất, vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Manual sync error:', err);
      showToast('⚠️ Lỗi kết nối khi đồng bộ D1.');
    }
  };

  const handleAddRegistration = (regNumber, regData) => {
    setRegistrationsDb(prev => ({ ...prev, [regNumber]: regData }));
    showToast(`Đã thêm số ĐKSP: ${regNumber}!`);
  };

  const handleUpdateRegistration = (oldKey, newKey, regData) => {
    setRegistrationsDb(prev => {
      const updated = { ...prev };
      if (oldKey !== newKey) delete updated[oldKey];
      updated[newKey] = regData;
      return updated;
    });
    showToast(`Đã cập nhật số ĐKSP: ${newKey}!`);
  };

  const handleDeleteRegistration = (regNumber) => {
    setRegistrationsDb(prev => {
      const updated = { ...prev };
      delete updated[regNumber];
      return updated;
    });
    showToast(`Đã xóa số ĐKSP: ${regNumber}`);
  };

  const handleBulkImportRegistrations = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return;
    setRegistrationsDb(prev => {
      const updated = { ...prev };
      let count = 0;
      rows.forEach(r => {
        const key = r.regNumber || r.so_dksp || r.regnumber || r['số đksp'] || r.so_dang_ky || r.so_cb || (typeof Object.values(r)[0] === 'string' ? Object.values(r)[0] : '');
        if (key && typeof key === 'string' && key.trim()) {
          const cleanKey = key.trim();
          updated[cleanKey] = {
            name: r.name || r.ten_san_pham || r['tên sản phẩm'] || 'Thực phẩm bảo vệ sức khỏe',
            applicant: r.applicant || r.cong_ty_cong_bo || r['công ty'] || 'Doanh nghiệp Dược phẩm',
            date: r.date || r.ngay_cap || '2024',
            type: r.type || r.loai_hang || 'Thực phẩm bảo vệ sức khỏe Nội Địa',
            inspectStandard: r.inspectStandard || r.tieu_chuan_kiem_dinh || r.inspectstandard || 'GMP-WHO Bộ Y Tế',
            origin: r.origin || r.xuat_xu || 'Việt Nam',
            status: r.status || r.trang_thai || 'Đã cấp phép lưu hành toàn quốc'
          };
          count++;
        }
      });
      try {
        localStorage.setItem('medxpress_registrations_db', JSON.stringify(updated));
      } catch (e) {
        console.error('Lỗi lưu registrations:', e);
      }
      return updated;
    });
    showToast(`Đã nạp thành công ${rows.length} số ĐKSP vào cơ sở dữ liệu!`);
  };

  // Nhập sản phẩm hàng loạt qua file CSV/JSON
  const handleBulkImportProducts = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return;

    // Helper chuẩn hóa danh mục sức khỏe (hỗ trợ chọn hoặc điền nhiều nhóm phân cách bởi phẩy, chấm phẩy, gạch chéo)
    const resolveCategories = (input) => {
      if (!input) return ['bone_joint'];
      let rawList = [];
      if (Array.isArray(input)) {
        rawList = input;
      } else if (typeof input === 'string') {
        rawList = input.split(/[,;\/|]/).map(s => s.trim()).filter(Boolean);
      }
      if (rawList.length === 0) return ['bone_joint'];

      const matchSingleCategory = (cat) => {
        if (!cat) return null;
        const c = String(cat).toLowerCase().trim();
        if (['bone_joint', 'cardio', 'brain_nerve', 'beauty_skin', 'immunity', 'digestive_liver', 'mens_health', 'womens_health', 'kids_mom', 'diabetes', 'eye_care', 'weight_loss', 'respiratory'].includes(c)) {
          return c;
        }
        if (c.includes('khớp') || c.includes('xương') || c.includes('gout')) return 'bone_joint';
        if (c.includes('tim') || c.includes('huyết áp') || c.includes('mạch')) return 'cardio';
        if (c.includes('não') || c.includes('tuần hoàn') || c.includes('trí nhớ')) return 'brain_nerve';
        if (c.includes('da') || c.includes('collagen') || c.includes('làm đẹp') || c.includes('sắc đẹp')) return 'beauty_skin';
        if (c.includes('đề kháng') || c.includes('miễn dịch') || c.includes('vitamin')) return 'immunity';
        if (c.includes('gan') || c.includes('tiêu hóa') || c.includes('dạ dày') || c.includes('men')) return 'digestive_liver';
        if (c.includes('sinh lý') || c.includes('phái mạnh') || c.includes('nam') || c.includes('thận')) return 'mens_health';
        if (c.includes('nội tiết') || c.includes('tiền mãn kinh') || c.includes('phụ nữ')) return 'womens_health';
        if (c.includes('mẹ') || c.includes('bé') || c.includes('bầu') || c.includes('trẻ em')) return 'kids_mom';
        if (c.includes('tiểu đường') || c.includes('đường huyết')) return 'diabetes';
        if (c.includes('mắt') || c.includes('thị lực')) return 'eye_care';
        if (c.includes('giảm cân') || c.includes('detox') || c.includes('thải độc')) return 'weight_loss';
        if (c.includes('phổi') || c.includes('hô hấp') || c.includes('ho')) return 'respiratory';
        return null;
      };

      const matched = [];
      rawList.forEach(item => {
        const cat = matchSingleCategory(item);
        if (cat && !matched.includes(cat)) {
          matched.push(cat);
        }
      });
      return matched.length > 0 ? matched : ['bone_joint'];
    };

    // Helper xác định nguồn gốc xuất xứ
    const resolveOrigin = (r) => {
      const originStr = String(r.originType || r.origintype || r.xuat_xu_noi_dia_hay_nhap_khau || '').toLowerCase();
      const countryStr = String(r.countryName || r.countryname || r.quoc_gia || r.origin || r.xuat_xu || '').toLowerCase();

      const isImported = originStr.includes('nhap') || originStr.includes('import') ||
        countryStr.includes('mỹ') || countryStr.includes('usa') || countryStr.includes('us') ||
        countryStr.includes('úc') || countryStr.includes('australia') || countryStr.includes('au') ||
        countryStr.includes('nhật') || countryStr.includes('japan') || countryStr.includes('jp') ||
        countryStr.includes('hàn') || countryStr.includes('korea') || countryStr.includes('kr') ||
        countryStr.includes('đức') || countryStr.includes('germany') || countryStr.includes('de');

      if (!isImported) {
        return {
          originType: 'domestic',
          countryCode: 'VN',
          countryName: 'Việt Nam',
          flag: ''
        };
      }

      if (countryStr.includes('mỹ') || countryStr.includes('usa') || countryStr.includes('us')) {
        return { originType: 'imported', countryCode: 'US', countryName: 'Mỹ', flag: '' };
      }
      if (countryStr.includes('úc') || countryStr.includes('australia') || countryStr.includes('au')) {
        return { originType: 'imported', countryCode: 'AU', countryName: 'Úc', flag: '' };
      }
      if (countryStr.includes('nhật') || countryStr.includes('japan') || countryStr.includes('jp')) {
        return { originType: 'imported', countryCode: 'JP', countryName: 'Nhật Bản', flag: '' };
      }
      if (countryStr.includes('hàn') || countryStr.includes('korea') || countryStr.includes('kr')) {
        return { originType: 'imported', countryCode: 'KR', countryName: 'Hàn Quốc', flag: '' };
      }
      if (countryStr.includes('đức') || countryStr.includes('germany') || countryStr.includes('de')) {
        return { originType: 'imported', countryCode: 'DE', countryName: 'Đức', flag: '' };
      }

      return {
        originType: 'imported',
        countryCode: 'OTHER',
        countryName: cleanCountryName(r.countryName || r.countryname || r.quoc_gia || 'Nhập Khẩu'),
        flag: ''
      };
    };

    const newProducts = rows.map((r, idx) => {
      const originInfo = resolveOrigin(r);
      const categories = resolveCategories(r.categories || r.category || r.nhom_cong_dung || r.danh_muc || r.nhom_suc_khoe || r.nhom_suc_khoe_benh_ly);
      const primaryCategory = categories[0] || 'bone_joint';
      const price = cleanPrice(r.price || r.gia_ban, 350000);
      let originalPrice = cleanPrice(r.originalPrice || r.originalprice || r.gia_goc, 0);
      if (originalPrice < price) {
        originalPrice = Math.round(price * 1.15 / 1000) * 1000;
      }
      let discountPercent = cleanPrice(r.discountPercent || r.discountpercent || r.giam_gia, 0);
      if (discountPercent <= 0 && originalPrice > price) {
        discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
      }

      const rawName = r.name || r.ten_san_pham || (typeof Object.values(r)[0] === 'string' ? Object.values(r)[0] : '') || `Sản phẩm ${idx + 1}`;
      const regNum = r.regNumber || r.regnumber || r.so_dksp || `${Math.floor(1000 + Math.random() * 9000)}/2024/ĐKSP`;

      return {
        id: (originInfo.originType === 'domestic' ? 'vn-b-' : 'imp-b-') + Date.now() + '-' + idx,
        name: rawName,
        brand: r.brand || r.thuong_hieu || (originInfo.originType === 'domestic' ? 'Dược Phẩm Việt Nam' : 'MedXpress USA'),
        price,
        originalPrice,
        discountPercent,
        originType: originInfo.originType,
        countryCode: originInfo.countryCode,
        countryName: originInfo.countryName,
        flag: originInfo.flag,
        category: primaryCategory,
        categories,
        dosageForm: r.dosageForm || r.dosageform || r.dang_bao_che || 'tablet',
        targetAudience: r.targetAudience || r.targetaudience || r.doi_tuong || 'all',
        packaging: r.packaging || r.quy_cach_dong_goi || 'Hộp 60 viên',
        regNumber: regNum,
        image: r.image || (originInfo.originType === 'domestic' 
          ? 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80'),
        shortDesc: r.shortDesc || r.shortdesc || r.mo_ta_ngan || `${rawName} hỗ trợ tăng cường sức khỏe, đạt chuẩn an toàn y tế và được kiểm định nghiêm ngặt.`,
        usage: r.usage || r.lieu_dung_huong_dan || 'Uống 1-2 viên/ngày sau bữa ăn cùng nước ấm.',
        ingredients: Array.isArray(r.ingredients) ? r.ingredients : [{ name: 'Hoạt chất bổ sung tiêu chuẩn', amount: 'GMP/FDA' }],
        benefits: Array.isArray(r.benefits) ? r.benefits : ['Hỗ trợ sức khỏe toàn diện', 'Tăng cường đề kháng tự nhiên'],
        contraindications: 'Không dùng cho người mẫn cảm với bất kỳ thành phần nào của sản phẩm.',
        rating: 5.0,
        reviewsCount: 1,
        soldCount: Math.floor(Math.random() * 50) + 10,
        inStock: true
      };
    });

    setProductsList(prev => {
      const updated = [...newProducts, ...prev];
      try {
        localStorage.setItem('medxpress_custom_products', JSON.stringify(updated));
      } catch (err) {
        console.error('Lỗi lưu custom products:', err);
      }
      return updated;
    });

    // Đồng thời đồng bộ các số ĐKSP của sản phẩm mới vào cơ sở dữ liệu tra cứu Bộ Y Tế
    setRegistrationsDb(prev => {
      const updated = { ...prev };
      newProducts.forEach(prod => {
        if (prod.regNumber && typeof prod.regNumber === 'string' && prod.regNumber.trim() && !updated[prod.regNumber.trim()]) {
          updated[prod.regNumber.trim()] = {
            name: prod.name,
            applicant: prod.brand || 'Nhà Phân Phối MedXpress',
            date: '2024',
            type: prod.originType === 'domestic' ? 'Thực phẩm bảo vệ sức khỏe Nội Địa' : 'Thực phẩm bảo vệ sức khỏe Nhập Khẩu',
            inspectStandard: prod.originType === 'domestic' ? 'GMP-WHO Bộ Y Tế' : 'FDA/USP & Cục ATTP Bộ Y Tế',
            origin: prod.countryName || 'Việt Nam',
            status: 'Đã cấp phép lưu hành toàn quốc'
          };
        }
      });
      try {
        localStorage.setItem('medxpress_registrations_db', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    showToast(`Đã nạp thành công ${newProducts.length} sản phẩm vào kho hàng!`);
  };

  const handleUpdateStoreConfig = (newCfg) => {
    setStoreConfig(newCfg);
    showToast(`Đã lưu cấu hình cửa hàng thành công!`);
  };

  // Quản lý Cẩm Nang & Bài Viết Y Khoa Chuẩn SEO
  const handleAddArticle = (newArt) => {
    setArticlesList(prev => {
      const updated = [newArt, ...prev];
      try {
        localStorage.setItem('medxpress_articles_db', JSON.stringify(updated));
      } catch (err) {
        console.error('Lỗi lưu bài viết vào localStorage:', err);
      }
      return updated;
    });
    showToast(`Đã xuất bản bài viết chuẩn SEO: "${newArt.title}"!`);
  };

  const handleUpdateArticle = (updatedArt) => {
    setArticlesList(prev => {
      const updated = prev.map(a => a.id === updatedArt.id ? updatedArt : a);
      try {
        localStorage.setItem('medxpress_articles_db', JSON.stringify(updated));
      } catch (err) {
        console.error('Lỗi cập nhật bài viết vào localStorage:', err);
      }
      return updated;
    });
    if (viewingArticle?.id === updatedArt.id) {
      setViewingArticle(updatedArt);
    }
    showToast(`Đã cập nhật bài viết: "${updatedArt.title}"!`);
  };

  const handleDeleteArticle = (artId) => {
    setArticlesList(prev => {
      const updated = prev.filter(a => a.id !== artId);
      try {
        localStorage.setItem('medxpress_articles_db', JSON.stringify(updated));
      } catch (err) {
        console.error('Lỗi xóa bài viết khỏi localStorage:', err);
      }
      return updated;
    });
    if (viewingArticle?.id === artId) {
      setViewingArticle(null);
      window.location.hash = '';
    }
    showToast(`Đã xóa bài viết khỏi Cẩm nang sức khỏe.`);
  };

  // Voucher CRUD handlers
  const handleAddVoucher = (newVoucher) => {
    setVouchersList(prev => [newVoucher, ...prev]);
    showToast(`Đã tạo mã voucher "${newVoucher.code}" thành công!`);
  };

  const handleUpdateVoucher = (updated) => {
    setVouchersList(prev => prev.map(v => v.id === updated.id ? updated : v));
    showToast(`Đã cập nhật mã voucher "${updated.code}"!`);
  };

  const handleDeleteVoucher = (vId) => {
    setVouchersList(prev => prev.filter(v => v.id !== vId));
    showToast(`Đã xóa mã voucher khỏi hệ thống!`);
  };

  // Review CRUD handlers
  const handleAddReview = (newReview) => {
    const formattedReview = {
      ...newReview,
      id: newReview.id || `rev-${Date.now()}`,
      createdAt: newReview.createdAt || new Date().toISOString().split('T')[0],
      status: newReview.status || 'approved',
      isVerifiedPurchase: newReview.isVerifiedPurchase !== undefined ? newReview.isVerifiedPurchase : true,
      likes: newReview.likes || 0
    };

    setReviewsList(prev => [formattedReview, ...prev]);

    // Đồng bộ cập nhật điểm đánh giá & số lượng review trong productsList
    if (formattedReview.productId) {
      setProductsList(prev => prev.map(p => {
        if (p.id === formattedReview.productId) {
          const currentCount = p.reviewsCount || 0;
          const currentRating = p.rating || 5.0;
          const newCount = currentCount + 1;
          const newRating = Number(((currentRating * currentCount + (formattedReview.rating || 5)) / newCount).toFixed(1));
          return { ...p, rating: newRating, reviewsCount: newCount };
        }
        return p;
      }));
    }

    showToast(`Đã thêm đánh giá thành công!`);
  };

  const handleUpdateReviewStatus = (revId, newStatus) => {
    setReviewsList(prev => prev.map(r => r.id === revId ? { ...r, status: newStatus } : r));
    showToast(`Đã cập nhật trạng thái hiển thị đánh giá!`);
  };

  const handleAddPharmacistReply = (revId, replyText, pharmacistName = 'DS. CKI Nguyễn Thu Trang') => {
    setReviewsList(prev => prev.map(r => r.id === revId ? {
      ...r,
      pharmacistReply: replyText,
      pharmacistName,
      replyDate: new Date().toISOString().split('T')[0]
    } : r));
    showToast(`Đã lưu phản hồi tư vấn y khoa của Dược sĩ!`);
  };

  const handleDeleteReview = (revId) => {
    setReviewsList(prev => prev.filter(r => r.id !== revId));
    showToast(`Đã xóa đánh giá khỏi hệ thống.`);
  };

  // Open Verifier with predefined RegNumber
  const handleOpenVerifierWithReg = (regNumber) => {
    setVerifierInitialReg(regNumber);
    setActiveProductDetail(null);
    setIsVerifierOpen(true);
  };

  // Filtered and Sorted Products
  const filteredProducts = useMemo(() => {
    return productsList.filter(p => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = p.name?.toLowerCase().includes(q);
        const matchBrand = p.brand?.toLowerCase().includes(q);
        const matchCountry = p.countryName?.toLowerCase().includes(q);
        const matchReg = p.regNumber?.toLowerCase().includes(q);
        const matchIngredients = p.ingredients?.some(i => i.name.toLowerCase().includes(q));
        if (!matchName && !matchBrand && !matchCountry && !matchReg && !matchIngredients) {
          return false;
        }
      }

      // 2. Origin Filter
      if (originFilter === 'domestic' && p.originType !== 'domestic') return false;
      if (originFilter === 'imported' && p.originType !== 'imported') return false;

      // 3. Country Filter
      if (selectedCountry !== 'all') {
        const cleanPCountry = cleanCountryName(p.countryName || '');
        const targetClean = cleanCountryName(selectedCountry);
        
        const isTargetVN = targetClean === 'Việt Nam' || selectedCountry === 'VN';
        if (isTargetVN) {
          if (p.originType !== 'domestic' && cleanPCountry !== 'Việt Nam' && p.countryCode !== 'VN') return false;
        } else {
          const matchCode = p.countryCode && p.countryCode.toLowerCase() === selectedCountry.toLowerCase();
          const matchName = cleanPCountry.toLowerCase() === targetClean.toLowerCase() ||
                            cleanPCountry.toLowerCase() === selectedCountry.toLowerCase();
          if (!matchCode && !matchName) return false;
        }
      }

      // 4. Category Filter (Kiểm tra sản phẩm có thuộc nhóm sức khỏe được chọn hay không)
      if (selectedCategory !== 'all') {
        const prodCats = Array.isArray(p.categories) && p.categories.length > 0
          ? p.categories
          : [p.category].filter(Boolean);
        if (!prodCats.includes(selectedCategory)) return false;
      }

      // 4b. Dosage Form Filter
      if (selectedDosage !== 'all' && p.dosageForm !== selectedDosage) return false;

      // 4c. Target Audience Filter
      if (selectedAudience !== 'all' && p.targetAudience !== 'all' && p.targetAudience !== selectedAudience) return false;

      // 4d. Brand Filter
      if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;

      // 5. Price Range Filter
      if (priceRange === 'under_300' && p.price >= 300000) return false;
      if (priceRange === '300_600' && (p.price < 300000 || p.price > 600000)) return false;
      if (priceRange === '600_1000' && (p.price < 600000 || p.price > 1000000)) return false;
      if (priceRange === 'over_1000' && p.price <= 1000000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'best_seller') return b.soldCount - a.soldCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // featured
    });
  }, [productsList, searchQuery, originFilter, selectedCountry, selectedCategory, selectedDosage, selectedAudience, selectedBrand, priceRange, sortBy]);

  // Flash sale products subset
  const flashSaleProducts = useMemo(() => {
    return productsList.filter(p => p.isFlashSale);
  }, [productsList]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 w-full max-w-full overflow-x-hidden">
      
      {/* 1. Header Navigation */}
      <Header
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        originFilter={originFilter}
        setOriginFilter={setOriginFilter}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenVerifier={() => { setVerifierInitialReg(''); setIsVerifierOpen(true); }}
        onOpenOrderTracking={() => setIsOrderTrackingOpen(true)}
        onNavigateToTracking={handleNavigateToTracking}
        customer={currentCustomer}
        onOpenAuthModal={() => { setCustomerAuthInitialTab('login'); setIsCustomerAuthOpen(true); }}
        onOpenProfileModal={() => setIsCustomerProfileOpen(true)}
        onOpenVouchers={() => setIsVoucherModalOpen(true)}
        onGoHome={handleGoHome}
        currentView={currentView}
        onNavigateToProducts={handleNavigateToProducts}
        onNavigateToPolicy={handleNavigateToPolicy}
        hotline={storeConfig.hotline}
        products={productsList}
        onOpenProductDetail={(p) => setActiveProductDetail(p)}
        onOpenPWAInstall={() => setIsPWAInstallModalOpen(true)}
        onOpenMedicineCabinet={() => setIsMedicineCabinetOpen(true)}
        refillsNearRunoutCount={refillsNearRunoutCount}
      />

      {/* Hiển thị Trang Chi Tiết Bài Viết (Full-Page View), Trang Chính Sách, Trang Tra Cứu Vận Đơn, Trang Sản Phẩm Chuyên Biệt, hoặc Trang Chủ */}
      {viewingArticle ? (
        <ArticleDetailPage
          article={viewingArticle}
          allArticles={articlesList}
          products={productsList}
          onBack={handleBackFromArticle}
          onSelectArticle={handleOpenArticle}
          onSelectProduct={(p) => setActiveProductDetail(p)}
          onAddToCart={handleAddToCart}
          hotline={storeConfig.hotline}
        />
      ) : currentView === 'policy' ? (
        <PolicyPage
          initialSlug={policyPageInitialSlug}
          onGoHome={handleGoHome}
          onOpenAdvisor={() => setIsAdvisorOpen(true)}
          hotline={storeConfig.hotline}
          policies={policiesList}
        />
      ) : currentView === 'tracking' ? (
        <OrderTrackingPage
          orders={orders}
          initialCode={trackingPageInitialCode}
          onGoHome={handleGoHome}
          onOpenAdvisor={() => setIsAdvisorOpen(true)}
          onOpenProductDetail={(p) => setActiveProductDetail(p)}
          hotline={storeConfig.hotline}
        />
      ) : currentView === 'products' ? (
        <ProductsPage
          products={filteredProducts}
          allProducts={productsList}
          availableCountries={availableCountries}
          originFilter={originFilter}
          setOriginFilter={setOriginFilter}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDosage={selectedDosage}
          setSelectedDosage={setSelectedDosage}
          selectedAudience={selectedAudience}
          setSelectedAudience={setSelectedAudience}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          sortBy={sortBy}
          setSortBy={setSortBy}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onAddToCart={handleAddToCart}
          onOpenDetail={(p) => setActiveProductDetail(p)}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onBackHome={handleGoHome}
          onNavigateToProducts={handleNavigateToProducts}
          onOpenAdvisor={() => setIsAdvisorOpen(true)}
          vouchers={vouchersList}
        />
      ) : (
        <>
          {/* 2. Hero Banner với Dual Origin Showcase */}
          <HeroBanner
            onSelectOrigin={(origin) => handleNavigateToProducts(origin)}
            onOpenAdvisor={() => setIsAdvisorOpen(true)}
            onOpenVerifier={() => { setVerifierInitialReg(''); setIsVerifierOpen(true); }}
            banners={storeConfig?.heroBanners || DEFAULT_HERO_BANNERS}
            hotline={storeConfig?.hotline}
          />

          {/* Main Container */}
          <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full" id="catalog-section">

        {/* 3. Flash Sale Giờ Vàng Section */}
        <section className="mb-12 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600 rounded-3xl p-5 sm:p-7 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md text-amber-200">
                <Flame className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold tracking-wider bg-white text-rose-700 px-2.5 py-0.5 rounded-full">
                    Ưu Đãi Trong Ngày
                  </span>
                  <span className="text-xs text-rose-100 font-medium hidden sm:inline">
                    Cam kết giá tốt nhất thị trường
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mt-1">
                  Flash Sale Dược Phẩm 24H
                </h3>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-2 bg-black/25 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 self-start md:self-auto">
              <Clock className="w-4 h-4 text-amber-300" />
              <span className="text-xs font-semibold mr-1">Kết thúc sau:</span>
              <div className="flex items-center gap-1 font-mono font-black text-sm">
                <span className="bg-white text-slate-900 px-2 py-1 rounded-lg">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-white text-slate-900 px-2 py-1 rounded-lg">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span>:</span>
                <span className="bg-white text-slate-900 px-2 py-1 rounded-lg">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>

          {/* Flash Sale Product Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {flashSaleProducts.slice(0, 4).map((p) => {
              const isDomestic = p.originType === 'domestic';
              return (
                <div 
                  key={p.id}
                  onClick={() => setActiveProductDetail(p)}
                  className="bg-white rounded-2xl p-3.5 text-slate-900 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="relative pt-[75%] rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        -{p.discountPercent}%
                      </span>
                      <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isDomestic ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isDomestic ? 'Nội Địa Chuẩn GMP' : `Nhập Khẩu ${cleanCountryName(p.countryName)}`}
                      </span>
                    </div>

                    <div className="text-[11px] font-bold text-emerald-700 truncate">{p.brand}</div>
                    <h4 className="font-bold text-xs text-slate-900 line-clamp-2 mt-0.5 leading-snug">
                      {p.name}
                    </h4>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100">
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-rose-600">
                        {p.price.toLocaleString('vi-VN')}₫
                      </span>
                      <span className="text-xs text-slate-400 line-through">
                        {p.originalPrice.toLocaleString('vi-VN')}₫
                      </span>
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: '84%' }} />
                      </div>
                      <div className="text-[10px] text-slate-500 flex justify-between font-medium">
                        <span>Đã bán 84%</span>
                        <span className="text-rose-600 font-bold">Sắp cháy hàng</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Origin & Smart Filter Navigation */}
        <OriginFilterTabs
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          originFilter={originFilter}
          setOriginFilter={setOriginFilter}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
          availableCountries={availableCountries}
          productsList={productsList}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDosage={selectedDosage}
          setSelectedDosage={setSelectedDosage}
          selectedAudience={selectedAudience}
          setSelectedAudience={setSelectedAudience}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          sortBy={sortBy}
          setSortBy={setSortBy}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          totalResults={filteredProducts.length}
          onResetFilters={() => {
            setSearchQuery('');
            setOriginFilter('all');
            setSelectedCountry('all');
            setSelectedCategory('all');
            setSelectedDosage('all');
            setSelectedAudience('all');
            setSelectedBrand('all');
            setPriceRange('all');
          }}
        />

        {/* 5. Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 my-8 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <RotateCcw className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Không tìm thấy sản phẩm phù hợp</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Không có sản phẩm nào khớp với bộ lọc hiện tại. Quý khách vui lòng thử tìm kiếm với từ khóa khác hoặc đặt lại bộ lọc.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setOriginFilter('all');
                setSelectedCountry('all');
                setSelectedCategory('all');
                setSelectedDosage('all');
                setSelectedAudience('all');
                setSelectedBrand('all');
                setPriceRange('all');
              }}
              className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
            >
              Đặt Lại Toàn Bộ Bộ Lọc
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onOpenDetail={(p) => setActiveProductDetail(p)}
                isWishlisted={wishlist.some(item => item.id === product.id)}
                onToggleWishlist={handleToggleWishlist}
                vouchers={vouchersList}
              />
            ))}
          </div>
        )}

        {/* 6. Dual Origin Commitment Spotlight Banner */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-3xl bg-gradient-to-br from-rose-50 to-orange-50 border border-rose-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-rose-100 text-rose-800 rounded-full border border-rose-300">
                  Dược Liệu Việt Nam
                </span>
                <span className="text-xs font-bold px-3 py-1 bg-rose-600 text-white rounded-full">
                  Chuẩn GMP-WHO & OCOP
                </span>
              </div>
              <h3 className="text-lg font-black text-rose-950">
                Vì Sao Nên Tin Dùng TPCN Nội Địa Việt Nam?
              </h3>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                Việt Nam sở hữu kho tàng dược liệu phong phú: Sâm Ngọc Linh Kon Tum chứa 52 saponin quý, Đông Trùng Hạ Thảo Sa Pa ở độ cao 1.600m, Tinh nghệ Nano Curcumin OIC New... Các nhà máy sản xuất hiện đại đều đạt chứng nhận GMP-WHO của Bộ Y Tế, phù hợp tối ưu với cơ địa người Việt và giá thành rất hợp lý.
              </p>
            </div>
            <button
              onClick={() => handleNavigateToProducts('domestic')}
              className="mt-4 text-xs font-bold text-rose-700 flex items-center gap-1 hover:text-rose-900 cursor-pointer"
            >
              <span>Xem toàn bộ gian hàng Nội Địa</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-br from-sky-50 to-blue-50 border border-blue-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-blue-100 text-blue-800 rounded-full border border-blue-300">
                  Quốc Tế Chính Ngạch
                </span>
                <span className="text-xs font-bold px-3 py-1 bg-blue-600 text-white rounded-full">
                  Nhập Khẩu Chính Ngạch
                </span>
              </div>
              <h3 className="text-lg font-black text-sky-950">
                Vì Sao Nên Mua TPCN Nhập Khẩu Tại MedXpressCare?
              </h3>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                Nói KHÔNG với hàng xách tay trôi nổi, hàng tráo vỏ cận date! 100% sản phẩm TPCN ngoại (Mỹ, Úc, Nhật, Hàn, Đức) tại MedXpressCare đều có giấy tiếp nhận đăng ký bản công bố của Cục ATTP Bộ Y Tế, tem phụ tiếng Việt theo luật, mã vạch kiểm tra hải quan và tem cào SMS chống hàng giả của Bộ Công An.
              </p>
            </div>
            <button
              onClick={() => handleNavigateToProducts('imported')}
              className="mt-4 text-xs font-bold text-blue-700 flex items-center gap-1 hover:text-blue-900 cursor-pointer"
            >
              <span>Xem toàn bộ gian hàng Nhập Ngoại</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7. Health Blog & Expert Advice & FAQ Section */}
        <HealthBlogSection 
          articles={articlesList}
          products={productsList}
          onSelectProduct={(p) => setActiveProductDetail(p)}
          onOpenArticle={handleOpenArticle}
        />

      </main>
    </>
  )}

      {/* 8. Footer */}
      <Footer 
        onOpenVerifier={() => { setVerifierInitialReg(''); setIsVerifierOpen(true); }}
        onOpenAdvisor={() => setIsAdvisorOpen(true)}
        onOpenAdmin={handleOpenAdminPortal}
        onNavigateToTracking={handleNavigateToTracking}
        onNavigateToPolicy={handleNavigateToPolicy}
        onOpenPWAInstall={() => setIsPWAInstallModalOpen(true)}
        hotline={storeConfig.hotline}
        storeConfig={storeConfig}
        policies={policiesList}
      />

      {/* Floating Call to Action Buttons (Dành riêng cho khách hàng: Dược sĩ tư vấn & Hotline) */}
      <div className="fixed bottom-5 right-5 z-40 flex flex-col gap-2.5">
        <button
          onClick={() => setIsAdvisorOpen(true)}
          className="group flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-xl shadow-emerald-700/40 transition-all hover:scale-105 active:scale-95"
          title="Dược Sĩ AI Tư Vấn"
        >
          <div className="relative">
            <Stethoscope className="w-5 h-5 text-emerald-200" />
            <span className="animate-ping absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
          </div>
          <span className="font-bold text-xs hidden sm:inline">Dược Sĩ AI Tư Vấn</span>
        </button>

        <a
          href={`tel:${storeConfig.hotline.replace(/\s+/g, '')}`}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 p-3 sm:px-4 sm:py-3 rounded-full shadow-xl shadow-amber-600/30 transition-all hover:scale-105 active:scale-95 font-bold text-xs"
          title="Tổng đài miễn cước"
        >
          <PhoneCall className="w-5 h-5 text-slate-900 animate-bounce" />
          <span className="hidden sm:inline">{storeConfig.hotline}</span>
        </a>
      </div>

      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-slide-down border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Admin Authentication Login Modal (Chỉ Quản Trị Viên) */}
      {isAdminLoginOpen && (
        <AdminLoginModal
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)}
          onLoginSuccess={() => {
            setIsAdminLoginOpen(false);
            setIsAdminOpen(true);
          }}
        />
      )}

      {/* 2. Admin Control Panel Modal (Sau khi đăng nhập thành công) */}
      {isAdminOpen && (
        <AdminPanel
          isOpen={isAdminOpen}
          d1Status={d1Status}
          onManualSyncD1={handleManualSyncD1}
          onClose={() => setIsAdminOpen(false)}
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onBulkUpdateOrdersStatus={handleBulkUpdateOrdersStatus}
          products={productsList}
          onAddProduct={handleAddProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateProduct={handleUpdateProduct}
          onBulkDeleteProducts={handleBulkDeleteProducts}
          onBulkUpdateProducts={handleBulkUpdateProducts}
          onBulkImportProducts={handleBulkImportProducts}
          registrations={registrationsDb}
          onAddRegistration={handleAddRegistration}
          onUpdateRegistration={handleUpdateRegistration}
          onDeleteRegistration={handleDeleteRegistration}
          onBulkImportRegistrations={handleBulkImportRegistrations}
          storeConfig={storeConfig}
          onUpdateStoreConfig={handleUpdateStoreConfig}
          customers={customersList}
          consultations={consultationsList}
          onBonusPoints={handleAdminBonusPoints}
          articles={articlesList}
          onAddArticle={handleAddArticle}
          onUpdateArticle={handleUpdateArticle}
          onDeleteArticle={handleDeleteArticle}
          onBulkDeleteArticles={handleBulkDeleteArticles}
          onBulkUpdateArticles={handleBulkUpdateArticles}
          vouchers={vouchersList}
          onAddVoucher={handleAddVoucher}
          onUpdateVoucher={handleUpdateVoucher}
          onDeleteVoucher={handleDeleteVoucher}
          reviews={reviewsList}
          onAddReview={handleAddReview}
          onUpdateReviewStatus={handleUpdateReviewStatus}
          onAddPharmacistReply={handleAddPharmacistReply}
          onDeleteReview={handleDeleteReview}
          onSyncCarrierStatus={handleSyncCarrierStatus}
          onFailAndReturnOrder={handleFailAndReturnOrder}
          onWarehouseArrival={handleWarehouseArrival}
          onConfirmReturnedOrder={handleConfirmReturnedOrder}
          policies={policiesList}
          onUpdatePolicies={handleUpdatePolicies}
          onNavigateToPolicy={handleNavigateToPolicy}
          availableCountries={availableCountries}
          onAddCountry={handleAddCountry}
          onOpenOrderTracking={(order) => {
            handleNavigateToTracking(order?.id || '');
          }}
        />
      )}

      {/* 3. Product Detail Modal */}
      {activeProductDetail && (
        <ProductDetailModal
          product={activeProductDetail}
          onClose={() => setActiveProductDetail(null)}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
          isWishlisted={wishlist.some(item => item.id === activeProductDetail.id)}
          onToggleWishlist={handleToggleWishlist}
          onOpenVerifierWithReg={handleOpenVerifierWithReg}
          reviews={reviewsList}
          onAddReview={handleAddReview}
          onOpenVouchers={() => setIsVoucherModalOpen(true)}
          vouchers={vouchersList}
        />
      )}

      {/* 4. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedCheckout={() => setIsCheckoutOpen(true)}
        appliedVoucher={appliedVoucher}
        setAppliedVoucher={setAppliedVoucher}
        customer={currentCustomer}
        vouchers={vouchersList}
        onOpenVoucherModal={() => setIsVoucherModalOpen(true)}
        onAddToCart={handleAddToCart}
      />

      {/* 5. Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        appliedVoucher={appliedVoucher}
        setAppliedVoucher={setAppliedVoucher}
        onClearCart={handleClearCart}
        onOrderCreated={handleOrderCreated}
        onUpdateOrderPaymentMethod={handleUpdateOrderPaymentMethod}
        storeConfig={storeConfig}
        customer={currentCustomer}
        onOpenAuthModal={() => { setCustomerAuthInitialTab('login'); setIsCustomerAuthOpen(true); }}
        onUpdateCustomerPoints={handleUpdateCustomerPoints}
        vouchers={vouchersList}
        onOpenVoucherModal={() => setIsVoucherModalOpen(true)}
        onNavigateToTracking={handleNavigateToTracking}
        onOpenMedicineCabinet={() => setIsMedicineCabinetOpen(true)}
      />

      {/* 6. Customer Authentication Modal (Đăng Nhập / Đăng Ký) */}
      {isCustomerAuthOpen && (
        <CustomerAuthModal
          isOpen={isCustomerAuthOpen}
          onClose={() => setIsCustomerAuthOpen(false)}
          customers={customersList}
          onLoginSuccess={handleCustomerLogin}
          onRegisterSuccess={handleCustomerRegister}
          initialTab={customerAuthInitialTab}
        />
      )}

      {/* 7. Customer Profile & Loyalty Points Modal */}
      {isCustomerProfileOpen && currentCustomer && (
        <CustomerProfileModal
          isOpen={isCustomerProfileOpen}
          onClose={() => setIsCustomerProfileOpen(false)}
          customer={currentCustomer}
          onLogout={handleCustomerLogout}
          orders={orders}
          onUpdateCustomer={handleUpdateCustomerInfo}
          onOpenOrderTracking={(order) => {
            handleNavigateToTracking(order?.id || '');
          }}
          consultations={consultationsList}
          onResumeConsultation={(session) => {
            setActiveAdvisorSession(session);
            setIsAdvisorOpen(true);
          }}
        />
      )}

      {/* 8. Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onAddToCart={handleAddToCart}
        onRemoveFromWishlist={(id) => setWishlist(prev => prev.filter(item => item.id !== id))}
        onOpenDetail={(p) => setActiveProductDetail(p)}
      />

      {/* 7. Health Advisor Modal */}
      {isAdvisorOpen && (
        <HealthAdvisorModal
          onClose={() => {
            setIsAdvisorOpen(false);
            setActiveAdvisorSession(null);
          }}
          onAddToCart={handleAddToCart}
          onOpenDetail={(p) => setActiveProductDetail(p)}
          products={productsList}
          storeConfig={storeConfig}
          currentCustomer={currentCustomer}
          consultations={consultationsList}
          onSaveConsultation={handleSaveConsultation}
          onOpenAuth={() => {
            setCustomerAuthInitialTab('login');
            setIsCustomerAuthOpen(true);
          }}
          initialSession={activeAdvisorSession}
        />
      )}

      {/* 8. Product Registration Verification Tool */}
      {isVerifierOpen && (
        <VerificationTool
          initialRegNumber={verifierInitialReg}
          onClose={() => setIsVerifierOpen(false)}
          products={productsList}
          customRegistrations={registrationsDb}
          hotline={storeConfig.hotline}
        />
      )}

      {/* 9. Order Tracking & Logistics Modal */}
      {isOrderTrackingOpen && (
        <OrderTrackingModal
          isOpen={isOrderTrackingOpen}
          onClose={() => {
            setIsOrderTrackingOpen(false);
            setTrackingOrderCode('');
          }}
          orders={orders}
          initialOrderCode={trackingOrderCode}
          onSyncCarrierStatus={handleSyncCarrierStatus}
          isAdmin={isAdminOpen}
          hotline={storeConfig.hotline}
        />
      )}

      {/* 10. Kho Voucher & Mã Khuyến Mãi Modal */}
      {isVoucherModalOpen && (
        <VoucherModal
          isOpen={isVoucherModalOpen}
          onClose={() => setIsVoucherModalOpen(false)}
          vouchers={vouchersList}
          subtotal={cart.reduce((a, b) => a + (b.price * b.quantity), 0)}
          onApplyVoucher={(code) => {
            setAppliedVoucher(code);
            showToast(`Đã áp dụng mã voucher "${code}"!`);
          }}
          appliedVoucherCode={appliedVoucher?.code || appliedVoucher}
        />
      )}

      {/* 11. PWA Floating Installation Banner */}
      <PWAInstallBanner
        isOpen={!isStandalone && !isInstalled && !isBannerDismissed}
        onInstall={triggerInstall}
        onOpenModal={() => setIsPWAInstallModalOpen(true)}
        onDismiss={() => dismissBanner(7)}
        isIOS={isIOS}
        hasDeferredPrompt={Boolean(deferredPrompt)}
      />

      {/* 12. PWA Installation Guide Modal */}
      <PWAInstallModal
        isOpen={isPWAInstallModalOpen}
        onClose={() => setIsPWAInstallModalOpen(false)}
        onInstall={triggerInstall}
        isIOS={isIOS}
        isAndroid={isAndroid}
        isStandalone={isStandalone}
        hasDeferredPrompt={Boolean(deferredPrompt)}
      />

      {/* 13. Tủ Thuốc AI & Lịch Nhắc Uống Thuốc & Nhắc Tái Đặt Hàng Trước 2 - 3 Ngày */}
      <MyMedicineCabinetModal
        isOpen={isMedicineCabinetOpen}
        onClose={() => setIsMedicineCabinetOpen(false)}
        customer={currentCustomer}
        medications={medicationsList}
        onUpdateMedications={setMedicationsList}
        refills={refillsList}
        onUpdateRefills={setRefillsList}
        products={productsList}
        onQuickReorder={handleQuickReorder}
      />

    </div>
  );
}
