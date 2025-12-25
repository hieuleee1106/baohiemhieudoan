import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from './AuthContext';

const ClaimRequestPage = () => {
  const [contracts, setContracts] = useState([]);
  const [selectedContractId, setSelectedContractId] = useState('');
  const [allClaims, setAllClaims] = useState([]); // State mới để lưu tất cả claims
  const [reason, setReason] = useState('');
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showNotification } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContracts = async () => {
      const token = localStorage.getItem('hieushop-token');
      try {
        const res = await fetch('/api/contracts/my', {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();
        // Chỉ lấy các hợp đồng đang có hiệu lực cho dropdown
        const activeContracts = data.filter(c => c.status === 'Hiệu lực');
        setContracts(activeContracts);

        // Lấy tất cả claims từ tất cả hợp đồng để hiển thị lịch sử
        const claims = [];
        data.forEach(contract => {
          if (contract.claims && contract.claims.length > 0) {
            contract.claims.forEach(claim => {
              claims.push({
                ...claim,
                contractNumber: contract.contractNumber,
                productName: contract.product?.name,
              });
            });
          }
        });
        claims.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
        setAllClaims(claims);

      } catch (err) {
        console.error(err);
        showNotification('Lỗi tải dữ liệu', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchContracts();
  }, []);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedContractId) {
      showNotification('Vui lòng chọn hợp đồng bảo hiểm.', 'error');
      return;
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('hieushop-token');
    
    const formData = new FormData();
    formData.append('reason', reason);
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const res = await fetch(`/api/contracts/${selectedContractId}/claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gửi yêu cầu thất bại.');

      showNotification('Đã gửi yêu cầu chi trả thành công!');
      navigate('/my-contracts'); // Chuyển hướng về trang danh sách hợp đồng
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-6 text-center">Yêu cầu Chi trả Bảo hiểm</h1>
          
          {contracts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-500 mb-4">Bạn không có hợp đồng nào đang có hiệu lực để yêu cầu chi trả.</p>
              <button onClick={() => navigate('/')} className="text-purple-600 font-semibold hover:underline">Về trang chủ</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Chọn Hợp đồng bảo hiểm (*)</label>
                <select 
                  value={selectedContractId} 
                  onChange={(e) => setSelectedContractId(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                >
                  <option value="">-- Chọn hợp đồng --</option>
                  {contracts.map(c => (
                    <option key={c._id} value={c._id}>
                      {c.product?.name} - Số HĐ: {c.contractNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Lý do / Mô tả sự kiện bảo hiểm (*)</label>
                <textarea 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none h-32"
                  placeholder="Ví dụ: Nằm viện điều trị viêm phổi tại BV Bạch Mai từ ngày..."
                  required
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Hình ảnh / Tài liệu minh chứng</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500 focus-within:outline-none">
                        <span>Tải lên tệp</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} accept="image/*,.pdf" />
                      </label>
                      <p className="pl-1">hoặc kéo thả vào đây</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, PDF lên tới 10MB</p>
                  </div>
                </div>
                {files.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-slate-700">Đã chọn {files.length} tệp:</p>
                    <ul className="list-disc list-inside text-sm text-slate-600">
                      {files.map((f, index) => <li key={index}>{f.name}</li>)}
                    </ul>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:opacity-70 disabled:scale-100"
              >
                {isSubmitting ? 'Đang gửi yêu cầu...' : 'Gửi Yêu Cầu Chi Trả'}
              </button>
            </form>
          )}
        </div>

        {/* Lịch sử yêu cầu chi trả */}
        {allClaims.length > 0 && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">Lịch sử Yêu cầu</h2>
            <div className="space-y-4">
              {allClaims.map((claim, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-slate-800">{claim.productName}</p>
                      <p className="text-xs text-slate-500">HĐ: {claim.contractNumber}</p>
                      <p className="text-xs text-slate-500">Ngày gửi: {new Date(claim.requestDate).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${claim.status === 'Đã duyệt' ? 'bg-green-100 text-green-700' : claim.status === 'Từ chối' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{claim.status}</span>
                  </div>
                  <p className="mt-2 text-slate-600">Nội dung: {claim.reason}</p>
                  {claim.attachments && claim.attachments.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {claim.attachments.map((att, i) => {
                        const src = att.startsWith('http') ? att : `/${att.replace(/\\/g, '/')}`;
                        return <a key={i} href={src} target="_blank" rel="noreferrer" className="text-xs text-blue-600 underline">Tài liệu {i+1}</a>;
                      })}
                    </div>
                  )}
                  {claim.adminResponse && <p className="mt-2 text-slate-500 italic bg-white p-2 rounded border">Phản hồi: {claim.adminResponse}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ClaimRequestPage;