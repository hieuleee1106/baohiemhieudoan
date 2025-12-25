import { useState } from 'react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Đã có lỗi xảy ra.');
      }

      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">Quên Mật Khẩu</h1>
          <p className="text-slate-500 mt-2">Nhập email của bạn để nhận liên kết đặt lại mật khẩu.</p>
        </div>
        <form onSubmit={handleSubmit}>
          {message && <p className="text-center text-green-600 bg-green-100 p-3 rounded-lg mb-4">{message}</p>}
          {error && <p className="text-center text-red-600 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
          <input
            type="email"
            placeholder="Email của bạn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border-2 border-slate-200 rounded-lg p-3 mb-6 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:scale-105 transition-transform">
            Gửi liên kết
          </button>
          <div className="mt-6 text-center">
            <Link to="/login" className="text-purple-600 hover:underline font-medium">Quay lại Đăng nhập</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;