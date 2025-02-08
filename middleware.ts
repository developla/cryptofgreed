import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Only protect API routes that need authentication
  if (!request.nextUrl.pathname.startsWith('/api/character')) {
    return NextResponse.next();
  }

  const authToken = request.cookies.get('auth_token');
  if (!authToken?.value) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/character/:path*',
};
