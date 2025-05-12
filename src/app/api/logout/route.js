// app/api/logout/route.js
import { NextResponse } from 'next/server';

export async function GET() {
  const response = NextResponse.json({ message: 'Logged out' });

  // ✅ 정확한 쿠키 삭제 (path 옵션 중요)
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    path: '/',
    maxAge: 0,
  });

  return response;
}
