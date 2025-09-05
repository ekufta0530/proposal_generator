import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    
    return NextResponse.json({
      success: true,
      hasUser: !!user,
      user: user ? {
        id: user.id,
        email: user.email,
        orgId: user.orgId,
        defaultTenant: user.defaultTenant
      } : null,
      url: request.url,
      headers: {
        cookie: request.headers.get('cookie') || 'No cookie header'
      }
    });
  } catch (error) {
    console.error('Test middleware error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test failed',
      url: request.url
    }, { status: 500 });
  }
}
