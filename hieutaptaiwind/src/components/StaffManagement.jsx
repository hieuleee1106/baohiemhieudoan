import { useState, useEffect } from 'react';
import { useAuth } from '../pages/AuthContext';
import Button from './Button';
import ConfirmModal from './ConfirmModal';
import StaffFormModal from './StaffFormModal';
// Component để quản lý các nhân viên hệ thống
const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { showNotification } = useAuth();

  const fetchStaff = async () => {
    setLoading(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      // Gọi API lấy danh sách nhân viên
      const res = await fetch('/api/auth/staff', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Không thể tải danh sách nhân viên.');
      const data = await res.json();
      setStaffList(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // --- Xử lý Thêm / Sửa ---
  const handleOpenForm = (staff = null) => {
    setCurrentStaff(staff);
    setIsFormOpen(true);
  };

  const handleSaveSuccess = () => {
    setIsFormOpen(false);
    showNotification(currentStaff ? 'Cập nhật nhân viên thành công!' : 'Thêm nhân viên thành công!');
    fetchStaff();
  };

  // --- Xử lý Xóa ---
  const handleOpenDelete = (staff) => {
    setStaffToDelete(staff);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!staffToDelete) return;
    setIsDeleting(true);
    const token = localStorage.getItem('hieushop-token');
    try {
      // Xóa User (Backend đã update để xóa luôn Staff đi kèm)
      const res = await fetch(`/api/auth/users/${staffToDelete.user._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Xóa thất bại.');
      }

      showNotification('Đã xóa nhân viên thành công.');
      fetchStaff();
      setIsDeleteModalOpen(false);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải danh sách nhân viên...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Lỗi: {error}</div>;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Quản lý Nhân sự</h1>
          <p className="text-slate-500 mt-1">Quản lý tài khoản và thông tin nhân viên hệ thống</p>
        </div>
        <Button variant="slide-red" onClick={() => handleOpenForm()}>
          + Thêm nhân viên
        </Button>
      </div>

      {/* Modal Form */}
      {isFormOpen && (
        <StaffFormModal 
          staff={currentStaff} 
          onClose={() => setIsFormOpen(false)} 
          onSave={handleSaveSuccess} 
        />
      )}

      {/* Modal Delete */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Xóa nhân viên"
        confirmText="Xóa vĩnh viễn"
        isConfirming={isDeleting}
      >
        Bạn có chắc chắn muốn xóa nhân viên <strong>{staffToDelete?.user?.name}</strong>? 
        <br/>Hành động này sẽ xóa cả tài khoản đăng nhập và hồ sơ làm việc.
      </ConfirmModal>

      {/* Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-sm">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Nhân viên</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Liên hệ</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Vị trí / Phòng ban</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.map((staff) => (
              <tr key={staff._id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {staff.user?.avatar && staff.user.avatar.startsWith('http') ? (
                      <img 
                        src={staff.user.avatar} 
                        alt={staff.user.name} 
                        className="h-10 w-10 rounded-full object-cover border border-slate-200 shadow-sm"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${staff.user.name}&background=random`;
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg">
                        {staff.user?.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="ml-4">
                      <div className="text-sm font-bold text-slate-900">{staff.user?.name}</div>
                      <div className="text-xs text-slate-500">ID: {staff.user?._id?.slice(-6)}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-600">{staff.user?.email}</div>
                  <div className="text-sm text-slate-500">{staff.user?.phone || '---'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-800">{staff.position}</div>
                  <div className="text-xs text-slate-500">{staff.department}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${staff.status === 'Đang làm việc' ? 'bg-green-100 text-green-800' : 
                      staff.status === 'Nghỉ phép' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {staff.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleOpenForm(staff)} className="text-blue-600 hover:text-blue-900 mr-4 font-semibold">Sửa</button>
                  <button onClick={() => handleOpenDelete(staff)} className="text-red-600 hover:text-red-900 font-semibold">Xóa</button>
                </td>
              </tr>
            ))}
            {staffList.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                  Chưa có nhân viên nào. Hãy thêm nhân viên mới.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffManagement;