import React, { useState } from 'react';
import { 
  X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, 
  Truck, ShieldCheck, Tag, CheckCircle2, Award, Sparkles, Gift, ChevronRight 
} from 'lucide-react';
import { DEFAULT_VOUCHERS, calculateVoucherDiscount } from '../data/vouchers';
import { PRODUCTS, cleanCountryName } from '../data/products';

const FREESHIP_THRESHOLD = 500000;
const TIER_1_THRESHOLD = 300000;
const TIER_3_THRESHOLD = 1000000;

export const CartDrawer = ({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQuantity, 
  onRemoveItem, 
  onProceedCheckout,
  appliedVoucher,
  setAppliedVoucher,
  customer,
  vouchers = DEFAULT_VOUCHERS,
  onOpenVoucherModal,
  onOpenAuthModal,
  onAddToCart
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponRequiresAuth, setCouponRequiresAuth] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const remainingForFreeship = Math.max(0, FREESHIP_THRESHOLD - subtotal);
  const freeshipProgress = Math.min(100, (subtotal / FREESHIP_THRESHOLD) * 100);

  // Tìm object voucher đã áp dụng
  const currentVoucherObj = vouchers.find(v => v.code === (appliedVoucher?.code || appliedVoucher));
  
  // Tính discount theo voucher
  let discountAmount = 0;
  let shippingDiscount = 0;
  let giftItem = null;

  if (currentVoucherObj) {
    const res = calculateVoucherDiscount(currentVoucherObj, subtotal, 25000, cartItems, customer);
    if (res.isValid) {
      discountAmount = res.discountAmount;
      shippingDiscount = res.shippingDiscount;
      if (res.isGift && res.giftItem) {
        giftItem = res.giftItem;
      }
    }
  }

  const baseShippingFee = 25000;
  const isFreeShip = subtotal >= FREESHIP_THRESHOLD || shippingDiscount > 0;
  const actualShippingFee = isFreeShip ? 0 : baseShippingFee;
  const grandTotal = Math.max(0, subtotal - discountAmount + actualShippingFee);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (!clean) return;

    const matched = vouchers.find(v => v.code === clean);
    if (matched) {
      const check = calculateVoucherDiscount(matched, subtotal, baseShippingFee, cartItems, customer);
      if (check.isValid) {
        setAppliedVoucher(clean);
        setCouponError('');
        setCouponRequiresAuth(false);
        setCouponSuccess(check.reason);
      } else {
        setCouponError(check.reason);
        setCouponRequiresAuth(Boolean(check.requiresAuth));
        setCouponSuccess('');
      }
    } else {
      setCouponError('Mã ưu đãi không hợp lệ hoặc đã hết hạn.');
      setCouponRequiresAuth(false);
      setCouponSuccess('');
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setCouponSuccess('');
    setCouponError('');
    setCouponRequiresAuth(false);
  };

  // Các sản phẩm gợi ý thêm vào giỏ nhanh để đạt Freeship
  const quickAddSuggestions = PRODUCTS.filter(p => 
    p.price <= 200000 && !cartItems.some(ci => ci.id === p.id)
  ).slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Giỏ Hàng MedXpress ({cartItems.reduce((a, b) => a + b.quantity, 0)})
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Thanh Tiến Độ Miễn Phí Vận Chuyển Đa Tầng (Multi-Tier Freeship Bar) */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border-b border-emerald-100 text-xs">
          <div className="flex items-center justify-between font-bold text-emerald-950 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className={`w-4 h-4 ${remainingForFreeship === 0 ? 'text-emerald-600 animate-bounce' : 'text-slate-500'}`} />
              {remainingForFreeship === 0 ? (
                <span className="text-emerald-700 font-black flex items-center gap-1">
                  🎉 CHÚC MỪNG! BẠN ĐÃ ĐƯỢC FREESHIP 100%
                </span>
              ) : (
                <span>Mua thêm <strong className="text-emerald-700 font-extrabold">{remainingForFreeship.toLocaleString('vi-VN')}₫</strong> để freeship</span>
              )}
            </span>
            <span className="font-mono text-emerald-800 font-black">{Math.round(freeshipProgress)}%</span>
          </div>

          <div className="w-full h-2.5 bg-slate-200/90 rounded-full overflow-hidden p-0.5 relative">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                remainingForFreeship === 0 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 animate-pulse' 
                  : 'bg-emerald-600'
              }`} 
              style={{ width: `${freeshipProgress}%` }}
            />
          </div>

          {/* 3 Mốc thưởng trực quan */}
          <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 font-semibold">
            <span className={subtotal >= TIER_1_THRESHOLD ? 'text-emerald-700 font-bold' : ''}>
              • 300k (Voucher 20k)
            </span>
            <span className={subtotal >= FREESHIP_THRESHOLD ? 'text-emerald-700 font-bold' : ''}>
              • 500k (Freeship Giao Nhanh)
            </span>
            <span className={subtotal >= TIER_3_THRESHOLD ? 'text-emerald-700 font-bold' : ''}>
              • 1.000k (Tặng quà Dược sĩ)
            </span>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-slate-700 text-sm">Giỏ hàng của quý khách đang trống</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Hãy lựa chọn các sản phẩm Thực phẩm chức năng nội địa GMP-WHO và nhập khẩu chính ngạch để chăm sóc sức khỏe.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
              >
                Khám Phá Sản Phẩm Ngay
              </button>
            </div>
          ) : (
            <>
              {cartItems.map((item) => {
                const isDomestic = item.originType === 'domestic';
                return (
                  <div 
                    key={item.id}
                    className="flex gap-3 p-3 rounded-2xl border border-slate-200/90 bg-white hover:border-emerald-300 transition-all shadow-2xs"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-[10px] font-bold mb-0.5">
                        <span className={isDomestic ? 'text-rose-600' : 'text-blue-600'}>
                          {isDomestic ? 'Nội Địa Chuẩn GMP' : cleanCountryName(item.countryName)}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-500 truncate">{item.brand}</span>
                      </div>

                      <h4 className="font-bold text-xs text-slate-900 truncate leading-snug">
                        {item.name}
                      </h4>

                      <div className="text-xs font-black text-emerald-700 mt-1">
                        {item.price.toLocaleString('vi-VN')}₫
                      </div>

                      {/* Quantity Selector and Delete */}
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 overflow-hidden">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-slate-800">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-slate-200 text-slate-600 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 transition-colors"
                          title="Xóa khỏi giỏ"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Quà Tặng Kèm Đơn Hàng (Nếu đang áp dụng Voucher Tặng Quà) */}
              {giftItem && (
                <div className="flex gap-3 p-3 rounded-2xl border-2 border-rose-300 bg-gradient-to-r from-rose-50 via-amber-50/40 to-rose-50 shadow-2xs items-center animate-in fade-in">
                  <img
                    src={giftItem.image}
                    alt={giftItem.name}
                    className="w-14 h-14 rounded-xl object-cover border border-rose-200 shrink-0 shadow-2xs"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="bg-rose-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                      QUÀ TẶNG KÈM THEO ĐƠN (0₫)
                    </span>
                    <h4 className="font-extrabold text-xs text-rose-950 truncate mt-0.5">
                      {giftItem.name}
                    </h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <span className="line-through text-slate-400">
                        {giftItem.value > 0 ? `${giftItem.value.toLocaleString('vi-VN')}₫` : ''}
                      </span>
                      <span className="font-extrabold text-emerald-700">Miễn Phí 100%</span>
                    </div>
                  </div>
                  <span className="text-xl">🎁</span>
                </div>
              )}

              {/* Gợi ý mua thêm để đạt Freeship nếu còn thiếu dưới 200k */}
              {remainingForFreeship > 0 && remainingForFreeship <= 250000 && quickAddSuggestions.length > 0 && (
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200/80 space-y-2 mt-2">
                  <div className="text-[11px] font-extrabold text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Gợi ý mua thêm để nhận ngay MIỄN PHÍ VẬN CHUYỂN:</span>
                  </div>
                  <div className="space-y-1.5">
                    {quickAddSuggestions.map(sug => (
                      <div key={sug.id} className="flex items-center justify-between bg-white p-2 rounded-xl border border-amber-100 text-xs">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <img src={sug.image} alt={sug.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0">
                            <h6 className="font-bold text-slate-800 truncate text-[11px]">{sug.name}</h6>
                            <span className="text-emerald-700 font-black text-[11px]">{sug.price.toLocaleString('vi-VN')}₫</span>
                          </div>
                        </div>
                        <button
                          onClick={() => onAddToCart && onAddToCart(sug, 1)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shrink-0 transition-colors"
                        >
                          + Thêm
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Calculation & Checkout */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/95 space-y-3 shrink-0">
            
            {/* Voucher Center Bar + Input form */}
            <div className="space-y-2 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" /> Mã Ưu Đãi & Voucher
                </span>
                {onOpenVoucherModal && (
                  <button
                    onClick={onOpenVoucherModal}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
                  >
                    <span>Kho Voucher ({vouchers.filter(v => v.enabled).length})</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {appliedVoucher ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-mono font-bold text-emerald-900">{appliedVoucher?.code || appliedVoucher}</span>
                      <p className="text-[10px] text-emerald-700">
                        {currentVoucherObj ? currentVoucherObj.title : 'Đã áp dụng mã ưu đãi thành công'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveVoucher}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    Gỡ bỏ
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nhập mã (VD: MEDXPRESS50, FREESHIP)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs uppercase font-mono font-bold focus:outline-none focus:border-emerald-500 focus:bg-white"
                    />
                    <button
                      type="submit"
                      disabled={!couponCode.trim()}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl transition-all shrink-0"
                    >
                      Áp Dụng
                    </button>
                  </div>
                  {couponError && (
                    <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-800 space-y-1">
                      <div className="flex items-start justify-between gap-1.5 flex-wrap">
                        <span>⚠️ {couponError}</span>
                        {couponRequiresAuth && onOpenAuthModal && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenAuthModal();
                            }}
                            className="font-extrabold text-emerald-700 hover:text-emerald-900 bg-white hover:bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-300 shadow-2xs transition-colors shrink-0 cursor-pointer text-[10px] inline-flex items-center gap-1"
                          >
                            <span>Đăng ký / Đăng nhập ngay</span>
                            <span>→</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  {couponSuccess && <p className="text-[11px] text-emerald-700 font-semibold">{couponSuccess}</p>}
                </form>
              )}
            </div>

            {/* Calculations breakdown */}
            <div className="text-xs space-y-1.5 text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-semibold text-slate-900">{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-rose-600 font-bold">
                  <span>Giảm giá Voucher:</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}

              {giftItem && (
                <div className="flex justify-between items-center text-rose-700 font-extrabold bg-rose-50 p-2 rounded-xl border border-rose-200 text-xs">
                  <span className="flex items-center gap-1">
                    <span>🎁 Quà tặng kèm đơn:</span>
                  </span>
                  <span className="truncate max-w-[160px] text-right font-black">
                    {giftItem.name} (0₫)
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>Phí vận chuyển (Giao nhanh):</span>
                <span>
                  {actualShippingFee === 0 ? (
                    <strong className="text-emerald-600 font-bold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> MIỄN PHÍ
                    </strong>
                  ) : (
                    `${actualShippingFee.toLocaleString('vi-VN')}₫`
                  )}
                </span>
              </div>

              {/* Điểm thưởng tích lũy dự kiến (100k = 1đ) */}
              <div className="flex justify-between items-center bg-amber-50 p-2 rounded-xl border border-amber-200 text-amber-900 font-semibold text-[11px] my-1">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  <span>Tích điểm thành viên:</span>
                </span>
                <strong className="text-emerald-700 font-bold">
                  +{Math.floor(subtotal / 100000)} điểm (+{(Math.floor(subtotal / 100000) * 1000).toLocaleString('vi-VN')}₫)
                </strong>
              </div>

              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Tổng thanh toán:</span>
                <span className="text-emerald-700 text-lg font-black">{grandTotal.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => { onClose(); onProceedCheckout(); }}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <span>Tiến Hành Đặt Hàng Ngay</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              100% Chính Hãng • Kiểm Tra Hàng Trước Khi Thanh Toán
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
