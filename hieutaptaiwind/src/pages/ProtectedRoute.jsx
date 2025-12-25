import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Đang tải...</div>; // Hoặc một spinner
  }

  if (!user) {
    // 1. Nếu chưa đăng nhập, chuyển hướng về trang login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    // 2. Nếu đã đăng nhập nhưng không phải admin và route yêu cầu admin
    // Chuyển hướng về trang chủ hoặc một trang "Không có quyền truy cập"
    // Ở đây, chúng ta chuyển về trang chủ
    return <Navigate to="/" replace />;
  }

  // 3. Nếu đã đăng nhập và có đủ quyền, cho phép truy cập
  return children;
};

export default ProtectedRoute;