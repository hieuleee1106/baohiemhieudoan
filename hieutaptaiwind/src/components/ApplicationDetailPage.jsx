import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

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

  return (
    <div>
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
              {documents?.map((doc, index) => (
                <div key={index} className="group relative">
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block border rounded-lg overflow-hidden aspect-square">
                    <img src={doc.url} alt={doc.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
                  </a>
                  <p className="text-xs text-center text-slate-500 mt-1 truncate" title={doc.name}>{doc.name}</p>
                </div>
              ))}
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
              <select id="status" name="status" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md">
                <option>Chờ duyệt</option>
                <option>Yêu cầu bổ sung</option>
                <option>Đã duyệt</option>
                <option>Từ chối</option>
              </select>
            </div>
            {updateMessage && <p className="text-sm text-center mt-2 text-green-600">{updateMessage}</p>}
            <button onClick={handleStatusUpdate} className="w-full mt-4 bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-700">
              Lưu thay đổi
            </button>
            {/* Nút tạo hợp đồng */}
            {status === 'Đã duyệt' && (
              <div className="mt-4 pt-4 border-t">
                <button 
                  onClick={handleCreateContract} 
                  disabled={isCreatingContract}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300"
                >
                  {isCreatingContract ? 'Đang tạo...' : 'Tạo hợp đồng'}
                </button>
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