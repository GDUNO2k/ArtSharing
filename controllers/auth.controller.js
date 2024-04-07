const express = require("express");
const router = new express.Router();
const User = require("../models/user.model");
const { check, validationResult } = require("express-validator");

// show form to register
router.get("/register", (req, res) => {
  res.render("auth/register", { req, errors: {} });
});

const validateUser = [
  check("name")
    .trim() // remove leading and trailing spaces
    .notEmpty()
    .withMessage("Name is required"),

  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address")
    .custom(async (value) => {
      // find user by email
      const user = await User.findOne({ email: value });

      // if already exists
      if (user) {
        throw new Error("Email already exists");
      }

      return true;
    }),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be more than 6 characters"),

  check("cf_password")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];
// handle create new user
router.post("/register", validateUser, async (req, res) => {
  // validate user data
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("auth/register", { req, errors: errors.mapped() });
  }

  // get user data
  const { name, email, password } = req.body;

  // save user into db
  const user = new User({ name, email, password });
  await user.save();

  // redirect login with message
  return res.redirect("/login");
});

router.get("/login", (req, res) => {
  const loggedInUser = req.session.user;

  if (loggedInUser) {
    return res.redirect("/");
  }

  res.render("auth/login",  {req, errors: {} });
});

const validateLogin = [
  check("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please enter a valid email address"),

  check("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be more than 6 characters"),
];

router.post("/login", validateLogin, async (req, res) => {
  // validate user data
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("auth/login", { errors: errors.mapped() });
  }

  // login user
  // find user with email, password
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password,
  });
  if (!user) {
    errors.failed = "Invalid email or password";

    return res.render("auth/login", { errors });
  }

  const { name, email } = user;

  // create session
  req.session.user = { name, email };

  // redirect user with message
  res.redirect("/");
});

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

module.exports = router;
