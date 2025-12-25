import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const StatItem = ({ title, value, icon }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-sm transition">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {title}
        </p>
        <div className="text-slate-400">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-3xl font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
};

const AdminOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('hieushop-token');
      try {
        const res = await fetch('/api/stats/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (err) {
        console.error('Lỗi tải thống kê:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const formatRevenue = (value = 0) => {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value;
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500">
        Đang tải dữ liệu thống kê...
      </div>
    );
  }

  const statsData = [
    {
      title: 'Tổng doanh thu',
      value: formatRevenue(stats?.totalRevenue),
      link: '/admin/dashboard/contracts', // Chuyển đến trang quản lý hợp đồng
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V7m0 10v1" />
        </svg>
      ),
    },
    {
      title: 'Tổng hồ sơ',
      value: stats?.totalApplications || 0,
      link: '/admin/dashboard/applications', // Chuyển đến trang quản lý hồ sơ
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Tổng người dùng',
      value: stats?.totalUsers || 0,
      link: '/admin/dashboard/users', // Chuyển đến trang quản lý người dùng
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m6-4a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      title: 'Tổng sản phẩm',
      value: stats?.totalProducts || 0,
      link: '/admin/dashboard/products', // Chuyển đến trang quản lý sản phẩm
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Tổng quan hệ thống
        </h1>
        <p className="text-slate-500 mt-1">
          Thống kê nhanh dữ liệu toàn hệ thống
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsData.map(item => (
          <Link to={item.link} key={item.title} className="block">
            <StatItem {...item} />
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
