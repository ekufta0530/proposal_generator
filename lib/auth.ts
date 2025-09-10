import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // 7 days (1 week)
const COOKIE_NAME = 'auth-token';

// Types
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  orgId: string;
  role: 'owner' | 'admin' | 'member';
  defaultTenant?: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  orgId: string;
  role: 'owner' | 'admin' | 'member';
  defaultTenant?: string;
  iat: number;
  exp: number;
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT utilities
export function generateToken(user: AuthUser): string {
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    name: user.name,
    orgId: user.orgId,
    role: user.role,
    defaultTenant: user.defaultTenant
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Cookie utilities
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days (1 week)
    path: '/'
  });
}

export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  });
}

// Request utilities
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (process.env.NODE_ENV === 'development') {
    console.log('[Auth] Getting user from request:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      cookieName: COOKIE_NAME
    });
  }

  if (!token) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] No token found');
    }
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Auth] Token verification failed');
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
    console.log('[Auth] User extracted from token:', {
      id: user.id,
      email: user.email,
      orgId: user.orgId,
      defaultTenant: user.defaultTenant
    });
  }

  return user;
}

// Authorization utilities
export function hasOrgAccess(user: AuthUser, orgId: string): boolean {
  return user.orgId === orgId;
}

export function hasRole(user: AuthUser, requiredRole: 'owner' | 'admin' | 'member'): boolean {
  const roleHierarchy = { owner: 3, admin: 2, member: 1 };
  return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

// Audit logging
export function logAuthMismatch(
  user: AuthUser | null,
  requestedOrgId: string | null,
  requestUrl: string
): void {
  const timestamp = new Date().toISOString();
  const userId = user?.id || 'anonymous';
  const userOrgId = user?.orgId || 'none';

  console.warn(`[AUTH_MISMATCH] ${timestamp} - User: ${userId}, UserOrg: ${userOrgId}, RequestedOrg: ${requestedOrgId}, URL: ${requestUrl}`);
}

// Middleware helper
export async function validateAuthAndAccess(
  request: NextRequest,
  requiredOrgId?: string
): Promise<{ user: AuthUser; response?: NextResponse } | { user: null; response: NextResponse }> {
  const user = await getAuthUser(request);
  
  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    };
  }

  // Check organization access
  if (requiredOrgId && !hasOrgAccess(user, requiredOrgId)) {
    logAuthMismatch(user, requiredOrgId, request.url);
    return {
      user: null,
      response: NextResponse.json(
        { error: 'Access denied: Invalid organization' },
        { status: 403 }
      )
    };
  }

  return { user };
}
