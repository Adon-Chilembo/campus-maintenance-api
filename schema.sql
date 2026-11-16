-- Campus Maintenance Requests: database tables (SQLite / Turso).
-- Safe to run on every start: IF NOT EXISTS leaves existing data alone.

-- One row per maintenance request. AUTOINCREMENT means an id is never reused,
-- even after the record with the highest id is deleted.
CREATE TABLE IF NOT EXISTS records (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  title       TEXT NOT NULL CHECK (length(title) BETWEEN 3 AND 80),
  category    TEXT NOT NULL CHECK (length(category) BETWEEN 2 AND 40),
  description TEXT NOT NULL CHECK (length(description) BETWEEN 5 AND 300),
  status      TEXT NOT NULL CHECK (status IN ('Pending', 'In progress', 'Completed'))
);

-- Remembers that the starting records were inserted, so they are only added once.
CREATE TABLE IF NOT EXISTS app_meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
