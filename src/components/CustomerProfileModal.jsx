import React, { useState } from 'react';
import { 
  X, User, Award, ShoppingBag, Clock, MapPin, 
  Phone, Mail, ArrowUpRight, ArrowDownLeft, ShieldCheck, 
  LogOut, Sparkles, CheckCircle2, ChevronRight, Truck,
  Stethoscope, Bot, Activity, MessageSquare, FileText
} from 'lucide-react';
import { TwoTierAddressFields } from './TwoTierAddressFields';

export const CustomerProfileModal = ({ 
  isOpen, 
  onClose, 
  customer, 
  onLogout,
  orders = [],
  onUpdateCustomer,
  onOpenOrderTracking,
  consultations = [],
  onResumeConsultation = null
}) => {
  const [activeTab, setActiveTab] = useState('points'); // points | orders | consultations | info
  const [editForm, setEditForm] = useState({
    fullName: customer?.fullName || '',
    email: customer?.email || '',
    province: customer?.province || 'Hà Nội',
    district: customer?.district || '',
    address: customer?.address || ''
  });

  if (!isOpen || !customer) return null;

  // Lấy danh sách các đơn hàng của riêng khách này
  const customerOrders = orders.filter(
    o => o.customer?.phone?.replace(/\s+/g, '') === customer.phone?.replace(/\s+/g, '')
  );

  // Lấy danh sách các phiên tư vấn AI & khảo sát sức khỏe của khách này
  const customerConsultations = consultations.filter(
    c => (customer.id && c.customerId === customer.id) ||
         (customer.phone && (c.customerPhone === customer.phone || c.customerId === `cust-${customer.phone}`))
  );

  const handleSaveInfo = (e) => {
    e.preventDefault();
    if (onUpdateCustomer) {
      onUpdateCustomer({
        ...customer,
        ...editForm
      });
      alert('Đã cập nhật thông tin cá nhân và địa chỉ thành công!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-4 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header với thẻ VIP sang trọng */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 border-b border-slate-800">
          <div className="flex items-center justify-between pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-xl shadow-lg">
                {customer.fullName ? customer.fullName.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                    {customer.tier || 'Khách Hàng Thân Thiết'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">{customer.phone}</span>
                </div>
                <h3 className="text-lg font-black text-white mt-0.5">
                  {customer.fullName}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (confirm('Quý khách có chắc chắn muốn đăng xuất khỏi tài khoản?')) {
                    onLogout();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 text-xs font-bold transition-all flex items-center gap-1 border border-slate-700"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng Xuất</span>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Thẻ Điểm Thưởng Thành Viên (MedXpress Loyalty Card) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 p-4 sm:p-5 text-slate-950 shadow-xl border border-amber-300/40">
            <div className="absolute -right-6 -bottom-6 opacity-15">
              <Award className="w-36 h-36" />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900/80">
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  Số Dư Điểm Thưởng Tích Lũy
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
                    {customer.points || 0}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900">ĐIỂM</span>
                  <span className="text-xs bg-slate-950 text-amber-300 px-2 py-0.5 rounded-full font-bold ml-1">
                    = {((customer.points || 0) * 1000).toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right bg-black/10 sm:bg-transparent p-2.5 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto">
                <div className="text-[11px] font-semibold text-slate-900">
                  Quy ước tích & đổi điểm:
                </div>
                <div className="text-xs font-black text-slate-950 mt-0.5">
                  100.000₫ đơn = +1 Điểm | 1 Điểm = 1.000₫ giảm trừ
                </div>
                <p className="text-[10px] text-slate-900/80 mt-1">
                  Áp dụng giảm trừ trực tiếp ở bước Thanh toán
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 px-6 py-2.5 flex items-center gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('points')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'points'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Lịch Sử Tích & Đổi Điểm</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Đơn Hàng ({customerOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('consultations')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'consultations'
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>Hồ Sơ Sức Khỏe & Chat AI ({customerConsultations.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('info')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'info'
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Địa Chỉ & Thông Tin</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 bg-slate-50/50">
          
          {/* TAB 1: LỊCH SỬ TÍCH / TIÊU ĐIỂM */}
          {activeTab === 'points' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-1">
                <span>Biến Động Điểm Thưởng ({customer.pointsHistory?.length || 0} giao dịch)</span>
                <span className="text-[11px] text-slate-500 font-normal">Cập nhật theo thời gian thực</span>
              </div>

              {!customer.pointsHistory || customer.pointsHistory.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  Chưa có lịch sử tích điểm. Mua hàng ngay để tích 1 điểm mỗi 100.000₫!
                </div>
              ) : (
                <div className="space-y-2">
                  {customer.pointsHistory.slice().reverse().map((item, idx) => {
                    const isEarn = item.type === 'earn';
                    return (
                      <div 
                        key={item.id || idx}
                        className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            isEarn ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {isEarn ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 truncate">
                              {item.desc || (isEarn ? 'Tích điểm đơn hàng' : 'Đổi điểm trừ tiền đơn hàng')}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {item.date ? new Date(item.date).toLocaleString('vi-VN') : 'Giao dịch gần đây'}
                              {item.orderId && ` • Mã đơn: ${item.orderId}`}
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className={`font-black text-sm ${
                            isEarn ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {isEarn ? `+${item.points}` : `-${item.points}`} điểm
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {isEarn ? `+${item.points * 1000}₫` : `-${item.points * 1000}₫`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ĐƠN HÀNG CỦA TÔI */}
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {customerOrders.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  Bạn chưa có đơn hàng nào tại MedXpressCare.
                </div>
              ) : (
                customerOrders.map(order => (
                  <div key={order.id} className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {order.id}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        order.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'shipping' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'confirmed' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {order.status === 'completed' ? '✓ Đã nhận hàng' :
                         order.status === 'shipping' ? '🚚 Đang giao' :
                         order.status === 'confirmed' ? 'Đã xác nhận' : '⏳ Chờ gọi xác nhận'}
                      </span>
                    </div>

                    <div className="space-y-1 text-slate-600">
                      {order.items?.map((it, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="truncate max-w-[70%]">• {it.name} (x{it.quantity})</span>
                          <span className="font-mono">{(it.price * it.quantity).toLocaleString('vi-VN')}₫</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t font-bold">
                      <span className="text-slate-500">Tổng thanh toán:</span>
                      <span className="text-emerald-700 text-sm">{order.grandTotal?.toLocaleString('vi-VN')}₫</span>
                    </div>

                    {/* Tracking Vận Đơn Bưu Tá */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                      <div className="text-slate-500 flex items-center gap-1 font-mono">
                        <Truck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Vận đơn: <strong className="text-slate-800">{order.trackingNumber || `GHTK-${order.id.replace(/[^0-9]/g, '') || '883921'}VN`}</strong></span>
                      </div>

                      {onOpenOrderTracking && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenOrderTracking(order);
                          }}
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold border border-emerald-200 transition-colors flex items-center gap-1"
                        >
                          <Truck className="w-3 h-3 text-emerald-600" />
                          <span>Theo dõi bưu tá</span>
                        </button>
                      )}
                    </div>

                    {order.pointsUsed > 0 && (
                      <div className="text-[11px] text-amber-700 bg-amber-50 p-1.5 rounded-lg border border-amber-200">
                        🌟 Đã dùng: {order.pointsUsed} điểm (-{(order.pointsUsed * 1000).toLocaleString('vi-VN')}₫)
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB: HỒ SƠ SỨC KHỎE & LỊCH SỬ TƯ VẤN DƯỢC SĨ AI */}
          {activeTab === 'consultations' && (
            <div className="space-y-4">
              {/* Thẻ tóm tắt hồ sơ sức khỏe cá nhân */}
              <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50 via-teal-50 to-white rounded-2xl border border-emerald-200/90 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                      <Stethoscope className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-emerald-950">Hồ Sơ Sức Khỏe Cá Nhân Hóa</h4>
                      <p className="text-[11px] text-slate-500">Được đồng bộ bảo mật trên Cloudflare D1</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (onResumeConsultation) onResumeConsultation(null);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Tư Vấn Mới</span>
                  </button>
                </div>

                {customer.healthProfile || customerConsultations[0]?.healthProfile ? {
                  ...(customer.healthProfile || customerConsultations[0]?.healthProfile)
                } : null ? (
                  (() => {
                    const hp = customer.healthProfile || customerConsultations[0]?.healthProfile;
                    return (
                      <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-white/90 p-3 rounded-xl border border-emerald-100">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Nhóm Đối Tượng</span>
                          <span className="font-extrabold text-emerald-900">{hp.audienceTitle || hp.audience || 'Chung'}</span>
                        </div>
                        <div className="bg-white/90 p-3 rounded-xl border border-emerald-100">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Nhu Cầu Khảo Sát Gần Nhất</span>
                          <span className="font-extrabold text-slate-900">{hp.primaryConcernTitle || hp.primaryConcern || 'Tư vấn sức khỏe'}</span>
                        </div>
                        <div className="bg-white/90 p-3 rounded-xl border border-emerald-100 sm:col-span-2">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">Thể Trạng / Lưu Ý Dược Lý</span>
                          <span className="font-medium text-slate-700">{hp.conditionTitle || 'Cơ thể khỏe mạnh, không bệnh nền'}</span>
                          {hp.conditionNote && (
                            <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg mt-1.5 border border-amber-200">
                              {hp.conditionNote}
                            </p>
                          )}
                        </div>
                        {hp.keyNutrients && (
                          <div className="bg-white/90 p-3 rounded-xl border border-emerald-100 sm:col-span-2">
                            <span className="text-[10px] font-bold uppercase text-emerald-700 block mb-0.5">Vi Chất Khuyên Bổ Sung</span>
                            <span className="font-medium text-slate-800">{hp.keyNutrients}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="mt-3.5 p-4 bg-white/80 rounded-xl border border-emerald-100 text-center text-xs text-slate-500">
                    <p className="font-medium">Quý khách chưa có hồ sơ khảo sát sức khỏe nào được lưu trữ.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Trò chuyện cùng Dược Sĩ Lâm Sàng AI để nhận liệu trình vi chất & chế độ dinh dưỡng thiết kế riêng cho bạn!</p>
                  </div>
                )}
              </div>

              {/* Danh sách các phiên tương tác AI */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
                  <span>Lịch Sử Các Phiên Chat & Khảo Sát ({customerConsultations.length})</span>
                  <span className="text-[11px] text-slate-400 font-normal">Lưu trên Cloudflare D1</span>
                </div>

                {customerConsultations.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                    <Bot className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    Chưa có phiên chat AI nào được ghi nhận cho tài khoản này.
                  </div>
                ) : (
                  customerConsultations.map((session, idx) => {
                    const msgCount = Array.isArray(session.chatHistory) ? session.chatHistory.length : 0;
                    const prodCount = Array.isArray(session.recommendedProductIds) ? session.recommendedProductIds.length : 0;
                    const sessionDate = session.updatedAt || session.createdAt;

                    return (
                      <div 
                        key={session.id || idx}
                        className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-500/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900 truncate">
                              {session.healthProfile?.primaryConcernTitle || 'Phiên tư vấn sức khỏe tổng quát'}
                            </span>
                            {session.healthProfile?.audienceTitle && (
                              <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0">
                                {session.healthProfile.audienceTitle}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1 font-mono text-slate-400">
                              <Clock className="w-3 h-3" />
                              {sessionDate ? new Date(sessionDate).toLocaleString('vi-VN') : 'Gần đây'}
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              {msgCount} tin nhắn
                            </span>
                            {prodCount > 0 && (
                              <span className="text-emerald-700 font-semibold">
                                • {prodCount} sản phẩm đề xuất
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (onResumeConsultation) onResumeConsultation(session);
                            onClose();
                          }}
                          className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 shrink-0 border border-emerald-200 hover:border-emerald-600 shadow-xs"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>Mở Lại Phiên Tư Vấn</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: THÔNG TIN & ĐỊA CHỈ */}
          {activeTab === 'info' && (
            <form onSubmit={handleSaveInfo} className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">Họ và tên</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={customer.phone}
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border rounded-xl font-mono text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 mt-0.5">Số điện thoại dùng làm tên đăng nhập cố định</p>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block text-slate-700 font-bold">Địa chỉ nhận hàng mặc định (Mô hình 2 cấp)</label>
                <TwoTierAddressFields
                  province={editForm.province}
                  ward={editForm.district}
                  onProvinceChange={(newProv) => setEditForm({ ...editForm, province: newProv, district: '' })}
                  onWardChange={(newWard) => setEditForm({ ...editForm, district: newWard })}
                  compact={true}
                />
                <input
                  type="text"
                  placeholder="Số nhà, tên đường, thôn xóm, tòa nhà..."
                  value={editForm.address}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-all"
                >
                  Lưu Thông Tin Mặc Định
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
