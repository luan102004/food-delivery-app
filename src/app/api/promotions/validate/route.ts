import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Promotion from '@/models/Promotion';
import UserPromotion from '@/models/UserPromotion';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { code, orderAmount, restaurantId } = body;

    const promotion = await Promotion.findOne({
      code: code.toUpperCase(),
      isActive: true,
    });

    if (!promotion) {
      return NextResponse.json(
        { error: 'Invalid promotion code', valid: false },
        { status: 400 }
      );
    }

    const now = new Date();

    // Check dates
    if (promotion.startDate > now || promotion.endDate < now) {
      return NextResponse.json(
        { error: 'Promotion code expired', valid: false },
        { status: 400 }
      );
    }

    // Check usage limit
    if (promotion.usageCount >= promotion.usageLimit) {
      return NextResponse.json(
        { error: 'Promotion usage limit reached', valid: false },
        { status: 400 }
      );
    }

    // Check minimum order amount
    if (orderAmount < promotion.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount is ${promotion.minOrderAmount}`,
          valid: false,
        },
        { status: 400 }
      );
    }

    // Check if user has already used this promotion
    const userPromotion = await UserPromotion.findOne({
      userId: session.user.id,
      promotionId: promotion._id,
    });

    if (userPromotion) {
      return NextResponse.json(
        { error: 'You have already used this promotion', valid: false },
        { status: 400 }
      );
    }

    // Check restaurant restriction
    if (
      promotion.applicableRestaurants &&
      promotion.applicableRestaurants.length > 0
    ) {
      const isApplicable = promotion.applicableRestaurants.some(
        (id) => id.toString() === restaurantId
      );
      if (!isApplicable) {
        return NextResponse.json(
          { error: 'Promotion not applicable to this restaurant', valid: false },
          { status: 400 }
        );
      }
    }

    // Calculate discount
    let discount = 0;
    if (promotion.type === 'percentage') {
      discount = (orderAmount * promotion.value) / 100;
      if (promotion.maxDiscount) {
        discount = Math.min(discount, promotion.maxDiscount);
      }
    } else if (promotion.type === 'fixed') {
      discount = promotion.value;
    } else if (promotion.type === 'free_delivery') {
      discount = 15000; // Delivery fee
    }

    return NextResponse.json({
      valid: true,
      promotion: {
        id: promotion._id,
        code: promotion.code,
        description: promotion.description,
        type: promotion.type,
        value: promotion.value,
        discount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}