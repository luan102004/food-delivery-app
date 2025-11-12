'use client';

import { useLanguage } from '@/hooks/useLanguage';
import { format } from 'date-fns';

interface OrderTimelineProps {
  status: string;
  createdAt: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
}

export default function OrderTimeline({
  status,
  createdAt,
  estimatedDeliveryTime,
  actualDeliveryTime,
}: OrderTimelineProps) {
  const { t } = useLanguage();

  const steps = [
    { key: 'pending', label: t('order.pending'), icon: '🕐' },
    { key: 'confirmed', label: t('order.confirmed'), icon: '✅' },
    { key: 'preparing', label: t('order.preparing'), icon: '👨‍🍳' },
    { key: 'ready', label: t('order.ready'), icon: '📦' },
    { key: 'picked_up', label: t('order.picked_up'), icon: '🚗' },
    { key: 'delivering', label: t('order.delivering'), icon: '🛵' },
    { key: 'delivered', label: t('order.delivered'), icon: '🎉' },
  ];

  const statusIndex = steps.findIndex((step) => step.key === status);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        {t('order.trackOrder')}
      </h3>

      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index <= statusIndex;
          const isCurrent = index === statusIndex;

          return (
            <div key={step.key} className="flex items-start">
              <div className="flex flex-col items-center mr-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  } ${isCurrent ? 'ring-4 ring-green-200' : ''}`}
                >
                  {step.icon}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-0.5 h-8 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>

              <div className="flex-1">
                <p
                  className={`font-medium ${
                    isCompleted ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </p>
                {isCurrent && (
                  <p className="text-sm text-green-600 mt-1">
                    {t('order.status')}: {step.label}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Thời gian đặt:</p>
            <p className="font-medium">
              {format(new Date(createdAt), 'dd/MM/yyyy HH:mm')}
            </p>
          </div>
          {estimatedDeliveryTime && (
            <div>
              <p className="text-gray-600">Dự kiến giao:</p>
              <p className="font-medium">
                {format(new Date(estimatedDeliveryTime), 'HH:mm')}
              </p>
            </div>
          )}
          {actualDeliveryTime && (
            <div>
              <p className="text-gray-600">Đã giao lúc:</p>
              <p className="font-medium text-green-600">
                {format(new Date(actualDeliveryTime), 'dd/MM/yyyy HH:mm')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}