const express = require("express");
const router = new express.Router();

const User = require('../models/user.model');

// home
const homeController = require('../controllers/home.controller');
router.get("/", homeController.index);

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
const artistController = require("../controllers/artist.controller");
router.get("/artist", artistController.index);
router.get("/artist/:email/show", 
    artistController.findOrFail,
    artistController.show);
router.get("/artist/:email/albums", 
    artistController.findOrFail,
    artistController.albums);
router.get("/artist/:email/following", 
    artistController.findOrFail,
    artistController.following
);
router.get("/artist/:email/likes", 
    artistController.findOrFail,
    artistController.likes
);
router.get("/artist/:email/orders", 
    artistController.findOrFail,
    artistController.orders
);
router.get("/artist/:email/shop", 
    artistController.findOrFail,
    artistController.shop
);

// artworks
const artworkController = require("../controllers/artwork.controller");
router.get("/artwork",artworkController.index)
router.get('/artwork/:id/show', 
    artworkController.findOrFail,
    artworkController.show
);

//album
const albumController = require("../controllers/album.controller");
router.get('/album/:id/show', 
    albumController.findOrFail,
    albumController.show
);

// categories
const categoryController = require("../controllers/category.controller")
router.get("/category", categoryController.index);
router.get("/category/:id/show", categoryController.show);

router.get("/search", (req, res) => {
    res.render("search");
});

// shop
const shopController = require("../controllers/shop.controller");
router.get("/shop",shopController.index)

module.exports = router;