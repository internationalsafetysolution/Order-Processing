import { getSession, getUserPermissions } from '@/lib/auth';
import { seedDatabase } from '@/lib/seed';
import { query } from '@/lib/db';

let seeded = false;

export async function GET() {
  // Run seed database on first session load
  if (!seeded) {
    try {
      await seedDatabase();
      seeded = true;
    } catch (e) {
      console.error('Seeding database failed on startup:', e);
    }
  }

  const session = await getSession();
  
  if (!session) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  // Fetch the fresh user details from the database to update permission scopes dynamically
  let dbUser = null;
  try {
    if (process.env.DB_HOST) {
      const users = await query('SELECT designation, permission_scopes FROM users WHERE id = ?', [session.id]);
      if (users.length > 0) dbUser = users[0];
    } else {
      const users = await query('SELECT * FROM users');
      dbUser = users.find(u => u.id === session.id);
    }
  } catch (e) {
    console.error('Failed to fetch fresh user for session:', e);
  }

  const activeUser = dbUser ? { ...session, ...dbUser } : session;
  const permissions = await getUserPermissions(activeUser);
  
  return Response.json({
    authenticated: true,
    user: {
      ...activeUser,
      permissions
    }
  });
}
