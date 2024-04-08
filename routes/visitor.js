const express = require("express");
const router = new express.Router();

const User = require('../models/user.model');

// home
router.get("/", async (req, res) => {
    const artists = await User.find().limit(6).exec();

    res.render("home/index", { artists, req });
});

/* ------------ auth routes */
const authController = require('../controllers/auth.controller');

// register
router.get('/auth/register', authController.register);
router.post('/auth/register',
    authController.validateRegister,
    authController.handleRegister
);

// login
router.get('/auth/login', authController.login);
router.post('/auth/login',
    authController.validateLogin,
    authController.handleLogin);

// logout
router.get('/auth/logout', authController.logout);
/* ------------ END auth routes */

// artists
router.get("/artists", (req, res) => {
    res.render("artists/index");
});

router.get("/categories", (req, res) => {
    res.render("categories/index");
});

router.get("/search", (req, res) => {
    res.render("search");
});

// artworks
const artworkController = require("../controllers/artwork.controller")
router.get('/artwork/:id', artworkController.show)

module.exports = router;