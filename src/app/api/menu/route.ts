import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';
import Restaurant from '@/models/Restaurant';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'restaurantId required' },
        { status: 400 }
      );
    }

    const menuItems = await MenuItem.find({
      restaurantId,
      isAvailable: true,
    }).sort({ category: 1, name: 1 });

    return NextResponse.json({ menuItems });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'restaurant') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    
    // Verify restaurant ownership
    const restaurant = await Restaurant.findOne({
      _id: body.restaurantId,
      ownerId: session.user.id,
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const menuItem = await MenuItem.create(body);

    return NextResponse.json({ menuItem }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}