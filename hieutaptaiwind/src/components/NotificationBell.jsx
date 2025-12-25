import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const token = localStorage.getItem('hieushop-token');
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Lỗi tải thông báo:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Tải lại sau mỗi 15 giây để cập nhật nhanh hơn
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    const token = localStorage.getItem('hieushop-token');
    // Đánh dấu đã đọc
    if (!notification.isRead) {
      await fetch(`/api/notifications/${notification._id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      fetchNotifications(); // Tải lại danh sách
    }
    setIsOpen(false);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation(); // Ngăn không cho sự kiện click lan ra thẻ div cha
    const token = localStorage.getItem('hieushop-token');
    try {
      const res = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (res.ok) {
        // Cập nhật lại state để xóa thông báo khỏi giao diện ngay lập tức
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
      }
    } catch (error) {
      console.error("Lỗi xóa thông báo:", error);
      alert('Không thể xóa thông báo.');
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="relative mr-4" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative text-slate-600 hover:text-purple-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{unreadCount}</span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl z-20 border border-slate-100">
          <div className="p-3 font-bold border-b">Thông báo</div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? notifications.map(n => (
              <div key={n._id} onClick={() => handleNotificationClick(n)} className={`group flex items-start justify-between gap-2 p-3 border-b border-slate-100 cursor-pointer hover:bg-slate-50 ${!n.isRead ? 'bg-purple-50' : ''}`}>
                <div>
                  <p className="text-sm text-slate-700">{n.message}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString('vi-VN')}</p>
                </div>
                <button onClick={(e) => handleDeleteNotification(e, n._id)} className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-1 rounded-full transition-opacity">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            )) : (
              <p className="p-4 text-center text-sm text-slate-500">Bạn không có thông báo nào.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;