import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MyApplications from '../components/MyApplications'; // Import component mới
import ConfirmModal from '../components/ConfirmModal';

const ProfilePage = () => {
  const { user, logout, updateUser, showNotification } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', avatar: '' });
  const [error, setError] = useState('');
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email, phone: user.phone || '', avatar: user.avatar || '' });
    }
  }, [user]);

  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    const updateFormData = new FormData();
    updateFormData.append('name', formData.name);
    updateFormData.append('email', formData.email);
    updateFormData.append('phone', formData.phone);

    if (avatarFile) {
      updateFormData.append('avatarFile', avatarFile);
    } else {
      updateFormData.append('avatar', formData.avatar); // Gửi lại URL cũ nếu không có file mới
    }

    const token = localStorage.getItem('hieushop-token');
    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }, // Không cần 'Content-Type' khi dùng FormData
        body: updateFormData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Cập nhật thất bại');
      updateUser(data); // Cập nhật user trong context
      showNotification('Cập nhật thông tin thành công!');
      setIsEditing(false);
      setAvatarFile(null); // Reset file sau khi lưu
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setError('');
    
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setPasswordError('Mật khẩu mới và xác nhận không khớp.');
      return;
    }

    // Mở modal xác nhận thay vì dùng window.confirm
    setIsModalOpen(true);
  };

  // Hàm này sẽ được gọi khi người dùng xác nhận trong modal
  const executeChangePassword = async () => {
    setIsModalOpen(false); // Đóng modal
    const token = localStorage.getItem('hieushop-token');
    try {
      const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Đổi mật khẩu thất bại');
      
      showNotification('Đổi mật khẩu thành công!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); // Reset form
      setIsChangingPassword(false); // Đóng form đổi mật khẩu
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu trang
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleLogout = () => {
    // 1. Bắt đầu chuyển hướng về trang đăng nhập
    navigate('/login');
    // 2. Đợi một khoảng thời gian rất ngắn để đảm bảo navigation hoàn tất
    // trước khi xóa user state, tránh race condition với ProtectedRoute.
    setTimeout(logout, 50);
  };

  if (!user) {
    // Phòng trường hợp component vẫn render trong giây lát trước khi redirect
    return null; 
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <ConfirmModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={executeChangePassword}
        title="Xác nhận đổi mật khẩu"
      >
        <p>Bạn có chắc chắn muốn thực hiện thay đổi này không? Mật khẩu của bạn sẽ được cập nhật ngay lập tức.</p>
      </ConfirmModal>
      <Header />
      <main className="flex-grow container mx-auto px-6 py-12">
        <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl shadow-purple-200/50 p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Hồ Sơ</span> Của Bạn
            </h1>
          </div>
          {isEditing ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-600">Tên</label>
                <input type="text" id="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="mt-1 w-full border-2 border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-600">Email</label>
                <input type="email" id="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1 w-full border-2 border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-600">Số điện thoại</label>
                <input type="tel" id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1 w-full border-2 border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600">Ảnh đại diện</label>
                <div className="mt-2 flex items-center gap-4">
                  <img 
                    src={avatarFile ? URL.createObjectURL(avatarFile) : formData.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=random`} 
                    alt="Xem trước avatar" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-slate-200"
                  />
                  <input 
                    type="file" 
                    id="avatar-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => setAvatarFile(e.target.files[0])}
                  />
                  <label 
                    htmlFor="avatar-upload" 
                    className="cursor-pointer bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm leading-4 font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Chọn ảnh
                  </label>
                </div>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setIsEditing(false)} className="w-full bg-slate-200 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-300 transition-colors">Hủy</button>
                <button type="submit" className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105">Lưu thay đổi</button>
              </div>
            </form>
          ) : (
            <>
              <div className="space-y-4 text-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-500">Tên:</span>
                  <span className="font-semibold text-slate-800">{user.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">{user.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-500">Điện thoại:</span>
                  <span className="font-semibold text-slate-800">{user.phone || 'Chưa cập nhật'}</span>
                </div>
              </div>
              <div className="mt-8 space-y-4">
                <button onClick={() => setIsEditing(true)} className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-900 transition-transform transform hover:scale-105">Chỉnh sửa thông tin</button>
                <button onClick={handleLogout} className="w-full bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition-transform transform hover:scale-105">Đăng xuất</button>
              </div>
            </>
          )}
          {!isEditing && (
            <div className="mt-8">
              {/* Nút đăng xuất được di chuyển vào logic ở trên */}
            </div>
          )}

          {/* Phần đổi mật khẩu */}
          <div className="mt-8 pt-8 border-t border-slate-200">
            {isChangingPassword ? (
              <>
                <h2 className="text-2xl font-bold text-center mb-6 text-slate-700">Đổi Mật Khẩu</h2>
                {passwordError && <p className="text-center text-red-500 mb-4">{passwordError}</p>}
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600">Mật khẩu hiện tại</label>
                    <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} className="mt-1 w-full border-2 border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600">Mật khẩu mới</label>
                    <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="mt-1 w-full border-2 border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600">Xác nhận mật khẩu mới</label>
                    <input type="password" value={passwordData.confirmNewPassword} onChange={(e) => setPasswordData({...passwordData, confirmNewPassword: e.target.value})} className="mt-1 w-full border-2 border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-purple-500" required />
                  </div>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setIsChangingPassword(false)} className="w-full bg-slate-200 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-300 transition-colors">Hủy</button>
                    <button type="submit" className="w-full bg-slate-800 text-white font-bold py-3 rounded-lg hover:bg-slate-900 transition-transform transform hover:scale-105">Lưu Mật Khẩu Mới</button>
                  </div>
                </form>
              </>
            ) : (
              <button onClick={() => setIsChangingPassword(true)} className="w-full bg-slate-100 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-200 transition-colors">
                Đổi mật khẩu
              </button>
            )}
          </div>

          {/* Hiển thị danh sách sản phẩm đã đăng ký */}
        

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProfilePage;