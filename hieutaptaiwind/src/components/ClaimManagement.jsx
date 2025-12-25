import { useState, useEffect } from 'react';
import { useAuth } from '../pages/AuthContext';
import ConfirmModal from './ConfirmModal';

const ClaimManagement = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
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
      // Lấy tất cả hợp đồng, sau đó lọc ra các claims
      const res = await fetch('/api/contracts', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const contracts = await res.json();
      
      // Flatten claims từ tất cả hợp đồng
      const allClaims = [];
      contracts.forEach(contract => {
        if (contract.claims && contract.claims.length > 0) {
          contract.claims.forEach(claim => {
            allClaims.push({
              ...claim,
              contractId: contract._id,
              contractNumber: contract.contractNumber,
              userName: contract.user?.name,
              productName: contract.product?.name
            });
          });
        }
      });

      // Sắp xếp theo ngày gửi mới nhất
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Quản lý Yêu cầu Bồi thường</h1>
      
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
        ></textarea>
      </ConfirmModal>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="py-3 px-4 text-left">Ngày gửi</th>
              <th className="py-3 px-4 text-left">Khách hàng / HĐ</th>
              <th className="py-3 px-4 text-left">Lý do</th>
              <th className="py-3 px-4 text-left">Minh chứng</th>
              <th className="py-3 px-4 text-left">Trạng thái</th>
              <th className="py-3 px-4 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {claims.map((claim, idx) => (
              <tr key={idx} className="border-b hover:bg-slate-50">
                <td className="py-3 px-4">{new Date(claim.requestDate).toLocaleDateString('vi-VN')}</td>
                <td className="py-3 px-4">
                  <p className="font-bold">{claim.userName}</p>
                  <p className="text-xs text-slate-500">{claim.contractNumber}</p>
                  <p className="text-xs text-purple-600">{claim.productName}</p>
                </td>
                <td className="py-3 px-4 max-w-xs">
                  <p className="truncate" title={claim.reason}>{claim.reason}</p>                  
                </td>
                <td className="py-3 px-4">
                  {claim.attachments?.length > 0 ? (
                    <div className="flex gap-1 flex-wrap">
                      {claim.attachments.map((att, i) => {
                        const src = att.startsWith('http') ? att : `/${att.replace(/\\/g, '/')}`;
                        return (
                          <a key={i} href={src} target="_blank" rel="noreferrer" className="block w-8 h-8 bg-slate-200 rounded border overflow-hidden">
                            <img src={src} alt="doc" className="w-full h-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/32?text=ERR'} />
                          </a>
                        );
                      })}
                    </div>
                  ) : <span className="text-slate-400 italic">Không có</span>}
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${claim.status === 'Chờ xử lý' ? 'bg-orange-100 text-orange-700' : claim.status === 'Đã duyệt' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {claim.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  {claim.status === 'Chờ xử lý' && (
                    <div className="flex gap-2">
                      <button onClick={() => openProcessModal(claim, 'approve')} className="text-green-600 hover:bg-green-50 px-2 py-1 rounded border border-green-200 text-xs font-bold">✓ Duyệt</button>
                      <button onClick={() => openProcessModal(claim, 'reject')} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded border border-red-200 text-xs font-bold">✕ Từ chối</button>
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