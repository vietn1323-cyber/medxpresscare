import React, { useState, useRef, useMemo } from 'react';
import { 
  X, Package, ShoppingBag, Settings, DollarSign, 
  Users, CheckCircle2, Clock, Phone, AlertCircle, 
  Plus, Edit, Trash2, ArrowUpRight, Search, 
  ExternalLink, QrCode, ShieldCheck, Download, Sparkles,
  BookOpen, FileText, CheckSquare, AlertTriangle,
  UploadCloud, Image as ImageIcon, Link2, RefreshCw, Award,
  FileCheck2, FileSpreadsheet, Printer, Send, Calendar, Truck, Bell,
  Tag, Globe, Eye, Share2, ThumbsUp, Star, MessageSquare, Copy, Gift,
  Camera, Stethoscope, Check, ArrowRight
} from 'lucide-react';
import { CATEGORIES, DOSAGE_FORMS, TARGET_AUDIENCES } from '../data/products';
import { downloadCSV, downloadJSON } from '../utils/csvHelper';
import { testTelegramConnection } from '../utils/telegramHelper';
import { DEFAULT_SHIPPING_CARRIERS, testCarrierConnection } from '../data/shippingCarriers';
import { slugify, calculateSeoScore } from '../data/articles';
import { testAiConnection, rewriteArticleWithAi } from '../utils/aiHelper';
import { DEFAULT_VOUCHERS } from '../data/vouchers';
import { INITIAL_REVIEWS } from '../data/reviews';
import { BulkImportModal } from './BulkImportModal';
import { RETURN_REASONS } from '../utils/logisticsHelper';

