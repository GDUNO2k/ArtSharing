const Category = require("../models/category.model")

async function index(req,res) {
    const categories = await Category.find();

    return res.render("category/index", {categories})
}

function show(req,res) {
    return res.render("category/show")
}

module.exports = {
    index,
    show,
}