'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import OrderTimeline from '@/components/order/OrderTimeline';
import RealtimeTracker from '@/components/maps/RealtimeTracker';
import { useOrderTracking } from '@/hooks/useRealtime';

export default function TrackOrderPage() {
  const params = useParams();
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
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">Không tìm thấy đơn hàng</div>
      </div>
    );
  }

  const { order, driverLocation } = orderData;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Theo dõi đơn hàng #{orderNumber}
      </h1>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <OrderTimeline
            status={order.status}
            createdAt={order.createdAt}
            estimatedDeliveryTime={order.estimatedDeliveryTime}
            actualDeliveryTime={order.actualDeliveryTime}
          />

          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-lg font-semibold mb-4">Thông tin đơn hàng</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nhà hàng:</p>
                <p className="font-medium">{order.restaurantId.name}</p>
                <p className="text-sm text-gray-500">
                  {order.restaurantId.address}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Địa chỉ giao:</p>
                <p className="font-medium">{order.deliveryAddress}</p>
              </div>
              {order.driverId && (
                <div>
                  <p className="text-sm text-gray-600">Tài xế:</p>
                  <p className="font-medium">{order.driverId.name}</p>
                  <p className="text-sm text-gray-500">
                    {order.driverId.phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          {order.status !== 'delivered' && order.status !== 'cancelled' && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold mb-4">
                Vị trí trên bản đồ
              </h3>
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
          )}
        </div>
      </div>
    </div>
  );
}