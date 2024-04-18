const User = require("../models/user.model");
const Artwork = require("../models/artwork.model");

async function index (req, res){
    //popular artworks
    const artworks = await Artwork.find().limit(8).populate("category").exec();

    // popular artists
    const artists = await User.find().limit(6).exec(); 

    res.render("home/index", { artists, artworks });
}
module.exports = {
    index,
}