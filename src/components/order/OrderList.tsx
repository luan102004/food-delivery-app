'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { Order } from '@/types';
import Link from 'next/link';
import { format } from 'date-fns';

interface OrderListProps {
  orders: Order[];
}

export default function OrderList({ orders }: OrderListProps) {
  const { t } = useLanguage();

  const getStatusColor = (status: string) => {
    const colors: any = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-indigo-100 text-indigo-800',
      picked_up: 'bg-cyan-100 text-cyan-800',
      delivering: 'bg-orange-100 text-orange-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <p className="text-gray-500 text-lg">Chưa có đơn hàng nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div
          key={order._id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t('order.orderNumber')}: {order.orderNumber}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                order.status
              )}`}
            >
              {t(`order.${order.status}`)}
            </span>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">{t('order.subtotal')}:</span>
                <span>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">{t('order.deliveryFee')}:</span>
                <span>
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.deliveryFee)}
                </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm mb-2 text-green-600">
                  <span>{t('order.discount')}:</span>
                  <span>
                    -
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND',
                    }).format(order.discount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-lg">
                <span>{t('order.total')}:</span>
                <span className="text-blue-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(order.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Link
              href={`/customer/track/${order.orderNumber}`}
              className="flex-1 bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('order.trackOrder')}
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}