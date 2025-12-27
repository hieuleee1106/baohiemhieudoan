import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "./AuthContext";
import Button from "../components/Button";
import Chatbox from "../components/Chatbox";
const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, showNotification } = useAuth();
  const [error, setError] = useState("");

  // Lấy đường dẫn trang trước đó, nếu không có thì mặc định là trang chủ "/"
  const from = location.state?.from?.pathname || "/";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Xóa lỗi cũ

    try {
      // 1. Gọi API để đăng nhập và lấy token
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginResponse.json();

      if (!loginResponse.ok) {
        setError(loginData.message || "Email hoặc mật khẩu không chính xác.");
        return;
      }

      // 2. Lấy token và user từ response, lưu token vào localStorage
      const { token, user } = loginData;
      localStorage.setItem('hieushop-token', token);

      // 3. Cập nhật AuthContext với thông tin người dùng và điều hướng
      login(user);
      showNotification(`Chào mừng trở lại, ${user.name}!`);

      // --- THAY ĐỔI LOGIC ĐIỀU HƯỚNG ---
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true }); // Nếu là admin, chuyển đến trang dashboard
      } else {
        navigate(from, { replace: true }); // Nếu là user thường, quay lại trang trước đó
      }
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setError("Không thể kết nối đến máy chủ hoặc có lỗi xảy ra.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    // credentialResponse.credential là một JWT (JSON Web Token)
    if (credentialResponse.credential) {
      try {
        // 1. Gửi token của Google đến backend để xác thực
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: credentialResponse.credential }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Xác thực Google thất bại.');

        // 2. Nhận lại token và user của ứng dụng, lưu vào localStorage
        const { token, user } = data;
        localStorage.setItem('hieushop-token', token);

        // 4. Cập nhật context, thông báo chào mừng và điều hướng
        login(user);
        showNotification(`Chào mừng, ${user.name}!`);

        // --- THAY ĐỔI LOGIC ĐIỀU HƯỚNG ---
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true }); // Nếu là admin, chuyển đến trang dashboard
        } else {
          navigate(from, { replace: true }); // Nếu là user thường, quay lại trang trước đó
        }
      } catch (err) {
        setError(err.message);
        console.error("Lỗi đăng nhập Google:", err);
      }
    }
  };
  
  const handleGoogleError = () => {
    console.log("Login Failed");
    alert("Đăng nhập bằng Google thất bại. Vui lòng thử lại sau.");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-red-50/30 p-4 relative overflow-hidden"
    >
      {/* Decorative background elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-red-100 p-8 relative z-10 border border-red-50">
        <div className="text-center mb-10">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="mx-auto h-20 w-auto mb-6 object-contain"
            onError={(e) => e.target.style.display = 'none'} 
          />
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Chào Mừng <span className="text-red-600">Trở Lại</span>
          </h1>
          <p className="text-slate-500 mt-3 text-sm font-medium">Đăng nhập để tiếp tục trải nghiệm</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-600 ml-1">Email</label>
            <input
              type="email"
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            />
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center ml-1">
              <label className="text-sm font-semibold text-slate-600">Mật khẩu</label>
              <Link to="/forgot-password" className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
                Quên mật khẩu?
              </Link>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="slide-red"
            className="w-full shadow-lg shadow-red-500/30"
          >
            Đăng nhập
          </Button>
        </form>

        <div className="my-8 flex items-center">
          <div className="flex-1 border-t border-slate-200"></div>
          <span className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Hoặc</span>
          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="outline"
            size="large"
            shape="rectangular"
            width="100%"
          />
        </div>

        <div className="mt-8 text-center">
          <p className="text-slate-500 text-sm">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-red-600 hover:text-red-700 font-bold hover:underline">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
      <Chatbox />
    </div>
  );
};

export default LoginPage;
