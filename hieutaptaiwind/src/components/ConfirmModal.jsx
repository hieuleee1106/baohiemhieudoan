import React from 'react';
// Modal xác nhận hành động quan trọng như xóa
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, children, confirmText = "Xác nhận", isConfirming = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">{title}</h3>
        <div className="text-slate-600 mb-6">
          {children}
        </div>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
            disabled={isConfirming}
          >
            Hủy
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 disabled:opacity-70"
            disabled={isConfirming}
          >
            {isConfirming ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;