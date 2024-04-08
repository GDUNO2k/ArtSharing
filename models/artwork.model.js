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
    type: String,
    required: true,
  },
  tags: {
    type: String,
  },
  createBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  }
}, {timestamps: true});

module.exports = mongoose.model("Artwork", artworkSchema);