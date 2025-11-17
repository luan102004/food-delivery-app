'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function DriverDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(false);
  const [currentOrders, setCurrentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user.role !== 'driver') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user.role === 'driver') {
      fetchDriverStatus();
      fetchCurrentOrders();
      startLocationTracking();

      const interval = setInterval(fetchCurrentOrders, 5000);
      return () => clearInterval(interval);
    }
  }, [session]);

  const fetchDriverStatus = async () => {
    try {
      const response = await fetch('/api/driver/location');
      const data = await response.json();
      if (data.location) {
        setIsAvailable(data.location.isAvailable);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentOrders = async () => {
    try {
      const response = await fetch('/api/orders?status=picked_up,delivering');
      const data = await response.json();
      setCurrentOrders(data.orders || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleAvailability = async () => {
    try {
      await fetch('/api/driver/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !isAvailable }),
      });
      setIsAvailable(!isAvailable);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        async (position) => {
          await fetch('/api/driver/location', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              currentOrderId: currentOrders[0]?._id,
            }),
          });
        },
        (error) => console.error('Geolocation error:', error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }
  };

  const updateOrderStatus = async (orderNumber: string, status: string) => {
    try {
      await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, status }),
      });
      fetchCurrentOrders();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600" />
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Dashboard Tài xế</h1>
              <p className="text-white/90">{currentOrders.length} đơn đang giao</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleAvailability}
              className={`px-8 py-4 rounded-2xl font-bold shadow-xl transition-all ${
                isAvailable
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-400 text-white hover:bg-gray-500'
              }`}
            >
              {isAvailable ? '🟢 Đang hoạt động' : '🔴 Không hoạt động'}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-4 pb-8">
        {/* Status Banner */}
        {!isAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-6 mb-6 text-white"
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl">⚠️</div>
              <div>
                <h3 className="font-bold text-lg mb-1">Bạn đang ở trạng thái không hoạt động</h3>
                <p className="text-sm opacity-90">
                  Bật trạng thái hoạt động để nhận đơn hàng mới
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Current Orders */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📦</span> Đơn hàng hiện tại ({currentOrders.length})
          </h2>

          {currentOrders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">
                {isAvailable ? '⏳' : '😴'}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isAvailable ? 'Chưa có đơn hàng' : 'Bạn đang offline'}
              </h3>
              <p className="text-gray-500">
                {isAvailable
                  ? 'Đợi đơn mới...'
                  : 'Bật trạng thái hoạt động để nhận đơn'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {order.restaurantId.name}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-bold ${
                        order.status === 'picked_up'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}
                    >
                      {order.status === 'picked_up' ? '🚗 Đã lấy hàng' : '🛵 Đang giao'}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-xl p-4">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span>🏪</span> Lấy hàng tại
                      </h4>
                      <p className="text-sm text-gray-600">{order.restaurantId.address}</p>
                      <p className="text-sm text-gray-600">{order.restaurantId.phone}</p>
                    </div>

                    <div className="bg-white rounded-xl p-4">
                      <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span>📦</span> Giao đến
                      </h4>
                      <p className="text-sm font-semibold">{order.customerId.name}</p>
                      <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                      <p className="text-sm text-gray-600">{order.customerId.phone}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {order.status === 'picked_up' && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateOrderStatus(order.orderNumber, 'delivering')}
                        className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold shadow-lg"
                      >
                        🛵 Bắt đầu giao
                      </motion.button>
                    )}
                    {order.status === 'delivering' && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => updateOrderStatus(order.orderNumber, 'delivered')}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg"
                      >
                        ✅ Hoàn thành
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}