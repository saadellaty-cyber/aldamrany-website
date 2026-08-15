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
  const [, firstSegment = ''] = pathname.split('/');

  if ((locales as readonly string[]).includes(firstSegment)) return NextResponse.next();
  if (RESERVED_PREFIXES.includes(firstSegment)) return NextResponse.next();

  const locale = negotiateLocale(request.headers.get('accept-language'));
  const target = new URL(`/${locale}${pathname === '/' ? '' : pathname}`, request.url);
  target.search = request.nextUrl.search;

  return NextResponse.redirect(target);
}
