const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const express = require("express");

const app = express();
const port = 3000;
const apiKey = "c4game";

app.use(express.static("public"));
app.use(express.json());

let db;
(async () => {
  db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  await db.run(`
CREATE TABLE IF NOT EXISTS data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  content TEXT NOT NULL
)`);
})();

app.get("/api/ping", (_req, res) => {
  res.status(200).end();
});

app.put("/api/data/save", (req, res) => {
  if (req.query['api-key'] !== apiKey) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { content } = req.body;
  db.run("INSERT INTO data (content) VALUES (?)", [content]).then(() => {
    res.status(200).json({ message: "Data saved successfully" });
  });
});

app.get("/api/data/load", (_req, res) => {
  db.get("SELECT content FROM data ORDER BY id DESC LIMIT 1").then((row) => {
    if (row) {
      res.status(200).json({ content: row.content });
    } else {
      res.status(404).json({ message: "No data found" });
    }
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
