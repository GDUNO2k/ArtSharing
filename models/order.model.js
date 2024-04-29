const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  artist: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },

  buyer: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },

  artwork: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Artwork'
  },

  title: {
    type: String,
    required: true,
  },
  path: { // resized image
    type: String,
    required: true,
  },
  pathOriginal: { // original size
    type: String,
    // required: true,
  },
  originalSize: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  
}, {timestamps: true});

module.exports = mongoose.model("Order", orderSchema);