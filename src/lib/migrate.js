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


async function migrate() {
  console.log('Running database migration...');
  
  // 1. MySQL Migration
  if (process.env.DB_HOST) {
    try {
      console.log('Checking MySQL users table schema...');
      const columns = await query('SHOW COLUMNS FROM users');
      const hasPermissions = columns.some(col => col.Field === 'permissions');
      
      if (!hasPermissions) {
        console.log('Adding permissions column to users table in MySQL...');
        await query('ALTER TABLE users ADD COLUMN permissions TEXT NULL');
        console.log('permissions column added successfully!');
      } else {
        console.log('MySQL users table already has permissions column.');
      }
    } catch (err) {
      console.error('MySQL migration failed:', err);
    }
  } else {
    console.log('MySQL not configured, skipping MySQL migration.');
  }

  // 2. Mock DB Migration
  const MOCK_DB_PATH = path.join(process.cwd(), 'src/lib/mockDb.json');
  try {
    if (fs.existsSync(MOCK_DB_PATH)) {
      console.log('Checking Mock DB schema...');
      const db = JSON.parse(fs.readFileSync(MOCK_DB_PATH, 'utf8'));
      let modified = false;
      
      if (db.users) {
        db.users.forEach(user => {
          if (user.permissions === undefined) {
            user.permissions = null;
            modified = true;
          }
        });
      }
      
      if (modified) {
        fs.writeFileSync(MOCK_DB_PATH, JSON.stringify(db, null, 2));
        console.log('Mock DB schema updated successfully!');
      } else {
        console.log('Mock DB already up to date.');
      }
    }
  } catch (err) {
    console.error('Mock DB migration failed:', err);
  }
}

migrate().then(() => {
  console.log('Migration complete.');
  process.exit(0);
}).catch(err => {
  console.error('Migration failed with error:', err);
  process.exit(1);
});
