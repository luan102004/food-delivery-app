import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  if (session) {
    switch (session.user.role) {
      case 'customer':
        redirect('/customer');
      case 'restaurant':
        redirect('/restaurant');
      case 'driver':
        redirect('/driver');
      case 'admin':
        redirect('/admin');
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">🍔 Food Delivery App</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Đặt món ăn yêu thích, theo dõi đơn hàng realtime, và nhận ưu đãi
              hấp dẫn
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Đăng nhập
              </Link>
              <Link
                href="/auth/signup"
                className="bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-800 transition-colors border-2 border-white"
              >
                Đăng ký ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tính năng nổi bật
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold mb-2">
                Theo dõi realtime
              </h3>
              <p className="text-gray-600">
                Xem vị trí tài xế và đơn hàng của bạn trên bản đồ thời gian thực
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">🎫</div>
              <h3 className="text-xl font-semibold mb-2">
                Mã giảm giá
              </h3>
              <p className="text-gray-600">
                Nhiều ưu đãi hấp dẫn với hệ thống khuyến mãi đa dạng
              </p>
            </div>
            <div className="text-center p-6">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">
                Thống kê chi tiết
              </h3>
              <p className="text-gray-600">
                Dashboard phân tích doanh thu và hiệu suất kinh doanh
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Dành cho mọi đối tượng
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-semibold mb-2">Khách hàng</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Đặt món dễ dàng</li>
                <li>✓ Theo dõi đơn hàng realtime</li>
                <li>✓ Áp dụng mã giảm giá</li>
                <li>✓ Đánh giá nhà hàng</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-4">🏪</div>
              <h3 className="text-xl font-semibold mb-2">Nhà hàng</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Quản lý menu</li>
                <li>✓ Nhận đơn hàng</li>
                <li>✓ Xem thống kê doanh thu</li>
                <li>✓ Tạo khuyến mãi</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-4xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold mb-2">Tài xế</h3>
              <ul className="space-y-2 text-gray-600">
                <li>✓ Nhận đơn giao hàng</li>
                <li>✓ Cập nhật vị trí realtime</li>
                <li>✓ Bật/tắt trạng thái</li>
                <li>✓ Xem lịch sử giao hàng</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}