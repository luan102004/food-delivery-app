'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function CustomerPromotionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchPromotions();
    }
  }, [session]);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/promotions');
      const data = await response.json();
      setPromotions(data.promotions || []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`Đã copy mã: ${code}`);
  };

  const getTypeLabel = (type: string) => {
    const labels: any = {
      percentage: 'Giảm phần trăm',
      fixed: 'Giảm cố định',
      free_delivery: 'Miễn phí ship',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: any = {
      percentage: 'bg-blue-100 text-blue-800',
      fixed: 'bg-green-100 text-green-800',
      free_delivery: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  const activePromotions = promotions.filter(
    (p) =>
      p.isActive &&
      new Date(p.endDate) > new Date() &&
      p.usageCount < p.usageLimit
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎫</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Khuyến mãi dành cho bạn
          </h1>
          <p className="text-gray-600 text-lg">
            {activePromotions.length} mã giảm giá đang có sẵn
          </p>
        </div>

        {activePromotions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Chưa có khuyến mãi
            </h3>
            <p className="text-gray-500">
              Hãy quay lại sau để nhận ưu đãi hấp dẫn!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activePromotions.map((promo) => (
              <div
                key={promo._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                {/* Promo Header */}
                <div
                  className={`p-6 ${
                    promo.type === 'percentage'
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                      : promo.type === 'fixed'
                      ? 'bg-gradient-to-br from-green-400 to-green-600'
                      : 'bg-gradient-to-br from-purple-400 to-purple-600'
                  } text-white`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold bg-white bg-opacity-30`}
                    >
                      {getTypeLabel(promo.type)}
                    </span>
                    <span className="text-4xl">
                      {promo.type === 'percentage' && '💯'}
                      {promo.type === 'fixed' && '💰'}
                      {promo.type === 'free_delivery' && '🚚'}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold mb-2">
                    {promo.type === 'percentage' && `Giảm ${promo.value}%`}
                    {promo.type === 'fixed' &&
                      `Giảm ${new Intl.NumberFormat('vi-VN').format(
                        promo.value
                      )}đ`}
                    {promo.type === 'free_delivery' && 'Freeship'}
                  </h3>

                  <p className="text-sm opacity-90">{promo.description}</p>
                </div>

                {/* Promo Body */}
                <div className="p-6">
                  {/* Code */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-600 mb-2 uppercase font-semibold">
                      Mã khuyến mãi
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-3">
                        <p className="text-center font-mono font-bold text-xl text-blue-600">
                          {promo.code}
                        </p>
                      </div>
                      <button
                        onClick={() => copyCode(promo.code)}
                        className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 font-semibold"
                      >
                        📋 Copy
                      </button>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div className="space-y-2 mb-4">
                    {promo.minOrderAmount > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>📦</span>
                        <span>
                          Đơn tối thiểu:{' '}
                          <span className="font-semibold">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(promo.minOrderAmount)}
                          </span>
                        </span>
                      </div>
                    )}

                    {promo.maxDiscount && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>💰</span>
                        <span>
                          Giảm tối đa:{' '}
                          <span className="font-semibold">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(promo.maxDiscount)}
                          </span>
                        </span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>📅</span>
                      <span>
                        HSD: {format(new Date(promo.endDate), 'dd/MM/yyyy')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>🎫</span>
                      <span>
                        Còn lại: {promo.usageLimit - promo.usageCount}/
                        {promo.usageLimit}
                      </span>
                    </div>
                  </div>

                  {/* Usage Progress */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            (promo.usageCount / promo.usageLimit) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Use Button */}
                  <button
                    onClick={() => router.push('/customer')}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Đặt món ngay →
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* How to Use */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            💡 Cách sử dụng mã khuyến mãi
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">1️⃣</div>
              <h3 className="font-semibold mb-2">Chọn nhà hàng</h3>
              <p className="text-sm text-gray-600">
                Tìm và chọn nhà hàng yêu thích
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">2️⃣</div>
              <h3 className="font-semibold mb-2">Thêm món</h3>
              <p className="text-sm text-gray-600">
                Thêm món ăn vào giỏ hàng
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">3️⃣</div>
              <h3 className="font-semibold mb-2">Nhập mã</h3>
              <p className="text-sm text-gray-600">
                Nhập mã khuyến mãi khi thanh toán
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-3">4️⃣</div>
              <h3 className="font-semibold mb-2">Hoàn tất</h3>
              <p className="text-sm text-gray-600">
                Đặt hàng và nhận ưu đãi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}