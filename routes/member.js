const express = require("express");
const router = new express.Router();

// require login
const authMiddleware = require('../middlewares/auth.middleware');
router.use(authMiddleware.requireLogin);

// 
const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

// Set up multer middleware
const upload = multer({ storage: storage });

/* ----------- my space */
// edit profile
const userController = require('../controllers/user.controller');
router.get('/user/edit-profile', userController.editProfile);
router.post('/user/edit-profile',
    upload.single('avatar'), // req.file
    userController.validateProfile,
    userController.updateProfile
);

// change password
router.get('/user/change-password', userController.changePassword);
router.post('/user/change-password', 
    userController.validatePassword,
    userController.updatePassword
);

// create artwork
const artworkController = require("../controllers/artwork.controller")
router.get('/artwork/create', artworkController.create);
router.post('/artwork/create', 
    upload.single('file'),
    artworkController.validateArtwork,
    artworkController.store
);
router.get('/artwork/:id/edit', 
    artworkController.findOrFail,
    artworkController.requireOwner,
    artworkController.edit
);
router.post('/artwork/:id/edit', 
    artworkController.findOrFail,
    artworkController.requireOwner,
    upload.single('file'),
    artworkController.validateArtwork,
    artworkController.update
);
router.post('/artwork/:id/destroy', 
    artworkController.findOrFail,
    artworkController.requireOwner,
    artworkController.destroy
);

// interact with artwork
router.get('/artwork/:id/like', 
    artworkController.findOrFail,
    artworkController.like,
);
router.get('/artwork/:id/unlike', 
    artworkController.findOrFail,
    artworkController.unlike,
);
router.get('/artwork/:id/download', 
    artworkController.findOrFail,
    artworkController.download,
);

// interact with artist
const artistController = require("../controllers/artist.controller")
router.get('/artist/:email/follow', 
    artistController.findOrFail,
    artistController.follow,
);
router.get('/artist/:email/unfollow', 
    artistController.findOrFail,
    artistController.unfollow,
);
router.get('/artist/:email/followers', 
    artistController.findOrFail,
    artistController.followers,
);

// album
 const albumController = require("../controllers/album.controller")
router.get('/album/create', albumController.create);
router.post('/album/create', 
    albumController.validateAlbum,
    albumController.store
);
router.get('/album/:id/edit', 
    albumController.findOrFail,
    albumController.requireOwner,
    albumController.edit
);
router.post('/album/:id/edit', 
    albumController.findOrFail,
    albumController.requireOwner,
    upload.single('file'),
    albumController.validateAlbum,
    albumController.update
);
router.post('/album/:id/destroy', 
    albumController.findOrFail,
    albumController.requireOwner,
    albumController.destroy
);
router.get('/album/:id/add-artwork', 
    albumController.findOrFail,
    albumController.requireOwner,
    albumController.addArtwork
);
router.get('/album/:id/remove-artwork', 
    albumController.findOrFail,
    albumController.requireOwner,
    albumController.removeArtwork
);

// shop
const shopController = require("../controllers/shop.controller");
router.get("/shop",shopController.index)
router.get('/shop/:id/purchase', 
    shopController.findOrFail,
    shopController.purchase,
);
router.post('/shop/:id/purchase', 
    shopController.findOrFail,
    shopController.handlePurchase,
);

// manage orders (bought artworks)


module.exports = router;