const { check, validationResult } = require("express-validator");
const Album = require("../models/album.model");
const User = require("../models/user.model");
const Artwork = require("../models/artwork.model");


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
    res.redirect(`/artist/${req.user.email}/album/${album._id}`);
}

// req.album
async function findOrFail(req,res,next){
    const album = await Album.findById(req.params.id).populate("createdBy").exec();

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
    const artist = album.createdBy;
    const albums = await Album.find({_id: {$in: artist.albums}});
    const artworks = await Artwork.find({_id: {$in: album.artworks}}).populate("category").exec();

    return res.render("album/show", {artist, album, artworks, albums});
}

async function edit(req,res) {
    const album = req.album;

    return res.render("album/edit", {album});
}

async function update(req,res) {
    const album = req.album;

    // get user data
    const { title,description } = req.body;

    Object.assign(album, {
        title, description
    });

    // validate user data
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.render("album/edit", {album, errors: errors.mapped()})
    }

    await album.save()
    
    req.flash.success("Updated successfully!");
    
    // redirect
    res.redirect(`/album/${album._id}/show`);
}
 
async function destroy(req,res) {
    await Album.findByIdAndDelete(req.params.id);

    // remove from user
    await User.findByIdAndUpdate(req.user._id, {
        $pull: {albums: req.album._id}
    });

    req.flash.success("Deleted successfully!");

    res.redirect(`/artist/${req.user.email}/albums`);
}

async function addArtwork(req,res) {
    const artwork = await Artwork.findById(req.query.artwork);

    if(!artwork) return res.redirect("/not-found");

    req.album.artworks.addToSet(artwork._id);
    await req.album.save();

    req.flash.success("Added to album successfully!");

    res.redirect(`/artwork/${artwork._id}/show`);
}

async function removeArtwork(req,res) {
    const artwork = await Artwork.findById(req.query.artwork);

    if(!artwork) return res.redirect("/not-found");

    req.album.artworks.pull(artwork._id);
    await req.album.save();

    req.flash.success("Removed from album successfully!");

    if(req.query.url) return res.redirect(req.query.url);

    res.redirect(`/artwork/${artwork._id}/show`);
}

module.exports = {

    create,
    validateAlbum,
    store,

    findOrFail,
    show,
    addArtwork,
    removeArtwork,

    requireOwner,
    edit,
    update,

    destroy,
}