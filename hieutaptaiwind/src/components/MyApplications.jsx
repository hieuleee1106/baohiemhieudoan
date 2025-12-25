import { useState, useEffect } from 'react';
import ConfirmModal from './ConfirmModal'; // Import modal xác nhận
import { useAuth } from '../pages/AuthContext'; // Import để dùng showNotification

const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null); // State để theo dõi mục nào đang được mở rộng
  const [filterStatus, setFilterStatus] = useState('Tất cả'); // State cho bộ lọc
  const { showNotification } = useAuth();

  // State cho chức năng xóa
  const [isHideModalOpen, setIsHideModalOpen] = useState(false);
  const [appToHide, setAppToHide] = useState(null);
  const [isHiding, setIsHiding] = useState(false);

  const statusStyles = {
    'Chờ duyệt': 'bg-blue-100 text-blue-800',
    'Yêu cầu bổ sung': 'bg-yellow-100 text-yellow-800',
    'Đã duyệt': 'bg-green-100 text-green-800',
    'Từ chối': 'bg-red-100 text-red-800',
  };

  // Hàm để bật/tắt hiển thị chi tiết
  const handleToggleDetails = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const fetchMyApplications = async () => {
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch('/api/applications/my', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Không thể tải danh sách hồ sơ của bạn.');
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyApplications();
  }, []);

  const openHideModal = (app) => {
    setAppToHide(app);
    setIsHideModalOpen(true);
  };

 const handleHide = async () => {
  if (!appToHide) return;
  setIsHiding(true);
  const token = localStorage.getItem('hieushop-token');
  try {
    const res = await fetch(`/api/applications/${appToHide._id}/hide`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Xóa thất bại.');
    }
    showNotification('Xóa thành công.');
    fetchMyApplications(); // Tải lại danh sách
    setIsHideModalOpen(false);
  } catch (err) {
    showNotification(err.message, 'error');
  } finally {
    setIsHiding(false);
  }
};


  // Logic lọc
  const filteredApplications = applications
    .filter(app => !app.isHidden) // Lọc ra những hồ sơ chưa bị ẩn
    .filter(app => filterStatus === 'Tất cả' ? true : app.status === filterStatus);

  if (loading) return <p>Đang tải hồ sơ của bạn...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-8 pt-8 border-t border-slate-200">
      <ConfirmModal
        isOpen={isHideModalOpen}
        onClose={() => setIsHideModalOpen(false)}
        onConfirm={handleHide}
        title="Xác nhận Xóa hồ sơ"
        confirmText="Đồng ý Xóa"
        isConfirming={isHiding}
      >
        Bạn có chắc chắn muốn Xóa hồ sơ đăng ký cho sản phẩm <strong>{appToHide?.product?.name}</strong>? Hồ sơ sẽ không còn hiển thị trong danh sách này.
      </ConfirmModal>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-700">🧑Sản phẩm đã đăng ký</h2>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-auto min-w-[200px] px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white text-slate-700 shadow-sm"
        >
          <option value="Tất cả">Tất cả trạng thái</option>
          {Object.keys(statusStyles).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {filteredApplications.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Không có hồ sơ nào phù hợp.</p>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map(app => (
            <div key={app._id} className="bg-white border border-slate-200 rounded-xl shadow-sm transition-all duration-300">
              <div 
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-50"
                onClick={() => handleToggleDetails(app._id)}
              >
                <div>
                  <p className="font-bold text-slate-800">{app.product?.name || 'Sản phẩm không còn tồn tại'}</p>
                  <p className="text-sm text-slate-500">Ngày nộp: {new Date(app.createdAt).toLocaleDateString('vi-VN')}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[app.status]}`}>{app.status}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-500 transition-transform duration-300 ${expandedId === app._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Phần hiển thị chi tiết khi được mở rộng */}
              {expandedId === app._id && (
                <div className="p-4 border-t border-slate-200 animate-fade-in-down">
                  <h4 className="font-semibold text-slate-700 mb-3">Chi tiết hồ sơ:</h4>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p><strong>Họ và tên:</strong> {app.applicationData.fullName}</p>
                    <p><strong>Ngày sinh:</strong> {new Date(app.applicationData.dob).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Số CCCD/CMND:</strong> {app.applicationData.idNumber}</p>
                    <p><strong>Địa chỉ:</strong> {app.applicationData.address}</p>
                  </div>
                  <h4 className="font-semibold text-slate-700 mt-4 mb-3">Tài liệu đính kèm:</h4>
                  <div className="flex justify-between items-start">
                    {app.documents.length > 0 ? (
                      <ul className="list-disc list-inside space-y-1">
                        {app.documents.map((doc, index) => <li key={index}><a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline break-all">{doc.name}</a></li>)}
                      </ul>
                    ) : <p className="text-sm text-slate-500">Không có tài liệu nào.</p>}
                    <button onClick={(e) => { e.stopPropagation(); openHideModal(app); }} className="text-gray-500 hover:text-red-700 text-sm font-semibold underline">Xóa</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;