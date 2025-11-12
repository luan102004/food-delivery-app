import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Restaurant from '@/models/Restaurant';
import MenuItem from '@/models/MenuItem';
import { triggerOrderUpdate } from '@/lib/pusher';

// GET - Lấy danh sách orders
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const role = session.user.role;

    let query: any = {};

    if (role === 'customer') {
      query.customerId = session.user.id;
    } else if (role === 'driver') {
      query.driverId = session.user.id;
    } else if (role === 'restaurant') {
      const restaurant = await Restaurant.findOne({ ownerId: session.user.id });
      if (restaurant) {
        query.restaurantId = restaurant._id;
      }
    }

    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('customerId', 'name phone')
      .populate('restaurantId', 'name address phone')
      .populate('driverId', 'name phone')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Tạo order mới
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'customer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      restaurantId,
      items,
      deliveryAddress,
      deliveryLocation,
      paymentMethod,
      promotionCode,
      notes,
    } = body;

    // Validate items and calculate subtotal
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const menuItem = await MenuItem.findById(item.menuItemId);
      if (!menuItem) {
        return NextResponse.json(
          { error: `Menu item ${item.menuItemId} not found` },
          { status: 404 }
        );
      }

      orderItems.push({
        menuItemId: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
      });

      subtotal += menuItem.price * item.quantity;
    }

    // Calculate delivery fee (simple calculation based on distance)
    const deliveryFee = 15000; // 15k VND fixed for now

    let discount = 0;
    let promotionId = null;

    // Apply promotion if provided
    if (promotionCode) {
      const Promotion = (await import('@/models/Promotion')).default;
      const promotion = await Promotion.findOne({
        code: promotionCode.toUpperCase(),
        isActive: true,
      });

      if (promotion) {
        const now = new Date();
        if (
          promotion.startDate <= now &&
          promotion.endDate >= now &&
          promotion.usageCount < promotion.usageLimit &&
          subtotal >= promotion.minOrderAmount
        ) {
          if (promotion.type === 'percentage') {
            discount = (subtotal * promotion.value) / 100;
            if (promotion.maxDiscount) {
              discount = Math.min(discount, promotion.maxDiscount);
            }
          } else if (promotion.type === 'fixed') {
            discount = promotion.value;
          } else if (promotion.type === 'free_delivery') {
            discount = deliveryFee;
          }
          promotionId = promotion._id;
        }
      }
    }

    const total = subtotal + deliveryFee - discount;

    // Generate order number
    const orderNumber = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const order = await Order.create({
      orderNumber,
      customerId: session.user.id,
      restaurantId,
      items: orderItems,
      subtotal,
      deliveryFee,
      discount,
      total,
      promotionId,
      deliveryAddress,
      deliveryLocation: {
        type: 'Point',
        coordinates: deliveryLocation.coordinates,
      },
      paymentMethod,
      notes,
      status: 'pending',
      paymentStatus: 'pending',
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes
    });

    // Update promotion usage if applied
    if (promotionId) {
      const Promotion = (await import('@/models/Promotion')).default;
      await Promotion.findByIdAndUpdate(promotionId, {
        $inc: { usageCount: 1 },
      });

      const UserPromotion = (await import('@/models/UserPromotion')).default;
      await UserPromotion.create({
        userId: session.user.id,
        promotionId,
        orderId: order._id,
      });
    }

    // Trigger realtime update
    await triggerOrderUpdate(orderNumber, {
      status: 'pending',
      order: order,
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Update order status
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { orderNumber, status, driverId } = body;

    const order = await Order.findOne({ orderNumber });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Authorization check based on role
    const role = session.user.role;
    if (role === 'restaurant') {
      const restaurant = await Restaurant.findOne({ ownerId: session.user.id });
      if (!restaurant || order.restaurantId.toString() !== restaurant._id.toString()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    } else if (role === 'driver') {
      if (order.driverId?.toString() !== session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    // Update order
    order.status = status;
    if (driverId) {
      order.driverId = driverId;
    }
    if (status === 'delivered') {
      order.actualDeliveryTime = new Date();
      order.paymentStatus = 'paid';
    }

    await order.save();

    // Trigger realtime update
    await triggerOrderUpdate(orderNumber, {
      status,
      order,
    });

    return NextResponse.json({ order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}