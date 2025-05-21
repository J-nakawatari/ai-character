import { NextResponse } from 'next/server';
import acceptLanguage from 'accept-language';

const languages = ['ja', 'en'];
const defaultLanguage = 'ja';

acceptLanguage.languages(languages);

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};

const cookieName = 'i18next';

export function middleware(req) {
  if (
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  let lng;
  if (req.cookies.has(cookieName)) {
    lng = acceptLanguage.get(req.cookies.get(cookieName).value);
  }
  if (!lng) {
    lng = acceptLanguage.get(req.headers.get('Accept-Language'));
  }
  if (!lng) {
    lng = defaultLanguage;
  }

  const response = NextResponse.next();
  response.cookies.set(cookieName, lng);
  
  return response;
}
