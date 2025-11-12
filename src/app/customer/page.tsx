import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import Restaurant from '@/models/Restaurant';

export default async function CustomerPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'customer') {
    redirect('/auth/signin');
  }

  await connectDB();
  const restaurants = await Restaurant.find({ isActive: true })
    .select('name description address image cuisine rating')
    .limit(12)
    .lean();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Chào mừng, {session.user.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Bạn muốn ăn gì hôm nay?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link
          href="/customer/order"
          className="bg-blue-600 text-white p-6 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <div className="text-3xl mb-2">📋</div>
          <h3 className="text-xl font-semibold">Đơn hàng của tôi</h3>
          <p className="text-sm mt-1 opacity-90">Xem lịch sử đặt hàng</p>
        </Link>
        <Link
          href="/customer/promotions"
          className="bg-green-600 text-white p-6 rounded-lg shadow-md hover:bg-green-700 transition-colors"
        >
          <div className="text-3xl mb-2">🎫</div>
          <h3 className="text-xl font-semibold">Khuyến mãi</h3>
          <p className="text-sm mt-1 opacity-90">Xem mã giảm giá</p>
        </Link>
        <Link
          href="/customer/profile"
          className="bg-purple-600 text-white p-6 rounded-lg shadow-md hover:bg-purple-700 transition-colors"
        >
          <div className="text-3xl mb-2">👤</div>
          <h3 className="text-xl font-semibold">Hồ sơ</h3>
          <p className="text-sm mt-1 opacity-90">Cập nhật thông tin</p>
        </Link>
      </div>

      {/* Restaurants */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Nhà hàng gần bạn
        </h2>
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
          {restaurants.map((restaurant: any) => (
            <Link
              key={restaurant._id.toString()}
              href={`/customer/restaurant/${restaurant._id.toString()}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <div className="h-48 bg-gray-200 relative">
                {restaurant.image ? (
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    🍽️
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                  {restaurant.name}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                  {restaurant.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">⭐</span>
                    <span className="text-sm font-medium">
                      {restaurant.rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {restaurant.cuisine.slice(0, 2).map((c: string) => (
                      <span
                        key={c}
                        className="text-xs bg-gray-100 px-2 py-1 rounded"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}