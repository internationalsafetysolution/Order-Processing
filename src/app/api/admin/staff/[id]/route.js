import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function PUT(request, context) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await context.params;
  const staffId = parseInt(id);

  try {
    const { name, email, password, designation, permissionScopes } = await request.json();

    if (!name || !email || !designation) {
      return Response.json({ error: 'Name, email, and designation are required' }, { status: 400 });
    }

    const validDesignations = ['TASK_COMPLETION', 'INVOICE_CREATION', 'INVOICE_COURIER'];
    if (!validDesignations.includes(designation)) {
      return Response.json({ error: 'Invalid designation selection' }, { status: 400 });
    }

    // Check if email belongs to someone else
    const existing = await query('SELECT id FROM users WHERE email = ? AND id != ?', [email, staffId]);
    if (existing && existing.length > 0) {
      return Response.json({ error: 'Another user already has this email' }, { status: 400 });
    }

    if (password && password.trim() !== '') {
      // Update with new password
      await query(
        'UPDATE users SET name = ?, email = ?, password = ?, designation = ?, permission_scopes = ? WHERE id = ?',
        [name, email, password, designation, permissionScopes || null, staffId]
      );
    } else {
      // Update without changing password
      await query(
        'UPDATE users SET name = ?, email = ?, designation = ?, permission_scopes = ? WHERE id = ?',
        [name, email, designation, permissionScopes || null, staffId]
      );
    }

    return Response.json({ success: true, message: 'Staff member updated successfully' });
  } catch (error) {
    console.error('Update staff API error:', error);
    return Response.json({ error: 'Failed to update staff member' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await context.params;
  const staffId = parseInt(id);

  try {
    // Delete staff
    await query('DELETE FROM users WHERE id = ?', [staffId]);
    return Response.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Delete staff API error:', error);
    return Response.json({ error: 'Failed to delete staff member' }, { status: 500 });
  }
}
