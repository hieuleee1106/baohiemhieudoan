import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { useAuth } from "./AuthContext";

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
      className="min-h-screen flex items-center justify-center bg-slate-50 p-4"
    >
      <div className="absolute inset-0 opacity-5" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-purple-200/50 p-8 relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Chào Mừng</span> Trở Lại
          </h1>
          <p className="text-slate-500 mt-2">Đăng nhập để tiếp tục khám phá</p>
        </div>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            required
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            required
          />
          {error && <p className="text-red-500 text-xs italic -mt-4 mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/40"
          >
            Đăng nhập
          </button>
          <div className="my-4 flex items-center before:flex-1 before:border-t before:border-slate-300 before:mt-0.5 after:flex-1 after:border-t after:border-slate-300 after:mt-0.5">
            <p className="text-center font-semibold mx-4 mb-0 text-slate-500">HOẶC</p>
          </div>

          {/* Sử dụng lại component GoogleLogin */}
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              shape="rectangular"
            />
          </div>

          <div className="text-right text-sm mb-6">
            <Link to="/forgot-password" className="font-medium text-purple-600 hover:text-purple-800">
              Quên mật khẩu?
            </Link>
          </div>
          <div className="mt-4 text-center">
            <p className="text-slate-500">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-purple-600 hover:underline font-medium">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
