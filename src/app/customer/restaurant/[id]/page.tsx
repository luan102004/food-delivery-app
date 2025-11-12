'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import GoogleMap from '@/components/maps/GoogleMap';
import { useLanguage } from '@/hooks/useLanguage';

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const restaurantId = params.id as string;

  const [restaurant, setRestaurant] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchRestaurant();
      fetchMenu();
    }
  }, [session, restaurantId]);

  const fetchRestaurant = async () => {
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}`);
      const data = await response.json();
      setRestaurant(data.restaurant);
    } catch (error) {
      console.error('Error fetching restaurant:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenu = async () => {
    try {
      const response = await fetch(`/api/menu?restaurantId=${restaurantId}`);
      const data = await response.json();
      setMenuItems(data.menuItems || []);
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const categories = ['all', ...new Set(menuItems.map((item) => item.category))];

  const filteredItems =
    selectedCategory === 'all'
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  const addToCart = (item: any) => {
    const existingItem = cart.find((i) => i.menuItemId === item._id);
    if (existingItem) {
      setCart(
        cart.map((i) =>
          i.menuItemId === item._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: 1,
          image: item.image,
        },
      ]);
    }
    setShowCart(true);
  };

  const updateQuantity = (menuItemId: string, delta: number) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.menuItemId === menuItemId);
      if (!item) return prevCart;

      const newQuantity = item.quantity + delta;
      if (newQuantity <= 0) {
        return prevCart.filter((i) => i.menuItemId !== menuItemId);
      }

      return prevCart.map((i) =>
        i.menuItemId === menuItemId ? { ...i, quantity: newQuantity } : i
      );
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart(cart.filter((i) => i.menuItemId !== menuItemId));
  };

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }
    // Save cart to localStorage for checkout page
    localStorage.setItem('cart', JSON.stringify({ restaurantId, items: cart }));
    router.push('/customer/checkout');
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

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">Không tìm thấy nhà hàng</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
          >
            ← Quay lại
          </button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Restaurant Info */}
            <div>
              <div className="flex items-start gap-4 mb-4">
                <div className="text-6xl">🏪</div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {restaurant.name}
                  </h1>
                  <p className="text-gray-600 mb-3">{restaurant.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400 text-lg">⭐</span>
                      <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                    </div>
                    <span>•</span>
                    <span>📍 {restaurant.address}</span>
                    <span>•</span>
                    <span>📞 {restaurant.phone}</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {restaurant.cuisine.map((c: string) => (
                      <span
                        key={c}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="h-64 rounded-lg overflow-hidden">
              <GoogleMap
                center={{
                  lat: restaurant.location.coordinates[1],
                  lng: restaurant.location.coordinates[0],
                }}
                zoom={15}
                markers={[
                  {
                    position: {
                      lat: restaurant.location.coordinates[1],
                      lng: restaurant.location.coordinates[0],
                    },
                    title: restaurant.name,
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Menu Section */}
          <div className="flex-1">
            {/* Category Filter */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 sticky top-4 z-10">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category === 'all' ? 'Tất cả' : category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Item Image */}
                  <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-200 relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl">
                        🍽️
                      </div>
                    )}
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold">
                          Hết hàng
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {item.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      {item.tags.map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(item.price)}
                        </p>
                        <p className="text-xs text-gray-500">
                          ⏱️ {item.preparationTime} phút
                        </p>
                      </div>

                      <button
                        onClick={() => addToCart(item)}
                        disabled={!item.isAvailable}
                        className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                          item.isAvailable
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        + Thêm
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredItems.length === 0 && (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-500">Không có món nào trong danh mục này</p>
              </div>
            )}
          </div>

          {/* Cart Sidebar - Desktop */}
          <div className="hidden lg:block w-96">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🛒 Giỏ hàng ({getTotalItems()})
              </h3>

              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-6xl mb-4">🛒</div>
                  <p>Giỏ hàng trống</p>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-4 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item.menuItemId}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{item.name}</p>
                          <p className="text-sm text-blue-600 font-medium">
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: 'VND',
                            }).format(item.price)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.menuItemId, -1)}
                            className="w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300 flex items-center justify-center"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.menuItemId, 1)}
                            className="w-8 h-8 bg-blue-600 text-white rounded-full hover:bg-blue-700 flex items-center justify-center"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.menuItemId)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tạm tính:</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(getSubtotal())}
                      </span>
                    </div>
                    <div className="flex justify-between mb-4">
                      <span className="text-gray-600">Phí giao hàng:</span>
                      <span className="font-semibold">15,000₫</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold mb-4">
                      <span>Tổng cộng:</span>
                      <span className="text-blue-600">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        }).format(getSubtotal() + 15000)}
                      </span>
                    </div>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Đặt hàng ngay →
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Cart Button */}
      {cart.length > 0 && (
        <div className="lg:hidden fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowCart(!showCart)}
            className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-blue-700"
          >
            🛒 {getTotalItems()} món
            <span className="font-bold">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
              }).format(getSubtotal())}
            </span>
          </button>
        </div>
      )}

      {/* Mobile Cart Modal */}
      {showCart && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                🛒 Giỏ hàng ({getTotalItems()})
              </h3>
              <button
                onClick={() => setShowCart(false)}
                className="text-gray-500 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-4">
              {cart.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.name}</p>
                    <p className="text-sm text-blue-600 font-medium">
                      {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      }).format(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.menuItemId, -1)}
                      className="w-8 h-8 bg-gray-200 rounded-full"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.menuItemId, 1)}
                      className="w-8 h-8 bg-blue-600 text-white rounded-full"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Tạm tính:</span>
                <span className="font-semibold">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(getSubtotal())}
                </span>
              </div>
              <div className="flex justify-between mb-4">
                <span>Phí giao hàng:</span>
                <span className="font-semibold">15,000₫</span>
              </div>
              <div className="flex justify-between text-lg font-bold mb-4">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">
                  {new Intl.NumberFormat('vi-VN', {
                    style: 'currency',
                    currency: 'VND',
                  }).format(getSubtotal() + 15000)}
                </span>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold"
              >
                Đặt hàng ngay →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}