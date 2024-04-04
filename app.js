const express = require("express");

const app = express();

// set view engine
app.set("view engine", "ejs");

// routes
app.get("/", (req, res) => {
  res.render("home/index");
});
app.get("/artists", (req, res) => {
  res.render("artists/index");
});
app.get("/categories", (req, res) => {
  res.render("categories/index");
});
app.get("/search", (req, res) => {
  res.render("search");
});

// serve static files
app.use(express.static("public"));

app.listen(3000, () => {
  console.log("Server listening on port 3000...");
});
