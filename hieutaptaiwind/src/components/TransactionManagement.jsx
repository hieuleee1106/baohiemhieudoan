import { useState, useEffect } from 'react';
import { useAuth } from '../pages/AuthContext';
// Component để quản lý và hiển thị lịch sử giao dịch
const TransactionManagement = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, loading: authLoading } = useAuth();

  const fetchTransactions = async () => {
    setLoading(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch('/api/transactions', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Lỗi khi tải lịch sử giao dịch.');
      const data = await res.json();
      setTransactions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && ['admin', 'staff'].includes(user?.role)) {
      fetchTransactions();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (loading || authLoading) return <p className="p-8 text-center text-slate-500">Đang tải dữ liệu giao dịch...</p>;
  if (error) return <p className="p-8 text-center text-red-500">{error}</p>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Lịch sử Giao dịch</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-slate-100">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">Mã GD</th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">Khách hàng</th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">Hợp đồng</th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">Số tiền</th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">Phương thức</th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">Trạng thái</th>
              <th className="text-left py-3 px-6 text-sm font-semibold text-slate-600 uppercase">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-slate-500">Chưa có giao dịch nào.</td>
              </tr>
            ) : (
              transactions.map((trans) => (
                <tr key={trans._id} className="odd:bg-white even:bg-slate-50/50 hover:bg-purple-50/50 transition-colors">
                  <td className="py-4 px-6 text-sm font-mono text-slate-500">{trans.transactionId || 'N/A'}</td>
                  <td className="py-4 px-6 font-medium text-slate-800">
                    {trans.user?.name}
                    <div className="text-xs text-slate-400 font-normal">{trans.user?.email}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-mono text-sm">
                    {trans.contract?.contractNumber || '---'}
                  </td>
                  <td className="py-4 px-6 font-bold text-slate-800">
                    {trans.amount?.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="py-4 px-6 text-slate-600">{trans.method}</td>
                  <td className="py-4 px-6">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full 
                      ${trans.status === 'Success' ? 'bg-green-100 text-green-800' : 
                        trans.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {trans.status === 'Success' ? 'Thành công' : trans.status === 'Pending' ? 'Đang xử lý' : 'Thất bại'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-slate-500">
                    {new Date(trans.createdAt).toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionManagement;