import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Restaurant from '@/models/Restaurant';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { ownerId, ...restaurantData } = body;

    // Verify owner exists and has restaurant role
    const owner = await User.findById(ownerId);
    if (!owner || owner.role !== 'restaurant') {
      return NextResponse.json(
        { error: 'Invalid restaurant owner' },
        { status: 400 }
      );
    }

    const restaurant = await Restaurant.create({
      ...restaurantData,
      ownerId,
      isActive: true,
      rating: 0,
    });

    // Create notification for owner
    const Notification = (await import('@/models/Notification')).default;
    await Notification.create({
      userId: ownerId,
      title: 'Nhà hàng mới được tạo',
      message: `Nhà hàng "${restaurant.name}" đã được tạo cho bạn`,
      type: 'system',
      relatedId: restaurant._id,
      relatedModel: 'Restaurant',
    });

    return NextResponse.json({ restaurant }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}