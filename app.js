const express = require("express");

const app = express();

// serve static files
app.use(express.static("public"));

// set view engine
app.set("view engine", "ejs");

//decode form data
app.use(express.urlencoded({ extended: true }));

//connect mongoDB
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/art-sharing");

// init session
const session = require("express-session");
app.use(
  session({
    secret: "__duong__",
    resave: false,
    saveUninitialized: true,
  })
);

// routes

app.get("/artists", (req, res) => {
  res.render("artists/index");
});

app.get("/categories", (req, res) => {
  res.render("categories/index");
});

app.get("/search", (req, res) => {
  res.render("search");
});

// middlewares
const User = require("./models/user.model");

app.use(async (req, res, next) => {
  if (req.session.user) {
    const email = req.session.user.email;
    const user = await User.findOne({ email });

    req.user = user;
  }

  next();
});

// routes
const authController = require("./controllers/auth.controller");
app.use(authController);

const userController = require("./controllers/user.controller");
app.use(userController);

const homeController = require("./controllers/home.controller");
app.use(homeController);

app.get("*", (req, res) => {
  res.render("not-found");
});

app.listen(3000, () => {
  console.log("Server listening on port 3000...");
});
