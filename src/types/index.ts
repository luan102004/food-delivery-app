export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'driver' | 'restaurant' | 'admin';
  phone?: string;
  address?: string;
  avatar?: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  description: string;
  address: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  phone: string;
  email: string;
  image: string;
  cuisine: string[];
  rating: number;
  isActive: boolean;
}

export interface MenuItem {
  _id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  isAvailable: boolean;
  preparationTime: number;
  tags: string[];
}

export interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  customerId: any;
  restaurantId: any;
  driverId?: any;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: string;
  deliveryAddress: string;
  deliveryLocation: {
    type: string;
    coordinates: [number, number];
  };
  paymentMethod: string;
  paymentStatus: string;
  notes?: string;
  estimatedDeliveryTime?: string;
  actualDeliveryTime?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Promotion {
  _id: string;
  code: string;
  description: string;
  type: 'percentage' | 'fixed' | 'free_delivery';
  value: number;
  minOrderAmount: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
}

export interface DriverLocation {
  driverId: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  isAvailable: boolean;
  currentOrderId?: string;
  updatedAt: string;
}

export interface AnalyticsSummary {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

export interface RevenueChartData {
  date: string;
  revenue: number;
}

export interface TopItem {
  name: string;
  quantity: number;
  revenue: number;
}