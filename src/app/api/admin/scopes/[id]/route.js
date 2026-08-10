import { query } from '@/lib/db';
const { getSession } = require('@/lib/auth');

export async function PUT(request, context) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await context.params;
  const scopeId = parseInt(id);

  try {
    const { name, permissions } = await request.json();

    if (!name || !permissions) {
      return Response.json({ error: 'Scope name and permissions are required' }, { status: 400 });
    }

    const permissionsStr = typeof permissions === 'string' ? permissions : JSON.stringify(permissions);

    await query(
      'UPDATE permission_scopes SET name = ?, permissions = ? WHERE id = ?',
      [name, permissionsStr, scopeId]
    );

    return Response.json({ success: true, message: 'Permission scope updated successfully' });
  } catch (error) {
    console.error('Update permission scope error:', error);
    return Response.json({ error: 'Failed to update permission scope' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await context.params;
  const scopeId = parseInt(id);

  try {
    // Delete permission scope
    await query('DELETE FROM permission_scopes WHERE id = ?', [scopeId]);
    return Response.json({ success: true, message: 'Permission scope deleted successfully' });
  } catch (error) {
    console.error('Delete permission scope error:', error);
    return Response.json({ error: 'Failed to delete permission scope' }, { status: 500 });
  }
}
