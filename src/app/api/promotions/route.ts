import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Promotion from '@/models/Promotion';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const promotions = await Promotion.find({
      isActive: true,
      endDate: { $gte: new Date() },
    }).sort({ createdAt: -1 });

    return NextResponse.json({ promotions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}