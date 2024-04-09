const User = require("../models/user.model");
const Artwork = require("../models/artwork.model");

async function index (req, res) {
    const artists = await User.find();
    res.render("artist/index", {artists}); 
}

async function show(req, res) {
    // check if owner
    let isOwner = false;
    if(req.user) {
        isOwner = (req.params.email === req.user.email);
    }

    const artist = await User.findOne({email: req.params.email});
    const artworks = await Artwork.find({ createdBy: artist._id});

    // invalid email -> artist not exist
    if(!artist) {
        return res.abort(404);
    }
    res.render("artist/show", {artist, artworks, isOwner});
}

module.exports = {
    index,
    show,
}