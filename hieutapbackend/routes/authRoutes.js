import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  getMe,
  updateUserDetails,
  updatePassword,
  forgotPassword,
  resetPassword,
  getAllUsers,
  deleteUser, // Import hàm xóa người dùng
  createStaff,
  getAllStaff,
  updateStaff,
} from "../controllers/authController.js";

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Đăng ký tài khoản
 */
router.post("/register", registerUser);

/**
 * @route   POST /api/auth/login
 * @desc    Đăng nhập & trả về token
 */
router.post("/login", loginUser);

/**
 * @route   POST /api/auth/google
 * @desc    Xác thực người dùng bằng Google & trả về token
 */
router.post("/google", loginWithGoogle);

/**
 * @route   GET /api/auth/me
 * @desc    Lấy thông tin người dùng hiện tại (đã đăng nhập)
 * @access  Private
 */
router.get("/me", protect, getMe);

/**
 * @route   PUT /api/auth/me
 * @desc    Cập nhật thông tin người dùng (tên, email)
 * @access  Private
 */
router.put("/me", protect, upload.single("avatarFile"), updateUserDetails);

/**
 * @route   PUT /api/auth/password
 * @desc    Cập nhật mật khẩu người dùng
 * @access  Private
 */
router.put("/password", protect, updatePassword);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Xử lý yêu cầu quên mật khẩu
 */
router.post("/forgot-password", forgotPassword);

/**
 * @route   PUT /api/auth/reset-password/:token
 * @desc    Đặt lại mật khẩu mới
 */
router.put("/reset-password/:token", resetPassword);

// --- ROUTE DÀNH CHO ADMIN ---
/**
 * @route   GET /api/auth/users
 * @desc    Lấy tất cả người dùng (chỉ admin)
 * @access  Private/Admin
 */
router.get("/users", protect, admin, getAllUsers);

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Xóa người dùng (chỉ admin)
 * @access  Private/Admin
 */
router.delete("/users/:id", protect, admin, deleteUser);

// --- ROUTE QUẢN LÝ NHÂN VIÊN ---
/**
 * @route   GET /api/auth/staff
 * @desc    Lấy danh sách nhân viên (Admin/Staff)
 * @access  Private/Admin
 */
router.get("/staff", protect, admin, getAllStaff);

/**
 * @route   POST /api/auth/create-staff
 * @desc    Tạo nhân viên mới (Chỉ Admin)
 * @access  Private/Admin
 */
router.post("/create-staff", protect, admin, createStaff);

/**
 * @route   PUT /api/auth/staff/:id
 * @desc    Cập nhật thông tin nhân viên (Chỉ Admin)
 * @access  Private/Admin
 */
router.put("/staff/:id", protect, admin, updateStaff);

export default router;
