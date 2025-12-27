import { useState, useEffect } from 'react';
import { useAuth } from '../pages/AuthContext';
import ContractFormModal from './ContractFormModal';
import ConfirmModal from './ConfirmModal';
import Button from './Button';

const ContractManagement = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentContract, setCurrentContract] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewData, setReviewData] = useState(null);
  const [isReviewing, setIsReviewing] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Tất cả');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { user, loading: authLoading, showNotification } = useAuth();

  const statusStyles = {
    'Chờ thanh toán': 'bg-yellow-100 text-yellow-800',
    'Hiệu lực': 'bg-green-100 text-green-800',
    'Hết hạn': 'bg-red-100 text-red-800',
    'Yêu cầu hủy': 'bg-orange-100 text-orange-800',
    'Đã hủy': 'bg-gray-100 text-gray-800',
  };

  const statusList = ['Tất cả', ...Object.keys(statusStyles)];

  const fetchContracts = async () => {
    setLoading(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch('/api/contracts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Lỗi khi tải danh sách hợp đồng.');
      setContracts(await res.json());
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

  /* ================= FILTER + PAGINATION ================= */
  const filteredContracts = contracts.filter(c => {
    const keyword =
      c.contractNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.product?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const statusMatch =
      filterStatus === 'Tất cả' ? true : c.status === filterStatus;

    return keyword && statusMatch;
  });

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const currentContracts = filteredContracts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => setCurrentPage(1), [searchTerm, filterStatus]);

  /* ================= ACTIONS ================= */
  const confirmDeleteContract = async () => {
    setIsDeleting(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      await fetch(`/api/contracts/${contractToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      showNotification('Xóa hợp đồng thành công');
      fetchContracts();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleReviewConfirm = async (decision) => {
    setIsReviewing(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      await fetch(`/api/contracts/${reviewData._id}/cancel-review`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ decision }),
      });
      showNotification('Đã xử lý yêu cầu hủy');
      fetchContracts();
      setIsReviewModalOpen(false);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsReviewing(false);
    }
  };

  if (loading || authLoading) return <p>Đang tải danh sách hợp đồng...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">Quản lý Hợp đồng</h1>

      {/* SEARCH */}
      <input
        type="text"
        placeholder="Tìm theo số HĐ, khách hàng, sản phẩm..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="w-full mb-6 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500"
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteContract}
        isConfirming={isDeleting}
        title="Xác nhận xóa hợp đồng"
      >
        Xóa hợp đồng <strong>{contractToDelete?.contractNumber}</strong>?
      </ConfirmModal>

      {/* TABLE */}
      <div className="overflow-x-auto rounded-xl border">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left">Số HĐ</th>
              <th className="px-6 py-3 text-left">Khách hàng</th>
              <th className="px-6 py-3 text-left">Sản phẩm</th>
              <th className="px-6 py-3 text-left">
                <div className="flex flex-col sm:flex-row gap-1">
                  <span>Trạng thái</span>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {statusList.map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </th>
              <th className="px-6 py-3 text-left">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentContracts.map(c => {
              const pendingCancel =
                c.cancellation?.isRequested &&
                c.cancellation?.status === 'Chờ duyệt';

              return (
                <tr key={c._id} className="hover:bg-purple-50">
                  <td className="px-6 py-4 font-mono text-xs">{c.contractNumber}</td>
                  <td className="px-6 py-4">{c.user?.name}</td>
                  <td className="px-6 py-4">{c.product?.name}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${statusStyles[c.status]}`}>
                      {c.status}
                    </span>
                    {pendingCancel && (
                      <span className="ml-2 px-2 py-1 text-xs bg-orange-500 text-white rounded-full animate-pulse">
                        Yêu cầu hủy
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {pendingCancel ? (
                      <Button
                        size="sm"
                        variant="slide-purple"
                        onClick={() => {
                          setReviewData(c);
                          setIsReviewModalOpen(true);
                        }}
                      >
                        Xem yêu cầu
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="slide" onClick={() => {
                          setCurrentContract(c);
                          setIsModalOpen(true);
                        }}>
                          Sửa
                        </Button>
                        <Button size="sm" variant="slide-red" onClick={() => {
                          setContractToDelete(c);
                          setIsDeleteModalOpen(true);
                        }}>
                          Xóa
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-6">
          <Button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
            Trước
          </Button>
          <span>Trang {currentPage} / {totalPages}</span>
          <Button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
            Sau
          </Button>
        </div>
      )}

      {isModalOpen && (
        <ContractFormModal
          contract={currentContract}
          onClose={() => setIsModalOpen(false)}
          onSave={() => {
            setIsModalOpen(false);
            fetchContracts();
          }}
        />
      )}
    </div>
  );
};

export default ContractManagement;
