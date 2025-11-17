'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function DriverHistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user.role !== 'driver') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user.role === 'driver') {
      fetchHistory();
    }
  }, [session, filter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const url =
        filter === 'all'
          ? '/api/orders?status=delivered,cancelled'
          : `/api/orders?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalDelivered = orders.filter((o) => o.status === 'delivered').length;
  const totalEarnings = orders
    .filter((o) => o.status === 'delivered')
    .reduce((sum, o) => sum + o.deliveryFee, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Lịch sử giao hàng
        </h1>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Đã giao</p>
                <p className="text-4xl font-bold">{totalDelivered}</p>
              </div>
              <div className="text-5xl">✅</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Thu nhập</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(totalEarnings)}
                </p>
              </div>
              <div className="text-5xl">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg p-6 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Đơn TB/ngày</p>
                <p className="text-4xl font-bold">
                  {Math.round(totalDelivered / 7)}
                </p>
              </div>
              <div className="text-5xl">📊</div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilter('delivered')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'delivered'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã giao
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'cancelled'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã hủy
            </button>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500">Chưa có lịch sử giao hàng</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        #{order.orderNumber}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {order.status === 'delivered' ? '✅ Đã giao' : '❌ Đã hủy'}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          🏪 {order.restaurantId.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          📍 {order.restaurantId.address}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          👤 {order.customerId.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          📍 {order.deliveryAddress}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <span>🕐 {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}</span>
                      {order.actualDeliveryTime && (
                        <span>
                          ✅ Giao lúc:{' '}
                          {format(new Date(order.actualDeliveryTime), 'HH:mm')}
                        </span>
                      )}
                      <span>{order.items.length} món</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Phí giao hàng</p>
                    <p className="text-2xl font-bold text-green-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(order.deliveryFee)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Tổng đơn:{' '}
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(order.total)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}