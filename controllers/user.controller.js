const express = require("express");
const router = new express.Router();
const User = require("../models/user.model");
const { check, validationResult } = require("express-validator");

const { requireLogin } = require("../middlewares/auth");

router.get("/profile", requireLogin, async (req, res) => {
  res.render("user/profile", { req, errors: {} });
});

// set up storage
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    // rename file
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const validateProfile = [
  check("name").trim().notEmpty().withMessage("Name is required"),
  check("avatar").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Avatar is required");
    }

    return true;
  }),
];

router.post(
  "/profile",
  upload.single("avatar"),
  validateProfile,
  async (req, res) => {
    // validate user data
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.render("user/profile", { req, errors: errors.mapped() });
    }

    // get user data
    const { name } = req.body;

    // update profile
    // get current logged in user
    req.user.name = name;

    req.user.avatar = "/uploads/" + req.file.filename;
    await req.user.save();

    errors.success = "Updated successfully";

    res.render("user/profile", { req, errors });
  }
);

module.exports = router;
