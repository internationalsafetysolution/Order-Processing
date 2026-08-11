import { query } from '@/lib/db';
import { getSession, getUserPermissions } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  const permissions = await getUserPermissions(session);

  if (!session || (session.role !== 'ADMIN' && !permissions?.client_management?.view && !permissions?.order_processing?.view && !permissions?.order_processing?.create && !permissions?.order_processing?.edit)) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const clients = await query('SELECT * FROM clients ORDER BY name ASC');
    return Response.json(clients);
  } catch (error) {
    console.error('Fetch clients error:', error);
    return Response.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();
  const permissions = await getUserPermissions(session);

  if (!session || (session.role !== 'ADMIN' && !permissions?.client_management?.create)) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { name, email, phone, address } = await request.json();

    if (!name || !name.trim()) {
      return Response.json({ error: 'Company / Client Name is required' }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanEmail = email ? email.trim() : '';
    const cleanPhone = phone ? phone.trim() : '';
    const cleanAddress = address ? address.trim() : '';

    const result = await query(
      'INSERT INTO clients (name, email, phone, address) VALUES (?, ?, ?, ?)',
      [cleanName, cleanEmail, cleanPhone, cleanAddress]
    );

    return Response.json({
      success: true,
      message: 'Client added successfully',
      clientId: result.insertId
    });
  } catch (error) {
    console.error('Add client error:', error);
    return Response.json({ error: 'Failed to add client' }, { status: 500 });
  }
}
