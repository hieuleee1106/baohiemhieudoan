import { useState, useEffect } from 'react';
import { useAuth } from '../pages/AuthContext';
import ContractFormModal from './ContractFormModal'; // Sẽ tạo ở bước sau
import ConfirmModal from './ConfirmModal'; // Import modal xác nhận

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContract, setCurrentContract] = useState(null);
  const { user, loading: authLoading, showNotification } = useAuth();

  // State cho modal xóa
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State cho modal duyệt hủy
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState({ contract: null, action: '' }); // action: 'Approved' | 'Rejected'
  const [isReviewing, setIsReviewing] = useState(false);

  // State cho tìm kiếm và phân trang
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const statusStyles = {
    'Chờ thanh toán': 'bg-yellow-100 text-yellow-800',
    'Hiệu lực': 'bg-green-100 text-green-800',
    'Hết hạn': 'bg-red-100 text-red-800',
    'Yêu cầu hủy': 'bg-orange-100 text-orange-800',
    'Đã hủy': 'bg-gray-100 text-gray-800',
  };

  const fetchContracts = async () => {
    setLoading(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch('/api/contracts', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Lỗi khi tải danh sách hợp đồng.');
      const data = await res.json();
      setContracts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      fetchContracts();
    }
  }, [user, authLoading]);

  const handleOpenModal = (contract) => {
    setCurrentContract(contract);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentContract(null);
  };

  const handleSave = () => {
    handleCloseModal();
    showNotification('Cập nhật hợp đồng thành công.');
    fetchContracts();
  };

  // Mở modal xác nhận xóa
  const openDeleteModal = (contract) => {
    setContractToDelete(contract);
    setIsDeleteModalOpen(true);
  };

  // Đóng modal xác nhận xóa
  const closeDeleteModal = () => {
    setContractToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Hàm thực hiện xóa sau khi xác nhận
  const confirmDeleteContract = async () => {
    if (!contractToDelete) return;
    setIsDeleting(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch(`/api/contracts/${contractToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Xóa hợp đồng thất bại.');
      showNotification('Xóa hợp đồng thành công.');
      fetchContracts();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsDeleting(false);
      closeDeleteModal();
    }
  };

  // Mở modal xem chi tiết yêu cầu hủy
  const openReviewModal = (contract) => {
    setReviewData({ contract, action: '' });
    setIsReviewModalOpen(true);
  };

  // Xử lý duyệt/từ chối
  const handleReviewConfirm = async (decision) => {
    setIsReviewing(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch(`/api/contracts/${reviewData.contract._id}/cancel-review`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ decision }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Xử lý thất bại.');
      
      showNotification('Đã xử lý yêu cầu thành công.');
      fetchContracts();
      setIsReviewModalOpen(false);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsReviewing(false);
    }
  };

  // Logic lọc và phân trang
  const filteredContracts = contracts.filter(contract => 
    contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.product?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentContracts = filteredContracts.slice(indexOfFirstItem, indexOfLastItem);

  // Reset trang về 1 khi tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  if (loading || authLoading) return <p>Đang tải danh sách hợp đồng...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4 text-slate-800">Quản lý Hợp đồng</h1>
      
      {/* Thanh tìm kiếm */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm theo số HĐ, tên khách hàng hoặc sản phẩm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-1/2 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
        />
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteContract}
        title="Xác nhận xóa hợp đồng"
        isConfirming={isDeleting}
      >
        Bạn có chắc chắn muốn xóa hợp đồng <strong>{contractToDelete?.contractNumber}</strong>?
      </ConfirmModal>

      {/* Modal Xem chi tiết và Xử lý yêu cầu hủy (Custom Modal) */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={() => setIsReviewModalOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg transform transition-all animate-slide-up" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Chi tiết yêu cầu hủy</h3>
            
            <div className="space-y-3 mb-6">
              <p><strong>Hợp đồng số:</strong> {reviewData.contract?.contractNumber}</p>
              <p><strong>Khách hàng:</strong> {reviewData.contract?.user?.name}</p>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase mb-2">Lý do hủy:</p>
                <p className="text-slate-700 italic">"{reviewData.contract?.cancellation?.reason}"</p>
                <p className="text-xs text-slate-400 mt-2 text-right">
                  Gửi lúc: {new Date(reviewData.contract?.cancellation?.requestedAt).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsReviewModalOpen(false)} className="px-4 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors" disabled={isReviewing}>
                Đóng
              </button>
              {/* Chỉ hiện nút duyệt hủy nếu có yêu cầu hủy đang chờ */}
              {reviewData.contract?.cancellation?.isRequested && reviewData.contract?.cancellation?.status === 'Chờ duyệt' && (
                <>
              <button onClick={() => handleReviewConfirm('reject')} className="px-4 py-2 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 transition-colors border border-red-200" disabled={isReviewing}>
                {isReviewing ? 'Đang xử lý...' : 'Từ chối'}
              </button>
              <button onClick={() => handleReviewConfirm('approve')} className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg" disabled={isReviewing}>
                {isReviewing ? 'Đang xử lý...' : 'Duyệt yêu cầu'}
              </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-sm">Số HĐ</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Khách hàng</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Sản phẩm</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Trạng thái</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentContracts.map((contract) => {
              // Kiểm tra xem có yêu cầu hủy đang chờ không
              const isCancellationPending = contract.cancellation?.isRequested && contract.cancellation?.status === 'Chờ duyệt';
              
              return (
              <tr key={contract._id} className={`border-b border-slate-200 hover:bg-slate-50 ${isCancellationPending ? 'bg-orange-50' : ''}`}>
                <td className="py-3 px-4 font-mono text-xs">{contract.contractNumber}</td>
                <td className="py-3 px-4">{contract.user?.name || 'Người dùng đã bị xóa'}</td>
                <td className="py-3 px-4">{contract.product?.name || 'Sản phẩm đã bị xóa'}</td>
                <td className="py-3 px-4">
                  {/* Sử dụng flex-col để xếp chồng trạng thái, tránh bị đè chữ */}
                  <div className="flex flex-col gap-2 items-start">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[contract.status]}`}>{contract.status}</span>
                    {isCancellationPending && (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-500 text-white animate-pulse">Yêu cầu hủy</span>
                    )}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {isCancellationPending ? (
                    <button 
                      onClick={() => openReviewModal(contract)} 
                      className="text-purple-600 bg-purple-50 hover:bg-purple-100 border border-purple-200 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <span>👁️</span> Xem yêu cầu
                    </button>
                  ) : (
                    <>
                      <button onClick={() => handleOpenModal(contract)} className="text-purple-600 hover:text-purple-800 font-semibold">Sửa</button>
                      <button onClick={() => openDeleteModal(contract)} className="text-red-600 hover:text-red-800 font-semibold ml-4">Xóa</button>
                    </>
                  )}
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 border rounded hover:bg-slate-100 disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-4 py-2 font-semibold text-slate-700">Trang {currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 border rounded hover:bg-slate-100 disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      )}

      {isModalOpen && (
        <ContractFormModal
          contract={currentContract}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ContractManagement;