const { check, validationResult } = require("express-validator");
const Artwork = require("../../models/artwork.model");
const Category = require("../../models/category.model");
const Artist = require("../../models/user.model");
const mongoose = require("mongoose");

// index
async function index (req,res){
    const artists = await Artist.find();
    const categories = await Category.find();

    const query = Artwork.find();

    // filter by title
    if (req.query.keyword) { 
        query.where({ title: { $regex: req.query.keyword } })
    }
    // filter by artist
    if (req.query.createdBy) {
        query.where({createdBy: req.query.createdBy })
    }

    // filter by category
    if (req.query.category) {
        query.where({category: req.query.category })
    }

    // pagination
    const page = parseInt(req.query.page) || 1;
    const perPage = 1;

    const totalResults = await query.clone().countDocuments();
    const numPages = Math.ceil(totalResults/perPage);

    query.skip((page-1) * perPage).limit(perPage);

    const artworks = await query.populate('createdBy').populate('category').sort({ createdAt: -1 }).exec();

    res.render('admin/artwork/index', {artworks, artists, categories, page, numPages})
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

async function hide(req,res) {
    req.artwork.hidden = false;

    await req.artwork.save();

    req.flash.success("Artwork has been hidden!");
    
    // redirect
    res.redirect(`/admin/artwork`);
}

async function unhide(req,res) {
    req.artwork.hidden = true;

    await req.artwork.save();

    req.flash.success("Artwork has been unbaned!");
    
    // redirect
    res.redirect(`/admin/artwork`);
}

module.exports = {
    index,

    findOrFail,
    hide,
    unhide,
}