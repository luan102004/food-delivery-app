'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { format } from 'date-fns';

export default function UserDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchUserDetail();
      fetchUserOrders();
    }
  }, [session, userId]);

  const fetchUserDetail = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`);
      const data = await response.json();
      setUser(data.user);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserOrders = async () => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/orders`);
      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const resetPassword = async () => {
    const newPassword = prompt('Nhập mật khẩu mới (tối thiểu 6 ký tự):');
    if (!newPassword || newPassword.length < 6) {
      alert('Mật khẩu không hợp lệ!');
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      if (response.ok) {
        alert('Đặt lại mật khẩu thành công!');
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const deleteUser = async () => {
    if (!confirm('Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác!')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Xóa người dùng thành công!');
        router.push('/admin/users');
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center text-red-600">Không tìm thấy người dùng</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Chi tiết người dùng</h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">
                {user.role === 'customer' && '👤'}
                {user.role === 'restaurant' && '🏪'}
                {user.role === 'driver' && '🚗'}
                {user.role === 'admin' && '👨‍💼'}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
                  user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {user.isActive ? '🟢 Hoạt động' : '🔴 Vô hiệu'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Vai trò</p>
                <p className="font-semibold text-gray-900 capitalize">{user.role}</p>
              </div>

              {user.phone && (
                <div>
                  <p className="text-sm text-gray-600">Số điện thoại</p>
                  <p className="font-semibold text-gray-900">{user.phone}</p>
                </div>
              )}

              {user.address && (
                <div>
                  <p className="text-sm text-gray-600">Địa chỉ</p>
                  <p className="font-semibold text-gray-900">{user.address}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600">Ngày tạo</p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Cập nhật cuối</p>
                <p className="font-semibold text-gray-900">
                  {format(new Date(user.updatedAt), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <button
                onClick={resetPassword}
                className="w-full bg-yellow-600 text-white py-2 rounded-md hover:bg-yellow-700"
              >
                🔑 Đặt lại mật khẩu
              </button>
              <button
                onClick={deleteUser}
                className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
              >
                🗑️ Xóa người dùng
              </button>
            </div>
          </div>
        </div>

        {/* Orders & Activity */}
        <div className="lg:col-span-2">
          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600">Tổng đơn hàng</p>
              <p className="text-2xl font-bold text-blue-600">{orders.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600">Đơn hoàn thành</p>
              <p className="text-2xl font-bold text-green-600">
                {orders.filter((o) => o.status === 'delivered').length}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4">
              <p className="text-sm text-gray-600">Đơn hủy</p>
              <p className="text-2xl font-bold text-red-600">
                {orders.filter((o) => o.status === 'cancelled').length}
              </p>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Lịch sử đơn hàng ({orders.length})
            </h3>

            {orders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Chưa có đơn hàng nào</p>
            ) : (
              <div className="space-y-4">
                {orders.slice(0, 10).map((order) => (
                  <div
                    key={order._id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">
                          #{order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm')}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'delivered'
                            ? 'bg-green-100 text-green-800'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-600">
                        {order.items.length} món
                      </p>
                      <p className="font-semibold text-gray-900">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(order.total)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}