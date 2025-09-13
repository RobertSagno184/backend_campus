const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const { PrismaClient } = require("@prisma/client");
const session = require("express-session");
require("dotenv").config();

// Forcer la variable DATABASE_URL si elle n'est pas définie
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "mysql://root:@localhost:3306/campusGo";
}

const app = express();

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.SESSION_ENV === "production",
      sameSite: "Lax",
      maxAge: 60 * 60 * 1000, // 1 heure
      // maxAge: 24 * 60 * 60 * 1000, // 24 heures

      rolling: true,
    },
  })
);

const protectedStatic = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect("/");
  }

  const now = Date.now();
  if (
    req.session.lastActivity &&
    now - req.session.lastActivity > 30 * 60 * 1000 // 30 minutes
  ) {
    req.session.destroy((err) => {
      if (err)
        //console.error("Erreur lors de la destruction de la session:", err);
        return res.redirect("/");
    });
  } else {
    req.session.lastActivity = now;
    next();
  }
};

const prisma = new PrismaClient();

const utilisateurRouter = require("./routes/users/Utilisateur");
const login = require("./routes/users/Connexion");
const logout = require("./routes/users/Deconnexion");
const paysRouter = require("./routes/pays/pays");
const themeRouter = require("./routes/themeLienDetailTheme/themeLienDetailTheme");
const universiteRouter = require("./routes/universite/universite");
const formationRouter = require("./routes/formation/formation");
const villeRouter = require("./routes/ville/ville");
const publiciteRouter = require("./routes/publicite/publicite");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/upload", express.static(path.join(__dirname, "upload")));

app.use("/utilisateur", utilisateurRouter);
app.use("/login", login);
app.use("/logout", logout);
app.use("/pays", paysRouter);
app.use("/themes", themeRouter);
app.use("/universite", universiteRouter);
app.use("/formations", formationRouter);
app.use("/ville", villeRouter);
app.use("/publicites", publiciteRouter);

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.get("/favicon.ico", (req, res) => res.status(204));

app.use((req, res, next) => {
  res.status(404).send("Page non trouvée");
}); 

module.exports = app;
