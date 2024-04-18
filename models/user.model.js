const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  
  role: {
    type: String,
    enum: ['member','admin'],
    default: "member"
  },
  active: {
    type: Boolean,
    default: true,
  },
  artworks: [
    {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'Artwork'
    }
  ]

}, {timestamps: true});

module.exports = mongoose.model("User", userSchema);
