// Campus Maintenance Requests API — ICT251 Activity 7
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");
const renderGuide = require("./guide");

const app = express();

// Render sits behind a proxy; this makes req.protocol report "https" correctly.
app.set("trust proxy", 1);

// Browser origins allowed to call the API (comma-separated in CLIENT_ORIGINS).
const origins = (process.env.CLIENT_ORIGINS || "")
  .split(",").map((value) => value.trim()).filter(Boolean);
app.use(cors({ origin: origins }));
app.use(express.json());

// GET /  -> API guide for the marker
app.get("/", (req, res) => {
  const baseUrl = `${req.protocol}://${req.get("host")}`;
  res.status(200).type("html").send(renderGuide(baseUrl));
});

// GET /health  -> check the server and the database
app.get("/health", async (req, res) => {
  try {
    const result = await db.query("SELECT COUNT(*) AS total FROM records");
    res.status(200).json({
      status: "ok",
      database: "connected",
      records: Number(result.rows[0].total),
      time: new Date().toISOString()
    });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(503).json({ status: "error", database: "unavailable", message: "The database is not responding." });
  }
});

// Record routes
app.use("/api/records", require("./routes/records"));

// Unknown routes -> 404 JSON
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} does not exist. See / for the API guide.` });
});

// Error handler (four parameters). Malformed JSON -> 400, our own errors keep their status,
// anything unexpected -> 500 with details logged on the server only.
// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Malformed JSON in the request body." });
  }
  if (error.type === "entity.too.large") {
    return res.status(413).json({ message: "Request body is too large." });
  }
  if (error.status && error.status >= 400 && error.status < 500) {
    return res.status(error.status).json({ message: error.message });
  }
  console.error(`Unexpected error on ${req.method} ${req.originalUrl}:`, error);
  res.status(500).json({ message: "An unexpected server error occurred. Please try again." });
});

const port = process.env.PORT || 3000;

db.initDatabase()
  .then(() => console.log("Database ready."))
  .catch((error) => console.error("Database setup failed:", error))
  .finally(() => {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server listening on port ${port}`);
    });
  });