export const AdminPanel = ({ 
  isOpen, 
  onClose, 
  orders, 
  onUpdateOrderStatus, 
  products, 
  onAddProduct, 
  onDeleteProduct,
  onUpdateProduct,
  onBulkImportProducts,
  registrations = {},
  onAddRegistration,
  onUpdateRegistration,
  onDeleteRegistration,
  onBulkImportRegistrations,
  storeConfig,
  onUpdateStoreConfig,
  customers = [],
  onBonusPoints,
  articles = [],
  onAddArticle,
  onUpdateArticle,
  onDeleteArticle,
  vouchers = DEFAULT_VOUCHERS,
  onAddVoucher,
  onUpdateVoucher,
  onDeleteVoucher,
  reviews = INITIAL_REVIEWS,
  onAddReview,
  onUpdateReviewStatus,
  onAddPharmacistReply,
  onDeleteReview,
  onSyncCarrierStatus,
  onOpenOrderTracking,
  onFailAndReturnOrder,
  onWarehouseArrival,
  onConfirmReturnedOrder
}) => {
  const [activeTab, setActiveTab] = useState('products'); // products | orders | vouchers | reviews | customers | reorder | articles | registrations | stats | shipping | settings
  const [orderFilter, setOrderFilter] = useState('all');
  const [searchOrder, setSearchOrder] = useState('');

  // State for Return Inspection & Delivery Failure Modals
  const [inspectingReturnOrder, setInspectingReturnOrder] = useState(null);
  const [failingOrder, setFailingOrder] = useState(null);
  const [selectedFailureReason, setSelectedFailureReason] = useState(RETURN_REASONS[0]);
  const [customFailureReason, setCustomFailureReason] = useState('');
  const [inspectionForm, setInspectionForm] = useState({
    pharmacistName: 'DS. CKI Nguyễn Thu Trang',
    sealCondition: 'intact',
    gspCompliant: true,
    restoreStock: true,
    note: 'Hàng nguyên vẹn tem chống giả Bộ Y Tế, bao bì đạt chuẩn GSP, đã nhập lại giá kệ kho mát.'
  });

  // State for In Vận Đơn & Re-order & Telegram
  const [printingOrder, setPrintingOrder] = useState(null);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [telegramTestResult, setTelegramTestResult] = useState(null);
  const [reorderSearch, setReorderSearch] = useState('');

  // State for Vouchers Management Tab
  const [searchVoucher, setSearchVoucher] = useState('');
  const [filterVoucherType, setFilterVoucherType] = useState('all');
  const [showAddVoucherModal, setShowAddVoucherModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [voucherFormData, setVoucherFormData] = useState({
    code: '',
    title: '',
    discountType: 'fixed',
    discountValue: 50000,
    minOrderValue: 400000,
    maxDiscount: 50000,
    usageLimit: 500,
    usedCount: 0,
    expiryDate: '2026-12-31',
    enabled: true,
    badgeText: 'Giảm 50.000₫',
    description: ''
  });

  // State for Reviews Management Tab
  const [searchReview, setSearchReview] = useState('');
  const [filterReviewProduct, setFilterReviewProduct] = useState('all');
  const [filterReviewRating, setFilterReviewRating] = useState('all');
  const [filterReviewStatus, setFilterReviewStatus] = useState('all'); // 'all' | 'approved' | 'hidden'
  const [filterReviewReply, setFilterReviewReply] = useState('all'); // 'all' | 'replied' | 'unreplied'
  const [replyingReviewId, setReplyingReviewId] = useState(null);
  const [replyInputText, setReplyInputText] = useState('');
  const [editingReplyReviewId, setEditingReplyReviewId] = useState(null);
  const [editReplyText, setEditReplyText] = useState('');
  const [editPharmacistName, setEditPharmacistName] = useState('DS. CKI Nguyễn Thu Trang');

  // Modal State for Adding New Review
  const [showAddReviewModal, setShowAddReviewModal] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    productId: '',
    productName: '',
    customerName: '',
    customerPhone: '',
    audience: 'all',
    audienceLabel: 'Khách hàng thân thiết',
    rating: 5,
    createdAt: new Date().toISOString().split('T')[0],
    isVerifiedPurchase: true, // "tự động thêm tick đã mua hàng"
    title: '',
    content: '',
    photos: [],
    newPhotoUrl: '',
    pharmacistReply: '',
    pharmacistName: 'DS. CKI Nguyễn Thu Trang',
    status: 'approved'
  });

  // State for Bulk Import Modal
  const [bulkImportType, setBulkImportType] = useState(null); // 'registrations' | 'products' | null

  // State for Registrations Management Tab
  const [searchReg, setSearchReg] = useState('');
  const [showAddRegModal, setShowAddRegModal] = useState(false);
  const [editingReg, setEditingReg] = useState(null); // { originalKey, ...data }
  const [regForm, setRegForm] = useState({
    regNumber: '',
    name: '',
    applicant: '',
    status: 'Đã cấp phép lưu hành toàn quốc',
    date: '2024',
    type: 'Thực phẩm bảo vệ sức khỏe Nội Địa',
    inspectStandard: 'GMP-WHO Bộ Y Tế',
    origin: 'Việt Nam'
  });
  
  // State for Add Product Form
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('upload'); // 'upload' | 'url'
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // State for Editing Product Form
  const [editingProduct, setEditingProduct] = useState(null);
  const [editImageInputMode, setEditImageInputMode] = useState('upload'); // 'upload' | 'url'
  const [editUploadingImage, setEditUploadingImage] = useState(false);
  const [editUploadedFileName, setEditUploadedFileName] = useState('');
  const [editDragOver, setEditDragOver] = useState(false);
  const editFileInputRef = useRef(null);

  const [newProduct, setNewProduct] = useState({
    name: '',
    brand: '',
    category: 'bone_joint',
    categories: ['bone_joint'],
    dosageForm: 'tablet',
    targetAudience: 'all',
    originType: 'domestic',
    countryCode: 'VN',
    countryName: 'Việt Nam',
    flag: '🇻🇳',
    price: 350000,
    originalPrice: 420000,
    discountPercent: 15,
    packaging: 'Hộp 60 viên nén',
    regNumber: '1234/2024/ĐKSP',
    image: '',
    shortDesc: 'Bổ sung vi chất tự nhiên, hỗ trợ cải thiện sức khỏe toàn diện và nâng cao chất lượng cuộc sống.',
    usage: 'Uống 1-2 viên/lần, ngày 2 lần sau bữa ăn 30 phút.',
    ingredientsText: 'Hoạt chất chính chiết xuất tự nhiên: 500mg\nVitamin & Khoáng chất vi lượng: Đầy đủ chuẩn y tế',
    benefitsText: 'Bồi bổ cơ thể, tăng cường chức năng cơ quan\nNâng cao đề kháng và hỗ trợ giảm triệu chứng mệt mỏi\nAn toàn cho dạ dày và tim mạch',
    contraindications: 'Không dùng cho người mẫn cảm với bất kỳ thành phần nào của sản phẩm.',
    isFlashSale: false
  });

  // Toggle chọn / bỏ chọn nhóm sức khỏe cho sản phẩm mới
  const toggleNewProductCategory = (catId) => {
    setNewProduct(prev => {
      const current = Array.isArray(prev.categories) && prev.categories.length > 0
        ? [...prev.categories]
        : [prev.category || 'bone_joint'];
      let updated;
      if (current.includes(catId)) {
        if (current.length === 1) return prev; // Giữ ít nhất 1 nhóm
        updated = current.filter(id => id !== catId);
      } else {
        updated = [...current, catId];
      }
      return {
        ...prev,
        categories: updated,
        category: updated[0] || 'bone_joint'
      };
    });
  };

  // Toggle chọn / bỏ chọn nhóm sức khỏe khi chỉnh sửa sản phẩm
  const toggleEditingProductCategory = (catId) => {
    setEditingProduct(prev => {
      if (!prev) return prev;
      const current = Array.isArray(prev.categories) && prev.categories.length > 0
        ? [...prev.categories]
        : [prev.category || 'bone_joint'];
      let updated;
      if (current.includes(catId)) {
        if (current.length === 1) return prev; // Giữ ít nhất 1 nhóm
        updated = current.filter(id => id !== catId);
      } else {
        updated = [...current, catId];
      }
      return {
        ...prev,
        categories: updated,
        category: updated[0] || 'bone_joint'
      };
    });
  };

  // State for editing store settings & shipping carriers
  const [tempConfig, setTempConfig] = useState(() => ({
    ...storeConfig,
    shippingCarriers: storeConfig?.shippingCarriers && storeConfig.shippingCarriers.length > 0 
      ? storeConfig.shippingCarriers 
      : DEFAULT_SHIPPING_CARRIERS,
    freeShipThreshold: storeConfig?.freeShipThreshold || 500000
  }));
  const [testingCarrierId, setTestingCarrierId] = useState(null);
  const [carrierTestResults, setCarrierTestResults] = useState({});

  const handleTestCarrier = async (carrier) => {
    setTestingCarrierId(carrier.id);
    const res = await testCarrierConnection(carrier.id, carrier.apiKey, carrier.shopId);
    setCarrierTestResults(prev => ({ ...prev, [carrier.id]: res }));
    setTestingCarrierId(null);
    if (res.success) {
      setTempConfig(prev => ({
        ...prev,
        shippingCarriers: (prev.shippingCarriers || DEFAULT_SHIPPING_CARRIERS).map(c => 
          c.id === carrier.id ? { ...c, isConnected: true } : c
        )
      }));
    }
  };

  const handleToggleCarrier = (carrierId) => {
    setTempConfig(prev => ({
      ...prev,
      shippingCarriers: (prev.shippingCarriers || DEFAULT_SHIPPING_CARRIERS).map(c => 
        c.id === carrierId ? { ...c, enabled: !c.enabled } : c
      )
    }));
  };

  const handleUpdateCarrierField = (carrierId, field, value) => {
    setTempConfig(prev => ({
      ...prev,
      shippingCarriers: (prev.shippingCarriers || DEFAULT_SHIPPING_CARRIERS).map(c => 
        c.id === carrierId ? { ...c, [field]: value } : c
      )
    }));
  };

  // State & Handlers cho Quản Lý Bài Viết & Tối Ưu SEO
  const [searchArticleQuery, setSearchArticleQuery] = useState('');
  const [selectedArticleCat, setSelectedArticleCat] = useState('all');
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [articleModalTab, setArticleModalTab] = useState('content'); // 'content' | 'seo'
  const [articleImageMode, setArticleImageMode] = useState('url'); // 'url' | 'upload'
  const [uploadingArticleImg, setUploadingArticleImg] = useState(false);
  const articleFileInputRef = useRef(null);

  const [articleFormData, setArticleFormData] = useState({
    id: '',
    title: '',
    slug: '',
    category: 'Chuyên Gia Tư Vấn',
    author: 'DS. CKI Nguyễn Thu Trang',
    authorRole: 'Dược sĩ chuyên môn Cấp cao - ĐH Dược Hà Nội',
    publishedAt: new Date().toISOString().split('T')[0],
    readTime: '5 phút đọc',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
    imageAlt: '',
    summary: '',
    content: '',
    tagsText: '',
    status: 'published',
    featured: false,
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
    secondaryKeywords: '',
    schemaType: 'MedicalWebPage',
    canonicalUrl: ''
  });

  const averageSeoScore = useMemo(() => {
    if (!articles || articles.length === 0) return 0;
    const sum = articles.reduce((acc, a) => acc + (a.seoScore || calculateSeoScore(a).score), 0);
    return Math.round(sum / articles.length);
  }, [articles]);

  const handleOpenAddArticle = () => {
    setEditingArticle(null);
    setArticleFormData({
      id: 'art-' + Date.now(),
      title: '',
      slug: '',
      category: 'Chuyên Gia Tư Vấn',
      author: 'DS. CKI Nguyễn Thu Trang',
      authorRole: 'Dược sĩ chuyên môn Cấp cao - ĐH Dược Hà Nội',
      publishedAt: new Date().toISOString().split('T')[0],
      readTime: '5 phút đọc',
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
      imageAlt: '',
      summary: '',
      content: '## 1. Tầm quan trọng của việc bổ sung đúng cách\n\nNội dung chi tiết y khoa ở đây...\n\n### Những lưu ý then chốt\n\n- Điểm 1: Uống đúng liều lượng chỉ định\n- Điểm 2: Không uống khi bụng quá đói\n\n> Lời khuyên từ Dược sĩ chuyên môn: Luôn kiểm tra kỹ số tiếp nhận ĐKSP của Cục An Toàn Thực Phẩm trước khi sử dụng.',
      tagsText: 'sức khỏe, dược phẩm, cẩm nang, chính hãng',
      status: 'published',
      featured: false,
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
      secondaryKeywords: '',
      schemaType: 'MedicalWebPage',
      canonicalUrl: ''
    });
    setArticleModalTab('content');
    setShowArticleModal(true);
  };

  const handleOpenEditArticle = (art) => {
    setEditingArticle(art);
    setArticleFormData({
      id: art.id,
      title: art.title || '',
      slug: art.slug || '',
      category: art.category || 'Chuyên Gia Tư Vấn',
      author: art.author || 'DS. CKI Nguyễn Thu Trang',
      authorRole: art.authorRole || 'Dược sĩ chuyên môn Cấp cao',
      publishedAt: art.publishedAt || new Date().toISOString().split('T')[0],
      readTime: art.readTime || '5 phút đọc',
      image: art.image || '',
      imageAlt: art.imageAlt || '',
      summary: art.summary || '',
      content: art.content || '',
      tagsText: Array.isArray(art.tags) ? art.tags.join(', ') : (art.tagsText || ''),
      status: art.status || 'published',
      featured: !!art.featured,
      metaTitle: art.metaTitle || art.title || '',
      metaDescription: art.metaDescription || art.summary || '',
      focusKeyword: art.focusKeyword || '',
      secondaryKeywords: art.secondaryKeywords || '',
      schemaType: art.schemaType || 'MedicalWebPage',
      canonicalUrl: art.canonicalUrl || ''
    });
    setArticleModalTab('content');
    setShowArticleModal(true);
  };

  const articleContentTextareaRef = useRef(null);
  const inlineImageUploadRef = useRef(null);
  const [showMedicalPhotoPicker, setShowMedicalPhotoPicker] = useState(false);

  const MEDICAL_PHOTO_PRESETS = [
    {
      label: 'Xương khớp & Canxi D3K2',
      url: 'https://images.unsplash.com/photo-1576073719676-aa95576db207?w=900&auto=format&fit=crop&q=80',
      caption: 'Bộ ba Canxi hữu cơ Vitamin D3 và K2 MK7 hỗ trợ phòng ngừa loãng xương'
    },
    {
      label: 'Sâm Ngọc Linh & Thảo dược',
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=900&auto=format&fit=crop&q=80',
      caption: 'Dược liệu quý Sâm Ngọc Linh với 52 hợp chất saponin sinh học'
    },
    {
      label: 'Tim mạch & Dầu cá Omega-3',
      url: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=900&auto=format&fit=crop&q=80',
      caption: 'Hỗ trợ tuần hoàn tim mạch và giảm mỡ máu an toàn'
    },
    {
      label: 'Viên uống & Đóng gói GMP',
      url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=900&auto=format&fit=crop&q=80',
      caption: 'Sản xuất trên dây chuyền đạt chuẩn GMP-WHO và kiểm nghiệm khắt khe'
    },
    {
      label: 'Dược sĩ & Bác sĩ tư vấn',
      url: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=900&auto=format&fit=crop&q=80',
      caption: 'Đội ngũ Dược sĩ Đại học Dược Hà Nội tư vấn phác đồ chuẩn xác'
    },
    {
      label: 'Dinh dưỡng & Đề kháng',
      url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=900&auto=format&fit=crop&q=80',
      caption: 'Chế độ dinh dưỡng khoa học nâng cao hệ miễn dịch tự nhiên'
    }
  ];

  const insertTextIntoArticleContent = (textToInsert) => {
    const textarea = articleContentTextareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? 0;
      const current = articleFormData.content || '';
      const updated = current.substring(0, start) + textToInsert + current.substring(end);
      setArticleFormData(prev => ({ ...prev, content: updated }));
      setTimeout(() => {
        textarea.focus();
        textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
      }, 50);
    } else {
      setArticleFormData(prev => ({
        ...prev,
        content: (prev.content ? prev.content + '\n\n' : '') + textToInsert
      }));
    }
  };

  const handleUploadInlineImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await compressImageToDataUrl(file, 900, 0.85);
      const defaultName = file.name.replace(/\.[^/.]+$/, '');
      const caption = window.prompt('Nhập chú thích hoặc mô tả cho hình ảnh này (chuẩn SEO y khoa):', defaultName) || 'Hình ảnh minh họa chuyên môn';
      const markdownImage = `\n\n![${caption}](${dataUrl})\n`;
      insertTextIntoArticleContent(markdownImage);
    } catch (err) {
      alert('Không thể xử lý ảnh: ' + err.message);
    } finally {
      e.target.value = '';
    }
  };

  const handleInsertImageUrlPrompt = () => {
    const url = window.prompt('Dán đường dẫn (URL) hình ảnh bạn muốn chèn:');
    if (!url || !url.trim()) return;
    const caption = window.prompt('Nhập chú thích hoặc mô tả cho hình ảnh (chuẩn SEO y khoa):', 'Hình ảnh minh họa') || 'Hình ảnh minh họa';
    const markdownImage = `\n\n![${caption.trim()}](${url.trim()})\n`;
    insertTextIntoArticleContent(markdownImage);
  };

  const handleArticleTitleChange = (newTitle) => {
    setArticleFormData(prev => {
      const updates = { ...prev, title: newTitle };
      if (!editingArticle || !prev.slug || prev.slug === slugify(prev.title)) {
        updates.slug = slugify(newTitle);
      }
      if (!prev.metaTitle || prev.metaTitle === prev.title) {
        updates.metaTitle = newTitle;
      }
      return updates;
    });
  };

  const handleSaveArticleSubmit = (e) => {
    e.preventDefault();
    if (!articleFormData.title.trim()) {
      alert('Vui lòng nhập tiêu đề bài viết!');
      return;
    }

    const tagsArray = (articleFormData.tagsText || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const seoAnalysis = calculateSeoScore(articleFormData);

    const fullArticle = {
      ...articleFormData,
      tags: tagsArray,
      seoScore: seoAnalysis.score,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (editingArticle && onUpdateArticle) {
      onUpdateArticle(fullArticle);
      alert('Đã cập nhật bài viết và cấu hình SEO thành công!');
    } else if (onAddArticle) {
      onAddArticle(fullArticle);
      alert('Đã xuất bản bài viết mới chuẩn SEO thành công!');
    }
    setShowArticleModal(false);
  };

  const handleDeleteArticleClick = (art) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bài viết "${art.title}"?`)) {
      if (onDeleteArticle) {
        onDeleteArticle(art.id);
      }
    }
  };

  // State & Handlers cho Tính Năng Viết Lại Bài Viết Bằng AI
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSourceUrl, setAiSourceUrl] = useState('');
  const [aiRawContent, setAiRawContent] = useState('');
  const [aiTone, setAiTone] = useState('medical_expert');
  const [aiTargetKeyword, setAiTargetKeyword] = useState('');
  const [isRewritingWithAi, setIsRewritingWithAi] = useState(false);
  const [aiRewriteResult, setAiRewriteResult] = useState(null);
  const [testingAiKey, setTestingAiKey] = useState(false);
  const [aiTestResult, setAiTestResult] = useState(null);

  const handleTestAi = async () => {
    setTestingAiKey(true);
    setAiTestResult(null);
    const res = await testAiConnection(
      tempConfig.aiApiKey,
      tempConfig.aiProvider || 'gemini',
      tempConfig.aiModel || 'gemini-2.5-flash'
    );
    if (res.activeModel && res.activeModel !== tempConfig.aiModel) {
      setTempConfig(prev => ({ ...prev, aiModel: res.activeModel }));
    }
    setAiTestResult(res);
    setTestingAiKey(false);
  };

  const handleStartAiRewrite = async () => {
    if (!aiSourceUrl.trim() && !aiRawContent.trim()) {
      alert('Vui lòng nhập link bài viết từ trang web khác hoặc dán nội dung thô cần viết lại!');
      return;
    }
    setIsRewritingWithAi(true);
    setAiRewriteResult(null);

    try {
      const generated = await rewriteArticleWithAi({
        sourceUrl: aiSourceUrl.trim(),
        rawContent: aiRawContent.trim(),
        targetKeyword: aiTargetKeyword.trim(),
        tone: aiTone,
        apiKey: tempConfig.aiApiKey,
        provider: tempConfig.aiProvider || 'gemini',
        model: tempConfig.aiModel || 'gemini-2.5-flash'
      });
      setAiRewriteResult(generated);
    } catch (err) {
      alert('Lỗi viết lại bài viết: ' + err.message);
    } finally {
      setIsRewritingWithAi(false);
    }
  };

  const handleApplyAiArticleToEditor = () => {
    if (!aiRewriteResult) return;
    setEditingArticle(null);
    setArticleFormData({
      ...aiRewriteResult,
      tagsText: Array.isArray(aiRewriteResult.tags) ? aiRewriteResult.tags.join(', ') : ''
    });
    setShowAiModal(false);
    setArticleModalTab('seo'); // Đưa sang tab SEO để xem kết quả tối ưu
    setShowArticleModal(true);
  };

  // Helper nén ảnh bằng HTML5 Canvas sang định dạng Data URL JPEG tối ưu
  const compressImageToDataUrl = (file, maxDimension = 800, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width;
          let height = img.height;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Xử lý nạp file ảnh từ máy tính (kết hợp tải lên máy chủ PHP hoặc nén Data URL hiển thị tức thì)
  const handleImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (định dạng JPG, PNG, WEBP hoặc GIF).');
      return;
    }
    setUploadingImage(true);
    setUploadedFileName(file.name);

    try {
      // 1. Thử tải lên API PHP backend nếu website đang chạy trên hosting Northwest
      const token = sessionStorage.getItem('medxpress_admin_token');
      let uploadedToBackend = false;

      if (token) {
        try {
          const formData = new FormData();
          formData.append('image', file);
          const res = await fetch('/api/upload.php', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.url) {
              setNewProduct(prev => ({ ...prev, image: data.url }));
              uploadedToBackend = true;
            }
          }
        } catch {
          // Bỏ qua lỗi kết nối backend khi đang test local
        }
      }

      // 2. Nếu chạy local Vite hoặc backend chưa khởi tạo, nén ảnh client-side thành Data URL sắc nét
      if (!uploadedToBackend) {
        const compressedDataUrl = await compressImageToDataUrl(file);
        setNewProduct(prev => ({ ...prev, image: compressedDataUrl }));
      }
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      alert('Không thể xử lý file ảnh này. Vui lòng thử lại với ảnh khác.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  // Mở modal chỉnh sửa sản phẩm đang có
  const handleOpenEditProduct = (p) => {
    // Chuyển đổi mảng ingredients thành text: Mỗi dòng 1 chất
    const ingredientsText = Array.isArray(p.ingredients)
      ? p.ingredients.map(i => typeof i === 'string' ? i : `${i.name}: ${i.amount}`).join('\n')
      : (p.ingredientsText || '');

    // Chuyển đổi mảng benefits thành text: Mỗi dòng 1 công dụng
    const benefitsText = Array.isArray(p.benefits)
      ? p.benefits.join('\n')
      : (p.benefitsText || '');

    const prodCategories = Array.isArray(p.categories) && p.categories.length > 0
      ? p.categories
      : (p.category ? [p.category] : ['bone_joint']);

    setEditingProduct({
      ...p,
      categories: prodCategories,
      category: prodCategories[0] || 'bone_joint',
      ingredientsText,
      benefitsText,
      price: p.price || 0,
      originalPrice: p.originalPrice || p.price || 0,
      discountPercent: p.discountPercent || 0,
      packaging: p.packaging || '',
      regNumber: p.regNumber || '',
      shortDesc: p.shortDesc || '',
      usage: p.usage || '',
      contraindications: p.contraindications || '',
      inStock: p.inStock !== false,
      isFlashSale: !!p.isFlashSale
    });
    setEditImageInputMode('upload');
    setEditUploadedFileName('');
  };

  // Tải ảnh mới cho sản phẩm đang chỉnh sửa
  const handleEditImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh định dạng JPG, PNG, WEBP hoặc GIF.');
      return;
    }
    setEditUploadingImage(true);
    setEditUploadedFileName(file.name);

    try {
      const token = sessionStorage.getItem('medxpress_admin_token');
      let uploadedToBackend = false;

      if (token) {
        try {
          const formData = new FormData();
          formData.append('image', file);
          const res = await fetch('/api/upload.php', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.url) {
              setEditingProduct(prev => ({ ...prev, image: data.url }));
              uploadedToBackend = true;
            }
          }
        } catch {
          // Bỏ qua lỗi kết nối backend khi test local
        }
      }

      if (!uploadedToBackend) {
        const compressedDataUrl = await compressImageToDataUrl(file);
        setEditingProduct(prev => ({ ...prev, image: compressedDataUrl }));
      }
    } catch (err) {
      console.error('Lỗi tải ảnh:', err);
      alert('Không thể xử lý file ảnh này. Vui lòng thử lại với ảnh khác.');
    } finally {
      setEditUploadingImage(false);
    }
  };

  const handleEditDrop = (e) => {
    e.preventDefault();
    setEditDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleEditImageFile(e.dataTransfer.files[0]);
    }
  };

  // Lưu thông tin chỉnh sửa sản phẩm
  const handleUpdateProductSubmit = (e) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name || !editingProduct.price) return;

    // Phân tích danh sách thành phần từ Textarea
    const parsedIngredients = editingProduct.ingredientsText
      ? editingProduct.ingredientsText.split('\n').filter(Boolean).map(line => {
          const parts = line.split(':');
          return {
            name: parts[0]?.trim() || line.trim(),
            amount: parts[1]?.trim() || 'Hàm lượng chuẩn GMP'
          };
        })
      : (Array.isArray(editingProduct.ingredients) ? editingProduct.ingredients : [{ name: 'Hoạt chất chính', amount: 'Chuẩn GMP' }]);

    // Phân tích danh sách công dụng từ Textarea
    const parsedBenefits = editingProduct.benefitsText
      ? editingProduct.benefitsText.split('\n').filter(Boolean).map(b => b.replace(/^[-•*]\s*/, '').trim())
      : (Array.isArray(editingProduct.benefits) ? editingProduct.benefits : ['Bổ sung vi chất, tăng cường sức khỏe']);

    const prodCategories = Array.isArray(editingProduct.categories) && editingProduct.categories.length > 0
      ? editingProduct.categories
      : [editingProduct.category || 'bone_joint'];

    const updated = {
      ...editingProduct,
      categories: prodCategories,
      category: prodCategories[0] || 'bone_joint',
      price: Number(editingProduct.price),
      originalPrice: Number(editingProduct.originalPrice || editingProduct.price),
      discountPercent: Number(editingProduct.discountPercent || 0),
      ingredients: parsedIngredients,
      benefits: parsedBenefits,
      shortDesc: editingProduct.shortDesc || 'Sản phẩm bổ sung dinh dưỡng và vi chất tự nhiên cho cơ thể.',
      usage: editingProduct.usage || 'Uống 1-2 viên/ngày sau bữa ăn.',
      contraindications: editingProduct.contraindications || 'Đọc kỹ hướng dẫn sử dụng trước khi dùng.',
      inStock: editingProduct.inStock !== false,
      isFlashSale: !!editingProduct.isFlashSale
    };

    onUpdateProduct(updated);
    setEditingProduct(null);
  };

  if (!isOpen) return null;

  // Calculations for stats
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled')
    .reduce((acc, o) => acc + (o.grandTotal || 0), 0);
  const pendingOrdersCount = orders.filter(o => o.status === 'pending').length;
  const returningOrdersCount = orders.filter(o => o.status === 'returning' || o.status === 'returned_pending_check').length;
  const returnedCompletedCount = orders.filter(o => o.status === 'returned').length;
  const domesticProductsCount = products.filter(p => p.originType === 'domestic').length;
  const importedProductsCount = products.filter(p => p.originType === 'imported').length;

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'returning') {
      if (!['returning', 'returned_pending_check', 'returned'].includes(o.status)) return false;
    } else if (orderFilter !== 'all' && o.status !== orderFilter) {
      return false;
    }
    if (searchOrder.trim()) {
      const q = searchOrder.toLowerCase().trim();
      const matchCode = o.id.toLowerCase().includes(q);
      const matchName = o.customer?.fullName?.toLowerCase().includes(q);
      const matchPhone = o.customer?.phone?.includes(q);
      return matchCode || matchName || matchPhone;
    }
    return true;
  });

  const handleCreateProductSubmit = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) return;

    // Phân tích danh sách thành phần từ Textarea
    const parsedIngredients = newProduct.ingredientsText
      ? newProduct.ingredientsText.split('\n').filter(Boolean).map(line => {
          const parts = line.split(':');
          return {
            name: parts[0]?.trim() || line.trim(),
            amount: parts[1]?.trim() || 'Hàm lượng chuẩn GMP'
          };
        })
      : [{ name: 'Hoạt chất chính', amount: '500mg' }];

    // Phân tích danh sách công dụng từ Textarea
    const parsedBenefits = newProduct.benefitsText
      ? newProduct.benefitsText.split('\n').filter(Boolean).map(b => b.replace(/^[-•*]\s*/, '').trim())
      : ['Bổ sung vi chất, tăng cường sức khỏe'];

    const defaultPlaceholder = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80';
    const id = (newProduct.originType === 'domestic' ? 'vn-' : 'imp-') + Date.now();
    const prodCategories = Array.isArray(newProduct.categories) && newProduct.categories.length > 0
      ? newProduct.categories
      : [newProduct.category || 'bone_joint'];

    onAddProduct({
      ...newProduct,
      categories: prodCategories,
      category: prodCategories[0] || 'bone_joint',
      id,
      image: newProduct.image || defaultPlaceholder,
      price: Number(newProduct.price),
      originalPrice: Number(newProduct.originalPrice || newProduct.price),
      discountPercent: Number(newProduct.discountPercent || 0),
      ingredients: parsedIngredients,
      benefits: parsedBenefits,
      shortDesc: newProduct.shortDesc || 'Sản phẩm bổ sung dinh dưỡng và vi chất tự nhiên cho cơ thể.',
      usage: newProduct.usage || 'Uống 1-2 viên/ngày sau bữa ăn.',
      contraindications: newProduct.contraindications || 'Đọc kỹ hướng dẫn sử dụng trước khi dùng.',
      rating: 5.0,
      reviewsCount: 1,
      soldCount: 0,
      inStock: true
    });
    setNewProduct({
      name: '',
      brand: '',
      category: 'bone_joint',
      categories: ['bone_joint'],
      dosageForm: 'tablet',
      targetAudience: 'all',
      originType: 'domestic',
      countryCode: 'VN',
      countryName: 'Việt Nam',
      flag: '🇻🇳',
      price: 350000,
      originalPrice: 420000,
      discountPercent: 15,
      packaging: 'Hộp 60 viên nén',
      regNumber: '1234/2024/ĐKSP',
      image: '',
      shortDesc: 'Bổ sung vi chất tự nhiên, hỗ trợ cải thiện sức khỏe toàn diện và nâng cao chất lượng cuộc sống.',
      usage: 'Uống 1-2 viên/lần, ngày 2 lần sau bữa ăn 30 phút.',
      ingredientsText: 'Hoạt chất chính chiết xuất tự nhiên: 500mg\nVitamin & Khoáng chất vi lượng: Đầy đủ chuẩn y tế',
      benefitsText: 'Bồi bổ cơ thể, tăng cường chức năng cơ quan\nNâng cao đề kháng và hỗ trợ giảm triệu chứng mệt mỏi\nAn toàn cho dạ dày và tim mạch',
      contraindications: 'Không dùng cho người mẫn cảm với bất kỳ thành phần nào của sản phẩm.',
      isFlashSale: false
    });
    setUploadedFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    setShowAddProduct(false);
  };

  // Xuất toàn bộ sản phẩm ra file CSV (UTF-8 BOM chuẩn Excel tiếng Việt)
  const handleExportProductsCSV = () => {
    const headers = [
      'Tên sản phẩm', 'Thương hiệu', 'Danh mục', 'Dạng bào chế', 'Đối tượng',
      'Xuất xứ (domestic/imported)', 'Quốc gia', 'Giá bán (VNĐ)', 'Giá gốc (VNĐ)',
      'Quy cách', 'Số ĐKSP', 'Ảnh (URL/Base64)', 'Mô tả ngắn', 'Hướng dẫn sử dụng',
      'Thành phần', 'Công dụng', 'Lưu ý'
    ];
    const rows = products.map(p => {
      const ingStr = Array.isArray(p.ingredients)
        ? p.ingredients.map(i => typeof i === 'string' ? i : `${i.name}: ${i.amount}`).join('; ')
        : (p.ingredientsText || '');
      const benStr = Array.isArray(p.benefits) ? p.benefits.join('; ') : (p.benefitsText || '');
      const catStr = Array.isArray(p.categories) && p.categories.length > 0
        ? p.categories.map(cid => CATEGORIES.find(c => c.id === cid)?.name || cid).join('; ')
        : (CATEGORIES.find(c => c.id === p.category)?.name || p.category || '');
      return [
        p.name || '',
        p.brand || '',
        catStr,
        p.dosageForm || '',
        p.targetAudience || '',
        p.originType || 'domestic',
        p.countryName || '',
        p.price || 0,
        p.originalPrice || p.price || 0,
        p.packaging || '',
        p.regNumber || '',
        p.image || '',
        p.shortDesc || '',
        p.usage || '',
        ingStr,
        benStr,
        p.contraindications || ''
      ];
    });
    downloadCSV(headers, rows, `danh-sach-san-pham-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Xuất toàn bộ Số ĐKSP ra file CSV
  const handleExportRegistrationsCSV = () => {
    const headers = [
      'Số ĐKSP', 'Tên sản phẩm', 'Tổ chức/Doanh nghiệp chịu trách nhiệm',
      'Trạng thái công bố', 'Năm cấp phép', 'Loại hình', 'Tiêu chuẩn kiểm nghiệm', 'Xuất xứ'
    ];
    const rows = Object.entries(registrations || {}).map(([regNumber, item]) => [
      regNumber,
      item.name || '',
      item.applicant || '',
      item.status || 'Đã cấp phép lưu hành toàn quốc',
      item.date || '',
      item.type || '',
      item.inspectStandard || 'GMP-WHO Bộ Y Tế',
      item.origin || ''
    ]);
    downloadCSV(headers, rows, `danh-sach-so-dksp-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  // Mở modal thêm mới 1 Số ĐKSP thủ công
  const handleOpenAddReg = () => {
    setEditingReg(null);
    setRegForm({
      regNumber: '',
      name: '',
      applicant: '',
      status: 'Đã cấp phép lưu hành toàn quốc',
      date: new Date().getFullYear().toString(),
      type: 'Thực phẩm bảo vệ sức khỏe Nội Địa',
      inspectStandard: 'GMP-WHO Bộ Y Tế',
      origin: 'Việt Nam'
    });
    setShowAddRegModal(true);
  };

  // Mở modal sửa 1 Số ĐKSP đang có
  const handleOpenEditReg = (regNumber, data) => {
    setEditingReg({ originalKey: regNumber, ...data });
    setRegForm({
      regNumber: regNumber,
      name: data.name || '',
      applicant: data.applicant || '',
      status: data.status || 'Đã cấp phép lưu hành toàn quốc',
      date: data.date || '',
      type: data.type || 'Thực phẩm bảo vệ sức khỏe',
      inspectStandard: data.inspectStandard || 'GMP-WHO Bộ Y Tế',
      origin: data.origin || 'Việt Nam'
    });
    setShowAddRegModal(true);
  };

  // Lưu thông tin Số ĐKSP (thêm mới hoặc cập nhật)
  const handleSaveRegSubmit = (e) => {
    e.preventDefault();
    const regNum = regForm.regNumber.trim().toUpperCase();
    if (!regNum || !regForm.name.trim()) {
      alert('Vui lòng nhập đầy đủ Số ĐKSP và Tên sản phẩm.');
      return;
    }

    const regData = {
      name: regForm.name.trim(),
      applicant: regForm.applicant.trim() || 'Doanh nghiệp Dược phẩm',
      status: regForm.status || 'Đã cấp phép lưu hành toàn quốc',
      date: regForm.date || new Date().getFullYear().toString(),
      type: regForm.type || 'Thực phẩm bảo vệ sức khỏe',
      inspectStandard: regForm.inspectStandard || 'GMP-WHO Bộ Y Tế',
      origin: regForm.origin || 'Việt Nam'
    };

    if (editingReg) {
      if (onUpdateRegistration) {
        onUpdateRegistration(editingReg.originalKey, regNum, regData);
      }
    } else {
      if (onAddRegistration) {
        onAddRegistration(regNum, regData);
      }
    }

    setShowAddRegModal(false);
    setEditingReg(null);
  };

  // Xóa 1 Số ĐKSP
  const handleDeleteRegistrationConfirm = (regNumber, name) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa Số ĐKSP "${regNumber}" (${name}) khỏi hệ thống tra cứu?`)) {
      if (onDeleteRegistration) {
        onDeleteRegistration(regNumber);
      }
    }
  };

  // Kiểm tra kết nối Telegram Bot thử nghiệm
  const handleTestTelegram = async () => {
    if (!tempConfig.telegramBotToken || !tempConfig.telegramChatId) {
      alert('Vui lòng nhập đầy đủ Telegram Bot Token và Chat ID trước khi bấm kiểm tra.');
      return;
    }
    setTestingTelegram(true);
    setTelegramTestResult(null);
    const res = await testTelegramConnection(tempConfig.telegramBotToken, tempConfig.telegramChatId);
    setTestingTelegram(false);
    setTelegramTestResult(res);
  };

  // Tính toán danh sách nhắc tái đặt hàng theo phác đồ
  const reorderAlerts = orders
    .filter(o => o.status !== 'cancelled')
    .map(order => {
      const orderDate = new Date(order.createdAt || Date.now());
      const totalBoxes = (order.items || []).reduce((acc, it) => acc + (it.comboBoxes || it.quantity || 1), 0);
      const treatmentDays = Math.max(30, totalBoxes * 30);
      const elapsedDays = Math.max(0, Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24)));
      const remainingDays = treatmentDays - elapsedDays;

      let urgency = 'safe'; // safe (>7) | due_soon (<=7) | overdue (<=0)
      if (remainingDays <= 0) urgency = 'overdue';
      else if (remainingDays <= 7) urgency = 'due_soon';

      return {
        orderId: order.id,
        customerName: order.customer?.fullName || 'Khách hàng',
        phone: order.customer?.phone || '',
        orderDate,
        totalBoxes,
        treatmentDays,
        elapsedDays,
        remainingDays,
        urgency,
        itemsSummary: (order.items || []).map(i => i.name).join(', ')
      };
    })
    .sort((a, b) => a.remainingDays - b.remainingDays);

  const dueSoonCount = reorderAlerts.filter(a => a.urgency === 'due_soon' || a.urgency === 'overdue').length;

  const handleSaveConfig = (e) => {
    e.preventDefault();
    onUpdateStoreConfig(tempConfig);
    alert('Đã cập nhật cấu hình cửa hàng thành công!');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-[1440px] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-2 h-[94vh] max-h-[96vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Admin Header */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                  Cổng Dược Sĩ & Quản Trị
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">Chuẩn GSP - MedXpressCare.com</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white">
                Hệ Thống Quản Lý Dược MedXpressCare
              </h2>
            </div>
          </div>

          {/* Quick Metrics Bar & Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-colors"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('medxpress_admin_token');
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span>Đăng Xuất</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* MAIN BODY: VERTICAL SIDEBAR (LEFT) + TAB CONTENT (RIGHT) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* VERTICAL SIDEBAR (TRỤC DỌC BÊN TRÁI) */}
          <aside className="w-full md:w-64 lg:w-72 shrink-0 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col overflow-y-auto no-scrollbar">
            
            {/* Danh sách các tính năng được phân nhóm và sắp xếp theo tần suất sử dụng */}
            <div className="p-3 space-y-4 flex-1">
              
              {/* NHÓM 1: QUẢN LÝ BÁN HÀNG */}
              <div>
                <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <span>Quản Lý Bán Hàng</span>
                </div>
                <div className="space-y-1">
                  
                  {/* 1. Kho Sản Phẩm (Ưu tiên hàng đầu) */}
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === 'products'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Package className={`w-4 h-4 shrink-0 ${activeTab === 'products' ? 'text-white' : 'text-emerald-400'}`} />
                      <span className="truncate">Kho Sản Phẩm</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      activeTab === 'products' ? 'bg-emerald-700/90 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {products.length} SP
                    </span>
                  </button>

                  {/* 2. Quản Lý Đơn Hàng */}
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === 'orders'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <ShoppingBag className={`w-4 h-4 shrink-0 ${activeTab === 'orders' ? 'text-white' : 'text-blue-400'}`} />
                      <span className="truncate">Quản Lý Đơn Hàng</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {returningOrdersCount > 0 && (
                        <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse" title={`${returningOrdersCount} đơn chuyển hoàn cần Dược sĩ xử lý`}>
                          ⚠️ {returningOrdersCount} hoàn
                        </span>
                      )}
                      {pendingOrdersCount > 0 && (
                        <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                          {pendingOrdersCount} mới
                        </span>
                      )}
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        activeTab === 'orders' ? 'bg-emerald-700/90 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {orders.length}
                      </span>
                    </div>
                  </button>

                  {/* 3. Mã Giảm Giá & Voucher */}
                  <button
                    onClick={() => setActiveTab('vouchers')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === 'vouchers'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Tag className={`w-4 h-4 shrink-0 ${activeTab === 'vouchers' ? 'text-white' : 'text-amber-400'}`} />
                      <span className="truncate">Mã Giảm Giá & Voucher</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      activeTab === 'vouchers' ? 'bg-emerald-700/90 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {vouchers.length} mã
                    </span>
                  </button>

                  {/* 4. Quản Lý Đánh Giá (UGC) */}
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === 'reviews'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Star className={`w-4 h-4 shrink-0 ${activeTab === 'reviews' ? 'text-white' : 'text-yellow-400'}`} />
                      <span className="truncate">Đánh Giá & Phản Hồi</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      activeTab === 'reviews' ? 'bg-emerald-700/90 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {reviews.length}
                    </span>
                  </button>

                  {/* 3. Khách Hàng & Điểm Thưởng */}
                  <button
                    onClick={() => setActiveTab('customers')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === 'customers'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Award className={`w-4 h-4 shrink-0 ${activeTab === 'customers' ? 'text-white' : 'text-amber-400'}`} />
                      <span className="truncate">Khách Hàng & Điểm Thưởng</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      activeTab === 'customers' ? 'bg-emerald-700/90 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {customers.length}
                    </span>
                  </button>

                  {/* 4. Nhắc Tái Đặt Hàng */}
                  <button
                    onClick={() => setActiveTab('reorder')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === 'reorder'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Calendar className={`w-4 h-4 shrink-0 ${activeTab === 'reorder' ? 'text-white' : 'text-rose-400'}`} />
                      <span className="truncate">Nhắc Tái Đặt Hàng</span>
                    </div>
                    {dueSoonCount > 0 ? (
                      <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse shrink-0">
                        {dueSoonCount} đến hạn
                      </span>
                    ) : (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                        activeTab === 'reorder' ? 'bg-emerald-700/90 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        Tốt
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* NHÓM 2: NỘI DUNG & DỮ LIỆU */}
              <div>
                <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <span>Nội Dung & Dữ Liệu</span>
                </div>
                <div className="space-y-1">
                  
                  {/* Cẩm Nang & Bài Viết SEO */}
                  <button
                    onClick={() => setActiveTab('articles')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === 'articles'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <BookOpen className={`w-4 h-4 shrink-0 ${activeTab === 'articles' ? 'text-white' : 'text-amber-400'}`} />
                      <span className="truncate">Cẩm Nang & Bài Viết SEO</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      activeTab === 'articles' ? 'bg-emerald-700/90 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {articles.length} bài
                    </span>
                  </button>

                  {/* 5. Số ĐKSP Bộ Y Tế */}
                  <button
                    onClick={() => setActiveTab('registrations')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === 'registrations'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileCheck2 className={`w-4 h-4 shrink-0 ${activeTab === 'registrations' ? 'text-white' : 'text-teal-400'}`} />
                      <span className="truncate">Số ĐKSP Bộ Y Tế</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      activeTab === 'registrations' ? 'bg-emerald-700/90 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {Object.keys(registrations || {}).length}
                    </span>
                  </button>

                  {/* 6. Doanh Thu & Thống Kê */}
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === 'stats'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <DollarSign className={`w-4 h-4 shrink-0 ${activeTab === 'stats' ? 'text-white' : 'text-emerald-400'}`} />
                      <span className="truncate">Doanh Thu & Thống Kê</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      activeTab === 'stats' ? 'bg-emerald-700/90 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      Báo cáo
                    </span>
                  </button>
                </div>
              </div>

              {/* NHÓM 3: HỆ THỐNG & CẤU HÌNH */}
              <div>
                <div className="px-3 pb-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  <span>Hệ Thống & Cấu Hình</span>
                </div>
                <div className="space-y-1">
                  
                  {/* 7. Đối Tác Vận Chuyển */}
                  <button
                    onClick={() => setActiveTab('shipping')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === 'shipping'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Truck className={`w-4 h-4 shrink-0 ${activeTab === 'shipping' ? 'text-white' : 'text-sky-400'}`} />
                      <span className="truncate">Đối Tác Vận Chuyển</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      activeTab === 'shipping' ? 'bg-emerald-700/90 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {(tempConfig.shippingCarriers || []).filter(c => c.enabled).length} bật
                    </span>
                  </button>

                  {/* 8. Cấu Hình VietQR & Hotline */}
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === 'settings'
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 border border-emerald-500/40'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Settings className={`w-4 h-4 shrink-0 ${activeTab === 'settings' ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">Cấu Hình VietQR & Hotline</span>
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                      activeTab === 'settings' ? 'bg-emerald-700/90 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      Hệ thống
                    </span>
                  </button>
                </div>
              </div>

            </div>

            {/* Hộp tóm tắt nhanh chân Sidebar */}
            <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 shrink-0">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Trạng thái:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Trực tuyến
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Hotline:</span>
                  <span className="font-mono font-semibold text-slate-200">{tempConfig.hotline || '1900 6868'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">Cổng ship:</span>
                  <span className="font-semibold text-sky-400">
                    {(tempConfig.shippingCarriers || []).filter(c => c.enabled).length} hãng hoạt động
                  </span>
                </div>
              </div>
            </div>

          </aside>

          {/* TAB CONTENTS (KHÔNG GIAN NỘI DUNG CHÍNH BÊN PHẢI) */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/70 flex flex-col min-w-0">
            
            {/* Header thông tin tính năng đang xem */}
            <div className="mb-5 bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100 shadow-xs">
                  {activeTab === 'products' && <Package className="w-5 h-5 text-emerald-600" />}
                  {activeTab === 'orders' && <ShoppingBag className="w-5 h-5 text-blue-600" />}
                  {activeTab === 'vouchers' && <Tag className="w-5 h-5 text-amber-500" />}
                  {activeTab === 'reviews' && <Star className="w-5 h-5 text-yellow-500" />}
                  {activeTab === 'customers' && <Award className="w-5 h-5 text-amber-500" />}
                  {activeTab === 'reorder' && <Calendar className="w-5 h-5 text-rose-500" />}
                  {activeTab === 'articles' && <BookOpen className="w-5 h-5 text-amber-500" />}
                  {activeTab === 'registrations' && <FileCheck2 className="w-5 h-5 text-teal-600" />}
                  {activeTab === 'stats' && <DollarSign className="w-5 h-5 text-emerald-600" />}
                  {activeTab === 'shipping' && <Truck className="w-5 h-5 text-sky-600" />}
                  {activeTab === 'settings' && <Settings className="w-5 h-5 text-slate-600" />}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                    {activeTab === 'products' && 'Kho Sản Phẩm & Dược Phẩm'}
                    {activeTab === 'orders' && 'Quản Lý Đơn Hàng & Vận Đơn'}
                    {activeTab === 'vouchers' && 'Quản Lý Mã Giảm Giá & Voucher Khuyến Mãi'}
                    {activeTab === 'reviews' && 'Quản Lý Đánh Giá Khách Hàng & Phản Hồi Dược Sĩ'}
                    {activeTab === 'customers' && 'Khách Hàng & Điểm Thưởng Tích Lũy'}
                    {activeTab === 'reorder' && 'Nhắc Tái Đặt Hàng Định Kỳ'}
                    {activeTab === 'articles' && 'Cẩm Nang & Bài Viết Y Khoa Chuẩn SEO'}
                    {activeTab === 'registrations' && 'Cơ Sở Dữ Liệu Số ĐKSP Bộ Y Tế'}
                    {activeTab === 'stats' && 'Báo Cáo Doanh Thu & Thống Kê'}
                    {activeTab === 'shipping' && 'Đối Tác Vận Chuyển & Cổng Giao Hàng'}
                    {activeTab === 'settings' && 'Cấu Hình Thanh Toán VietQR & Hotline'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeTab === 'products' && 'Thêm mới, chỉnh sửa thông tin, bảng giá, thành phần dược liệu và tồn kho'}
                    {activeTab === 'orders' && 'Kiểm duyệt đơn, cập nhật trạng thái vận chuyển và in phiếu gửi bưu điện'}
                    {activeTab === 'vouchers' && 'Tạo mã voucher giảm giá, chiết khấu phần trăm, freeship và kiểm soát điều kiện đơn tối thiểu'}
                    {activeTab === 'reviews' && 'Kiểm duyệt đánh giá, ảnh chụp mở hộp thực tế và Dược sĩ phản hồi tư vấn y khoa'}
                    {activeTab === 'customers' && 'Danh sách khách hàng, điểm tích lũy (100k = 1đ) và lịch sử giao dịch'}
                    {activeTab === 'reorder' && 'Dự báo hết thuốc theo phác đồ, nhắc chăm sóc và gia hạn đơn hàng'}
                    {activeTab === 'articles' && 'Soạn bài mới, viết lại bài từ link web khác bằng AI và tối ưu On-Page SEO (Meta Title, Description, Keyword, Schema)'}
                    {activeTab === 'registrations' && 'Quản lý số công bố lưu hành toàn quốc, cập nhật thủ công & nhập file Excel/CSV'}
                    {activeTab === 'stats' && 'Tổng quan doanh số bán hàng, đơn hoàn tất và phân bổ nguồn thu'}
                    {activeTab === 'shipping' && 'Kết nối API GHTK, GHN, Viettel Post... Bật/tắt hãng hiển thị lúc khách đặt hàng'}
                    {activeTab === 'settings' && 'Thiết lập tài khoản ngân hàng vẽ mã QR, Hotline và thông báo Telegram'}
                  </p>
                </div>
              </div>
            </div>
          
          {/* TAB 1: QUẢN LÝ ĐƠN HÀNG */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Tìm theo Mã đơn, Họ tên khách, Số điện thoại..."
                    value={searchOrder}
                    onChange={(e) => setSearchOrder(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'pending', label: 'Chờ xử lý' },
                    { id: 'confirmed', label: 'Đã xác nhận' },
                    { id: 'shipping', label: 'Đang giao' },
                    { id: 'completed', label: 'Hoàn thành' },
                    { 
                      id: 'returning', 
                      label: `⚠️ Chuyển hoàn / Thất bại${returningOrdersCount > 0 ? ` (${returningOrdersCount})` : ''}`,
                      isWarning: true
                    },
                  ].map(f => (
                    <button
                      key={f.id}
                      onClick={() => setOrderFilter(f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors flex items-center gap-1 ${
                        orderFilter === f.id
                          ? f.isWarning ? 'bg-amber-600 text-white shadow-xs' : 'bg-emerald-600 text-white shadow-xs'
                          : f.isWarning && returningOrdersCount > 0
                            ? 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 font-bold'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Alert banner for returning & pending check orders */}
              {returningOrdersCount > 0 && orderFilter !== 'returning' && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <AlertTriangle className="w-5 h-5 animate-bounce" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-amber-950 text-xs sm:text-sm flex items-center gap-2">
                        <span>CẢNH BÁO VẬN CHUYỂN: Có {returningOrdersCount} đơn giao thất bại / chuyển hoàn về kho!</span>
                        <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Cần kiểm nhận</span>
                      </h4>
                      <p className="text-[11px] text-amber-900 mt-1 leading-relaxed">
                        Theo quy định an toàn Dược phẩm GSP: Đơn hàng hoàn về kho bắt buộc phải được Dược sĩ kiểm tra tem niêm phong, ngoại quan viên thuốc và xác nhận thủ công trước khi nhập lại kệ kho.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setOrderFilter('returning')}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shrink-0 transition-all shadow-xs flex items-center gap-1.5 self-end sm:self-center"
                  >
                    <span>Xem đơn hoàn ngay</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Orders Table */}
              {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
                  <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-700 text-sm">Chưa có đơn hàng nào khớp bộ lọc</h4>
                  <p className="text-xs text-slate-400 mt-1">Khi khách hàng đặt hàng trên website, đơn sẽ tự động nhảy vào đây tức thì.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map(order => (
                    <div 
                      key={order.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-black text-sm text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            {order.id}
                          </span>
                          <span className="text-xs text-slate-400">
                            {new Date(order.createdAt).toLocaleString('vi-VN')}
                          </span>
                          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            order.paymentMethod === 'vietqr' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {order.paymentMethod === 'vietqr' ? '📲 VietQR Đã Chuyển' : '💵 COD Tiền Mặt'}
                          </span>

                          {order.pointsUsed > 0 && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              🌟 Dùng {order.pointsUsed}đ (-{(order.pointsUsed * 1000).toLocaleString('vi-VN')}₫)
                            </span>
                          )}
                          {order.pointsEarned > 0 && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                              🎁 +{order.pointsEarned} điểm
                            </span>
                          )}
                        </div>

                        {/* Status Dropdown */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 font-medium">Trạng thái:</span>
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateOrderStatus(order.id, e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-700 focus:outline-none focus:border-emerald-500"
                          >
                            <option value="pending">⏳ Chờ Dược Sĩ Gọi</option>
                            <option value="confirmed">✅ Đã Xác Nhận Đơn</option>
                            <option value="shipping">🚚 Đang Giao Hỏa Tốc</option>
                            <option value="completed">🏆 Đã Nhận Hàng (Hoàn tất)</option>
                            <option value="returning">⚠️ Giao Thất Bại & Chuyển Hoàn</option>
                            <option value="returned_pending_check">📦 Đã Về Kho (Chờ kiểm nhận)</option>
                            <option value="returned">✅ Đã Nhận Hàng Hoàn (Đã nhập kho)</option>
                            <option value="cancelled">❌ Đã Hủy</option>
                          </select>
                        </div>
                      </div>

                      {/* BANNERS CẢNH BÁO CHO ĐƠN THẤT BẠI / HOÀN VỀ KHO */}
                      {/* 1. Cảnh báo: Đơn giao thất bại & Đang chuyển hoàn */}
                      {order.status === 'returning' && (
                        <div className="my-2.5 bg-rose-50 border-2 border-rose-300 rounded-xl p-3 text-xs text-rose-950 shadow-2xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
                                <AlertTriangle className="w-4 h-4 animate-bounce" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong className="text-rose-900 font-extrabold text-xs sm:text-sm">
                                    ⚠️ CẢNH BÁO: ĐƠN GIAO THẤT BẠI - BƯU CỤC ĐANG CHUYỂN HOÀN VỀ KHO
                                  </strong>
                                  <span className="bg-rose-200 text-rose-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    Đang quay đầu
                                  </span>
                                </div>
                                <p className="text-rose-800 text-xs mt-1">
                                  <strong>Lý do bưu tá báo:</strong> <span className="underline italic font-medium">{order.failureReason || 'Không liên lạc được người nhận sau nhiều lần gọi'}</span>
                                </p>
                                <p className="text-[11px] text-rose-700 mt-0.5">
                                  Kiện thuốc đang được [{order.shippingCarrierName || 'Bưu cục'}] hoàn trả về Tổng kho Dược MedXpressCare. Vui lòng theo dõi khi hàng tới cửa kho.
                                </p>
                              </div>
                            </div>

                            {onWarehouseArrival && (
                              <button
                                type="button"
                                onClick={() => onWarehouseArrival(order.id)}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 self-end sm:self-center"
                                title="Bấm khi bưu tá đã mang kiện hàng hoàn về tới cửa kho thuốc"
                              >
                                <Package className="w-3.5 h-3.5" />
                                <span>📦 Đã Về Cửa Kho (Chờ kiểm)</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 2. Cảnh báo khẩn: Kiện hàng hoàn đã về kho - BẮT BUỘC DƯỢC SĨ KIỂM NHẬN THỦ CÔNG */}
                      {order.status === 'returned_pending_check' && (
                        <div className="my-2.5 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-400 rounded-xl p-3.5 text-xs text-amber-950 shadow-sm animate-in fade-in">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                <AlertCircle className="w-5 h-5 animate-pulse" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <strong className="text-amber-950 font-black text-xs sm:text-sm">
                                    📦 CẢNH BÁO: KIỆN HÀNG HOÀN ĐÃ VỀ KHO - YÊU CẦU DƯỢC SĨ XÁC NHẬN THỦ CÔNG
                                  </strong>
                                  <span className="bg-amber-200 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                                    Chờ kiểm nhận
                                  </span>
                                </div>
                                <p className="text-amber-900 text-xs mt-1">
                                  <strong>Lý do hoàn:</strong> <em>"{order.failureReason || 'Khách hàng không nhận thuốc'}"</em>
                                </p>
                                <p className="text-[11px] text-amber-800 mt-0.5">
                                  <span className="font-bold text-rose-700">⚠️ BẮT BUỘC KIỂM TRA THỦ CÔNG:</span> Kiểm tra tem niêm phong Bộ Y Tế, tình trạng vỡ móp và nhiệt độ bảo quản GSP trước khi tái nhập kho.
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setInspectingReturnOrder(order);
                                setInspectionForm({
                                  pharmacistName: 'DS. CKI Nguyễn Thu Trang',
                                  sealCondition: 'intact',
                                  gspCompliant: true,
                                  restoreStock: true,
                                  note: 'Hàng nguyên vẹn tem chống giả Bộ Y Tế, đã kiểm định ngoại quan và nhập lại giá kệ kho mát GSP.'
                                });
                              }}
                              className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98] self-end sm:self-center"
                            >
                              <CheckSquare className="w-4 h-4" />
                              <span>🔍 Kiểm Nhận & Xác Nhận Đã Nhận Hàng Hoàn</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 3. Đã kiểm nhận hàng hoàn & Nhập kho GSP thành công */}
                      {order.status === 'returned' && (
                        <div className="my-2.5 bg-emerald-50 border border-emerald-300 rounded-xl p-3 text-xs text-emerald-950 shadow-2xs">
                          <div className="flex items-start gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <strong className="text-emerald-900 font-extrabold text-xs">
                                  ✅ ĐÃ XÁC NHẬN THỦ CÔNG NHẬN HÀNG HOÀN & TÁI NHẬP KHO GSP
                                </strong>
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                                  Đã nhập kho an toàn
                                </span>
                              </div>
                              <div className="text-[11px] text-emerald-800 flex flex-wrap gap-x-3 gap-y-0.5">
                                <span>Dược sĩ kiểm nhận: <strong>{order.returnInspection?.pharmacistName || 'DS. CKI Nguyễn Thu Trang'}</strong></span>
                                <span>Tem niêm phong: <strong>{order.returnInspection?.sealCondition === 'intact' ? 'Nguyên vẹn 100%' : 'Có dấu hiệu mở seal'}</strong></span>
                                <span>Tồn kho: <strong>{order.returnInspection?.restoreStock !== false ? 'Đã cộng lại kho hàng' : 'Không nhập lại kho'}</strong></span>
                              </div>
                              {order.returnInspection?.note && (
                                <p className="text-[11px] text-emerald-700 italic bg-white/60 px-2 py-1 rounded border border-emerald-100 mt-1">
                                  Ghi chú kiểm nhận: "{order.returnInspection.note}"
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Customer Details & Product List */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-3 text-xs">
                        <div className="md:col-span-5 space-y-1 text-slate-700">
                          <div>Khách hàng: <strong className="text-slate-900 text-sm">{order.customer?.fullName}</strong></div>
                          <div className="flex items-center gap-2">
                            <span>SĐT: <strong className="font-mono text-emerald-700">{order.customer?.phone}</strong></span>
                            <a
                              href={`tel:${order.customer?.phone}`}
                              className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold hover:bg-emerald-200 inline-flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" /> Gọi
                            </a>
                            <a
                              href={`https://zalo.me/${order.customer?.phone?.replace(/\s+/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold hover:bg-blue-200 inline-flex items-center gap-1"
                            >
                              Zalo
                            </a>
                          </div>
                          <div>Địa chỉ: <strong>{order.customer?.address}, {order.customer?.district}, {order.customer?.province}</strong></div>
                          {order.customer?.note && (
                            <div className="p-2 rounded bg-amber-50 text-amber-900 border border-amber-200 mt-1">
                              <strong>Ghi chú:</strong> {order.customer.note}
                            </div>
                          )}
                        </div>

                        {/* Product Items Breakdown */}
                        <div className="md:col-span-7 space-y-1.5 border-t md:border-t-0 md:border-l md:pl-4 border-slate-100">
                          <div className="font-semibold text-slate-500 mb-1">Chi tiết giỏ hàng ({order.items?.length} loại):</div>
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg text-slate-700">
                              <span className="font-medium truncate max-w-[65%]">
                                • {item.name} <span className="text-emerald-700 font-bold">(x{item.quantity})</span>
                              </span>
                              <span className="font-mono font-bold text-slate-900">
                                {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                              </span>
                            </div>
                          ))}
                          
                          <div className="flex justify-between pt-2 border-t border-slate-200 text-sm font-black text-slate-900">
                            <span>Tổng thanh toán:</span>
                            <span className="text-emerald-700">{order.grandTotal?.toLocaleString('vi-VN')}₫</span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-slate-100">
                            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                              <span className="px-2 py-0.5 rounded-md font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {order.shippingMethod === 'express' ? '⚡ MedXpress Hỏa Tốc' :
                                 order.shippingMethod === 'ghn' ? '🚚 GHN Express' :
                                 order.shippingMethod === 'viettel' ? '🏣 Viettel Post' : '📦 GHTK'}
                              </span>

                              <span className="flex items-center gap-1 font-mono text-slate-700">
                                <span>Vận đơn:</span>
                                <strong className="text-emerald-800">{order.trackingNumber || `GHTK-${order.id.replace(/[^0-9]/g, '') || '883921'}VN`}</strong>
                              </span>

                              {order.autoTracking && order.status !== 'completed' && order.status !== 'cancelled' && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  <span>Auto-tracking bưu cục</span>
                                </span>
                              )}
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              {/* Nút xem Live Tracking Modal */}
                              {onOpenOrderTracking && (
                                <button
                                  type="button"
                                  onClick={() => onOpenOrderTracking(order)}
                                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold border border-emerald-200 transition-colors flex items-center gap-1 shadow-2xs"
                                  title="Xem hành trình bưu tá và nhật ký vận đơn trực tiếp"
                                >
                                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Tracking Vận Đơn</span>
                                </button>
                              )}

                              {/* Nút Sync tức thì sang trạng thái kế tiếp */}
                              {onSyncCarrierStatus && !['completed', 'cancelled', 'returned'].includes(order.status) && (
                                <button
                                  type="button"
                                  onClick={() => onSyncCarrierStatus(order)}
                                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-200 transition-colors flex items-center gap-1 shadow-2xs"
                                  title="Đồng bộ ngay sang trạng thái kế tiếp"
                                >
                                  <RefreshCw className="w-3 h-3 text-indigo-600" />
                                  <span>
                                    {order.status === 'pending' ? '⚡ Bưu cục nhận đơn' : 
                                     order.status === 'confirmed' ? '⚡ Lấy hàng ngay' : 
                                     order.status === 'shipping' ? '⚡ Giao thành công' : 
                                     order.status === 'returning' ? '⚡ Hàng về tới kho' : '⚡ Đồng bộ bưu cục'}
                                  </span>
                                </button>
                              )}

                              {/* Nút Báo Giao Thất Bại & Kích hoạt chuyển hoàn (khi đang giao) */}
                              {order.status === 'shipping' && onFailAndReturnOrder && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFailingOrder(order);
                                    setSelectedFailureReason(RETURN_REASONS[0]);
                                    setCustomFailureReason('');
                                  }}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 transition-colors flex items-center gap-1 shadow-2xs"
                                  title="Báo bưu cục giao không thành công và kích hoạt chuyển hoàn về kho"
                                >
                                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>⚠️ Báo Giao Thất Bại</span>
                                </button>
                              )}

                              {/* Nút Bưu tá đã mang kiện hàng hoàn về tới kho */}
                              {order.status === 'returning' && onWarehouseArrival && (
                                <button
                                  type="button"
                                  onClick={() => onWarehouseArrival(order.id)}
                                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold border border-amber-300 transition-colors flex items-center gap-1 shadow-2xs"
                                  title="Đánh dấu kiện hàng hoàn đã về tới cửa kho MedXpressCare"
                                >
                                  <Package className="w-3.5 h-3.5 text-amber-600" />
                                  <span>📦 Bưu tá giao tới kho</span>
                                </button>
                              )}

                              {/* Nút Dược sĩ kiểm nhận thủ công khi kiện hàng đã về kho */}
                              {order.status === 'returned_pending_check' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setInspectingReturnOrder(order);
                                    setInspectionForm({
                                      pharmacistName: 'DS. CKI Nguyễn Thu Trang',
                                      sealCondition: 'intact',
                                      gspCompliant: true,
                                      restoreStock: true,
                                      note: 'Hàng nguyên vẹn tem chống giả Bộ Y Tế, đã kiểm định ngoại quan và nhập lại giá kệ kho mát GSP.'
                                    });
                                  }}
                                  className="px-3 py-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 shadow-sm"
                                  title="Kiểm tra tem niêm phong và xác nhận thủ công nhận hàng hoàn"
                                >
                                  <CheckSquare className="w-3.5 h-3.5" />
                                  <span>🔍 Kiểm Nhận Hàng Hoàn</span>
                                </button>
                              )}

                              {/* Nút In phiếu gửi */}
                              <button
                                type="button"
                                onClick={() => {
                                  // Khi in đơn, nếu đơn chưa xác nhận thì tự động chuyển xác nhận và kích hoạt auto tracking
                                  if (order.status === 'pending' && onUpdateOrderStatus) {
                                    onUpdateOrderStatus(order.id, 'confirmed', { isPrinted: true });
                                  }
                                  setPrintingOrder(order);
                                }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold border border-slate-200 transition-colors flex items-center gap-1 shadow-2xs"
                                title="In phiếu đóng gói và gửi hàng dán lên hộp bưu kiện"
                              >
                                <Printer className="w-3 h-3 text-slate-600" />
                                <span>In Phiếu Gửi</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* TAB 2: QUẢN LÝ SẢN PHẨM */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Kho Thực Phẩm Chức Năng ({products.length} sản phẩm)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Gồm {domesticProductsCount} sản phẩm Nội Địa và {importedProductsCount} sản phẩm Nhập Khẩu
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportProductsCSV}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-200 transition-all"
                    title="Xuất kho hàng ra file Excel CSV có dấu tiếng Việt UTF-8"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkImportType('products')}
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-blue-200 transition-all"
                    title="Nhập hàng loạt sản phẩm qua file CSV / JSON"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nhập File Hàng Loạt</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProduct(!showAddProduct)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{showAddProduct ? 'Đóng Form' : 'Thêm Sản Phẩm Mới'}</span>
                  </button>
                </div>
              </div>

              {/* Add Product Form Modal / Section */}
              {showAddProduct && (
                <form 
                  onSubmit={handleCreateProductSubmit}
                  className="bg-white p-5 rounded-2xl border-2 border-emerald-400 shadow-md space-y-4 animate-in slide-in-from-top-4"
                >
                  <div className="font-bold text-sm text-emerald-800 flex items-center gap-1.5 border-b pb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Thêm Thực Phẩm Chức Năng Mới Vào Website
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-700 font-semibold mb-1">Tên sản phẩm *</label>
                      <input
                        type="text"
                        placeholder="VD: Viên Uống Bổ Não Ginkgo Biloba 120mg..."
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Thương hiệu</label>
                      <input
                        type="text"
                        placeholder="VD: Traphaco, Blackmores, DHC..."
                        value={newProduct.brand}
                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Phân loại xuất xứ</label>
                      <select
                        value={newProduct.originType}
                        onChange={(e) => {
                          const isDom = e.target.value === 'domestic';
                          setNewProduct({
                            ...newProduct,
                            originType: e.target.value,
                            countryCode: isDom ? 'VN' : 'US',
                            countryName: isDom ? 'Việt Nam' : 'Mỹ (USA)',
                            flag: isDom ? '🇻🇳' : '🇺🇸'
                          });
                        }}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                      >
                        <option value="domestic">🇻🇳 Hàng Nội Địa Uy Tín</option>
                        <option value="imported">🌍 Hàng Nhập Ngoại</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Quốc gia</label>
                      <input
                        type="text"
                        value={newProduct.countryName}
                        onChange={(e) => setNewProduct({ ...newProduct, countryName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Giá bán (VNĐ) *</label>
                      <input
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-emerald-700"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Giá gốc (niêm yết)</label>
                      <input
                        type="number"
                        value={newProduct.originalPrice}
                        onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Số ĐKSP Bộ Y Tế</label>
                      <input
                        type="text"
                        placeholder="VD: 7824/2022/ĐKSP"
                        value={newProduct.regNumber}
                        onChange={(e) => setNewProduct({ ...newProduct, regNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Quy cách đóng gói</label>
                      <input
                        type="text"
                        placeholder="VD: Hộp 60 viên nang"
                        value={newProduct.packaging}
                        onChange={(e) => setNewProduct({ ...newProduct, packaging: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                      />
                    </div>
                  </div>

                  {/* KHU VỰC TẢI ẢNH SẢN PHẨM TRỰC TIẾP TỪ MÁY HOẶC DÁN LINK */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label className="text-slate-800 font-bold text-xs flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-emerald-600" />
                        <span>Hình Ảnh Sản Phẩm *</span>
                      </label>

                      {/* Nút chuyển đổi: Tải trực tiếp hoặc Dán link URL */}
                      <div className="inline-flex rounded-xl bg-slate-200/90 p-1 text-[11px] font-bold self-start sm:self-auto">
                        <button
                          type="button"
                          onClick={() => setImageInputMode('upload')}
                          className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                            imageInputMode === 'upload'
                              ? 'bg-white text-emerald-800 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Tải ảnh từ máy tính</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImageInputMode('url')}
                          className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                            imageInputMode === 'url'
                              ? 'bg-white text-emerald-800 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>Dán link URL</span>
                        </button>
                      </div>
                    </div>

                    {/* Mode 1: Tải trực tiếp từ máy (Drag & Drop + File Picker) */}
                    {imageInputMode === 'upload' ? (
                      <div className="space-y-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageFile(e.target.files[0]);
                            }
                          }}
                          className="hidden"
                        />

                        {newProduct.image ? (
                          <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-white rounded-xl border border-emerald-300 shadow-xs">
                            <div className="relative group shrink-0">
                              <img
                                src={newProduct.image}
                                alt="Xem trước sản phẩm"
                                className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-xs"
                              />
                              <div className="absolute inset-0 bg-slate-900/50 rounded-xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                                Ảnh nét
                              </div>
                            </div>

                            <div className="flex-1 min-w-0 text-left space-y-1">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Đã nạp ảnh thành công và sẵn sàng hiển thị</span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate font-mono">
                                {uploadedFileName || 'Ảnh tải từ máy tính (Đã tự động nén tối ưu)'}
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => fileInputRef.current?.click()}
                                  disabled={uploadingImage}
                                  className="text-[11px] font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5"
                                >
                                  <RefreshCw className={`w-3 h-3 ${uploadingImage ? 'animate-spin' : ''}`} />
                                  <span>Chọn ảnh khác</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setNewProduct({ ...newProduct, image: '' });
                                    setUploadedFileName('');
                                    if (fileInputRef.current) fileInputRef.current.value = '';
                                  }}
                                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Xóa ảnh</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div
                            onDragOver={(e) => {
                              e.preventDefault();
                              setDragOver(true);
                            }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all ${
                              dragOver 
                                ? 'border-emerald-500 bg-emerald-50/80 shadow-inner' 
                                : 'border-slate-300 hover:border-emerald-400 bg-white hover:bg-emerald-50/30'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto flex items-center justify-center mb-2.5">
                              {uploadingImage ? (
                                <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
                              ) : (
                                <UploadCloud className="w-6 h-6" />
                              )}
                            </div>
                            <div className="text-xs font-bold text-slate-800">
                              {uploadingImage ? 'Đang xử lý và tối ưu hóa dung lượng ảnh...' : 'Bấm để chọn file ảnh từ máy tính hoặc kéo thả ảnh vào đây'}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-1">
                              Hỗ trợ định dạng JPG, PNG, WEBP, GIF (Tự động nén chuẩn để website tải cực nhanh)
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Mode 2: Dán link URL */
                      <div className="space-y-2">
                        <input
                          type="url"
                          placeholder="https://example.com/hinh-anh-hop-thuoc.jpg"
                          value={newProduct.image}
                          onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                          className="w-full px-3 py-2 bg-white border rounded-xl text-xs font-mono"
                        />
                        {newProduct.image && (
                          <div className="flex items-center gap-3 p-2.5 bg-white rounded-xl border border-slate-200">
                            <img
                              src={newProduct.image}
                              alt="Xem trước ảnh link ngoài"
                              className="w-12 h-12 rounded-lg object-cover border"
                              onError={(e) => { 
                                e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'; 
                              }}
                            />
                            <div className="text-[11px] text-slate-500 truncate">
                              Xem trước ảnh từ đường link bên ngoài
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Nhóm Sức Khỏe & Bệnh Lý (Cho phép chọn nhiều nhóm bệnh lý) */}
                  <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <label className="block text-slate-900 font-extrabold text-xs flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-emerald-600" />
                        <span>Nhóm Sức Khỏe / Bệnh Lý Điều Trị * (Cho phép chọn nhiều nhóm):</span>
                      </label>
                      <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Đã chọn: {(newProduct.categories || [newProduct.category || 'bone_joint']).length} nhóm
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Bấm vào từng nhóm để bật/tắt. Sản phẩm sẽ tự động hiển thị trong tất cả các nhóm bệnh được chọn khi khách hàng tra cứu hoặc AI Dược sĩ tư vấn.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                      {CATEGORIES.filter(c => c.id !== 'all').map(c => {
                        const selectedCats = Array.isArray(newProduct.categories) && newProduct.categories.length > 0
                          ? newProduct.categories
                          : [newProduct.category || 'bone_joint'];
                        const isChecked = selectedCats.includes(c.id);
                        return (
                          <button
                            type="button"
                            key={c.id}
                            onClick={() => toggleNewProductCategory(c.id)}
                            className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                              isChecked
                                ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs font-bold ring-2 ring-emerald-500/20'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40'
                            }`}
                          >
                            <span className="truncate pr-1">{c.name}</span>
                            <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 font-bold ${
                              isChecked ? 'bg-white text-emerald-700' : 'border border-slate-300 text-transparent'
                            }`}>
                              ✓
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hàng Dạng Bào Chế & Đối Tượng Sử Dụng */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Dạng Bào Chế</label>
                      <select
                        value={newProduct.dosageForm}
                        onChange={(e) => setNewProduct({ ...newProduct, dosageForm: e.target.value })}
                        className="w-full px-3 py-2 bg-white border rounded-xl font-medium"
                      >
                        {DOSAGE_FORMS.filter(d => d.id !== 'all').map(d => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Đối Tượng Sử Dụng</label>
                      <select
                        value={newProduct.targetAudience}
                        onChange={(e) => setNewProduct({ ...newProduct, targetAudience: e.target.value })}
                        className="w-full px-3 py-2 bg-white border rounded-xl font-medium"
                      >
                        {TARGET_AUDIENCES.map(a => (
                          <option key={a.id} value={a.id}>{a.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Mô Tả & Hướng Dẫn Sử Dụng (Y Dược) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        Mô Tả Ngắn Sản Phẩm *
                      </label>
                      <textarea
                        rows="2"
                        placeholder="Mô tả tóm tắt tác dụng chính và điểm nổi bật của TPCN..."
                        value={newProduct.shortDesc}
                        onChange={(e) => setNewProduct({ ...newProduct, shortDesc: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        Hướng Dẫn Sử Dụng & Liều Dùng *
                      </label>
                      <textarea
                        rows="2"
                        placeholder="VD: Uống 2 viên/lần, ngày 2 lần sau bữa ăn 30 phút. Đợt dùng khuyến nghị 3-6 tháng..."
                        value={newProduct.usage}
                        onChange={(e) => setNewProduct({ ...newProduct, usage: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Thành Phần & Công Dụng Y Khoa */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Thành Phần & Hàm Lượng (Mỗi dòng 1 chất)
                      </label>
                      <textarea
                        rows="3"
                        placeholder={"Chiết xuất vỏ Liễu trắng: 100mg\nChiết xuất cây Móng Quỷ: 25mg\nCao Hy thiêm: 300mg"}
                        value={newProduct.ingredientsText}
                        onChange={(e) => setNewProduct({ ...newProduct, ingredientsText: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-[11px] focus:bg-white"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">Nhập theo định dạng: Tên hoạt chất : Hàm lượng</p>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                        Công Dụng Nổi Bật (Mỗi dòng 1 công dụng)
                      </label>
                      <textarea
                        rows="3"
                        placeholder={"Giảm sưng đau do viêm khớp thoái hóa khớp\nHỗ trợ bôi trơn ổ khớp vận động linh hoạt\nLàm chậm quá trình thoái hóa khớp"}
                        value={newProduct.benefitsText}
                        onChange={(e) => setNewProduct({ ...newProduct, benefitsText: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-[11px] focus:bg-white"
                      />
                      <p className="text-[10px] text-slate-400 mt-0.5">Các công dụng này sẽ hiển thị dạng checklist dấu tích xanh</p>
                    </div>
                  </div>

                  {/* Lưu Ý & Chống Chỉ Định */}
                  <div className="text-xs">
                    <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      Lưu Ý & Chống Chỉ Định Từ Dược Sĩ (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Không dùng cho phụ nữ có thai, người có rối loạn đông máu hoặc mẫn cảm thành phần..."
                      value={newProduct.contraindications}
                      onChange={(e) => setNewProduct({ ...newProduct, contraindications: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl focus:bg-white"
                    />
                  </div>

                  {/* Nút hành động */}
                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <button
                      type="button"
                      onClick={() => setShowAddProduct(false)}
                      className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow transition-colors"
                    >
                      Lưu Sản Phẩm Vào Website
                    </button>
                  </div>
                </form>
              )}

              {/* Product List Table */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Sản Phẩm</th>
                        <th className="p-3.5">Xuất Xứ</th>
                        <th className="p-3.5">Số ĐKSP</th>
                        <th className="p-3.5">Giá Bán</th>
                        <th className="p-3.5">Đã Bán</th>
                        <th className="p-3.5 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 flex items-center gap-3">
                            <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover border" />
                            <div>
                              <div className="font-bold text-slate-900 truncate max-w-xs">{p.name}</div>
                              <div className="text-[10px] text-slate-400">{p.brand} • {p.packaging}</div>
                              <div className="flex flex-wrap gap-1 mt-1 max-w-xs">
                                {(Array.isArray(p.categories) && p.categories.length > 0 ? p.categories : [p.category].filter(Boolean)).map(cid => {
                                  const cObj = CATEGORIES.find(c => c.id === cid);
                                  return cObj ? (
                                    <span key={cid} className="text-[9px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.2 rounded-md">
                                      {cObj.name}
                                    </span>
                                  ) : null;
                                })}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded text-[11px] ${
                              p.originType === 'domestic' ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                            }`}>
                              {p.flag} {p.originType === 'domestic' ? 'Nội Địa' : p.countryName}
                            </span>
                          </td>
                          <td className="p-3 font-mono text-[11px] text-slate-500">
                            {p.regNumber}
                          </td>
                          <td className="p-3 font-bold text-emerald-700">
                            {p.price.toLocaleString('vi-VN')}₫
                          </td>
                          <td className="p-3 font-semibold text-slate-700">
                            {p.soldCount}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                                title="Chỉnh sửa sản phẩm"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm: ${p.name}?`)) {
                                    onDeleteProduct(p.id);
                                  }
                                }}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                title="Xóa sản phẩm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB: QUẢN LÝ SỐ ĐKSP BỘ Y TẾ */}
          {activeTab === 'registrations' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-emerald-600" />
                    <span>Cơ Sở Dữ Liệu Số Đăng Ký Sản Phẩm ({Object.keys(registrations || {}).length} số ĐKSP)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dữ liệu công bố Cục An Toàn Thực Phẩm - Bộ Y Tế. Khách hàng có thể tra cứu trực tiếp ngoài trang chủ.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportRegistrationsCSV}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-200 transition-all"
                    title="Xuất cơ sở dữ liệu số ĐKSP ra file Excel CSV"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkImportType('registrations')}
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-blue-200 transition-all"
                    title="Nhập nhiều Số ĐKSP từ file CSV hoặc JSON"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nhập File Hàng Loạt</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenAddReg}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Thủ Công 1 Số ĐKSP</span>
                  </button>
                </div>
              </div>

              {/* Cards thống kê Số ĐKSP */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Tổng Số Giấy Phép Đã Xác Thực</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">
                    {Object.keys(registrations || {}).length} số công bố
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Lưu trữ trong CSDL hệ thống</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Phương Thức Cập Nhật</div>
                  <div className="text-sm font-bold text-slate-800 mt-1 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-bold">Thủ công</span>
                    <span>+</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-bold">File Excel (CSV)</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Không cần sửa code</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Tra Cứu Khách Hàng</div>
                  <div className="text-sm font-bold text-emerald-600 mt-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Đồng bộ tức thì ngoài Trang Chủ</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Hiển thị chứng nhận xanh cho khách</div>
                </div>
              </div>

              {/* Thanh tìm kiếm số ĐKSP */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Tìm theo Số ĐKSP (VD: 8521/2023), tên sản phẩm hoặc doanh nghiệp chịu trách nhiệm..."
                    value={searchReg}
                    onChange={(e) => setSearchReg(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Bảng danh sách số ĐKSP */}
              {Object.entries(registrations || {}).filter(([regNumber, item]) => {
                if (!searchReg.trim()) return true;
                const q = searchReg.toLowerCase().trim();
                return (
                  regNumber.toLowerCase().includes(q) ||
                  (item.name || '').toLowerCase().includes(q) ||
                  (item.applicant || '').toLowerCase().includes(q) ||
                  (item.origin || '').toLowerCase().includes(q)
                );
              }).length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
                  <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                  <h4 className="font-bold text-slate-700 text-sm">Chưa tìm thấy Số ĐKSP nào phù hợp</h4>
                  <p className="text-xs text-slate-400 mt-1">Bấm nút "Thêm Thủ Công 1 Số ĐKSP" hoặc "Nhập File Hàng Loạt" để bổ sung dữ liệu.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3.5">Số ĐKSP Bộ Y Tế</th>
                          <th className="p-3.5">Tên Sản Phẩm Đăng Ký</th>
                          <th className="p-3.5">Doanh Nghiệp Chịu Trách Nhiệm</th>
                          <th className="p-3.5">Phân Loại / Xuất Xứ</th>
                          <th className="p-3.5">Năm Cấp & Trạng Thái</th>
                          <th className="p-3.5">Tiêu Chuẩn</th>
                          <th className="p-3.5 text-right">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {Object.entries(registrations || {})
                          .filter(([regNumber, item]) => {
                            if (!searchReg.trim()) return true;
                            const q = searchReg.toLowerCase().trim();
                            return (
                              regNumber.toLowerCase().includes(q) ||
                              (item.name || '').toLowerCase().includes(q) ||
                              (item.applicant || '').toLowerCase().includes(q) ||
                              (item.origin || '').toLowerCase().includes(q)
                            );
                          })
                          .map(([regNumber, item]) => (
                            <tr key={regNumber} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3.5">
                                <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md inline-block">
                                  {regNumber}
                                </span>
                              </td>
                              <td className="p-3.5 font-bold text-slate-900 max-w-xs">
                                {item.name}
                              </td>
                              <td className="p-3.5 text-slate-700 max-w-xs">
                                {item.applicant || 'Doanh nghiệp Dược phẩm'}
                              </td>
                              <td className="p-3.5">
                                <div className="text-slate-900 font-semibold">{item.type || 'TPCN'}</div>
                                <div className="text-[10px] text-slate-400">{item.origin || 'Việt Nam'}</div>
                              </td>
                              <td className="p-3.5">
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-semibold text-[10px] inline-block">
                                  {item.status || 'Đã cấp phép'}
                                </span>
                                <div className="text-[10px] text-slate-400 mt-0.5">Năm cấp: {item.date || '2024'}</div>
                              </td>
                              <td className="p-3.5">
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold text-[10px] inline-block">
                                  {item.inspectStandard || 'GMP-WHO Bộ Y Tế'}
                                </span>
                              </td>
                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditReg(regNumber, item)}
                                    className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 transition-colors"
                                    title="Sửa thông tin Số ĐKSP"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteRegistrationConfirm(regNumber, item.name)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                                    title="Xóa Số ĐKSP khỏi hệ thống"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: QUẢN LÝ BÀI VIẾT & CẨM NANG CHUẨN SEO */}
          {activeTab === 'articles' && (
            <div className="space-y-4">
              
              {/* Thống kê bài viết & Điểm SEO */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div className="text-slate-400 text-xs font-semibold">Tổng Bài Viết</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">{articles.length}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Trong hệ thống cẩm nang</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div className="text-slate-400 text-xs font-semibold">Đã Xuất Bản</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {articles.filter(a => a.status !== 'draft').length}
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">Hiển thị ngoài website</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div className="text-slate-400 text-xs font-semibold">Bản Nháp</div>
                  <div className="text-2xl font-black text-amber-500 mt-1">
                    {articles.filter(a => a.status === 'draft').length}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Chờ hoàn thiện nội dung</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div className="text-slate-400 text-xs font-semibold">Điểm SEO Trung Bình</div>
                  <div className="text-2xl font-black text-teal-600 mt-1 flex items-center gap-1.5">
                    <span>{averageSeoScore}/100</span>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                      Tối ưu
                    </span>
                  </div>
                  <div className="text-[11px] text-teal-700 mt-0.5 font-medium">Chuẩn Google SERP & EEAT</div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Tìm bài viết theo tiêu đề, từ khóa SEO, tác giả..."
                      value={searchArticleQuery}
                      onChange={(e) => setSearchArticleQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>

                  <select
                    value={selectedArticleCat}
                    onChange={(e) => setSelectedArticleCat(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:bg-white focus:outline-none"
                  >
                    <option value="all">Tất cả chuyên mục</option>
                    <option value="Chuyên Gia Tư Vấn">Chuyên Gia Tư Vấn</option>
                    <option value="Cảnh Báo & Hàng Thật">Cảnh Báo & Hàng Thật</option>
                    <option value="Dược Liệu Bản Địa">Dược Liệu Bản Địa</option>
                    <option value="Cơ Xương Khớp">Cơ Xương Khớp</option>
                    <option value="Tim Mạch & Huyết Áp">Tim Mạch & Huyết Áp</option>
                    <option value="Dinh Dưỡng & Đề Kháng">Dinh Dưỡng & Đề Kháng</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  {/* Nút Viết Lại Bằng AI */}
                  <button
                    type="button"
                    onClick={() => {
                      setAiSourceUrl('');
                      setAiRawContent('');
                      setAiRewriteResult(null);
                      setAiTestResult(null);
                      setShowAiModal(true);
                    }}
                    className="px-3.5 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>Viết Lại Bằng AI (Từ Link Web)</span>
                  </button>

                  {/* Nút Soạn bài mới thủ công */}
                  <button
                    type="button"
                    onClick={handleOpenAddArticle}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Soạn Bài Mới Chuẩn SEO</span>
                  </button>
                </div>
              </div>

              {/* Bảng Danh Sách Bài Viết */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Bài Viết & Đường Dẫn Slug</th>
                        <th className="p-3.5">Chuyên Mục & Tác Giả</th>
                        <th className="p-3.5">Từ Khóa & Điểm SEO</th>
                        <th className="p-3.5">Lượt Xem</th>
                        <th className="p-3.5">Trạng Thái</th>
                        <th className="p-3.5 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {articles
                        .filter(art => {
                          const matchCat = selectedArticleCat === 'all' || art.category === selectedArticleCat;
                          const q = searchArticleQuery.toLowerCase().trim();
                          const matchQuery = !q || 
                            art.title.toLowerCase().includes(q) ||
                            (art.focusKeyword && art.focusKeyword.toLowerCase().includes(q)) ||
                            (art.author && art.author.toLowerCase().includes(q));
                          return matchCat && matchQuery;
                        })
                        .map(art => {
                          const seoScore = art.seoScore || calculateSeoScore(art).score;
                          return (
                            <tr key={art.id} className="hover:bg-slate-50 transition-colors">
                              {/* Cột 1: Ảnh, Tiêu đề, Slug */}
                              <td className="p-3.5 max-w-sm">
                                <div className="flex items-start gap-3">
                                  <img
                                    src={art.image}
                                    alt={art.title}
                                    className="w-12 h-12 object-cover rounded-xl shrink-0 bg-slate-100 border border-slate-200"
                                  />
                                  <div className="min-w-0">
                                    <div className="font-bold text-slate-900 leading-snug truncate hover:text-emerald-700">
                                      {art.title}
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                                      /cam-nang/{art.slug}
                                    </div>
                                    {art.featured && (
                                      <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded border border-amber-200">
                                        ★ Nổi bật
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Cột 2: Chuyên mục, Tác giả */}
                              <td className="p-3.5 whitespace-nowrap">
                                <span className="inline-block font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px] mb-1">
                                  {art.category}
                                </span>
                                <div className="text-[11px] text-slate-500 font-medium">
                                  {art.author}
                                </div>
                              </td>

                              {/* Cột 3: Từ khóa & Điểm SEO */}
                              <td className="p-3.5 whitespace-nowrap">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Tag className="w-3 h-3 text-slate-400" />
                                  <span className="font-semibold text-slate-800 text-[11px]">
                                    {art.focusKeyword || 'Chưa đặt từ khóa'}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] border flex items-center gap-1 ${
                                    seoScore >= 85
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : seoScore >= 65
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : 'bg-rose-50 text-rose-800 border-rose-300'
                                  }`}>
                                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                    SEO: {seoScore}/100 {seoScore >= 85 ? 'Tốt' : seoScore >= 65 ? 'Khá' : 'Cần sửa'}
                                  </span>
                                </div>
                              </td>

                              {/* Cột 4: Lượt xem & Ngày */}
                              <td className="p-3.5 whitespace-nowrap">
                                <div className="font-semibold text-slate-800">{art.views || 0} lượt đọc</div>
                                <div className="text-[11px] text-slate-400">{art.publishedAt || 'Hôm nay'}</div>
                              </td>

                              {/* Cột 5: Trạng thái */}
                              <td className="p-3.5 whitespace-nowrap">
                                {art.status === 'draft' ? (
                                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                                    Bản nháp
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                                    Đã xuất bản
                                  </span>
                                )}
                              </td>

                              {/* Cột 6: Thao tác */}
                              <td className="p-3.5 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditArticle(art)}
                                    className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors font-medium text-xs flex items-center gap-1"
                                    title="Sửa bài viết & Tối ưu SEO"
                                  >
                                    <Edit className="w-4 h-4 text-emerald-600" />
                                    <span>Sửa SEO</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteArticleClick(art)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Xóa bài viết"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>

                {articles.length === 0 && (
                  <div className="p-8 text-center text-slate-400">
                    Chưa có bài viết nào trong cẩm nang. Hãy bấm "Soạn Bài Mới" hoặc "Viết Lại Bằng AI" để bắt đầu!
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: QUẢN LÝ MÃ GIẢM GIÁ & VOUCHER KHUYẾN MÃI */}
          {activeTab === 'vouchers' && (
            <div className="space-y-4">
              
              {/* Thống kê Voucher */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng Số Mã Phát Hành</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{vouchers.length}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      {vouchers.filter(v => v.enabled).length} mã đang hoạt động
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Tag className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Lượt Sử Dụng Thành Công</div>
                    <div className="text-2xl font-black text-emerald-700 mt-1">
                      {vouchers.reduce((acc, v) => acc + (v.usedCount || 0), 0)}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      Từ các đơn đặt hàng online
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Hỗ Trợ Khách Hàng</div>
                    <div className="text-2xl font-black text-blue-700 mt-1">
                      {(vouchers.reduce((acc, v) => acc + (v.usedCount || 0) * (v.discountType === 'fixed' ? v.discountValue : 35000), 0)).toLocaleString('vi-VN')}₫
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                      Tổng tiền chiết khấu & Freeship
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Thanh tìm kiếm & Nút Tạo Voucher */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex flex-wrap items-center gap-2 flex-1">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tìm theo mã voucher hoặc tên chương trình..."
                      value={searchVoucher}
                      onChange={(e) => setSearchVoucher(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div className="flex items-center gap-1 overflow-x-auto">
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'fixed', label: 'Giảm tiền' },
                      { id: 'percent', label: 'Giảm %' },
                      { id: 'shipping', label: 'Freeship' }
                    ].map(f => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setFilterVoucherType(f.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                          filterVoucherType === f.id
                            ? 'bg-emerald-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingVoucher(null);
                    setVoucherFormData({
                      code: '',
                      title: '',
                      discountType: 'fixed',
                      discountValue: 50000,
                      minOrderValue: 400000,
                      maxDiscount: 50000,
                      usageLimit: 500,
                      usedCount: 0,
                      expiryDate: '2026-12-31',
                      enabled: true,
                      badgeText: 'Giảm 50.000₫',
                      description: ''
                    });
                    setShowAddVoucherModal(true);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo Mã Voucher Mới</span>
                </button>
              </div>

              {/* Bảng Danh Sách Voucher */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3.5">Mã Voucher</th>
                        <th className="p-3.5">Tên Chương Trình</th>
                        <th className="p-3.5">Mức Giảm</th>
                        <th className="p-3.5">Đơn Tối Thiểu</th>
                        <th className="p-3.5">Đã Dùng / Giới Hạn</th>
                        <th className="p-3.5">Hạn Sử Dụng</th>
                        <th className="p-3.5 text-center">Trạng Thái</th>
                        <th className="p-3.5 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vouchers
                        .filter(v => {
                          const matchSearch = (v.code || '').toLowerCase().includes(searchVoucher.toLowerCase()) || 
                                              (v.title || '').toLowerCase().includes(searchVoucher.toLowerCase());
                          const matchType = filterVoucherType === 'all' || v.discountType === filterVoucherType;
                          return matchSearch && matchType;
                        })
                        .map(v => (
                          <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-3.5 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
                                  {v.code}
                                </span>
                              </div>
                            </td>

                            <td className="p-3.5">
                              <div className="font-extrabold text-slate-900">{v.title}</div>
                              <div className="text-[11px] text-slate-500 line-clamp-1">{v.description}</div>
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              <span className="font-extrabold text-rose-600 text-xs">
                                {v.discountType === 'shipping' ? (
                                  'Freeship 100%'
                                ) : v.discountType === 'percent' ? (
                                  `Giảm ${v.discountValue}% (Tối đa ${(v.maxDiscount || 0).toLocaleString('vi-VN')}₫)`
                                ) : (
                                  `-${v.discountValue.toLocaleString('vi-VN')}₫`
                                )}
                              </span>
                            </td>

                            <td className="p-3.5 whitespace-nowrap font-semibold text-slate-700">
                              {(v.minOrderValue || 0).toLocaleString('vi-VN')}₫
                            </td>

                            <td className="p-3.5 whitespace-nowrap">
                              <div className="font-bold text-slate-800">{v.usedCount || 0} / {v.usageLimit || '∞'}</div>
                              {v.usageLimit && (
                                <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                                  <div 
                                    className="h-full bg-emerald-500 rounded-full" 
                                    style={{ width: `${Math.min(100, ((v.usedCount || 0) / v.usageLimit) * 100)}%` }} 
                                  />
                                </div>
                              )}
                            </td>

                            <td className="p-3.5 whitespace-nowrap font-medium text-slate-600">
                              {v.expiryDate || 'Vô thời hạn'}
                            </td>

                            <td className="p-3.5 text-center whitespace-nowrap">
                              <button
                                type="button"
                                onClick={() => {
                                  if (onUpdateVoucher) {
                                    onUpdateVoucher({ ...v, enabled: !v.enabled });
                                  }
                                }}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                  v.enabled
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                                }`}
                              >
                                {v.enabled ? '● Đang chạy' : '○ Tạm tắt'}
                              </button>
                            </td>

                            <td className="p-3.5 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingVoucher(v);
                                    setVoucherFormData({ ...v });
                                    setShowAddVoucherModal(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Chỉnh sửa voucher"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Xóa mã voucher "${v.code}"?`)) {
                                      if (onDeleteVoucher) onDeleteVoucher(v.id);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Xóa voucher"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {vouchers.length === 0 && (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    Chưa có mã voucher nào. Hãy bấm "Tạo Mã Voucher Mới" để bắt đầu!
                  </div>
                )}
              </div>

              {/* Modal Thêm / Chỉnh Sửa Voucher */}
              {showAddVoucherModal && (
                <div 
                  className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
                  onClick={() => setShowAddVoucherModal(false)}
                >
                  <div 
                    className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-4"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <Tag className="w-5 h-5 text-amber-300" />
                        <h4 className="font-extrabold text-sm sm:text-base">
                          {editingVoucher ? `Chỉnh Sửa Voucher: ${editingVoucher.code}` : 'Tạo Mã Giảm Giá & Voucher Mới'}
                        </h4>
                      </div>
                      <button 
                        onClick={() => setShowAddVoucherModal(false)}
                        className="p-1.5 rounded-full hover:bg-white/10 text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (!voucherFormData.code.trim()) return;

                        const cleanedCode = voucherFormData.code.trim().toUpperCase();
                        const payload = {
                          ...voucherFormData,
                          code: cleanedCode,
                          id: editingVoucher ? editingVoucher.id : 'vouch-' + Date.now(),
                          discountValue: Number(voucherFormData.discountValue),
                          minOrderValue: Number(voucherFormData.minOrderValue),
                          maxDiscount: Number(voucherFormData.maxDiscount),
                          usageLimit: Number(voucherFormData.usageLimit)
                        };

                        if (editingVoucher) {
                          if (onUpdateVoucher) onUpdateVoucher(payload);
                        } else {
                          if (onAddVoucher) onAddVoucher(payload);
                        }
                        setShowAddVoucherModal(false);
                      }}
                      className="p-5 sm:p-6 space-y-4 text-xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Mã Voucher (Code): *</label>
                          <input
                            type="text"
                            required
                            placeholder="VD: MEDXPRESS100"
                            value={voucherFormData.code}
                            onChange={(e) => setVoucherFormData({ ...voucherFormData, code: e.target.value.toUpperCase() })}
                            className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono font-bold uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Tên Chương Trình: *</label>
                          <input
                            type="text"
                            required
                            placeholder="VD: Tri ân khách hàng thân thiết"
                            value={voucherFormData.title}
                            onChange={(e) => setVoucherFormData({ ...voucherFormData, title: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Loại Chiết Khấu:</label>
                          <select
                            value={voucherFormData.discountType}
                            onChange={(e) => setVoucherFormData({ ...voucherFormData, discountType: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium focus:bg-white"
                          >
                            <option value="fixed">Số tiền cố định (₫)</option>
                            <option value="percent">Theo phần trăm (%)</option>
                            <option value="shipping">Miễn phí ship (Freeship)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            {voucherFormData.discountType === 'percent' ? 'Mức giảm (%)' : 'Mức giảm (₫)'}:
                          </label>
                          <input
                            type="number"
                            required
                            value={voucherFormData.discountValue}
                            onChange={(e) => setVoucherFormData({ ...voucherFormData, discountValue: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Giảm Tối Đa (₫):</label>
                          <input
                            type="number"
                            value={voucherFormData.maxDiscount}
                            onChange={(e) => setVoucherFormData({ ...voucherFormData, maxDiscount: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Đơn Tối Thiểu (₫):</label>
                          <input
                            type="number"
                            value={voucherFormData.minOrderValue}
                            onChange={(e) => setVoucherFormData({ ...voucherFormData, minOrderValue: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Giới Hạn Lượt Dùng:</label>
                          <input
                            type="number"
                            value={voucherFormData.usageLimit}
                            onChange={(e) => setVoucherFormData({ ...voucherFormData, usageLimit: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">Hạn Sử Dụng:</label>
                          <input
                            type="date"
                            value={voucherFormData.expiryDate}
                            onChange={(e) => setVoucherFormData({ ...voucherFormData, expiryDate: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Huy Hiệu Hiển Thị (Badge):</label>
                        <input
                          type="text"
                          placeholder="VD: Giảm 50k / Freeship 100%"
                          value={voucherFormData.badgeText}
                          onChange={(e) => setVoucherFormData({ ...voucherFormData, badgeText: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-bold mb-1">Mô Tả Điều Kiện Áp Dụng:</label>
                        <textarea
                          rows={2}
                          placeholder="VD: Áp dụng cho mọi đơn hàng Thực phẩm chức năng từ 400.000₫ trở lên..."
                          value={voucherFormData.description}
                          onChange={(e) => setVoucherFormData({ ...voucherFormData, description: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                        />
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={voucherFormData.enabled}
                            onChange={(e) => setVoucherFormData({ ...voucherFormData, enabled: e.target.checked })}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          <span className="font-bold text-slate-800">Kích hoạt voucher ngay lập tức</span>
                        </label>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddVoucherModal(false)}
                            className="px-4 py-2 border rounded-xl text-slate-700 font-bold hover:bg-slate-50"
                          >
                            Hủy
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-xs"
                          >
                            {editingVoucher ? 'Lưu Thay Đổi' : 'Tạo Voucher'}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB: QUẢN LÝ ĐÁNH GIÁ KHÁCH HÀNG (UGC & REVIEWS) */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              
              {/* Header Action Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                    <span>Quản Lý Đánh Giá & Phản Hồi Khách Hàng (UGC)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Chủ động thêm đánh giá uy tín cho sản phẩm, quản lý phản hồi chuyên môn Dược sĩ 24/7 và kiểm duyệt hiển thị.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const firstProd = products?.[0];
                    setNewReviewForm({
                      productId: firstProd?.id || '',
                      productName: firstProd?.name || '',
                      customerName: '',
                      customerPhone: '09' + Math.floor(10 + Math.random() * 89) + '***' + Math.floor(100 + Math.random() * 900),
                      audience: 'elderly',
                      audienceLabel: 'Người cao tuổi (63 tuổi)',
                      rating: 5,
                      createdAt: new Date().toISOString().split('T')[0],
                      isVerifiedPurchase: true, // "tự động thêm tick đã mua hàng"
                      title: '',
                      content: '',
                      photos: [],
                      newPhotoUrl: '',
                      pharmacistReply: '',
                      pharmacistName: 'DS. CKI Nguyễn Thu Trang',
                      status: 'approved'
                    });
                    setShowAddReviewModal(true);
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-700/20 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Thêm Đánh Giá Mới</span>
                </button>
              </div>

              {/* Thống kê Reviews */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Tổng Lượt Đánh Giá</div>
                    <div className="text-2xl font-black text-slate-900 mt-1">{reviews.length}</div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      {reviews.filter(r => r.status === 'approved').length} đang hiển thị
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Điểm Trung Bình</div>
                    <div className="text-2xl font-black text-amber-500 mt-1">
                      {reviews.length ? (reviews.reduce((s, r) => s + (r.rating || 5), 0) / reviews.length).toFixed(1) : '5.0'}★
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      {reviews.filter(r => r.rating === 5).length} đánh giá 5 sao
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Ảnh Chụp Thực Tế</div>
                    <div className="text-2xl font-black text-blue-700 mt-1">
                      {reviews.filter(r => r.photos && r.photos.length > 0).length}
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold mt-0.5">
                      Ảnh mở hộp & tem cào Bộ CA
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Camera className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                  <div>
                    <div className="text-[11px] font-bold text-slate-500 uppercase">Dược Sĩ Đã Phản Hồi</div>
                    <div className="text-2xl font-black text-emerald-700 mt-1">
                      {reviews.filter(r => r.pharmacistReply).length}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                      Tư vấn y khoa chính thống
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5" />
                  </div>
                </div>
              </div>

              {/* Bộ lọc và tìm kiếm Reviews nâng cao */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  {/* Tìm kiếm */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tìm theo tên khách, sđt, tên sản phẩm, hoặc nội dung..."
                      value={searchReview}
                      onChange={(e) => setSearchReview(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  {/* Lọc theo sản phẩm */}
                  <div className="w-full sm:w-64">
                    <select
                      value={filterReviewProduct}
                      onChange={(e) => setFilterReviewProduct(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">Tất cả sản phẩm ({reviews.length})</option>
                      {products.map(p => {
                        const count = reviews.filter(r => r.productId === p.id).length;
                        return (
                          <option key={p.id} value={p.id}>
                            {p.name.length > 32 ? p.name.substring(0, 32) + '...' : p.name} ({count})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Hàng bộ lọc: Sao, Trạng thái, Phản hồi */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Lọc sao:</span>
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: '5', label: '5 ★' },
                      { id: '4', label: '4 ★' },
                      { id: '3', label: '3 ★' },
                      { id: 'low', label: '≤ 2 ★' }
                    ].map(r => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setFilterReviewRating(r.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          filterReviewRating === r.id
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 mr-1">Hiển thị:</span>
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'approved', label: '✓ Hiển thị' },
                      { id: 'hidden', label: '○ Đang ẩn' }
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setFilterReviewStatus(st.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          filterReviewStatus === st.id
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}

                    <span className="text-[11px] font-bold text-slate-400 mx-1">|</span>

                    {[
                      { id: 'all', label: 'Tất cả DS' },
                      { id: 'replied', label: 'Đã phản hồi' },
                      { id: 'unreplied', label: 'Chưa phản hồi' }
                    ].map(rp => (
                      <button
                        key={rp.id}
                        type="button"
                        onClick={() => setFilterReviewReply(rp.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                          filterReviewReply === rp.id
                            ? 'bg-teal-700 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {rp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Danh Sách Reviews & Phản Hồi Dược Sĩ */}
              <div className="space-y-3">
                {reviews
                  .filter(rev => {
                    const q = searchReview.toLowerCase().trim();
                    const matchSearch = !q || 
                      (rev.customerName || '').toLowerCase().includes(q) || 
                      (rev.customerPhone || '').toLowerCase().includes(q) ||
                      (rev.productName || '').toLowerCase().includes(q) ||
                      (rev.title || '').toLowerCase().includes(q) ||
                      (rev.content || '').toLowerCase().includes(q);

                    const matchProduct = filterReviewProduct === 'all' || rev.productId === filterReviewProduct;

                    let matchRating = true;
                    if (filterReviewRating === '5') matchRating = rev.rating === 5;
                    else if (filterReviewRating === '4') matchRating = rev.rating === 4;
                    else if (filterReviewRating === '3') matchRating = rev.rating === 3;
                    else if (filterReviewRating === 'low') matchRating = rev.rating <= 2;

                    let matchStatus = true;
                    if (filterReviewStatus === 'approved') matchStatus = rev.status === 'approved';
                    else if (filterReviewStatus === 'hidden') matchStatus = rev.status === 'hidden';

                    let matchReply = true;
                    if (filterReviewReply === 'replied') matchReply = Boolean(rev.pharmacistReply);
                    else if (filterReviewReply === 'unreplied') matchReply = !rev.pharmacistReply;

                    return matchSearch && matchProduct && matchRating && matchStatus && matchReply;
                  })
                  .map(rev => {
                    const matchedProd = products.find(p => p.id === rev.productId);
                    return (
                      <div 
                        key={rev.id}
                        className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 transition-all hover:border-slate-300"
                      >
                        {/* Header của Đánh Giá */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                              {rev.customerName}
                            </span>
                            {rev.customerPhone && (
                              <span className="text-[11px] text-slate-400 font-mono">
                                ({rev.customerPhone})
                              </span>
                            )}
                            {rev.isVerifiedPurchase && (
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Đã mua hàng</span>
                              </span>
                            )}
                            {rev.audienceLabel && (
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                                {rev.audienceLabel}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[...Array(rev.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <span className="text-[11px] text-slate-400">{rev.createdAt}</span>
                          </div>
                        </div>

                        {/* Sản phẩm được đánh giá */}
                        <div className="flex items-center gap-3 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/70">
                          {matchedProd?.image ? (
                            <img 
                              src={matchedProd.image} 
                              alt={rev.productName} 
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0 bg-white" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] text-slate-400 font-bold uppercase">Sản phẩm đánh giá:</div>
                            <div className="text-xs font-extrabold text-slate-900 truncate">
                              {rev.productName || matchedProd?.name || 'Sản phẩm MedXpressCare'}
                            </div>
                          </div>
                        </div>

                        {/* Tiêu đề & Nội dung đánh giá */}
                        <div>
                          {rev.title && (
                            <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 mb-1">
                              {rev.title}
                            </h5>
                          )}
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {rev.content}
                          </p>
                        </div>

                        {/* Ảnh đính kèm của khách hàng */}
                        {rev.photos && rev.photos.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {rev.photos.map((p, idx) => (
                              <img 
                                key={idx} 
                                src={p} 
                                alt="Ảnh feedback thực tế" 
                                className="w-16 h-16 rounded-xl object-cover border border-slate-200 hover:scale-105 transition-transform cursor-pointer" 
                              />
                            ))}
                          </div>
                        )}

                        {/* Khối phản hồi từ Dược sĩ Chuyên môn */}
                        {rev.pharmacistReply ? (
                          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs space-y-2">
                            <div className="flex items-center justify-between text-emerald-950 font-extrabold">
                              <span className="flex items-center gap-1.5">
                                <Stethoscope className="w-4 h-4 text-emerald-600" />
                                <span>Phản hồi từ Dược sĩ Chuyên môn ({rev.pharmacistName || 'DS. CKI Nguyễn Thu Trang'}):</span>
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400">{rev.replyDate}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingReplyReviewId(rev.id);
                                    setEditReplyText(rev.pharmacistReply || '');
                                    setEditPharmacistName(rev.pharmacistName || 'DS. CKI Nguyễn Thu Trang');
                                  }}
                                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-0.5 ml-2"
                                >
                                  <Edit className="w-3 h-3" />
                                  <span>Sửa</span>
                                </button>
                              </div>
                            </div>

                            {editingReplyReviewId === rev.id ? (
                              <div className="space-y-2 pt-2 border-t border-emerald-200">
                                <div className="flex items-center gap-2">
                                  <label className="text-[11px] font-bold text-emerald-900 shrink-0">Dược sĩ:</label>
                                  <input
                                    type="text"
                                    value={editPharmacistName}
                                    onChange={(e) => setEditPharmacistName(e.target.value)}
                                    className="px-2 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-emerald-900 w-60"
                                  />
                                </div>
                                <textarea
                                  rows={3}
                                  value={editReplyText}
                                  onChange={(e) => setEditReplyText(e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingReplyReviewId(null)}
                                    className="px-3 py-1.5 rounded-lg border text-xs font-bold text-slate-600 hover:bg-slate-100"
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onAddPharmacistReply && editReplyText.trim()) {
                                        onAddPharmacistReply(rev.id, editReplyText.trim(), editPharmacistName.trim() || 'DS. CKI Nguyễn Thu Trang');
                                        setEditingReplyReviewId(null);
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold"
                                  >
                                    Lưu Cập Nhật
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[11px] text-slate-800 italic pl-5 leading-relaxed">
                                "{rev.pharmacistReply}"
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            {replyingReviewId === rev.id ? (
                              <div className="space-y-2.5 p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200">
                                <div className="flex items-center justify-between">
                                  <label className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                                    <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>Tư vấn y khoa chính thống từ Dược sĩ MedXpressCare:</span>
                                  </label>
                                  <span className="text-[10px] text-emerald-700 font-bold bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                                    Dược sĩ: DS. CKI Nguyễn Thu Trang
                                  </span>
                                </div>

                                {/* Gợi ý mẫu phản hồi nhanh */}
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="text-[10px] text-slate-500 font-bold">Mẫu nhanh:</span>
                                  {[
                                    {
                                      label: 'Cảm ơn & Dặn liệu trình',
                                      text: 'Kính chào quý khách! Dược sĩ MedXpressCare rất vui khi nhận được phản hồi tích cực. Quý khách nhớ duy trì dùng đủ liệu trình 2 - 3 tháng và uống đều đặn để đạt hiệu quả tối ưu nhất nhé!'
                                    },
                                    {
                                      label: 'Hướng dẫn uống sau ăn',
                                      text: 'Chào bạn! Để tối ưu khả năng hấp thu và bảo vệ niêm mạc dạ dày, bạn nên uống sản phẩm sau bữa ăn 30 phút cùng 1 ly nước ấm lớn, kết hợp ngủ đủ giấc nhé!'
                                    },
                                    {
                                      label: 'Cam kết tem Bộ Y Tế',
                                      text: 'MedXpressCare cam kết 100% sản phẩm có tem chống hàng giả Bộ Công An và tem phụ tiếng Việt đúng chuẩn Bộ Y Tế. Chúc quý khách và gia đình luôn dồi dào sức khỏe!'
                                    }
                                  ].map((tmpl, tIdx) => (
                                    <button
                                      key={tIdx}
                                      type="button"
                                      onClick={() => setReplyInputText(tmpl.text)}
                                      className="text-[10px] px-2 py-0.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md font-semibold transition-colors"
                                    >
                                      + {tmpl.label}
                                    </button>
                                  ))}
                                </div>

                                <textarea
                                  rows={2}
                                  value={replyInputText}
                                  onChange={(e) => setReplyInputText(e.target.value)}
                                  placeholder="Nhập lời khuyên tư vấn y khoa của Dược sĩ MedXpressCare..."
                                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setReplyingReviewId(null)}
                                    className="px-3 py-1.5 rounded-lg border text-xs font-bold text-slate-600 hover:bg-slate-100"
                                  >
                                    Hủy
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (onAddPharmacistReply && replyInputText.trim()) {
                                        onAddPharmacistReply(rev.id, replyInputText.trim(), 'DS. CKI Nguyễn Thu Trang');
                                        setReplyingReviewId(null);
                                        setReplyInputText('');
                                      }
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm"
                                  >
                                    Lưu Phản Hồi
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setReplyingReviewId(rev.id);
                                  setReplyInputText('');
                                }}
                                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 p-1 rounded hover:bg-emerald-50 w-fit"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>+ Phản hồi với tư cách Dược sĩ Chuyên môn</span>
                              </button>
                            )}
                          </div>
                        )}

                        {/* Footer Actions Review */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <button
                            type="button"
                            onClick={() => {
                              if (onUpdateReviewStatus) {
                                onUpdateReviewStatus(rev.id, rev.status === 'approved' ? 'hidden' : 'approved');
                              }
                            }}
                            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                              rev.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                          >
                            {rev.status === 'approved' ? '✓ Đang hiển thị trên web' : '○ Đang ẩn'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa đánh giá của "${rev.customerName}"?`)) {
                                if (onDeleteReview) onDeleteReview(rev.id);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 flex items-center gap-1 text-[11px] font-semibold transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Xóa
                          </button>
                        </div>
                      </div>
                    );
                  })}

                {reviews.length === 0 && (
                  <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                    Chưa có đánh giá nào từ khách hàng.
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB: QUẢN LÝ KHÁCH HÀNG & ĐIỂM THƯỞNG */}
          {activeTab === 'customers' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>Hệ Thống Thành Viên & Điểm Thưởng ({customers.length} khách hàng)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cơ chế: Tích 1 điểm mỗi 100.000₫ mua hàng • Đổi 1 điểm = 1.000₫ giảm trừ tiền đơn tiếp theo
                  </p>
                </div>
              </div>

              {/* Cards thống kê điểm thưởng */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Tổng Thành Viên</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {customers.length} khách hàng
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Đã đăng ký tài khoản</div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs">
                  <div className="text-xs text-amber-800 font-semibold uppercase">Tổng Điểm Đang Lưu Hành</div>
                  <div className="text-2xl font-black text-amber-600 mt-1">
                    {customers.reduce((acc, c) => acc + (c.points || 0), 0)} điểm
                  </div>
                  <div className="text-[11px] text-amber-700/80 mt-0.5">
                    = {(customers.reduce((acc, c) => acc + (c.points || 0), 0) * 1000).toLocaleString('vi-VN')}₫ giá trị quy đổi
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-emerald-200 shadow-xs">
                  <div className="text-xs text-emerald-800 font-semibold uppercase">Tỷ Lệ Tích & Đổi Điểm</div>
                  <div className="text-base font-black text-emerald-700 mt-1">
                    100.000₫ = 1đ | 1đ = 1.000₫
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">Chuẩn mực thưởng 1% cho khách</div>
                </div>
              </div>

              {/* Bảng danh sách khách hàng & điểm thưởng */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Khách Hàng</th>
                        <th className="p-3.5">Số Điện Thoại</th>
                        <th className="p-3.5">Hạng Thành Viên</th>
                        <th className="p-3.5">Điểm Thưởng</th>
                        <th className="p-3.5">Giá Trị Quy Đổi</th>
                        <th className="p-3.5 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customers.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-bold text-slate-900">
                            <div>{c.fullName}</div>
                            {c.email && <div className="text-[10px] text-slate-400 font-normal">{c.email}</div>}
                          </td>
                          <td className="p-3.5 font-mono text-emerald-700 font-bold">
                            {c.phone}
                          </td>
                          <td className="p-3.5">
                            <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md font-bold text-[10px]">
                              {c.tier || 'Thành viên'}
                            </span>
                          </td>
                          <td className="p-3.5 font-black text-amber-600 text-sm">
                            {c.points || 0} điểm
                          </td>
                          <td className="p-3.5 font-bold text-slate-700">
                            {((c.points || 0) * 1000).toLocaleString('vi-VN')}₫
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                const pts = prompt(`Tặng thêm điểm tri ân cho khách hàng ${c.fullName}:`, '10');
                                if (pts && !isNaN(pts) && Number(pts) > 0) {
                                  if (onBonusPoints) {
                                    onBonusPoints(c.id, Number(pts));
                                  }
                                }
                              }}
                              className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1"
                            >
                              <Sparkles className="w-3 h-3 text-amber-600" />
                              <span>+ Tặng Điểm</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LỊCH CHĂM SÓC & TÁI ĐẶT HÀNG (RE-ORDER AUTOMATION) */}
          {activeTab === 'reorder' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-rose-500" />
                    <span>Lịch Chăm Sóc & Nhắc Tái Đặt Hàng ({reorderAlerts.length} phác đồ)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hệ thống tự động tính toán chu kỳ uống thuốc để Dược sĩ chủ động nhắn tin/gọi điện chăm sóc khi khách sắp hết sản phẩm.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Tìm theo tên khách, SĐT, mã đơn..."
                      value={reorderSearch}
                      onChange={(e) => setReorderSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                  </div>
                </div>
              </div>

              {/* Cards thống kê */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Đang Theo Dõi Liệu Trình</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {reorderAlerts.length} khách hàng
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Dựa trên đơn hàng thực tế</div>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 shadow-xs">
                  <div className="text-xs text-rose-800 font-semibold uppercase">Cần Chăm Sóc Gấp (≤ 7 ngày)</div>
                  <div className="text-2xl font-black text-rose-600 mt-1">
                    {dueSoonCount} khách hàng
                  </div>
                  <div className="text-[11px] text-rose-700/80 mt-0.5">Cần Dược sĩ gọi hoặc nhắn Zalo ngay</div>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
                  <div className="text-xs text-emerald-800 font-semibold uppercase">Tỷ Lệ Mua Lại Kỳ Vọng</div>
                  <div className="text-2xl font-black text-emerald-700 mt-1">
                    35% - 50%
                  </div>
                  <div className="text-[11px] text-emerald-600 mt-0.5">Tăng trưởng doanh thu định kỳ</div>
                </div>
              </div>

              {/* Bảng danh sách nhắc liệu trình */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="p-3.5">Khách Hàng & SĐT</th>
                        <th className="p-3.5">Sản Phẩm Đang Uống</th>
                        <th className="p-3.5">Ngày Mua & Quy Cách</th>
                        <th className="p-3.5">Tiến Trình Liệu Trình</th>
                        <th className="p-3.5">Tình Trạng</th>
                        <th className="p-3.5 text-right">Thao Tác Chăm Sóc</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {reorderAlerts
                        .filter(a => {
                          if (!reorderSearch.trim()) return true;
                          const q = reorderSearch.toLowerCase().trim();
                          return a.customerName.toLowerCase().includes(q) || a.phone.includes(q) || a.orderId.toLowerCase().includes(q);
                        })
                        .map((alert, idx) => {
                          const percent = Math.min(100, Math.round((alert.elapsedDays / alert.treatmentDays) * 100));
                          const zaloMsg = encodeURIComponent(`Chào anh/chị ${alert.customerName}, Dược sĩ MedXpressCare xin phép thăm hỏi tình hình sức khỏe của anh/chị sau khi dùng ${alert.itemsSummary}. Theo phác đồ, hộp của anh/chị còn khoảng ${Math.max(0, alert.remainingDays)} ngày nữa là hết. Anh/chị có thấy cải thiện rõ rệt chưa ạ? Em gửi tặng anh/chị mã giảm 10% [TRIAN10] để tiếp tục liệu trình tháng thứ 2 nhé ạ!`);

                          return (
                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3.5">
                                <div className="font-bold text-slate-900">{alert.customerName}</div>
                                <div className="font-mono text-emerald-700 text-[11px]">{alert.phone}</div>
                                <div className="text-[10px] text-slate-400">Mã đơn: {alert.orderId}</div>
                              </td>

                              <td className="p-3.5 font-medium text-slate-800 max-w-xs truncate">
                                {alert.itemsSummary}
                              </td>

                              <td className="p-3.5 text-slate-600">
                                <div>{alert.orderDate.toLocaleDateString('vi-VN')}</div>
                                <div className="text-[11px] text-slate-400">Tổng: {alert.totalBoxes} hộp ({alert.treatmentDays} ngày)</div>
                              </td>

                              <td className="p-3.5">
                                <div className="flex items-center justify-between text-[11px] mb-1">
                                  <span>Đã uống {alert.elapsedDays} ngày</span>
                                  <strong className="font-mono">{percent}%</strong>
                                </div>
                                <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div 
                                    className={`h-full rounded-full ${
                                      alert.urgency === 'overdue' 
                                        ? 'bg-rose-500' 
                                        : alert.urgency === 'due_soon' 
                                          ? 'bg-amber-500' 
                                          : 'bg-emerald-500'
                                    }`}
                                    style={{ width: `${percent}%` }}
                                  />
                                </div>
                              </td>

                              <td className="p-3.5">
                                {alert.urgency === 'overdue' ? (
                                  <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full font-bold text-[10px] inline-flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3 text-rose-600" />
                                    Đã hết thuốc ({Math.abs(alert.remainingDays)} ngày trước)
                                  </span>
                                ) : alert.urgency === 'due_soon' ? (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full font-bold text-[10px] inline-flex items-center gap-1 animate-pulse">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    Sắp hết (Còn {alert.remainingDays} ngày)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-semibold text-[10px]">
                                    Còn {alert.remainingDays} ngày uống
                                  </span>
                                )}
                              </td>

                              <td className="p-3.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <a
                                    href={`https://zalo.me/${alert.phone?.replace(/\s+/g, '')}?text=${zaloMsg}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1 border border-blue-200"
                                    title="Mở Zalo có sẵn tin nhắn nhắc liệu trình chu đáo"
                                  >
                                    <Send className="w-3 h-3" />
                                    <span>Nhắn Zalo</span>
                                  </a>

                                  <a
                                    href={`tel:${alert.phone}`}
                                    className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors inline-flex items-center gap-1"
                                    title="Gọi điện thoại trực tiếp"
                                  >
                                    <Phone className="w-3 h-3" />
                                  </a>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: THỐNG KÊ DOANH THU */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Tổng Doanh Thu Đơn Hàng</div>
                  <div className="text-2xl font-black text-emerald-600 mt-2">
                    {totalRevenue.toLocaleString('vi-VN')}₫
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Từ {orders.length} đơn hàng thực tế</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Đơn Chờ Xử Lý</div>
                  <div className="text-2xl font-black text-amber-500 mt-2">
                    {pendingOrdersCount} đơn
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Cần Dược sĩ gọi xác nhận ngay</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Hàng Nội Địa Chuẩn GMP</div>
                  <div className="text-2xl font-black text-rose-600 mt-2">
                    {domesticProductsCount} mã hàng
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Sâm Ngọc Linh, Traphaco, OIC...</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-semibold uppercase">Hàng Nhập Khẩu Chính Ngạch</div>
                  <div className="text-2xl font-black text-blue-600 mt-2">
                    {importedProductsCount} mã hàng
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">Mỹ, Úc, Nhật, Hàn, Đức</div>
                </div>
              </div>

              {/* Hướng Dẫn Vận Hành Đơn Hàng Cho Chủ Shop */}
              <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
                <h4 className="font-extrabold text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Quy Trình Xử Lý Đơn Hàng Chuẩn Dược Khoa MedXpress:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
                  <div className="p-3 rounded-xl bg-white border border-emerald-200">
                    <strong className="text-emerald-800">1. Gọi Điện Thoại (15 phút)</strong>
                    <p className="mt-1">Dược sĩ bấm nút "Gọi" hoặc mở Zalo nhắn cho khách để kiểm tra liều dùng, tiền sử dị ứng và xác nhận địa chỉ.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-emerald-200">
                    <strong className="text-emerald-800">2. Đóng Gói Cẩn Thận</strong>
                    <p className="mt-1">Dán tem niêm phong, kẹp hóa đơn VAT và đóng gói bảo vệ sản phẩm nguyên vẹn.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-emerald-200">
                    <strong className="text-emerald-800">3. Giao MedXpress 2H / Bưu Cục</strong>
                    <p className="mt-1">Đổi trạng thái đơn thành "Đang Giao" để hệ thống cập nhật tiến trình và đối soát tiền COD hoặc VietQR.</p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB: QUẢN LÝ & KẾT NỐI ĐƠN VỊ VẬN CHUYỂN */}
          {activeTab === 'shipping' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    <span>Trung Tâm Quản Lý & Kết Nối Đơn Vị Vận Chuyển</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Chỉ các đơn vị được <strong>BẬT</strong> và cấu hình tại đây mới hiển thị cho khách hàng lựa chọn khi thanh toán.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      onUpdateStoreConfig(tempConfig);
                      alert('Đã lưu cấu hình kết nối đơn vị vận chuyển thành công!');
                    }}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lưu Cấu Hình Vận Chuyển</span>
                  </button>
                </div>
              </div>

              {/* Chính sách Freeship chung */}
              <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Mức Đơn Hàng Miễn Phí Vận Chuyển (Freeship)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={tempConfig.freeShipThreshold || 500000}
                      onChange={(e) => setTempConfig({ ...tempConfig, freeShipThreshold: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-emerald-700"
                    />
                    <span className="absolute right-3 top-2 text-slate-400 font-bold">VNĐ</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">Đơn hàng đạt giá trị này sẽ tự động giảm phí ship về 0₫</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Kho Lấy Hàng Mặc Định
                  </label>
                  <input
                    type="text"
                    value={tempConfig.warehouseAddress || 'Tổng Kho Dược Phẩm MedXpress, Hà Nội'}
                    onChange={(e) => setTempConfig({ ...tempConfig, warehouseAddress: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-semibold text-slate-800"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Địa chỉ bưu tá đến gom kiện hàng hằng ngày</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Số Đối Tác Đang Hoạt Động
                  </label>
                  <div className="text-xl font-black text-blue-600 mt-1">
                    {(tempConfig.shippingCarriers || []).filter(c => c.enabled).length} / {(tempConfig.shippingCarriers || []).length} hãng
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">Hiển thị trực tiếp trên giỏ hàng & thanh toán</p>
                </div>
              </div>

              {/* Danh sách các hãng vận chuyển */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(tempConfig.shippingCarriers || DEFAULT_SHIPPING_CARRIERS).map((carrier) => {
                  const testRes = carrierTestResults[carrier.id];
                  const isTesting = testingCarrierId === carrier.id;

                  return (
                    <div 
                      key={carrier.id}
                      className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between space-y-4 ${
                        carrier.enabled 
                          ? 'border-emerald-300 bg-white shadow-sm ring-1 ring-emerald-500/10' 
                          : 'border-slate-200 bg-slate-50/70 opacity-80'
                      }`}
                    >
                      {/* Top: Logo & Toggle Switch */}
                      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-xs ${
                            carrier.enabled ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-200'
                          }`}>
                            <span>{carrier.icon || '📦'}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-extrabold text-sm text-slate-900">
                                {carrier.name}
                              </h4>
                              {carrier.badge && (
                                <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded border">
                                  {carrier.badge}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {carrier.isConnected ? (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Đã Kết Nối API
                                </span>
                              ) : (
                                <span className="text-[10px] bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-slate-500" />
                                  Chưa Kết Nối
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400">
                                Mã: <code className="font-mono">{carrier.id}</code>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Toggle Bật / Tắt */}
                        <div className="flex flex-col items-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleCarrier(carrier.id)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                              carrier.enabled ? 'bg-emerald-600' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                carrier.enabled ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                          <span className={`text-[10px] font-bold ${carrier.enabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                            {carrier.enabled ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
                          </span>
                        </div>
                      </div>

                      {/* Thông tin cấu hình chi phí & thời gian */}
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">
                            Cước Phí Cơ Bản (VNĐ)
                          </label>
                          <input
                            type="number"
                            value={carrier.baseFee}
                            onChange={(e) => handleUpdateCarrierField(carrier.id, 'baseFee', Number(e.target.value))}
                            className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl font-bold text-emerald-700"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-600 font-semibold mb-1">
                            Thời Gian Giao Dự Kiến
                          </label>
                          <input
                            type="text"
                            value={carrier.estimatedDays}
                            onChange={(e) => handleUpdateCarrierField(carrier.id, 'estimatedDays', e.target.value)}
                            placeholder="VD: 1 - 2 ngày"
                            className="w-full px-3 py-1.5 bg-slate-50 border rounded-xl font-semibold"
                          />
                        </div>
                      </div>

                      {/* API Credentials */}
                      <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <div className="font-bold text-slate-700 text-[11px] flex items-center justify-between">
                          <span>Thông Số Kết Nối API Đối Tác:</span>
                          <span className="text-[10px] text-slate-400 font-normal">{carrier.note}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <input
                              type="password"
                              placeholder="API Key / Token đối tác..."
                              value={carrier.apiKey || ''}
                              onChange={(e) => handleUpdateCarrierField(carrier.id, 'apiKey', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border rounded-lg font-mono text-[11px]"
                            />
                          </div>
                          <div>
                            <input
                              type="text"
                              placeholder="Shop ID / Client ID..."
                              value={carrier.shopId || ''}
                              onChange={(e) => handleUpdateCarrierField(carrier.id, 'shopId', e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border rounded-lg font-mono text-[11px]"
                            />
                          </div>
                        </div>

                        {/* Test connection button */}
                        <div className="flex items-center justify-between pt-1">
                          <button
                            type="button"
                            disabled={isTesting}
                            onClick={() => handleTestCarrier(carrier)}
                            className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold rounded-lg border border-slate-300 text-[10px] transition-colors flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin text-blue-600' : ''}`} />
                            <span>{isTesting ? 'Đang kiểm tra...' : 'Kiểm Tra Kết Nối API'}</span>
                          </button>

                          <span className="text-[10px] text-slate-400">
                            {carrier.enabled ? '✓ Sẵn sàng xuất hiện ở Checkout' : '✗ Đang ẩn ở Checkout'}
                          </span>
                        </div>

                        {testRes && (
                          <div className={`p-2 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 mt-1 ${
                            testRes.success ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                          }`}>
                            {testRes.success ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />}
                            <span>{testRes.message}</span>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Footer lưu cấu hình */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onUpdateStoreConfig(tempConfig);
                    alert('Đã lưu cấu hình kết nối đơn vị vận chuyển thành công! Frontend sẽ lập tức cập nhật.');
                  }}
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Lưu & Đồng Bộ Toàn Bộ Đối Tác Vận Chuyển</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: CẤU HÌNH THÔNG TIN VIETQR & HOTLINE */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveConfig} className="max-w-2xl bg-white p-6 rounded-3xl border border-slate-200 space-y-5">
              <h3 className="font-extrabold text-slate-900 text-base border-b pb-3 flex items-center gap-2">
                <Settings className="w-5 h-5 text-emerald-600" />
                Cài Đặt Tài Khoản Nhận Tiền VietQR & Hotline
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Số Hotline Hiển Thị Trên Website
                  </label>
                  <input
                    type="text"
                    value={tempConfig.hotline}
                    onChange={(e) => setTempConfig({ ...tempConfig, hotline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-bold text-slate-800"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">VD: 1800 6868 hoặc số di động cá nhân của bạn</p>
                </div>

                {/* CẤU HÌNH BẮN THÔNG BÁO TELEGRAM BOT TỨC THÌ CHO ADMIN */}
                <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-sky-950 flex items-center gap-1.5">
                      <Bell className="w-4 h-4 text-sky-600" />
                      <span>Thông Báo Đơn Hàng Mới Tức Thì Qua Telegram Bot</span>
                    </div>
                    <span className="text-[10px] bg-sky-200 text-sky-900 font-bold px-2 py-0.5 rounded-full">
                      Tự Động 24/7
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    Khi khách đặt hàng thành công trên website, Telegram Bot sẽ tự động gửi thông báo chi tiết (Tên khách, SĐT, danh sách thuốc, tổng tiền) đến điện thoại của bạn ngay lập tức!
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Telegram Bot Token (từ @BotFather)
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 7123456789:AAHk..."
                        value={tempConfig.telegramBotToken || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, telegramBotToken: e.target.value })}
                        className="w-full px-3 py-2 bg-white border rounded-xl font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Telegram Chat ID / Group ID nhận tin
                      </label>
                      <input
                        type="text"
                        placeholder="VD: 123456789 hoặc -100123456789"
                        value={tempConfig.telegramChatId || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, telegramChatId: e.target.value })}
                        className="w-full px-3 py-2 bg-white border rounded-xl font-mono text-[11px]"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-sky-200/80">
                    <div className="text-[10px] text-slate-500">
                      💡 Mẹo: Nhắn tin cho <strong>@userinfobot</strong> trên Telegram để lấy Chat ID của bạn.
                    </div>

                    <button
                      type="button"
                      disabled={testingTelegram}
                      onClick={handleTestTelegram}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-50"
                    >
                      <Send className={`w-3 h-3 ${testingTelegram ? 'animate-spin' : ''}`} />
                      <span>{testingTelegram ? 'Đang gửi thử...' : 'Gửi Tin Thử Nghiệm'}</span>
                    </button>
                  </div>

                  {telegramTestResult && (
                    <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      telegramTestResult.success ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}>
                      {telegramTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                      <span>{telegramTestResult.message}</span>
                    </div>
                  )}
                </div>

                {/* CẤU HÌNH WEBHOOK THANH TOÁN TỰ ĐỘNG */}
                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span>Cổng Webhook Xác Thực Thanh Toán Chuyển Khoản Tự Động</span>
                    </div>
                    <span className="text-[10px] bg-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded-full">
                      SePay / PayOS / Casso
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    Địa chỉ Webhook nhận tín hiệu ngân hàng báo có (sao kê tức thì). Khi có khách chuyển khoản, trạng thái đơn sẽ tự động chuyển thành "Đã Thanh Toán" chỉ sau 2 giây.
                  </p>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Webhook Receiver URL (Gắn vào trang quản trị SePay / PayOS của bạn)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== 'undefined' ? `${window.location.origin}/api/webhook-payment.php` : '/api/webhook-payment.php'}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-xl font-mono text-[11px] text-slate-700 select-all"
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    Cấu Hình Mã Chuyển Khoản Ngân Hàng Tự Động (VietQR)
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Tên ngân hàng</label>
                      <input
                        type="text"
                        value={tempConfig.bankName}
                        onChange={(e) => setTempConfig({ ...tempConfig, bankName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 font-medium mb-1">Số tài khoản nhận tiền</label>
                      <input
                        type="text"
                        value={tempConfig.bankAccountNumber}
                        onChange={(e) => setTempConfig({ ...tempConfig, bankAccountNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-white border rounded-xl font-mono font-bold text-emerald-700"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-600 font-medium mb-1">Tên chủ tài khoản (In hoa không dấu)</label>
                    <input
                      type="text"
                      value={tempConfig.bankAccountName}
                      onChange={(e) => setTempConfig({ ...tempConfig, bankAccountName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border rounded-xl font-bold text-slate-900"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Khi khách đặt hàng chọn thanh toán chuyển khoản, hệ thống sẽ tự động vẽ mã QR của số tài khoản này kèm số tiền và mã đơn hàng chính xác!
                  </p>
                </div>

                {/* CẤU HÌNH TRÍ TUỆ NHÂN TẠO AI CHO WEBSITE */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-purple-50/60 to-white border border-indigo-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-indigo-950 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Cấu Hình API AI Viết Bài & Tối Ưu SEO Tự Động</span>
                    </div>
                    <span className="text-[10px] bg-purple-200 text-purple-900 font-bold px-2 py-0.5 rounded-full">
                      Gemini / OpenAI
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Sử dụng để tự động đọc link bài viết từ trang web khác (Vinmec, Báo Sức Khỏe, Dược Thư...), viết lại thành bài mới độc bản, tối ưu toàn bộ thẻ Meta Title, Meta Description, từ khóa và thang điểm SEO On-Page 100/100.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Nhà cung cấp AI</label>
                      <select
                        value={tempConfig.aiProvider || 'gemini'}
                        onChange={(e) => setTempConfig({ ...tempConfig, aiProvider: e.target.value })}
                        className="w-full px-3 py-2 bg-white border rounded-xl font-bold text-slate-800 text-xs"
                      >
                        <option value="gemini">Google Gemini (Miễn phí - Khuyên dùng)</option>
                        <option value="openai">OpenAI (ChatGPT)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">Mô hình (Model)</label>
                      <select
                        value={tempConfig.aiModel || 'gemini-2.5-flash'}
                        onChange={(e) => setTempConfig({ ...tempConfig, aiModel: e.target.value })}
                        className="w-full px-3 py-2 bg-white border rounded-xl font-bold text-slate-800 text-xs"
                      >
                        {tempConfig.aiProvider === 'openai' ? (
                          <>
                            <option value="gpt-4o-mini">GPT-4o Mini (Nhanh & Tối ưu chi phí)</option>
                            <option value="gpt-4o">GPT-4o (Chất lượng cao nhất)</option>
                          </>
                        ) : (
                          <>
                            <option value="gemini-2.5-flash">Gemini 2.5 Flash (Khuyên dùng - Chuẩn tài khoản của bạn)</option>
                            <option value="gemini-2.5-pro">Gemini 2.5 Pro (Phân tích chuyên sâu & Y khoa)</option>
                            <option value="gemini-2.0-flash">Gemini 2.0 Flash (Thế hệ mới 2026)</option>
                            <option value="gemini-1.5-flash">Gemini 1.5 Flash (Thế hệ trước)</option>
                            <option value="gemma-4-26b-a4b-it">Gemma 4 26B (Google Gemma IT)</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">API Key AI</label>
                      <input
                        type="password"
                        placeholder="Dán mã API Key tại đây..."
                        value={tempConfig.aiApiKey || ''}
                        onChange={(e) => setTempConfig({ ...tempConfig, aiApiKey: e.target.value })}
                        className="w-full px-3 py-2 bg-white border rounded-xl font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="text-[11px] text-slate-500">
                      💡 Chưa có API Key? <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-bold">Bấm vào đây để lấy Google Gemini API Key hoàn toàn miễn phí</a>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestAi}
                      disabled={testingAiKey}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      {testingAiKey ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Đang kiểm tra...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Kiểm Tra Kết Nối AI</span>
                        </>
                      )}
                    </button>
                  </div>

                  {aiTestResult && (
                    <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                      aiTestResult.success ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {aiTestResult.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
                      <span>{aiTestResult.message}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all"
                >
                  Lưu Cấu Hình Ngay
                </button>
              </div>
            </form>
          )}

          </main>
        </div>

        {/* Footer */}
        <div className="bg-slate-900 border-t border-slate-800 px-6 py-2.5 text-xs text-slate-400 flex items-center justify-between shrink-0">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Hệ Thống Quản Trị TPCN MedXpressCare © 2026</span>
          </span>
          <span className="font-mono text-[11px] text-slate-400">Dữ liệu mã hóa an toàn • v2.5</span>
        </div>

        {/* EDIT PRODUCT MODAL */}
        {editingProduct && (
          <div 
            className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
            onClick={() => setEditingProduct(null)}
          >
            <div 
              className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Edit className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                      Chỉnh Sửa Thông Tin Sản Phẩm
                    </span>
                    <h3 className="text-base font-black text-white truncate max-w-md mt-0.5">
                      {editingProduct.name}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleUpdateProductSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
                {/* Tên & Thương hiệu */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-700 font-bold mb-1">Tên sản phẩm *</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Thương hiệu</label>
                    <input
                      type="text"
                      value={editingProduct.brand}
                      onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                    />
                  </div>
                </div>

                {/* Xuất xứ & Giá bán */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phân loại xuất xứ</label>
                    <select
                      value={editingProduct.originType}
                      onChange={(e) => {
                        const isDom = e.target.value === 'domestic';
                        setEditingProduct({
                          ...editingProduct,
                          originType: e.target.value,
                          countryCode: isDom ? 'VN' : (editingProduct.countryCode === 'VN' ? 'US' : editingProduct.countryCode),
                          countryName: isDom ? 'Việt Nam' : (editingProduct.countryName === 'Việt Nam' ? 'Mỹ (USA)' : editingProduct.countryName),
                          flag: isDom ? '🇻🇳' : '🌍'
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                    >
                      <option value="domestic">🇻🇳 Hàng Nội Địa Uy Tín</option>
                      <option value="imported">🌍 Hàng Nhập Ngoại</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Quốc gia xuất xứ</label>
                    <input
                      type="text"
                      value={editingProduct.countryName}
                      onChange={(e) => setEditingProduct({ ...editingProduct, countryName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Giá bán (VNĐ) *</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Giá gốc (niêm yết)</label>
                    <input
                      type="number"
                      value={editingProduct.originalPrice}
                      onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                    />
                  </div>
                </div>

                {/* Pháp lý, Quy cách, Trạng thái kho */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Số ĐKSP Bộ Y Tế</label>
                    <input
                      type="text"
                      value={editingProduct.regNumber}
                      onChange={(e) => setEditingProduct({ ...editingProduct, regNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Quy cách đóng gói</label>
                    <input
                      type="text"
                      value={editingProduct.packaging}
                      onChange={(e) => setEditingProduct({ ...editingProduct, packaging: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Trạng thái kho hàng</label>
                    <select
                      value={editingProduct.inStock ? 'true' : 'false'}
                      onChange={(e) => setEditingProduct({ ...editingProduct, inStock: e.target.value === 'true' })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                    >
                      <option value="true">✅ Còn hàng sẵn bán</option>
                      <option value="false">❌ Tạm hết hàng</option>
                    </select>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                      <input
                        type="checkbox"
                        checked={!!editingProduct.isFlashSale}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isFlashSale: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded"
                      />
                      <span>🔥 Bật Flash Sale giá sốc</span>
                    </label>
                  </div>
                </div>

                {/* HÌNH ẢNH SẢN PHẨM: TẢI TRỰC TIẾP HOẶC DÁN LINK */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-slate-800 font-bold text-xs flex items-center gap-1.5">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span>Hình Ảnh Sản Phẩm (Tải ảnh từ máy tính hoặc đổi link) *</span>
                    </label>

                    <div className="inline-flex rounded-xl bg-slate-200/90 p-1 text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => setEditImageInputMode('upload')}
                        className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                          editImageInputMode === 'upload'
                            ? 'bg-white text-emerald-800 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Tải ảnh từ máy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditImageInputMode('url')}
                        className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                          editImageInputMode === 'url'
                            ? 'bg-white text-emerald-800 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        <Link2 className="w-3.5 h-3.5" />
                        <span>Dán link URL</span>
                      </button>
                    </div>
                  </div>

                  {editImageInputMode === 'upload' ? (
                    <div className="space-y-2">
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleEditImageFile(e.target.files[0]);
                          }
                        }}
                        className="hidden"
                      />

                      {editingProduct.image ? (
                        <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 bg-white rounded-xl border border-emerald-300 shadow-xs">
                          <img
                            src={editingProduct.image}
                            alt="Ảnh sản phẩm"
                            className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-xs shrink-0"
                          />
                          <div className="flex-1 min-w-0 text-left space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Ảnh hiện tại đang được sử dụng</span>
                            </div>
                            <p className="text-[11px] text-slate-500 truncate font-mono">
                              {editUploadedFileName || 'Ảnh đã sẵn sàng'}
                            </p>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                type="button"
                                onClick={() => editFileInputRef.current?.click()}
                                disabled={editUploadingImage}
                                className="text-[11px] font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5"
                              >
                                <RefreshCw className={`w-3 h-3 ${editUploadingImage ? 'animate-spin' : ''}`} />
                                <span>Chọn ảnh khác từ máy</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          onDragOver={(e) => { e.preventDefault(); setEditDragOver(true); }}
                          onDragLeave={() => setEditDragOver(false)}
                          onDrop={handleEditDrop}
                          onClick={() => editFileInputRef.current?.click()}
                          className="border-2 border-dashed rounded-xl p-5 text-center cursor-pointer border-slate-300 hover:border-emerald-400 bg-white"
                        >
                          <UploadCloud className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
                          <div className="font-bold text-slate-800">Bấm để chọn file ảnh mới từ máy tính hoặc kéo thả ảnh vào đây</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="url"
                      value={editingProduct.image}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      placeholder="https://example.com/hinh-anh.jpg"
                      className="w-full px-3 py-2 bg-white border rounded-xl font-mono"
                    />
                  )}
                </div>

                {/* Nhóm Sức Khỏe & Bệnh Lý (Cho phép chọn nhiều nhóm bệnh lý) */}
                <div className="bg-emerald-50/60 p-3.5 rounded-2xl border border-emerald-200 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <label className="block text-slate-900 font-extrabold text-xs flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <span>Nhóm Sức Khỏe / Bệnh Lý Điều Trị * (Cho phép chọn nhiều nhóm):</span>
                    </label>
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      Đã chọn: {(editingProduct.categories || [editingProduct.category || 'bone_joint']).length} nhóm
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Bấm vào từng nhóm để bật/tắt. Sản phẩm sẽ tự động hiển thị trong tất cả các nhóm bệnh được chọn.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 pt-1">
                    {CATEGORIES.filter(c => c.id !== 'all').map(c => {
                      const selectedCats = Array.isArray(editingProduct.categories) && editingProduct.categories.length > 0
                        ? editingProduct.categories
                        : [editingProduct.category || 'bone_joint'];
                      const isChecked = selectedCats.includes(c.id);
                      return (
                        <button
                          type="button"
                          key={c.id}
                          onClick={() => toggleEditingProductCategory(c.id)}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs font-bold ring-2 ring-emerald-500/20'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40'
                          }`}
                        >
                          <span className="truncate pr-1">{c.name}</span>
                          <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] shrink-0 font-bold ${
                            isChecked ? 'bg-white text-emerald-700' : 'border border-slate-300 text-transparent'
                          }`}>
                            ✓
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hàng Dạng Bào Chế & Đối Tượng Sử Dụng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Dạng Bào Chế</label>
                    <select
                      value={editingProduct.dosageForm}
                      onChange={(e) => setEditingProduct({ ...editingProduct, dosageForm: e.target.value })}
                      className="w-full px-3 py-2 bg-white border rounded-xl font-medium"
                    >
                      {DOSAGE_FORMS.filter(d => d.id !== 'all').map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Đối Tượng Sử Dụng</label>
                    <select
                      value={editingProduct.targetAudience}
                      onChange={(e) => setEditingProduct({ ...editingProduct, targetAudience: e.target.value })}
                      className="w-full px-3 py-2 bg-white border rounded-xl font-medium"
                    >
                      {TARGET_AUDIENCES.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Mô tả & Hướng dẫn sử dụng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      Mô Tả Ngắn Sản Phẩm *
                    </label>
                    <textarea
                      rows="3"
                      value={editingProduct.shortDesc}
                      onChange={(e) => setEditingProduct({ ...editingProduct, shortDesc: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                      Hướng Dẫn Sử Dụng & Liều Dùng *
                    </label>
                    <textarea
                      rows="3"
                      value={editingProduct.usage}
                      onChange={(e) => setEditingProduct({ ...editingProduct, usage: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                    />
                  </div>
                </div>

                {/* Thành phần & Công dụng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Thành Phần & Hàm Lượng (Mỗi dòng 1 chất)
                    </label>
                    <textarea
                      rows="3"
                      value={editingProduct.ingredientsText}
                      onChange={(e) => setEditingProduct({ ...editingProduct, ingredientsText: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      Công Dụng Nổi Bật (Mỗi dòng 1 công dụng)
                    </label>
                    <textarea
                      rows="3"
                      value={editingProduct.benefitsText}
                      onChange={(e) => setEditingProduct({ ...editingProduct, benefitsText: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-[11px]"
                    />
                  </div>
                </div>

                {/* Chống chỉ định */}
                <div>
                  <label className="block text-slate-700 font-bold mb-1 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Lưu Ý & Chống Chỉ Định
                  </label>
                  <input
                    type="text"
                    value={editingProduct.contraindications}
                    onChange={(e) => setEditingProduct({ ...editingProduct, contraindications: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>

                {/* Nút hành động */}
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Lưu Cập Nhật Sản Phẩm</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD / EDIT REGISTRATION MODAL */}
        {showAddRegModal && (
          <div 
            className="fixed inset-0 z-60 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
            onClick={() => setShowAddRegModal(false)}
          >
            <div 
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <FileCheck2 className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                      Cục An Toàn Thực Phẩm - Bộ Y Tế
                    </span>
                    <h3 className="text-base font-black text-white">
                      {editingReg ? `Chỉnh Sửa Số ĐKSP: ${editingReg.originalKey}` : 'Thêm Mới Số Đăng Ký Sản Phẩm (ĐKSP)'}
                    </h3>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddRegModal(false)}
                  className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveRegSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Số ĐKSP Cấp Phép *
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 8521/2023/ĐKSP hoặc 10452/2022/ĐKSP"
                      value={regForm.regNumber}
                      onChange={(e) => setRegForm({ ...regForm, regNumber: e.target.value })}
                      required
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono font-bold text-emerald-800 uppercase"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Định dạng chuẩn: [Số]/[Năm]/ĐKSP</p>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Năm Cấp Phép
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 2024"
                      value={regForm.date}
                      onChange={(e) => setRegForm({ ...regForm, date: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tên Sản Phẩm Đăng Ký Lưu Hành *
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Thực phẩm bảo vệ sức khỏe Viên Uống Bổ Não..."
                    value={regForm.name}
                    onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tổ Chức / Doanh Nghiệp Chịu Trách Nhiệm Về Sản Phẩm
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Công ty Cổ phần Dược phẩm Traphaco..."
                    value={regForm.applicant}
                    onChange={(e) => setRegForm({ ...regForm, applicant: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Loại Hình Sản Phẩm
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Thực phẩm bảo vệ sức khỏe Nội Địa / Nhập Khẩu"
                      value={regForm.type}
                      onChange={(e) => setRegForm({ ...regForm, type: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Quốc Gia / Nước Sản Xuất
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Việt Nam, Mỹ (USA), Úc (Australia)..."
                      value={regForm.origin}
                      onChange={(e) => setRegForm({ ...regForm, origin: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Tiêu Chuẩn Kiểm Nghiệm
                    </label>
                    <input
                      type="text"
                      placeholder="VD: GMP-WHO Bộ Y Tế, FDA Hoa Kỳ..."
                      value={regForm.inspectStandard}
                      onChange={(e) => setRegForm({ ...regForm, inspectStandard: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-blue-700"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Trạng Thái Cấp Phép
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Đã cấp phép lưu hành toàn quốc"
                      value={regForm.status}
                      onChange={(e) => setRegForm({ ...regForm, status: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-emerald-700"
                    />
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-[11px] text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Hiệu lực tức thì:</strong> Sau khi lưu, khách hàng nhập số ĐKSP này tại trang chủ sẽ nhận được huy hiệu xác thực màu xanh và toàn bộ thông tin công bố pháp lý chính xác.
                  </div>
                </div>

                {/* Nút hành động */}
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAddRegModal(false)}
                    className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{editingReg ? 'Lưu Cập Nhật Số ĐKSP' : 'Thêm Số ĐKSP Vào CSDL'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 1: VIẾT LẠI BÀI VIẾT BẰNG AI TỪ LINK NGOÀI */}
        {showAiModal && (
          <div 
            className="fixed inset-0 z-65 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
            onClick={() => !isRewritingWithAi && setShowAiModal(false)}
          >
            <div 
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal */}
              <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-sky-700 text-white px-6 py-4 flex items-center justify-between border-b border-indigo-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center border border-white/20">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-wider bg-white/10 text-amber-300 px-2 py-0.5 rounded border border-white/20">
                      AI Article Rewriter & SEO Engine
                    </span>
                    <h3 className="text-base font-black text-white mt-0.5">
                      Viết Lại Bài Viết Bằng AI & Tối Ưu SEO Cho MedXpressCare
                    </h3>
                  </div>
                </div>

                {!isRewritingWithAi && (
                  <button
                    type="button"
                    onClick={() => setShowAiModal(false)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-xs">
                
                {/* Thông báo trạng thái API Key */}
                <div className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 ${
                  tempConfig.aiApiKey ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' : 'bg-amber-50/80 border-amber-200 text-amber-950'
                }`}>
                  <div className="flex items-start gap-2.5">
                    {tempConfig.aiApiKey ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold text-[11px]">
                        {tempConfig.aiApiKey 
                          ? `Đã cấu hình API AI: ${tempConfig.aiProvider === 'openai' ? 'OpenAI ChatGPT' : 'Google Gemini'} (${tempConfig.aiModel || 'gemini-2.5-flash'})` 
                          : 'Đang dùng bộ giải thuật AI thông minh dự phòng'}
                      </div>
                      <div className="text-[10px] text-slate-600 mt-0.5">
                        {tempConfig.aiApiKey 
                          ? 'Sử dụng mô hình ngôn ngữ lớn để đọc sâu, tái cấu trúc và tối ưu hóa SEO độc bản 100%.' 
                          : 'Bạn có thể nhập API Key trong tab Cài Đặt hoặc dán link chạy ngay với bộ trích xuất thông minh.'}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAiModal(false);
                      setActiveTab('settings');
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 font-bold text-[10px] shrink-0 text-slate-700"
                  >
                    {tempConfig.aiApiKey ? 'Cài đặt' : 'Nhập API Key'}
                  </button>
                </div>

                {/* Input 1: Link bài viết gốc */}
                <div>
                  <label className="block text-slate-800 font-bold mb-1">
                    Link Bài Viết Gốc Cần Viết Lại (URL từ trang web khác) *
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="VD: https://www.vinmec.com/vi/tin-tuc/thong-tin-duoc/huong-dan-dung-canxi-d3k2/..."
                      value={aiSourceUrl}
                      onChange={(e) => setAiSourceUrl(e.target.value)}
                      disabled={isRewritingWithAi}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border rounded-xl font-medium text-slate-900 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Hỗ trợ mọi bài viết từ Vinmec, Medlatec, Báo Sức Khỏe Đời Sống, VnExpress, Dược Thư...
                  </p>
                </div>

                {/* Input 2: Giọng văn & Từ khóa mục tiêu */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Giọng Văn & Định Hướng Y Khoa
                    </label>
                    <select
                      value={aiTone}
                      onChange={(e) => setAiTone(e.target.value)}
                      disabled={isRewritingWithAi}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-slate-800"
                    >
                      <option value="medical_expert">Dược Sĩ Chuyên Môn (Khuyên dùng - Chuẩn EEAT)</option>
                      <option value="popular_accessible">Gần Gũi & Dễ Hiểu Đại Chúng</option>
                      <option value="clinical_academic">Hàn Lâm & Báo Cáo Lâm Sàng</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1">
                      Từ Khóa SEO Mục Tiêu (Tùy chọn)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: canxi d3k2, sâm ngọc linh..."
                      value={aiTargetKeyword}
                      onChange={(e) => setAiTargetKeyword(e.target.value)}
                      disabled={isRewritingWithAi}
                      className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                    />
                  </div>
                </div>

                {/* Input 3: (Tùy chọn) Nội dung thô */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                    <span>Nội Dung Thô Hoặc Đoạn Trích Dẫn (Tùy chọn - nếu web nguồn chặn copy)</span>
                    <span className="text-[10px] text-slate-400">Không bắt buộc</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Dán nội dung bài viết gốc vào đây nếu trang web chặn truy cập tự động..."
                    value={aiRawContent}
                    onChange={(e) => setAiRawContent(e.target.value)}
                    disabled={isRewritingWithAi}
                    className="w-full p-3 bg-slate-50 border rounded-xl font-normal text-slate-800"
                  />
                </div>

                {/* Loading state animation */}
                {isRewritingWithAi && (
                  <div className="p-5 rounded-2xl bg-indigo-50 border border-indigo-200 text-center space-y-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md">
                      <Sparkles className="w-5 h-5 animate-spin" />
                    </div>
                    <div>
                      <div className="font-extrabold text-indigo-950 text-sm">
                        AI Đang Phân Tích & Viết Lại Bài Viết Độc Bản...
                      </div>
                      <p className="text-[11px] text-indigo-700 mt-0.5">
                        Đang cấu trúc lại các đề mục H2/H3 • Đang sinh thẻ Meta Title & Description • Đang chấm điểm SEO On-Page
                      </p>
                    </div>
                  </div>
                )}

                {/* Kết quả sau khi AI tạo xong */}
                {aiRewriteResult && !isRewritingWithAi && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2.5 animate-in fade-in">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        Đã Viết Lại Thành Công & Đạt Chuẩn SEO
                      </span>
                      <span className="text-xs font-black text-emerald-800 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-300">
                        Điểm SEO: {aiRewriteResult.seoScore}/100 🟢
                      </span>
                    </div>

                    <div className="font-bold text-slate-900 text-sm leading-snug">
                      {aiRewriteResult.title}
                    </div>

                    <div className="text-[11px] text-slate-500 font-mono">
                      Slug: /cam-nang/{aiRewriteResult.slug}
                    </div>

                    <p className="text-[11px] text-slate-700 leading-relaxed italic bg-white/70 p-2.5 rounded-xl border border-emerald-100">
                      "{aiRewriteResult.summary}"
                    </p>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[10px]">
                      <span className="font-bold text-slate-600">Từ khóa chính:</span>
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                        {aiRewriteResult.focusKeyword}
                      </span>
                    </div>
                  </div>
                )}

                {/* Nút hành động */}
                <div className="flex justify-end gap-2 pt-3 border-t">
                  <button
                    type="button"
                    onClick={() => setShowAiModal(false)}
                    disabled={isRewritingWithAi}
                    className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
                  >
                    Đóng
                  </button>

                  {aiRewriteResult ? (
                    <button
                      type="button"
                      onClick={handleApplyAiArticleToEditor}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                    >
                      <span>Xem & Xuất Bản Trong Editor</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleStartAiRewrite}
                      disabled={isRewritingWithAi || (!aiSourceUrl.trim() && !aiRawContent.trim())}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>{isRewritingWithAi ? 'Đang Xử Lý...' : 'Bắt Đầu Viết Lại Bằng AI'}</span>
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

        {/* MODAL 2: BIÊN SOẠN & TỐI ƯU HÓA SEO ON-PAGE BÀI VIẾT */}
        {showArticleModal && (
          <div 
            className="fixed inset-0 z-65 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in"
            onClick={() => setShowArticleModal(false)}
          >
            <div 
              className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh] animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header Modal with Tab Switcher */}
              <div className="bg-slate-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-white">
                      {editingArticle ? 'Chỉnh Sửa & Tối Ưu SEO Bài Viết' : 'Biên Soạn Bài Viết Y Khoa Chuẩn SEO'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Tối ưu cấu trúc nội dung, thang điểm SEO On-Page và cấu hình SERP Snippet
                    </p>
                  </div>
                </div>

                {/* Tab Switcher: Nội dung vs SEO Center */}
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setArticleModalTab('content')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      articleModalTab === 'content'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    📝 1. Nội Dung Bài Viết
                  </button>
                  <button
                    type="button"
                    onClick={() => setArticleModalTab('seo')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      articleModalTab === 'seo'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🔍 2. Trung Tâm SEO</span>
                    <span className="bg-emerald-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                      {calculateSeoScore(articleFormData).score}/100
                    </span>
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveArticleSubmit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
                
                {/* TAB 1: NỘI DUNG BÀI VIẾT */}
                {articleModalTab === 'content' && (
                  <div className="space-y-4">
                    
                    {/* Tiêu đề bài viết */}
                    <div>
                      <label className="block text-slate-800 font-bold mb-1">
                        Tiêu Đề Bài Viết *
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Cách Phân Biệt TPCN Chính Ngạch vs Xách Tay Chuẩn Bộ Y Tế..."
                        value={articleFormData.title}
                        onChange={(e) => handleArticleTitleChange(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl font-bold text-sm text-slate-900 focus:bg-white"
                      />
                    </div>

                    {/* Slug URL */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                        <span>Đường Dẫn Tĩnh Thân Thiện SEO (URL Slug)</span>
                        <span className="text-[10px] text-slate-400 font-mono">Tự động sinh từ tiêu đề</span>
                      </label>
                      <div className="flex items-center">
                        <span className="px-3 py-2 bg-slate-200 border border-r-0 rounded-l-xl text-slate-500 font-mono text-[11px]">
                          medxpresscare.com/cam-nang/
                        </span>
                        <input
                          type="text"
                          value={articleFormData.slug}
                          onChange={(e) => setArticleFormData({ ...articleFormData, slug: slugify(e.target.value) })}
                          required
                          className="flex-1 px-3 py-2 bg-slate-50 border rounded-r-xl font-mono text-emerald-700 font-semibold text-[11px]"
                        />
                      </div>
                    </div>

                    {/* Chuyên mục & Tác giả & Thời gian đọc */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Chuyên Mục</label>
                        <select
                          value={articleFormData.category}
                          onChange={(e) => setArticleFormData({ ...articleFormData, category: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold text-slate-800"
                        >
                          <option value="Chuyên Gia Tư Vấn">Chuyên Gia Tư Vấn</option>
                          <option value="Cảnh Báo & Hàng Thật">Cảnh Báo & Hàng Thật</option>
                          <option value="Dược Liệu Bản Địa">Dược Liệu Bản Địa</option>
                          <option value="Cơ Xương Khớp">Cơ Xương Khớp</option>
                          <option value="Tim Mạch & Huyết Áp">Tim Mạch & Huyết Áp</option>
                          <option value="Dinh Dưỡng & Đề Kháng">Dinh Dưỡng & Đề Kháng</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Tác Giả Biên Soạn</label>
                        <input
                          type="text"
                          value={articleFormData.author}
                          onChange={(e) => setArticleFormData({ ...articleFormData, author: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Thời Gian Đọc</label>
                        <input
                          type="text"
                          placeholder="VD: 5 phút đọc"
                          value={articleFormData.readTime}
                          onChange={(e) => setArticleFormData({ ...articleFormData, readTime: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                        />
                      </div>
                    </div>

                    {/* Trạng thái & Nổi bật */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">Trạng Thái Bài Viết</label>
                        <select
                          value={articleFormData.status}
                          onChange={(e) => setArticleFormData({ ...articleFormData, status: e.target.value })}
                          className="w-full px-3 py-2 bg-white border rounded-xl font-bold"
                        >
                          <option value="published">Đã Xuất Bản (Hiển thị ngay cho khách đọc)</option>
                          <option value="draft">Bản Nháp (Lưu tạm chưa công khai)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2 pt-5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={articleFormData.featured}
                            onChange={(e) => setArticleFormData({ ...articleFormData, featured: e.target.checked })}
                            className="w-4 h-4 text-emerald-600 rounded"
                          />
                          <span className="font-bold text-slate-800">
                            Ghim làm Bài Viết Nổi Bật (Banner đầu trang cẩm nang)
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Ảnh bìa & Thẻ ALT (SEO Image) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-700 font-semibold mb-1">
                          Link Ảnh Bìa Bài Viết (URL) *
                        </label>
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/..."
                          value={articleFormData.image}
                          onChange={(e) => setArticleFormData({ ...articleFormData, image: e.target.value })}
                          required
                          className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-mono text-[11px]"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                          <span>Thẻ ALT Mô Tả Ảnh (Tối ưu Google Hình Ảnh) *</span>
                          <span className="text-[10px] text-emerald-600 font-bold">SEO Image</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Mô tả bức ảnh kèm từ khóa chính..."
                          value={articleFormData.imageAlt}
                          onChange={(e) => setArticleFormData({ ...articleFormData, imageAlt: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-medium"
                        />
                      </div>
                    </div>

                    {/* Sapo Tóm tắt mở đầu */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1 flex items-center justify-between">
                        <span>Đoạn Mở Đầu Tóm Tắt (Sapo) *</span>
                        <span className="text-[10px] text-slate-400">{articleFormData.summary.length}/160 ký tự</span>
                      </label>
                      <textarea
                        rows={2}
                        value={articleFormData.summary}
                        onChange={(e) => setArticleFormData({ ...articleFormData, summary: e.target.value })}
                        required
                        className="w-full p-3 bg-slate-50 border rounded-xl font-medium text-slate-800 leading-relaxed"
                      />
                    </div>

                    {/* Nội dung chi tiết bài viết với Thanh Công Cụ Markdown & Chèn Ảnh Chuyên Nghiệp */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <label className="text-slate-800 font-bold flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                          <span>Nội Dung Chi Tiết Bài Viết (Chuẩn Cẩm Nang Dài & Đa Phương Tiện) *</span>
                        </label>
                        
                        {/* Thống kê độ dài từ & ký tự */}
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="font-semibold text-slate-500">
                            {(articleFormData.content || '').trim().split(/\s+/).filter(Boolean).length.toLocaleString('vi-VN')} từ
                          </span>
                          <span>•</span>
                          <span className="text-slate-400">
                            {(articleFormData.content || '').length.toLocaleString('vi-VN')} ký tự
                          </span>
                          {((articleFormData.content || '').trim().split(/\s+/).filter(Boolean).length >= 800) && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              Đạt chuẩn bài viết dài chuyên sâu
                            </span>
                          )}
                        </div>
                      </div>

                      {/* THANH CÔNG CỤ SOẠN THẢO & CHÈN ẢNH (TOOLBAR) */}
                      <div className="p-2.5 bg-slate-100/90 border border-slate-200 rounded-t-2xl flex flex-wrap items-center justify-between gap-2">
                        {/* Nhóm công cụ Định Dạng Văn Bản */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => insertTextIntoArticleContent('\n\n## Tên Đề Mục Lớn Mới\n\n')}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs"
                            title="Thêm Đề mục H2"
                          >
                            H2
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTextIntoArticleContent('\n\n### Tên Ý Chính Con\n\n')}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs"
                            title="Thêm Đề mục H3"
                          >
                            H3
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTextIntoArticleContent('**văn bản in đậm**')}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-black text-xs shadow-2xs"
                            title="In đậm chữ"
                          >
                            B
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTextIntoArticleContent('*văn bản in nghiêng*')}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 italic font-serif text-xs shadow-2xs"
                            title="In nghiêng chữ"
                          >
                            I
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTextIntoArticleContent('\n\n> **Lời khuyên từ Dược sĩ chuyên môn:** Lời khuyên cụ thể tại đây...\n\n')}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 hover:bg-amber-100 text-amber-900 font-semibold text-xs shadow-2xs flex items-center gap-1"
                            title="Chèn khung Lời khuyên Dược sĩ"
                          >
                            <Stethoscope className="w-3.5 h-3.5 text-amber-600" />
                            <span>Lời khuyên</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => insertTextIntoArticleContent('\n- Ý thứ nhất\n- Ý thứ hai\n- Ý thứ ba\n')}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs shadow-2xs"
                            title="Danh sách gạch đầu dòng"
                          >
                            • Danh sách
                          </button>
                        </div>

                        {/* Nhóm công cụ Chèn Ảnh Vào Bài Viết */}
                        <div className="flex flex-wrap items-center gap-1.5">
                          {/* File input ẩn */}
                          <input
                            ref={inlineImageUploadRef}
                            type="file"
                            accept="image/*"
                            onChange={handleUploadInlineImage}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => inlineImageUploadRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors"
                            title="Tải ảnh từ máy tính và nén chèn vào bài viết"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>+ Tải ảnh từ máy</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleInsertImageUrlPrompt}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1 shadow-2xs"
                            title="Chèn ảnh từ đường link URL"
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>+ Link ảnh</span>
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={() => setShowMedicalPhotoPicker(!showMedicalPhotoPicker)}
                              className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-800 font-bold text-xs flex items-center gap-1 shadow-2xs"
                              title="Chọn nhanh từ kho ảnh y tế chuẩn Unsplash"
                            >
                              <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                              <span>Kho ảnh Y tế mẫu</span>
                            </button>

                            {/* Dropdown Menu kho ảnh mẫu */}
                            {showMedicalPhotoPicker && (
                              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95 space-y-1">
                                <div className="text-[11px] font-bold text-slate-500 px-2 py-1 border-b border-slate-100">
                                  Bấm để chèn ảnh minh họa y tế:
                                </div>
                                {MEDICAL_PHOTO_PRESETS.map((preset, pIdx) => (
                                  <button
                                    key={pIdx}
                                    type="button"
                                    onClick={() => {
                                      const md = `\n\n![${preset.caption}](${preset.url})\n`;
                                      insertTextIntoArticleContent(md);
                                      setShowMedicalPhotoPicker(false);
                                    }}
                                    className="w-full text-left p-1.5 rounded-xl hover:bg-emerald-50 flex items-center gap-2.5 text-xs text-slate-700 group transition-colors"
                                  >
                                    <img src={preset.url} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                                    <div className="min-w-0">
                                      <div className="font-bold text-slate-900 group-hover:text-emerald-700 truncate">{preset.label}</div>
                                      <div className="text-[10px] text-slate-400 truncate">{preset.caption}</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Textarea Soạn Thảo Dung Lượng Lớn */}
                      <textarea
                        ref={articleContentTextareaRef}
                        rows={16}
                        value={articleFormData.content}
                        onChange={(e) => setArticleFormData({ ...articleFormData, content: e.target.value })}
                        required
                        placeholder="Soạn thảo nội dung bài viết chuyên sâu tại đây... Bạn có thể dùng thanh công cụ phía trên để chèn tiêu đề H2, H3, lời khuyên Dược sĩ hoặc tải ảnh minh họa trực tiếp."
                        className="w-full p-4 bg-slate-50/80 border border-slate-200 rounded-b-2xl font-mono text-xs leading-relaxed focus:bg-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      />
                    </div>

                    {/* Thẻ từ khóa Tags */}
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1">
                        Thẻ Từ Khóa (Tags - phân cách bằng dấu phẩy)
                      </label>
                      <input
                        type="text"
                        placeholder="canxi d3k2, loãng xương, dược sĩ tư vấn..."
                        value={articleFormData.tagsText}
                        onChange={(e) => setArticleFormData({ ...articleFormData, tagsText: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                      />
                    </div>

                  </div>
                )}

                {/* TAB 2: TRUNG TÂM TỐI ƯU SEO ON-PAGE */}
                {articleModalTab === 'seo' && (
                  <div className="space-y-5">
                    
                    {/* Khối Điểm số SEO On-Page */}
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          <span>Chỉ Số Sức Khỏe SEO On-Page Realtime</span>
                        </div>
                        <h4 className="text-lg font-black mt-1">
                          {calculateSeoScore(articleFormData).score >= 85
                            ? '🟢 Bài Viết Đã Đạt Chuẩn SEO Tuyệt Vời!'
                            : calculateSeoScore(articleFormData).score >= 65
                            ? '🟡 Bài Viết Đạt Mức Khá - Nên Tối Ưu Thêm'
                            : '🔴 Cần Bổ Sung Thêm Tiêu Chí SEO'}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Phân tích theo thuật toán xếp hạng tìm kiếm Google YMYL & Medical EEAT
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <div className="text-3xl font-black text-emerald-400">
                            {calculateSeoScore(articleFormData).score}/100
                          </div>
                          <div className="text-[10px] text-slate-400">Điểm tối ưu hóa</div>
                        </div>
                      </div>
                    </div>

                    {/* Bảng Checklist 7 tiêu chí SEO On-Page */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                      <div className="font-bold text-slate-800 text-xs mb-1">
                        Bảng Đánh Giá Chi Tiết 7 Tiêu Chí Chuẩn Google:
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                        {calculateSeoScore(articleFormData).checks.map((check, idx) => (
                          <div
                            key={idx}
                            className={`p-2 rounded-xl border flex items-center gap-2 ${
                              check.passed 
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900' 
                                : 'bg-amber-50/70 border-amber-200 text-amber-900'
                            }`}
                          >
                            {check.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                            )}
                            <div className="min-w-0">
                              <span className="font-semibold block truncate">{check.label}</span>
                              {check.detail && (
                                <span className="text-[10px] opacity-75">{check.detail}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Khung mô phỏng Google Search (Google SERP Snippet Preview) */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs border-b pb-2">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Globe className="w-4 h-4 text-blue-600" />
                          <span>Mô Phỏng Hiển Thị Trên Google Tìm Kiếm (SERP Snippet):</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Xem trước kết quả thực tế</span>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 font-sans space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <div className="w-4 h-4 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-[9px]">
                            M
                          </div>
                          <span className="text-slate-800 font-medium">medxpresscare.com</span>
                          <span className="text-slate-400">› cam-nang › {articleFormData.slug || 'duong-dan-bai-viet'}</span>
                        </div>

                        <div className="text-blue-700 hover:underline text-base font-medium leading-snug cursor-pointer pt-0.5">
                          {articleFormData.metaTitle || articleFormData.title || 'Tiêu đề bài viết sẽ hiển thị tại đây...'}
                        </div>

                        <div className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {articleFormData.metaDescription || articleFormData.summary || 'Đoạn mô tả ngắn gọn giúp người tìm kiếm trên Google hiểu rõ nội dung và bấm vào đọc bài viết của bạn...'}
                        </div>
                      </div>
                    </div>

                    {/* Khung mô phỏng Facebook / Zalo Share Preview */}
                    <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                      <div className="flex items-center justify-between text-xs border-b pb-2">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Share2 className="w-4 h-4 text-indigo-600" />
                          <span>Mô Phỏng Thẻ Chia Sẻ Mạng Xã Hội (Facebook / Zalo OpenGraph):</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Social Card</span>
                      </div>

                      <div className="max-w-md rounded-2xl overflow-hidden border border-slate-200 bg-slate-50">
                        <img
                          src={articleFormData.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80'}
                          alt={articleFormData.imageAlt || 'Cover'}
                          className="w-full h-36 object-cover"
                        />
                        <div className="p-3 bg-white">
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">
                            MEDXPRESSCARE.COM
                          </div>
                          <div className="font-bold text-slate-900 text-xs mt-0.5 line-clamp-1">
                            {articleFormData.metaTitle || articleFormData.title || 'Tiêu đề bài viết'}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                            {articleFormData.metaDescription || articleFormData.summary}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bộ công cụ cấu hình SEO Fields */}
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      
                      {/* Tiêu đề SEO (Meta Title) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-slate-800">
                            Tiêu Đề SEO (Meta Title Tag) *
                          </label>
                          <span className={`text-[10px] font-bold ${
                            articleFormData.metaTitle.length >= 40 && articleFormData.metaTitle.length <= 65
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}>
                            {articleFormData.metaTitle.length}/60 ký tự (Khuyến nghị 40 - 65)
                          </span>
                        </div>
                        <input
                          type="text"
                          placeholder="VD: Cách Dùng Canxi D3K2 Đúng Chuẩn Y Khoa | MedXpressCare"
                          value={articleFormData.metaTitle}
                          onChange={(e) => setArticleFormData({ ...articleFormData, metaTitle: e.target.value })}
                          className="w-full px-3 py-2 bg-white border rounded-xl font-medium"
                        />
                      </div>

                      {/* Mô tả SEO (Meta Description) */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="font-bold text-slate-800">
                            Mô Tả SEO (Meta Description Tag) *
                          </label>
                          <span className={`text-[10px] font-bold ${
                            articleFormData.metaDescription.length >= 120 && articleFormData.metaDescription.length <= 165
                              ? 'text-emerald-600'
                              : 'text-amber-600'
                          }`}>
                            {articleFormData.metaDescription.length}/160 ký tự (Khuyến nghị 120 - 165)
                          </span>
                        </div>
                        <textarea
                          rows={2}
                          placeholder="Mô tả súc tích xuất hiện dưới link tìm kiếm Google kèm từ khóa chính..."
                          value={articleFormData.metaDescription}
                          onChange={(e) => setArticleFormData({ ...articleFormData, metaDescription: e.target.value })}
                          className="w-full p-3 bg-white border rounded-xl font-medium leading-relaxed"
                        />
                      </div>

                      {/* Từ khóa chính & Từ khóa phụ */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            Từ Khóa Chính (Focus Keyword) *
                          </label>
                          <input
                            type="text"
                            placeholder="VD: canxi d3k2"
                            value={articleFormData.focusKeyword}
                            onChange={(e) => setArticleFormData({ ...articleFormData, focusKeyword: e.target.value })}
                            className="w-full px-3 py-2 bg-white border rounded-xl font-bold text-emerald-800"
                          />
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            Từ Khóa Phụ Liên Quan
                          </label>
                          <input
                            type="text"
                            placeholder="VD: loãng xương, bổ sung canxi, sỏi thận..."
                            value={articleFormData.secondaryKeywords}
                            onChange={(e) => setArticleFormData({ ...articleFormData, secondaryKeywords: e.target.value })}
                            className="w-full px-3 py-2 bg-white border rounded-xl"
                          />
                        </div>
                      </div>

                      {/* Schema Type */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            Loại Schema Dữ Liệu Có Cấu Trúc
                          </label>
                          <select
                            value={articleFormData.schemaType}
                            onChange={(e) => setArticleFormData({ ...articleFormData, schemaType: e.target.value })}
                            className="w-full px-3 py-2 bg-white border rounded-xl font-bold"
                          >
                            <option value="MedicalWebPage">MedicalWebPage (Trang Y Khoa - Khuyên dùng)</option>
                            <option value="Article">Article (Bài viết tiêu chuẩn)</option>
                            <option value="BlogPosting">BlogPosting (Bài viết tin tức)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-slate-700 font-bold mb-1">
                            Đường Dẫn Chuẩn (Canonical URL)
                          </label>
                          <input
                            type="text"
                            value={articleFormData.canonicalUrl || `https://medxpresscare.com/cam-nang/${articleFormData.slug}`}
                            onChange={(e) => setArticleFormData({ ...articleFormData, canonicalUrl: e.target.value })}
                            className="w-full px-3 py-2 bg-white border rounded-xl font-mono text-[11px]"
                          />
                        </div>
                      </div>

                    </div>

                  </div>
                )}

                {/* Footer buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowArticleModal(false)}
                    className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
                  >
                    Hủy Bỏ
                  </button>

                  <div className="flex items-center gap-2">
                    {articleModalTab === 'content' ? (
                      <button
                        type="button"
                        onClick={() => setArticleModalTab('seo')}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <span>Tiếp Tục: Kiểm Tra & Tối Ưu SEO</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setArticleModalTab('content')}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                      >
                        Quay lại Nội dung
                      </button>
                    )}

                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{editingArticle ? 'Lưu Cập Nhật Bài Viết' : 'Xuất Bản Bài Viết Chuẩn SEO'}</span>
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* BULK IMPORT MODAL (Dùng chung cho cả Số ĐKSP và Sản phẩm) */}
        {bulkImportType && (
          <BulkImportModal
            isOpen={true}
            onClose={() => setBulkImportType(null)}
            type={bulkImportType}
            onConfirmImport={bulkImportType === 'registrations' ? onBulkImportRegistrations : onBulkImportProducts}
            onImportProducts={onBulkImportProducts}
            onImportRegistrations={onBulkImportRegistrations}
          />
        )}

        {/* ADD REVIEW MODAL (Thêm mới đánh giá sản phẩm chủ động) */}
        {showAddReviewModal && (
          <div 
            className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
            onClick={() => setShowAddReviewModal(false)}
          >
            <div 
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-emerald-900/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-white">Thêm Đánh Giá Mới Cho Sản Phẩm</h4>
                    <p className="text-[11px] text-emerald-300/90">Chủ động tạo UGC uy tín, tăng tỷ lệ chốt đơn và hiển thị lời khuyên Dược sĩ</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddReviewModal(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Body */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!newReviewForm.productId) {
                    alert('Vui lòng chọn sản phẩm cần đánh giá!');
                    return;
                  }
                  if (!newReviewForm.customerName.trim()) {
                    alert('Vui lòng nhập tên người đánh giá!');
                    return;
                  }
                  if (!newReviewForm.content.trim()) {
                    alert('Vui lòng nhập nội dung đánh giá!');
                    return;
                  }

                  const selectedProduct = products.find(p => p.id === newReviewForm.productId);
                  const newRev = {
                    id: `rev-${Date.now()}`,
                    productId: newReviewForm.productId,
                    productName: selectedProduct ? selectedProduct.name : newReviewForm.productName,
                    customerName: newReviewForm.customerName.trim(),
                    customerPhone: newReviewForm.customerPhone.trim() || '0988***' + Math.floor(100 + Math.random() * 900),
                    rating: Number(newReviewForm.rating) || 5,
                    createdAt: newReviewForm.createdAt || new Date().toISOString().split('T')[0],
                    audience: newReviewForm.audience || 'all',
                    audienceLabel: newReviewForm.audienceLabel || 'Khách hàng thân thiết',
                    isVerifiedPurchase: newReviewForm.isVerifiedPurchase,
                    title: newReviewForm.title.trim() || 'Sản phẩm dùng rất tốt, hài lòng',
                    content: newReviewForm.content.trim(),
                    photos: newReviewForm.photos || [],
                    pharmacistReply: newReviewForm.pharmacistReply.trim() || null,
                    pharmacistName: newReviewForm.pharmacistReply.trim() ? (newReviewForm.pharmacistName || 'DS. CKI Nguyễn Thu Trang') : null,
                    replyDate: newReviewForm.pharmacistReply.trim() ? (newReviewForm.createdAt || new Date().toISOString().split('T')[0]) : null,
                    status: newReviewForm.status || 'approved',
                    likes: Math.floor(Math.random() * 20) + 5
                  };

                  if (onAddReview) {
                    onAddReview(newRev);
                  }
                  setShowAddReviewModal(false);
                }}
                className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs"
              >
                {/* 1. Lựa chọn sản phẩm */}
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    1. Chọn sản phẩm cần thêm đánh giá <span className="text-rose-500">*</span>:
                  </label>
                  <select
                    value={newReviewForm.productId}
                    onChange={(e) => {
                      const selProd = products.find(p => p.id === e.target.value);
                      setNewReviewForm(prev => ({
                        ...prev,
                        productId: e.target.value,
                        productName: selProd ? selProd.name : prev.productName
                      }));
                    }}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    required
                  >
                    <option value="">-- Chọn sản phẩm ({products.length} sản phẩm) --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} {p.brand ? `[${p.brand}]` : ''} ({p.price ? Number(p.price).toLocaleString('vi-VN') + '₫' : ''})
                      </option>
                    ))}
                  </select>

                  {/* Preview sản phẩm đã chọn */}
                  {(() => {
                    const sel = products.find(p => p.id === newReviewForm.productId);
                    if (!sel) return null;
                    return (
                      <div className="mt-2 p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-center gap-3">
                        {sel.image && (
                          <img src={sel.image} alt={sel.name} className="w-11 h-11 rounded-lg object-cover bg-white border border-emerald-200" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="font-extrabold text-emerald-950 truncate">{sel.name}</div>
                          <div className="text-[11px] text-emerald-700 flex items-center gap-2 mt-0.5">
                            <span>Thương hiệu: <strong>{sel.brand || 'Chính hãng'}</strong></span>
                            <span>•</span>
                            <span>Số ĐKSP: <strong>{sel.regNumber || 'Bộ Y Tế cấp'}</strong></span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* 2. Điểm đánh giá (Stars) & Thời gian */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      2. Chọn điểm đánh giá (Rating) <span className="text-rose-500">*</span>:
                    </label>
                    <div className="flex items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-xl">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => setNewReviewForm(prev => ({ ...prev, rating: starVal }))}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              starVal <= newReviewForm.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-extrabold text-amber-600 ml-2">
                        {newReviewForm.rating === 5 && '5.0 ★ (Xuất sắc / Rất hài lòng)'}
                        {newReviewForm.rating === 4 && '4.0 ★ (Hài lòng / Tốt)'}
                        {newReviewForm.rating === 3 && '3.0 ★ (Bình thường)'}
                        {newReviewForm.rating === 2 && '2.0 ★ (Chưa ưng ý)'}
                        {newReviewForm.rating === 1 && '1.0 ★ (Kém / Thất vọng)'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      3. Thời gian đánh giá:
                    </label>
                    <input
                      type="date"
                      value={newReviewForm.createdAt}
                      onChange={(e) => setNewReviewForm(prev => ({ ...prev, createdAt: e.target.value }))}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Mặc định là hôm nay. Bạn có thể chọn ngày trong quá khứ để rải đều tự nhiên.
                    </p>
                  </div>
                </div>

                {/* 3. Tên người đánh giá & Số điện thoại & Nhóm đối tượng */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Tên người đánh giá <span className="text-rose-500">*</span>:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Bác Nguyễn Văn Thắng, Chị Thu Thảo..."
                      value={newReviewForm.customerName}
                      onChange={(e) => setNewReviewForm(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Số điện thoại (Ẩn 3 số giữa):
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 0912***678"
                      value={newReviewForm.customerPhone}
                      onChange={(e) => setNewReviewForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Phân loại khách / Tuổi:
                    </label>
                    <select
                      value={newReviewForm.audienceLabel}
                      onChange={(e) => {
                        const val = e.target.value;
                        setNewReviewForm(prev => ({
                          ...prev,
                          audienceLabel: val,
                          audience: val.includes('cao tuổi') ? 'elderly' : val.includes('văn phòng') ? 'office' : val.includes('Phụ nữ') ? 'women' : 'all'
                        }));
                      }}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    >
                      <option value="Người cao tuổi (63 tuổi)">Người cao tuổi (63 tuổi)</option>
                      <option value="Người cao tuổi (58 tuổi)">Người cao tuổi (58 tuổi)</option>
                      <option value="Dân văn phòng (28 tuổi)">Dân văn phòng (28 tuổi)</option>
                      <option value="Dân văn phòng (34 tuổi)">Dân văn phòng (34 tuổi)</option>
                      <option value="Phụ nữ sau sinh (32 tuổi)">Phụ nữ sau sinh (32 tuổi)</option>
                      <option value="Mẹ bỉm sữa chăm con">Mẹ bỉm sữa chăm con</option>
                      <option value="Nam giới thể thao">Nam giới thể thao</option>
                      <option value="Khách hàng thân thiết">Khách hàng thân thiết</option>
                    </select>
                  </div>
                </div>

                {/* 4. TỰ ĐỘNG THÊM TICK ĐÃ MUA HÀNG (Yêu cầu chính) */}
                <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isVerifiedPurchase"
                      checked={newReviewForm.isVerifiedPurchase}
                      onChange={(e) => setNewReviewForm(prev => ({ ...prev, isVerifiedPurchase: e.target.checked }))}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                    />
                    <label htmlFor="isVerifiedPurchase" className="cursor-pointer">
                      <div className="font-extrabold text-emerald-950 text-xs flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tự động thêm tick "Đã mua hàng" (Huy hiệu xanh xác thực)</span>
                      </div>
                      <div className="text-[10px] text-emerald-700">
                        Hiển thị huy hiệu ✓ Đã mua hàng để gia tăng độ tin cậy tuyệt đối với người xem.
                      </div>
                    </label>
                  </div>

                  <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${
                    newReviewForm.isVerifiedPurchase 
                      ? 'bg-emerald-600 text-white border-emerald-600' 
                      : 'bg-slate-200 text-slate-600 border-slate-300'
                  }`}>
                    {newReviewForm.isVerifiedPurchase ? '✓ Đang kích hoạt' : 'Tắt'}
                  </span>
                </div>

                {/* 5. Tiêu đề & Nội dung đánh giá */}
                <div className="space-y-2">
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Tiêu đề đánh giá nổi bật:
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Khớp gối đỡ kêu lục cục hẳn sau 2 tuần dùng..."
                      value={newReviewForm.title}
                      onChange={(e) => setNewReviewForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-800">
                        Nội dung chi tiết trải nghiệm <span className="text-rose-500">*</span>:
                      </label>
                      {/* Mẫu nhanh */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-400">Gợi ý mẫu:</span>
                        {[
                          {
                            label: 'Xương khớp',
                            title: 'Khớp gối đỡ kêu lục cục và bớt đau sau 2 tuần',
                            content: 'Tôi 62 tuổi hay bị đau mỏi khớp gối và lưng mỗi khi thời tiết thay đổi. Mua theo tư vấn của Dược sĩ MedXpressCare uống hết 1 hộp thấy đi lại nhẹ nhàng hơn hẳn, đứng lên ngồi xuống không phải chống gối. Hàng có tem cào Bộ CA rất an tâm!'
                          },
                          {
                            label: 'Bổ mắt/IT',
                            title: 'Mắt êm và hết mỏi khô sau 10 ngày làm việc máy tính',
                            content: 'Mình làm văn phòng ngồi máy tính 9 tiếng mỗi ngày, mắt hay bị cay xè và nhòe. Dùng viên này thấy mắt dịu mát, không còn bị căng tức. Hộp thuốc chuẩn có tem phụ tiếng Việt rõ ràng, giao nhanh!'
                          },
                          {
                            label: 'Tiêu hóa/Gan',
                            title: 'Dùng rất êm bụng, ăn ngon ngủ tốt hơn',
                            content: 'Uống đều đặn mỗi ngày sau bữa trưa theo lời dặn của Dược sĩ, sau 3 tuần thấy người nhẹ nhõm, tiêu hóa tốt và không còn ậm ạch khó chịu. Dịch vụ tư vấn của nhà thuốc rất chu đáo.'
                          }
                        ].map((m, mIdx) => (
                          <button
                            key={mIdx}
                            type="button"
                            onClick={() => {
                              setNewReviewForm(prev => ({
                                ...prev,
                                title: m.title,
                                content: m.content
                              }));
                            }}
                            className="text-[10px] px-1.5 py-0.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 rounded font-semibold border border-slate-200"
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={3}
                      placeholder="Mô tả trải nghiệm thực tế của khách hàng: triệu chứng trước khi dùng, thời gian cải thiện, cảm nhận về tem mác & tư vấn..."
                      value={newReviewForm.content}
                      onChange={(e) => setNewReviewForm(prev => ({ ...prev, content: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                      required
                    />
                  </div>
                </div>

                {/* 6. Ảnh chụp thực tế (UGC Photos) */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-800 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-blue-600" />
                      <span>Hình ảnh mở hộp & tem chống giả thực tế (UGC):</span>
                    </label>
                    <span className="text-[10px] text-slate-400">Đã thêm: {newReviewForm.photos.length} ảnh</span>
                  </div>

                  {/* Quick sample photo presets */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold">Thêm nhanh ảnh mẫu:</span>
                    {[
                      {
                        name: '+ Hộp thuốc & tem cào',
                        url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'
                      },
                      {
                        name: '+ Mở hộp bọc chống sốc',
                        url: 'https://images.unsplash.com/photo-1576073719676-aa95576db207?w=600&auto=format&fit=crop&q=80'
                      },
                      {
                        name: '+ Lọ thuốc & tem phụ',
                        url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80'
                      },
                      {
                        name: '+ Ảnh thực tế sử dụng',
                        url: 'https://images.unsplash.com/photo-1550572017-ed211516e812?w=600&auto=format&fit=crop&q=80'
                      }
                    ].map((sp, spIdx) => (
                      <button
                        key={spIdx}
                        type="button"
                        onClick={() => {
                          if (!newReviewForm.photos.includes(sp.url)) {
                            setNewReviewForm(prev => ({ ...prev, photos: [...prev.photos, sp.url] }));
                          }
                        }}
                        className="text-[10px] px-2 py-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 rounded-lg font-semibold transition-colors"
                      >
                        {sp.name}
                      </button>
                    ))}
                  </div>

                  {/* Input link ảnh tùy chỉnh */}
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      placeholder="Dán link ảnh (https://...)"
                      value={newReviewForm.newPhotoUrl}
                      onChange={(e) => setNewReviewForm(prev => ({ ...prev, newPhotoUrl: e.target.value }))}
                      className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newReviewForm.newPhotoUrl.trim()) {
                          setNewReviewForm(prev => ({
                            ...prev,
                            photos: [...prev.photos, prev.newPhotoUrl.trim()],
                            newPhotoUrl: ''
                          }));
                        }
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shrink-0"
                    >
                      + Thêm ảnh
                    </button>
                  </div>

                  {/* Danh sách ảnh đã chọn */}
                  {newReviewForm.photos.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {newReviewForm.photos.map((pUrl, pIdx) => (
                        <div key={pIdx} className="relative group">
                          <img src={pUrl} alt="Preview" className="w-14 h-14 rounded-xl object-cover border border-slate-300 shadow-2xs" />
                          <button
                            type="button"
                            onClick={() => {
                              setNewReviewForm(prev => ({
                                ...prev,
                                photos: prev.photos.filter((_, i) => i !== pIdx)
                              }));
                            }}
                            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-md hover:bg-rose-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 7. Phản hồi của Dược sĩ Chuyên môn (Tùy chọn) */}
                <div className="space-y-2 bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-emerald-950 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Phản hồi tư vấn y khoa từ Dược sĩ (Tùy chọn):</span>
                    </label>
                    <input
                      type="text"
                      value={newReviewForm.pharmacistName}
                      onChange={(e) => setNewReviewForm(prev => ({ ...prev, pharmacistName: e.target.value }))}
                      placeholder="Tên Dược sĩ..."
                      className="px-2 py-1 bg-white border border-emerald-200 rounded-lg text-[11px] font-bold text-emerald-900 w-52"
                    />
                  </div>

                  {/* Gợi ý mẫu phản hồi nhanh */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold">Mẫu phản hồi:</span>
                    {[
                      {
                        label: 'Dặn duy trì liệu trình',
                        text: 'Dược sĩ MedXpressCare cảm ơn bạn đã tin dùng sản phẩm chính hãng! Bạn hãy tiếp tục duy trì đủ liệu trình 2-3 tháng để dưỡng chất phát huy hiệu quả bảo vệ sức khỏe tốt nhất nhé.'
                      },
                      {
                        label: 'Dặn uống sau ăn & nước ấm',
                        text: 'Chào bạn! Để tối ưu khả năng hấp thu và bảo vệ niêm mạc dạ dày, bạn nên uống sản phẩm sau bữa ăn 30 phút cùng 1 ly nước ấm lớn, kết hợp ngủ đủ giấc nhé.'
                      },
                      {
                        label: 'Cam kết tem Bộ Y Tế',
                        text: 'Toàn bộ sản phẩm tại MedXpressCare đều có tem chống giả Bộ Công An và tem phụ tiếng Việt đúng chuẩn Bộ Y Tế. Chúc bạn và gia đình dồi dào sức khỏe!'
                      }
                    ].map((tmp, tmpIdx) => (
                      <button
                        key={tmpIdx}
                        type="button"
                        onClick={() => setNewReviewForm(prev => ({ ...prev, pharmacistReply: tmp.text }))}
                        className="text-[10px] px-2 py-0.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md font-semibold"
                      >
                        + {tmp.label}
                      </button>
                    ))}
                  </div>

                  <textarea
                    rows={2}
                    placeholder="Nhập lời dặn dò y khoa, lưu ý kiêng khem hoặc lời cảm ơn của Dược sĩ..."
                    value={newReviewForm.pharmacistReply}
                    onChange={(e) => setNewReviewForm(prev => ({ ...prev, pharmacistReply: e.target.value }))}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                {/* Submit Actions */}
                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-500">Trạng thái:</span>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      ✓ Xuất bản ngay trên web
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddReviewModal(false)}
                      className="px-4 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-colors"
                    >
                      Hủy Bỏ
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-md shadow-emerald-700/20 transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" />
                      <span>Lưu Đánh Giá Sản Phẩm</span>
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* PRINTING PACKING SLIP MODAL (Phiếu Gửi Hàng Bưu Điện) */}
        {printingOrder && (
          <div 
            className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
            onClick={() => setPrintingOrder(null)}
          >
            <div 
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh] animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-sm">Xem Trước & In Phiếu Gửi Hàng Dán Lên Bưu Kiện</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPrintingOrder(null)}
                  className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Printable Slip Content */}
              <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
                <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-300 shadow-sm space-y-4 text-slate-800 text-xs">
                  {/* Slip Header */}
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-3">
                    <div>
                      <div className="font-black text-lg text-emerald-700 tracking-wider">MEDXPRESSCARE</div>
                      <div className="text-[10px] text-slate-500 font-semibold uppercase">Tổng Kho Dược Phẩm & TPCN Chuẩn GSP</div>
                      <div className="text-[11px] text-slate-600 mt-1">Hotline: <strong>1800 6868</strong> • Web: medxpresscare.com</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-black text-sm text-slate-900">
                        {printingOrder.trackingNumber || `GHTK-${printingOrder.id.replace(/[^0-9]/g, '') || '883921'}VN`}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Mã đơn: {printingOrder.id}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{new Date(printingOrder.createdAt || Date.now()).toLocaleString('vi-VN')}</div>
                    </div>
                  </div>

                  {/* Sender & Receiver Box */}
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">NGƯỜI GỬI (FROM):</div>
                      <div className="font-bold text-slate-900">DƯỢC SĨ MEDXPRESSCARE</div>
                      <div className="text-[11px] text-slate-600">Tổng kho Dược, Cầu Giấy, Hà Nội</div>
                      <div className="text-[11px] text-slate-600">SĐT: 0968 6868 68</div>
                    </div>
                    <div className="border-l border-slate-200 pl-3">
                      <div className="text-[10px] font-bold uppercase text-emerald-700">NGƯỜI NHẬN (TO):</div>
                      <div className="font-bold text-slate-900 text-sm">{printingOrder.customer?.fullName}</div>
                      <div className="font-mono font-bold text-emerald-700">{printingOrder.customer?.phone}</div>
                      <div className="text-[11px] text-slate-700 leading-tight mt-0.5">
                        {printingOrder.customer?.address}, {printingOrder.customer?.district ? printingOrder.customer.district + ', ' : ''}{printingOrder.customer?.province}
                      </div>
                    </div>
                  </div>

                  {/* Product items table */}
                  <div>
                    <div className="font-bold text-slate-800 text-[11px] mb-1.5 uppercase">Nội Dung Hàng Hóa:</div>
                    <table className="w-full text-left text-[11px] border border-slate-200">
                      <thead className="bg-slate-100 font-bold border-b border-slate-200">
                        <tr>
                          <th className="p-2">STT</th>
                          <th className="p-2">Tên Thuốc / TPCN</th>
                          <th className="p-2 text-center">SL</th>
                          <th className="p-2 text-right">Thành Tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(printingOrder.items || []).map((it, i) => (
                          <tr key={i}>
                            <td className="p-2 font-mono text-center">{i + 1}</td>
                            <td className="p-2 font-medium">{it.name}</td>
                            <td className="p-2 text-center font-bold">x{it.quantity}</td>
                            <td className="p-2 text-right font-mono">{(it.price * it.quantity).toLocaleString('vi-VN')}₫</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* COD & Instructions */}
                  <div className="p-3.5 rounded-xl border-2 border-slate-900 flex justify-between items-center bg-slate-50">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-500">TIỀN THU NGƯỜI NHẬN (COD):</div>
                      <div className="text-xl font-black text-slate-900">
                        {printingOrder.paymentMethod === 'vietqr' 
                          ? '0 VNĐ (ĐÃ THANH TOÁN ONLINE)' 
                          : `${(printingOrder.grandTotal || 0).toLocaleString('vi-VN')} VNĐ`}
                      </div>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 font-semibold">
                      <div>⚡ Cho khách kiểm tra tem niêm phong</div>
                      <div>❄️ Bảo quản nhiệt độ mát (&lt;25°C)</div>
                    </div>
                  </div>

                  {/* Signature lines */}
                  <div className="grid grid-cols-3 gap-2 pt-4 text-center text-[10px] text-slate-500">
                    <div>
                      <div className="font-bold text-slate-700">DƯỢC SĨ ĐÓNG GÓI</div>
                      <div className="text-[9px] mt-0.5">(Ký & ghi rõ họ tên)</div>
                      <div className="h-10"></div>
                      <div className="font-semibold text-slate-800">Đã kiểm đủ tem VAT</div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-700">BƯU TÁ LẤY HÀNG</div>
                      <div className="text-[9px] mt-0.5">(GHTK / GHN / Viettel)</div>
                      <div className="h-10"></div>
                    </div>
                    <div>
                      <div className="font-bold text-slate-700">NGƯỜI NHẬN HÀNG</div>
                      <div className="text-[9px] mt-0.5">(Ký nhận nguyên vẹn)</div>
                      <div className="h-10"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setPrintingOrder(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Đóng Lại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    if (printingOrder && onUpdateOrderStatus) {
                      onUpdateOrderStatus(printingOrder.id, 'confirmed', { isPrinted: true });
                    }
                  }}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>In Phiếu Ngay & Bật Auto-tracking</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL 1: BÁO GIAO THẤT BẠI & CHUYỂN HOÀN VỀ KHO */}
        {failingOrder && (
          <div 
            className="fixed inset-0 z-70 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in"
            onClick={() => setFailingOrder(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-rose-200 overflow-hidden animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm sm:text-base">Báo Giao Thất Bại & Chuyển Hoàn</h3>
                    <p className="text-[11px] text-rose-100">Đơn hàng: <strong className="font-mono text-white">{failingOrder.id}</strong> - Khách: {failingOrder.customer?.fullName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setFailingOrder(null)}
                  className="p-1 rounded-full text-rose-200 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const finalReason = selectedFailureReason === 'Lý do khác (Nhập thủ công)' && customFailureReason.trim()
                    ? customFailureReason.trim()
                    : selectedFailureReason;
                  if (onFailAndReturnOrder) {
                    onFailAndReturnOrder(failingOrder.id, finalReason);
                  }
                  setFailingOrder(null);
                }}
                className="p-5 space-y-4 text-xs"
              >
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-700 block">
                    Chọn lý do bưu tá giao hàng không thành công:
                  </label>
                  <select
                    value={selectedFailureReason}
                    onChange={(e) => setSelectedFailureReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-rose-500"
                  >
                    {RETURN_REASONS.map((r, idx) => (
                      <option key={idx} value={r}>{r}</option>
                    ))}
                    <option value="Lý do khác (Nhập thủ công)">Lý do khác (Nhập thủ công)...</option>
                  </select>
                </div>

                {selectedFailureReason === 'Lý do khác (Nhập thủ công)' && (
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Nhập chi tiết lý do:</label>
                    <textarea
                      rows={2}
                      value={customFailureReason}
                      onChange={(e) => setCustomFailureReason(e.target.value)}
                      placeholder="Mô tả nguyên nhân giao hàng thất bại..."
                      className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-rose-500"
                      required
                    />
                  </div>
                )}

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] space-y-1">
                  <div className="font-bold flex items-center gap-1 text-amber-950">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Lưu ý quy trình chuyển hoàn:</span>
                  </div>
                  <p>Khi xác nhận, trạng thái đơn sẽ chuyển sang <strong>"Đang chuyển hoàn về kho"</strong>. Quá trình tự động hoàn tất sẽ dừng lại và kiện hàng bắt buộc phải được Dược sĩ kiểm nhận thủ công khi về tới kho.</p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setFailingOrder(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                  >
                    Hủy Bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Xác Nhận Chuyển Hoàn Về Kho</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: DƯỢC SĨ KIỂM NHẬN THỦ CÔNG HÀNG HOÀN VỀ KHO & NHẬP LẠI KHO GSP */}
        {inspectingReturnOrder && (
          <div 
            className="fixed inset-0 z-70 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in"
            onClick={() => setInspectingReturnOrder(null)}
          >
            <div 
              className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-amber-300 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                    <CheckSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base tracking-tight">
                      Kiểm Nhận Hàng Hoàn & Tái Nhập Kho GSP
                    </h3>
                    <p className="text-[11px] text-amber-100">
                      Mã đơn: <strong className="font-mono text-white selection:bg-amber-800">{inspectingReturnOrder.id}</strong> • Vận đơn: {inspectingReturnOrder.trackingNumber || 'Bưu cục'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setInspectingReturnOrder(null)}
                  className="p-1.5 rounded-full text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
                
                {/* Thông tin đơn hàng & Lý do bưu tá hoàn */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Khách hàng & SĐT:</span>
                    <strong className="text-slate-900 font-bold">{inspectingReturnOrder.customer?.fullName}</strong> ({inspectingReturnOrder.customer?.phone})
                    <div className="text-[11px] text-slate-500 mt-0.5">{inspectingReturnOrder.customer?.address}, {inspectingReturnOrder.customer?.province}</div>
                  </div>
                  <div>
                    <span className="text-rose-500 block text-[10px] uppercase font-bold">Lý do giao thất bại:</span>
                    <span className="font-bold text-rose-900">{inspectingReturnOrder.failureReason || 'Không liên lạc được người nhận'}</span>
                    <div className="text-[11px] text-slate-500 mt-0.5">Hãng bưu chính: <strong>{inspectingReturnOrder.shippingCarrierName || 'GHTK'}</strong></div>
                  </div>
                </div>

                {/* Danh sách sản phẩm trong kiện hoàn */}
                <div className="space-y-1.5">
                  <div className="font-bold text-slate-700 flex items-center justify-between">
                    <span>Sản phẩm trong kiện hàng hoàn ({inspectingReturnOrder.items?.length} loại):</span>
                    <span className="text-[11px] text-slate-500 font-normal">Trị giá: <strong className="text-emerald-700">{inspectingReturnOrder.grandTotal?.toLocaleString('vi-VN')}₫</strong></span>
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {inspectingReturnOrder.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="font-medium text-slate-800 truncate max-w-[70%]">
                          • {item.name} <strong className="text-emerald-700">(Số lượng hoàn: {item.quantity})</strong>
                        </span>
                        <span className="font-mono font-bold text-slate-700">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Biểu mẫu kiểm định Dược sĩ */}
                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 space-y-3.5">
                  <h4 className="font-black text-xs text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    <span>Biên bản kiểm tra an toàn Dược & Tem mác Bộ Y Tế</span>
                  </h4>

                  {/* 1. Tên Dược Sĩ */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Dược sĩ chuyên môn kiểm nhận:</label>
                    <input
                      type="text"
                      value={inspectionForm.pharmacistName}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, pharmacistName: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  {/* 2. Tình trạng tem seal */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-700 block">Tình trạng tem niêm phong & vỏ bao bì:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        inspectionForm.sealCondition === 'intact'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold ring-2 ring-emerald-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}>
                        <input
                          type="radio"
                          name="sealCondition"
                          value="intact"
                          checked={inspectionForm.sealCondition === 'intact'}
                          onChange={() => setInspectionForm({ ...inspectionForm, sealCondition: 'intact' })}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <div>
                          <div className="text-xs">Tem niêm phong nguyên vẹn 100%</div>
                          <div className="text-[10px] text-emerald-700 font-normal">Đủ tiêu chuẩn nhập lại kho bán</div>
                        </div>
                      </label>

                      <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        inspectionForm.sealCondition === 'damaged'
                          ? 'bg-rose-50 border-rose-500 text-rose-950 font-bold ring-2 ring-rose-200'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}>
                        <input
                          type="radio"
                          name="sealCondition"
                          value="damaged"
                          checked={inspectionForm.sealCondition === 'damaged'}
                          onChange={() => setInspectionForm({ ...inspectionForm, sealCondition: 'damaged' })}
                          className="text-rose-600 focus:ring-rose-500"
                        />
                        <div>
                          <div className="text-xs">Tem rách / Có dấu hiệu cạy mở</div>
                          <div className="text-[10px] text-rose-700 font-normal">Chuyển khu biệt trữ thanh lý hủy</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* 3. Tiêu chuẩn GSP & Tái nhập kho */}
                  <div className="space-y-2 pt-1 border-t border-amber-200/80">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inspectionForm.gspCompliant}
                        onChange={(e) => setInspectionForm({ ...inspectionForm, gspCompliant: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-semibold text-slate-800">
                        Nhiệt độ bảo quản và hạn dùng đảm bảo chuẩn GSP (Bảo quản mát 18-25°C, không ẩm mốc)
                      </span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={inspectionForm.restoreStock}
                        onChange={(e) => setInspectionForm({ ...inspectionForm, restoreStock: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-emerald-900">
                        Tự động cộng lại số lượng sản phẩm vào tồn kho MedXpressCare
                      </span>
                    </label>
                  </div>

                  {/* 4. Ghi chú kiểm nhận */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 block">Ghi chú kiểm tra Dược học:</label>
                    <textarea
                      rows={2}
                      value={inspectionForm.note}
                      onChange={(e) => setInspectionForm({ ...inspectionForm, note: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-amber-500"
                      placeholder="Ghi nhận tình trạng thực tế kiện hàng hoàn..."
                    />
                  </div>
                </div>

              </div>

              {/* Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setInspectingReturnOrder(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Đóng Lại
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onConfirmReturnedOrder) {
                      onConfirmReturnedOrder(inspectingReturnOrder.id, inspectionForm);
                    }
                    setInspectingReturnOrder(null);
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-xl text-xs shadow-md transition-all flex items-center gap-1.5 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Xác Nhận Đã Nhận Hàng Hoàn & Nhập Kho GSP</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
