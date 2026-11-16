// HTML API guide shown at GET /  (documentation for the marker).
function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

const SAMPLE_BODY = `{
  "title": "Broken classroom light",
  "category": "Electrical",
  "description": "The light in Room B12 does not switch on.",
  "status": "Pending"
}`;

const PUT_BODY = `{
  "title": "Broken classroom light",
  "category": "Electrical",
  "description": "The light in Room B12 does not switch on. Bulb ordered.",
  "status": "In progress"
}`;

module.exports = function renderGuide(rawBaseUrl) {
  const base = escapeHtml(rawBaseUrl);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Campus Maintenance Requests API</title>
<style>
  :root {
    color-scheme: dark;
    --blue: #123fdc; --red: #f20d1d; --bg: #0a0d22; --ink: #eef1fa; --heading: #fff;
    --muted: #c3cbe2; --link: #aebcff; --glass: rgba(14, 20, 48, .62);
    --border: rgba(255, 255, 255, .2); --code: rgba(0, 0, 0, .35);
    --green: #7be0ad; --amber: #f5c868; --redink: #ff9a9f;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; font-family: "Segoe UI", system-ui, -apple-system, Roboto, sans-serif; line-height: 1.55;
    color: var(--ink);
    background:
      radial-gradient(60vw 50vh at 10% 0%, rgba(18, 63, 220, .45), transparent 70%),
      radial-gradient(50vw 45vh at 95% 30%, rgba(242, 13, 29, .25), transparent 70%),
      var(--bg);
    background-attachment: fixed;
  }
  main { max-width: 960px; margin: 0 auto; padding: 32px 16px 56px; }
  h1, h2 { color: var(--heading); line-height: 1.25; }
  h1 { font-size: clamp(1.7rem, 5vw, 2.4rem); margin: 0 0 8px; }
  h2 { display: flex; align-items: center; gap: 10px; font-size: 1.25rem; margin: 0 0 14px; }
  h2::before { content: ""; width: 18px; height: 4px; border-radius: 2px; background: var(--red); }
  a { color: var(--link); }
  a:focus-visible { outline: 3px solid var(--link); outline-offset: 2px; }
  .card {
    background: var(--glass); border: 1px solid var(--border); border-radius: 18px;
    padding: 22px; margin-top: 18px; box-shadow: 0 14px 34px -14px rgba(0, 0, 0, .7);
  }
  .eyebrow {
    display: inline-block; padding: 4px 14px; border-radius: 999px; border: 1px solid var(--border);
    font-size: .78rem; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; margin: 0 0 12px;
  }
  .lead { color: var(--muted); margin: 0; }
  .meta { display: grid; grid-template-columns: max-content 1fr; gap: 6px 18px; margin: 16px 0 0; }
  .meta dt { font-weight: 700; color: var(--heading); }
  .meta dd { margin: 0; color: var(--muted); overflow-wrap: anywhere; }
  .links { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 16px; }
  .btn {
    display: inline-block; padding: 9px 18px; border-radius: 14px; font-weight: 700; text-decoration: none;
    color: #fff; background: var(--blue);
    box-shadow: 0 10px 16px -8px rgba(18, 63, 220, .7), inset 0 -5px 8px rgba(0, 0, 0, .22), inset 0 5px 8px rgba(255, 255, 255, .3);
  }
  .btn.red { background: var(--red); box-shadow: 0 10px 16px -8px rgba(242, 13, 29, .6), inset 0 -5px 8px rgba(0, 0, 0, .22), inset 0 5px 8px rgba(255, 255, 255, .3); }
  .table-wrap { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: .95rem; }
  th, td { text-align: left; padding: 9px 10px; border-bottom: 1px solid var(--border); vertical-align: top; }
  th { color: var(--heading); }
  td { color: var(--muted); }
  code, pre { font-family: Consolas, "Cascadia Mono", monospace; }
  code { background: var(--code); padding: 1px 6px; border-radius: 6px; color: var(--ink); }
  pre { background: var(--code); padding: 14px; border-radius: 12px; overflow-x: auto; margin: 8px 0 0; color: var(--ink); white-space: pre-wrap; overflow-wrap: anywhere; }
  .method { font-weight: 800; font-family: Consolas, monospace; }
  .get { color: var(--green); } .post { color: var(--amber); } .put { color: var(--link); } .delete { color: var(--redink); }
  .grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 340px), 1fr)); gap: 16px; }
  .grid2 > div { min-width: 0; }
  p code, dd code { overflow-wrap: anywhere; }
  .note { border-left: 5px solid var(--amber); }
  footer { text-align: center; color: var(--muted); font-size: .85rem; margin-top: 28px; }
  @media (max-width: 640px) {
    .meta { grid-template-columns: 1fr; }
    .meta dd { margin-bottom: 8px; }
  }
</style>
</head>
<body>
<main>
  <section class="card">
    <p class="eyebrow">ICT251 · Activity 7 · REST API</p>
    <h1>Campus Maintenance Requests API</h1>
    <p class="lead">
      A Node.js and Express backend for reporting and tracking campus maintenance problems such as broken lights,
      leaking taps and damaged furniture. Records are stored in an SQLite database (hosted on Turso) and each one moves
      from <b>Pending</b> to <b>In progress</b> to <b>Completed</b>.
    </p>
    <dl class="meta">
      <dt>Project name</dt><dd>Campus Maintenance Requests</dd>
      <dt>Student number</dt><dd>202507691</dd>
      <dt>Live API base URL</dt><dd><code>${base}</code></dd>
    </dl>
    <div class="links">
      <a class="btn" href="${base}/health">Check /health</a>
      <a class="btn red" href="${base}/api/records">View /api/records</a>
    </div>
  </section>

  <section class="card note">
    <h2>Before you test</h2>
    <p class="lead">
      This service runs on Render's free plan, which pauses when idle. If the first request is slow,
      wait up to a minute for the service to start, then try again.
      GET requests work in a browser address bar; POST, PUT and DELETE need an API client such as Postman,
      with a raw JSON body and the header <code>Content-Type: application/json</code>.
    </p>
  </section>

  <section class="card">
    <h2>Routes</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Method</th><th>Route</th><th>Purpose</th><th>Success</th></tr></thead>
        <tbody>
          <tr><td class="method get">GET</td><td><a href="${base}/"><code>/</code></a></td><td>This API guide</td><td>200 HTML</td></tr>
          <tr><td class="method get">GET</td><td><a href="${base}/health"><code>/health</code></a></td><td>Check that the server and database respond</td><td>200 JSON</td></tr>
          <tr><td class="method get">GET</td><td><a href="${base}/api/records"><code>/api/records</code></a></td><td>Read all records (<code>[]</code> when there are none)</td><td>200 array</td></tr>
          <tr><td class="method get">GET</td><td><a href="${base}/api/records/1"><code>/api/records/:id</code></a></td><td>Read one record</td><td>200 record</td></tr>
          <tr><td class="method post">POST</td><td><code>/api/records</code></td><td>Create a record (the id is generated by the database)</td><td>201 new record</td></tr>
          <tr><td class="method put">PUT</td><td><code>/api/records/:id</code></td><td>Replace all four editable fields (does not create missing records)</td><td>200 updated record</td></tr>
          <tr><td class="method delete">DELETE</td><td><code>/api/records/:id</code></td><td>Delete a record</td><td>200 <code>{"message":"Record deleted."}</code></td></tr>
        </tbody>
      </table>
    </div>
  </section>

  <section class="card">
    <h2>Record fields</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Field</th><th>Rule</th></tr></thead>
        <tbody>
          <tr><td><code>id</code></td><td>Positive whole number generated by the database. Do not send it; any id in the body is ignored.</td></tr>
          <tr><td><code>title</code></td><td>Text, 3 to 80 characters after trimming spaces</td></tr>
          <tr><td><code>category</code></td><td>Text, 2 to 40 characters (e.g. Electrical, Plumbing, Furniture, Carpentry, Roofing, Grounds)</td></tr>
          <tr><td><code>description</code></td><td>Text, 5 to 300 characters</td></tr>
          <tr><td><code>status</code></td><td>Exactly one of <code>Pending</code>, <code>In progress</code>, <code>Completed</code></td></tr>
        </tbody>
      </table>
    </div>
    <div class="grid2">
      <div>
        <p><b>Valid POST body</b> → <code>POST ${base}/api/records</code></p>
        <pre>${escapeHtml(SAMPLE_BODY)}</pre>
      </div>
      <div>
        <p><b>Valid PUT body</b> → <code>PUT ${base}/api/records/1</code></p>
        <pre>${escapeHtml(PUT_BODY)}</pre>
      </div>
    </div>
  </section>

  <section class="card">
    <h2>Status codes</h2>
    <div class="table-wrap">
      <table>
        <thead><tr><th>Code</th><th>Meaning</th></tr></thead>
        <tbody>
          <tr><td>200</td><td>Success for GET, PUT and DELETE</td></tr>
          <tr><td>201</td><td>Record created by POST</td></tr>
          <tr><td>400</td><td>Invalid input, invalid id (not a positive whole number) or malformed JSON</td></tr>
          <tr><td>404</td><td>The record or the route does not exist</td></tr>
          <tr><td>500</td><td>Unexpected server failure</td></tr>
          <tr><td>503</td><td><code>/health</code> only: the database is not responding</td></tr>
        </tbody>
      </table>
    </div>
    <p>Every error returns JSON with a <code>message</code> field, for example:</p>
    <pre>{"message":"Title must have 3 to 80 characters."}</pre>
  </section>

  <footer>Campus Maintenance Requests API · Student 202507691 · Made-up demonstration data</footer>
</main>
</body>
</html>`;
};
