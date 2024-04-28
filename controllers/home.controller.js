const User = require("../models/user.model");
const Artwork = require("../models/artwork.model");

async function index (req, res){


    //from following
    let followings = [];
    let followingArtworks = [];
    if(req.user) {
        followings = await User.find({_id: {$in: req.user.following}});
        followingArtworks = await Artwork.find({createdBy: {$in: req.user.following}}).sort({createdAt: -1}).limit(8).populate("category").exec();
    }

    //popular artworks
    const artworks = await Artwork.find().sort({likes: -1, noViews: -1}).limit(16).populate("category").exec();

    // popular artists
    const artists = await User.find().sort({followers: -1}).limit(6).exec(); 

    res.render("home/index", { artists, artworks, followingArtworks, followings });
}
module.exports = {
    index,
}