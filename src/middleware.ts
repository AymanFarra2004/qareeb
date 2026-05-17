import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';
import { CONFIG } from '@/src/config';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Authenticate protected routes
  const isProtectedAdmin = /^\/(en|ar)\/admin(\/|$)/.test(pathname) || pathname.startsWith('/admin');
  const isProtectedDashboard = /^\/(en|ar)\/dashboard(\/|$)/.test(pathname) || pathname.startsWith('/dashboard');

  if (isProtectedAdmin || isProtectedDashboard) {
    const token = request.cookies.get('token')?.value;
    const localeMatch = pathname.match(/^\/(en|ar)/);
    const locale = localeMatch ? localeMatch[1] : 'ar';

    if (!token) {
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    try {
      const res = await fetch(`${CONFIG.API_URL}/api/v1/profile?lang=${locale}`, {
        method: "GET",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
      });

      const body = await res.json();
      const userRole = body?.data?.role || body?.role;

      if (!res.ok || !userRole) {
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      }

      if (isProtectedAdmin && userRole !== 'admin') {
        return NextResponse.redirect(new URL(`/${locale}/`, request.url)); // unauthorized -> redirect home
      }

      if (isProtectedDashboard && !['admin', 'hub_owner'].includes(userRole)) {
        return NextResponse.redirect(new URL(`/${locale}/`, request.url)); // unauthorized -> redirect home
      }

    } catch (error) {
      console.error("Middleware Auth Error:", error);
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // 2. Existing locale routing logic
  if (pathname.startsWith('/ar')) {
    return intlMiddleware(request);
  }

  let targetPath = pathname;

  if (pathname.startsWith('/en')) {
    targetPath = pathname.replace(/^\/en/, '/ar');
  } else if (pathname === '/') {
    targetPath = '/ar';
  } else {
    targetPath = `/ar${pathname}`;
  }

  const newUrl = new URL(`${targetPath}${search}`, request.url);

  return NextResponse.redirect(newUrl);
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};