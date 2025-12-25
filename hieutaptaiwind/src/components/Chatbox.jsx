import { useState, useRef, useEffect } from 'react';

const Chatbox = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Chào bạn! Tôi là trợ lý ảo, tôi có thể giúp gì cho bạn về các sản phẩm bảo hiểm?' }
  ]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessage = { sender: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userInput }),
      });

      if (!res.ok) {
        throw new Error('Lỗi từ server');
      }

      const data = await res.json();
      const aiMessage = { sender: 'ai', text: data.reply };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      console.error("Lỗi gửi tin nhắn:", error);
      const errorMessage = { sender: 'ai', text: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {/* Nút mở chatbox */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center transform hover:scale-110 transition-transform"
          aria-label="Mở hộp thoại chat"
        >
          {/* Hiệu ứng ping */}
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
          {/* Biểu tượng mới */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.056 3 12c0 2.22.894 4.233 2.38 5.72L3 21l5.25-1.875A8.954 8.954 0 0012 20.25z" />
          </svg>
        </button>
      )}

      {/* Cửa sổ chatbox */}
      {isOpen && (
        <div className="w-80 h-112 bg-white rounded-2xl shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 bg-linear-to-r from-purple-600 to-pink-600 text-white rounded-t-2xl flex justify-between items-center">
            <h3 className="font-bold">Trợ lý AI</h3>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200" aria-label="Đóng hộp thoại chat">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Khung tin nhắn */}
          <div className="flex-1 p-4 overflow-y-auto">
            {messages.map((msg, index) => (
              <div key={index} className={`flex mb-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`rounded-lg px-3 py-2 max-w-xs ${msg.sender === 'user' ? 'bg-purple-500 text-white' : 'bg-slate-200 text-slate-800'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="bg-slate-200 text-slate-800 rounded-lg px-3 py-2">
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Khung nhập liệu */}
          <div className="p-4 border-t border-slate-200">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 border-2 border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={isLoading}
              />
              <button
                type="submit"
                className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:bg-slate-400"
                disabled={isLoading}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbox;