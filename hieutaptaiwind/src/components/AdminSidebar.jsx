import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../pages/AuthContext';

const AdminSidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Chuyển hướng về trang đăng nhập trước khi đăng xuất
    navigate('/login');
    // Đợi một chút để đảm bảo chuyển hướng hoàn tất
    setTimeout(logout, 50);
  };

  // Style cơ bản cho link
  const baseLinkClass = "group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium text-sm relative overflow-hidden";

  // Hàm tạo class dựa trên trạng thái active
  const getNavLinkClass = ({ isActive }) => {
    return isActive
      ? `${baseLinkClass} bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 translate-x-1`
      : `${baseLinkClass} text-slate-500 hover:bg-slate-50 hover:text-purple-600 hover:translate-x-1`;
  };

  return (
    <aside className="w-72 flex-shrink-0 flex flex-col gap-6">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-5 flex flex-col h-full min-h-[calc(100vh-6rem)] sticky top-24">
        
        {/* Header */}
        <div className="mb-8 px-2">
           <h2 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600 tracking-tight">
             Admin Panel
           </h2>
           <p className="text-xs text-slate-400 mt-1 font-semibold tracking-wider uppercase">Hệ thống quản trị</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 flex-grow">
          <NavLink to="/admin/dashboard" end className={getNavLinkClass}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            <span>Tổng quan</span>
          </NavLink>
          
          <NavLink to="/admin/dashboard/users" className={getNavLinkClass}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197M15 21a6 6 0 004.773-9.805L17.5 6H16.5a1 1 0 01-1-1V4a1 1 0 011-1h2.5a1 1 0 011 1v1.5a1 1 0 01-1 1H19v1.5a1 1 0 01-1 1h-1.5a1 1 0 01-1-1V6.364M15 21a6 6 0 00-9-5.197" />
            </svg>
            <span>Người dùng</span>
          </NavLink>

          <NavLink to="/admin/dashboard/products" className={getNavLinkClass}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Sản phẩm</span>
          </NavLink>

          <NavLink to="/admin/dashboard/consultations" className={getNavLinkClass}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Yêu cầu tư vấn</span>
          </NavLink>

          <NavLink to="/admin/dashboard/applications" className={getNavLinkClass}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Hồ sơ đăng ký</span>
          </NavLink>

          <NavLink to="/admin/dashboard/contracts" className={getNavLinkClass}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Hợp đồng</span>
          </NavLink>

          <NavLink to="/admin/dashboard/claims" className={getNavLinkClass}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
               <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <span>Bồi thường</span>
          </NavLink>
        </nav>

        {/* Logout Button */}
        <div className="mt-auto pt-6 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium text-sm group"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;