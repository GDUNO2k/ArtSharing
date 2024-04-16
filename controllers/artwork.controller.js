const { check, validationResult } = require("express-validator");
const Artwork = require("../models/artwork.model");
const Category = require("../models/category.model");


async function create(req,res) {
    const artwork = new Artwork();
    const categories = await Category.find();

    return res.render("artwork/create", {artwork, categories })
}

// validate artwork
const validateArtwork = [
    check("file").custom((value, { req }) => {
        if (!req.artwork) {
            if (!req.file) {
                throw new Error("Image is required");
            }
        }

        // TODO: file types, size
        
        return true;
    }),
    check("title").trim().notEmpty().withMessage("Title is required"),
    check("description").trim().notEmpty().withMessage("Description is required"),
    check("category").notEmpty().withMessage("Category is required"),
];

async function store(req,res) {
    const categories = await Category.find();

    // validate user data
    const errors = validationResult(req)

    // get user data 
    const { title,description,category,tags } = req.body;
    const artwork = new Artwork({
        title, description, 
        category, 
        tags, 
    });

    console.log(artwork.category._id) 

    if (!errors.isEmpty()) {
        console.log(errors)
        return res.render("artwork/create", {artwork, categories,errors: errors.mapped()})
    }

    artwork.path = "/uploads/"+ req.file.filename;

    // owner
    artwork.createdBy = req.user._id;
    await artwork.save()

    req.flash.success("Created successfully!");
    
    // redirect
    res.redirect(`/artwork/${artwork._id}/show`);
}

// req.artwork
async function findOrFail(req,res,next){
    const artwork = await Artwork.findById(req.params.id).populate("createdBy").exec();

    if (!artwork) {
        return res.redirect('/not-found')
    } 

    req.artwork = artwork;
    next();
}

async function requireOwner (req,res,next) {
    if(req.artwork.createdBy.email !== req.user.email) {
        return res.redirect('/not-found')
    }

    next();
}

async function show(req,res) { 
    const artwork = req.artwork;

    // increase no. views
    artwork.noViews++;
    await artwork.save();

    let isOwner = false;
    if(req.user && req.user.email == artwork.createdBy.email) {
        isOwner = true; 
    }


    return res.render("artwork/show", {artwork, isOwner});
}



async function edit(req,res) {
    const categories = await Category.find();
    const artwork = req.artwork;

    return res.render("artwork/edit", {artwork, categories});
}

async function update(req,res) {
    const categories = await Category.find();
    const artwork = req.artwork;

    // get user data
    const { title,description,category,tags } = req.body;
    
    Object.assign(artwork, {
        title, description, category, tags, 
    });

    // validate user data
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.render("artwork/edit", {artwork, categories, errors: errors.mapped()})
    }

    // update file path if new
    if (req.file) {
        artwork.path = "/uploads/"+ req.file.filename;
    }

    await artwork.save()

    req.flash.success("Updated successfully!");
    
    // redirect
    res.redirect(`/artwork/${artwork._id}/show`);
}

async function like(req,res) {
    
}

async function watchLater(req,res) {
    
}

async function destroy(req,res) {
    await Artwork.findByIdAndDelete(req.params.id);

    req.flash.success("Deleted successfully!");

    res.redirect(`/artist/${req.user.email}/show`);
}

module.exports = {
    create,
    validateArtwork,
    store,

    findOrFail,

    show,
    like,
    watchLater,

    requireOwner,
    edit,
    update,

    destroy,
}