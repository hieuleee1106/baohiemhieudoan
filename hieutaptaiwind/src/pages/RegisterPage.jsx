import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { name, email, password, confirmPassword, phone } = formData;
  const { showNotification } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Kiểm tra mật khẩu
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu và xác nhận mật khẩu không khớp.";
    }

    if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      // Gọi API backend để đăng ký
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Nếu backend trả về lỗi (ví dụ: email đã tồn tại)
        // Giả sử backend trả về lỗi dạng { message: "..." }
        setErrors({ general: data.message || "Đã có lỗi xảy ra." });
        return;
      }

      // Đăng ký thành công
      showNotification(data.message || `Đăng ký thành công!`);
      navigate("/login");

    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      setErrors({ general: "Không thể kết nối đến máy chủ. Vui lòng thử lại sau." });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="absolute inset-0 opacity-5" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}}></div>
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl shadow-purple-200/50 p-8 relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Tạo</span> Tài Khoản
          </h1>
          <p className="text-slate-500 mt-2">Bắt đầu hành trình của bạn với HieuShop</p>
        </div>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="name"
            placeholder="Tên của bạn"
            value={name}
            onChange={handleChange}
            className="w-full border-2 border-slate-200 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={handleChange}
            className="w-full border-2 border-slate-200 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            required
          />
          {errors.email && <p className="text-red-500 text-xs italic -mt-2 mb-4">{errors.email}</p>}
          <input
            type="tel"
            name="phone"
            placeholder="Số điện thoại (không bắt buộc)"
            value={phone}
            onChange={handleChange}
            className="w-full border-2 border-slate-200 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
          />
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={handleChange}
            className="w-full border-2 border-slate-200 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            required
          />
          {errors.password && <p className="text-red-500 text-xs italic -mt-2 mb-4">{errors.password}</p>}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={handleChange}
            className="w-full border-2 border-slate-200 rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            required
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs italic -mt-2 mb-4">{errors.confirmPassword}</p>}
          {errors.general && <p className="text-red-500 text-xs italic mb-4">{errors.general}</p>}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg transition-transform transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/40"
          >
            Đăng ký
          </button>
          <div className="mt-4 text-center">
            <p className="text-slate-500">Đã có tài khoản?{" "}
              <Link to="/login" className="text-purple-600 hover:underline font-medium">
                Đăng nhập
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;