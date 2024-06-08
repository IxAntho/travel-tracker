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

// Global variable to store the countries (or use session storage)
let selectedCountries = [];
let currentUser;

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const userId = req.query.userId; // Get the user ID from the query param

  // If userId is present, use selectedCountries; otherwise, use an empty array
  const codes = userId ? selectedCountries : [];

  const usersData = await db.query("SELECT * FROM users");
  const users = usersData.rows;

  const color = userId ? users[userId - 1].color : "teal";

  const errorMessage = req.query.error;

  res.render("index.ejs", {
    countries: codes,
    total: codes.length,
    error: errorMessage,
    users: users,
    color: color,
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
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [countryName.toLowerCase()]
    );

    if (countryCodeRow.rows.length === 0) {
      return res.redirect("/?error=Country not found in the database");
    }

    const countryCode = countryCodeRow.rows[0].country_code;

    // Check if the country code already exists in the visited_countries table
    const existingCountryRow = await db.query(
      "SELECT country_code FROM users JOIN visited_countries ON users.id = visited_countries.user_id WHERE visited_countries.country_code = $1",
      [currentUser]
    );

    const existingCountries = existingCountryRow.rows.map(
      (row) => row.country_code
    );
    const countryAlrdVisited = existingCountries.find(
      (country) => country === `${countryCode}`
    );
    if (countryAlrdVisited != undefined) {
      // Country code already exists in the visited_countries table
      return res.redirect("/?error=Country has already been visited");
    }

    // Insert the country code into the visited_countries table
    await db.query(
      "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
      [countryCode, currentUser]
    );

    res.redirect(`/user?user=${currentUser}`);
  } catch (err) {
    console.error("Error adding country:", err);
    res.redirect("/?error=An error occurred while adding the country");
  }
});

app
  .route("/user")
  .get(async (req, res) => {
    const userId = req.query.user;
    if (userId) {
      currentUser = userId;

      const result = await db.query(
        "SELECT country_code FROM users JOIN visited_countries ON $1 = visited_countries.user_id GROUP BY country_code",
        [userId]
      );

      selectedCountries = result.rows.map((row) => row.country_code);

      // Redirect to the root route with userId
      res.redirect(`/?userId=${userId}`);
    } else {
      // Handle case when no user is provided
      res.redirect("/?error=No user specified");
    }
  })
  .post(async (req, res) => {
    if (req.body.user) {
      const userId = req.body.user;
      currentUser = userId;

      const result = await db.query(
        "SELECT country_code FROM users JOIN visited_countries ON $1 = visited_countries.user_id GROUP BY country_code",
        [userId]
      );

      selectedCountries = result.rows.map((row) => row.country_code);

      // Redirect to the root route with userId
      res.redirect(`/?userId=${userId}`);
    } else if (req.body.add) {
      console.log("Adding new family member");
      // Handle adding a new family member
      res.render("new.ejs");
    } else {
      // Handle case when no user is provided
      res.redirect("/?error=No user specified");
    }
  });

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  try {
    const result = await db.query(
      "INSERT INTO users (name, color) VALUES ($1, $2) RETURNING *;",
      [req.body.name, req.body.color]
    );
    const newUser = result.rows[0];
    res.redirect(`/?userId=${newUser.id}`);
  } catch (err) {
    console.error("Error adding family member:", err);
    res.redirect("/?error=An error occurred while adding a new family member");
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
