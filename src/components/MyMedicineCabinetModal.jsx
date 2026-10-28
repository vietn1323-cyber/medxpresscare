import React, { useState } from 'react';
import { 
  X, Bell, Clock, CheckCircle2, AlertCircle, Sparkles, 
  Trash2, Edit, Plus, ShoppingBag, Check, ShieldCheck, 
  Smartphone, RefreshCw, Calendar, Pill, ChevronRight, Volume2
} from 'lucide-react';
import { generateAiMedicationSchedule, calculateRefillSchedule } from '../utils/medicationHelper';
import { isPushNotificationSupported, requestNotificationPermission, subscribeUserToPush } from '../utils/pushHelper';

export const MyMedicineCabinetModal = ({
  isOpen,
  onClose,
  customer,
  medications = [],
  onUpdateMedications,
  refills = [],
  onUpdateRefills,
  products = [],
  onQuickReorder,
  onOpenPushPrompt
}) => {
  const [activeTab, setActiveTab] = useState('schedules'); // 'schedules' | 'refills' | 'settings'
  const [editingMed, setEditingMed] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [searchProduct, setSearchProduct] = useState('');
  const [pushStatus, setPushStatus] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  if (!isOpen) return null;

  // Xử lý bật nhận Web Push
  const handleEnablePush = async () => {
    try {
      await subscribeUserToPush(customer);
      setPushStatus('granted');
      alert('🎉 Đã kích hoạt Thông Báo Đẩy Web Push thành công! Bạn sẽ nhận được lời nhắc uống thuốc và nhắc tái đặt hàng đúng giờ.');
    } catch (err) {
      alert('Không thể kích hoạt thông báo: ' + err.message);
    }
  };

  // Thêm thuốc mới vào tủ thuốc từ danh mục sản phẩm (AI tự động sinh lịch)
  const handleAddProductToCabinet = (prod) => {
    if (!prod) return;
    const aiSchedule = generateAiMedicationSchedule(prod);
    const refillSchedule = calculateRefillSchedule(prod, 1, new Date());

    const updatedMeds = [aiSchedule, ...medications];
    const updatedRefills = [refillSchedule, ...refills.filter(r => r.productId !== prod.id)];

    if (onUpdateMedications) onUpdateMedications(updatedMeds);
    if (onUpdateRefills) onUpdateRefills(updatedRefills);

    setShowAddModal(false);
    setSelectedProductId('');
    setSearchProduct('');
  };

  // Đánh dấu đã uống thuốc (Mark as taken)
  const handleMarkAsTaken = (medId) => {
    const updated = medications.map(m => {
      if (m.id === medId) {
        return {
          ...m,
          lastTakenAt: new Date().toISOString(),
          takenCount: (m.takenCount || 0) + 1
        };
      }
      return m;
    });
    if (onUpdateMedications) onUpdateMedications(updated);
  };

  // Bật / tắt lịch nhắc của một thuốc
  const handleToggleMedication = (medId) => {
    const updated = medications.map(m => m.id === medId ? { ...m, enabled: !m.enabled } : m);
    if (onUpdateMedications) onUpdateMedications(updated);
  };

  // Xóa thuốc khỏi tủ
  const handleDeleteMedication = (medId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thuốc này khỏi Tủ Thuốc?')) {
      const updated = medications.filter(m => m.id !== medId);
      if (onUpdateMedications) onUpdateMedications(updated);
    }
  };

  // Lưu chỉnh sửa lịch uống thuốc
  const handleSaveEditMedication = (e) => {
    e.preventDefault();
    if (!editingMed) return;
    const updated = medications.map(m => m.id === editingMed.id ? editingMed : m);
    if (onUpdateMedications) onUpdateMedications(updated);
    setEditingMed(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0 border border-white/20">
              💊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">Tủ Thuốc & Lịch Nhắc Uống AI</h3>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full">
                  AI 24/7
                </span>
              </div>
              <p className="text-[11px] text-emerald-200 mt-0.5">
                Nhắc uống thuốc đúng cữ & Báo tái đặt hàng trước 2-3 ngày để không gián đoạn liệu trình
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 p-2 flex items-center gap-1 shrink-0 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('schedules')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'schedules'
                ? 'bg-white text-emerald-800 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>⏰ Lịch Uống Thuốc ({medications.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('refills')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'refills'
                ? 'bg-white text-emerald-800 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>📦 Nhắc Tái Đặt ({refills.filter(r => r.isNearRunout).length > 0 ? `⚠️ ${refills.filter(r => r.isNearRunout).length}` : refills.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-2 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-white text-emerald-800 shadow-xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Web Push</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 no-scrollbar">
          
          {/* TAB 1: LỊCH UỐNG THUỐC AI */}
          {activeTab === 'schedules' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-800">
                    Thuốc & Thực phẩm chức năng đang uống
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    AI đã tự động điền giờ uống và liều dùng chuẩn y khoa. Bạn có thể tự do điều chỉnh.
                  </p>
                </div>

                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Thêm Thuốc Mới</span>
                </button>
              </div>

              {/* Thông báo quyền Web Push nếu chưa bật */}
              {pushStatus !== 'granted' && (
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔔</span>
                    <div>
                      <div className="font-bold text-amber-900">Bật thông báo đẩy để nhận lời nhắc đúng giờ</div>
                      <div className="text-[11px] text-amber-700">Điện thoại sẽ rung và nhắc nhở vào các khung giờ uống thuốc</div>
                    </div>
                  </div>
                  <button
                    onClick={handleEnablePush}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
                  >
                    Bật Ngay
                  </button>
                </div>
              )}

              {/* Danh sách các loại thuốc */}
              {medications.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3">
                  <span className="text-3xl">💊</span>
                  <div className="text-xs text-slate-500">
                    Tủ thuốc của bạn đang trống. Sau khi bạn đặt hàng hoặc bấm "Thêm Thuốc Mới", Dược sĩ AI sẽ tự động lên lịch uống chuẩn xác cho bạn!
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Chọn thuốc từ kho MedXpressCare</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {medications.map((med) => (
                    <div 
                      key={med.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        med.enabled 
                          ? 'bg-white border-slate-200/90 shadow-xs hover:border-emerald-300' 
                          : 'bg-slate-50/60 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <img 
                            src={med.productImage || '/logo-icon.png'} 
                            alt={med.productName} 
                            className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-200 p-1 shrink-0" 
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                                {med.categoryTag || 'TPCN'}
                              </span>
                              {med.productBrand && (
                                <span className="text-[10px] text-slate-500 font-semibold">{med.productBrand}</span>
                              )}
                            </div>
                            <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate mt-0.5">
                              {med.productName}
                            </h5>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              {med.dietaryAdvice}
                            </p>
                            {med.warningNote && (
                              <p className="text-[10px] font-bold text-rose-600 mt-0.5">
                                {med.warningNote}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Switch Bật / Tắt */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleToggleMedication(med.id)}
                            className={`p-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                              med.enabled
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                            }`}
                            title={med.enabled ? 'Đang bật nhắc nhở' : 'Đã tạm tắt'}
                          >
                            {med.enabled ? '● Đang bật' : '○ Tắt'}
                          </button>
                        </div>
                      </div>

                      {/* Các khung giờ nhắc trong ngày */}
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-500">Giờ nhắc:</span>
                          {(med.scheduleTimes || []).map((t, idx) => (
                            <span 
                              key={idx} 
                              className="px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-mono font-extrabold text-xs flex items-center gap-1 shadow-2xs"
                            >
                              <Clock className="w-3 h-3 text-emerald-600" />
                              <span>{t}</span>
                              <span className="text-[10px] text-emerald-700 font-normal">({med.pillsPerDose || 1} viên)</span>
                            </span>
                          ))}
                        </div>

                        {/* Thao tác: Đã uống / Chỉnh sửa / Xóa */}
                        <div className="flex items-center gap-1.5 ml-auto">
                          <button
                            onClick={() => handleMarkAsTaken(med.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                            title="Xác nhận đã uống thuốc cữ này"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Đã uống ✓</span>
                          </button>

                          <button
                            onClick={() => setEditingMed(med)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Chỉnh sửa giờ uống và liều dùng"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteMedication(med.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Xóa khỏi tủ thuốc"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: NHẮC TÁI ĐẶT HÀNG TRƯỚC 2 - 3 NGÀY */}
          {activeTab === 'refills' && (
            <div className="space-y-3">
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-800">
                  Lịch nhắc tái đặt hàng (Trước 2 - 3 ngày)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Hệ thống tự động tính ngày hết hộp và thông báo trước 2 - 3 ngày để bạn đặt và nhận hàng vừa kịp lúc hộp cũ hết!
                </p>
              </div>

              {refills.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                  <span className="text-3xl">📦</span>
                  <div className="text-xs text-slate-500">
                    Chưa có lịch tái đặt hàng nào. Khi bạn đặt đơn hoặc thêm thuốc vào tủ thuốc, hệ thống sẽ tự động tính chu kỳ sử dụng!
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {refills.map((refill, idx) => (
                    <div 
                      key={refill.productId || idx}
                      className={`p-4 rounded-2xl border transition-all ${
                        refill.isNearRunout
                          ? 'bg-gradient-to-r from-rose-50/90 via-amber-50/60 to-rose-50/90 border-2 border-rose-300 shadow-md'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <img 
                            src={refill.productImage || '/logo-icon.png'} 
                            alt={refill.productName} 
                            className="w-12 h-12 rounded-xl object-contain bg-slate-50 border border-slate-200 p-1 shrink-0" 
                          />
                          <div className="min-w-0">
                            <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">
                              {refill.productName}
                            </h5>
                            <div className="text-[11px] text-slate-600 flex items-center gap-2 mt-0.5">
                              <span>Số lượng: {refill.quantity || 1} hộp ({refill.totalUnits || 60} viên)</span>
                              <span>•</span>
                              <span>Liều: {refill.dailyDose || 2} viên/ngày</span>
                            </div>
                          </div>
                        </div>

                        {/* Badge Trạng thái thời gian */}
                        <div className="shrink-0 text-right">
                          {refill.isNearRunout ? (
                            <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-extrabold text-[10px] animate-pulse shadow-xs">
                              ⚠️ Còn {refill.daysRemaining} ngày là hết!
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              Còn {refill.daysRemaining} ngày ({refill.totalDays} ngày tổng)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Thanh Tiến Độ Sử Dụng Liệu Trình */}
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                          <span>Bắt đầu: {refill.startDateStr}</span>
                          <span>Dự kiến hết: <strong>{refill.runoutDateStr}</strong></span>
                        </div>
                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              refill.isNearRunout ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ 
                              width: `${Math.min(100, Math.max(5, ((refill.totalDays - refill.daysRemaining) / refill.totalDays) * 100))}%` 
                            }}
                          />
                        </div>
                      </div>

                      {/* Thông điệp nhắc nhở và nút Tái Đặt Hàng */}
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>
                            {refill.isNearRunout 
                              ? '⚡ Đặt hôm nay để nhận thuốc vừa lúc hộp cũ hết viên cuối cùng!'
                              : `Hệ thống sẽ nhắc bạn vào ngày ${refill.reminderDateStr} (trước 2-3 ngày)`}
                          </span>
                        </div>

                        {onQuickReorder && (
                          <button
                            onClick={() => {
                              onQuickReorder({
                                id: refill.productId,
                                name: refill.productName,
                                price: refill.productPrice,
                                image: refill.productImage,
                                quantity: refill.quantity || 1
                              });
                              onClose();
                            }}
                            className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer shrink-0 ${
                              refill.isNearRunout
                                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/30'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Tái Đặt Nhanh</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CÀI ĐẶT THÔNG BÁO ĐẨY WEB PUSH */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-800">
                    Trạng Thái Thông Báo Đẩy (Cloudflare Web Push)
                  </h4>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-slate-900">Quyền thông báo hệ thống:</div>
                    <div className="text-[11px] text-slate-500">
                      {pushStatus === 'granted' 
                        ? '✅ Đã cấp quyền nhận thông báo trên thiết bị này'
                        : pushStatus === 'denied'
                          ? '❌ Đã bị chặn trong cài đặt trình duyệt'
                          : '⚠️ Chưa cấp quyền nhận thông báo'}
                    </div>
                  </div>

                  {pushStatus !== 'granted' ? (
                    <button
                      onClick={handleEnablePush}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Bật Thông Báo
                    </button>
                  ) : (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-xl">
                      Đang Hoạt Động
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-500 space-y-1">
                  <p>• <strong>Android / Windows / macOS</strong>: Thông báo hiển thị ngay trên thanh trạng thái hoặc góc màn hình.</p>
                  <p>• <strong>iPhone (iOS 16.4+)</strong>: Cần thêm ứng dụng vào Màn hình chính (PWA) để nhận thông báo đầy đủ.</p>
                  <p>• Không tốn pin, không quảng cáo rác, chỉ gửi lời nhắc sức khỏe và cập nhật hành trình đơn hàng.</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Chỉnh Sửa Giờ Uống Thuốc */}
        {editingMed && (
          <div className="fixed inset-0 z-60 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-2xl p-5 border border-slate-200 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-extrabold text-sm text-slate-900">
                  Tùy chỉnh lịch uống: {editingMed.productName}
                </h4>
                <button onClick={() => setEditingMed(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEditMedication} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Số viên mỗi lần uống:</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={editingMed.pillsPerDose || 1}
                    onChange={(e) => setEditingMed({ ...editingMed, pillsPerDose: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Các khung giờ nhắc (cách nhau bởi dấu phẩy):</label>
                  <input
                    type="text"
                    value={(editingMed.scheduleTimes || []).join(', ')}
                    onChange={(e) => setEditingMed({ 
                      ...editingMed, 
                      scheduleTimes: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                    })}
                    placeholder="VD: 08:00, 19:30"
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ghi chú lời dặn của Bác sĩ / Dược sĩ:</label>
                  <textarea
                    rows="2"
                    value={editingMed.dietaryAdvice || ''}
                    onChange={(e) => setEditingMed({ ...editingMed, dietaryAdvice: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border rounded-xl"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingMed(null)}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Lưu Thay Đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Chọn Sản Phẩm Để Thêm Vào Tủ Thuốc */}
        {showAddModal && (
          <div className="fixed inset-0 z-60 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl p-5 border border-slate-200 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between border-b pb-2 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    Chọn sản phẩm thêm vào Tủ Thuốc
                  </h4>
                </div>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative shrink-0">
                <input
                  type="text"
                  placeholder="Tìm theo tên sản phẩm, thương hiệu..."
                  value={searchProduct}
                  onChange={(e) => setSearchProduct(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium"
                />
              </div>

              <div className="overflow-y-auto flex-1 space-y-2 no-scrollbar">
                {products
                  .filter(p => {
                    if (!searchProduct.trim()) return true;
                    const term = searchProduct.toLowerCase();
                    return (p.name || '').toLowerCase().includes(term) || (p.brand || '').toLowerCase().includes(term);
                  })
                  .map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleAddProductToCabinet(p)}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={p.image || '/logo-icon.png'} 
                          alt={p.name} 
                          className="w-10 h-10 rounded-lg object-contain bg-white border border-slate-200 p-0.5 shrink-0" 
                        />
                        <div className="min-w-0">
                          <h6 className="font-bold text-xs text-slate-900 group-hover:text-emerald-800 truncate">
                            {p.name}
                          </h6>
                          <div className="text-[10px] text-slate-500">
                            {p.brand} • <strong className="text-rose-600">{(p.price || 0).toLocaleString('vi-VN')}₫</strong>
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 group-hover:bg-emerald-600 group-hover:text-white text-emerald-800 font-bold text-[11px] transition-colors shrink-0">
                        Thêm vào tủ 💊
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
