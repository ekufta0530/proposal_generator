import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  createUser, 
  getUserByEmail, 
  addUserToOrganization,
  getOrganization
} from '@/lib/db';
import { hashPassword } from '@/lib/auth';

// Validation schema
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1, 'Name is required'),
  orgId: z.string().optional() // Optional - if not provided, will use default org
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, orgId } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await createUser(email, passwordHash, name);

    // Determine organization
    let targetOrgId = orgId;
    if (!targetOrgId) {
      // Use default organization
      targetOrgId = 'X9kL3mPq'; // Default org from schema
    } else {
      // Validate organization exists
      const org = await getOrganization(targetOrgId);
      if (!org) {
        return NextResponse.json(
          { error: 'Invalid organization ID' },
          { status: 400 }
        );
      }
    }

    // Add user to organization as member
    await addUserToOrganization(user.id, targetOrgId, 'member');

    return NextResponse.json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });

  } catch (error: any) {
    console.error('Registration error:', error);
    
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
