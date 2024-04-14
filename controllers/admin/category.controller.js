const { check, validationResult } = require("express-validator");
const Category = require("../../models/category.model");


async function index(req,res) {
    const categories = await Category.find();
    
    return res.render("admin/category/index", {categories})
}

async function create(req,res) {
    const categories = await Category.find();
    const category = new Category();

    return res.render("admin/category/create", { categories, category })
}

const validateCategory = [
    check("file").custom((value, { req }) => {
        if (!req.category) { // not editing -> image required
            if (!req.file) {
                throw new Error("Thumbnail is required");
            }
        }

        // TODO: file types, size
        
        return true;
    }),
    check("name").trim().notEmpty().withMessage("Name is required"),
];

async function store(req,res) {
    const categories = await Category.find();

    // get user data
    const { name,description } = req.body;
    const category = new Category({
        name, description
    });

    // validate user data
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log(errors.mapped())
        return res.render("admin/category/create", {categories, category, errors: errors.mapped()})
    }

    category.thumbnail = "/uploads/"+ req.file.filename;
    await category.save()
    
    req.flash.success("Created successfully!");

    // redirect
    res.redirect(`/admin/category`);
}

async function findOrFail(req,res,next) {
    const category = await Category.findById(req.params.id);

    if(!category) {
        return res.redirect("/not-found");
    }
    req.category = category;

    next()
}

async function edit(req,res) {
    const categories = await Category.find();
    const category = req.category;
    
    return res.render("admin/category/edit", { categories, category })
}

async function update(req,res) {
    const categories = await Category.find();
    const category = req.category;

    // validate user data
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        console.log(errors.mapped())
        return res.render("admin/category/edit", {categories, category, errors: errors.mapped()})
    }

    // get user data
    const { name,description } = req.body;
    Object.assign(category, {
        name,description
    });

    if(req.file) {
        category.thumbnail = "/uploads/"+ req.file.filename;
    }
    await category.save()

    req.flash.success("Updated successfully!");
    
    // redirect
    res.redirect(`/admin/category`);
}


async function destroy (req,res) {
    await Category.findByIdAndDelete(req.params.id);

    req.flash.success("Deleted successfully!");

    res.redirect(`/admin/category`);
}


module.exports = {
    index,

    create,
    validateCategory,
    store,

    findOrFail,
    edit,
    update,

    destroy,
}