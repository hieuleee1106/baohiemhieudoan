import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { useAuth } from './AuthContext';

const RegistrationPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { showNotification } = useAuth();
  const [product, setProduct] = useState(null);
  const [formData, setFormData] = useState({ fullName: '', dob: '', address: '', idNumber: '', profession: '' });
  const [files, setFiles] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (!res.ok) throw new Error('Không tìm thấy sản phẩm.');
        setProduct(await res.json());
      } catch (err) {
        setError(err.message);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setFiles(Array.from(e.target.files));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const submissionData = new FormData();
    submissionData.append('productId', productId);
    Object.keys(formData).forEach(key => submissionData.append(key, formData[key]));
    files.forEach(file => submissionData.append('documents', file));

    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: submissionData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Nộp hồ sơ thất bại.');
      showNotification(data.message || 'Nộp hồ sơ thành công!');
      setTimeout(() => navigate('/my-products'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product && !error) return <div>Đang tải...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="container mx-auto px-6 py-12 flex-grow">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Đăng ký sản phẩm</h1>
          <p className="text-slate-600 mb-6">Sản phẩm: <span className="font-semibold text-purple-600">{product?.name}</span></p>
          
          {isSubmitting ? <p className="text-center text-purple-600">Đang xử lý...</p> : (
             <form onSubmit={handleSubmit} className="space-y-6">
              {error && <p className="text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
              <input name="fullName" onChange={handleChange} placeholder="Họ và tên đầy đủ" className="p-3 border rounded w-full" required />
              <input type="date" name="dob" onChange={handleChange} placeholder="Ngày sinh" className="p-3 border rounded w-full" required />
              <input name="address" onChange={handleChange} placeholder="Địa chỉ thường trú" className="p-3 border rounded w-full" required />
              <input name="idNumber" onChange={handleChange} placeholder="Số CCCD/CMND" className="p-3 border rounded w-full" required />
              <input name="profession" onChange={handleChange} placeholder="Nghề nghiệp hiện tại" className="p-3 border rounded w-full" required />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tài liệu đính kèm (CCCD, ...)</label>
                <input type="file" onChange={handleFileChange} multiple className="p-2 border rounded w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Đang nộp hồ sơ...' : 'Hoàn tất và Nộp hồ sơ'}
              </Button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RegistrationPage;