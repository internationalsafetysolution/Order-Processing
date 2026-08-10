import { query } from '@/lib/db';
import { getSession, getUserPermissions } from '@/lib/auth';

export async function PUT(request, context) {
  const session = await getSession();
  const permissions = await getUserPermissions(session);

  if (!session || (session.role !== 'ADMIN' && !permissions?.client_management?.edit)) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await context.params;
  const clientId = parseInt(id);

  try {
    const { name, email, phone, address } = await request.json();

    if (!name || !email || !phone || !address) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    await query(
      'UPDATE clients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [name, email, phone, address, clientId]
    );

    return Response.json({ success: true, message: 'Client profile updated successfully' });
  } catch (error) {
    console.error('Update client API error:', error);
    return Response.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const session = await getSession();
  const permissions = await getUserPermissions(session);

  if (!session || (session.role !== 'ADMIN' && !permissions?.client_management?.delete)) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await context.params;
  const clientId = parseInt(id);

  try {
    await query('DELETE FROM clients WHERE id = ?', [clientId]);
    return Response.json({ success: true, message: 'Client deleted successfully' });
  } catch (error) {
    console.error('Delete client API error:', error);
    return Response.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}
