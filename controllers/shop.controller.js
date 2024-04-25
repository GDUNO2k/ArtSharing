const { check, validationResult } = require("express-validator");
const Artwork = require("../models/artwork.model");
const Category = require("../models/category.model");
const User = require("../models/user.model");
const Album = require("../models/album.model");
const Order = require("../models/order.model");
const sharp = require("sharp");
const path = require("path");
const imageSize = require("image-size")


async function index(req,res) {
    const categories = await Category.find();

    const query = Artwork.find({forSale: true});

    // TODO: popular

    // filter by title
    if (req.query.keyword) { 
        query.where({ title: { $regex: req.query.keyword, $options: 'i' } })
    }

    // filter by category
    if (req.query.category) { 
        query.where({category: req.query.category })
    }

    // pagination
    req.pagination.perPage = 8;
    const totalResults = await query.clone().countDocuments();
    req.pagination.numPages = Math.ceil(totalResults/req.pagination.perPage);
    query.skip((req.pagination.page-1) * req.pagination.perPage).limit(req.pagination.perPage);

    const artworks = await query.populate('createdBy').populate('category').sort({ createdAt: -1 }).exec();

    return res.render("shop/index", {artworks, categories})
}

// req.artwork
async function findOrFail(req,res,next){
    const artwork = await Artwork.findById(req.params.id).populate("createdBy").populate("category").exec();

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

async function purchase(req,res) { 
    const artwork = req.artwork;

    // if owner -> redirect
    if(req.user.email == artwork.createdBy.email || artwork.buyers.includes(req.user._id)) {

        req.flash.success('You already own this artwork.')
        return res.redirect(`/artwork/${artwork._id}/show`);
    }

    return res.render("shop/purchase", {artwork});
}

async function handlePurchase(req,res) { 
    const artwork = req.artwork;

    // if owner -> redirect
    if(req.user.email == artwork.createdBy.email || artwork.buyers.includes(req.user._id)) {

        req.flash.success('You already own this artwork.')
        return res.redirect(`/artwork/${artwork._id}/show`);
    }

    //

    const order = new Order({
        buyer: req.user._id,
        artwork: req.artwork._id,
        title: artwork.title,
        pathOriginal: artwork.pathOriginal,
        originalSize: artwork.originalSize,
        path: artwork.path,
        price: artwork.price,
    });

    await order.save();

    //
    artwork.buyers.addToSet(req.user._id);
    await artwork.save();

    //
    req.user.orders.addToSet(order._id);
    await req.user.save();

    return res.render("shop/purchase", {artwork});
}


module.exports = {
    index,

    findOrFail,

    purchase,   
    handlePurchase,
}