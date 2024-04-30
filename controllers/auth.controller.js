
const User = require("../models/user.model");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

// show form to register
function register(req, res) {
  res.render("auth/register", { req, errors: {} });
};

const validateRegister = [
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

// handle register
async function handleRegister (req, res) {
  // validate user data
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("auth/register", { req, errors: errors.mapped() });
  }

  // get user data
  const { name, email, password } = req.body;

  // 
  const hashPassword = await bcrypt.hash(password, 10);

  // save user into db
  const user = new User({ name, email, password: hashPassword });
  await user.save();

  req.flash.success("Register Successfully!")

  // redirect login with message
  return res.redirect("/auth/login");
};

// show login form
function login (req, res) {
  const loggedInUser = req.session.user;

  if (loggedInUser) {
    return res.redirect("/");
  }

  res.render("auth/login",  {req, errors: {} });
};

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

// handle login
async function handleLogin(req, res) {
  // validate user data
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("auth/login", { errors: errors.mapped() });
  }

  // login user
  // find user with email
  const user = await User.findOne({
    email: req.body.email
  });
  if (!user) {
    req.flash.error('Invalid email or password!');
 
    return res.render("auth/login", { errors });
  }

  // check password
  const verified = await bcrypt.compare(req.body.password, user.password);
  if(!verified) {
    req.flash.error('Invalid email or password!');
    return res.render("auth/login", { errors });
  }

  // check if banned user
  if(user.active == false) {
    req.flash.error('Account banned, please contact admin (0902590396)!');

    return res.render("auth/login", { errors });
  }

  // create session
  req.session.email = user.email;

  // redirect user with message
  if (req.query.ref) {
    return res.redirect(req.query.ref);
  }

  res.redirect("/");
};

// logout
function logout (req, res) {
  req.session.destroy();

  if (req.query.success) {
      return res.redirect("/auth/login?success=" + req.query.success);
  }

  res.redirect("/auth/login");
};


module.exports = {
  register,
  validateRegister,
  handleRegister,

  login,
  validateLogin,
  handleLogin,

  logout
};