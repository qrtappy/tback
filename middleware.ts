import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get("admin_auth");
  const { pathname } = request.nextUrl;

  // 1. /admin/dashboard 등 하위 페이지로 바로 접속하려 할 때 쿠키가 없으면 로그인창으로 쫓아냄
  if (pathname.startsWith("/admin") && pathname !== "/admin") {
    if (!authCookie || authCookie.value !== "true") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  return NextResponse.next();
}

// 어드민 관련 모든 폴더에 미들웨어 적용
export const config = {
  matcher: "/admin/:path*",
};
