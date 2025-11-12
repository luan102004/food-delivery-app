import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function RestaurantPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'restaurant') {
    redirect('/auth/signin');
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Chào mừng, {session.user.name}! 🏪
        </h1>
        <p className="text-gray-600 mt-2">Quản lý nhà hàng của bạn</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          href="/restaurant/orders"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-blue-500"
        >
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Đơn hàng
          </h3>
          <p className="text-gray-600 text-sm">Quản lý đơn hàng mới</p>
        </Link>

        <Link
          href="/restaurant/menu"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-green-500"
        >
          <div className="text-4xl mb-3">🍽️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Thực đơn
          </h3>
          <p className="text-gray-600 text-sm">Quản lý món ăn</p>
        </Link>

        <Link
          href="/restaurant/dashboard"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-purple-500"
        >
          <div className="text-4xl mb-3">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Thống kê
          </h3>
          <p className="text-gray-600 text-sm">Xem doanh thu</p>
        </Link>

        <Link
          href="/restaurant/promotions"
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow border-l-4 border-yellow-500"
        >
          <div className="text-4xl mb-3">🎫</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Khuyến mãi
          </h3>
          <p className="text-gray-600 text-sm">Tạo mã giảm giá</p>
        </Link>
      </div>
    </div>
  );
}