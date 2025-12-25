import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../pages/AuthContext";
import NotificationBell from "./NotificationBell"; // Import component chuông

const Header = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false); // State cho dropdown bộ lọc
  const dropdownRef = useRef(null);
  const filterRef = useRef(null); // Ref cho dropdown bộ lọc
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State cho tìm kiếm và bộ lọc, lấy giá trị khởi tạo từ URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const selectedCategory = searchParams.get('category') || 'Tất cả'; // Đọc trực tiếp từ URL
  const [categories, setCategories] = useState(['Tất cả']);

  // Lấy danh sách category một lần khi component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/products/categories');
        if (res.ok) {
          const data = await res.json();
          // Chỉ thêm 'Tất cả' nếu có danh mục trả về
          setCategories(data.length > 0 ? ['Tất cả', ...data] : ['Tất cả']);
        }
      } catch (error) { console.error("Failed to fetch categories", error); }
    };
    fetchCategories();
  }, []);

  // Hook để đóng dropdown khi click ra ngoài
  useEffect(() => {
     const handleClickOutside = (event) => {
       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
         setIsDropdownOpen(false);
       }
       if (filterRef.current && !filterRef.current.contains(event.target)) {
         setIsFilterOpen(false);
       }
     };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Cleanup the event listener on component unmount
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, filterRef]);

  const handleLogout = () => {
    // 1. Bắt đầu chuyển hướng về trang đăng nhập
    navigate('/login'); 
    // 2. Đợi một khoảng thời gian rất ngắn để đảm bảo navigation hoàn tất
    // trước khi xóa user state, tránh race condition với ProtectedRoute.
    setTimeout(logout, 50); 
  };

  // Xử lý khi người dùng tìm kiếm hoặc lọc
  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (searchTerm) params.q = searchTerm;
    // Giữ lại category hiện tại trên URL khi tìm kiếm
    if (searchParams.get('category')) params.category = searchParams.get('category');
    setSearchParams(params);
    // Nếu đang không ở trang chủ, chuyển về trang chủ để xem kết quả
    if(window.location.pathname !== '/') navigate('/');
  };
  
  const handleCategorySelect = (category) => {
    const params = {};
    if (searchParams.get('q')) params.q = searchParams.get('q'); // Giữ lại query tìm kiếm
    if (category && category !== 'Tất cả') params.category = category;
    setSearchParams(params);
    setIsFilterOpen(false); // Đóng dropdown sau khi chọn
    if(window.location.pathname !== '/') navigate('/');
  };

  return (
    <header className="bg-white/90 backdrop-blur-lg shadow-md sticky top-0 z-50">
      {/* Tầng trên: Logo, Search, User */}
      <div className="container mx-auto px-6 py-3">
        <div className="flex justify-between items-center gap-6">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            {/* Thay đổi src="/logo.png" thành đường dẫn đến file logo của bạn. Bạn có thể đặt file logo trong thư mục public. */}
            <img src="/logo.png" alt="HieuShop Logo" className="h-14 w-auto" />
          </Link>

          {/* Search & Filter */}
          <form onSubmit={handleSearch} className="hidden lg:flex flex-grow max-w-xl items-center gap-2">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition pl-4"
            />
            <button type="submit" className="p-2.5 bg-[#cc503f] text-white rounded-lg hover:bg-[#b84838] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          </form>

          {/* User Area */}
          <div className="flex items-center gap-4 flex-shrink-0">
              {user ? (
                <>
                <NotificationBell />
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-3 focus:outline-none"
                  >
                    <span className="font-semibold text-slate-800 hidden sm:block">Chào, {user.name}</span>
                    <img 
                      src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                      alt="avatar" 
                      className="w-10 h-10 rounded-full border-2 border-transparent hover:border-purple-400 transition-all object-cover" 
                    />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl z-20 py-2 border border-slate-100 transition-all duration-300 ease-in-out transform origin-top-right animate-fade-in-down">
                      <div className="px-4 py-3 border-b border-slate-200">
                        <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                        {user.email && <p className="text-xs text-slate-500 truncate">{user.email}</p>}
                      </div>
                      {user.role === 'admin' && (
                        <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-800 hover:bg-slate-100 hover:text-red-600 transition-colors font-semibold">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                          <span>Trang quản trị</span>
                        </Link>
                      )}
                      <Link to="/profile" className="flex items-center gap-3 px-4 py-2 text-sm text-slate-800 hover:bg-slate-100 hover:text-purple-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clipRule="evenodd" /></svg>
                        <span>Hồ sơ của bạn</span>
                      </Link>
                      <button onClick={handleLogout} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-slate-800 hover:bg-slate-100 hover:text-pink-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
                </>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/40 transition-all transform hover:scale-105"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  <span>Đăng nhập</span>
                </Link>
              )}
          </div>
        </div>
      </div>
      {/* Tầng dưới: Navigation */}
      <div style={{ backgroundColor: '#cc503f' }}>
        <div className="container mx-auto px-6">
          <nav className="flex items-center justify-between">
            {/* Nhóm các mục điều hướng ở giữa */}
            <div className="flex-1 flex items-center justify-center gap-8">
              <Link to="/" className="flex items-center gap-2 py-3 text-white hover:text-yellow-300 transition-colors font-semibold">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg>
                Trang chủ
              </Link>
              {/* === BỘ LỌC MỚI === */}
              <div className="relative" ref={filterRef}>
                <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="flex items-center gap-2 py-3 text-white hover:text-yellow-300 transition-colors font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Lọc sản phẩm</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isFilterOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 bg-white rounded-xl shadow-2xl z-20 py-2 border border-slate-100 animate-fade-in-down">
                    {categories.map(category => (
                      <a key={category} onClick={() => handleCategorySelect(category)} className={`block w-full text-left px-4 py-2 text-sm cursor-pointer hover:bg-slate-100 hover:text-purple-600 ${selectedCategory === category ? 'text-purple-600 font-bold' : 'text-slate-700'}`}>
                        {category}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              {/* === KẾT THÚC BỘ LỌC MỚI === */}
              {user && (
                <Link to="/my-products" className="flex items-center gap-2 py-3 text-white hover:text-yellow-300 transition-colors font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3z" clipRule="evenodd" /></svg>
                  Sản phẩm đã đăng ký
                </Link>
              )}
              {user && (
                <Link to="/my-contracts" className="flex items-center gap-2 py-3 text-white hover:text-yellow-300 transition-colors font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" /></svg>
                  Hợp đồng của tôi
                </Link>
              )}
              {user && (
                <Link to="/claim-request" className="flex items-center gap-2 py-3 text-white hover:text-yellow-300 transition-colors font-semibold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg>
                  Yêu cầu chi trả
                </Link>
              )}
            </div>
            {/* Số điện thoại được đẩy sang phải */}
            <a href="tel:0971304944" className="flex items-center gap-2 py-3 text-white hover:text-yellow-300 transition-colors font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              <span>0971304944</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;