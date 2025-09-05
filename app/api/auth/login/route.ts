import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  getUserByEmail, 
  getUserOrganizations,
  getOrganization
} from '@/lib/db';
import { 
  verifyPassword, 
  generateToken, 
  setAuthCookie,
  AuthUser 
} from '@/lib/auth';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Get user from database
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Get user's organizations
    const userOrgs = await getUserOrganizations(user.id);
    if (userOrgs.length === 0) {
      return NextResponse.json(
        { error: 'User is not associated with any organization' },
        { status: 403 }
      );
    }

    // For now, use the first organization (in a real app, you might want to let users choose)
    const primaryOrg = userOrgs[0];

    // Get organization details to fetch default tenant
    const organization = await getOrganization(primaryOrg.org_id);
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Create auth user object
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      orgId: primaryOrg.org_id,
      role: primaryOrg.role as 'owner' | 'admin' | 'member',
      defaultTenant: organization.default_tenant || undefined
    };

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Login] Auth user object:', {
        orgId: authUser.orgId,
        defaultTenant: authUser.defaultTenant,
        organization: organization.name
      });
    }

    // Generate JWT token
    const token = generateToken(authUser);

    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: authUser.id,
        email: authUser.email,
        name: authUser.name,
        orgId: authUser.orgId,
        role: authUser.role
      }
    });

    // Set HTTP-only cookie
    setAuthCookie(response, token);

    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('[Login API] Response created:', {
        success: true,
        user: {
          id: authUser.id,
          email: authUser.email,
          orgId: authUser.orgId,
          role: authUser.role
        },
        hasToken: !!token,
        tokenLength: token?.length || 0
      });
    }

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
