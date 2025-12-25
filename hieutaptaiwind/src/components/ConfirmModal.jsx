import { FaExclamationTriangle } from 'react-icons/fa'; // Ví dụ: dùng react-icons

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  children,
  confirmVariant = 'danger', // 'danger' (đỏ) hoặc 'primary' (tím)
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  isConfirming = false, // State cho loading
}) => {
  if (!isOpen) return null;

  return (
    // Lớp nền mờ
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 animate-fade-in"
      onClick={onClose} // Cho phép đóng khi click ra ngoài
    >
      {/* Nội dung modal */}
      <div 
        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all animate-slide-up"
        onClick={e => e.stopPropagation()} // Ngăn việc click vào modal làm nó bị đóng
      >
        <div className="flex items-start gap-4">
          {confirmVariant === 'danger' && (
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-red-100">
              <FaExclamationTriangle className="w-6 h-6 text-red-600" />
            </div>
          )}
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{title}</h3>
            <div className="mt-2 text-slate-600 text-base">
              {children}
            </div>
          </div>
        </div>
        <div className="mt-4 text-slate-600 text-lg">
        </div>
        <div className="mt-8 flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="px-6 py-2 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className={`px-6 py-2 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait ${
              confirmVariant === 'danger' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isConfirming ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;