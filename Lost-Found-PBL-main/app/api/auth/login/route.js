import connectDB from '@/lib/connectDB';
import { generateToken } from '@/lib/jwt';
import { userModel } from '@/lib/models/userSchema';
import { verifyPassword } from '@/lib/utils/passwordEncDcr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password, rememberMe } = body || {};

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'email and password are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ success: false, message: 'Invalid email format' }, { status: 400 });
    }

    const user = await userModel.findOne({ email: normalizedEmail });

    if (!user || !verifyPassword(password, user.password)) {
      return NextResponse.json({ success: false, message: 'Invalid email or password' }, { status: 401 });
    }

    const token = generateToken(user);
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: rememberMe ? 60 * 60 * 24 * 7 : 60 * 60 * 24
    })

    return NextResponse.json({ success: true, message: 'Login successful' }, { status: 200 });
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json({ success: false, message: 'Login unSuccessful', error: error.message }, { status: 500 });
  }
}