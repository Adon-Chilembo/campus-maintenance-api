// Record routes, mounted at /api/records in server.js.
const router = require("express").Router();
const db = require("../db");

const STATUSES = ["Pending", "In progress", "Completed"];

const RULES = [
  { field: "title", label: "Title", min: 3, max: 80 },
  { field: "category", label: "Category", min: 2, max: 40 },
  { field: "description", label: "Description", min: 5, max: 300 }
];

const COLUMNS = "id, title, category, description, status";

// Error that carries an HTTP status code to the error handler.
function httpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

// The id in the URL must be a positive whole number such as 1, 2, 3.
function parseId(raw) {
  if (!/^[1-9]\d*$/.test(raw)) {
    throw httpError(400, "Id must be a positive whole number.");
  }
  const id = Number(raw);
  if (!Number.isSafeInteger(id)) {
    throw httpError(400, "Id must be a positive whole number.");
  }
  return id;
}

// Check the body sent by POST and PUT. Returns the four trimmed values.
// Any id in the body is ignored: the database generates ids.
function validateRecord(body) {
  if (body === null || typeof body !== "object" || Array.isArray(body)) {
    throw httpError(400, "Request body must be a JSON object with title, category, description and status.");
  }

  const record = {};
  for (const { field, label, min, max } of RULES) {
    const value = body[field];
    if (value === undefined || value === null) {
      throw httpError(400, `${label} is required.`);
    }
    if (typeof value !== "string") {
      throw httpError(400, `${label} must be text.`);
    }
    const trimmed = value.trim();
    if (trimmed.length < min || trimmed.length > max) {
      throw httpError(400, `${label} must have ${min} to ${max} characters.`);
    }
    record[field] = trimmed;
  }

  if (body.status === undefined || body.status === null) {
    throw httpError(400, "Status is required.");
  }
  if (typeof body.status !== "string") {
    throw httpError(400, "Status must be text.");
  }
  const status = body.status.trim();
  if (!STATUSES.includes(status)) {
    throw httpError(400, `Status must be one of: ${STATUSES.join(", ")}.`);
  }
  record.status = status;

  return record;
}

// Turn a database row into a plain object with a number id.
function toRecord(row) {
  return {
    id: Number(row.id),
    title: row.title,
    category: row.category,
    description: row.description,
    status: row.status
  };
}

// GET /api/records  -> all records
router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(`SELECT ${COLUMNS} FROM records ORDER BY id`);
    res.status(200).json(result.rows.map(toRecord));
  } catch (error) {
    next(error);
  }
});

// GET /api/records/:id  -> one record
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const result = await db.query(`SELECT ${COLUMNS} FROM records WHERE id = ?`, [id]);
    if (result.rows.length === 0) {
      throw httpError(404, `Record ${id} was not found.`);
    }
    res.status(200).json(toRecord(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

// POST /api/records  -> create a record
router.post("/", async (req, res, next) => {
  try {
    const r = validateRecord(req.body);
    const result = await db.query(
      `INSERT INTO records (title, category, description, status) VALUES (?, ?, ?, ?) RETURNING ${COLUMNS}`,
      [r.title, r.category, r.description, r.status]
    );
    res.status(201).json(toRecord(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

// PUT /api/records/:id  -> replace the four editable fields (does not create missing records)
router.put("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const r = validateRecord(req.body);
    const result = await db.query(
      `UPDATE records SET title = ?, category = ?, description = ?, status = ? WHERE id = ? RETURNING ${COLUMNS}`,
      [r.title, r.category, r.description, r.status, id]
    );
    if (result.rows.length === 0) {
      throw httpError(404, `Record ${id} was not found.`);
    }
    res.status(200).json(toRecord(result.rows[0]));
  } catch (error) {
    next(error);
  }
});

// DELETE /api/records/:id  -> delete a record
router.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const result = await db.query("DELETE FROM records WHERE id = ? RETURNING id", [id]);
    if (result.rows.length === 0) {
      throw httpError(404, `Record ${id} was not found.`);
    }
    res.status(200).json({ message: "Record deleted." });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
module.exports.STATUSES = STATUSES;
