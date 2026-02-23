import { useState, useEffect } from 'react';
// Modal form để thêm hoặc sửa nhân viên
const StaffFormModal = ({ staff, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '', // Chỉ dùng khi tạo mới
    phone: '',
    position: 'Nhân viên',
    salary: 0,
    department: 'Kinh doanh',
    status: 'Đang làm việc',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (staff) {
      // Chế độ chỉnh sửa: Fill dữ liệu từ staff prop
      setFormData({
        name: staff.user?.name || '',
        email: staff.user?.email || '',
        password: '', // Không hiển thị mật khẩu cũ
        phone: staff.user?.phone || '',
        position: staff.position || 'Nhân viên',
        salary: staff.salary || 0,
        department: staff.department || 'Kinh doanh',
        status: staff.status || 'Đang làm việc',
      });
    }
  }, [staff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      const numericValue = value.replace(/\D/g, '');
      setFormData((prev) => ({ ...prev, [name]: numericValue.slice(0, 10) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // --- VALIDATION ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Vui lòng nhập địa chỉ email hợp lệ.");
      setIsSubmitting(false);
      return;
    }

    if (formData.phone && formData.phone.length !== 10) {
      setError("Số điện thoại phải có đúng 10 chữ số.");
      setIsSubmitting(false);
      return;
    }
    // --- END VALIDATION ---

    const token = localStorage.getItem('hieushop-token');
    // Nếu có staff -> Đang sửa (PUT), ngược lại là Thêm mới (POST)
    const method = staff ? 'PUT' : 'POST';
    // Lưu ý: Route tạo mới dùng create-staff, route sửa dùng staff/:id
    const url = staff 
      ? `/api/auth/staff/${staff._id}` 
      : '/api/auth/create-staff';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      onSave(); // Callback để tải lại danh sách
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">
              {staff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}
            </h2>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thông tin tài khoản */}
            <div className="md:col-span-2">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Thông tin tài khoản</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
              <input name="name" value={formData.name} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email đăng nhập</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" required disabled={!!staff} />
            </div>
            
            {!staff && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" required />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Số điện thoại</label>
              <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phải đủ 10 số" className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" />
            </div>

            {/* Thông tin công việc */}
            <div className="md:col-span-2 mt-2">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Thông tin công việc</h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Chức vụ</label>
              <input name="position" value={formData.position} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phòng ban</label>
              <select name="department" value={formData.department} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white">
                <option value="Kinh doanh">Kinh doanh</option>
                <option value="Nhân sự">Nhân sự</option>
                <option value="Kế toán">Kế toán</option>
                <option value="CSKH">CSKH</option>
                <option value="IT">IT</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Lương cơ bản</label>
              <input type="number" name="salary" value={formData.salary} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Trạng thái</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none bg-white">
                <option value="Đang làm việc">Đang làm việc</option>
                <option value="Nghỉ phép">Nghỉ phép</option>
                <option value="Đã nghỉ việc">Đã nghỉ việc</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition-colors">
              Hủy bỏ
            </button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-500/30 disabled:opacity-70">
              {isSubmitting ? 'Đang xử lý...' : (staff ? 'Lưu thay đổi' : 'Tạo nhân viên')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffFormModal;