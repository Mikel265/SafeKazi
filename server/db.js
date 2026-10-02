const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'safekazi.sqlite');
const db = new DatabaseSync(dbPath);

// Enable Foreign Key constraints
db.exec('PRAGMA foreign_keys = ON;');

function run(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const result = stmt.run(...params);
    return Promise.resolve({ id: result.lastInsertRowid, changes: result.changes });
  } catch (err) {
    return Promise.reject(err);
  }
}

function get(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const row = stmt.get(...params);
    return Promise.resolve(row);
  } catch (err) {
    return Promise.reject(err);
  }
}

function all(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const rows = stmt.all(...params);
    return Promise.resolve(rows);
  } catch (err) {
    return Promise.reject(err);
  }
}

async function initDB() {
  // Create Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      amount REAL NOT NULL CHECK(amount > 0),
      client_phone TEXT,
      status TEXT NOT NULL CHECK(status IN ('pending', 'locked', 'released', 'disputed')) DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create Transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      amount REAL NOT NULL CHECK(amount > 0),
      type TEXT NOT NULL CHECK(type IN ('deposit', 'payout')),
      mpesa_receipt TEXT,
      status TEXT NOT NULL DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  // Seed demo freelancer user if empty
  const userCount = await get('SELECT COUNT(*) as count FROM users');
  if (userCount.count === 0) {
    const demoPasswordHash = await bcrypt.hash('password123', 10);
    const demoUserId = 'usr_demo123';
    await run(
      `INSERT INTO users (id, name, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)`,
      [demoUserId, 'Brian Mwangi', 'brian@safekazi.co.ke', '0712345678', demoPasswordHash]
    );

    // Seed initial demo projects
    const prj1 = 'prj_ecommerce_design';
    const prj2 = 'prj_mobile_app_backend';
    const prj3 = 'prj_logo_branding';

    await run(
      `INSERT INTO projects (id, user_id, title, description, amount, client_phone, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-2 days'))`,
      [
        prj1,
        demoUserId,
        'E-Commerce Mobile App Design',
        'UI/UX design system for local online pharmacy startup. Deliverables: Figma files and interactive prototype.',
        45000,
        '0722987654',
        'locked'
      ]
    );

    await run(
      `INSERT INTO transactions (id, project_id, amount, type, mpesa_receipt, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-2 days'))`,
      ['trx_dep_1001', prj1, 45000, 'deposit', 'QJ89X7M2PL', 'completed']
    );

    await run(
      `INSERT INTO projects (id, user_id, title, description, amount, client_phone, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-5 days'))`,
      [
        prj2,
        demoUserId,
        'Node.js REST API & Payment Gateway Integration',
        'Backend integration for M-Pesa STK push and SMS alerts for SME logistics platform.',
        65000,
        '0733112233',
        'released'
      ]
    );

    await run(
      `INSERT INTO transactions (id, project_id, amount, type, mpesa_receipt, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-5 days'))`,
      ['trx_dep_1002', prj2, 65000, 'deposit', 'QI44L9N1AA', 'completed']
    );

    await run(
      `INSERT INTO transactions (id, project_id, amount, type, mpesa_receipt, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now', '-4 days'))`,
      ['trx_pay_1002', prj2, 65000, 'payout', 'QI45K2N9BB', 'completed']
    );

    await run(
      `INSERT INTO projects (id, user_id, title, description, amount, client_phone, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now', '-1 hours'))`,
      [
        prj3,
        demoUserId,
        'Brand Identity & Social Media Banners',
        'Complete brand identity guidelines, logo vectors, and social media promotional templates for Nairobi Coffee Shop.',
        15000,
        '0799887766',
        'pending'
      ]
    );

    console.log('Database initialized and demo data seeded successfully!');
  }
}

module.exports = {
  db,
  run,
  get,
  all,
  initDB
};
