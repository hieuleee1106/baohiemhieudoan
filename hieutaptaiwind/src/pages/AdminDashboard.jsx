import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';
// Bố cục trang tổng quan dành cho Admin
const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-amber-300 flex flex-col">
      <div className="flex-grow container mx-auto flex py-8 gap-8">
        {/* Thanh điều hướng bên của Admin */}
        <AdminSidebar />
        {/* Vùng hiển thị nội dung của các trang con */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;