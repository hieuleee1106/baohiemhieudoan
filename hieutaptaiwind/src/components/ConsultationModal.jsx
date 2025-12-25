import { useState } from 'react';
import { useAuth } from '../pages/AuthContext';

const ConsultationModal = ({ product, onClose }) => {
  const { showNotification } = useAuth();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    note: '',
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, product: product?._id }), // product có thể là null
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gửi yêu cầu thất bại.');

      showNotification(data.message || 'Yêu cầu của bạn đã được gửi!');
      // Tự động đóng modal sau 3 giây
      setTimeout(onClose, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit} className="p-8">
          <h2 className="text-2xl font-bold mb-2">Yêu cầu tư vấn</h2>
          {product && (
            <p className="text-slate-600 mb-6">Sản phẩm: <span className="font-semibold">{product.name}</span></p>
          )}

          <>
            {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
            <div className="space-y-4">
              <input name="customerName" onChange={handleChange} placeholder="Họ và tên của bạn" className="p-3 border rounded w-full" required />
              <input name="customerPhone" onChange={handleChange} placeholder="Số điện thoại" className="p-3 border rounded w-full" required />
              <textarea name="note" onChange={handleChange} placeholder="Ghi chú thêm (nếu có)" className="p-3 border rounded w-full h-20" />
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button type="button" onClick={onClose} className="px-6 py-2 bg-slate-200 rounded-lg hover:bg-slate-300 font-semibold">
                Đóng
              </button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold disabled:bg-purple-300">
                {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
              </button>
            </div>
          </>
        </form>
      </div>
    </div>
  );
};

export default ConsultationModal;