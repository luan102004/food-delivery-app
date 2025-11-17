'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
      const interval = setInterval(fetchOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [session, filter]);

  const fetchOrders = async () => {
    try {
      const url = filter === 'all' ? '/api/orders' : `/api/orders?status=${filter}`;
      const response = await fetch(url);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error:', error);
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
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      pending: { color: 'from-yellow-400 to-orange-500', icon: '🕐', label: 'Chờ xác nhận' },
      confirmed: { color: 'from-blue-400 to-blue-600', icon: '✅', label: 'Đã xác nhận' },
      preparing: { color: 'from-purple-400 to-purple-600', icon: '👨‍🍳', label: 'Đang làm' },
      ready: { color: 'from-green-400 to-green-600', icon: '📦', label: 'Sẵn sàng' },
      picked_up: { color: 'from-cyan-400 to-cyan-600', icon: '🚗', label: 'Đã lấy' },
      delivering: { color: 'from-orange-400 to-red-500', icon: '🛵', label: 'Đang giao' },
      delivered: { color: 'from-emerald-400 to-emerald-600', icon: '🎉', label: 'Đã giao' },
      cancelled: { color: 'from-red-400 to-red-600', icon: '❌', label: 'Đã hủy' },
    };
    return configs[status] || configs.pending;
  };

  const getNextAction = (status: string) => {
    const actions: any = {
      pending: { status: 'confirmed', label: 'Xác nhận', icon: '✅' },
      confirmed: { status: 'preparing', label: 'Bắt đầu làm', icon: '👨‍🍳' },
      preparing: { status: 'ready', label: 'Sẵn sàng', icon: '📦' },
    };
    return actions[status];
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const todayCount = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === new Date().toDateString()
  ).length;

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
          <h1 className="text-3xl font-bold text-white mb-2">Quản lý đơn hàng</h1>
          <p className="text-white/90">{orders.length} đơn hàng</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-6 pb-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Chờ xác nhận', count: pendingCount, color: 'from-yellow-400 to-orange-500', icon: '🕐' },
            { label: 'Đang làm', count: preparingCount, color: 'from-purple-400 to-purple-600', icon: '👨‍🍳' },
            { label: 'Sẵn sàng', count: readyCount, color: 'from-green-400 to-green-600', icon: '📦' },
            { label: 'Hôm nay', count: todayCount, color: 'from-blue-400 to-blue-600', icon: '📊' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-2xl p-4 text-white shadow-lg`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{stat.icon}</span>
                <span className="text-3xl font-bold">{stat.count}</span>
              </div>
              <p className="text-sm opacity-90">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { key: 'all', label: 'Tất cả', icon: '📋' },
              { key: 'pending', label: 'Chờ xác nhận', icon: '🕐' },
              { key: 'confirmed', label: 'Đã xác nhận', icon: '✅' },
              { key: 'preparing', label: 'Đang làm', icon: '👨‍🍳' },
              { key: 'ready', label: 'Sẵn sàng', icon: '📦' },
            ].map((tab) => (
              <motion.button
                key={tab.key}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  filter === tab.key
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Orders Grid */}
        {orders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có đơn hàng</h3>
            <p className="text-gray-500">Đơn hàng mới sẽ xuất hiện ở đây</p>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Orders List */}
            <div className="space-y-4">
              <AnimatePresence>
                {orders.map((order, index) => {
                  const config = getStatusConfig(order.status);
                  const nextAction = getNextAction(order.status);

                  return (
                    <motion.div
                      key={order._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedOrder(order)}
                      className={`bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all ${
                        selectedOrder?.orderNumber === order.orderNumber
                          ? 'ring-4 ring-purple-500'
                          : 'hover:shadow-2xl'
                      }`}
                    >
                      {/* Order Header */}
                      <div className={`bg-gradient-to-r ${config.color} p-4`}>
                        <div className="flex items-center justify-between text-white">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl">
                              {config.icon}
                            </div>
                            <div>
                              <p className="font-bold text-lg">#{order.orderNumber}</p>
                              <p className="text-sm opacity-90">
                                {format(new Date(order.createdAt), 'HH:mm')}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold">
                              {new Intl.NumberFormat('vi-VN').format(order.total)}₫
                            </p>
                            <p className="text-sm opacity-90">{order.items.length} món</p>
                          </div>
                        </div>
                      </div>

                      {/* Order Body */}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xl">👤</span>
                          <div>
                            <p className="font-bold text-gray-900">{order.customerId.name}</p>
                            <p className="text-sm text-gray-600">{order.customerId.phone}</p>
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="space-y-2 mb-4">
                          {order.items.slice(0, 2).map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between text-sm bg-gray-50 p-2 rounded-lg">
                              <span className="text-gray-700">
                                <span className="font-bold text-purple-600">{item.quantity}x</span> {item.name}
                              </span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-sm text-gray-500 text-center">
                              +{order.items.length - 2} món khác
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        {nextAction && (
                          <div className="flex gap-2">
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                updateOrderStatus(order.orderNumber, nextAction.status);
                              }}
                              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold shadow-lg"
                            >
                              {nextAction.icon} {nextAction.label}
                            </motion.button>
                            {order.status === 'pending' && (
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (confirm('Bạn có chắc muốn hủy đơn này?')) {
                                    updateOrderStatus(order.orderNumber, 'cancelled');
                                  }
                                }}
                                className="px-4 bg-red-600 text-white py-3 rounded-xl font-bold shadow-lg"
                              >
                                ❌
                              </motion.button>
                            )}
                          </div>
                        )}

                        {order.status === 'ready' && (
                          <div className="mt-3 p-3 bg-green-50 border-2 border-green-200 rounded-xl">
                            <p className="text-sm text-green-800 font-semibold text-center">
                              ✅ Đơn sẵn sàng - Chờ tài xế đến lấy
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Order Detail Panel */}
            <div className="lg:sticky lg:top-4 lg:h-fit">
              {selectedOrder ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>📋</span> Chi tiết đơn hàng
                  </h2>

                  {/* Customer Info */}
                  <div className="mb-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span>👤</span> Khách hàng
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-gray-600">Tên:</span>{' '}
                        <span className="font-semibold">{selectedOrder.customerId.name}</span>
                      </p>
                      <p>
                        <span className="text-gray-600">SĐT:</span>{' '}
                        <span className="font-semibold">{selectedOrder.customerId.phone}</span>
                      </p>
                      <p>
                        <span className="text-gray-600">Địa chỉ:</span>{' '}
                        <span className="font-semibold">{selectedOrder.deliveryAddress}</span>
                      </p>
                    </div>
                  </div>

                  {/* Driver Info */}
                  {selectedOrder.driverId && (
                    <div className="mb-6 p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                      <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <span>🚗</span> Tài xế
                      </h3>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="text-gray-600">Tên:</span>{' '}
                          <span className="font-semibold">{selectedOrder.driverId.name}</span>
                        </p>
                        <p>
                          <span className="text-gray-600">SĐT:</span>{' '}
                          <span className="font-semibold">{selectedOrder.driverId.phone}</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <span>🍽️</span> Món đã đặt
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl"
                        >
                          <div className="flex-1">
                            <p className="font-bold text-gray-900">
                              <span className="text-purple-600">{item.quantity}x</span> {item.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Intl.NumberFormat('vi-VN').format(item.price)}₫ / món
                            </p>
                          </div>
                          <p className="text-lg font-bold text-purple-600">
                            {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}₫
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  {selectedOrder.notes && (
                    <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span>📝</span> Ghi chú
                      </h3>
                      <p className="text-sm text-gray-700">{selectedOrder.notes}</p>
                    </div>
                  )}

                  {/* Price Summary */}
                  <div className="border-t-2 pt-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-gray-600">
                        <span>Tạm tính:</span>
                        <span>
                          {new Intl.NumberFormat('vi-VN').format(selectedOrder.subtotal)}₫
                        </span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Phí giao hàng:</span>
                        <span>
                          {new Intl.NumberFormat('vi-VN').format(selectedOrder.deliveryFee)}₫
                        </span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Giảm giá:</span>
                          <span>
                            -{new Intl.NumberFormat('vi-VN').format(selectedOrder.discount)}₫
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-between text-2xl font-bold">
                      <span>Tổng cộng:</span>
                      <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {new Intl.NumberFormat('vi-VN').format(selectedOrder.total)}₫
                      </span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="mt-4 p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Thanh toán:</span>
                      <span className="font-bold">
                        {selectedOrder.paymentMethod === 'cash' && '💵 Tiền mặt'}
                        {selectedOrder.paymentMethod === 'card' && '💳 Thẻ'}
                        {selectedOrder.paymentMethod === 'wallet' && '👛 Ví điện tử'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                  <div className="text-6xl mb-4">👈</div>
                  <p className="text-gray-500">Chọn đơn hàng để xem chi tiết</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}