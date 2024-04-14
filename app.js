const express = require("express");

const app = express();

// serve static files
app.use(express.static("public"));

// set view engine - res.render()
app.set("view engine", "ejs");

//decode form data - req.body
app.use(express.urlencoded({ extended: true }));

//connect mongoDB
const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/art-sharing");

// init session - req.session
const session = require("express-session");
app.use(
  session({
    secret: "__duong__",
    resave: false,
    saveUninitialized: true,
  })
);

// access req, errors in ejs
app.use((req, res, next) => {
  res.locals.req = req; 
  res.locals.errors = {}; 
  res.locals.bodyClass = "";

  next();
});

// get logged in user - req.user
const authMiddleware = require('./middlewares/auth.middleware');
app.use(authMiddleware.getUser); 

// flash messagse
const flash = require('./middlewares/flash.js');
app.use(flash);

// routes
app.get("/not-found", (req,res) => {
  res.render("not-found")
})

app.get("/unauthorized", (req,res)=> {
  res.render("unauthorized");
})

const visitorRoutes = require('./routes/visitor.js');
app.use(visitorRoutes);

const memberRoutes = require('./routes/member.js');
app.use(memberRoutes);

const adminRoutes = require('./routes/admin.js');
app.use(adminRoutes);

// route not found
app.get("*", (req, res) => {
  res.render("not-found");
});

app.listen(3000, () => {
  console.log("Server listening on port 3000...");
});
