'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import StatsCard from '@/components/dashboard/StatsCard';
import AnalyticsChart from '@/components/dashboard/AnalyticsChart';
import { AnalyticsSummary, RevenueChartData, TopItem } from '@/types';

export default function DriverDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timeframe, setTimeframe] = useState('week');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [revenueChart, setRevenueChart] = useState<RevenueChartData[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Nếu chưa đăng nhập thì chuyển hướng đến trang signin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  // Gọi API khi có session và thay đổi timeframe
  useEffect(() => {
    if (session) {
      fetchAnalytics();
    }
  }, [session, timeframe]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/analytics?timeframe=${timeframe}`);
      const data = await response.json();
      setSummary(data.summary || null);
      setRevenueChart(data.revenueChart || []);
      setTopItems(data.topItems || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-gray-600">Đang tải dữ liệu...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Thống kê doanh thu</h1>
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="day">Hôm nay</option>
          <option value="week">Tuần này</option>
          <option value="month">Tháng này</option>
          <option value="quarter">Quý này</option>
          <option value="year">Năm này</option>
        </select>
      </div>

      {/* Stats Cards */}
      {summary && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Tổng doanh thu"
            value={new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(summary.totalRevenue)}
            change={summary.revenueGrowth}
            icon="💰"
            color="green"
          />
          <StatsCard
            title="Số đơn hàng"
            value={summary.totalOrders}
            change={summary.ordersGrowth}
            icon="📦"
            color="blue"
          />
          <StatsCard
            title="Giá trị TB/đơn"
            value={new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(summary.averageOrderValue)}
            icon="🎯"
            color="purple"
          />
          <StatsCard
            title="Tỷ lệ hoàn thành"
            value="95%"
            icon="✅"
            color="yellow"
          />
        </div>
      )}

      {/* Revenue Chart */}
      <div className="mb-8">
        <AnalyticsChart data={revenueChart} type="line" />
      </div>

      {/* Top Selling Items */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Món bán chạy nhất
        </h3>
        <div className="space-y-4">
          {topItems && topItems.length > 0 ? (
            topItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Đã bán: {item.quantity} món
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(item.revenue)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-500 text-center py-4">
              Không có dữ liệu món bán chạy
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
