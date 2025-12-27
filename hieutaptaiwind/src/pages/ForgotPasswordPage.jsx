import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

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
    <div className="min-h-screen flex items-center justify-center bg-red-50/30 p-4 relative overflow-hidden">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-red-100 p-8 relative z-10 border border-red-50">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900">Quên Mật Khẩu</h1>
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
            className="w-full border border-slate-200 bg-slate-50 rounded-xl p-3.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all mb-6"
            required
          />
          <Button type="submit" variant="slide-red" className="w-full shadow-lg shadow-red-500/30">
            Gửi liên kết
          </Button>
          <div className="mt-6 text-center">
            <Link to="/login" className="text-red-600 hover:underline font-medium">Quay lại Đăng nhập</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;