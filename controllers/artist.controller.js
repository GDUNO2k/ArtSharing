const User = require("../models/user.model");
const Artwork = require("../models/artwork.model");
const Album = require("../models/album.model");

async function index (req, res) {

    const query = User.find({ role: {$ne : "admin"} });

    // filter by name
    if (req.query.keyword) { 
        query.where({ name: { $regex: req.query.keyword, $options: 'i' } })
    }
    

    // pagination
    req.pagination.perPage = 1;
    const totalResults = await query.clone().countDocuments();
    req.pagination.numPages = Math.ceil(totalResults/req.pagination.perPage);

    query.skip((req.pagination.page-1) * req.pagination.perPage).limit(req.pagination.perPage);

    const artists = await query.sort({ createdAt: -1 }).exec();

    res.render("artist/index", {artists}); 
}

async function findOrFail(req,res,next){
    const artist = await User.findOne({email: req.params.email}).exec();

    if (!artist) {
        return res.redirect('/not-found')
    } 

    req.artist = artist;

     // check if owner
    let isOwner = false;
    if(req.user) {
        isOwner = (req.params.email === req.user.email);
    }

    req.isOwner = isOwner;
    next();
}
 
async function show(req, res) { 
    const artist = req.artist;
    // artworks
    const query = Artwork.find({ createdBy: artist._id, hidden: false});

    // sorting
    req.query.sort = req.query.sort || "recent";
    switch(req.query.sort) {
        case 'most-liked': 
            query.sort({ likes: -1 });
            break;
        case 'most-viewed':
            query.sort({noViews: -1});
            break;
        default:
            query.sort({createdAt: -1});
    }

    // pagination
    req.pagination.perPage = 8;
    const totalResults = await query.clone().countDocuments();
    req.pagination.numPages = Math.ceil(totalResults/req.pagination.perPage);
    query.skip((req.pagination.page-1) * req.pagination.perPage).limit(req.pagination.perPage);

    const artworks = await query.populate('category').exec();

    res.render("artist/show", {artist, artworks}) ;
}

async function albums(req, res) { 
    const artist = req.artist;

    const albums = await Album.find({ createdBy: artist._id}).populate('artworks').exec();

    res.render("artist/albums", {artist, albums}) ;
}

async function album(req, res) { 
    const artist = req.artist;
    // album
    const album = await Album.findById(req.params.album).populate("artworks").exec();

    res.render("artist/album", {artist, album}) ;
}

async function follow(req,res) {
    // add logged in user to likes 
    await User.findOneAndUpdate({email: req.params.email}, {
        $addToSet: {followers: req.user._id},
    });

    await User.findOneAndUpdate({email: req.user.email}, {
        $addToSet: {following: req.artist._id},
    });

    req.flash.success("Followed artist!"); 
    
    // redirect
    res.redirect(`/artist/${req.artist.email}/show`);
}

async function unfollow(req,res) {
    // add logged in user to likes 
    await User.findOneAndUpdate({email: req.params.email}, {
        $pull: {followers: req.user._id},
    });

    await User.findOneAndUpdate({email: req.user.email}, {
        $pull: {following: req.artist._id},
    });

    req.flash.success("Unfollowed artist!"); 
    
    // redirect
    res.redirect(`/artist/${req.artist.email}/show`);
}

async function following(req, res) {
    const artist = req.artist
    const following = await User.find({_id: {$in: req.artist.following}});

    res.render(`artist/following`, {following, artist})
}

async function followers(req, res) {
    const artist = req.artist
    const followers = await User.find({_id: {$in: req.artist.followers}});

    res.render(`artist/followers`, {followers, artist})
}

module.exports = {
    index,
    findOrFail,

    show,
    albums,
    album,
    follow,
    unfollow,
    following,
    followers,
}