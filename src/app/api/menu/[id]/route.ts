import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import MenuItem from '@/models/MenuItem';
import Restaurant from '@/models/Restaurant';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'restaurant') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const menuItem = await MenuItem.findById(params.id);
    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    // Verify ownership
    const restaurant = await Restaurant.findOne({
      _id: menuItem.restaurantId,
      ownerId: session.user.id,
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const updatedItem = await MenuItem.findByIdAndUpdate(
      params.id,
      body,
      { new: true }
    );

    return NextResponse.json({ menuItem: updatedItem });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'restaurant') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const menuItem = await MenuItem.findById(params.id);
    if (!menuItem) {
      return NextResponse.json({ error: 'Menu item not found' }, { status: 404 });
    }

    // Verify ownership
    const restaurant = await Restaurant.findOne({
      _id: menuItem.restaurantId,
      ownerId: session.user.id,
    });

    if (!restaurant) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await MenuItem.findByIdAndDelete(params.id);

    return NextResponse.json({ message: 'Menu item deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}