import express from 'express';
import {
  getApplications,
  updateApplicationStatus,
  createApplication,
  getApplicationById,
  getMyApplications,
  hideApplication,
  deleteApplicationByAdmin,
} from '../controllers/applicationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/').get(protect, admin, getApplications).post(protect, upload.array('documents', 5), createApplication);
router.route('/my').get(protect, getMyApplications);
router.route('/:id/hide').put(protect, hideApplication); // Route để ẩn hồ sơ
router.route('/:id')
  .get(protect, admin, getApplicationById)
  .put(protect, admin, updateApplicationStatus)
  .delete(protect, admin, deleteApplicationByAdmin); // Admin xóa vĩnh viễn

export default router;