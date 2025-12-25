import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../pages/AuthContext';
import ConfirmModal from './ConfirmModal'; // Import modal xác nhận

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading, showNotification } = useAuth();

  // State cho modal xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusStyles = {
    'Chờ duyệt': 'bg-blue-100 text-blue-800',
    'Yêu cầu bổ sung': 'bg-yellow-100 text-yellow-800',
    'Đã duyệt': 'bg-green-100 text-green-800',
    'Từ chối': 'bg-red-100 text-red-800',
  };

  const fetchApplications = async () => {
    setLoading(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch('/api/applications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Lỗi khi tải danh sách hồ sơ.');
      const data = await res.json();
      setApplications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      fetchApplications();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  const openDeleteModal = (app) => {
    setAppToDelete(app);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!appToDelete) return;
    setIsDeleting(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch(`/api/applications/${appToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Xóa hồ sơ thất bại.');
      }
      showNotification('Đã xóa hồ sơ thành công.');
      fetchApplications(); // Tải lại danh sách
      setIsDeleteModalOpen(false);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa hồ sơ"
        confirmText="Xóa vĩnh viễn"
        isConfirming={isDeleting}
      >
        Bạn có chắc chắn muốn xóa vĩnh viễn hồ sơ của <strong>{appToDelete?.applicant?.name}</strong> cho sản phẩm <strong>{appToDelete?.product?.name}</strong>? Hành động này không thể hoàn tác.
      </ConfirmModal>

      <h1 className="text-3xl font-bold mb-6 text-slate-800">Quản lý Hồ sơ Đăng ký</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-sm">Người đăng ký</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Sản phẩm</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Ngày nộp</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Trạng thái</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr key={app._id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">{app.applicant?.name || 'Người dùng đã bị xóa'}</td>
                <td className="py-3 px-4">{app.product?.name || 'Sản phẩm đã bị xóa'}</td>
                <td className="py-3 px-4 text-sm text-slate-500">{new Date(app.createdAt).toLocaleDateString('vi-VN')}</td>
                <td className="py-3 px-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[app.status]}`}>{app.status}</span></td>
                <td className="py-3 px-4 flex gap-4">
                  <Link to={`/admin/dashboard/applications/${app._id}`} className="text-purple-600 hover:text-purple-800 font-semibold">
                    Xem chi tiết
                  </Link>
                  <button onClick={() => openDeleteModal(app)} className="text-red-600 hover:text-red-800 font-semibold">
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApplicationManagement;