const express = require("express");
const router = new express.Router();
const User = require("../models/user.model");

// routes
router.get("/", async (req, res) => {
  const artists = await User.find().limit(6).exec();

  res.render("home/index", { artists, req });
});

module.exports = router;
