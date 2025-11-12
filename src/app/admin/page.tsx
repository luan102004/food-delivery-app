import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Order from '@/models/Order';
import Restaurant from '@/models/Restaurant';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  await connectDB();

  const [totalUsers, totalOrders, totalRestaurants, todayOrders] = await Promise.all([
    User.countDocuments(),
    Order.countDocuments(),
    Restaurant.countDocuments(),
    Order.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Admin Dashboard 👨‍💼
        </h1>
        <p className="text-gray-600 mt-2">Quản lý toàn bộ hệ thống</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng người dùng</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalUsers}
              </p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Tổng đơn hàng</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalOrders}
              </p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Nhà hàng</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {totalRestaurants}
              </p>
            </div>
            <div className="text-4xl">🏪</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Đơn hôm nay</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {todayOrders}
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quản lý người dùng
          </h3>
          <ul className="space-y-2">
            <li>
              <a href="/admin/users" className="text-blue-600 hover:underline">
                Danh sách người dùng
              </a>
            </li>
            <li>
              <a href="/admin/users/create" className="text-blue-600 hover:underline">
                Thêm người dùng mới
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quản lý nhà hàng
          </h3>
          <ul className="space-y-2">
            <li>
              <a href="/admin/restaurants" className="text-blue-600 hover:underline">
                Danh sách nhà hàng
              </a>
            </li>
            <li>
              <a href="/admin/restaurants/pending" className="text-blue-600 hover:underline">
                Duyệt nhà hàng mới
              </a>
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Báo cáo & Thống kê
          </h3>
          <ul className="space-y-2">
            <li>
              <a href="/admin/reports" className="text-blue-600 hover:underline">
                Báo cáo doanh thu
              </a>
            </li>
            <li>
              <a href="/admin/analytics" className="text-blue-600 hover:underline">
                Phân tích hệ thống
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}