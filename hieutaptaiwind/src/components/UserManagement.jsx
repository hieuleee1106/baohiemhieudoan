import { useState, useEffect } from 'react';
import { useAuth } from '../pages/AuthContext';
import ConfirmModal from './ConfirmModal'; // Import modal xác nhận

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true); // Bắt đầu với trạng thái loading
  const [error, setError] = useState('');
  const { user: loggedInUser, loading: authLoading, showNotification } = useAuth(); // Đổi tên để tránh nhầm lẫn
  
  // State cho modal xác nhận xóa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // Thêm state cho trạng thái loading khi xóa
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('hieushop-token');
      const res = await fetch('/api/auth/users', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Bạn không có quyền truy cập hoặc đã có lỗi xảy ra.');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Chỉ fetch users khi AuthContext đã load xong và user là admin
    if (!authLoading && loggedInUser?.role === 'admin') {
      fetchUsers();
    } else if (!authLoading) {
      // Nếu xác thực xong nhưng không phải admin, dừng loading và không làm gì
      setLoading(false);
    }
  }, [loggedInUser, authLoading]); // Thêm user và authLoading vào dependency array

  // Hàm mở modal và set user cần xóa
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsModalOpen(true);
  };
  
  // Hàm đóng modal
  const closeDeleteModal = () => {
    setUserToDelete(null);
    setIsModalOpen(false);
  };
  
  // Hàm thực hiện xóa sau khi xác nhận
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true); // Bắt đầu loading
    
    try {
      const token = localStorage.getItem('hieushop-token');
      const res = await fetch(`/api/auth/users/${userToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Xóa người dùng thất bại.');
      
      showNotification('Người dùng đã được xóa thành công.');
      fetchUsers(); // Tải lại danh sách người dùng
      closeDeleteModal(); // Đóng modal
    } catch (err) {
      showNotification(err.message, 'error');
      closeDeleteModal();
    } finally {
      setIsDeleting(false); // Dừng loading
    }
  };

  // Hiển thị loading chỉ khi auth đang load hoặc component đang fetch
  if (loading) {
    return <p>Đang tải danh sách người dùng...</p>;
  }

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteUser}
        title="Xác nhận xóa người dùng"
        confirmText="Xác nhận xóa"
        isConfirming={isDeleting}
      >
        Bạn có chắc chắn muốn xóa người dùng <strong>{userToDelete?.name}</strong>? Hành động này không thể hoàn tác.
      </ConfirmModal>
      <h1 className="text-3xl font-bold mb-6 text-slate-800">Quản lý người dùng</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left py-3 px-4 font-semibold text-sm">Tên</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Email</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Vai trò</th>
              <th className="text-left py-3 px-4 font-semibold text-sm">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-b border-slate-200 hover:bg-slate-50">
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{user.role}</span></td>
                <td className="py-3 px-4">
                  
                  {loggedInUser._id !== user._id && user.role !== 'admin' && (
                    <button onClick={() => openDeleteModal(user)} className="text-red-600 hover:text-red-800 font-semibold disabled:text-slate-400 disabled:cursor-not-allowed">
                      Xóa
                    </button>
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

export default UserManagement;