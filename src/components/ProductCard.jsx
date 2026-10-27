import React from 'react';
import { 
  Star, ShoppingBag, Eye, Heart, ShieldCheck, 
  CheckCircle2, Sparkles, Zap, Flame 
} from 'lucide-react';
import { CATEGORIES } from '../data/products';

export const ProductCard = ({ 
  product, 
  onAddToCart, 
  onOpenDetail, 
  isWishlisted, 
  onToggleWishlist 
}) => {
  const isDomestic = product.originType === 'domestic';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 hover:border-emerald-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* 1. Header Badges: Origin & Flash Sale */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10 pointer-events-none">
        {/* Origin Badge */}
        <div 
          className={`pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-sm backdrop-blur-md ${
            isDomestic
              ? 'bg-rose-600/90 text-white'
              : 'bg-blue-600/90 text-white'
          }`}
        >
          <span>{product.flag}</span>
          <span>{isDomestic ? 'Nội Địa Chuẩn GMP' : `Nhập Khẩu ${product.countryName}`}</span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product);
          }}
          className={`pointer-events-auto p-1.5 rounded-full backdrop-blur-md transition-all shadow-sm ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>
      </div>

      {/* 2. Product Image Showcase */}
      <div 
        onClick={() => onOpenDetail(product)} 
        className="relative pt-[80%] overflow-hidden bg-slate-50 cursor-pointer"
      >
        <img
          src={product.image}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount Badge if available */}
        {product.discountPercent > 0 && (
          <div className="absolute bottom-2.5 left-2.5 bg-amber-500 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow">
            -{product.discountPercent}%
          </div>
        )}

        <div className="absolute bottom-2.5 right-2.5 bg-emerald-950/85 backdrop-blur-xs text-emerald-300 text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow border border-emerald-500/30 flex items-center gap-1">
          <span>🎁 Combo 3h -10%</span>
          <span className="text-emerald-500">•</span>
          <span className="text-amber-300">6h -20%</span>
        </div>

        {/* Quick View Button overlay on hover */}
        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(product);
            }}
            className="flex items-center gap-1.5 bg-white/95 hover:bg-white text-slate-800 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            Xem Chi Tiết
          </button>
        </div>
      </div>

      {/* 3. Product Body Information */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Brand & Reg number */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span className="font-semibold text-emerald-700 truncate max-w-[65%]">
              {product.brand}
            </span>
            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-mono">
              {product.packaging}
            </span>
          </div>

          {/* Product Name */}
          <h3 
            onClick={() => onOpenDetail(product)}
            className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-emerald-600 cursor-pointer transition-colors mb-2 min-h-[2.5rem]"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Health Category Tags */}
          {(() => {
            const prodCats = Array.isArray(product.categories) && product.categories.length > 0
              ? product.categories
              : [product.category].filter(Boolean);
            const matchedCats = CATEGORIES.filter(c => prodCats.includes(c.id));
            if (matchedCats.length === 0) return null;
            return (
              <div className="flex flex-wrap items-center gap-1 mb-2">
                {matchedCats.slice(0, 2).map(c => (
                  <span key={c.id} className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.5 rounded-md truncate max-w-[130px]">
                    {c.name}
                  </span>
                ))}
                {matchedCats.length > 2 && (
                  <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                    +{matchedCats.length - 2}
                  </span>
                )}
              </div>
            );
          })()}

          {/* Key Ingredient Highlight Pill */}
          {product.ingredients && product.ingredients[0] && (
            <div className="mb-3">
              <span className="inline-block text-[11px] font-medium bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-100 truncate max-w-full">
                ✨ {product.ingredients[0].name} ({product.ingredients[0].amount})
              </span>
            </div>
          )}

          {/* Social Proof: Stars & Sold count */}
          <div className="flex items-center gap-2 text-xs mb-3">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-bold ml-1 text-slate-800">{product.rating}</span>
            </div>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500 text-[11px]">
              Đã bán {product.soldCount > 1000 ? `${(product.soldCount / 1000).toFixed(1)}k` : product.soldCount}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] text-emerald-600 font-medium">
              Chính hãng 100%
            </span>
          </div>
        </div>

        {/* 4. Price & Action Button */}
        <div className="pt-3 border-t border-slate-100 mt-2">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-base sm:text-lg font-extrabold text-emerald-600">
              {product.price.toLocaleString('vi-VN')}₫
            </span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-slate-400 line-through">
                {product.originalPrice.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-2">
            <button
              onClick={() => onOpenDetail(product)}
              className="col-span-2 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Chi tiết</span>
            </button>

            <button
              onClick={() => onAddToCart(product)}
              className="col-span-3 py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm hover:shadow-md shadow-emerald-600/30"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Thêm Giỏ</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
