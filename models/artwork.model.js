const mongoose = require("mongoose");

const artworkSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
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
  ]
}, {timestamps: true});

module.exports = mongoose.model("Artwork", artworkSchema);