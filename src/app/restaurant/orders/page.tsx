'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function RestaurantOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user.role !== 'restaurant') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user.role === 'restaurant') {
      fetchOrders();
      // Poll for new orders every 10 seconds
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [session, filter]);

  const fetchOrders = async () => {
    try {
      const url =
        filter === 'all' ? '/api/orders' : `/api/orders?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderNumber: string, newStatus: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, status: newStatus }),
      });

      if (response.ok) {
        fetchOrders();
        if (selectedOrder?.orderNumber === orderNumber) {
          const updated = orders.find((o) => o.orderNumber === orderNumber);
          if (updated) {
            setSelectedOrder({ ...updated, status: newStatus });
          }
        }
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      preparing: 'bg-purple-100 text-purple-800 border-purple-200',
      ready: 'bg-green-100 text-green-800 border-green-200',
      picked_up: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      delivering: 'bg-orange-100 text-orange-800 border-orange-200',
      delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    const icons: any = {
      pending: '🕐',
      confirmed: '✅',
      preparing: '👨‍🍳',
      ready: '📦',
      picked_up: '🚗',
      delivering: '🛵',
      delivered: '🎉',
      cancelled: '❌',
    };
    return icons[status] || '📋';
  };

  const getNextStatus = (currentStatus: string) => {
    const flow: any = {
      pending: 'confirmed',
      confirmed: 'preparing',
      preparing: 'ready',
      ready: 'picked_up',
    };
    return flow[currentStatus];
  };

  const getNextStatusLabel = (currentStatus: string) => {
    const labels: any = {
      pending: 'Xác nhận',
      confirmed: 'Bắt đầu làm',
      preparing: 'Sẵn sàng',
      ready: 'Đã lấy hàng',
    };
    return labels[currentStatus];
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Quản lý đơn hàng
          </h1>
          <p className="text-gray-600">
            Tổng cộng {orders.length} đơn hàng
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg p-4 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Chờ xác nhận</p>
                <p className="text-3xl font-bold">{pendingCount}</p>
              </div>
              <div className="text-4xl">🕐</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg p-4 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Đang làm</p>
                <p className="text-3xl font-bold">{preparingCount}</p>
              </div>
              <div className="text-4xl">👨‍🍳</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-lg p-4 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Sẵn sàng</p>
                <p className="text-3xl font-bold">{readyCount}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg p-4 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Hôm nay</p>
                <p className="text-3xl font-bold">
                  {
                    orders.filter(
                      (o) =>
                        new Date(o.createdAt).toDateString() ===
                        new Date().toDateString()
                    ).length
                  }
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { key: 'all', label: 'Tất cả', icon: '📋' },
              { key: 'pending', label: 'Chờ xác nhận', icon: '🕐' },
              { key: 'confirmed', label: 'Đã xác nhận', icon: '✅' },
              { key: 'preparing', label: 'Đang làm', icon: '👨‍🍳' },
              { key: 'ready', label: 'Sẵn sàng', icon: '📦' },
              { key: 'picked_up', label: 'Đã lấy', icon: '🚗' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Orders List */}
          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 text-lg">Chưa có đơn hàng nào</p>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all hover:shadow-xl ${
                    selectedOrder?.orderNumber === order.orderNumber
                      ? 'ring-2 ring-blue-600'
                      : ''
                  }`}
                >
                  {/* Order Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          #{order.orderNumber}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}{' '}
                          {order.status === 'pending' && 'Chờ xác nhận'}
                          {order.status === 'confirmed' && 'Đã xác nhận'}
                          {order.status === 'preparing' && 'Đang làm'}
                          {order.status === 'ready' && 'Sẵn sàng'}
                          {order.status === 'picked_up' && 'Đã lấy hàng'}
                          {order.status === 'delivering' && 'Đang giao'}
                          {order.status === 'delivered' && 'Đã giao'}
                          {order.status === 'cancelled' && 'Đã hủy'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        🕐 {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                      </p>
                      <p className="text-sm text-gray-600">
                        👤 {order.customerId.name} - {order.customerId.phone}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(order.total)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items.length} món
                      </p>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t pt-3 mb-4">
                    <div className="space-y-2">
                      {order.items.map((item: any, index: number) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm"
                        >
                          <span className="text-gray-700">
                            <span className="font-semibold">{item.quantity}x</span>{' '}
                            {item.name}
                          </span>
                          <span className="text-gray-900 font-medium">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {order.status !== 'delivered' &&
                    order.status !== 'cancelled' &&
                    order.status !== 'picked_up' && (
                      <div className="flex gap-2">
                        {getNextStatus(order.status) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateOrderStatus(
                                order.orderNumber,
                                getNextStatus(order.status)
                              );
                            }}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                          >
                            {getNextStatusLabel(order.status)} →
                          </button>
                        )}
                        {order.status === 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Bạn có chắc muốn hủy đơn này?')) {
                                updateOrderStatus(order.orderNumber, 'cancelled');
                              }
                            }}
                            className="px-4 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-semibold transition-colors"
                          >
                            ❌ Hủy
                          </button>
                        )}
                      </div>
                    )}

                  {order.status === 'ready' && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800 font-medium text-center">
                        ✅ Đơn hàng sẵn sàng - Đang chờ tài xế đến lấy
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Order Detail Panel */}
          <div className="lg:sticky lg:top-4 lg:h-fit">
            {selectedOrder ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Chi tiết đơn hàng
                </h2>

                {/* Customer Info */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>👤</span> Thông tin khách hàng
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="text-gray-600">Tên:</span>{' '}
                      <span className="font-medium">
                        {selectedOrder.customerId.name}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">SĐT:</span>{' '}
                      <span className="font-medium">
                        {selectedOrder.customerId.phone}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">Địa chỉ:</span>{' '}
                      <span className="font-medium">
                        {selectedOrder.deliveryAddress}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Driver Info */}
                {selectedOrder.driverId && (
                  <div className="mb-6 p-4 bg-green-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span>🚗</span> Tài xế
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-600">Tên:</span>{' '}
                        <span className="font-medium">
                          {selectedOrder.driverId.name}
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-600">SĐT:</span>{' '}
                        <span className="font-medium">
                          {selectedOrder.driverId.phone}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Order Items Detail */}
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>🍽️</span> Món đã đặt
                  </h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {item.quantity}x {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(item.price)}{' '}
                            / món
                          </p>
                        </div>
                        <p className="text-lg font-bold text-blue-600">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <span>📝</span> Ghi chú
                    </h3>
                    <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="border-t pt-4">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Tạm tính:</span>
                      <span>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(selectedOrder.subtotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Phí giao hàng:</span>
                      <span>
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(selectedOrder.deliveryFee)}
                      </span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>Giảm giá:</span>
                        <span>
                          -
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(selectedOrder.discount)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between text-xl font-bold border-t pt-2">
                    <span>Tổng cộng:</span>
                    <span className="text-blue-600">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(selectedOrder.total)}
                    </span>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Thanh toán:</span>
                    <span className="font-semibold">
                      {selectedOrder.paymentMethod === 'cash' && '💵 Tiền mặt'}
                      {selectedOrder.paymentMethod === 'card' && '💳 Thẻ'}
                      {selectedOrder.paymentMethod === 'wallet' && '👛 Ví điện tử'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-600">Trạng thái:</span>
                    <span
                      className={`font-semibold ${
                        selectedOrder.paymentStatus === 'paid'
                          ? 'text-green-600'
                          : 'text-yellow-600'
                      }`}
                    >
                      {selectedOrder.paymentStatus === 'paid'
                        ? '✅ Đã thanh toán'
                        : '⏳ Chưa thanh toán'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-4">👈</div>
                <p className="text-gray-500">
                  Chọn một đơn hàng để xem chi tiết
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}