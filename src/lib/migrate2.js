const fs = require('fs');
const path = require('path');

// Manually parse and load .env file
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    const key = parts[0].trim();
    const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
    process.env[key] = value;
  });
}

const { query } = require('./db');

const defaultScopes = [
  {
    id: 1,
    name: 'Production (Phase 1)',
    permissions: JSON.stringify({
      order_processing: { view: true, create: false, edit: false, delete: false },
      order_types: { view: false, create: false, edit: false, delete: false },
      phases: { production: true, accounts: false, logistics: false }
    })
  },
  {
    id: 2,
    name: 'Accounts (Phase 2)',
    permissions: JSON.stringify({
      order_processing: { view: true, create: true, edit: true, delete: false },
      order_types: { view: true, create: true, edit: false, delete: false },
      phases: { production: false, accounts: true, logistics: false }
    })
  },
  {
    id: 3,
    name: 'Logistics (Phase 3)',
    permissions: JSON.stringify({
      order_processing: { view: true, create: false, edit: false, delete: false },
      order_types: { view: false, create: false, edit: false, delete: false },
      phases: { production: false, accounts: false, logistics: true }
    })
  },
  {
    id: 4,
    name: 'Full Admin Access',
    permissions: JSON.stringify({
      order_processing: { view: true, create: true, edit: true, delete: true },
      order_types: { view: true, create: true, edit: true, delete: true },
      phases: { production: true, accounts: true, logistics: true }
    })
  }
];

async function migrate() {
  console.log('Running database migration #2...');

  // 1. MySQL Migration
  if (process.env.DB_HOST) {
    try {
      console.log('Checking MySQL schema for permission_scopes...');
      
      // Create permission_scopes table if it doesn't exist
      await query(`
        CREATE TABLE IF NOT EXISTS permission_scopes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          permissions TEXT NOT NULL
        )
      `);
      console.log('permission_scopes table created or verified.');

      // Check if users has permission_scopes column
      const userColumns = await query('SHOW COLUMNS FROM users');
      const hasPermissionScopes = userColumns.some(col => col.Field === 'permission_scopes');
      if (!hasPermissionScopes) {
        await query('ALTER TABLE users ADD COLUMN permission_scopes VARCHAR(255) NULL');
        console.log('permission_scopes column added to users table in MySQL.');
      }

      // Check if we have seeded scopes
      const existingScopes = await query('SELECT COUNT(*) as count FROM permission_scopes');
      if (existingScopes[0].count === 0) {
        console.log('Seeding default permission scopes in MySQL...');
        for (const scope of defaultScopes) {
          await query(
            'INSERT INTO permission_scopes (id, name, permissions) VALUES (?, ?, ?)',
            [scope.id, scope.name, scope.permissions]
          );
        }
        console.log('Seeding MySQL scopes completed.');
      }
    } catch (err) {
      console.error('MySQL migration failed:', err);
    }
  }

  // 2. Mock DB Migration
  const MOCK_DB_PATH = path.join(process.cwd(), 'src/lib/mockDb.json');
  try {
    if (fs.existsSync(MOCK_DB_PATH)) {
      console.log('Migrating mockDb.json...');
      const db = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
      
      if (!db.permission_scopes) {
        db.permission_scopes = defaultScopes.map(s => ({
          id: s.id,
          name: s.name,
          permissions: JSON.parse(s.permissions)
        }));
      }

      if (db.users) {
        db.users.forEach(user => {
          if (user.permission_scopes === undefined) {
            // Default mappings for fallback users:
            if (user.role === 'ADMIN') {
              user.permission_scopes = '4'; // Admin Access
            } else if (user.designation === 'TASK_COMPLETION') {
              user.permission_scopes = '1';
            } else if (user.designation === 'INVOICE_CREATION') {
              user.permission_scopes = '2';
            } else if (user.designation === 'INVOICE_COURIER') {
              user.permission_scopes = '3';
            } else {
              user.permission_scopes = null;
            }
          }
        });
      }

      fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(db, null, 2));
      console.log('mockDb.json migration completed successfully.');
    }
  } catch (err) {
    console.error('Mock DB migration failed:', err);
  }
}

migrate().then(() => {
  console.log('Migration #2 complete.');
  process.exit(0);
}).catch(err => {
  console.error('Migration #2 failed with error:', err);
  process.exit(1);
});
