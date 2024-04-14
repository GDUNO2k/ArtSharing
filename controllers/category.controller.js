function index(req,res) {
    return res.render("category/index")
}

function show(req,res) {
    return res.render("category/show")
}

module.exports = {
    index,
    show,
}