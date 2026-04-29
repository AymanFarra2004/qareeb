import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

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