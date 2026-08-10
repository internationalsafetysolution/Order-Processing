import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const templates = await query('SELECT * FROM email_templates ORDER BY id ASC');
    return Response.json(templates);
  } catch (error) {
    console.error('Get email templates error:', error);
    return Response.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { 
      template_key, 
      subject, 
      body, 
      notify_admin, 
      notify_staff_1, 
      notify_staff_2, 
      notify_staff_3 
    } = await request.json();

    if (!template_key || !subject || !body) {
      return Response.json({ error: 'Template key, subject, and body are required' }, { status: 400 });
    }

    await query(
      `UPDATE email_templates 
       SET subject = ?, 
           body = ?, 
           notify_admin = ?, 
           notify_staff_1 = ?, 
           notify_staff_2 = ?, 
           notify_staff_3 = ? 
       WHERE template_key = ?`,
      [
        subject, 
        body, 
        notify_admin ? 1 : 0, 
        notify_staff_1 ? 1 : 0, 
        notify_staff_2 ? 1 : 0, 
        notify_staff_3 ? 1 : 0, 
        template_key
      ]
    );

    return Response.json({ success: true, message: 'Email template updated successfully' });
  } catch (error) {
    console.error('Update email template error:', error);
    return Response.json({ error: 'Failed to update email template' }, { status: 500 });
  }
}
