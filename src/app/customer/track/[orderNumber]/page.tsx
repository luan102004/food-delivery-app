'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useOrderTracking } from '@/hooks/useRealtime';
import RealtimeTracker from '@/components/maps/RealtimeTracker';

export default function TrackOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderNumber = params.orderNumber as string;
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const realtimeUpdate = useOrderTracking(orderNumber);

  useEffect(() => {
    fetchOrderData();
  }, [orderNumber]);

  useEffect(() => {
    if (realtimeUpdate) {
      setOrderData((prev: any) => ({
        ...prev,
        order: realtimeUpdate.order,
      }));
    }
  }, [realtimeUpdate]);

  const fetchOrderData = async () => {
    try {
      const response = await fetch(`/api/orders/track/${orderNumber}`);
      const data = await response.json();
      setOrderData(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (stepIndex: number, currentStep: number) => {
    if (stepIndex < currentStep) return 'completed';
    if (stepIndex === currentStep) return 'current';
    return 'upcoming';
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

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h3 className="text-xl font-bold text-red-600 mb-2">Không tìm thấy đơn hàng</h3>
          <button
            onClick={() => router.back()}
            className="mt-4 text-red-600 underline"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  const { order } = orderData;

  const steps = [
    { key: 'pending', label: 'Chờ xác nhận', icon: '🕐', color: 'from-yellow-400 to-orange-500' },
    { key: 'confirmed', label: 'Đã xác nhận', icon: '✅', color: 'from-blue-400 to-blue-600' },
    { key: 'preparing', label: 'Đang làm', icon: '👨‍🍳', color: 'from-purple-400 to-purple-600' },
    { key: 'ready', label: 'Sẵn sàng', icon: '📦', color: 'from-green-400 to-green-600' },
    { key: 'picked_up', label: 'Đã lấy hàng', icon: '🚗', color: 'from-cyan-400 to-cyan-600' },
    { key: 'delivering', label: 'Đang giao', icon: '🛵', color: 'from-orange-400 to-red-500' },
    { key: 'delivered', label: 'Đã giao', icon: '🎉', color: 'from-emerald-400 to-emerald-600' },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === order.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600" />
        <div className="relative max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="text-white mb-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            ← Quay lại
          </button>
          <h1 className="text-2xl font-bold text-white mb-1">Theo dõi đơn hàng</h1>
          <p className="text-white/90 text-lg">#{orderNumber}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-4 pb-8">
        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>🚀</span> Tiến trình đơn hàng
          </h2>

          <div className="space-y-4">
            {steps.map((step, index) => {
              const status = getStepStatus(index, currentStepIndex);
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';

              return (
                <motion.div
                  key={step.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  {/* Icon */}
                  <div className="relative">
                    <motion.div
                      animate={isCurrent ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 1, repeat: Infinity }}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg ${
                        isCompleted || isCurrent
                          ? `bg-gradient-to-br ${step.color}`
                          : 'bg-gray-200'
                      }`}
                    >
                      {step.icon}
                    </motion.div>
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute left-7 top-14 w-0.5 h-8 ${
                          isCompleted ? 'bg-gradient-to-b from-purple-500 to-pink-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h3
                      className={`font-bold text-lg mb-1 ${
                        isCompleted || isCurrent ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </h3>
                    {isCurrent && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-purple-600 font-semibold"
                      >
                        ⚡ Đang xử lý...
                      </motion.p>
                    )}
                    {isCompleted && (
                      <p className="text-sm text-green-600">✓ Hoàn thành</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Map */}
        {order.status !== 'delivered' && order.status !== 'cancelled' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🗺️</span> Vị trí realtime
            </h2>
            <div className="h-80 rounded-xl overflow-hidden">
              <RealtimeTracker
                orderId={order._id}
                restaurantLocation={{
                  lat: order.restaurantId.location.coordinates[1],
                  lng: order.restaurantId.location.coordinates[0],
                }}
                deliveryLocation={{
                  lat: order.deliveryLocation.coordinates[1],
                  lng: order.deliveryLocation.coordinates[0],
                }}
                driverId={order.driverId?._id}
              />
            </div>
          </motion.div>
        )}

        {/* Order Details */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Restaurant Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-50 to-pink-50 rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🏪</span> Nhà hàng
            </h3>
            <div className="space-y-2">
              <p className="font-bold text-gray-900">{order.restaurantId.name}</p>
              <p className="text-sm text-gray-600">📍 {order.restaurantId.address}</p>
              <p className="text-sm text-gray-600">📞 {order.restaurantId.phone}</p>
            </div>
          </motion.div>

          {/* Delivery Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>📦</span> Giao đến
            </h3>
            <div className="space-y-2">
              <p className="font-bold text-gray-900">{order.customerId.name}</p>
              <p className="text-sm text-gray-600">📍 {order.deliveryAddress}</p>
              <p className="text-sm text-gray-600">📞 {order.customerId.phone}</p>
            </div>
          </motion.div>

          {/* Driver Info */}
          {order.driverId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl shadow-lg p-6"
            >
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🚗</span> Tài xế
              </h3>
              <div className="space-y-2">
                <p className="font-bold text-gray-900">{order.driverId.name}</p>
                <p className="text-sm text-gray-600">📞 {order.driverId.phone}</p>
              </div>
            </motion.div>
          )}

          {/* Order Items */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🍽️</span> Món đã đặt
            </h3>
            <div className="space-y-2">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between text-sm bg-white p-3 rounded-xl">
                  <span className="text-gray-700">
                    <span className="font-bold text-purple-600">{item.quantity}x</span> {item.name}
                  </span>
                  <span className="font-bold text-gray-900">
                    {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}₫
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Price Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl shadow-lg p-6 mt-6"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>💰</span> Chi tiết thanh toán
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Tạm tính:</span>
              <span>{new Intl.NumberFormat('vi-VN').format(order.subtotal)}₫</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Phí giao hàng:</span>
              <span>{new Intl.NumberFormat('vi-VN').format(order.deliveryFee)}₫</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá:</span>
                <span>-{new Intl.NumberFormat('vi-VN').format(order.discount)}₫</span>
              </div>
            )}
            <div className="border-t-2 pt-3 flex justify-between text-2xl font-bold">
              <span>Tổng cộng:</span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {new Intl.NumberFormat('vi-VN').format(order.total)}₫
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}