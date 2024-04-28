const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema({
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
  description: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
    ref: 'Category'
  },
  tags: {
    type: String,
  },
  createdBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },
  noViews: {
    type: Number,
    default: 0,
  },
  noLikes:  {
    type: Number,
    default: 0,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
  likes: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User'
    }
  ],
  price: {
    type: Number,
    default: 0,
  },
  forSale: {
    type: Boolean,
    default: false,
  },
  buyers: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User'
    }
  ],
  comments: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Comment'
    }
  ],
}, {timestamps: true});

module.exports = mongoose.model("Artwork", artworkSchema);