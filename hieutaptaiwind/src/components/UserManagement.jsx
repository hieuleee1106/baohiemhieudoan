import { useState, useEffect } from 'react';
import { useAuth } from '../pages/AuthContext';
import Button from './Button';
import ConfirmModal from './ConfirmModal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterRole, setFilterRole] = useState('Tất cả');
  const { user: loggedInUser, loading: authLoading, showNotification } = useAuth();

  // State modal xóa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch users
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
    if (!authLoading && loggedInUser?.role === 'admin') {
      fetchUsers();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [loggedInUser, authLoading]);

  // Modal xóa
  const openDeleteModal = (user) => {
    setUserToDelete(user);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setIsModalOpen(false);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);

    try {
      const token = localStorage.getItem('hieushop-token');
      const res = await fetch(`/api/auth/users/${userToDelete._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Xóa người dùng thất bại.');

      showNotification('Người dùng đã được xóa thành công.');
      fetchUsers();
      closeDeleteModal();
    } catch (err) {
      showNotification(err.message, 'error');
      closeDeleteModal();
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <p>Đang tải danh sách người dùng...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const filteredUsers = users.filter(user =>
    filterRole === 'Tất cả' ? true : user.role === filterRole
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
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

      <h1 className="text-3xl font-bold text-slate-800 mb-6">Quản lý người dùng</h1>

      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-slate-100">
        <table className="min-w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left py-3 px-6 font-semibold text-sm text-slate-600 uppercase tracking-wider">Tên</th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-slate-600 uppercase tracking-wider">Email</th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-slate-600 uppercase tracking-wider">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                  <span>Vai trò</span>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="sm:ml-2 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-1 focus:ring-purple-500 focus:outline-none bg-white text-slate-700 shadow-sm cursor-pointer"
                  >
                    <option value="Tất cả">Tất cả</option>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </th>
              <th className="text-left py-3 px-6 font-semibold text-sm text-slate-600 uppercase tracking-wider">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id} className="odd:bg-white even:bg-slate-50/50 hover:bg-purple-50/50 transition-colors">
                <td className="py-4 px-6 font-medium text-slate-800 whitespace-nowrap">{user.name}</td>
                <td className="py-4 px-6 text-slate-600 whitespace-nowrap">{user.email}</td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-4 px-6 whitespace-nowrap">
                  {loggedInUser._id !== user._id && user.role !== 'admin' && (
                    <Button variant="slide-red" size="sm" onClick={() => openDeleteModal(user)}>
                      Xóa
                    </Button>
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
