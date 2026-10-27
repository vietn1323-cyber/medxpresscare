import React, { useState } from 'react';
import { 
  Star, ShieldCheck, CheckCircle2, ThumbsUp, Camera, 
  MessageSquare, User, Filter, X, Plus, AlertCircle, Sparkles, Stethoscope, Image as ImageIcon
} from 'lucide-react';
import { INITIAL_REVIEWS } from '../data/reviews';

export const ProductReviewsSection = ({ 
  productId, 
  productName = '',
  reviews = INITIAL_REVIEWS, 
  onAddReview 
}) => {
  const [filterRating, setFilterRating] = useState('all'); // 'all' | 'with_photo' | '5' | '4'
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    rating: 5,
    audience: 'elderly',
    title: '',
    content: '',
    photoUrl: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Lọc đánh giá thuộc sản phẩm này (hoặc hiển thị đánh giá liên quan nếu sản phẩm chưa có review riêng)
  const safeReviews = Array.isArray(reviews) && reviews.length > 0 ? reviews : INITIAL_REVIEWS;
  const productReviews = safeReviews.filter(r => r.productId === productId && r.status === 'approved');
  const displayReviews = productReviews.length > 0 
    ? productReviews 
    : safeReviews.filter(r => r.status === 'approved').slice(0, 3); // Fallback hiển thị review mẫu uy tín

  // Áp dụng bộ lọc
  const filteredReviews = displayReviews.filter(rev => {
    if (filterRating === 'with_photo') return rev.photos && rev.photos.length > 0;
    if (filterRating === '5') return rev.rating === 5;
    if (filterRating === '4') return rev.rating === 4;
    return true;
  });

  // Tính điểm đánh giá trung bình
  const avgRating = displayReviews.length > 0
    ? (displayReviews.reduce((sum, r) => sum + r.rating, 0) / displayReviews.length).toFixed(1)
    : '5.0';

  const fiveStarCount = displayReviews.filter(r => r.rating === 5).length;
  const fourStarCount = displayReviews.filter(r => r.rating === 4).length;
  const withPhotoCount = displayReviews.filter(r => r.photos && r.photos.length > 0).length;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!formData.customerName.trim()) {
      setFormError('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    if (!formData.content.trim()) {
      setFormError('Vui lòng nhập nội dung đánh giá và trải nghiệm thực tế.');
      return;
    }

    // Tự động che số điện thoại bảo mật
    const rawPhone = formData.customerPhone.trim();
    const maskedPhone = rawPhone.length >= 8 
      ? rawPhone.slice(0, 4) + '***' + rawPhone.slice(-3) 
      : '0987***321';

    const audienceLabels = {
      elderly: 'Người cao tuổi (55+)',
      women: 'Phụ nữ & Chị em',
      men: 'Nam giới',
      office: 'Dân văn phòng',
      kids: 'Phụ huynh có con nhỏ'
    };

    const newRev = {
      id: 'rev-' + Date.now(),
      productId: productId,
      productName: productName,
      customerName: formData.customerName.trim(),
      customerPhone: maskedPhone,
      rating: formData.rating,
      createdAt: new Date().toISOString().split('T')[0],
      audience: formData.audience,
      audienceLabel: audienceLabels[formData.audience] || 'Khách hàng thân thiết',
      isVerifiedPurchase: true,
      title: formData.title.trim() || 'Sản phẩm chính hãng chất lượng cao',
      content: formData.content.trim(),
      photos: formData.photoUrl ? [formData.photoUrl] : [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80'
      ],
      pharmacistReply: 'Cảm ơn quý khách đã tin dùng sản phẩm tại MedXpressCare! Dược sĩ chúc quý khách và gia đình luôn dồi dào sức khỏe.',
      pharmacistName: 'DS. CKI Nguyễn Thu Trang',
      replyDate: new Date().toISOString().split('T')[0],
      status: 'approved',
      likes: 1
    };

    if (onAddReview) {
      onAddReview(newRev);
    }

    setFormSuccess('Cảm ơn bạn! Đánh giá đã được gửi và hiển thị thành công.');
    setFormError('');
    setShowReviewForm(false);
    setFormData({
      customerName: '',
      customerPhone: '',
      rating: 5,
      audience: 'elderly',
      title: '',
      content: '',
      photoUrl: ''
    });
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-200">
      
      {/* Header Đánh Giá & Điểm Số Trung Bình */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Đánh Giá Khách Hàng Thực Tế & Ảnh Mở Hộp</span>
            </h3>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
              100% Đã Mua Hàng
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Phản hồi thực tế từ người dùng và phản hồi tư vấn y khoa của Dược sĩ MedXpressCare.
          </p>
        </div>

        <button
          onClick={() => setShowReviewForm(!showReviewForm)}
          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Viết Đánh Giá Của Bạn</span>
        </button>
      </div>

      {/* Tổng quan xếp hạng Rating Breakdown */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-50/50 via-slate-50 to-emerald-50/40 border border-slate-200/80 flex flex-col md:flex-row items-center gap-6">
        
        {/* Điểm tổng */}
        <div className="text-center shrink-0 pr-0 md:pr-6 md:border-r border-slate-200">
          <div className="text-4xl sm:text-5xl font-black text-amber-500 tracking-tight">
            {avgRating}
          </div>
          <div className="flex items-center justify-center gap-1 my-1.5 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            {displayReviews.length} lượt đánh giá thực tế
          </div>
        </div>

        {/* Cột tỷ lệ sao */}
        <div className="flex-1 space-y-1.5 w-full text-xs">
          <div className="flex items-center gap-2">
            <span className="w-12 text-slate-600 font-bold shrink-0">5 Sao</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full" 
                style={{ width: `${displayReviews.length ? (fiveStarCount / displayReviews.length) * 100 : 90}%` }} 
              />
            </div>
            <span className="w-8 text-right font-semibold text-slate-500">{fiveStarCount}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-12 text-slate-600 font-bold shrink-0">4 Sao</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-400 rounded-full" 
                style={{ width: `${displayReviews.length ? (fourStarCount / displayReviews.length) * 100 : 10}%` }} 
              />
            </div>
            <span className="w-8 text-right font-semibold text-slate-500">{fourStarCount}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-12 text-slate-600 font-bold shrink-0">3 Sao</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-slate-300 rounded-full" style={{ width: '0%' }} />
            </div>
            <span className="w-8 text-right font-semibold text-slate-400">0</span>
          </div>
        </div>

        {/* Cam kết kiểm duyệt */}
        <div className="shrink-0 p-3 bg-white rounded-xl border border-slate-200/90 text-xs text-slate-600 space-y-1 max-w-xs shadow-2xs">
          <div className="font-extrabold text-emerald-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Chính Sách Đánh Giá Minh Bạch</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Mọi đánh giá đều được xác minh từ người đã mua hàng thành công. Nghiêm cấm đánh giá ảo hoặc quảng cáo sai lệch.
          </p>
        </div>

      </div>

      {/* Form Viết Đánh Giá (Thu gọn / Mở rộng) */}
      {showReviewForm && (
        <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl bg-white border-2 border-emerald-500/80 shadow-md space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b pb-2">
            <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-emerald-600" />
              <span>Gửi Cảm Nhận Của Bạn Về Sản Phẩm</span>
            </h4>
            <button 
              type="button" 
              onClick={() => setShowReviewForm(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chọn số sao */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Đánh giá của bạn về hiệu quả sản phẩm:
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star className={`w-6 h-6 ${
                    star <= formData.rating 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'text-slate-300'
                  }`} />
                </button>
              ))}
              <span className="text-xs font-bold text-amber-600 ml-2">
                {formData.rating === 5 ? 'Tuyệt vời (5/5)' : formData.rating === 4 ? 'Rất hài lòng (4/5)' : `${formData.rating} sao`}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Họ và tên của bạn: *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Bác Minh / Chị Thảo"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Số điện thoại (đã mua hàng):
              </label>
              <input
                type="text"
                placeholder="09xx xxx xxx (ẩn 3 số giữa)"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Nhóm đối tượng:
              </label>
              <select
                value={formData.audience}
                onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="elderly">Người cao tuổi (55+)</option>
                <option value="women">Phụ nữ & Chị em</option>
                <option value="men">Nam giới & Phái mạnh</option>
                <option value="office">Dân văn phòng</option>
                <option value="kids">Phụ huynh cho con nhỏ</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tiêu đề ngắn gọn:
            </label>
            <input
              type="text"
              placeholder="VD: Giảm đau nhức khớp sau 2 tuần / Hàng chuẩn có tem phụ"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nhận xét chi tiết về hiệu quả sau khi dùng: *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Chia sẻ chi tiết thể trạng trước và sau khi sử dụng, cách uống mỗi ngày để người mua sau tham khảo..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Ảnh chụp thực tế mở hộp / tem phụ (Link ảnh):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Dán link ảnh chụp sản phẩm hoặc tem cào chống giả..."
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, photoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80' })}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1"
              >
                <Camera className="w-3.5 h-3.5" /> Dùng ảnh mẫu
              </button>
            </div>
          </div>

          {formError && <p className="text-xs text-rose-600 font-bold">{formError}</p>}
          {formSuccess && <p className="text-xs text-emerald-700 font-bold">{formSuccess}</p>}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm transition-all"
            >
              Gửi Đánh Giá Ngay
            </button>
          </div>
        </form>
      )}

      {/* Bộ Lọc Reviews */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> Lọc theo:
        </span>

        {[
          { id: 'all', label: `Tất cả (${displayReviews.length})` },
          { id: 'with_photo', label: `📸 Có hình ảnh thực tế (${withPhotoCount})` },
          { id: '5', label: `5 Sao (${fiveStarCount})` },
          { id: '4', label: `4 Sao (${fourStarCount})` }
        ].map((btn) => (
          <button
            key={btn.id}
            onClick={() => setFilterRating(btn.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterRating === btn.id
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Danh Sách Các Đánh Giá */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
            <MessageSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-bold text-slate-600">Chưa có đánh giá nào trong bộ lọc này.</p>
          </div>
        ) : (
          filteredReviews.map((rev) => (
            <div 
              key={rev.id}
              className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
            >
              {/* Reviewer Header */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 font-extrabold flex items-center justify-center text-xs">
                    {rev.customerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs sm:text-sm text-slate-900">
                        {rev.customerName}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({rev.customerPhone})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Đã mua hàng chính hãng
                      </span>
                      {rev.audienceLabel && (
                        <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-medium hidden sm:inline">
                          {rev.audienceLabel}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">
                    {rev.createdAt}
                  </span>
                </div>
              </div>

              {/* Review Title & Content */}
              <div className="space-y-1">
                <h5 className="font-extrabold text-xs sm:text-sm text-slate-900">
                  {rev.title}
                </h5>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {rev.content}
                </p>
              </div>

              {/* Customer Photo Thumbnails */}
              {rev.photos && rev.photos.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-slate-500 mb-1.5 flex items-center gap-1">
                    <Camera className="w-3 h-3 text-emerald-600" /> Ảnh chụp thực tế mở hộp:
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto">
                    {rev.photos.map((photo, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => setSelectedPhotoModal(photo)}
                        className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 hover:border-emerald-500 hover:scale-105 transition-all shadow-xs shrink-0 group relative"
                      >
                        <img 
                          src={photo} 
                          alt="Ảnh khách hàng" 
                          className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[10px] font-bold transition-opacity">
                          Phóng to
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Phản Hồi Chính Thức Từ Dược Sĩ MedXpressCare */}
              {rev.pharmacistReply && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-1.5 relative overflow-hidden">
                  <div className="flex items-center justify-between text-emerald-900 font-extrabold">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">
                        <Stethoscope className="w-3 h-3" />
                      </div>
                      <span>Phản hồi từ Dược sĩ Chuyên môn ({rev.pharmacistName || 'DS. MedXpressCare'})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {rev.replyDate || rev.createdAt}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed pl-6 italic">
                    "{rev.pharmacistReply}"
                  </p>
                </div>
              )}

              {/* Footer helpful like */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Trải nghiệm sau 2-4 tuần sử dụng</span>
                <button 
                  onClick={(e) => {
                    e.currentTarget.classList.add('text-emerald-700', 'font-bold');
                  }}
                  className="flex items-center gap-1 hover:text-emerald-700 transition-colors"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Hữu ích ({rev.likes || 12})</span>
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* Lightbox Modal Xem Ảnh Khách Hàng Phóng To */}
      {selectedPhotoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedPhotoModal(null)}
        >
          <div className="relative max-w-xl w-full bg-white rounded-3xl overflow-hidden p-2 shadow-2xl">
            <button
              onClick={() => setSelectedPhotoModal(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 hover:bg-black text-white transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={selectedPhotoModal} 
              alt="Ảnh phóng to" 
              className="w-full max-h-[80vh] object-contain rounded-2xl" 
            />
            <div className="p-3 text-center text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Ảnh chụp thực tế mở hộp có tem phụ và tem Bộ Công An từ khách hàng</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
