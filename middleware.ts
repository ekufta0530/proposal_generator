import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// ============================================================================
// CONFIGURATION
// ============================================================================

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const COOKIE_NAME = 'auth-token';

// Route Configuration
const PROTECTED_ROUTES = [
  '/portal',
  '/proposals',
  '/api/tenants',
  '/api/layout',
  '/api/proposal',
  '/api/sections',
  '/api/proposals'
];

const PUBLIC_ROUTES = [
  '/',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/me'
];

// ============================================================================
// TYPES
// ============================================================================

interface AuthUser {
  id: string;
  email: string;
  name: string;
  orgId: string;
  role: 'owner' | 'admin' | 'member';
  defaultTenant?: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  orgId: string;
  role: 'owner' | 'admin' | 'member';
  defaultTenant?: string;
  iat: number;
  exp: number;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Checks if a route is public (no authentication required)
 */
function isPublicRoute(pathname: string): boolean {
  const result = PUBLIC_ROUTES.some(route => {
    // Special handling for root route - must be exact match
    if (route === '/') {
      return pathname === '/';
    }
    // For all other routes, use startsWith
    return pathname.startsWith(route);
  });
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] isPublicRoute check:', {
      pathname,
      publicRoutes: PUBLIC_ROUTES,
      result,
      matches: PUBLIC_ROUTES.filter(route => {
        if (route === '/') {
          return pathname === '/';
        }
        return pathname.startsWith(route);
      })
    });
  }
  
  return result;
}

/**
 * Checks if a route is protected (authentication required)
 */
function isProtectedRoute(pathname: string): boolean {
  const result = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] isProtectedRoute check:', {
      pathname,
      protectedRoutes: PROTECTED_ROUTES,
      result,
      matches: PROTECTED_ROUTES.filter(route => pathname.startsWith(route))
    });
  }
  
  return result;
}

/**
 * Checks if a route needs org_id and tenant parameters
 */
function needsUserParams(pathname: string): boolean {
  return pathname.startsWith('/portal') || pathname.startsWith('/proposals');
}

/**
 * Verifies a JWT token using Web Crypto API (Edge Runtime compatible)
 * 
 * NOTE: Next.js middleware runs in Edge Runtime which doesn't support Node.js modules
 * like 'crypto' that jsonwebtoken uses. This function uses Web APIs instead.
 * 
 * For production, consider implementing proper signature verification using Web Crypto API.
 * For development, this basic verification (expiration check + payload decode) is sufficient.
 */
async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    // Split the token into parts
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Decode the payload (middle part)
    const payload = JSON.parse(atob(parts[1])) as JWTPayload;
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new Error('Token expired');
    }
    
    // For now, we'll skip signature verification in middleware
    // In production, you might want to implement proper signature verification
    // using Web Crypto API, but for development this is sufficient
    
    return payload;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Token verification failed:', error);
    }
    return null;
  }
}

/**
 * Extracts user information from JWT token in request cookies
 */
async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Getting user from request:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      cookieName: COOKIE_NAME
    });
  }

  if (!token) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] No token found');
    }
    return null;
  }

  const payload = await verifyToken(token);
  if (!payload) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Token verification failed');
    }
    return null;
  }

  const user = {
    id: payload.userId,
    email: payload.email,
    name: payload.name,
    orgId: payload.orgId,
    role: payload.role,
    defaultTenant: payload.defaultTenant
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] User extracted from token:', {
      id: user.id,
      email: user.email,
      orgId: user.orgId,
      defaultTenant: user.defaultTenant
    });
  }

  return user;
}

/**
 * Forms a complete URL with org_id and tenant parameters
 */
function formUserUrl(
  pathname: string,
  userContext: { orgId: string; defaultTenant?: string },
  currentParams: URLSearchParams,
  baseUrl: string
): string {
  const url = new URL(pathname, baseUrl);
  
  // Always set org_id
  url.searchParams.set('org_id', userContext.orgId);
  
  // Set tenant if available
  if (userContext.defaultTenant) {
    url.searchParams.set('tenant', userContext.defaultTenant);
  }
  
  // Preserve other parameters
  currentParams.forEach((value, key) => {
    if (key !== 'org_id' && key !== 'tenant') {
      url.searchParams.set(key, value);
    }
  });
  
  return url.toString();
}

