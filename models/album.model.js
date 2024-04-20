const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },
  artworks: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Artwork'
    }
  ]
}, {timestamps: true});

module.exports = mongoose.model("Album", albumSchema);