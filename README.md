# Travel Tracker

Travel Tracker is a web application that allows users to keep track of the countries they've visited. Users can add countries to their list, view their visited countries, and manage multiple users (like family members) with different color themes.

## Features

- Add countries to your visited list
- View the total number of countries visited
- Manage multiple users (e.g., family members)
- Each user has a unique color theme
- Error handling for invalid inputs or duplicate entries

## Technologies Used

- **Backend**: Node.js with Express.js
- **Frontend**: EJS (Embedded JavaScript) templates
- **Database**: PostgreSQL
- **ORM**: `pg` (node-postgres)
- **Environment**: dotenv for managing environment variables

## Getting Started

### Prerequisites

- Node.js (v14 or higher recommended)
- PostgreSQL

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/yourusername/travel-tracker.git
   cd travel-tracker
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Create a `.env` file in the root directory and add your PostgreSQL password:
   ```
   PASSWORD=your_postgres_password
   ```

### Database Setup

1. Create a PostgreSQL database named `U-postgres`.

2. Set up the tables:

   ```sql
   -- Users Table
   CREATE TABLE users (
     id SERIAL PRIMARY KEY,
     name TEXT,
     color TEXT
   );

   -- Countries Table
   CREATE TABLE countries (
     id SERIAL PRIMARY KEY,
     country_code CHAR(2),
     country_name TEXT
   );

   -- Visited Countries Table
   CREATE TABLE visited_countries (
     id SERIAL PRIMARY KEY,
     country_code CHAR(2),
     user_id INTEGER REFERENCES users(id)
   );
   ```

3. Import countries data:
   - Ensure you have a `countries.csv` file with columns `country_code` and `country_name`.
   - Import the data into the `countries` table:
     ```sql
     COPY countries(country_code, country_name)
     FROM '/path/to/your/countries.csv'
     DELIMITER ','
     CSV HEADER;
     ```

### Running the Application

1. Start the server:

   ```
   node index.js
   ```

2. Open your browser and navigate to `http://localhost:3000`.

## How It Works

1. **Home Page (`/`)**: Displays the list of visited countries for the selected user, total countries visited, and a form to add new countries. Users can also switch between different family members or add a new one.

2. **Adding a Country (`POST /add`)**: When a user submits a country name, the app checks if it exists in the `countries` table. If it does and hasn't been visited by the current user, it's added to `visited_countries`.

3. **User Management (`GET/POST /user`)**:

   - `GET /user?user=<id>`: Fetches visited countries for the user and redirects to the home page.
   - `POST /user`: If a user is selected, it does the same as GET. If "Add Family Member" is clicked, it renders the `new.ejs` form.

4. **Adding a Family Member (`POST /new`)**: Adds a new user to the `users` table with a name and color theme.

## Code Overview

- `index.js`: The main server file. It sets up Express routes, handles database queries, and manages session data.
- `views/index.ejs`: The main view. It displays the list of countries, user selection, and forms.
- `views/new.ejs`: Form for adding a new family member.
- `public/`: Contains static files like stylesheets.

## Database Schema

1. **users**:

   - `id`: User's unique identifier.
   - `name`: User's name.
   - `color`: User's theme color.

2. **countries**:

   - `id`: Country's unique identifier.
   - `country_code`: ISO 3166-1 alpha-2 country code.
   - `country_name`: Full name of the country.

3. **visited_countries**:
   - `id`: Visit record's unique identifier.
   - `country_code`: ISO 3166-1 alpha-2 country code.
   - `user_id`: Foreign key referencing `users.id`.

This schema allows for:

- Multiple users with unique colors.
- A list of all countries with their codes.
- Tracking which user has visited which countries.

## Contributing

Feel free to fork this repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](https://choosealicense.com/licenses/mit/)
