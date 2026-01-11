import express from 'express';
import { getMyTransactions, getAllTransactions } from '../controllers/transactionController.js';
import { protect, superAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(protect, superAdmin, getAllTransactions);
router.route('/my').get(protect, getMyTransactions);

export default router;