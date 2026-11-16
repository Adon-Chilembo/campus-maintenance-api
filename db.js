// Database connection for the Campus Maintenance Requests API.
//
// Uses libSQL, which is SQLite:
//   - Locally (no TURSO_DATABASE_URL set) it uses the SQLite file local.db in this folder.
//   - Online it connects to a hosted Turso SQLite database, so records survive
//     Render restarts (Render's own disk is wiped whenever the service restarts).
const fs = require("fs");
const path = require("path");
const { createClient } = require("@libsql/client");

const client = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:local.db",
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Run a query with ? placeholders and an array of values.
// Values are sent separately from the SQL text, so user input can never change the query.
async function query(sql, args = []) {
  return client.execute({ sql, args });
}

// Split a .sql file into separate statements (ignores -- comments).
function readStatements(fileName) {
  return fs
    .readFileSync(path.join(__dirname, fileName), "utf8")
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n")
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

// Create the tables, then insert the starting records once.
// The "seeded" flag means deleting every record does not bring the starting records back.
async function initDatabase() {
  await client.batch(readStatements("schema.sql"), "write");

  const flag = await query("SELECT value FROM app_meta WHERE key = 'seeded'");
  if (flag.rows.length === 0) {
    await client.batch(
      [
        ...readStatements("seed.sql"),
        "INSERT INTO app_meta (key, value) VALUES ('seeded', datetime('now'))"
      ],
      "write"
    );
    console.log("Inserted the starting records.");
  }
}

module.exports = { query, initDatabase };
