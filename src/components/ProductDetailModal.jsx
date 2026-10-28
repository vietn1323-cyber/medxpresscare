import React, { useState } from 'react';
import { 
  X, ShieldCheck, Star, Truck, RefreshCw, FileCheck2, 
  ShoppingBag, CheckCircle2, AlertTriangle, PhoneCall, Heart, Plus, Minus,
  Sparkles, Award, Gift, Tag, ChevronRight
} from 'lucide-react';
import { ProductReviewsSection } from './ProductReviewsSection';
import { INITIAL_REVIEWS } from '../data/reviews';
import { CATEGORIES, cleanCountryName } from '../data/products';

export const ProductDetailModal = ({ 
  product, 
  onClose, 
  onAddToCart, 
  onBuyNow, 
  isWishlisted, 
  onToggleWishlist,
  onOpenVerifierWithReg,
  reviews = INITIAL_REVIEWS,
  onAddReview,
  onOpenVouchers
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedCombo, setSelectedCombo] = useState('combo3'); // 'single' | 'combo3' | 'combo6'

  if (!product) return null;

  const isDomestic = product.originType === 'domestic';

  // Tính giá theo gói liệu trình
  const comboPrice = selectedCombo === 'single'
    ? product.price
    : selectedCombo === 'combo3'
      ? Math.round(product.price * 3 * 0.9)
      : Math.round(product.price * 6 * 0.8);

  const comboOriginalPrice = selectedCombo === 'single'
    ? (product.originalPrice || product.price)
    : (product.price * (selectedCombo === 'combo3' ? 3 : 6));

  const savedAmount = Math.max(0, comboOriginalPrice - comboPrice);

  const handleAddToCartWithCombo = () => {
    const itemToAdd = {
      ...product,
      id: selectedCombo === 'single' ? product.id : `${product.id}-${selectedCombo}`,
      name: selectedCombo === 'single' ? product.name : `${product.name} (${selectedCombo === 'combo3' ? 'Liệu Trình 3 Hộp' : 'Liệu Trình 6 Hộp'})`,
      price: comboPrice,
      originalPrice: comboOriginalPrice,
      comboType: selectedCombo,
      comboTitle: selectedCombo === 'single' ? 'Gói 1 Hộp' : (selectedCombo === 'combo3' ? 'Combo 3 Hộp (-10%)' : 'Combo 6 Hộp (-20%)'),
      comboBoxes: selectedCombo === 'single' ? 1 : (selectedCombo === 'combo3' ? 3 : 6)
    };
    onAddToCart(itemToAdd, quantity);
  };

  const handleBuyNowWithCombo = () => {
    const itemToBuy = {
      ...product,
      id: selectedCombo === 'single' ? product.id : `${product.id}-${selectedCombo}`,
      name: selectedCombo === 'single' ? product.name : `${product.name} (${selectedCombo === 'combo3' ? 'Liệu Trình 3 Hộp' : 'Liệu Trình 6 Hộp'})`,
      price: comboPrice,
      originalPrice: comboOriginalPrice,
      comboType: selectedCombo,
      comboTitle: selectedCombo === 'single' ? 'Gói 1 Hộp' : (selectedCombo === 'combo3' ? 'Combo 3 Hộp (-10%)' : 'Combo 6 Hộp (-20%)'),
      comboBoxes: selectedCombo === 'single' ? 1 : (selectedCombo === 'combo3' ? 3 : 6)
    };
    onBuyNow(itemToBuy, quantity);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden my-6 border border-slate-100 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
              isDomestic ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'
            }`}>
              {isDomestic ? 'Hàng Nội Địa Uy Tín' : `Nhập Khẩu Chính Ngạch ${cleanCountryName(product.countryName)}`}
            </span>
            <span className="text-xs text-slate-500 font-mono hidden sm:inline">
              Mã: {product.id.toUpperCase()}
            </span>
          </div>

          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-7 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
            
            {/* Image Column */}
            <div className="md:col-span-5 space-y-4">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 pt-[90%] shadow-inner">
                <img
                  src={product.image}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {product.discountPercent > 0 && (
                  <span className="absolute top-3 left-3 bg-amber-500 text-white font-black text-xs px-2.5 py-1 rounded-lg shadow">
                    GIẢM {product.discountPercent}%
                  </span>
                )}
              </div>

              {/* Cam kết tem phụ & pháp lý */}
              <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/60 text-xs text-emerald-900 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Chứng Nhận Pháp Lý & Tem Phụ
                </div>
                <div className="text-[11px] space-y-1 text-slate-700">
                  <div>• <strong>Số ĐKSP:</strong> {product.regNumber}</div>
                  <div>• <strong>Nhà sản xuất:</strong> {product.manufacturer}</div>
                  <div>• <strong>Quy cách:</strong> {product.packaging}</div>
                </div>
                <button
                  onClick={() => onOpenVerifierWithReg(product.regNumber)}
                  className="mt-1 w-full flex items-center justify-center gap-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition-colors"
                >
                  <FileCheck2 className="w-3.5 h-3.5" />
                  Tra Cứu Giấy Phép Bộ Y Tế
                </button>
              </div>
            </div>

            {/* Information Column */}
            <div className="md:col-span-7 space-y-4">
              
              <div>
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
                  Thương hiệu: {product.brand}
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                  {product.name}
                </h2>
                
                {/* Rating & Sold count */}
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400 mr-1" />
                    <span>{product.rating}</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600">Đã bán <strong>{product.soldCount.toLocaleString('vi-VN')}</strong> hộp</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Còn hàng trong kho
                  </span>
                </div>

                {/* Health / Pathology Categories Tags */}
                {(() => {
                  const prodCats = Array.isArray(product.categories) && product.categories.length > 0
                    ? product.categories
                    : [product.category].filter(Boolean);
                  const matchedCats = CATEGORIES.filter(c => prodCats.includes(c.id));
                  if (matchedCats.length === 0) return null;
                  return (
                    <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                      <span className="text-[11px] font-bold text-slate-500">Nhóm công dụng:</span>
                      {matchedCats.map(c => (
                        <span key={c.id} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                          🏷️ {c.name}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* KHỐI KHUYẾN MẠI & ƯU ĐÃI ĐANG ÁP DỤNG */}
              <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-emerald-50/60 border border-amber-200/90 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xs shadow-2xs">
                      🎁
                    </div>
                    <span className="font-black text-xs sm:text-sm text-slate-950 uppercase tracking-wide">
                      Khuyến Mại & Ưu Đãi Đang Áp Dụng
                    </span>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full border border-amber-300">
                    Chính sách giá tốt nhất
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {/* Ưu đãi 1: Combo 3 Hộp */}
                  <div 
                    onClick={() => setSelectedCombo('combo3')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedCombo === 'combo3'
                        ? 'bg-emerald-100/80 border-emerald-500 text-emerald-950 font-semibold shadow-xs ring-1 ring-emerald-400'
                        : 'bg-white/90 border-amber-200/80 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 pr-2">
                      <span className="text-base">⭐</span>
                      <div>
                        <div className="font-extrabold text-xs text-emerald-900">
                          Khuyến Mại Combo Liệu Trình 3 Hộp:
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Giảm ngay <strong className="text-rose-600 font-bold">10%</strong> (Tiết kiệm {(Math.round(product.price * 3 * 0.1)).toLocaleString('vi-VN')}₫) + <strong className="text-emerald-700">Miễn phí Giao hàng nhanh</strong>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                      selectedCombo === 'combo3' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}>
                      {selectedCombo === 'combo3' ? '✓ Đang Chọn' : 'Chọn Combo'}
                    </span>
                  </div>

                  {/* Ưu đãi 2: Combo 6 Hộp */}
                  <div 
                    onClick={() => setSelectedCombo('combo6')}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedCombo === 'combo6'
                        ? 'bg-amber-100/80 border-amber-500 text-amber-950 font-semibold shadow-xs ring-1 ring-amber-400'
                        : 'bg-white/90 border-amber-200/80 hover:bg-white text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 pr-2">
                      <span className="text-base">👑</span>
                      <div>
                        <div className="font-extrabold text-xs text-amber-950">
                          Khuyến Mại Combo Chuyên Sâu 6 Hộp:
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5">
                          Giảm sốc <strong className="text-rose-600 font-bold">20%</strong> (Tiết kiệm {(Math.round(product.price * 6 * 0.2)).toLocaleString('vi-VN')}₫) + <strong className="text-emerald-700">Freeship Giao Nhanh</strong> + <strong className="text-amber-800">X2 Điểm Thưởng</strong>
                        </div>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg shrink-0 transition-colors ${
                      selectedCombo === 'combo6' ? 'bg-amber-600 text-white shadow-xs' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}>
                      {selectedCombo === 'combo6' ? '✓ Đang Chọn' : 'Chọn Combo'}
                    </span>
                  </div>

                  {/* Ưu đãi 3: Mã Voucher thanh toán */}
                  <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200/90 flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Tag className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>Mã giảm giá áp dụng:</span>
                      <span className="font-mono font-bold bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">FREESHIP</span>
                      <span className="font-mono font-bold bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded border border-emerald-200">MEDXPRESS50</span>
                      <span className="font-mono font-bold bg-blue-100 text-blue-900 px-1.5 py-0.5 rounded border border-blue-200">COMBO3HOP</span>
                    </div>
                    {onOpenVouchers && (
                      <button
                        type="button"
                        onClick={onOpenVouchers}
                        className="text-emerald-700 font-black hover:underline flex items-center gap-0.5 text-[11px] ml-auto"
                      >
                        <span>Săn Thêm Voucher</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Combo Liệu Trình Dược Học */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Chọn Liệu Trình Uống Khuyên Dùng:</span>
                  </h4>
                  {savedAmount > 0 && (
                    <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      Tiết kiệm {savedAmount.toLocaleString('vi-VN')}₫
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 text-left">
                  {/* Gói 1 hộp */}
                  <button
                    type="button"
                    onClick={() => setSelectedCombo('single')}
                    className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all relative ${
                      selectedCombo === 'single'
                        ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="font-extrabold text-xs text-slate-900">1 Hộp</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Dùng thử 15-30 ngày</div>
                    <div className="font-black text-xs text-emerald-700 mt-1.5">
                      {product.price.toLocaleString('vi-VN')}₫
                    </div>
                  </button>

                  {/* Combo 3 hộp */}
                  <button
                    type="button"
                    onClick={() => setSelectedCombo('combo3')}
                    className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all relative ${
                      selectedCombo === 'combo3'
                        ? 'border-emerald-600 bg-emerald-50 ring-2 ring-emerald-500/30'
                        : 'border-emerald-200 bg-white hover:border-emerald-300'
                    }`}
                  >
                    <span className="absolute -top-2.5 right-2 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      Khuyên Dùng ⭐
                    </span>
                    <div className="font-extrabold text-xs text-slate-900">Liệu Trình 3 Hộp</div>
                    <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Giảm 10% + Freeship</div>
                    <div className="font-black text-xs text-emerald-700 mt-1.5">
                      {Math.round(product.price * 3 * 0.9).toLocaleString('vi-VN')}₫
                    </div>
                  </button>

                  {/* Combo 6 hộp */}
                  <button
                    type="button"
                    onClick={() => setSelectedCombo('combo6')}
                    className={`p-2.5 sm:p-3 rounded-2xl border-2 text-left transition-all relative ${
                      selectedCombo === 'combo6'
                        ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/30'
                        : 'border-amber-200 bg-white hover:border-amber-300'
                    }`}
                  >
                    <span className="absolute -top-2.5 right-2 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      Tiết Kiệm Nhất 👑
                    </span>
                    <div className="font-extrabold text-xs text-slate-900">Chuyên Sâu 6 Hộp</div>
                    <div className="text-[10px] text-amber-800 font-bold mt-0.5">Giảm 20% + X2 Điểm</div>
                    <div className="font-black text-xs text-amber-700 mt-1.5">
                      {Math.round(product.price * 6 * 0.8).toLocaleString('vi-VN')}₫
                    </div>
                  </button>
                </div>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-baseline gap-3">
                <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                  {comboPrice.toLocaleString('vi-VN')}₫
                </span>
                {comboOriginalPrice > comboPrice && (
                  <span className="text-sm text-slate-400 line-through">
                    {comboOriginalPrice.toLocaleString('vi-VN')}₫
                  </span>
                )}
                <div className="text-xs text-slate-500 ml-auto font-medium flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{selectedCombo !== 'single' ? 'Miễn phí vận chuyển toàn quốc' : 'Đã bao gồm VAT'}</span>
                </div>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {product.shortDesc}
              </p>

              {/* Active Ingredients Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  🧪 Thành Phần & Hoạt Chất Chính:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {product.ingredients.map((ing, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100">
                      <span className="font-medium text-slate-700 truncate pr-2">{ing.name}</span>
                      <span className="font-bold text-emerald-700 shrink-0">{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key Benefits */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  🌿 Công Dụng Nổi Bật:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-600">
                  {product.benefits.map((b, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Usage & Contraindications */}
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-sky-50 text-sky-900 border border-sky-100">
                  <div className="font-bold mb-0.5 text-sky-800">📌 Hướng Dẫn Sử Dụng:</div>
                  <p>{product.usage}</p>
                </div>

                {product.contraindications && (
                  <div className="p-3 rounded-xl bg-amber-50 text-amber-900 border border-amber-200/80">
                    <div className="font-bold mb-0.5 flex items-center gap-1 text-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Lưu Ý & Chống Chỉ Định Từ Dược Sĩ:
                    </div>
                    <p>{product.contraindications}</p>
                  </div>
                )}
              </div>

              {/* Quantity and Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <div className="flex items-center border border-slate-200 rounded-xl bg-white overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 font-bold text-sm text-slate-800">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 hover:bg-slate-100 text-slate-600 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={handleAddToCartWithCombo}
                  className="flex-1 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Thêm Vào Giỏ</span>
                </button>

                <button
                  onClick={handleBuyNowWithCombo}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <span>Mua Ngay Hỏa Tốc</span>
                </button>

                <button
                  onClick={() => onToggleWishlist(product)}
                  className={`p-3 rounded-xl border transition-colors ${
                    isWishlisted 
                      ? 'bg-rose-50 border-rose-200 text-rose-600' 
                      : 'border-slate-200 text-slate-400 hover:text-rose-500'
                  }`}
                  title="Yêu thích"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                </button>
              </div>

            </div>

          </div>

          {/* Customer Reviews & UGC Section */}
          <ProductReviewsSection
            productId={product.id}
            productName={product.name}
            reviews={reviews}
            onAddReview={onAddReview}
          />
        </div>

        {/* Modal Footer Regulatory Disclaimer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center">
          * Thông báo y tế bắt buộc: <em>Thực phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh.</em> Hiệu quả phụ thuộc vào cơ địa từng người.
        </div>

      </div>
    </div>
  );
};
