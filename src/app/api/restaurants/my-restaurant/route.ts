import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Restaurant from '@/models/Restaurant';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'restaurant') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const restaurant = await Restaurant.findOne({ ownerId: session.user.id });

    return NextResponse.json({ restaurant });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}