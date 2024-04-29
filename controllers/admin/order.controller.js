const { check, validationResult } = require("express-validator");
const Artwork = require("../../models/artwork.model");
const Category = require("../../models/category.model");
const Order = require("../../models/order.model");
const User = require("../../models/user.model");
const mongoose = require("mongoose");
const querystring = require('querystring');

// index
async function index (req,res){

    const users = await User.find();
    const query = Order.find();

    // filter by artist
    if (req.query.artist) {
        query.where({artist: req.query.artist})
    }
        // filter by buyer
    if (req.query.buyer) {
        query.where({buyer: req.query.buyer })
    }

    // pagination
    req.pagination.perPage = 8;
    const totalResults = await query.clone().countDocuments();
    req.pagination.numPages = Math.ceil(totalResults/req.pagination.perPage);

    query.skip((req.pagination.page-1) * req.pagination.perPage).limit(req.pagination.perPage);

    const orders = await query.populate('buyer').populate('artwork').populate('artist').sort({ createdAt: -1 }).exec();

    res.render('admin/order/index', {orders, users})
}

module.exports = {
    index,
}