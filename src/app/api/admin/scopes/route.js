import { query } from '@/lib/db';
const { getSession } = require('@/lib/auth');

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    let scopes;
    if (process.env.DB_HOST) {
      scopes = await query('SELECT * FROM permission_scopes ORDER BY id DESC');
    } else {
      scopes = await query('SELECT * FROM permission_scopes');
    }

    // Parse JSON permissions if they are strings from DB
    const parsedScopes = scopes.map(scope => {
      let permissions = scope.permissions;
      if (typeof permissions === 'string') {
        try {
          permissions = JSON.parse(permissions);
        } catch (e) {
          permissions = {};
        }
      }
      return { ...scope, permissions };
    });

    return Response.json(parsedScopes);
  } catch (error) {
    console.error('Fetch permission scopes error:', error);
    return Response.json({ error: 'Database query failed' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { name, permissions } = await request.json();

    if (!name || !permissions) {
      return Response.json({ error: 'Scope name and permissions are required' }, { status: 400 });
    }

    const permissionsStr = typeof permissions === 'string' ? permissions : JSON.stringify(permissions);

    const result = await query(
      'INSERT INTO permission_scopes (name, permissions) VALUES (?, ?)',
      [name, permissionsStr]
    );

    return Response.json({
      success: true,
      message: 'Permission scope created successfully',
      scopeId: result.insertId
    });
  } catch (error) {
    console.error('Create permission scope error:', error);
    return Response.json({ error: 'Failed to create permission scope' }, { status: 500 });
  }
}
