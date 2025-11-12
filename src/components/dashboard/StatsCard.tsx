'use client';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
}

export default function StatsCard({
  title,
  value,
  change,
  icon,
  color,
}: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
          {change !== undefined && (
            <p
              className={`text-sm mt-2 ${
                change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
            </p>
          )}
        </div>
        <div
          className={`${colorClasses[color]} text-white text-3xl w-14 h-14 rounded-full flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}