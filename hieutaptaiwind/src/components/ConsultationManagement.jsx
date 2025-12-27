import { useState, useEffect } from 'react';
import { useAuth } from '../pages/AuthContext';
import Button from './Button';
import ConfirmModal from './ConfirmModal';

const ConsultationManagement = () => {
  const { user, loading: authLoading, showNotification } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  // State for delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusStyles = {
    'Mới': 'bg-blue-100 text-blue-800',
    'Đã liên hệ': 'bg-yellow-100 text-yellow-800',
    'Hoàn thành': 'bg-green-100 text-green-800',
  };

  const fetchRequests = async () => {
    setLoading(true);
    const token = localStorage.getItem('hieushop-token');

    try {
      const res = await fetch('/api/consultations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Lỗi khi tải danh sách yêu cầu.');
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      fetchRequests();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, user]);

  const handleStatusChange = async (id, newStatus) => {
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      fetchRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  // --- Delete Logic ---
  const openDeleteModal = (request) => {
    setRequestToDelete(request);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setRequestToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const confirmDeleteRequest = async () => {
    if (!requestToDelete) return;
    setIsDeleting(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch(`/api/consultations/${requestToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Xóa yêu cầu thất bại.');
      }

      showNotification('Đã xóa yêu cầu tư vấn.');
      fetchRequests(); // Reload data
      closeDeleteModal();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (authLoading || loading) return <p>Đang tải dữ liệu tư vấn...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const filteredRequests = requests.filter(req =>
    filterStatus === 'Tất cả' ? true : req.status === filterStatus
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteRequest}
        title="Xác nhận xóa yêu cầu"
        isConfirming={isDeleting}
      >
        Bạn có chắc chắn muốn xóa yêu cầu của <strong>{requestToDelete?.customerName}</strong>?
      </ConfirmModal>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Quản lý Yêu cầu Tư vấn</h1>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-auto min-w-[220px] px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white text-slate-700 shadow-sm cursor-pointer"
        >
          <option value="Tất cả">Tất cả trạng thái</option>
          {Object.keys(statusStyles).map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-md">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">
                Khách hàng
              </th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">
                Điện thoại
              </th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">
                Sản phẩm quan tâm
              </th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">
                Trạng thái
              </th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">
                Hành động
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredRequests.map(req => (
              <tr
                key={req._id}
                className="odd:bg-white even:bg-slate-50/50 hover:bg-purple-50/50 transition-colors"
              >
                <td className="py-4 px-6 font-medium text-slate-800">
                  {req.customerName}
                </td>
                <td className="py-4 px-6 text-slate-600">
                  {req.customerPhone}
                </td>
                <td className="py-4 px-6 text-slate-600">
                  {req.product?.name || 'N/A'}
                </td>
                <td className="py-4 px-6">
                  <select
                    value={req.status}
                    onChange={(e) =>
                      handleStatusChange(req._id, e.target.value)
                    }
                    className={`px-2 py-1 text-xs font-semibold rounded border-none cursor-pointer ${statusStyles[req.status]}`}
                  >
                    {Object.keys(statusStyles).map(status => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="py-4 px-6">
                  <Button
                    variant="slide-red"
                    size="sm"
                    onClick={() => openDeleteModal(req)}>
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ConsultationManagement;
