const { check, validationResult } = require("express-validator");
const Artwork = require("../models/artwork.model");
const Category = require("../models/category.model");
const User = require("../models/user.model");


async function index(req,res) {
    const categories = await Category.find();

    const query = Artwork.find();

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

    if (!errors.isEmpty()) {
        console.log(errors)
        return res.render("artwork/create", {artwork, categories,errors: errors.mapped()})
    }

    artwork.path = "/uploads/"+ req.file.filename;

    // owner
    artwork.createdBy = req.user._id;
    await artwork.save()

    //add to owner.artworks
    await User.findByIdAndUpdate(req.user._id, {
        $push: {artworks: artwork._id}
    });

    // add to category
    await Category.findByIdAndUpdate(category, {
        $push: {artworks: artwork._id}
    });

    req.flash.success("Created successfully!");
    
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
    const similarCategoryArtworks = await Artwork.aggregate([
        { $match: { category: artwork.category._id } },
        { $sample: { size: 4 } }
    ]);

    const similarArtistArtworks = await Artwork.aggregate([
        { $match: { createdBy: artwork.createdBy._id } },
        { $sample: { size: 3 } }
    ]);

    // increase no. views
    artwork.noViews++;
    await artwork.save();

    let isOwner = false;
    if(req.user && req.user.email == artwork.createdBy.email) {
        isOwner = true; 
    }

    return res.render("artwork/show", {artwork, isOwner, similarCategoryArtworks, similarArtistArtworks});
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
    await Artwork.findByIdAndUpdate(req.params.id, {
        $addToSet: {likes: req.user._id},
    });

    req.flash.success("Liked artwork!");
    
    // redirect
    res.redirect(`/artwork/${req.artwork._id}/show`);
}

async function unlike(req,res) {
    // add logged in user to likes
    await Artwork.findByIdAndUpdate(req.params.id, {
        $pull: {likes: req.user._id},
    });

    req.flash.success("Unliked artwork!");
    
    // redirect
    res.redirect(`/artwork/${req.artwork._id}/show`);
}

async function watchLater(req,res) {
    
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

module.exports = {
    index,

    create,
    validateArtwork,
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