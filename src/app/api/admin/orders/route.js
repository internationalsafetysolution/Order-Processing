import { query } from '@/lib/db';
import { getSession, getUserPermissions } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const permissions = await getUserPermissions(session);
  if (session.role !== 'ADMIN' && !permissions?.order_processing?.view) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    // MySQL query with JOINs
    let orders;
    if (process.env.DB_HOST) {
      orders = await query(`
        SELECT 
          o.*,
          c.name as client_name,
          c.phone as client_phone,
          c.address as client_address,
          ot.name as order_type_name,
          u1.name as staff_1_name,
          u2.name as staff_2_name,
          u3.name as staff_3_name,
          uc.name as created_by_name
        FROM orders o
        JOIN clients c ON o.client_id = c.id
        LEFT JOIN order_types ot ON o.order_type_id = ot.id
        JOIN users u1 ON o.assigned_staff_1_id = u1.id
        JOIN users u2 ON o.assigned_staff_2_id = u2.id
        JOIN users u3 ON o.assigned_staff_3_id = u3.id
        LEFT JOIN users uc ON o.created_by_id = uc.id
        ORDER BY o.id DESC
      `);
    } else {
      // JSON mock database fallback handles joining inside lib/db.js query helper
      orders = await query('SELECT * FROM orders');
    }

    return Response.json(orders);
  } catch (error) {
    console.error('Fetch orders error:', error);
    return Response.json({ error: 'Failed to retrieve orders' }, { status: 500 });
  }
}

function getKarachiDate() {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  const parts = formatter.formatToParts(new Date());
  const partMap = {};
  parts.forEach(p => { partMap[p.type] = p.value; });
  return `${partMap.year}-${partMap.month}-${partMap.day} ${partMap.hour}:${partMap.minute}:${partMap.second}`;
}

export async function POST(request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const permissions = await getUserPermissions(session);
  if (session.role !== 'ADMIN' && !permissions?.order_processing?.create) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { clientId, orderTypeId, details, qty, deadlineDate, staff1Id, staff2Id, staff3Id, poNo, poFilePath } = await request.json();

    if (!clientId || !orderTypeId || !details || !deadlineDate || !poNo || !poFilePath || !staff1Id || !staff2Id || !staff3Id) {
      return Response.json({ error: 'All fields (Client, Order Type, Details, Deadline Date, PO Number, PO File, and Staff Crew) are strictly required.' }, { status: 400 });
    }

    const currentPKTDate = getKarachiDate();

    // Insert order in Pending Task status with creator ID and stage1_opened_at set
    const result = await query(
      'INSERT INTO orders (client_id, order_type_id, details, qty, deadline_date, status, assigned_staff_1_id, assigned_staff_2_id, assigned_staff_3_id, po_no, po_file_path, created_by_id, stage1_opened_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        parseInt(clientId),
        orderTypeId ? parseInt(orderTypeId) : null,
        details,
        parseInt(qty || '0'),
        deadlineDate || null,
        'PENDING_TASK', // Initial status
        parseInt(staff1Id),
        parseInt(staff2Id),
        parseInt(staff3Id),
        poNo || null,
        poFilePath || null,
        session.id,
        currentPKTDate
      ]
    );

    const clientRows = await query('SELECT name FROM clients WHERE id = ?', [parseInt(clientId)]);
    const clientName = clientRows && clientRows.length > 0 ? clientRows[0].name : '';
    
    let orderTypeName = '';
    if (orderTypeId) {
      const typeRows = await query('SELECT name FROM order_types WHERE id = ?', [parseInt(orderTypeId)]);
      if (typeRows && typeRows.length > 0) {
        orderTypeName = typeRows[0].name;
      }
    }

    // Fire email notification asynchronously
    const { sendSystemEmail } = require('@/lib/mailer');
    sendSystemEmail('order_created', {
      order_id: result.insertId,
      client_name: clientName,
      order_type: orderTypeName || 'Standard Order',
      qty: qty || '0',
      po_no: poNo || 'N/A',
      deadline_date: deadlineDate || 'N/A',
      assigned_staff_1_id: parseInt(staff1Id),
      assigned_staff_2_id: parseInt(staff2Id),
      assigned_staff_3_id: parseInt(staff3Id)
    }).catch(err => {
      console.error('Failed to trigger order_created system notification:', err);
    });

    return Response.json({
      success: true,
      message: 'Order created and assigned successfully',
      orderId: result.insertId
    });
  } catch (error) {
    console.error('Create order error:', error);
    return Response.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
