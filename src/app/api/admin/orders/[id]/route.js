import { query } from '@/lib/db';
import { getSession, getUserPermissions } from '@/lib/auth';

export async function PUT(request, context) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const permissions = await getUserPermissions(session);
  if (session.role !== 'ADMIN' && !permissions?.order_processing?.edit) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await context.params;
  const orderId = parseInt(id);

  try {
    const { clientId, orderTypeId, details, qty, deadlineDate, staff1Id, staff2Id, staff3Id, poNo, poFilePath } = await request.json();

    if (!clientId || !details || !staff1Id || !staff2Id || !staff3Id) {
      return Response.json({ error: 'All mandatory fields are required' }, { status: 400 });
    }

    await query(
      `UPDATE orders 
       SET client_id = ?, order_type_id = ?, details = ?, qty = ?, deadline_date = ?, 
           assigned_staff_1_id = ?, assigned_staff_2_id = ?, assigned_staff_3_id = ?,
           po_no = ?, po_file_path = ?
       WHERE id = ?`,
      [
        parseInt(clientId),
        orderTypeId ? parseInt(orderTypeId) : null,
        details,
        parseInt(qty || '0'),
        deadlineDate || null,
        parseInt(staff1Id),
        parseInt(staff2Id),
        parseInt(staff3Id),
        poNo || null,
        poFilePath || null,
        orderId
      ]
    );

    return Response.json({ success: true, message: 'Order updated successfully' });
  } catch (error) {
    console.error('Update order error:', error);
    return Response.json({ error: 'Failed to update order details' }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const permissions = await getUserPermissions(session);
  if (session.role !== 'ADMIN' && !permissions?.order_processing?.delete) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await context.params;
  const orderId = parseInt(id);

  try {
    // Completely delete the order from the database
    await query('DELETE FROM orders WHERE id = ?', [orderId]);
    return Response.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Delete order error:', error);
    return Response.json({ error: 'Failed to delete order from system' }, { status: 500 });
  }
}
