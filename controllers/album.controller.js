const { check, validationResult } = require("express-validator");
const Album = require("../models/album.model");
const User = require("../models/user.model");


async function create(req,res) {
    const album = new Album();

    return res.render("album/create", {album })
}

// validate album
const validateAlbum = [
    
    check("title").trim().notEmpty().withMessage("Title is required"),
    check("description").trim().notEmpty().withMessage("Description is required"),
    
];

async function store(req,res) {

    // validate user data
    const errors = validationResult(req)

    // get user data 
    const { title,description } = req.body;
    const album = new Album({
        title, description
    });

    if (!errors.isEmpty()) {
        return res.render("album/create", {album,errors: errors.mapped()})
    }

    // owner
    album.createdBy = req.user._id;
    await album.save()

    //add to owner.albums
    await User.findByIdAndUpdate(req.user._id, {
        $push: {albums: album._id}
    });

    req.flash.success("Created successfully!");
    
    // redirect
    res.redirect(`/album/${album._id}/show`);
}

// req.album
async function findOrFail(req,res,next){
    const album = await Album.findById(req.params.id).populate("createdBy").populate("category").exec();

    if (!album) {
        return res.redirect('/not-found')
    } 
    req.album = album;

    let isOwner = false;
    if(req.user && req.user.email == album.createdBy.email) {
        isOwner = true; 
    }
    req.isOwner = isOwner;

    next();
}

async function requireOwner (req,res,next) {
    if(req.album.createdBy.email !== req.user.email) {
        return res.redirect('/not-found')
    }

    next();
}

async function show(req,res) { 
    const album = req.album;

    return res.render("album/show", {album});
}

async function edit(req,res) {
    const categories = await Category.find();
    const album = req.album;

    return res.render("album/edit", {album, categories});
}

async function update(req,res) {
    const categories = await Category.find();
    const album = req.album;
    const oldCategory = req.album.category;

    // get user data
    const { title,description,category,tags } = req.body;

    Object.assign(album, {
        title, description, category, tags, 
    });

    // validate user data
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.render("album/edit", {album, categories, errors: errors.mapped()})
    }

    // update file path if new
    if (req.file) {
        album.path = "/uploads/"+ req.file.filename;
    }

    await album.save()

    // update category
    if (!oldCategory.equals(album.category)) {
        // remove from old category
        await Category.findByIdAndUpdate(oldCategory, {
            $pull: {albums: album._id}
        });

        // add to new category
        await Category.findByIdAndUpdate(category, {
            $push: {albums: album._id}
        });
    }
    
    req.flash.success("Updated successfully!");
    
    // redirect
    res.redirect(`/album/${album._id}/show`);
}

async function like(req,res) {
    // add logged in user to likes
    await Album.findByIdAndUpdate(req.params.id, {
        $addToSet: {likes: req.user._id},
    });

    req.flash.success("Liked album!");
    
    // redirect
    res.redirect(`/album/${req.album._id}/show`);
}

async function unlike(req,res) {
    // add logged in user to likes
    await Album.findByIdAndUpdate(req.params.id, {
        $pull: {likes: req.user._id},
    });

    req.flash.success("Unliked album!");
    
    // redirect
    res.redirect(`/album/${req.album._id}/show`);
}

async function watchLater(req,res) {
    
}

async function destroy(req,res) {
    const category = req.album.category;

    await Album.findByIdAndDelete(req.params.id);

    // remove from category
    await Category.findByIdAndUpdate(category, {
        $pull: {albums: req.album._id}
    });

    req.flash.success("Deleted successfully!");

    res.redirect(`/artist/${req.user.email}/show`);
}

module.exports = {

    create,
    validateAlbum,
    store,

    findOrFail,

    show,
    like,
    unlike,
    watchLater,

    requireOwner,
    edit,
    update,

    destroy,
}