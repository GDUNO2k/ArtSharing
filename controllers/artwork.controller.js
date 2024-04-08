const { check, validationResult } = require("express-validator");
const Artwork = require("../models/artwork.model");

function create(req,res) {
    return res.render("artwork/create")
}

// validate artwork
const validateArtwork = [
    check("file").custom((value, { req }) => {
        if (!req.file) {
            throw new Error("Image is required");
        }
        
        return true;
    }),
    check("title").trim().notEmpty().withMessage("Title is required"),
    check("category").notEmpty().withMessage("Category is required"),

];

async function store(req,res) {
    // validate user data
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.render("artwork/create", {errors: errors.mapped()})
    }

    // get user data
    const { title,description,category,tags } = req.body;
    const artwork = new Artwork({
        title, description, category, tags, 
    });

    artwork.path = "/uploads/"+ req.file.filename;

    // owner

    artwork.createdBy = req.user._id;
    await artwork.save()
    
    // redirect
    res.redirect("/artwork/" + artwork._id);
}

async function show(req,res) { 
    const artwork = await Artwork.findById(req.params.id).exec();

    // increase no. views
    artwork.noViews++;
    await artwork.save();

    return res.render("artwork/show", { artwork });
}

module.exports = {
    create,
    validateArtwork,
    store,

    show,
}