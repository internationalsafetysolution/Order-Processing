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

    if (!name || !name.trim()) {
      return Response.json({ error: 'Company / Client Name is required' }, { status: 400 });
    }

    const cleanName = name.trim();
    const cleanEmail = email ? email.trim() : '';
    const cleanPhone = phone ? phone.trim() : '';
    const cleanAddress = address ? address.trim() : '';

    await query(
      'UPDATE clients SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      [cleanName, cleanEmail, cleanPhone, cleanAddress, clientId]
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
