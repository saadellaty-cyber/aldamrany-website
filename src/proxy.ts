import { NextResponse, type NextRequest } from 'next/server';
import { locales, negotiateLocale } from '@/i18n/config';

/**
 * Locale routing.
 *
 * The public site lives under /ar and /en. Anything that arrives without a
 * locale prefix (`/`, `/about`, a mistyped path) is redirected into the
 * visitor's preferred language, which also means unknown paths reach the
 * localised 404 page rather than a bare framework error.
 */
const RESERVED_PREFIXES = ['admin', 'api', '_next', '_vercel'];

export const config = {
  // Never intercept framework internals, API routes, or anything with a file
  // extension — routing those through here breaks dev HMR and asset requests.
  matcher: ['/((?!api|admin|_next|_vercel|.*\\..*).*)'],
};

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const [, firstSegment = '', secondSegment = ''] = pathname.split('/');

  if ((locales as readonly string[]).includes(firstSegment)) {
    // The dashboard sits outside the locale tree, but someone already reading
    // /ar/… who types "admin" after it lands on /ar/admin. That is the obvious
    // guess and it used to 404, so it is sent to the real address instead.
    if (RESERVED_PREFIXES.includes(secondSegment)) {
      const target = new URL(pathname.slice(firstSegment.length + 1), request.url);
      target.search = request.nextUrl.search;
      return NextResponse.redirect(target);
    }

    return NextResponse.next();
  }

  if (RESERVED_PREFIXES.includes(firstSegment)) return NextResponse.next();

  const locale = negotiateLocale(request.headers.get('accept-language'));
  const target = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url);
  target.search = request.nextUrl.search;

  return NextResponse.redirect(target);
}
