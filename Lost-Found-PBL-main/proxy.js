import { NextResponse } from "next/server";
import { jwtVerify } from 'jose';

export async function proxy(req) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  let isVerified = false;

  try {
    if (token) {
      await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
      isVerified = true;
    }
  } catch (error) {
    isVerified = false;
  }

  const isAuthPage = pathname.startsWith('/auth/login') || pathname.startsWith('/auth/register');

  if (isAuthPage) {
    if (isVerified) {
      return NextResponse.redirect(new URL('/', req.url));
    }
    return NextResponse.next();
  }

  if (!isVerified) {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/report/lost-item/:path*',
    '/report/found-item/:path*',
    '/profile/:path*',
    '/api/user/:path*',
    '/api/messages/:path*',
    '/auth/login',
    '/auth/register',
  ]
};
