import { useState, useEffect } from 'react';

const ProductFormModal = ({ product, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    provider: '',
    category: 'Sức khỏe',
    price: '',
    description: '',
    imageUrl: '',
    insuredObject: '',
    benefits: '',
    annualInsurableAmount: '',
    insuranceTerm: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        provider: product.provider || '',
        category: product.category || 'Sức khỏe',
        price: product.price || '',
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        insuredObject: product.insuredObject || 'Mọi công dân Việt Nam từ 18-60 tuổi',
        benefits: product.benefits || '',
        annualInsurableAmount: product.annualInsurableAmount || '',
        insuranceTerm: product.insuranceTerm || '1 năm',
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const token = localStorage.getItem('hieushop-token');
    const method = product ? 'PUT' : 'POST';
    const url = product ? `/api/products/${product._id}` : '/api/products';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra');
      }

      onSave(); // Gọi hàm onSave để tải lại danh sách
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['Sức khỏe', 'Nhân thọ', 'Hưu Trí', 'Giáo dục', 'Du lịch'];

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-2xl font-bold mb-4">{product ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          {error && <p className="text-red-500 bg-red-100 p-2 rounded-md mb-4">{error}</p>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="name" value={formData.name} onChange={handleChange} placeholder="Tên sản phẩm" className="p-2 border rounded w-full" required />
            <input name="provider" value={formData.provider} onChange={handleChange} placeholder="Nhà cung cấp" className="p-2 border rounded w-full" required />
            <select name="category" value={formData.category} onChange={handleChange} className="p-2 border rounded w-full">
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Phí (năm)" className="p-2 border rounded w-full" required />
          </div>
          
          <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Mô tả ngắn gọn" className="p-2 border rounded w-full mt-4 h-20" required />
          <textarea name="benefits" value={formData.benefits} onChange={handleChange} placeholder="Quyền lợi chính (mỗi quyền lợi một dòng)" className="p-2 border rounded w-full mt-4 h-24" />
          <input name="insuredObject" value={formData.insuredObject} onChange={handleChange} placeholder="Đối tượng bảo hiểm" className="p-2 border rounded w-full mt-4" />
          <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} placeholder="URL hình ảnh" className="p-2 border rounded w-full mt-4" />
          <input type="number" name="annualInsurableAmount" value={formData.annualInsurableAmount} onChange={handleChange} placeholder="Số tiền bảo hiểm (năm)" className="p-2 border rounded w-full mt-4" />
          <input name="insuranceTerm" value={formData.insuranceTerm} onChange={handleChange} placeholder="Thời hạn bảo hiểm" className="p-2 border rounded w-full mt-4" />

          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 rounded hover:bg-slate-300 font-semibold">
              Hủy
            </button>
            <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 font-semibold disabled:bg-purple-300">
              {isSubmitting ? 'Đang lưu...' : 'Lưu lại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;