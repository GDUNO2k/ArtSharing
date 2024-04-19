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

// interact with artist
const artistController = require("../controllers/artist.controller")
router.get('/artist/:email/follow', 
    artistController.findOrFail,
    artistController.follow,
);


// follow

// manage albums

// manage orders (bought artworks)

// manage favorite images

module.exports = router;