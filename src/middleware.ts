// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Add request size limits
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
    return new NextResponse('Request too large', { status: 413 });
  }

  // Add rate limiting headers
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', '10');
  
  return response;
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
