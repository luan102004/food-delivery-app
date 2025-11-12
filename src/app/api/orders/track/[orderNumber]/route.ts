import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import DriverLocation from '@/models/DriverLocation';

export async function GET(
  request: NextRequest,
  { params }: { params: { orderNumber: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const order = await Order.findOne({ orderNumber: params.orderNumber })
      .populate('customerId', 'name phone')
      .populate('restaurantId', 'name address phone location')
      .populate('driverId', 'name phone');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check authorization
    if (
      order.customerId._id.toString() !== session.user.id &&
      session.user.role !== 'admin'
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get driver location if assigned
    let driverLocation = null;
    if (order.driverId) {
      driverLocation = await DriverLocation.findOne({
        driverId: order.driverId._id,
      });
    }

    return NextResponse.json({
      order,
      driverLocation: driverLocation
        ? {
            coordinates: driverLocation.location.coordinates,
            updatedAt: driverLocation.updatedAt,
          }
        : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}