import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../pages/AuthContext';
import io from 'socket.io-client';

// Kết nối đến server backend (đảm bảo đúng port server đang chạy)
const ENDPOINT = import.meta.env.VITE_BACKEND_URL || window.location.origin;

const SupportChat = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Kiểm tra điều kiện bên trong useEffect thay vì return sớm ở ngoài
    if (!user || ['admin', 'staff'].includes(user.role)) return;

    // Reset tin nhắn về rỗng khi bắt đầu phiên mới
    setMessages([]);

    // Khởi tạo socket
    socketRef.current = io(ENDPOINT);

    // Tham gia vào room riêng của user
    socketRef.current.emit("join_room", user.id);

    // Lấy lịch sử tin nhắn cũ
    fetch(`/api/messages/${user.id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("hieushop-token")}` }
    })
      .then(res => {
        if (res.status === 401) return []; // Xử lý trường hợp chưa xác thực
        return res.json();
      })
      .then(data => setMessages(data))
      .catch(err => console.error("Lỗi tải tin nhắn:", err));

    // Lắng nghe tin nhắn mới
    socketRef.current.on("receive_message", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [user]); // Thay đổi dependency thành user object để tránh lỗi khi user null

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const messageData = {
      senderId: user.id,
      content: input,
      conversationId: user.id, // User chat trong room của chính mình
      role: 'user'
    };

    // Gửi qua socket
    socketRef.current?.emit("send_message", messageData);
    setInput("");
  };

  // Di chuyển câu lệnh return null xuống cuối cùng để đảm bảo Hooks luôn được gọi đủ
  if (!user || ['admin', 'staff'].includes(user.role)) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {/* Nút mở chat (Màu xanh dương để khác Chatbox AI) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform transform hover:scale-110"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      )}

      {/* Cửa sổ Chat */}
      {isOpen && (
        <div className="w-80 h-96 bg-white rounded-lg shadow-2xl flex flex-col border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
            <h3 className="font-bold">Hỗ trợ trực tuyến</h3>
            <button onClick={() => setIsOpen(false)} className="hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          {/* Message List */}
          <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
            {messages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm mt-4">Chưa có tin nhắn nào. Hãy bắt đầu trò chuyện!</p>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.sender === user.id;
                return (
                  <div key={index} className={`flex mb-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                      isMe ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="p-3 border-t border-gray-200 bg-white flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập tin nhắn..."
              className="flex-1 border border-gray-300 rounded-full px-4 py-1 focus:outline-none focus:border-blue-500 text-sm"
            />
            <button 
              type="submit" 
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
              disabled={!input.trim()}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default SupportChat;