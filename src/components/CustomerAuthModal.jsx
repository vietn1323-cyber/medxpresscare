import React, { useState } from 'react';
import { 
  X, User, Lock, Phone, MapPin, Mail, Award, 
  ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Eye, EyeOff 
} from 'lucide-react';
import { TwoTierAddressFields } from './TwoTierAddressFields';

export const CustomerAuthModal = ({ 
  isOpen, 
  onClose, 
  customers, 
  onLoginSuccess, 
  onRegisterSuccess,
  initialTab = 'login' // 'login' | 'register'
}) => {
  const [tab, setTab] = useState(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Login form state
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    phone: '',
    password: '',
    confirmPassword: '',
    email: '',
    province: 'Hà Nội',
    district: '',
    address: ''
  });

  if (!isOpen) return null;

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const phoneClean = loginPhone.trim().replace(/\s+/g, '');
    const user = customers.find(c => c.phone.replace(/\s+/g, '') === phoneClean);

    if (!user) {
      setErrorMsg('Số điện thoại chưa được đăng ký trong hệ thống.');
      return;
    }

    if (user.password !== loginPassword) {
      setErrorMsg('Mật khẩu không chính xác. Vui lòng kiểm tra lại.');
      return;
    }

    // Bảo mật: Loại bỏ trường password trước khi lưu vào State & LocalStorage
    const { password: _pwd, ...safeUser } = user;
    onLoginSuccess(safeUser);
    onClose();
  };

  const handleQuickLogin = (demoUser) => {
    const { password: _pwd, ...safeUser } = demoUser;
    onLoginSuccess(safeUser);
    onClose();
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!registerForm.fullName.trim()) {
      setErrorMsg('Vui lòng nhập họ và tên của bạn.');
      return;
    }
    const phoneClean = registerForm.phone.trim().replace(/\s+/g, '');
    if (!phoneClean || phoneClean.length < 9) {
      setErrorMsg('Vui lòng nhập số điện thoại hợp lệ (từ 10 chữ số).');
      return;
    }
    if (customers.some(c => c.phone.replace(/\s+/g, '') === phoneClean)) {
      setErrorMsg('Số điện thoại này đã được đăng ký. Vui lòng chuyển sang tab Đăng Nhập.');
      return;
    }
    if (!registerForm.password || registerForm.password.length < 6) {
      setErrorMsg('Mật khẩu phải có độ dài tối thiểu từ 6 ký tự trở lên.');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không trùng khớp.');
      return;
    }

    // Tạo tài khoản mới tặng kèm 10 điểm thưởng khởi nghiệp (tương đương 10.000₫)
    const newCustomer = {
      id: 'cust-' + Date.now(),
      fullName: registerForm.fullName.trim(),
      phone: phoneClean,
      password: registerForm.password,
      email: registerForm.email.trim(),
      province: registerForm.province,
      district: registerForm.district.trim(),
      address: registerForm.address.trim(),
      points: 10, // Tặng 10 điểm chào mừng
      totalSpent: 0,
      tier: 'Thành viên Đồng',
      createdAt: new Date().toISOString(),
      pointsHistory: [
        {
          id: 'ph-' + Date.now(),
          date: new Date().toISOString(),
          type: 'earn',
          points: 10,
          desc: 'Quà tặng chào mừng thành viên mới MedXpressCare (+10 điểm)'
        }
      ]
    };

    onRegisterSuccess(newCustomer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col my-4 max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header với nhận diện tích điểm */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-5 sm:p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full">
                  MedXpress Rewards
                </span>
                <span className="text-xs text-emerald-200">100k = 1 Điểm | 1 Điểm = 1k</span>
              </div>
              <h2 className="text-lg font-black text-white mt-0.5">
                {tab === 'login' ? 'Đăng Nhập Khách Hàng' : 'Đăng Ký Tài Khoản Mới'}
              </h2>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 gap-1 bg-white/10 p-1 rounded-xl mt-4">
            <button
              type="button"
              onClick={() => { setTab('login'); setErrorMsg(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'login'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              Đăng Nhập
            </button>
            <button
              type="button"
              onClick={() => { setTab('register'); setErrorMsg(''); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                tab === 'register'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              Đăng Ký (Nhận +10 điểm)
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              ⚠️ {errorMsg}
            </div>
          )}

          {/* TAB 1: FORM ĐĂNG NHẬP */}
          {tab === 'login' && (
            <div className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số Điện Thoại Đăng Ký *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="VD: 0988 123 456"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      required
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật Khẩu *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                      className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Đăng Nhập Vào Tài Khoản</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Demo Accounts 1-Click for Instant Testing */}
              <div className="pt-3 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Tài Khoản Mẫu Trải Nghiệm Nhanh (1-Click):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {customers.slice(0, 2).map((demo) => (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => handleQuickLogin(demo)}
                      className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 transition-all group"
                    >
                      <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 truncate">
                        {demo.fullName}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {demo.phone}
                      </div>
                      <div className="inline-block mt-1 text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-md">
                        🌟 Đang có {demo.points} điểm ({demo.points * 1000}₫)
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FORM ĐĂNG KÝ TÀI KHOẢN MỚI */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <strong className="block font-bold">Ưu Đãi Thành Viên Mới:</strong>
                  Tặng ngay <span className="font-black text-amber-700">10 điểm thưởng (10.000₫)</span> vào tài khoản để trừ tiền cho đơn hàng đầu tiên!
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên quý khách *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn An"
                    value={registerForm.fullName}
                    onChange={(e) => setRegisterForm({ ...registerForm, fullName: e.target.value })}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại (Tên đăng nhập) *
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      placeholder="0912 345 678"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email nhận hóa đơn (tùy chọn)
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="khachhang@gmail.com"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mật khẩu *
                  </label>
                  <input
                    type="password"
                    placeholder="Tối thiểu 6 ký tự"
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nhập lại mật khẩu *
                  </label>
                  <input
                    type="password"
                    placeholder="Nhập lại chính xác"
                    value={registerForm.confirmPassword}
                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  Địa chỉ nhận hàng mặc định (Mô hình 2 cấp tự động điền khi mua hàng)
                </label>
                <TwoTierAddressFields
                  province={registerForm.province}
                  ward={registerForm.district}
                  onProvinceChange={(newProv) => setRegisterForm({ ...registerForm, province: newProv, district: '' })}
                  onWardChange={(newWard) => setRegisterForm({ ...registerForm, district: newWard })}
                  compact={true}
                />
                <input
                  type="text"
                  placeholder="Số nhà, tên đường, thôn xóm, ngõ ngách..."
                  value={registerForm.address}
                  onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 mt-2"
              >
                <span>Tạo Tài Khoản & Nhận Ngay +10 Điểm</span>
                <CheckCircle2 className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quy Tắc Tích Điểm Minh Bạch */}
          <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Chính Sách Tích Điểm Chuẩn MedXpress:
            </div>
            <div>• <strong>Tích điểm:</strong> Cứ mỗi <strong>100.000₫</strong> giá trị đơn hàng, bạn sẽ nhận được <strong>1 điểm</strong>.</div>
            <div>• <strong>Đổi điểm:</strong> Khi mua hàng lần sau, mỗi <strong>1 điểm quy đổi thành 1.000₫</strong> giảm trừ trực tiếp vào đơn hàng.</div>
            <div>• Điểm tích lũy không giới hạn thời gian sử dụng.</div>
          </div>

        </div>

      </div>
    </div>
  );
};
