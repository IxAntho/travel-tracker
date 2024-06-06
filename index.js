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

  // Pass the error message from the query parameter to the EJS template
  const errorMessage = req.query.error;

  res.render("index.ejs", {
    countries: codes,
    total: codes.length,
    error: errorMessage,
  });
});

app.post("/add", async (req, res) => {
  try {
    const countryName = req.body.country;

    // Check if the country name is provided
    if (!countryName) {
      return res.redirect("/?error=Please provide a country name");
    }

    // Check if the country exists in the database
    const countryCodeRow = await db.query(
      `SELECT country_code FROM countries WHERE country_name = $1`,
      [countryName]
    );

    if (countryCodeRow.rows.length === 0) {
      return res.redirect("/?error=Country not found in the database");
    }

    const countryCode = countryCodeRow.rows[0].country_code;

    // Check if the country code already exists in the visited_countries table
    const existingCountryRow = await db.query(
      `SELECT * FROM visited_countries WHERE country_code = $1`,
      [countryCode]
    );

    if (existingCountryRow.rows.length > 0) {
      // Country code already exists in the visited_countries table
      return res.redirect("/?error=Country has already been visited");
    }

    // Insert the country code into the visited_countries table
    await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [
      countryCode,
    ]);

    res.redirect("/");
  } catch (err) {
    console.error("Error adding country:", err);
    res.redirect("/?error=An error occurred while adding the country");
  }
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
