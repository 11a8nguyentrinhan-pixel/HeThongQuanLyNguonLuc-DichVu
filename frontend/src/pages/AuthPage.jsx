import { useState, useEffect } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth, ROLE_ROUTES } from '../context/AuthContext';

const API_BASE = 'http://localhost:5000/api/auth';

/* --- BỘ ICON SVG --- */
const NoriLogoMark = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M5.5 18.5L11.2 6.5L16.5 18.5" stroke="#113325" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="17.8" cy="7.2" r="2" fill="#113325" />
  </svg>
);

const UserIcon = () => (
  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const PhoneIcon = () => (
  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const EyeIcon = ({ open }) =>
  open ? (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

const ShieldIcon = () => (
  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const WorkspaceIcon = () => (
  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18" />
    <path d="M9 20v-6h6v6" />
  </svg>
);

const UsersGroupIcon = () => (
  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function AuthPage() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [alert, setAlert] = useState({ message: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showSignupPass, setShowSignupPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '', rememberMe: false });
  const [signupData, setSignupData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [showForgotPass, setShowForgotPass] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotData, setForgotData] = useState({ 
    email: '',
    reset_code: '',
    new_password: '',
    confirm_password: '', 
  });

  const { user, loginSuccess } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (mode === 'signup') document.title = 'Đăng ký Client · Nori';
    else if (mode === 'forgot') document.title = 'Khôi phục mật khẩu · Nori Workspace';
    else document.title = 'Đăng nhập · Nori Workspace';
  }, [mode]);

  if (user) {
    return <Navigate to={ROLE_ROUTES[user.role] || '/client'} replace />;
  }

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setAlert({ message: '', type: '' });
    if (nextMode === 'forgot') setForgotStep(1);
  };

  /* --- XỬ LÝ ĐĂNG NHẬP --- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setAlert({ message: '', type: '' });
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });
      const data = await res.json();

      if (!res.ok) {
        setAlert({ message: data.message || 'Đăng nhập thất bại', type: 'error' });
        setSubmitting(false);
        return;
      }

      loginSuccess(data.user, data.token);
      navigate(ROLE_ROUTES[data.user.role] || data.redirectUrl || '/client', { replace: true });
    } catch {
      setAlert({ message: 'Không thể kết nối tới Server Backend (Port 5000)', type: 'error' });
      setSubmitting(false);
    }
  };

  /* --- XỬ LÝ ĐĂNG KÝ CLIENT --- */
  const handleSignup = async (e) => {
    e.preventDefault();
    setAlert({ message: '', type: '' });

    if (signupData.password.length < 8) {
      setAlert({ message: 'Mật khẩu phải có tối thiểu 8 ký tự.', type: 'error' });
      return;
    }
    if (signupData.password !== signupData.confirmPassword) {
      setAlert({ message: 'Mật khẩu xác nhận không khớp.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: signupData.full_name,
          email: signupData.email,
          phone: signupData.phone,
          password: signupData.password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAlert({ message: data.message || 'Đăng ký thất bại', type: 'error' });
        setSubmitting(false);
        return;
      }

      const registeredEmail = signupData.email;
      setAlert({ message: 'Tạo tài khoản Client thành công! Đang chuyển sang đăng nhập...', type: 'success' });
      setSignupData({ full_name: '', email: '', phone: '', password: '', confirmPassword: '' });
      setLoginData((prev) => ({ ...prev, email: registeredEmail }));
      setTimeout(() => setMode('login'), 1300);
    } catch {
      setAlert({ message: 'Không thể kết nối tới Server Backend (Port 5000)', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  /* --- XỬ LÝ QUÊN MẬT KHẨU --- */
  const handleSendResetCode = async (e) => {
    if (e) e.preventDefault();
    setAlert({ message: '', type: '' });
    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotData.email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAlert({ message: data.message || 'Không thể gửi mã xác nhận', type: 'error' });
        setSubmitting(false);
        return;
      }

      setAlert({ message: data.message, type: 'success' });
      setForgotStep(2);
    } catch {
      setAlert({ message: 'Không thể kết nối tới Server Backend (Port 5000)', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setAlert({ message: '', type: '' });

    if (forgotData.new_password.length < 8) {
      setAlert({ message: 'Mật khẩu mới phải có tối thiểu 8 ký tự.', type: 'error' });
      return;
    }
    if (forgotData.new_password !== forgotData.confirm_password) {
      setAlert({ message: 'Mật khẩu xác nhận không khớp.', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotData.email,
          reset_code: forgotData.reset_code,
          new_password: forgotData.new_password,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAlert({ message: data.message || 'Đặt lại mật khẩu thất bại', type: 'error' });
        setSubmitting(false);
        return;
      }

      setAlert({ message: data.message, type: 'success' });
      setLoginData((prev) => ({ ...prev, email: forgotData.email }));
      setTimeout(() => {
        setForgotData({ email: '', reset_code: '', new_password: '', confirm_password: '' });
        setForgotStep(1);
        setMode('login');
      }, 1400);
    } catch {
      setAlert({ message: 'Không thể kết nối tới Server Backend (Port 5000)', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };
  //Thêm màn hình kích hoạt nhân sự
  const [searchParams, setSearchParams] = useSearchParams();
const [activateData, setActivateData] = useState({
  email: searchParams.get('email') || '',
  token: searchParams.get('activateToken') || '',
  password: '',
  confirmPassword: '',
});

useEffect(() => {
  const tokenParam = searchParams.get('activateToken');
  const emailParam = searchParams.get('email');
  if (tokenParam && emailParam) {
      // 1. Lưu ngầm vào sessionStorage (giúp người dùng lỡ bấm F5 vẫn kích hoạt tiếp được)
      sessionStorage.setItem('nori_activate_email', emailParam);
      sessionStorage.setItem('nori_activate_token', tokenParam);

      // 2. Đưa vào state và mở giao diện Kích hoạt tài khoản
      setAlert({ message: '', type: '' });
      setMode('activate');
      setActivateData((prev) => ({ ...prev, email: emailParam, token: tokenParam }));

      // 3. Xóa ngay lập tức token trên thanh địa chỉ URL
      setSearchParams({}, { replace: true });
    } else {
      // Khôi phục dữ liệu kích hoạt nếu người dùng tải lại trang (F5)
      const savedEmail = sessionStorage.getItem('nori_activate_email');
      const savedToken = sessionStorage.getItem('nori_activate_token');
      if (savedEmail && savedToken) {
        setMode('activate');
        setActivateData((prev) => ({ ...prev, email: savedEmail, token: savedToken }));
      }
    }
}, [searchParams, setSearchParams]);

const handleActivateAccount = async (e) => {
  e.preventDefault();
  setAlert({ message: '', type: '' });

  if (activateData.password.length < 8) {
    setAlert({ message: 'Vui lòng đặt mật khẩu tối thiểu 8 ký tự.', type: 'error' });
    return;
  }
  if (activateData.password !== activateData.confirmPassword) {
    setAlert({ message: 'Mật khẩu xác nhận không khớp.', type: 'error' });
    return;
  }

  setSubmitting(true);
  try {
    const res = await fetch(`${API_BASE}/activate-account`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: activateData.email,
        token: activateData.token,
        password: activateData.password,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setAlert({ message: data.message || 'Kích hoạt thất bại.', type: 'error' });
      setSubmitting(false);
      return;
    }

    setAlert({ message: data.message, type: 'success' });
    sessionStorage.removeItem('nori_activate_email');
    sessionStorage.removeItem('nori_activate_token');
    setLoginData((prev) => ({ ...prev, email: activateData.email }));
    setSearchParams({});
    setTimeout(() => setMode('login'), 1400);
  } catch (err) {
    setAlert({ message: `Lỗi kết nối: ${err.message}`, type: 'error' });
  } finally {
    setSubmitting(false);
  }
};



  const isSignup = mode === 'signup';

  // Class dùng chung cho tất cả ô Input để code gọn và đồng nhất
  const inputClassName =
    'h-12 w-full rounded-xl border border-[#dfe4e0] bg-white pl-4 pr-11 text-sm text-[#10231b] placeholder-[#9aa7a1] shadow-xs outline-none transition hover:border-[#c5d0ca] focus:border-[#154734] focus:ring-4 focus:ring-[#154734]/12';

  return (
    /* Khung bao toàn màn hình: flex + min-h-screen + w-full */
    <div className="flex min-h-screen w-full bg-[#f6f6f2] text-left text-[#10231b]">
      {/* ================= CỘT TRÁI (BRANDING & SHOWCASE) ================= */}
      {/* hidden lg:flex => Ẩn trên màn hình nhỏ, hiện Flexbox chiếm 46% chiều rộng trên màn hình lớn */}
      <aside className="relative hidden w-[46%] shrink-0 flex-col justify-between overflow-hidden bg-linear-to-br from-[#1d4e3b] via-[#123829] to-[#0d2b1f] px-14 py-10 text-white lg:flex">
        {/* Vòng tròn trang trí đồng tâm mờ */}
        <div className="pointer-events-none absolute -right-56 bottom-5 h-140 w-140 rounded-full border border-white/6" />
        <div className="pointer-events-none absolute -right-32 bottom-28 h-90 w-90 rounded-full border border-white/6" />

        {/* Logo Header */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ccf378] shadow-lg">
            <NoriLogoMark />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-extrabold tracking-[2.2px] text-white">NORI</span>
            <span className="mt-0.5 text-[10px] font-semibold tracking-[1.8px] text-[#88a89a]">
              {isSignup ? 'CLIENT PORTAL' : 'WORKSPACE'}
            </span>
          </div>
        </div>

        {/* Hero Copy */}
        <div className="relative mt-30 z-10 my-7 max-w-lg flex-1 justify-center">
          <div className="mb-4 flex items-center gap-2.5 text-[11px] font-bold tracking-[1.6px] text-[#ccf378]">
            <span className="inline-block h-[1.5px] w-5 bg-[#ccf378]" />
            <span>{isSignup ? 'KHÔNG GIAN DÀNH CHO CLIENT' : 'MỘT ĐIỂM TRUY CẬP'}</span>
          </div>

          {isSignup ? (
            <>
              <h1 className="mb-4 text-5xl font-bold leading-[1.12] tracking-tight text-white">
                Mọi dự án,
                <br />
                cùng tiến về
                <br />
                <span className="text-[#ccf378]">một đích đến.</span>
              </h1>
              <p className="max-w-md text-[15px] leading-relaxed text-[#a9c1b6]">
                Tạo tài khoản để gửi yêu cầu dịch vụ, duyệt báo giá và theo dõi tiến độ dự án trong một không gian rõ ràng.
              </p>
            </>
          ) : (
            <>
              <h1 className="mb-4 text-5xl font-bold leading-[1.12] tracking-tight text-white">
                Đúng vai trò.
                <br />
                Đúng không gian
                <br />
                <span className="text-[#ccf378]">làm việc.</span>
              </h1>
              <p className="max-w-md text-[15px] leading-relaxed text-[#a9c1b6]">
                Đăng nhập một lần để tiếp tục công việc theo quyền được cấp cho tài khoản của bạn.
              </p>
            </>
          )}
        </div>
      </aside>

      {/* ================= CỘT PHẢI (FORM XÁC THỰC) ================= */}
      {/* flex-1 => Tự động chiếm toàn bộ phần chiều ngang còn lại (54% trên desktop, 100% trên mobile) */}
      <main className="flex flex-1 items-center justify-center overflow-y-auto bg-[#f6f6f2] px-6 py-8 sm:px-12">
        <div className="w-full max-w-110">
          {/* Banner thông báo lỗi / thành công */}
          {alert.message && (
            <div
              className={`mb-4 rounded-xl border px-3.5 py-3 text-xs font-medium ${
                alert.type === 'error'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              }`}
            >
              {alert.message}
            </div>
          )}

          {/* ---------- MÀN HÌNH 1: ĐĂNG NHẬP ---------- */}
          {mode === 'login' && (
            <>
              <div className="mb-6">
                <span className="mb-1.5 inline-block text-[11px] font-bold tracking-[1.5px] text-[#6b7d75]">
                  CHÀO MỪNG BẠN TRỞ LẠI
                </span>
                <h2 className="mb-1.5 text-3xl font-extrabold tracking-tight text-[#10231b]">
                  Đăng nhập
                </h2>
                <p className="text-sm leading-relaxed text-[#64746d]">
                  Nhập thông tin tài khoản để tiếp tục. Hệ thống sẽ tự nhận diện không gian làm việc phù hợp.
                </p>
              </div>

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="login-email" className="text-xs font-bold text-[#1d332a]">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="login-email"
                      type="email"
                      placeholder="ban@congty.com"
                      className={inputClassName}
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                    <span className="pointer-events-none absolute right-3.5 text-[#8c9b94]">
                      <MailIcon />
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="login-password" className="text-xs font-bold text-[#1d332a]">
                    Mật khẩu
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="login-password"
                      type={showLoginPass ? 'text' : 'password'}
                      placeholder="Nhập mật khẩu"
                      className={inputClassName}
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPass((v) => !v)}
                      className="absolute right-3 cursor-pointer p-1 text-[#8c9b94] hover:text-[#154734]"
                      aria-label="Hiện hoặc ẩn mật khẩu"
                    >
                      <EyeIcon open={showLoginPass} />
                    </button>
                  </div>
                </div>

                <div className="mt-0.5 flex items-center justify-between text-xs">
                  <label className="flex cursor-pointer items-center gap-2 text-[#4f6159] select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4 cursor-pointer accent-[#154734]"
                      checked={loginData.rememberMe}
                      onChange={(e) => setLoginData({ ...loginData, rememberMe: e.target.checked })}
                    />
                    <span>Ghi nhớ đăng nhập</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="cursor-pointer font-bold text-[#154734] hover:underline"
                  >
                    Quên mật khẩu?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 h-12 w-full cursor-pointer rounded-xl bg-[#154734] text-sm font-bold text-white shadow-md shadow-[#154734]/20 transition hover:bg-[#0f3728] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Đang kiểm tra...' : 'Đăng nhập  →'}
                </button>
              </form>

              <div className="mt-6 text-center text-sm text-[#64746d]">
                <p className="mb-2">
                  Khách hàng mới?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="cursor-pointer font-bold text-[#154734] hover:underline"
                  >
                    Tạo tài khoản Client
                  </button>
                </p>
                <p className="text-xs text-[#88968f]">
                  Tài khoản Admin, Manager và Member được cấp qua lời mời của Admin.
                </p>
                <div className="mt-5 text-[11px] tracking-wider text-[#9ba7a1]">
                  NORI WORKSPACE · Dành cho đội ngũ và khách hàng
                </div>
              </div>
            </>
          )}

          {/* ---------- MÀN HÌNH 2: ĐĂNG KÝ CLIENT ---------- */}
          {mode === 'signup' && (
            <>
              <div className="mb-5">
                <h2 className="mb-1.5 text-3xl font-extrabold tracking-tight text-[#10231b]">
                  Tạo tài khoản Client
                </h2>
                <p className="text-sm text-[#64746d]">
                  Đã có tài khoản?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="cursor-pointer font-bold text-[#154734] hover:underline"
                  >
                    Đăng nhập
                  </button>
                </p>
              </div>

              <form onSubmit={handleSignup} className="flex flex-col gap-3.5">
                <div className="flex flex-col gap-1">
                  <label htmlFor="reg-fullname" className="text-xs font-bold text-[#1d332a]">
                    Họ và tên
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="reg-fullname"
                      type="text"
                      placeholder="Nguyễn Minh Anh"
                      className={inputClassName}
                      value={signupData.full_name}
                      onChange={(e) => setSignupData({ ...signupData, full_name: e.target.value })}
                      required
                    />
                    <span className="pointer-events-none absolute right-3.5 text-[#8c9b94]">
                      <UserIcon />
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="reg-email" className="text-xs font-bold text-[#1d332a]">
                    Email
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="reg-email"
                      type="email"
                      placeholder="ban@congty.com"
                      className={inputClassName}
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                    <span className="pointer-events-none absolute right-3.5 text-[#8c9b94]">
                      <MailIcon />
                    </span>
                  </div>
                  <span className="text-xs text-[#7d8c85]">
                    Email được dùng để đăng nhập và nhận cập nhật dự án.
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="reg-phone" className="text-xs font-bold text-[#1d332a]">
                    Số điện thoại
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="reg-phone"
                      type="tel"
                      placeholder="+84 912 345 678"
                      className={inputClassName}
                      value={signupData.phone}
                      onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                      required
                    />
                    <span className="pointer-events-none absolute right-3.5 text-[#8c9b94]">
                      <PhoneIcon />
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="reg-password" className="text-xs font-bold text-[#1d332a]">
                    Mật khẩu
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="reg-password"
                      type={showSignupPass ? 'text' : 'password'}
                      placeholder="Tối thiểu 8 ký tự"
                      className={inputClassName}
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowSignupPass((v) => !v)}
                      className="absolute right-3 cursor-pointer p-1 text-[#8c9b94] hover:text-[#154734]"
                    >
                      <EyeIcon open={showSignupPass} />
                    </button>
                  </div>
                  <span className="text-xs text-[#7d8c85]">
                    Mật khẩu được mã hóa trước khi lưu vào tài khoản.
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="reg-confirm" className="text-xs font-bold text-[#1d332a]">
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="reg-confirm"
                      type={showConfirmPass ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu"
                      className={inputClassName}
                      value={signupData.confirmPassword}
                      onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass((v) => !v)}
                      className="absolute right-3 cursor-pointer p-1 text-[#8c9b94] hover:text-[#154734]"
                    >
                      <EyeIcon open={showConfirmPass} />
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1.5 h-12 w-full cursor-pointer rounded-xl bg-[#154734] text-sm font-bold text-white shadow-md shadow-[#154734]/20 transition hover:bg-[#0f3728] disabled:opacity-60"
                >
                  {submitting ? 'Đang khởi tạo...' : 'Tạo tài khoản  →'}
                </button>
              </form>

              <p className="mt-5 text-center text-xs text-[#64746d]">
                Bạn cần hỗ trợ?{' '}
                <a href="mailto:support@nori.vn" className="font-bold text-[#154734] hover:underline">
                  Liên hệ đội ngũ Nori
                </a>
              </p>
            </>
          )}

          {/* ---------- MÀN HÌNH 3: QUÊN MẬT KHẨU ---------- */}
          {mode === 'forgot' && (
            <>
              <div className="mb-6">
                <span className="mb-1.5 inline-block text-[11px] font-bold tracking-[1.5px] text-[#6b7d75]">
                  KHÔI PHỤC TÀI KHOẢN
                </span>
                <h2 className="mb-1.5 text-3xl font-extrabold text-[#10231b]">Quên mật khẩu</h2>
                <p className="text-sm text-[#64746d]">
                  {forgotStep === 1
                    ? 'Nhập địa chỉ Email đã đăng ký để nhận mã xác nhận khôi phục mật khẩu.'
                    : `Nhập mã 6 chữ số đã gửi về ${forgotData.email} và thiết lập mật khẩu mới.`}
                </p>
              </div>

              {forgotStep === 1 ? (
                <form onSubmit={handleSendResetCode} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-[#1d332a]">Email tài khoản</label>
                    <div className="relative flex items-center">
                      <input
                        type="email"
                        placeholder="ban@congty.com"
                        className={inputClassName}
                        value={forgotData.email}
                        onChange={(e) => setForgotData({ ...forgotData, email: e.target.value })}
                        required
                      />
                      <span className="pointer-events-none absolute right-3.5 text-[#8c9b94]">
                        <MailIcon />
                      </span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="h-12 w-full cursor-pointer rounded-xl bg-[#154734] text-sm font-bold text-white transition hover:bg-[#0f3728] disabled:opacity-60"
                  >
                    {submitting ? 'Đang gửi mã...' : 'Gửi mã xác nhận  →'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#1d332a]">Mã xác nhận (6 chữ số)</label>
                      <button
                        type="button"
                        disabled={submitting}
                        onClick={() => handleSendResetCode()}
                        className="cursor-pointer text-xs font-bold text-[#154734] hover:underline disabled:opacity-50"
                      >
                        Gửi lại mã
                      </button>
                    </div>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Nhập 6 chữ số từ Email"
                      className={inputClassName}
                      value={forgotData.reset_code}
                      onChange={(e) => setForgotData({ ...forgotData, reset_code: e.target.value })}
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#1d332a]">Mật khẩu mới</label>
                    <div className="relative flex items-center">
                      <input
                        type={showForgotPass ? 'text' : 'password'}
                        placeholder="Tối thiểu 8 ký tự"
                        className={inputClassName}
                        value={forgotData.new_password}
                        onChange={(e) => setForgotData({ ...forgotData, new_password: e.target.value })}
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowForgotPass((v) => !v)}
                        className="absolute right-3 cursor-pointer p-1 text-[#8c9b94] hover:text-[#154734]"
                      >
                        <EyeIcon open={showForgotPass} />
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-[#1d332a]">Xác nhận mật khẩu mới</label>
                    <input
                      type={showForgotPass ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu mới"
                      className={inputClassName}
                      value={forgotData.confirm_password}
                      onChange={(e) => setForgotData({ ...forgotData, confirm_password: e.target.value })}
                      minLength={8}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-1 h-12 w-full cursor-pointer rounded-xl bg-[#154734] text-sm font-bold text-white transition hover:bg-[#0f3728] disabled:opacity-60"
                  >
                    {submitting ? 'Đang cập nhật...' : 'Lưu mật khẩu mới  →'}
                  </button>
                </form>
              )}

              <p className="mt-6 text-center text-sm text-[#64746d]">
                Nhớ lại mật khẩu?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('login')}
                  className="cursor-pointer font-bold text-[#154734] hover:underline"
                >
                  Quay lại Đăng nhập
                </button>
              </p>
            </>
          )}

          {mode === 'activate' && (
            <>
              <div className="mb-6">
                <span className="mb-1.5 inline-block text-[11px] font-bold tracking-[1.5px] text-[#154734]">
                  XÁC NHẬN LỜI MỜI NỘI BỘ
                </span>
                <h2 className="mb-1.5 text-3xl font-extrabold text-[#10231b]">
                  Kích hoạt tài khoản
                </h2>
                <p className="text-sm text-[#64746d]">
                  Thiết lập mật khẩu cá nhân cho tài khoản <strong>{activateData.email}</strong> để hoàn tất kích hoạt.
                </p>
              </div>

              <form onSubmit={handleActivateAccount} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1d332a]">Mật khẩu mới</label>
                  <input
                    type="password"
                    placeholder="Tối thiểu 8 ký tự"
                    className={inputClassName}
                    value={activateData.password}
                    onChange={(e) => setActivateData({ ...activateData, password: e.target.value })}
                    minLength={8}
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-[#1d332a]">Xác nhận mật khẩu</label>
                  <input
                    type="password"
                    placeholder="Nhập lại mật khẩu mới"
                    className={inputClassName}
                    value={activateData.confirmPassword}
                    onChange={(e) => setActivateData({ ...activateData, confirmPassword: e.target.value })}
                    minLength={8}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="mt-1 h-12 w-full cursor-pointer rounded-xl bg-[#154734] text-sm font-bold text-white transition hover:bg-[#0f3728] disabled:opacity-60"
                >
                  {submitting ? 'Đang kích hoạt...' : 'Xác nhận & Kích hoạt tài khoản  →'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}