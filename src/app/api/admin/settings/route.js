import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const settings = await query('SELECT * FROM settings WHERE id = 1');
    if (settings && settings.length > 0) {
      return Response.json(settings[0]);
    }
    return Response.json({ app_name: 'ISS PORTAL', app_logo: null, favicon: null, logo_width: 150, reupload_buffer_time: 20, max_reupload_count: 3 });
  } catch (error) {
    console.error('Get admin settings error:', error);
    return Response.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function PUT(request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { app_name, app_logo, favicon, logo_width, reupload_buffer_time, max_reupload_count } = await request.json();

    if (!app_name) {
      return Response.json({ error: 'App Name is required' }, { status: 400 });
    }

    const width = parseInt(logo_width) || 150;
    const bufferTime = parseInt(reupload_buffer_time) || 20;
    const maxReupload = parseInt(max_reupload_count);
    const maxReuploadVal = isNaN(maxReupload) ? 3 : Math.max(0, maxReupload);

    await query(
      'UPDATE settings SET app_name = ?, app_logo = ?, favicon = ?, logo_width = ?, reupload_buffer_time = ?, max_reupload_count = ? WHERE id = 1',
      [app_name, app_logo || null, favicon || null, width, bufferTime, maxReuploadVal]
    );

    return Response.json({ success: true, message: 'Application settings updated successfully' });
  } catch (error) {
    console.error('Update settings API error:', error);
    return Response.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
