/**
 * Seed Script
 * Generates proper bcrypt hashes and inserts demo data into the database.
 * Run with: npm run seed
 */
require('dotenv').config();

const bcrypt = require('bcryptjs');
const db = require('./config/db');

async function seed() {
  try {
    console.log('Seeding database...');

    // Hash demo passwords
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const ownerHash = await bcrypt.hash('Owner@123', 10);
    const userHash = await bcrypt.hash('User@123', 10);

    // Insert demo users
    await db.query(`
      INSERT IGNORE INTO users (name, email, password, address, role) VALUES
      ('System Administrator Demo', 'admin@example.com', ?, '123 Admin Street, New Delhi, India', 'ADMIN'),
      ('Demo Store Owner Account', 'owner@example.com', ?, '456 Owner Avenue, Mumbai, India', 'STORE_OWNER'),
      ('Normal User Demo Account', 'user@example.com', ?, '789 User Lane, Pune, India', 'NORMAL_USER'),
      ('Second Store Owner Demo', 'owner2@example.com', ?, '321 Commerce Road, Bangalore, India', 'STORE_OWNER'),
      ('Another Normal User Demo', 'user2@example.com', ?, '654 Second Street, Chennai, India', 'NORMAL_USER')
    `, [adminHash, ownerHash, userHash, ownerHash, userHash]);

    console.log('Users seeded.');

    // Insert demo stores
    await db.query(`
      INSERT IGNORE INTO stores (name, email, address, owner_id) VALUES
      ('ABC Supermarket Premium', 'abc@example.com', 'MG Road, Pune, Maharashtra', 2),
      ('XYZ Electronics Store', 'xyz@example.com', 'Andheri West, Mumbai, Maharashtra', 2),
      ('Fresh Groceries Outlet', 'fresh@example.com', 'Koramangala, Bangalore, Karnataka', 4)
    `);

    console.log('Stores seeded.');

    // Insert demo ratings
    await db.query(`
      INSERT IGNORE INTO ratings (user_id, store_id, rating) VALUES
      (3, 1, 4),
      (3, 2, 5),
      (5, 1, 3),
      (5, 3, 4)
    `);

    console.log('Ratings seeded.');
    console.log('Database seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
