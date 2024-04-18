const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  artworks: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Artwork'
    }
  ]
  
}, {timestamps: true});

module.exports = mongoose.model("Category", categorySchema);