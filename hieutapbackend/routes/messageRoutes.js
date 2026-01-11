import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import { getMessages, getConversations, markAsRead } from '../controllers/messageController.js';

const router = express.Router();

// Admin/Staff lấy danh sách tất cả hội thoại
router.get('/conversations', protect, admin, getConversations);

// Lấy chi tiết tin nhắn (User lấy của mình, Admin lấy của User bất kỳ)
router.get('/:userId', protect, getMessages);

// Đánh dấu tin nhắn là đã đọc
router.put('/:userId/read', protect, markAsRead);

export default router;