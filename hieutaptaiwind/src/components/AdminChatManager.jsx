import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../pages/AuthContext';
import io from 'socket.io-client';

// Tự động xác định địa chỉ backend. Ở local sẽ là localhost, trên Render sẽ là domain của bạn.
const ENDPOINT = import.meta.env.VITE_BACKEND_URL || window.location.origin;

const AdminChatManager = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  
  // Dùng Ref để lưu selectedUser mới nhất, giúp socket đọc được giá trị này trong callback
  const selectedUserRef = useRef(selectedUser);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // 1. Kết nối Socket & Lấy danh sách hội thoại
  useEffect(() => {
    socketRef.current = io(ENDPOINT);
    
    // Admin join vào room quản lý chung
    socketRef.current.emit("join_admin_room");

    // Lấy danh sách các cuộc hội thoại
    fetchConversations();

    // Lắng nghe tin nhắn mới từ bất kỳ user nào
    socketRef.current.on("receive_message", (newMessage) => {
      handleIncomingMessage(newMessage);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // 2. Tải tin nhắn khi chọn một user
  useEffect(() => {
    if (selectedUser) {
      // A. Đánh dấu đã đọc ngay khi mở chat
      fetch(`/api/messages/${selectedUser._id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem("hieushop-token")}` }
      }).then(() => {
        // Sau khi đánh dấu đọc xong, tải lại danh sách hội thoại để cập nhật số badge đỏ
        fetchConversations();
      });

      // B. Tải nội dung tin nhắn
      fetch(`/api/messages/${selectedUser._id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("hieushop-token")}` }
      })
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(err => console.error(err));
        
      // Scroll xuống cuối
      // block: "nearest" giúp tránh việc cả trang web bị đẩy lên trên
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    }
  }, [selectedUser]);

  // Scroll khi có tin nhắn mới trong khung chat hiện tại
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages/conversations', {
        headers: { Authorization: `Bearer ${localStorage.getItem("hieushop-token")}` }
      });
      const data = await res.json();
      setConversations(data);
    } catch (error) {
      console.error("Lỗi tải hội thoại:", error);
    }
  };

  const handleIncomingMessage = (newMessage) => {
    // Nếu tin nhắn thuộc về user đang chat -> thêm vào list messages
    // Sử dụng selectedUserRef.current thay vì selectedUser state trực tiếp
    if (selectedUserRef.current && newMessage.conversationId === selectedUserRef.current._id) {
      setMessages((prev) => [...prev, newMessage]);
      
      // Nếu đang mở chat với user này mà có tin nhắn mới đến -> Đánh dấu đọc ngay (Realtime read)
      fetch(`/api/messages/${selectedUserRef.current._id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem("hieushop-token")}` }
      });
    }
    // Luôn cập nhật lại danh sách hội thoại (để hiển thị tin nhắn mới nhất/unread count)
    fetchConversations();
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedUser) return;

    const messageData = {
      senderId: user.id,
      content: input,
      conversationId: selectedUser._id, // Gửi vào room của User đó
      role: 'admin'
    };

    socketRef.current.emit("send_message", messageData);
    setInput("");
  };

  return (
    <div className="flex h-[calc(100vh-100px)] bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      {/* Sidebar: Danh sách User */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-bold text-slate-700">Tin nhắn</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.user._id}
              onClick={() => setSelectedUser(conv.user)}
              className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${
                selectedUser?._id === conv.user._id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}
            >
              <img 
                src={conv.user.avatar && conv.user.avatar.startsWith('http') ? conv.user.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.user.name)}&background=random`} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.user.name)}&background=random`; }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-slate-800 truncate">{conv.user.name}</h3>
                  {conv.unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{conv.unreadCount}</span>
                  )}
                </div>
                <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                  {conv.lastMessage?.content || "Chưa có tin nhắn"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center gap-3 shadow-sm">
              <img 
                src={selectedUser.avatar && selectedUser.avatar.startsWith('http') ? selectedUser.avatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=random`} 
                className="w-10 h-10 rounded-full object-cover" 
                alt="User"
                onError={(e) => { e.target.onerror = null; e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.name)}&background=random`; }}
              />
              <div>
                <h3 className="font-bold text-slate-800">{selectedUser.name}</h3>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg, idx) => {
                const isMe = msg.sender === user.id; // Admin gửi
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${
                      isMe ? 'bg-blue-600 text-white rounded-br-none' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-200 flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn trả lời..."
                className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">
                Gửi
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <p>Chọn một cuộc hội thoại để bắt đầu chat</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatManager;