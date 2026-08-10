import { query } from '@/lib/db';
import { getSession, setSession } from '@/lib/auth';

export async function PUT(request, context) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await context.params;
  const staffId = parseInt(id);

  try {
    const { name, email, password, role = 'STAFF', designation, permissionScopes } = await request.json();

    if (!name || !email) {
      return Response.json({ error: 'Name and email are required' }, { status: 400 });
    }

    const userRole = role === 'ADMIN' ? 'ADMIN' : 'STAFF';
    let userDesignation = designation;

    if (userRole === 'ADMIN') {
      userDesignation = null;
    } else {
      const validDesignations = ['TASK_COMPLETION', 'INVOICE_CREATION', 'INVOICE_COURIER'];
      if (!validDesignations.includes(designation)) {
        return Response.json({ error: 'Invalid designation selection for staff member' }, { status: 400 });
      }
    }

    // Check if email belongs to someone else
    const cleanEmail = email.trim().toLowerCase();
    const existing = await query('SELECT id FROM users WHERE email = ? AND id != ?', [cleanEmail, staffId]);
    if (existing && existing.length > 0) {
      return Response.json({ error: 'Another user already has this email' }, { status: 400 });
    }

    if (password && password.trim() !== '') {
      // Update with new password and force password change on next login for staff
      const mustChange = userRole === 'STAFF' ? 1 : 0;
      await query(
        'UPDATE users SET name = ?, email = ?, password = ?, role = ?, designation = ?, permission_scopes = ?, must_change_password = ? WHERE id = ?',
        [name, email, password, userRole, userDesignation, permissionScopes || null, mustChange, staffId]
      );
    } else {
      // Update without changing password
      await query(
        'UPDATE users SET name = ?, email = ?, role = ?, designation = ?, permission_scopes = ? WHERE id = ?',
        [name, email, userRole, userDesignation, permissionScopes || null, staffId]
      );
    }

    // If updating own logged-in account, refresh active session cookie instantly
    if (session && session.id === staffId) {
      await setSession({
        ...session,
        name,
        email,
        role: userRole,
        designation: userDesignation,
        permission_scopes: permissionScopes || null
      });
    }

    return Response.json({ success: true, message: 'User account updated successfully' });
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

  if (session.id === staffId) {
    return Response.json({ error: 'You cannot delete your own active administrator account' }, { status: 400 });
  }

  try {
    // 1. Allow NULL for assigned staff columns in orders if MySQL
    try {
      await query('ALTER TABLE orders MODIFY COLUMN assigned_staff_1_id INT NULL');
      await query('ALTER TABLE orders MODIFY COLUMN assigned_staff_2_id INT NULL');
      await query('ALTER TABLE orders MODIFY COLUMN assigned_staff_3_id INT NULL');
    } catch (e) {}

    // 2. Unassign staff from any active orders so foreign keys/references don't block deletion
    try {
      await query('UPDATE orders SET assigned_staff_1_id = NULL WHERE assigned_staff_1_id = ?', [staffId]);
      await query('UPDATE orders SET assigned_staff_2_id = NULL WHERE assigned_staff_2_id = ?', [staffId]);
      await query('UPDATE orders SET assigned_staff_3_id = NULL WHERE assigned_staff_3_id = ?', [staffId]);
      await query('UPDATE orders SET created_by_id = NULL WHERE created_by_id = ?', [staffId]);
    } catch (e) {
      console.warn('Failed to unassign orders during staff delete:', e);
    }

    // 3. Delete staff member
    await query('DELETE FROM users WHERE id = ?', [staffId]);
    return Response.json({ success: true, message: 'Staff member deleted successfully' });
  } catch (error) {
    console.error('Delete staff API error:', error);
    return Response.json({ error: error.message || 'Failed to delete staff member' }, { status: 500 });
  }
}
