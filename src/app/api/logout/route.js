import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request) {
  // 비동기 쿠키 삭제
  const cookieStore = await cookies(); // cookies()는 비동기
  cookieStore.delete('auth_token', { path: '/' }); // 'auth_token' 쿠키 삭제

  // Referer 헤더에서 이전 페이지 URL 가져오기
  const refererUrl = request.headers.get('Referer') || '/';  // Referer가 없으면 '/'로 기본 설정

  // 리다이렉트 응답 반환
  return NextResponse.redirect(refererUrl);
}
