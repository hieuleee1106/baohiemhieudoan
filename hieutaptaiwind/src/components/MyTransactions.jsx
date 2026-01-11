import { useState, useEffect } from 'react';
import { useAuth } from '../pages/AuthContext';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const MyTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem('hieushop-token');
      try {
        const res = await fetch('/api/transactions/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Lỗi tải lịch sử giao dịch');
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchTransactions();
  }, [user]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-6 py-8">
        {loading ? <div className="p-12 text-center text-slate-500">Đang tải lịch sử giao dịch...</div> : 
         error ? <div className="p-12 text-center text-red-500">{error}</div> : (
      <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Lịch sử giao dịch</h1>
          <Link to="/my-contracts" className="text-purple-600 hover:text-purple-800 text-sm font-semibold hover:underline">
            Xem hợp đồng của tôi &rarr;
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-3 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mã GD</th>
                <th className="py-3 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Thông tin</th>
                <th className="py-3 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Số tiền</th>
                <th className="py-3 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Phương thức</th>
                <th className="py-3 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                <th className="py-3 px-6 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-500">Bạn chưa có giao dịch nào.</td>
                </tr>
              ) : (
                transactions.map((trans) => (
                  <tr key={trans._id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-mono text-slate-500">{trans.transactionId || '---'}</td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-slate-800">{trans.contract?.product?.name || 'Thanh toán hợp đồng'}</div>
                      <div className="text-xs text-slate-500">HĐ: {trans.contract?.contractNumber}</div>
                    </td>
                    <td className="py-4 px-6 text-sm font-bold text-slate-800">
                      {trans.amount?.toLocaleString('vi-VN')} ₫
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-600">{trans.method}</td>
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
        )}
      </main>
      <Footer />
    </div>
  );
};

export default MyTransactions;