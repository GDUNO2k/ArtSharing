const User = require("../models/user.model");
const Artwork = require("../models/artwork.model");

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
    next();
}
 
async function show(req, res) { 
    // check if owner
    let isOwner = false;
    if(req.user) {
        isOwner = (req.params.email === req.user.email);
    }

    const artist = await User.findOne({email: req.params.email});

    // artworks
    const query = Artwork.find({ createdBy: artist._id, hidden: false});

    // sorting
    if (req.query.sort) {
        switch(req.query.sort) {
            case 'most-liked': 

                break;
            case 'most-viewed':
                query.sort({noViews: -1});
                break;
            default: // recent
                query.sort({createdAt: -1});
        }
    }

    // pagination
    req.pagination.perPage = 8;
    const totalResults = await query.clone().countDocuments();
    req.pagination.numPages = Math.ceil(totalResults/req.pagination.perPage);
    query.skip((req.pagination.page-1) * req.pagination.perPage).limit(req.pagination.perPage);

    const artworks = await query.populate('category').exec();

    // invalid email -> artist not exist
    if(!artist) {
        return res.redirect("/not-found");
    }
    res.render("artist/show", {artist, artworks, isOwner}) ;
}

async function follow(req,res) {
    // add logged in user to likes 
    await User.findOneAndUpdate({email: req.params.email}, {
        $addToSet: {followers: req.user._id},
    });

    req.flash.success("Follow artist!"); 
    
    // redirect
    res.redirect(`/artist/${req.artist.email}/show`);
}

module.exports = {
    index,
    findOrFail,

    show,
    follow,
}