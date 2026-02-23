import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
// Component để bảo vệ các route yêu cầu xác thực và/hoặc quyền admin
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

  if (adminOnly && !['admin', 'staff'].includes(user.role)) {
    // 2. Nếu đã đăng nhập nhưng không phải admin/staff và route yêu cầu quyền admin
    // Chuyển hướng về trang chủ hoặc một trang "Không có quyền truy cập"
    // Ở đây, chúng ta chuyển về trang chủ
    return <Navigate to="/" replace />;
  }

  // 3. Nếu đã đăng nhập và có đủ quyền, cho phép truy cập
  return children;
};

export default ProtectedRoute;