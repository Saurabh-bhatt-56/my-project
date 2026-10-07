import connectDB from '@/lib/connectDB';
import { userModel } from '@/lib/models/userSchema';
import { hashPassword } from '@/lib/utils/passwordEncDcr';
import { NextResponse } from 'next/server';

export async function POST(req) {
  await connectDB();

  const body = await req.json();
  const { name, email, password, phoneNumber } = body || {};

  if (!name || !email || !password || !phoneNumber) {
    return NextResponse.json({ message: 'username, email and password are required' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json({ message: 'Invalid email format' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ success: false, message: 'Password must be at least 6 characters' }, { status: 400 });
  }


  const user = await userModel.findOne({ email: normalizedEmail });
  if (user) {
    return NextResponse.json({ success: false, message: 'Email already in use' }, { status: 400 });
  }

  const hashed = hashPassword(password);

  try {
    const initialAvatar = name ? name.trim().charAt(0).toUpperCase() : "U";

    const newUser = await userModel.create({
      name,
      email: normalizedEmail,
      password: hashed,
      phoneNumber,
      avatar: initialAvatar
    });

    if (newUser) {
      return NextResponse.json({ success: true, message: 'User registered successfully' }, { status: 201 });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, message: 'Failed to register user' }, { status: 500 });
  }
  return NextResponse.json({ success: false, message: 'Failed to register user' }, { status: 500 });
}