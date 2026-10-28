import React, { useState } from 'react';
import { ShoppingBag, ArrowRight, Sparkles, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';

/**
 * Sticky Cart Bar - Thanh giỏ hàng cố định & nổi giúp khách hàng dễ dàng theo dõi và thanh toán nhanh 1-chạm
 */
export const StickyCart = ({
  cartItems = [],
  onOpenCart,
  onProceedCheckout,
  storeConfig = {},
  hidden = false
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  // Không hiển thị nếu giỏ hàng rỗng hoặc đang ở trạng thái ẩn (mở modal checkout, cart drawer, admin)
  if (hidden || !Array.isArray(cartItems) || cartItems.length === 0) {
    return null;
  }

  const totalQuantity = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
  const subtotal = cartItems.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 1)), 0);
  const freeShippingThreshold = Number(storeConfig?.freeShipThreshold || storeConfig?.freeShippingThreshold || 500000);
  const isFreeShip = subtotal >= freeShippingThreshold;
  const amountNeededForFreeShip = Math.max(0, freeShippingThreshold - subtotal);

  // Lấy 3 sản phẩm gần nhất trong giỏ để hiển thị thumbnail
  const recentItems = cartItems.slice(-3).reverse();

  // Chế độ thu nhỏ (Minimized Floating Pill)
  if (isMinimized) {
    return (
      <aside aria-label="Giỏ hàng đã thu nhỏ" className="fixed bottom-3 sm:bottom-5 right-4 sm:right-6 z-40 animate-in fade-in zoom-in-95">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-slate-900/95 hover:bg-slate-900 text-white shadow-2xl border border-slate-700/80 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
          title="Mở rộng giỏ hàng"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
              {totalQuantity > 99 ? '99+' : totalQuantity}
            </span>
          </div>
          <div className="text-left hidden xs:block">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Giỏ hàng</div>
            <div className="text-xs font-black text-emerald-400 font-mono">{subtotal.toLocaleString('vi-VN')}₫</div>
          </div>
          <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
        </button>
      </aside>
    );
  }

  // Chế độ đầy đủ (Full Sticky Floating Bar)
  return (
    <aside aria-label="Thanh giỏ hàng cố định" className="fixed bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="relative bg-slate-900/95 text-white backdrop-blur-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-700/70 p-2.5 sm:p-3.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4 ring-1 ring-white/10">
        
        {/* Nút thu nhỏ ở góc trên phải cho mobile */}
        <button
          type="button"
          onClick={() => setIsMinimized(true)}
          className="absolute -top-2.5 right-3 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white p-1 rounded-full border border-slate-600 shadow-md transition-all cursor-pointer"
          title="Thu nhỏ thanh giỏ hàng"
        >
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* THÔNG TIN SẢN PHẨM & TỔNG TIỀN */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Icon Giỏ hàng kèm badge số lượng */}
          <div 
            onClick={onOpenCart}
            className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 cursor-pointer hover:border-emerald-400 transition-colors"
            title="Xem chi tiết giỏ hàng"
          >
            <ShoppingBag className="w-5 h-5 text-emerald-400" />
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
              {totalQuantity > 99 ? '99+' : totalQuantity}
            </span>
          </div>

          {/* Thumbnails 3 sản phẩm gần nhất (Ẩn trên màn hình quá nhỏ) */}
          <div className="hidden md:flex items-center -space-x-2 shrink-0">
            {recentItems.map((item, idx) => (
              <img
                key={item.id || idx}
                src={item.image || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop&q=80'}
                alt={item.name}
                className="w-8 h-8 rounded-xl object-cover border-2 border-slate-900 shadow-xs bg-white"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&auto=format&fit=crop&q=80';
                }}
              />
            ))}
          </div>

          {/* Chi tiết Giá & Số lượng */}
          <div className="min-w-0 flex-1 sm:flex-initial">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400">Tạm tính ({totalQuantity} món):</span>
              <span className="text-sm sm:text-base font-black text-emerald-400 font-mono tracking-tight">
                {subtotal.toLocaleString('vi-VN')}₫
              </span>
            </div>

            {/* Thông báo Freeship */}
            <div className="text-[10px] flex items-center gap-1 mt-0.5">
              {isFreeShip ? (
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Đủ điều kiện <strong>Freeship toàn quốc!</strong></span>
                </span>
              ) : (
                <span className="text-amber-300 font-medium truncate">
                  Mua thêm <strong className="font-mono">{amountNeededForFreeShip.toLocaleString('vi-VN')}₫</strong> để được Freeship
                </span>
              )}
            </div>
          </div>
        </div>

        {/* NÚT THAO TÁC: XEM GIỎ & THANH TOÁN NGAY */}
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
          {/* Nút Xem Giỏ Hàng */}
          <button
            type="button"
            onClick={onOpenCart}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-all border border-slate-700/80 cursor-pointer whitespace-nowrap"
          >
            Xem Giỏ
          </button>

          {/* Nút Thanh Toán Ngay - 1 Chạm */}
          <button
            type="button"
            onClick={onProceedCheckout}
            className="flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-700/40 transition-all cursor-pointer whitespace-nowrap group"
          >
            <span>Thanh Toán Ngay</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

      </div>
    </aside>
  );
};
