import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Ensure data directory exists
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.resolve(dataDir, 'knock.db');
export const db = new sqlite3.Database(dbPath);

export function initDb() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        device_name TEXT,
        device_type TEXT,
        accelerometer_model TEXT,
        connection_status TEXT,
        last_seen DATETIME,
        sensitivity INTEGER DEFAULT 50,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        name TEXT,
        icon TEXT,
        is_default BOOLEAN DEFAULT 0,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS actions (
        id TEXT PRIMARY KEY,
        profile_id TEXT,
        tap_pattern TEXT,
        action_type TEXT,
        action_config TEXT,
        conditions TEXT,
        sequence_order INTEGER DEFAULT 0,
        enabled BOOLEAN DEFAULT 1,
        FOREIGN KEY(profile_id) REFERENCES profiles(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS tap_events (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        device_id TEXT,
        action_id TEXT,
        tap_pattern TEXT,
        intensity REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        success BOOLEAN,
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(device_id) REFERENCES devices(id),
        FOREIGN KEY(action_id) REFERENCES actions(id)
      )
    `);
    
    console.log('SQLite database schema initialized.');
  });
}
