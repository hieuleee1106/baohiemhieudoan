import { useState, useEffect } from 'react';
import { useAuth } from '../pages/AuthContext'; // Import useAuth để lấy thông tin người dùng
import ConfirmModal from './ConfirmModal';

const MyContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user, showNotification } = useAuth(); // Lấy thông tin người dùng từ context

  // State cho chức năng hủy hợp đồng
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [selectedContractId, setSelectedContractId] = useState(null);
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [expandedContractId, setExpandedContractId] = useState(null); // State để quản lý việc mở rộng/thu gọn
  const [filterStatus, setFilterStatus] = useState('Tất cả'); // State cho bộ lọc

  // Thêm trạng thái mới để tương thích với backend
  const statusStyles = {
    'Chờ thanh toán': 'bg-yellow-100 text-yellow-800',
    'Hiệu lực': 'bg-green-100 text-green-800',
    'Hết hạn': 'bg-red-100 text-red-800',
    'Thanh toán thất bại': 'bg-red-100 text-red-800',
    'Đã hủy': 'bg-gray-100 text-gray-800',
  };

  const fetchMyContracts = async () => {
    setLoading(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch('/api/contracts/my', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Không thể tải danh sách hợp đồng.');
      const data = await res.json();
      setContracts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyContracts();
  }, []);

  // Cập nhật hàm handlePayment để gọi API tạo URL của VNPay
  const handlePayment = async (contract) => {
    if (!window.confirm(`Bạn có chắc chắn muốn tiến hành thanh toán số tiền ${contract.premium.toLocaleString('vi-VN')} ₫ cho hợp đồng này không?`)) return;

    const token = localStorage.getItem('hieushop-token');
    try {
      // Gọi API để tạo URL thanh toán
      const res = await fetch(`/api/payment/create_payment_url`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: contract._id,
          amount: contract.premium,
          language: 'vn'
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Không thể tạo yêu cầu thanh toán.');

      // Chuyển hướng người dùng đến cổng thanh toán VNPay
      window.location.href = data.paymentUrl;
    } catch (err) {
      showNotification(err.message, 'error'); // Hiển thị lỗi nếu có
    }
  };

  // Mở modal yêu cầu hủy
  const openCancelModal = (contractId) => {
    setSelectedContractId(contractId);
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  // Gửi yêu cầu hủy
  const handleSubmitCancellation = async () => {
    if (!cancelReason.trim()) {
      showNotification('Vui lòng nhập lý do hủy hợp đồng.', 'error');
      return;
    }

    setIsSubmittingCancel(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch(`/api/contracts/${selectedContractId}/cancel-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Gửi yêu cầu thất bại.');

      showNotification('Đã gửi yêu cầu hủy thành công. Vui lòng chờ duyệt.');
      setIsCancelModalOpen(false);
      fetchMyContracts(); // Tải lại danh sách
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedContractId(expandedContractId === id ? null : id);
  };

  // Logic lọc hợp đồng
  const filteredContracts = contracts.filter(contract => 
    filterStatus === 'Tất cả' ? true : contract.status === filterStatus
  );

  if (loading) return <p>Đang tải hợp đồng của bạn...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      {/* Modal nhập lý do hủy */}
      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleSubmitCancellation}
        title="Yêu cầu hủy hợp đồng"
        confirmText="Gửi yêu cầu"
        confirmVariant="danger"
        isConfirming={isSubmittingCancel}
      >
        <p className="mb-3 text-slate-600">Bạn có chắc chắn muốn yêu cầu hủy hợp đồng này? Vui lòng cho chúng tôi biết lý do:</p>
        <textarea
          className="w-full border border-slate-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none"
          rows="4"
          placeholder="Nhập lý do hủy..."
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        ></textarea>
      </ConfirmModal>

      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-700">✍️Hợp đồng của tôi</h2>
        
        {/* Bộ lọc trạng thái */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-auto min-w-[220px] px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white text-slate-700 shadow-sm cursor-pointer"
        >
          <option value="Tất cả">Tất cả trạng thái</option>
          <option value="Chờ thanh toán">Chờ thanh toán</option>
          <option value="Hiệu lực">Hiệu lực</option>
          <option value="Hết hạn">Hết hạn</option>
          <option value="Thanh toán thất bại">Thanh toán thất bại</option>
          <option value="Đã hủy">Đã hủy</option>
        </select>
      </div>

      {filteredContracts.length === 0 ? (
        <p className="text-slate-500 text-center py-8">Không tìm thấy hợp đồng nào phù hợp.</p>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract) => {
            // Tính tuổi từ ngày sinh
            const dob = contract.application?.applicationData?.dob;
            let age = 'N/A';
            if (dob) {
              const birthDate = new Date(dob);
              const today = new Date();
              age = today.getFullYear() - birthDate.getFullYear();
              const m = today.getMonth() - birthDate.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
            }

            return (
              <div key={contract._id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300">
                {/* Header tóm tắt (Luôn hiển thị) */}
                <div 
                  className="p-4 flex flex-col sm:flex-row justify-between items-center cursor-pointer hover:bg-slate-50 gap-4"
                  onClick={() => toggleExpand(contract._id)}
                >
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-lg">{contract.product?.name || 'Sản phẩm không xác định'}</h3>
                    <p className="text-sm text-slate-500">Số HĐ: <span className="font-mono font-medium">{contract.contractNumber}</span></p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[contract.status]}`}>{contract.status}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${expandedContractId === contract._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Chi tiết hợp đồng (Chỉ hiện khi mở rộng) */}
                {expandedContractId === contract._id && (
                  <div className="border-t border-slate-100 animate-fade-in-down">
                    <div className="p-6 bg-slate-50/50">
                      <div className="space-y-3 text-slate-700">
                  <div>
                    <p className="font-bold">Bên A (Bên mua bảo hiểm):</p>
                    <p className="pl-4">- Ông/Bà: {contract.application?.applicationData?.fullName || user?.name}</p>
                    <p className="pl-4">- Tuổi: {age}</p>
                    <p className="pl-4">- Nghề nghiệp: {contract.application?.applicationData?.profession || 'Chưa cập nhật'}</p>
                    <p className="pl-4">- Địa chỉ: {contract.application?.applicationData?.address || 'Chưa cập nhật'}</p>
                  </div>
                  <p><strong>Bên B (Bên bán bảo hiểm):</strong> {contract.product?.provider || 'Không có thông tin'}</p>
                  <hr className="my-3"/>
                  <p><strong>Đối tượng bảo hiểm:</strong> {contract.product?.name || 'Sản phẩm không tồn tại'}</p>
                  <p><strong>Quyền lợi:</strong> {contract.product?.benefits?.split('\n').map((line, i) => <span key={i} className="block pl-4">- {line}</span>) || 'N/A'}</p>
                  <p><strong>Số tiền bảo hiểm tối đa:</strong> {contract.product?.annualInsurableAmount?.toLocaleString('vi-VN') || 'N/A'} ₫/năm</p>
                  <p><strong>Thời hạn hợp đồng:</strong> Từ {new Date(contract.startDate).toLocaleDateString('vi-VN')} đến {new Date(contract.endDate).toLocaleDateString('vi-VN')}</p>
                  <p><strong>Phí bảo hiểm:</strong> <span className="font-bold text-lg text-purple-600">{contract.premium.toLocaleString('vi-VN')} ₫</span> / năm</p>
                </div>

                {/* Hiển thị trạng thái yêu cầu hủy nếu có */}
                {contract.cancellation?.isRequested && (
                  <div className={`mt-4 p-3 rounded-lg border ${contract.cancellation.status === 'Chờ duyệt' ? 'bg-orange-50 border-orange-200 text-orange-800' : contract.cancellation.status === 'Từ chối' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-gray-50 text-gray-800'}`}>
                    <p className="font-bold text-sm">ℹ️ Trạng thái yêu cầu hủy: {contract.cancellation.status}</p>
                    <p className="text-sm mt-1">Lý do: "{contract.cancellation.reason}"</p>
                    {contract.cancellation.adminResponse && <p className="text-sm mt-1 italic">Phản hồi từ Admin: "{contract.cancellation.adminResponse}"</p>}
                  </div>
                )}

                    </div>

                    {/* Các nút hành động */}
                    <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end gap-4">

              {contract.status === 'Chờ thanh toán' && (
                  <button 
                    onClick={() => handlePayment(contract)}
                    className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors shadow-sm hover:shadow-md"
                  >
                    Thanh toán ngay
                  </button>
              )}

              {/* Nút yêu cầu hủy: Chỉ hiện khi Hiệu lực và chưa có yêu cầu đang chờ */}
              {contract.status === 'Hiệu lực' && (!contract.cancellation?.isRequested || contract.cancellation?.status === 'Từ chối') && (
                <button
                  onClick={() => openCancelModal(contract._id)}
                  className="text-red-600 hover:text-red-800 font-semibold text-sm underline"
                >
                  Yêu cầu hủy hợp đồng
                </button>
              )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyContracts;