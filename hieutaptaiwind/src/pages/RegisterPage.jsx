import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import Button from "../components/Button";
// Trang đăng ký tài khoản người dùng
const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { name, email, password, confirmPassword, phone } = formData;
  const { showNotification } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Kiểm tra định dạng email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      newErrors.email = "Vui lòng nhập địa chỉ email hợp lệ.";
    }

    // Kiểm tra độ dài số điện thoại (nếu có nhập)
    if (phone && phone.length !== 10) {
      newErrors.phone = "Số điện thoại phải có đúng 10 chữ số.";
    }

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
    const { name, value } = e.target;
    if (name === "phone") {
      // Chỉ cho phép nhập số và giới hạn 10 ký tự
      const numericValue = value.replace(/\D/g, "");
      setFormData({ ...formData, [name]: numericValue.slice(0, 10) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50/30 p-4 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-red-100 p-8 relative z-10 border border-red-50">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">
            Tạo <span className="text-red-600">Tài Khoản</span>
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
            className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all mb-4"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={handleChange}
            className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all mb-4"
            required
          />
          {errors.email && <p className="text-red-500 text-xs italic -mt-3 mb-4">{errors.email}</p>}
          <input
            type="tel"
            name="phone"
            placeholder="Số điện thoại (10 số)"
            value={phone}
            onChange={handleChange}
            className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all mb-4"
          />
          {errors.phone && <p className="text-red-500 text-xs italic -mt-3 mb-4">{errors.phone}</p>}
          <input
            type="password"
            name="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={handleChange}
            className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all mb-4"
            required
          />
          {errors.password && <p className="text-red-500 text-xs italic -mt-3 mb-4">{errors.password}</p>}
          <input
            type="password"
            name="confirmPassword"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={handleChange}
            className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all mb-6"
            required
          />
          {errors.confirmPassword && <p className="text-red-500 text-xs italic -mt-5 mb-4">{errors.confirmPassword}</p>}
          {errors.general && <p className="text-red-500 text-sm text-center mb-4">{errors.general}</p>}
          <Button
            type="submit"
            variant="slide-red"
            className="w-full shadow-lg shadow-red-500/30"
          >
            Đăng ký
          </Button>
          <div className="mt-4 text-center">
            <p className="text-slate-500">Đã có tài khoản?{" "}
              <Link to="/login" className="text-red-600 hover:underline font-medium">
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