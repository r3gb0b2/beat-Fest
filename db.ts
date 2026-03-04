import sqlite3 from 'better-sqlite3';
import path from 'path';

const db = new sqlite3('beatfest.db');

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS states (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    cover_image TEXT,
    banner_desktop TEXT,
    banner_mobile TEXT,
    event_date TEXT,
    sales_location TEXT,
    active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_id INTEGER,
    whatsapp TEXT,
    email TEXT,
    dob TEXT,
    instagram TEXT,
    tiktok TEXT,
    profession TEXT,
    education TEXT,
    cpf TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (state_id) REFERENCES states(id)
  );

  CREATE TABLE IF NOT EXISTS carousel_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    state_id INTEGER,
    image_url TEXT,
    FOREIGN KEY (state_id) REFERENCES states(id)
  );
`);

export default db;
