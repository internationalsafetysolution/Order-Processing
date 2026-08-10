import { query } from '@/lib/db';
import { getSession, getUserPermissions } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  const permissions = await getUserPermissions(session);
  
  if (!session || (session.role !== 'ADMIN' && !permissions?.order_processing?.view && !permissions?.order_processing?.create && !permissions?.order_processing?.edit)) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const staff = await query("SELECT id, email, name, role, designation, permission_scopes FROM users WHERE role = 'STAFF'");
    return Response.json(staff);
  } catch (error) {
    console.error('Fetch staff error:', error);
    return Response.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { name, email, password, designation, permissionScopes } = await request.json();

    if (!name || !email || !password || !designation) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Verify designation is one of the three
    const validDesignations = ['TASK_COMPLETION', 'INVOICE_CREATION', 'INVOICE_COURIER'];
    if (!validDesignations.includes(designation)) {
      return Response.json({ error: 'Invalid designation selection' }, { status: 400 });
    }

    // Check if user already exists
    const existing = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing && existing.length > 0) {
      return Response.json({ error: 'Staff account with this email already exists' }, { status: 400 });
    }

    // Insert staff
    const result = await query(
      'INSERT INTO users (email, password, name, role, designation, permission_scopes) VALUES (?, ?, ?, ?, ?, ?)',
      [email, password, name, 'STAFF', designation, permissionScopes || null]
    );

    return Response.json({
      success: true,
      message: 'Staff created successfully',
      staffId: result.insertId
    });
  } catch (error) {
    console.error('Create staff error:', error);
    return Response.json({ error: 'Failed to create staff account' }, { status: 500 });
  }
}
