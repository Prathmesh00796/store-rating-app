const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

let dbInstance = null;

function getSqliteDatabase() {
  if (dbInstance) return dbInstance;

  let DatabaseSync;
  try {
    ({ DatabaseSync } = require('node:sqlite'));
  } catch (err) {
    console.error('node:sqlite not available on this Node version:', err.message);
    throw err;
  }

  const dbPath = path.join(process.cwd(), 'store_rating.sqlite');
  const db = new DatabaseSync(dbPath);

  // Enable foreign keys
  db.exec('PRAGMA foreign_keys = ON;');

  // Create tables if they do not exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      address TEXT,
      role TEXT NOT NULL DEFAULT 'NORMAL_USER',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stores (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT,
      owner_id INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT ON UPDATE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      store_id INTEGER NOT NULL,
      rating INTEGER NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, store_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
      FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  // Seed default demo data if users table is empty
  const userCountStmt = db.prepare('SELECT COUNT(*) AS count FROM users');
  const userCount = userCountStmt.get().count;

  if (userCount === 0) {
    console.log('[SQLite] Seeding demo accounts and stores...');
    const adminHash = bcrypt.hashSync('Admin@123', 10);
    const ownerHash = bcrypt.hashSync('Owner@123', 10);
    const userHash = bcrypt.hashSync('User@123', 10);

    const insertUser = db.prepare(
      'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)'
    );

    insertUser.run('System Administrator Demo', 'admin@example.com', adminHash, '123 Admin Street, New Delhi, India', 'ADMIN');
    insertUser.run('Demo Store Owner Account', 'owner@example.com', ownerHash, '456 Owner Avenue, Mumbai, India', 'STORE_OWNER');
    insertUser.run('Normal User Demo Account', 'user@example.com', userHash, '789 User Lane, Pune, India', 'NORMAL_USER');
    insertUser.run('Second Store Owner Demo', 'owner2@example.com', ownerHash, '321 Commerce Road, Bangalore, India', 'STORE_OWNER');
    insertUser.run('Another Normal User Demo', 'user2@example.com', userHash, '654 Second Street, Chennai, India', 'NORMAL_USER');

    const insertStore = db.prepare(
      'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)'
    );
    insertStore.run('ABC Supermarket Premium', 'abc@example.com', 'MG Road, Pune, Maharashtra', 2);
    insertStore.run('XYZ Electronics Store', 'xyz@example.com', 'Andheri West, Mumbai, Maharashtra', 2);
    insertStore.run('Fresh Groceries Outlet', 'fresh@example.com', 'Koramangala, Bangalore, Karnataka', 4);

    const insertRating = db.prepare(
      'INSERT INTO ratings (user_id, store_id, rating) VALUES (?, ?, ?)'
    );
    insertRating.run(3, 1, 4);
    insertRating.run(3, 2, 5);
    insertRating.run(5, 1, 3);
    insertRating.run(5, 3, 4);

    console.log('[SQLite] Demo data seeded successfully.');
  }

  dbInstance = db;
  return dbInstance;
}

/**
 * Execute query with mysql2-compatible return format: [rows, fields]
 */
async function sqliteQuery(sql, params = []) {
  const db = getSqliteDatabase();
  const trimmed = sql.trim();

  // Normalize MySQL syntax to SQLite if needed
  let normalizedSql = trimmed.replace(/INSERT IGNORE INTO/gi, 'INSERT OR IGNORE INTO');

  // Check query type
  const isSelect = /^SELECT\b/i.test(normalizedSql);

  const stmt = db.prepare(normalizedSql);

  if (isSelect) {
    const rows = stmt.all(...params);
    return [rows, []];
  } else {
    const info = stmt.run(...params);
    const result = {
      insertId: Number(info.lastInsertRowid || 0),
      affectedRows: info.changes || 0,
      changedRows: info.changes || 0,
    };
    return [result, []];
  }
}

module.exports = {
  getSqliteDatabase,
  sqliteQuery,
};
