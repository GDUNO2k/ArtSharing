const { check, validationResult } = require("express-validator");
const Artwork = require("../models/artwork.model");
const Category = require("../models/category.model");
const User = require("../models/user.model");
const Album = require("../models/album.model");
const Comment = require("../models/comment.model");
const sharp = require("sharp");
const path = require("path");
const imageSize = require("image-size")


async function index(req,res) {
    const categories = await Category.find();

    const query = Artwork.find();

    // filter by title
    if (req.query.keyword) { 
        query.where({ title: { $regex: req.query.keyword, $options: 'i' } })
    }

    // filter by category
    if (req.query.category) { 
        query.where({category: req.query.category })
    }

    // sort
    if (req.query.sort || "popular") {
        switch(req.query.sort) {
            case "recent": 
                query.sort({createdAt: -1});
                break;
            default: // default popular
                query.sort({likes: -1, noViews: -1});
        }
    }

    // pagination
    req.pagination.perPage = 8;
    const totalResults = await query.clone().countDocuments();
    req.pagination.numPages = Math.ceil(totalResults/req.pagination.perPage);
    query.skip((req.pagination.page-1) * req.pagination.perPage).limit(req.pagination.perPage);

    const artworks = await query.populate('createdBy').populate('category').sort({ createdAt: -1 }).exec();

    return res.render("artwork/index", {artworks, categories})
}

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
    check("category").notEmpty().withMessage("Category is required").custom(async (value, { req }) => {
        const category = await Category.findById(value);

        if (!category) {
            throw new Error("Category not exist!")
        }
        
        return true;
    }),
    check("price").trim().custom((value, { req }) => {
        if (req.body.forSale && value <= 0) {
            throw new Error("Invalid price")
        }
        
        return true;
    })
];

