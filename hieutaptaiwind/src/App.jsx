import { Routes, Route, Outlet } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AboutPage from "./pages/AboutPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProfilePage from "./pages/ProfilePage";
import ProtectedRoute from "./pages/ProtectedRoute";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminDashboard from "./pages/AdminDashboard"; // Import trang admin
import UserManagement from "./components/UserManagement"; // Import component quản lý user
import AdminOverview from "./components/AdminOverview"; // Import component tổng quan
import ProductManagement from "./components/ProductManagement"; // Import component quản lý sản phẩm
import ConsultationManagement from "./components/ConsultationManagement"; // Import trang quản lý tư vấn
import ApplicationManagement from "./components/ApplicationManagement"; // Import trang quản lý hồ sơ
import ApplicationDetailPage from "./components/ApplicationDetailPage"; // Import trang chi tiết hồ sơ
import RegistrationPage from "./pages/RegistrationPage";
import MyProductsPage from "./pages/MyProductsPage"; // Import trang mới
import ContractManagement from "./components/ContractManagement"; // Import trang quản lý hợp đồng
import MyContractsPage from "./pages/MyContractsPage"; // Import trang hợp đồng
import ClaimRequestPage from "./pages/ClaimRequestPage"; // Import trang yêu cầu chi trả
import ClaimManagement from "./components/ClaimManagement"; // Import trang quản lý bồi thường
import Placeholder from "./components/Placeholder"; // Import component giữ chỗ
import { Toaster } from "sonner";
function App() {
return (
  <>
      <Toaster richColors position="top-right" />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/product/:productId" element={<ProductDetailPage />} />
  
      {/* Route được bảo vệ cho trang Profile */}
      <Route
        path="/register-insurance/:productId"
        element={
          <ProtectedRoute><RegistrationPage /></ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        }
      />
      <Route
        path="/my-products"
        element={
          <ProtectedRoute><MyProductsPage /></ProtectedRoute>
        }
      />
      <Route
        path="/my-contracts"
        element={
          <ProtectedRoute><MyContractsPage /></ProtectedRoute>
        }
      />
      <Route
        path="/claim-request"
        element={
          <ProtectedRoute><ClaimRequestPage /></ProtectedRoute>
        }
      />

      {/* Route được bảo vệ cho Admin */}
      <Route
        path="/admin/dashboard" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>}
      >
        {/* Trang mặc định khi vào /admin/dashboard */}
        <Route index element={<AdminOverview />} />
        {/* Route con cho quản lý người dùng */}
        <Route path="users" element={<UserManagement />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="consultations" element={<ConsultationManagement />} />
        <Route path="applications" element={<Outlet />}>
          <Route index element={<ApplicationManagement />} />
          <Route path=":id" element={<ApplicationDetailPage />} />
        </Route>
        <Route path="orders" element={<Placeholder title="Quản lý Đơn hàng" />} />
        <Route path="contracts" element={<ContractManagement />} />
        <Route path="claims" element={<ClaimManagement />} />
      </Route>
    </Routes>
  </>
)

}

export default App;
