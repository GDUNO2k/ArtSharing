const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  createdBy: 
  {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'User'
  },
  artwork: 
  {
    type: mongoose.SchemaTypes.ObjectId,
    ref: 'Artwork'
  },

}, {timestamps: true});

module.exports = mongoose.model("Comment", commentSchema);
