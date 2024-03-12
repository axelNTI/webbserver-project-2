const express = require("express");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const path = require("path");
const e = require("express");
const bcrypt = require("bcryptjs");

const app = express();
app.set("view engine", "hbs");
dotenv.config({ path: "./.env" });

const publicDir = path.join(__dirname, "./webbsidan");

// https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
const emailRegex =
  /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,35}$/;

const db = mysql.createConnection({
  // värden hämtas från .env
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

app.use(express.urlencoded({ extended: "false" }));
app.use(express.json());

db.connect((error) => {
  if (error) {
    console.error(error);
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
    if (err) {
      console.error(err);
    }
    const name_array = result.map((user) => user.name);
    const email_array = result.map((user) => user.email);
    if (!name || !email || !password || !password_confirm) {
      return res.render("register", {
        message: "Fyll i alla fält",
      });
    }
    if (name_array.includes(name) || email_array.includes(email)) {
      return res.render("register", {
        message: "Användarnamn eller epostadress upptagen",
      });
    }
    if (password !== password_confirm) {
      return res.render("register", {
        message: "Lösenorden matchar inte",
      });
    }
    if (!emailRegex.test(email)) {
      return res.render("register", {
        message: "Ogiltig epostadress",
      });
    }
    if (emailRegex.test(name)) {
      return res.render("register", {
        message: "Användarnamn får inte vara en epostadress",
      });
    }
    if (!passwordRegex.test(password)) {
      return res.render("register", {
        message:
          "Lösenordet måste innehålla mellan 8 och 35 tecken, varav minst en siffra, en stor bokstav och en liten bokstav",
      });
    }
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        console.error(err);
      }
      bcrypt.hash(password, salt, (err, hashedPassword) => {
        if (err) {
          console.error(err);
        }
        db.query(
          "INSERT INTO users SET?",
          { name: name, email: email, password: hashedPassword },
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
  });
});

// Tar emot poster från loginsidan
app.post("/auth/login", (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    return res.render("login", {
      message: "Fyll i alla fält",
    });
  }
  db.query("SELECT name, password FROM users", [name], async (err, result) => {
    if (err) {
      console.error(err);
    }
    const name_array_login = result.map((user) => user.name);
    const password_array_login = result.map((user) => user.password);
    if (!name_array_login.includes(name)) {
      return res.render("login", {
        message: "Fel användarnamn eller lösenord",
      });
    }
    const hashedPassword = password_array_login[name_array_login.indexOf(name)];
    const passwordMatch = await bcrypt.compare(password, hashedPassword);
    if (!passwordMatch) {
      return res.render("login", {
        message: "Fel användarnamn eller lösenord",
      });
    }
    return res.render("login", {
      message: "Inloggad",
    });
  });
});

// Körde på 4k här bara för att skilja mig åt
// från server.js vi tidigare kört som använder 3k
app.listen(4000, () => {
  console.log("Servern körs, besök http://localhost:4000");
});
