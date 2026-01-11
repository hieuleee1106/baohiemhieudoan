import express from 'express';
import { getDashboardStats } from '../controllers/statsController.js';
import { protect, superAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   GET /api/stats/dashboard
// @desc    Lấy dữ liệu thống kê cho trang tổng quan
router.route('/dashboard').get(protect, superAdmin, getDashboardStats);

export default router;