import { useState, useEffect } from 'react';
import { useAuth } from '../pages/AuthContext';
import Button from './Button';
import ConfirmModal from './ConfirmModal';

const ClaimManagement = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminResponse, setAdminResponse] = useState('');
  const [actionType, setActionType] = useState(''); // 'approve' | 'reject'
  const [isProcessing, setIsProcessing] = useState(false);
  const { showNotification } = useAuth();

  const fetchClaims = async () => {
    setLoading(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch('/api/contracts', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const contracts = await res.json();

      const allClaims = [];
      contracts.forEach(contract => {
        if (contract.claims?.length > 0) {
          contract.claims.forEach(claim => {
            allClaims.push({
              ...claim,
              contractId: contract._id,
              contractNumber: contract.contractNumber,
              userName: contract.user?.name,
              productName: contract.product?.name,
            });
          });
        }
      });

      allClaims.sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate));
      setClaims(allClaims);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const openProcessModal = (claim, type) => {
    setSelectedClaim(claim);
    setActionType(type);
    setAdminResponse('');
    setIsModalOpen(true);
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    const token = localStorage.getItem('hieushop-token');
    const status = actionType === 'approve' ? 'Đã duyệt' : 'Từ chối';

    try {
      const res = await fetch(`/api/contracts/${selectedClaim.contractId}/claims/${selectedClaim._id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status, adminResponse }),
      });

      if (!res.ok) throw new Error('Xử lý thất bại');

      showNotification(`Đã ${status.toLowerCase()} yêu cầu thành công.`);
      setIsModalOpen(false);
      fetchClaims();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <p>Đang tải danh sách yêu cầu...</p>;

  const statuses = ['Tất cả', 'Chờ xử lý', 'Đã duyệt', 'Từ chối'];
  const filteredClaims = claims.filter(claim =>
    filterStatus === 'Tất cả' ? true : claim.status === filterStatus
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Quản lý Yêu cầu Bồi thường</h1>

      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleProcess}
        title={actionType === 'approve' ? "Duyệt yêu cầu chi trả" : "Từ chối yêu cầu"}
        confirmText={actionType === 'approve' ? "Duyệt" : "Từ chối"}
        confirmVariant={actionType === 'approve' ? "primary" : "danger"}
        isConfirming={isProcessing}
      >
        <p className="mb-2">Bạn đang xử lý yêu cầu của <strong>{selectedClaim?.userName}</strong>.</p>
        <textarea
          className="w-full border p-2 rounded"
          placeholder="Nhập ghi chú/phản hồi cho khách hàng..."
          value={adminResponse}
          onChange={e => setAdminResponse(e.target.value)}
        />
      </ConfirmModal>

      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-slate-100">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="py-3 px-6 text-left font-semibold text-sm text-slate-600 uppercase tracking-wider">Ngày gửi</th>
              <th className="py-3 px-6 text-left font-semibold text-sm text-slate-600 uppercase tracking-wider">Khách hàng / HĐ</th>
              <th className="py-3 px-6 text-left font-semibold text-sm text-slate-600 uppercase tracking-wider">Lý do</th>
              <th className="py-3 px-6 text-left font-semibold text-sm text-slate-600 uppercase tracking-wider">Minh chứng</th>
              <th className="py-3 px-6 text-left font-semibold text-sm text-slate-600 uppercase tracking-wider">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span>Trạng thái</span>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="sm:ml-2 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none bg-white text-slate-700 shadow-sm cursor-pointer"
                  >
                    {statuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </th>
              <th className="py-3 px-6 text-left font-semibold text-sm text-slate-600 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.map((claim, idx) => (
              <tr key={idx} className="odd:bg-white even:bg-slate-50/50 hover:bg-purple-50/50 transition-colors">
                <td className="py-4 px-6 whitespace-nowrap text-slate-600">{new Date(claim.requestDate).toLocaleDateString('vi-VN')}</td>
                <td className="py-4 px-6">
                  <p className="font-bold">{claim.userName}</p>
                  <p className="text-xs text-slate-500">{claim.contractNumber}</p>
                  <p className="text-xs text-purple-600">{claim.productName}</p>
                </td>
                <td className="py-4 px-6 max-w-xs">
                  <p className="truncate" title={claim.reason}>{claim.reason}</p>                  
                </td>
                <td className="py-4 px-6">
                  {claim.attachments?.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {claim.attachments.map((att, i) => {
                        const src = att.startsWith('http') ? att : `/${att.replace(/\\/g, '/')}`;
                        return (
                          <a key={i} href={src} target="_blank" rel="noreferrer" className="block w-10 h-10 bg-slate-100 rounded border overflow-hidden hover:ring-2 hover:ring-purple-500 transition-all">
                            <img src={src} alt="doc" className="w-full h-full object-cover" onError={e => e.target.src = 'https://via.placeholder.com/32?text=ERR'} />
                          </a>
                        );
                      })}
                    </div>
                  ) : <span className="text-slate-400 italic">Không có</span>}
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${claim.status === 'Chờ xử lý' ? 'bg-orange-100 text-orange-700' : claim.status === 'Đã duyệt' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {claim.status}
                  </span>
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  {claim.status === 'Chờ xử lý' && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button size="sm" variant="subtle" className="!text-green-600 hover:!bg-green-50" onClick={() => openProcessModal(claim, 'approve')}>
                        ✓ Duyệt
                      </Button>
                      <Button size="sm" variant="subtle" className="!text-red-600 hover:!bg-red-50" onClick={() => openProcessModal(claim, 'reject')}>
                        ✕ Từ chối
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClaimManagement;
