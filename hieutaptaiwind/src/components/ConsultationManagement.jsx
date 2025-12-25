import { useState, useEffect } from 'react';
import { useAuth } from '../pages/AuthContext';

const ConsultationManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const statusStyles = {
    'Mới': 'bg-blue-100 text-blue-800',
    'Đã liên hệ': 'bg-yellow-100 text-yellow-800',
    'Hoàn thành': 'bg-green-100 text-green-800',
  };
  const { user, loading: authLoading } = useAuth();

  const fetchRequests = async () => {
    setLoading(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch('/api/consultations', {
        headers: { 'Authorization': `Bearer ${token}` },
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
  }, [user, authLoading]);

  const handleStatusChange = async (id, newStatus) => {
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Cập nhật thất bại.');
      // Tải lại danh sách để cập nhật giao diện
      fetchRequests();
    } catch (err) {
      alert(err.message);
    }
  };

  // Hiển thị loading trong khi xác thực hoặc fetch dữ liệu
  if (authLoading || loading) return <p>Đang tải dữ liệu tư vấn...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Quản lý Yêu cầu Tư vấn</h1>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-sm">Khách hàng</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Điện thoại</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Sản phẩm quan tâm</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req._id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="py-3 px-4 font-medium">{req.customerName}</td>
                <td className="py-3 px-4">{req.customerPhone}</td>
                <td className="py-3 px-4">{req.product?.name || 'N/A'}</td>
                <td className="py-3 px-4">
                  <select
                    value={req.status}
                    onChange={(e) => handleStatusChange(req._id, e.target.value)}
                    className={`p-1 rounded text-xs font-semibold border-none ${statusStyles[req.status]}`}
                  >
                    {Object.keys(statusStyles).map(status => <option key={status} value={status}>{status}</option>)}
                  </select>
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