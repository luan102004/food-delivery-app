'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function DriverOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [isAvailable, setIsAvailable] = useState(false);
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
      fetchAvailableOrders();
      // Poll every 5 seconds
      const interval = setInterval(fetchAvailableOrders, 5000);
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
      console.error('Error fetching driver status:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      const response = await fetch('/api/driver/available-orders');
      const data = await response.json();
      setAvailableOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching available orders:', error);
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

  const acceptOrder = async (orderNumber: string) => {
    if (!confirm('Bạn có chắc muốn nhận đơn này?')) return;

    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber,
          status: 'picked_up',
          driverId: session?.user.id,
        }),
      });

      if (response.ok) {
        alert('Nhận đơn thành công!');
        router.push('/driver/dashboard');
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error accepting order:', error);
      alert('Có lỗi xảy ra!');
    }
  };

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Đơn hàng có sẵn
            </h1>
            <p className="text-gray-600 mt-1">
              {availableOrders.length} đơn đang chờ tài xế
            </p>
          </div>
          <button
            onClick={toggleAvailability}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              isAvailable
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                : 'bg-gray-400 text-white hover:bg-gray-500'
            }`}
          >
            {isAvailable ? '🟢 Đang hoạt động' : '🔴 Không hoạt động'}
          </button>
        </div>

        {!isAvailable && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-yellow-900 mb-1">
                  Bạn đang ở trạng thái không hoạt động
                </h3>
                <p className="text-sm text-yellow-800">
                  Bật trạng thái hoạt động để có thể nhận đơn hàng mới
                </p>
              </div>
            </div>
          </div>
        )}

        {availableOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có đơn hàng mới
            </h3>
            <p className="text-gray-500">
              {isAvailable
                ? 'Hệ thống sẽ tự động cập nhật khi có đơn mới'
                : 'Bật trạng thái hoạt động để nhận đơn'}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {availableOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold mb-1">
                        #{order.orderNumber}
                      </h3>
                      <p className="text-sm opacity-90">
                        🕐 {format(new Date(order.createdAt), 'dd/MM HH:mm')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(order.total)}
                      </p>
                      <p className="text-xs opacity-90">{order.items.length} món</p>
                    </div>
                  </div>
                </div>

                {/* Order Body */}
                <div className="p-6">
                  {/* Restaurant Info */}
                  <div className="mb-4 p-4 bg-orange-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span>🏪</span> Lấy hàng tại
                    </h4>
                    <p className="font-medium text-gray-900">
                      {order.restaurantId.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      📍 {order.restaurantId.address}
                    </p>
                    <p className="text-sm text-gray-600">
                      📞 {order.restaurantId.phone}
                    </p>
                  </div>

                  {/* Customer Info */}
                  <div className="mb-4 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span>📦</span> Giao đến
                    </h4>
                    <p className="font-medium text-gray-900">
                      {order.customerId.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      📍 {order.deliveryAddress}
                    </p>
                    <p className="text-sm text-gray-600">
                      📞 {order.customerId.phone}
                    </p>
                  </div>

                  {/* Items List */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span>🍽️</span> Món đã đặt
                    </h4>
                    <div className="space-y-2">
                      {order.items.slice(0, 3).map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm bg-gray-50 p-2 rounded"
                        >
                          <span className="text-gray-700">
                            <span className="font-semibold">{item.quantity}x</span>{' '}
                            {item.name}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-sm text-gray-500 text-center">
                          +{order.items.length - 3} món khác
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Estimated Distance & Time */}
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">🚗 Khoảng cách:</span>
                      <span className="font-semibold">~2.5 km</span>
                    </div>
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-600">⏱️ Thời gian dự kiến:</span>
                      <span className="font-semibold">~15 phút</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {order.notes && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">📝 Ghi chú:</span> {order.notes}
                      </p>
                    </div>
                  )}

                  {/* Payment Info */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Thanh toán:</span>
                      <span className="font-semibold">
                        {order.paymentMethod === 'cash' && '💵 Tiền mặt'}
                        {order.paymentMethod === 'card' && '💳 Đã thanh toán'}
                        {order.paymentMethod === 'wallet' && '👛 Đã thanh toán'}
                      </span>
                    </div>
                    {order.paymentMethod === 'cash' && (
                      <p className="text-xs text-red-600 mt-2">
                        ⚠️ Thu tiền mặt từ khách hàng
                      </p>
                    )}
                  </div>

                  {/* Accept Button */}
                  <button
                    onClick={() => acceptOrder(order.orderNumber)}
                    disabled={!isAvailable}
                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                      isAvailable
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isAvailable ? '✅ Nhận đơn ngay' : '🔒 Bật hoạt động để nhận đơn'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}