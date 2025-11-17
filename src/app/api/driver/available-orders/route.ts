import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'driver') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get orders that are ready for pickup and don't have a driver assigned
    const orders = await Order.find({
      status: 'ready',
      driverId: { $exists: false },
    })
      .populate('customerId', 'name phone')
      .populate('restaurantId', 'name address phone location')
      .sort({ createdAt: 1 })
      .limit(20);

    return NextResponse.json({ orders });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}