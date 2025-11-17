'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

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
      console.error('Error:', error);
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
      console.error('Error:', error);
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
        },
      ]);
    }
    // Animation effect
    setShowCart(true);
    setTimeout(() => setShowCart(false), 2000);
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

  const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
  const getSubtotal = () => cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }
    localStorage.setItem('cart', JSON.stringify({ restaurantId, items: cart }));
    router.push('/customer/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <p className="text-red-600 text-xl font-semibold">Không tìm thấy nhà hàng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Restaurant Header - Gradient Style */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 opacity-90" />
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="text-white mb-4 flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/30 transition-all"
          >
            ← Quay lại
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-4xl">
              🏪
            </div>
            <div className="flex-1 text-white">
              <h1 className="text-3xl font-bold mb-2">{restaurant.name}</h1>
              <p className="text-white/90 mb-2">{restaurant.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded-full">
                  <span>⭐</span>
                  <span className="font-semibold">{restaurant.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>📍</span>
                  <span>{restaurant.address.split(',')[0]}</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Cuisine Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-2 mt-4 flex-wrap"
          >
            {restaurant.cuisine.map((c: string) => (
              <span
                key={c}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium"
              >
                {c}
              </span>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Category Pills - Horizontal Scroll */}
        <div className="mb-6 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-2">
            {categories.map((category, index) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap transition-all shadow-md ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105'
                    : 'bg-white text-gray-700 hover:shadow-lg'
                }`}
              >
                {category === 'all' ? '🍽️ Tất cả' : `${category}`}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Menu Grid - Beautiful Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-24">
          <AnimatePresence>
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                {/* Item Image */}
                <div className="relative h-40 bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200">
                  <div className="absolute inset-0 flex items-center justify-center text-5xl">
                    🍽️
                  </div>
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        Hết hàng
                      </span>
                    </div>
                  )}
                  {item.tags.includes('Popular') && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      🔥 HOT
                    </div>
                  )}
                </div>

                {/* Item Info */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                    {item.description}
                  </p>

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.tags.slice(0, 2).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price & Button */}
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        {new Intl.NumberFormat('vi-VN').format(item.price)}₫
                      </p>
                      <p className="text-xs text-gray-500">⏱️ {item.preparationTime}p</p>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => addToCart(item)}
                      disabled={!item.isAvailable}
                      className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all ${
                        item.isAvailable
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-xl">+</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredItems.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🍽️</div>
            <p className="text-gray-500 text-lg">Không có món nào trong danh mục này</p>
          </motion.div>
        )}
      </div>

      {/* Floating Cart Button - Mobile */}
      <AnimatePresence>
        {cart.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCart(true)}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-4 rounded-2xl shadow-2xl flex items-center justify-between px-6 font-bold"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xl">🛒</span>
                </div>
                <div className="text-left">
                  <p className="text-sm opacity-90">Giỏ hàng</p>
                  <p className="text-lg font-bold">{getTotalItems()} món</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-90">Tổng cộng</p>
                <p className="text-xl font-bold">
                  {new Intl.NumberFormat('vi-VN').format(getSubtotal())}₫
                </p>
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart Modal - Bottom Sheet Style */}
      <AnimatePresence>
        {showCart && cart.length > 0 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[80vh] overflow-hidden"
            >
              {/* Handle Bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  🛒 Giỏ hàng ({getTotalItems()})
                </h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200"
                >
                  ✕
                </button>
              </div>

              {/* Cart Items */}
              <div className="overflow-y-auto max-h-96 px-6 py-4">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <motion.div
                      key={item.menuItemId}
                      layout
                      className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{item.name}</p>
                        <p className="text-sm font-semibold text-purple-600">
                          {new Intl.NumberFormat('vi-VN').format(item.price)}₫
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.menuItemId, -1)}
                          className="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center font-bold text-purple-600"
                        >
                          -
                        </motion.button>
                        <span className="w-8 text-center font-bold text-lg">
                          {item.quantity}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(item.menuItemId, 1)}
                          className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-md flex items-center justify-center font-bold"
                        >
                          +
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t px-6 py-4 bg-gray-50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Tạm tính:</span>
                    <span className="font-semibold">
                      {new Intl.NumberFormat('vi-VN').format(getSubtotal())}₫
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Phí giao hàng:</span>
                    <span className="font-semibold">15,000₫</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>Tổng cộng:</span>
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {new Intl.NumberFormat('vi-VN').format(getSubtotal() + 15000)}₫
                    </span>
                  </div>
                </div>

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 text-white py-4 rounded-2xl font-bold text-lg shadow-xl"
                >
                  Đặt hàng ngay 🚀
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}