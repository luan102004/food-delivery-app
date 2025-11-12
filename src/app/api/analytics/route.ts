import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Restaurant from '@/models/Restaurant';
import { startOfDay, endOfDay, subDays, startOfWeek, startOfMonth } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'restaurant' && session.user.role !== 'admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'week'; // day, week, month, quarter, year

    let restaurantId = null;
    if (session.user.role === 'restaurant') {
      const restaurant = await Restaurant.findOne({ ownerId: session.user.id });
      if (!restaurant) {
        return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
      }
      restaurantId = restaurant._id;
    }

    // Calculate date range
    let startDate: Date;
    const endDate = new Date();

    switch (timeframe) {
      case 'day':
        startDate = startOfDay(new Date());
        break;
      case 'week':
        startDate = startOfWeek(new Date());
        break;
      case 'month':
        startDate = startOfMonth(new Date());
        break;
      case 'quarter':
        startDate = subDays(new Date(), 90);
        break;
      case 'year':
        startDate = subDays(new Date(), 365);
        break;
      default:
        startDate = startOfWeek(new Date());
    }

    const query: any = {
      createdAt: { $gte: startDate, $lte: endDate },
      status: { $ne: 'cancelled' },
    };

    if (restaurantId) {
      query.restaurantId = restaurantId;
    }

    // Get orders
    const orders = await Order.find(query);

    // Calculate metrics
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by status
    const ordersByStatus = orders.reduce((acc: any, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Top selling items
    const itemsSold: any = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.name;
        if (!itemsSold[key]) {
          itemsSold[key] = { name: key, quantity: 0, revenue: 0 };
        }
        itemsSold[key].quantity += item.quantity;
        itemsSold[key].revenue += item.price * item.quantity;
      });
    });

    const topItems = Object.values(itemsSold)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 10);

    // Revenue by day
    const revenueByDay: any = {};
    orders.forEach((order) => {
      const day = startOfDay(order.createdAt).toISOString().split('T')[0];
      revenueByDay[day] = (revenueByDay[day] || 0) + order.total;
    });

    const revenueChart = Object.entries(revenueByDay)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Calculate growth (compare with previous period)
    const periodLength = endDate.getTime() - startDate.getTime();
    const previousStartDate = new Date(startDate.getTime() - periodLength);
    const previousEndDate = startDate;

    const previousQuery = {
      ...query,
      createdAt: { $gte: previousStartDate, $lt: previousEndDate },
    };

    const previousOrders = await Order.find(previousQuery);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0);
    
    const revenueGrowth =
      previousRevenue > 0
        ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

    const ordersGrowth =
      previousOrders.length > 0
        ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100
        : 0;

    return NextResponse.json({
      summary: {
        totalOrders,
        totalRevenue,
        averageOrderValue,
        revenueGrowth,
        ordersGrowth,
      },
      ordersByStatus,
      topItems,
      revenueChart,
      timeframe,
      dateRange: {
        start: startDate,
        end: endDate,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}