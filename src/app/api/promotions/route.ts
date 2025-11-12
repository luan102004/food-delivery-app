// src/app/api/promotions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Promotion from '@/models/Promotion';

// GET - Lấy danh sách promotions có hiệu lực
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get('restaurantId');
    const activeOnly = searchParams.get('activeOnly') !== 'false';

    const now = new Date();
    const query: any = {};

    if (activeOnly) {
      query.isActive = true;
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
      query.$expr = { $lt: ['$usageCount', '$usageLimit'] };
    }

    if (restaurantId) {
      query.$or = [
        { applicableRestaurants: { $size: 0 } },
        { applicableRestaurants: restaurantId },
      ];
    }

    const promotions = await Promotion.find(query)
      .select('code description type value minOrderAmount maxDiscount startDate endDate')
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({ promotions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Tạo promotion mới (Restaurant/Admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['restaurant', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const {
      code,
      description,
      type,
      value,
      minOrderAmount,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      applicableRestaurants,
    } = body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingPromotion = await Promotion.findOne({ code: code.toUpperCase() });
    if (existingPromotion) {
      return NextResponse.json(
        { error: 'Promotion code already exists' },
        { status: 400 }
      );
    }

    const promotion = await Promotion.create({
      code: code.toUpperCase(),
      description,
      type,
      value,
      minOrderAmount: minOrderAmount || 0,
      maxDiscount,
      startDate: start,
      endDate: end,
      usageLimit,
      usageCount: 0,
      isActive: true,
      applicableRestaurants: applicableRestaurants || [],
    });

    return NextResponse.json({ promotion }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH - Cập nhật promotion
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['restaurant', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { id, ...updates } = body;

    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    return NextResponse.json({ promotion });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Xóa/vô hiệu hóa promotion
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !['restaurant', 'admin'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    // Soft delete - chỉ set isActive = false
    const promotion = await Promotion.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!promotion) {
      return NextResponse.json({ error: 'Promotion not found' }, { status: 404 });
    }

    return NextResponse.json({ promotion });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}