async function store(req,res) {
    const categories = await Category.find();

    // validate user data
    const errors = validationResult(req)

    // get user data 
    const { title,description,category,tags,forSale,price } = req.body;
    const artwork = new Artwork({
        title, description, 
        category, 
        tags, 
        forSale,
        price
    });

    if (!errors.isEmpty()) {
        console.log(errors)
        return res.render("artwork/create", {artwork, categories,errors: errors.mapped()})
    }

    artwork.pathOriginal = "public/uploads/"+ req.file.filename;
    const {width, height} = imageSize(req.file.path);
    artwork.originalSize = (width + "-" + height)

    // -- resize
    artwork.path = "--";
    // owner
    artwork.createdBy = req.user._id;
    await artwork.save(); // save for id

    const filename = 'resized_'+ artwork._id + path.extname(req.file.originalname);
    sharp(req.file.path)
        .resize(700)
        .toFile('public/uploads/'+ filename);

    artwork.path = '/uploads/' + filename;

    await artwork.save();

    //add to owner.artworks
    await User.findByIdAndUpdate(req.user._id, {
        $push: {artworks: artwork._id}
    });

    // add to category
    await Category.findByIdAndUpdate(category, {
        $push: {artworks: artwork._id}
    });

    
    req.flash.success("Created successfully!");

    // if album add to album
    if(req.query.album) {
        const album = await Album.findByIdAndUpdate(req.query.album, {
            $push: {artworks: artwork._id}
        });

        return res.redirect(`/album/${album._id}/show`);
    }
    
    // redirect
    res.redirect(`/artwork/${artwork._id}/show`);
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

async function show(req,res) { 
    const artwork = req.artwork;

    let albums = [];

    if(req.user && req.user.albums) {
        albums = await Album.find({_id: {$in: req.user.albums}});
    }

    const similarCategoryArtworks = await Artwork.aggregate([
        { $match: { category: artwork.category._id } },
        { $sample: { size: 4 } }
    ]);

    const similarArtistArtworks = await Artwork.aggregate([
        { $match: { createdBy: artwork.createdBy._id } },
        { $sample: { size: 3 } }
    ]);

    // popular artworks
    const popularArtworks = await Artwork.find().sort({likes: -1, noViews: -1}).limit(8);

    // increase no. views
    artwork.noViews++;
    await artwork.save();

    let isOwner = false;
    if(req.user && req.user.email == artwork.createdBy.email) {
        isOwner = true; 
    }

    // comment
    let comments = await Comment.find({_id: {$in: artwork.comments}}).sort({createdAt: -1}).populate("createdBy");

    return res.render("artwork/show", {artwork, isOwner, similarCategoryArtworks, similarArtistArtworks, popularArtworks, albums, comments});
}

async function edit(req,res) {
    const categories = await Category.find();
    const artwork = req.artwork;

    return res.render("artwork/edit", {artwork, categories});
}

async function update(req,res) {
    const categories = await Category.find();
    const artwork = req.artwork;
    const oldCategory = req.artwork.category;

    // get user data
    const { title,description,category,tags, forSale, price } = req.body;

    Object.assign(artwork, {
        title, description, category, tags, forSale, price
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

    // update category
    if (!oldCategory.equals(artwork.category)) {
        // remove from old category
        await Category.findByIdAndUpdate(oldCategory, {
            $pull: {artworks: artwork._id}
        });

        // add to new category
        await Category.findByIdAndUpdate(category, {
            $push: {artworks: artwork._id}
        });
    }
    
    req.flash.success("Updated successfully!");
    
    // redirect
    res.redirect(`/artwork/${artwork._id}/show`);
}

async function like(req,res) {
    // add logged in user to likes
    await Artwork.findByIdAndUpdate(req.artwork._id, {
        $addToSet: {likes: req.user._id},
    });

     // add logged in user to likes
    await User.findByIdAndUpdate(req.user._id, {
        $addToSet: {likes: req.artwork._id},
    });

    req.flash.success("Liked artwork!");
    
    // redirect
    if(req.query.url) {
        return res.redirect(req.query.url);
    }
    res.redirect(`/artwork/${req.artwork._id}/show`);
}

async function unlike(req,res) {
    // add logged in user to likes
    await Artwork.findByIdAndUpdate(req.artwork._id, {
        $pull: {likes: req.user._id},
    });

    await User.findByIdAndUpdate(req.user._id, {
        $pull: {likes: req.artwork._id},
    });

    req.flash.success("Unliked artwork!");
    
    // redirect
    if(req.query.url) {
        return res.redirect(req.query.url);
    }
    
    res.redirect(`/artwork/${req.artwork._id}/show`);
}

async function destroy(req,res) {
    const category = req.artwork.category;

    await Artwork.findByIdAndDelete(req.params.id);

    // remove from category
    await Category.findByIdAndUpdate(category, {
        $pull: {artworks: req.artwork._id}
    });

    req.flash.success("Deleted successfully!");

    res.redirect(`/artist/${req.user.email}/show`);
}

async function download(req,res) {
    const filename = req.artwork._id + path.extname(req.artwork.pathOriginal);

    res.setHeader('Content-Disposition', 'attachment; filename="' + filename + '"');
    res.setHeader('Content-Type', 'application/octet-stream');

    res.sendFile(path.resolve(req.artwork.pathOriginal));
}

const validateComment = [
    check("content").trim().notEmpty().withMessage("Content is required"),
];

async function comment(req,res) {

    // validate user data
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        req.flash.error("Content is required?");
        return res.redirect(`/artwork/${req.artwork._id}/show#comments`);
    }

    const comment = new Comment({
        content: req.body.content,
        createdBy: req.user._id,
        artwork: req.artwork._id
    })

    await comment.save();

    //add to owner.artworks
    await Artwork.findByIdAndUpdate(req.artwork._id, {
        $push: {comments: comment._id}
    });

    req.flash.success("Comment successfully!");
    
    // redirect
    res.redirect(`/artwork/${req.artwork._id}/show#comments`);
}


module.exports = {
    index,

    create,
    validateArtwork,
    store,

    findOrFail,

    show,
    like,
    unlike,
    download,
    comment,
    validateComment,

    requireOwner,
    edit,
    update,

    destroy,
}