import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const password = process.env.PASSWORD;

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "U-postgres",
  password: `${password}`,
  port: 5432,
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const result = await db.query("SELECT country_code FROM visited_countries");

  const codes = result.rows.map((country) => country.country_code);

  res.render("index.ejs", { countries: codes, total: codes.length });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

// Close the database connection when the process is exiting
process.on("exit", () => {
  db.end();
});

// Close the database connection when the server is stopping
process.on("SIGINT", () => {
  db.end();
  process.exit();
});
