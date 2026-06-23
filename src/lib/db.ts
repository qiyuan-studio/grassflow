import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "grassflow.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const fs = require("fs");
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initTables(db);
  }
  return db;
}

function initTables(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      plan TEXT NOT NULL DEFAULT 'free',
      license_key TEXT UNIQUE,
      expires_at TEXT,
      max_generations INTEGER DEFAULT 3,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS contents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      platform TEXT NOT NULL,
      topic TEXT NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      hashtags TEXT DEFAULT '',
      tokens_used INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS generation_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip TEXT NOT NULL,
      user_id INTEGER,
      platform TEXT NOT NULL,
      count INTEGER DEFAULT 1,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

// User operations
export function createUser(email: string, password: string) {
  const db = getDb();
  const stmt = db.prepare(
    "INSERT INTO users (email, password) VALUES (?, ?)"
  );
  const result = stmt.run(email, password);
  
  // Create free subscription for new user
  const subStmt = db.prepare(
    "INSERT INTO subscriptions (user_id, plan, max_generations) VALUES (?, 'free', 3)"
  );
  subStmt.run(result.lastInsertRowid);
  
  return result.lastInsertRowid;
}

export function getUserByEmail(email: string) {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
}

export function getUserById(id: number) {
  const db = getDb();
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
}

// Subscription operations
export function getSubscription(userId: number) {
  const db = getDb();
  return db.prepare("SELECT * FROM subscriptions WHERE user_id = ?").get(userId);
}

export function createLicenseKey(userId: number, plan: string) {
  const db = getDb();
  const { v4: uuidv4 } = require("uuid");
  const licenseKey = `GF-${plan.toUpperCase()}-${uuidv4().split("-").slice(0, 2).join("").toUpperCase()}`;
  
  const expiresAt = plan === "monthly" 
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    : "2099-12-31"; // permanent

  const maxGen = plan === "monthly" ? 999 : 9999;

  db.prepare(`
    UPDATE subscriptions 
    SET plan = ?, license_key = ?, expires_at = ?, max_generations = ?
    WHERE user_id = ?
  `).run(plan, licenseKey, expiresAt, maxGen, userId);

  return { licenseKey, expiresAt, plan };
}

// Content operations
export function saveContent(
  userId: number | null,
  platform: string,
  topic: string,
  title: string,
  content: string,
  hashtags: string[],
  tokensUsed: number
) {
  const db = getDb();
  db.prepare(`
    INSERT INTO contents (user_id, platform, topic, title, content, hashtags, tokens_used)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(userId, platform, topic, title, content, JSON.stringify(hashtags), tokensUsed);
}

export function getContentHistory(userId: number, limit = 20) {
  const db = getDb();
  return db.prepare(`
    SELECT * FROM contents WHERE user_id = ? ORDER BY created_at DESC LIMIT ?
  `).all(userId, limit);
}

// Generation log (rate limiting)
export function logGeneration(ip: string, userId: number | null, platform: string, count: number) {
  const db = getDb();
  db.prepare(
    "INSERT INTO generation_logs (ip, user_id, platform, count) VALUES (?, ?, ?, ?)"
  ).run(ip, userId, platform, count);
}

export function getGenerationCountToday(ip: string): number {
  const db = getDb();
  const row = db.prepare(`
    SELECT COALESCE(SUM(count), 0) as total FROM generation_logs 
    WHERE ip = ? AND date(created_at) = date('now')
  `).get(ip) as { total: number };
  return row.total;
}

export function getUserGenerationCountToday(userId: number): number {
  const db = getDb();
  const row = db.prepare(`
    SELECT COALESCE(SUM(count), 0) as total FROM generation_logs 
    WHERE user_id = ? AND date(created_at) = date('now')
  `).get(userId) as { total: number };
  return row.total;
}
