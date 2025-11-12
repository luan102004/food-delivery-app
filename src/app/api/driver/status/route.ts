import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import DriverLocation from '@/models/DriverLocation';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'driver') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { isAvailable } = body;

    const location = await DriverLocation.findOneAndUpdate(
      { driverId: session.user.id },
      { isAvailable },
      { new: true }
    );

    return NextResponse.json({ location });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}