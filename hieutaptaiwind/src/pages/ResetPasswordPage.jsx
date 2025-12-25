import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu và xác nhận không khớp.');
      return;
    }

    try {
      const response = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đã có lỗi xảy ra.');
      }

      setMessage(data.message + ' Bạn sẽ được chuyển hướng đến trang đăng nhập sau 3 giây.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Đặt Lại Mật Khẩu</h1>
          <p className="text-slate-500 mt-2">Nhập mật khẩu mới cho tài khoản của bạn.</p>
        </div>
        <form onSubmit={handleSubmit}>
          {message && <p className="text-center text-green-600 bg-green-100 p-3 rounded-lg mb-4">{message}</p>}
          {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-lg p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            placeholder="Xác nhận mật khẩu mới"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <button type="submit" className="w-full bg-linear-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:scale-105 transition-transform">
            Lưu Mật Khẩu Mới
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;