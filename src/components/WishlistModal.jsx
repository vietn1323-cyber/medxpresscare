import React from 'react';
import { X, Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { cleanCountryName } from '../data/products';

export const WishlistModal = ({ 
  isOpen, 
  onClose, 
  wishlist, 
  onAddToCart, 
  onRemoveFromWishlist,
  onOpenDetail 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-6 max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="font-extrabold text-slate-900 text-base">
              Danh Sách TPCN Quan Tâm ({wishlist.length})
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {wishlist.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Heart className="w-12 h-12 mx-auto stroke-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-600">Chưa có sản phẩm nào trong danh sách yêu thích</p>
              <p className="text-xs text-slate-400 mt-1">Bấm biểu tượng trái tim ở từng sản phẩm để lưu lại theo dõi.</p>
            </div>
          ) : (
            wishlist.map((item) => {
              const isDomestic = item.originType === 'domestic';
              return (
                <div 
                  key={item.id}
                  className="p-3 rounded-2xl border border-slate-200 flex items-center gap-3 hover:border-slate-300 transition-colors"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0 cursor-pointer"
                    onClick={() => { onClose(); onOpenDetail(item); }}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold mb-0.5">
                      <span className={isDomestic ? 'text-rose-600' : 'text-blue-600'}>
                        {isDomestic ? 'Nội Địa Chuẩn GMP' : cleanCountryName(item.countryName)}
                      </span>
                    </div>

                    <h4 
                      onClick={() => { onClose(); onOpenDetail(item); }}
                      className="font-bold text-xs text-slate-900 truncate cursor-pointer hover:text-emerald-600"
                    >
                      {item.name}
                    </h4>

                    <div className="text-xs font-extrabold text-emerald-600 mt-1">
                      {item.price.toLocaleString('vi-VN')}₫
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { onAddToCart(item, 1); onRemoveFromWishlist(item.id); }}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Thêm giỏ</span>
                    </button>

                    <button
                      onClick={() => onRemoveFromWishlist(item.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Xóa"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
