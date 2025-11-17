'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface RestaurantOwner {
  _id: string;
  name: string;
  email: string;
}

interface Restaurant {
  _id: string;
  name: string;
  address: string;
  cuisine: string[];
}

export default function AssignRestaurantPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [restaurantOwners, setRestaurantOwners] = useState<RestaurantOwner[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedOwner, setSelectedOwner] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: 10.7756,
    longitude: 106.7009,
    phone: '',
    email: '',
    cuisine: '',
  });

  // Check auth
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    else if (session?.user.role !== 'admin') router.push('/');
  }, [status, session, router]);

  // Load owners + restaurants
  useEffect(() => {
    if (session?.user.role === 'admin') {
      fetchRestaurantOwners();
      fetchRestaurants();
    }
  }, [session]);

  const fetchRestaurantOwners = async () => {
    try {
      const response = await fetch('/api/admin/users?role=restaurant');
      const data = await response.json();
      setRestaurantOwners(data.users || []);
    } catch (error) {
      console.error('Error fetching owners:', error);
    }
  };

  const fetchRestaurants = async () => {
    try {
      const response = await fetch('/api/restaurants');
      const data = await response.json();
      setRestaurants(data.restaurants || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOwner) {
      alert('Vui lòng chọn chủ nhà hàng!');
      return;
    }

    try {
      const response = await fetch('/api/admin/restaurants/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ownerId: selectedOwner,
          cuisine: formData.cuisine.split(',').map((c) => c.trim()),
          location: {
            type: 'Point',
            coordinates: [formData.longitude, formData.latitude],
          },
        }),
      });

      if (response.ok) {
        alert('Tạo nhà hàng thành công!');
        router.push('/admin/restaurants');
      } else {
        alert('Có lỗi xảy ra!');
      }
    } catch (error) {
      console.error('Error creating restaurant:', error);
      alert('Có lỗi xảy ra!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Gán nhà hàng cho chủ sở hữu
      </h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        
        {/* Select Owner */}
        <div>
          <label htmlFor="owner" className="block text-sm font-medium text-gray-700 mb-2">
            Chủ nhà hàng *
          </label>
          <select
            id="owner"
            value={selectedOwner}
            onChange={(e) => setSelectedOwner(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Chọn chủ nhà hàng --</option>
            {restaurantOwners.map((owner) => (
              <option key={owner._id} value={owner._id}>
                {owner.name} ({owner.email})
              </option>
            ))}
          </select>
        </div>

        {/* Restaurant Details */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Tên nhà hàng *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
              Số điện thoại *
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả *
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
            Địa chỉ *
          </label>
          <input
            id="address"
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Latitude + Longitude */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="lat" className="block text-sm font-medium text-gray-700 mb-2">
              Vĩ độ (Latitude)
            </label>
            <input
              id="lat"
              type="number"
              step="0.000001"
              value={formData.latitude}
              onChange={(e) =>
                setFormData({ ...formData, latitude: parseFloat(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="lng" className="block text-sm font-medium text-gray-700 mb-2">
              Kinh độ (Longitude)
            </label>
            <input
              id="lng"
              type="number"
              step="0.000001"
              value={formData.longitude}
              onChange={(e) =>
                setFormData({ ...formData, longitude: parseFloat(e.target.value) })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        {/* Email + Cuisine */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="cuisine" className="block text-sm font-medium text-gray-700 mb-2">
              Loại ẩm thực (phân cách bằng dấu phẩy)
            </label>
            <input
              id="cuisine"
              type="text"
              value={formData.cuisine}
              onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
              placeholder="Vietnamese, Fast Food, Pizza"
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 font-semibold"
          >
            Tạo nhà hàng
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Hủy
          </button>
        </div>
      </form>

      {/* List Restaurants */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Nhà hàng đã tạo ({restaurants.length})
        </h2>

        <div className="space-y-3">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant._id}
              className="flex justify-between items-center p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                <p className="text-sm text-gray-600">{restaurant.address}</p>
              </div>
              <span className="text-sm text-gray-500">
                {restaurant.cuisine.join(', ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
