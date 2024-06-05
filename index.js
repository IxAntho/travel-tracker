import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();
const password = process.env.PASSWORD;

const app = express();
const port = 3000;
let data = [];

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "U-postgres",
  password: `${password}`,
  port: 5432,
});

db.connect();

db.query("SELECT * FROM visited_countries", (err, res) => {
  if (err) {
    console.error("Error executing query: ", err.stack);
  } else {
    data = res.rows;
  }

  db.end();
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  res.render("index.ejs", { countries: data });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
