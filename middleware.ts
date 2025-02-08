import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only run on /api/character routes
  if (!request.nextUrl.pathname.startsWith('/api/character')) {
    return NextResponse.next();
  }

  const walletAddress = request.headers.get('x-wallet-address');
  if (!walletAddress) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Clone the headers to modify them
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-wallet-address', walletAddress);

  // Return response with modified headers
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: '/api/character/:path*',
};
