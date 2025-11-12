import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import DriverLocation from '@/models/DriverLocation';
import { triggerDriverLocation } from '@/lib/pusher';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'driver') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { latitude, longitude, currentOrderId } = body;

    const location = await DriverLocation.findOneAndUpdate(
      { driverId: session.user.id },
      {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        currentOrderId,
      },
      { upsert: true, new: true }
    );

    // Trigger realtime update
    await triggerDriverLocation(session.user.id, {
      coordinates: [longitude, latitude],
      updatedAt: location.updatedAt,
    });

    return NextResponse.json({ location });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const driverId = searchParams.get('driverId');

    if (driverId) {
      const location = await DriverLocation.findOne({ driverId });
      return NextResponse.json({ location });
    }

    // Get all available drivers
    const locations = await DriverLocation.find({ isAvailable: true })
      .populate('driverId', 'name phone')
      .limit(50);

    return NextResponse.json({ locations });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}