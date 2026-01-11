import { Message } from "../models/Message.js";
import { User } from "../models/User.js";

// @desc    Lấy lịch sử chat của một user
// @route   GET /api/messages/:userId
// @access  Private
export const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Bảo mật: User thường chỉ xem được tin nhắn của chính mình
    if (req.user.role === 'user' && req.user._id.toString() !== userId) {
        return res.status(403).json({ message: "Không có quyền truy cập hội thoại này." });
    }

    const messages = await Message.find({ conversationId: userId })
      .sort({ createdAt: 1 }); // Sắp xếp cũ nhất -> mới nhất
    res.json(messages);
  } catch (error) {
    console.error("Lỗi lấy tin nhắn:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// @desc    Lấy danh sách các cuộc hội thoại (Dành cho Admin/Staff)
// @route   GET /api/messages/conversations
// @access  Private/Admin
export const getConversations = async (req, res) => {
  try {
    // Lấy tất cả các conversationId duy nhất (tức là các User ID đã từng chat)
    const conversationIds = await Message.distinct("conversationId");
    
    const conversations = await Promise.all(conversationIds.map(async (userId) => {
        const user = await User.findById(userId).select("name email avatar");
        if (!user) return null;

        const lastMessage = await Message.findOne({ conversationId: userId }).sort({ createdAt: -1 });
        // Đếm tin nhắn chưa đọc từ phía User gửi đến
        const unreadCount = await Message.countDocuments({ conversationId: userId, isRead: false, sender: userId });

        return { user, lastMessage, unreadCount };
    }));

    // Lọc bỏ null và sắp xếp theo tin nhắn mới nhất
    const sortedConversations = conversations
        .filter(c => c !== null)
        .sort((a, b) => b.lastMessage.createdAt - a.lastMessage.createdAt);

    res.json(sortedConversations);
  } catch (error) {
    console.error("Lỗi lấy danh sách hội thoại:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// @desc    Đánh dấu tin nhắn là đã đọc
// @route   PUT /api/messages/:userId/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Cập nhật tất cả tin nhắn trong cuộc hội thoại này mà người gửi là User (khách hàng) thành đã đọc
    // conversationId là ID của User
    await Message.updateMany(
      { conversationId: userId, sender: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({ message: "Đã đánh dấu đã đọc" });
  } catch (error) {
    console.error("Lỗi đánh dấu đã đọc:", error);
    res.status(500).json({ message: "Lỗi server" });
  }
};