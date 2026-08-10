import { query } from '@/lib/db';
import { getSession, getUserPermissions } from '@/lib/auth';

export async function GET(request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const permissions = await getUserPermissions(session);
  if (session.role !== 'ADMIN' && !permissions?.order_types?.view && !permissions?.order_processing?.view && !permissions?.order_processing?.create && !permissions?.order_processing?.edit) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const types = await query('SELECT * FROM order_types ORDER BY id DESC');
    return Response.json(types);
  } catch (error) {
    console.error('Failed to fetch order types:', error);
    return Response.json({ error: 'Failed to fetch order types' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const permissions = await getUserPermissions(session);
  if (session.role !== 'ADMIN' && !permissions?.order_types?.create) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { name } = await request.json();
    if (!name || !name.trim()) {
      return Response.json({ error: 'Order Type Name is required' }, { status: 400 });
    }

    // Insert new type
    const result = await query('INSERT INTO order_types (name) VALUES (?)', [name.trim()]);
    return Response.json({
      success: true,
      message: 'Order Type created successfully',
      typeId: result.insertId
    });
  } catch (error) {
    console.error('Failed to create order type:', error);
    // Handle uniqueness error
    if (error.message && error.message.includes('Duplicate entry')) {
      return Response.json({ error: 'This Order Type already exists' }, { status: 400 });
    }
    return Response.json({ error: 'Failed to create order type' }, { status: 500 });
  }
}
