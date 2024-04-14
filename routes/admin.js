const express = require('express');
const router = new express.Router();


// // check if admin
// const auth = require("../middlewares/auth.middleware");
// router.use(auth.requireAdmin);

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
    upload.single("thumbnail"),
    categoryController.validateCategory,
    categoryController.update
);

router.post("/admin/category/:id/destroy", categoryController.destroy)


// GET index
// GET create
// POST create
// GET edit
// POST edit
// POST destroy


// manage users




// manage artworks

module.exports = router;