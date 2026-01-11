import { Transaction } from '../models/Transaction.js';

// @desc    Lấy danh sách giao dịch của tôi
// @route   GET /api/transactions/my
// @access  Private
export const getMyTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id })
      .populate({
        path: 'contract',
        select: 'contractNumber product',
        populate: { path: 'product', select: 'name' }
      })
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error("Lỗi lấy lịch sử giao dịch:", error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Lấy tất cả giao dịch (Admin)
// @route   GET /api/transactions
// @access  Private/Admin
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({})
      .populate('user', 'name email')
      .populate('contract', 'contractNumber')
      .sort({ createdAt: -1 });
    res.json(transactions);
  } catch (error) {
    console.error("Lỗi lấy tất cả giao dịch:", error);
    res.status(500).json({ message: 'Lỗi server' });
  }
};