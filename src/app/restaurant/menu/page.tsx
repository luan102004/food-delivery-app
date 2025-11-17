'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function RestaurantMenuPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [restaurant, setRestaurant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    preparationTime: 20,
    tags: '',
    isAvailable: true,
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.user.role !== 'restaurant') {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user.role === 'restaurant') {
      fetchRestaurant();
    }
  }, [session]);

  const fetchRestaurant = async () => {
    try {
      const response = await fetch('/api/restaurant/my-restaurant');
      const data = await response.json();
      if (data.restaurant) {
        setRestaurant(data.restaurant);
        fetchMenuItems(data.restaurant._id);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchMenuItems = async (restaurantId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/menu?restaurantId=${restaurantId}`);
      const data = await response.json();
      setMenuItems(data.menuItems || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      restaurantId: restaurant._id,
      tags: formData.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      const url = editingItem ? `/api/menu/${editingItem._id}` : '/api/menu';
      const method = editingItem ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(editingItem ? 'Cập nhật thành công!' : 'Thêm món thành công!');
        setShowForm(false);
        setEditingItem(null);
        resetForm();
        fetchMenuItems(restaurant._id);
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      category: '',
      preparationTime: 20,
      tags: '',
      isAvailable: true,
    });
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price,
      category: item.category,
      preparationTime: item.preparationTime,
      tags: item.tags.join(', '),
      isAvailable: item.isAvailable,
    });
    setShowForm(true);
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Bạn có chắc muốn xóa món này?')) return;

    try {
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Xóa thành công!');
        fetchMenuItems(restaurant._id);
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  const toggleAvailability = async (itemId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/menu/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !currentStatus }),
      });

      if (response.ok) {
        fetchMenuItems(restaurant._id);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const categories = [...new Set(menuItems.map((item) => item.category))];

  if (loading) {
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

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
          <div className="text-6xl mb-4">🏪</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có nhà hàng</h3>
          <p className="text-gray-600">Vui lòng liên hệ admin để được tạo nhà hàng</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600" />
        <div className="relative max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Quản lý thực đơn</h1>
              <p className="text-white/90">{restaurant.name}</p>
              <p className="text-white/80 text-sm">{menuItems.length} món • {categories.length} danh mục</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setEditingItem(null);
                resetForm();
                setShowForm(!showForm);
              }}
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
            >
              {showForm ? '✕ Đóng' : '+ Thêm món'}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-4 pb-8">
        {/* Add/Edit Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span>{editingItem ? '✏️' : '➕'}</span>
                  {editingItem ? 'Chỉnh sửa món' : 'Thêm món mới'}
                </h2>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tên món *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Phở bò tái"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Danh mục *
                    </label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      list="categories"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Phở, Bún, Pizza..."
                    />
                    <datalist id="categories">
                      {categories.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Mô tả *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Mô tả chi tiết về món ăn"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Giá (VND) *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: parseFloat(e.target.value) })
                      }
                      required
                      min="0"
                      step="1000"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="50000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Thời gian (phút)
                    </label>
                    <input
                      type="number"
                      value={formData.preparationTime}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          preparationTime: parseInt(e.target.value),
                        })
                      }
                      min="5"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Trạng thái
                    </label>
                    <select
                      value={formData.isAvailable ? 'available' : 'unavailable'}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isAvailable: e.target.value === 'available',
                        })
                      }
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    >
                      <option value="available">✅ Còn hàng</option>
                      <option value="unavailable">❌ Hết hàng</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Tags (phân cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Popular, Spicy, Vegetarian"
                  />
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                  >
                    {editingItem ? '💾 Cập nhật' : '➕ Thêm món'}
                  </motion.button>
                  {editingItem && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => {
                        setEditingItem(null);
                        setShowForm(false);
                        resetForm();
                      }}
                      className="px-6 py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-bold transition-all"
                    >
                      Hủy
                    </motion.button>
                  )}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu Items by Category */}
        {categories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
          >
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chưa có món ăn</h3>
            <p className="text-gray-500 mb-6">Hãy thêm món đầu tiên cho thực đơn của bạn!</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg"
            >
              ➕ Thêm món ngay
            </motion.button>
          </motion.div>
        ) : (
          categories.map((category, catIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: catIndex * 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                  📂
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
                  <p className="text-sm text-gray-500">
                    {menuItems.filter((item) => item.category === category).length} món
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {menuItems
                  .filter((item) => item.category === category)
                  .map((item, index) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all"
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
                          <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                            🔥 HOT
                          </div>
                        )}
                      </div>

                      {/* Item Info */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-1">
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                          {item.description}
                        </p>

                        {/* Tags */}
                        {item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
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

                        {/* Price */}
                        <div className="mb-3">
                          <p className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            {new Intl.NumberFormat('vi-VN').format(item.price)}₫
                          </p>
                          <p className="text-xs text-gray-500">⏱️ {item.preparationTime} phút</p>
                        </div>

                        {/* Availability Toggle */}
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleAvailability(item._id, item.isAvailable)}
                          className={`w-full px-3 py-2 rounded-lg text-xs font-bold mb-2 transition-all ${
                            item.isAvailable
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.isAvailable ? '✅ Còn hàng' : '❌ Hết hàng'}
                        </motion.button>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleEdit(item)}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-bold"
                          >
                            ✏️ Sửa
                          </motion.button>
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(item._id)}
                            className="px-3 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm font-bold"
                          >
                            🗑️
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}