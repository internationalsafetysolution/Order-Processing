import { query } from '@/lib/db';
import { setSession } from '@/lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return Response.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const users = await query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (!users || users.length === 0) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const user = users[0];

    // For production, use password hashing (e.g. bcrypt). Here we compare directly
    if (user.password !== password) {
      return Response.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Set session
    await setSession(user);

    return Response.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        designation: user.designation
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
