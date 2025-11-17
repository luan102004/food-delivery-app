import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function DriverPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'driver') {
    redirect('/auth/signin');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Chào mừng, {session.user.name}! 🚗
        </h1>
        <p className="text-gray-600 mt-2">Bảng điều khiển tài xế</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Link
          href="/driver/dashboard"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-blue-500"
        >
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Dashboard
          </h3>
          <p className="text-gray-600 text-sm">Xem đơn hàng và trạng thái</p>
        </Link>

        <Link
          href="/driver/orders"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-green-500"
        >
          <div className="text-4xl mb-3">📦</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Đơn hàng
          </h3>
          <p className="text-gray-600 text-sm">Đơn hàng hiện tại</p>
        </Link>

        <Link
          href="/driver/history"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-purple-500"
        >
          <div className="text-4xl mb-3">📜</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Lịch sử
          </h3>
          <p className="text-gray-600 text-sm">Lịch sử giao hàng</p>
        </Link>
      </div>
    </div>
  );
}