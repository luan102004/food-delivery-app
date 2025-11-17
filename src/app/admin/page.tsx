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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600" />
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-12">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-2">
              Xin chào, {session.user.name}! 👋
            </h1>
            <p className="text-xl opacity-90">Bạn muốn ăn gì hôm nay?</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-8">
        {/* Quick Actions - Beautiful Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Link
            href="/customer/order"
            className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              📋
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Đơn hàng</h3>
            <p className="text-xs text-gray-500">Lịch sử đặt hàng</p>
          </Link>

          <Link
            href="/customer/promotions"
            className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              🎫
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Khuyến mãi</h3>
            <p className="text-xs text-gray-500">Mã giảm giá</p>
          </Link>

          <Link
            href="/profile"
            className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-2xl transition-all transform hover:-translate-y-1"
          >
            <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
              👤
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Hồ sơ</h3>
            <p className="text-xs text-gray-500">Thông tin cá nhân</p>
          </Link>
        </div>

        {/* Restaurants Grid */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🏪</span> Nhà hàng gần bạn
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-8">
          {restaurants.map((restaurant: any) => (
            <Link
              key={restaurant._id.toString()}
              href={`/customer/restaurant/${restaurant._id.toString()}`}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              {/* Restaurant Image */}
              <div className="h-40 bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200 relative">
                {restaurant.image ? (
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    🍽️
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1">
                  <span className="text-yellow-400">⭐</span>
                  <span className="text-sm font-bold">{restaurant.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Restaurant Info */}
              <div className="p-4">
                <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                  {restaurant.name}
                </h3>
                <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                  {restaurant.description}
                </p>
                <div className="flex gap-1 flex-wrap">
                  {restaurant.cuisine.slice(0, 2).map((c: string) => (
                    <span
                      key={c}
                      className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}