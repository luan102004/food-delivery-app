'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function DriverDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(false);
  const [currentOrders, setCurrentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchDriverStatus();
      fetchCurrentOrders();
      startLocationTracking();
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
      console.error('Error fetching driver status:', error);
    }
  };

  const fetchCurrentOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/orders?status=picked_up,delivering');
      const data = await response.json();
      setCurrentOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
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
      console.error('Error toggling availability:', error);
    }
  };

  const startLocationTracking = () => {
    if ('geolocation' in navigator) {
      const watchId = navigator.geolocation.watchPosition(
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

      return () => navigator.geolocation.clearWatch(watchId);
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
      console.error('Error updating order:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Tài xế</h1>
        <button
          onClick={toggleAvailability}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isAvailable
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-400 text-white hover:bg-gray-500'
          }`}
        >
          {isAvailable ? '🟢 Đang hoạt động' : '🔴 Không hoạt động'}
        </button>
      </div>

      {/* Current Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Đơn hàng hiện tại ({currentOrders.length})
        </h2>

        {currentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {isAvailable
              ? 'Chưa có đơn hàng nào. Đợi đơn mới...'
              : 'Bật trạng thái hoạt động để nhận đơn'}
          </div>
        ) : (
          <div className="space-y-4">
            {currentOrders.map((order) => (
              <div
                key={order._id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">
                      #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {order.restaurantId.name}
                    </p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {order.status === 'picked_up' ? 'Đã lấy hàng' : 'Đang giao'}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Lấy hàng tại:</p>
                    <p className="font-medium">{order.restaurantId.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Giao hàng đến:</p>
                    <p className="font-medium">{order.deliveryAddress}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Khách hàng:</p>
                    <p className="font-medium">
                      {order.customerId.name} - {order.customerId.phone}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {order.status === 'ready' && (
                    <button
                      onClick={() => updateOrderStatus(order.orderNumber, 'picked_up')}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                    >
                      Đã lấy hàng
                    </button>
                  )}
                  {order.status === 'picked_up' && (
                    <button
                      onClick={() => updateOrderStatus(order.orderNumber, 'delivering')}
                      className="flex-1 bg-orange-600 text-white py-2 rounded-md hover:bg-orange-700"
                    >
                      Bắt đầu giao
                    </button>
                  )}
                  {order.status === 'delivering' && (
                    <button
                      onClick={() => updateOrderStatus(order.orderNumber, 'delivered')}
                      className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                    >
                      Hoàn thành
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}