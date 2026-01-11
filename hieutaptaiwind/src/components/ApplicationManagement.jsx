import { useState, useEffect } from 'react';
import Button from './Button';
import { useAuth } from '../pages/AuthContext';
import ConfirmModal from './ConfirmModal';

const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const { user, loading: authLoading, showNotification } = useAuth();

  // Modal xóa
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
        headers: { Authorization: `Bearer ${token}` },
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
    if (!authLoading && ['admin', 'staff'].includes(user?.role)) {
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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Xóa hồ sơ thất bại.');
      }
      showNotification('Đã xóa hồ sơ thành công.');
      fetchApplications();
      setIsDeleteModalOpen(false);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || authLoading) return <p>Đang tải...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const filteredApplications = applications.filter(app =>
    filterStatus === 'Tất cả' ? true : app.status === filterStatus
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">
        Quản lý Hồ sơ Đăng ký
      </h1>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa hồ sơ"
        confirmText="Xóa vĩnh viễn"
        isConfirming={isDeleting}
      >
        Bạn có chắc chắn muốn xóa hồ sơ của{' '}
        <strong>{appToDelete?.applicant?.name}</strong> cho sản phẩm{' '}
        <strong>{appToDelete?.product?.name}</strong>?
      </ConfirmModal>

      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-slate-100">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">
                Người đăng ký
              </th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">
                Sản phẩm
              </th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">
                Ngày nộp
              </th>

              {/* FILTER TRONG CỘT TRẠNG THÁI */}
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">
                <div className="flex flex-col gap-1">
                  <span>Trạng thái</span>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="text-xs px-2 py-1 border border-slate-300 rounded-md bg-white text-slate-600 focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="Tất cả">Tất cả</option>
                    {Object.keys(statusStyles).map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </th>

              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredApplications.map(app => (
              <tr
                key={app._id}
                className="odd:bg-white even:bg-slate-50/50 hover:bg-purple-50/50 transition-colors"
              >
                <td className="py-4 px-6 font-medium text-slate-800">
                  {app.applicant?.name || 'Người dùng đã bị xóa'}
                </td>
                <td className="py-4 px-6 text-slate-600">
                  {app.product?.name || 'Sản phẩm đã bị xóa'}
                </td>
                <td className="py-4 px-6 text-sm text-slate-500">
                  {new Date(app.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="py-4 px-6">
                  <span
                    className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusStyles[app.status]}`}
                  >
                    {app.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex gap-3">
                    <Button
                      as="link"
                      to={`/admin/dashboard/applications/${app._id}`}
                      variant="slide"
                      size="sm"
                    >
                      Xem chi tiết
                    </Button>
                    <Button
                      onClick={() => openDeleteModal(app)}
                      variant="slide-red"
                      size="sm"
                    >
                      Xóa
                    </Button>
                  </div>
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
