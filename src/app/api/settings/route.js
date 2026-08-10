import { query } from '@/lib/db';

export async function GET() {
  try {
    const settings = await query('SELECT app_name, app_logo, favicon, logo_width, reupload_buffer_time, max_reupload_count FROM settings WHERE id = 1');
    if (settings && settings.length > 0) {
      return Response.json(settings[0]);
    }
    return Response.json({ app_name: 'ISS PORTAL', app_logo: null, favicon: null, logo_width: 150, reupload_buffer_time: 20, max_reupload_count: 3 });
  } catch (error) {
    console.error('Fetch public settings failed:', error);
    return Response.json({ app_name: 'ISS PORTAL', app_logo: null, favicon: null, logo_width: 150, reupload_buffer_time: 20, max_reupload_count: 3 });
  }
}