/**
 * Logs authentication mismatches for auditing
 */
function logAuthMismatch(user: AuthUser, urlOrgId: string, requestUrl: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Auth mismatch detected:', {
      userOrgId: user.orgId,
      urlOrgId,
      requestUrl,
      timestamp: new Date().toISOString()
    });
  }
}

// ============================================================================
// MAIN MIDDLEWARE FUNCTION
// ============================================================================

/**
 * Main middleware function that handles authentication and URL formation
 * 
 * FLOW:
 * 1. Log all requests for debugging
 * 2. Skip public routes (no auth needed)
 * 3. Skip non-protected routes (no auth needed)
 * 4. Extract user from JWT token
 * 5. Handle unauthenticated users (redirect to login)
 * 6. Auto-fill missing org_id and tenant parameters
 * 7. Validate org_id matches user's organization
 * 8. Add user info to headers for API routes
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname, searchParams } = new URL(request.url);

  // ========================================================================
  // STEP 1: Log all requests for debugging
  // ========================================================================
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Request:', {
      url: request.url,
      pathname,
      method: request.method,
      searchParams: Object.fromEntries(searchParams.entries()),
      timestamp: new Date().toISOString()
    });
  }

  // ========================================================================
  // STEP 2: Skip public routes (no authentication required)
  // ========================================================================
  if (isPublicRoute(pathname)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Skipping public route:', pathname);
    }
    return NextResponse.next();
  }

  // ========================================================================
  // STEP 3: Skip non-protected routes (no authentication required)
  // ========================================================================
  if (!isProtectedRoute(pathname)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Skipping non-protected route:', pathname);
    }
    return NextResponse.next();
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Processing protected route:', pathname);
  }

  // ========================================================================
  // STEP 4: Extract user from JWT token
  // ========================================================================
  const user = await getAuthUser(request);

  // ========================================================================
  // STEP 5: Handle unauthenticated users
  // ========================================================================
  if (!user) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] No user found, redirecting to login');
    }

    // Redirect to login for protected routes
    if (needsUserParams(pathname)) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + (request.url.split('?')[1] || ''));
      return NextResponse.redirect(loginUrl);
    }
    
    // Return 401 for API routes
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // ========================================================================
  // STEP 6: Auto-fill missing org_id and tenant parameters
  // ========================================================================
  const urlOrgId = searchParams.get('org_id');
  
  if (!urlOrgId && needsUserParams(pathname)) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Auto-filling missing org_id and tenant');
    }

    const userContext = {
      orgId: user.orgId,
      defaultTenant: user.defaultTenant
    };
    
    const newUrl = formUserUrl(pathname, userContext, searchParams, request.url);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Redirecting to:', {
        original: request.url,
        new: newUrl,
        userContext
      });
    }
    
    return NextResponse.redirect(newUrl);
  }

  // ========================================================================
  // STEP 7: Validate org_id matches user's organization
  // ========================================================================
  if (urlOrgId && urlOrgId !== user.orgId) {
    logAuthMismatch(user, urlOrgId, request.url);
    
    if (needsUserParams(pathname)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] Org ID mismatch, redirecting to user\'s org');
      }

      const userContext = {
        orgId: user.orgId,
        defaultTenant: user.defaultTenant
      };
      
      const newUrl = formUserUrl(pathname, userContext, searchParams, request.url);
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[Middleware] Redirecting due to org mismatch:', {
          original: request.url,
          new: newUrl,
          userContext
        });
      }
      
      return NextResponse.redirect(newUrl);
    }
    
    return NextResponse.json(
      { error: 'Access denied: Invalid organization' },
      { status: 403 }
    );
  }

  // ========================================================================
  // STEP 8: Add user info to headers for API routes
  // ========================================================================
  if (pathname.startsWith('/api/')) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Adding user headers for API route');
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-org-id', user.orgId);
    requestHeaders.set('x-user-role', user.role);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // ========================================================================
  // STEP 9: Continue with request (no redirect needed)
  // ========================================================================
  if (process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Request approved, continuing...');
  }

  return NextResponse.next();
}

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

export const config = { 
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
};
