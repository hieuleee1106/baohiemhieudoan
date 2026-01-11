import { Message } from "../models/Message.js";

export const setupSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);

    // User tham gia vào room của chính mình (dùng ID của user làm tên room)
    socket.on("join_room", (userId) => {
      if (userId) {
        socket.join(userId);
        console.log(`User ${userId} joined room ${userId}`);
      }
    });

    // Admin/Staff tham gia vào room quản lý chung
    socket.on("join_admin_room", () => {
      socket.join("admin_room");
      console.log(`Socket ${socket.id} joined admin_room`);
    });

    // Xử lý gửi tin nhắn
    socket.on("send_message", async (data) => {
      const { senderId, content, conversationId, role } = data;
      // conversationId: Luôn là ID của khách hàng (User)
      
      try {
        const newMessage = await Message.create({
          conversationId,
          sender: senderId,
          content,
          isRead: false
        });

        // Gửi tin nhắn đến room của User (để User nhận được)
        io.to(conversationId).emit("receive_message", newMessage);

        // Gửi tin nhắn đến room Admin (để tất cả Admin/Staff nhận được)
        io.to("admin_room").emit("receive_message", newMessage);

      } catch (error) {
        console.error("Socket error:", error);
      }
    });

    socket.on("disconnect", () => {
      // console.log("Client disconnected");
    });
  });
};