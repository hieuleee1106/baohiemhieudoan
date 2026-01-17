import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from './Button';

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [contractMessage, setContractMessage] = useState('');
  const [isCreatingContract, setIsCreatingContract] = useState(false);

  useEffect(() => {
    // ... (giữ nguyên)
    const fetchApplication = async () => {
      const token = localStorage.getItem('hieushop-token');
      try {
        const res = await fetch(`/api/applications/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Không thể tải thông tin hồ sơ.');
        const data = await res.json();
        setApplication(data);
        setNewStatus(data.status); // Khởi tạo trạng thái cho select box
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id]);

  const handleStatusUpdate = async () => {
    // ... (giữ nguyên)
    setUpdateMessage('');
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cập nhật thất bại.');
      
      setApplication(data.application); // Cập nhật lại dữ liệu hồ sơ
      setUpdateMessage('Cập nhật thành công!');
      setTimeout(() => setUpdateMessage(''), 3000); // Ẩn thông báo sau 3 giây
    } catch (err) {
      setUpdateMessage(err.message);
    }
  };

  const handleCreateContract = async () => {
    setIsCreatingContract(true);
    setContractMessage('');
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Tạo hợp đồng thất bại.');
      
      setContractMessage(data.message);
      // Có thể thêm logic để disable nút sau khi tạo thành công
    } catch (err) {
      setContractMessage(err.message);
    } finally {
      setIsCreatingContract(false);
    }
  };

  if (loading) return <p>Đang tải chi tiết hồ sơ...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!application) return <p>Không tìm thấy hồ sơ.</p>;

  const { applicant, product, applicationData, documents, status, createdAt } = application;
  const isFinalStatus = ['Đã duyệt', 'Từ chối'].includes(status);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="mb-6">
        <Link to="/admin/dashboard/applications" className="text-purple-600 hover:underline font-semibold">
          &larr; Quay lại danh sách
        </Link>
      </div>
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Chi tiết Hồ sơ Đăng ký</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-50 p-6 rounded-lg border">
          <h2 className="text-xl font-bold mb-4 border-b pb-2">Thông tin người đăng ký</h2>
          <div className="space-y-3">
            <p><strong>Họ và tên:</strong> {applicationData.fullName}</p>
            <p><strong>Ngày sinh:</strong> {new Date(applicationData.dob).toLocaleDateString('vi-VN')}</p>
            <p><strong>Số CCCD/CMND:</strong> {applicationData.idNumber}</p>
            <p><strong>Địa chỉ:</strong> {applicationData.address || 'N/A'}</p>
            <p><strong>Email liên hệ:</strong> {applicant?.email || 'N/A'}</p>
          </div>

          <h2 className="text-xl font-bold mb-4 mt-8 border-b pb-2">Tài liệu đính kèm</h2>
          {documents.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {documents?.map((doc, index) => {
                // Kiểm tra xem file có phải là ảnh không dựa vào đuôi file hoặc tên
                const docUrl = doc.url;
                const isImage = docUrl.startsWith('http') && (/\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(doc.name) || /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(docUrl));
                
                return (
                  <div key={index} className="group relative">
                    <a href={docUrl} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden aspect-square bg-slate-100 flex items-center justify-center">
                      {isImage ? (
                        <img src={docUrl} alt={doc.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" onError={(e) => {e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=Error'}} />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400 p-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[10px] font-bold uppercase truncate max-w-full">{doc.name.split('.').pop() || 'FILE'}</span>
                        </div>
                      )}
                    </a>
                    <p className="text-xs text-center text-slate-500 mt-1 truncate px-1" title={doc.name}>{doc.name}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p>Không có tài liệu nào.</p>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-lg border">
            <h2 className="text-xl font-bold mb-4">Thông tin sản phẩm</h2>
            <p><strong>Tên sản phẩm:</strong> {product?.name || 'Sản phẩm đã bị xóa'}</p>
            <p><strong>Nhà cung cấp:</strong> {product?.provider || 'N/A'}</p>
            <p><strong>Loại hình:</strong> {product?.category || 'N/A'}</p>
          </div>
          <div className="bg-slate-50 p-6 rounded-lg border">
            <h2 className="text-xl font-bold mb-4">Trạng thái hồ sơ</h2>
            <p><strong>Ngày nộp:</strong> {new Date(createdAt).toLocaleString('vi-VN')}</p>
            <div className="mt-4">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Cập nhật trạng thái</label>
              <select id="status" name="status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} disabled={isFinalStatus} className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md ${isFinalStatus ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}>
                <option>Chờ duyệt</option>
                <option>Yêu cầu bổ sung</option>
                <option>Đã duyệt</option>
                <option>Từ chối</option>
              </select>
            </div>
            {updateMessage && <p className="text-sm text-center mt-2 text-green-600">{updateMessage}</p>}
            {!isFinalStatus ? (
              <Button onClick={handleStatusUpdate} variant="slide-purple" className="w-full mt-4">
                Lưu thay đổi
              </Button>
            ) : (
              <p className="text-sm text-center mt-4 text-slate-500 italic bg-slate-100 p-2 rounded">
                Hồ sơ đã {status.toLowerCase()}, không thể thay đổi trạng thái.
              </p>
            )}
            {/* Nút tạo hợp đồng */}
            {status === 'Đã duyệt' && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  onClick={handleCreateContract}
                  disabled={isCreatingContract}
                  variant="slide-green"
                  className="w-full"
                >
                  {isCreatingContract ? 'Đang tạo...' : 'Tạo hợp đồng'}
                </Button>
                {contractMessage && <p className="text-sm text-center mt-2 text-blue-600">{contractMessage}</p>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailPage;