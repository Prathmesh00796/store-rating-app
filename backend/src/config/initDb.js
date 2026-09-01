const bcrypt = require('bcryptjs');

/**
 * Automatically initializes MySQL tables and seeds initial demo data if empty.
 */
async function initDb(db) {
  try {
    if (db.isSqlite) {
      // SQLite is already auto-initialized by sqliteDb.js
      return;
    }

    console.log('[DB] Checking MySQL tables...');

    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400),
        role ENUM('ADMIN', 'NORMAL_USER', 'STORE_OWNER') NOT NULL DEFAULT 'NORMAL_USER',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT chk_name_length CHECK (CHAR_LENGTH(name) >= 20)
      )
    `);

    // Create stores table
    await db.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        address VARCHAR(400),
        owner_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_stores_owner FOREIGN KEY (owner_id) REFERENCES users(id)
          ON DELETE RESTRICT ON UPDATE CASCADE
      )
    `);

    // Create ratings table
    await db.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        store_id INT NOT NULL,
        rating TINYINT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT uq_user_store UNIQUE (user_id, store_id),
        CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5),
        CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_ratings_store FOREIGN KEY (store_id) REFERENCES stores(id)
          ON DELETE CASCADE ON UPDATE CASCADE
      )
    `);

    // Check if demo users exist
    const [rows] = await db.query('SELECT COUNT(*) AS count FROM users');
    const count = rows[0]?.count || 0;

    if (count === 0) {
      console.log('[DB] Seeding MySQL demo users and stores...');
      const adminHash = await bcrypt.hash('Admin@123', 10);
      const ownerHash = await bcrypt.hash('Owner@123', 10);
      const userHash = await bcrypt.hash('User@123', 10);

      await db.query(`
        INSERT IGNORE INTO users (name, email, password, address, role) VALUES
        ('System Administrator Demo', 'admin@example.com', ?, '123 Admin Street, New Delhi, India', 'ADMIN'),
        ('Demo Store Owner Account', 'owner@example.com', ?, '456 Owner Avenue, Mumbai, India', 'STORE_OWNER'),
        ('Normal User Demo Account', 'user@example.com', ?, '789 User Lane, Pune, India', 'NORMAL_USER'),
        ('Second Store Owner Demo', 'owner2@example.com', ?, '321 Commerce Road, Bangalore, India', 'STORE_OWNER'),
        ('Another Normal User Demo', 'user2@example.com', ?, '654 Second Street, Chennai, India', 'NORMAL_USER')
      `, [adminHash, ownerHash, userHash, ownerHash, userHash]);

      await db.query(`
        INSERT IGNORE INTO stores (name, email, address, owner_id) VALUES
        ('ABC Supermarket Premium', 'abc@example.com', 'MG Road, Pune, Maharashtra', 2),
        ('XYZ Electronics Store', 'xyz@example.com', 'Andheri West, Mumbai, Maharashtra', 2),
        ('Fresh Groceries Outlet', 'fresh@example.com', 'Koramangala, Bangalore, Karnataka', 4)
      `);

      await db.query(`
        INSERT IGNORE INTO ratings (user_id, store_id, rating) VALUES
        (3, 1, 4),
        (3, 2, 5),
        (5, 1, 3),
        (5, 3, 4)
      `);
      console.log('[DB] MySQL demo seeding complete.');
    }
  } catch (err) {
    console.warn('[DB] Automatic table init warning:', err.message);
  }
}

module.exports = initDb;
