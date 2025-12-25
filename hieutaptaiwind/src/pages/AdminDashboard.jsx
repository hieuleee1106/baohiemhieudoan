import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar';

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <div className="flex-grow container mx-auto flex pt-8 pb-8 gap-8">
        {/* Thanh điều hướng bên của Admin */}
        <AdminSidebar />
        {/* Vùng hiển thị nội dung của các trang con */}
        <main className="flex-1 bg-white rounded-xl shadow-lg p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;