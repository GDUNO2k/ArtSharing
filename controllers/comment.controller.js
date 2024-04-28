const Comment = require("../models/comment.model");
const Artwork = require("../models/artwork.model");

// req.comment
async function findOrFail(req,res,next){
    const comment = await Comment.findById(req.params.id).populate("createdBy").exec();

    if (!comment) {
        return res.redirect('/not-found')
    } 
    req.comment = comment;

    let isOwner = false;
    if(req.user && req.user.email == comment.createdBy.email) {
        isOwner = true; 
    }
    req.isOwner = isOwner;

    next();
}

async function requireOwner (req,res,next) {
    if(req.comment.createdBy.email !== req.user.email) {
        return res.redirect('/not-found')
    }

    next();
}

async function destroy(req,res) {
    const artworkId = req.comment.artwork;

    await Comment.findByIdAndDelete(req.params.id);

    // remove from artwork
    await Artwork.findByIdAndUpdate(artworkId, {
        $pull: {comments: req.comment._id}
    });

    req.flash.success("Deleted successfully!");

    res.redirect(`/artwork/${artworkId}/show#comments`);
}

module.exports = {
    findOrFail,
    requireOwner,
    destroy,
}