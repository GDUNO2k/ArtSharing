
async function index (req, res){
    const type = req.query.type;
    const keyword = req.query.keyword;

    return res.redirect(`/${type}?keyword=${keyword}`)
}
module.exports = {
    index,
}