import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// In a real app, you would get the user's role from a session or token.
const MOCK_USER_ROLE = 'USER'; // Change to 'ADMIN' to test admin access

export function middleware(request: NextRequest) {
  const isApiUsers = request.nextUrl.pathname.startsWith('/api/users');
  const isMutableMethod = ['POST', 'PUT', 'DELETE'].includes(request.method);

  if (isApiUsers && isMutableMethod) {
    if (MOCK_USER_ROLE !== 'ADMIN') {
      return new NextResponse(JSON.stringify({ error: 'Forbidden: Admins only' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
