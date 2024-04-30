const express = require("express");
const router = new express.Router();
const User = require("../models/user.model");
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcrypt");

// show edit profile form
async function editProfile(req, res) {
  res.render("user/edit-profile");
}

const validateProfile = [
  check("name").trim().notEmpty().withMessage("Name is required"),
  check("avatar").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("Avatar is required");
    }

    return true;
  }),
];

// handle update profile
async function updateProfile(req, res) {
  // validate user data
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("user/edit-profile", { errors: errors.mapped() });
  }

  // get user data
  const { name } = req.body;

  // update profile
  req.user.name = name;
  req.user.avatar = "/uploads/" + req.file.filename;
  await req.user.save();

  errors.success = "Updated successfully";

  res.render("user/edit-profile", { errors });
}

// show change password form
async function changePassword(req, res) {
  res.render("user/change-password");
}

const validatePassword = [
  check('cr_password')
    .notEmpty()
    .withMessage("Current password is required")
    .custom(async (value, { req })=>{
      const verified = await bcrypt.compare(value, req.user.password);

      if(!verified) {
        throw new Error("Wrong password!");
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

// hande update password
async function updatePassword(req, res) {
  // validate user data
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.render("user/change-password", { errors: errors.mapped() });
  }

  // hashpassword
  const hashPassword = await bcrypt.hash(req.body.password, 10);

  req.user.password = hashPassword;
  await req.user.save();

  req.flash.success("Change password success");


  res.redirect("/auth/logout?success=Change password success")
}

//


module.exports = {
  editProfile,
  validateProfile,
  updateProfile,

  changePassword,
  validatePassword,
  updatePassword,



  // upload,
  // validateUpload,
  // handleUpload,
}