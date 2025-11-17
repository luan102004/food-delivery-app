'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import PromoCodeInput from '@/components/promotion/PromoCodeInput';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cartData, setCartData] = useState<any>(null);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [formData, setFormData] = useState({
    deliveryAddress: '',
    phone: '',
    notes: '',
    paymentMethod: 'cash',
  });
  const [discount, setDiscount] = useState(0);
  const [promotionId, setPromotionId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (!savedCart) {
      router.push('/customer');
      return;
    }

    const cart = JSON.parse(savedCart);
    setCartData(cart);
    fetchRestaurant(cart.restaurantId);

    if (session) {
      fetchUserData();
    }
  }, [session]);

  const fetchRestaurant = async (restaurantId: string) => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}`);
      const data = await response.json();
      setRestaurant(data.restaurant);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      setFormData({
        ...formData,
        deliveryAddress: data.user.address || '',
        phone: data.user.phone || '',
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getSubtotal = () => {
    if (!cartData) return 0;
    return cartData.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0
    );
  };

  const deliveryFee = 15000;
  const subtotal = getSubtotal();
  const total = subtotal + deliveryFee - discount;

  const handlePromoApply = (discountAmount: number, promoId: string) => {
    setDiscount(discountAmount);
    setPromotionId(promoId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.deliveryAddress || !formData.phone) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId: cartData.restaurantId,
          items: cartData.items,
          deliveryAddress: formData.deliveryAddress,
          deliveryLocation: {
            coordinates: [106.7009, 10.7756],
          },
          paymentMethod: formData.paymentMethod,
          promotionCode: promotionId ? undefined : null,
          notes: formData.notes,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem('cart');
        alert('Đặt hàng thành công!');
        router.push(`/customer/track/${data.order.orderNumber}`);
      } else {
        alert(data.error || 'Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  if (!cartData || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600" />
        <div className="relative max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="text-white mb-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full"
          >
            ← Quay lại
          </button>
          <h1 className="text-3xl font-bold text-white">Thanh toán</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left - Form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Restaurant Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🏪</span> Nhà hàng
              </h2>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-200 to-pink-200 rounded-2xl flex items-center justify-center text-3xl">
                  🏪
                </div>
                <div>
                  <h3 className="font-bold text-lg">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600">{restaurant.address}</p>
                </div>
              </div>
            </motion.div>

            {/* Delivery Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📍</span> Thông tin giao hàng
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ giao hàng *
                  </label>
                  <input
                    type="text"
                    value={formData.deliveryAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryAddress: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="123 Nguyễn Huệ, Q1, TP.HCM"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Ghi chú cho tài xế (tùy chọn)"
                  />
                </div>
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>💳</span> Phương thức thanh toán
              </h2>
              <div className="space-y-3">
                {[
                  { value: 'cash', icon: '💵', title: 'Tiền mặt', desc: 'Thanh toán khi nhận hàng' },
                  { value: 'card', icon: '💳', title: 'Thẻ ngân hàng', desc: 'Visa, Mastercard, JCB' },
                  { value: 'wallet', icon: '👛', title: 'Ví điện tử', desc: 'MoMo, ZaloPay, VNPay' },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.paymentMethod === method.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formData.paymentMethod === method.value}
                      onChange={(e) =>
                        setFormData({ ...formData, paymentMethod: e.target.value })
                      }
                      className="mr-3"
                    />
                    <div className="text-2xl mr-3">{method.icon}</div>
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{method.title}</div>
                      <div className="text-sm text-gray-600">{method.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </motion.div>

            {/* Promo Code */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-lg p-6"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🎫</span> Mã khuyến mãi
              </h2>
              <PromoCodeInput
                orderAmount={subtotal}
                restaurantId={cartData.restaurantId}
                onApply={handlePromoApply}
              />
            </motion.div>
          </div>

          {/* Right - Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl shadow-lg p-6 sticky top-4"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span> Chi tiết đơn hàng
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartData.items.map((item: any) => (
                  <div
                    key={item.menuItemId}
                    className="flex items-center justify-between py-2 border-b border-gray-100"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        <span className="text-purple-600">{item.quantity}x</span> {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Intl.NumberFormat('vi-VN').format(item.price)}₫
                      </p>
                    </div>
                    <p className="font-bold text-gray-900">
                      {new Intl.NumberFormat('vi-VN').format(item.price * item.quantity)}₫
                    </p>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính:</span>
                  <span>{new Intl.NumberFormat('vi-VN').format(subtotal)}₫</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Phí giao hàng:</span>
                  <span>{new Intl.NumberFormat('vi-VN').format(deliveryFee)}₫</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{new Intl.NumberFormat('vi-VN').format(discount)}₫</span>
                  </div>
                )}

                <div className="border-t-2 border-gray-200 pt-2 flex justify-between text-2xl font-bold">
                  <span>Tổng cộng:</span>
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {new Intl.NumberFormat('vi-VN').format(total)}₫
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </div>
                ) : (
                  'Đặt hàng ngay 🚀'
                )}
              </motion.button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Bằng việc đặt hàng, bạn đồng ý với{' '}
                <a href="/terms" className="text-purple-600">
                  điều khoản sử dụng
                </a>
              </p>
            </motion.div>
          </div>
        </div>
      </form>
    </div>
  );
}