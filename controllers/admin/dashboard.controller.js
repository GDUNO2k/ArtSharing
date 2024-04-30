const Artwork = require("../../models/artwork.model");
const Order = require("../../models/order.model");
const User = require("../../models/user.model");

// index
async function index (req,res){
    const users = await User.find().countDocuments();
    const orders = await Order.find().countDocuments();
    const artworks = await Artwork.find().countDocuments();


    return res.render("admin/dashboard/index", {users, orders, artworks})
}

module.exports = {
    index,
}