const express = require('express');
const router = new express.Router();


// check if admin
const auth = require("../middlewares/auth.middleware");
router.use(auth.requireAdmin);

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

// manage categories
const categoryController = require('../controllers/admin/category.controller');
router.get("/admin/category", categoryController.index)
router.get("/admin/category/create", categoryController.create)
router.post("/admin/category/create", 
    upload.single("thumbnail"),
    categoryController.validateCategory,
    categoryController.store
);

router.get("/admin/category/:id/edit", 
    categoryController.findOrFail,
    categoryController.edit
);
router.post("/admin/category/:id/edit", 
    categoryController.findOrFail,
    upload.single("thumbnail"),
    categoryController.validateCategory,
    categoryController.update
);

router.post("/admin/category/:id/destroy", categoryController.destroy)

//Manage artwork
const artworkController = require('../controllers/admin/artwork.controller');
router.get("/admin/artwork", 
    artworkController.index
)
router.post("/admin/artwork/:id/hide", 
    artworkController.findOrFail,
    artworkController.hide)
router.post("/admin/artwork/:id/unhide", 
    artworkController.findOrFail,
    artworkController.unhide)

//Manage order
const orderController = require('../controllers/admin/order.controller');
router.get("/admin/order", 
    orderController.index
)

//Manage user
const userController = require('../controllers/admin/user.controller');
router.get("/admin/user", 
    userController.index
)
router.post("/admin/user/:id/ban", 
    userController.findOrFail,
    userController.ban)
router.post("/admin/user/:id/unban", 
    userController.findOrFail,
    userController.unban)

module.exports = router;