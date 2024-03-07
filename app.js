const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const path = require("path");
const e = require("express");
// const bcrypt = require("bcryptjs");

const app = express();
app.set("view engine", "hbs");
dotenv.config({ path: "./.env" });

const publicDir = path.join(__dirname, "./webbsidan");

// https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
const re =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const db = mysql.createConnection({
  // värden hämtas från .env
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

// Log a list of

app.use(express.urlencoded({ extended: "false" }));
app.use(express.json());

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ansluten till MySQL");
  }
});

// Använder mallen index.hbs
app.get("/", (req, res) => {
  res.render("index");
});

// Använder mallen register.hbs
app.get("/register", (req, res) => {
  res.render("register");
});

// Använder mallen login.hbs
app.get("/login", (req, res) => {
  res.render("login");
});

// Tar emot poster från registeringsformuläret
app.post("/auth/register", (req, res) => {
  const { name, email, password, password_confirm } = req.body;
  db.query("SELECT name, email FROM users", (err, result) => {
    console.log(result[0]);
    if (!name || !email || !password || !password_confirm) {
      return res.render("register", {
        message: "Fyll i alla fält",
      });
    }
    if (name_array.includes(name) || email_array.includes(email)) {
      return res.render("register", {
        message: "Användaren finns redan",
      });
    }
    if (password !== password_confirm) {
      return res.render("register", {
        message: "Lösenorden matchar inte",
      });
    }
    if (!re.test(email)) {
      return res.render("register", {
        message: "Felaktig epost",
      });
    }

    db.query(
      "INSERT INTO users SET?",
      { name: name, email: email, password: password },
      (err, result) => {
        if (err) {
          console.error(err);
        } else {
          return res.render("register", {
            message: "Användare registrerad",
          });
        }
      }
    );
  });
});

// Tar emot poster från loginsidan
app.post("/auth/login", (req, res) => {
  const { name, password } = req.body;

  db.query(
    "SELECT name, password FROM users WHERE name = ?",
    [name],
    async (error, result) => {
      if (error) {
        console.log(error);
      }
      // Om == 0 så finns inte användaren
      if (result.length == 0) {
        return res.render("login", {
          message: "Användaren finns ej",
        });
      } else {
        // Vi kollar om lösenordet som är angivet matchar det i databasen
        if (password === result[0].password) {
          return res.render("login", {
            message: "Du är nu inloggad",
          });
        } else {
          return res.render("login", {
            message: "Fel lösenord",
          });
        }
      }
    }
  );
});

// Körde på 4k här bara för att skilja mig åt
// från server.js vi tidigare kört som använder 3k
app.listen(4000, () => {
  console.log("Servern körs, besök http://localhost:4000");
});
