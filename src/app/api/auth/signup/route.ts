import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { name, email, password, phone, role, address } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['customer', 'restaurant', 'driver'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Vai trò không hợp lệ' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email đã được sử dụng' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      phone: phone?.trim() || '',
      role: role || 'customer',
      address: address?.trim() || '',
      isActive: true,
    });

    // Create welcome notification
    const Notification = (await import('@/models/Notification')).default;
    await Notification.create({
      userId: user._id,
      title: 'Chào mừng bạn đến với FoodDelivery! 🎉',
      message: `Xin chào ${user.name}! Cảm ơn bạn đã đăng ký tài khoản. Hãy bắt đầu khám phá các nhà hàng và đặt món yêu thích của bạn!`,
      type: 'system',
    });

    // If restaurant owner, create notification for admin
    if (role === 'restaurant') {
      const adminUsers = await User.find({ role: 'admin' });
      for (const admin of adminUsers) {
        await Notification.create({
          userId: admin._id,
          title: 'Chủ nhà hàng mới đăng ký',
          message: `${user.name} (${user.email}) đã đăng ký với vai trò chủ nhà hàng`,
          type: 'system',
          relatedId: user._id,
          relatedModel: 'User',
        });
      }
    }

    // If driver, create notification for admin
    if (role === 'driver') {
      const adminUsers = await User.find({ role: 'admin' });
      for (const admin of adminUsers) {
        await Notification.create({
          userId: admin._id,
          title: 'Tài xế mới đăng ký',
          message: `${user.name} (${user.email}) đã đăng ký với vai trò tài xế`,
          type: 'system',
          relatedId: user._id,
          relatedModel: 'User',
        });
      }
    }

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
    };

    return NextResponse.json(
      {
        message: 'Đăng ký thành công!',
        user: userResponse,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Sign up error:', error);
    return NextResponse.json(
      { error: 'Đã có lỗi xảy ra. Vui lòng thử lại!' },
      { status: 500 }
    );
  }
}