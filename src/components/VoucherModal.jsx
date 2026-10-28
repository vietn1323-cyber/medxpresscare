import React, { useState } from 'react';
import { 
  X, Tag, Check, Copy, Sparkles, Clock, AlertCircle, 
  ShoppingBag, ArrowRight, ShieldCheck, Gift, CheckCircle2 
} from 'lucide-react';
import { DEFAULT_VOUCHERS, calculateVoucherDiscount } from '../data/vouchers';

export const VoucherModal = ({ 
  isOpen, 
  onClose, 
  vouchers = DEFAULT_VOUCHERS, 
  subtotal = 0, 
  onApplyVoucher, 
  appliedVoucherCode = '',
  customer = null,
  cartItems = [],
  onOpenAuthModal
}) => {
  const [copiedCode, setCopiedCode] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'shipping' | 'fixed' | 'percent'

  if (!isOpen) return null;

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const activeVouchers = vouchers.filter(v => v.enabled);
  const filteredVouchers = activeVouchers.filter(v => {
    if (filterType === 'all') return true;
    if (filterType === 'gift') return v.discountType === 'gift';
    if (filterType === 'combo') return v.code.includes('COMBO') || v.title.toLowerCase().includes('combo');
    if (filterType === 'shipping') return v.discountType === 'shipping';
    if (filterType === 'fixed') return v.discountType === 'fixed';
    if (filterType === 'percent') return v.discountType === 'percent';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh] my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 sm:p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/30 flex items-center justify-center text-amber-300">
              <Gift className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-extrabold text-amber-300">
                  Kho Voucher & Mã Khuyến Mãi
                </span>
                <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Tiết Kiệm Tối Đa
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black mt-0.5">
                Sưu Tầm Ưu Đãi Chăm Sóc Sức Khỏe MedXpress
              </h2>
            </div>
          </div>

          {/* Subtotal reminder */}
          <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-emerald-100">
            <span>Tạm tính giỏ hàng hiện tại:</span>
            <strong className="text-amber-300 text-sm font-black">{subtotal.toLocaleString('vi-VN')}₫</strong>
          </div>
        </div>

        {/* Banner Khuyến Mại Combo Liệu Trình 3 & 6 Hộp */}
        <div className="mx-4 sm:mx-6 mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/10 to-teal-500/15 border border-amber-300 flex items-start gap-3 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center shrink-0 shadow-xs text-lg">
            👑
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full border border-amber-300">
                Chính Sách Khuyến Mại Combo Liệu Trình
              </span>
              <span className="text-xs font-bold text-emerald-800">Tự động áp dụng khi chọn 3 hoặc 6 hộp</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-xs">
              <div className="p-2 rounded-xl bg-white/80 border border-emerald-200 text-emerald-950">
                <strong className="text-emerald-800">⭐ Combo 3 Hộp:</strong> Giảm ngay <strong>10%</strong> + <strong>Miễn phí Giao hàng nhanh</strong> toàn quốc.
              </div>
              <div className="p-2 rounded-xl bg-white/80 border border-amber-200 text-amber-950">
                <strong className="text-amber-800">👑 Combo 6 Hộp:</strong> Giảm kịch sàn <strong>20%</strong> + <strong>Freeship Giao Nhanh</strong> + <strong>X2 Điểm Thưởng</strong> thành viên.
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-3 bg-slate-50 border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'Tất cả mã' },
            { id: 'gift', label: '🎁 Quà Tặng Kèm' },
            { id: 'combo', label: '🔥 Combo 3 & 6 Hộp' },
            { id: 'shipping', label: '🚚 Miễn phí vận chuyển' },
            { id: 'fixed', label: '💵 Giảm tiền mặt' },
            { id: 'percent', label: '🏷️ Giảm theo %' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                filterType === tab.id
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Vouchers List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3.5">
          {filteredVouchers.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Tag className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">Chưa có mã ưu đãi trong danh mục này</p>
            </div>
          ) : (
            filteredVouchers.map((voucher) => {
              const check = calculateVoucherDiscount(voucher, subtotal, 25000, cartItems, customer);
              const isEligible = check.isValid;
              const isApplied = appliedVoucherCode === voucher.code;
              const requiresAuth = Boolean(check.requiresAuth);

              return (
                <div 
                  key={voucher.id}
                  className={`p-4 rounded-2xl border-2 transition-all relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isApplied 
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                      : isEligible 
                        ? 'border-slate-200 bg-white hover:border-emerald-400 hover:shadow-xs' 
                        : 'border-slate-200/60 bg-slate-50/60 opacity-80'
                  }`}
                >
                  {/* Left coupon ticket styling */}
                  <div className="space-y-1.5 flex-1 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-xs sm:text-sm px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300">
                        {voucher.code}
                      </span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {voucher.badgeText}
                      </span>
                      {(voucher.target_customer === 'new' || voucher.targetCustomer === 'new') && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                          👶 Khách mới
                        </span>
                      )}
                      {(voucher.target_customer === 'vip' || voucher.targetCustomer === 'vip') && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                          👑 Khách VIP
                        </span>
                      )}
                      {isApplied && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Đang áp dụng
                        </span>
                      )}
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-900">
                      {voucher.title}
                    </h4>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {voucher.description}
                    </p>

                    {/* Hiển thị chi tiết Quà Tặng nếu là loại voucher Tặng Quà */}
                    {voucher.discountType === 'gift' && (
                      <div className="flex items-center gap-2.5 p-2 rounded-xl bg-gradient-to-r from-rose-50 to-amber-50/50 border border-rose-200 text-xs mt-1 shadow-2xs">
                        {voucher.giftImage ? (
                          <img 
                            src={voucher.giftImage} 
                            alt={voucher.giftName || 'Quà tặng'} 
                            className="w-10 h-10 rounded-lg object-cover border border-rose-200 shrink-0 shadow-2xs" 
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-black shrink-0 text-base">
                            🎁
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <span className="font-extrabold text-rose-900 block truncate">
                            🎁 {voucher.giftName || 'Quà tặng kèm theo đơn'}
                          </span>
                          <span className="text-[10px] text-rose-600 font-semibold">
                            Trị giá: {Number(voucher.giftValue || 0).toLocaleString('vi-VN')}₫ (Miễn phí 0₫)
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        HSD: {voucher.expiryDate || 'Vô thời hạn'}
                      </span>
                      <span>•</span>
                      <span>Đơn tối thiểu: <strong>{(voucher.minOrderValue || 0).toLocaleString('vi-VN')}₫</strong></span>
                    </div>

                    {!isEligible && (
                      <p className="text-[11px] text-rose-600 font-semibold pt-0.5">
                        ⚠️ {check.reason}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    <button
                      onClick={() => handleCopy(voucher.code)}
                      className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Sao chép mã"
                    >
                      {copiedCode === voucher.code ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Đã chép</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>

                    {requiresAuth && onOpenAuthModal ? (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenAuthModal();
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-black bg-teal-600 hover:bg-teal-700 text-white transition-all shadow-xs cursor-pointer inline-flex items-center gap-1 shrink-0"
                      >
                        <span>Đăng nhập ngay</span>
                        <span>→</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (onApplyVoucher && isEligible) {
                            onApplyVoucher(voucher.code);
                            onClose();
                          }
                        }}
                        disabled={!isEligible || isApplied}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all shadow-xs ${
                          isApplied 
                            ? 'bg-emerald-700 text-white cursor-default'
                            : isEligible 
                              ? 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95' 
                              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isApplied ? (voucher.discountType === 'gift' ? 'Đã Nhận Quà' : 'Đang Dùng') : isEligible ? (voucher.discountType === 'gift' ? 'Nhận Quà Ngay' : 'Áp Dụng Ngay') : 'Chưa Đủ Đk'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Mỗi đơn hàng được áp dụng 01 mã ưu đãi tốt nhất</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs"
          >
            Đóng
          </button>
        </div>

      </div>
    </div>
  );
};
